/**
 * Nevada (NV) - one state entry for scripts/states.config.mjs (same schema as the entries there).
 * Source: Nevada Division of Minerals OGHistoricData FeatureServer/1 "Oil Well Locations"; pulled by
 * scripts/pull_nv.py into data/raw/nv/. The layer is UTM zone 11 NAD83 (EPSG 26911); LON_4326/LAT_4326
 * are the server's reprojection to WGS84 (the raw UTM_Easting/UTM_Northing columns are kept).
 * No PLSS columns in the source, so no `plss` block (0 wells lack coordinates anyway).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'NV', name: 'Nevada', agency: 'Nevada Division of Minerals (NDOM)', short: 'NDOM',
  apiPrefix: '27', apiForm: 'full',
  raw: r('data', 'raw', 'nv'), base: 'nv_wells.csv',
  typeField: 'Well_Type', statusField: 'Status',
  lon: ['LON_4326'], lat: ['LAT_4326'], datum: 'WGS84 (reprojected by the service from UTM 11N NAD83, EPSG 26911)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'nv_wells.csv' },
  sourceCount: r('data', 'raw', 'nv', 'source_count.json'),
  // NDOM codes: Prod = producer (Nevada production is oil), Inj = injection, WW = water well, Strat = stratigraphic test.
  categoryOverrides: { PROD: 'oil', INJ: 'injection', WW: 'other', STRAT: 'other' },
  repairCoords: true,
};
