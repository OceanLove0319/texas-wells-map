/**
 * Florida (FL) - one state entry for scripts/states.config.mjs (same schema as the entries there).
 * Source: Florida DEP OpenData/OIL_WELLS MapServer/0 "Permitted Oil and Gas Wells"; pulled by
 * scripts/pull_fl.py into data/raw/fl/. Coordinates: the layer's LONGITUDE/LATITUDE columns (datum not
 * stated), then LON_4326/LAT_4326 (geometry reprojected by the service from FL GDL Albers, EPSG 6439).
 * DOCUMENTS (DEP Nexus well file) and LOCATION (MapDirect) are URLs, shown as links by the app.
 * STR ("S19 T23S R18E") + QSEC are kept raw; every well has coordinates, so no `plss` block.
 * Types: CURRENT_STATUS mixes type and status (PROD, DRY HOLE/P&A, SWD, ...); HISTORICAL_STATUS is the
 * status grouping. Florida production is oil, so PROD maps to the oil category.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'FL', name: 'Florida', agency: 'Florida Department of Environmental Protection (FDEP), Oil and Gas Program', short: 'FDEP',
  apiPrefix: '09', apiForm: 'full', apiField: 'API_NO',
  raw: r('data', 'raw', 'fl'), base: 'fl_wells.csv',
  typeField: 'CURRENT_STATUS', statusField: 'HISTORICAL_STATUS',
  lon: ['LONGITUDE', 'LON_4326'], lat: ['LATITUDE', 'LAT_4326'], datum: 'not stated by FDEP (lat/long columns; geometry is NAD83(2011) Albers)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'fl_wells.csv' },
  sourceCount: r('data', 'raw', 'fl', 'source_count.json'),
  categoryOverrides: { PROD: 'oil', 'PROD/TA': 'oil', 'N/D': 'other', JUNKED: 'other', 'ANODE WELL': 'other', PENDING: 'other', EXPIRED: 'other', DENIED: 'other', 'PERMIT SURRENDERED': 'other', DRILLING: 'other' },
  repairCoords: true,
};
