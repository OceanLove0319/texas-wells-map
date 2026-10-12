/**
 * Pennsylvania - one STATES entry for scripts/states.config.mjs (same schema; see docs/ADDING_A_STATE.md).
 * Data: scripts/pull_pa.py -> data/raw/pa/ (DEP eMapPA layers 54 Conventional + 53 Unconventional, unioned).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'PA', name: 'Pennsylvania', agency: 'Pennsylvania Department of Environmental Protection (DEP), Office of Oil and Gas Management', short: 'PA DEP',
  apiPrefix: '37', apiForm: 'full',
  raw: r('data', 'raw', 'pa'), base: 'pa_wells.csv',
  apiField: 'API', // added by the pull: 37 + the 8 digits of PERMIT_NUMBER ("083-02072" = FIPS county + unique)
  stateIdField: 'PERMIT_NUMBER', // searchable for the 180 rows whose permit number is not in API form
  typeField: 'WELL_TYPE', statusField: 'WELL_STATUS', // WELL_CLASS (Conventional / Unconventional) says which layer the row came from
  lon: ['lon_4326', 'LONGITUDE'], lat: ['lat_4326', 'LATITUDE'],
  datum: 'WGS84 (layer geometry, Web Mercator reprojected by the server); LATITUDE/LONGITUDE attribute datum not stated by DEP',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  // Live service (believed refreshed nightly from eFACTS, unverified): the data date is the pull date.
  snapshot: { log: 'pull_log.jsonl', name: 'pa_wells.csv' },
  sourceCount: r('data', 'raw', 'pa', 'source_count.json'),
  categoryOverrides: { 'COALBED METHANE': 'gas' }, // no "gas" in the text, so the shared rules would say other
  repairCoords: true,
  notes: 'Both well layers share one 32-field schema; the union tags WELL_CLASS and SOURCE_LAYER. No depth field and no document link (documents live in eFACTS by SITE_ID). Layers 62 (abandoned/orphan) and 63 (historical map-digitized) were not pulled.',
};
