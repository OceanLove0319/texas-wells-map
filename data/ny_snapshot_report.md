# Snapshot report - New York State Department of Environmental Conservation (DEC), Division of Mineral Resources well data (New York)

Report generated: 2026-10-12 14:59 UTC  
Data date shown in the app: **2026-10-11** (from data/raw/ny/pull_log.jsonl (wellspublic.csv, zip_entry_date))  

Pull log:

- `{"name": "wellDOS.zip", "url": "https://extapps.dec.ny.gov/fs/data/wellDOS.zip", "bytes": 3135507, "last_modified": "Sun, 11 Oct 2026 23:50:52 GMT", "status": "downloaded", "finished_utc": "2026-10-12T13:59:00Z", "note": "downloaded once during source verification and moved here"}`
- `{"name": "OilandGasMetadata.html", "from": "wellDOS.zip", "bytes": 25549, "zip_entry_date": "2023-10-31", "status": "extracted", "finished_utc": "2026-10-12T14:05:09Z"}`
- `{"name": "wellspublic.csv", "from": "wellDOS.zip", "bytes": 29865267, "zip_entry_date": "2026-10-11", "status": "extracted", "finished_utc": "2026-10-12T14:05:09Z"}`
- `{"name": "source_count.json", "service": "https://data.ny.gov/resource/szye-wmt3.json", "server_count": 47471, "status": "OK", "finished_utc": "2026-10-12T14:05:10Z"}`

## Row count

