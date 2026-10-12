# Snapshot report - Arizona Oil and Gas Conservation Commission (AZOGCC) well data (Arizona)

Report generated: 2026-10-12 14:31 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/az/pull_log.jsonl (az_wells.csv))  

Pull log:

- `{"name": "az_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "features": 15, "status": "OK", "finished_utc": "2026-10-12T14:09:25Z"}`
- `{"name": "raw_layer0.jsonl", "layer": "OIL AND GAS WELLS AGOL", "url": "https://utility.arcgis.com/usrsvcs/servers/6c01eae404a44e95a9aad050effe93cd/rest/services/OIL_AND_GAS_WELLS_AGOL/FeatureServer/0", "rows": 1288, "server_count": 1288, "status": "OK", "source_sr": {"wkid": 26912, "latestWkid": 26912}, "finished_utc": "2026-10-12T14:09:30Z"}`
- `{"name": "az_wells.csv", "from": ["OIL AND GAS WELLS AGOL"], "rows": 1288, "status": "written", "finished_utc": "2026-10-12T14:09:30Z"}`
- `{"name": "az_wells.csv", "from": ["OIL AND GAS WELLS AGOL"], "rows": 1288, "status": "written", "finished_utc": "2026-10-12T14:26:07Z"}`

## Row count

| what | rows |
|---|---|
| az_wells.csv (rows in file) | 1,288 |
| wells in the app (meta.json) | 1,288 |
| regulator live count (https://utility.arcgis.com/usrsvcs/servers/6c01eae404a44e95a9aad050effe93cd/rest/services/OIL_AND_GAS_WELLS_AGOL/FeatureServer/0, 2026-10-12T14:26:07Z) | 1,288 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon LON_4326 / LONGITUDE, lat LAT_4326 / LATITUDE; datum WGS84 (reprojected by the service from UTM 12N NAD83, EPSG 26912).

| what | wells |
|---|---|
| null or 0 | 12 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Arizona outline bbox (+0.05 deg) | 0 |
| valid but outside the Arizona outline (Census, generalized; points on the border can fall just outside) | 0 |
| **on the map: exact** | 1,276 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 12 |

Why wells without usable coordinates could not be placed:

- state has no PLSS: 12

## API

| raw API length | wells |
|---|---|
| 0 | 22 |
| 10 | 1 |
| 12 | 1,240 |
| 17 | 25 |

Wells with a full API (10 digits starting 02): 1,264; distinct: 1,246; APIs on more than one row: 16; without a full API (not searchable by API): 24

## Type (WELL_TYPE)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil and Gas Exploration | Oil and Gas Exploration | oil | 1,070 | 1,070 | 0 |
| Oil and Gas Helium - Wildcat | Oil and Gas Helium - Wildcat | oil | 2 | 2 | 0 |
| Oil and Gas Helium | Oil and Gas Helium | oil | 7 | 1 | 0 |
| Oil | Oil | oil | 1 | 1 | 0 |
| Gas | Gas | gas | 18 | 18 | 0 |
| Helium | Helium | other | 73 | 67 | 0 |
| Geothermal | Geothermal | other | 66 | 66 | 0 |
| (blank) | (blank) | other | 20 | 20 | 0 |
| Gas Storage | Gas Storage | other | 16 | 16 | 0 |
| Carbon Dioxide (CO2) | Carbon Dioxide (CO2) | other | 14 | 14 | 0 |
| Unknown | Unknown | other | 1 | 1 | 0 |

## Status (STATUS_WELL)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Unknown | Unknown | - | 856 | 855 | 0 |
| Abandoned | Abandoned | - | 190 | 190 | 0 |
| Plugged | Plugged | - | 95 | 95 | 0 |
| Shut In | Shut In | - | 34 | 34 | 0 |
| Active | Active | - | 20 | 20 | 0 |
| Permit Expired | Permit Expired | - | 23 | 19 | 0 |
| Permit Extension | Permit Extension | - | 19 | 14 | 0 |
| Producing | Producing | - | 14 | 14 | 0 |
| Planned | Planned | - | 12 | 12 | 0 |
| Permitted | Permitted | - | 9 | 8 | 0 |
| P&A | P&A | - | 7 | 7 | 0 |
| Converted Water Well | Converted Water Well | - | 6 | 6 | 0 |
| Drilling | Drilling | - | 1 | 1 | 0 |
| Drilled | Drilled | - | 1 | 1 | 0 |
| Not Issued | Not Issued | - | 1 | 0 | 0 |

## Fields (56) and blank counts

| field | label in app | blank |
|---|---|---|
| OBJECTID | Object ID | 0 |
| PERMIT | Permit | 0 |
| PERMIT_ID | Permit ID | 0 |
| API | API | 22 |
| WELL_NAME | Well Name | 0 |
| LEASE_NAME | Lease Name | 57 |
| OTHER_NAME | Other Name | 1,248 |
| WELL_TYPE | Well Type | 20 |
| STATUS_WELL | Status Well | 0 |
| STATUS_ABANDONED | Status Abandoned | 1,098 |
| STATUS_DATE | Status Date | 23 |
| COMMODITY | Commodity | 0 |
| OPERATOR | Operator | 63 |
| MINERAL_OWNER | Mineral Owner | 330 |
| BOREHOLE_NAME | Borehole Name | 1,246 |
| DRILLER | Driller | 718 |
| SPUD_DATE | Spud Date | 464 |
| DRILL_END_DATE | Drill End Date | 213 |
| WELL_FIELD | Well Field | 324 |
| WELL_FUNCTION | Well Function | 1 |
| PRODUCTION_TYPE | Production Type | 1 |
| COUNTY | County | 2 |
| STATE | State | 2 |
| TRS | Trs | 7 |
| VERIFICATION | Verification | 133 |
| DEPTH_DRILL | Depth Drill | 20 |
| DEPTH_REF_POINT | Depth Ref Point | 410 |
| DEPTH_UNIT | Depth Unit | 48 |
| ELEV_KB | Elev Kb | 780 |
| ELEV_DF | Elev DF | 975 |
| ELEV_GL | Elev Gl | 56 |
| FORMATION | Formation | 85 |
| BIT_DIAM_UNIT | Bit Diam Unit | 458 |
| SOURCE | Source | 130 |
| NOTES | Notes | 1,113 |
| DRILL_METHOD | Drill Method | 1,178 |
| WEBSITE | Website | 34 |
| LOCATION | Location | 433 |
| EDITOR | Editor | 1,089 |
| EDIT_DATE | Edit Date | 1,089 |
| WEBSITE_AVAIL | Website Avail | 12 |
| GLOBALID | Globalid | 0 |
| CREATED_USER | Created User | 1,279 |
| CREATED_DATE | Created Date | 1,279 |
| LAST_EDITED_USER | Last Edited User | 0 |
| LAST_EDITED_DATE | Last Edited Date | 0 |
| LATITUDE | Latitude | 12 |
| LONGITUDE | Longitude | 12 |
| BIT_DIAM_TD | Bit Diam Td | 466 |
| BIT_DIAM_COL | Bit Diam Col | 1,233 |
| BH_LATITUDE | Bottom Hole Latitude | 1,284 |
| BH_LONGITUDE | Bottom Hole Longitude | 1,284 |
| ORPHANED_WELL | Orphaned Well | 1,094 |
| PRIOR_OPERATOR | Prior Operator | 1,161 |
| LON_4326 | Longitude (WGS84) | 12 |
| LAT_4326 | Latitude (WGS84) | 12 |

## Source notes (agent, 2026-10-12)

- Source: AZOGCC `OIL_AND_GAS_WELLS_AGOL/FeatureServer/0` through the `utility.arcgis.com/usrsvcs/servers/6c01eae404a44e95a9aad050effe93cd` proxy used by the official viewer (the proxy id can rotate), one request of 1,288 rows; `scripts/pull_az.py`. Rows pulled = server count = 1,288.
- Coordinates: LON_4326/LAT_4326 (server reprojection from UTM 12N NAD83, EPSG 26912), identical to the LATITUDE/LONGITUDE attributes within 2e-5 deg. 12 wells (permits 1297-1301 etc., mostly expired or not-issued helium permits) have no coordinates; they do have a TRS string but 12 wells is below the threshold for pulling the BLM grid, so they stay unmapped.
- API: 1,240 rows 10 digits, 25 rows 14 digits (sidetrack suffix), 23 blank/"Not Issued"; 16 APIs on more than one row.
- WEBSITE = https://azogcc.az.gov/<permit> document page (1,288 rows; WEBSITE_AVAIL says Yes/No).
- Update frequency: not published; dataLastEditDate 2026-10 (the service edits as permits change). Snapshot date shown = pull date.
- Dates (STATUS_DATE, SPUD_DATE, DRILL_END_DATE, EDIT_DATE, CREATED_DATE, LAST_EDITED_DATE) were converted from epoch milliseconds to YYYY-MM-DD (UTC).

## Build notes (apply to every state added in this batch)

- Fragment: `scripts/states/<st>.config.mjs` (default export, same schema as a `states.config.mjs` entry). Nothing in `states.config.mjs`, `app/` or docs was changed; this report was produced with a scratch copy of the build that loaded only the new fragments.
- Legend budget: `build_data.mjs` stores type and status indexes as Uint8 (at most 255 types and 254 statuses across ALL states). The twelve fragments of this batch alone add 222 types and 131 statuses; together with TX/OK/KS and the other agents' states the real build will exceed 255 and throw "too many categories for Uint8 encoding" until types.bin / status.bin are widened (Uint16) or indexed per state.
- ArcGIS Date fields were converted from epoch milliseconds to YYYY-MM-DD (UTC) by the pull scripts; all other attributes are verbatim.
