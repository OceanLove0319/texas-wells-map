/**
 * South Dakota - fragment for the STATES array in scripts/states.config.mjs (same schema as one entry).
 * Data: scripts/pull_sd.py -> data/raw/sd/ (DANR Oil & Gas / SD Geological Survey SDOILexport.zip, Wells.xlsx).
 *
 * - "API Number" ("40 003 05001", 139 rows with a 2-digit suffix) is renamed API by the pull script so the
 *   build's API-column rule matches the base file and the layers alike.
 * - Layers (joined on the full API): sd_well_completions.csv (Well_Completions.xlsx: wellbore type, depths,
 *   producing interval) and sd_formation_tops.csv (Formation_Tops.xlsx: one row per formation top).
 * - Legend type = "Current Well Type" (descriptive: Dry Hole, Oil, Gas, Water Injection, Salt Water Disposal,
 *   Air Injection, Water Supply, None); status = "Administrative Status". "Dry Hole-Oil show" etc. are dry
 *   holes by the shared rules (dry is tested before oil). "None" (never drilled / not spudded) is a permit.
 * - Coordinates: "Latitude (GCS NAD 83)" / "Longitude (GCS NAD 83)" - datum stated in the column name. Every
 *   row had coordinates in the 2026-10-12 pull, so no PLSS grid is configured ("Location Description" such as
 *   "NWNW Sec 28 Twp 104N Rng 63W" is shown in the panel).
 * - Data date = the "Export Date" column of Wells.xlsx (2026-10-01), logged by the pull script as export_date.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'SD', name: 'South Dakota', agency: 'South Dakota DANR Oil & Gas Program (data: SD Geological Survey)', short: 'DANR',
  apiPrefix: '40', apiForm: 'full',
  raw: r('data', 'raw', 'sd'), base: 'sd_wells.csv',
  typeField: 'Current Well Type', statusField: 'Administrative Status',
  lon: ['Longitude (GCS NAD 83)'], lat: ['Latitude (GCS NAD 83)'],
  datum: 'NAD83 (GCS NAD 83, per the column names)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({ 'sd_well_completions.csv': 'Well Completion', 'sd_formation_tops.csv': 'Formation Tops' }),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'sd_wells.csv', field: 'export_date' },
  sourceCount: r('data', 'raw', 'sd', 'source_count.json'),
  categoryOverrides: { NONE: 'other' },
  repairCoords: true,
};
