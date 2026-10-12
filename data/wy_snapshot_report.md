# Snapshot report - Wyoming Oil and Gas Conservation Commission (WOGCC) well data (Wyoming)

Report generated: 2026-10-12 14:24 UTC  
Data date shown in the app: **2026-10-12** (from ../../../../../../../../Users/ocean/.claude/projects/tx-wells-map/data/raw/wy/pull_log.jsonl (wy_wells.csv))  

Pull log:

- `{"name": "source_count.json", "service": "https://dataexplorer.wogcc.wyo.gov/geoserver/wfs", "server_count": 120958, "status": "OK", "finished_utc": "2026-10-12T14:06:04Z"}`
- `{"name": "wy_wells.csv", "service": "https://dataexplorer.wogcc.wyo.gov/geoserver/wfs", "typeName": "WY_SHPS:WELL", "rows": 120958, "server_count": 120958, "no_geometry": 0, "bytes": 23197239, "crs": "EPSG:4269 (layer CRS per GetFeature)", "status": "OK", "finished_utc": "2026-10-12T14:06:17Z"}`
- `{"name": "wy_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "rows": 23, "status": "OK", "finished_utc": "2026-10-12T14:06:18Z"}`
- `{"name": "wy_wells_wfs.txt", "note": "reconstructed from the first wy_wells.csv conversion (same WFS response of 2026-10-12T14:06Z, added columns dropped) to fix the lat-first axis order without a second download", "finished_utc": "2026-10-12T14:07:54Z"}`
- `{"name": "wy_wells.csv", "service": "https://dataexplorer.wogcc.wyo.gov/geoserver/wfs", "typeName": "WY_SHPS:WELL", "rows": 120958, "server_count": 120958, "no_geometry": 0, "lat_first_axis_order": 120958, "bytes": 23197239, "crs": "EPSG:4269 (layer CRS per GetFeature)", "status": "OK", "finished_utc": "2026-10-12T14:07:54Z"}`

## Row count

