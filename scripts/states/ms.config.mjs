/**
 * Mississippi (MSOGB) - one STATES entry for scripts/states.config.mjs.
 * Pull: scripts/pull_ms.py -> data/raw/ms/ (ONE approved download of the daily WellInfoList CSV; the site's
 * robots.txt disallows crawlers, so never schedule this).
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './_shared.mjs';

const r = (...p) => path.join(ROOT, ...p);
const int = (v) => { const n = parseInt(String(v ?? '').trim(), 10); return Number.isFinite(n) && n > 0 ? n : null; };
const trDir = (num, dir, ok) => { const n = int(num); const d = String(dir ?? '').trim().toUpperCase().charAt(0); return n && ok.includes(d) ? { n, dir: d } : null; };

/**
 * MSOGB gives Sec/Twn/Rng but no meridian, and Mississippi is surveyed from seven meridians. The pull
 * script derives county -> meridian from the wells that do have coordinates (data/raw/ms/ms_county_meridians.json).
 * Counties without a clear majority stay blank, and the build then uses the meridian only when exactly one
 * of the state's meridians has that township/range/section.
 */
const MERIDIAN_FILE = r('data', 'ms_county_meridians.json');
let countyMeridian = null;
const meridianOfCounty = (county) => {
  if (!countyMeridian) {
    countyMeridian = {};
    if (fs.existsSync(MERIDIAN_FILE)) for (const [c, v] of Object.entries(JSON.parse(fs.readFileSync(MERIDIAN_FILE, 'utf8')).counties)) if (v.meridian) countyMeridian[c] = v.meridian;
  }
  return countyMeridian[String(county ?? '').trim().toUpperCase()] || '';
};

const STATE = {
  id: 'MS', name: 'Mississippi', agency: 'Mississippi State Oil and Gas Board (MSOGB)', short: 'MSOGB',
  apiPrefix: '23', apiForm: 'full',
  raw: r('data', 'raw', 'ms'), base: 'ms_wells.csv',
  apiField: 'API10', // 10-digit API with the state code 23 (API14 is also a column)
  typeField: 'Type', statusField: 'Status', // values already read "CODE - Description" (e.g. "DH - Dry Hole")
  lon: ['Long(NAD83)'], lat: ['Lat(NAD83)'], datum: 'NAD83 (per MSOGB column names and the well shapefile .prj)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  // The daily file carries its date in its name (file_date in the pull log).
  snapshot: { log: 'pull_log.jsonl', name: 'ms_wells.csv', field: 'file_date' },
  sourceCount: r('data', 'raw', 'ms', 'source_count.json'),
  categoryOverrides: {},
  plss: {
    // CadNSDI meridian codes present in the BLM grid for Mississippi (PLSSID chars 3-4), checked by extent:
    // 09 Chickasaw (NE), 10 Choctaw (center), 16 Huntsville (NE corner), 25 St. Stephens (S), 32 Washington (SW),
    // 18 Louisiana (sliver west of the river), 05 Fifth Principal (sliver in the NW).
    meridians: { '05': '05', '09': '09', '10': '10', '16': '16', '18': '18', '25': '25', '32': '32' },
    meridian: (g) => meridianOfCounty(g('County')),
    township: (g) => trDir(g('Twn'), g('TwnDir'), 'NS'),
    range: (g) => trDir(g('Rng'), g('RngDir'), 'EW'),
    section: (g) => int(g('Sec')), // irregular sections > 36 (Natchez district land claims) cannot be placed
    quarters: () => [],
  },
  repairCoords: true,
  note: 'Daily MSOGB bulk file; one approved download (site robots.txt disallows crawlers). No dates in the file. DirectURL opens the MSOGB Online well page.',
};
export default STATE;
export { STATE };
