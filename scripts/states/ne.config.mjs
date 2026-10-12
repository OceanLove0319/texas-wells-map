/**
 * Nebraska - fragment for the STATES array in scripts/states.config.mjs (same schema as one entry).
 * Data: scripts/pull_ne.py -> data/raw/ne/ (NOGCC NebraskaWellData.zip, Access table tblNebraskaWellData,
 * exported with mdbtools; WFS NOGCC:NEWells coordinates joined on API_WellNo as WFS_Longitude / WFS_Latitude).
 *
 * - API_WellNo is the 14-digit API ("26049211690000"); the pull script appends a copy named API so the default
 *   API column rule matches (apiField is set anyway).
 * - Legend type = Well_Typ, status = Wl_Status (NOGCC codes, no dictionary in the .mdb). Overrides cover the
 *   unambiguous codes: DH dry hole, OIL, GAS, EOR / SWD / GIW injection, GST gas storage, WS water supply,
 *   ST stratigraphic test, EX expired permit, GEO geothermal. JA, CI, SO are not guessed and fall to "other".
 * - Coordinates: Wh_Lat / Wh_Long from the .mdb (datum not stated there), with the WFS point as fallback. The
 *   WFS serves the same values (max difference 7e-9 degrees) as EPSG:4269, so NAD83 is recorded. Every row had
 *   coordinates in the 2026-10-12 pull, so no PLSS grid is configured (Wh_Twpn/Wh_Twpd/Wh_RngN/Wh_RngD/Wh_Sec/
 *   Wh_Qtr are shown in the panel).
 * - The .mdb is refreshed irregularly (this one is dated 2026-06-04); the zip entry date is the data date.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'NE', name: 'Nebraska', agency: 'Nebraska Oil and Gas Conservation Commission (NOGCC)', short: 'NOGCC',
  apiPrefix: '26', apiForm: 'full',
  raw: r('data', 'raw', 'ne'), base: 'ne_wells.csv', apiField: 'API_WellNo',
  typeField: 'Well_Typ', statusField: 'Wl_Status',
  lon: ['Wh_Long', 'WFS_Longitude'], lat: ['Wh_Lat', 'WFS_Latitude'],
  datum: 'NAD83 (the .mdb states no datum; identical values are served by the NOGCC WFS as EPSG:4269)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'ne_wells.csv', field: 'zip_entry_date' },
  sourceCount: r('data', 'raw', 'ne', 'source_count.json'),
  categoryOverrides: {
    DH: 'dry', OIL: 'oil', GAS: 'gas', EOR: 'injection', SWD: 'injection', GIW: 'injection',
    GST: 'other', WS: 'other', ST: 'other', EX: 'other', GEO: 'other',
  },
  repairCoords: true,
};
