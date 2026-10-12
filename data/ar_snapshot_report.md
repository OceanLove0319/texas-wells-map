# Snapshot report - Arkansas Oil and Gas Commission (AOGC), via Arkansas GIS Office well data (Arkansas)

Report generated: 2026-10-12 14:20 UTC  
Data date shown in the app: **2026-07-21** (from ../../../../../../../Users/ocean/.claude/projects/tx-wells-map/data/raw/ar/pull_log.jsonl (ar_wells.csv, item_modified))  

Pull log:

- `{"name": "source_count.json", "service": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Utilities/FeatureServer/5", "server_count": 38245, "status": "OK", "finished_utc": "2026-10-12T14:05:38Z"}`
- `{"name": "ar_wells.csv", "service": "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Utilities/FeatureServer/5", "rows": 38245, "server_count": 38245, "rows_without_api": 0, "newest_wellstatusdate": "2202-08-27", "item_modified": "2026-07-21", "status": "OK", "finished_utc": "2026-10-12T14:07:01Z"}`

## Row count

| what | rows |
|---|---|
| ar_wells.csv (rows in file) | 38,245 |
| wells in the app (meta.json) | 38,245 |
| regulator live count (https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Utilities/FeatureServer/5, 2026-10-12T14:05:38Z) | 38,245 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326 / coordinates_longitude, lat lat_4326 / coordinates_latitude; datum NAD83 (service UTM 15N, reprojected to WGS84 by the server; attribute lat/long identical).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Arkansas outline bbox (+0.05 deg) | 0 |
| valid but outside the Arkansas outline (Census, generalized; points on the border can fall just outside) | 6 |
| **on the map: exact** | 38,245 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

PLSS grid: data/raw/plss/AR_sections.jsonl, 54,804 sections, 53,199 keys (364 ambiguous, not used).

## API

| raw API length | wells |
|---|---|
| 12 | 38,245 |

Wells with a full API (10 digits starting 03): 38,245; distinct: 33,791; APIs on more than one row: 2,261; without a full API (not searchable by API): 0

## Type (welltype)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil - Production (OIL) | OIL | oil | 16,793 | 16,793 | 0 |
| Natural Gas - Dry (GAS) | GAS | gas | 19,082 | 19,082 | 0 |
| Coal Bed Methane (CBM) | CBM | gas | 71 | 71 | 0 |
| Salt Water Disposal (SWD) | SWD | injection | 1,282 | 1,282 | 0 |
| Enhanced Oil Recovery (EOR) | EOR | injection | 328 | 328 | 0 |
| Brine Injection Well (BIW) | BIW | injection | 96 | 96 | 0 |
| Waste Disposal Well (WDW) | WDW | injection | 12 | 12 | 0 |
| Salt Water Injection (SWI) | SWI | injection | 7 | 7 | 0 |
| Gas Injector (GI) | GI | injection | 1 | 1 | 0 |
| Expired Permit (EXP) | EXP | other | 283 | 283 | 0 |
| Brine Supply Well (BSW) | BSW | other | 112 | 112 | 0 |
| Seismic-Exploratory Well (SEX) | SEX | other | 74 | 74 | 0 |
| Gas Storage (GS) | GS | other | 33 | 33 | 0 |
| Coal Bed Methane Service Well (CBMS) | CBMS | other | 31 | 31 | 0 |
| Water Supply (WS) | WS | other | 29 | 29 | 0 |
| Need Code (ISC) | ISC | other | 5 | 5 | 0 |
| Unknown (UN) | UN | other | 3 | 3 | 0 |
| Service Well (SW) | SW | other | 3 | 3 | 0 |

## Status (wellstatus)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Producing (PR) | PR | - | 16,570 | 16,570 | 0 |
| Plugged and Abandoned (PA) | PA | - | 16,061 | 16,061 | 0 |
| Active (A) | A | - | 3,385 | 3,385 | 0 |
| Expired Permit (EX / ex) | EX, ex | - | 1,233 | 1,233 | 0 |
| Temporarily Abandoned (TA) | TA | - | 304 | 304 | 0 |
| Abandoned/Orphaned Well (AOW) | AOW | - | 267 | 267 | 0 |
| Inactive - Not TA (IN) | IN | - | 255 | 255 | 0 |
| Domestic Well - Gas (DW) | DW | - | 106 | 106 | 0 |
| Shut_In (SI) | SI | - | 20 | 20 | 0 |
| Unknown (UN) | UN | - | 16 | 16 | 0 |
| Permitted Well (PW) | PW | - | 8 | 8 | 0 |
| Spudded (SP) | SP | - | 7 | 7 | 0 |
| Completed (C) | C | - | 6 | 6 | 0 |
| Dry And Abandoned (DA) | DA | - | 4 | 4 | 0 |
| Released - Water Well (RW) | RW | - | 2 | 2 | 0 |
| Injection Permit Issued (PWI) | PWI | - | 1 | 1 | 0 |

