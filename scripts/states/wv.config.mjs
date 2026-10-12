/**
 * West Virginia - one STATES entry for scripts/states.config.mjs (same schema; see docs/ADDING_A_STATE.md).
 * Data: scripts/pull_wv.py -> data/raw/wv/ (WVDEP TAGIS oil_gas MapServer layer 7 "All DEP Wells").
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'WV', name: 'West Virginia', agency: 'West Virginia Department of Environmental Protection (WVDEP)', short: 'WVDEP',
  apiPrefix: '47', apiForm: 'full',
  raw: r('data', 'raw', 'wv'), base: 'wv_wells.csv',
  apiField: 'api', // 10 digits with the state code, e.g. 4700100046; digits 3-5 = FIPS county
  typeField: 'welluse', statusField: 'wellstatus', // welltype is the bore configuration (Vertical / Horizontal / CBM)
  lon: ['lon_4326'], lat: ['lat_4326'],
  datum: 'WGS84 (layer geometry, Web Mercator reprojected by the server); wellx/welly columns are UTM zone 17N NAD83 metres',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  // Live service, no bulk file: the data date is the pull date.
  snapshot: { log: 'pull_log.jsonl', name: 'wv_wells.csv' },
  sourceCount: r('data', 'raw', 'wv', 'source_count.json'),
  categoryOverrides: { '2R PRODUCTION WELL': 'oil' }, // secondary-recovery production well
  repairCoords: true,
  notes: 'Robots.txt discourages crawlers under /arcgis/; one approved polite pull. Layer 5 (54,887 WVGES wells not in the DEP database, many unlocated) was not pulled. `link` is the WVGES pipeline well page, `webmap` the DEP map link. Update cadence not published.',
};
