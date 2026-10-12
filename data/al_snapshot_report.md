# Snapshot report - State Oil and Gas Board of Alabama (OGB, Geological Survey of Alabama) well data (Alabama)

Report generated: 2026-10-12 14:29 UTC  
Data date shown in the app: **2026-10-12** (from ../../../../../../../Users/ocean/.claude/projects/tx-wells-map/data/raw/al/pull_log.jsonl (al_wells.csv))  

Pull log:

- `{"name": "source_count.json", "service": "https://map.ogb.state.al.us/arcgis/rest/services/OGB/map/MapServer/3", "server_count": 17373, "status": "OK", "finished_utc": "2026-10-12T14:05:40Z", "layer2_count": 16197}`
- `{"name": "al_wells_layer2.txt", "service": "https://map.ogb.state.al.us/arcgis/rest/services/OGB/map/MapServer/2", "layer_name": "Wells", "rows": 16197, "server_count": 16197, "status": "OK", "finished_utc": "2026-10-12T14:12:02Z"}`
- `{"name": "al_wells.csv", "service": "https://map.ogb.state.al.us/arcgis/rest/services/OGB/map/MapServer/3", "layer_name": "WebWell Search Layer", "rows": 17373, "server_count": 17373, "status": "OK", "finished_utc": "2026-10-12T14:12:19Z"}`
- `{"name": "al_surface_locations.csv", "service": "https://map.ogb.state.al.us/arcgis/rest/services/OGB/map/MapServer/5", "layer_name": "Surface Location", "rows": 1121, "server_count": 1121, "status": "OK", "finished_utc": "2026-10-12T14:12:21Z"}`
- `{"name": "al_bhl_locations.csv", "service": "https://map.ogb.state.al.us/arcgis/rest/services/OGB/map/MapServer/7", "layer_name": "BHL Location", "rows": 1118, "server_count": 1118, "status": "OK", "finished_utc": "2026-10-12T14:12:24Z"}`
- `{"name": "al_wells.csv (dates)", "newest_non_future_dates": {"last_edited_date": "2026-10-12", "PermitDate": "2015-11-26", "SpudDate": "2015-12-18", "StatusDate": "2016-04-05", "FirstProductionDate": "2016-04-05"}, "rows_with_last_edited_date_after_pull": 5799, "note": "last_edited_date is not a usable data date; the header shows the pull date", "finished_utc": "2026-10-12T14:21:13Z"}`

## Row count

