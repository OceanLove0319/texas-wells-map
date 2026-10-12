/**
 * California (CA) - one state entry for scripts/states.config.mjs (same schema as the entries there).
 * Source: CalGEM WellSTAR "Oil and Gas Wells", ONE statewide CSV from the CNRA Open Data hub (a cached
 * export: its Last-Modified is the data date, carried in the pull log as hub_data_date); the live
 * WellSTAR/Wells MapServer/0 count is in source_count.json. Pulled by scripts/pull_ca.py into data/raw/ca/.
 * Coordinates: Longitude/Latitude attribute columns (CalGEM does not state the datum; WellSTAR publishes
 * WGS84/NAD83). Every row has coordinates, so no BLM grid was pulled and there is no `plss` block;
 * Section/Township/Range/BaseMeridian (MD / SB / H) are kept raw for a future grid.
 * Types: WellTypeLabel (24 CalGEM types); status: WellStatus (Active / Idle / Plugged / ...).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'CA', name: 'California', agency: 'California Geologic Energy Management Division (CalGEM)', short: 'CalGEM',
  apiPrefix: '04', apiForm: 'full',
  raw: r('data', 'raw', 'ca'), base: 'ca_wells.csv',
  typeField: 'WellTypeLabel', statusField: 'WellStatus',
  lon: ['LON_4326'], lat: ['LAT_4326'], datum: 'WGS84 / NAD83 (per WellSTAR; not stated in the file)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  // The hub CSV is a cached export; its Last-Modified (hub_data_date in the pull log) is the data date.
  snapshot: { log: 'pull_log.jsonl', name: 'ca_wells.csv', field: 'hub_data_date' },
  sourceCount: r('data', 'raw', 'ca', 'source_count.json'),
  // CalGEM types the shared text rules get wrong: steam/water/pressure/UIC wells are injection, "Dry Gas" is gas.
  categoryOverrides: {
    'CYCLIC STEAM': 'oil', STEAMFLOOD: 'injection', WATERFLOOD: 'injection', 'PRESSURE MAINTENANCE': 'injection',
    'DRY GAS': 'gas', 'LIQUEFIED GAS': 'other', 'MULTI-PURPOSE': 'other',
    'EPA WELL: CLASS I': 'injection', 'EPA WELL: CLASS V': 'injection', 'EPA WELL: CLASS VI': 'injection',
  },
  repairCoords: true,
};
