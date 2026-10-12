# US Wells Map

An offline desktop app (Mac and Windows) that shows oil and gas wells from 36 state and federal
offshore sources, plus the USGS documented orphan-well database as an overlay, on one national map.
Every source is a one-time snapshot of the regulator's public data (dates in the table below). Click a
well, or search by API number or regulator well id, to see every field we have for it, grouped by
source layer. Adding a source is documented in [docs/ADDING_A_STATE.md](docs/ADDING_A_STATE.md).

## Data sources

Counts come from the build (`app/assets/data/meta.json`): *Source rows* is every row of the regulator's
file, *Mapped* the wells drawn (exact coordinates + approximate PLSS placements), *Unmapped* the rows
with no usable location (still searchable, not drawn, not in the legend counts).

| Source | Agency | Snapshot | Source rows | Mapped (exact + approximate) | Unmapped | Notes |
|---|---|---|---|---|---|---|
| Alabama | State Oil and Gas Board of Alabama (OGB, Geological Survey of Alabama) | 2026-10-12 | 17,373 | 17,338 (16,774 + 564) | 35 | Service edit dates unusable, so the data date is the pull date. 564 wells placed from PLSS using a county -> meridian table derived from located wells. |
| Alaska | Alaska Oil and Gas Conservation Commission (AOGCC) | 2026-10-12 | 11,233 | 11,233 | 0 | AOGCC "Test" MapServer (may change); one row per surface-hole layer and wellbore, so a 10-digit API repeats across rows. Datum unverified (service says WGS84, site says NAD27). The Aleutians west of 180 are drawn next to the rest of Alaska. |
| Arizona | Arizona Oil and Gas Conservation Commission (AZOGCC) | 2026-10-12 | 1,288 | 1,276 | 12 | 24 rows without a full API. Per-well document page in WEBSITE. |
| Arkansas | Arkansas Oil and Gas Commission (AOGC), via Arkansas GIS Office | 2026-07-21 | 38,245 | 38,245 | 0 | Snapshot of the AOGC database published by the Arkansas GIS Office (item modified 2026-07-21). No spud/completion dates or document links. |
| California | California Geologic Energy Management Division (CalGEM) | 2026-07-02 | 242,471 | 242,471 | 0 | CNRA Open Data cached export dated 2026-07-02; the live WellSTAR service had 88 more wells on 2026-10-12. |
| Colorado | Colorado Energy & Carbon Management Commission (ECMC) | 2026-10-11 | 124,451 | 124,451 | 0 | Daily ECMC shapefile; Well_Class code meanings follow ECMC conventions and were not verified against a published dictionary. |
| Florida | Florida Department of Environmental Protection (FDEP), Oil and Gas Program | 2026-10-12 | 1,478 | 1,478 | 0 | 146 rows without a full API. CURRENT_STATUS mixes type and status. |
| Idaho | Idaho Geological Survey (IGS) / Idaho Oil and Gas Conservation Commission | 2026-10-12 | 221 | 221 | 0 | 7 rows without a full API. |
| Illinois | Illinois State Geological Survey (ISGS) | 2026-10-12 | 207,297 | 207,297 | 0 | ISGS STATUS mixes type and status; the legend type is TYPE_CLASS plus " - Plugged" where PLUGGED says so (so plugged producers are gray). 26,537 APIs are on more than one row. |
| Indiana | Indiana Department of Natural Resources, Division of Oil and Gas | 2026-10-12 | 78,257 | 76,419 | 1,838 | No API numbers: keyed by the IGS id (searchable as the id or as 13-000-xxxxx). 1,838 wells have no coordinates and no PLSS data. Thin attributes. |
| Kansas | Kansas Geological Survey (KGS) | 2026-09-11 | 519,568 | 519,518 | 50 | Coordinates are NAD27 as published by KGS (tens of meters from WGS84). 41,612 rows have no full API. The KGS live service had 65 more wells than the bulk file. |
| Kentucky | Kentucky Geological Survey (KGS) | 2026-10-09 | 162,164 | 162,164 | 0 | Shapefile holds only the 162,164 wells with a computable location; the KGS REST layer lists 194,362 (unlocated wells not pulled; robots.txt). 25,883 rows have no API and are searchable by KGS record number. |
| Louisiana | Louisiana Office of Conservation (SONRIS) | 2026-10-10 | 247,314 | 247,314 | 0 | SONRIS nightly layer, one-time snapshot. 16,596 rows have no full API (junk or blank API_NUM) and are searchable by well serial number. |
| Michigan | Michigan EGLE, Oil, Gas, and Minerals Division | 2026-10-12 | 92,583 | 92,583 | 0 | Sidetracks and recompletions repeat the 10-digit API (5,112 APIs on more than one row). Part 625 mineral wells included. |
| Mississippi | Mississippi State Oil and Gas Board (MSOGB) | 2026-10-09 | 35,218 | 33,643 (25,555 + 8,088) | 1,575 | 9,663 rows have no coordinates; 8,088 placed from PLSS (county -> meridian derived from located wells), 1,575 could not be placed (irregular sections, missing meridian). Daily file, one approved download. |
| Missouri | Missouri DNR, Missouri Geological Survey | 2021-08-30 | 10,369 | 10,369 (10,368 + 1) | 0 | **Data last updated 2021-08-30** (MoDNR metadata publication date; newest status date 2021-08-03). |
| Montana | Montana Board of Oil and Gas Conservation (DNRC BOGC) | 2026-10-12 | 42,049 | 42,049 | 0 | Map-symbol codes from the layer renderer (mt_codes.json). DNRC BOGC DataMiner layer 11. |
| Nebraska | Nebraska Oil and Gas Conservation Commission (NOGCC) | 2026-06-04 | 22,600 | 22,600 | 0 | Access .mdb inside NebraskaWellData.zip dated **2026-06-04** (refreshed irregularly); WFS coordinates joined on API. No code dictionary in the .mdb. |
| Nevada | Nevada Division of Minerals (NDOM) | 2026-10-12 | 745 | 745 | 0 | Historic layer, UTM 11N reprojected. |
| New Mexico | New Mexico Oil Conservation Division (EMNRD OCD) | 2026-10-12 | 142,293 | 142,293 | 0 | OCD Wells_Public layer; CO2 producers (Bravo Dome) colored as gas. |
| New York | New York State Department of Environmental Conservation (DEC), Division of Mineral Resources | 2026-10-11 | 47,471 | 46,386 | 1,085 | Nightly DEC file; 1,085 wells have no surface coordinates (not drawn: mostly plugged, voided and never-drilled permits). Confidential wells have redacted attributes. |
| North Dakota | North Dakota Industrial Commission, Oil and Gas Division (NDIC DMR) | 2026-10-12 | 43,983 | 43,983 | 0 | Locations-only public layer: well files, scout tickets and production are behind NDIC's paid subscription and were not pulled. Symbol codes not verified against a published dictionary. |
| Ohio | Ohio Department of Natural Resources (ODNR), Division of Oil and Gas Resources Management | 2026-10-12 | 242,412 | 242,412 | 0 | ODNR public layer plus the ogwells_offline companion (depth, dates), joined on API. Robots.txt disallows crawlers; one approved pull. |
| Oklahoma | Oklahoma Corporation Commission (OCC) | 2026-10-09 | 457,138 | 456,337 (442,426 + 13,911) | 801 | Osage County wells are not in the OCC file (federal minerals; see the BIA Osage source). 17 wells had a lost decimal point repaired; 13,911 placed from PLSS. |
| Osage County, OK (BIA) | BIA Osage Agency, via Osage Minerals Council ArcGIS Online layer "Osage BIA Wells" | 2021-01-25 | 43,822 | 43,822 | 0 | **Data last updated 2021-01-25.** No API numbers, operators or dates; only the BIA well number (searchable) and a status. About 103 OCC rows plot inside Osage County and are NOT deduplicated against this layer. |
| Oregon | Oregon Department of Geology and Mineral Industries (DOGAMI), MLRR | 2021-01-29 | 713 | 711 | 2 | **Data last updated 2021-01-29** (DOGAMI static spreadsheet; no service exists). No API numbers: DOGAMI permit ids are API-shaped (36-ccc-nnnnn) and searchable; 13 ids (letters, offshore 56) are not API-like but still searchable as text. |
| Pennsylvania | Pennsylvania Department of Environmental Protection (DEP), Office of Oil and Gas Management | 2026-10-12 | 224,588 | 224,588 | 0 | DEP eMapPA conventional + unconventional layers unioned. 180 rows have a permit number that is not API-shaped (searchable by permit number). Abandoned/orphan (62) and historical (63) layers not pulled. |
| South Dakota | South Dakota DANR Oil & Gas Program (data: SD Geological Survey) | 2026-10-01 | 2,137 | 2,137 | 0 | Wells.xlsx export dated 2026-10-01 with completion and formation-top layers. |
| Tennessee | Tennessee Department of Environment and Conservation (TDEC), Oil and Gas Program | 2026-10-12 | 16,614 | 16,549 | 65 | Thin layer (12 attributes, no status). Server refuses non-browser user agents; one-time pull with a browser-style agent. |
| Texas | Railroad Commission of Texas (RRC) | 2026-10-09 | 1,397,386 | 1,397,386 | 0 | About 26% of rows carry only a 3-digit county code (no full API); they never get API-joined layer records. 14 of its 10-digit APIs also exist in the BOEM offshore file (search shows both). |
| Utah | Utah Division of Oil, Gas and Mining (DNR DOGM) | 2026-10-12 | 40,408 | 40,408 | 0 | Daily DOGM RBDMS exports with coordinate and well-history layers. Datum not stated (presumably NAD83); code read-me PDFs could not be fetched. |
| Virginia | Virginia Energy, Division of Gas and Oil (DGO) | 2026-10-12 | 10,842 | 10,836 | 6 | No API numbers: keyed by the DGO file number (searchable as the id, e.g. BU-4401, or as 45-ccc-nnnnn). 175 old-style file numbers have no key. Source count (10,906) includes 64 facilities that are not wells. |
| Washington | Washington Geological Survey (DNR) | 2026-10-12 | 830 | 830 | 0 | Almost all dry exploratory holes; legend type is WELL_STATUS, status grouping is HYDROCARBON_SHOW. |
| West Virginia | West Virginia Department of Environmental Protection (WVDEP) | 2026-10-12 | 154,171 | 150,268 | 3,903 | 3,903 rows sit at the UTM false origin (500000/4000000, a placeholder that plots in Virginia); the pull blanks them so they count as unmapped instead of being drawn in the wrong state. Layer 5 (54,887 WVGES wells) not pulled. |
| Wyoming | Wyoming Oil and Gas Conservation Commission (WOGCC) | 2026-10-12 | 120,958 | 120,958 | 0 | Locations only (operator, dates, documents are on pipeline.wyo.gov, robots.txt disallows). One well has a latitude of about -11 (outside Wyoming); it is drawn where the file puts it and ignored by "zoom to state". |
| Federal Offshore | Bureau of Ocean Energy Management (BOEM) | 2026-10-12 | 57,503 | 57,501 | 2 | BOEM daily borehole file, 12-digit APIs (sidetracks share the 10-digit form: 39,569 distinct). 56% of rows carry the adjacent state's API code (17, 42, 01, 04, 50); 14 ten-digit APIs also exist in the Texas RRC file. Types do not say oil vs gas, so the layer is colored by status (PA = plugged). 2 rows without surface coordinates. Datum NAD27 per BOEM, unverified. |
| USGS documented orphan wells (2026) (overlay) | U.S. Geological Survey, Documented Orphaned Well Database 2026 | 2026-09-30 | 130,121 | 130,121 | 0 | USGS Documented Orphaned Well Database 2026 (published 2026-09-30; state files dated 2023-12-31 .. 2026-04-13). Overlay with its own toggle and marker; never deduplicated into state layers. 5,327 rows carry no identifier (all 4,566 Kansas rows), Kentucky uses KYPermit, Indiana IGSID, so those cannot be cross-referenced by API. |
| **Total (36 state / offshore sources)** | | 2021-01-25 to 2026-10-12 | **4,858,193** | **4,848,819** (4,826,255 + 22,564) | **9,374** | plus 130,121 USGS orphan-well overlay markers |

