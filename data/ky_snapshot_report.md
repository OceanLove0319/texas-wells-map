# Snapshot report - Kentucky Geological Survey (KGS) well data (Kentucky)

Report generated: 2026-10-12 14:59 UTC  
Data date shown in the app: **2026-10-09** (from data/raw/ky/pull_log.jsonl (kyog_dd.shp, zip_entry_date))  

Pull log:

- `{"name": "kyog_dd.zip", "url": "https://kgs.uky.edu/ogdata/kyog_dd.zip", "bytes": 16967906, "last_modified": "Fri, 09 Oct 2026 06:37:52 GMT", "status": "downloaded", "finished_utc": "2026-10-12T14:05:19Z"}`
- `{"name": "kyog_dd.shp", "from": "kyog_dd.zip", "bytes": 4540692, "zip_entry_date": "2026-10-09", "status": "extracted", "finished_utc": "2026-10-12T14:05:19Z"}`
- `{"name": "ky_wells.csv", "from": "kyog_dd.zip/kyog_dd.shp", "rows": 162164, "rows_without_geometry": 0, "prj": "GEOGCS[\"GCS_North_American_1983\",DATUM[\"D_North_American_1983\",SPHEROID[\"GRS_1980\",6378137.0,298.257222101]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]]", "dbf_encoding": "UTF-8", "status": "OK", "finished_utc": "2026-10-12T14:05:21Z"}`
- `{"name": "kyog_dd.shp", "from": "kyog_dd.zip", "bytes": 4540692, "zip_entry_date": "2026-10-09", "status": "extracted", "finished_utc": "2026-10-12T14:11:34Z"}`

## Row count

| what | rows |
|---|---|
| ky_wells.csv (rows in file) | 162,164 |
| wells in the app (meta.json) | 162,164 |

File rows = wells in the app: **yes**

## Coordinates

Columns: lon lon_4326 / Rec_Lng83, lat lat_4326 / Rec_Lat83; datum NAD83 (shapefile .prj GCS_North_American_1983; Rec_Lat27/Rec_Lng27 columns carry the NAD27 pair).

| what | wells |
|---|---|
| null or 0 | 0 |
| invalid (outside -180..180 / -90..90) | 0 |
| valid but outside the Kentucky outline bbox (+0.05 deg) | 0 |
| valid but outside the Kentucky outline (Census, generalized; points on the border can fall just outside) | 46 |
| **on the map: exact** | 162,164 |
| **on the map: exact after repair** (lost decimal point) | 0 |
| **on the map: approximate** (PLSS section / quarter center) | 0 |
| **not on the map** | 0 |

## API

| raw API length | wells |
|---|---|
| 0 | 25,883 |
| 13 | 2 |
| 14 | 136,279 |

Wells with a full API (10 digits starting 16): 136,281; distinct: 135,961; APIs on more than one row: 316; without a full API (not searchable by API): 25,883

## Type (Org_Result)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Oil producer (OIL) | OIL | oil | 39,184 | 39,184 | 0 |
| Combined oil & gas producer (O&G) | O&G | oil | 1,075 | 1,075 | 0 |
| Gas producer (GAS) | GAS | gas | 28,188 | 28,188 | 0 |
| Domestic gas (DG) | DG | gas | 645 | 645 | 0 |
| Coalbed methane gas producer (CBM) | CBM | gas | 20 | 20 | 0 |
| Improperly abandoned (IA) | IA | plugged | 491 | 491 | 0 |
| Well known to be abandoned but with no plugging information on file (AB) | AB | plugged | 13 | 13 | 0 |
| Secondary recovery injection (Class II) (SRI) | SRI | injection | 4,937 | 4,937 | 0 |
| Water injection (WI) | WI | injection | 687 | 687 | 0 |
| Salt water disposal (SWD) | SWD | injection | 197 | 197 | 0 |
| Gas injection (GI) | GI | injection | 105 | 105 | 0 |
| Tertiary recovery injection (Class II) (TRI) | TRI | injection | 63 | 63 | 0 |
| Water disposal (WD) | WD | injection | 18 | 18 | 0 |
| Thermal & air injection (TAI) | TAI | injection | 5 | 5 | 0 |
| Enhanced recovery injection (Class II) (ERI) | ERI | injection | 5 | 5 | 0 |
| Steam injection (SI) | SI | injection | 2 | 2 | 0 |
| Air injection (AI) | AI | injection | 2 | 2 | 0 |
| Dry & abandoned (D&A) | D&A | dry | 46,405 | 46,405 | 0 |
| Location (new permit issued or insufficient data) (LOC) | LOC | other | 19,992 | 19,992 | 0 |
| Terminated (permit expired or cancelled) (TRM) | TRM | other | 17,272 | 17,272 | 0 |
| Unknown (blank) | (blank) | other | 1,452 | 1,452 | 0 |
| Gas storage (GS) | GS | other | 811 | 811 | 0 |
| Water supply (WS) | WS | other | 337 | 337 | 0 |
| Observation (OB) | OB | other | 167 | 167 | 0 |
| Temporarily abandoned (TA) | TA | other | 59 | 59 | 0 |
| Water well (WW) | WW | other | 27 | 27 | 0 |
| Cathodic protection (CP) | CP | other | 5 | 5 | 0 |

