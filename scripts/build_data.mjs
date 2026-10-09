#!/usr/bin/env node
/**
 * build_data.mjs - convert the raw state snapshots into compact, offline app assets.
 *
 * States (see STATES below; each entry only says where a state's files are and which columns
 * play which role - field lists are never hardcoded):
 *   TX  Railroad Commission of Texas      data/raw/wells.csv     + every other data/raw/*.csv
 *   OK  Oklahoma Corporation Commission   data/raw/ok/rbdms-wells.csv + every other data/raw/ok/*.csv
 *
 * Data-driven rules:
 *   - The base file is one map point per row; all of its columns are kept.
 *   - Every other CSV in the state's folder that has an API column (API / api / api_number) is a
 *     per-well layer. It joins on OBJECTID when the data shows it is a subset of the base layer
 *     (every row's OBJECTID exists in the base with the same API); otherwise on the full API
 *     (TX: 8 digits, OK: 10 digits starting 35). Partial / county-only APIs never join.
 *   - Wells without usable coordinates (null, 0, or outside the valid lat/lon range) stay searchable but are not drawn, and are not
 *     counted in the legend's per-type counts (they are reported separately).
 *
 * Outputs (app/assets/data/):
 *   meta.json            - states, types (+colors), OK statuses, layers/fields, shard ranges, snapshot dates
 *   points.bin           - Float32 [lon, lat] * N (NaN when the well has no coordinates)
 *   types.bin            - Uint8 global type index * N (each type belongs to one state)
 *   status.bin           - Uint8 global status index * N (255 = state has no status grouping)
 *   apis.bin             - Uint32 state-aware search key * N (0 = no full API):
 *                            TX: the 8-digit API (always < 10^8)   OK: the 10-digit API (35xxxxxxxx)
 *                          so the two states can never collide. Displayed APIs always come from the raw string.
 *   counties.json        - county outlines for all states, properties normalized to {state, code, name}
 *   shards/<ST>-<ccc>.json.br - per-county detail (brotli JSON, columnar): well fields in point order +
 *                          joined layer records with the local well index they belong to
 *
 * Usage: node --max-old-space-size=8192 scripts/build_data.mjs [--out <dir>]
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
const OUT = argVal('--out', path.join(ROOT, 'app', 'assets', 'data'));
const DATA_DIR = path.join(ROOT, 'data');

// ---------- state descriptors ----------
const STATES = [
  {
    id: 'TX', name: 'Texas', agency: 'Railroad Commission of Texas (RRC)',
    raw: path.join(DATA_DIR, 'raw'), base: 'wells.csv',
    typeField: 'GIS_SYMBOL_DESCRIPTION', statusField: null,
    lon: ['lon_4326', 'GIS_LONG83', 'GIS_LONG27'], lat: ['lat_4326', 'GIS_LAT83', 'GIS_LAT27'],
    fullApi: /^\d{8}$/, searchKey: (a) => Number(a), countyOfApi: (a) => (/^\d{3}/.test(a) ? a.slice(0, 3) : null),
    counties: { file: 'counties.geojson', code: 'FIPS', name: 'COUNTY_NAME' },
    layerNames: () => layerNamesFromSummary(path.join(DATA_DIR, 'layers_summary.md')),
    snapshot: () => snapshotFromReport(path.join(DATA_DIR, 'snapshot_report.md'), path.join(DATA_DIR, 'raw', 'pull_log.jsonl')),
  },
  {
    id: 'OK', name: 'Oklahoma', agency: 'Oklahoma Corporation Commission (OCC)',
    raw: path.join(DATA_DIR, 'raw', 'ok'), base: 'rbdms-wells.csv',
    typeField: 'WELLTYPE', statusField: 'WELLSTATUS', codes: path.join(DATA_DIR, 'ok_codes.json'),
    lon: ['SH_LON'], lat: ['SH_LAT'],
    fullApi: /^35\d{8}$/, searchKey: (a) => Number(a), countyOfApi: (a) => (/^35\d{3}/.test(a) ? a.slice(2, 5) : null),
    counties: { file: 'ok_counties.geojson', code: 'COUNTY', name: 'NAME' },
    layerNames: () => ({ 'orphan_funds_wells.csv': 'Orphan Fund', 'comp_wells.csv': 'Completion Report' }),
    baseName: 'Well',
    snapshot: () => snapshotFromPullLog(path.join(DATA_DIR, 'raw', 'ok', 'pull_log.jsonl'), 'rbdms-wells.csv', 'data/raw/ok/pull_log.jsonl (rbdms-wells.csv download)'),
  },
];

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

const normApi = (v) => (v == null ? '' : String(v).trim().replace(/\.0+$/, ''));
const findApiCol = (h) => h.findIndex((n) => /^api(_number|_no|num)?$/i.test(n));

/** Readable label from a raw field name. Token dictionary only expands abbreviations; it does not list fields. */
const TOKENS = {
  GIS: '', API: 'API', API5: 'API (5-digit)', UNIQID: 'Unique ID', OBJECTID: 'Object ID', SYMNUM: 'Symbol Number',
  RELIAB: 'Location Reliability', LAT: 'Latitude', LONG: 'Longitude', LON: 'Longitude', NUM: 'Number', NO: 'No.',
  DESC: 'Description', DESCR: 'Description', ID: 'ID', QUADNUM: 'Quad Number', LEN: 'Length', WELLSTATUS: 'Well Status',
  WELLTYPE: 'Well Type', SH: 'Surface', BH: 'Bottom Hole', QTR1: 'Quarter 1', QTR2: 'Quarter 2', QTR3: 'Quarter 3',
  QTR4: 'Quarter 4', Q1: 'Quarter 1', Q2: 'Quarter 2', Q3: 'Quarter 3', Q4: 'Quarter 4', PM: 'Meridian', EW: 'E/W',
  NS: 'N/S', FOOTAGEEW: 'Footage E/W', FOOTAGENS: 'Footage N/S', DOCS: 'Documents', OTC: 'OTC', BBL: 'bbl',
  MCF: 'mcf', DF: 'DF', GF: 'GF', UIC: 'UIC', BHL: 'BHL', ITD: 'ITD', UC: 'UC', PSI: 'psi', D: '(decimal)',
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

function layerNamesFromSummary(p) {
  const names = {};
  if (!fs.existsSync(p)) return names;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|.*data\/raw\/([\w.-]+\.csv)/);
    if (m) names[m[3]] = m[2];
  }
  return names;
}

