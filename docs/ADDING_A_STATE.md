# Adding a source (state, offshore region or overlay)

A new source is **one pull script** plus **one config fragment** `scripts/states/<id>.config.mjs` that
`export default`s one entry. `scripts/states.config.mjs` loads every fragment in that folder (files starting
with `_` are helpers). The build, the source list, search, the details panel, colors, coordinate repair,
approximate (PLSS) locations, the header snapshot range and the asset checks all read that entry. Nothing in
`app/` changes.

Templates: `scripts/states/ks.config.mjs` (plain state, PLSS), `la.config.mjs` (code dictionary, layers,
regulator id), `boem.config.mjs` (pseudo-state with several API codes, regions, reference outlines),
`usgs_orphan.config.mjs` (overlay).

## 1. Find the source (research first)

- Prefer one bulk file (CSV/zip) over paging a REST service. Note the regulator's total well count
  (for example ArcGIS `returnCountOnly`) so the snapshot report can reconcile row counts.
- Write down: API column and whether it includes the 2-digit state code; coordinate columns and datum;
  well type and status columns; any code dictionary; township/range/section/meridian/quarter columns;
  the regulator's own well id when there is no API.
- Ocean must approve the source. Pulls are **one-time and polite**: at most 2 concurrent requests
  (we use 1), sleeps between requests, no nightly or recurring pulls, skip files that already exist,
  respect robots.txt (several pulls here were single approved downloads).

## 2. Pull script: `scripts/pull_<st>.py`

Writes everything under `data/raw/<st>/` (not committed):

| File | What |
|---|---|
| base file (`.csv` / `.txt`, with a header row) | one row per well; every column is kept and shown |
| other `*.csv` with an API column (optional) | extra per-well layers, joined automatically on OBJECTID or the full API |
| `source_count.json` (optional) | `{ "service", "count", "fetched_utc" }`, the regulator's live count |
| `pull_log.jsonl` | one JSON line per download with `name`, `finished_utc` and, if the data date differs from the pull date, a field such as `zip_entry_date` |
| `<st>_snapshot_report.md` | written later by `scripts/state_report.mjs` (also copied to `data/`) |

Counties are **not** pulled per state any more: the national Census county basemap
(`python3 -I scripts/pull_basemap.py` -> `data/raw/basemap/us_counties.geojson`, 3,144 counties) is the
only county file the build reads. State outlines come from `scripts/states_pull.py`.

Anything the build needs that is not a raw download (code dictionary, county -> meridian table) goes in the
committed `data/` folder (`data/<st>_codes.json`, `data/<st>_county_meridians.json`), so the build is
reproducible from the repository plus the raw downloads.

Run it with `python3 -I scripts/pull_<st>.py`.

## 3. Config fragment `scripts/states/<st>.config.mjs`

```js
import { r, int, tr } from './_shared.mjs';   // r(...) = path under the repo root; PLSS helpers

export default {
  id: 'KS', name: 'Kansas', agency: 'Kansas Geological Survey (KGS)', short: 'KGS',
  apiPrefix: '15', apiForm: 'full',            // 'county8' only for Texas-style 8-digit APIs
  raw: r('data', 'raw', 'ks'), base: 'ks_wells.txt',
  typeField: 'STATUS', statusField: 'STATUS2',  // statusField may be null
  lon: ['LONGITUDE'], lat: ['LATITUDE'], datum: 'NAD27 (per KGS)',
  counties: { code: 'COUNTY', name: 'NAME' },   // national basemap properties; null = no counties (offshore, overlays)
  layerNames: () => ({}), baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'ks_wells.txt', field: 'zip_entry_date' },
  sourceCount: r('data', 'raw', 'ks', 'source_count.json'),
  codes: r('data', 'ks_codes.json'),            // optional { fields: { FIELD: { code: description } } }
  categoryOverrides: { /* RAW_CODE: 'oil' | 'gas' | 'plugged' | 'injection' | 'dry' | 'other' */ },
  plss: { ... },                                // see step 5; omit for non-PLSS states
  repairCoords: true,
  note: 'one sentence of caveats, shown in the source list and the README table',
};
```

