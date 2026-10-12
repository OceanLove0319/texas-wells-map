# Snapshot report - BIA Osage Agency, via Osage Minerals Council ArcGIS Online layer "Osage BIA Wells" (data last edited 2021) well data (Osage County, OK (BIA))

Report generated: 2026-10-12 14:29 UTC  
Data date shown in the app: **2021-01-25** (from ../../../../../../../Users/ocean/.claude/projects/tx-wells-map/data/raw/ok_osage/pull_log.jsonl (osage_bia_wells.csv, data_last_edit))  

Pull log:

- `{"name": "source_count.json", "service": "https://services5.arcgis.com/4R6INh2sx387p4Ll/arcgis/rest/services/Osage_BIA_Wells/FeatureServer/0", "server_count": 43822, "status": "OK", "finished_utc": "2026-10-12T14:05:40Z"}`
- `{"name": "osage_bia_wells.csv", "service": "https://services5.arcgis.com/4R6INh2sx387p4Ll/arcgis/rest/services/Osage_BIA_Wells/FeatureServer/0", "rows": 43822, "server_count": 43822, "data_last_edit": "2021-01-25", "item_modified": "2023-09-16", "item_title": "Osage BIA Wells", "item_owner": "omcadmin", "item_access": "public", "item_license": null, "item_credits": "BIA", "status": "OK", "finished_utc": "2026-10-12T14:06:08Z"}`

## Row count