function snapshotFromReport(rep, pullLog) {
  if (fs.existsSync(rep)) {
    const txt = fs.readFileSync(rep, 'utf8');
    const m = txt.match(/Pull finish times[^\n]*?(\d{4}-\d{2}-\d{2})/) || txt.match(/(\d{4}-\d{2}-\d{2})/);
    if (m) return { date: m[1], source: path.relative(ROOT, rep) };
  }
  return snapshotFromPullLog(pullLog, null, path.relative(ROOT, pullLog));
}

function snapshotFromPullLog(p, name, source) {
  if (!fs.existsSync(p)) return { date: 'unknown', source: 'none' };
  const rows = fs.readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter((r) => r && r.finished_utc && (!name || r.name === name));
  const dates = rows.map((r) => r.finished_utc).sort();
  return dates.length ? { date: dates[dates.length - 1].slice(0, 10), source } : { date: 'unknown', source: 'none' };
}

/** "Plugged and Abandoned--wells which ..." -> "Plugged and Abandoned" */
function codeLabel(code, dict) {
  const raw = dict ? (dict[code] ?? dict[code.toUpperCase()] ?? Object.entries(dict).find(([k]) => k.toUpperCase() === code.toUpperCase())?.[1]) : null;
  const short = raw ? raw.split('--')[0].split(' | ')[0].trim() : null;
  if (!code) return `${short || 'Unknown'} (blank)`;
  return short ? `${short} (${code})` : `${code} (code not in data dictionary)`;
}

// Distinct, readable colors (most common categories get the first entries).
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

/** Category list sorted by mapped count (desc); returns { list, remap(oldIdx)->newIdx }. */
function rankCategories(names, mappedCounts, totalCounts) {
  const order = names.map((_, i) => i).sort((a, b) => mappedCounts[b] - mappedCounts[a] || totalCounts[b] - totalCounts[a]);
  const remap = new Array(order.length);
  order.forEach((old, neu) => { remap[old] = neu; });
  return { order, remap };
}