Common caveats:

- **Repaired coordinates:** a coordinate with a lost decimal point (for example `-1007768207`) is drawn
  at the corrected point only when exactly one correction lands inside the state and next to the well's
  PLSS section (17 Oklahoma wells, 1 Mississippi well). The panel says what was changed.
- **Approximate locations:** wells with no usable coordinates but a meridian/township/range/section
  are drawn as hollow rings at the center of the section (or quarter call) from the BLM CadNSDI grid
  (Oklahoma 13,911, Mississippi 8,088, Alabama 564, Missouri 1). The panel says "Location: APPROXIMATE".
  Checked against wells with real coordinates, the method is off by a median of 0.04 km.
- **Shared categories:** every source's well types map to the same six categories (oil green, gas red,
  plugged/abandoned gray, injection/disposal blue, dry hole orange, permit/other purple), so a plugged well
  is gray in every state. Type names are still the regulator's own.
- **Stale sources:** Missouri (2021-08-30), Oregon (2021-01-29) and Osage BIA (2021-01-25) are the newest
  public data those agencies publish; the app tags them "data last updated 2021".
- **Datums:** most sources are NAD83/WGS84 (a meter apart); Kansas and BOEM publish NAD27 (tens of
  meters). The datum of each source is recorded in its config fragment and snapshot report.
