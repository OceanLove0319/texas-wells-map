/**
 * states.config.mjs - the ONE place that describes each state. Adding a state = one pull script that
 * writes data/raw/<st>/ + one entry in STATES below (see docs/ADDING_A_STATE.md).
 *
 * Nothing here lists a state's fields: every column of the base file and of every layer CSV is kept
 * and shown. An entry only says where the files are and which columns play which role.
 *
 * Entry fields
 *   id, name, agency, short    'KS', 'Kansas', 'Kansas Geological Survey (KGS)', 'KGS' (short shows in the header)
 *   apiPrefix                  2-digit API state code ('42' TX, '35' OK, '15' KS)
 *   apiForm                    'full' = the API column includes the state code; 'county8' = 8 digits without it (TX)
 *   raw, base                  folder (relative to the repo) and base file (one map point per row, CSV with header)
 *   apiField                   optional; default = first column named API / api / api_number / api_no / apinum
 *   typeField, statusField     columns used for the legend (statusField may be null)
 *   codes                      optional JSON { fields: { <field>: { <code>: <description> } } } for code labels
 *   lon, lat                   candidate coordinate columns, first non-null non-zero wins
 *   datum                      datum of those coordinates (shown in the snapshot report)
 *   counties                   { file, code, name } county outlines inside `raw` (Census TIGERweb is fine)
 *   layerNames, baseName       display names for layer CSVs (file -> name) and for the base file
 *   snapshot                   { log, name, field } pull_log.jsonl line whose `field` (or finished_utc) is the data date,
 *                              or a function returning { date, source }
 *   sourceCount                optional JSON { count } from the regulator (row-count reconciliation in the report)
 *   categoryOverrides          optional { <raw type code (upper case)>: <category id> } when the text rules below miss
 *   plss                       optional; how to read meridian / township / range / section / quarter calls so wells
 *                              without coordinates can get an approximate location (see scripts/lib/plss.mjs)
 *   repairCoords               true = try to repair out-of-range coordinates (missing decimal point) when the fix is
 *                              unambiguous and lands inside the state
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const r = (...p) => path.join(ROOT, ...p);

/**
 * Shared well categories. Every state's type values map to one of these, so "oil" is the same color
 * family in every state. Within a category, a state's individual types get shades of the base color.
 * `rules` are tried in order against "<raw code> <description>"; the first match wins.
 */
export const CATEGORIES = [
  { id: 'oil', name: 'Oil', color: [26, 150, 65] },
  { id: 'gas', name: 'Gas', color: [215, 48, 39] },
  { id: 'plugged', name: 'Plugged / abandoned', color: [115, 115, 115] },
  { id: 'injection', name: 'Injection / disposal', color: [33, 113, 181] },
  { id: 'dry', name: 'Dry hole', color: [237, 140, 20] },
  { id: 'other', name: 'Permit / other', color: [174, 82, 168] },
];
export const CATEGORY_RULES = [
  ['plugged', /plugged|p\s*&\s*a\b|\bpa\b/i],
  ['dry', /\bdry\b|\bd\s*&\s*a\b/i],
  ['injection', /inject|\binj\b|-inj\b|disposal|\buic\b|\bswd\b|\beor\b|enhanced recovery|\bwiw\b|class ?(1|one)\b/i],
  ['other', /storage|\bstg\b|water|observ|obervation|\bobs\b|service|core|brine|geothermal|strat|cath|monitor|helium|permit|location|\bloc\b|intent|unknown|no type|legacy state funds|temporarily|\bta\b/i],
  ['oil', /\boil\b|\bo\s*&\s*g\b/i],
  ['gas', /\bgas\b|\bcbm\b/i],
];

// ---- helpers for PLSS columns ----
const int = (v) => { const n = parseInt(String(v ?? '').trim(), 10); return Number.isFinite(n) && n > 0 ? n : null; };
/** "26N" / "026N" / "26 N" -> { n: 26, dir: 'N' } */
const tr = (v) => { const m = String(v ?? '').trim().toUpperCase().match(/^0*(\d+)\s*([NSEW])$/); return m ? { n: Number(m[1]), dir: m[2] } : null; };

