# Snapshot report - Ohio Department of Natural Resources (ODNR), Division of Oil and Gas Resources Management well data (Ohio)

Report generated: 2026-10-12 14:59 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/oh/pull_log.jsonl (oh_wells.csv))  

Pull log:

- `{"name": "oh_wells.csv", "service": "https://gis.ohiodnr.gov/arcgis/rest/services/DOG_Services/Oilgas_Wells_public/MapServer/0", "rows": 242412, "server_count": 242412, "status": "OK", "finished_utc": "2026-10-12T14:08:38Z"}`
- `{"name": "oh_offline.csv", "service": "https://gis.ohiodnr.gov/arcgis/rest/services/DOG_Services/ogwells_offline/FeatureServer/0", "rows": 239379, "server_count": 239379, "status": "OK", "finished_utc": "2026-10-12T14:14:25Z"}`

## Row count

| what | rows |
|---|---|
| oh_wells.csv (rows in file) | 242,412 |
| wells in the app (meta.json) | 242,412 |
| regulator live count (https://gis.ohiodnr.gov/arcgis/rest/services/DOG_Services/Oilgas_Wells_public/MapServer/0, 2026-10-12T14:02:57Z) | 242,412 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326 / WH_LONG, lat lat_4326 / WH_LAT; datum WGS84 (layer geometry, Web Mercator reprojected by the server); WH_LAT/WH_LONG attribute datum not stated (TOE/HEEL columns are NAD83).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Ohio outline bbox (+0.05 deg) | 1 |
| valid but outside the Ohio outline (Census, generalized; points on the border can fall just outside) | 57 |
| **on the map: exact** | 242,412 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 14 | 242,412 |

Wells with a full API (10 digits starting 34): 242,412; distinct: 242,060; APIs on more than one row: 333; without a full API (not searchable by API): 0

## Type (MapSymbol_DESC)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil and gas | Oil and gas | oil | 35,335 | 35,335 | 0 |
| Oil | Oil | oil | 26,754 | 26,754 | 0 |
| Oil with gas show | Oil with gas show | oil | 1,312 | 1,312 | 0 |
| Oil show | Oil show | oil | 235 | 235 | 0 |
| Gas | Gas | gas | 25,416 | 25,416 | 0 |
| Gas with oil show | Gas with oil show | gas | 6,013 | 6,013 | 0 |
| Gas show | Gas show | gas | 364 | 364 | 0 |
| Gas and oil show | Gas and oil show | gas | 311 | 311 | 0 |
| Coalbed methane | Coalbed methane | gas | 32 | 32 | 0 |
| Plugged oil | Plugged oil | plugged | 24,303 | 24,303 | 0 |
| Plugged oil and gas | Plugged oil and gas | plugged | 23,291 | 23,291 | 0 |
| Plugged gas | Plugged gas | plugged | 19,095 | 19,095 | 0 |
| Plugged gas with oil show | Plugged gas with oil show | plugged | 2,449 | 2,449 | 0 |
| Plugged oil with gas show | Plugged oil with gas show | plugged | 1,353 | 1,353 | 0 |
| Plugged injection | Plugged injection | plugged | 400 | 400 | 0 |
| Plugged with gas show | Plugged with gas show | plugged | 114 | 114 | 0 |
| Plugged brine for dust control | Plugged brine for dust control | plugged | 89 | 89 | 0 |
| Plugged with oil show | Plugged with oil show | plugged | 42 | 42 | 0 |
| Plugged water supply | Plugged water supply | plugged | 29 | 29 | 0 |
| Injection | Injection | injection | 391 | 391 | 0 |
| Dry hole | Dry hole | dry | 29,098 | 29,098 | 0 |
| Dry hole with gas show | Dry hole with gas show | dry | 2,607 | 2,607 | 0 |
| Dry hole with oil show | Dry hole with oil show | dry | 1,755 | 1,755 | 0 |
| Dry hole with oil and gas show | Dry hole with oil and gas show | dry | 1,469 | 1,469 | 0 |
| Expired permit | Expired permit | other | 23,375 | 23,375 | 0 |
| Unknown status | Unknown status | other | 10,632 | 10,632 | 0 |
| Gas storage | Gas storage | other | 3,136 | 3,136 | 0 |
| (blank) | (blank) | other | 2,252 | 2,252 | 0 |
| Lost hole | Lost hole | other | 368 | 368 | 0 |
| Permitted location | Permitted location | other | 256 | 256 | 0 |
| Solution mining | Solution mining | other | 48 | 48 | 0 |
| Stratigraphy test | Stratigraphy test | other | 41 | 41 | 0 |
| Water supply | Water supply | other | 21 | 21 | 0 |
| Observation | Observation | other | 16 | 16 | 0 |
| Oil and gas converted to water | Oil and gas converted to water | other | 9 | 9 | 0 |
| Brine for dust control | Brine for dust control | other | 1 | 1 | 0 |

## Status (WL_STATUS_DESC)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Plugged and Abandoned | Plugged and Abandoned | - | 68,000 | 68,000 | 0 |
| Producing | Producing | - | 60,973 | 60,973 | 0 |
| Final Restoration | Final Restoration | - | 39,482 | 39,482 | 0 |
| Unknown status | Unknown status | - | 26,802 | 26,802 | 0 |
| Expired Permit | Expired Permit | - | 23,375 | 23,375 | 0 |
| Well Drilled | Well Drilled | - | 10,978 | 10,978 | 0 |
| Permit Expired | Permit Expired | - | 4,448 | 4,448 | 0 |
| Storage Well | Storage Well | - | 3,166 | 3,166 | 0 |
| Orphan Well - Ready | Orphan Well - Ready | - | 2,094 | 2,094 | 0 |
| Field Inspected, Well Not Found | Field Inspected, Well Not Found | - | 1,850 | 1,850 | 0 |
| Orphan Well - Pending | Orphan Well - Pending | - | 548 | 548 | 0 |
| Active Injection | Active Injection | - | 399 | 399 | 0 |
| Well Permitted | Well Permitted | - | 230 | 230 | 0 |
| Drilling | Drilling | - | 59 | 59 | 0 |
| Cancelled | Cancelled | - | 8 | 8 | 0 |

## Fields (35) and blank counts

| field | label in app | blank |
|---|---|---|
| OBJECTID | Object ID | 0 |
| API_WELLNO | API Wellno | 0 |
| MapSymbol_DESC | Mapsymbol Description | 2,252 |
| WL_STATUS_DESC | Wl Status Description | 0 |
| WL_CNTY | Wl Cnty | 1 |
| WL_TWP | Wl Twp | 109 |
| CO_NAME | Co Name | 164 |
| ADDR1 | Addr1 | 306 |
| PHONE | Phone | 1,461 |
| WH_LAT | Wh Latitude | 0 |
| WH_LONG | Wh Longitude | 0 |
| BH_LAT | Bottom Hole Latitude | 29,400 |
| BH_LONG | Bottom Hole Longitude | 29,400 |
| SLANT | Slant | 2 |
| ProposedFormation | Proposedformation | 210,268 |
| WELL_NM | Well Nm | 34,595 |
| WELL_NO | Well No. | 26,117 |
| ProducingFormation1 | Producingformation1 | 106,188 |
| ProducingFormation2 | Producingformation2 | 233,866 |
| Utica_Shale | Utica Shale | 0 |
| Marcellus_Shale | Marcellus Shale | 0 |
| STORAGE | Storage | 242,412 |
| API_WELLNO_LINK | API Wellno Link | 0 |
| STATUS_REAS | Status Reas | 94,365 |
| TOE_LONG83 | Toe Longitude (NAD83) | 240,898 |
| TOE_LAT83 | Toe Latitude (NAD83) | 240,898 |
| HEEL_LONG83 | Heel Longitude (NAD83) | 237,416 |
| HEEL_LAT83 | Heel Latitude (NAD83) | 237,416 |
| OrphanWellProgramStatus | Orphanwellprogramstatus | 232,132 |
| OWPS_Description | Owps Description | 242,398 |
| Last_Inspection_Date | Last Inspection Date | 146,367 |
| Last_Nonzero_Production_Year | Last Nonzero Production Year | 159,324 |
| Last_Production_Quarter | Last Production Quarter | 155,431 |
| lon_4326 | Longitude (WGS84) | 0 |
| lat_4326 | Latitude (WGS84) | 0 |

## Pull notes (OH)

- Source: ODNR `DOG_Services/Oilgas_Wells_public/MapServer/0` (base, 242,412 rows) and `DOG_Services/ogwells_offline/FeatureServer/0` (companion `oh_offline.csv`, 239,379 rows: TOTAL_DEPTH, PERMIT_ISSUED_DATE, COMP_DATE, PLUG_DATE, status code), pulled 2026-10-12 with keyset paging (1,000 rows per request, sequential, 0.5 s sleep). gis.ohiodnr.gov/robots.txt is `Disallow: /`; Ocean approved this one polite pull. No recurring pulls.
- Join: the companion joins on API (`API_NO` = `API_WELLNO`, 14 digits); 239,262 companion rows match a base well, 117 do not (73 blank API_NO, 1 ten-digit, 43 APIs not in the public layer).
- Coordinates: layer geometry (Web Mercator, reprojected to WGS84 by the server) first, wellhead `WH_LONG`/`WH_LAT` as fallback; bottom-hole, toe and heel columns stay in the panel.
- Type = `MapSymbol_DESC`, status = `WL_STATUS_DESC`. Overrides: "Gas with oil show", "Gas and oil show", "Gas show" and "Coalbed methane" are gas (the shared text rules would call the first two oil and the last one other).
- Documents: no URL field; `API_WELLNO_LINK` is the key for the ODNR Well Locator / RBDMS.
- Update cadence: not published. The data date shown is the pull date.
