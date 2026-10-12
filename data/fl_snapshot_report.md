# Snapshot report - Florida Department of Environmental Protection (FDEP), Oil and Gas Program well data (Florida)

Report generated: 2026-10-12 14:31 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/fl/pull_log.jsonl (fl_wells.csv))  

Pull log:

- `{"name": "fl_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "features": 67, "status": "OK", "finished_utc": "2026-10-12T14:09:36Z"}`
- `{"name": "raw_layer0.jsonl", "layer": "Permitted Oil and Gas Wells", "url": "https://ca.dep.state.fl.us/arcgis/rest/services/OpenData/OIL_WELLS/MapServer/0", "rows": 1478, "server_count": 1478, "status": "OK", "source_sr": {"wkid": 102967, "latestWkid": 6439, "xyTolerance": 0.001, "zTolerance": 0.001, "mTolerance": 0.001, "falseX": -19550100, "falseY": -7526400, "xyUnits": 10000, "falseZ": -100000, "zUnits": 10000, "falseM": -100000, "mUnits": 10000}, "finished_utc": "2026-10-12T14:10:03Z"}`
- `{"name": "fl_wells.csv", "from": ["Permitted Oil and Gas Wells"], "rows": 1478, "status": "written", "finished_utc": "2026-10-12T14:10:03Z"}`
- `{"name": "fl_wells.csv", "from": ["Permitted Oil and Gas Wells"], "rows": 1478, "status": "written", "finished_utc": "2026-10-12T14:26:11Z"}`

## Row count

