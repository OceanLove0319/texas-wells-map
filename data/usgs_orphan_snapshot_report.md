# Snapshot report - USGS Documented Orphaned Well Database (DOWDB) 2026 - OVERLAY, not a state

Report generated: 2026-10-12T14:12:41Z  
Source: ScienceBase item 6aad481a1ba49ba9a487439b (DOI 10.5066/P13FHBYG), "United States Documented Orphaned Well Database 2026"; FeatureServer copy https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/US_Documented_Unplugged_Orphaned_Oil_and_Gas_Well_Dataset/FeatureServer/0  
Publication date: 2026-09-30; state data files dated 2023-12-31 .. 2026-04-13 (data_file_date, per source agency)  
Data date shown in the app (suggested): **2026-09-30** (publication date; the CSV is a one-time release, not a feed)  
Update frequency: irregular releases (2022 initial, 2026 this one; "supersedes" the previous). No API key, no paging needed.  
Licensing / terms (FGDC metadata): access constraints "None.  Please see 'Distribution Info' for details."; use constraints "None.  Users are advised to read the dataset's metadata thoroughly to understand appropriate use and data limitations."  

Pull log:

- `{"name": "sciencebase_item.json", "url": "https://www.sciencebase.gov/catalog/item/6aad481a1ba49ba9a487439b", "title": "United States Documented Orphaned Well Database 2026", "dates": [{"type": "Publication", "dateString": "2026-09-30", "label": "Publication Date"}, {"type": "Start", "dateString": "2023-12-31", "label": ""}, {"type": "End", "dateString": "2026-04-13", "label": ""}], "status": "OK", "finished_utc": "2026-10-12T14:02:38Z"}`
- `{"name": "US_orphaned_wells_2026.csv", "url": "https://www.sciencebase.gov/catalog/file/get/6aad481a1ba49ba9a487439b?name=US_orphaned_wells_2026.csv", "bytes": 28855050, "sciencebase_bytes": 28855050, "sciencebase_date_uploaded": "2026-09-21T18:02:15Z", "content_type": "text/csv", "status": "downloaded", "finished_utc": "2026-10-12T14:02:41Z"}`
- `{"name": "US_orphaned_wells_2026.xml", "url": "https://www.sciencebase.gov/catalog/file/get/6aad481a1ba49ba9a487439b?name=US_orphaned_wells_2026.xml", "bytes": 101617, "sciencebase_bytes": 101617, "sciencebase_date_uploaded": "2026-09-30T19:22:50Z", "content_type": "application/fgdc+xml", "status": "downloaded", "finished_utc": "2026-10-12T14:02:42Z"}`
- `{"name": "source_count.json", "service": "https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/US_Documented_Unplugged_Orphaned_Oil_and_Gas_Well_Dataset/FeatureServer/0", "server_count": 130121, "status": "OK", "finished_utc": "2026-10-12T14:02:44Z"}`

## Row count

| what | rows |
|---|---|
| US_orphaned_wells_2026.csv (rows in file) | 130,121 |
| FeatureServer returnCountOnly (2026-10-12T14:02:44Z) | 130,121 |
| ScienceBase summary says | 130,121 wells in 28 states |
| distinct record_key | 130,121 |
| states present | 28 |

File rows = source count: **yes**

## Coordinates

Columns: lon `longitude`, lat `latitude`; datum NAD83 per the metadata / location_notes (many records say "USGS converted original NAD27 to NAD83").

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| **on the map** | 130,121 |

## Unmapped

- 0 rows without a usable coordinate (no PLSS fallback attempted for the overlay).

## Wells per state, identifier type, and match against the state layers we have

Match = USGS primary_identifier is an API whose first 10 digits equal a canonical API in that state's base file. States without a layer in this repo yet show `-`; rerun `python3 -I scripts/pull_usgs_orphan.py --report` after other states land (add them to STATE_FILES).

