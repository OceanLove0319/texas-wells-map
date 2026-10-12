# Snapshot report - North Dakota Industrial Commission, Oil and Gas Division (NDIC DMR) well data (North Dakota)

Report generated: 2026-10-12 14:24 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/nd/pull_log.jsonl (nd_wells.csv))  

Pull log:

- `{"name": "nd_wells.csv", "service": "https://gis.dmr.nd.gov/dmrpublicservices/rest/services/All_Wells/MapServer/0", "rows": 43983, "server_count": 43983, "no_geometry": 0, "status": "OK", "finished_utc": "2026-10-12T14:03:14Z"}`
- `{"name": "nd_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "rows": 53, "status": "OK", "finished_utc": "2026-10-12T14:03:15Z"}`

## Row count

| what | rows |
|---|---|
| nd_wells.csv (rows in file) | 43,983 |
| wells in the app (meta.json) | 43,983 |
| regulator live count (https://gis.dmr.nd.gov/dmrpublicservices/rest/services/All_Wells/MapServer/0, 2026-10-12T14:02:42Z) | 43,983 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326 / longitude, lat lat_4326 / latitude; datum WGS84 (service geometry, reprojected by the server from Web Mercator / EPSG:3857).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the North Dakota outline bbox (+0.05 deg) | 0 |
| valid but outside the North Dakota outline (Census, generalized; points on the border can fall just outside) | 0 |
| **on the map: exact** | 43,983 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 18 | 43,983 |

Wells with a full API (10 digits starting 33): 43,983; distinct: 43,983; APIs on more than one row: 0; without a full API (not searchable by API): 0

## Type (symbol)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| A-OG | A-OG | oil | 19,982 | 19,982 | 0 |
| IA-OG | IA-OG | oil | 978 | 978 | 0 |
| TA-OG | TA-OG | oil | 149 | 149 | 0 |
| TAO-OG | TAO-OG | oil | 21 | 21 | 0 |
| TASC-OG | TASC-OG | oil | 11 | 11 | 0 |
| TATD-OG | TATD-OG | oil | 2 | 2 | 0 |
| A-GASD | A-GASD | gas | 159 | 159 | 0 |
| PA-OG | PA-OG | plugged | 5,723 | 5,723 | 0 |
| AB-OG | AB-OG | plugged | 771 | 771 | 0 |
| PA-SWD | PA-SWD | plugged | 262 | 262 | 0 |
| PA-WI | PA-WI | plugged | 243 | 243 | 0 |
| PA-GASC | PA-GASC | plugged | 102 | 102 | 0 |
| PA-GASD | PA-GASD | plugged | 45 | 45 | 0 |
| PA-WS | PA-WS | plugged | 35 | 35 | 0 |
| PANF-OG | PANF-OG | plugged | 27 | 27 | 0 |
| AB-WI | AB-WI | plugged | 17 | 17 | 0 |
| PNS-OG | PNS-OG | plugged | 17 | 17 | 0 |
| PA-ST | PA-ST | plugged | 15 | 15 | 0 |
| PA-AI | PA-AI | plugged | 13 | 13 | 0 |
| AB-SWD | AB-SWD | plugged | 9 | 9 | 0 |
| PA-GASN | PA-GASN | plugged | 4 | 4 | 0 |
| AB-AI | AB-AI | plugged | 4 | 4 | 0 |
| PA-DF | PA-DF | plugged | 4 | 4 | 0 |
| AB-ST | AB-ST | plugged | 3 | 3 | 0 |
| PA-GI | PA-GI | plugged | 2 | 2 | 0 |
| PA-GS | PA-GS | plugged | 1 | 1 | 0 |
| PA-INJP | PA-INJP | plugged | 1 | 1 | 0 |
| PA-DFP | PA-DFP | plugged | 1 | 1 | 0 |
| AB-GASD | AB-GASD | plugged | 1 | 1 | 0 |
| PA-CBM | PA-CBM | plugged | 1 | 1 | 0 |
| AB-WS | AB-WS | plugged | 1 | 1 | 0 |
| PA-AGD | PA-AGD | plugged | 1 | 1 | 0 |
| A-SWD | A-SWD | injection | 581 | 581 | 0 |
| A-WI | A-WI | injection | 509 | 509 | 0 |
| A-CO2I | A-CO2I | injection | 41 | 41 | 0 |
| IA-WI | IA-WI | injection | 32 | 32 | 0 |
| IA-SWD | IA-SWD | injection | 26 | 26 | 0 |
| TA-WI | TA-WI | injection | 13 | 13 | 0 |
| A-CO2S | A-CO2S | injection | 8 | 8 | 0 |
| TA-SWD | TA-SWD | injection | 6 | 6 | 0 |
| A-GI | A-GI | injection | 6 | 6 | 0 |
| TA-AI | TA-AI | injection | 5 | 5 | 0 |
| A-MWUI | A-MWUI | injection | 2 | 2 | 0 |
| IA-GI | IA-GI | injection | 1 | 1 | 0 |
| A-AGD | A-AGD | injection | 1 | 1 | 0 |
| TAO-GI | TAO-GI | injection | 1 | 1 | 0 |
| A-SFI | A-SFI | injection | 1 | 1 | 0 |
| DRY-OG | DRY-OG | dry | 6,094 | 6,094 | 0 |
| DRY-ST | DRY-ST | dry | 132 | 132 | 0 |
| DRY-SWD | DRY-SWD | dry | 47 | 47 | 0 |
| DRY-GASD | DRY-GASD | dry | 36 | 36 | 0 |
| DRY-WI | DRY-WI | dry | 30 | 30 | 0 |
| DRY-CBM | DRY-CBM | dry | 5 | 5 | 0 |
| DRY-GASC | DRY-GASC | dry | 4 | 4 | 0 |
| PNC-OG | PNC-OG | other | 5,600 | 5,600 | 0 |
| Confidential-Confidential | Confidential-Confidential | other | 1,023 | 1,023 | 0 |
| LOC-OG | LOC-OG | other | 566 | 566 | 0 |
| DRL-OG | DRL-OG | other | 290 | 290 | 0 |
| PNC-SWD | PNC-SWD | other | 96 | 96 | 0 |
| A-WS | A-WS | other | 54 | 54 | 0 |
| PNC-GASD | PNC-GASD | other | 38 | 38 | 0 |
| EXP-OG | EXP-OG | other | 32 | 32 | 0 |
| LOC-SWD | LOC-SWD | other | 32 | 32 | 0 |
| PNC-ST | PNC-ST | other | 11 | 11 | 0 |
| DRL-SWD | DRL-SWD | other | 11 | 11 | 0 |
| TAO-ST | TAO-ST | other | 7 | 7 | 0 |
| TATD-ST | TATD-ST | other | 6 | 6 | 0 |
| PNC-WI | PNC-WI | other | 5 | 5 | 0 |
| A-ST | A-ST | other | 4 | 4 | 0 |
| NC-OG | NC-OG | other | 4 | 4 | 0 |
| EXP-ST | EXP-ST | other | 2 | 2 | 0 |
| PNC-SFI | PNC-SFI | other | 2 | 2 | 0 |
| TA-WS | TA-WS | other | 2 | 2 | 0 |
| PNC-WS | PNC-WS | other | 2 | 2 | 0 |
| EXP-SWD | EXP-SWD | other | 2 | 2 | 0 |
| LOCR-WI | LOCR-WI | other | 1 | 1 | 0 |
| IA-WS | IA-WS | other | 1 | 1 | 0 |
| A-DF | A-DF | other | 1 | 1 | 0 |
| TA-ST | TA-ST | other | 1 | 1 | 0 |
| NC-ST | NC-ST | other | 1 | 1 | 0 |
| LOCR-ST | LOCR-ST | other | 1 | 1 | 0 |
| LOC-SFI | LOC-SFI | other | 1 | 1 | 0 |
| NJ-NJ | NJ-NJ | other | 1 | 1 | 0 |

## Status (status)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| A | A | - | 21,349 | 21,349 | 0 |
| PA | PA | - | 6,453 | 6,453 | 0 |
| DRY | DRY | - | 6,348 | 6,348 | 0 |
| PNC | PNC | - | 5,754 | 5,754 | 0 |
| IA | IA | - | 1,038 | 1,038 | 0 |
| Confidential | Confidential | - | 1,023 | 1,023 | 0 |
| AB | AB | - | 806 | 806 | 0 |
| LOC | LOC | - | 599 | 599 | 0 |
| DRL | DRL | - | 301 | 301 | 0 |
| TA | TA | - | 176 | 176 | 0 |
| EXP | EXP | - | 36 | 36 | 0 |
| TAO | TAO | - | 29 | 29 | 0 |
| PANF | PANF | - | 27 | 27 | 0 |
| PNS | PNS | - | 17 | 17 | 0 |
| TASC | TASC | - | 11 | 11 | 0 |
| TATD | TATD | - | 8 | 8 | 0 |
| NC | NC | - | 5 | 5 | 0 |
| LOCR | LOCR | - | 2 | 2 | 0 |
| NJ | NJ | - | 1 | 1 | 0 |

## Fields (25) and blank counts

| field | label in app | blank |
|---|---|---|
| OBJECTID | Object ID | 0 |
| fileno | Fileno | 0 |
| api_no | API No. | 0 |
| operator | Operator | 0 |
| well_name | Well Name | 0 |
| td | Td | 7,794 |
| spud_date | Spud Date | 6,996 |
| field_name | Field Name | 1 |
| qq | Qq | 2 |
| sec | Sec | 0 |
| twp | Twp | 0 |
| rng | Rng | 0 |
| feet_ns | Feet N/S | 0 |
| fnsl | Fnsl | 1 |
| feet_ew | Feet E/W | 0 |
| fewl | Fewl | 1 |
| latitude | Latitude | 0 |
| longitude | Longitude | 0 |
| well_type | Well Type | 0 |
| status | Status | 0 |
| api | API | 0 |
| County | County | 0 |
| symbol | Symbol | 0 |
| lon_4326 | Longitude (WGS84) | 0 |
| lat_4326 | Latitude (WGS84) | 0 |

## Source notes (pull agent, 2026-10-12)

- **Source**: NDIC Oil and Gas Division public ArcGIS MapServer `All_Wells/0`
  (https://gis.dmr.nd.gov/dmrpublicservices/rest/services/All_Wells/MapServer/0). LOCATIONS ONLY: the Well Index
  spreadsheet, scout tickets, well files and production are behind NDIC's premium subscription and were not
  pulled or worked around. Pulled once with `scripts/pull_nd.py`: 22 keyset pages of 2,000, one request at a time,
  0.6 s apart, no 403/429.
- **Counts**: service count 43,983 = rows pulled 43,983 = rows in the app. Every row had point geometry: exact
  43,983, repaired 0, approximate 0, unmapped 0. No PLSS grid was pulled or configured. 0 points outside the
  Census outline.
- **Coordinates**: geometry requested with `outSR=4326` (service stores Web Mercator EPSG:3857). The attribute
  `latitude`/`longitude` columns (datum not stated by NDIC) are the fallback; they differ from the geometry by at
  most 1.9e-5 degrees.
- **Fields**: all 23 attributes plus `lon_4326`/`lat_4326`; `spud_date` epoch-ms converted to YYYY-MM-DD. PLSS
  columns twp (N), rng (W), sec, qq ("SWSW" = SW of SW; also LOT1..LOT4), footages feet_ns/fnsl/feet_ew/fewl.
- **API**: `api_no` dashed ("33-043-00002-00-00") and `api` 14-digit; all 43,983 start with 33.
- **Type / status**: legend type = `symbol`, NDIC's own "<status>-<type>" map symbol (83 distinct values, e.g. A-OG
  19,982; DRY-OG 6,094; PA-OG 5,723; PNC-OG 5,600; Confidential-Confidential 1,023). The layer renderer publishes
  no labels for them, so the legend shows the raw codes; no dictionary was invented. Categories are derived from the
  parts: status PA/PANF/PNS/AB -> plugged, DRY -> dry, PNC/LOC/LOCR/DRL/EXP/NC/NCW/Confidential -> other, else by type
  (OG oil; GASD/GASC/GASN/CBM gas; SWD/WI/AI/GI/CO2I/CO2S/SFI/INJP/MWUI/AGD injection; ST/WS/GS/DF/DFP other).
  Status = `status` (A 21,349; PA 6,453; DRY 6,348; PNC 5,754; IA 1,038; Confidential 1,023; ...).
- **Update frequency**: a 2022 DMR notice said the service updates hourly (not re-verified). The data date shown
  is the pull date.
- **Unverified**: terms of use (no robots.txt); the official expansion of the status/type codes (they follow NDIC's
  GIS legend conventions); the subscription price.
- **Layers**: none (the Horizontal/Directional bore layers on the same server were not pulled: locations only).
