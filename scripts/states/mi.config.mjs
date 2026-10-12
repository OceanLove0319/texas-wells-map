/**
 * Michigan (MI) - one state entry for scripts/states.config.mjs (same schema as the entries there).
 * Source: EGLE GrmdOpenData MapServer/10 "Oil, Gas, and Mineral Well Surface Hole Locations"; pulled by
 * scripts/pull_mi.py into data/raw/mi/. Coordinates: the layer's X/Y columns (WGS84 lon/lat, identical
 * to the reprojected geometry in LON_4326/LAT_4326). API: api_num (14 digits, 21 + county + serial +
 * sidetrack/completion); the canonical 10-digit API repeats for sidetracks and recompletions.
 * TRS ("27N-8E-15") and QS/QQS/QQQS are kept raw; every row has coordinates, so no BLM grid was pulled
 * and there is no `plss` block (Michigan Meridian would be the single meridian).
 * Types: WellType (23 EGLE descriptions; well_type is the code); status: WellStatus.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'MI', name: 'Michigan', agency: 'Michigan EGLE, Oil, Gas, and Minerals Division', short: 'EGLE',
  apiPrefix: '21', apiForm: 'full', apiField: 'api_num',
  raw: r('data', 'raw', 'mi'), base: 'mi_wells.csv',
  typeField: 'WellType', statusField: 'WellStatus',
  lon: ['X', 'LON_4326'], lat: ['Y', 'LAT_4326'], datum: 'WGS84 (per EGLE X/Y columns)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Surface hole',
  snapshot: { log: 'pull_log.jsonl', name: 'mi_wells.csv' },
  sourceCount: r('data', 'raw', 'mi', 'source_count.json'),
  // "Part 625" wells are mineral (brine / solution mining / test) wells under Michigan's Part 625, not oil and gas.
  categoryOverrides: { 'GAS PRODUCTION AND BRINE DISPOSAL WELL': 'gas', 'LOST HOLE': 'other', 'NOT AVAILABLE': 'other' },
  repairCoords: true,
};
