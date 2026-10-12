# Snapshot report - Michigan EGLE, Oil, Gas, and Minerals Division well data (Michigan)

Report generated: 2026-10-12 14:31 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/mi/pull_log.jsonl (mi_wells.csv))  

Pull log:

- `{"name": "mi_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "features": 83, "status": "OK", "finished_utc": "2026-10-12T14:10:55Z"}`
- `{"name": "raw_layer10.jsonl", "layer": "Oil, Gas, and Mineral Well Surface Hole Locations", "url": "https://gisagoegle.state.mi.us/arcgis/rest/services/EGLE/GrmdOpenData/MapServer/10", "rows": 92583, "server_count": 92583, "status": "OK", "source_sr": {"wkid": 102113, "latestWkid": 3785, "xyTolerance": 0.001, "zTolerance": 0.001, "mTolerance": 0.001, "falseX": -20037700, "falseY": -30241100, "xyUnits": 10000, "falseZ": -100000, "zUnits": 10000, "falseM": -100000, "mUnits": 10000}, "finished_utc": "2026-10-12T14:12:25Z"}`
- `{"name": "mi_wells.csv", "from": ["Oil, Gas, and Mineral Well Surface Hole Locations"], "rows": 92583, "status": "written", "finished_utc": "2026-10-12T14:12:26Z"}`
- `{"name": "mi_wells.csv", "from": ["Oil, Gas, and Mineral Well Surface Hole Locations"], "rows": 92583, "status": "written", "finished_utc": "2026-10-12T14:27:11Z"}`

## Row count

