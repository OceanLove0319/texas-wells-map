#!/usr/bin/env node
/**
 * build_data.mjs - convert data/raw/* (RRC snapshot) into compact, offline app assets.
 *
 * Fully data-driven:
 *   - wells.csv is the base layer (one map point per row). All of its columns are kept.
 *   - Every other data/raw/*.csv that has an API column is treated as a per-well layer and
 *     joined to wells by the 8-digit API. All of its columns are kept.
 *   - Layer display names come from data/layers_summary.md ("-> data/raw/<file>.csv" rows);
 *     falls back to a humanized file name.
 *   - Snapshot date comes from data/snapshot_report.md (first YYYY-MM-DD found), else pull_log.jsonl.
 *
 * Outputs (app/assets/data/):
 *   meta.json            - counts, types+colors, layer/field definitions, shard ranges, snapshot date
 *   points.bin           - Float32 [lon, lat] * N (NaN when the well has no coordinates)
 *   types.bin            - Uint8 type index * N
 *   apis.bin             - Uint32 numeric 8-digit API * N (0 if the API is not 8 digits)
 *   counties.json        - county outlines (copied from counties.geojson)
 *   shards/<key>.json.gz - per-county detail: well rows (in point order) + joined layer records
 *
 * Usage: node --max-old-space-size=8192 scripts/build_data.mjs [--raw <dir>] [--out <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'app', 'package.json'));
const { parse } = require('csv-parse');

const args = process.argv.slice(2);
const argVal = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? path.resolve(args[i + 1]) : dflt;
};
const RAW = argVal('--raw', path.join(ROOT, 'data', 'raw'));
const OUT = argVal('--out', path.join(ROOT, 'app', 'assets', 'data'));
const DATA_DIR = path.join(ROOT, 'data');
const BASE_FILE = 'wells.csv';

// ---------- helpers ----------
const log = (...m) => console.log('[build_data]', ...m);

async function readCsv(file, onRow) {
  const parser = fs.createReadStream(file).pipe(parse({ relax_column_count: true, bom: true }));
  let header = null;
  let n = 0;
  for await (const rec of parser) {
    if (!header) { header = rec; continue; }
    onRow(rec, header);
    n++;
  }
  return { header: header || [], rows: n };
}

function readHeader(file) {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(65536);
  const len = fs.readSync(fd, buf, 0, buf.length, 0);
  fs.closeSync(fd);
  const line = buf.toString('utf8', 0, len).split(/\r?\n/)[0].replace(/^﻿/, '');
  return line.split(',').map((s) => s.replace(/^"|"$/g, '').trim());
}

const normApi = (v) => (v == null ? '' : String(v).trim());
const isApi8 = (a) => /^\d{8}$/.test(a);
const shardKeyOf = (api) => (/^\d{3}/.test(api) ? api.slice(0, 3) : 'none');

/** Readable label from a raw field name. Token dictionary only expands abbreviations; it does not list fields. */
const TOKENS = {
  GIS: '', API: 'API', API5: 'API (5-digit)', UNIQID: 'Unique ID', OBJECTID: 'Object ID', SYMNUM: 'Symbol Number',
  RELIAB: 'Location Reliability', LAT: 'Latitude', LONG: 'Longitude', LON: 'Longitude', NUM: 'Number', NO: 'No.',
  DESC: 'Description', DESCR: 'Description', ID: 'ID', QUADNUM: 'Quad Number', LEN: 'Length',
};
const DATUMS = { 27: 'NAD27', 83: 'NAD83', 4326: 'WGS84' };
function labelFor(field) {
  const parts = [];
  let datum = null;
  for (const raw of field.split(/[_.\s]+/).filter(Boolean)) {
    const m = raw.match(/^([A-Za-z]+)(\d+)$/);
    let tok = raw.toUpperCase();
    if (/^\d+$/.test(raw) && DATUMS[raw]) { datum = DATUMS[raw]; continue; }
    if (m && DATUMS[m[2]] && !(tok in TOKENS)) { datum = DATUMS[m[2]]; tok = m[1].toUpperCase(); }
    if (tok in TOKENS) { if (TOKENS[tok]) parts.push(TOKENS[tok]); continue; }
    parts.push(tok.charAt(0) + tok.slice(1).toLowerCase());
  }
  let s = parts.join(' ') || field;
  if (datum) s += ` (${datum})`;
  return s;
}

function layerNamesFromSummary() {
  const names = {};
  const p = path.join(DATA_DIR, 'layers_summary.md');
  if (!fs.existsSync(p)) return names;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|.*data\/raw\/([\w.-]+\.csv)/);
    if (m) names[m[3]] = m[2];
  }
  return names;
}

