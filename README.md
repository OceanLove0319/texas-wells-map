# Texas Wells Map

An offline desktop app (Mac and Windows) that shows every oil and gas well in Texas on a map.
Click a well, or search by API number, to see every field we have for it, grouped by source layer
(Well Locations, Orphan Wells, Injection/Disposal, Well Logs, and so on).

- **Data:** Railroad Commission of Texas (RRC) public GIS, RRC Public Viewer MapServer.
  Snapshot date: **2026-10-09** (shown in the app header). 1,397,386 well location records.
- **Offline:** the app makes **no network connections**. No telemetry, no auto-update, no map tiles,
  no login. All data ships inside the installer.

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

## Opening the app (unsigned builds)

The builds are not code-signed, so the operating system warns the first time you open them.

**Mac (Gatekeeper):**
1. Open the `.dmg` and drag **Texas Wells Map** into **Applications**.
2. Double-click it. macOS says it "cannot be verified". Click **Done** (or **Cancel**).
3. Open **System Settings > Privacy & Security**, scroll down, and click **Open Anyway** next to
   "Texas Wells Map was blocked". Confirm with **Open Anyway** and your password.
4. After that it opens normally.

If macOS says the app "is damaged", run this once in Terminal, then open it again:
`xattr -dr com.apple.quarantine "/Applications/Texas Wells Map.app"`

**Windows (SmartScreen):**
1. Run the `setup.exe` (or the `portable.exe`).
2. If "Windows protected your PC" appears, click **More info**, then **Run anyway**.

## Verify the download (checksum)

Compare the output with the line for that file in `SHA256SUMS.txt`.

Mac (Terminal):
```
shasum -a 256 ~/Downloads/TexasWellsMap-1.0.0-mac-arm64.dmg
```

Windows (Command Prompt):
```
certutil -hashfile %USERPROFILE%\Downloads\TexasWellsMap-1.0.0-win-x64-setup.exe SHA256
```

## Using the app

- **Legend (left):** well types with counts. Uncheck a type to hide it; **All** / **None** toggle every type.
  The legend total equals the number of rows in the RRC Well Locations layer.
- **Search (top):** type an API number: 8-digit RRC form (`38934010`), 10-digit with the Texas
  prefix (`4238934010`), or dashed (`42-389-34010`). The map zooms to the well and opens its details.
- **Details (right):** every field for the well, grouped by source layer, with a readable label and
  the raw RRC field name. Layers with no record for that well say "No record".

## How it works / why no network

- Electron app. The window loads its pages and data from a private `app://` scheme served from files
  inside the app. Every other request (http, https, ws, file) is cancelled in `app/main.js`
  (`blockNetwork`), and the page has a Content-Security-Policy that only allows its own files.
- There is no auto-updater, no crash reporter upload, and no analytics code.
- The map is drawn with deck.gl (bundled in the app, not loaded from a CDN). The base map is Texas
  county outlines from RRC; there are no street tiles.

## Repository layout

| Path | What |
|---|---|
| `scripts/01_layers.py` ... `05_report.py`, `common.py` | One-time throttled pull of the RRC layers into `data/raw/` (not run in CI) |
| `scripts/build_data.mjs` | Converts `data/raw/*` into compact app assets (data-driven: discovers layer files and fields) |
| `scripts/build_check_data.mjs` | Validates the built assets before packaging |
| `app/assets/data/` | Built app assets (committed, see below) |
| `app/main.js`, `app/preload.js` | Electron main process (offline guard, local file server) |
| `app/src/renderer.js`, `app/renderer/` | Map UI |
| `.github/workflows/release.yml` | Builds installers on a `v*` tag and publishes a Release |

### Data in the repository

`data/raw/` (the raw RRC CSV pull, several hundred MB) is **not** committed. The compact built
assets in `app/assets/data/` **are** committed, so CI and anyone rebuilding from source never needs
to contact the RRC:

- `points.bin` (Float32 lon/lat per well), `types.bin` (Uint8 type index), `apis.bin` (Uint32 API)
- `shards/<county code>.json.br` (brotli JSON, one file per county: every field per well plus the
  joined layer records)

Join rules (decided from the data by `build_data.mjs`): a layer joins on `OBJECTID` when every one
of its rows has a Well Locations `OBJECTID` with the same API (orphan wells, commercial disposal,
injection/disposal, HCTS deeper than 15,000 ft, high cost tight sands, EOR H13). Other layers (well
logs, horizontal/directional surface locations) join on the full 8-digit API; wells with a
county-only 3-digit API (about 26%) never get API-joined records. Not included: RRC layer 10
(horizontal/directional lines, no API field) and layer 0 (duplicate of layer 1).
- `meta.json` (types, counts, layer and field definitions, snapshot date), `counties.json` (outlines)

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

To refresh the data from the RRC (optional, slow, polite throttled pull; needs Python 3 with
`requests` and `pandas`):

```
python3 scripts/01_layers.py
python3 scripts/02_pull.py 1:wells 2:orphan_wells 3:commercial_disposal 4:injection_disposal \
  5:hcts_deeper_15000ft 6:high_cost_tight_sands 7:eor_h13_oil_wells 8:well_logs 9:horiz_dir_surface_locations
python3 scripts/04_counties.py
python3 scripts/03_layers_summary.py
python3 scripts/05_report.py
cd app && npm run data    # rebuilds app/assets/data from data/raw
```

## Releases

Push a tag such as `v1.0.0`. The `release` workflow builds the Mac `.dmg` files on macOS and the
Windows installers on Windows, adds a source zip, computes `SHA256SUMS.txt`, and attaches everything
to a GitHub Release.