- Nothing is deduplicated across sources: a well that appears in a state file, in the BOEM file and in
  the USGS orphan list is three records; the panel cross-references them by API where it can.

**No automatic network connections.** The app does not connect to anything by itself: no telemetry,
no auto-update, no map tiles, no login. All data ships inside the installer. The only time anything
leaves your computer is when **you click** a document link in the details panel (OCC well records,
SONRIS well profiles, DEC well records, MSOGB pages, ...). That link opens in your default web browser
via `shell.openExternal`; the app itself never downloads it.

## Download

Get the installer from the [Releases](../../releases) page. **v2.0.0** is the first national build
(36 state and federal offshore sources plus the USGS orphan-well overlay, 4,988,314 records); v1.x were
Texas / Oklahoma / Kansas only. The data ships inside the installer, so the downloads are large.

| File | For | Size |
|---|---|---|
| `USWellsMap-2.0.0-mac-arm64.dmg` | Mac with Apple silicon (M1 to M5) | about 345 MB (545 MB installed) |
| `USWellsMap-2.0.0-mac-x64.dmg` | Mac with Intel processor | about 345 MB |
| `USWellsMap-2.0.0-win-x64-setup.exe` | Windows installer | about 350 MB |
| `USWellsMap-2.0.0-win-x64-portable.exe` | Windows, runs without installing | about 350 MB |
| `USWellsMap-source.zip` | Full source code including the built data assets | about 310 MB |
| `SHA256SUMS.txt` | Checksums for every file above | |

