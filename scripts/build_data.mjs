#!/usr/bin/env node
/**
 * build_data.mjs - convert the raw state snapshots into compact, offline app assets.
 *
 * States are described in scripts/states.config.mjs (one entry per state; field lists are never
 * hardcoded). See docs/ADDING_A_STATE.md.
 *
 * Data-driven rules:
 *   - The base file is one map point per row; all of its columns are kept.
 *   - Every other CSV in the state's folder that has an API column (API / api / api_number) is a
 *     per-well layer. It joins on OBJECTID when the data shows it is a subset of the base layer
 *     (every row's OBJECTID exists in the base with the same API); otherwise on the canonical
 *     10-digit API (app/src/api.js). Partial / county-only APIs never join.
 *   - Legend types are merged case-insensitively (OK "Gas"/"GAS" -> one entry; the raw value is still
 *     shown in the details panel) and each maps to a shared category (CATEGORIES) for its color.
 *   - Location of each well (loc.bin):
 *       0 exact      the regulator's coordinates
 *       1 repaired   out-of-range coordinates with an unambiguous lost decimal point (lib/coords.mjs)
 *       2 approx     no usable coordinates, placed from meridian/township/range/section (lib/plss.mjs)
 *       255 none     not drawn (still searchable); not counted in the legend
 *
 * Outputs (app/assets/data/):
 *   meta.json            - states, types (+colors, category), statuses, layers/fields, shard ranges, snapshot dates, location counts
 *   points.bin           - Float32 [lon, lat] * N (NaN when the well is not drawn)
 *   types.bin            - Uint8 global type index * N (each type belongs to one state)
 *   status.bin           - Uint8 global status index * N (255 = state has no status grouping)
 *   apis.bin             - Uint32 search key * N: the 8 digits after the state code (0 = no full API)
 *   loc.bin              - Uint8 location kind * N (see above)
 *   counties.json        - county outlines for all states, properties normalized to {state, code, name}
 *   shards/<ST>-<ccc>.json.br - per-county detail (brotli JSON, columnar): well fields in point order,
 *                          joined layer records, and location notes (approximate / repaired)
 *
 * Usage: node --max-old-space-size=8192 scripts/build_data.mjs [--out <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { STATES, CATEGORIES, CATEGORY_RULES, ROOT, snapshotFromPullLog } from './states.config.mjs';
import { canonicalApi, countyCodeOf, keyOf } from '../app/src/api.mjs';
import { stateOutlines } from './lib/geo.mjs';
import { loadSections, locate } from './lib/plss.mjs';
import { repair } from './lib/coords.mjs';

const require = createRequire(path.join(ROOT, 'app', 'package.json'));
const { parse } = require('csv-parse');

const args = process.argv.slice(2);
const argVal = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? path.resolve(args[i + 1]) : dflt;
};
const OUT = argVal('--out', path.join(ROOT, 'app', 'assets', 'data'));
const LOC = { EXACT: 0, REPAIRED: 1, APPROX: 2, NONE: 255 };

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

/** "Plugged and Abandoned--wells which ..." -> "Plugged and Abandoned" */
function codeLabel(code, dict) {
  const raw = dict ? (dict[code] ?? dict[code.toUpperCase()] ?? Object.entries(dict).find(([k]) => k.toUpperCase() === code.toUpperCase())?.[1]) : null;
  const short = raw ? raw.split('--')[0].split(' | ')[0].trim() : null;
  if (!code) return `${short || 'Unknown'} (blank)`;
  return short ? `${short} (${code})` : `${code} (code not in data dictionary)`;
}

// Status colors (statuses are not categorized): distinct, readable colors, most common first.
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

/** Category id for a type value: state override, else the first matching shared rule, else "other". */
function categoryOf(S, code, label) {
  const o = S.categoryOverrides && S.categoryOverrides[code.toUpperCase()];
  if (o) return o;
  const text = `${code} ${label}`;
  for (const [id, re] of CATEGORY_RULES) if (re.test(text)) return id;
  return 'other';
}
/** k-th type within a category: the base color, then alternating lighter / darker shades. */
const SHADES = [0, 0.35, -0.3, 0.6, -0.5, 0.18, -0.15, 0.48, -0.4, 0.7];
function shade(base, k) {
  const t = SHADES[k % SHADES.length];
  return base.map((c) => Math.round(t >= 0 ? c + (255 - c) * t : c * (1 + t)));
}

/** Case/spelling-insensitive key for a legend category ("Gas" and "GAS" -> one entry). */
const mergeKey = (v) => String(v ?? '').trim().toUpperCase();

