# Snapshot report - BOEM federal offshore (OCS) boreholes - pseudo-state "Federal Offshore"

Report generated: 2026-10-12T14:15:46Z  
Data date shown in the app: **2026-10-12** (from data/raw/boem/pull_log.jsonl (mv_boreholes_all.txt, zip_entry_date))  
Source: https://www.data.boem.gov/Well/Files/BoreholeRawData.zip (BOEM Data Center "Borehole Raw Data", all regions, rebuilt DAILY; Last-Modified Mon, 12 Oct 2026 09:32:07 GMT)  
Licensing / terms: U.S. Government work (BOEM, Department of the Interior), public domain; data.boem.gov publishes a general disclaimer (data provided as-is). robots.txt on data.boem.gov blocks only named crawlers; gis.boem.gov has no robots.txt (404). No login, no key.  
Update frequency: the zip is rebuilt every day (Last-Modified today). The REST layers (gis.boem.gov) carry a smaller well set, see below.  

Pull log:

- `{"name": "BoreholeRawData.zip", "url": "https://www.data.boem.gov/Well/Files/BoreholeRawData.zip", "bytes": 3489437, "last_modified": "Mon, 12 Oct 2026 09:32:07 GMT", "status": "downloaded", "finished_utc": "2026-10-12T14:02:34Z"}`
- `{"name": "mv_boreholes_all.txt", "from": "BoreholeRawData.zip", "bytes": 13633145, "zip_entry_date": "2026-10-12", "status": "extracted", "finished_utc": "2026-10-12T14:02:34Z"}`
- `{"name": "boem_rest_wells.csv[GOM]", "service": "https://gis.boem.gov/arcgis/rest/services/BOEM_BSEE/GOA_Layers/FeatureServer/1", "rows_written": 23501, "server_ids": 23501, "status": "OK", "finished_utc": "2026-10-12T14:06:49Z"}`
- `{"name": "boem_rest_wells.csv[PAC]", "service": "https://gis.boem.gov/arcgis/rest/services/BOEM_BSEE/POC_Layers/FeatureServer/1", "rows_written": 1688, "server_ids": 1688, "status": "OK", "finished_utc": "2026-10-12T14:06:53Z"}`
- `{"name": "boem_rest_wells.csv[AK]", "service": "https://gis.boem.gov/arcgis/rest/services/BOEM_BSEE/AK_Layers/FeatureServer/1", "rows_written": 162, "server_ids": 162, "status": "OK", "finished_utc": "2026-10-12T14:06:56Z"}`
- `{"name": "boem_planning_areas.geojson[GOM]", "service": "https://gis.boem.gov/arcgis/rest/services/BOEM_BSEE/GOA_Layers/FeatureServer/8", "layer_name": "BOEM Oil and Gas Planning Areas", "rows_written": 3, "server_ids": 3, "status": "OK", "finished_utc": "2026-10-12T14:06:59Z"}`
- `{"name": "boem_planning_areas.geojson[PAC]", "service": "https://gis.boem.gov/arcgis/rest/services/BOEM_BSEE/POC_Layers/FeatureServer/8", "layer_name": "BOEM Oil and Gas Planning Areas", "rows_written": 4, "server_ids": 4, "status": "OK", "finished_utc": "2026-10-12T14:07:03Z"}`
- `{"name": "boem_planning_areas.geojson[AK]", "service": "https://gis.boem.gov/arcgis/rest/services/BOEM_BSEE/AK_Layers/FeatureServer/7", "layer_name": "BOEM Oil and Gas Planning Areas", "rows_written": 12, "server_ids": 12, "status": "OK", "finished_utc": "2026-10-12T14:07:06Z"}`
- `{"name": "boem_protraction.geojson[GOM]", "service": "https://gis.boem.gov/arcgis/rest/services/BOEM_BSEE/GOA_Layers/FeatureServer/5", "layer_name": "BOEM OCS Protraction Diagrams & Leasing Maps", "rows_written": 85, "server_ids": 85, "status": "OK", "finished_utc": "2026-10-12T14:07:10Z"}`
- `{"name": "boem_protraction.geojson[PAC]", "service": "https://gis.boem.gov/arcgis/rest/services/BOEM_BSEE/POC_Layers/FeatureServer/5", "layer_name": "BOEM OCS Protraction Diagrams & Leasing Maps", "rows_written": 71, "server_ids": 71, "status": "OK", "finished_utc": "2026-10-12T14:07:13Z"}`
- `{"name": "boem_protraction.geojson[AK]", "service": "https://gis.boem.gov/arcgis/rest/services/BOEM_BSEE/AK_Layers/FeatureServer/4", "layer_name": "BOEM OCS Protraction Diagrams & Leasing Maps", "rows_written": 244, "server_ids": 244, "status": "OK", "finished_utc": "2026-10-12T14:07:17Z"}`

