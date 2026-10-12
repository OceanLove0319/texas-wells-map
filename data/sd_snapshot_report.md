# Snapshot report - South Dakota DANR Oil & Gas Program (data: SD Geological Survey) well data (South Dakota)

Report generated: 2026-10-12 14:24 UTC  
Data date shown in the app: **2026-10-01** (from ../../../../../../../../Users/ocean/.claude/projects/tx-wells-map/data/raw/sd/pull_log.jsonl (sd_wells.csv, export_date))  

Pull log:

- `{"name": "SDOILexport.zip", "url": "https://sddenr.net/pubs/og/SDOILexport.zip", "bytes": 18096502, "last_modified": null, "status": "downloaded", "finished_utc": "2026-10-12T14:11:21Z"}`
- `{"name": "tables/Formation_Tops.csv", "from": "SDOILexport/Formation_Tops.xlsx", "sheet": "Export_Formation_Tops_4_web", "rows": 15559, "zip_entry_date": "2026-10-01", "status": "converted", "finished_utc": "2026-10-12T14:11:22Z"}`
- `{"name": "tables/UIC_InjectionData_All_Years__Enhanced_Recovery_Units.csv", "from": "SDOILexport/UIC_InjectionData_All_Years.xlsx", "sheet": "Enhanced_Recovery_Units", "rows": 671, "zip_entry_date": "2026-09-14", "status": "converted", "finished_utc": "2026-10-12T14:11:22Z"}`
- `{"name": "tables/UIC_InjectionData_All_Years__UIC_Export_4_Web.csv", "from": "SDOILexport/UIC_InjectionData_All_Years.xlsx", "sheet": "UIC_Export_4_Web", "rows": 35198, "zip_entry_date": "2026-09-14", "status": "converted", "finished_utc": "2026-10-12T14:11:23Z"}`
- `{"name": "tables/Wells.csv", "from": "SDOILexport/Wells.xlsx", "sheet": "Export__wells_Table_4_Web", "rows": 2137, "zip_entry_date": "2026-10-01", "status": "converted", "finished_utc": "2026-10-12T14:11:23Z"}`
- `{"name": "tables/Well_Completions.csv", "from": "SDOILexport/Well_Completions.xlsx", "sheet": "Export_Well_Completion_4_web", "rows": 2048, "zip_entry_date": "2026-10-01", "status": "converted", "finished_utc": "2026-10-12T14:11:24Z"}`
- `{"name": "sd_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "rows": 66, "status": "OK", "finished_utc": "2026-10-12T14:11:25Z"}`
- `{"name": "sd_wells.csv", "from": "tables/Wells.csv", "rows": 2137, "api_column_renamed_from": "API Number", "export_date": "2026-10-01", "status": "OK", "finished_utc": "2026-10-12T14:18:00Z"}`
- `{"name": "sd_well_completions.csv", "from": "tables/Well_Completions.csv", "rows": 2048, "api_column_renamed_from": "API Number", "export_date": "2026-10-01", "status": "OK", "finished_utc": "2026-10-12T14:18:00Z"}`
- `{"name": "sd_formation_tops.csv", "from": "tables/Formation_Tops.csv", "rows": 15559, "api_column_renamed_from": "API Number", "export_date": "2026-10-01", "status": "OK", "finished_utc": "2026-10-12T14:18:00Z"}`

## Row count

