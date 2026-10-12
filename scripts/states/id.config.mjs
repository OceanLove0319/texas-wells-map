/**
 * Idaho (ID) - one state entry for scripts/states.config.mjs (same schema as the entries there).
 * Source: Idaho Geological Survey OilAndGas2023 FeatureServer/0 (DD-3 data); pulled by scripts/pull_id.py
 * into data/raw/id/. Coordinates: the layer's own LongitudeWGS84/LatitudeWGS84 (NAD27 columns kept raw).
 * No `plss` block: every well has coordinates (plssTownship/plssRange/plssSection/plssQQSection exist
 * in the file if that ever changes).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'ID', name: 'Idaho', agency: 'Idaho Geological Survey (IGS) / Idaho Oil and Gas Conservation Commission', short: 'IGS',
  apiPrefix: '11', apiForm: 'full',
  raw: r('data', 'raw', 'id'), base: 'id_wells.csv',
  typeField: 'WellType', statusField: 'WellStatus',
  lon: ['LongitudeWGS84', 'LON_4326'], lat: ['LatitudeWGS84', 'LAT_4326'], datum: 'WGS84 (per IGS; NAD27 columns also in the file)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'id_wells.csv' },
  sourceCount: r('data', 'raw', 'id', 'source_count.json'),
  categoryOverrides: { 'OIL AND GAS': 'oil' },
  repairCoords: true,
};
