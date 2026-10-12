# Snapshot report - Colorado Energy & Carbon Management Commission (ECMC) well data (Colorado)

Report generated: 2026-10-12 14:24 UTC  
Data date shown in the app: **2026-10-11** (from ../../../../../../../../Users/ocean/.claude/projects/tx-wells-map/data/raw/co/pull_log.jsonl (co_wells.csv, zip_entry_date))  

Pull log:

- `{"name": "WELLS_SHP.ZIP", "url": "https://ecmc.state.co.us/documents/data/downloads/gis/WELLS_SHP.ZIP", "bytes": 15761046, "last_modified": "Sun, 11 Oct 2026 13:14:59 GMT", "status": "downloaded", "finished_utc": "2026-10-12T14:06:00Z"}`
- `{"name": "co_wells.csv", "from": "WELLS_SHP.ZIP", "rows": 124451, "null_geometry": 0, "zip_entry_date": "2026-10-11", "prj": "PROJCS[\"NAD_1983_UTM_Zone_13N\",GEOGCS[\"GCS_North_American_1983\",DATUM[\"D_North_American_1983\",SPHEROID[\"GRS_1980\",6378137.0,298.257222101]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"False_Easting\",500000.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",-105.0],PARAMETER[\"Scale_Factor\",0.9996],PARAMETER[\"Latitude_Of_Origin\",0.0],UNIT[\"Meter\",1.0]]", "status": "converted", "finished_utc": "2026-10-12T14:06:03Z"}`
- `{"name": "co_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "rows": 64, "status": "OK", "finished_utc": "2026-10-12T14:06:04Z"}`

## Row count

| what | rows |
|---|---|
| co_wells.csv (rows in file) | 124,451 |
| wells in the app (meta.json) | 124,451 |

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326 / Longitude, lat lat_4326 / Latitude; datum NAD83 (converted from NAD83 UTM zone 13N shapefile geometry; about 1 m from WGS84).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Colorado outline bbox (+0.05 deg) | 0 |
| valid but outside the Colorado outline (Census, generalized; points on the border can fall just outside) | 10 |
| **on the map: exact** | 124,451 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 12 | 124,451 |

Wells with a full API (10 digits starting 05): 124,451; distinct: 124,434; APIs on more than one row: 17; without a full API (not searchable by API): 0

## Type (Well_Class)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| OW | OW | oil | 30,045 | 30,045 | 0 |
| GW | GW | gas | 37,007 | 37,007 | 0 |
| CBM | CBM | gas | 5,421 | 5,421 | 0 |
| CO2 | CO2 | gas | 152 | 152 | 0 |
| DM | DM | gas | 48 | 48 | 0 |
| ERI | ERI | injection | 1,113 | 1,113 | 0 |
| DSP | DSP | injection | 607 | 607 | 0 |
| CLA | CLA | injection | 32 | 32 | 0 |
| DA | DA | dry | 25,396 | 25,396 | 0 |
| LO | LO | other | 22,960 | 22,960 | 0 |
| (blank) | (blank) | other | 1,116 | 1,116 | 0 |
| STO | STO | other | 275 | 275 | 0 |
| OBW | OBW | other | 230 | 230 | 0 |
| STR | STR | other | 19 | 19 | 0 |
| HE | HE | other | 18 | 18 | 0 |
| OTH | OTH | other | 10 | 10 | 0 |
| GEO | GEO | other | 2 | 2 | 0 |

## Status (Facil_Stat)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| PA | PA | - | 55,791 | 55,791 | 0 |
| PR | PR | - | 35,959 | 35,959 | 0 |
| AL | AL | - | 22,434 | 22,434 | 0 |
| SI | SI | - | 6,203 | 6,203 | 0 |
| TA | TA | - | 993 | 993 | 0 |
| AP | AP | - | 702 | 702 | 0 |
| IJ | IJ | - | 688 | 688 | 0 |
| EP | EP | - | 471 | 471 | 0 |
| AC | AC | - | 399 | 399 | 0 |
| WO | WO | - | 394 | 394 | 0 |
| DG | DG | - | 293 | 293 | 0 |
| SO | SO | - | 124 | 124 | 0 |

## Fields (40) and blank counts