function snapshotDate() {
  const rep = path.join(DATA_DIR, 'snapshot_report.md');
  if (fs.existsSync(rep)) {
    const txt = fs.readFileSync(rep, 'utf8');
    const pulls = txt.match(/Pull finish times[^\n]*?(\d{4}-\d{2}-\d{2})/);
    const any = txt.match(/(\d{4}-\d{2}-\d{2})/);
    if (pulls || any) return { date: (pulls || any)[1], source: 'data/snapshot_report.md' };
  }
  const pl = path.join(RAW, 'pull_log.jsonl');
  if (fs.existsSync(pl)) {
    const dates = fs.readFileSync(pl, 'utf8').split('\n').filter(Boolean)
      .map((l) => { try { return JSON.parse(l).finished_utc; } catch { return null; } }).filter(Boolean).sort();
    if (dates.length) return { date: dates[dates.length - 1].slice(0, 10), source: 'pull_log.jsonl (snapshot report not found)' };
  }
  return { date: 'unknown', source: 'none' };
}

// Distinct, readable colors for well types (most common types get the first entries).
const PALETTE = [
  [31, 119, 180], [214, 39, 40], [44, 160, 44], [255, 127, 14], [148, 103, 189], [140, 86, 75],
  [227, 119, 194], [23, 190, 207], [188, 189, 34], [127, 127, 127], [174, 199, 232], [255, 152, 150],
  [152, 223, 138], [255, 187, 120], [197, 176, 213], [196, 156, 148], [247, 182, 210], [158, 218, 229],
  [219, 219, 141], [57, 59, 121], [99, 121, 57], [140, 109, 49], [132, 60, 57], [123, 65, 115],
];
function colorFor(i) {
  if (i < PALETTE.length) return PALETTE[i];
  const h = (i * 137.508) % 360, s = 0.55, l = 0.5;
  const f = (n) => { const k = (n + h / 30) % 12; return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return [f(0), f(8), f(4)].map((x) => Math.round(x * 255));
}

// ---------- main ----------
async function main() {
  const t0 = Date.now();
  const basePath = path.join(RAW, BASE_FILE);
  if (!fs.existsSync(basePath)) throw new Error(`Base layer not found: ${basePath}`);
  const layerNames = layerNamesFromSummary();

  // 1) Base layer: wells.csv
  const header = readHeader(basePath);
  const col = (n) => header.indexOf(n);
  const iApi = col('API');
  const iType = col('GIS_SYMBOL_DESCRIPTION') >= 0 ? col('GIS_SYMBOL_DESCRIPTION') : header.findIndex((h) => /SYMBOL.*DESC|TYPE/i.test(h));
  const lonCandidates = ['lon_4326', 'GIS_LONG83', 'GIS_LONG27'].map(col).filter((i) => i >= 0);
  const latCandidates = ['lat_4326', 'GIS_LAT83', 'GIS_LAT27'].map(col).filter((i) => i >= 0);
  if (iApi < 0) throw new Error('wells.csv has no API column');
  log(`base header: ${header.join(', ')}`);

  const wells = []; // { k: shardKey, a: api, t: typeIdx, x, y, r: row }
  const typeIndex = new Map();
  const typeNames = [];
  const { rows: baseRows } = await readCsv(basePath, (rec) => {
    const api = normApi(rec[iApi]);
    const tname = (iType >= 0 ? String(rec[iType] ?? '').trim() : '') || '(blank)';
    let t = typeIndex.get(tname);
    if (t === undefined) { t = typeNames.length; typeIndex.set(tname, t); typeNames.push(tname); }
    const pick = (cands) => {
      for (const i of cands) { const v = parseFloat(rec[i]); if (Number.isFinite(v) && v !== 0) return v; }
      return NaN;
    };
    wells.push({ k: shardKeyOf(api), a: api, t, x: pick(lonCandidates), y: pick(latCandidates), r: rec });
  });
  log(`wells.csv rows: ${baseRows}`);
  if (typeNames.length > 255) throw new Error('More than 255 well types; widen types.bin');

  // Sort so each shard is a contiguous range of point indices.
  wells.sort((p, q) => (p.k < q.k ? -1 : p.k > q.k ? 1 : p.a < q.a ? -1 : p.a > q.a ? 1 : 0));

  // Re-order types by frequency for stable colors.
  const typeCounts = new Array(typeNames.length).fill(0);
  for (const w of wells) typeCounts[w.t]++;
  const order = typeNames.map((_, i) => i).sort((a, b) => typeCounts[b] - typeCounts[a]);
  const remap = new Array(order.length);
  order.forEach((old, neu) => { remap[old] = neu; });

  const N = wells.length;
  const points = new Float32Array(N * 2);
  const types = new Uint8Array(N);
  const apis = new Uint32Array(N);
  let unplottable = 0;
  const bbox = [Infinity, Infinity, -Infinity, -Infinity];
  wells.forEach((w, i) => {
    points[i * 2] = w.x; points[i * 2 + 1] = w.y;
    if (!Number.isFinite(w.x) || !Number.isFinite(w.y)) unplottable++;
    else { bbox[0] = Math.min(bbox[0], w.x); bbox[1] = Math.min(bbox[1], w.y); bbox[2] = Math.max(bbox[2], w.x); bbox[3] = Math.max(bbox[3], w.y); }
    types[i] = remap[w.t];
    apis[i] = isApi8(w.a) ? Number(w.a) : 0;
  });
  const typeList = order.map((old, neu) => ({ name: typeNames[old], count: typeCounts[old], color: colorFor(neu) }));

  // 2) Other per-well layers (any CSV with an API column).
  const apiSet = new Set(wells.filter((w) => isApi8(w.a)).map((w) => w.a));
  const layerFiles = fs.readdirSync(RAW).filter((f) => f.toLowerCase().endsWith('.csv') && f !== BASE_FILE).sort();
  const layers = [];
  const layerRecords = {}; // layerKey -> Map(api -> rows[])
  for (const f of layerFiles) {
    const h = readHeader(path.join(RAW, f));
    const ai = h.indexOf('API');
    if (ai < 0) { log(`skip ${f}: no API column`); continue; }
    const key = f.replace(/\.csv$/i, '');
    const byApi = new Map();
    let matchedRows = 0, unmatchedRows = 0;
    const { rows } = await readCsv(path.join(RAW, f), (rec) => {
      const api = normApi(rec[ai]);
      if (apiSet.has(api)) {
        matchedRows++;
        let arr = byApi.get(api);
        if (!arr) { arr = []; byApi.set(api, arr); }
        arr.push(rec);
      } else unmatchedRows++;
    });
    layerRecords[key] = byApi;
    layers.push({
      key, file: f, name: layerNames[f] || labelFor(key),
      fields: h.map((n) => ({ name: n, label: labelFor(n) })),
      rows, matchedRows, unmatchedRows, matchedApis: byApi.size,
    });
    log(`layer ${f}: rows=${rows} matched=${matchedRows} unmatched=${unmatchedRows} (distinct APIs matched ${byApi.size})`);
  }

  // 3) Write outputs.
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'shards'), { recursive: true });
  const writeBin = (name, arr) => fs.writeFileSync(path.join(OUT, name), Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength));
  writeBin('points.bin', points);
  writeBin('types.bin', types);
  writeBin('apis.bin', apis);

  const shards = [];
  let s = 0;
  while (s < N) {
    const key = wells[s].k;
    let e = s;
    while (e < N && wells[e].k === key) e++;
    const shardLayers = {};
    const seen = new Set();
    for (let i = s; i < e; i++) {
      const a = wells[i].a;
      if (!isApi8(a) || seen.has(a)) continue;
      seen.add(a);
      for (const L of layers) {
        const recs = layerRecords[L.key].get(a);
        if (recs) (shardLayers[L.key] ||= {})[a] = recs;
      }
    }
    const body = { key, start: s, count: e - s, wells: wells.slice(s, e).map((w) => w.r), layers: shardLayers };
    const file = `shards/${key}.json.gz`;
    fs.writeFileSync(path.join(OUT, file), zlib.gzipSync(JSON.stringify(body), { level: 9 }));
    shards.push({ key, start: s, count: e - s, file });
    s = e;
  }

  // County outlines
  let countyCount = 0;
  const cg = path.join(RAW, 'counties.geojson');
  if (fs.existsSync(cg)) {
    const gj = JSON.parse(fs.readFileSync(cg, 'utf8'));
    countyCount = gj.features.length;
    fs.writeFileSync(path.join(OUT, 'counties.json'), JSON.stringify(gj));
  } else {
    log('WARNING: counties.geojson not found; map will have no county outlines');
    fs.writeFileSync(path.join(OUT, 'counties.json'), JSON.stringify({ type: 'FeatureCollection', features: [] }));
  }

  const snap = snapshotDate();
  const meta = {
    app: 'Texas Wells Map',
    snapshot: snap.date, snapshotSource: snap.source,
    builtAt: new Date().toISOString(),
    wellCount: N, sourceRowCount: baseRows, unplottable, bbox,
    base: { key: 'wells', file: BASE_FILE, name: layerNames[BASE_FILE] || 'Well Locations', fields: header.map((n) => ({ name: n, label: labelFor(n) })) },
    types: typeList, layers, shards, countyCount,
  };
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 1));

  const size = fs.readdirSync(OUT).reduce((a, f) => a + (fs.statSync(path.join(OUT, f)).isFile() ? fs.statSync(path.join(OUT, f)).size : 0), 0)
    + shards.reduce((a, sh) => a + fs.statSync(path.join(OUT, sh.file)).size, 0);
  log(`wrote ${OUT}: wells=${N} types=${typeList.length} layers=${layers.length} shards=${shards.length} counties=${countyCount} unplottable=${unplottable} snapshot=${snap.date} size=${(size / 1e6).toFixed(1)}MB in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((e) => { console.error('[build_data] FAILED:', e); process.exit(1); });
