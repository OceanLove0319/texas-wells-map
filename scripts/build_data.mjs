#!/usr/bin/env node
/**
 * build_data.mjs - convert the raw source snapshots into compact, offline app assets.
 *
 * Sources are described by the fragments in scripts/states/ (one entry each, loaded by
 * scripts/states.config.mjs; field lists are never hardcoded). See docs/ADDING_A_STATE.md.
 *
 * Data-driven rules:
 *   - The base file is one map point per row; all of its columns are kept.
 *   - Every other CSV in the source's folder that has an API column (API / api / api_number) is a
 *     per-well layer. It joins on OBJECTID when the data shows it is a subset of the base layer
 *     (every row's OBJECTID exists in the base with the same API); otherwise on the canonical
 *     10-digit API (app/src/api.mjs). Partial / county-only APIs never join.
 *   - Legend types are merged case-insensitively (OK "Gas"/"GAS" -> one entry; the raw value is still
 *     shown in the details panel) and each maps to a shared category (CATEGORIES) for its color.
 *   - Location of each well (loc.bin):
 *       0 exact      the regulator's coordinates
 *       1 repaired   out-of-range coordinates with an unambiguous lost decimal point (lib/coords.mjs)
 *       2 approx     no usable coordinates, placed from meridian/township/range/section (lib/plss.mjs)
 *       255 none     not drawn (still searchable); not counted in the legend
 *   - Sources are processed one at a time (raw rows are dropped after the source's shards are written),
 *     so memory stays proportional to the largest source, not to the national total.
 *
 * Outputs (app/assets/data/):
 *   meta.json            - sources (states, pseudo-states, overlays), types (+colors, category), statuses,
 *                          layers/fields, shard ranges, snapshot dates, location counts, regions, reference layers
 *   points.bin           - Float32 [lon, lat] * N (NaN when the well is not drawn)
 *   types.bin            - Uint16 global type index * N (each type belongs to one source)
 *   status.bin           - Uint16 global status index * N (65535 = source has no status grouping)
 *   apis.bin             - Uint32 search key * N: the 8 digits after the state code (0 = no full API)
 *   loc.bin              - Uint8 location kind * N (see above)
 *   counties.json        - national county basemap (Census), properties normalized to {state, code, name}
 *   shards/<key>.json.br - per-county (per-area offshore, per-state for overlays) detail (brotli JSON, columnar):
 *                          well fields in point order, joined layer records, and location notes
 *   ids/<ST>.json.br     - regulator well-id index for sources without API numbers (stateIdField)
 *   reference/<file>.json- faint reference outlines (BOEM planning areas, protraction diagrams)
 *
 * Usage: node --max-old-space-size=12288 scripts/build_data.mjs [--out <dir>] [--only TX,OK]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { STATES, CATEGORIES, CATEGORY_RULES, ROOT, snapshotFromPullLog } from './states.config.mjs';
import { canonicalApi, canonicalApiWithPrefix, countyCodeOf, keyOf, normId, prefixesOf } from '../app/src/api.mjs';
import { stateOutlines } from './lib/geo.mjs';
import { loadSections, locate } from './lib/plss.mjs';
import { repair } from './lib/coords.mjs';

const require = createRequire(path.join(ROOT, 'app', 'package.json'));
const { parse } = require('csv-parse');

const args = process.argv.slice(2);
const argVal = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : dflt;
};
const OUT = path.resolve(argVal('--out', path.join(ROOT, 'app', 'assets', 'data')));
const ONLY = (argVal('--only', '') || '').split(',').filter(Boolean);
const LOC = { EXACT: 0, REPAIRED: 1, APPROX: 2, NONE: 255 };
const NO_STATUS = 65535;
const BASEMAP = path.join(ROOT, 'data', 'raw', 'basemap', 'us_counties.geojson');

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
  // Simple CSV header split that honors quotes.
  const out = [];
  let cur = '', q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === ',' && !q) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
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
  SURF: 'Surface', BOTM: 'Bottom Hole', TVD: 'TVD', MD: 'MD', CD: 'Code', TWP: 'Township', RNG: 'Range', SEC: 'Section',
  FED: 'Federal', DEPT: 'Department', URL: 'URL', UTM: 'UTM', FIPS: 'FIPS', WH: 'Wellhead', TD: 'TD', DT: 'Date',
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
    // camelCase ("WellStatus") -> "Well Status"; otherwise Capitalized
    if (/[a-z]/.test(raw) && /[A-Z]/.test(raw.slice(1))) parts.push(raw.replace(/([a-z])([A-Z])/g, '$1 $2'));
    else parts.push(tok.charAt(0) + tok.slice(1).toLowerCase());
  }
  let s = parts.join(' ') || field;
  if (datum) s += ` (${datum})`;
  return s;
}

/** "Plugged and Abandoned--wells which ..." -> "Plugged and Abandoned" */
function codeLabel(code, dict) {
  const raw = dict ? (dict[code] ?? dict[code.toUpperCase()] ?? Object.entries(dict).find(([k]) => k.toUpperCase() === code.toUpperCase())?.[1]) : null;
  const short = raw ? String(raw).split('--')[0].split(' | ')[0].trim() : null;
  if (!code) return `${short || 'Unknown'} (blank)`;
  return short ? `${short} (${code})` : `${code} (code not in data dictionary)`;
}

