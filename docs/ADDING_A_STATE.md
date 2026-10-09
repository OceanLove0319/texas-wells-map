# Adding a state

A new state is **one pull script** plus **one entry in `scripts/states.config.mjs`**. The build, the
legend, search, the details panel, colors, coordinate repair, approximate (PLSS) locations, the header
snapshot dates and the asset checks all read that entry. Nothing in `app/` changes.

Kansas (KS) was added this way; use `scripts/ks_pull.py` and the `KS` entry as the template.

## 1. Find the source (research first)

- Prefer one bulk file (CSV/zip) over paging a REST service. Note the regulator's total well count
  (for example ArcGIS `returnCountOnly`) so the snapshot report can reconcile row counts.
- Write down: API column and whether it includes the 2-digit state code; coordinate columns and datum;
  well type and status columns; any code dictionary; township/range/section/meridian/quarter columns.
- Ocean must approve the source. Pulls are **one-time and polite**: at most 2 concurrent requests
  (we use 1), sleeps between requests, no nightly or recurring pulls, skip files that already exist.

## 2. Pull script: `scripts/<st>_pull.py`

Writes everything under `data/raw/<st>/` (not committed):

| File | What |
|---|---|
| base file (`.csv` / `.txt`, with a header row) | one row per well; every column is kept and shown |
| other `*.csv` with an API column (optional) | extra per-well layers, joined automatically on OBJECTID or the full API |
| `<st>_counties.geojson` | county outlines (Census TIGERweb `State_County/MapServer/1`, `where STATE='<fips>'`, `maxAllowableOffset 0.005`) |
| `source_count.json` (optional) | `{ "service", "count", "fetched_utc" }`, the regulator's live count |
| `pull_log.jsonl` | one JSON line per download with `name`, `finished_utc` and, if the data date differs from the pull date, a field such as `zip_entry_date` |

Run it with `python3 -I scripts/<st>_pull.py`.

## 3. Config entry in `scripts/states.config.mjs`

```js
{
  id: 'KS', name: 'Kansas', agency: 'Kansas Geological Survey (KGS)', short: 'KGS',
  apiPrefix: '15', apiForm: 'full',            // 'county8' only for Texas-style 8-digit APIs
  raw: r('data', 'raw', 'ks'), base: 'ks_wells.txt',
  typeField: 'STATUS', statusField: 'STATUS2',  // statusField may be null
  lon: ['LONGITUDE'], lat: ['LATITUDE'], datum: 'NAD27 (per KGS)',
  counties: { file: 'ks_counties.geojson', code: 'COUNTY', name: 'NAME' },
  layerNames: () => ({}), baseName: 'Well',
  snapshot: { log: 'pull_log.jsonl', name: 'ks_wells.txt', field: 'zip_entry_date' },
  sourceCount: r('data', 'raw', 'ks', 'source_count.json'),
  categoryOverrides: { /* RAW_CODE: 'oil' | 'gas' | 'plugged' | 'injection' | 'dry' | 'other' */ },
  plss: { ... },                                // see step 5; omit for non-PLSS states
  repairCoords: true,
}
```

Notes:
- **API / search.** The canonical API is 10 digits (state + county + unique); suffixes are dropped.
  The search key is the 8 digits after the state code and is only compared inside that state's
  range, so states never collide. Search accepts 10/12/14 digits, dashed or not; the first two
  digits pick the state. Rules live in `app/src/api.mjs`, shared by the build and the app.
  Set `apiField` if the default API column (API / api_number / api_no / apinum) is the wrong one.
- **County code** comes from API digits 3-5 and must match the county file's `code` property
  (Census `COUNTY` is the FIPS code, which most state API county codes use; check this).
- **Codes.** If the regulator publishes a code dictionary, save it as
  `data/<st>_codes.json` = `{ "fields": { "<FIELD>": { "<code>": "<description>" } } }` and set `codes`.
- **Legend merging.** Type and status values are merged case-insensitively (`Gas` / `GAS` -> one entry);
  the panel still shows the raw value and the legend tooltip lists every raw spelling.
- **Colors.** Each type maps to a shared category (`CATEGORIES`, `CATEGORY_RULES`) by matching the code
  and its description; check the category column in the snapshot report and add
  `categoryOverrides` where the rules guess wrong. Oil is always green, gas red, plugged gray,
  injection/disposal blue, dry hole orange, permit/other purple; types inside a category get shades.
- **Snapshot date** shown in the header is the data date: a `pull_log.jsonl` field, or `finished_utc`.

## 4. Coordinate repair (automatic)

With `repairCoords: true`, a coordinate outside -180..180 / -90..90 that is a whole number is tried with
the decimal point re-inserted after 1, 2 or 3 digits (e.g. `-1007768207` -> `-100.7768207`). It is
used only when exactly one combination falls inside the state outline (`data/raw/us_states.geojson`)
and, if the well's PLSS section is known, within about 2 km of it. Repaired wells count as exact and
the panel says what was changed. Code: `scripts/lib/coords.mjs`.

## 5. Approximate locations from PLSS (PLSS states only)

For states surveyed in the Public Land Survey System (OK, KS, CO, NM, WY, MT, ND, ...), wells without
usable coordinates are placed at the center of their section, refined by quarter calls when present.

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
   meridians has that township/range/section.
3. Approximate wells are drawn as hollow rings (legend toggle "Show approximate locations"), counted
   separately in the legend footer, and the panel says
   "Location: APPROXIMATE (center of ... Sec X, TyN, RzW, ... Meridian). The regulator file has no coordinates".
   Real coordinates are never overwritten. The build log and the snapshot report list how many were
   placed and why the rest were not (missing/invalid township-range-section, section not in grid, ...).
4. Sanity-check placement against wells that do have coordinates (OK and KS: median error 0.04 km,
   99th percentile under 1 km).

## 6. Build, report, check

```
cd app
npm run data                          # all states -> app/assets/data (about 10 minutes)
node ../scripts/state_report.mjs KS   # data/<st>_snapshot_report.md: counts vs source, coordinates, types, fields
npm run check-data                    # counts add up, loc.bin agrees, no file over 50 MB
npm start                             # look at it
```

Verify before showing Ocean: legend total per state = source rows - unmapped; search and click a real
well of the new state (10-digit API, dashed and undashed); regression-search a TX and an OK well;
`lsof -p <pid> -i` shows no sockets; screenshots of the statewide view and of the panel.

## 7. Size watch

`points.bin` grows by 8 bytes per well (about 19 MB at 2.4 million wells). Past about 6 million wells it
would exceed GitHub's 50 MB per-file limit; `check-data` fails before that happens. The fix then is to
split the per-well binaries per state (the renderer already works in per-state index ranges).
