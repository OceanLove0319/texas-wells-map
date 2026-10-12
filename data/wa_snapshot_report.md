# Snapshot report - Washington Geological Survey (DNR) well data (Washington)

Report generated: 2026-10-12 14:31 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/wa/pull_log.jsonl (wa_wells.csv))  

Pull log:

- `{"name": "wa_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "features": 39, "status": "OK", "finished_utc": "2026-10-12T14:09:31Z"}`
- `{"name": "raw_layer1.jsonl", "layer": "Oil and Gas Wells", "url": "https://gis.dnr.wa.gov/site1/rest/services/Public_Geology/Oil_and_Gas_Wells/MapServer/1", "rows": 830, "server_count": 830, "status": "OK", "source_sr": {"wkid": 2927, "latestWkid": 2927, "xyTolerance": 0.003280833333333333, "zTolerance": 0.001, "mTolerance": 0.001, "falseX": -117498300, "falseY": -98850300, "xyUnits": 3048.0060960121928, "falseZ": -100000, "zUnits": 10000, "falseM": -100000, "mUnits": 10000}, "finished_utc": "2026-10-12T14:09:35Z"}`
- `{"name": "wa_wells.csv", "from": ["Oil and Gas Wells"], "rows": 830, "status": "written", "finished_utc": "2026-10-12T14:09:35Z"}`
- `{"name": "wa_wells.csv", "from": ["Oil and Gas Wells"], "rows": 830, "status": "written", "finished_utc": "2026-10-12T14:26:09Z"}`

## Row count

| what | rows |
|---|---|
| wa_wells.csv (rows in file) | 830 |
| wells in the app (meta.json) | 830 |
| regulator live count (https://gis.dnr.wa.gov/site1/rest/services/Public_Geology/Oil_and_Gas_Wells/MapServer/1, 2026-10-12T14:26:09Z) | 830 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon LON_4326 / LONGITUDE, lat LAT_4326 / LATITUDE; datum WGS84 (reprojected by the service from WA State Plane South, EPSG 2927, NAD83 HARN).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Washington outline bbox (+0.05 deg) | 0 |
| valid but outside the Washington outline (Census, generalized; points on the border can fall just outside) | 0 |
| **on the map: exact** | 830 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 10 | 830 |

Wells with a full API (10 digits starting 46): 830; distinct: 809; APIs on more than one row: 19; without a full API (not searchable by API): 0

## Type (WELL_STATUS)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Plugged and abandoned | Plugged and abandoned | plugged | 92 | 92 | 0 |
| Completed, plugged, and abandoned | Completed, plugged, and abandoned | plugged | 20 | 20 | 0 |
| Drilled | Drilled | other | 687 | 687 | 0 |
| Completed | Completed | other | 29 | 29 | 0 |
| Converted to water well | Converted to water well | other | 2 | 2 | 0 |

## Status (HYDROCARBON_SHOW)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| (blank) | (blank) | - | 578 | 578 | 0 |
| gas | gas | - | 156 | 156 | 0 |
| gas, oil | gas, oil | - | 63 | 63 | 0 |
| oil | oil | - | 33 | 33 | 0 |

## Fields (29) and blank counts

| field | label in app | blank |
|---|---|---|
| OBJECTID | Object ID | 0 |
| OIL_GAS_ID | Oil Gas ID | 0 |
| API_NUMBER | API Number | 0 |
| WA_FILE_NUMBER | Wa File Number | 0 |
| WELL_NAME | Well Name | 0 |
| ALTERNATE_NAMES | Alternate Names | 679 |
| COMPANY_NAME | Company Name | 0 |
| ELEVATION_REFERENCE | Elevation Reference | 538 |
| ELEVATION_FEET | Elevation Feet | 0 |
| DEPTH_FEET | Depth Feet | 0 |
| PERMIT_DATE | Permit Date | 717 |
| DRILL_START_DATE | Drill Start Date | 43 |
| DATE_COMMENTS | Date Comments | 542 |
| DRILL_STOP_DATE | Drill Stop Date | 418 |
| HYDROCARBON_SHOW | Hydrocarbon Show | 578 |
| TOWNSHIP | Township | 0 |
| RANGE | Range | 0 |
| SECTION | Section | 0 |
| LOCATION_DESCRIPTION | Location Description | 0 |
| WELL_STATUS | Well Status | 0 |
| SCANNED_DOCUMENTS_FLAG | Scanned Documents Flag | 0 |
| PERMIT_FLAG | Permit Flag | 0 |
| COMMENTS | Comments | 73 |
| COUNTY | County | 0 |
| LATITUDE | Latitude | 0 |
| LONGITUDE | Longitude | 0 |
| LON_4326 | Longitude (WGS84) | 0 |
| LAT_4326 | Latitude (WGS84) | 0 |
| API | API | 0 |

## Source notes (agent, 2026-10-12)

- Source: Washington Geological Survey `Public_Geology/Oil_and_Gas_Wells/MapServer/1`, one request of 830 rows; `scripts/pull_wa.py`. Rows pulled = server count = 830.
- API: WA writes API_NUMBER as "046-041-00188" (state code zero-padded to 3 digits). The pull adds `API` = 10-digit "4604100188" (all 830 rows converted; 19 APIs on more than one row). The county part equals Census FIPS.
- Coordinates: LON_4326/LAT_4326 (server reprojection from WA State Plane South, EPSG 2927) first, then the LATITUDE/LONGITUDE attributes. The two agree within 2e-6 deg for 829 wells; one well differs by 0.02 deg (about 2 km) - the geometry was used. 0 wells without coordinates (TOWNSHIP/RANGE/SECTION kept raw, no grid needed).
- WA has no well-type column: legend type = WELL_STATUS (Drilled 687, Plugged and abandoned 92, Completed 29, Completed/plugged 20, Converted to water well 2); status grouping = HYDROCARBON_SHOW (blank 578, gas 156, gas+oil 63, oil 33).
- Update frequency: "irregular" per the service description; license "as is". Snapshot date shown = pull date.
- Dates (PERMIT_DATE, DRILL_START_DATE, DRILL_STOP_DATE) converted from epoch ms to YYYY-MM-DD (UTC).

## Build notes (apply to every state added in this batch)

- Fragment: `scripts/states/<st>.config.mjs` (default export, same schema as a `states.config.mjs` entry). Nothing in `states.config.mjs`, `app/` or docs was changed; this report was produced with a scratch copy of the build that loaded only the new fragments.
- Legend budget: `build_data.mjs` stores type and status indexes as Uint8 (at most 255 types and 254 statuses across ALL states). The twelve fragments of this batch alone add 222 types and 131 statuses; together with TX/OK/KS and the other agents' states the real build will exceed 255 and throw "too many categories for Uint8 encoding" until types.bin / status.bin are widened (Uint16) or indexed per state.
- ArcGIS Date fields were converted from epoch milliseconds to YYYY-MM-DD (UTC) by the pull scripts; all other attributes are verbatim.