## Fields (48) and blank counts

| field | label in app | blank |
|---|---|---|
| objectid | Object ID | 0 |
| permitnumberstring | Permitnumberstring | 0 |
| wellid | Wellid | 0 |
| operatorname | Operatorname | 0 |
| wellname | Wellname | 0 |
| wellnumber | Wellnumber | 0 |
| welltype | Well Type | 0 |
| welltypedescription | Welltypedescription | 0 |
| countyname | Countyname | 0 |
| wellstatus | Well Status | 0 |
| wellstatusdescription | Wellstatusdescription | 0 |
| wellstatusdate | Wellstatusdate | 0 |
| poolnamestring | Poolnamestring | 38,245 |
| section | Section | 0 |
| township | Township | 0 |
| townshipdir | Townshipdir | 0 |
| range | Range | 0 |
| rangedir | Rangedir | 0 |
| depthbottom | Depthbottom | 2,691 |
| elevationtype | Elevationtype | 0 |
| fieldname | Fieldname | 3 |
| wellkey | Wellkey | 0 |
| coordinates_type | Coordinates Type | 0 |
| coordinates_county | Coordinates County | 0 |
| coordinates_sec | Coordinates Sec | 1 |
| coordinates_twp | Coordinates Twp | 1 |
| coordinates_twp_dir | Coordinates Twp Dir | 1 |
| coordinates_rng | Coordinates Rng | 1 |
| coordinates_rng_dir | Coordinates Rng Dir | 1 |
| coordinates_meas_type | Coordinates Meas Type | 38,242 |
| coordinates_meas_ref | Coordinates Meas Ref | 38,242 |
| coordinates_latitude | Coordinates Latitude | 0 |
| coordinates_longitude | Coordinates Longitude | 0 |
| coordinates_footage_n_s | Coordinates Footage N S | 14,599 |
| coordinates_n_s | Coordinates N S | 14,616 |
| coordinates_footage_e_w | Coordinates Footage E W | 14,618 |
| coordinates_e_w | Coordinates E W | 14,633 |
| coordinates_q | Coordinates Q | 29,892 |
| coordinates_qq | Coordinates Qq | 30,555 |
| coordinates_qqq | Coordinates Qqq | 35,462 |
| coordinates_depthbottom | Coordinates Depthbottom | 38,245 |
| coordinates_elevationtype | Coordinates Elevationtype | 38,242 |
| coordinates_pkey | Coordinates Pkey | 0 |
| coordinates_wpkey | Coordinates Wpkey | 0 |
| globalid | Globalid | 0 |
| lon_4326 | Longitude (WGS84) | 0 |
| lat_4326 | Latitude (WGS84) | 0 |
| API | API | 0 |

## Source notes
- Source: AOGC well data as hosted by the Arkansas GIS Office (FEATURESERVICES/Utilities/FeatureServer/5, AGOL item f0d47d40a8cc4841b107d3256bbb5656), paged once at 500 rows/request (77 requests, sequential, 0.5 s sleep). AOGC's own site answers HTTP 403, so no bulk file could be checked.
- Update frequency: periodic snapshot of AOGC's database; AGOL item modified 2026-07-21 (the data date shown). Newest wellstatusdate 2026-02-12 (two rows carry typo years 2101/2202).
- API: `wellid` is the API without its leading zero (9 digits); the pull script adds API = "03-ccc-nnnnn" for all 38,245 rows. County code matches the Census FIPS code (139 Union, 073 Lafayette, ...).
- Codes: ar_codes.json from the layer's own description columns. "GAS = Natural Gas - Dry" is overridden to the gas category (the shared rule would read "Dry" as a dry hole).
- Coordinates: all 38,245 rows have coordinates; 6 fall just outside the generalized state outline (border). PLSS config is present (Fifth Principal Meridian; coordinates_q is the largest quarter call, verified: median error 0.06 km vs 0.58 km reversed) but nothing needed approximating.
- Unverified: completeness (38,245 looks low for Arkansas's full history), the exact wellid -> API rule for the few wells with 5-digit sequence numbers starting with 0, spud/completion dates and document links (not in the source).
