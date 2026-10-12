/**
 * boem.config.mjs - config FRAGMENT for the pseudo-state "Federal Offshore" (BOEM OCS boreholes).
 * Same schema as an entry in scripts/states.config.mjs; keys marked EXTRA are not supported by the build yet -
 * see scripts/states/NOTES.md. Data: python3 -I scripts/pull_boem.py ; report: ... --report
 *
 * Usage (integration agent): import { BOEM } from './states/boem.config.mjs' and push it into STATES, or copy the
 * object. `r` below mirrors the helper in states.config.mjs.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export const BOEM = {
  id: 'OCS', name: 'Federal Offshore', sortKey: 'zz Federal Offshore', agency: 'Bureau of Ocean Energy Management (BOEM)', short: 'BOEM',

  // API numbers. BOEM boreholes carry 12-digit APIs (10 digits + 2-digit sidetrack/bypass suffix). The OCS state codes are
  // 55 Alaska, 56 Pacific, 60 Northern Gulf, 61 Atlantic, but 56% of rows carry the ADJACENT STATE's code (01 AL, 17 LA,
  // 42 TX, 04 CA, 50 AK). apiPrefix is the single code the current schema expects; apiPrefixes is the real list (EXTRA).
  apiPrefix: '60', apiForm: 'full',
  apiPrefixes: ['60', '61', '55', '56', '01', '17', '42', '04', '50'],   // EXTRA
  apiField: 'API_WELL_NUMBER',
  apiKey: 'string12',                                                    // EXTRA: key by the full 12-digit string; 57,503 distinct
                                                                         //        12-digit vs 39,569 distinct 10-digit (sidetracks collapse)

  raw: r('data', 'raw', 'boem'), base: 'mv_boreholes_all.txt',          // quoted CSV with header, 26 columns, 57,503 rows
  typeField: 'WELL_TYPE_CODE', statusField: 'BOREHOLE_STAT_CD',
  codes: r('data', 'boem_codes.json'),                    // { fields: { WELL_TYPE_CODE, BOREHOLE_STAT_CD, REGION_CODE } }
  lon: ['SURF_LONGITUDE'], lat: ['SURF_LATITUDE'], datum: 'NAD27 (per BOEM; surface location)',
  bottomHole: { lon: 'BOTM_LONGITUDE', lat: 'BOTM_LATITUDE' },           // EXTRA, optional: bottom-hole location (384 rows blank)

  // No counties offshore. API digits 3-5 are OCS AREA codes (e.g. 709 High Island), not county FIPS. The base file's
  // BOTM_AREA_CODE / BOTM_BLOCK_NUMBER are the offshore equivalent of county / lease.
  counties: null,                                                        // EXTRA: build must tolerate null (skip county lookup)
  areaField: 'BOTM_AREA_CODE',                                           // EXTRA, optional: show "Area/Block" instead of "County"

  // Sub-filter inside the pseudo-state (EXTRA). Labels come from codes.fields.REGION_CODE:
  // G Gulf of America 55,570 | P Pacific 1,714 | Y Alaska 167 | A Atlantic 52.
  regionField: 'REGION_CODE',

  // Joined layer: the three BOEM_BSEE REST well layers (25,351 rows, all join on the 12-digit API). Adds the description
  // columns and the 5-digit OPERATOR number; the base file already has COMPANY_NAME. The layer's API column is API_NUMBER.
  layerNames: () => ({ 'boem_rest_wells.csv': 'BOEM GIS well layer' }),
  layerApiField: { 'boem_rest_wells.csv': 'API_NUMBER' },                // EXTRA if the default API-column sniffing misses it
  baseName: 'Borehole',

  // The zip is rebuilt daily; the date stamped inside the zip is the data date.
  snapshot: { log: 'pull_log.jsonl', name: 'mv_boreholes_all.txt', field: 'zip_entry_date' },
  sourceCount: null,                                                     // the daily CSV IS the regulator's full list; no separate live count

  // BOEM types do not distinguish oil from gas, so none of the shared rules fit; every type is "Permit / other" (purple shades
  // per type). Colouring by status (PA = Permanently Abandoned -> plugged grey) is the useful default for this layer (EXTRA: defaultColorBy).
  categoryOverrides: { D: 'other', E: 'other', C: 'other', R: 'other', S: 'other', N: 'other', O: 'other' },
  defaultColorBy: 'status',                                              // EXTRA, optional
  statusCategoryOverrides: { PA: 'plugged', TA: 'other', ST: 'other', COM: 'oil', CNL: 'other', DSI: 'other', APD: 'other', DRL: 'other', AST: 'other', VCW: 'other', CT: 'other' }, // EXTRA, optional; COM = "Completed" shown green as "producing-type", flag if unwanted

  // Optional offshore reference outlines (EXTRA). Small, generalized 0.01 deg, WGS84.
  referenceLayers: [
    { file: 'boem_planning_areas.geojson', name: 'BOEM planning areas', label: 'TEXT_LABEL' },            // 19 features, 60 KB
    { file: 'boem_protraction.geojson', name: 'BOEM protraction diagrams', label: 'PROT_NAME' },           // 400 features, 269 KB
  ],

  repairCoords: false,                                                   // 0 out-of-range coordinates; nothing to repair
};

export default BOEM;