The full key list, including the optional ones below, is the header comment of `scripts/states.config.mjs`.

Notes:
- **API / search.** The canonical API is 10 digits (state + county + unique); suffixes are dropped.
  The search key is the 8 digits after the state code. Keys are compared inside one shard, and every shard
  carries one API prefix, so states never collide; when two sources really share a code (BOEM boreholes with
  Texas `42` APIs) the search lists both. Search accepts 8/10/12/14 digits, dashed or not; the first two
  digits pick the sources. Rules live in `app/src/api.mjs`, shared by the build and the app.
  Set `apiField` if the default API column (API / api_number / api_no / apinum) is the wrong one.
  Several codes for one source: `apiPrefixes: ['60', '61', ...]`. Boreholes keyed by a 12-digit API string:
  `apiKey: 'string12'` (sidetracks share the 10-digit key; a 12-digit query filters on the full string).
- **No API numbers** (Virginia, Indiana, Osage BIA, ...): the pull may still build an API-shaped key so the
  county shard works, and the fragment sets `stateIdField` (`FiNo`, `igs_id`, `WNUM`, `KGS_Recno`, ...).
  The build writes `ids/<ST>.json.br`, and the app searches that id when the query is not API-shaped
  (optionally prefixed with the source id: `VA BU-4401`).
- **County code** comes from API digits 3-5 and must be the county FIPS code used by the Census basemap.
  When the key digits are not a FIPS code (Indiana), set `countyFromApi: false` and `countyField: 'county'`
  (shards and the panel then use that column).
- **Codes.** If the regulator publishes a code dictionary, save it as
  `data/<st>_codes.json` = `{ "fields": { "<FIELD>": { "<code>": "<description>" } } }` and set `codes`.
- **Legend merging.** Type and status values are merged case-insensitively (`Gas` / `GAS` -> one entry);
  the panel still shows the raw value and the legend tooltip lists every raw spelling.
- **Colors.** Each type maps to a shared category (`CATEGORIES`, `CATEGORY_RULES`) by matching the code
  and its description; check the category column in the snapshot report and add `categoryOverrides` where
  the rules guess wrong. Oil is always green, gas red, plugged gray, injection/disposal blue, dry hole
  orange, permit/other purple; types inside a category get shades. **A plugged well must land in the
  plugged category in every state.** When the regulator keeps "plugged" in a separate column, derive the
  legend type with `typeOf: (g) => ...` (Illinois appends ` - Plugged` to TYPE_CLASS). Statuses get a
  distinct palette unless the fragment gives `statusCategoryOverrides` (then category shades, like BOEM
  `PA` -> plugged) and optionally `defaultColorBy: 'status'`.
- **Regions.** `regionField` adds a sub-filter inside the source (BOEM `REGION_CODE`: Gulf / Pacific /
  Alaska / Atlantic); labels come from `codes`. Wells are sharded region-first so each region is one
  contiguous index range.
- **Reference outlines.** `referenceLayers: [{ file, name, label }]` (GeoJSON in `raw`) are copied to
  `reference/` and drawn as a faint toggleable outline (BOEM planning areas, protraction diagrams).
