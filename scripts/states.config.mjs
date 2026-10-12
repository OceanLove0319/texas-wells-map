/**
 * states.config.mjs - loads every source description from scripts/states/<id>.config.mjs and exports
 * them as STATES, plus the shared well categories. Adding a source = one pull script that writes
 * data/raw/<st>/ + one fragment file that `export default`s one entry (see docs/ADDING_A_STATE.md).
 *
 * Nothing here lists a source's fields: every column of the base file and of every layer CSV is kept
 * and shown. An entry only says where the files are and which columns play which role.
 *
 * Entry fields (all fragments)
 *   id, name, agency, short    'KS', 'Kansas', 'Kansas Geological Survey (KGS)', 'KGS'
 *   kind                       omitted = a state (or pseudo-state such as Federal Offshore); 'overlay' = a national
 *                              overlay with its own toggle and marker, not in the state list (USGS orphan wells)
 *   sortKey                    optional; the source list is sorted by sortKey || name (overlays last)
 *   apiPrefix                  2-digit API state code ('42' TX, '35' OK); null when the source has no API numbers
 *   apiPrefixes                optional list when one source carries several state codes (BOEM: 60, 61, 55, 56, 01, 17, 42, 04, 50)
 *   apiForm                    'full' = the API column includes the state code; 'county8' = 8 digits without it (TX)
 *   apiField                   optional; default = first column named API / api / api_number / api_no / apinum
 *   apiKey                     optional 'string12': boreholes are keyed by the 12-digit API string (BOEM); search
 *                              still uses the 10-digit form and filters 12-digit queries on the full string
 *   apiTypeField/apiTypeValue  optional; the API column is only an API when apiTypeField === apiTypeValue (USGS)
 *   stateField, stateIds       optional; for a multi-state source: the column holding the state name and a map
 *                              name -> app state id (USGS). Wells are sharded per state and matched to that state.
 *   stateIdField               optional; the regulator's own well id (file number, permit, serial) for sources
 *                              without API numbers (VA FiNo, IN igs_id, KY KGS_Recno, ...). Searchable in the app.
 *   raw, base                  folder (relative to the repo) and base file (one map point per row, CSV with header)
 *   typeField, statusField     columns used for the legend (statusField may be null)
 *   typeOf                     optional (g) => string deriving the legend type from the row instead of typeField
 *                              (Illinois: TYPE_CLASS + " - Plugged" so plugged wells are colored plugged)
 *   codes                      optional JSON { fields: { <field>: { <code>: <description> } } } for code labels,
 *                              committed under data/<st>_codes.json
 *   lon, lat                   candidate coordinate columns, first non-null non-zero wins
 *   datum                      datum of those coordinates (shown in the snapshot report)
 *   counties                   { code, name } = use the national county basemap (data/raw/basemap/us_counties.geojson)
 *                              for this state's county names; null = no counties (offshore, overlays)
 *   countyFromApi              false when API digits 3-5 are not a county FIPS code (Indiana ids)
 *   countyField                optional column that carries the county name for the panel subtitle
 *   areaField                  optional (offshore): column shown as "Area" in place of the county
 *   regionField                optional: column for a sub-filter inside the source (BOEM REGION_CODE)
 *   referenceLayers            optional [{ file, name, label }] GeoJSON outlines in `raw`, shown as a faint reference
 *   layerNames, baseName       display names for layer CSVs (file -> name) and for the base file
 *   layerApiField              optional { <layer file>: <API column> } when sniffing misses it
 *   panelFirst                 optional list of field names shown first in the details panel
 *   marker                     optional (overlay): { shape: 'triangle', stroke: [r,g,b,a], radiusPx }
 *   defaultColorBy             optional 'status' to start that source colored by status
 *   snapshot                   { log, name, field } pull_log.jsonl line whose `field` (or finished_utc) is the data date,
 *                              or a function returning { date, source }
 *   sourceCount                optional JSON { count } from the regulator (row-count reconciliation in the report)
 *   categoryOverrides          optional { <raw type code (upper case)>: <category id> } when the text rules below miss
 *   statusCategoryOverrides    optional; when present, statuses are also mapped to the shared categories (colors by
 *                              category shade); otherwise statuses get a distinct palette
 *   plss                       optional; how to read meridian / township / range / section / quarter calls so wells
 *                              without coordinates can get an approximate location (see scripts/lib/plss.mjs)
 *   repairCoords               true = try to repair out-of-range coordinates (missing decimal point) when the fix is
 *                              unambiguous and lands inside the state
 *   note / notes               free text carried into meta.json and the README table
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './states/_shared.mjs';

export { ROOT, layerNamesFromSummary, snapshotFromReport, snapshotFromPullLog } from './states/_shared.mjs';

/**
 * Shared well categories. Every source's type values map to one of these, so "oil" is the same color
 * family in every state. Within a category, a source's individual types get shades of the base color.
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

/** Load every scripts/states/<name>.config.mjs (files starting with "_" are helpers, not fragments). */
const DIR = path.join(ROOT, 'scripts', 'states');
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.config.mjs') && !f.startsWith('_')).sort();
const loaded = [];
for (const f of files) {
  const mod = await import(pathToFileURL(path.join(DIR, f)).href);
  const S = mod.default;
  if (!S || !S.id) throw new Error(`scripts/states/${f}: no default export with an id`);
  S.fragment = `scripts/states/${f}`;
  loaded.push(S);
}
const ids = new Set();
for (const S of loaded) { if (ids.has(S.id)) throw new Error(`duplicate source id ${S.id}`); ids.add(S.id); }

/** States and pseudo-states sorted by sortKey || name; overlays last. */
export const STATES = loaded.sort((a, b) => {
  const ka = a.kind === 'overlay' ? 1 : 0, kb = b.kind === 'overlay' ? 1 : 0;
  if (ka !== kb) return ka - kb;
  return (a.sortKey || a.name).localeCompare(b.sortKey || b.name);
});
