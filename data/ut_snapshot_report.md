# Snapshot report - Utah Division of Oil, Gas and Mining (DNR DOGM) well data (Utah)

Report generated: 2026-10-12 14:24 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/ut/pull_log.jsonl (ut_wells.csv, zip_entry_date))  

Pull log:

- `{"name": "Wells.zip", "url": "https://oilgas.ogm.utah.gov/pub/Database/Wells.zip", "bytes": 2262618, "last_modified": "Mon, 12 Oct 2026 10:10:58 GMT", "status": "downloaded", "finished_utc": "2026-10-12T14:11:19Z"}`
- `{"name": "ut_wells.csv", "from": "Wells.zip", "entry": "Wells.csv", "rows": 40408, "zip_entry_date": "2026-10-12", "api_column_renamed_from": null, "status": "extracted", "finished_utc": "2026-10-12T14:11:19Z"}`
- `{"name": "LatLongCoordinates.zip", "url": "https://oilgas.ogm.utah.gov/pub/Database/LatLongCoordinates.zip", "bytes": 339020, "last_modified": "Mon, 12 Oct 2026 10:10:59 GMT", "status": "downloaded", "finished_utc": "2026-10-12T14:11:22Z"}`
- `{"name": "ut_latlong_coordinates.csv", "from": "LatLongCoordinates.zip", "entry": "LatLongCoordinates.csv", "rows": 40405, "zip_entry_date": "2026-10-12", "api_column_renamed_from": null, "status": "extracted", "finished_utc": "2026-10-12T14:11:22Z"}`
- `{"name": "WellHistory.zip", "url": "https://oilgas.ogm.utah.gov/pub/Database/WellHistory.zip", "bytes": 1606046, "last_modified": "Mon, 12 Oct 2026 10:20:38 GMT", "status": "downloaded", "finished_utc": "2026-10-12T14:11:25Z"}`
- `{"name": "ut_well_history.csv", "from": "WellHistory.zip", "entry": "WellHistory.csv", "rows": 52813, "zip_entry_date": "2026-10-12", "api_column_renamed_from": null, "status": "extracted", "finished_utc": "2026-10-12T14:11:25Z"}`
- `{"name": "BLOCKED", "error": "HTTP 403 from https://oilgas.ogm.utah.gov/pub/database_download_read/ - stopping, not retrying", "finished_utc": "2026-10-12T14:11:25Z"}`
- `{"name": "ut_well_history.csv", "from": "WellHistory.zip", "entry": "WellHistory.csv", "rows": 52813, "zip_entry_date": "2026-10-12", "api_column_renamed_from": "WellID", "status": "extracted", "finished_utc": "2026-10-12T14:17:58Z"}`
- `{"name": "ut_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "rows": 29, "status": "OK", "finished_utc": "2026-10-12T14:18:00Z"}`

## Row count

