/**
 * Alabama (State Oil and Gas Board of Alabama, OGB) - one STATES entry for scripts/states.config.mjs.
 * Pull: scripts/pull_al.py -> data/raw/al/. Base = OGB MapServer layer 3 "WebWell Search Layer" (the complete
 * list; layer 2 "Wells" omits the directionally drilled wells).
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './_shared.mjs';

const r = (...p) => path.join(ROOT, ...p);
const int = (v) => { const n = parseInt(String(v ?? '').trim(), 10); return Number.isFinite(n) && n > 0 ? n : null; };
const trDir = (num, dir, ok) => { const n = int(num); const d = String(dir ?? '').trim().toUpperCase().charAt(0); return n && ok.includes(d) ? { n, dir: d } : null; };

/** County -> CadNSDI meridian learned from wells with coordinates (pull_al.py); blank = infer from the grid. */
const MERIDIAN_FILE = r('data', 'al_county_meridians.json');
let countyMeridian = null;
const meridianOfCounty = (county) => {
  if (!countyMeridian) {
    countyMeridian = {};
    if (fs.existsSync(MERIDIAN_FILE)) for (const [c, v] of Object.entries(JSON.parse(fs.readFileSync(MERIDIAN_FILE, 'utf8')).counties)) if (v.meridian) countyMeridian[c] = v.meridian;
  }
  return countyMeridian[String(county ?? '').trim().toUpperCase()] || '';
};

const STATE = {
  id: 'AL', name: 'Alabama', agency: 'State Oil and Gas Board of Alabama (OGB, Geological Survey of Alabama)', short: 'OGB',
  apiPrefix: '01', apiForm: 'full',
  raw: r('data', 'raw', 'al'), base: 'al_wells.csv',
  apiField: 'API', // "01-097-20351-00-00"
  typeField: 'WellType', statusField: 'WellStatus', codes: r('data', 'al_codes.json'),
  lon: ['lon_4326', 'Longitude'], lat: ['lat_4326', 'Latitude'],
  datum: 'WGS84 (service geometry, Web Mercator reprojected by the server; attribute Latitude/Longitude identical, datum not stated by OGB)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({ 'al_surface_locations.csv': 'Surface Location (directional well)', 'al_bhl_locations.csv': 'Bottom-Hole Location' }),
  baseName: 'Well',
  // The service's last_edited_date is unusable (thousands of rows are dated after the pull), so the data date is the pull date.
  snapshot: { log: 'pull_log.jsonl', name: 'al_wells.csv' },
  sourceCount: r('data', 'raw', 'al', 'source_count.json'),
  categoryOverrides: { CM: 'gas', UN: 'other' }, // CM = coal bed methane (the shared rules only know 'CBM')
  plss: {
    // CadNSDI meridian codes in the BLM grid for Alabama: 16 Huntsville (north), 25 St. Stephens (south), 29 Tallahassee (FL-line sliver).
    meridians: { 16: '16', 25: '25', 29: '29' },
    meridian: (g) => meridianOfCounty(g('CountyName')),
    township: (g) => trDir(g('Township'), g('TownshipDir'), 'NS'),
    range: (g) => trDir(g('Range'), g('RangeDir'), 'EW'),
    section: (g) => int(g('SecNum')),
    quarters: () => [], // DrillingUnitDescription is free text ("N/2 NE/4", "unitized"), not a reliable call
  },
  repairCoords: true,
  note: 'Update cadence of the OGB map service is not published; the service\'s edit dates are unreliable (many rows dated after the pull), so the header shows the pull date.',
};
export default STATE;
export { STATE };
