# Snapshot report - Nebraska Oil and Gas Conservation Commission (NOGCC) well data (Nebraska)

Report generated: 2026-10-12 14:24 UTC  
Data date shown in the app: **2026-06-04** (from data/raw/ne/pull_log.jsonl (ne_wells.csv, zip_entry_date))  

Pull log:

- `{"name": "NebraskaWellData.zip", "url": "http://nogcc.ne.gov/Publications/NebraskaWellData.zip", "bytes": 1619864, "last_modified": "Thu, 04 Jun 2026 21:24:07 GMT", "status": "downloaded", "finished_utc": "2026-10-12T14:13:02Z"}`
- `{"name": "NebraskaWellData.mdb", "from": "NebraskaWellData.zip", "bytes": 7065600, "zip_entry_date": "2026-06-04", "status": "extracted", "finished_utc": "2026-10-12T14:13:02Z"}`
- `{"name": "ne_wfs_wells.txt", "service": "http://datamining.nogcc.ne.gov:8080/geoserver/wfs", "typeName": "NOGCC:NEWells", "rows": 22612, "server_count": 22612, "crs": "urn:ogc:def:crs:EPSG::4269", "status": "OK", "finished_utc": "2026-10-12T14:13:05Z"}`
- `{"name": "ne_wells.csv", "from": "NebraskaWellData.mdb", "table": "tblNebraskaWellData", "rows": 22600, "zip_entry_date": "2026-06-04", "tool": "mdb-export (mdbtools)", "api_column": "API_WellNo", "api_copy_added": true, "wfs_points_joined": 22600, "wfs_points_total": 22612, "status": "exported", "finished_utc": "2026-10-12T14:13:06Z"}`
- `{"name": "ne_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "rows": 93, "status": "OK", "finished_utc": "2026-10-12T14:13:07Z"}`
- `{"name": "ne_wells.csv", "from": "NebraskaWellData.mdb", "table": "tblNebraskaWellData", "rows": 22600, "zip_entry_date": "2026-06-04", "tool": "mdb-export (mdbtools)", "api_column": "API_WellNo", "api_copy_added": true, "wfs_points_joined": 22600, "wfs_points_total": 22612, "status": "exported", "finished_utc": "2026-10-12T14:18:01Z"}`

## Row count