| state | USGS rows | identifier types | with 10+ digit API | matched to state layer | match rate (of rows) |
|---|---|---|---|---|---|
| Ohio | 22,759 | API 22,759 | - | - | - |
| Pennsylvania | 21,262 | API 21,262 | - | - | - |
| Oklahoma | 19,981 | API 19,469, (blank) 512 | 19,469 | 19,455 | 97.4% |
| Kentucky | 15,638 | KYPermit 15,638 | - | - | - |
| Texas | 8,998 | API 8,998 | 8,998 | 8,839 | 98.2% |
| New York | 7,600 | API 7,600 | - | - | - |
| Louisiana | 4,978 | API 4,729, (blank) 249 | - | - | - |
| Missouri | 4,816 | API 4,816 | - | - | - |
| Kansas | 4,566 | (blank) 4,566 | 0 | 0 | 0.0% |
| Illinois | 3,986 | API 3,667, ILRefNo 319 | - | - | - |
| West Virginia | 3,789 | API 3,789 | - | - | - |
| New Mexico | 3,366 | API 3,366 | - | - | - |
| California | 2,940 | API 2,940 | - | - | - |
| Colorado | 1,302 | API 1,302 | - | - | - |
| Indiana | 946 | IGSID 946 | - | - | - |
| Tennessee | 895 | API 895 | - | - | - |
| North Dakota | 562 | API 562 | - | - | - |
| Arizona | 460 | API 460 | - | - | - |
| Wyoming | 374 | API 374 | - | - | - |
| Arkansas | 356 | API 356 | - | - | - |
| Michigan | 272 | API 272 | - | - | - |
| Utah | 90 | API 90 | - | - | - |
| Montana | 61 | API 61 | - | - | - |
| Alaska | 44 | API 44 | - | - | - |
| Nebraska | 32 | API 32 | - | - | - |
| Alabama | 31 | API 31 | - | - | - |
| Mississippi | 11 | API 11 | - | - | - |
| Nevada | 6 | API 6 | - | - | - |

Notes: Kansas (4,566), 512 Oklahoma and 249 Louisiana rows carry NO identifier at all (name/number/coords only) and cannot be matched by API. Kentucky uses KYPermit, Indiana IGSID, 319 Illinois rows ILRefNo. Oklahoma rows with API: 19,469; those not matched in OCC RBDMS: 14.

## Type (`type`, raw, top 40) - overlay keeps the raw value; suggested shared category in the last column

| raw type | wells | category guess |
|---|---|---|
| (blank) | 42,825 | other (no rule matched) |
| Oil | 31,247 | oil |
| Gas | 10,786 | gas |
| UNDETERMINED | 6,238 | other (no rule matched) |
| O | 4,763 | other (no rule matched) |
| Oil & Gas | 3,411 | oil |
| NT | 3,316 | other (no rule matched) |
| Not Listed | 3,299 | other (no rule matched) |
| Dry Hole | 1,913 | dry |
| Oil Development | 1,885 | oil |
| Dry | 1,816 | dry |
| DRY HOLE | 1,650 | dry |
| UN | 1,423 | other (no rule matched) |
| TM | 1,299 | other (no rule matched) |
| WI | 1,251 | other (no rule matched) |
| NO PRODUCT SPECIFIED | 1,083 | other (no rule matched) |
| Gas(Convertional Commercial) | 1,056 | gas |
| Stratigraphic Test | 1,046 | other |
| GW | 1,034 | other (no rule matched) |
| Gas Development | 990 | gas |
| SRI | 782 | other (no rule matched) |
| G | 762 | other (no rule matched) |
| Injection | 754 | injection |
| OG | 709 | other (no rule matched) |
| Enhanced Oil Recovery - Injection | 673 | injection |
| Gas(Private Use) | 402 | gas |
| Dry Wildcat | 402 | dry |
| I | 365 | other (no rule matched) |
| DG | 286 | other (no rule matched) |
| Other | 250 | other (no rule matched) |
| OW | 217 | other (no rule matched) |
| SWD | 177 | injection |
| WS | 124 | other (no rule matched) |
| ERI | 123 | other (no rule matched) |
| WSW | 112 | other (no rule matched) |
| Natural Gas Well | 107 | gas |
| S | 106 | other (no rule matched) |
| O&G | 105 | oil |
| Gas Wildcat | 101 | gas |
| Oil Well | 95 | oil |

## Status (`status`, raw, top 40)