| what | rows |
|---|---|
| wy_wells.csv (rows in file) | 120,958 |
| wells in the app (meta.json) | 120,958 |
| regulator live count (https://dataexplorer.wogcc.wyo.gov/geoserver/wfs (WY_SHPS:WELL, resultType=hits), 2026-10-12T14:06:04Z) | 120,958 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326, lat lat_4326; datum NAD83 (EPSG:4269 per the WFS layer CRS).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Wyoming outline bbox (+0.05 deg) | 1 |
| valid but outside the Wyoming outline (Census, generalized; points on the border can fall just outside) | 8 |
| **on the map: exact** | 120,958 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 12 | 120,958 |

Wells with a full API (10 digits starting 49): 120,958; distinct: 120,958; APIs on more than one row: 0; without a full API (not searchable by API): 0

## Type (WellType)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil Well | Oil Well | oil | 54,384 | 54,384 | 0 |
| Oil Orphaned | Oil Orphaned | oil | 277 | 277 | 0 |
| CBM Well | CBM Well | gas | 32,521 | 32,521 | 0 |
| Gas Well | Gas Well | gas | 24,079 | 24,079 | 0 |
| Gas Orphaned | Gas Orphaned | gas | 84 | 84 | 0 |
| Injection Well | Injection Well | injection | 6,920 | 6,920 | 0 |
| Disposal Well | Disposal Well | injection | 658 | 658 | 0 |
| Class V | Class V | injection | 84 | 84 | 0 |
| Class I | Class I | injection | 49 | 49 | 0 |
| Injection Orphaned | Injection Orphaned | injection | 12 | 12 | 0 |
| Disposal Orphaned | Disposal Orphaned | injection | 7 | 7 | 0 |
| Strat. Test | Strat. Test | other | 406 | 406 | 0 |
| NA | NA | other | 397 | 397 | 0 |
| Monitor Well | Monitor Well | other | 353 | 353 | 0 |
| Source Well | Source Well | other | 246 | 246 | 0 |
| H2O Source | H2O Source | other | 185 | 185 | 0 |
| Monitor | Monitor | other | 183 | 183 | 0 |
| Gas Storage | Gas Storage | other | 68 | 68 | 0 |
| Landowner Well | Landowner Well | other | 44 | 44 | 0 |
| Monitor Orphaned | Monitor Orphaned | other | 1 | 1 | 0 |

## Status (WellStatus)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Permanently Abandoned | Permanently Abandoned | - | 67,247 | 67,247 | 0 |
| Producing Gas Well | Producing Gas Well | - | 19,858 | 19,858 | 0 |
| Producing Oil Well | Producing Oil Well | - | 12,463 | 12,463 | 0 |
| Subsequent Report of Abandonment | Subsequent Report of Abandonment | - | 8,342 | 8,342 | 0 |
| Shut-In | Shut-In | - | 4,424 | 4,424 | 0 |
| Active Injector | Active Injector | - | 3,151 | 3,151 | 0 |
| Notice of Intent to Abandon | Notice of Intent to Abandon | - | 1,994 | 1,994 | 0 |
| Temporarily Abandoned | Temporarily Abandoned | - | 955 | 955 | 0 |
| Well Spudded | Well Spudded | - | 801 | 801 | 0 |
| Active Permit | Active Permit | - | 569 | 569 | 0 |
| Monitor Well | Monitor Well | - | 198 | 198 | 0 |
| Pumping Rods | Pumping Rods | - | 193 | 193 | 0 |
| Flowing | Flowing | - | 155 | 155 | 0 |
| Suspended Operations | Suspended Operations | - | 134 | 134 | 0 |
| Dormant | Dormant | - | 119 | 119 | 0 |
| Pumping Submersible | Pumping Submersible | - | 99 | 99 | 0 |
| H2O Source | H2O Source | - | 90 | 90 | 0 |
| Unknown | Unknown | - | 72 | 72 | 0 |
| Never Drilled | Never Drilled | - | 44 | 44 | 0 |
| Dry Hole | Dry Hole | - | 17 | 17 | 0 |
| No Report | No Report | - | 14 | 14 | 0 |
| Gas Lift | Gas Lift | - | 10 | 10 | 0 |
| Expired Permit | Expired Permit | - | 7 | 7 | 0 |
| Plunger Lift | Plunger Lift | - | 2 | 2 | 0 |

## Fields (15) and blank counts

| field | label in app | blank |
|---|---|---|
| FID | Fid | 0 |
| the_geom | The Geom | 0 |
| PKey | Pkey | 0 |
| DispName | Dispname | 0 |
| WellId | Wellid | 0 |
| WellName | Wellname | 1 |
| WellStatus | Well Status | 0 |
| WellType | Well Type | 0 |
| Slant | Slant | 0 |
| Confid | Confid | 0 |
| Type | Type | 0 |
| Status | Status | 0 |
| GISCode | Giscode | 0 |
| lon_4326 | Longitude (WGS84) | 0 |
| lat_4326 | Latitude (WGS84) | 0 |

## Source notes (pull agent, 2026-10-12)

- **Source**: WOGCC RBDMS Data Explorer GeoServer, WFS layer `WY_SHPS:WELL`
  (https://dataexplorer.wogcc.wyo.gov/geoserver/wfs). LOCATIONS ONLY: API, name, type, status, point. Operator,
  dates, depth and documents live on pipeline.wyo.gov (robots.txt: Disallow /) and were not pulled. Pulled once with
  `scripts/pull_wy.py`: one `resultType=hits` request and ONE GetFeature CSV request (23.2 MB), no 403/429.
- **Counts**: WFS numberMatched 120,958 = rows pulled 120,958 = rows in the app. Every row had a point: exact
  120,958, repaired 0, approximate 0, unmapped 0. No PLSS grid was pulled or configured (the WFS has no
  township/range/section attributes anyway).
- **Coordinates**: `the_geom` "POINT (lat lon)" - the WFS 2.0 response uses the EPSG:4269 axis order (latitude
  first), detected per point and swapped by the pull script (all 120,958 points were lat-first). The first
  conversion had them swapped; the response was kept as `wy_wells_wfs.txt` (reconstructed from that conversion, no
  second download) and `wy_wells.csv` was rebuilt from it. Datum NAD83 (EPSG:4269 per the layer CRS). 8 points fall
  outside the Census outline; 7 are border wells, 1 is a bad coordinate: API 49-019-42287 has latitude 11.014446
  (plotted far south of the state; left as published, it is valid-range so the repair logic does not touch it).
- **Fields**: FID, the_geom, PKey, DispName, WellId, WellName, WellStatus, WellType, Slant, Confid, Type, Status,
  GISCode plus `lon_4326`/`lat_4326`.
- **API**: `WellId` dashed ("49-001-05001"), 10 digits, all start with 49.
- **Type / status**: legend type = `WellType` (Oil Well 54,384; CBM Well 32,521; Gas Well 24,079; Injection Well
  6,920; Disposal Well 658; Strat. Test 406; NA 397; Monitor Well 353; ... orphaned variants), status =
  `WellStatus` (Permanently Abandoned 67,247; Producing Gas Well 19,858; Producing Oil Well 12,463; ...). UIC
  "Class I" / "Class V" are mapped to injection; "Source Well", "H2O Source", "Landowner Well", "NA" are other.
  The short codes Type/Status/GISCode stay in the panel.
- **Update frequency**: unknown. The data date shown is the pull date.
- **Unverified**: terms of use (none found); cadence; whether 125 `Confid = Y` wells have displaced locations.
- **Layers**: none.
