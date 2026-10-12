# Snapshot report - Alaska Oil and Gas Conservation Commission (AOGCC) well data (Alaska)

Report generated: 2026-10-12 14:31 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/ak/pull_log.jsonl (ak_wells.csv))  

Pull log:

- `{"name": "ak_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "features": 30, "status": "OK", "finished_utc": "2026-10-12T14:10:04Z"}`
- `{"name": "raw_layer1.jsonl", "layer": "Exploration Surface Hole", "url": "https://maps.commerce.alaska.gov/server/rest/services/AOGCC/AOGCC_SQL_Test/MapServer/1", "rows": 1182, "server_count": 1182, "status": "OK", "source_sr": {"wkid": 4326, "latestWkid": 4326, "xyTolerance": 8.983152841195215e-09, "zTolerance": 0.001, "mTolerance": 0.001, "falseX": -400, "falseY": -400, "xyUnits": 999999999.9999999, "falseZ": -100000, "zUnits": 10000, "falseM": -100000, "mUnits": 10000}, "finished_utc": "2026-10-12T14:10:10Z"}`
- `{"name": "raw_layer5.jsonl", "layer": "Development Surface Hole", "url": "https://maps.commerce.alaska.gov/server/rest/services/AOGCC/AOGCC_SQL_Test/MapServer/5", "rows": 7467, "server_count": 7467, "status": "OK", "source_sr": {"wkid": 4326, "latestWkid": 4326, "xyTolerance": 8.983152841195215e-09, "zTolerance": 0.001, "mTolerance": 0.001, "falseX": -400, "falseY": -400, "xyUnits": 999999999.9999999, "falseZ": -100000, "zUnits": 10000, "falseM": -100000, "mUnits": 10000}, "finished_utc": "2026-10-12T14:11:18Z"}`
- `{"name": "raw_layer9.jsonl", "layer": "Service Injection Surface Hole", "url": "https://maps.commerce.alaska.gov/server/rest/services/AOGCC/AOGCC_SQL_Test/MapServer/9", "rows": 2457, "server_count": 2457, "status": "OK", "source_sr": {"wkid": 4326, "latestWkid": 4326, "xyTolerance": 8.983152841195215e-09, "zTolerance": 0.001, "mTolerance": 0.001, "falseX": -400, "falseY": -400, "xyUnits": 999999999.9999999, "falseZ": -100000, "zUnits": 10000, "falseM": -100000, "mUnits": 10000}, "finished_utc": "2026-10-12T14:11:28Z"}`
- `{"name": "raw_layer13.jsonl", "layer": "Service Disposal Surface Hole", "url": "https://maps.commerce.alaska.gov/server/rest/services/AOGCC/AOGCC_SQL_Test/MapServer/13", "rows": 74, "server_count": 74, "status": "OK", "source_sr": {"wkid": 4326, "latestWkid": 4326, "xyTolerance": 8.983152841195215e-09, "zTolerance": 0.001, "mTolerance": 0.001, "falseX": -400, "falseY": -400, "xyUnits": 999999999.9999999, "falseZ": -100000, "zUnits": 10000, "falseM": -100000, "mUnits": 10000}, "finished_utc": "2026-10-12T14:11:32Z"}`
- `{"name": "raw_layer17.jsonl", "layer": "Gas Storage Surface Hole", "url": "https://maps.commerce.alaska.gov/server/rest/services/AOGCC/AOGCC_SQL_Test/MapServer/17", "rows": 36, "server_count": 36, "status": "OK", "source_sr": {"wkid": 4326, "latestWkid": 4326, "xyTolerance": 8.983152841195215e-09, "zTolerance": 0.001, "mTolerance": 0.001, "falseX": -400, "falseY": -400, "xyUnits": 999999999.9999999, "falseZ": -100000, "zUnits": 10000, "falseM": -100000, "mUnits": 10000}, "finished_utc": "2026-10-12T14:11:36Z"}`
- `{"name": "raw_layer21.jsonl", "layer": "Geothermal  Surface Hole", "url": "https://maps.commerce.alaska.gov/server/rest/services/AOGCC/AOGCC_SQL_Test/MapServer/21", "rows": 17, "server_count": 17, "status": "OK", "source_sr": {"wkid": 4326, "latestWkid": 4326, "xyTolerance": 8.983152841195215e-09, "zTolerance": 0.001, "mTolerance": 0.001, "falseX": -400, "falseY": -400, "xyUnits": 999999999.9999999, "falseZ": -100000, "zUnits": 10000, "falseM": -100000, "mUnits": 10000}, "finished_utc": "2026-10-12T14:11:41Z"}`
- `{"name": "ak_wells.csv", "from": ["Exploration Surface Hole", "Development Surface Hole", "Service Injection Surface Hole", "Service Disposal Surface Hole", "Gas Storage Surface Hole", "Geothermal  Surface Hole"], "rows": 11233, "status": "written", "finished_utc": "2026-10-12T14:11:41Z"}`
- `{"name": "ak_wells.csv", "from": ["Exploration Surface Hole", "Development Surface Hole", "Service Injection Surface Hole", "Service Disposal Surface Hole", "Gas Storage Surface Hole", "Geothermal  Surface Hole"], "rows": 11233, "status": "written", "finished_utc": "2026-10-12T14:27:08Z"}`

