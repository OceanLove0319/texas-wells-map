/**
 * New Mexico - fragment for the STATES array in scripts/states.config.mjs (same schema as one entry).
 * Data: scripts/pull_nm.py -> data/raw/nm/ (EMNRD OCD, OCDView/Wells_Public FeatureServer layer 0).
 *
 * - `id` is the dashed API ("30-045-08708"); it is not one of the default API column names, hence apiField.
 * - Coordinates: lon_4326 / lat_4326 are the service geometry reprojected by the server to WGS84; the
 *   attribute latitude / longitude columns (datum per the `projection` column, 99% NAD83) are the fallback.
 *   Every row had geometry in the 2026-10-12 pull, so no PLSS grid is configured (ulstr = unit-section-
 *   township-range is still shown in the panel).
 * - Type `CO2` / `C02` are CO2 *producing* wells (Bravo Dome); they are colored as gas, not injection.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'NM', name: 'New Mexico', agency: 'New Mexico Oil Conservation Division (EMNRD OCD)', short: 'OCD',
  apiPrefix: '30', apiForm: 'full',
  raw: r('data', 'raw', 'nm'), base: 'nm_wells.csv', apiField: 'id',
  typeField: 'type', statusField: 'status',
  lon: ['lon_4326', 'longitude'], lat: ['lat_4326', 'latitude'],
  datum: 'WGS84 (service geometry, reprojected by the server from NAD83 / EPSG:4269)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'nm_wells.csv' },
  sourceCount: r('data', 'raw', 'nm', 'source_count.json'),
  categoryOverrides: { CO2: 'gas', C02: 'gas', MISCELLANEOUS: 'other' },
  repairCoords: true,
};