| what | rows |
|---|---|
| ut_wells.csv (rows in file) | 40,408 |
| wells in the app (meta.json) | 40,408 |
| regulator live count (https://oilgas.ogm.utah.gov/pub/Database/Wells.zip (bulk file; DOGM publishes no live count), 2026-10-12T14:11:25Z) | 40,408 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon Longitude, lat Latitude; datum not stated by DOGM (presumably NAD83; the read-me PDF could not be fetched).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Utah outline bbox (+0.05 deg) | 0 |
| valid but outside the Utah outline (Census, generalized; points on the border can fall just outside) | 0 |
| **on the map: exact** | 40,408 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 14 | 40,408 |

Wells with a full API (10 digits starting 43): 40,408; distinct: 40,383; APIs on more than one row: 24; without a full API (not searchable by API): 0

## Type (welltype)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| OW | OW | oil | 16,867 | 16,867 | 0 |
| OGW | OGW | oil | 2 | 2 | 0 |
| GW | GW | gas | 16,430 | 16,430 | 0 |
| WI | WI | injection | 2,103 | 2,103 | 0 |
| WD | WD | injection | 265 | 265 | 0 |
| GI | GI | injection | 11 | 11 | 0 |
| D | D | dry | 4,353 | 4,353 | 0 |
| TW | TW, tw | other | 192 | 192 | 0 |
| GS | GS | other | 72 | 72 | 0 |
| WS | WS | other | 61 | 61 | 0 |
| LI | LI | other | 13 | 13 | 0 |
| PO | PO | other | 9 | 9 | 0 |
| CD | CD | other | 8 | 8 | 0 |
| HE | HE | other | 8 | 8 | 0 |
| OWD | OWD | other | 5 | 5 | 0 |
| GD | GD | other | 3 | 3 | 0 |
| HS | HS | other | 2 | 2 | 0 |
| OWI | OWI | other | 2 | 2 | 0 |
| OGI | OGI | other | 1 | 1 | 0 |
| GWD | GWD | other | 1 | 1 | 0 |

## Status (wellstatus)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| P | P | - | 11,909 | 11,909 | 0 |
| LA | LA | - | 10,907 | 10,907 | 0 |
| PA | PA | - | 10,132 | 10,132 | 0 |
| S | S | - | 2,313 | 2,313 | 0 |
| APD | APD | - | 1,761 | 1,761 | 0 |
| A | A | - | 1,698 | 1,698 | 0 |
| RET | RET | - | 981 | 981 | 0 |
| I | I | - | 336 | 336 | 0 |
| DRL | DRL | - | 214 | 214 | 0 |
| NEW | NEW | - | 69 | 69 | 0 |
| TA | TA | - | 42 | 42 | 0 |
| DOSC | DOSC | - | 24 | 24 | 0 |
| OPS | OPS | - | 20 | 20 | 0 |
| TEST | TEST | - | 1 | 1 | 0 |
| PAI | PAI | - | 1 | 1 | 0 |

## Fields (45) and blank counts

| field | label in app | blank |
|---|---|---|
| WellName | Wellname | 0 |
| API | API | 0 |
| Operator | Operator | 0 |
| OperatorNo | Operatorno | 0 |
| FieldName | Fieldname | 0 |
| Ground_Elev | Ground Elev | 0 |
| Kelly_Elev | Kelly Elev | 0 |
| Floor_Elev | Floor Elev | 0 |
| FootageNS | Footage N/S | 0 |
| NS | N/S | 0 |
| FootageEW | Footage E/W | 0 |
| EW | E/W | 0 |
| UTM_Surf_N | Utm Surf N | 0 |
| UTM_Surf_E | Utm Surf E | 0 |
| Latitude | Latitude | 0 |
| Longitude | Longitude | 0 |
| QuarterQuarter | Quarterquarter | 0 |
| Sec | Sec | 0 |
| Township | Township | 0 |
| TownshipDir | Townshipdir | 0 |
| Range | Range | 0 |
| RangeDir | Rangedir | 0 |
| PM | Meridian | 0 |
| CountyName | Countyname | 0 |
| Dir_Horiz | Dir Horiz | 0 |
| Dir_Vert | Dir Vert | 0 |
| Dir_Direct | Dir Direct | 0 |
| Confidential | Confidential | 0 |
| ConfRelDate | Confreldate | 0 |
| LeaseNumber | Leasenumber | 3 |
| LeaseType | Leasetype | 0 |
| SurfaceOwner | Surfaceowner | 0 |
| AbandonDate | Abandondate | 0 |
| wellstatus | Well Status | 0 |
| welltype | Well Type | 0 |
| TotCum_Oil | Totcum Oil | 0 |
| TotCum_Gas | Totcum Gas | 0 |
| TotCum_Water | Totcum Water | 0 |
| Ind_Tribe | Ind Tribe | 0 |
| Multi_Lats | Multi Lats | 0 |
| OriginalFieldType | Originalfieldtype | 0 |
| UnitName | Unitname | 0 |
| ProposedMD | Proposedmd | 0 |
| ProposedTVD | Proposedtvd | 0 |
| FirstProdDate | Firstproddate | 0 |

## Source notes (pull agent, 2026-10-12)

- **Source**: Utah DNR Division of Oil, Gas and Mining daily RBDMS exports, https://oilgas.ogm.utah.gov/pub/Database/
  `Wells.zip` (2.3 MB, Last-Modified 2026-10-12 10:10 GMT), `LatLongCoordinates.zip` (0.3 MB) and `WellHistory.zip`
  (1.6 MB), each downloaded ONCE by `scripts/pull_ut.py`, 1 s apart. The read-me directory
  `/pub/database_download_read/` answered **403** (directory index forbidden) and was not retried; that line is in
  the pull log as BLOCKED. The data downloads themselves were not blocked.
- **Counts**: Wells.csv 40,408 rows = rows in the app (the survey's 40,404 was the previous day's file). DOGM
  publishes no live count; `source_count.json` records the file's own row count. Every row had Latitude/Longitude:
  exact 40,408, repaired 0, approximate 0, unmapped 0. 0 points outside the Census outline. No PLSS grid was pulled
  or configured.
- **Coordinates**: `Latitude`/`Longitude` of Wells.csv; they equal LatLongCoordinates.csv for all but a few wells
  (max difference 1.9e-4 degrees). **Datum not stated** in either file; the read-me that would say so could not be
  fetched, so the fragment records "not stated (presumably NAD83)". UTM_Surf_N/E are also present (zone 12N).
- **Fields**: all 45 Wells.csv columns (PLSS: Sec, Township + TownshipDir, Range + RangeDir, PM = S Salt Lake /
  U Uintah, QuarterQuarter smallest-first "NESW"; cumulative oil/gas/water; proposed MD/TVD; AbandonDate,
  FirstProdDate; no spud date here).
- **Layers** (joined on the full API): `ut_latlong_coordinates.csv` 40,405 rows -> 40,408 wells; `ut_well_history.csv`
  52,813 rows (APD, DrySpud/RotarySpud, completion, sundry and test records, one row per work item; its `WellID`
  column was renamed `API`) -> 40,408 wells, 0 unmatched.
- **API**: `API`, 14 digits, all 40,408 start with 43.
- **Type / status**: legend type = `welltype` codes (OW 16,867; GW 16,430; D 4,353; WI 2,103; WD 265; TW 191; GS 72;
  WS 61; LI 13; GI 11; PO 9; CD 8; HE 8; OWD 5; GD 3; OGW 2; HS 2; OWI 2; OGI 1; GWD 1; one lower-case tw), status =
  `wellstatus` (P 11,909; LA 10,907; PA 10,132; S 2,313; APD 1,761; A 1,698; RET 981; I 336; DRL 214; NEW 69; TA 42;
  DOSC 24; OPS 20; TEST 1; PAI 1). No dictionary could be fetched; only unambiguous codes are categorized (OW/OGW
  oil, GW gas, D dry, WI/WD/GI injection, HE/GS/WS/TW other); LI, PO, CD, OWD, GD, HS, OWI, OGI, GWD fall to other.
- **Update frequency**: daily (files dated the pull morning on both survey and pull days). Data date = the zip
  entry date of Wells.csv.
- **Unverified**: datum; code meanings; terms of use (no robots.txt; the site redirects it to a bookmark notice).
