/**
 * Texas (TX) - Railroad Commission of Texas (RRC) public GIS, nine layers pulled by scripts/01_layers.py ..
 * 05_report.py into data/raw/ (the original source of this app). The RRC API is the 8-digit county+unique
 * form without the 42 state code (apiForm 'county8'); about 26% of rows carry a county-only 3-digit value.
 */
import { r, layerNamesFromSummary, snapshotFromReport } from './_shared.mjs';

export default {
  id: 'TX', name: 'Texas', agency: 'Railroad Commission of Texas (RRC)', short: 'RRC',
  apiPrefix: '42', apiForm: 'county8',
  raw: r('data', 'raw'), base: 'wells.csv',
  typeField: 'GIS_SYMBOL_DESCRIPTION', statusField: null,
  lon: ['lon_4326', 'GIS_LONG83', 'GIS_LONG27'], lat: ['lat_4326', 'GIS_LAT83', 'GIS_LAT27'], datum: 'WGS84',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => layerNamesFromSummary(r('data', 'layers_summary.md')),
  baseName: 'Well Locations',
  snapshot: () => snapshotFromReport(r('data', 'snapshot_report.md')),
  repairCoords: true,
  note: 'Nine RRC GIS layers. About 26% of rows have only a 3-digit county code instead of a full API and never get API-joined records.',
};
