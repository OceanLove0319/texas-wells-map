/**
 * Virginia (VA) - one state entry for scripts/states.config.mjs (same schema as the entries there).
 * Source: Virginia Energy, Division of Gas and Oil, DGO/DGO_wells MapServer layers 0-6 unioned and tagged
 * in SRC_LAYER (Active, Pending, Pending Modifications, Permitted Undrilled, Plugged, Waste Disposal);
 * layer 3 "Facilities Permits" (64 gathering facilities, not wells) is kept aside in
 * va_facilities_permits.csv. Pulled by scripts/pull_va.py into data/raw/va/.
 * Coordinates: LON_4326/LAT_4326 (geometry reprojected by the service from VA State Plane South, EPSG 2284,
 * NAD83, US ft; the raw FiStPlaneX/Y / ApStPlaneX/Y columns are kept). Virginia is not a PLSS state.
 *
 * Virginia has NO API numbers. Wells are keyed by the DGO file number FiNo ("BU-4401" = county letters +
 * serial). STATE_WELL_KEY = "45" + 3-digit county FIPS (TblCnName matched to the Census county file) +
 * 5-digit serial (pull_va.py), so the app's API search finds BU-4401 as 45-027-04401 and the county shard /
 * county name work. 175 wells with an old-style file number ("A24BU") have no key and are not searchable.
 * 16 file numbers appear in two layers (e.g. Active + Pending Modification): the app lists both rows.
 * Types: TblOpDesc (operation: Coal Bed, Gas, Oil, Conversion, ...; coalbed methane maps to gas);
 * status: TblPsDesc (Producing, Plugged/Abandoned, Shut In, ...).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'VA', name: 'Virginia', agency: 'Virginia Energy, Division of Gas and Oil (DGO)', short: 'VA DGO',
  apiPrefix: '45', apiForm: 'full', apiField: 'STATE_WELL_KEY',
  stateIdField: 'FiNo', // DGO file number ('BU-4401'); searchable in the app, also for the 175 rows without a key
  raw: r('data', 'raw', 'va'), base: 'va_wells.csv',
  typeField: 'TblOpDesc', statusField: 'TblPsDesc',
  lon: ['LON_4326'], lat: ['LAT_4326'], datum: 'WGS84 (reprojected by the service from VA State Plane South, EPSG 2284, NAD83 US ft)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'va_wells.csv' },
  sourceCount: r('data', 'raw', 'va', 'source_count.json'),
  categoryOverrides: {
    'COAL BED': 'gas', 'COALBED/PIPELINE': 'gas', 'HORIZONTAL COALBED': 'gas', 'HORIZONTAL COALBED W/PL': 'gas',
    'GAS/COALBED WITH PIPELINE': 'gas', 'GAS/CB DUAL COMPLETION': 'gas', 'GAS/PIPELINE': 'gas', 'HORIZONTAL GAS W/PL': 'gas',
    CONVERSION: 'other', 'CONVERSION/PIPELINE': 'other', 'CONVERSION TO WATER WELL': 'other', 'CARBON CREDIT': 'other',
    'CARBON CREDIT W/PIPELINE': 'other', PIPELINE: 'other', 'UNDERGROUND STORAGE': 'other', 'WASTE DISPOSAL': 'injection',
    'WASTE DISPOSAL W/ PL': 'injection', GEOPHYSICAL: 'other', EXPLORATORY: 'other', 'FACILITIES/PIPELINE': 'other',
  },
  repairCoords: true,
  notes: 'Keyed by DGO file number, not API (STATE_WELL_KEY = 45 + county FIPS + FiNo serial). source_count.json sums all 7 layers (10,906) including the 64 facilities that are not in the base file.',
};
