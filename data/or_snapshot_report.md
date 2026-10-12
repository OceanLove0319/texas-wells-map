# Snapshot report - Oregon Department of Geology and Mineral Industries (DOGAMI), MLRR well data (Oregon)

Report generated: 2026-10-12 14:31 UTC  
Data date shown in the app: **2021-01-29** (from data/raw/or/pull_log.jsonl (or_wells.csv, data_date))  

Pull log:

- `{"name": "OG_Permits_01-29-2021.xls", "url": "https://www.oregon.gov/dogami/mlrr/spreadsheets/OG_Permits_01-29-2021.xls", "bytes": 251392, "last_modified": "Fri, 08 May 2026 02:55:30 GMT", "content_type": "application/vnd.ms-excel", "status": "downloaded", "finished_utc": "2026-10-12T14:03:00Z"}`
- `{"name": "or_wells.csv", "from": "OG_Permits_01-29-2021.xls", "rows": 714, "data_date": "2021-01-29", "status": "written", "finished_utc": "2026-10-12T14:10:37Z"}`
- `{"name": "or_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "features": 36, "status": "OK", "finished_utc": "2026-10-12T14:10:39Z"}`
- `{"name": "or_wells.csv", "from": "OG_Permits_01-29-2021.xls", "rows": 713, "dropped_test_rows": ["99-999-99999"], "data_date": "2021-01-29", "status": "written", "finished_utc": "2026-10-12T14:13:25Z"}`

## Row count

| what | rows |
|---|---|
| or_wells.csv (rows in file) | 713 |
| wells in the app (meta.json) | 713 |
| regulator live count (https://www.oregon.gov/dogami/mlrr/spreadsheets/OG_Permits_01-29-2021.xls, 2026-10-12T14:13:25Z) | 713 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon LON_4326, lat LAT_4326; datum not stated by DOGAMI (decimal degrees).

| what | wells |
|---|---|
| null or 0 | 2 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Oregon outline bbox (+0.05 deg) | 0 |
| valid but outside the Oregon outline (Census, generalized; points on the border can fall just outside) | 9 |
| **on the map: exact** | 711 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 2 |

Why wells without usable coordinates could not be placed:

- state has no PLSS: 2

## API

| raw API length | wells |
|---|---|
| 12 | 673 |
| 15 | 40 |

Wells with a full API (10 digits starting 36): 700; distinct: 657; APIs on more than one row: 39; without a full API (not searchable by API): 13

## Type (WellType)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Producer | Producer | gas | 54 | 54 | 0 |
| Former producer - plugged | Former producer - plugged | plugged | 1 | 1 | 0 |
| Never produced - plugged | Never produced - plugged | plugged | 1 | 1 | 0 |
| Gas Injection/Withdrawal | Gas Injection/Withdrawal | injection | 21 | 21 | 0 |
| Gas Injection/Withdrawl | Gas Injection/Withdrawl | injection | 5 | 5 | 0 |
| Water Disposal | Water Disposal | injection | 2 | 2 | 0 |
| Dry Hole | Dry Hole | dry | 2 | 2 | 0 |
| (blank) | (blank) | other | 555 | 553 | 0 |
| Exploration | Exploration | other | 31 | 31 | 0 |
| Observation | Observation | other | 16 | 16 | 0 |
| Monitoring | Monitoring | other | 13 | 13 | 0 |
| Not drilled | Not drilled, Not Drilled | other | 8 | 8 | 0 |
| Information | Information | other | 4 | 4 | 0 |

## Status (Status)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Unknown | Unknown | - | 261 | 260 | 0 |
| Closed | Closed | - | 180 | 180 | 0 |
| Cancelled | Cancelled | - | 160 | 159 | 0 |
| Permitted | Permitted | - | 89 | 89 | 0 |
| Denied | Denied | - | 14 | 14 | 0 |
| Withdrawn | Withdrawn | - | 8 | 8 | 0 |
| Admin | Admin | - | 1 | 1 | 0 |

## Fields (19) and blank counts

| field | label in app | blank |
|---|---|---|
| PermitID | Permitid | 0 |
| WellName | Wellname | 485 |
| SiteName | Sitename | 171 |
| Permittee | Permittee | 0 |
| PermitType | Permittype | 0 |
| WellType | Well Type | 555 |
| Status | Status | 0 |
| County | County | 0 |
| ApplicationDate | Applicationdate | 112 |
| Depth | Depth | 249 |
| Township | Township | 13 |
| Range | Range | 13 |
| Section | Section | 2 |
| QrtSection | Qrtsection | 21 |
| Latitude | Latitude | 2 |
| Longitude | Longitude | 2 |
| SRC_SHEET | Src Sheet | 0 |
| LON_4326 | Longitude (WGS84) | 2 |
| LAT_4326 | Latitude (WGS84) | 2 |

## Source notes (agent, 2026-10-12)

- DATA LAST UPDATED 2021-01-29. Source: DOGAMI static spreadsheet `OG_Permits_01-29-2021.xls` (251 KB, server Last-Modified 2026-05-08 but the content is the 2021-01-29 permit query; no REST service exists for Oregon wells). `scripts/pull_or.py`; the header date comes from the pull log's `data_date` = 2021-01-29.
- Rows: sheet "prmqry_E_OG_Permits_Other" 625 (research count) + sheet "PermittedOnly" 89 = 714; DOGAMI's own "99-999-99999 / Dummy File / test" row was dropped -> 713 rows. One PermitID (36-009-00015) appears in both sheets; SRC_SHEET says which. source_count.json = 713 (no live count exists).
- Key: no API numbers. PermitID is in API form (36-ccc-nnnnn, 53 with a -01/-02 sidetrack suffix) and is used as the search key: 669 rows 10 digits + 40 rows 12 digits are searchable (657 distinct, 39 on more than one row). Not searchable: 8 offshore permits with prefix 56 (56-331-20001 ...) and 5 ids ending in a letter (36-011-0000A ...).
- Coordinates: Longitude/Latitude columns (datum not stated). 2 permits without coordinates and without PLSS (36-005-00004 Rose 2, 36-009-00207 CFI 12-05): unmapped. No BLM grid pulled.
- Type WellType: blank 555, Producer 54 (mapped to gas - Oregon's only production is the Mist gas field), Exploration 31, Gas Injection/Withdrawal 26 (two spellings), Observation 16, Monitoring 13, other 18. Status: Unknown 262, Closed 180, Cancelled 160, Permitted 89, Denied 14, Withdrawn 8, Admin 1.
- ApplicationDate converted from an Excel serial to YYYY-MM-DD. Depth is in feet (as given).
- Unverified: whether DOGAMI PermitIDs are registered API numbers; whether a newer permit list exists anywhere else (the MLRR page only offers this file).

## Build notes (apply to every state added in this batch)

- Fragment: `scripts/states/<st>.config.mjs` (default export, same schema as a `states.config.mjs` entry). Nothing in `states.config.mjs`, `app/` or docs was changed; this report was produced with a scratch copy of the build that loaded only the new fragments.
- Legend budget: `build_data.mjs` stores type and status indexes as Uint8 (at most 255 types and 254 statuses across ALL states). The twelve fragments of this batch alone add 222 types and 131 statuses; together with TX/OK/KS and the other agents' states the real build will exceed 255 and throw "too many categories for Uint8 encoding" until types.bin / status.bin are widened (Uint16) or indexed per state.
- ArcGIS Date fields were converted from epoch milliseconds to YYYY-MM-DD (UTC) by the pull scripts; all other attributes are verbatim.
