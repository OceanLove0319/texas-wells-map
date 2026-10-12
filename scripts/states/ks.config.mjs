/**
 * Kansas (KS) - Kansas Geological Survey (KGS) bulk file ks_wells.zip, pulled by scripts/ks_pull.py into
 * data/raw/ks/. Coordinates are NAD27 as published by KGS.
 */
import { r, int } from './_shared.mjs';

export default {
  id: 'KS', name: 'Kansas', agency: 'Kansas Geological Survey (KGS)', short: 'KGS',
  apiPrefix: '15', apiForm: 'full',
  raw: r('data', 'raw', 'ks'), base: 'ks_wells.txt',
  typeField: 'STATUS', statusField: 'STATUS2',
  lon: ['LONGITUDE'], lat: ['LATITUDE'], datum: 'NAD27 (per KGS)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}),
  baseName: 'Well',
  // The bulk file is rebuilt by KGS periodically; the date inside the zip is the data date.
  snapshot: { log: 'pull_log.jsonl', name: 'ks_wells.txt', field: 'zip_entry_date' },
  sourceCount: r('data', 'raw', 'ks', 'source_count.json'),
  plss: {
    meridians: { '6TH': '06' },
    meridian: () => '6TH', // all of Kansas is surveyed from the Sixth Principal Meridian
    township: (g) => { const n = int(g('TOWNSHIP')); const d = String(g('TWN_DIR') ?? '').trim().toUpperCase(); return n && /^[NS]$/.test(d) ? { n, dir: d } : null; },
    range: (g) => { const n = int(g('RANGE')); const d = String(g('RANGE_DIR') ?? '').trim().toUpperCase(); return n && /^[EW]$/.test(d) ? { n, dir: d } : null; },
    section: (g) => int(g('SECTION')),
    // SPOT is written smallest call first ("NE NW SE" = NE of NW of SE); reverse to largest first.
    quarters: (g) => String(g('SPOT') ?? '').trim().split(/\s+/).filter(Boolean).reverse(),
  },
  repairCoords: true,
  note: 'Coordinates are NAD27 as published by KGS (tens of meters from WGS84). 41,612 rows have no full API.',
};
