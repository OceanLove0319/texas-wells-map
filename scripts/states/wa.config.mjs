/**
 * Washington (WA) - one state entry for scripts/states.config.mjs (same schema as the entries there).
 * Source: Washington Geological Survey (DNR) Public_Geology/Oil_and_Gas_Wells MapServer/1; pulled by
 * scripts/pull_wa.py into data/raw/wa/. Coordinates: LON_4326/LAT_4326 (geometry reprojected by the
 * service from WA State Plane South, EPSG 2927), then the LATITUDE/LONGITUDE attribute columns.
 * API: the derived 10-digit `API` column (WA writes API_NUMBER as "046-041-00188"; see pull_wa.py).
 * WA has no well-type field: the legend type is WELL_STATUS (almost all are dry exploratory holes) and the
 * status grouping is HYDROCARBON_SHOW (gas / oil / blank). No `plss` block: every well has coordinates.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'WA', name: 'Washington', agency: 'Washington Geological Survey (DNR)', short: 'WGS',
  apiPrefix: '46', apiForm: 'full', apiField: 'API',
  raw: r('data', 'raw', 'wa'), base: 'wa_wells.csv',
  typeField: 'WELL_STATUS', statusField: 'HYDROCARBON_SHOW',
  lon: ['LON_4326', 'LONGITUDE'], lat: ['LAT_4326', 'LATITUDE'], datum: 'WGS84 (reprojected by the service from WA State Plane South, EPSG 2927, NAD83 HARN)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'wa_wells.csv' },
  sourceCount: r('data', 'raw', 'wa', 'source_count.json'),
  categoryOverrides: { DRILLED: 'other', COMPLETED: 'other', 'CONVERTED TO WATER WELL': 'other' },
  repairCoords: true,
};