(Releases 1.0.0 and 1.1.0 keep their `TexasWellsMap-...` names; the repository name is unchanged.)
The app needs about 1 GB of RAM while running.

## Opening the app (unsigned builds)

The builds are not code-signed, so the operating system warns the first time you open them.

**Mac (Gatekeeper):**
1. Open the `.dmg` and drag **US Wells Map** into **Applications**.
2. Double-click it. macOS says it "cannot be verified". Click **Done** (or **Cancel**).
3. Open **System Settings > Privacy & Security**, scroll down, and click **Open Anyway** next to
   the blocked app. Confirm with **Open Anyway** and your password.
4. After that it opens normally.

If macOS says the app "is damaged", run this once in Terminal, then open it again:
`xattr -dr com.apple.quarantine "/Applications/US Wells Map.app"`

**Windows (SmartScreen):**
1. Run the `setup.exe` (or the `portable.exe`).
2. If "Windows protected your PC" appears, click **More info**, then **Run anyway**.

## Verify the download (checksum)

Compare the output with the line for that file in `SHA256SUMS.txt`.

Mac (Terminal):
```
shasum -a 256 ~/Downloads/USWellsMap-2.0.0-mac-arm64.dmg
```

Windows (Command Prompt):
```
certutil -hashfile %USERPROFILE%\Downloads\USWellsMap-2.0.0-win-x64-setup.exe SHA256
```

