# Snapshot report - West Virginia Department of Environmental Protection (WVDEP) well data (West Virginia)

Report generated: 2026-10-12 14:59 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/wv/pull_log.jsonl (wv_wells.csv))  

Pull log:

- `{"name": "wv_wells.csv", "service": "https://tagis.dep.wv.gov/arcgis/rest/services/WVDEP_enterprise/oil_gas/MapServer/7", "layer": 7, "rows": 154171, "server_count": 154171, "status": "OK", "finished_utc": "2026-10-12T14:07:34Z"}`
- `{"name": "wv_wells.csv", "step": "blank placeholder coordinates (UTM 500000/4000000 -> lon/lat empty, location_flag set)", "rows": 154171, "placeholder_rows": 3903, "finished_utc": "2026-10-12T14:15:25Z"}`

## Row count

| what | rows |
|---|---|
| wv_wells.csv (rows in file) | 154,171 |
| wells in the app (meta.json) | 154,171 |
| regulator live count (https://tagis.dep.wv.gov/arcgis/rest/services/WVDEP_enterprise/oil_gas/MapServer/7, 2026-10-12T14:15:24Z) | 154,171 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326, lat lat_4326; datum WGS84 (layer geometry, Web Mercator reprojected by the server); wellx/welly columns are UTM zone 17N NAD83 metres.

| what | wells |
|---|---|
| null or 0 | 3,903 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the West Virginia outline bbox (+0.05 deg) | 5 |
| valid but outside the West Virginia outline (Census, generalized; points on the border can fall just outside) | 56 |
| **on the map: exact** | 150,268 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 3,903 |

Why wells without usable coordinates could not be placed:

- state has no PLSS: 3,903

## API

| raw API length | wells |
|---|---|
| 10 | 154,171 |

Wells with a full API (10 digits starting 47): 154,171; distinct: 118,671; APIs on more than one row: 30,756; without a full API (not searchable by API): 0

## Type (welluse)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil Production | Oil Production | oil | 5,545 | 5,475 | 0 |
| 2R Production Well | 2R Production Well | oil | 1,530 | 1,527 | 0 |
| Gas Production | Gas Production | gas | 76,311 | 76,086 | 0 |
| House Gas | House Gas | gas | 1,499 | 1,497 | 0 |
| CBM - Articulate | CBM - Articulate | gas | 160 | 160 | 0 |
| Fluid Injection | Fluid Injection | injection | 3,215 | 3,213 | 0 |
| Brine Disposal | Brine Disposal | injection | 402 | 402 | 0 |
| Not Available | Not Available | other | 45,593 | 43,715 | 0 |
| Unknown | Unknown | other | 16,683 | 15,001 | 0 |
| Storage | Storage | other | 2,369 | 2,329 | 0 |
| (blank) | (blank) | other | 472 | 471 | 0 |
| Observation | Observation | other | 173 | 173 | 0 |
| Solution Mining | Solution Mining | other | 132 | 132 | 0 |
| Vent | Vent | other | 50 | 50 | 0 |
| Solution Mining Production Well | Solution Mining Production Well | other | 28 | 28 | 0 |
| Production | Production | other | 8 | 8 | 0 |
| Water Well | Water Well | other | 1 | 1 | 0 |

## Status (wellstatus)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Active Well | Active Well | - | 66,357 | 66,132 | 0 |
| Plugged | Plugged | - | 49,943 | 49,632 | 0 |
| Abandoned Well | Abandoned Well | - | 17,792 | 17,205 | 0 |
| Never Drilled | Never Drilled | - | 15,952 | 13,386 | 0 |
| Shutin | Shutin | - | 1,460 | 1,458 | 0 |
| Never Issued | Never Issued | - | 1,219 | 1,180 | 0 |
| Permit Issued | Permit Issued | - | 864 | 858 | 0 |
| Future Use | Future Use | - | 220 | 220 | 0 |
| Permit Application | Permit Application | - | 95 | 94 | 0 |
| Duplicate API | Duplicate API | - | 96 | 91 | 0 |
| Reverted Mine Vent | Reverted Mine Vent | - | 8 | 8 | 0 |
| Unlocatable | Unlocatable | - | 161 | 2 | 0 |
| Under Construction | Under Construction | - | 4 | 2 | 0 |

## Fields (27) and blank counts

| field | label in app | blank |
|---|---|---|
| objectid | Object ID | 0 |
| pkey | Pkey | 0 |
| permitid | Permitid | 0 |
| county | County | 0 |
| permit | Permit | 0 |
| api | API | 0 |
| welltype | Well Type | 0 |
| welluse | Welluse | 472 |
| welldepth | Welldepth | 0 |
| wellrig | Wellrig | 16,922 |
| permittype | Permittype | 0 |
| issuedate | Issuedate | 22,553 |
| compdate | Compdate | 111,461 |
| respparty | Respparty | 0 |
| wellstatus | Well Status | 0 |
| farmname | Farmname | 364 |
| wellnumber | Wellnumber | 392 |
| recdate | Recdate | 93,818 |
| marcellus | Marcellus | 0 |
| formation | Formation | 0 |
| link | Link | 0 |
| webmap | Webmap | 0 |
| wellx | Wellx | 15 |
| welly | Welly | 15 |
| lon_4326 | Longitude (WGS84) | 3,903 |
| lat_4326 | Latitude (WGS84) | 3,903 |
| location_flag | Location Flag | 150,268 |

## Pull notes (WV)

- Source: WVDEP TAGIS `WVDEP_enterprise/oil_gas/MapServer/7` ("All DEP Wells"), pulled 2026-10-12 with keyset paging (3,000 rows per request, sequential, 0.5 s sleep). tagis.dep.wv.gov/robots.txt has `Disallow: /arcgis/`; Ocean approved this one polite pull. No recurring pulls.
- Coordinates: layer geometry (Web Mercator, reprojected to WGS84 by the server). `wellx`/`welly` are UTM zone 17N NAD83 metres and are kept as published.
- Placeholder locations: 3,903 rows sit exactly at UTM 500000/4000000 (the zone's false origin, which plots in Virginia). The pull blanks their `lon_4326`/`lat_4326` and sets `location_flag = PLACEHOLDER_500000_4000000`, so they count as "not on the map" instead of being drawn in the wrong state. By status they are mostly Never Drilled (2,567), Abandoned Well (587), Plugged (315), Active Well (225), Unlocatable (159).
- Type = `welluse` (Gas Production, Oil Production, Fluid Injection, Storage, ...); status = `wellstatus`. `welltype` is the bore configuration (Vertical / Horizontal / Coal Bed Methane). `2R Production Well` (secondary-recovery producer) is mapped to oil by override.
- Documents: `link` opens the WVGES pipeline well page; `webmap` the DEP map.
- Not pulled: layer 5, 54,887 WVGES wells "not in the DEP database", many unlocated.
- Update cadence: not published. The data date shown is the pull date.
