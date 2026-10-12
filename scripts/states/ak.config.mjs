/**
 * Alaska (AK) - one state entry for scripts/states.config.mjs (same schema as the entries there).
 * Source: AOGCC AOGCC_SQL_Test MapServer (the service is named "Test" and may change): six "Surface Hole"
 * point layers (Exploration, Development, Service Injection, Service Disposal, Gas Storage, Geothermal),
 * all pulled by scripts/pull_ak.py into data/raw/ak/ and tagged in SRC_LAYER. The bulk Data Miner page is
 * bot-walled and was not used; attributes are thin (API, name, class, status, permit).
 * Coordinates: Longitude/Latitude columns (service EPSG 4326; the AOGCC site calls its coordinates NAD27,
 * unverified). No PLSS columns in the source, so no `plss` block (every row has coordinates).
 * One well has one row per surface-hole layer it appears in and per wellbore (API suffix -90-00 etc.);
 * the canonical 10-digit API therefore repeats across rows.
 * Types: WellStatus codes (1-OIL, 1-GAS, P&A, WAGIN, 1WINJ, ...); status grouping: MapWellClass (= layer).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'AK', name: 'Alaska', agency: 'Alaska Oil and Gas Conservation Commission (AOGCC)', short: 'AOGCC',
  apiPrefix: '50', apiForm: 'full',
  raw: r('data', 'raw', 'ak'), base: 'ak_wells.csv',
  typeField: 'WellStatus', statusField: 'MapWellClass',
  lon: ['Longitude', 'LON_4326'], lat: ['Latitude', 'LAT_4326'], datum: 'WGS84 per the service (EPSG 4326); AOGCC site says NAD27 - unverified',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Surface hole',
  snapshot: { log: 'pull_log.jsonl', name: 'ak_wells.csv' },
  sourceCount: r('data', 'raw', 'ak', 'source_count.json'),
  // AOGCC status codes: WAGIN water-alternating-gas injection, 1WINJ/1GINJ/2WINJ/1WIN2S water/gas injectors,
  // WDSP* waste disposal, WTRSP water supply, OBSW observation, GSTOR gas storage, SUSP suspended, SI shut in,
  // ADMA administratively abandoned, CO-2O/CO-3O commingled oil (reading of the code unverified).
  categoryOverrides: {
    WAGIN: 'injection', '1WINJ': 'injection', '1GINJ': 'injection', '2WINJ': 'injection', '1WIN2S': 'injection',
    WDSP1: 'injection', WDSP2: 'injection', WDSP12: 'injection',
    'CO-2O': 'oil', 'CO-3O': 'oil', '1G-GS': 'other', '2G-GS': 'other', GSTOR: 'other', OBSW: 'other', WTRSP: 'other',
    SUSP: 'other', SI: 'other', ADMA: 'other', UN: 'other', INFO: 'other', GEOTH: 'other', SPLUG: 'plugged',
  },
  repairCoords: true,
};
