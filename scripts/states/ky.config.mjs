/**
 * Kentucky - one STATES entry for scripts/states.config.mjs (same schema; see docs/ADDING_A_STATE.md).
 * Data: scripts/pull_ky.py -> data/raw/ky/ (KGS kyog_dd.zip shapefile -> ky_wells.csv).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'KY', name: 'Kentucky', agency: 'Kentucky Geological Survey (KGS)', short: 'KGS-KY',
  apiPrefix: '16', apiForm: 'full',
  raw: r('data', 'raw', 'ky'), base: 'ky_wells.csv',
  apiField: 'API', // 14 digits where assigned (about 84% of rows); the KGS record number is the stable key
  stateIdField: 'KGS_Recno', // searchable in the app for the 25,883 rows without an API
  typeField: 'Org_Result', statusField: 'Plug_Afdvt', // completion result; PA = plugging affidavit on file
  codes: r('data', 'ky_codes.json'), // parsed from ogwells.htm in the zip (move to data/ky_codes.json to commit it)
  lon: ['lon_4326', 'Rec_Lng83'], lat: ['lat_4326', 'Rec_Lat83'],
  datum: 'NAD83 (shapefile .prj GCS_North_American_1983; Rec_Lat27/Rec_Lng27 columns carry the NAD27 pair)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  // KGS rebuilds the shapefile weekly (kyog_info.txt); the date inside the zip is the data date.
  snapshot: { log: 'pull_log.jsonl', name: 'kyog_dd.shp', field: 'zip_entry_date' },
  categoryOverrides: { AB: 'plugged', IA: 'plugged' }, // abandoned without plugging record / improperly abandoned
  repairCoords: true,
  notes: 'The shapefile holds only wells with a computable Carter-coordinate location (162,164); the KGS REST layer also lists unlocated wells (194,362 total, not queried: robots.txt disallows query strings). `images` links the KGS scanned well record. No live source count was fetched for the same reason.',
};