## Row count

| what | rows |
|---|---|
| ak_wells.csv (rows in file) | 11,233 |
| wells in the app (meta.json) | 11,233 |
| regulator live count (https://maps.commerce.alaska.gov/server/rest/services/AOGCC/AOGCC_SQL_Test/MapServer, 2026-10-12T14:27:08Z) | 11,233 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon Longitude / LON_4326, lat Latitude / LAT_4326; datum WGS84 per the service (EPSG 4326); AOGCC site says NAD27 - unverified.

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Alaska outline bbox (+0.05 deg) | 0 |
| valid but outside the Alaska outline (Census, generalized; points on the border can fall just outside) | 0 |
| **on the map: exact** | 11,233 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 18 | 11,233 |

Wells with a full API (10 digits starting 50): 11,233; distinct: 6,189; APIs on more than one row: 2,443; without a full API (not searchable by API): 0

## Type (WellStatus)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| 1-OIL | 1-OIL | oil | 3,345 | 3,345 | 0 |
| 2-OIL | 2-OIL | oil | 12 | 12 | 0 |
| CO-2O | CO-2O | oil | 8 | 8 | 0 |
| CO-3O | CO-3O | oil | 1 | 1 | 0 |
| 1-GAS | 1-GAS | gas | 336 | 336 | 0 |
| 2-GAS | 2-GAS | gas | 19 | 19 | 0 |
| 3-GAS | 3-GAS | gas | 1 | 1 | 0 |
| P&A | P&A | plugged | 5,367 | 5,367 | 0 |
| SPLUG | SPLUG | plugged | 1 | 1 | 0 |
| WAGIN | WAGIN | injection | 973 | 973 | 0 |
| 1WINJ | 1WINJ | injection | 590 | 590 | 0 |
| 1GINJ | 1GINJ | injection | 61 | 61 | 0 |
| WDSP2 | WDSP2 | injection | 48 | 48 | 0 |
| WDSP1 | WDSP1 | injection | 23 | 23 | 0 |
| 1WIN2S | 1WIN2S | injection | 14 | 14 | 0 |
| WDSP12 | WDSP12 | injection | 2 | 2 | 0 |
| 2WINJ | 2WINJ | injection | 1 | 1 | 0 |
| SUSP | SUSP | other | 206 | 206 | 0 |
| (blank) | (blank) | other | 64 | 64 | 0 |
| GSTOR | GSTOR | other | 34 | 34 | 0 |
| OBSW | OBSW | other | 31 | 31 | 0 |
| WTRSP | WTRSP | other | 30 | 30 | 0 |
| ADMA | ADMA | other | 27 | 27 | 0 |
| SI | SI | other | 12 | 12 | 0 |
| 2G-GS | 2G-GS | other | 12 | 12 | 0 |
| 1G-GS | 1G-GS | other | 10 | 10 | 0 |
| GEOTH | GEOTH | other | 2 | 2 | 0 |
| UN | UN | other | 2 | 2 | 0 |
| INFO | INFO | other | 1 | 1 | 0 |

## Status (MapWellClass)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| DEV | DEV | - | 7,467 | 7,467 | 0 |
| SVCINJ | SVCINJ | - | 2,457 | 2,457 | 0 |
| EXP | EXP | - | 1,182 | 1,182 | 0 |
| SVCDSP | SVCDSP | - | 74 | 74 | 0 |
| GSTOR | GSTOR | - | 36 | 36 | 0 |
| GEOTH | GEOTH | - | 17 | 17 | 0 |

## Fields (15) and blank counts

| field | label in app | blank |
|---|---|---|
| ObjectID | Object ID | 0 |
| PKey | Pkey | 0 |
| WellId | Wellid | 0 |
| DispName | Dispname | 0 |
| WellClass | Wellclass | 127 |
| MapWellClass | Mapwellclass | 0 |
| WellStatus | Well Status | 64 |
| API | API | 0 |
| WellName | Wellname | 0 |
| Permit | Permit | 0 |
| Longitude | Longitude | 0 |
| Latitude | Latitude | 0 |
| LON_4326 | Longitude (WGS84) | 0 |
| LAT_4326 | Latitude (WGS84) | 0 |
| SRC_LAYER | Src Layer | 0 |

## Source notes (agent, 2026-10-12)

- Source: AOGCC `AOGCC_SQL_Test/MapServer`, six "Surface Hole" point layers (1 Exploration 1,182; 5 Development 7,467; 9 Service Injection 2,457; 13 Service Disposal 74; 17 Gas Storage 36; 21 Geothermal 17), each pulled once with keyset paging; `scripts/pull_ak.py`. Rows pulled = sum of the six server counts = 11,233; SRC_LAYER tags the layer. The "Wells" layers (0, 4, 8, 12, 16, 20) are tables without geometry and were not used.
- The service is literally named "Test" (it backs the AOGCC public well map; it may be renamed or replaced). The AOGCC Data Miner bulk zips sit behind a bot wall (HTTP 403 / "enable JavaScript") and were NOT requested.
- Coordinates: Longitude/Latitude attributes (service EPSG 4326). The AOGCC site describes its coordinates as NAD27; the service metadata says WGS84 - unverified which one the attributes really are (difference under 100 m in Alaska). 0 rows without coordinates; no PLSS columns in the source.
- API: all 11,233 rows have a 14-digit API (50-ccc-nnnnn-ss-cc); 6,189 distinct 10-digit APIs, 2,443 on more than one row (one row per wellbore / surface-hole layer). AOGCC API "county" codes (029, 103, 733, 133, ...) are AOGCC area codes, not Census FIPS: 11,230 of 11,233 rows get no county name in the panel.
- Type = WellStatus (29 AOGCC codes; P&A 5,367; 1-OIL 3,345; WAGIN 973; 1WINJ 590; 1-GAS 336; SUSP 206; ...); status grouping = MapWellClass (DEV 7,467; SVCINJ 2,457; EXP 1,182; SVCDSP 74; GSTOR 36; GEOTH 17). The code readings behind the category overrides (WAGIN, WDSP*, CO-2O, ADMA, SPLUG) are my interpretation and unverified.
- Attributes are thin: no operator, dates, depth or document link in the REST layers.
- Update frequency: not published. Snapshot date shown = pull date.

## Build notes (apply to every state added in this batch)

- Fragment: `scripts/states/<st>.config.mjs` (default export, same schema as a `states.config.mjs` entry). Nothing in `states.config.mjs`, `app/` or docs was changed; this report was produced with a scratch copy of the build that loaded only the new fragments.
- Legend budget: `build_data.mjs` stores type and status indexes as Uint8 (at most 255 types and 254 statuses across ALL states). The twelve fragments of this batch alone add 222 types and 131 statuses; together with TX/OK/KS and the other agents' states the real build will exceed 255 and throw "too many categories for Uint8 encoding" until types.bin / status.bin are widened (Uint16) or indexed per state.
- ArcGIS Date fields were converted from epoch milliseconds to YYYY-MM-DD (UTC) by the pull scripts; all other attributes are verbatim.
