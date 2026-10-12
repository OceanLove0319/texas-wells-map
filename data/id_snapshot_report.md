# Snapshot report - Idaho Geological Survey (IGS) / Idaho Oil and Gas Conservation Commission well data (Idaho)

Report generated: 2026-10-12 14:31 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/id/pull_log.jsonl (id_wells.csv))  

Pull log:

- `{"name": "id_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "features": 44, "status": "OK", "finished_utc": "2026-10-12T14:09:22Z"}`
- `{"name": "raw_layer0.jsonl", "layer": "Oil and Gas Wells", "url": "https://services.arcgis.com/WLhB60Nqwp4NnHz3/arcgis/rest/services/OilAndGas2023/FeatureServer/0", "rows": 221, "server_count": 221, "status": "OK", "source_sr": {"wkid": 4326, "latestWkid": 4326}, "finished_utc": "2026-10-12T14:09:24Z"}`
- `{"name": "id_wells.csv", "from": ["Oil and Gas Wells"], "rows": 221, "status": "written", "finished_utc": "2026-10-12T14:09:24Z"}`
- `{"name": "id_wells.csv", "from": ["Oil and Gas Wells"], "rows": 221, "status": "written", "finished_utc": "2026-10-12T14:26:05Z"}`

## Row count

| what | rows |
|---|---|
| id_wells.csv (rows in file) | 221 |
| wells in the app (meta.json) | 221 |
| regulator live count (https://services.arcgis.com/WLhB60Nqwp4NnHz3/arcgis/rest/services/OilAndGas2023/FeatureServer/0, 2026-10-12T14:26:05Z) | 221 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon LongitudeWGS84 / LON_4326, lat LatitudeWGS84 / LAT_4326; datum WGS84 (per IGS; NAD27 columns also in the file).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Idaho outline bbox (+0.05 deg) | 0 |
| valid but outside the Idaho outline (Census, generalized; points on the border can fall just outside) | 0 |
| **on the map: exact** | 221 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 3 | 7 |
| 12 | 214 |

Wells with a full API (10 digits starting 11): 214; distinct: 214; APIs on more than one row: 0; without a full API (not searchable by API): 7

## Type (WellType)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil and Gas | Oil and Gas | oil | 210 | 210 | 0 |
| (blank) | (blank) | other | 7 | 7 | 0 |
| Water Well | Water Well | other | 2 | 2 | 0 |
| Geothermal | Geothermal | other | 1 | 1 | 0 |
| Stratigraphic Test | Stratigraphic Test | other | 1 | 1 | 0 |

## Status (WellStatus)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Abandoned | Abandoned | - | 123 | 123 | 0 |
| Plugged and Abandoned | Plugged and Abandoned, Plugged and abandoned | - | 43 | 43 | 0 |
| Not Drilled | Not Drilled | - | 29 | 29 | 0 |
| Producing | Producing | - | 13 | 13 | 0 |
| (blank) | (blank) | - | 8 | 8 | 0 |
| Shut-in | Shut-in | - | 3 | 3 | 0 |
| Used for Artesian Well | Used for Artesian Well | - | 1 | 1 | 0 |
| Abandoned and re-entered | Abandoned and re-entered | - | 1 | 1 | 0 |

## Fields (47) and blank counts

| field | label in app | blank |
|---|---|---|
| OBJECTID | Object ID | 0 |
| API | API | 0 |
| IGS_num | Igs Number | 0 |
| Operator | Operator | 0 |
| WellName | Wellname | 0 |
| WellStatus | Well Status | 8 |
| WellType | Well Type | 7 |
| LatitudeNAD27 | Latitudenad (NAD27) | 0 |
| LongitudeNAD27 | Longitudenad (NAD27) | 0 |
| LatitudeWGS84 | Latitudewgs84 | 0 |
| LongitudeWGS84 | Longitudewgs84 | 0 |
| CompletionStatus | Completionstatus | 194 |
| Drilled | Drilled | 0 |
| DrillingFluid | Drillingfluid | 193 |
| EndDrillDate | Enddrilldate | 38 |
| SpudDate | Spuddate | 31 |
| HydrocarbonType | Hydrocarbontype | 85 |
| GeophysicalLogs | Geophysicallogs | 18 |
| LASFiles | Lasfiles | 123 |
| PaperLogs | Paperlogs | 17 |
| DirSurvey | Dirsurvey | 187 |
| MudLog | Mudlog | 56 |
| DipLog | Diplog | 77 |
| TempLog | Templog | 185 |
| LithLogType | Lithlogtype | 159 |
| DST | Dst | 188 |
| HCA | Hca | 218 |
| BHP | Bhp | 190 |
| Cuttings | Cuttings | 18 |
| Core | Core | 216 |
| CountyAPI | Countyapi | 0 |
| County | County | 0 |
| plssTownship | Plsstownship | 0 |
| plssRange | Plssrange | 0 |
| plssSection | Plsssection | 0 |
| plssQQSection | Plssqqsection | 7 |
| FNL | Fnl | 136 |
| FEL | Fel | 159 |
| FSL | Fsl | 152 |
| FWL | Fwl | 129 |
| GroundElevation | Groundelevation | 8 |
| KellyBushing | Kellybushing | 188 |
| TotalDepth | Totaldepth | 34 |
| FieldName | Fieldname | 183 |
| IBMG_num | Ibmg Number | 145 |
| LON_4326 | Longitude (WGS84) | 0 |
| LAT_4326 | Latitude (WGS84) | 0 |

## Source notes (agent, 2026-10-12)

- Source: Idaho Geological Survey `OilAndGas2023/FeatureServer/0` (ArcGIS Online, DD-3 data), one request of 221 rows; `scripts/pull_id.py`. Rows pulled = server count = 221.
- Coordinates: the layer's LongitudeWGS84/LatitudeWGS84 (NAD27 columns kept raw; the layer is EPSG 4326). 0 wells without coordinates.
- API: 214 rows with a 10-digit API, 7 rows blank (not searchable). No duplicate APIs.
- Type WellType: Oil and Gas 210, Water Well 2, Geothermal 1, Stratigraphic Test 1, blank 7. Status WellStatus: Abandoned 123, Plugged and Abandoned 43 (two spellings merged), Not Drilled 29, Producing 13, Shut-in 3, other 3, blank 8.
- Update frequency: not published; lastEditDate 2026-08. Snapshot date shown = pull date.
- Unverified: whether recent Idaho OGCC permits (RBDMS "Data Explorer", no documented REST) are all in the IGS layer.

## Build notes (apply to every state added in this batch)

- Fragment: `scripts/states/<st>.config.mjs` (default export, same schema as a `states.config.mjs` entry). Nothing in `states.config.mjs`, `app/` or docs was changed; this report was produced with a scratch copy of the build that loaded only the new fragments.
- Legend budget: `build_data.mjs` stores type and status indexes as Uint8 (at most 255 types and 254 statuses across ALL states). The twelve fragments of this batch alone add 222 types and 131 statuses; together with TX/OK/KS and the other agents' states the real build will exceed 255 and throw "too many categories for Uint8 encoding" until types.bin / status.bin are widened (Uint16) or indexed per state.
- ArcGIS Date fields were converted from epoch milliseconds to YYYY-MM-DD (UTC) by the pull scripts; all other attributes are verbatim.
