# Snapshot report - Tennessee Department of Environment and Conservation (TDEC), Oil and Gas Program well data (Tennessee)

Report generated: 2026-10-12 14:59 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/tn/pull_log.jsonl (tn_wells.csv))  

Pull log:

- `{"name": "tn_wells.csv", "service": "https://tdeconline.tn.gov/arcgis/rest/services/Oil_and_Gas2/MapServer/0", "rows": 16614, "server_count": 16614, "user_agent": "browser-style (server returns 403 to non-browser agents)", "status": "OK", "finished_utc": "2026-10-12T14:05:15Z"}`
- `{"name": "tn_wells.csv", "step": "add API column (41 + county + unique from API_NO)", "rows": 16614, "rows_without_parseable_api_no": 0, "finished_utc": "2026-10-12T14:09:07Z"}`

## Row count

| what | rows |
|---|---|
| tn_wells.csv (rows in file) | 16,614 |
| wells in the app (meta.json) | 16,614 |
| regulator live count (https://tdeconline.tn.gov/arcgis/rest/services/Oil_and_Gas2/MapServer/0, 2026-10-12T14:09:07Z) | 16,614 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326 / LONGITUDE, lat lat_4326 / LATITUDE; datum WGS84 (layer geometry, Web Mercator reprojected by the server); LATITUDE/LONGITUDE attribute datum not stated by TDEC.

| what | wells |
|---|---|
| null or 0 | 65 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Tennessee outline bbox (+0.05 deg) | 0 |
| valid but outside the Tennessee outline (Census, generalized; points on the border can fall just outside) | 11 |
| **on the map: exact** | 16,549 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 65 |

Why wells without usable coordinates could not be placed:

- state has no PLSS: 65

## API

| raw API length | wells |
|---|---|
| 10 | 16,614 |

Wells with a full API (10 digits starting 41): 16,614; distinct: 16,159; APIs on more than one row: 437; without a full API (not searchable by API): 0

## Type (PURPOSE_OF_WELL)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil | Oil | oil | 1,611 | 1,600 | 0 |
| Oil And Gas | Oil And Gas | oil | 603 | 603 | 0 |
| Gas | Gas | gas | 1,403 | 1,403 | 0 |
| NCG - Domestic | NCG - Domestic | gas | 811 | 811 | 0 |
| Shut-in Gas | Shut-in Gas | gas | 701 | 701 | 0 |
| Disposal | Disposal | injection | 6 | 6 | 0 |
| Salt Water Disp | Salt Water Disp | injection | 4 | 4 | 0 |
| UIC | UIC | injection | 4 | 4 | 0 |
| Dry & Abandoned | Dry & Abandoned | dry | 9,307 | 9,271 | 0 |
| Abandoned Loc | Abandoned Loc | other | 1,122 | 1,120 | 0 |
| Well Location | Well Location | other | 441 | 440 | 0 |
| Water | Water | other | 409 | 395 | 0 |
| Test | Test | other | 190 | 189 | 0 |
| Monitor | Monitor | other | 1 | 1 | 0 |
| Min Core Test | Min Core Test | other | 1 | 1 | 0 |

## Fields (15) and blank counts

| field | label in app | blank |
|---|---|---|
| API | API | 0 |
| OBJECTID | Object ID | 0 |
| PERMIT_DATE | Permit Date | 3,190 |
| PERMIT_NO | Permit No. | 3,188 |
| API_NO | API No. | 0 |
| OPERATOR_NAME | Operator Name | 6 |
| WELL_NAME_AND_NO | Well Name And No. | 0 |
| COUNTY | County | 0 |
| LATITUDE | Latitude | 65 |
| LONGITUDE | Longitude | 65 |
| ELEVATION | Elevation | 62 |
| FORMATION_AT_TOTAL_DEPTH | Formation At Total Depth | 4,873 |
| PURPOSE_OF_WELL | Purpose Of Well | 0 |
| lon_4326 | Longitude (WGS84) | 0 |
| lat_4326 | Latitude (WGS84) | 0 |

## Pull notes (TN)

- Source: TDEC `Oil_and_Gas2/MapServer/0` ("Oil and Gas Wells", 16,614 rows), pulled 2026-10-12 in a single request (maxRecordCount 17,000) plus metadata and count.
- Disclosed: tdeconline.tn.gov answers 403 Forbidden to non-browser User-Agent strings (python-urllib and curl, verified 2026-10-12; robots.txt itself is 403). The same URLs answer 200 with a browser User-Agent, which the one-time pull used. No login, no paging, no recurring pulls.
- API: `API` = 41 + the 8 digits of `API_NO` ("133-22884" = county FIPS + unique); 459 rows carry a "-R1"/"-R2" re-entry suffix, which is dropped (so those share the parent's canonical API).
- Fields are thin: permit number/date, operator, well name, county, lat/long, elevation, formation at TD, `PURPOSE_OF_WELL`. No status, depth, spud/plug dates or document link. Type = `PURPOSE_OF_WELL`; overrides: "NCG - Domestic" (non-commercial domestic gas) -> gas, "Salt Water Disp" -> injection.
- Not on the map (65): rows with no geometry and blank LATITUDE/LONGITUDE at the source (36 Dry & Abandoned, 14 Water, 11 Oil, 4 other).
- Coordinates: layer geometry (Web Mercator, reprojected to WGS84 by the server) first, `LONGITUDE`/`LATITUDE` as fallback; attribute datum not stated.
- Update cadence: "extracted periodically" from the TN Oil and Gas Well database; not stated. Coverage of pre-permit-era wells unverified.