## Row count

| what | rows |
|---|---|
| mv_boreholes_all.txt (rows in file = boreholes) | 57,503 |
| distinct 12-digit API_WELL_NUMBER | 57,503 |
| distinct 10-digit API (sidetrack/bypass suffix dropped) | 39,569 |
| region G = Gulf of America | 55,570 |
| region P = Pacific | 1,714 |
| region Y = Alaska | 167 |
| region A = Atlantic | 52 |
| REST well layers (returnIdsOnly), GOM + PAC + AK | 25,351 (GOM 23,501, PAC 1,688, AK 162) |
| REST wells joined to the CSV on API (12 digits) | 25,351 of 25,351 REST rows; 32,152 CSV rows have no REST row |

There is no separate "live count" for BOEM: the daily CSV IS the regulator's full borehole list. The REST well layers hold a subset (about 44%), so they are used only as a joined layer for the code descriptions / OPERATOR number, never for the count. The research note of 2026-10-09 quoted 54,576 for the Gulf REST layer; returnIdsOnly gave 23,501 on 2026-10-12 (not re-explained; the CSV is authoritative).

## API numbers

| raw API length | rows |
|---|---|
| 12 | 57,503 |

API digits 1-2 by region (offshore APIs use the OCS codes 55 Alaska, 56 Pacific, 60 Northern Gulf, 61 Atlantic, but older boreholes carry the ADJACENT STATE's code: 01 AL, 17 LA, 42 TX, 04 CA, 50 AK):

| region | digits 1-2 | rows |
|---|---|---|
| A | 61 | 52 |
| G | 01 | 4 |
| G | 17 | 41,110 |
| G | 42 | 6,834 |
| G | 60 | 7,622 |
| P | 04 | 1,537 |
| P | 56 | 177 |
| Y | 50 | 48 |
| Y | 55 | 119 |

Digits 3-5 are the OCS AREA code (e.g. 709 = High Island), not a county. **5,287 BOEM APIs start with 42; 14 of their 10-digit forms also exist in the Texas RRC base file** (checked 2026-10-12), so API search routing by the first two digits must consider the offshore layer too.

## Coordinates

Columns: lon SURF_LONGITUDE, lat SURF_LATITUDE (surface location); BOTM_* = bottom hole. Datum NAD27 per BOEM's borehole file notes (unverified against a control point).

| what | rows |
|---|---|
| surface null or 0 | 2 |
| surface invalid (outside -180..180 / -90..90) | 0 |
| bottom-hole unusable (384 blank + 446 printed as `*****`, BOEM's marker for withheld/unknown values) | 830 |
| **on the map (surface)** | 57,501 |
| **not on the map** | 2 |

Unmapped reasons: 2 rows with blank surface lat/long (both Pacific: 043112030200, 560690000670).
Inside a STATE outline (us_states.geojson, generalized): 699 surface points (LA 627, AK 67, AL 4, CA 1) fall inside a state polygon; these are 8(g)-zone / bay boreholes near the coast, kept as offshore.

## Type (WELL_TYPE_CODE)

| code | description | category by shared rules | rows |
|---|---|---|---|
| D | Development | (no rule) -> needs categoryOverrides | 36,992 |
| E | Exploratory | (no rule) -> needs categoryOverrides | 20,338 |
| C | Core Test | other | 117 |
| R | Relief | (no rule) -> needs categoryOverrides | 46 |
| S | Strat Test | other | 7 |
| N | Non-Operation | (no rule) -> needs categoryOverrides | 2 |
| O | Other | (no rule) -> needs categoryOverrides | 1 |

BOEM types do not say oil vs gas. The fragment maps every type to `other` (purple shades) so nothing is invented; colouring by STATUS (Permanently Abandoned = plugged) is the more useful default for this layer.

## Status (BOREHOLE_STAT_CD)

| code | description | category by shared rules | rows |
|---|---|---|---|
| PA | Permanently Abandoned | plugged | 31,294 |
| ST | Sidetracked | (no rule) -> needs categoryOverrides | 17,789 |
| COM | Completed | (no rule) -> needs categoryOverrides | 4,271 |
| TA | Temporarily Abandoned | other | 3,012 |
| CNL | Cancelled | (no rule) -> needs categoryOverrides | 1,025 |
| DSI | Drilling Suspended | (no rule) -> needs categoryOverrides | 51 |
| APD | Application for Permit to Drill | other | 26 |
| DRL | Drilling Active | (no rule) -> needs categoryOverrides | 18 |
| AST | Approved Sidetrack | (no rule) -> needs categoryOverrides | 15 |
| VCW | Volume Chamber Well | (no rule) -> needs categoryOverrides | 2 |

## Region sub-filter (REGION_CODE)

| code | region | rows | surface lon range | surface lat range |
|---|---|---|---|---|
| A | Atlantic | 52 | -80.53 .. -67.21 | 30.44 .. 40.93 |
| G | Gulf of America | 55,570 | -97.20 .. -83.40 | 25.95 .. 30.20 |
| P | Pacific | 1,714 | -124.79 .. -117.98 | 32.43 .. 47.66 |
| Y | Alaska | 167 | -178.29 .. -140.34 | 55.05 .. 71.85 |

Note: the task said regions Gulf / Pacific / Alaska; the file also has **Atlantic (A, 52 boreholes, 1970s-80s COST and exploratory wells)**. gis.boem.gov also has an ATL_Layers service; it was not pulled (no wells layer verified there).

## Fields (26) and blank counts - base file

| field | blank |
|---|---|
| API_WELL_NUMBER | 0 |
| WELL_NAME | 0 |
| WELL_NAME_SUFFIX | 0 |
| BOTM_LEASE_NUMBER | 0 |
| BOTM_AREA_CODE | 0 |
| BOTM_BLOCK_NUMBER | 0 |
| COMPANY_NAME | 0 |
| WELL_SPUD_DATE | 1,064 |
| BH_TOTAL_MD | 338 |
| WELL_BORE_TVD | 346 |
| WELL_TD_SS | 0 |
| RKB_ELEVATION | 353 |
| WELL_BP_ST_KICKOFF_MD | 39,752 |
| TOTAL_DEPTH_DATE | 1,124 |
| BOREHOLE_STAT_DT | 566 |
| WELL_TYPE_CODE | 0 |
| BOREHOLE_STAT_CD | 0 |
| CASING_CUT_CODE | 3,528 |
| WATER_DEPTH | 239 |
| UNDWTR_COMP_STUB | 1 |
| SURF_LEASE_NUMBER | 0 |
| SURF_LATITUDE | 2 |
| SURF_LONGITUDE | 2 |
| BOTM_LATITUDE | 384 |
| BOTM_LONGITUDE | 384 |
| REGION_CODE | 0 |

## Joined layer boem_rest_wells.csv (25,351 rows) - fields

| field | blank | note |
|---|---|---|
| COMPLETION | 25,351 |  |
| Y | 1,850 | latitude per REST attributes |
| X | 1,850 | longitude per REST attributes |
| OBJECTID | 0 |  |
| API_NUMBER | 0 | join key = API_WELL_NUMBER (12 digits); 100% of REST rows join |
| OPERATOR | 0 | 5-digit BOEM company number, not a name (COMPANY_NAME is in the base file) |
| WELL_NAME | 0 |  |
| SPUD_DATE | 6 |  |
| TYPE_CODE | 0 |  |
| TYPE_CODE_DESC | 0 | description; code agrees with WELL_TYPE_CODE on every joined row |
| STATUS | 0 |  |
| DEPTH | 0 |  |
| STATUS_DESCRIPTION | 0 | description; code agrees with BOREHOLE_STAT_CD on every joined row |
| REGION | 0 | GOM / PAC / AK, added |
| GEOM_LON | 0 | geometry x (WGS84), added |
| GEOM_LAT | 0 | geometry y (WGS84), added |

## Optional offshore reference layers

- `boem_planning_areas.geojson`: 19 features, 60 KB, generalized 0.01 deg. Properties include OBJECTID, TEXT_LABEL, SDETABS_PLANAREA_SDE_AREA, SDETABS_PLANAREA_SDE_LEN, REGION.
- `boem_protraction.geojson`: 400 features, 269 KB, generalized 0.01 deg. Properties include OBJECTID, MMS_REGION_CODE, PROT_NUMBER, PROT_APRV_DATE, PROT_NAME, PROJ_ZONE_CODE, AREA_CODE, PLAN_AREA_CODE, PLAN_AREA_NAME, REGION.

## Unverified

- NAD27 as the datum of SURF_*/BOTM_* columns is BOEM's documentation, not checked against a control point (offset vs NAD83 in the Gulf is tens of metres).
- Why the Gulf REST well layer has 23,501 features (research note said 54,576 three days earlier).
- ATL_Layers (Atlantic) service contents.
- WELL_NAME_SUFFIX / CASING_CUT_CODE / UNDWTR_COMP_STUB code meanings were not looked up (raw values are kept and shown).
