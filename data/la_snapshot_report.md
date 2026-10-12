# Snapshot report - Louisiana Office of Conservation (SONRIS) well data (Louisiana)

Report generated: 2026-10-12 14:33 UTC  
Data date shown in the app: **2026-10-10** (from ../../../../../../../Users/ocean/.claude/projects/tx-wells-map/data/raw/la/pull_log.jsonl (la_wells.csv, gis_upd_date))  

Pull log:

- `{"name": "source_count.json", "service": "https://sonris-gis.dnr.la.gov/arcgis/rest/services/DNRSvc/OC/MapServer/0", "server_count": 247314, "status": "OK", "finished_utc": "2026-10-12T14:05:40Z"}`
- `{"name": "la_wells.csv", "service": "https://sonris-gis.dnr.la.gov/arcgis/rest/services/DNRSvc/OC/MapServer/0", "layer_name": "Oil/Gas Wells", "rows": 247314, "server_count": 247314, "status": "OK", "finished_utc": "2026-10-12T14:16:16Z", "gis_upd_date": "2026-10-10"}`
- `{"name": "la_bottom_holes.csv", "service": "https://sonris-gis.dnr.la.gov/arcgis/rest/services/DNRSvc/OC/MapServer/1", "layer_name": "Oil/Gas Well Bottom Holes and Bores", "rows": 22814, "server_count": 22814, "status": "OK", "finished_utc": "2026-10-12T14:16:49Z"}`
- `{"name": "la_injection_wells.csv", "service": "https://sonris-gis.dnr.la.gov/arcgis/rest/services/DNRSvc/OC/MapServer/9", "layer_name": "Injection Wells", "rows": 14273, "server_count": 14273, "status": "OK", "finished_utc": "2026-10-12T14:17:24Z", "gis_upd_date": "2026-10-10"}`
- `{"name": "la_codes.json", "status_codes": 30, "product_codes": 4, "uic_codes": 44, "status": "OK", "finished_utc": "2026-10-12T14:17:26Z"}`
- `{"name": "la_wells.csv (TYPE_GROUP)", "step": "TYPE_GROUP column added", "type_groups": {"GAS": 25188, "PERMIT": 22125, "OIL": 28378, "NO PRODUCT SPECIFIED": 4462, "DRY AND PLUGGED": 67746, "PLUGGED AND ABANDONED": 93697, "SHUT-IN DRY HOLE": 533, "INJECTION (UIC)": 4833, "VIRTUAL/BAD DATA": 123, "PLUGGED BACK - NO PERFORATIONS": 187, "DRY GAS": 42}, "finished_utc": "2026-10-12T14:22:38Z"}`

## Row count

