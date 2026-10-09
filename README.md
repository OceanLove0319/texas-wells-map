# Texas & Oklahoma Wells Map

An offline desktop app (Mac and Windows) that shows every oil and gas well in Texas and Oklahoma on
one map. Click a well, or search by API number, to see every field we have for it, grouped by source
layer.

| State | Source | Snapshot | Wells | On the map | No location (not drawn) |
|---|---|---|---|---|---|
| Texas | Railroad Commission of Texas (RRC) public GIS, RRC Public Viewer MapServer | 2026-10-09 | 1,397,386 | 1,397,386 | 0 |
| Oklahoma | Oklahoma Corporation Commission (OCC): `rbdms-wells.csv` nightly file + OCC GIS FeatureServer | 2026-10-09 | 457,138 | 442,409 | 14,729 (14,707 null/0 + 22 invalid) |

Oklahoma wells with null or 0 coordinates (14,707), plus 22 whose coordinates are outside any valid
latitude/longitude (for example a missing decimal point, `-1007768207`), are left off the map and out
of the legend counts, but you can still find them by API search. Both snapshot dates are shown in the app header.

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
  well types with counts. Oklahoma also has well statuses (filterable) and a **Color by Type / Status**
  switch. Counts are wells on the map. Each state's footer shows mapped, shown, and no-location counts.
- **Search (top):** type an API number.
  - Texas: 8-digit RRC form (`38934010`), or 10 digits with the `42` prefix (`4238934010`, `42-389-34010`).
  - Oklahoma: 10 digits starting with `35` (`3514777096` or `35-147-77096`).
  - An 8-digit number is always treated as Texas. Each state has its own search key, so a Texas
    API and an Oklahoma API can never match each other. If several wells share an API, the app
    lists them and you pick one.
- **Details (right):** every field for the well, grouped by source layer, with a readable label and
  the raw field name. Oklahoma status and type codes also show their description from the OCC data
  dictionary. Layers with no record for that well say "No record".
  - Texas layers: Well Locations, Orphan Wells, Commercial Disposal, Injection/Disposal, HCTS
    Deeper than 15,000 ft., High Cost Tight Sands, EOR H13 Oil Wells, Well Logs, Horiz/Dir Surface
    Locations.
  - Oklahoma layers: Well, Orphan Fund, Completion Report.

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
| `scripts/build_data.mjs` | Converts the raw data into compact app assets (data-driven: discovers layer files and fields) |
| `scripts/build_check_data.mjs` | Validates the built assets (counts, shards, 50 MB per-file limit) before packaging |
| `data/snapshot_report.md`, `data/ok_snapshot_report.md` | Row counts, nulls, join coverage, type/status counts for each snapshot |
| `data/ok_codes.json` | OCC well status / well type code descriptions (from the OCC data dictionary) |
| `app/assets/data/` | Built app assets (committed, see below) |
| `app/main.js`, `app/preload.js` | Electron main process (offline guard, local file server, link opener) |
| `app/src/renderer.js`, `app/renderer/` | Map UI |
| `.github/workflows/release.yml` | Builds installers on a `v*` tag and publishes a Release |

### Data in the repository

The raw downloads (`data/raw/`, several hundred MB) are **not** committed. The compact built assets
in `app/assets/data/` (about 94 MB in total, no file over 15 MB) **are** committed, so CI and anyone
rebuilding from source never needs to contact the RRC or OCC:

- `points.bin` (Float32 lon/lat per well), `types.bin` / `status.bin` (Uint8 category index),
  `apis.bin` (Uint32 search key: Texas 8-digit API, Oklahoma 10-digit API)
- `shards/<state>-<county code>.json.br` (brotli JSON, one file per county: every field per well
  plus the joined layer records)
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
# Rebuild the app assets
cd app && npm run data
```

## Releases

Push a tag such as `v1.1.0`. The `release` workflow builds the Mac `.dmg` files on macOS and the
Windows installers on Windows, adds a source zip, computes `SHA256SUMS.txt`, and attaches everything
to a GitHub Release.
