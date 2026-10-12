/**
 * North Dakota - fragment for the STATES array in scripts/states.config.mjs (same schema as one entry).
 * Data: scripts/pull_nd.py -> data/raw/nd/ (NDIC Oil and Gas Division, All_Wells MapServer layer 0).
 * LOCATIONS ONLY: the public layer. Well files, scout tickets and production are behind NDIC's paid
 * subscription and were not pulled.
 *
 * - api_no ("33-043-00002-00-00") is matched by the default API column rule; `api` (14 digits) is also present.
 * - Legend type = `symbol`, NDIC's own map symbol "<status>-<type>" (A-OG, PA-OG, DRY-OG, A-SWD, ...). The
 *   layer renderer publishes no labels for these codes, so the legend shows the raw codes (no dictionary was
 *   invented). Colors come from CATEGORY_OVERRIDES below, built from the status and type parts:
 *     status PA / PANF / PNS / AB -> plugged, DRY -> dry, permit / location / cancelled / expired / drilling /
 *     confidential -> other; otherwise by type: OG -> oil, GAS* / CBM -> gas, SWD / WI / AI / GI / CO2I / CO2S /
 *     SFI / INJP / MWUI / AGD -> injection, ST / WS / GS / DF / DFP / NJ -> other.
 *   The status meanings (A active, PA plugged and abandoned, PNC permit now cancelled, IA inactive, AB abandoned,
 *   LOC location, DRL drilling, TA temporarily abandoned, EXP expired) follow NDIC's GIS legend conventions and
 *   were not verified against a published dictionary.
 * - Coordinates: lon_4326 / lat_4326 are the service geometry (Web Mercator, reprojected by the server to WGS84);
 *   the attribute latitude / longitude columns (datum not stated by NDIC) are the fallback. Every row had geometry
 *   in the 2026-10-12 pull, so no PLSS grid is configured (twp / rng / sec / qq are shown in the panel).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

const STATUSES = ['A', 'PA', 'DRY', 'PNC', 'IA', 'IAW', 'CONFIDENTIAL', 'AB', 'LOC', 'LOCR', 'DRL', 'TA', 'TAO', 'TAI', 'TASC', 'TATD', 'EXP', 'PANF', 'PNS', 'NC', 'NCW', 'NJ'];
const TYPES = {
  OG: 'oil', GASD: 'gas', GASC: 'gas', GASN: 'gas', CBM: 'gas',
  SWD: 'injection', WI: 'injection', AI: 'injection', GI: 'injection', CO2I: 'injection', CO2S: 'injection',
  SFI: 'injection', INJP: 'injection', MWUI: 'injection', AGD: 'injection',
  ST: 'other', WS: 'other', GS: 'other', DF: 'other', DFP: 'other', NJ: 'other', CONFIDENTIAL: 'other',
};
const STATUS_CAT = { PA: 'plugged', PANF: 'plugged', PNS: 'plugged', AB: 'plugged', DRY: 'dry',
  PNC: 'other', LOC: 'other', LOCR: 'other', DRL: 'other', EXP: 'other', NC: 'other', NCW: 'other', NJ: 'other', CONFIDENTIAL: 'other' };
const CATEGORY_OVERRIDES = {};
for (const s of STATUSES) for (const [t, cat] of Object.entries(TYPES)) CATEGORY_OVERRIDES[`${s}-${t}`] = STATUS_CAT[s] || cat;

export default {
  id: 'ND', name: 'North Dakota', agency: 'North Dakota Industrial Commission, Oil and Gas Division (NDIC DMR)', short: 'NDIC',
  apiPrefix: '33', apiForm: 'full',
  raw: r('data', 'raw', 'nd'), base: 'nd_wells.csv',
  typeField: 'symbol', statusField: 'status',
  lon: ['lon_4326', 'longitude'], lat: ['lat_4326', 'latitude'],
  datum: 'WGS84 (service geometry, reprojected by the server from Web Mercator / EPSG:3857)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well (public location record)',
  snapshot: { log: 'pull_log.jsonl', name: 'nd_wells.csv' },
  sourceCount: r('data', 'raw', 'nd', 'source_count.json'),
  categoryOverrides: CATEGORY_OVERRIDES,
  repairCoords: true,
};
