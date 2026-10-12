/**
 * Tennessee - one STATES entry for scripts/states.config.mjs (same schema; see docs/ADDING_A_STATE.md).
 * Data: scripts/pull_tn.py -> data/raw/tn/ (TDEC Oil_and_Gas2 MapServer layer 0, single request).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'TN', name: 'Tennessee', agency: 'Tennessee Department of Environment and Conservation (TDEC), Oil and Gas Program', short: 'TDEC',
  apiPrefix: '41', apiForm: 'full',
  raw: r('data', 'raw', 'tn'), base: 'tn_wells.csv',
  apiField: 'API', // added by the pull: 41 + the 8 digits of API_NO ("133-22884" = FIPS county + unique; "-R1" re-entry suffix dropped)
  typeField: 'PURPOSE_OF_WELL', statusField: null, // the layer has no status field
  lon: ['lon_4326', 'LONGITUDE'], lat: ['lat_4326', 'LATITUDE'],
  datum: 'WGS84 (layer geometry, Web Mercator reprojected by the server); LATITUDE/LONGITUDE attribute datum not stated by TDEC',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'tn_wells.csv' },
  sourceCount: r('data', 'raw', 'tn', 'source_count.json'),
  categoryOverrides: { 'NCG - DOMESTIC': 'gas', 'SALT WATER DISP': 'injection' },
  repairCoords: true,
  notes: 'Thin layer: 12 attributes (permit number/date, operator, well name, county, lat/long, elevation, formation at TD, purpose). No status, depth, spud/plug dates or document link. The server answers 403 to non-browser user agents; the one-time pull used a browser-style agent (disclosed in the pull log). Update cadence "extracted periodically", not stated.',
};