| what | rows |
|---|---|
| fl_wells.csv (rows in file) | 1,478 |
| wells in the app (meta.json) | 1,478 |
| regulator live count (https://ca.dep.state.fl.us/arcgis/rest/services/OpenData/OIL_WELLS/MapServer/0, 2026-10-12T14:26:11Z) | 1,478 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon LONGITUDE / LON_4326, lat LATITUDE / LAT_4326; datum not stated by FDEP (lat/long columns; geometry is NAD83(2011) Albers).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Florida outline bbox (+0.05 deg) | 0 |
| valid but outside the Florida outline (Census, generalized; points on the border can fall just outside) | 7 |
| **on the map: exact** | 1,478 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 0 | 6 |
| 3 | 32 |
| 6 | 2 |
| 9 | 1 |
| 10 | 1,265 |
| 11 | 103 |
| 12 | 1 |
| 13 | 67 |
| 14 | 1 |

Wells with a full API (10 digits starting 09): 1,332; distinct: 1,255; APIs on more than one row: 56; without a full API (not searchable by API): 146

## Type (CURRENT_STATUS)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| PROD | PROD | oil | 70 | 70 | 0 |
| PROD/TA | PROD/TA | oil | 6 | 6 | 0 |
| DRY HOLE/P&A | DRY HOLE/P&A | plugged | 718 | 718 | 0 |
| P&A | P&A | plugged | 241 | 241 | 0 |
| PROD/P&A | PROD/P&A | plugged | 38 | 38 | 0 |
| INJ/P&A | INJ/P&A | plugged | 7 | 7 | 0 |
| SWD/P&A | SWD/P&A | plugged | 1 | 1 | 0 |
| INJ | INJ | injection | 32 | 32 | 0 |
| SWD | SWD | injection | 21 | 21 | 0 |
| INJ/TA | INJ/TA | injection | 3 | 3 | 0 |
| N/D | N/D | other | 310 | 310 | 0 |
| JUNKED | JUNKED | other | 13 | 13 | 0 |
| TA | TA | other | 9 | 9 | 0 |
| PENDING | PENDING | other | 4 | 4 | 0 |
| EXPIRED | EXPIRED | other | 1 | 1 | 0 |
| ANODE WELL | ANODE WELL | other | 1 | 1 | 0 |
| PERMIT SURRENDERED | PERMIT SURRENDERED | other | 1 | 1 | 0 |
| DRILLING | DRILLING | other | 1 | 1 | 0 |
| DENIED | DENIED | other | 1 | 1 | 0 |

## Status (HISTORICAL_STATUS)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| DRY HOLE | DRY HOLE | - | 708 | 708 | 0 |
| PRODUCER | PRODUCER | - | 273 | 273 | 0 |
| NEVER DRILLED | NEVER DRILLED | - | 249 | 249 | 0 |
| PRODUCER/P&A | PRODUCER/P&A | - | 31 | 31 | 0 |
| PRODUCER/INJ | PRODUCER/INJ | - | 27 | 27 | 0 |
| N/D | N/D | - | 24 | 24 | 0 |
| PRODUCER/TA | PRODUCER/TA | - | 15 | 15 | 0 |
| PRODUCER/SI | PRODUCER/SI | - | 15 | 15 | 0 |
| SWD SERVICE | SWD SERVICE | - | 14 | 14 | 0 |
| INJECTION | INJECTION | - | 14 | 14 | 0 |
| DENIED | DENIED | - | 13 | 13 | 0 |
| Expired | Expired, EXPIRED | - | 11 | 11 | 0 |
| DRY HOLE/P&A | DRY HOLE/P&A | - | 10 | 10 | 0 |
| JUNKED | JUNKED | - | 10 | 10 | 0 |
| NOT ISSUED | NOT ISSUED | - | 10 | 10 | 0 |
| PRODUCER/WIW | PRODUCER/WIW | - | 8 | 8 | 0 |
| PRODUCER/SWD | PRODUCER/SWD | - | 6 | 6 | 0 |
| Dry Hole/SWD | Dry Hole/SWD | - | 6 | 6 | 0 |
| (blank) | (blank) | - | 6 | 6 | 0 |
| SWD | SWD | - | 5 | 5 | 0 |
| WITHDRAWN | WITHDRAWN, Withdrawn | - | 5 | 5 | 0 |
| DRY HOLE, SI | DRY HOLE, SI | - | 3 | 3 | 0 |
| SWD/SI | SWD/SI | - | 2 | 2 | 0 |
| JUNKED/SERVICE | JUNKED/SERVICE | - | 2 | 2 | 0 |
| SERVICE | SERVICE | - | 2 | 2 | 0 |
| DRY HOLE/WW | DRY HOLE/WW | - | 1 | 1 | 0 |
| SERVICE SWD | SERVICE SWD | - | 1 | 1 | 0 |
| SWD/P&A | SWD/P&A | - | 1 | 1 | 0 |
| DRY HOLE/INJ | DRY HOLE/INJ | - | 1 | 1 | 0 |
| PILOT | PILOT | - | 1 | 1 | 0 |
| JUNKED HOLE | JUNKED HOLE | - | 1 | 1 | 0 |
| P&A'd/Pilot | P&A'd/Pilot | - | 1 | 1 | 0 |
| DRY HOLE/TA | DRY HOLE/TA | - | 1 | 1 | 0 |
| ANODE WELL | ANODE WELL | - | 1 | 1 | 0 |

## Fields (54) and blank counts

| field | label in app | blank |
|---|---|---|
| OBJECTID | Object ID | 0 |
| PERMIT_SORT | Permit Sort | 0 |
| OG_NUMBERS | Og Numbers | 0 |
| DOCUMENTS | Documents | 0 |
| LOCATION | Location | 0 |
| OIL_FIELD | Oil Field | 0 |
| COMPANY | Company | 0 |
| WELL_NAME | Well Name | 0 |
| SCAN | Scan | 764 |
| WELL_LOGS | Well Logs | 49 |
| LOCALE | Locale | 2 |
| FEDLANDS | Fedlands | 4 |
| STR | Str | 45 |
| QSEC | Qsec | 86 |
| LATITUDE | Latitude | 0 |
| LONGITUDE | Longitude | 0 |
| LAT_DDMMSS | Latitude Ddmmss | 0 |
| LONG_DDMMSS | Longitude Ddmmss | 0 |
| SHL | Shl | 1 |
| BHL | BHL | 88 |
| DERRICK_ELEV | Derrick Elev | 395 |
| GRND_ELEV | Grnd Elev | 377 |
| TVD | Tvd | 332 |
| MD | Md | 327 |
| CORES | Cores | 60 |
| PERFS_OPEN_INTERVAL | Perfs Open Interval | 25 |
| PLUGS | Plugs | 127 |
| BHT_DEG_F | Bht Deg F | 591 |
| WNUMBER | Wnumber | 38 |
| PA_NUMBERS | Pa Numbers | 1,244 |
| COMMENTS | Comments | 1,181 |
| PERMITNO | Permitno | 0 |
| COUNTY | County | 0 |
| CURRENT_STATUS | Current Status | 0 |
| HISTORICAL_STATUS | Historical Status | 6 |
| SPUD_DATE | Spud Date | 322 |
| PLUG_DATE | Plug Date | 452 |
| COMPLETION_DATE | Completion Date | 612 |
| ISSUE_DATE | Issue Date | 47 |
| COND_CSG | Cond Csg | 8 |
| SURF_CSG | Surf Csg | 4 |
| INT_CSG | Int Csg | 21 |
| PROD_CSG | Prod Csg | 26 |
| TUBING | Tubing | 32 |
| SAMPLES | Samples | 57 |
| CORE_ANALY | Core Analy | 73 |
| DR_STM_TST | Dr Stm Tst | 65 |
| TEST_OIL | Test Oil | 40 |
| TEST_GAS | Test Gas | 40 |
| TEST_WATER | Test Water | 41 |
| API_NO | API No. | 6 |
| OIL_SHOW | Oil Show | 1,434 |
| LON_4326 | Longitude (WGS84) | 0 |
| LAT_4326 | Latitude (WGS84) | 0 |

## Source notes (agent, 2026-10-12)

- Source: FDEP `OpenData/OIL_WELLS/MapServer/0` "Permitted Oil and Gas Wells", two pages of 1,000; `scripts/pull_fl.py`. Rows pulled = server count = 1,478.
- Coordinates: LATITUDE/LONGITUDE attributes (datum not stated by FDEP) first, then LON_4326/LAT_4326 (server reprojection from FL GDL Albers, EPSG 6439). 0 wells without coordinates (STR "S19 T23S R18E" and QSEC kept raw, no grid needed).
- API: 1,264 rows 10 digits, 68 rows 12 digits, 1 row 11, 145 blank (never-drilled / denied permits; not searchable). 56 APIs on more than one row. 32 wells carry API county codes that are not Census FIPS (025 Dade, 287 Monroe, offshore/state-waters codes): no county name for those.
- DOCUMENTS (DEP Nexus well file) and LOCATION (MapDirect) are links on every row.
- Type = CURRENT_STATUS (19 values; PROD mapped to oil because Florida production is oil); status = HISTORICAL_STATUS (37 raw values, 34 after case merge).
- Update frequency: not published. Snapshot date shown = pull date.
- Dates (SPUD_DATE, PLUG_DATE, COMPLETION_DATE, ISSUE_DATE) converted from epoch ms to YYYY-MM-DD (UTC).

## Build notes (apply to every state added in this batch)

- Fragment: `scripts/states/<st>.config.mjs` (default export, same schema as a `states.config.mjs` entry). Nothing in `states.config.mjs`, `app/` or docs was changed; this report was produced with a scratch copy of the build that loaded only the new fragments.
- Legend budget: `build_data.mjs` stores type and status indexes as Uint8 (at most 255 types and 254 statuses across ALL states). The twelve fragments of this batch alone add 222 types and 131 statuses; together with TX/OK/KS and the other agents' states the real build will exceed 255 and throw "too many categories for Uint8 encoding" until types.bin / status.bin are widened (Uint16) or indexed per state.
- ArcGIS Date fields were converted from epoch milliseconds to YYYY-MM-DD (UTC) by the pull scripts; all other attributes are verbatim.
