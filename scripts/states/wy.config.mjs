/**
 * Wyoming - fragment for the STATES array in scripts/states.config.mjs (same schema as one entry).
 * Data: scripts/pull_wy.py -> data/raw/wy/ (WOGCC RBDMS Data Explorer GeoServer, WFS layer WY_SHPS:WELL).
 * LOCATIONS ONLY: API, name, type, status and the point. Operator, dates, depth and documents live on
 * pipeline.wyo.gov, whose robots.txt disallows everything, and were not pulled.
 *
 * - WellId is the dashed API ("49-001-05001"); not a default API column name, hence apiField.
 * - Legend type = WellType (descriptive: "Oil Well", "CBM Well", ...), status = WellStatus. The short codes
 *   Type / Status / GISCode stay in the panel.
 * - Coordinates: lon_4326 / lat_4326 parsed from the_geom. The WFS 2.0 response uses the EPSG:4269 axis order
 *   (latitude first); the pull script detects and swaps it. NAD83 differs from WGS84 by about a meter.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'WY', name: 'Wyoming', agency: 'Wyoming Oil and Gas Conservation Commission (WOGCC)', short: 'WOGCC',
  apiPrefix: '49', apiForm: 'full',
  raw: r('data', 'raw', 'wy'), base: 'wy_wells.csv', apiField: 'WellId',
  typeField: 'WellType', statusField: 'WellStatus',
  lon: ['lon_4326'], lat: ['lat_4326'],
  datum: 'NAD83 (EPSG:4269 per the WFS layer CRS)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well (WFS location record)',
  snapshot: { log: 'pull_log.jsonl', name: 'wy_wells.csv' },
  sourceCount: r('data', 'raw', 'wy', 'source_count.json'),
  // UIC Class I / Class V are injection wells; "NA", "Source Well", "H2O Source", "Landowner Well" fall to other by rule.
  categoryOverrides: { 'CLASS I': 'injection', 'CLASS V': 'injection', NA: 'other' },
  repairCoords: true,
};
