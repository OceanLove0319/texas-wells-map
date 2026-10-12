# Snapshot report - Missouri DNR, Missouri Geological Survey (data last updated 2021) well data (Missouri)

Report generated: 2026-10-12 14:20 UTC  
Data date shown in the app: **2021-08-30** (from data/raw/mo/pull_log.jsonl (mo_wells.csv, metadata_pubdate))  

Pull log:

- `{"name": "source_count.json", "service": "https://gis.dnr.mo.gov/host/rest/services/geology/oil_gas_wells/MapServer/0", "server_count": 10369, "status": "OK", "finished_utc": "2026-10-12T14:05:38Z"}`
- `{"name": "mo_wells.csv", "service": "https://gis.dnr.mo.gov/host/rest/services/geology/oil_gas_wells/MapServer/0", "rows": 10369, "server_count": 10369, "rows_without_api": 0, "metadata_pubdate": "2021-08-30", "metadata_update_frequency": "As needed", "newest_dates": {"STATUSDATE": "2021-08-03", "SPUD_DATE": "2021-06-04", "TYPE_DATE": "2021-08-03", "PERMIT_DAT": "2019-08-15"}, "status": "OK", "finished_utc": "2026-10-12T14:05:48Z"}`

## Row count

| what | rows |
|---|---|
| mo_wells.csv (rows in file) | 10,369 |
| wells in the app (meta.json) | 10,369 |
| regulator live count (https://gis.dnr.mo.gov/host/rest/services/geology/oil_gas_wells/MapServer/0, 2026-10-12T14:05:38Z) | 10,369 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326 / LONGITUDE, lat lat_4326 / LATITUDE; datum NAD83 (service UTM 15N, reprojected to WGS84 by the server; attribute LATITUDE/LONGITUDE identical).

| what | wells |
|---|---|
| null or 0 | 1 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Missouri outline bbox (+0.05 deg) | 0 |
| valid but outside the Missouri outline (Census, generalized; points on the border can fall just outside) | 3 |
| **on the map: exact** | 10,368 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 1 |
| **not on the map** | 0 |

PLSS grid: data/raw/plss/MO_sections.jsonl, 67,535 sections, 67,507 keys (407 ambiguous, not used).

## API

| raw API length | wells |
|---|---|
| 12 | 10,369 |

Wells with a full API (10 digits starting 24): 10,369; distinct: 10,368; APIs on more than one row: 1; without a full API (not searchable by API): 0

## Type (WELL_TYPE)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil | Oil | oil | 2,348 | 2,348 | 0 |
| Horizontal Oil Well | Horizontal Oil Well | oil | 10 | 10 | 0 |
| Gas(Convertional, Commercial) | Gas(Convertional, Commercial) | gas | 1,134 | 1,134 | 0 |
| Gas(Private Use) | Gas(Private Use) | gas | 502 | 502 | 0 |
| Gas(Coalbed Methane) | Gas(Coalbed Methane) | gas | 31 | 31 | 0 |
| Injection(Class II EOR) | Injection(Class II EOR) | injection | 884 | 884 | 0 |
| Injection(Class II Disposal) | Injection(Class II Disposal) | injection | 20 | 20 | 0 |
| Injection(Water Curtain) | Injection(Water Curtain) | injection | 1 | 1 | 0 |
| Dry Hole | Dry Hole | dry | 2,243 | 2,243 | 0 |
| Stratigraphic Test | Stratigraphic Test | other | 2,854 | 2,854 | 0 |
| Water Well | Water Well | other | 122 | 122 | 0 |
| Observation | Observation | other | 104 | 104 | 0 |
| Gas Storage Wells | Gas Storage Wells | other | 73 | 73 | 0 |
| Water Well, Non Oil/Gas Related (has down-hole log) | Water Well, Non Oil/Gas Related (has down-hole log) | other | 33 | 33 | 1 |
| Stratigraphic Test, Non Oil/Gas Related (has down-hole log) | Stratigraphic Test, Non Oil/Gas Related (has down-hole log) | other | 6 | 6 | 0 |
| Unknown Well Type | Unknown Well Type | other | 4 | 4 | 0 |

## Status (STATUS)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Abandoned | Abandoned | - | 4,681 | 4,681 | 0 |
| Plugged - Approved | Plugged - Approved | - | 4,276 | 4,276 | 0 |
| Active Well | Active Well | - | 947 | 947 | 0 |
| Shut in - Extended | Shut in - Extended | - | 134 | 134 | 0 |
| Orphaned | Orphaned | - | 81 | 81 | 1 |
| Water Well Conversion | Water Well Conversion | - | 69 | 69 | 0 |
| Abandoned, Known Location and Verified | Abandoned, Known Location and Verified | - | 55 | 55 | 0 |
| Abandoned, Unknown Location | Abandoned, Unknown Location | - | 43 | 43 | 0 |
| Abandoned, No evidence of existence/ Unable to find | Abandoned, No evidence of existence/ Unable to find | - | 33 | 33 | 0 |
| Plugged - Not Approved | Plugged - Not Approved | - | 26 | 26 | 0 |
| Shut in - Complete | Shut in - Complete | - | 7 | 7 | 0 |
| Inactive – Initial 90 day window | Inactive – Initial 90 day window | - | 7 | 7 | 0 |
| Temporarily Abandoned(Idle) | Temporarily Abandoned(Idle) | - | 7 | 7 | 0 |
| Shut in - Incomplete | Shut in - Incomplete | - | 2 | 2 | 0 |
| Pending Shut in Approval | Pending Shut in Approval | - | 1 | 1 | 0 |

## Fields (35) and blank counts

| field | label in app | blank |
|---|---|---|
| OBJECTID | Object ID | 0 |
| COUNTY | County | 0 |
| API_NUMBER | API Number | 0 |
| OPERATOR | Operator | 0 |
| LEASE | Lease | 0 |
| WELL_NAME | Well Name | 433 |
| WELL_TYPE | Well Type | 0 |
| TYPE_DATE | Type Date | 0 |
| STATUS | Status | 0 |
| STATUSDATE | Statusdate | 0 |
| PERMIT_DAT | Permit Dat | 5,062 |
| SPUD_DATE | Spud Date | 6,429 |
| CONFIDDATE | Confiddate | 9,426 |
| TOWNSHIP | Township | 0 |
| TWP_DIR | Twp Dir | 39 |
| RANGE | Range | 0 |
| RNG_DIR | Rng Dir | 4 |
| SECTION_ | Section | 0 |
| SURVEYLOC1 | Surveyloc1 | 4,028 |
| SURVEYLOC2 | Surveyloc2 | 4,028 |
| LAND_GRANT | Land Grant | 10,105 |
| QUADRANGLE | Quadrangle | 47 |
| LATITUDE | Latitude | 0 |
| LONGITUDE | Longitude | 0 |
| ELEVATION | Elevation | 0 |
| TOTAL_DPTH | Total Dpth | 0 |
| FORMATION | Formation | 8,801 |
| FIELD_POOL | Field Pool | 7,489 |
| PERMIT_LINK | Permit Link | 0 |
| DOWNHOLE | Downhole | 0 |
| DOWN_LINK | Down Link | 0 |
| STRAT_LINK | Strat Link | 0 |
| lon_4326 | Longitude (WGS84) | 0 |
| lat_4326 | Latitude (WGS84) | 0 |
| API | API | 0 |

## Source notes
- Source: MoDNR / Missouri Geological Survey MapServer geology/oil_gas_wells layer 0 (10,369 rows), paged once at 2,000 rows/request (6 requests).
- DATA LAST UPDATED 2021: metadata pubdate 2021-08-30 (update frequency "As needed"), newest STATUSDATE 2021-08-03, newest SPUD_DATE 2021-06-04, newest PERMIT_DAT 2019-08-15. The fragment's `short`/`note` carry "data last updated 2021" for the header and legend; the data date shown is 2021-08-30.
- API: API_NUMBER is "037-20070" without the state code; the pull script adds API = "24-037-20070" for all rows. County codes match Census FIPS (217 Vernon, 095 Jackson, 037 Cass).
- Document links kept as columns: PERMIT_LINK (permit PDF), DOWN_LINK (downhole log), STRAT_LINK (strip log); "nolog.pdf" placeholders mean none.
- Coordinates: 10,368 exact (service geometry; the attribute LATITUDE/LONGITUDE are identical), 1 row without attributes placed from TRS (Fifth Principal Meridian). SURVEYLOC1/2 are footage calls, not quarter calls.
- Unverified: access/use constraints beyond the metadata's "none" statement.