| what | rows |
|---|---|
| sd_wells.csv (rows in file) | 2,137 |
| wells in the app (meta.json) | 2,137 |
| regulator live count (https://sddenr.net/pubs/og/SDOILexport.zip (Wells.xlsx; DANR publishes no live count), 2026-10-12T14:11:24Z) | 2,137 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon Longitude (GCS NAD 83), lat Latitude (GCS NAD 83); datum NAD83 (GCS NAD 83, per the column names).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the South Dakota outline bbox (+0.05 deg) | 0 |
| valid but outside the South Dakota outline (Census, generalized; points on the border can fall just outside) | 1 |
| **on the map: exact** | 2,137 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 12 | 1,998 |
| 15 | 138 |
| 16 | 1 |

Wells with a full API (10 digits starting 40): 2,137; distinct: 1,999; APIs on more than one row: 124; without a full API (not searchable by API): 0

## Type (Current Well Type)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil | Oil | oil | 379 | 379 | 0 |
| Gas | Gas | gas | 156 | 156 | 0 |
| Water Injection | Water Injection | injection | 89 | 89 | 0 |
| Salt Water Disposal | Salt Water Disposal | injection | 36 | 36 | 0 |
| Air Injection | Air Injection | injection | 20 | 20 | 0 |
| Dry Hole | Dry Hole | dry | 808 | 808 | 0 |
| Dry Hole-Oil show | Dry Hole-Oil show | dry | 217 | 217 | 0 |
| Dry Hole-Gas show | Dry Hole-Gas show | dry | 122 | 122 | 0 |
| Dry Hole-Oil and Gas show | Dry Hole-Oil and Gas show | dry | 83 | 83 | 0 |
| None | None | other | 222 | 222 | 0 |
| Water Supply | Water Supply | other | 5 | 5 | 0 |

## Status (Administrative Status)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Plugged and Abandoned | Plugged and Abandoned | - | 1,417 | 1,417 | 0 |
| Producing | Producing | - | 240 | 240 | 0 |
| Never drilled | Never drilled | - | 216 | 216 | 0 |
| Shut In | Shut In | - | 92 | 92 | 0 |
| Converted-Fresh Water Supply | Converted-Fresh Water Supply | - | 75 | 75 | 0 |
| Injecting | Injecting | - | 63 | 63 | 0 |
| Temporarily Abandoned | Temporarily Abandoned | - | 18 | 18 | 0 |
| Not Spudded | Not Spudded | - | 6 | 6 | 0 |
| Converted-Domestic Gas | Converted-Domestic Gas | - | 4 | 4 | 0 |
| Converted-Water Supply-Injection | Converted-Water Supply-Injection | - | 4 | 4 | 0 |
| Abandoned-Not Regulated | Abandoned-Not Regulated | - | 2 | 2 | 0 |

## Fields (28) and blank counts

| field | label in app | blank |
|---|---|---|
| API | API | 0 |
| Permit | Permit | 0 |
| Operator | Operator | 1 |
| Well Name | Well Name | 0 |
| Administrative Status | Administrative Status | 0 |
| Oil or Gas Field | Oil Or Gas Field | 0 |
| Enhanced Recovery Unit | Enhanced Recovery Unit | 0 |
| Measured Directions | Measured Directions | 2 |
| Location Description | Location Description | 0 |
| County | County | 0 |
| Kelly Bushing Elevation | Kelly Bushing Elevation | 477 |
| Ground Surface Elevation | Ground Surface Elevation | 221 |
| Current Well Type | Current Well Type | 0 |
| Permitted Well Type | Permitted Well Type | 4 |
| Well Completion Type | Well Completion Type | 0 |
| Date Permit Issued | Date Permit Issued | 72 |
| Spud Date | Spud Date | 265 |
| Completion Date | Completion Date | 1,426 |
| Plug Date | Plug Date | 741 |
| Bottom Hole Formation | Bottom Hole Formation | 222 |
| Latitude (GCS NAD 83) | Latitude (gcs Nad 83) | 0 |
| Longitude (GCS NAD 83) | Longitude (gcs Nad 83) | 0 |
| Permit file URL | Permit File Url | 0 |
| Elogs URL | Elogs Url | 0 |
| Core Available | Core Available | 0 |
| Cuttings Available | Cuttings Available | 0 |
| Export Date | Export Date | 0 |
| UIC Permit | UIC Permit | 0 |

## Source notes (pull agent, 2026-10-12)

- **Source**: South Dakota DANR Oil & Gas (data maintained by the SD Geological Survey), bulk export
  https://sddenr.net/pubs/og/SDOILexport.zip (18.1 MB; no Last-Modified header; Wells.xlsx dated 2026-10-01 inside
  the zip, "Export Date" column 2026-10-01). Downloaded ONCE by `scripts/pull_sd.py`; no 403/429.
- **Counts**: Wells.xlsx 2,137 rows = rows in the app (matches the survey). DANR publishes no live count. Every row
  had coordinates: exact 2,137, repaired 0, approximate 0, unmapped 0. 1 point just outside the generalized Census
  outline (border). No PLSS grid was pulled or configured.
- **Coordinates**: "Latitude (GCS NAD 83)" / "Longitude (GCS NAD 83)" - datum NAD83 stated in the column names.
- **Fields**: all 28 Wells.xlsx columns (Permit, Operator, Administrative Status, field, ERU, "Location Description"
  such as "NWNW Sec 28 Twp 104N Rng 63W", elevations, Current/Permitted/Completion well type, permit/spud/completion/
  plug dates, bottom-hole formation, "Permit file URL" and "Elogs URL" per well, core/cuttings flags, UIC Permit).
  "API Number" ("40 003 05001", 139 rows carry a 2-digit suffix) was renamed `API`.
- **Layers** (joined on the full API): `sd_well_completions.csv` (Well_Completions.xlsx, 2,048 rows -> 1,920 wells:
  wellbore type, MD/TVD, producing interval, bottom-hole location) and `sd_formation_tops.csv` (Formation_Tops.xlsx,
  15,559 rows -> 2,109 wells). Converted but NOT promoted (kept under `tables/`): UIC_InjectionData_All_Years
  (35,198 monthly injection reports) and Oil_Gas_Production_All_Years (openpyxl read no sheet from it; production is
  out of scope). The xlsx->csv conversion uses openpyxl (installed system-wide).
- **County codes**: 9 wells carry API county codes 113 (Shannon, renamed Oglala Lakota = FIPS 102 in 2015) and 131
  (Washabaugh, dissolved 1983) that no longer exist in the Census file; they map fine but have no county outline.
- **Type / status**: legend type = "Current Well Type" (Dry Hole 808; Oil 379; None 222; Dry Hole-Oil show 217; Gas
  156; Dry Hole-Gas show 122; Water Injection 89; Dry Hole-Oil and Gas show 83; Salt Water Disposal 36; Air
  Injection 20; Water Supply 5), status = "Administrative Status" (Plugged and Abandoned 1,417; Producing 240;
  Never drilled 216; ...). "None" = never drilled / not spudded -> other.
- **Update frequency**: roughly monthly by the file dates (2026-08-11 gdb, 2026-10-01 export); not confirmed.
- **Unverified**: terms of use (no robots.txt); update cadence.
