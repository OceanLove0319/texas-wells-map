/**
 * Oregon (OR) - one state entry for scripts/states.config.mjs (same schema as the entries there).
 *
 * DATA LAST UPDATED 2021: the only statewide source is DOGAMI's static spreadsheet
 * OG_Permits_01-29-2021.xls (no REST service exists); pulled by scripts/pull_or.py into data/raw/or/.
 * The header date is taken from the pull log's `data_date` field (2021-01-29), not the pull date.
 *
 * Oregon has NO API numbers in this file. Wells are keyed by the DOGAMI PermitID, which is written in
 * API form (36 + 3-digit county + 5-digit serial, e.g. "36-009-00015", some with a "-01" sidetrack
 * suffix), so the app's API search works with it (36-009-00015). It is a permit id, not a verified API.
 * 8 offshore permits use prefix 56 and 5 ids end in a letter ("36-011-0000A"): those are not searchable.
 * Coordinates: Longitude/Latitude columns (datum not stated). 2 wells lack coordinates and PLSS: no `plss`.
 * Oregon's only production is gas (Mist field), so "Producer" maps to the gas category.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'OR', name: 'Oregon', agency: 'Oregon Department of Geology and Mineral Industries (DOGAMI), MLRR', short: 'DOGAMI',
  apiPrefix: '36', apiForm: 'full', apiField: 'PermitID',
  stateIdField: 'PermitID', // also searchable as text (ids ending in a letter are not API-like)
  raw: r('data', 'raw', 'or'), base: 'or_wells.csv',
  typeField: 'WellType', statusField: 'Status',
  lon: ['LON_4326'], lat: ['LAT_4326'], datum: 'not stated by DOGAMI (decimal degrees)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Permit (data last updated 2021-01-29)',
  // The spreadsheet is dated 2021-01-29 (file name and DOGAMI page); the pull log carries it as data_date.
  snapshot: { log: 'pull_log.jsonl', name: 'or_wells.csv', field: 'data_date' },
  sourceCount: r('data', 'raw', 'or', 'source_count.json'),
  categoryOverrides: { PRODUCER: 'gas', 'FORMER PRODUCER - PLUGGED': 'plugged', 'NEVER PRODUCED - PLUGGED': 'plugged', EXPLORATION: 'other', INFORMATION: 'other', 'NOT DRILLED': 'other', TEST: 'other' },
  repairCoords: true,
};
