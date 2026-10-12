/**
 * New York - one STATES entry for scripts/states.config.mjs (same schema; see docs/ADDING_A_STATE.md).
 * Data: scripts/pull_ny.py -> data/raw/ny/ (DEC nightly wellDOS.zip -> wellspublic.csv, "Oil, Gas, and Other Regulated Wells").
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'NY', name: 'New York', agency: 'New York State Department of Environmental Conservation (DEC), Division of Mineral Resources', short: 'NYSDEC',
  apiPrefix: '31', apiForm: 'full',
  raw: r('data', 'raw', 'ny'), base: 'wellspublic.csv',
  apiField: 'API_WellNo', // 14 digits: 31 + county + hole + sidetrack + completion
  typeField: 'Well_Type', statusField: 'Well_Status',
  codes: r('data', 'ny_codes.json'), // parsed from OilandGasMetadata.html in the zip (move to data/ny_codes.json to commit it)
  lon: ['Surface_Longitude'], lat: ['Surface_latitude'],
  datum: 'decimal degrees, datum not stated by DEC (expected within 100 m of the well; Location_Verified = GPS-checked)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  // The zip is rebuilt nightly (Mon-Fri); the date inside the zip is the data date.
  snapshot: { log: 'pull_log.jsonl', name: 'wellspublic.csv', field: 'zip_entry_date' },
  sourceCount: r('data', 'raw', 'ny', 'source_count.json'), // Socrata copy szye-wmt3 of the same database
  categoryOverrides: {},
  repairCoords: true,
  notes: 'Includes storage, brine, stratigraphic, geothermal and monitoring wells (GeneralWellType says which). Bottom-hole coordinates, TVD/MD and a LINK to the DEC well record are in the row. Confidential wells are plotted with redacted attributes.',
};
