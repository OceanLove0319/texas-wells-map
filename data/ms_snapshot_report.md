# Snapshot report - Mississippi State Oil and Gas Board (MSOGB) well data (Mississippi)

Report generated: 2026-10-12 14:23 UTC  
Data date shown in the app: **2026-10-09** (from ../../../../../../../Users/ocean/.claude/projects/tx-wells-map/data/raw/ms/pull_log.jsonl (ms_wells.csv, file_date))  

Pull log:

- `{"name": "ms_wells_download.orig", "url": "https://www.ogb.state.ms.us/Downloads/WellInfoList/20261009_All_WellInfoList.csv", "bytes": 12792863, "last_modified": "Fri, 09 Oct 2026 10:05:03 GMT", "file_date": "2026-10-09", "status": "downloaded", "finished_utc": "2026-10-12T14:06:31Z"}`
- `{"name": "ms_wells_shapefile.zip", "url": "https://www.ogb.state.ms.us/Downloads/WellShapeFiles/20261010_Wells.zip", "bytes": 1099466, "last_modified": "Sat, 10 Oct 2026 11:00:48 GMT", "file_date": "2026-10-10", "status": "downloaded", "finished_utc": "2026-10-12T14:06:33Z"}`
- `{"name": "ms_wells.csv", "from": "ms_wells_download.orig", "rows": 35218, "rows_with_coordinates": 25555, "file_date": "2026-10-09", "status": "normalized", "finished_utc": "2026-10-12T14:23:30Z"}`
- `{"name": "source_count.json", "rows": 35218, "rows_with_coordinates": 25555, "shapefile_points": 25278, "status": "OK", "finished_utc": "2026-10-12T14:23:30Z"}`

## Row count

