/**
 * Montana - fragment for the STATES array in scripts/states.config.mjs (same schema as one entry).
 * Data: scripts/pull_mt.py -> data/raw/mt/ (DNRC Board of Oil and Gas Conservation, BOG/DataMiner layer 11).
 *
 * - API_WellNo is the 14-digit API ("25001050000000"); not a default API column name, hence apiField.
 * - Legend type = MapSymbol, the regulator's own map symbol (ADH = "P&A Dry Hole", OIL = "Producing Oil", ...).
 *   The labels come from the layer's renderer and are saved by the pull script as mt_codes.json
 *   (data/raw/mt/; the integration step may move it to data/mt_codes.json, which is where the docs put
 *   code dictionaries). The descriptive `Type` and `Status` columns stay in the panel; Status is the legend status.
 * - Coordinates exist only as geometry (server-reprojected to WGS84). Every row had geometry in the 2026-10-12
 *   pull, so no PLSS grid is configured; the PLSS columns (Wh_Twpn/Wh_Twpd/Wh_RngN/Wh_RngD/Wh_Sec/Wh_Qtr) are shown.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'MT', name: 'Montana', agency: 'Montana Board of Oil and Gas Conservation (DNRC BOGC)', short: 'BOGC',
  apiPrefix: '25', apiForm: 'full',
  raw: r('data', 'raw', 'mt'), base: 'mt_wells.csv', apiField: 'API_WellNo',
  typeField: 'MapSymbol', statusField: 'Status', codes: r('data', 'mt_codes.json'),
  lon: ['lon_4326'], lat: ['lat_4326'],
  datum: 'WGS84 (service geometry, reprojected by the server from NAD83 / EPSG:4269)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'mt_wells.csv' },
  sourceCount: r('data', 'raw', 'mt', 'source_count.json'),
  // NONE = "Expired, Not Released Oil" (a permit, not an oil well). DH, AWW and UN are not in the renderer:
  // DH follows ADH (dry hole), AWW follows the A- = P&A pattern (P&A domestic water), UN is unknown.
  categoryOverrides: { NONE: 'other', DIP: 'other', DH: 'dry', AWW: 'plugged', UN: 'other', LOC: 'other' },
  repairCoords: true,
};