| what | rows |
|---|---|
| mi_wells.csv (rows in file) | 92,583 |
| wells in the app (meta.json) | 92,583 |
| regulator live count (https://gisagoegle.state.mi.us/arcgis/rest/services/EGLE/GrmdOpenData/MapServer/10, 2026-10-12T14:27:11Z) | 92,583 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon X / LON_4326, lat Y / LAT_4326; datum WGS84 (per EGLE X/Y columns).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Michigan outline bbox (+0.05 deg) | 0 |
| valid but outside the Michigan outline (Census, generalized; points on the border can fall just outside) | 4 |
| **on the map: exact** | 92,583 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 14 | 92,583 |

Wells with a full API (10 digits starting 21): 92,583; distinct: 85,677; APIs on more than one row: 5,112; without a full API (not searchable by API): 0

## Type (WellType)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil Well | Oil Well | oil | 15,172 | 15,172 | 0 |
| Natural Gas Well | Natural Gas Well | gas | 13,358 | 13,358 | 0 |
| Gas Condensate Well | Gas Condensate Well | gas | 153 | 153 | 0 |
| Gas Production and Brine Disposal Well | Gas Production and Brine Disposal Well | gas | 13 | 13 | 0 |
| Brine Disposal Well | Brine Disposal Well | injection | 1,237 | 1,237 | 0 |
| Water Injection Well | Water Injection Well | injection | 729 | 729 | 0 |
| Part 625 Disposal Well | Part 625 Disposal Well | injection | 156 | 156 | 0 |
| Other Injection Well | Other Injection Well | injection | 26 | 26 | 0 |
| Gas Injection Well | Gas Injection Well | injection | 25 | 25 | 0 |
| CO2 Injection Well | CO2 Injection Well | injection | 21 | 21 | 0 |
| Dry Hole | Dry Hole | dry | 22,598 | 22,598 | 0 |
| Part 625 Test Well | Part 625 Test Well | other | 25,267 | 25,267 | 0 |
| Location | Location | other | 8,233 | 8,233 | 0 |
| Gas Storage Well | Gas Storage Well | other | 3,042 | 3,042 | 0 |
| Gas Storage Observation Well | Gas Storage Observation Well | other | 864 | 864 | 0 |
| Part 625 Natural Brine Well | Part 625 Natural Brine Well | other | 853 | 853 | 0 |
| Part 625 Solution Mining Well | Part 625 Solution Mining Well | other | 585 | 585 | 0 |
| Lost Hole | Lost Hole | other | 99 | 99 | 0 |
| Observation Well | Observation Well | other | 78 | 78 | 0 |
| Liquified Petroleum Gas Storage Well | Liquified Petroleum Gas Storage Well | other | 59 | 59 | 0 |
| Part 625 Storage Well | Part 625 Storage Well | other | 11 | 11 | 0 |
| Other Well | Other Well | other | 3 | 3 | 0 |
| Not Available | Not Available | other | 1 | 1 | 0 |

## Status (WellStatus)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Plugging Approved | Plugging Approved | - | 65,113 | 65,113 | 0 |
| Producing | Producing | - | 12,510 | 12,510 | 0 |
| Terminated Permit | Terminated Permit | - | 8,155 | 8,155 | 0 |
| Active | Active | - | 3,177 | 3,177 | 0 |
| Plugging Completed | Plugging Completed | - | 1,338 | 1,338 | 0 |
| Plugging Approved - Part 616 | Plugging Approved - Part 616 | - | 670 | 670 | 0 |
| Shut_In | Shut_In | - | 547 | 547 | 0 |
| Temporarily Abandoned | Temporarily Abandoned | - | 420 | 420 | 0 |
| Plugging Completed- Part 616 | Plugging Completed- Part 616 | - | 200 | 200 | 0 |
| Orphan | Orphan | - | 173 | 173 | 0 |
| Permitted Well | Permitted Well | - | 88 | 88 | 0 |
| Injection Suspended | Injection Suspended | - | 56 | 56 | 0 |
| Plugged Back | Plugged Back | - | 56 | 56 | 0 |
| Well Completed | Well Completed | - | 40 | 40 | 0 |
| (blank) | (blank) | - | 26 | 26 | 0 |
| Drilling Completed | Drilling Completed | - | 11 | 11 | 0 |
| Not Available | Not Available | - | 1 | 1 | 0 |
| Sump | Sump | - | 1 | 1 | 0 |
| Water Supply | Water Supply | - | 1 | 1 | 0 |

## Fields (50) and blank counts

| field | label in app | blank |
|---|---|---|
| OBJECTID | Object ID | 0 |
| PKey | Pkey | 0 |
| Constructkey | Constructkey | 0 |
| WellID | Wellid | 0 |
| api_num | API Number | 0 |
| PermitNumber | Permitnumber | 0 |
| CountyName | Countyname | 235 |
| County_fips | County Fips | 235 |
| Sidetrack | Sidetrack | 0 |
| Completion | Completion | 0 |
| WellName | Wellname | 197 |
| WellNumber | Wellnumber | 181 |
| WellNameFull | Wellnamefull | 0 |
| CompanyNo | Companyno | 0 |
| CompanyName | Companyname | 0 |
| StateLand | Stateland | 553 |
| FederalLand | Federalland | 553 |
| TownshipName | Townshipname | 1,460 |
| TRS | Trs | 1,753 |
| QQQS | Qqqs | 13,793 |
| QQS | Qqs | 11,025 |
| QS | Qs | 10,581 |
| well_type | Well Type | 0 |
| WellType | Well Type | 0 |
| TopWellType | Topwelltype | 0 |
| WellStatus | Well Status | 26 |
| TopWellStatus | Topwellstatus | 27 |
| Slant | Slant | 44 |
| WellboreType | Wellboretype | 6,310 |
| DTD | Dtd | 16,539 |
| TVD | Tvd | 85,983 |
| KOTVD | Kotvd | 92,477 |
| ReferenceTops | Referencetops | 32,794 |
| ReferenceElevation | Referenceelevation | 36,063 |
| FieldName | Fieldname | 57,928 |
| FieldType | Fieldtype | 57,929 |
| PRUNumber | Prunumber | 61,453 |
| PRUName | Pruname | 61,453 |
| ProdFormationCode | Prodformationcode | 57,998 |
| ProducingFormation | Producingformation | 57,998 |
| PermitDate | Permitdate | 23,552 |
| PluggingDate | Pluggingdate | 75,769 |
| Concentration_H2S | Concentration H2s | 87,313 |
| LogsAvailable | Logsavailable | 0 |
| Y | Y | 0 |
| X | X | 0 |
| mgr_x | Mgr X | 0 |
| mgr_y | Mgr Y | 0 |
| LON_4326 | Longitude (WGS84) | 0 |
| LAT_4326 | Latitude (WGS84) | 0 |

## Source notes (agent, 2026-10-12)

- Source: EGLE `GrmdOpenData/MapServer/10` "Oil, Gas, and Mineral Well Surface Hole Locations", 47 pages of 2,000 with keyset paging; `scripts/pull_mi.py`. Rows pulled = server count = 92,583. Bottom-hole (9) and lateral (11) layers were not pulled.
- Coordinates: the layer's X/Y columns (WGS84), identical to the reprojected geometry (LON_4326/LAT_4326). 0 rows without coordinates. TRS ("27N-8E-15", blank on 1,753 rows) and QS/QQS/QQQS kept raw; no BLM grid pulled (not needed).
- API: all rows have a 14-digit api_num; 85,677 distinct 10-digit APIs, 5,112 on more than one row (sidetracks / recompletions). API county codes equal Census FIPS (County_fips column agrees).
- Type = WellType (23 EGLE descriptions: Part 625 Test Well 25,267; Dry Hole 22,598; Oil Well 15,172; Natural Gas Well 13,358; Location 8,233; Gas Storage Well 3,042; ...). "Part 625" wells are mineral (brine, solution mining, test) wells regulated under Michigan Part 625, not oil and gas - they are in the regulator's well layer and kept. Status = WellStatus (19).
- Update frequency: not published (EGLE also offers nightly shapefiles on its GeoWebFace FTP, not fetched). Snapshot date shown = pull date.
- Dates (PermitDate, PluggingDate) converted from epoch ms to YYYY-MM-DD (UTC).

## Build notes (apply to every state added in this batch)

- Fragment: `scripts/states/<st>.config.mjs` (default export, same schema as a `states.config.mjs` entry). Nothing in `states.config.mjs`, `app/` or docs was changed; this report was produced with a scratch copy of the build that loaded only the new fragments.
- Legend budget: `build_data.mjs` stores type and status indexes as Uint8 (at most 255 types and 254 statuses across ALL states). The twelve fragments of this batch alone add 222 types and 131 statuses; together with TX/OK/KS and the other agents' states the real build will exceed 255 and throw "too many categories for Uint8 encoding" until types.bin / status.bin are widened (Uint16) or indexed per state.
- ArcGIS Date fields were converted from epoch milliseconds to YYYY-MM-DD (UTC) by the pull scripts; all other attributes are verbatim.