| what | rows |
|---|---|
| al_wells.csv (rows in file) | 17,373 |
| wells in the app (meta.json) | 17,373 |
| regulator live count (https://map.ogb.state.al.us/arcgis/rest/services/OGB/map/MapServer/3, 2026-10-12T14:05:40Z) | 17,373 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326 / Longitude, lat lat_4326 / Latitude; datum WGS84 (service geometry, Web Mercator reprojected by the server; attribute Latitude/Longitude identical, datum not stated by OGB).

| what | wells |
|---|---|
| null or 0 | 599 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Alabama outline bbox (+0.05 deg) | 0 |
| valid but outside the Alabama outline (Census, generalized; points on the border can fall just outside) | 1 |
| **on the map: exact** | 16,774 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 564 |
| **not on the map** | 35 |

Why wells without usable coordinates could not be placed:

- section is ambiguous in the BLM grid: 4
- missing or invalid township/range/section: 24
- missing meridian: 3
- section not found in the BLM grid: 4

PLSS grid: data/raw/plss/AL_sections.jsonl, 52,306 sections, 52,265 keys (70 ambiguous, not used).

## API

| raw API length | wells |
|---|---|
| 18 | 17,373 |

Wells with a full API (10 digits starting 01): 17,373; distinct: 15,925; APIs on more than one row: 1,201; without a full API (not searchable by API): 0

## Type (WellType)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil (OIL) | OIL | oil | 2,476 | 2,469 | 0 |
| Coal Bed Methane (CM) | CM | gas | 9,102 | 9,097 | 384 |
| Gas (GAS) | GAS | gas | 2,015 | 2,010 | 16 |
| Gas Condensate (GC) | GC | gas | 331 | 331 | 0 |
| Shale Gas (SHG) | SHG | gas | 60 | 60 | 0 |
| Water Injection (WI) | WI | injection | 301 | 301 | 0 |
| Water Disposal (SWD) | SWD | injection | 227 | 227 | 1 |
| Gas Injection (GI) | GI | injection | 52 | 52 | 0 |
| Undesignated (UN) | UN | other | 2,765 | 2,747 | 161 |
| Gas Storage (GS) | GS | other | 16 | 16 | 0 |
| Water Well (Domestic) (WW) | WW | other | 14 | 14 | 2 |
| Water Source (WS) | WS | other | 14 | 14 | 0 |

## Status (WellStatus)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Producing (PR) | PR | - | 5,683 | 5,679 | 1 |
| Plugged and Abandoned (PA) | PA | - | 4,998 | 4,994 | 374 |
| Dry and Abandoned (DA) | DA | - | 4,980 | 4,962 | 185 |
| Temporarily Abandoned (TA) | TA | - | 723 | 723 | 0 |
| Converted (CV) | CV | - | 421 | 421 | 0 |
| Active (AC) | AC | - | 190 | 190 | 2 |
| Plugged Back (PB) | PB | - | 126 | 126 | 0 |
| Regulatory Change (RC) | RC | - | 102 | 102 | 0 |
| Released Jurisdiction (RJ) | RJ | - | 95 | 95 | 1 |
| Abandoned (AB) | AB | - | 30 | 30 | 1 |
| Permitted Well (PW) | PW | - | 14 | 14 | 0 |
| Shut In (SI) | SI | - | 2 | 2 | 0 |
| Undesignated (UN) | UN | - | 9 | 0 | 0 |

## Fields (60) and blank counts

| field | label in app | blank |
|---|---|---|
| pKey | Pkey | 0 |
| Permit | Permit | 0 |
| API | API | 0 |
| WellName | Wellname | 10 |
| Operator | Operator | 0 |
| FieldName | Fieldname | 36 |
| PoolName | Poolname | 4,952 |
| WellStatus | Well Status | 0 |
| WellType | Well Type | 0 |
| CountyName | Countyname | 0 |
| SecNum | Secnum | 109 |
| Township | Township | 106 |
| TownshipDir | Townshipdir | 106 |
| Range | Range | 106 |
| RangeDir | Rangedir | 106 |
| TypeDesc | Typedesc | 0 |
| StatusDesc | Statusdesc | 0 |
| ConstructKey | Constructkey | 0 |
| FieldKey | Fieldkey | 36 |
| CountyKey | Countykey | 0 |
| WellKey | Wellkey | 0 |
| Longitude | Longitude | 599 |
| Latitude | Latitude | 599 |
| FieldNumber | Fieldnumber | 36 |
| PermitDate | Permitdate | 0 |
| PoolCode | Poolcode | 4,952 |
| Region | Region | 0 |
| Comment | Comment | 6,261 |
| DrillingUnitAcres | Drillingunitacres | 4,201 |
| DrillingUnitDescription | Drillingunitdescription | 1,579 |
| PLSS | Plss | 109 |
| HistoricWellName | Historicwellname | 10 |
| EntityKey | Entitykey | 0 |
| LastLogDate | Lastlogdate | 2 |
| FirstProductionDate | Firstproductiondate | 0 |
| SpudDate | Spuddate | 2 |
| BHL_OBJECTID | BHL Object ID | 16,197 |
| BHL_Permit | BHL Permit | 16,197 |
| BHL_APINumber | BHL Apinumber | 16,197 |
| BHL_Longitude | BHL Longitude | 16,197 |
| BHL_Latitude | BHL Latitude | 16,197 |
| BHL_GlobalID | BHL Globalid | 16,197 |
| BHL_Map_Well | BHL Map Well | 16,202 |
| BHL_WellType | BHL Well Type | 16,197 |
| BHL_WellStatus | BHL Well Status | 16,197 |
| DTD | Dtd | 542 |
| LTD | Ltd | 4,882 |
| MD | Md | 17,373 |
| StatusDate | Statusdate | 0 |
| UnitName | Unitname | 14,480 |
| GR | Gr | 3,420 |
| KB | Kb | 10,525 |
| DF | DF | 9,916 |
| GlobalID | Globalid | 0 |
| created_user | Created User | 0 |
| created_date | Created Date | 0 |
| last_edited_user | Last Edited User | 0 |
| last_edited_date | Last Edited Date | 0 |
| lon_4326 | Longitude (WGS84) | 599 |
| lat_4326 | Latitude (WGS84) | 599 |

## Source notes
- Source: State Oil and Gas Board of Alabama MapServer OGB/map, layer 3 "WebWell Search Layer" (17,373 rows) as the base; layer 2 "Wells" (16,197) was pulled too (al_wells_layer2.txt) and omits the 1,166 directionally drilled wells that have a bottom-hole record, so layer 3 is complete. 10 APIs repeat in layer 3 (one row per bottom hole). The service's 25,000-row limit returns HTTP 500, so pages of 2,000 were used (sequential, 0.5 s sleep; 9 + 9 + 1 + 1 requests).
- Companion layers (join on API, 14 digits): al_surface_locations.csv (layer 5, 1,121; 1,120 joined) and al_bhl_locations.csv (layer 7, 1,118; 1,117 joined). Layer 22 "GOB Wells" (133 polygons) was not pulled.
- Update frequency: not published. The service's last_edited_date is unusable as a data date (5,799 rows are dated after the pull, up to 2027-04-09), so the header shows the pull date 2026-10-12. Newest plausible dates in the data: PermitDate 2015-11-26, SpudDate 2015-12-18, StatusDate 2016-04-05 - the layer may lag the regulator's database by years. Unverified.
- Codes: al_codes.json from the TypeDesc / StatusDesc columns. CM (Coal Bed Methane, 9,102 wells) overridden to the gas category.
- Coordinates: 16,774 exact; 599 rows without coordinates, of which 564 placed from SecNum/Township/Range at the section center. Alabama has two meridians (CadNSDI 16 Huntsville, 25 St. Stephens, plus a 29 Tallahassee sliver); al_county_meridians.json assigns 31 of 56 counties from wells with coordinates. Straddling counties left to grid inference: BIBB (16:186/25:37), GREENE (16:10/25:37). Tuscaloosa is assigned 16 with 265 of 5,733 located wells in 25.
- Placement check on wells with coordinates: median 0.64 km, p90 0.87 km, p99 1.05 km; 7 of 16,389 > 5 km.
- Not placed (35): 24 missing/invalid TRS, 4 ambiguous, 4 not in grid, 3 missing meridian.
- Unverified: update cadence, the OGB/ExtractData GPServer, datum of the attribute Latitude/Longitude (identical to the server's WGS84 geometry).
