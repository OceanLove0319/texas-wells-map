# Config fragments: Federal Offshore (BOEM) and USGS orphan-well overlay

> **Status 2026-10-12: integrated.** Every EXTRA key below is now supported by `scripts/build_data.mjs` and `app/src/renderer.js`
> (the key list with current semantics is the header comment of `scripts/states.config.mjs`; the recipe is `docs/ADDING_A_STATE.md`).
> Code dictionaries moved to committed `data/<id>_codes.json`. Kept as the design note of the federal/basemap data agent.

Written by the federal/basemap data agent (2026-10-12). Nothing in `states.config.mjs`, `app/`, docs or shared files was
touched. These fragments follow the `states.config.mjs` entry schema; the keys below are EXTRA and need build/app support.

## Files

| what | path |
|---|---|
| BOEM pull / report | `scripts/pull_boem.py` (`--report` writes the snapshot report) |
| BOEM data | `data/raw/boem/mv_boreholes_all.txt` (base, 57,503 rows), `boem_rest_wells.csv` (layer, 25,351), `boem_codes.json`, `boem_planning_areas.geojson`, `boem_protraction.geojson`, `source_count.json`, `pull_log.jsonl`, `boem_snapshot_report.md` |
| BOEM fragment | `scripts/states/boem.config.mjs` (export `BOEM`) |
| USGS pull / report | `scripts/pull_usgs_orphan.py` (`--report`) |
| USGS data | `data/raw/usgs_orphan/US_orphaned_wells_2026.csv` (130,121 rows), `.xml` metadata, `sciencebase_item.json`, `source_count.json`, `pull_log.jsonl`, `usgs_orphan_snapshot_report.md` |
| USGS fragment | `scripts/states/usgs_orphan.config.mjs` (exports `USGS_ORPHAN`, `USGS_STATE_IDS`) |
| Basemap pull / report | `scripts/pull_basemap.py [tolerance]` (`--report`) |
| Basemap data | `data/raw/basemap/us_counties.geojson` (3,144 counties, 6.09 MB), `cb_2025_us_county_500k.zip`, `pull_log.jsonl`, `basemap_snapshot_report.md` |

## EXTRA keys the integration agent must support

### Both fragments
- `counties: null` - skip county outlines and the county-name lookup for this entry (offshore has none; the overlay has a `county` column instead).
- `repairCoords: false` / `plss: null` - already optional in the current schema; listed for clarity.

### `boem.config.mjs` (pseudo-state `OCS`, "Federal Offshore")
- `apiPrefixes: [...]` - a pseudo-state with MANY 2-digit API codes (60, 61, 55, 56 and the adjacent-state codes 01, 17, 42, 04, 50).
  `parseQuery` in `app/src/api.mjs` picks the state with `states.find(s => s.apiPrefix === d.slice(0,2))`; with offshore in the list
  a `42...` query must try Texas AND Federal Offshore (return all candidates, or search the offshore range when the TX lookup misses).
  14 ten-digit APIs exist in both the TX RRC file and the BOEM file.
- `apiKey: 'string12'` - key BOEM boreholes by the full 12-digit API string (10 digits + sidetrack/bypass suffix). The 10-digit canonical
  form collapses 57,503 boreholes to 39,569 wells; Uint32 search keys (8 digits after the state code) cannot hold the 12-digit form.
  Simplest route: store the 10-digit key as today for search (several boreholes share it, like OK/KS duplicate APIs already do) and show
  the full `API_WELL_NUMBER` string in the panel. Search should accept 12-digit input (it already accepts 10/12/14 digits).
- `regionField: 'REGION_CODE'` - sub-filter inside the pseudo-state: G Gulf of America 55,570 | P Pacific 1,714 | Y Alaska 167 | A Atlantic 52.
  Labels are in `boem_codes.json` -> `fields.REGION_CODE`. (Atlantic was not in the task's list; it is in the file.)
- `layerApiField` - the layer CSV's API column is `API_NUMBER`; include it only if the default API-column sniffing (API / api_number /
  api_no / apinum) is case-sensitive and misses it. The layer also has `OBJECTID`, which the base file does not; the join must fall
  through to the API.