// ---------- per-state load ----------
async function loadState(S) {
  const basePath = path.join(S.raw, S.base);
  if (!fs.existsSync(basePath)) throw new Error(`${S.id}: base file not found: ${basePath}`);
  const header = readHeader(basePath);
  const col = (n) => header.indexOf(n);
  const iApi = findApiCol(header);
  const iType = col(S.typeField);
  const iStatus = S.statusField ? col(S.statusField) : -1;
  const lonC = S.lon.map(col).filter((i) => i >= 0);
  const latC = S.lat.map(col).filter((i) => i >= 0);
  if (iApi < 0 || iType < 0 || !lonC.length || !latC.length) throw new Error(`${S.id}: base file missing API/type/coordinate columns`);
  const codes = S.codes && fs.existsSync(S.codes) ? JSON.parse(fs.readFileSync(S.codes, 'utf8')).fields : {};

  const typeIdx = new Map(), typeNames = [];
  const statusIdx = new Map(), statusNames = [];
  const cat = (map, names, v) => { let i = map.get(v); if (i === undefined) { i = names.length; map.set(v, i); names.push(v); } return i; };
  const wells = [];
  // First non-null, non-zero candidate; values outside the valid WGS84 range (e.g. a lost decimal
  // point) are marked invalid so they are neither drawn nor allowed to stretch the map extent.
  const pick = (rec, cands, limit) => {
    for (const i of cands) {
      const v = parseFloat(rec[i]);
      if (Number.isFinite(v) && v !== 0) return Math.abs(v) <= limit ? v : Infinity;
    }
    return NaN;
  };
  const { rows } = await readCsv(basePath, (rec) => {
    const api = normApi(rec[iApi]);
    const c = S.countyOfApi(api);
    let x = pick(rec, lonC, 180), y = pick(rec, latC, 90);
    const bad = x === Infinity || y === Infinity;
    if (bad) { x = NaN; y = NaN; }
    wells.push({ bad,
      k: `${S.id}-${c || 'none'}`, a: api, x, y, r: rec,
      t: cat(typeIdx, typeNames, String(rec[iType] ?? '').trim()),
      s: iStatus >= 0 ? cat(statusIdx, statusNames, String(rec[iStatus] ?? '').trim()) : -1,
    });
  });
  wells.sort((p, q) => (p.k < q.k ? -1 : p.k > q.k ? 1 : p.a < q.a ? -1 : p.a > q.a ? 1 : 0));
  log(`${S.id} ${S.base}: rows=${rows}`);

  const label = (field, v) => (codes[field] ? codeLabel(v, codes[field]) : (v || '(blank)'));
  const tally = (n, getter) => {
    const mapped = new Array(n).fill(0), total = new Array(n).fill(0);
    for (const w of wells) { const i = getter(w); total[i]++; if (Number.isFinite(w.x) && Number.isFinite(w.y)) mapped[i]++; }
    return { mapped, total };
  };
  const tt = tally(typeNames.length, (w) => w.t);
  const types = rankCategories(typeNames, tt.mapped, tt.total);
  const st = iStatus >= 0 ? tally(statusNames.length, (w) => w.s) : null;
  const statuses = st ? rankCategories(statusNames, st.mapped, st.total) : null;

  // Layers
  const iOid = col('OBJECTID');
  const oidToLocal = new Map(), apiToLocal = new Map();
  wells.forEach((w, i) => {
    if (iOid >= 0) oidToLocal.set(String(w.r[iOid]).trim(), i);
    if (S.fullApi.test(w.a)) { const l = apiToLocal.get(w.a); if (l) l.push(i); else apiToLocal.set(w.a, [i]); }
  });
  const names = S.layerNames();
  const layers = [];
  const pairsByLayer = {};
  const files = fs.readdirSync(S.raw).filter((f) => f.toLowerCase().endsWith('.csv') && f !== S.base).sort();
  for (const f of files) {
    const file = path.join(S.raw, f);
    const h = readHeader(file);
    const ai = findApiCol(h);
    if (ai < 0) { log(`${S.id} skip ${f}: no API column`); continue; }
    const recs = [];
    await readCsv(file, (rec) => recs.push(rec));
    const oi = h.indexOf('OBJECTID');
    let oidOk = oi >= 0 && iOid >= 0 && recs.length > 0;
    if (oidOk) {
      for (const rec of recs) {
        const wi = oidToLocal.get(String(rec[oi]).trim());
        if (wi === undefined || wells[wi].a !== normApi(rec[ai])) { oidOk = false; break; }
      }
    }
    const pairs = [];
    let matchedRows = 0, unmatchedRows = 0, partialApiRows = 0;
    const matchedWells = new Set();
    for (const rec of recs) {
      let targets;
      if (oidOk) targets = [oidToLocal.get(String(rec[oi]).trim())];
      else {
        const api = normApi(rec[ai]);
        if (!S.fullApi.test(api)) partialApiRows++;
        targets = S.fullApi.test(api) ? apiToLocal.get(api) || [] : [];
      }
      if (targets.length) matchedRows++; else unmatchedRows++;
      for (const t of targets) { pairs.push([t, rec]); matchedWells.add(t); }
    }
    const key = `${S.id}_${f.replace(/\.csv$/i, '')}`;
    pairsByLayer[key] = pairs;
    const joinOn = oidOk ? 'OBJECTID' : `${h[ai]} (full API)`;
    layers.push({
      key, file: f, name: names[f] || labelFor(f.replace(/\.csv$/i, '')), joinOn,
      fields: h.map((n) => ({ name: n, label: labelFor(n) })),
      rows: recs.length, matchedRows, unmatchedRows, partialApiRows, wellsWithRecords: matchedWells.size,
    });
    log(`${S.id} layer ${f}: rows=${recs.length} join=${joinOn} matched=${matchedRows} unmatched=${unmatchedRows} partialApi=${partialApiRows} wells=${matchedWells.size}`);
  }

  const snap = S.snapshot();
  return {
    S, header, wells, rows, layers, pairsByLayer, snap,
    typeList: types.order.map((old) => ({ name: label(S.typeField, typeNames[old]), code: typeNames[old], count: tt.mapped[old], total: tt.total[old] })),
    typeRemap: types.remap,
    statusList: statuses ? statuses.order.map((old) => ({ name: label(S.statusField, statusNames[old]), code: statusNames[old], count: st.mapped[old], total: st.total[old] })) : [],
    statusRemap: statuses ? statuses.remap : null,
    decode: Object.fromEntries([S.typeField, S.statusField].filter((f) => f && codes[f]).map((f) => [f, codes[f]])),
  };
}

