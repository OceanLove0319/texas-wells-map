# Wells Map (Texas, Oklahoma, Kansas)

An offline desktop app (Mac and Windows) that shows every oil and gas well in Texas, Oklahoma and
Kansas on one map. More states are added one at a time; see [docs/ADDING_A_STATE.md](docs/ADDING_A_STATE.md). Click a well, or search by API number, to see every field we have for it, grouped by source
layer.

| State | Source | Snapshot | Wells | On the map | No location (not drawn) |
|---|---|---|---|---|---|
| Texas | Railroad Commission of Texas (RRC) public GIS, RRC Public Viewer MapServer | 2026-10-09 | 1,397,386 | 1,397,386 | 0 |
| Oklahoma | Oklahoma Corporation Commission (OCC): `rbdms-wells.csv` nightly file + OCC GIS FeatureServer | 2026-10-09 | 457,138 | 456,337 (442,409 exact + 17 repaired + 13,911 approximate) | 801 |
| Kansas | Kansas Geological Survey (KGS): `ks_wells.zip` bulk file (built 2026-09-11) | 2026-09-11 | 519,568 | 519,518 | 50 |

- **Repaired coordinates:** 17 Oklahoma wells had a coordinate with a lost decimal point (for example
  `-1007768207`). They are drawn at the corrected point because exactly one correction lands inside
  Oklahoma and next to the well's PLSS section. The panel says what was changed.
- **Approximate locations:** 13,911 Oklahoma wells have no usable coordinates in the OCC file but do have
  meridian/township/range/section. They are drawn as hollow rings at the center of the section (or of
  the quarter call), using the BLM CadNSDI PLSS grid, and the panel says "Location: APPROXIMATE".
  Checked against wells that have real coordinates, this method is off by a median of 0.04 km.
- **Unmapped** wells (no usable location at all) are left off the map and out of the legend counts, but
  you can still find them by API search. Each state's snapshot date is shown in the app header.
- Kansas coordinates are NAD27 as published by KGS (a few tens of meters from WGS84 in Kansas). The KGS
  live service had 65 more wells on 2026-10-09 than the 2026-09-11 bulk file.

**No automatic network connections.** The app does not connect to anything by itself: no telemetry,
no auto-update, no map tiles, no login. All data ships inside the installer. The only time anything
leaves your computer is when **you click** an Oklahoma "Well Records Documents" link in the details
panel. That link opens in your default web browser (via `shell.openExternal`). The app itself never
downloads it.

## Download

Get the installer from the [Releases](../../releases) page:

| File | For |
|---|---|
| `TexasWellsMap-<version>-mac-arm64.dmg` | Mac with Apple silicon (M1 to M5) |
| `TexasWellsMap-<version>-mac-x64.dmg` | Mac with Intel processor |
| `TexasWellsMap-<version>-win-x64-setup.exe` | Windows installer |
| `TexasWellsMap-<version>-win-x64-portable.exe` | Windows, runs without installing |
| `TexasWellsMap-source.zip` | Full source code |
| `SHA256SUMS.txt` | Checksums for every file above |

(The file names keep the original `TexasWellsMap` prefix so existing links keep working.)

## Opening the app (unsigned builds)

The builds are not code-signed, so the operating system warns the first time you open them.

**Mac (Gatekeeper):**
1. Open the `.dmg` and drag **Texas and Oklahoma Wells Map** into **Applications**.
2. Double-click it. macOS says it "cannot be verified". Click **Done** (or **Cancel**).
3. Open **System Settings > Privacy & Security**, scroll down, and click **Open Anyway** next to
   the blocked app. Confirm with **Open Anyway** and your password.
4. After that it opens normally.

If macOS says the app "is damaged", run this once in Terminal, then open it again:
`xattr -dr com.apple.quarantine "/Applications/Texas and Oklahoma Wells Map.app"`

**Windows (SmartScreen):**
1. Run the `setup.exe` (or the `portable.exe`).
2. If "Windows protected your PC" appears, click **More info**, then **Run anyway**.

## Verify the download (checksum)

Compare the output with the line for that file in `SHA256SUMS.txt`.

