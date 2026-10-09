# Snapshot report - Kansas Geological Survey (KGS) well data (Kansas)

Report generated: 2026-10-09 20:03 UTC  
Data date shown in the app: **2026-09-11** (from data/raw/ks/pull_log.jsonl (ks_wells.txt, zip_entry_date))  

Pull log:

- `{"name": "ks_wells.zip", "url": "https://www.kgs.ku.edu/PRS/Ora_Archive/ks_wells.zip", "bytes": 44011577, "last_modified": "Fri, 11 Sep 2026 21:43:55 GMT", "status": "downloaded", "finished_utc": "2026-10-09T19:32:37Z"}`
- `{"name": "ks_wells.txt", "from": "ks_wells.zip", "bytes": 204915018, "zip_entry_date": "2026-09-11", "status": "extracted", "finished_utc": "2026-10-09T19:32:37Z"}`
- `{"name": "source_count.json", "service": "https://services.kgs.ku.edu/arcgis8/rest/services/oilgas/oilgas_wells/MapServer/0", "server_count": 519633, "status": "OK", "finished_utc": "2026-10-09T19:32:42Z"}`

## Row count

| what | rows |
|---|---|
| ks_wells.txt (rows in file) | 519,568 |
| wells in the app (meta.json) | 519,568 |
| regulator live count (https://services.kgs.ku.edu/arcgis8/rest/services/oilgas/oilgas_wells/MapServer/0, 2026-10-09T19:32:42Z) | 519,633 |

Difference live count - file: **65** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon LONGITUDE, lat LATITUDE; datum NAD27 (per KGS).

| what | wells |
|---|---|
| null or 0 | 50 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Kansas outline bbox (+0.05 deg) | 0 |
| valid but outside the Kansas outline (Census, generalized; points on the border can fall just outside) | 42 |
| **on the map: exact** | 519,518 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 50 |

Why wells without usable coordinates could not be placed:

- section not found in the BLM grid: 34
- missing or invalid township/range/section: 16

PLSS grid: data/raw/plss/KS_sections.jsonl, 82,466 sections, 82,448 keys (117 ambiguous, not used).

## API

| raw API length | wells |
|---|---|
| 0 | 41,612 |
| 12 | 432,746 |
| 17 | 45,210 |

Wells with a full API (10 digits starting 15): 477,956; distinct: 433,528; APIs on more than one row: 37,478; without a full API (not searchable by API): 41,612

## Type (STATUS)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| OIL | OIL | oil | 104,051 | 104,051 | 0 |
| O&G | O&G | oil | 4,712 | 4,712 | 0 |
| OTHER(OIL/GAS) | OTHER(OIL/GAS) | oil | 3 | 3 | 0 |
| GAS | GAS | gas | 25,525 | 25,524 | 0 |
| CBM | CBM | gas | 4,600 | 4,600 | 0 |
| OTHER(Gas) | OTHER(Gas), OTHER(gas) | gas | 3 | 3 | 0 |
| OIL-P&A | OIL-P&A | plugged | 112,997 | 112,994 | 0 |
| GAS-P&A | GAS-P&A | plugged | 16,267 | 16,267 | 0 |
| EOR-P&A | EOR-P&A | plugged | 13,931 | 13,931 | 0 |
| SWD-P&A | SWD-P&A | plugged | 7,622 | 7,622 | 0 |
| OTHER-P&A(INJ or EOR) | OTHER-P&A(INJ or EOR) | plugged | 4,602 | 4,602 | 0 |
| O&G-P&A | O&G-P&A | plugged | 1,917 | 1,917 | 0 |
| OTHER-P&A(LH) | OTHER-P&A(LH) | plugged | 1,107 | 1,107 | 0 |
| CBM-P&A | CBM-P&A | plugged | 900 | 900 | 0 |
| OTHER-P&A(WATER) | OTHER-P&A(WATER) | plugged | 710 | 710 | 0 |
| OTHER-P&A(STRAT) | OTHER-P&A(STRAT) | plugged | 647 | 647 | 0 |
| OTHER-P&A() | OTHER-P&A() | plugged | 500 | 500 | 0 |
| OTHER-P&A(CATH) | OTHER-P&A(CATH) | plugged | 331 | 331 | 0 |
| INJ-P&A | INJ-P&A | plugged | 328 | 328 | 0 |
| OTHER-P&A(Unknown) | OTHER-P&A(Unknown), OTHER-P&A(unknown) | plugged | 273 | 273 | 0 |
| OTHER-P&A(GAS-INJ) | OTHER-P&A(GAS-INJ) | plugged | 165 | 165 | 0 |
| OTHER-P&A(OBS) | OTHER-P&A(OBS) | plugged | 125 | 125 | 0 |
| OTHER-P&A(TA) | OTHER-P&A(TA) | plugged | 79 | 79 | 0 |
| OTHER-P&A(OIL&GAS-INJ) | OTHER-P&A(OIL&GAS-INJ) | plugged | 69 | 69 | 0 |
| OTHER-P&A(Plugged) | OTHER-P&A(Plugged) | plugged | 40 | 40 | 0 |
| OTHER-P&A(GAS-STG) | OTHER-P&A(GAS-STG) | plugged | 34 | 34 | 0 |
| OTHER(Plugged) | OTHER(Plugged), OTHER(PLUGGED), OTHER(plugged) | plugged | 27 | 27 | 0 |
| OTHER-P&A(GSW) | OTHER-P&A(GSW) | plugged | 16 | 16 | 0 |
| SERVICE-P&A | SERVICE-P&A | plugged | 4 | 4 | 0 |
| OTHER-P&A(CLASS ONE (OLD)) | OTHER-P&A(CLASS ONE (OLD)) | plugged | 2 | 2 | 0 |
| OTHER(GAS-P&A) | OTHER(GAS-P&A) | plugged | 2 | 2 | 0 |
| OTHER-P&A(Inj) | OTHER-P&A(Inj) | plugged | 1 | 1 | 0 |
| OTHER-P&A(2 OIL) | OTHER-P&A(2 OIL) | plugged | 1 | 1 | 0 |
| OTHER-P&A(COREHOLE) | OTHER-P&A(COREHOLE) | plugged | 1 | 1 | 0 |
| OTHER-P&A(SWD-P&A) | OTHER-P&A(SWD-P&A) | plugged | 1 | 1 | 0 |
| EOR | EOR | injection | 20,029 | 20,029 | 0 |
| SWD | SWD | injection | 8,357 | 8,357 | 0 |
| OTHER(GAS-INJ) | OTHER(GAS-INJ) | injection | 695 | 695 | 0 |
| INJ | INJ | injection | 377 | 377 | 0 |
| OTHER(OIL&GAS-INJ) | OTHER(OIL&GAS-INJ) | injection | 75 | 75 | 0 |
| OTHER(CLASS ONE (OLD)) | OTHER(CLASS ONE (OLD)) | injection | 65 | 65 | 0 |
| OTHER(CLASS1) | OTHER(CLASS1) | injection | 50 | 50 | 0 |
| OTHER(GAS INJ) | OTHER(GAS INJ) | injection | 31 | 31 | 0 |
| OTHER(INJ or EOR) | OTHER(INJ or EOR) | injection | 7 | 7 | 0 |
| D&A | D&A | dry | 122,668 | 122,667 | 0 |
| OTHER(Dry) | OTHER(Dry), OTHER(dry) | dry | 5 | 5 | 0 |
| OTHER() | OTHER() | other | 28,099 | 28,062 | 0 |
| LOC | LOC | other | 23,390 | 23,390 | 0 |
| OTHER(Unknown) | OTHER(Unknown), OTHER(unknown) | other | 6,256 | 6,254 | 0 |
| OTHER(STRAT) | OTHER(STRAT) | other | 2,419 | 2,418 | 0 |
| OTHER(CATH) | OTHER(CATH) | other | 2,099 | 2,099 | 0 |
| INTENT | INTENT | other | 1,285 | 1,285 | 0 |
| OTHER(WATER) | OTHER(WATER), OTHER(Water) | other | 974 | 974 | 0 |
| OTHER(OBS) | OTHER(OBS) | other | 204 | 204 | 0 |
| OTHER(GAS-STG) | OTHER(GAS-STG) | other | 192 | 192 | 0 |
| OTHER(COREHOLE) | OTHER(COREHOLE) | other | 190 | 190 | 0 |
| OTHER(TA) | OTHER(TA) | other | 168 | 168 | 0 |
| OTHER(MONITOR) | OTHER(MONITOR), OTHER(Monitor) | other | 125 | 120 | 0 |
| OTHER(GSW) | OTHER(GSW) | other | 57 | 57 | 0 |
| OTHER(LH) | OTHER(LH) | other | 50 | 50 | 0 |
| OTHER(ABD LOC) | OTHER(ABD LOC) | other | 41 | 41 | 0 |
| OTHER(OTHER) | OTHER(OTHER) | other | 15 | 15 | 0 |
| OTHER(SERVICE) | OTHER(SERVICE) | other | 8 | 8 | 0 |
| OTHER(HELIUM) | OTHER(HELIUM) | other | 5 | 5 | 0 |
| OTHER(OBSERVATION) | OTHER(OBSERVATION) | other | 5 | 5 | 0 |
| SERVICE | SERVICE | other | 4 | 4 | 0 |
| OTHER(NULL) | OTHER(NULL) | other | 4 | 4 | 0 |
| OTHER(HY) | OTHER(HY) | other | 4 | 4 | 0 |
| OTHER(Input) | OTHER(Input) | other | 4 | 4 | 0 |
| OTHER(TEMP ABD) | OTHER(TEMP ABD) | other | 3 | 3 | 0 |
| OTHER(UNKOWN) | OTHER(UNKOWN), OTHER(unkown) | other | 3 | 3 | 0 |
| OTHER(2OIL) | OTHER(2OIL) | other | 2 | 2 | 0 |
| OTHER(SHUT-IN) | OTHER(SHUT-IN) | other | 1 | 1 | 0 |
| OTHER(1O&1SWD) | OTHER(1O&1SWD) | other | 1 | 1 | 0 |
| OTHER(NHDW) | OTHER(NHDW) | other | 1 | 1 | 0 |
| OTHER(INTAKE) | OTHER(INTAKE) | other | 1 | 1 | 0 |
| OTHER(CORE HOLE) | OTHER(CORE HOLE) | other | 1 | 1 | 0 |
| OTHER(WATER INPUT) | OTHER(WATER INPUT) | other | 1 | 1 | 0 |
| OTHER(WATER SUPPLY) | OTHER(WATER SUPPLY) | other | 1 | 1 | 0 |
| OTHER(738) | OTHER(738) | other | 1 | 1 | 0 |
| OTHER(212) | OTHER(212) | other | 1 | 1 | 0 |
| OTHER(50) | OTHER(50) | other | 1 | 1 | 0 |

## Status (STATUS2)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Plugged and Abandoned | Plugged and Abandoned | - | 245,328 | 245,327 | 0 |
| Producing | Producing | - | 68,148 | 68,148 | 0 |
| (blank) | (blank) | - | 54,774 | 54,725 | 0 |
| Approved Intent to Drill | Approved Intent to Drill | - | 36,528 | 36,528 | 0 |
| Expired Intent to Drill (C-1) | Expired Intent to Drill (C-1) | - | 18,534 | 18,534 | 0 |
| Authorized Injection Well | Authorized Injection Well | - | 15,599 | 15,599 | 0 |
| Inactive Well | Inactive Well | - | 14,976 | 14,976 | 0 |
| Recompleted | Recompleted | - | 13,521 | 13,521 | 0 |
| KCC Fee Fund Plugging | KCC Fee Fund Plugging | - | 12,299 | 12,299 | 0 |
| Converted to EOR Well | Converted to EOR Well | - | 9,498 | 9,498 | 0 |
| ON LIST | ON LIST | - | 6,281 | 6,281 | 0 |
| Well Drilled | Well Drilled | - | 4,977 | 4,977 | 0 |
| Converted to SWD Well | Converted to SWD Well | - | 3,721 | 3,721 | 0 |
| Plugged with Federal Funds | Plugged with Federal Funds | - | 2,736 | 2,736 | 0 |
| Cancelled API Number | Cancelled API Number | - | 2,151 | 2,151 | 0 |
| Federal Plugging Project | Federal Plugging Project | - | 2,130 | 2,130 | 0 |
| Injection Authorization Terminated | Injection Authorization Terminated | - | 2,030 | 2,030 | 0 |
| Approved for Plugging - CP-1 Received | Approved for Plugging - CP-1 Received | - | 1,721 | 1,721 | 0 |
| Converted to Producing Well | Converted to Producing Well | - | 1,678 | 1,678 | 0 |
| Spudded | Spudded | - | 781 | 781 | 0 |
| Injection Well Split to Another Dkt | Injection Well Split to Another Dkt | - | 640 | 640 | 0 |
| Unplugged Former Injection Well | Unplugged Former Injection Well | - | 584 | 584 | 0 |
| UIC Application Dismissed | UIC Application Dismissed | - | 253 | 253 | 0 |
| UIC Application Withdrawn | UIC Application Withdrawn | - | 251 | 251 | 0 |
| Authorized Inj Well Split From Prior Dkt | Authorized Inj Well Split From Prior Dkt | - | 162 | 162 | 0 |
| Re-Plugged (non Fee-Fund) | Re-Plugged (non Fee-Fund) | - | 79 | 79 | 0 |
| Unknown | Unknown | - | 64 | 64 | 0 |
| Expired Plugging Application (CP-1) | Expired Plugging Application (CP-1) | - | 43 | 43 | 0 |
| DEVELOPMENT | DEVELOPMENT | - | 30 | 30 | 0 |
| UIC Application Denied | UIC Application Denied | - | 21 | 21 | 0 |
| Not Confirmed | Not Confirmed | - | 9 | 9 | 0 |
| Pending Injection Application | Pending Injection Application | - | 9 | 9 | 0 |
| Injection Authority Suspended | Injection Authority Suspended | - | 5 | 5 | 0 |
| Injection Authorization Terminated - INACTIVE CODE | Injection Authorization Terminated - INACTIVE CODE | - | 4 | 4 | 0 |
| WILDCAT | WILDCAT | - | 3 | 3 | 0 |

## Fields (43) and blank counts

| field | label in app | blank |
|---|---|---|
| KID | Kid | 0 |
| API_NUMBER | API Number | 41,612 |
| API_NUM_NODASH | API Number Nodash | 41,616 |
| LEASE | Lease | 3,027 |
| WELL | Well | 4,689 |
| FIELD | Field | 147,388 |
| LATITUDE | Latitude | 50 |
| LONGITUDE | Longitude | 50 |
| LONG_LAT_SOURCE | Longitude Latitude Source | 0 |
| TOWNSHIP | Township | 0 |
| TWN_DIR | Twn Dir | 0 |
| RANGE | Range | 0 |
| RANGE_DIR | Range Dir | 0 |
| SECTION | Section | 15 |
| SPOT | Spot | 31,851 |
| FEET_NORTH | Feet North | 125,255 |
| FEET_EAST | Feet East | 125,261 |
| FOOT_REF | Foot Ref | 104,356 |
| ORIG_OPERATOR | Orig Operator | 37,943 |
| CURR_OPERATOR | Curr Operator | 0 |
| ELEVATION | Elevation | 1,674 |
| ELEV_REF | Elev Ref | 1,674 |
| SURFACE_ELEVATION_LIDAR | Surface Elevation Lidar | 9,654 |
| DEPTH | Depth | 70,357 |
| FORMATION_AT_TOTAL_DEPTH | Formation At Total Depth | 295,232 |
| PRODUCE_FORM | Produce Form | 412,859 |
| IP_OIL | Ip Oil | 465,965 |
| IP_GAS | Ip Gas | 501,416 |
| IP_WATER | Ip Water | 491,886 |
| PERMIT | Permit | 311,939 |
| SPUD | Spud | 185,514 |
| COMPLETION | Completion | 167,013 |
| PLUGGING | Plugging | 242,327 |
| MODIFIED | Modified | 597 |
| OIL_KID | Oil Kid | 358,062 |
| OIL_DOR_ID | Oil Dor ID | 367,398 |
| GAS_KID | Gas Kid | 480,941 |
| GAS_DOR_ID | Gas Dor ID | 482,409 |
| KCC_PERMIT | Kcc Permit | 485,059 |
| STATUS | Status | 0 |
| STATUS2 | Status2 | 54,774 |
| COMMENTS | Comments | 447,008 |
| LEASE_WELL_NAME | Lease Well Name | 2,776 |
