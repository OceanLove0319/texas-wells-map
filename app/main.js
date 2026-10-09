'use strict';
/**
 * Texas Wells Map - Electron main process.
 *
 * Offline by design:
 *   - UI and data are served from a private "app://" scheme backed by local files.
 *   - Every request that is not app://, devtools://, data: or blob: is cancelled (see blockNetwork).
 *   - No auto-updater, no telemetry, no crash reporter upload.
 */
const { app, BrowserWindow, protocol, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const zlib = require('node:zlib');

const SCHEME = 'app';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.bin': 'application/octet-stream', '.png': 'image/png', '.svg': 'image/svg+xml',
};
const UI_DIR = path.join(__dirname, 'renderer');
const DATA_DIR = app.isPackaged
  ? path.join(process.resourcesPath, 'data')
  : path.join(__dirname, 'assets', 'data');

// Optional startup arguments (used for deep links and automated verification):
//   --select-api=<API>    search for and select a well after load
//   --pick=<n>            when that API matches several wells, open the n-th (1-based)
//   --log-renderer        mirror renderer console output to stdout
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
    title: 'Texas Wells Map',
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
  const pick = argOf('pick');
  if (pick) q.set('pick', pick);
  win.loadURL(`${SCHEME}://local/index.html${q.toString() ? `?${q}` : ''}`);
}

app.whenReady().then(() => {
  blockNetwork(session.defaultSession);
  registerAppProtocol();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => app.quit());
