/**
 * Indiana (IN) - one state entry for scripts/states.config.mjs (same schema as the entries there).
 * Source: Indiana DNR Division of Oil and Gas, Hosted/OilAndGasWells FeatureServer/0 on gisdata.in.gov;
 * pulled by scripts/pull_in.py into data/raw/in/. Coordinates: LON_4326/LAT_4326 (geometry reprojected by
 * the service; utmx/utmy UTM 16N kept raw). 1,838 wells have no coordinates; the layer's twp_direction,
 * rng_direction and land_number (section) columns are EMPTY for every row, so they cannot be placed from
 * PLSS and no BLM grid was pulled (no `plss` block).
 *
 * Indiana has NO API numbers. Wells are keyed by the Indiana Geological Survey id (igs_id, unique for all
 * 78,257 rows; permit_number is blank in this layer). STATE_WELL_KEY = "13" + igs_id zero-padded to 8
 * digits (pull_in.py), so the app's API search finds IGS well 13 as 13-000-00013 or 1300000013. Digits 3-5
 * of that key are NOT a county code: all Indiana wells land in one "county" shard and the county name
 * lookup is blank (the `county` column carries the real county name).
 * Attributes are thin (no type, operator mostly blank, no dates or depth); the legend type is `status`.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'IN', name: 'Indiana', agency: 'Indiana Department of Natural Resources, Division of Oil and Gas', short: 'IN DNR',
  apiPrefix: '13', apiForm: 'full', apiField: 'STATE_WELL_KEY',
  stateIdField: 'igs_id', countyFromApi: false, countyField: 'county', // key digits 3-5 are not a county code
  raw: r('data', 'raw', 'in'), base: 'in_wells.csv',
  typeField: 'status', statusField: null,
  lon: ['LON_4326'], lat: ['LAT_4326'], datum: 'WGS84 (reprojected by the service; utmx/utmy are UTM 16N, datum not stated)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'in_wells.csv' },
  sourceCount: r('data', 'raw', 'in', 'source_count.json'),
  // DNR status abbreviations: Prsmd Plggd = presumed plugged, (I) = inactive, Inadqtly Plggd = inadequately plugged,
  // RevInj NPaS&FV = revoked injection (reading unverified), TA = temporarily abandoned.
  categoryOverrides: {
    'PRSMD PLGGD': 'plugged', 'PRSMD PLGGD(I)': 'plugged', 'PRSMD PLGGD (I)': 'plugged', 'PLUGD & ABANDND': 'plugged', 'INADQTLY PLGGD': 'plugged',
    ACTIVE: 'other', EXPIRED: 'other', ORPHANED: 'other', REVOKED: 'other', INACTIVE: 'other', 'OTHER INACTIVE': 'other',
    'NOT DRILLED': 'other', CANCELLED: 'other', DRILLING: 'other', 'REVINJ NPAS&FV': 'injection',
  },
  repairCoords: true,
  notes: 'Keyed by IGS id, not API (STATE_WELL_KEY = 13 + 8-digit igs_id). The richer IGWS PDMS database was not used (access tiers unverified).',
};