| field | label in app | blank |
|---|---|---|
| API | API | 0 |
| API_County | API County | 0 |
| API_Seq | API Seq | 0 |
| API_Label | API Label | 0 |
| Operat_Num | Operat Number | 0 |
| Operator | Operator | 0 |
| Well_Num | Well Number | 1 |
| Well_Name | Well Name | 0 |
| Well_Title | Well Title | 1 |
| Citing_Typ | Citing Typ | 34,320 |
| Spud_Date | Spud Date | 34,320 |
| Ground_Ele | Ground Ele | 4,925 |
| Max_MD | Max Md | 26,052 |
| Max_TVD | Max Tvd | 57,293 |
| Field_Code | Field Code | 0 |
| Field_Name | Field Name | 0 |
| Facil_Id | Facil ID | 0 |
| Facil_Type | Facil Type | 0 |
| Facil_Stat | Facil Stat | 0 |
| Well_Class | Well Class | 1,116 |
| Stat_Date | Stat Date | 0 |
| Loc_Qual | Loc Qual | 62 |
| Loc_ID | Loc ID | 61 |
| Loc_Name | Loc Name | 61 |
| Dist_N_S | Dist N S | 265 |
| Dir_N_S | Dir N S | 965 |
| Dist_E_W | Dist E W | 265 |
| Dir_E_W | Dir E W | 965 |
| Qtr_Qtr | Qtr Qtr | 136 |
| Section | Section | 0 |
| Township | Township | 0 |
| Range | Range | 0 |
| Meridian | Meridian | 1 |
| Latitude | Latitude | 0 |
| Longitude | Longitude | 0 |
| Utm_X | Utm X | 0 |
| Utm_Y | Utm Y | 0 |
| lon_4326 | Longitude (WGS84) | 0 |
| lat_4326 | Latitude (WGS84) | 0 |
| docs_url | Documents Url | 0 |

## Source notes (pull agent, 2026-10-12)

- **Source**: ECMC (formerly COGCC) daily well shapefile
  https://ecmc.state.co.us/documents/data/downloads/gis/WELLS_SHP.ZIP (15.8 MB, Last-Modified 2026-10-11 13:14 GMT,
  .dbf dated 2026-10-11). `ecmc.state.co.us/robots.txt` disallows `/documents/`; Ocean approved one polite pull, and
  `scripts/pull_co.py` never downloads the zip again once it exists. One request, no 403/429.
- **Counts**: 124,451 shapefile records = 124,451 rows = rows in the app (the research survey's 124,451 matched).
  ECMC publishes no separate live count. Every record had a point: exact 124,451, repaired 0, approximate 0,
  unmapped 0. No PLSS grid was pulled or configured.
- **Coordinates**: the .shp points are NAD83 UTM zone 13N (per the .prj); the pull script converts them to
  lon/lat with the GRS80 inverse Transverse Mercator (`lon_4326`/`lat_4326`). The attribute `Latitude`/`Longitude`
  (NAD83) agree with the conversion within 7.4e-6 degrees (under 1 m). 10 points fall just outside the generalized
  Census outline, all within about 2 km of the state bbox (border wells).
- **Fields**: all 37 DBF columns plus `lon_4326`, `lat_4326`, `docs_url` (ECMC facility page,
  `https://ecmc.state.co.us/cogisdb/Facility/FacilityDetailExpand?api=<county+sequence>`; the URL pattern
  returned 200 in the survey; individual pages were not fetched).
- **API**: `API_Label` is the dashed full API (05-ccc-sssss, all 124,451 rows), used as the API field; `API` is the
  8-digit county+sequence ECMC key.
- **Type / status**: legend type = `Well_Class` (GW 37,007; OW 30,045; DA 25,396; LO 22,960; CBM 5,421; blank 1,116;
  ERI 1,113; DSP 607; STO 275; OBW 230; CO2 152; DM 48; CLA 32; STR 19; HE 18; OTH 10; GEO 2), status = `Facil_Stat`
  (PA, PR, AL, SI, TA, AP, IJ, EP, AC, WO, DG, SO). ECMC ships no code dictionary with the file; the category
  mapping (GW/CBM/DM/CO2 gas, OW oil, DA dry, ERI/DSP/CLA injection, rest other) follows ECMC's COGIS code
  conventions and the data itself (CO2 wells are 113 producing in McElmo / Sheep Mountain; CLA wells are 24 injecting
  in Ignacio Blanco). Legend labels are the raw codes.
- **PLSS columns**: `Meridian` values 6 (117,366), N (5,965), M (985), U (124), C (6), O (3). "M" rows are all T34N
  in La Plata/Archuleta (New Mexico PM country) - likely a data-entry variant; irrelevant for placement since every
  row has coordinates.
- **Update frequency**: daily (file dated the previous morning on both survey and pull days).
- **Unverified**: terms of use; the exact meaning of `Facil_Stat`/`Well_Class` codes (no dictionary fetched).
- **Layers**: none (the ECMC site has other downloads, not pulled).