- `areaField: 'BOTM_AREA_CODE'` (optional) - show "Area / Block" in place of "County"; API digits 3-5 are OCS area codes, not FIPS.
- `bottomHole: { lon, lat }` (optional) - bottom-hole coordinates for a future "show bottom hole" feature; ignore if not wanted.
- `defaultColorBy: 'status'` and `statusCategoryOverrides` (optional) - BOEM types are Development / Exploratory / Core Test / Relief /
  Strat Test / Non-Operation / Other and say nothing about oil vs gas, so every type is mapped to `other`. Status (PA = Permanently
  Abandoned, 31,294 rows) is the useful colour. If statuses stay uncategorized (as today), drop both keys; nothing breaks.
- `referenceLayers: [...]` (optional) - two small GeoJSON outlines (planning areas, protraction diagrams) as an offshore reference
  toggle. Property to label by is given per file.
- `sourceCount: null` - no live count exists apart from the daily CSV itself; the report explains.

### `usgs_orphan.config.mjs` (overlay `USGS_ORPHAN`)
- `kind: 'overlay'` - not a state: own legend toggle ("USGS documented orphan wells"), not in the state list, not counted in state totals,
  never deduplicated into state layers.
- `marker: {...}` - distinct symbol (suggested hollow orange triangle); state wells stay filled circles.
- `apiTypeField` / `apiTypeValue` - `primary_identifier` is an API only when `primary_identifier_type === 'API'` (107,891 of 130,121 rows;
  14 digits incl. state code). Other rows carry KYPermit / IGSID / ILRefNo or nothing (all 4,566 Kansas rows have NO identifier).
- `stateField: 'state'` + `stateIds` - USGS uses full state names; map to the app's ids to (a) find the state layer to compare against and
  (b) show "also in <state> data" in the panel when the 10-digit API exists in that state's base file. Measured match rates (2026-10-12,
  against the layers present in this repo): Texas 8,839 / 8,998 (98.2%), Oklahoma 19,455 / 19,981 (97.4%; 512 rows have no API),
  Kansas 0 / 4,566 (no identifiers). Other states: rerun `python3 -I scripts/pull_usgs_orphan.py --report` after their layers land and
  extend `STATE_FILES` in that script.
- `panelFirst: [...]` - field order for the panel; everything else follows in file order. Optional.
- `snapshot` is a function returning `{ date, source }` (publication date 2026-09-30 from `sciencebase_item.json`); the schema allows that already.

## National basemap swap
`data/raw/basemap/us_counties.geojson` has `properties: { NAME, COUNTY, GEOID, STATE, STUSPS, NAMELSAD }` for 3,144 counties in
50 states + DC (territories dropped), 6.09 MB. To replace the per-state files: point every state's `counties` at this one file with
`code: 'COUNTY', name: 'NAME'` and filter features by `STUSPS === S.id` (or `STATE === fips`) in the county loop of `build_data.mjs`
(the loop currently reads `path.join(S.raw, S.counties.file)`, so either give the entry a `countiesRaw`/absolute path or copy the file).
Like-for-like: TX 254 = 254, OK 77 = 77, KS 105 = 105 county codes, none missing. NAME has no " County" suffix (the build's strip is a no-op).

## Politeness record
One download each: BOEM zip 3.5 MB, USGS CSV 28.9 MB + 0.1 MB XML, Census zip 11.8 MB. BOEM REST: 3 well pages + 6 small polygon
queries + ids/metadata calls, sequential, 0.6 s sleep. Two scripts ran at the same time at most (BOEM + USGS, then basemap).
The first BOEM REST attempt failed 5x with CERTIFICATE_VERIFY_FAILED (gis.boem.gov omits its DigiCert intermediate); fixed by
downloading that public intermediate once (`data/raw/boem/digicert_g2_tls_2020_ca1.pem`) and adding it to the trust store.
Verification stays on.