/** Collects distinct values of a column (merged by mergeKey), keeping every raw spelling and its count. */
function categorizer() {
  const idx = new Map(), list = [];
  return {
    list,
    add(raw) {
      const v = String(raw ?? '').trim();
      const k = mergeKey(v);
      let i = idx.get(k);
      if (i === undefined) { i = list.length; idx.set(k, i); list.push({ key: k, variants: new Map() }); }
      const vm = list[i].variants;
      vm.set(v, (vm.get(v) || 0) + 1);
      return i;
    },
  };
}
/** Most common raw spelling first. */
const variantsOf = (c) => [...c.variants.entries()].sort((x, y) => y[1] - x[1]).map(([v]) => v);

function displayName(field, c, codes) {
  const vs = variantsOf(c);
  const dict = codes[field];
  if (!dict) return vs[0] || '(blank)';
  const base = codeLabel(vs[0], dict); // "Description (CODE)"
  return vs.length > 1 ? base.replace(/\(([^()]*)\)$/, `(${vs.join(' / ')})`) : base;
}

// ---------- per-state load ----------
async function loadState(S) {
  const basePath = path.join(S.raw, S.base);
  if (!fs.existsSync(basePath)) throw new Error(`${S.id}: base file not found: ${basePath}`);
  const header = readHeader(basePath);
  const col = (n) => header.indexOf(n);
  const iApi = S.apiField ? col(S.apiField) : findApiCol(header);
  const iType = col(S.typeField);
  const iStatus = S.statusField ? col(S.statusField) : -1;
  const lonC = S.lon.map(col).filter((i) => i >= 0);
  const latC = S.lat.map(col).filter((i) => i >= 0);
  if (iApi < 0 || iType < 0 || !lonC.length || !latC.length) throw new Error(`${S.id}: base file missing API/type/coordinate columns`);
  const codes = S.codes && fs.existsSync(S.codes) ? JSON.parse(fs.readFileSync(S.codes, 'utf8')).fields : {};
  const outline = stateOutlines(ROOT)[S.id];
  if (!outline) log(`WARNING: ${S.id} has no outline in data/raw/us_states.geojson - coordinate repair disabled`);
  const plss = S.plss ? loadSections(ROOT, S.id) : null;
  if (plss) log(`${S.id} PLSS grid ${plss.file}: sections=${plss.rows} keys=${plss.boxes.size} skipped=${plss.skipped} ambiguous=${plss.ambiguous}`);

  const typeCat = categorizer(), statusCat = categorizer();
  const wells = [];
  // First non-null, non-zero candidate. Returns { v, bad } where bad = outside the valid WGS84 range.
  const pick = (rec, cands, limit) => {
    for (const i of cands) {
      const v = parseFloat(rec[i]);
      if (Number.isFinite(v) && v !== 0) return { v, bad: Math.abs(v) > limit };
    }
    return { v: NaN, bad: false };
  };
  const stats = { exact: 0, repaired: 0, approx: 0, none: 0, invalidCoords: 0, nullCoords: 0, repairFailed: {}, approxFailed: {}, approxInferred: 0, approxQuarter: 0 };
  const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
  const { rows } = await readCsv(basePath, (rec) => {
    const rawApi = rec[iApi];
    const canon = canonicalApi(S, rawApi);
    const c = countyCodeOf(S, rawApi);
    const lo = pick(rec, lonC, 180), la = pick(rec, latC, 90);
    const g = (f) => { const i = col(f); return i >= 0 ? rec[i] : undefined; };
    let x = lo.v, y = la.v, loc = LOC.EXACT, note = null;
    const bad = lo.bad || la.bad;
    if (bad || !Number.isFinite(x) || !Number.isFinite(y)) {
      x = NaN; y = NaN; loc = LOC.NONE;
      const pl = S.plss ? locate(S.plss, plss, g) : { reason: 'state has no PLSS' };
      if (bad) {
        stats.invalidCoords++;
        const fix = S.repairCoords && outline ? repair(outline, lo.v, la.v, pl.sectionBox) : { reason: 'repair disabled' };
        if (fix.note) { x = fix.x; y = fix.y; loc = LOC.REPAIRED; note = fix.note; } else bump(stats.repairFailed, fix.reason);
      } else stats.nullCoords++;
      if (loc === LOC.NONE) {
        if (pl.point) {
          [x, y] = pl.point; loc = LOC.APPROX;
          note = `Location: APPROXIMATE (${pl.text}). The regulator file has no ${bad ? 'valid ' : ''}coordinates for this well.`;
          if (pl.inferred) stats.approxInferred++;
          if (pl.quarters) stats.approxQuarter++;
        } else bump(stats.approxFailed, pl.reason);
      }
    }
    stats[loc === LOC.EXACT ? 'exact' : loc === LOC.REPAIRED ? 'repaired' : loc === LOC.APPROX ? 'approx' : 'none']++;
    wells.push({
      k: `${S.id}-${c || 'none'}`, a: canon, x, y, loc, note, r: rec,
      t: typeCat.add(rec[iType]),
      s: iStatus >= 0 ? statusCat.add(rec[iStatus]) : -1,
    });
  });
  wells.sort((p, q) => (p.k < q.k ? -1 : p.k > q.k ? 1 : p.a < q.a ? -1 : p.a > q.a ? 1 : 0));
  log(`${S.id} ${S.base}: rows=${rows} exact=${stats.exact} repaired=${stats.repaired} approx=${stats.approx} unmapped=${stats.none}`);

  const drawn = (w) => w.loc !== LOC.NONE;
  const tally = (n, getter) => {
    const mapped = new Array(n).fill(0), total = new Array(n).fill(0), approx = new Array(n).fill(0);
    for (const w of wells) { const i = getter(w); total[i]++; if (drawn(w)) mapped[i]++; if (w.loc === LOC.APPROX) approx[i]++; }
    return { mapped, total, approx };
  };

  // Types: category, then mapped count. Colors: category base color, shaded per type within the category.
  const tt = tally(typeCat.list.length, (w) => w.t);
  const catOrder = Object.fromEntries(CATEGORIES.map((c, i) => [c.id, i]));
  const typeInfo = typeCat.list.map((c, i) => {
    const name = displayName(S.typeField, c, codes);
    return { i, name, code: variantsOf(c)[0], variants: variantsOf(c), category: categoryOf(S, c.key, name) };
  });
  const tOrder = typeInfo.map((t) => t.i).sort((a, b) => catOrder[typeInfo[a].category] - catOrder[typeInfo[b].category]
    || tt.mapped[b] - tt.mapped[a] || tt.total[b] - tt.total[a]);
  const typeRemap = new Array(tOrder.length);
  tOrder.forEach((old, neu) => { typeRemap[old] = neu; });
  const perCat = {};
  const typeList = tOrder.map((old) => {
    const t = typeInfo[old];
    const k = (perCat[t.category] = (perCat[t.category] ?? -1) + 1);
    return { name: t.name, code: t.code, variants: t.variants, category: t.category,
      color: shade(CATEGORIES[catOrder[t.category]].color, k), count: tt.mapped[old], approx: tt.approx[old], total: tt.total[old] };
  });

  let statusList = [], statusRemap = null;
  if (iStatus >= 0) {
    const st = tally(statusCat.list.length, (w) => w.s);
    const sOrder = statusCat.list.map((_, i) => i).sort((a, b) => st.mapped[b] - st.mapped[a] || st.total[b] - st.total[a]);
    statusRemap = new Array(sOrder.length);
    sOrder.forEach((old, neu) => { statusRemap[old] = neu; });
    statusList = sOrder.map((old, k) => {
      const c = statusCat.list[old];
      return { name: displayName(S.statusField, c, codes), code: variantsOf(c)[0], variants: variantsOf(c), color: colorFor(k),
        count: st.mapped[old], approx: st.approx[old], total: st.total[old] };
    });
  }

  // Layers
  const iOid = col('OBJECTID');
  const oidToLocal = new Map(), apiToLocal = new Map();
  wells.forEach((w, i) => {
    if (iOid >= 0) oidToLocal.set(String(w.r[iOid]).trim(), i);
    if (w.a) { const l = apiToLocal.get(w.a); if (l) l.push(i); else apiToLocal.set(w.a, [i]); }
  });
  const names = S.layerNames ? S.layerNames() : {};
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
        if (wi === undefined || wells[wi].a !== canonicalApi(S, rec[ai])) { oidOk = false; break; }
      }
    }
    const pairs = [];
    let matchedRows = 0, unmatchedRows = 0, partialApiRows = 0;
    const matchedWells = new Set();
    for (const rec of recs) {
      let targets;
      if (oidOk) targets = [oidToLocal.get(String(rec[oi]).trim())];
      else {
        const api = canonicalApi(S, rec[ai]);
        if (!api) partialApiRows++;
        targets = api ? apiToLocal.get(api) || [] : [];
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

  return {
    S, header, wells, rows, layers, pairsByLayer, snap: snapshotFromPullLog(S), stats, plss,
    typeList, typeRemap, statusList, statusRemap,
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
  const locs = new Uint8Array(N);
  const bbox = [Infinity, Infinity, -Infinity, -Infinity];
  const metaTypes = [], metaStatuses = [], metaStates = [], shards = [];

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'shards'), { recursive: true });
  const columns = (rows, width) => Array.from({ length: width }, (_, c) => rows.map((r) => (r[c] ?? '')));

  let offset = 0;
  for (const L of loaded) {
    const { S, wells, stats } = L;
    const typeBase = metaTypes.length;
    const statusBase = metaStatuses.length;
    L.typeList.forEach((t) => metaTypes.push({ ...t, state: S.id }));
    L.statusList.forEach((t) => metaStatuses.push({ ...t, state: S.id }));
    if (metaTypes.length > 255 || metaStatuses.length > 254) throw new Error('too many categories for Uint8 encoding');

    wells.forEach((w, li) => {
      const i = offset + li;
      points[i * 2] = w.x; points[i * 2 + 1] = w.y;
      locs[i] = w.loc;
      if (w.loc !== LOC.NONE) { bbox[0] = Math.min(bbox[0], w.x); bbox[1] = Math.min(bbox[1], w.y); bbox[2] = Math.max(bbox[2], w.x); bbox[3] = Math.max(bbox[3], w.y); }
      types[i] = typeBase + L.typeRemap[w.t];
      if (w.s >= 0) status[i] = statusBase + L.statusRemap[w.s];
      apis[i] = keyOf(w.a);
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
      const notes = {};
      for (let i = s; i < e; i++) if (wells[i].note) notes[i - s] = wells[i].note;
      const body = { key, state: S.id, start: offset + s, count: e - s, wells: columns(wells.slice(s, e).map((w) => w.r), L.header.length), layers: blocks, notes };
      const file = `shards/${key}.json.br`;
      const json = Buffer.from(JSON.stringify(body));
      fs.writeFileSync(path.join(OUT, file), zlib.brotliCompressSync(json, {
        params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11, [zlib.constants.BROTLI_PARAM_LGWIN]: 24, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: json.length },
      }));
      shards.push({ key, state: S.id, start: offset + s, count: e - s, file });
      perShard[ri] = null;
    });

    const mapped = stats.exact + stats.repaired + stats.approx;
    metaStates.push({
      id: S.id, name: S.name, agency: S.agency, short: S.short, apiPrefix: S.apiPrefix, apiForm: S.apiForm, datum: S.datum,
      snapshot: L.snap.date, snapshotSource: L.snap.source,
      start: offset, wellCount: wells.length, sourceRowCount: L.rows,
      mapped, exact: stats.exact, repaired: stats.repaired, approximate: stats.approx, unplottable: stats.none,
      nullCoords: stats.nullCoords, invalidCoords: stats.invalidCoords,
      repairFailed: stats.repairFailed, approxFailed: stats.approxFailed, approxMeridianInferred: stats.approxInferred, approxWithQuarterCalls: stats.approxQuarter,
      plss: L.plss ? { file: L.plss.file, sections: L.plss.rows, keys: L.plss.boxes.size, ambiguous: L.plss.ambiguous } : null,
      typeRange: [typeBase, metaTypes.length], statusRange: [statusBase, metaStatuses.length],
      typeField: S.typeField, statusField: S.statusField, decode: L.decode,
      base: { key: `${S.id}_base`, file: S.base, name: S.baseName || 'Well Locations', fields: L.header.map((n) => ({ name: n, label: labelFor(n) })) },
      layers: L.layers,
    });
    log(`${S.id}: wells=${wells.length} mapped=${mapped} (exact=${stats.exact} repaired=${stats.repaired} approx=${stats.approx}) unmapped=${stats.none} `
      + `null=${stats.nullCoords} invalid=${stats.invalidCoords} repairFailed=${JSON.stringify(stats.repairFailed)} approxFailed=${JSON.stringify(stats.approxFailed)} `
      + `types=${L.typeList.length} statuses=${L.statusList.length} layers=${L.layers.length} shards=${ranges.length} snapshot=${L.snap.date}`);
    offset += wells.length;
    L.wells = null;
  }

  const writeBin = (name, arr) => fs.writeFileSync(path.join(OUT, name), Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength));
  writeBin('points.bin', points);
  writeBin('types.bin', types);
  writeBin('status.bin', status);
  writeBin('apis.bin', apis);
  writeBin('loc.bin', locs);

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

  const names = metaStates.map((s) => s.name);
  const meta = {
    app: `${names.length > 1 ? `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}` : names[0]} Wells Map`, builtAt: new Date().toISOString(),
    wellCount: N, bbox, categories: CATEGORIES.map(({ id, name, color }) => ({ id, name, color })),
    states: metaStates, types: metaTypes, statuses: metaStatuses, shards, countyCount: features.length,
  };
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 1));

  let size = 0;
  for (const f of fs.readdirSync(OUT)) { const st = fs.statSync(path.join(OUT, f)); if (st.isFile()) size += st.size; }
  for (const sh of shards) size += fs.statSync(path.join(OUT, sh.file)).size;
  log(`wrote ${OUT}: wells=${N} types=${metaTypes.length} statuses=${metaStatuses.length} shards=${shards.length} counties=${features.length} size=${(size / 1e6).toFixed(1)}MB in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((e) => { console.error('[build_data] FAILED:', e); process.exit(1); });