| raw status | wells |
|---|---|
| OR | 21,627 |
| (blank) | 20,359 |
| DEP Abandoned List | 14,929 |
| DR | 10,007 |
| Abandoned | 9,284 |
| Orphan Delinquent P-5 > 12 months | 8,998 |
| UN | 8,545 |
| DEP Orphan List | 6,333 |
| ACT 404 ORPHAN WELL-ENG | 4,639 |
| Abandoned Well | 3,789 |
| Inactive: 15 months | 3,366 |
| Unknown Located | 3,334 |
| Appendix A-7: Potentially deserted or deserted | 2,517 |
| Unknown Not Found | 2,251 |
| Unknown | 2,015 |
| unplugged | 1,302 |
| Forfeited | 895 |
| Orphaned | 571 |
| AB = Abandoned (Shut-In > 12 Months) | 562 |
| OP | 523 |
| PR | 523 |
| PA | 519 |
| Appendix A-6: Orphan | 423 |
| Revoked | 416 |
| AOW | 356 |
| ACT 404 ORPHAN WELL-INJECTION AND MINING | 339 |
| Orphan | 272 |
| TA | 249 |
| Gas Orphaned | 210 |
| AC | 202 |
| Oil Orphaned | 160 |
| NF | 145 |
| FR | 109 |
| Orphan-No Responsible Operator | 90 |
| EX | 89 |
| Abandoned Known Location and Verified | 55 |
| RevInj NPaS&FV | 39 |
| AB | 32 |
| CA | 12 |
| Plugged & Abandoned | 9 |

## Source agency (`source`)

| source | wells |
|---|---|
| Ohio Department of Natural Resources | 22,759 |
| Pennsylvania Department of Environmental Protection | 21,262 |
| Oklahoma Corporation Commission Oil and Gas Conservation | 19,292 |
| Kentucky Energy and Environment Cabinet | 15,638 |
| Texas Railroad Commission | 8,998 |
| New York State Department of Environmental Conservation | 7,600 |
| Louisiana Department of Natural Resources | 4,978 |
| Missouri Department of Natural Resources | 4,816 |
| Kansas Corporation Commission | 4,566 |
| Illinois Department of Natural Resources | 3,986 |
| West Virginia Department of Environmental Protection | 3,789 |
| New Mexico Oil Conservation Division | 3,366 |
| Department of Conservation: California Geological Energy Management Division (CalGEM) | 2,940 |
| Colorado Energy & Carbon Management Commission: Orphan Well Program | 1,302 |
| Indiana Department of Natural Resources | 946 |
| Tennessee Department of Environment and Conservation | 895 |
| Oklahoma Commissioners of the Land Office | 689 |
| North Dakota Department of Mineral Resources | 562 |
| ArizonaDepartment of Environmental Quality | 460 |
| Wyoming Oil & Gas Conservation Commission | 374 |
| Arkansas Oil and Gas Commission | 356 |
| Michigan Department of Environment Great Lakes and Energy | 272 |
| Utah Department of Natural Resources | 90 |
| Montana Board of Oil & Gas Conservation | 61 |
| Alaska Oil and Gas Conservation Commission | 44 |
| Nebraska Oil & Gas Conservation Commission | 32 |
| Alabama Oil and Gas Board | 31 |
| Mississippi State Oil and Gas Board | 11 |
| Nevada Division of Minerals | 6 |

## Fields (30) and blank counts

| field | blank |
|---|---|
| record_key | 0 |
| primary_identifier_type | 5,327 |
| primary_identifier | 5,327 |
| secondary_identifier | 120,081 |
| state | 0 |
| county | 0 |
| well_name | 3,135 |
| well_number | 82,763 |
| type | 42,825 |
| status | 20,359 |
| latitude | 0 |
| longitude | 0 |
| principal_meridian | 129,336 |
| township | 129,336 |
| t_dir | 129,336 |
| range | 129,336 |
| r_dir | 129,336 |
| section | 129,337 |
| source | 0 |
| data_file_date | 0 |
| well_info_notes | 111,530 |
| location_notes | 57,444 |
| other_notes | 97,034 |
| surface_owner_fed_dept | 99 |
| surface_fed_agency | 117,752 |
| surface_source | 0 |
| subsurface_owner_fed | 125,287 |
| subsurface_source | 125,287 |
| subsurface_fed_rights | 126,669 |
| subsurface_fed_rights_source | 126,668 |

## Unverified

- The REST API at https://energy.usgs.gov/api/dowdb/v1/wells was not used (CSV is complete); not re-verified here.
- Datum: the metadata says NAD83 for the dataset; per-record original datums vary (see location_notes). Not independently checked.
- Match rates above only cover states whose layer exists in this repo at report time.
