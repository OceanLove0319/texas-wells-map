# Snapshot report - Indiana Department of Natural Resources, Division of Oil and Gas well data (Indiana)

Report generated: 2026-10-12 14:31 UTC  
Data date shown in the app: **2026-10-12** (from data/raw/in/pull_log.jsonl (in_wells.csv))  

Pull log:

- `{"name": "in_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "features": 92, "status": "OK", "finished_utc": "2026-10-12T14:15:14Z"}`
- `{"name": "raw_layer0.jsonl", "layer": "OilGasWells", "url": "https://gisdata.in.gov/server/rest/services/Hosted/OilAndGasWells/FeatureServer/0", "rows": 78257, "server_count": 78257, "status": "OK", "source_sr": {"falseM": -100000, "xyTolerance": 0.001, "mUnits": 10000, "zUnits": 10000, "latestWkid": 3857, "zTolerance": 0.001, "wkid": 102100, "xyUnits": 148923141.92838538, "mTolerance": 0.001, "falseX": -20037700, "falseY": -30241100, "falseZ": -100000}, "finished_utc": "2026-10-12T14:16:19Z"}`
- `{"name": "in_wells.csv", "from": ["OilGasWells"], "rows": 78257, "status": "written", "finished_utc": "2026-10-12T14:16:19Z"}`
- `{"name": "in_wells.csv", "from": ["OilGasWells"], "rows": 78257, "status": "written", "finished_utc": "2026-10-12T14:27:17Z"}`

## Row count

