# Snapshot report - Nevada Division of Minerals (NDOM) well data (Nevada)

Report generated: 2026-10-12 14:31 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/nv/pull_log.jsonl (nv_wells.csv))  

Pull log:

- `{"name": "nv_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "features": 17, "status": "OK", "finished_utc": "2026-10-12T14:09:18Z"}`
- `{"name": "raw_layer1.jsonl", "layer": "Oil Well Locations", "url": "https://services.arcgis.com/CXYUMoYknZtf5Qr3/arcgis/rest/services/OGHistoricData/FeatureServer/1", "rows": 745, "server_count": 745, "status": "OK", "source_sr": {"wkid": 26911, "latestWkid": 26911}, "finished_utc": "2026-10-12T14:09:21Z"}`
- `{"name": "nv_wells.csv", "from": ["Oil Well Locations"], "rows": 745, "status": "written", "finished_utc": "2026-10-12T14:09:21Z"}`
- `{"name": "nv_wells.csv", "from": ["Oil Well Locations"], "rows": 745, "status": "written", "finished_utc": "2026-10-12T14:26:04Z"}`

## Row count

| what | rows |
|---|---|
| nv_wells.csv (rows in file) | 745 |
| wells in the app (meta.json) | 745 |
| regulator live count (https://services.arcgis.com/CXYUMoYknZtf5Qr3/arcgis/rest/services/OGHistoricData/FeatureServer/1, 2026-10-12T14:26:04Z) | 745 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon LON_4326, lat LAT_4326; datum WGS84 (reprojected by the service from UTM 11N NAD83, EPSG 26911).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Nevada outline bbox (+0.05 deg) | 0 |
| valid but outside the Nevada outline (Census, generalized; points on the border can fall just outside) | 0 |
| **on the map: exact** | 745 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 11 | 1 |
| 12 | 740 |
| 13 | 1 |
| 15 | 3 |

Wells with a full API (10 digits starting 27): 745; distinct: 740; APIs on more than one row: 5; without a full API (not searchable by API): 0

## Type (Well_Type)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Prod | Prod | oil | 707 | 707 | 0 |
| Inj | Inj | injection | 15 | 15 | 0 |
| WW | WW | other | 9 | 9 | 0 |
| Strat | Strat | other | 8 | 8 | 0 |
| (blank) | (blank) | other | 6 | 6 | 0 |

## Status (Status)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Plugged | Plugged | - | 615 | 615 | 0 |
| In Use | In Use | - | 73 | 73 | 0 |
| Shut-In | Shut-In | - | 45 | 45 | 0 |
| Abandoned | Abandoned | - | 8 | 8 | 0 |
| Pending | Pending | - | 2 | 2 | 0 |
| Withdrawn | Withdrawn | - | 1 | 1 | 0 |
| Drilling | Drilling | - | 1 | 1 | 0 |

## Fields (16) and blank counts

| field | label in app | blank |
|---|---|---|
| OBJECTID | Object ID | 0 |
| Permit | Permit | 0 |
| UTM_Easting | Utm Easting | 0 |
| UTM_Northing | Utm Northing | 0 |
| Well | Well | 0 |
| Status | Status | 0 |
| API | API | 0 |
| Well_Type | Well Type | 6 |
| Completion_Date | Completion Date | 46 |
| Field | Field | 0 |
| Land_Status | Land Status | 3 |
| BLMLease_ | Blmlease | 114 |
| GlobalID | Globalid | 0 |
| Conventional | Conventional | 0 |
| LON_4326 | Longitude (WGS84) | 0 |
| LAT_4326 | Latitude (WGS84) | 0 |

## Source notes (agent, 2026-10-12)

- Source: NDOM `OGHistoricData/FeatureServer/1` "Oil Well Locations" (ArcGIS Online), one request of 745 rows; `scripts/pull_nv.py`. Rows pulled = server count = 745.
- Coordinates: the layer is UTM zone 11 NAD83 (EPSG 26911), UTM only in the attributes (UTM_Easting/UTM_Northing kept raw); LON_4326/LAT_4326 are the server's reprojection to WGS84 (`outSR=4326`). 0 wells without coordinates; no PLSS columns in the source.
- API: 741 rows 10 digits, 4 rows 11-12 digits (suffixes), 5 APIs on two rows. Permit column has leading spaces (kept raw).
- Type Well_Type: Prod 707 (oil), Inj 15, WW 9 (water well), Strat 8, blank 6. Status: Plugged 615, In Use 73, Shut-In 45, Abandoned 8, other 4.
- Update frequency: not published; the layer's lastEditDate was 2026-09-29. Snapshot date shown = pull date (live service).
- Unverified: whether this layer includes every NDOM permit (the separate OGDHSearch layer with 775 points also holds geothermal holes and was not pulled). No operator, depth or document link in the source.

## Build notes (apply to every state added in this batch)

- Fragment: `scripts/states/<st>.config.mjs` (default export, same schema as a `states.config.mjs` entry). Nothing in `states.config.mjs`, `app/` or docs was changed; this report was produced with a scratch copy of the build that loaded only the new fragments.
- Legend budget: `build_data.mjs` stores type and status indexes as Uint8 (at most 255 types and 254 statuses across ALL states). The twelve fragments of this batch alone add 222 types and 131 statuses; together with TX/OK/KS and the other agents' states the real build will exceed 255 and throw "too many categories for Uint8 encoding" until types.bin / status.bin are widened (Uint16) or indexed per state.
- ArcGIS Date fields were converted from epoch milliseconds to YYYY-MM-DD (UTC) by the pull scripts; all other attributes are verbatim.