| what | rows |
|---|---|
| ms_wells.csv (rows in file) | 35,218 |
| wells in the app (meta.json) | 35,218 |
| regulator live count (https://www.ogb.state.ms.us/Downloads/WellInfoList/20261009_All_WellInfoList.csv, 2026-10-12T14:23:30Z) | 35,218 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon Long(NAD83), lat Lat(NAD83); datum NAD83 (per MSOGB column names and the well shapefile .prj).

| what | wells |
|---|---|
| null or 0 | 9,663 |
| invalid (outside -180..180 / -90..90) | 1 |
| valid but outside the Mississippi outline bbox (+0.05 deg) | 0 |
| valid but outside the Mississippi outline (Census, generalized; points on the border can fall just outside) | 7 |
| **on the map: exact** | 25,554 |
| **on the map: exact after repair** (lost decimal point) | 1 |
| **on the map: approximate** (PLSS section / quarter center) | 8,088 |
| **not on the map** | 1,575 |

Why wells without usable coordinates could not be placed:

- missing or invalid township/range/section: 925
- section is ambiguous in the BLM grid: 97
- section not found in the BLM grid: 80
- missing meridian: 473

PLSS grid: data/raw/plss/MS_sections.jsonl, 49,793 sections, 49,712 keys (202 ambiguous, not used).

## API

| raw API length | wells |
|---|---|
| 10 | 35,218 |

Wells with a full API (10 digits starting 23): 35,218; distinct: 34,932; APIs on more than one row: 264; without a full API (not searchable by API): 0

## Type (Type)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| OIL - Production | OIL - Production | oil | 9,518 | 9,263 | 1,248 |
| GAS - Natural Gas - Production | GAS - Natural Gas - Production | gas | 4,775 | 4,671 | 899 |
| DGW - Domestic Gas Well | DGW - Domestic Gas Well | gas | 5 | 5 | 0 |
| SWD - Water Injection - Disposal | SWD - Water Injection - Disposal | injection | 1,548 | 1,515 | 225 |
| EOR - Enhanced Oil Recovery - Injection | EOR - Enhanced Oil Recovery - Injection | injection | 992 | 987 | 9 |
| BDW - Brine Disposal Well | BDW - Brine Disposal Well | injection | 34 | 34 | 0 |
| FD - Fluid Disposal | FD - Fluid Disposal | injection | 15 | 15 | 2 |
| SWD - AG - Water Injection Disposal (Acid Gas) | SWD - AG - Water Injection Disposal (Acid Gas) | injection | 6 | 6 | 0 |
| DH - Dry Hole | DH - Dry Hole | dry | 16,559 | 15,542 | 4,670 |
| EX - Expired Location | EX - Expired Location | other | 1,055 | 898 | 897 |
| MON - Monitor/Observation | MON - Monitor/Observation | other | 253 | 253 | 0 |
| GSR - Gas Storage Reservoir | GSR - Gas Storage Reservoir | other | 135 | 135 | 7 |
| CO2 - Carbon Dioxide - Production | CO2 - Carbon Dioxide - Production | other | 72 | 72 | 19 |
| ST - Stratigraphic | ST - Stratigraphic | other | 48 | 47 | 19 |
| CORE - Core Test | CORE - Core Test | other | 39 | 39 | 33 |
| WS - Water Source | WS - Water Source | other | 37 | 36 | 0 |
| GSC - Gas Storage Cavern | GSC - Gas Storage Cavern | other | 34 | 34 | 3 |
| LPG - Liquefied Petroleum Gas Storage | LPG - Liquefied Petroleum Gas Storage | other | 33 | 33 | 8 |
| DWW - Domestic Water Well | DWW - Domestic Water Well | other | 26 | 24 | 17 |
| GSCH - Gas Storage Cavern for Hydrogen | GSCH - Gas Storage Cavern for Hydrogen | other | 24 | 24 | 24 |
| CA - Permit Canceled | CA - Permit Canceled | other | 8 | 8 | 8 |
| BPM - Brine Producing Well | BPM - Brine Producing Well | other | 1 | 1 | 0 |
| NR - No Type Required | NR - No Type Required | other | 1 | 1 | 0 |

## Status (Status)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| PA - Plugged and Abandoned | PA - Plugged and Abandoned | - | 23,119 | 22,104 | 4,677 |
| EX - Expired Permit | EX - Expired Permit | - | 3,298 | 2,817 | 2,808 |
| PR - Producing | PR - Producing | - | 2,256 | 2,256 | 0 |
| CI - Closed In (Producing Well) | CI - Closed In (Producing Well) | - | 2,194 | 2,194 | 0 |
| OPA - Orphaned P&A | OPA - Orphaned P&A | - | 944 | 935 | 62 |
| AI - Active Injection | AI - Active Injection | - | 933 | 932 | 0 |
| DA - Dry and Abandoned | DA - Dry and Abandoned | - | 549 | 518 | 188 |
| SB - Stand By (Injection Well) | SB - Stand By (Injection Well) | - | 343 | 343 | 0 |
| APA - Appears P&A/No Records | APA - Appears P&A/No Records | - | 339 | 334 | 18 |
| CA - Permit Cancelled | CA - Permit Cancelled | - | 329 | 305 | 303 |
| PAS - Plugged and Abandoned - surveyor inspection | PAS - Plugged and Abandoned - surveyor inspection | - | 255 | 255 | 4 |
| NRR - No Report Required | NRR - No Report Required | - | 220 | 220 | 0 |
| TA - Temporarily Abandoned | TA - Temporarily Abandoned | - | 178 | 178 | 0 |
| AA - Intent to Abandon Approved | AA - Intent to Abandon Approved | - | 62 | 62 | 0 |
| O - Orphaned Well | O - Orphaned Well | - | 44 | 43 | 0 |
| CPLNP - Completed Well (Form 3 Recv'd) Not Producing | CPLNP - Completed Well (Form 3 Recv'd) Not Producing | - | 36 | 36 | 0 |
| APS - Appears P&A/No Records - surveyor inspection | APS - Appears P&A/No Records - surveyor inspection | - | 31 | 31 | 1 |
| DWW Domestic Water Well | DWW Domestic Water Well | - | 24 | 22 | 17 |
| DG - Drilling | DG - Drilling | - | 12 | 12 | 0 |
| PW - Permitted Well to drill or re-enter | PW - Permitted Well to drill or re-enter | - | 15 | 9 | 6 |
| COMNG - Commingled for Production | COMNG - Commingled for Production | - | 8 | 8 | 0 |
| DGW - Domestic Gas Well | DGW - Domestic Gas Well | - | 5 | 5 | 0 |
| JA - Junked and Abandoned | JA - Junked and Abandoned | - | 5 | 5 | 1 |
| PO - Potential Orphan Well | PO - Potential Orphan Well | - | 3 | 3 | 1 |
| AU - Abandoned - Unapproved | AU - Abandoned - Unapproved | - | 3 | 3 | 2 |
| CPL - Completed Wells (Form 3 Recv'd) | CPL - Completed Wells (Form 3 Recv'd) | - | 3 | 3 | 0 |
| AUS - Abandoned - Unapproved Surveyor Inspection | AUS - Abandoned - Unapproved Surveyor Inspection | - | 3 | 3 | 0 |
| LEACH - Leaching (for Salt Cavern Wells) | LEACH - Leaching (for Salt Cavern Wells) | - | 2 | 2 | 0 |
| PWI - Permitted for conversion from Prod to Inj | PWI - Permitted for conversion from Prod to Inj | - | 2 | 2 | 0 |
| PWP - Permitted for conversion from Inj to Prod | PWP - Permitted for conversion from Inj to Prod | - | 2 | 2 | 0 |
| I - Inactive | I - Inactive | - | 1 | 1 | 0 |

## Fields (30) and blank counts

| field | label in app | blank |
|---|---|---|
| API14 | Api14 | 0 |
| API10 | Api10 | 0 |
| Type | Type | 0 |
| Status | Status | 0 |
| Name | Name | 0 |
| Number | Number | 77 |
| OriginalWellName | Originalwellname | 35,101 |
| Oper | Oper | 0 |
| OriginalOperator | Originaloperator | 7,427 |
| Field | Field | 0 |
| County | County | 0 |
| PoolName | Poolname | 23,128 |
| Sec | Sec | 0 |
| Twn | Twn | 0 |
| TwnDir | Twndir | 17 |
| Rng | Rng | 0 |
| RngDir | Rngdir | 22 |
| Lat(NAD83) | Lat(nad83) | 9,663 |
| Long(NAD83) | Long(nad83) | 9,663 |
| DirectURL | Directurl | 0 |
| IsThisA16thSectionLocation | Isthisa16thsectionlocation | 0 |
| WellSlant | Wellslant | 0 |
| BH_Lat(NAD83) | Bottom Hole Lat(nad83) | 34,620 |
| BH_Long(NAD83) | Bottom Hole Long(nad83) | 34,621 |
| DrillersTotalDepth_DTD | Drillerstotaldepth Dtd | 35,218 |
| MeasuredDepth_MD | Measureddepth Md | 20,176 |
| PlugBackMeasuredDepth_PBMD | Plugbackmeasureddepth Pbmd | 29,574 |
| TotalVerticalDepth_TVD | Totalverticaldepth Tvd | 34,690 |
| USDW | Usdw | 30,622 |
| Active | Active | 0 |

## Source notes
- Source: MSOGB daily bulk CSV `Downloads/WellInfoList/20261009_All_WellInfoList.csv` (35,218 rows) plus the small well shapefile `20261010_Wells.zip` (25,278 points, NAD83). Three requests in total (downloads page, CSV, zip); Ocean approved this single download because the site's robots.txt disallows crawlers. Never schedule it.
- Update frequency: every business day (dated file names). Data date shown = the CSV's file date 2026-10-09.
- The served CSV has stray double quotes inside unquoted fields (e.g. `N H AYERS "`), which csv-parse rejects; ms_wells.csv is the same rows re-written with standard quoting (ms_wells_download.orig is the file as served). Row count reconciles 1:1; shapefile points (25,278) vs CSV rows with coordinates (25,555): the shapefile is a different daily build and omits some wells.
- No dates and no operator history in the file. DirectURL opens the MSOGB Online well page.
- Coordinates: 25,555 rows with Lat/Long(NAD83), 9,663 without; 1 row repaired (lost decimal point). All 9,663 have Sec/Twn/Rng but MSOGB gives no meridian and Mississippi has seven (CadNSDI 05, 09 Chickasaw, 10 Choctaw, 16 Huntsville, 18 Louisiana, 25 St. Stephens, 32 Washington). ms_county_meridians.json assigns a meridian to 43 of 77 counties from the wells that have coordinates (>= 90% agreement, >= 10 wells); the rest rely on the grid having the section in exactly one meridian. Counties left unassigned because they straddle meridians: CALHOUN (09:10/10:3), CLAIBORNE (18:10/32:18), COPIAH (10:5/32:42), JASPER (10:1275/25:347), LAWRENCE (25:43/32:40), MARION (25:377/32:274), MONROE (09:308/16:321), SIMPSON (10:215/25:115), SMITH (10:380/25:200).
- Placement check on wells that DO have coordinates (section center, no quarter calls): median 0.64 km, p90 0.99 km, p99 6.4 km; 294 of 22,833 (1.3%) land > 5 km away, i.e. a wrong meridian or section. Treat MS approximate points accordingly.
- Not placed (1,575): 925 missing/invalid TRS (807 of them are irregular sections > 36 in the Natchez-district land claims, which the section-center method cannot handle), 473 missing meridian (county unassigned and the T/R/S exists in several meridians), 97 ambiguous in the BLM grid, 80 section not in the grid.
- Panel text for approximate wells says "meridian 10" etc.: scripts/lib/plss.mjs only names 06/11/17 (shared file, not edited).
- Unverified: contents of `wells_otherfields.zip` and the Well Date List page (not fetched).
