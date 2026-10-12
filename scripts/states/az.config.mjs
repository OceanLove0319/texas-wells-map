/**
 * Arizona (AZ) - one state entry for scripts/states.config.mjs (same schema as the entries there).
 * Source: Arizona Oil and Gas Conservation Commission OIL_AND_GAS_WELLS_AGOL FeatureServer/0 (ArcGIS
 * Online, via the utility.arcgis.com proxy used by the official viewer); pulled by scripts/pull_az.py
 * into data/raw/az/. Coordinates: LON_4326/LAT_4326 (geometry reprojected by the service from UTM 12N
 * NAD83, EPSG 26912), falling back to the LONGITUDE/LATITUDE attribute columns (identical to 2e-5 deg).
 * WEBSITE holds the per-well document page (https://azogcc.az.gov/<permit>), shown as a link by the app.
 * TRS ("18N 24E 8 NW NW") is kept raw; only 12 wells lack coordinates, so no BLM grid was pulled and
 * there is no `plss` block.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'AZ', name: 'Arizona', agency: 'Arizona Oil and Gas Conservation Commission (AZOGCC)', short: 'AZOGCC',
  apiPrefix: '02', apiForm: 'full',
  raw: r('data', 'raw', 'az'), base: 'az_wells.csv',
  typeField: 'WELL_TYPE', statusField: 'STATUS_WELL',
  lon: ['LON_4326', 'LONGITUDE'], lat: ['LAT_4326', 'LATITUDE'], datum: 'WGS84 (reprojected by the service from UTM 12N NAD83, EPSG 26912)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'az_wells.csv' },
  sourceCount: r('data', 'raw', 'az', 'source_count.json'),
  categoryOverrides: { 'CARBON DIOXIDE (CO2)': 'other', HELIUM: 'other', 'OIL AND GAS HELIUM': 'oil', 'OIL AND GAS HELIUM - WILDCAT': 'oil' },
  repairCoords: true,
};
