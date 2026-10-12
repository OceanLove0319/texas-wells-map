/**
 * Arkansas (AOGC) - one STATES entry for scripts/states.config.mjs (same schema; see docs/ADDING_A_STATE.md).
 * Pull: scripts/pull_ar.py -> data/raw/ar/. Source: AOGC well data hosted by the Arkansas GIS Office
 * (FEATURESERVICES/Utilities/FeatureServer/5). Snapshot of AOGC's database; AGOL item modified 2026-07-21.
 */
import path from 'node:path';
import { ROOT } from './_shared.mjs';

const r = (...p) => path.join(ROOT, ...p);
const int = (v) => { const n = parseInt(String(v ?? '').trim(), 10); return Number.isFinite(n) && n > 0 ? n : null; };
/** number column + direction column ("16", "South") -> { n: 16, dir: 'S' } */
const trDir = (num, dir, ok) => { const n = int(num); const d = String(dir ?? '').trim().toUpperCase().charAt(0); return n && ok.includes(d) ? { n, dir: d } : null; };
const QUARTER = { NORTHEAST: 'NE', NORTHWEST: 'NW', SOUTHEAST: 'SE', SOUTHWEST: 'SW' };

const STATE = {
  id: 'AR', name: 'Arkansas', agency: 'Arkansas Oil and Gas Commission (AOGC), via Arkansas GIS Office', short: 'AOGC',
  apiPrefix: '03', apiForm: 'full',
  raw: r('data', 'raw', 'ar'), base: 'ar_wells.csv',
  // API is added by the pull script: wellid (9 digits, API without its leading zero) -> "03-139-81092".
  apiField: 'API',
  typeField: 'welltype', statusField: 'wellstatus', codes: r('data', 'ar_codes.json'),
  // Service geometry (NAD83 UTM 15N, reprojected to WGS84 by the server); the attribute columns are identical.
  lon: ['lon_4326', 'coordinates_longitude'], lat: ['lat_4326', 'coordinates_latitude'],
  datum: 'NAD83 (service UTM 15N, reprojected to WGS84 by the server; attribute lat/long identical)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'ar_wells.csv', field: 'item_modified' },
  sourceCount: r('data', 'raw', 'ar', 'source_count.json'),
  // "GAS - Natural Gas - Dry" would otherwise hit the dry-hole rule; these are gas wells.
  categoryOverrides: { GAS: 'gas', ISC: 'other', UN: 'other', SEX: 'other' },
  plss: {
    // All of Arkansas is surveyed from the Fifth Principal Meridian (CadNSDI code 05).
    meridians: { '5TH': '05' },
    meridian: () => '5TH',
    township: (g) => trDir(g('township'), g('townshipdir'), 'NS'),
    range: (g) => trDir(g('range'), g('rangedir'), 'EW'),
    section: (g) => int(g('section')),
    // coordinates_q is the LARGEST call (checked against 2,755 wells with coordinates: median 0.06 km vs 0.58 km reversed).
    quarters: (g) => ['coordinates_q', 'coordinates_qq', 'coordinates_qqq'].map((f) => QUARTER[String(g(f) ?? '').trim().toUpperCase()] || ''),
  },
  repairCoords: true,
  note: 'Snapshot of AOGC\'s database published by the Arkansas GIS Office (item modified 2026-07-21). No spud/completion dates and no document links in the source.',
};
export default STATE;
export { STATE };
