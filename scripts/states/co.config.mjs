/**
 * Colorado - fragment for the STATES array in scripts/states.config.mjs (same schema as one entry).
 * Data: scripts/pull_co.py -> data/raw/co/ (ECMC, formerly COGCC, daily WELLS_SHP.ZIP shapefile).
 *
 * - API_Label is the dashed full API ("05-123-16872"); API is the 8-digit county+sequence (the key ECMC's
 *   facility pages use; docs_url is built from it). apiField picks the full one.
 * - Legend type = Well_Class (ECMC codes, no dictionary published with the file): GW gas, OW oil, DA dry and
 *   abandoned, LO location (permit only), CBM coalbed methane, ERI enhanced-recovery injection, DSP disposal,
 *   STO storage, OBW observation, CO2 (CO2 producers: McElmo Dome, Sheep Mountain), DM domestic gas,
 *   CLA Class (UIC) injection, STR stratigraphic, HE helium, OTH other, GEO geothermal. Category colors come
 *   from the overrides below; code meanings follow ECMC's COGIS conventions and were not verified against a
 *   published dictionary. Status = Facil_Stat (PA, PR, AL, SI, TA, AP, IJ, EP, AC, WO, DG, SO).
 * - Coordinates: lon_4326 / lat_4326 converted by the pull script from the .shp UTM 13N (NAD83) points; the
 *   attribute Latitude / Longitude columns (NAD83, agree within 1 m) are the fallback. Every row had geometry
 *   in the 2026-10-12 pull, so no PLSS grid is configured (Qtr_Qtr / Section / Township / Range / Meridian are
 *   shown in the panel).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'CO', name: 'Colorado', agency: 'Colorado Energy & Carbon Management Commission (ECMC)', short: 'ECMC',
  apiPrefix: '05', apiForm: 'full',
  raw: r('data', 'raw', 'co'), base: 'co_wells.csv', apiField: 'API_Label',
  typeField: 'Well_Class', statusField: 'Facil_Stat',
  lon: ['lon_4326', 'Longitude'], lat: ['lat_4326', 'Latitude'],
  datum: 'NAD83 (converted from NAD83 UTM zone 13N shapefile geometry; about 1 m from WGS84)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  // The zip is rebuilt daily; the date of the .dbf inside the zip is the data date.
  snapshot: { log: 'pull_log.jsonl', name: 'co_wells.csv', field: 'zip_entry_date' },
  sourceCount: null, // the daily file is the source; ECMC publishes no separate live count
  categoryOverrides: {
    GW: 'gas', OW: 'oil', DA: 'dry', LO: 'other', CBM: 'gas', ERI: 'injection', DSP: 'injection', STO: 'other',
    OBW: 'other', CO2: 'gas', DM: 'gas', CLA: 'injection', STR: 'other', HE: 'other', OTH: 'other', GEO: 'other', '': 'other',
  },
  repairCoords: true,
};
