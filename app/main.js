'use strict';
/**
 * US Wells Map - Electron main process.
 *
 * Offline by design:
 *   - UI and data are served from a private "app://" scheme backed by local files.
 *   - Every request that is not app://, devtools://, data: or blob: is cancelled (see blockNetwork).
 *   - No auto-updater, no telemetry, no crash reporter upload.
 *   - The one exception is user-initiated: clicking a document link (e.g. OCC well records) asks the
 *     main process to open that http(s) URL in the user's default browser via shell.openExternal.
 *     The app itself never fetches it.
 */
const { app, BrowserWindow, protocol, session, ipcMain, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const zlib = require('node:zlib');

const SCHEME = 'app';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.br': 'application/json', '.bin': 'application/octet-stream', '.png': 'image/png', '.svg': 'image/svg+xml',
};
const UI_DIR = path.join(__dirname, 'renderer');
const DATA_DIR = app.isPackaged
  ? path.join(process.resourcesPath, 'data')
  : path.join(__dirname, 'assets', 'data');

// Optional startup arguments (used for deep links and automated verification):
//   --select-api=<API>    search for and select a well after load
//   --view=<lon>,<lat>,<zoom>  start at this map view
//   --pick=<n>            when that API matches several wells, open the n-th (1-based)
//   --log-renderer        mirror renderer console output to stdout
//   --screenshot=<file.png> [--screenshot-delay=<ms>] [--quit-after-screenshot]
//                         save a PNG of the window after the delay (local file only; for verification)
//   --click-after=<ms>    after the delay, send a real mouse click (sendInputEvent) at the pixel of the
//                         currently selected well, exercising the map's picking path (for verification)
const argOf = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const LOG_RENDERER = process.argv.includes('--log-renderer');

protocol.registerSchemesAsPrivileged([
  { scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: false } },
]);

/** Resolve a URL path under a base directory, refusing traversal outside it. */
function safeJoin(base, rel) {
  const p = path.normalize(path.join(base, decodeURIComponent(rel)));
  return p.startsWith(base + path.sep) || p === base ? p : null;
}

function registerAppProtocol() {
  protocol.handle(SCHEME, async (request) => {
    const url = new URL(request.url);
    let file = null;
    if (url.pathname.startsWith('/data/')) file = safeJoin(DATA_DIR, url.pathname.slice('/data/'.length));
    else file = safeJoin(UI_DIR, url.pathname === '/' ? 'index.html' : url.pathname.slice(1));
    if (!file || !fs.existsSync(file)) return new Response('Not found', { status: 404 });

    // Detail shards are stored brotli-compressed; inflate here so the renderer just gets JSON.
    if (file.endsWith('.json.br')) {
      const body = zlib.brotliDecompressSync(await fs.promises.readFile(file));
      return new Response(body, { headers: { 'content-type': 'application/json' } });
    }
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    return new Response(await fs.promises.readFile(file), { headers: { 'content-type': type } });
  });
}

