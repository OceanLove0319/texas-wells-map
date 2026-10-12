/**
 * Illinois (IL) - one state entry for scripts/states.config.mjs (same schema as the entries there).
 * Source: Illinois State Geological Survey ILOIL/Wells2 MapServer/8 "Wells"; pulled by scripts/pull_il.py
 * into data/raw/il/. Coordinates: the layer's LONGITUDE/LATITUDE columns (datum not stated by ISGS), then
 * LON_4326/LAT_4326 (geometry reprojected by the service from Web Mercator). API: API_NUMBER (12 digits).
 * DataSummary and ILSTRAT are URLs (ISGS well summary page / stratigraphy), shown as links by the app.
 * ISGS STATUS mixes type and status in 99 codes (OILP = oil producer, plugged). The legend uses two columns
 * derived by the pull (raw STATUS and STATUS_TEXT are kept): TYPE_CLASS = first clause of STATUS_TEXT
 * ("Oil Producer", "Dry and Abandoned", ...), PLUGGED = "Plugged" / "Not recorded as plugged". A plugged
 * oil producer is therefore colored as oil and filtered with the status toggle, unlike Kansas where
 * OIL-P&A is its own type. LOCATION ("12-1N-5W") is kept raw; every row has coordinates, so no `plss`.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

export default {
  id: 'IL', name: 'Illinois', agency: 'Illinois State Geological Survey (ISGS)', short: 'ISGS',
  apiPrefix: '12', apiForm: 'full', apiField: 'API_NUMBER',
  raw: r('data', 'raw', 'il'), base: 'il_wells.csv',
  // Legend type = TYPE_CLASS, with " - Plugged" appended when PLUGGED says so, so a plugged oil producer is in the
  // plugged (gray) category like Kansas OIL-P&A; the PLUGGED column stays the status toggle.
  typeField: 'TYPE_CLASS', statusField: 'PLUGGED',
  typeOf: (g) => { const t = String(g('TYPE_CLASS') ?? '').trim(); return /^plugged$/i.test(String(g('PLUGGED') ?? '').trim()) ? `${t || 'Unknown'} - Plugged` : t; },
  lon: ['LONGITUDE', 'LON_4326'], lat: ['LATITUDE', 'LAT_4326'], datum: 'not stated by ISGS (decimal degrees; geometry served in Web Mercator)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'il_wells.csv' },
  sourceCount: r('data', 'raw', 'il', 'source_count.json'),
  categoryOverrides: {
    'OIL PRODUCER': 'oil', 'COMBINATION OIL AND GAS PRODUCER': 'oil', 'OIL WELL AND SALT WATER DISPOSAL': 'oil',
    'COMBINATION OIL PRODUCER AND WATER INJECTION': 'oil', 'COMB. OIL PRODUCER AND WATER INJECTION': 'oil',
    'GAS PRODUCER': 'gas', 'COAL BED METHANE': 'gas', 'COAL MINE METHANE': 'gas',
    'JUNKED AND ABANDONED': 'plugged', 'PLUGGED HOLE': 'plugged', 'DEAD PERMIT': 'other', 'CONFIDENTIAL HOLE': 'other',
    'UNDESIGNATED INJECTION WELL': 'injection', 'METHANE VENT': 'other', 'STRUCTURE TEST': 'other', 'STRATIGRAPHIC TEST': 'other',
  },
  repairCoords: true,
  notes: 'TYPE_CLASS and PLUGGED are derived by scripts/pull_il.py from STATUS_TEXT; the raw STATUS / STATUS_TEXT columns are kept and shown.',
};
