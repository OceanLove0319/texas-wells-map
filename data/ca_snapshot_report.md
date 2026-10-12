# Snapshot report - California Geologic Energy Management Division (CalGEM) well data (California)

Report generated: 2026-10-12 14:31 UTC  
Data date shown in the app: **2026-07-02** (from data/raw/ca/pull_log.jsonl (ca_wells.csv, hub_data_date))  

Pull log:

- `{"name": "ca_wells_hub.csv", "url": "https://gis-cnra.hub.arcgis.com/api/download/v1/items/ef53080fdf894761858dd1728610b9a0/csv?layers=0", "bytes": 62516372, "last_modified": "Thu, 02 Jul 2026 22:14:46 GMT", "content_type": "text/csv", "status": "downloaded", "finished_utc": "2026-10-12T14:03:08Z"}`
- `{"name": "ca_wells.csv", "from": "ca_wells_hub.csv", "rows": 242471, "hub_data_date": "2026-07-02", "status": "written", "finished_utc": "2026-10-12T14:10:40Z"}`
- `{"name": "source_count.json", "service": "https://gis.conservation.ca.gov/server/rest/services/WellSTAR/Wells/MapServer/0", "server_count": 242559, "status": "OK", "finished_utc": "2026-10-12T14:10:41Z"}`
- `{"name": "ca_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "features": 58, "status": "OK", "finished_utc": "2026-10-12T14:10:42Z"}`

## Row count