// ---------- main ----------
async function main() {
  const t0 = Date.now();
  const loaded = [];
  for (const S of STATES) loaded.push(await loadState(S));

  const N = loaded.reduce((a, L) => a + L.wells.length, 0);
  const points = new Float32Array(N * 2);
  const types = new Uint8Array(N);
  const status = new Uint8Array(N).fill(255);
  const apis = new Uint32Array(N);
  const bbox = [Infinity, Infinity, -Infinity, -Infinity];
  const metaTypes = [], metaStatuses = [], metaStates = [], shards = [];

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'shards'), { recursive: true });
  const columns = (rows, width) => Array.from({ length: width }, (_, c) => rows.map((r) => (r[c] ?? '')));

  let offset = 0;
  for (const L of loaded) {
    const { S, wells } = L;
    const typeBase = metaTypes.length;
    const statusBase = metaStatuses.length;
    L.typeList.forEach((t, i) => metaTypes.push({ ...t, state: S.id, color: colorFor(i) }));
    L.statusList.forEach((t, i) => metaStatuses.push({ ...t, state: S.id, color: colorFor(i) }));
    if (metaTypes.length > 255 || metaStatuses.length > 254) throw new Error('too many categories for Uint8 encoding');

    let unplottable = 0, invalidLocation = 0;
    wells.forEach((w, li) => {
      const i = offset + li;
      points[i * 2] = w.x; points[i * 2 + 1] = w.y;
      if (w.bad) invalidLocation++;
      if (!Number.isFinite(w.x) || !Number.isFinite(w.y)) unplottable++;
      else { bbox[0] = Math.min(bbox[0], w.x); bbox[1] = Math.min(bbox[1], w.y); bbox[2] = Math.max(bbox[2], w.x); bbox[3] = Math.max(bbox[3], w.y); }
      types[i] = typeBase + L.typeRemap[w.t];
      if (w.s >= 0) status[i] = statusBase + L.statusRemap[w.s];
      apis[i] = S.fullApi.test(w.a) ? S.searchKey(w.a) : 0;
    });

    // Shards: contiguous ranges of the same county key; layer records bucketed by shard.
    const ranges = [];
    for (let s = 0; s < wells.length;) {
      let e = s;
      while (e < wells.length && wells[e].k === wells[s].k) e++;
      ranges.push([wells[s].k, s, e]);
      s = e;
    }
    const shardOf = new Uint16Array(wells.length);
    ranges.forEach(([, s, e], ri) => { for (let i = s; i < e; i++) shardOf[i] = ri; });
    const perShard = ranges.map(() => ({}));
    for (const layer of L.layers) {
      for (const [wi, rec] of L.pairsByLayer[layer.key]) (perShard[shardOf[wi]][layer.key] ||= []).push([wi, rec]);
      delete L.pairsByLayer[layer.key];
    }
    ranges.forEach(([key, s, e], ri) => {
      const blocks = {};
      for (const layer of L.layers) {
        const list = perShard[ri][layer.key];
        if (!list) continue;
        list.sort((a, b) => a[0] - b[0]);
        blocks[layer.key] = { well: list.map(([wi]) => wi - s), cols: columns(list.map(([, r]) => r), layer.fields.length) };
      }
      const body = { key, state: S.id, start: offset + s, count: e - s, wells: columns(wells.slice(s, e).map((w) => w.r), L.header.length), layers: blocks };
      const file = `shards/${key}.json.br`;
      const json = Buffer.from(JSON.stringify(body));
      fs.writeFileSync(path.join(OUT, file), zlib.brotliCompressSync(json, {
        params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11, [zlib.constants.BROTLI_PARAM_LGWIN]: 24, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: json.length },
      }));
      shards.push({ key, state: S.id, start: offset + s, count: e - s, file });
      perShard[ri] = null;
    });

    metaStates.push({
      id: S.id, name: S.name, agency: S.agency, snapshot: L.snap.date, snapshotSource: L.snap.source,
      start: offset, wellCount: wells.length, sourceRowCount: L.rows, mapped: wells.length - unplottable, unplottable,
      noLocation: unplottable - invalidLocation, invalidLocation,
      typeRange: [typeBase, metaTypes.length], statusRange: [statusBase, metaStatuses.length],
      typeField: S.typeField, statusField: S.statusField, decode: L.decode,
      base: { key: `${S.id}_base`, file: S.base, name: S.baseName || S.layerNames()[S.base] || 'Well Locations', fields: L.header.map((n) => ({ name: n, label: labelFor(n) })) },
      layers: L.layers,
    });
    log(`${S.id}: wells=${wells.length} mapped=${wells.length - unplottable} unplottable=${unplottable} types=${L.typeList.length} statuses=${L.statusList.length} layers=${L.layers.length} shards=${ranges.length} snapshot=${L.snap.date}`);
    offset += wells.length;
    L.wells = null;
  }

  const writeBin = (name, arr) => fs.writeFileSync(path.join(OUT, name), Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength));
  writeBin('points.bin', points);
  writeBin('types.bin', types);
  writeBin('status.bin', status);
  writeBin('apis.bin', apis);

  // County outlines, normalized.
  const features = [];
  for (const S of STATES) {
    const p = path.join(S.raw, S.counties.file);
    if (!fs.existsSync(p)) { log(`WARNING: ${S.id} counties not found (${p})`); continue; }
    for (const f of JSON.parse(fs.readFileSync(p, 'utf8')).features) {
      const pr = f.properties || {};
      features.push({ type: 'Feature', geometry: f.geometry, properties: { state: S.id, code: String(pr[S.counties.code] ?? '').padStart(3, '0'), name: String(pr[S.counties.name] ?? '').replace(/\s+County$/i, '') } });
    }
  }
  fs.writeFileSync(path.join(OUT, 'counties.json'), JSON.stringify({ type: 'FeatureCollection', features }));

  const meta = {
    app: 'Texas & Oklahoma Wells Map', builtAt: new Date().toISOString(),
    wellCount: N, bbox, states: metaStates, types: metaTypes, statuses: metaStatuses, shards,
    countyCount: features.length,
  };
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 1));

  let size = 0;
  for (const f of fs.readdirSync(OUT)) { const st = fs.statSync(path.join(OUT, f)); if (st.isFile()) size += st.size; }
  for (const sh of shards) size += fs.statSync(path.join(OUT, sh.file)).size;
  log(`wrote ${OUT}: wells=${N} types=${metaTypes.length} statuses=${metaStatuses.length} shards=${shards.length} counties=${features.length} size=${(size / 1e6).toFixed(1)}MB in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((e) => { console.error('[build_data] FAILED:', e); process.exit(1); });
