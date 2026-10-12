/**
 * Louisiana (Office of Conservation, SONRIS GIS) - one STATES entry for scripts/states.config.mjs.
 * Pull: scripts/pull_la.py -> data/raw/la/ (SONRIS has no bulk file; the MapServer was paged once, politely).
 * Updated nightly by the regulator (GIS_UPD_DATE); this is a one-time snapshot.
 */
import path from 'node:path';
import { ROOT } from './_shared.mjs';

const r = (...p) => path.join(ROOT, ...p);

const STATE = {
  id: 'LA', name: 'Louisiana', agency: 'Louisiana Office of Conservation (SONRIS)', short: 'SONRIS',
  apiPrefix: '17', apiForm: 'full',
  raw: r('data', 'raw', 'la'), base: 'la_wells.csv',
  apiField: 'API_NUM', // 14-digit API with the state code 17 (about 850 rows carry a junk 0-13 digit value)
  stateIdField: 'WELL_SERIAL_NUM', // SONRIS well serial number; searchable for the 16,596 rows without a full API
  // SONRIS has no well-type field, only PRODUCT_TYPE_CODE (00/10/20/25) and WELL_STATUS_CODE. TYPE_GROUP is
  // added by the pull script (documented there): product label for product-bearing statuses, status group
  // (plugged and abandoned, dry and plugged, injection, permit, ...) otherwise. Raw codes stay in the row.
  typeField: 'TYPE_GROUP', statusField: 'WELL_STATUS_CODE',
  // la_codes.json: WELL_STATUS_CODE / PRODUCT_TYPE_CODE / WELL_CLASS_TYPE_CODE / LEGEND labels from SONRIS's own
  // map-legend renderer, product codes cross-checked with the Office of Conservation data-entry guides.
  codes: r('data', 'la_codes.json'),
  lon: ['lon_4326', 'SURFACE_LONG_DEC_DEG'], lat: ['lat_4326', 'SURFACE_LAT_DEC_DEG'],
  datum: 'NAD83 (SONRIS decimal degrees; service UTM 15N reprojected to WGS84 by the server)',
  counties: { code: 'COUNTY', name: 'NAME' }, // parishes; API digits 3-5 are the FIPS parish code
  layerNames: () => ({ 'la_bottom_holes.csv': 'Bottom Hole / Bore', 'la_injection_wells.csv': 'Injection Well (UIC)' }),
  baseName: 'Well',
  // Data date = newest GIS_UPD_DATE in the pulled rows (SONRIS updates the layer nightly).
  snapshot: { log: 'pull_log.jsonl', name: 'la_wells.csv', field: 'gis_upd_date' },
  sourceCount: r('data', 'raw', 'la', 'source_count.json'),
  // "DRY GAS" is a gas product, not a dry hole; "NO PRODUCT SPECIFIED" has no product (purple family).
  categoryOverrides: { 'DRY GAS': 'gas', 'NO PRODUCT SPECIFIED': 'other', 'VIRTUAL/BAD DATA': 'other', 'INJECTION (UIC)': 'injection', 'PLUGGED BACK - NO PERFORATIONS': 'plugged' },
  // No plss: every SONRIS row has surface coordinates, and Louisiana is not a PLSS state statewide.
  repairCoords: true,
  note: 'SONRIS updates the layer nightly; this is a one-time snapshot. HYPERLINK opens the SONRIS well profile, DOC_ACCESS the document search for the well serial number.',
};
export default STATE;
export { STATE };
