/**
 * Missouri (MoDNR / Missouri Geological Survey) - one STATES entry for scripts/states.config.mjs.
 * Pull: scripts/pull_mo.py -> data/raw/mo/. DATA LAST UPDATED 2021: the layer's metadata pubdate is
 * 2021-08-30 (update frequency "As needed"); newest status date 2021-08-03. Static snapshot.
 */
import path from 'node:path';
import { ROOT } from './_shared.mjs';

const r = (...p) => path.join(ROOT, ...p);
const int = (v) => { const n = parseInt(String(v ?? '').trim(), 10); return Number.isFinite(n) && n > 0 ? n : null; };
const trDir = (num, dir, ok) => { const n = int(num); const d = String(dir ?? '').trim().toUpperCase().charAt(0); return n && ok.includes(d) ? { n, dir: d } : null; };

const STATE = {
  id: 'MO', name: 'Missouri', agency: 'Missouri DNR, Missouri Geological Survey (data last updated 2021)', short: 'MoDNR, data last updated 2021',
  apiPrefix: '24', apiForm: 'full',
  raw: r('data', 'raw', 'mo'), base: 'mo_wells.csv',
  // API is added by the pull script: API_NUMBER "037-20070" (no state code) -> "24-037-20070".
  apiField: 'API',
  typeField: 'WELL_TYPE', statusField: 'STATUS',
  lon: ['lon_4326', 'LONGITUDE'], lat: ['lat_4326', 'LATITUDE'],
  datum: 'NAD83 (service UTM 15N, reprojected to WGS84 by the server; attribute LATITUDE/LONGITUDE identical)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  // Data date = the layer metadata's publication date (the service itself has not changed since 2021).
  snapshot: { log: 'pull_log.jsonl', name: 'mo_wells.csv', field: 'metadata_pubdate' },
  sourceCount: r('data', 'raw', 'mo', 'source_count.json'),
  categoryOverrides: {},
  plss: {
    // All of Missouri is surveyed from the Fifth Principal Meridian (CadNSDI code 05).
    meridians: { '5TH': '05' },
    meridian: () => '5TH',
    township: (g) => trDir(g('TOWNSHIP'), g('TWP_DIR'), 'NS'),
    range: (g) => trDir(g('RANGE'), g('RNG_DIR'), 'EW'),
    section: (g) => int(g('SECTION_')),
    quarters: () => [], // SURVEYLOC1/2 are footage calls ("165 FNL"), not quarter calls
  },
  repairCoords: true,
  note: 'Data last updated 2021 (MoDNR metadata pubdate 2021-08-30, newest status date 2021-08-03). Document links: PERMIT_LINK, DOWN_LINK, STRAT_LINK.',
};
export default STATE;
export { STATE };