Mac (Terminal):
```
shasum -a 256 ~/Downloads/TexasWellsMap-1.1.0-mac-arm64.dmg
```

Windows (Command Prompt):
```
certutil -hashfile %USERPROFILE%\Downloads\TexasWellsMap-1.1.0-win-x64-setup.exe SHA256
```

## Using the app

- **Legend (left):** one section per state with a checkbox to show or hide the whole state, then
  well types grouped by category with counts. Categories share colors across states (oil green, gas
  red, plugged/abandoned gray, injection/disposal blue, dry hole orange, permit/other purple). Spelling
  variants (Oklahoma `Gas`/`GAS`, `2RIn`/`2RIN`) are one legend entry; the raw value is still shown in
  the details. Oklahoma and Kansas also have well statuses (filterable) and a **Color by Type / Status**
  switch. Counts are wells on the map. Each state's footer shows source rows, exact, approximate and
  unmapped counts. "Show approximate locations" hides or shows the hollow-ring wells.
- **Search (top):** type an API number.
  - Texas: 8-digit RRC form (`38934010`), or 10 digits with the `42` prefix (`4238934010`, `42-389-34010`).
  - Oklahoma: 10 digits starting with `35` (`3514777096` or `35-147-77096`).
  - Kansas: 10 digits starting with `15` (`1500720008` or `15-007-20008`; a 14-digit API with suffix also works).
  - An 8-digit number is always treated as Texas. The first two digits of a 10-digit API pick the state,
    and each state is searched separately, so APIs of different states can never match each other.
    If several wells share an API, the app lists them and you pick one.
- **Details (right):** every field for the well, grouped by source layer, with a readable label and
  the raw field name. Oklahoma status and type codes also show their description from the OCC data
  dictionary. Layers with no record for that well say "No record".
  - Texas layers: Well Locations, Orphan Wells, Commercial Disposal, Injection/Disposal, HCTS
    Deeper than 15,000 ft., High Cost Tight Sands, EOR H13 Oil Wells, Well Logs, Horiz/Dir Surface
    Locations.
  - Oklahoma layers: Well, Orphan Fund, Completion Report.
  - Kansas layer: Well (all 43 KGS columns).

## How it works / why no automatic network connections

- Electron app. The window loads its pages and data from a private `app://` scheme served from files
  inside the app. Every other request the app's window tries to make (http, https, ws, file) is
  cancelled in `app/main.js` (`blockNetwork`), and the page has a Content-Security-Policy that only
  allows its own files.
- A clicked document link is passed to the main process. The main process accepts only `http(s)`
  URLs and hands them to the operating system's default browser.
- There is no auto-updater, no crash reporter upload, and no analytics code.
- The map is drawn with deck.gl (bundled in the app, not loaded from a CDN). The base map is
  county outlines: Texas from the RRC, Oklahoma from the US Census TIGERweb counties layer.
  There are no street tiles.

## Repository layout

| Path | What |
|---|---|
| `scripts/01_layers.py` ... `05_report.py`, `common.py` | One-time throttled pull of the RRC layers into `data/raw/` (not run in CI) |
| `scripts/ok_pull.py`, `scripts/ok_report.py` | One-time polite pull of the OCC data into `data/raw/ok/`, plus its snapshot report and code dictionary |
| `scripts/ks_pull.py` | One-time polite pull of the KGS bulk file into `data/raw/ks/` |
| `scripts/plss_pull.py` | One-time polite pull of the BLM CadNSDI PLSS section grid per state into `data/raw/plss/` |
| `scripts/states_pull.py`, `scripts/build_states.mjs` | US state outlines (Census) for the state boundary layer and the coordinate-repair check |
| `scripts/states.config.mjs` | **One entry per state**: files, API prefix, columns, PLSS columns, category overrides |
| `scripts/build_data.mjs`, `scripts/lib/` | Converts the raw data into compact app assets (data-driven), repairs coordinates, places PLSS approximate locations |
| `scripts/state_report.mjs` | Generic snapshot report for a state (`data/ks_snapshot_report.md`) |
| `app/src/api.mjs` | API number rules shared by the build and the app |
| `docs/ADDING_A_STATE.md` | Recipe for adding the next state |
| `scripts/build_check_data.mjs` | Validates the built assets (counts, shards, 50 MB per-file limit) before packaging |
| `data/snapshot_report.md`, `data/ok_snapshot_report.md`, `data/ks_snapshot_report.md` | Row counts, nulls, join coverage, type/status counts for each snapshot |
| `data/ok_codes.json` | OCC well status / well type code descriptions (from the OCC data dictionary) |
| `app/assets/data/` | Built app assets (committed, see below) |
| `app/main.js`, `app/preload.js` | Electron main process (offline guard, local file server, link opener) |
| `app/src/renderer.js`, `app/renderer/` | Map UI |
| `.github/workflows/release.yml` | Builds installers on a `v*` tag and publishes a Release |