- **Overlays.** `kind: 'overlay'` (USGS orphan wells): own toggle and hollow-triangle marker, not in the
  state list or the state totals, never deduplicated. `stateField` + `stateIds` map the source's state names
  to app ids, so rows are sharded per state and the panel shows "Also in <state> data" when the API exists
  there (and the state well's panel shows the orphan record). `apiTypeField` / `apiTypeValue` say when the
  identifier column is an API. `panelFirst` orders the panel fields.
- **Snapshot date** shown per source in the list is the data date: a `pull_log.jsonl` field, or
  `finished_utc`. Sources older than two years get a "data last updated <year>" tag automatically
  (Missouri, Oregon and Osage BIA are 2021 data).
- `sortKey` places a source in the list (`'Oklahoma 2'` puts Osage BIA right after Oklahoma).

## 4. Coordinate repair (automatic)

With `repairCoords: true`, a coordinate outside -180..180 / -90..90 that is a whole number is tried with
the decimal point re-inserted after 1, 2 or 3 digits (e.g. `-1007768207` -> `-100.7768207`). It is
used only when exactly one combination falls inside the state outline (`data/raw/us_states.geojson`)
and, if the well's PLSS section is known, within about 2 km of it. Repaired wells count as exact and
the panel says what was changed. Code: `scripts/lib/coords.mjs`.

## 5. Approximate locations from PLSS (PLSS states only)

For states surveyed in the Public Land Survey System, wells without usable coordinates are placed at the
center of their section, refined by quarter calls when present.

1. Pull the BLM CadNSDI section grid once: `python3 -I scripts/plss_pull.py <ST>`
   (writes `data/raw/plss/<ST>_sections.jsonl`; paged, sequential, polite).
2. Add `plss` to the config entry:
   ```js
   plss: {
     meridians: { IM: '17', CM: '11' },          // raw meridian value -> CadNSDI 2-digit code (PLSSID chars 3-4)
     meridian: (g) => g('PM'),                    // g(field) reads a column of the well row
     township: (g) => tr(g('TOWNSHIP')),          // -> { n: 26, dir: 'N' }
     range: (g) => tr(g('RANGE')),                // -> { n: 14, dir: 'W' }
     section: (g) => int(g('SECTION')),           // 1..36
     quarters: (g) => [g('QTR1'), g('QTR2')],     // LARGEST call first: NE/NW/SE/SW, N2/S2/E2/W2
   }
   ```
   Check the meridian codes in the pulled file (group PLSSIDs by characters 3-4 and look at their
   longitudes). A missing or unknown meridian is inferred only when exactly one of the state's
   meridians has that township/range/section. States with several meridians and no meridian column
   (Alabama, Mississippi) derive county -> meridian from the wells that do have coordinates
   (`data/<st>_county_meridians.json`, written by the pull script).
3. Approximate wells are drawn as hollow rings (toggle "Approximate locations (PLSS)"), counted
   separately in the source list, and the panel says
   "Location: APPROXIMATE (center of ... Sec X, TyN, RzW, ... Meridian). The regulator file has no coordinates".
   Real coordinates are never overwritten. The build log and the snapshot report list how many were
   placed and why the rest were not (missing/invalid township-range-section, section not in grid, ...).
4. Sanity-check placement against wells that do have coordinates (OK and KS: median error 0.04 km,
   99th percentile under 1 km).

## 6. Build, report, check

```
cd app
npm run data                          # all sources -> app/assets/data (about 25 minutes, 12 GB heap)
node ../scripts/build_data.mjs --only KS   # one source, for a quick look (writes a partial asset set)
node ../scripts/state_report.mjs KS   # data/<st>_snapshot_report.md: counts vs source, coordinates, types, fields
npm run check-data                    # counts add up, loc.bin agrees, no file over 50 MB
npm start                             # look at it
```

Verify before showing Ocean: legend total per source = source rows - unmapped; search and click a real
well of the new source (10-digit API, dashed and undashed, or the regulator id); regression-search a TX
and an OK well; `lsof -p <pid> -i` shows no sockets; screenshots of the statewide view and of the panel.

## 7. Size watch

`points.bin` grows by 8 bytes per well (about 39 MB at 4.8 million wells), `apis.bin` by 4 bytes
(19 MB), `types.bin` and `status.bin` by 2 bytes each. Past about 6 million wells `points.bin` would
exceed GitHub's 50 MB per-file limit; `check-data` fails before that happens. The fix then is to split
`points.bin` per source (the renderer already works in per-source index ranges). Type and status indices
are Uint16 (65,000 legend entries), so the category budget is not a concern.
