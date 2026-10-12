/**
 * Oklahoma (OK) - Oklahoma Corporation Commission (OCC) RBDMS nightly file + OCC GIS layers, pulled by
 * scripts/ok_pull.py into data/raw/ok/. Osage County minerals are federally administered and are NOT in this
 * file; see ok_osage.config.mjs (BIA Osage Agency, separate source).
 */
import { r, int, tr } from './_shared.mjs';

export default {
  id: 'OK', name: 'Oklahoma', agency: 'Oklahoma Corporation Commission (OCC)', short: 'OCC',
  apiPrefix: '35', apiForm: 'full',
  raw: r('data', 'raw', 'ok'), base: 'rbdms-wells.csv',
  typeField: 'WELLTYPE', statusField: 'WELLSTATUS', codes: r('data', 'ok_codes.json'),
  lon: ['SH_LON'], lat: ['SH_LAT'], datum: 'NAD83 (per OCC)',
  counties: { code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({ 'orphan_funds_wells.csv': 'Orphan Fund', 'comp_wells.csv': 'Completion Report' }),
  baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'rbdms-wells.csv' },
  categoryOverrides: { TM: 'injection', STFD: 'other', DUC: 'other', SCO: 'other', '2EPA': 'injection', ND: 'other', NT: 'other' },
  plss: {
    // CadNSDI meridian codes: 17 = Indian Meridian, 11 = Cimarron Meridian (Panhandle).
    meridians: { IM: '17', CM: '11' },
    meridian: (g) => String(g('PM') ?? '').trim().toUpperCase(),
    township: (g) => tr(g('TOWNSHIP')),
    range: (g) => tr(g('RANGE')),
    section: (g) => int(g('SECTION')),
    // QTR1 is the largest call (always filled when any is), QTR4 the smallest.
    quarters: (g) => ['QTR1', 'QTR2', 'QTR3', 'QTR4'].map((f) => g(f)),
  },
  repairCoords: true,
  note: 'Osage County wells are not in the OCC file (federal minerals); see the separate BIA Osage Agency source.',
};
