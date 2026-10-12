/**
 * Osage County, Oklahoma - BIA Osage Agency well locations (2021), a SEPARATE SOURCE within Oklahoma.
 * One STATES entry for scripts/states.config.mjs. Pull: scripts/pull_ok_osage.py -> data/raw/ok_osage/.
 *
 * Osage County minerals are federally administered, so OCC's RBDMS file has no Osage wells (0 rows with
 * COUNTY=OSAGE or API 35-113). The Osage Minerals Council publishes the BIA Osage Agency locations on
 * ArcGIS Online ("Osage BIA Wells", public). It has NO API numbers, operators or dates: only the BIA lease
 * well number (WNUM), a STATUS abbreviation and coordinates. Data last edited 2021-01-25.
 * About 103 OCC rows (Pawnee / Tulsa / Kay / Washington county APIs) plot inside the Osage County line;
 * they are NOT deduplicated against this layer (see the snapshot report).
 */
import path from 'node:path';
import { ROOT } from './_shared.mjs';

const r = (...p) => path.join(ROOT, ...p);

const STATE = {
  id: 'OK_OSAGE', name: 'Osage County, OK (BIA)', agency: 'BIA Osage Agency, via Osage Minerals Council ArcGIS Online layer "Osage BIA Wells" (data last edited 2021)', short: 'BIA Osage Agency (2021)',
  apiPrefix: '35', apiForm: 'full', // same state code as OCC; the API column is blank (the source has no APIs)
  raw: r('data', 'raw', 'ok_osage'), base: 'osage_bia_wells.csv',
  apiField: 'API',
  stateIdField: 'WNUM', // BIA lease well number: the only identifier; searchable in the app
  sortKey: 'Oklahoma 2', // list right after Oklahoma (OCC)
  typeField: 'STATUS', statusField: null, codes: r('data', 'ok_osage_codes.json'),
  lon: ['lon_4326', 'longitude'], lat: ['lat_4326', 'latitude'],
  datum: 'WGS84 (AGOL service geometry; attribute latitude/longitude columns also kept)',
  counties: null, // the API column is blank, so there is no county lookup; every row is in Osage County
  layerNames: () => ({}),
  baseName: 'BIA well location',
  snapshot: { log: 'pull_log.jsonl', name: 'osage_bia_wells.csv', field: 'data_last_edit' },
  sourceCount: r('data', 'raw', 'ok_osage', 'source_count.json'),
  // BIA STATUS abbreviations -> shared categories. Water-supply wells and permitted locations (LOC) keep
  // their own legend entries (purple "Permit / other" family) rather than being hidden. ABD = abandoned.
  categoryOverrides: {
    OIL: 'oil', 'O&G': 'oil', OIL_SWD: 'oil',
    GAS: 'gas', GAS_WE: 'gas',
    'ABD-OIL': 'plugged', 'ABD-GAS': 'plugged', 'ABD-O&G': 'plugged', 'ABD-INJ': 'plugged', 'ABD-SWD': 'plugged',
    'ABD-WSW': 'plugged', ABD_CO2: 'plugged', 'ABD-SWE': 'plugged', ABD_WSE: 'plugged', 'ABD-RPW': 'plugged', 'ABD-CT': 'plugged', ABD_DUA: 'plugged',
    D_A: 'dry', DRY: 'dry',
    INJ: 'injection', INJ_WE: 'injection', CO2_INJ: 'injection', SWD_WOE: 'injection', SWD_WE: 'injection', DUA_INJ: 'injection',
    LOC: 'other', WSW: 'other', WSW_WE: 'other', 'WS-WI': 'other', TA: 'other', OBS: 'other', GAS_ST: 'other',
    RPW: 'other', CT: 'other', DUA: 'other',
  },
  repairCoords: false, // no state outline for this id; every row has coordinates
  note: 'Separate source within Oklahoma: BIA Osage Agency well locations, data last edited 2021-01-25. No API numbers (not searchable), no operators, no dates. Water-supply wells (WSW*) and permitted locations (LOC) are shown as their own legend entries.',
};
export default STATE;
export { STATE };