// Status colors when statuses are not categorized: distinct, readable colors, most common first.
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

/** Category id for a value: override table, else the first matching shared rule, else "other". */
function categoryOf(overrides, code, label) {
  const o = overrides && overrides[code.toUpperCase()];
  if (o) return o;
  const text = `${code} ${label}`;
  for (const [id, re] of CATEGORY_RULES) if (re.test(text)) return id;
  return 'other';
}
/** k-th type within a category: the base color, then alternating lighter / darker shades. */
const SHADES = [0, 0.35, -0.3, 0.6, -0.5, 0.18, -0.15, 0.48, -0.4, 0.7, 0.26, -0.22, 0.55, -0.45, 0.1, -0.08];
function shade(base, k) {
  const t = SHADES[k % SHADES.length];
  return base.map((c) => Math.round(t >= 0 ? c + (255 - c) * t : c * (1 + t)));
}
const catOrder = Object.fromEntries(CATEGORIES.map((c, i) => [c.id, i]));

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
  const dict = field ? codes[field] : null;
  if (!dict) return vs[0] || '(blank)';
  const base = codeLabel(vs[0], dict); // "Description (CODE)"
  return vs.length > 1 ? base.replace(/\(([^()]*)\)$/, `(${vs.join(' / ')})`) : base;
}