export const STATES = [
  {
    id: 'TX', name: 'Texas', agency: 'Railroad Commission of Texas (RRC)', short: 'RRC',
    apiPrefix: '42', apiForm: 'county8',
    raw: r('data', 'raw'), base: 'wells.csv',
    typeField: 'GIS_SYMBOL_DESCRIPTION', statusField: null,
    lon: ['lon_4326', 'GIS_LONG83', 'GIS_LONG27'], lat: ['lat_4326', 'GIS_LAT83', 'GIS_LAT27'], datum: 'WGS84',
    counties: { file: 'counties.geojson', code: 'FIPS', name: 'COUNTY_NAME' },
    layerNames: () => layerNamesFromSummary(r('data', 'layers_summary.md')),
    baseName: 'Well Locations',
    snapshot: () => snapshotFromReport(r('data', 'snapshot_report.md')),
    repairCoords: true,
  },
  {
    id: 'OK', name: 'Oklahoma', agency: 'Oklahoma Corporation Commission (OCC)', short: 'OCC',
    apiPrefix: '35', apiForm: 'full',
    raw: r('data', 'raw', 'ok'), base: 'rbdms-wells.csv',
    typeField: 'WELLTYPE', statusField: 'WELLSTATUS', codes: r('data', 'ok_codes.json'),
    lon: ['SH_LON'], lat: ['SH_LAT'], datum: 'NAD83 (per OCC)',
    counties: { file: 'ok_counties.geojson', code: 'COUNTY', name: 'NAME' },
    layerNames: () => ({ 'orphan_funds_wells.csv': 'Orphan Fund', 'comp_wells.csv': 'Completion Report' }),
    baseName: 'Well',
    snapshot: { log: 'pull_log.jsonl', name: 'rbdms-wells.csv' },
    categoryOverrides: { TM: 'injection', STFD: 'other', DUC: 'other', SCO: 'other', '2EPA': 'injection', ND: 'other', NT: 'other' },
    plss: {
      // CadNSDI meridian codes: 17 = Indian Meridian, 11 = Cimarron Meridian (Panhandle).
      meridians: { IM: '17', CM: '11' },
      meridian: (g) => String(g('PM') ?? '').trim().toUpperCase(),
      township: (g) => tr(g('TOWNSHIP')),
      range: (g) => tr(g('RANGE')),
      section: (g) => int(g('SECTION')),
      // QTR1 is the largest call (always filled when any is), QTR4 the smallest.
      quarters: (g) => ['QTR1', 'QTR2', 'QTR3', 'QTR4'].map((f) => g(f)),
    },
    repairCoords: true,
  },
  {
    id: 'KS', name: 'Kansas', agency: 'Kansas Geological Survey (KGS)', short: 'KGS',
    apiPrefix: '15', apiForm: 'full',
    raw: r('data', 'raw', 'ks'), base: 'ks_wells.txt',
    typeField: 'STATUS', statusField: 'STATUS2',
    lon: ['LONGITUDE'], lat: ['LATITUDE'], datum: 'NAD27 (per KGS)',
    counties: { file: 'ks_counties.geojson', code: 'COUNTY', name: 'NAME' },
    layerNames: () => ({}),
    baseName: 'Well',
    // The bulk file is rebuilt by KGS periodically; the date inside the zip is the data date.
    snapshot: { log: 'pull_log.jsonl', name: 'ks_wells.txt', field: 'zip_entry_date' },
    sourceCount: r('data', 'raw', 'ks', 'source_count.json'),
    plss: {
      meridians: { '6TH': '06' },
      meridian: () => '6TH', // all of Kansas is surveyed from the Sixth Principal Meridian
      township: (g) => { const n = int(g('TOWNSHIP')); const d = String(g('TWN_DIR') ?? '').trim().toUpperCase(); return n && /^[NS]$/.test(d) ? { n, dir: d } : null; },
      range: (g) => { const n = int(g('RANGE')); const d = String(g('RANGE_DIR') ?? '').trim().toUpperCase(); return n && /^[EW]$/.test(d) ? { n, dir: d } : null; },
      section: (g) => int(g('SECTION')),
      // SPOT is written smallest call first ("NE NW SE" = NE of NW of SE); reverse to largest first.
      quarters: (g) => String(g('SPOT') ?? '').trim().split(/\s+/).filter(Boolean).reverse(),
    },
    repairCoords: true,
  },
];

// ---- snapshot helpers (used by entries above) ----
export function layerNamesFromSummary(p) {
  const names = {};
  if (!fs.existsSync(p)) return names;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|.*data\/raw\/([\w.-]+\.csv)/);
    if (m) names[m[3]] = m[2];
  }
  return names;
}

export function snapshotFromReport(rep) {
  if (fs.existsSync(rep)) {
    const txt = fs.readFileSync(rep, 'utf8');
    const m = txt.match(/Pull finish times[^\n]*?(\d{4}-\d{2}-\d{2})/) || txt.match(/(\d{4}-\d{2}-\d{2})/);
    if (m) return { date: m[1], source: path.relative(ROOT, rep) };
  }
  return { date: 'unknown', source: 'none' };
}

/** Latest pull_log.jsonl line for `name`; the date is rec[field] when given, else finished_utc. */
export function snapshotFromPullLog(S) {
  const spec = S.snapshot;
  if (typeof spec === 'function') return spec();
  const p = path.join(S.raw, spec.log);
  if (!fs.existsSync(p)) return { date: 'unknown', source: 'none' };
  const rows = fs.readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter((x) => x && x.finished_utc && (!spec.name || x.name === spec.name));
  const dates = rows.map((x) => String((spec.field && x[spec.field]) || x.finished_utc)).sort();
  return dates.length
    ? { date: dates[dates.length - 1].slice(0, 10), source: `${path.relative(ROOT, p)} (${spec.name}${spec.field ? `, ${spec.field}` : ''})` }
    : { date: 'unknown', source: 'none' };
}