| what | rows |
|---|---|
| osage_bia_wells.csv (rows in file) | 43,822 |
| wells in the app (meta.json) | 43,822 |
| regulator live count (https://services5.arcgis.com/4R6INh2sx387p4Ll/arcgis/rest/services/Osage_BIA_Wells/FeatureServer/0, 2026-10-12T14:05:40Z) | 43,822 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326 / longitude, lat lat_4326 / latitude; datum WGS84 (AGOL service geometry; attribute latitude/longitude columns also kept).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Osage County, OK (BIA) outline bbox (+0.05 deg) | 0 |
| valid but outside the Osage County, OK (BIA) outline (Census, generalized; points on the border can fall just outside) | 0 |
| **on the map: exact** | 43,822 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 0 | 43,822 |

Wells with a full API (10 digits starting 35): 0; distinct: 0; APIs on more than one row: 0; without a full API (not searchable by API): 43,822

## Type (STATUS)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil well (OIL) | OIL | oil | 12,870 | 12,870 | 0 |
| Oil and gas well (O&G) | O&G | oil | 83 | 83 | 0 |
| Oil well / salt water disposal (OIL_SWD) | OIL_SWD | oil | 5 | 5 | 0 |
| Gas well (GAS) | GAS | gas | 1,620 | 1,620 | 0 |
| Gas well, WE (GAS_WE) | GAS_WE | gas | 5 | 5 | 0 |
| Abandoned oil well (ABD-OIL) | ABD-OIL | plugged | 12,247 | 12,247 | 0 |
| Abandoned gas well (ABD-GAS) | ABD-GAS | plugged | 1,469 | 1,469 | 0 |
| Abandoned injection well (ABD-INJ) | ABD-INJ | plugged | 1,120 | 1,120 | 0 |
| Abandoned salt water disposal well (ABD-SWD) | ABD-SWD | plugged | 974 | 974 | 0 |
| Abandoned, RPW (ABD-RPW) | ABD-RPW | plugged | 103 | 103 | 0 |
| Abandoned, SWE (ABD-SWE) | ABD-SWE | plugged | 57 | 57 | 0 |
| Abandoned water supply well (ABD-WSW) | ABD-WSW | plugged | 36 | 36 | 0 |
| Abandoned, CT (ABD-CT) | ABD-CT | plugged | 15 | 15 | 0 |
| Abandoned, DUA (ABD_DUA) | ABD_DUA | plugged | 14 | 14 | 0 |
| Abandoned oil and gas well (ABD-O&G) | ABD-O&G | plugged | 14 | 14 | 0 |
| Abandoned CO2 injection well (ABD_CO2) | ABD_CO2 | plugged | 7 | 7 | 0 |
| Abandoned, WSE (ABD_WSE) | ABD_WSE | plugged | 1 | 1 | 0 |
| Injection well (INJ) | INJ | injection | 1,219 | 1,219 | 0 |
| Salt water disposal well, WOE (SWD_WOE) | SWD_WOE | injection | 1,024 | 1,024 | 0 |
| Salt water disposal well, WE (SWD_WE) | SWD_WE | injection | 149 | 149 | 0 |
| CO2 injection well (CO2_INJ) | CO2_INJ | injection | 20 | 20 | 0 |
| DUA injection (DUA_INJ) | DUA_INJ | injection | 3 | 3 | 0 |
| Injection well, WE (INJ_WE) | INJ_WE | injection | 2 | 2 | 0 |
| Dry and abandoned (D_A) | D_A | dry | 6,696 | 6,696 | 0 |
| Dry hole (DRY) | DRY | dry | 1,334 | 1,334 | 0 |
| Permitted location (LOC) | LOC | other | 1,825 | 1,825 | 0 |
| Temporarily abandoned (TA) | TA | other | 686 | 686 | 0 |
| Water supply well (WSW) | WSW | other | 112 | 112 | 0 |
| RPW (RPW) | RPW | other | 75 | 75 | 0 |
| CT (CT) | CT | other | 14 | 14 | 0 |
| Gas storage well (GAS_ST) | GAS_ST | other | 10 | 10 | 0 |
| DUA (DUA) | DUA | other | 7 | 7 | 0 |
| Water supply / water injection (WS-WI) | WS-WI | other | 3 | 3 | 0 |
| Water supply well, WE (WSW_WE) | WSW_WE | other | 2 | 2 | 0 |
| Observation well (OBS) | OBS | other | 1 | 1 | 0 |

## Fields (8) and blank counts

| field | label in app | blank |
|---|---|---|
| FID | Fid | 0 |
| WNUM | Wnum | 85 |
| STATUS | Status | 0 |
| latitude | Latitude | 0 |
| longitude | Longitude | 0 |
| lon_4326 | Longitude (WGS84) | 0 |
| lat_4326 | Latitude (WGS84) | 0 |
| API | API | 43,822 |

## Source notes
- Source: Osage Minerals Council ArcGIS Online layer "Osage BIA Wells" (services5.arcgis.com/4R6INh2sx387p4Ll .../Osage_BIA_Wells/FeatureServer/0; item f3e2c94e54d44b5bab8f591a02168c16, owner omcadmin, public, credits "BIA"), 43,822 features paged once at 2,000/request (22 requests). Snippet: "Well locations for Osage County, as provided by the BIA Osage Agency."
- This is a SEPARATE SOURCE within Oklahoma (fragment id OK_OSAGE, short "BIA Osage Agency (2021)"): Osage County minerals are federally administered, and OCC's RBDMS file has 0 rows with COUNTY=OSAGE or API 35-113.
- Data last edited 2021-01-25 (service editingInfo; item metadata modified 2023-09-16). Static; nothing recurring.
- Fields: FID, WNUM (BIA lease well number), STATUS, latitude, longitude. NO API numbers (the API column is blank, so these wells are not searchable by API), no operator, no lease name, no dates.
- STATUS: 35 raw abbreviations, all kept as their own legend entries (ok_osage_codes.json); labels marked "reading of the abbreviation" are ours, 14 abbreviations (RPW, CT, DUA, *_WE, *_WOE, SWE, WSE) are not documented by the source and sit in the "Permit / other" family unless their prefix is clear (ABD-* = plugged, *_INJ/SWD_* = injection). Water-supply wells (WSW 112, WSW_WE 2, WS-WI 3, ABD-WSW 36) and permitted locations (LOC 1,825) are shown as their own entries, not hidden.
- Coordinates: all 43,822 rows; 43,812 inside the Census Osage County polygon, 10 just outside it.
- Overlap with OCC (not deduplicated): 103 OCC rows plot inside the Osage County polygon (KAY 16, PAWNEE 50, TULSA 24, WASHINGTON 13 county APIs, i.e. county-line wells). Nearest BIA point: 6 within 30 m, 25 within 30-100 m, 55 within 100-500 m, 17 farther. The close ones are probably the same wells under both regulators; both rows are kept.
- Also available but not used: DOE-NETL WELLS layer (61,007 Osage rows, 17,050 of them Wellfinder/RBDMS wells WITH real 35-113 APIs, operators and names) - a possible future enrichment, not verified here.
- Shared-library notes for the integrator: the id OK_OSAGE has no outline in us_states.geojson (coordinate repair disabled, every row has coordinates anyway); all 43,822 rows land in one shard (OK_OSAGE-none) because there are no APIs; the app title concatenates state names.