### Data in the repository

The raw downloads (`data/raw/`, several hundred MB) are **not** committed. The compact built assets
in `app/assets/data/` (about 128 MB in total, no file over 20 MB) **are** committed, so CI and anyone
rebuilding from source never needs to contact a regulator:

- `points.bin` (Float32 lon/lat per well), `types.bin` / `status.bin` (Uint8 category index),
  `apis.bin` (Uint32 search key: the 8 digits after the state code), `loc.bin` (Uint8: exact,
  repaired, approximate, or not drawn)
- `shards/<state>-<county code>.json.br` (brotli JSON, one file per county: every field per well
  plus the joined layer records and location notes)
- `meta.json` (states, types, statuses, counts, layer and field definitions, snapshot dates),
  `counties.json` (outlines for both states)

Join rules (decided from the data by `build_data.mjs`):
- **Texas:** a layer joins on `OBJECTID` when every one of its rows has a Well Locations `OBJECTID`
  with the same API (orphan wells, commercial disposal, injection/disposal, HCTS, high cost tight
  sands, EOR H13). Well logs and horizontal/directional surface locations join on the full 8-digit
  API. Wells with a county-only 3-digit API (about 26%) never get API-joined records. Not included:
  RRC layer 10 (horizontal/directional lines, no API field) and layer 0 (duplicate of layer 1).
- **Oklahoma:** Orphan Fund (`api`) and Completion Report (`api_number`) join on the 10-digit API.
  All 18,136 orphan-fund rows and all 9,466 completion-report rows (2,613 wells) match a well.
- **Kansas:** one base file, no extra layers.

## Build from source

Requires Node.js 22 or later.

```
cd app
npm ci
npm start                 # run the app in development
npm run dist:mac          # Mac .dmg (arm64 + x64) into app/dist/
npm run dist:win          # Windows setup + portable .exe into app/dist/ (run on Windows)
npm run dist:win-from-mac # Windows build on a Mac (skips exe metadata editing, which needs Wine)
```

To refresh the data (optional, slow, polite one-time downloads; needs Python 3 with `requests`,
`pandas` and `openpyxl`):

```
# Texas (RRC)
python3 scripts/01_layers.py
python3 scripts/02_pull.py 1:wells 2:orphan_wells 3:commercial_disposal 4:injection_disposal \
  5:hcts_deeper_15000ft 6:high_cost_tight_sands 7:eor_h13_oil_wells 8:well_logs 9:horiz_dir_surface_locations
python3 scripts/04_counties.py
python3 scripts/03_layers_summary.py
python3 scripts/05_report.py
# Oklahoma (OCC)
python3 scripts/ok_pull.py
python3 scripts/ok_report.py
# Kansas (KGS)
python3 -I scripts/ks_pull.py
# PLSS section grids for approximate locations
python3 -I scripts/plss_pull.py OK KS
# Rebuild the app assets and the Kansas report
cd app && npm run data && node ../scripts/state_report.mjs KS
```

## Releases

Push a tag such as `v1.1.0`. The `release` workflow builds the Mac `.dmg` files on macOS and the
Windows installers on Windows, adds a source zip, computes `SHA256SUMS.txt`, and attaches everything
to a GitHub Release.
