# Snapshot report - Illinois State Geological Survey (ISGS) well data (Illinois)

Report generated: 2026-10-12 14:31 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/il/pull_log.jsonl (il_wells.csv))  

Pull log:

- `{"name": "il_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "features": 102, "status": "OK", "finished_utc": "2026-10-12T14:12:27Z"}`
- `{"name": "raw_layer8.jsonl", "layer": "Wells", "url": "https://maps.isgs.illinois.edu/arcgis/rest/services/ILOIL/Wells2/MapServer/8", "rows": 207297, "server_count": 207297, "status": "OK", "source_sr": {"wkid": 102100, "latestWkid": 3857, "xyTolerance": 0.001, "zTolerance": 0.001, "mTolerance": 0.001, "falseX": -22041258.62706707, "falseY": -33265068.604224768, "xyUnits": 135385249.94349548, "falseZ": -100000, "zUnits": 10000, "falseM": -100000, "mUnits": 10000}, "finished_utc": "2026-10-12T14:15:11Z"}`
- `{"name": "il_wells.csv", "from": ["Wells"], "rows": 207297, "status": "written", "finished_utc": "2026-10-12T14:15:13Z"}`
- `{"name": "il_wells.csv", "from": ["Wells"], "rows": 207297, "status": "written", "finished_utc": "2026-10-12T14:27:15Z"}`

## Row count

