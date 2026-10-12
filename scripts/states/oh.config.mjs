/**
 * Ohio - one STATES entry for scripts/states.config.mjs (same schema; see docs/ADDING_A_STATE.md).
 * Data: scripts/pull_oh.py -> data/raw/oh/ (ODNR Oilgas_Wells_public layer 0 + ogwells_offline companion layer).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'OH', name: 'Ohio', agency: 'Ohio Department of Natural Resources (ODNR), Division of Oil and Gas Resources Management', short: 'ODNR',
  apiPrefix: '34', apiForm: 'full',
  raw: r('data', 'raw', 'oh'), base: 'oh_wells.csv',
  apiField: 'API_WELLNO', // 14 digits: 34 + FIPS county + unique + suffixes
  typeField: 'MapSymbol_DESC', statusField: 'WL_STATUS_DESC',
  lon: ['lon_4326', 'WH_LONG'], lat: ['lat_4326', 'WH_LAT'], // wellhead; BH_*/TOE_*/HEEL_* columns stay in the panel
  datum: 'WGS84 (layer geometry, Web Mercator reprojected by the server); WH_LAT/WH_LONG attribute datum not stated (TOE/HEEL columns are NAD83)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({ 'oh_offline.csv': 'Permit / depth record (ogwells_offline)' }),
  baseName: 'Well',
  // Live service, no bulk file: the data date is the pull date.
  snapshot: { log: 'pull_log.jsonl', name: 'oh_wells.csv' },
  sourceCount: r('data', 'raw', 'oh', 'source_count.json'),
  // map symbols where the shared text rules would guess wrong ("oil show" on a gas well; "coalbed methane" has no "gas")
  categoryOverrides: { 'GAS WITH OIL SHOW': 'gas', 'GAS AND OIL SHOW': 'gas', 'GAS SHOW': 'gas', 'COALBED METHANE': 'gas' },
  repairCoords: true,
  notes: 'Robots.txt is "Disallow: /"; one approved polite pull. Companion oh_offline.csv (ogwells_offline FeatureServer) adds TOTAL_DEPTH and permit/completion/plug dates, joined on API. No document URL field (API_WELLNO_LINK is the key for the RBDMS Well Locator). Update cadence not published.',
};