## Using the app

- **Sources (left):** one row per source with a checkbox to show or hide it, the number of wells on the
  map, the snapshot date and the exact / approximate / unmapped counts. Click a source name to zoom to
  it; click the arrow to open its well types (grouped by category, with counts), statuses, the
  **Color by Type / Status** switch and, for Federal Offshore, the Gulf / Pacific / Alaska / Atlantic
  region filter. **All / None** show or hide every source. Below the list: the USGS orphan-well overlay
  toggle (orange triangles), the BOEM planning-area / protraction outlines, the approximate-location
  toggle (hollow rings) and the category legend. The header shows the snapshot range; the per-source
  dates are in the list. **US view** returns to the national view.
- **Search (top):**
  - API numbers: 10 digits (`42-389-34010`, `3514777096`, `15-007-20008`), 12 or 14 digits (suffixes
    are dropped; a 12-digit offshore API also selects the exact sidetrack), or 8 digits (Texas RRC form).
    The first two digits pick the source(s); BOEM boreholes that carry a Texas `42` code are searched
    together with Texas and both are listed when they collide (14 APIs do).
  - Regulator ids for sources without API numbers: Virginia file number (`BU-4401`), Indiana IGS id,
    Oregon permit id, Kentucky KGS record number, Louisiana well serial number, Pennsylvania permit
    number, Osage BIA well number. Prefix with the source id to restrict (`VA BU-4401`, `OK_OSAGE 3`).
  - If several records match, the app lists them by source and you pick one. A matching USGS orphan
    record is shown in the panel of the state well, and the other way round.
- **Details (right):** every field for the well, grouped by source layer, with a readable label and
  the raw field name; code values show their description where the regulator publishes a dictionary
  (OK, AL, AR, KY, LA, MT, NY, BOEM, Osage). Joined layers (Texas RRC layers, OK orphan fund and
  completions, LA bottom holes and UIC wells, OH permit/depth record, UT coordinates and history, SD
  completions and formation tops, BOEM GIS well layer) say how they were matched; layers with no record
  for that well say "No record".

## How it works / why no automatic network connections

- Electron app. The window loads its pages and data from a private `app://` scheme served from files
  inside the app. Every other request the app's window tries to make (http, https, ws, file) is
  cancelled in `app/main.js` (`blockNetwork`), and the page has a Content-Security-Policy that only
  allows its own files.
- A clicked document link is passed to the main process. The main process accepts only `http(s)`
  URLs and hands them to the operating system's default browser (`shell.openExternal`).
- There is no auto-updater, no crash reporter upload, and no analytics code.
- The map is drawn with deck.gl (bundled in the app, not loaded from a CDN). The base map is the
  US Census county boundary file (3,144 counties) and state outlines; the Aleutians west of 180 are
  drawn next to the rest of Alaska. There are no street tiles.

## Repository layout