| what | rows |
|---|---|
| la_wells.csv (rows in file) | 247,314 |
| wells in the app (meta.json) | 247,314 |
| regulator live count (https://sonris-gis.dnr.la.gov/arcgis/rest/services/DNRSvc/OC/MapServer/0, 2026-10-12T14:05:40Z) | 247,314 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326 / SURFACE_LONG_DEC_DEG, lat lat_4326 / SURFACE_LAT_DEC_DEG; datum NAD83 (SONRIS decimal degrees; service UTM 15N reprojected to WGS84 by the server).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Louisiana outline bbox (+0.05 deg) | 11 |
| valid but outside the Louisiana outline (Census, generalized; points on the border can fall just outside) | 195 |
| **on the map: exact** | 247,314 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 0 | 6 |
| 1 | 811 |
| 4 | 3 |
| 10 | 17 |
| 13 | 20 |
| 14 | 246,457 |

Wells with a full API (10 digits starting 17): 230,718; distinct: 209,101; APIs on more than one row: 19,519; without a full API (not searchable by API): 16,596

## Type (TYPE_GROUP)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| OIL | OIL | oil | 28,378 | 28,378 | 0 |
| GAS | GAS | gas | 25,188 | 25,188 | 0 |
| DRY GAS | DRY GAS | gas | 42 | 42 | 0 |
| PLUGGED AND ABANDONED | PLUGGED AND ABANDONED | plugged | 93,697 | 93,697 | 0 |
| DRY AND PLUGGED | DRY AND PLUGGED | plugged | 67,746 | 67,746 | 0 |
| PLUGGED BACK - NO PERFORATIONS | PLUGGED BACK - NO PERFORATIONS | plugged | 187 | 187 | 0 |
| INJECTION (UIC) | INJECTION (UIC) | injection | 4,833 | 4,833 | 0 |
| SHUT-IN DRY HOLE | SHUT-IN DRY HOLE | dry | 533 | 533 | 0 |
| PERMIT | PERMIT | other | 22,125 | 22,125 | 0 |
| NO PRODUCT SPECIFIED | NO PRODUCT SPECIFIED | other | 4,462 | 4,462 | 0 |
| VIRTUAL/BAD DATA | VIRTUAL/BAD DATA | other | 123 | 123 | 0 |

## Status (WELL_STATUS_CODE)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| PLUGGED AND ABANDONED (30) | 30 | - | 93,644 | 93,644 | 0 |
| DRY AND PLUGGED (29) | 29 | - | 67,746 | 67,746 | 0 |
| ACTIVE - PRODUCING (10) | 10 | - | 26,146 | 26,146 | 0 |
| PERMIT EXPIRED (03) | 03 | - | 21,862 | 21,862 | 0 |
| SHUT-IN PRODUCTIVE -FUTURE UTILITY (33) | 33 | - | 19,681 | 19,681 | 0 |
| ORPHAN WELL-ENG (23) | 23 | - | 5,948 | 5,948 | 0 |
| ACTIVE- INJECTION (09) | 09 | - | 4,384 | 4,384 | 0 |
| UNABLE TO LOCATE WELL-NO PLUG/ABND REP (28) | 28 | - | 2,587 | 2,587 | 0 |
| REVERTED TO SINGLE COMPLETION (22) | 22 | - | 1,662 | 1,662 | 0 |
| PA-35 TEMPORARY INACTIVE WELL (20) | 20 | - | 834 | 834 | 0 |
| SHUT-IN DRY HOLE -FUTURE UTILITY (31) | 31 | - | 515 | 515 | 0 |
| TEMPORARILY ABANDONED WELL (18) | 18 | - | 428 | 428 | 0 |
| ORPHAN WELL-INJECTION AND MINING (26) | 26 | - | 379 | 379 | 0 |
| SHUT-IN PRODUCTIVE -NO FUTURE UTILITY (34) | 34 | - | 341 | 341 | 0 |
| PERMITTED (01) | 01 | - | 263 | 263 | 0 |
| PLUGGED BACK - NO PERFORATIONS - NO LUW (35) | 35 | - | 187 | 187 | 0 |
| CONVERSION TO OIL / GAS WELL (82) | 82 | - | 161 | 161 | 0 |
| ZZZZZ (code not in data dictionary) | ZZZZZ | - | 123 | 123 | 0 |
| RVRTD L/O-RESIDENT CONSUMPTION (24) | 24 | - | 108 | 108 | 0 |
| APPROVAL TO CONSTRUCT INJECTION WELL (02) | 02 | - | 70 | 70 | 0 |
| WATER (73) | 73 | - | 65 | 65 | 0 |
| PLUGGED/ABNDED PER INSPECTION (90) | 90 | - | 53 | 53 | 0 |
| RVRTD TO LANDOWNER-FRESH WATER (21) | 21 | - | 47 | 47 | 0 |
| SHUT-IN DRY HOLE - NO FUTURE UTILITY (32) | 32 | - | 18 | 18 | 0 |
| SHUT-IN WAITING ON MARKET (37) | 37 | - | 15 | 15 | 0 |
| * UNKNOWN * (80) | 80 | - | 12 | 12 | 0 |
| SHUT-IN WAITING ON PIPELINE (36) | 36 | - | 11 | 11 | 0 |
| EDUCATIONAL/SERVICE COMPANY (17) | 17 | - | 10 | 10 | 0 |
| SL-STATE JUR,BHL-FED JUR (25) | 25 | - | 9 | 9 | 0 |
| 19 (code not in data dictionary) | 19 | - | 3 | 3 | 0 |
| MULTIPLE COMPLETED/PA-35 WELL (16) | 16 | - | 1 | 1 | 0 |
| 11 (code not in data dictionary) | 11 | - | 1 | 1 | 0 |

## Fields (87) and blank counts

| field | label in app | blank |
|---|---|---|
| OBJECTID | Object ID | 0 |
| WELL_SERIAL_NUM | Well Serial Number | 0 |
| ORGANIZATION_ID | Organization ID | 0 |
| ORGOP_LINE_ID | Orgop Line ID | 0 |
| WELL_CLASS_TYPE_CODE | Well Class Type Code | 233,039 |
| WELL_NAME | Well Name | 0 |
| WELL_NUM | Well Number | 0 |
| TOWNSHIP | Township | 5 |
| EFFECTIVE_DATE | Effective Date | 0 |
| API_NUM | API Number | 6 |
| OPERATION_TYPE_CODE | Operation Type Code | 0 |
| PERMIT_DATE | Permit Date | 2,240 |
| SPUD_DATE | Spud Date | 35,242 |
| WELL_STATUS_CODE | Well Status Code | 0 |
| WELL_STATUS_DATE | Well Status Date | 0 |
| ORIGINAL_COMPLETION_DATE | Original Completion Date | 65,264 |
| LAST_RECOMPLETION_DATE | Last Recompletion Date | 206,661 |
| LAST_TEST_DATE | Last Test Date | 188,772 |
| ORPHANED_FLAG | Orphaned Flag | 231,356 |
| PRODUCT_TYPE_CODE | Product Type Code | 0 |
| CLASSIFICATION | Classification | 233,041 |
| UNIT_WELL_FLAG | Unit Well Flag | 31,456 |
| EXEMPT_29E_FLAG | Exempt 29e Flag | 36,229 |
| FIELD_ID | Field ID | 0 |
| LEASE_NUM | Lease Number | 217,282 |
| MUD_DENSITY | Mud Density | 211,043 |
| USDW_VALUE | Usdw Value | 37,303 |
| AREA_USDW_VALUE | Area Usdw Value | 209,599 |
| SOURCE_AREA_USDW_VALUE | Source Area Usdw Value | 201,149 |
| MAX_SIP | Max Sip | 241,444 |
| SIP_ASSIGNED_DATE | Sip Assigned Date | 243,296 |
| SOURCE_OF_SIP_VALUE | Source Of Sip Value | 243,095 |
| INJECTION_RATE | Injection Rate | 211,884 |
| COMMENTS | Comments | 236,134 |
| LOCATION | Location | 211,213 |
| SECTN | Sectn | 5 |
| MERIDIAN | Meridian | 27,047 |
| WELL_RANGE | Well Range | 5 |
| PARISH_CODE | Parish Code | 0 |
| SURFACE_LAT_DEC_DEG | Surface Latitude Dec Deg | 0 |
| SURFACE_LONG_DEC_DEG | Surface Longitude Dec Deg | 0 |
| MEASURED_DEPTH | Measured Depth | 9,390 |
| LEGEND | Legend | 0 |
| DISTRICT_CODE | District Code | 233,096 |
| INSPECTION_DATE | Inspection Date | 247,314 |
| INSPECTION_YEAR_INDEX | Inspection Year Index | 247,314 |
| SECTION | Section | 5 |
| INJECTION_VOLUME | Injection Volume | 246,842 |
| LOG_REVIEWED_FLAG | Log Reviewed Flag | 229,218 |
| ORPHAN_STATUS_CODE | Orphan Status Code | 231,398 |
| ORPHAN_STATUS_DATE | Orphan Status Date | 231,432 |
| FIELD_NAME | Field Name | 0 |
| ORG_OPER_NAME | Org Oper Name | 35 |
| PARISH_NAME | Parish Name | 6 |
| SCOUT_WELL_STATUS_CODE | Scout Well Status Code | 183,103 |
| SCOUT_REPORT_DATE | Scout Report Date | 183,103 |
| SCOUT_MEASURED_DEPTH | Scout Measured Depth | 194,023 |
| SCOUT_TRUE_VERTICAL_DEPTH | Scout True Vertical Depth | 245,049 |
| LUW_CODE | Luw Code | 189,597 |
| LUW_TYPE_CODE | Luw Type Code | 189,597 |
| LUW_NAME | Luw Name | 189,615 |
| LW_REC_STATUS | Lw Rec Status | 189,597 |
| SURFACE_LAMBERT_X | Surface Lambert X | 1,863 |
| SURFACE_LAMBERT_Y | Surface Lambert Y | 1,863 |
| SURFACE_COORD_SYSTEM_CODE | Surface Coord System Code | 0 |
| SURFACE_ZONE | Surface Zone | 210 |
| SURFACE_UTM83_X | Surface Utm X (NAD83) | 0 |
| SURFACE_UTM83_Y | Surface Utm Y (NAD83) | 0 |
| UPPER_PERFS | Upper Perfs | 109,765 |
| LOWER_PERFS | Lower Perfs | 109,765 |
| SANDS | Sands | 146,533 |
| RESERVOIRS | Reservoirs | 234,741 |
| FORMATIONS | Formations | 247,314 |
| HYPERLINK | Hyperlink | 0 |
| GIS_UPD_DATE | Upd Date | 0 |
| LEGEND_DESC | Legend Description | 1 |
| DIRWELL | Dirwell | 247,314 |
| SCOUT_DETAIL | Scout Detail | 184,723 |
| MINERAL_INTEREST_FLAG | Mineral Interest Flag | 34,042 |
| STATE_INTEREST_FLAG | State Interest Flag | 33,012 |
| DOC_ACCESS | Doc Access | 0 |
| STATE_ZONE | State Zone | 0 |
| COASTAL_PERMIT_NUM | Coastal Permit Number | 247,314 |
| TRUE_VERTICAL_DEPTH | True Vertical Depth | 7,862 |
| lon_4326 | Longitude (WGS84) | 0 |
| lat_4326 | Latitude (WGS84) | 0 |
| TYPE_GROUP | Type Group | 0 |

## Source notes
- Source: LDENR/Office of Conservation SONRIS GIS, DNRSvc/OC/MapServer layer 0 "Oil/Gas Wells" (247,314 features; no bulk file exists, so the layer was paged once at 1,000 rows/request, sequential, 0.5 s sleep: 248 requests + 23 for bottom holes + 15 for injection wells).
- Update frequency: nightly (GIS_UPD_DATE = 2026-10-10 on every row at pull time). This is a one-time snapshot; nothing recurring was set up.
- Companion layers (join on API_NUM): la_bottom_holes.csv (layer 1, 22,814 rows; API_NUM added from the base via WELL_SERIAL_NUM; lon/lat = bottom-hole end of the surface-to-BHL line), la_injection_wells.csv (layer 9, 14,273 rows, UIC class in WELL_CLASS_TYPE_CODE). Both layer files carry an added API column (= API_NUM) because the build detects layer join columns by name (API / api_number / api_no / apinum) and SONRIS's API_NUM is not among them. Document links: HYPERLINK (SONRIS well profile), DOC_ACCESS (document search by serial number).
- Codes: la_codes.json. WELL_STATUS_CODE labels (30 codes) come from SONRIS's own map-legend renderer (LEGEND = status + product); PRODUCT_TYPE_CODE 00/10/20/25 cross-checked with the Office of Conservation data-entry guides FC3/FC5 (oil=10, gas=20, 25 "dry gas, not in use", null=00). Status codes present in the data but absent from the legend: 19 (3 rows), 11 (1), ZZZZZ (123, "VIRTUAL/BAD DATA"). The 4-character LEGEND and LEGEND_DESC are kept raw in every row.
- Legend type = TYPE_GROUP, a column added by the pull script because SONRIS has no well-type field (111 status x product combinations is too many for one legend): product label for product-bearing statuses, status group for plugged/dry/injection/permit statuses. Mapping table is in scripts/pull_la.py (STATUS_GROUPS).
- API: 230,718 rows have a 14-digit API starting 17 (209,101 distinct; 19,519 APIs appear on more than one row, e.g. sidetracks). Not searchable by API (16,596 rows): 15,762 rows carry API_NUM "00000000000000" (mostly historic Caddo Pine Island / north Louisiana wells, plus Plaquemines), 857 rows a junk value of 0-13 digits, 13 rows a "42" (Texas) prefix and 1 a "23" prefix. They are still drawn (all have coordinates).
- Coordinates: every row has SURFACE_LAT/LONG_DEC_DEG (0 null); the WGS84 point from the service geometry is used first. 195 rows fall outside the generalized Census state outline (11 beyond the bbox + 0.05 deg): offshore wells in state waters / coastal bays, expected. No PLSS approximation (none needed; Louisiana is not PLSS statewide). MERIDIAN column holds W/E, not a meridian name.
- Datum: SONRIS decimal degrees are NAD83 (the service is UTM 15N NAD83; the server reprojected to WGS84).
- Unverified: formal SONRIS terms of use; the layer's `DNRRestricted` folder was not touched.