| what | rows |
|---|---|
| in_wells.csv (rows in file) | 78,257 |
| wells in the app (meta.json) | 78,257 |
| regulator live count (https://gisdata.in.gov/server/rest/services/Hosted/OilAndGasWells/FeatureServer/0, 2026-10-12T14:27:17Z) | 78,257 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon LON_4326, lat LAT_4326; datum WGS84 (reprojected by the service; utmx/utmy are UTM 16N, datum not stated).

| what | wells |
|---|---|
| null or 0 | 1,838 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Indiana outline bbox (+0.05 deg) | 1 |
| valid but outside the Indiana outline (Census, generalized; points on the border can fall just outside) | 31 |
| **on the map: exact** | 76,419 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 1,838 |

Why wells without usable coordinates could not be placed:

- state has no PLSS: 1,838

## API

| raw API length | wells |
|---|---|
| 10 | 78,257 |

Wells with a full API (10 digits starting 13): 78,257; distinct: 78,257; APIs on more than one row: 0; without a full API (not searchable by API): 0

## Type (status)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Prsmd Plggd(I) | Prsmd Plggd(I) | plugged | 33,191 | 33,106 | 0 |
| Plugd & Abandnd | Plugd & Abandnd | plugged | 21,567 | 21,528 | 0 |
| Prsmd Plggd | Prsmd Plggd | plugged | 10,525 | 10,478 | 0 |
| Plugged | Plugged | plugged | 161 | 156 | 0 |
| Inadqtly Plggd | Inadqtly Plggd | plugged | 8 | 8 | 0 |
| Prsmd Plggd (I) | Prsmd Plggd (I) | plugged | 5 | 4 | 0 |
| RevInj NPaS&FV | RevInj NPaS&FV | injection | 39 | 39 | 0 |
| Active | Active | other | 8,273 | 8,108 | 0 |
| Expired | Expired | other | 1,174 | 1,070 | 0 |
| (blank) | (blank) | other | 1,849 | 535 | 0 |
| Orphaned | Orphaned | other | 491 | 491 | 0 |
| Revoked | Revoked | other | 416 | 413 | 0 |
| Inactive | Inactive | other | 189 | 183 | 0 |
| TA | TA | other | 142 | 142 | 0 |
| Not Drilled | Not Drilled | other | 155 | 96 | 0 |
| Cancelled | Cancelled | other | 46 | 36 | 0 |
| Other Inactive | Other Inactive | other | 21 | 21 | 0 |
| Drilling | Drilling | other | 5 | 5 | 0 |

## Fields (31) and blank counts

| field | label in app | blank |
|---|---|---|
| objectid | Object ID | 0 |
| igs_id | Igs ID | 0 |
| permit_number | Permit Number | 78,257 |
| county | County | 4 |
| land_type | Land Type | 0 |
| land_number | Land Number | 78,257 |
| township | Township | 6,983 |
| range | Range | 6,982 |
| operator_name | Operator Name | 78,257 |
| lease_name | Lease Name | 1,892 |
| well_number | Well Number | 78,257 |
| status | Status | 1,849 |
| scancount | Scancount | 78,257 |
| twp_direction | Twp Direction | 78,257 |
| rng_direction | Rng Direction | 78,257 |
| hydrofrac | Hydrofrac | 71,147 |
| utmx | Utmx | 1,837 |
| utmy | Utmy | 1,837 |
| method | Method | 1,837 |
| classii | Classii | 77,083 |
| twp_number | Twp Number | 6,983 |
| rng_number | Rng Number | 6,982 |
| permit_int | Permit Int | 78,257 |
| igs_int | Igs Int | 0 |
| scanstat | Scanstat | 20,077 |
| currentstat | Currentstat | 78,257 |
| permitz | Permitz | 78,257 |
| igsz | Igsz | 0 |
| LON_4326 | Longitude (WGS84) | 1,838 |
| LAT_4326 | Latitude (WGS84) | 1,838 |
| STATE_WELL_KEY | State Well Key | 0 |

## Source notes (agent, 2026-10-12)

- Source: Indiana DNR `Hosted/OilAndGasWells/FeatureServer/0` on gisdata.in.gov, 40 pages of 2,000 with keyset paging; `scripts/pull_in.py`. Rows pulled = server count = 78,257. The richer IGWS PDMS database (about 83k wells, access tiers unverified) was not used.
- Key: Indiana has no API numbers. permit_number is blank on every row of this layer; igs_id is present and unique on all 78,257 rows. STATE_WELL_KEY = "13" + igs_id zero-padded to 8 digits (max igs_int 600157) is the search key (13-000-00013). Its digits 3-5 are not a county code: one shard for the whole state, county name blank in the panel (the `county` column is shown).
- Coordinates: LON_4326/LAT_4326 (server reprojection; utmx/utmy UTM 16N kept raw, datum not stated). 1,838 wells (2.3%) have no coordinates (1,837 with blank utmx, 1 with utmx but no geometry). 1,785 of them have township and range, but twp_direction, rng_direction and land_number (section) are EMPTY on every row of the layer, so no PLSS placement is possible and no BLM grid was pulled.
- Type = status (18 DNR abbreviations: Prsmd Plggd(I) 33,191; Plugd & Abandnd 21,567; Prsmd Plggd 10,525; Active 8,273; blank 1,849; Expired 1,174; Orphaned 491; ...); no separate status field. No well type, dates, depth or document link; operator_name is mostly blank.
- Update frequency: not published; lastEditDate 2025-06-26. Snapshot date shown = pull date.

## Build notes (apply to every state added in this batch)

- Fragment: `scripts/states/<st>.config.mjs` (default export, same schema as a `states.config.mjs` entry). Nothing in `states.config.mjs`, `app/` or docs was changed; this report was produced with a scratch copy of the build that loaded only the new fragments.
- Legend budget: `build_data.mjs` stores type and status indexes as Uint8 (at most 255 types and 254 statuses across ALL states). The twelve fragments of this batch alone add 222 types and 131 statuses; together with TX/OK/KS and the other agents' states the real build will exceed 255 and throw "too many categories for Uint8 encoding" until types.bin / status.bin are widened (Uint16) or indexed per state.
- ArcGIS Date fields were converted from epoch milliseconds to YYYY-MM-DD (UTC) by the pull scripts; all other attributes are verbatim.