| what | rows |
|---|---|
| ne_wells.csv (rows in file) | 22,600 |
| wells in the app (meta.json) | 22,600 |
| regulator live count (http://nogcc.ne.gov/Publications/NebraskaWellData.zip (tblNebraskaWellData); WFS http://datamining.nogcc.ne.gov:8080/geoserver/wfs NOGCC:NEWells, 2026-10-12T14:18:01Z) | 22,600 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon Wh_Long / WFS_Longitude, lat Wh_Lat / WFS_Latitude; datum NAD83 (the .mdb states no datum; identical values are served by the NOGCC WFS as EPSG:4269).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Nebraska outline bbox (+0.05 deg) | 0 |
| valid but outside the Nebraska outline (Census, generalized; points on the border can fall just outside) | 0 |
| **on the map: exact** | 22,600 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 14 | 22,600 |

Wells with a full API (10 digits starting 26): 22,600; distinct: 22,018; APIs on more than one row: 577; without a full API (not searchable by API): 0

## Type (Well_Typ)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| OIL | OIL | oil | 5,954 | 5,954 | 0 |
| GAS | GAS | gas | 520 | 520 | 0 |
| EOR | EOR | injection | 1,412 | 1,412 | 0 |
| SWD | SWD | injection | 242 | 242 | 0 |
| GIW | GIW | injection | 3 | 3 | 0 |
| DH | DH | dry | 13,294 | 13,294 | 0 |
| EX | EX | other | 947 | 947 | 0 |
| GST | GST | other | 111 | 111 | 0 |
| WS | WS | other | 53 | 53 | 0 |
| ST | ST | other | 43 | 43 | 0 |
| JA | JA | other | 15 | 15 | 0 |
| GEO | GEO | other | 4 | 4 | 0 |
| CI | CI | other | 1 | 1 | 0 |
| SO | SO | other | 1 | 1 | 0 |

## Status (Wl_Status)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| DA | DA | - | 13,159 | 13,159 | 0 |
| PA | PA | - | 5,948 | 5,948 | 0 |
| PR | PR | - | 1,424 | 1,424 | 0 |
| EX | EX | - | 949 | 949 | 0 |
| AI | AI | - | 463 | 463 | 0 |
| SI | SI | - | 291 | 291 | 0 |
| JA | JA | - | 117 | 117 | 0 |
| UN | UN | - | 112 | 112 | 0 |
| TA | TA | - | 77 | 77 | 0 |
| AX | AX | - | 31 | 31 | 0 |
| AB | AB | - | 11 | 11 | 0 |
| PW | PW | - | 10 | 10 | 0 |
| WS | WS | - | 5 | 5 | 0 |
| AL | AL | - | 1 | 1 | 0 |
| PD | PD | - | 1 | 1 | 0 |
| DM | DM | - | 1 | 1 | 0 |

## Fields (31) and blank counts

| field | label in app | blank |
|---|---|---|
| API_WellNo | API Wellno | 0 |
| County | County | 0 |
| CoName | Coname | 0 |
| Well_Nm | Well Nm | 0 |
| Well_Typ | Well Typ | 0 |
| Wl_Status | Wl Status | 0 |
| Dt_Spud | Dt Spud | 1,155 |
| Dt_Comp | Dt Comp | 44 |
| Dt_Prod | Dt Prod | 15,615 |
| Dt_PA | Dt Pa | 3,825 |
| Wh_Twpn | Wh Twpn | 0 |
| Wh_Twpd | Wh Twpd | 0 |
| Wh_RngN | Wh Rngn | 0 |
| Wh_RngD | Wh Rngd | 0 |
| Wh_Sec | Wh Sec | 0 |
| Wh_Qtr | Wh Qtr | 11 |
| Wh_Lat | Wh Latitude | 0 |
| Wh_Long | Wh Longitude | 0 |
| Wh_FtNS | Wh Ftns | 22 |
| Wh_Ns | Wh N/S | 24 |
| Wh_FtEW | Wh Ftew | 22 |
| Wh_EW | Wh E/W | 31 |
| Elev_Gr | Elev Gr | 1,365 |
| Elev_KB | Elev Kb | 1,699 |
| DTD | Dtd | 621 |
| Lease_No | Lease No. | 0 |
| Lease_Name | Lease Name | 15,379 |
| Field | Field | 9,607 |
| WFS_Longitude | Wfs Longitude | 0 |
| WFS_Latitude | Wfs Latitude | 0 |
| API | API | 0 |

## Source notes (pull agent, 2026-10-12)

- **Source**: NOGCC `NebraskaWellData.zip` (http://nogcc.ne.gov/Publications/NebraskaWellData.zip, 1.6 MB,
  Last-Modified 2026-06-04), an Access 2003 .mdb with one table `tblNebraskaWellData` (28 columns), read with
  **mdbtools 1.0.1 (`mdb-export`, installed via Homebrew)** - not the WFS fallback. The GeoServer WFS
  `NOGCC:NEWells` (http://datamining.nogcc.ne.gov:8080/geoserver/wfs, HTTP only) was fetched ONCE as a companion:
  its X/Y are joined on API_WellNo as `WFS_Longitude`/`WFS_Latitude`. Two downloads total, no 403/429.
- **Counts**: .mdb 22,600 rows = rows in the app (the survey's 23,053 for the mdb is not reproduced; the WFS has
  22,612, so 12 WFS wells are newer than the June .mdb). Every row had Wh_Lat/Wh_Long: exact 22,600, repaired 0,
  approximate 0, unmapped 0. 0 points outside the Census outline. No PLSS grid was pulled or configured.
- **Coordinates**: `Wh_Lat`/`Wh_Long` from the .mdb (datum not stated there). The WFS serves identical values
  (max difference 7e-9 degrees) with CRS EPSG:4269, so NAD83 is recorded. WFS columns are the fallback.
- **Fields**: all 28 table columns (type, status, spud/completion/first-production/P&A dates, PLSS Wh_Twpn/Wh_Twpd/
  Wh_RngN/Wh_RngD/Wh_Sec/Wh_Qtr with footages, elevations, DTD, lease, field) plus WFS_Longitude, WFS_Latitude and a
  copy of API_WellNo named `API`. Date/time columns were exported as YYYY-MM-DD (the stored 06:00/07:00 times are
  timezone artifacts). One row has Wh_Twpd = W (data error; irrelevant, it has coordinates).
- **API**: `API_WellNo`, 14 digits, all 22,600 start with 26.
- **Type / status**: legend type = `Well_Typ` codes (DH 13,294; OIL 5,954; EOR 1,412; EX 947; GAS 520; SWD 242;
  GST 111; WS 53; ST 43; JA 15; GEO 4; GIW 3; CI 1; SO 1), status = `Wl_Status` (DA 13,159; PA 5,948; PR 1,424; EX
  949; AI 463; SI 291; JA 117; UN 112; TA 77; ...). No dictionary in the .mdb; unambiguous codes are categorized
  (DH dry, OIL, GAS, EOR/SWD/GIW injection, GST/WS/ST/EX/GEO other); JA, CI, SO fall to other rather than guessed.
- **Update frequency**: irregular (this .mdb is dated 2026-06-04; the WFS is more current). Data date shown =
  2026-06-04 (zip entry date).
- **Unverified**: code meanings; terms of use (no robots.txt); why the survey counted 23,053 mdb rows.
- **Layers**: none as separate files (the WFS attributes were merged into the base).
