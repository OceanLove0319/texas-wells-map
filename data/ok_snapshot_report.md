# Snapshot report - Oklahoma Corporation Commission (OCC) well data

Report generated: 2026-10-09 13:43 CDT  
Pull log (UTC): orphan_funds_wells.csv 2026-10-09T18:41:39Z, comp_wells.csv 2026-10-09T18:41:51Z, rbdms-wells.csv 2026-10-09T18:41:21Z

Sources: rbdms-wells.csv (OCC nightly file, one download), FeatureServer Hosted/RBDMS_ORPHAN_FUNDS_WELLS, Hosted/COMP_WELLS, US Census TIGERweb counties (state 40).

## Row counts

| file | rows | server count | status | size |
|---|---|---|---|---|
| rbdms-wells.csv | 457,138 | - | downloaded | 126.9 MB |
| orphan_funds_wells.csv | 18,136 | 18,136 | OK | 5.6 MB |
| comp_wells.csv | 9,466 | 9,466 | OK | 7.4 MB |
| ok_counties.geojson | 77 | 77 | OK | - |

## Locations

Wells with null or 0 SH_LAT/SH_LON (not drawn on the map): **14,707**  
Wells with a location (mapped): **442,431**

Mapped wells outside a loose Oklahoma bbox (lat 33.5..37.1, lon -103.1..-94.3): 22

## API

| API length | wells |
|---|---|
| 10 | 457,138 |

10-digit APIs starting with 35: 457,138; distinct: 457,136; APIs on more than one row: 2

## Null / blank counts per field (rbdms-wells.csv)

| field | blank |
|---|---|
| API | 0 |
| WELL_RECORDS_DOCS | 0 |
| WELL_NAME | 6 |
| WELL_NUM | 5 |
| OPERATOR | 0 |
| WELLSTATUS | 13 |
| WELLTYPE | 73 |
| SYMBOL_CLASS | 0 |
| SH_LAT | 14,707 |
| SH_LON | 14,707 |
| COUNTY | 1,459 |
| SECTION | 1,000 |
| TOWNSHIP | 1,000 |
| RANGE | 1,003 |
| QTR4 | 296,125 |
| QTR3 | 78,501 |
| QTR2 | 24,420 |
| QTR1 | 1,584 |
| PM | 1,575 |
| FOOTAGE_EW | 8,457 |
| EW | 107,851 |
| FOOTAGE_NS | 8,349 |
| NS | 107,774 |

## Join coverage (on API)

| layer | join field | rows | distinct APIs | APIs found in rbdms-wells | rows matched |
|---|---|---|---|---|---|
| orphan_funds_wells.csv | api | 18,136 | 18,136 | 18,136 | 18,136 |
| comp_wells.csv | api_number | 9,466 | 2,613 | 2,613 | 9,466 |

## WELLSTATUS

| code | description | wells | mapped |
|---|---|---|---|
| PA | Plugged and Abandoned--wells which have a plugging report or were plugged before records were kept | 247,597 | 238,933 |
| AC | Active--open wellbores (not plugged) | 129,384 | 127,929 |
| NE | No Evidence--Field Inspectors have investigated and did not find a well at the location reported | unclear if plugged or location was innacurate | 45,495 | 42,809 |
| OR | Orphaned Wells--wells with no known or viable Operator | 18,139 | 18,071 |
| EX | Expired Permit--expired prior to drilling operations | 5,350 | 3,887 |
| STFD | State Fund--wells on list to be plugged with State Funds | 2,835 | 2,817 |
| SIFORDER | Wells shut in by Final Order | 1,373 | 1,366 |
| TA | Temporarily Abandoned--wells not plugged but inactive | 1,320 | 1,309 |
| PAFF | Plugged and Abandoned--wells plugged with Federal Funds | 1,125 | 1,124 |
| PASF | Plugged and Abandoned--wells plugged with State Funds | 1,081 | 1,032 |
| TM | Terminated--legacy status used for UIC wells which had authorization revoked currently not plugged | 1,002 | 991 |
| ND | New Drill--newly drilled wells | often missing completion report | 880 | 618 |
| SFFO | State Funds--wells with Final Orders | 715 | 715 |
| SP | Spudded Wells--wells with a spud report but no completion report | probably drilled out | 544 | 539 |
| PASURSF | Plugged and Abandoned--wells plugged with Surety and State Funds | 106 | 103 |
| PASUR | Plugged and Abandoned--wells plugged with Surety Funds | 88 | 88 |
| ACRT | Active--UIC open wellbores which have been red tagged b/c of compliance issues | 70 | 69 |
| SFAW | State Funds--wells with Award Letters | 21 | 21 |
| (blank) | Unknown--Mostly new wells or wells without a completion report | 13 | 10 |

## WELLTYPE

| code | description | wells | mapped |
|---|---|---|---|
| OIL | Oil production well | 180,785 | 174,701 |
| NT | No type--unknown old well likely without a completion report and/or other documents | 86,302 | 80,899 |
| DRY | Dry Hole | 84,903 | 83,053 |
| GAS | Gas production well | 74,556 | 73,987 |
| TM | Terminated UIC well--voluntary or mandatory revocation of UIC authorization | 8,894 | 8,653 |
| 2RIn | Enhanced Recovery UIC injection well | 7,330 | 7,160 |
| 2DNC | Non-Commercial UIC disposal well | 3,475 | 3,471 |
| INJ | Legacy UIC well type | 3,129 | 3,082 |
| OG | Oil/Gas production well | 1,842 | 1,780 |
| SWD | Legacy UIC well type | 1,573 | 1,558 |
| WSW | Water Supply Well--water well used for variety of purposes | may not be fresh | 1,539 | 1,452 |
| STFD | Legacy State Funds well--wellstatus now used to capture this | 672 | 565 |
| 2DCm | Commerical UIC disposal well | 386 | 386 |
| GSW | Natural Gas (refined) Storage well | 328 | 328 |
| P&A | Legacy plugged and abandoned well--wellstatus now used to capture this | 272 | 272 |
| SW | Service Well--used for pressure maintenance-stratigraphic test holes-etc | 265 | 258 |
| TA | Legacy temporarily abandoned well--wellstatus now used to capture this | 236 | 234 |
| 2D | Legacy UIC well type | 178 | 171 |
| 2R | Legacy UIC well type | 148 | 130 |
| (blank) | Unknown--well type or information missing may not be drilled | 73 | 48 |
| DUC | (not in data dictionary) | 62 | 61 |
| 2RSI | UIC Simultaneous Injection well--also produces oil and/or gas to surface | 61 | 59 |
| PA | Legacy plugged and abandoned well--wellstatus now used to capture this | 31 | 26 |
| LPSW | LPG storage well | 27 | 27 |
| OBS | Obervation well for Gas Storage facility | 14 | 14 |
| ND | Legacy No documents | 14 | 14 |
| 2RIN | (not in data dictionary) | 12 | 12 |
| WIW | Legacy UIC well type | 11 | 11 |
| SCO | (not in data dictionary) | 9 | 8 |
| 2EPA | (not in data dictionary) | 8 | 8 |
| Gas | (not in data dictionary) | 1 | 1 |
| Oil | (not in data dictionary) | 1 | 1 |
| IEPA | Enhanced Recovery EPA Injection Well (Federal) | 1 | 1 |
