# Snapshot report - Montana Board of Oil and Gas Conservation (DNRC BOGC) well data (Montana)

Report generated: 2026-10-12 14:24 UTC  
Data date shown in the app: **2026-10-12** (from ../../../../../../../../Users/ocean/.claude/projects/tx-wells-map/data/raw/mt/pull_log.jsonl (mt_wells.csv))  

Pull log:

- `{"name": "mt_wells.csv", "service": "https://gis.dnrc.mt.gov/arcgis/rest/services/BOG/DataMiner/FeatureServer/11", "rows": 42049, "server_count": 42049, "no_geometry": 0, "status": "OK", "finished_utc": "2026-10-12T14:02:38Z"}`
- `{"name": "mt_counties.geojson", "service": "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query", "rows": 56, "status": "OK", "finished_utc": "2026-10-12T14:02:40Z"}`
- `{"name": "mt_codes.json", "service": "https://gis.dnrc.mt.gov/arcgis/rest/services/BOG/DataMiner/FeatureServer/11", "field": "MapSymbol", "codes": 25, "status": "OK", "finished_utc": "2026-10-12T14:05:58Z"}`

## Row count

| what | rows |
|---|---|
| mt_wells.csv (rows in file) | 42,049 |
| wells in the app (meta.json) | 42,049 |
| regulator live count (https://gis.dnrc.mt.gov/arcgis/rest/services/BOG/DataMiner/FeatureServer/11, 2026-10-12T14:02:02Z) | 42,049 |

Difference live count - file: **0** (the bulk file is a periodic build; the live service is updated nightly).

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326, lat lat_4326; datum WGS84 (service geometry, reprojected by the server from NAD83 / EPSG:4269).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Montana outline bbox (+0.05 deg) | 0 |
| valid but outside the Montana outline (Census, generalized; points on the border can fall just outside) | 37 |
| **on the map: exact** | 42,049 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 14 | 42,049 |

Wells with a full API (10 digits starting 25): 42,049; distinct: 42,048; APIs on more than one row: 1; without a full API (not searchable by API): 0

## Type (MapSymbol)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Producing Oil (OIL) | OIL | oil | 7,211 | 7,211 | 0 |
| Producing Gas (GAS) | GAS | gas | 6,236 | 6,236 | 0 |
| Domestic Gas (DG) | DG | gas | 189 | 189 | 0 |
| Coal Bed Methane (CBM) | CBM | gas | 122 | 122 | 0 |
| P&A Dry Hole (ADH) | ADH | plugged | 15,572 | 15,572 | 0 |
| P&A Oil (AOIL) | AOIL | plugged | 5,237 | 5,237 | 0 |
| P&A Gas (AGAS) | AGAS | plugged | 3,332 | 3,332 | 0 |
| P&A Coal Bed Methane (ACBM) | ACBM | plugged | 993 | 993 | 0 |
| P&A Injection, EOR (AEOR) | AEOR | plugged | 578 | 578 | 0 |
| P&A Injection, Disposal (ASWD) | ASWD | plugged | 162 | 162 | 0 |
| P&A Injection, Indian Lands (AILW) | AILW | plugged | 134 | 134 | 0 |
| P&A Water Source (AWS) | AWS | plugged | 102 | 102 | 0 |
| P&A Gas Storage (AGST) | AGST | plugged | 58 | 58 | 0 |
| P&A Monitor/Observation (AMON) | AMON | plugged | 17 | 17 | 0 |
| AWW (code not in data dictionary) | AWW | plugged | 2 | 2 | 0 |
| Active Injection, EOR (EOR) | EOR | injection | 873 | 873 | 0 |
| Injection, Disposal (SWD) | SWD | injection | 225 | 225 | 0 |
| Completed Injection, Indian Lands (ILW) | ILW | injection | 84 | 84 | 0 |
| DH (code not in data dictionary) | DH | dry | 1 | 1 | 0 |
| Completed Gas Storage (GST) | GST | other | 234 | 234 | 0 |
| Spudded/Permit to Drill (LOC) | LOC | other | 219 | 219 | 0 |
| Stratigraphic Test (ST) | ST | other | 211 | 211 | 0 |
| UN (code not in data dictionary) | UN | other | 86 | 86 | 0 |
| Water Source (WS) | WS | other | 77 | 77 | 0 |
| Domestic Water (WW) | WW | other | 29 | 29 | 0 |
| Expired, Not Released Oil (NONE) | NONE | other | 27 | 27 | 0 |
| DIP (DIP) | DIP | other | 19 | 19 | 0 |
| Completed Monitor/Observation (MON) | MON | other | 18 | 18 | 0 |
| Unknown (blank) | (blank) | other | 1 | 1 | 0 |

## Status (Status)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| P&A - Approved | P&A - Approved | - | 25,289 | 25,289 | 0 |
| Producing | Producing | - | 8,390 | 8,390 | 0 |
| Shut In | Shut In | - | 4,695 | 4,695 | 0 |
| Active Injection | Active Injection | - | 958 | 958 | 0 |
| Water Well, Released | Water Well, Released | - | 612 | 612 | 0 |
| Temporarily Abandoned | Temporarily Abandoned | - | 505 | 505 | 0 |
| Completed | Completed | - | 397 | 397 | 0 |
| Abandoned | Abandoned | - | 266 | 266 | 0 |
| Abandoned - Unapproved | Abandoned - Unapproved | - | 227 | 227 | 0 |
| Unknown | Unknown | - | 198 | 198 | 0 |
| Domestic | Domestic | - | 189 | 189 | 0 |
| Permit to Drill | Permit to Drill | - | 112 | 112 | 0 |
| Spudded | Spudded | - | 103 | 103 | 0 |
| Permitted Injection Well | Permitted Injection Well | - | 62 | 62 | 0 |
| Expired, Not Released | Expired, Not Released | - | 27 | 27 | 0 |
| Revoked Inj. Permit | Revoked Inj. Permit | - | 14 | 14 | 0 |
| Other | Other | - | 2 | 2 | 0 |
| Water Well, Completed | Water Well, Completed | - | 2 | 2 | 0 |
| Not Completed | Not Completed | - | 1 | 1 | 0 |

## Fields (23) and blank counts

| field | label in app | blank |
|---|---|---|
| OBJECTID | Object ID | 0 |
| API_WellNo | API Wellno | 0 |
| CoName | Coname | 0 |
| Well_Nm | Well Nm | 0 |
| Status | Status | 0 |
| Type | Type | 0 |
| MapSymbol | Mapsymbol | 1 |
| Wh_Twpn | Wh Twpn | 0 |
| Wh_Twpd | Wh Twpd | 0 |
| Wh_RngN | Wh Rngn | 0 |
| Wh_RngD | Wh Rngd | 0 |
| Wh_Sec | Wh Sec | 0 |
| Wh_Qtr | Wh Qtr | 113 |
| Completed | Completed | 596 |
| St_FldNo | St Fldno | 16,853 |
| Prod_Field | Prod Field | 16,853 |
| Field_No | Field No. | 0 |
| Reg_Field | Reg Field | 0 |
| DTD | Dtd | 470 |
| DOR_ID | Dor ID | 27,513 |
| GlobalID | Globalid | 0 |
| lon_4326 | Longitude (WGS84) | 0 |
| lat_4326 | Latitude (WGS84) | 0 |

## Source notes (pull agent, 2026-10-12)

- **Source**: Montana DNRC Board of Oil and Gas Conservation, ArcGIS FeatureServer `BOG/DataMiner/11` (Wells)
  (https://gis.dnrc.mt.gov/arcgis/rest/services/BOG/DataMiner/FeatureServer/11). Pulled once with
  `scripts/pull_mt.py`: 22 keyset pages of 2,000, one request at a time, 0.6 s apart, no 403/429.
- **Counts**: service count 42,049 = rows pulled 42,049 = rows in the app. Every row had point geometry: exact
  42,049, repaired 0, approximate 0, unmapped 0. No PLSS grid was pulled or configured.
- **Coordinates**: geometry only (no lat/long attributes on the service), requested with `outSR=4326` (service
  stores EPSG:4269 NAD83). 37 points fall just outside the generalized Census outline, all within about 2 km of the
  state bbox (border wells).
- **Fields**: all 21 attributes plus `lon_4326`/`lat_4326`. `Completed` is a text date (MM/DD/YYYY) as published.
  PLSS columns Wh_Twpn/Wh_Twpd/Wh_RngN/Wh_RngD/Wh_Sec/Wh_Qtr (quarter calls smallest-first, e.g. "SE NW NW").
- **API**: `API_WellNo`, 14 digits, all 42,049 start with 25.
- **Type / status**: legend type = `MapSymbol`, the regulator's own map symbol, labeled with the layer renderer's
  own labels saved to `data/raw/mt/mt_codes.json` (25 codes: ADH "P&A Dry Hole", OIL "Producing Oil", AOIL
  "P&A Oil", LOC "Spudded/Permit to Drill", ...). Three symbols in the data are not in the renderer: UN (86,
  "unknown" -> other), AWW (2, follows the A- = P&A pattern -> plugged), DH (1 -> dry). NONE ("Expired, Not
  Released Oil", 27) is mapped to "Permit / other" rather than oil. Status = `Status` (P&A - Approved 25,289,
  Producing 8,390, Shut In 4,695, ...). The descriptive `Type` column (Dry Hole, Oil, Gas, Injection, EOR, ...) stays
  in the panel.
- **Update frequency**: unknown (OBJECTIDs around 7.36 million suggest the table is reloaded; no cadence published).
  The data date shown is the pull date.
- **Unverified**: terms of use (no robots.txt); well-file / document links (none on this service; a guessed
  DataMiner URL 404'd in the survey, so none were added).
- **Layers**: none. Note for integration: the docs put code dictionaries at `data/<st>_codes.json`; the fragment
  points at `data/raw/mt/mt_codes.json` (gitignored) - move the file and update `codes` if it should be committed.