/** Cancel every request that would leave the machine. */
function blockNetwork(ses) {
  ses.webRequest.onBeforeRequest((details, cb) => {
    const ok = /^(app|devtools|data|blob):/i.test(details.url);
    if (!ok) console.warn(`[network] blocked ${details.url}`);
    cb({ cancel: !ok });
  });
  ses.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'US Wells Map',
    backgroundColor: '#f4f5f7',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });
  win.setMenuBarVisibility(false);

  // Never open new windows or navigate away from the app.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(`${SCHEME}://`)) e.preventDefault(); });

  if (LOG_RENDERER) {
    win.webContents.on('console-message', (e) => console.log(`[renderer] ${e.message}`));
  }

  const q = new URLSearchParams();
  const sel = argOf('select-api');
  if (sel) q.set('select', sel);
  const view = argOf('view');
  if (view) q.set('view', view);
  const pick = argOf('pick');
  if (pick) q.set('pick', pick);
  win.loadURL(`${SCHEME}://local/index.html${q.toString() ? `?${q}` : ''}`);

  const clickAfter = Number(argOf('click-after'));
  if (clickAfter) {
    win.webContents.once('did-finish-load', () => setTimeout(async () => {
      const xy = await win.webContents.executeJavaScript('window.__twm && window.__twm.selectedScreenXY()');
      if (!xy) { console.log('[click] nothing selected'); return; }
      const x = Math.round(xy.x), y = Math.round(xy.y);
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      win.webContents.sendInputEvent({ type: 'mouseMove', x, y });
      await wait(150);
      win.webContents.sendInputEvent({ type: 'mouseDown', x, y, button: 'left', clickCount: 1 });
      await wait(80);
      win.webContents.sendInputEvent({ type: 'mouseUp', x, y, button: 'left', clickCount: 1 });
      console.log(`[click] sent left click at ${x},${y}`);
    }, clickAfter));
  }

  // --perf: animate pan/zoom for about 5 s and print frame times and process memory (verification only).
  if (process.argv.includes('--perf')) {
    win.webContents.once('did-finish-load', () => setTimeout(async () => {
      console.log(`[perf] gpu features ${JSON.stringify(app.getGPUFeatureStatus())}`);
      try { const gi = await app.getGPUInfo('basic'); console.log(`[perf] gpu info ${JSON.stringify(gi).slice(0, 600)}`); } catch (e) { console.log(`[perf] gpu info unavailable: ${e.message}`); }
      console.log(`[perf] webgl ${await win.webContents.executeJavaScript("(() => { const c = document.createElement('canvas'); const gl = c.getContext('webgl2'); const d = gl.getExtension('WEBGL_debug_renderer_info'); return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) + ' / ' + gl.getParameter(d.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.RENDERER); })()")}`);
      const r = await win.webContents.executeJavaScript('window.__twm && window.__twm.perf()');
      const r2 = await win.webContents.executeJavaScript('window.__twm.redrawRate(-97, 38, 3.8)');
      const r3 = await win.webContents.executeJavaScript('window.__twm.redrawRate(-99, 31.5, 6.2)');
      const r4 = await win.webContents.executeJavaScript('window.__twm.redrawRate(-98.5, 32, 10)');
      console.log(`[perf] redraw national ${JSON.stringify(r2)} regional ${JSON.stringify(r3)} local ${JSON.stringify(r4)}`);
      if (process.argv.includes('--perf-experiments')) {
        for (const [name, fn] of [['wells only', "(id) => id === 'wells'"], ['wells+counties', "(id) => id === 'wells' || id === 'counties'"], ['all but approx', "(id) => id !== 'wells-approx'"], ['all but overlay', "(id) => !id.startsWith('overlay')"], ['basemap only', "(id) => !id.startsWith('wells') && !id.startsWith('overlay')"]]) {
          await win.webContents.executeJavaScript(`window.__twm.setLayerFilter(${fn})`);
          const rr = await win.webContents.executeJavaScript('window.__twm.redrawRate(-97, 38, 3.8)');
          console.log(`[perf] ${name}: ${JSON.stringify(rr)}`);
        }
        await win.webContents.executeJavaScript('window.__twm.setLayerFilter(null)');
      }
      const mem = app.getAppMetrics().map((m) => `${m.type}${m.name ? `(${m.name})` : ''}=${Math.round((m.memory.workingSetSize || 0) / 1024)}MB`).join(' ');
      console.log(`[perf] ${JSON.stringify(r)} memory: ${mem}`);
    }, 12000));
  }

  // --pick-test: probe picking over a grid of window pixels and report what the map returns (verification only).
  if (process.argv.includes('--pick-test')) {
    win.webContents.once('did-finish-load', () => setTimeout(async () => {
      const out = [];
      for (let x = 500; x <= 1300; x += 100) for (let y = 200; y <= 800; y += 150) out.push(await win.webContents.executeJavaScript(`window.__twm.pickAt(${x}, ${y})`));
      const hits = out.filter((o) => o.index >= 0);
      console.log(`[picktest] probes=${out.length} hits=${hits.length} maxOffsetPx=${Math.max(0, ...hits.map((h) => Math.max(Math.abs(h.dx), Math.abs(h.dy))))} sample=${JSON.stringify(hits.slice(0, 4))}`);
    }, 12000));
  }

  const shot = argOf('screenshot');
  if (shot) {
    const delay = Number(argOf('screenshot-delay')) || 8000;
    win.webContents.once('did-finish-load', () => setTimeout(async () => {
      const img = await win.webContents.capturePage();
      fs.writeFileSync(path.resolve(shot), img.toPNG());
      console.log(`[screenshot] ${path.resolve(shot)}`);
      if (process.argv.includes('--quit-after-screenshot')) app.quit();
    }, delay));
  }
}

/** Open a user-clicked http(s) link in the default browser. Nothing else is accepted. */
ipcMain.handle('open-external', async (_e, url) => {
  let u;
  try { u = new URL(String(url)); } catch { return false; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
  await shell.openExternal(u.toString());
  return true;
});

app.whenReady().then(() => {
  blockNetwork(session.defaultSession);
  registerAppProtocol();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => app.quit());