| Path | What |
|---|---|
| `scripts/pull_<st>.py`, `scripts/01_layers.py` ... `05_report.py`, `ok_pull.py`, `ks_pull.py` | One-time polite pulls of each regulator's data into `data/raw/<st>/` (not run in CI) |
| `scripts/pull_boem.py`, `scripts/pull_usgs_orphan.py`, `scripts/pull_basemap.py` | Federal offshore boreholes, USGS orphan wells, Census county basemap |
| `scripts/plss_pull.py`, `scripts/states_pull.py` | BLM CadNSDI PLSS section grids; Census state outlines |
| `scripts/states/<id>.config.mjs` | **One fragment per source**: files, API prefix, columns, PLSS columns, category overrides, caveats |
| `scripts/states.config.mjs` | Loads every fragment; shared categories and color rules |
| `scripts/build_data.mjs`, `scripts/lib/` | Converts the raw data into compact app assets (data-driven), repairs coordinates, places PLSS approximate locations |
| `scripts/build_states.mjs` | State outlines -> `app/assets/data/states.json` |
| `scripts/state_report.mjs` | Snapshot report for one source (`data/<st>_snapshot_report.md`) |
| `scripts/build_check_data.mjs` | Validates the built assets (counts, shards, 50 MB per-file limit) before packaging |
| `app/src/api.mjs` | API number rules shared by the build and the app |
| `data/<st>_codes.json`, `data/<st>_county_meridians.json` | Code dictionaries and county -> meridian tables the build needs (committed) |
| `data/*_snapshot_report.md`, `data/raw/<st>/<st>_snapshot_report.md` | Row counts, coordinates, API quality, type/status counts per source |
| `app/assets/data/` | Built app assets (committed, see below) |
| `app/main.js`, `app/preload.js` | Electron main process (offline guard, local file server, link opener) |
| `app/src/renderer.js`, `app/renderer/` | Map UI |
| `docs/ADDING_A_STATE.md` | Recipe for adding the next source |
| `.github/workflows/release.yml` | Builds installers on a `v*` tag and publishes a Release |

### Data in the repository

The raw downloads (`data/raw/`, several GB) are **not** committed. The compact built assets in
`app/assets/data/` (about 309 MB in total, largest file `points.bin` at 40 MB) **are** committed, so CI
and anyone rebuilding from source never needs to contact a regulator:

- `points.bin` (Float32 lon/lat per well), `types.bin` / `status.bin` (Uint16 legend index),
  `apis.bin` (Uint32 search key: the 8 digits after the state code), `loc.bin` (Uint8: exact,
  repaired, approximate, or not drawn)
- `shards/<source>-<county>.json.br` (brotli JSON, one file per county, per offshore area, or per state
  for the overlay: every field per well plus the joined layer records and location notes)
- `ids/<source>.json.br` (regulator well-id index for sources without API numbers)
- `reference/*.json` (BOEM planning areas and protraction outlines)
- `meta.json` (sources, types, statuses, counts, layer and field definitions, snapshot dates, regions),
  `counties.json` (national county basemap), `states.json` (state outlines and label points)

## Build from source

Requires Node.js 22 or later.

```
cd app
npm ci
npm start                 # run the app in development
npm run dist:mac          # Mac .dmg (arm64 + x64) into app/dist/
npm run dist:mac-arm64    # Mac .dmg, Apple silicon only
npm run dist:win          # Windows setup + portable .exe into app/dist/ (run on Windows)
npm run dist:win-from-mac # Windows build on a Mac (skips exe metadata editing, which needs Wine)
```

To refresh the data (optional, slow, polite one-time downloads; needs Python 3 with `requests`,
`pandas`, `openpyxl`, `pyshp`; Nebraska also needs `mdbtools`):

```
python3 -I scripts/pull_<st>.py           # one source (see the script header for its arguments)
python3 -I scripts/plss_pull.py OK KS AL AR MO MS
python3 -I scripts/pull_basemap.py
python3 -I scripts/states_pull.py
cd app && npm run data                    # all sources -> app/assets/data (about 25 minutes)
for s in AL AK ...; do node ../scripts/state_report.mjs $s; done
npm run check-data
```

## Releases

Push a tag such as `v2.0.0`. The `release` workflow builds the Mac `.dmg` files on macOS and the
Windows installers on Windows, adds a source zip, computes `SHA256SUMS.txt`, and attaches everything
to a GitHub Release.
