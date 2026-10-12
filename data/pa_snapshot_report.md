# Snapshot report - Pennsylvania Department of Environmental Protection (DEP), Office of Oil and Gas Management well data (Pennsylvania)

Report generated: 2026-10-12 14:59 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/pa/pull_log.jsonl (pa_wells.csv))  

Pull log:

- `{"name": "layer54.csv", "service": "https://gis.dep.pa.gov/depgisprd/rest/services/emappa/eMapPA_External_Extraction/MapServer/54", "layer": 54, "rows": 199354, "server_count": 199354, "status": "OK", "finished_utc": "2026-10-12T14:24:09Z"}`
- `{"name": "layer53.csv", "service": "https://gis.dep.pa.gov/depgisprd/rest/services/emappa/eMapPA_External_Extraction/MapServer/53", "layer": 53, "rows": 25234, "server_count": 25234, "status": "OK", "finished_utc": "2026-10-12T14:26:46Z"}`
- `{"name": "pa_wells.csv", "from": ["parts/layer54.csv", "parts/layer53.csv"], "rows": 224588, "rows_without_8_digit_permit_number": 180, "server_count": 224588, "status": "OK", "finished_utc": "2026-10-12T14:26:47Z"}`

## Row count

| what | rows |
|---|---|
| pa_wells.csv (rows in file) | 224,588 |
| wells in the app (meta.json) | 224,588 |
| regulator live count (https://gis.dep.pa.gov/depgisprd/rest/services/emappa/eMapPA_External_Extraction/MapServer layers 54 (Conventional) + 53 (Unconventional), 2026-10-12T14:26:46Z) | 224,588 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326 / LONGITUDE, lat lat_4326 / LATITUDE; datum WGS84 (layer geometry, Web Mercator reprojected by the server); LATITUDE/LONGITUDE attribute datum not stated by DEP.

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Pennsylvania outline bbox (+0.05 deg) | 2 |
| valid but outside the Pennsylvania outline (Census, generalized; points on the border can fall just outside) | 139 |
| **on the map: exact** | 224,588 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 0 | 180 |
| 10 | 224,408 |

Wells with a full API (10 digits starting 37): 224,408; distinct: 224,404; APIs on more than one row: 4; without a full API (not searchable by API): 180

## Type (WELL_TYPE)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| OIL | OIL | oil | 70,947 | 70,947 | 0 |
| COMB. OIL&GAS | COMB. OIL&GAS | oil | 13,124 | 13,124 | 0 |
| GAS | GAS | gas | 112,290 | 112,290 | 0 |
| COALBED METHANE | COALBED METHANE | gas | 1,283 | 1,283 | 0 |
| INJECTION | INJECTION | injection | 9,500 | 9,500 | 0 |
| WASTE DISPOSAL | WASTE DISPOSAL | injection | 27 | 27 | 0 |
| DRY HOLE | DRY HOLE | dry | 3,352 | 3,352 | 0 |
| UNDETERMINED | UNDETERMINED | other | 11,752 | 11,752 | 0 |
| STORAGE WELL | STORAGE WELL | other | 1,888 | 1,888 | 0 |
| OBSERVATION | OBSERVATION | other | 289 | 289 | 0 |
| TEST WELL | TEST WELL | other | 77 | 77 | 0 |
| MULTIPLE WELL BORE TYPE | MULTIPLE WELL BORE TYPE | other | 42 | 42 | 0 |
| (blank) | (blank) | other | 17 | 17 | 0 |

## Status (WELL_STATUS)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Active | Active | - | 104,827 | 104,827 | 0 |
| Plugged OG Well | Plugged OG Well | - | 52,286 | 52,286 | 0 |
| Operator Reported Not Drilled | Operator Reported Not Drilled | - | 26,889 | 26,889 | 0 |
| DEP Abandoned List | DEP Abandoned List | - | 15,067 | 15,067 | 0 |
| Proposed But Never Materialized | Proposed But Never Materialized | - | 8,034 | 8,034 | 0 |
| DEP Orphan List | DEP Orphan List | - | 6,374 | 6,374 | 0 |
| Abandoned | Abandoned | - | 6,039 | 6,039 | 0 |
| DEP Plugged | DEP Plugged | - | 3,842 | 3,842 | 0 |
| Cannot Be Located | Cannot Be Located | - | 594 | 594 | 0 |
| Plugged Unverified | Plugged Unverified | - | 302 | 302 | 0 |
| Regulatory Inactive Status | Regulatory Inactive Status | - | 180 | 180 | 0 |
| Duplicate | Duplicate | - | 141 | 141 | 0 |
| Uncharted Mined Through | Uncharted Mined Through | - | 13 | 13 | 0 |

## Fields (36) and blank counts

| field | label in app | blank |
|---|---|---|
| API | API | 180 |
| WELL_CLASS | Well Class | 0 |
| SOURCE_LAYER | Source Layer | 0 |
| PERMIT_NUMBER | Permit Number | 0 |
| WELL_NAME | Well Name | 0 |
| OPERATOR | Operator | 6 |
| OPERATOR_NUMBER | Operator Number | 6 |
| WELL_TYPE | Well Type | 17 |
| STORAGE_FIELD_NAME | Storage Field Name | 222,348 |
| WELL_STATUS | Well Status | 0 |
| WELL_STATUS_CODE | Well Status Code | 0 |
| PERMIT_DATE | Permit Date | 24,820 |
| SPUD_DATE | Spud Date | 35,395 |
| DATE_PLUGGED | Date Plugged | 172,684 |
| CONSERVATION_IND | Conservation Ind | 0 |
| WELL_CONFIG_CODE | Well Config Code | 17 |
| UNCONVENTIONAL_IND | Unconventional Ind | 0 |
| COUNTY | County | 0 |
| COUNTY_ID | County ID | 0 |
| MUNICIPALITY | Municipality | 0 |
| MUNICIPALITY_TYPE | Municipality Type | 2,474 |
| MUNICIPALITY_CODE | Municipality Code | 4 |
| LATITUDE | Latitude | 0 |
| LONGITUDE | Longitude | 0 |
| SURFACE_ELEVATION | Surface Elevation | 0 |
| WELL_PAD_NAME | Well Pad Name | 209,054 |
| WELL_PAD_ID | Well Pad ID | 0 |
| COAL_IND | Coal Ind | 8,896 |
| UIC_ID | UIC ID | 224,562 |
| UIC_TYPE_DESCRIPTION | UIC Type Description | 224,562 |
| SITE_ID | Site ID | 0 |
| SITE_NAME | Site Name | 0 |
| OBJECTID | Object ID | 0 |
| PERMIT_DATE_EXPIRES | Permit Date Expires | 82,761 |
| lon_4326 | Longitude (WGS84) | 0 |
| lat_4326 | Latitude (WGS84) | 0 |

## Pull notes (PA)

- Source: DEP eMapPA `eMapPA_External_Extraction/MapServer` layers 54 (Conventional Wells) and 53 (Unconventional Wells), unioned into `pa_wells.csv`; `WELL_CLASS` / `SOURCE_LAYER` say which layer a row came from. Pulled 2026-10-12 with keyset paging (1,000 rows per request, sequential, 0.5 s sleep).
- API: `API` = 37 + the 8 digits of `PERMIT_NUMBER` (county FIPS + unique). PERMIT_NUMBER is the DEP permit/API number without the state code. 180 rows have a PERMIT_NUMBER that is not county+unique (e.g. `0-00003`, `514077`) and get no API (not searchable by API).
- Type = `WELL_TYPE`, status = `WELL_STATUS`. Override: "COALBED METHANE" -> gas. 17 rows have a blank WELL_TYPE.
- Coordinates: layer geometry (Web Mercator, reprojected to WGS84 by the server) first, `LONGITUDE`/`LATITUDE` attributes as fallback; the attribute datum is not stated by DEP.
- Not pulled: layer 58 (eFACTS facility view, no well attributes), layer 62 (abandoned/orphan), layer 63 (historical map-digitized wells, 30,527). No depth field and no document link in the service (documents are in eFACTS by `SITE_ID`).
- Update cadence: not published; believed refreshed nightly from eFACTS (unverified). The data date shown is the pull date.
- Unverified: the Greenport "Oil Gas Well Inventory Report" CSV export was not exercised.
