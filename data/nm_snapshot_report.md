# Snapshot report - New Mexico Oil Conservation Division (EMNRD OCD) well data (New Mexico)

Report generated: 2026-10-12 14:24 UTC  
Data date shown in the app: **2026-10-12** (from ../../../../../../../../Users/ocean/.claude/projects/tx-wells-map/data/raw/nm/pull_log.jsonl (nm_wells.csv))  

Pull log:

- `{"name": "nm_wells.csv", "service": "https://gis.emnrd.nm.gov/arcgis/rest/services/OCDView/Wells_Public/FeatureServer/0", "rows": 142293, "server_count": 142293, "no_geometry": 0, "status": "OK", "finished_utc": "2026-10-12T14:02:00Z"}`
- `{"name": "nm_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "rows": 33, "status": "OK", "finished_utc": "2026-10-12T14:02:01Z"}`

## Row count

| what | rows |
|---|---|
| nm_wells.csv (rows in file) | 142,293 |
| wells in the app (meta.json) | 142,293 |
| regulator live count (https://gis.emnrd.nm.gov/arcgis/rest/services/OCDView/Wells_Public/FeatureServer/0, 2026-10-12T14:00:51Z) | 142,293 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326 / longitude, lat lat_4326 / latitude; datum WGS84 (service geometry, reprojected by the server from NAD83 / EPSG:4269).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the New Mexico outline bbox (+0.05 deg) | 0 |
| valid but outside the New Mexico outline (Census, generalized; points on the border can fall just outside) | 9 |
| **on the map: exact** | 142,293 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 12 | 142,293 |

Wells with a full API (10 digits starting 30): 142,293; distinct: 142,293; APIs on more than one row: 0; without a full API (not searchable by API): 0

## Type (type)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil | Oil | oil | 84,512 | 84,512 | 0 |
| Gas | Gas | gas | 48,317 | 48,317 | 0 |
| CO2 | CO2 | gas | 999 | 999 | 0 |
| C02 | C02 | gas | 34 | 34 | 0 |
| Injection | Injection | injection | 6,104 | 6,104 | 0 |
| Salt Water Disposal | Salt Water Disposal | injection | 1,797 | 1,797 | 0 |
| Miscellaneous | Miscellaneous | other | 386 | 386 | 0 |
| Water | Water | other | 144 | 144 | 0 |

## Status (status)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Active | Active | - | 54,254 | 54,254 | 0 |
| Plugged (site released) | Plugged (site released) | - | 48,215 | 48,215 | 0 |
| New | New | - | 18,645 | 18,645 | 0 |
| Cancelled | Cancelled | - | 16,961 | 16,961 | 0 |
| Plugged (not released) | Plugged (not released) | - | 2,841 | 2,841 | 0 |
| Temporary Abandonment | Temporary Abandonment | - | 492 | 492 | 0 |
| Reclamation Fund Approved | Reclamation Fund Approved | - | 460 | 460 | 0 |
| Temporary Abandonment (expired) | Temporary Abandonment (expired) | - | 271 | 271 | 0 |
| Never Drilled | Never Drilled | - | 102 | 102 | 0 |
| Zone Plugged (permanent) | Zone Plugged (permanent) | - | 26 | 26 | 0 |
| Dry Hole | Dry Hole | - | 14 | 14 | 0 |
| Zone Plugged (temporary) | Zone Plugged (temporary) | - | 9 | 9 | 0 |
| Reclamation Fund Pending | Reclamation Fund Pending | - | 3 | 3 | 0 |

## Fields (30) and blank counts

| field | label in app | blank |
|---|---|---|
| OBJECTID | Object ID | 0 |
| id | ID | 0 |
| name | Name | 0 |
| type | Type | 0 |
| status | Status | 0 |
| sub_type_code | Sub Type Code | 142,192 |
| ogrid | Ogrid | 0 |
| ogrid_name | Ogrid Name | 0 |
| district_code | District Code | 0 |
| district | District | 0 |
| county_code | County Code | 0 |
| county | County | 0 |
| ulstr | Ulstr | 0 |
| latitude | Latitude | 0 |
| longitude | Longitude | 0 |
| projection | Projection | 546 |
| directional_status | Directional Status | 29,983 |
| details | Details | 0 |
| files | Files | 0 |
| year_spudded | Year Spudded | 0 |
| spud_date | Spud Date | 0 |
| lease_type | Lease Type | 19,525 |
| measured_vertical_depth | Measured Vertical Depth | 0 |
| true_vertical_depth | True Vertical Depth | 0 |
| pool_id_list | Pool ID List | 19,860 |
| last_production_date | Last Production Date | 0 |
| plug_date | Plug Date | 0 |
| GlobalID | Globalid | 0 |
| lon_4326 | Longitude (WGS84) | 0 |
| lat_4326 | Latitude (WGS84) | 0 |

## Source notes (pull agent, 2026-10-12)

- **Source**: EMNRD Oil Conservation Division, ArcGIS FeatureServer `OCDView/Wells_Public/0`
  (https://gis.emnrd.nm.gov/arcgis/rest/services/OCDView/Wells_Public/FeatureServer/0). Pulled once with
  `scripts/pull_nm.py`: 24 keyset pages of 6,000 (OBJECTID order), one request at a time, 0.6 s apart, no 403/429.
- **Counts**: service count 142,293 = rows pulled 142,293 = rows in the app. Every row had point geometry:
  exact 142,293, repaired 0, approximate 0, unmapped 0. No PLSS grid was pulled or configured (nothing to place).
- **Coordinates**: geometry requested with `outSR=4326` (service stores EPSG:4269 NAD83). The attribute
  `latitude`/`longitude` columns (per `projection`: NAD83 141,398, blank 546, NAD27 343, WGS84 3, NULL 3) are the
  fallback; they differ from the geometry by at most 1.6e-5 degrees. 9 points fall just outside the generalized
  Census outline (all within about 2 km of the state bbox, i.e. border wells).
- **Fields**: all 28 attributes plus `lon_4326`/`lat_4326`. Epoch-ms dates were converted to YYYY-MM-DD; OCD's
  `plug_date` sentinel for "not plugged" comes through as `9999-12-31`. `details` (OCD well details page) and
  `files` (scanned well files) are per-well links.
- **Type / status**: legend type = `type` (Oil, Gas, Injection, Salt Water Disposal, CO2, Miscellaneous, Water, and
  the misspelling `C02`), status = `status`. `CO2`/`C02` are mapped to the gas category because New Mexico's CO2 wells
  are producers (Bravo Dome); `Water` and `Miscellaneous` are "Permit / other".
- **Update frequency**: not stated by OCD (ChangeTracking is enabled on the service; APD-driven). The data date shown
  is the pull date.
- **Unverified**: terms of use (robots.txt returned 503 on 2026-10-09); update cadence; the OCD meaning of
  `sub_type_code` (blank in the sample rows).
- **Layers**: none (no public companion layer on this service joins on API).