## Status (Plug_Afdvt)

| legend entry | raw values | category | wells | on map | approximate |
|---|---|---|---|---|---|
| Unknown (blank) | (blank) | - | 100,515 | 100,515 | 0 |
| Plugging affidavit on file (PA) | PA | - | 61,649 | 61,649 | 0 |

## Fields (39) and blank counts

| field | label in app | blank |
|---|---|---|
| uniqueID | Uniqueid | 0 |
| API | API | 25,883 |
| KGS_Recno | Kgs Recno | 0 |
| Letter | Letter | 2 |
| Number | Number | 0 |
| Section | Section | 0 |
| FNS | Fns | 0 |
| NS | N/S | 74 |
| FEW | Few | 0 |
| EW | E/W | 73 |
| Surf_Elev | Surf Elev | 0 |
| USGS_Quad | Usgs Quad | 101 |
| County | County | 0 |
| Org_Farm | Org Farm | 12 |
| Org_Oper | Org Oper | 10 |
| Org_WellNo | Org Wellno | 2,208 |
| measured_d | Measured (decimal) | 0 |
| TVD | Tvd | 0 |
| Tdfm | Tdfm | 1,492 |
| Deepst_Pay | Deepst Pay | 1,780 |
| IOF_IP | Iof Ip | 103,927 |
| Org_WClass | Org Wclass | 1,452 |
| Org_Result | Org Result | 1,452 |
| Cmpl_Date | Cmpl Date | 50,156 |
| Plug_Date | Plug Date | 102,832 |
| Plug_Afdvt | Plug Afdvt | 100,515 |
| Core | Core | 161,381 |
| Cuttings | Cuttings | 147,362 |
| Elog | Elog | 105,637 |
| PlotSymbol | Plotsymbol | 1,452 |
| KGS_Permit | Kgs Permit | 22,147 |
| images | Images | 0 |
| bore_type | Bore Type | 0 |
| Rec_Lat27 | Rec Latitude (NAD27) | 0 |
| Rec_Lng27 | Rec Lng (NAD27) | 0 |
| Rec_Lat83 | Rec Latitude (NAD83) | 0 |
| Rec_Lng83 | Rec Lng (NAD83) | 0 |
| lon_4326 | Longitude (WGS84) | 0 |
| lat_4326 | Latitude (WGS84) | 0 |

## Pull notes (KY)

- Source: KGS `kyog_dd.zip` (zipped shapefile, downloaded once on 2026-10-12; extract date inside the zip 2026-10-09 02:37, 162,164 records per `kyog_info.txt`). The DBF and SHP were read with a pure-Python reader; every DBF attribute is kept and `lon_4326`/`lat_4326` come from the point geometry. `ky_codes.json` is parsed from the shipped `ogwells.htm`.
- Not queried: the KGS REST service (`KYOilGasWells_SZ_OneLayer`, 194,362 rows including unlocated wells per the 2026-10-09 research) - kgs.uky.edu/robots.txt disallows query strings, so no live source count was fetched. The shapefile holds only wells with a computable Carter-coordinate location, by KGS design.
- Datum: NAD83 (`.prj` GCS_North_American_1983, saved as `ky_wells.prj`); `Rec_Lat27`/`Rec_Lng27` carry the NAD27 pair. 1,148 rows have geometry differing from `Rec_Lng83`/`Rec_Lat83` by more than 1e-5 degrees; the geometry is used.
- API: 136,279 rows have a 14-digit API (16...), 2 are 13 digits (malformed), 25,883 are blank - those are not searchable by API; `KGS_Recno` is the stable key.
- Type = `Org_Result` (original completion result: OIL, GAS, D&A, LOC, TRM, SRI, ...), status = `Plug_Afdvt` (PA = plugging affidavit on file). Overrides: AB (abandoned, no plugging record) and IA (improperly abandoned) -> plugged. `PlotSymbol` (KGS generalized symbol) and `Org_WClass` stay in the panel.
- Documents: `images` links the KGS scanned well record.
- Update cadence: the shapefile is rebuilt about weekly (kyog_info.txt history); the download page says monthly.
- Terms: ogwells.htm (2005-2008 copyright) allows redistribution in original form with the documentation; current terms unverified.