const slug = (s) => String(s ?? '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '') || 'NONE';
const round5 = (c) => (typeof c[0] === 'number' ? [Math.round(c[0] * 1e5) / 1e5, Math.round(c[1] * 1e5) / 1e5] : c.map(round5));

/**
 * Alaska crosses the antimeridian: Census stores the Aleutians west of 180 as positive longitudes (+179),
 * which a flat Web-Mercator view draws at the far right edge. Shift rings whose mean longitude is positive
 * by -360 so they draw next to the rest of Alaska (deck.gl projects longitudes outside -180..180 linearly).
 */
function unwrapAlaska(geometry) {
  const fixRing = (ring) => {
    const mean = ring.reduce((a, [x]) => a + x, 0) / ring.length;
    return mean > 0 ? ring.map(([x, y]) => [x - 360, y]) : ring;
  };
  if (geometry.type === 'Polygon') return { type: 'Polygon', coordinates: geometry.coordinates.map(fixRing) };
  if (geometry.type === 'MultiPolygon') return { type: 'MultiPolygon', coordinates: geometry.coordinates.map((p) => p.map(fixRing)) };
  return geometry;
}

// ---------- per-source load ----------
const stateById = Object.fromEntries(STATES.map((s) => [s.id, s]));

async function loadState(S) {
  const basePath = path.join(S.raw, S.base);
  if (!fs.existsSync(basePath)) throw new Error(`${S.id}: base file not found: ${basePath}`);
  const header = readHeader(basePath);
  const col = (n) => header.indexOf(n);
  const iApi = S.apiField ? col(S.apiField) : findApiCol(header);
  const iType = S.typeField ? col(S.typeField) : -1;
  const iStatus = S.statusField ? col(S.statusField) : -1;
  const iApiType = S.apiTypeField ? col(S.apiTypeField) : -1;
  const iState = S.stateField ? col(S.stateField) : -1;
  const iRegion = S.regionField ? col(S.regionField) : -1;
  const iStateId = S.stateIdField ? col(S.stateIdField) : -1;
  const iCountyName = S.countyField ? col(S.countyField) : -1;
  const lonC = S.lon.map(col).filter((i) => i >= 0);
  const latC = S.lat.map(col).filter((i) => i >= 0);
  if (iApi < 0 || (iType < 0 && !S.typeOf) || !lonC.length || !latC.length) throw new Error(`${S.id}: base file missing API/type/coordinate columns (api=${iApi} type=${iType} lon=${lonC} lat=${latC})`);
  if (S.stateIdField && iStateId < 0) throw new Error(`${S.id}: stateIdField ${S.stateIdField} not in the base file`);
  const codes = S.codes && fs.existsSync(S.codes) ? JSON.parse(fs.readFileSync(S.codes, 'utf8')).fields : {};
  const outline = stateOutlines(ROOT)[S.id];
  if (!outline && S.repairCoords) log(`WARNING: ${S.id} has no outline in data/raw/us_states.geojson - coordinate repair disabled`);
  const plss = S.plss ? loadSections(ROOT, S.id) : null;
  if (plss) log(`${S.id} PLSS grid ${plss.file}: sections=${plss.rows} keys=${plss.boxes.size} skipped=${plss.skipped} ambiguous=${plss.ambiguous}`);
  const multiPrefix = prefixesOf(S).length > 1;
  const isOverlay = S.kind === 'overlay';

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
  const stats = { exact: 0, repaired: 0, approx: 0, none: 0, invalidCoords: 0, nullCoords: 0, repairFailed: {}, approxFailed: {}, approxInferred: 0, approxQuarter: 0, noApi: 0 };
  const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
  const regionCounts = {};
  const { rows } = await readCsv(basePath, (rec) => {
    const rawApi = rec[iApi];
    // Which state does this row belong to (overlay), and which API prefix applies to it?
    let forState = null, prefix = S.apiPrefix;
    if (isOverlay) {
      forState = (S.stateIds && S.stateIds[String(rec[iState] ?? '').trim()]) || null;
      prefix = forState && stateById[forState] ? stateById[forState].apiPrefix : null;
    }
    const isApi = iApiType < 0 || String(rec[iApiType] ?? '').trim() === S.apiTypeValue;
    let canon = '';
    if (isApi) canon = isOverlay ? canonicalApiWithPrefix(prefix, rawApi) : canonicalApi(S, rawApi);
    if (!canon) stats.noApi++;
    if (multiPrefix && canon) prefix = canon.slice(0, 2);
    const c = isOverlay ? null : countyCodeOf(S, rawApi);
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
    // Shard key: county (from the API) for states; region + prefix + area for multi-prefix offshore; state for overlays.
    let k;
    if (isOverlay) k = `${S.id}-${forState || 'XX'}`;
    else if (multiPrefix) k = `${S.id}-${iRegion >= 0 ? slug(rec[iRegion]) : 'R'}-${prefix || '00'}-${c || 'none'}`;
    else if (S.countyFromApi === false) k = `${S.id}-${iCountyName >= 0 ? slug(rec[iCountyName]).slice(0, 24) : 'all'}`;
    else k = `${S.id}-${c || 'none'}`;
    if (iRegion >= 0) { const rc = String(rec[iRegion] ?? '').trim(); regionCounts[rc] = (regionCounts[rc] || 0) + 1; }
    const typeVal = S.typeOf ? S.typeOf(g) : rec[iType];
    wells.push({
      k, a: canon, p: prefix || '', x, y, loc, note, r: rec, fs: forState,
      t: typeCat.add(typeVal),
      s: iStatus >= 0 ? statusCat.add(rec[iStatus]) : -1,
      rg: iRegion >= 0 ? String(rec[iRegion] ?? '').trim() : null,
    });
  });
  wells.sort((p, q) => (p.k < q.k ? -1 : p.k > q.k ? 1 : p.a < q.a ? -1 : p.a > q.a ? 1 : 0));
  log(`${S.id} ${S.base}: rows=${rows} exact=${stats.exact} repaired=${stats.repaired} approx=${stats.approx} unmapped=${stats.none} noApi=${stats.noApi}`);

  const drawn = (w) => w.loc !== LOC.NONE;
  const tally = (n, getter) => {
    const mapped = new Array(n).fill(0), total = new Array(n).fill(0), approx = new Array(n).fill(0);
    for (const w of wells) { const i = getter(w); total[i]++; if (drawn(w)) mapped[i]++; if (w.loc === LOC.APPROX) approx[i]++; }
    return { mapped, total, approx };
  };

  // Types: category, then mapped count. Colors: category base color, shaded per type within the category.
  const tt = tally(typeCat.list.length, (w) => w.t);
  const typeInfo = typeCat.list.map((c, i) => {
    const name = displayName(S.typeField, c, codes);
    return { i, name, code: variantsOf(c)[0], variants: variantsOf(c), category: categoryOf(S.categoryOverrides, c.key, name) };
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
      color: isOverlay && S.marker ? S.marker.stroke.slice(0, 3) : shade(CATEGORIES[catOrder[t.category]].color, k),
      count: tt.mapped[old], approx: tt.approx[old], total: tt.total[old] };
  });

  // Statuses: by count; colors from the palette, or category shades when the source maps statuses to categories.
  let statusList = [], statusRemap = null;
  if (iStatus >= 0) {
    const st = tally(statusCat.list.length, (w) => w.s);
    const sInfo = statusCat.list.map((c) => {
      const name = displayName(S.statusField, c, codes);
      return { name, code: variantsOf(c)[0], variants: variantsOf(c), category: S.statusCategoryOverrides ? categoryOf(S.statusCategoryOverrides, c.key, name) : null };
    });
    const sOrder = statusCat.list.map((_, i) => i).sort((a, b) => (S.statusCategoryOverrides ? catOrder[sInfo[a].category] - catOrder[sInfo[b].category] : 0)
      || st.mapped[b] - st.mapped[a] || st.total[b] - st.total[a]);
    statusRemap = new Array(sOrder.length);
    sOrder.forEach((old, neu) => { statusRemap[old] = neu; });
    const perCatS = {};
    statusList = sOrder.map((old, k) => {
      const s = sInfo[old];
      let color = colorFor(k);
      if (s.category) { const j = (perCatS[s.category] = (perCatS[s.category] ?? -1) + 1); color = shade(CATEGORIES[catOrder[s.category]].color, j); }
      return { name: s.name, code: s.code, variants: s.variants, category: s.category, color, count: st.mapped[old], approx: st.approx[old], total: st.total[old] };
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
    const ai = S.layerApiField && S.layerApiField[f] ? h.indexOf(S.layerApiField[f]) : findApiCol(h);
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
        // 12-digit keyed sources (BOEM): a layer row joins only the borehole with the same full API string when it has one.
        if (S.apiKey === 'string12' && targets.length > 1) {
          const full = String(rec[ai]).replace(/\D/g, '');
          const exact = targets.filter((t) => String(wells[t].r[iApi]).replace(/\D/g, '') === full);
          if (exact.length) targets = exact;
        }
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

  // Region labels (offshore sub-filter)
  let regions = null;
  if (iRegion >= 0) {
    const dict = codes[S.regionField] || {};
    regions = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]).map(([code, count]) => ({ code, name: dict[code] || code, total: count }));
  }

  return {
    S, header, wells, rows, layers, pairsByLayer, snap: snapshotFromPullLog(S), stats, plss, regions,
    typeList, typeRemap, statusList, statusRemap, iStateId, iCountyName,
    decode: Object.fromEntries([S.typeField, S.statusField, S.regionField].filter((f) => f && codes[f]).map((f) => [f, codes[f]])),
  };
}

// ---------- main ----------
async function main() {
  const t0 = Date.now();
  const sources = ONLY.length ? STATES.filter((s) => ONLY.includes(s.id)) : STATES;
  if (!fs.existsSync(BASEMAP)) throw new Error(`national county basemap not found: ${BASEMAP} (run python3 -I scripts/pull_basemap.py)`);

  fs.rmSync(OUT, { recursive: true, force: true });
  for (const d of ['shards', 'ids', 'reference']) fs.mkdirSync(path.join(OUT, d), { recursive: true });
  const brotli = (json) => zlib.brotliCompressSync(json, {
    params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11, [zlib.constants.BROTLI_PARAM_LGWIN]: 24, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: json.length },
  });
  const columns = (rows, width) => Array.from({ length: width }, (_, c) => rows.map((r) => (r[c] ?? '')));

  const parts = []; // per-source typed arrays, concatenated at the end
  const metaTypes = [], metaStatuses = [], metaStates = [], shards = [], referenceLayers = [];
  const bbox = [Infinity, Infinity, -Infinity, -Infinity];
  let offset = 0;

  for (const S of sources) {
    const L = await loadState(S);
    const { wells, stats } = L;
    const n = wells.length;
    const typeBase = metaTypes.length;
    const statusBase = metaStatuses.length;
    L.typeList.forEach((t) => metaTypes.push({ ...t, state: S.id }));
    L.statusList.forEach((t) => metaStatuses.push({ ...t, state: S.id }));
    if (metaTypes.length > 65000 || metaStatuses.length > 65000) throw new Error('too many categories for Uint16 encoding');

    const points = new Float32Array(n * 2), types = new Uint16Array(n), status = new Uint16Array(n).fill(NO_STATUS);
    const apis = new Uint32Array(n), locs = new Uint8Array(n);
    const sbox = [Infinity, Infinity, -Infinity, -Infinity]; // source bbox for "zoom to": percentile-trimmed drawn wells
    const lons = [], lats = [];
    wells.forEach((w, i) => {
      points[i * 2] = w.x; points[i * 2 + 1] = w.y;
      locs[i] = w.loc;
      if (w.loc !== LOC.NONE) {
        bbox[0] = Math.min(bbox[0], w.x); bbox[1] = Math.min(bbox[1], w.y); bbox[2] = Math.max(bbox[2], w.x); bbox[3] = Math.max(bbox[3], w.y);
        lons.push(w.x); lats.push(w.y);
      }
      types[i] = typeBase + L.typeRemap[w.t];
      if (w.s >= 0) status[i] = statusBase + L.statusRemap[w.s];
      apis[i] = keyOf(w.a);
    });
    // Robust bbox: 0.5 .. 99.5 percentile of the drawn points (keeps one stray coordinate from blowing up "zoom to state").
    if (lons.length) {
      const q = (arr, p) => { const s = Float64Array.from(arr).sort(); return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))]; };
      sbox[0] = q(lons, 0.005); sbox[2] = q(lons, 0.995); sbox[1] = q(lats, 0.005); sbox[3] = q(lats, 0.995);
    }
    parts.push({ points, types, status, apis, locs });

    // Shards: contiguous ranges of the same shard key; layer records bucketed by shard.
    const ranges = [];
    for (let s = 0; s < n;) {
      let e = s;
      while (e < n && wells[e].k === wells[s].k) e++;
      ranges.push([wells[s].k, s, e]);
      s = e;
    }
    const shardOf = new Uint32Array(n);
    ranges.forEach(([, s, e], ri) => { for (let i = s; i < e; i++) shardOf[i] = ri; });
    const perShard = ranges.map(() => ({}));
    for (const layer of L.layers) {
      for (const [wi, rec] of L.pairsByLayer[layer.key]) (perShard[shardOf[wi]][layer.key] ||= []).push([wi, rec]);
      delete L.pairsByLayer[layer.key];
    }
    let shardBytes = 0, maxShard = 0;
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
      const buf = brotli(Buffer.from(JSON.stringify(body)));
      fs.writeFileSync(path.join(OUT, file), buf);
      shardBytes += buf.length; maxShard = Math.max(maxShard, buf.length);
      // Every well in a shard shares one API prefix (per-state shards for overlays, per-prefix shards offshore).
      const prefix = wells[s].p || (S.kind === 'overlay' ? '' : S.apiPrefix || '');
      shards.push({ key, state: S.id, forState: wells[s].fs || undefined, prefix, start: offset + s, count: e - s, file });
      perShard[ri] = null;
    });

    // Regions (offshore sub-filter): contiguous because the shard key starts with the region.
    let regions = null;
    if (L.regions) {
      regions = L.regions.map((r) => ({ ...r, start: Infinity, end: -Infinity, mapped: 0 }));
      const byCode = Object.fromEntries(regions.map((r) => [r.code, r]));
      wells.forEach((w, i) => { const r = byCode[w.rg]; if (!r) return; r.start = Math.min(r.start, offset + i); r.end = Math.max(r.end, offset + i + 1); if (w.loc !== LOC.NONE) r.mapped++; });
      regions.sort((a, b) => a.start - b.start);
    }

    // Per-state sub-ranges of an overlay (each state's rows are one shard).
    const stateRanges = S.kind === 'overlay' ? shards.filter((sh) => sh.state === S.id && sh.forState).map((sh) => ({ state: sh.forState, prefix: sh.prefix, start: sh.start, end: sh.start + sh.count })) : undefined;

    // Regulator well-id index (sources without API numbers).
    let idIndex = null;
    if (L.iStateId >= 0) {
      const map = new Map();
      wells.forEach((w, i) => { const k = normId(w.r[L.iStateId]); if (!k) return; const l = map.get(k); if (l) l.push(offset + i); else map.set(k, [offset + i]); });
      const keys = [...map.keys()].sort();
      const body = { state: S.id, field: S.stateIdField, keys, idx: keys.map((k) => map.get(k)) };
      const file = `ids/${S.id}.json.br`;
      fs.writeFileSync(path.join(OUT, file), brotli(Buffer.from(JSON.stringify(body))));
      idIndex = { file, field: S.stateIdField, label: labelFor(S.stateIdField), count: keys.length };
      log(`${S.id} id index ${S.stateIdField}: ${keys.length} distinct ids`);
    }

    // Reference outlines (offshore planning areas / protraction diagrams), copied with rounded coordinates.
    for (const ref of S.referenceLayers || []) {
      const p = path.join(S.raw, ref.file);
      if (!fs.existsSync(p)) { log(`WARNING: ${S.id} reference layer not found: ${p}`); continue; }
      const gj = JSON.parse(fs.readFileSync(p, 'utf8'));
      const features = gj.features.map((f) => ({ type: 'Feature', geometry: { type: f.geometry.type, coordinates: round5(f.geometry.coordinates) }, properties: { label: String(f.properties?.[ref.label] ?? '') } }));
      const file = `reference/${ref.file.replace(/\.geojson$/i, '')}.json`;
      fs.writeFileSync(path.join(OUT, file), JSON.stringify({ type: 'FeatureCollection', features }));
      referenceLayers.push({ source: S.id, file, name: ref.name, features: features.length });
    }

    const mapped = stats.exact + stats.repaired + stats.approx;
    metaStates.push({
      id: S.id, kind: S.kind || 'state', name: S.name, agency: S.agency, short: S.short, fragment: S.fragment,
      apiPrefix: S.apiPrefix, apiPrefixes: prefixesOf(S), apiForm: S.apiForm, apiKey: S.apiKey || null, apiField: S.apiField || null, datum: S.datum,
      stateIdField: S.stateIdField || null, idIndex, countyFromApi: S.countyFromApi !== false && !!S.counties, countyField: S.countyField || null, areaField: S.areaField || null,
      regionField: S.regionField || null, regions, stateRanges, defaultColorBy: S.defaultColorBy || 'type', panelFirst: S.panelFirst || null,
      marker: S.marker || null, note: S.note || S.notes || null,
      snapshot: L.snap.date, snapshotSource: L.snap.source,
      start: offset, wellCount: n, sourceRowCount: L.rows, bbox: Number.isFinite(sbox[0]) ? sbox : null,
      mapped, exact: stats.exact, repaired: stats.repaired, approximate: stats.approx, unplottable: stats.none, noApi: stats.noApi,
      nullCoords: stats.nullCoords, invalidCoords: stats.invalidCoords,
      repairFailed: stats.repairFailed, approxFailed: stats.approxFailed, approxMeridianInferred: stats.approxInferred, approxWithQuarterCalls: stats.approxQuarter,
      plss: L.plss ? { file: L.plss.file, sections: L.plss.rows, keys: L.plss.boxes.size, ambiguous: L.plss.ambiguous } : null,
      typeRange: [typeBase, metaTypes.length], statusRange: [statusBase, metaStatuses.length],
      typeField: S.typeField, statusField: S.statusField, decode: L.decode,
      base: { key: `${S.id}_base`, file: S.base, name: S.baseName || 'Well Locations', fields: L.header.map((h) => ({ name: h, label: labelFor(h) })) },
      layers: L.layers, shardBytes, maxShardBytes: maxShard,
    });
    log(`${S.id}: wells=${n} mapped=${mapped} (exact=${stats.exact} repaired=${stats.repaired} approx=${stats.approx}) unmapped=${stats.none} `
      + `null=${stats.nullCoords} invalid=${stats.invalidCoords} repairFailed=${JSON.stringify(stats.repairFailed)} approxFailed=${JSON.stringify(stats.approxFailed)} `
      + `types=${L.typeList.length} statuses=${L.statusList.length} layers=${L.layers.length} shards=${ranges.length} shardMB=${(shardBytes / 1e6).toFixed(1)} snapshot=${L.snap.date} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    offset += n;
    L.wells = null;
    if (global.gc) global.gc();
  }

  // Concatenate the per-source arrays.
  const N = offset;
  const concat = (Type, pick, width = 1) => {
    const out = new Type(N * width);
    let o = 0;
    for (const p of parts) { out.set(pick(p), o); o += pick(p).length; }
    return out;
  };
  const writeBin = (name, arr) => fs.writeFileSync(path.join(OUT, name), Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength));
  writeBin('points.bin', concat(Float32Array, (p) => p.points, 2));
  writeBin('types.bin', concat(Uint16Array, (p) => p.types));
  writeBin('status.bin', concat(Uint16Array, (p) => p.status));
  writeBin('apis.bin', concat(Uint32Array, (p) => p.apis));
  writeBin('loc.bin', concat(Uint8Array, (p) => p.locs));
  parts.length = 0;

  // National county basemap, normalized; Alaska unwrapped across the antimeridian.
  const features = [];
  for (const f of JSON.parse(fs.readFileSync(BASEMAP, 'utf8')).features) {
    const pr = f.properties || {};
    const st = String(pr.STUSPS ?? '');
    features.push({ type: 'Feature', geometry: st === 'AK' ? unwrapAlaska(f.geometry) : f.geometry,
      properties: { state: st, code: String(pr.COUNTY ?? '').padStart(3, '0'), name: String(pr.NAME ?? '').replace(/\s+County$/i, '') } });
  }
  fs.writeFileSync(path.join(OUT, 'counties.json'), JSON.stringify({ type: 'FeatureCollection', source: 'US Census cartographic boundary file cb_2025_us_county_500k (via scripts/pull_basemap.py)', features }));

  const dates = metaStates.map((s) => s.snapshot).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  const meta = {
    app: 'US Wells Map', builtAt: new Date().toISOString(),
    wellCount: N, bbox, categories: CATEGORIES.map(({ id, name, color }) => ({ id, name, color })),
    snapshotRange: dates.length ? [dates[0], dates[dates.length - 1]] : null,
    states: metaStates, types: metaTypes, statuses: metaStatuses, shards, referenceLayers, countyCount: features.length,
    encoding: { types: 'Uint16', status: 'Uint16', noStatus: NO_STATUS, apis: 'Uint32', loc: 'Uint8', points: 'Float32x2' },
  };
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 1));

  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  let size = 0;
  for (const f of walk(OUT)) size += fs.statSync(f).size;
  log(`wrote ${OUT}: sources=${metaStates.length} wells=${N} types=${metaTypes.length} statuses=${metaStatuses.length} shards=${shards.length} counties=${features.length} size=${(size / 1e6).toFixed(1)}MB in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((e) => { console.error('[build_data] FAILED:', e); process.exit(1); });