| what | rows |
|---|---|
| wellspublic.csv (rows in file) | 47,471 |
| wells in the app (meta.json) | 47,471 |
| regulator live count (https://data.ny.gov/resource/szye-wmt3.json (Socrata copy of the same DEC database, $select=count(*)), 2026-10-12T14:05:10Z) | 47,471 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon Surface_Longitude, lat Surface_latitude; datum decimal degrees, datum not stated by DEC (expected within 100 m of the well; Location_Verified = GPS-checked).

| what | wells |
|---|---|
| null or 0 | 1,085 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the New York outline bbox (+0.05 deg) | 0 |
| valid but outside the New York outline (Census, generalized; points on the border can fall just outside) | 47 |
| **on the map: exact** | 46,386 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 1,085 |

Why wells without usable coordinates could not be placed:

- state has no PLSS: 1,085

## API

| raw API length | wells |
|---|---|
| 14 | 47,471 |

Wells with a full API (10 digits starting 31): 47,471; distinct: 46,550; APIs on more than one row: 784; without a full API (not searchable by API): 0

## Type (Well_Type)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil Development (OD) | OD | oil | 17,921 | 17,877 | 0 |
| Oil Well (OW) | OW | oil | 177 | 175 | 0 |
| Oil Extension (OE) | OE | oil | 13 | 13 | 0 |
| Gas Development (GD) | GD | gas | 10,061 | 10,021 | 0 |
| Gas Well (GW) | GW | gas | 657 | 636 | 0 |
| Gas Extension (GE) | GE | gas | 326 | 326 | 0 |
| Enhanced Oil Recovery - Injection (IW) | IW | injection | 4,509 | 4,501 | 0 |
| Disposal (DS) | DS | injection | 32 | 32 | 0 |
| Dry Wildcat (DW) | DW | dry | 1,695 | 1,654 | 0 |
| Dry Hole (DH) | DH | dry | 1,140 | 1,135 | 0 |
| Not Listed (NL) | NL | other | 8,499 | 7,586 | 0 |
| Storage (ST) | ST | other | 974 | 973 | 0 |
| Brine (BR) | BR | other | 765 | 759 | 0 |
| Stratigraphic (SG) | SG | other | 326 | 322 | 0 |
| Monitoring Storage (MS) | MS | other | 148 | 148 | 0 |
| Geothermal (TH) | TH | other | 147 | 147 | 0 |
| Monitoring Miscellaneous (MM) | MM | other | 35 | 35 | 0 |
| Well Type Is Currently Confidential (Confidential) | Confidential | other | 26 | 26 | 0 |
| Liquefied Petroleum Gas Storage (LP) | LP | other | 14 | 14 | 0 |
| Monitoring Brine (MB) | MB | other | 6 | 6 | 0 |

## Status (Well_Status)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Plugged and Abandoned (PA) | PA | - | 20,584 | 20,128 | 0 |
| Active (AC) | AC | - | 11,709 | 11,708 | 0 |
| Unknown Located (UL) | UL | - | 3,575 | 3,574 | 0 |
| Inactive (IN) | IN | - | 2,519 | 2,517 | 0 |
| Expired Permit (EX) | EX | - | 2,288 | 2,255 | 0 |
| Unknown Not Found (UM) | UM | - | 2,378 | 2,249 | 0 |
| Unknown (UN) | UN | - | 2,012 | 1,984 | 0 |
| Not Reported on AWR (NR) | NR | - | 651 | 651 | 0 |
| Refunded Fee (RE) | RE | - | 329 | 299 | 0 |
| Transferred Permit (TR) | TR | - | 209 | 209 | 0 |
| Cancelled (CA) | CA | - | 209 | 203 | 0 |
| Plugged Back Multilateral (PM) | PM | - | 179 | 179 | 0 |
| Voided Permit (VP) | VP | - | 497 | 101 | 0 |
| Drilling Completed (DC) | DC | - | 100 | 100 | 0 |
| Converted to Other Well Type (CO) | CO | - | 52 | 52 | 0 |
| Shut-In (SI) | SI | - | 49 | 49 | 0 |
| Plugged Back (PB) | PB | - | 39 | 39 | 0 |
| Confidential (code not in data dictionary) | Confidential | - | 24 | 24 | 0 |
| Permit Issued (PI) | PI | - | 21 | 21 | 0 |
| Released - Water Well (RW) | RW | - | 16 | 13 | 0 |
| Drilled Deeper (DD) | DD | - | 13 | 13 | 0 |
| Application Received to Drill/Plug/Convert (AR) | AR | - | 10 | 10 | 0 |
| Drilling in Progress (DG) | DG | - | 7 | 7 | 0 |
| Temporarily Abandoned (TA) | TA | - | 1 | 1 | 0 |

## Fields (55) and blank counts

| field | label in app | blank |
|---|---|---|
| API_WellNo | API Wellno | 0 |
| Cnty | Cnty | 0 |
| Hole | Hole | 0 |
| SideTrck | Sidetrck | 0 |
| Completion | Completion | 0 |
| Well_Name | Well Name | 3 |
| Company_name | Company Name | 6 |
| Operator_number | Operator Number | 0 |
| Well_Type | Well Type | 0 |
| Map_Symbol | Map Symbol | 0 |
| Well_Status | Well Status | 0 |
| Date_Status | Date Status | 20,594 |
| Date_Permit_Application | Date Permit Application | 29,078 |
| Permit_Issued | Permit Issued | 29,146 |
| Date_Spudded | Date Spudded | 27,278 |
| Date_Total_Depth | Date Total Depth | 30,626 |
| Date_Well_Completed | Date Well Completed | 24,789 |
| Date_well_plugged | Date Well Plugged | 29,578 |
| Date_well_confidential | Date Well Confidential | 39,882 |
| confid | Confid | 84 |
| town | Town | 25 |
| quad | Quad | 944 |
| quadsec | Quadsec | 870 |
| Producing_name | Producing Name | 8 |
| Producing_formation | Producing Formation | 6 |
| Financial_security | Financial Security | 6 |
| Slant | Slant | 23 |
| County | County | 25 |
| Region | Region | 10 |
| State_lease | State Lease | 116 |
| Proposed_depth | Proposed Depth | 3,613 |
| Surface_location | Surface Location | 6 |
| Surface_Longitude | Surface Longitude | 76 |
| Surface_latitude | Surface Latitude | 76 |
| Bottom_hole_location | Bottom Hole Location | 6 |
| Bottom_hole_longitude | Bottom Hole Longitude | 203 |
| Bottom_hole_latitude | Bottom Hole Latitude | 203 |
| True_vertical_depth | True Vertical Depth | 6 |
| Measured_depth | Measured Depth | 6 |
| Kickoff | Kickoff | 6 |
| DrilledDepth | Drilleddepth | 6 |
| Elevation | Elevation | 21,875 |
| Original_well_type | Original Well Type | 6 |
| Permit_Fee | Permit Fee | 90 |
| Objective_formation | Objective Formation | 6 |
| Depth_Fee | Depth Fee | 6 |
| Spacing | Spacing | 41,765 |
| Spacing_Acres | Spacing Acres | 45,922 |
| Integration | Integration | 42,436 |
| Dt_Hearing | Dt Hearing | 47,184 |
| Dt_Mod | Dt Mod | 811 |
| LINK | Link | 0 |
| Location_Verified | Location Verified | 6 |
| GeneralWellType | Generalwelltype | 0 |
| GeneralWellStatus | Generalwellstatus | 0 |

## Pull notes (NY)

- Source: DEC `wellDOS.zip` (nightly Mon-Fri; downloaded once on 2026-10-12, Last-Modified 2026-10-11 23:50 UTC) -> `wellspublic.csv` (data date 2026-10-11) + `OilandGasMetadata.html`, from which `ny_codes.json` (Well_Type, Well_Status, Map_Symbol, confid, State_lease, Integration) is parsed. The Socrata copy (data.ny.gov szye-wmt3) was used only for the row count.
- Scope: "Oil, Gas, and Other Regulated Wells" - includes storage, brine (solution salt), stratigraphic, geothermal, disposal and monitoring wells; `GeneralWellType` says which. Confidential wells are plotted with redacted attributes.
- Coordinates: `Surface_Longitude`/`Surface_latitude` (decimal degrees, datum not stated by DEC; "expected within 100 meters", `Location_Verified` = GPS-checked). Bottom-hole coordinates, TVD/MD and `LINK` (DEC well record) are in the row.
- Not on the map (1,085): rows with no surface coordinates at the source - by status Plugged and Abandoned 456, Voided Permit 396, Unknown Not Found 129, Expired Permit 33, Refunded Fee 30, Unknown 28, other 13; by general type Other Well 511, Not Drilled 465, Gas Well 56, Oil Well 42.
- Update cadence: nightly (Monday-Friday) per the metadata page.