| what | rows |
|---|---|
| ca_wells.csv (rows in file) | 242,471 |
| wells in the app (meta.json) | 242,471 |
| regulator live count (https://gis.conservation.ca.gov/server/rest/services/WellSTAR/Wells/MapServer/0, 2026-10-12T14:10:41Z) | 242,559 |

Difference live count - file: **88** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon LON_4326, lat LAT_4326; datum WGS84 / NAD83 (per WellSTAR; not stated in the file).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the California outline bbox (+0.05 deg) | 0 |
| valid but outside the California outline (Census, generalized; points on the border can fall just outside) | 18 |
| **on the map: exact** | 242,471 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 10 | 242,471 |

Wells with a full API (10 digits starting 04): 242,471; distinct: 242,471; APIs on more than one row: 0; without a full API (not searchable by API): 0

## Type (WellTypeLabel)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil & Gas | Oil & Gas | oil | 165,479 | 165,479 | 0 |
| Cyclic Steam | Cyclic Steam | oil | 14,116 | 14,116 | 0 |
| Dry Gas | Dry Gas | gas | 5,113 | 5,113 | 0 |
| Gas | Gas | gas | 1,417 | 1,417 | 0 |
| Steamflood | Steamflood | injection | 13,047 | 13,047 | 0 |
| Waterflood | Waterflood | injection | 11,395 | 11,395 | 0 |
| Water Disposal | Water Disposal | injection | 2,443 | 2,443 | 0 |
| Injection | Injection | injection | 1,576 | 1,576 | 0 |
| Pressure Maintenance | Pressure Maintenance | injection | 141 | 141 | 0 |
| Gas Disposal | Gas Disposal | injection | 117 | 117 | 0 |
| Air Injection | Air Injection | injection | 93 | 93 | 0 |
| EPA Well: Class I | EPA Well: Class I | injection | 10 | 10 | 0 |
| EPA Well: Class V | EPA Well: Class V | injection | 3 | 3 | 0 |
| EPA Well: Class VI | EPA Well: Class VI | injection | 2 | 2 | 0 |
| Dry Hole | Dry Hole | dry | 16,781 | 16,781 | 0 |
| Observation | Observation | other | 5,042 | 5,042 | 0 |
| Multi-Purpose | Multi-Purpose | other | 2,561 | 2,561 | 0 |
| Core Hole | Core Hole | other | 1,566 | 1,566 | 0 |
| Unknown | Unknown | other | 824 | 824 | 0 |
| Gas Storage | Gas Storage | other | 479 | 479 | 0 |
| Water Source | Water Source | other | 256 | 256 | 0 |
| Liquefied Gas | Liquefied Gas | other | 6 | 6 | 0 |
| Stratigraphic | Stratigraphic | other | 2 | 2 | 0 |
| Water Supply | Water Supply | other | 2 | 2 | 0 |

## Status (WellStatus)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Plugged | Plugged | - | 145,965 | 145,965 | 0 |
| Active | Active | - | 54,450 | 54,450 | 0 |
| Idle | Idle | - | 30,338 | 30,338 | 0 |
| Canceled | Canceled | - | 9,938 | 9,938 | 0 |
| New | New | - | 1,631 | 1,631 | 0 |
| PluggedOnly | PluggedOnly | - | 68 | 68 | 0 |
| Unknown | Unknown | - | 59 | 59 | 0 |
| NotCalGEMJurisdiction | NotCalGEMJurisdiction | - | 22 | 22 | 0 |

## Fields (31) and blank counts

| field | label in app | blank |
|---|---|---|
| X | X | 0 |
| Y | Y | 0 |
| Place | Place | 17 |
| OBJECTID | Object ID | 0 |
| API | API | 0 |
| LeaseName | Leasename | 0 |
| WellNumber | Wellnumber | 345 |
| WellDesignation | Welldesignation | 133 |
| WellStatus | Well Status | 0 |
| WellType | Well Type | 0 |
| WellTypeLabel | Welltypelabel | 0 |
| OperatorCode | Operatorcode | 0 |
| OperatorName | Operatorname | 0 |
| FieldName | Fieldname | 1 |
| AreaName | Areaname | 1,454 |
| District | District | 0 |
| CountyName | Countyname | 0 |
| Section | Section | 0 |
| Township | Township | 0 |
| Range | Range | 0 |
| BaseMeridian | Basemeridian | 0 |
| Latitude | Latitude | 0 |
| Longitude | Longitude | 0 |
| GISSource | Gissource | 0 |
| isConfidential | Isconfidential | 0 |
| isDirectionallyDrilled | Isdirectionallydrilled | 0 |
| SpudDate | Spuddate | 153,615 |
| inHPZ | Inhpz | 0 |
| WellSymbol | Wellsymbol | 0 |
| LON_4326 | Longitude (WGS84) | 0 |
| LAT_4326 | Latitude (WGS84) | 0 |

## Source notes (agent, 2026-10-12)

- Source: ONE statewide CSV from the CNRA Open Data hub (`gis-cnra.hub.arcgis.com/api/download/v1/items/ef53080fdf894761858dd1728610b9a0/csv?layers=0`, 62.5 MB, Last-Modified 2026-07-02) instead of about 49 REST pages; `scripts/pull_ca.py`. The hub file is a cached export: data date shown = 2026-07-02 (pull log `hub_data_date`). The live WellSTAR/Wells MapServer/0 count was 242,559 on 2026-10-12; the CSV has 242,471 rows (88 fewer, three months of new permits).
- The hub CSV is kept in `data/raw/ca/hub/` so the build does not read it as a second per-well layer (it has an API column). An exploratory probe fetched the same file once before the saved download (two downloads in total, no further ones).
- Coordinates: Longitude/Latitude attribute columns (CalGEM does not state the datum; WellSTAR publishes WGS84/NAD83; the hub X/Y are Web Mercator). 0 wells without coordinates. Section/Township/Range/BaseMeridian (MD 177,877; SB 64,382; H 211; GSR 1) kept raw; no BLM grid pulled (not needed).
- API: all 242,471 rows have a distinct 10-digit API. CalGEM API county codes equal Census FIPS except Kern, which uses both 029 (87,991 wells) and 030 (68,858 wells), and offshore/island codes (211, 237, 259, 283, 128, 130, 220, 222, 228, 230, 273, 295): 71,982 wells get no county name in the panel (the CountyName column is still shown).
- Type WellTypeLabel (24 CalGEM labels; WellType is the code); status WellStatus (Plugged 145,965; Active 54,450; Idle 30,338; Canceled 9,938; New 1,631; PluggedOnly 68; Unknown 59; NotCalGEMJurisdiction 22). Category overrides: Cyclic Steam -> oil; Steamflood, Waterflood, Pressure Maintenance, EPA Class I/V/VI -> injection; Dry Gas -> gas; Liquefied Gas, Multi-Purpose -> other.
- Update frequency: the live service tracks WellSTAR "as needed"; the hub export is refreshed by CalGEM at its own cadence (July 2026 at pull time). No depth, no document link column (WellSTAR per-well URL pattern unverified).

## Build notes (apply to every state added in this batch)

- Fragment: `scripts/states/<st>.config.mjs` (default export, same schema as a `states.config.mjs` entry). Nothing in `states.config.mjs`, `app/` or docs was changed; this report was produced with a scratch copy of the build that loaded only the new fragments.
- Legend budget: `build_data.mjs` stores type and status indexes as Uint8 (at most 255 types and 254 statuses across ALL states). The twelve fragments of this batch alone add 222 types and 131 statuses; together with TX/OK/KS and the other agents' states the real build will exceed 255 and throw "too many categories for Uint8 encoding" until types.bin / status.bin are widened (Uint16) or indexed per state.
- ArcGIS Date fields were converted from epoch milliseconds to YYYY-MM-DD (UTC) by the pull scripts; all other attributes are verbatim.
