/**
 * Utah - fragment for the STATES array in scripts/states.config.mjs (same schema as one entry).
 * Data: scripts/pull_ut.py -> data/raw/ut/ (DNR Division of Oil, Gas and Mining daily RBDMS exports).
 *
 * - API is the 14-digit API ("43037303950000"); matched by the default API column rule.
 * - Layers (joined by the build on the full API): ut_latlong_coordinates.csv (LatLongCoordinates.zip, one
 *   coordinate record per well) and ut_well_history.csv (WellHistory.zip: APD, spud, completion, sundry and
 *   test records, one row per work item; its WellID column is renamed API by the pull script).
 * - Legend type = welltype, status = wellstatus (DOGM codes; the read-me PDFs that define them could not be
 *   fetched, see the pull script). Overrides below cover the unambiguous codes: OW oil, OGW oil and gas,
 *   GW gas, D dry, WI water injection, WD water disposal, GI gas injection, HE helium, GS gas storage,
 *   WS water source, TW test well. Codes not listed (LI, PO, CD, OWD, GD, HS, OWI, OGI, GWD) fall to "other"
 *   rather than being guessed.
 * - Coordinates: Latitude / Longitude of Wells.csv (every row had them in the 2026-10-12 pull; they agree with
 *   LatLongCoordinates.csv). The datum is not stated in the files and the read-me was not retrieved; DOGM's
 *   data pages describe them as lat/long only, so it is recorded here as "not stated (presumably NAD83)".
 *   No PLSS grid is configured because no row lacked coordinates (Sec / Township / Range / PM / QuarterQuarter
 *   are shown in the panel).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'UT', name: 'Utah', agency: 'Utah Division of Oil, Gas and Mining (DNR DOGM)', short: 'DOGM',
  apiPrefix: '43', apiForm: 'full',
  raw: r('data', 'raw', 'ut'), base: 'ut_wells.csv',
  typeField: 'welltype', statusField: 'wellstatus',
  lon: ['Longitude'], lat: ['Latitude'],
  datum: 'not stated by DOGM (presumably NAD83; the read-me PDF could not be fetched)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({ 'ut_latlong_coordinates.csv': 'Lat/Long Coordinates', 'ut_well_history.csv': 'Well History' }),
  baseName: 'Well',
  // Wells.zip is rebuilt daily; the date of Wells.csv inside the zip is the data date.
  snapshot: { log: 'pull_log.jsonl', name: 'ut_wells.csv', field: 'zip_entry_date' },
  sourceCount: r('data', 'raw', 'ut', 'source_count.json'),
  categoryOverrides: {
    OW: 'oil', OGW: 'oil', GW: 'gas', D: 'dry', WI: 'injection', WD: 'injection', GI: 'injection',
    HE: 'other', GS: 'other', WS: 'other', TW: 'other',
  },
  repairCoords: true,
};
