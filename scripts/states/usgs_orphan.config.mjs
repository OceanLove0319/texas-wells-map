/**
 * usgs_orphan.config.mjs - config FRAGMENT for the USGS Documented Orphaned Well Database (DOWDB) 2026 OVERLAY.
 * NOT a state: a separate legend toggle, a distinct marker, its own panel fields. Same schema as a states.config.mjs
 * entry where it fits; keys marked EXTRA are not supported by the build yet - see scripts/states/NOTES.md.
 * Data: python3 -I scripts/pull_usgs_orphan.py ; report: ... --report
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const r = (...p) => path.join(ROOT, ...p);

/** USGS writes full state names; the app's state ids are USPS codes. All 28 states in the 2026 release. */
export const USGS_STATE_IDS = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO', Illinois: 'IL', Indiana: 'IN',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Michigan: 'MI', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE',
  Nevada: 'NV', 'New Mexico': 'NM', 'New York': 'NY', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Pennsylvania: 'PA',
  Tennessee: 'TN', Texas: 'TX', Utah: 'UT', 'West Virginia': 'WV', Wyoming: 'WY',
};

export const USGS_ORPHAN = {
  id: 'USGS_ORPHAN', kind: 'overlay',                                    // EXTRA: kind - not a state; separate toggle, not in the state list
  name: 'USGS documented orphan wells (2026)', agency: 'U.S. Geological Survey, Documented Orphaned Well Database 2026', short: 'USGS',

  // Identifiers. primary_identifier is an API only when primary_identifier_type === 'API' (107,891 rows, 14 digits incl. the
  // state code). Other types: KYPermit 15,638, IGSID 946 (IN), ILRefNo 319, blank 5,327 (all 4,566 KS rows, 512 OK, 249 LA).
  apiPrefix: null, apiForm: 'full', apiField: 'primary_identifier',
  apiTypeField: 'primary_identifier_type', apiTypeValue: 'API',         // EXTRA: treat the field as an API only for these rows
  stateField: 'state', stateIds: USGS_STATE_IDS,                         // EXTRA: which state layer to compare with ("also in <state> data")

  raw: r('data', 'raw', 'usgs_orphan'), base: 'US_orphaned_wells_2026.csv', // 130,121 rows, 30 columns, UTF-8 with BOM
  typeField: 'type', statusField: 'status',                             // raw agency values (42,825 blank types); shown as-is
  lon: ['longitude'], lat: ['latitude'], datum: 'NAD83 (per USGS metadata; many rows converted from NAD27 by USGS)',
  counties: null, countyField: 'county',                                                        // EXTRA: no county outlines for an overlay (county NAME is a column)
  layerNames: () => ({}),
  baseName: 'Orphan well (USGS DOWDB 2026)',

  // Marker (EXTRA): draw distinct from state wells, e.g. a hollow orange triangle / diamond, not a filled circle.
  marker: { shape: 'triangle', stroke: [230, 120, 0, 255], fill: [255, 255, 255, 0], radiusPx: 3 },

  // Data date = the release's publication date (ScienceBase), not the pull date; the CSV is a one-time release.
  snapshot: () => {
    const p = r('data', 'raw', 'usgs_orphan', 'sciencebase_item.json');
    if (fs.existsSync(p)) {
      const d = (JSON.parse(fs.readFileSync(p, 'utf8')).dates || []).find((x) => x.type === 'Publication');
      if (d) return { date: d.dateString, source: 'data/raw/usgs_orphan/sciencebase_item.json (Publication date)' };
    }
    return { date: 'unknown', source: 'none' };
  },
  sourceCount: r('data', 'raw', 'usgs_orphan', 'source_count.json'),    // FeatureServer returnCountOnly = 130,121 = rows

  // Not needed: every row has coordinates. Single colour for the overlay; categories do not apply.
  categoryOverrides: {},
  plss: null,
  repairCoords: false,

  // Panel (EXTRA): fields to show first; everything else follows in file order.
  panelFirst: ['state', 'county', 'well_name', 'well_number', 'type', 'status', 'primary_identifier_type', 'primary_identifier',
               'secondary_identifier', 'source', 'data_file_date', 'surface_owner_fed_dept', 'surface_fed_agency', 'subsurface_owner_fed',
               'well_info_notes', 'location_notes', 'other_notes'],
};

export default USGS_ORPHAN;