| what | rows |
|---|---|
| il_wells.csv (rows in file) | 207,297 |
| wells in the app (meta.json) | 207,297 |
| regulator live count (https://maps.isgs.illinois.edu/arcgis/rest/services/ILOIL/Wells2/MapServer/8, 2026-10-12T14:27:15Z) | 207,297 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon LONGITUDE / LON_4326, lat LATITUDE / LAT_4326; datum not stated by ISGS (decimal degrees; geometry served in Web Mercator).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Illinois outline bbox (+0.05 deg) | 37 |
| valid but outside the Illinois outline (Census, generalized; points on the border can fall just outside) | 143 |
| **on the map: exact** | 207,297 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 12 | 207,297 |

Wells with a full API (10 digits starting 12): 207,297; distinct: 174,251; APIs on more than one row: 26,537; without a full API (not searchable by API): 0

## Type (TYPE_CLASS)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil Producer | Oil Producer | oil | 90,086 | 90,086 | 0 |
| Combination Oil and Gas Producer | Combination Oil and Gas Producer | oil | 226 | 226 | 0 |
| Oil Well and Salt Water Disposal | Oil Well and Salt Water Disposal | oil | 61 | 61 | 0 |
| Combination Oil Producer and Water Injection | Combination Oil Producer and Water Injection | oil | 53 | 53 | 0 |
| Comb. Oil Producer and Water Injection | Comb. Oil Producer and Water Injection | oil | 29 | 29 | 0 |
| Oil Well | Oil Well | oil | 25 | 25 | 0 |
| Gas Producer | Gas Producer | gas | 1,643 | 1,643 | 0 |
| Coal Bed Methane | Coal Bed Methane | gas | 247 | 247 | 0 |
| Coal Mine Methane | Coal Mine Methane | gas | 213 | 213 | 0 |
| Gas Well | Gas Well | gas | 2 | 2 | 0 |
| Junked and Abandoned | Junked and Abandoned | plugged | 729 | 729 | 0 |
| Plugged Hole | Plugged Hole | plugged | 253 | 253 | 0 |
| Corrosion Protection Plugged | Corrosion Protection Plugged | plugged | 2 | 2 | 0 |
| Water Injection Well | Water Injection Well | injection | 16,017 | 16,017 | 0 |
| Undesignated Injection Well | Undesignated Injection Well | injection | 3,453 | 3,453 | 0 |
| Salt Water Disposal | Salt Water Disposal | injection | 3,438 | 3,438 | 0 |
| Gas Injection Well | Gas Injection Well | injection | 850 | 850 | 0 |
| Salt Water Disposal and Water Injection | Salt Water Disposal and Water Injection | injection | 59 | 59 | 0 |
| Chemical Injection Well | Chemical Injection Well | injection | 28 | 28 | 0 |
| Air Injection Well | Air Injection Well | injection | 27 | 27 | 0 |
| Water Injection and Water Supply | Water Injection and Water Supply | injection | 20 | 20 | 0 |
| Waste Disposal Well | Waste Disposal Well | injection | 17 | 17 | 0 |
| Coal Slurry Injection Well | Coal Slurry Injection Well | injection | 5 | 5 | 0 |
| Detergent Injection Well | Detergent Injection Well | injection | 3 | 3 | 0 |
| Steam Injection Well | Steam Injection Well | injection | 2 | 2 | 0 |
| Thermal Injection Well | Thermal Injection Well | injection | 1 | 1 | 0 |
| Dry and Abandoned | Dry and Abandoned | dry | 53,311 | 53,311 | 0 |
| Dry & Abandoned | Dry & Abandoned | dry | 100 | 100 | 0 |
| Dry & Aband | Dry & Aband | dry | 9 | 9 | 0 |
| Dry Hole (water well) | Dry Hole (water well) | dry | 1 | 1 | 0 |
| (blank) | (blank) | other | 8,458 | 8,458 | 0 |
| Structure Test | Structure Test | other | 7,084 | 7,084 | 0 |
| Temporarily Abandoned | Temporarily Abandoned | other | 6,572 | 6,572 | 0 |
| Stratigraphic Test | Stratigraphic Test | other | 4,713 | 4,713 | 0 |
| Unknown | Unknown | other | 2,998 | 2,998 | 0 |
| Permit to Drill Issued | Permit to Drill Issued | other | 2,600 | 2,600 | 0 |
| Observation Well | Observation Well | other | 1,424 | 1,424 | 0 |
| Gas Storage Well | Gas Storage Well | other | 1,029 | 1,029 | 0 |
| Water Supply Well | Water Supply Well | other | 955 | 955 | 0 |
| Confidential Hole | Confidential Hole | other | 341 | 341 | 0 |
| Dead Permit | Dead Permit | other | 141 | 141 | 0 |
| Methane Vent | Methane Vent | other | 29 | 29 | 0 |
| Abandoned Location | Abandoned Location | other | 25 | 25 | 0 |
| Corrosion Protection | Corrosion Protection | other | 14 | 14 | 0 |
| Engineering Test | Engineering Test | other | 3 | 3 | 0 |
| Salt Producer | Salt Producer | other | 1 | 1 | 0 |

## Status (PLUGGED)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Plugged | Plugged | - | 104,229 | 104,229 | 0 |
| Not recorded as plugged | Not recorded as plugged | - | 103,068 | 103,068 | 0 |

## Fields (30) and blank counts

| field | label in app | blank |
|---|---|---|
| OBJECTID | Object ID | 0 |
| DataSummary | Datasummary | 0 |
| API_NUMBER | API Number | 0 |
| COMP_DATE | Comp Date | 18,878 |
| PERMIT_NUMBER | Permit Number | 96,215 |
| PERMIT_DATE | Permit Date | 97,086 |
| STATUS | Status | 8,458 |
| STATUS_TEXT | Status Text | 8,458 |
| COMPANY_NAME | Company Name | 4,659 |
| FARM_NAME | Farm Name | 2,911 |
| FARM_NUM | Farm Number | 4,570 |
| TOTAL_DEPTH | Total Depth | 3,465 |
| TDFORMATION | Tdformation | 104,235 |
| TDFMTEXT | Tdfmtext | 104,235 |
| ILSTRAT | Ilstrat | 107,177 |
| ELEVATION | Elevation | 1,487 |
| EREF_DEF | Eref Def | 3,479 |
| LONGITUDE | Longitude | 0 |
| LATITUDE | Latitude | 0 |
| LOCATION | Location | 3 |
| LOGS | Logs | 58,261 |
| FLAG_LAS | Flag Las | 0 |
| FLAG_CORE_ANALYSIS | Flag Core Analysis | 0 |
| FLAG_CORE | Flag Core | 0 |
| FLAG_SAMPLES | Flag Samples | 0 |
| FLAG_LOG | Flag Log | 0 |
| LON_4326 | Longitude (WGS84) | 0 |
| LAT_4326 | Latitude (WGS84) | 0 |
| TYPE_CLASS | Type Class | 8,458 |
| PLUGGED | Plugged | 0 |

## Source notes (agent, 2026-10-12)

- Source: ISGS `ILOIL/Wells2/MapServer/8` "Wells", 104 pages of 2,000 with keyset paging; `scripts/pull_il.py`. Rows pulled = server count = 207,297.
- Coordinates: LONGITUDE/LATITUDE attributes (datum not stated by ISGS) first, then LON_4326/LAT_4326 (server reprojection from Web Mercator). 0 rows without coordinates. LOCATION ("12-1N-5W" = section-township-range) kept raw; no BLM grid pulled (not needed).
- API: all rows have a 12-digit API_NUMBER; 174,251 distinct 10-digit APIs, 26,537 on more than one row. API county codes equal Census FIPS.
- ISGS STATUS mixes type and status in 99 codes (OILP = oil producer, plugged). The pull derives TYPE_CLASS (first clause of STATUS_TEXT, 46 values; blank on 8,458 rows where STATUS_TEXT is blank) and PLUGGED (Plugged 104,229 / Not recorded as plugged 103,068) for the legend; raw STATUS and STATUS_TEXT are kept and shown. Consequence: a plugged oil producer is colored oil and separated with the status toggle (Kansas instead has OIL-P&A as its own type).
- DataSummary (ISGS well summary page, logs and cores) and ILSTRAT are links on every row.
- Update frequency: not published. Snapshot date shown = pull date.
- Dates (COMP_DATE, PERMIT_DATE) converted from epoch ms to YYYY-MM-DD (UTC).

## Build notes (apply to every state added in this batch)

- Fragment: `scripts/states/<st>.config.mjs` (default export, same schema as a `states.config.mjs` entry). Nothing in `states.config.mjs`, `app/` or docs was changed; this report was produced with a scratch copy of the build that loaded only the new fragments.
- Legend budget: `build_data.mjs` stores type and status indexes as Uint8 (at most 255 types and 254 statuses across ALL states). The twelve fragments of this batch alone add 222 types and 131 statuses; together with TX/OK/KS and the other agents' states the real build will exceed 255 and throw "too many categories for Uint8 encoding" until types.bin / status.bin are widened (Uint16) or indexed per state.
- ArcGIS Date fields were converted from epoch milliseconds to YYYY-MM-DD (UTC) by the pull scripts; all other attributes are verbatim.
