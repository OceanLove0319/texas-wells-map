# RRC Public Viewer MapServer - layer summary

Service: https://gis.rrc.texas.gov/server/rest/services/rrc_public/RRC_Public_Viewer_Srvs/MapServer  
currentVersion: 11.3, layers: 41, maxRecordCount: 1000  
Counts are returnCountOnly at metadata fetch time (includes server-side duplicate rows where present).

| id | name | geometry | count | API join field | notes |
|---|---|---|---|---|---|
| 0 | Well Number | Point | 1397386 | API (String(8)), GIS_API5 (String(5)) | Duplicate of layer 1 (same fields, same count) - label/well-number rendering of the same features. Not pulled separately. |
| 1 | Well Locations | Point | 1397386 | API (String(8)), GIS_API5 (String(5)) | PULLED -> data/raw/wells.csv. API = 8-digit string (3-digit county code + 5-digit unique no., no '42' state prefix); GIS_API5 = 5-digit unique no. only. |
| 2 | Orphan Wells | Point | 12239 | API (String(8)) | PULLED -> data/raw/orphan_wells.csv. API 8-digit. OBJECTID values fall in layer-1 OBJECTID range. |
| 3 | Commercial Disposal | Point | 1913 | API (String(8)) | PULLED -> data/raw/commercial_disposal.csv. API 8-digit. |
| 4 | Injection/Disposal | Point | 47026 | API (String(8)) | PULLED -> data/raw/injection_disposal.csv. API 8-digit. |
| 5 | HCTS Deeper than 15,000 ft. | Point | 980 | API (String(8)) | PULLED -> data/raw/hcts_deeper_15000ft.csv. API 8-digit. |
| 6 | High Cost Tight Sands | Point | 102699 | API (String(8)) | PULLED -> data/raw/high_cost_tight_sands.csv. API 8-digit. |
| 7 | EOR H13 Oil Wells | Point | 26191 | API (String(8)) | PULLED -> data/raw/eor_h13_oil_wells.csv. API 8-digit. |
| 8 | Well Logs | Point | 237913 | API (String(8)) | PULLED -> data/raw/well_logs.csv. API 8-digit. |
| 9 | Horiz/Dir Surface Locations | Point | 171799 | API (String(8)) | PULLED -> data/raw/horiz_dir_surface_locations.csv. API 8-digit. |
| 10 | Horizontal/Directional Lines | Polyline | 181153 | - | NOT pulled: well-related but has no API field (only OBJECTID, QUADNUM, SHAPE.LEN) - cannot join to wells. |
| 11 | LPGAS Sites | Point | 79274 | - |  |
| 12 | QPipelines | Polyline | 489706 | - |  |
| 13 | Pipelines | Polyline | 489706 | - |  |
| 14 | Pipelines | Polyline | 56863 | - |  |
| 15 | Bay Tracts | Polygon | 3016 | - |  |
| 16 | Offshore Areas | Polygon | 23 | - |  |
| 17 | Offshore Tracts | Polygon | 3750 | - |  |
| 18 | Water Lines | Polyline | 1051 | - |  |
| 19 | Subdivision Labels | Point | 260136 | - |  |
| 20 | Subdivisions | Polyline | 638215 | - |  |
| 21 | Railroads | Polyline | 689 | - |  |
| 22 | Survey Abstract Labels | Point | 309916 | - |  |
| 23 | Survey Labels | Point | 473600 | - |  |
| 24 | Surveys | Polygon | 311195 | - |  |
| 25 | Quads | Polygon | 5976 | - |  |
| 26 | Alert Areas | Polygon | 7 | - |  |
| 27 | Water | Polygon | 6915 | - |  |
| 28 | City Limits | Polygon | 1217 | - |  |
| 29 | Counties | Polygon | 255 | - | PULLED (basemap) -> data/raw/counties.geojson, maxAllowableOffset=0.005, outSR 4326. |
| 30 | District Offices | Multipoint | 9 | - |  |
| 31 | Districts | Polygon | 12 | - |  |
| 32 | Water Labels | Polyline | 23777 | - |  |
| 33 | Operator Cleanup Program Sites | Point | 3432 | - |  |
| 34 | Voluntary Cleanup Program Sites | Point | 186 | - |  |
| 35 | Brownfield Response Program Sites | Point | 42 | - |  |
| 36 | Commercial Waste Disposal Sites | Point | 88 | - |  |
| 37 | Discharge Permits | Point | 0 | - |  |
| 38 | AED Districts | Polygon | 12 | - |  |
| 39 | PS Regions | Polygon | 7 | - |  |
| 40 | Places | Point | 115924 | - |  |

## Field lists

**0 - Well Number**: UNIQID (Integer), API (String/8), GIS_API5 (String/5), GIS_WELL_NUMBER (String/6), SYMNUM (SmallInteger), GIS_SYMBOL_DESCRIPTION (String/50), RELIAB (String/2), GIS_LOCATION_SOURCE (String/80), GIS_LAT27 (Double), GIS_LONG27 (Double), GIS_LAT83 (Double), GIS_LONG83 (Double), OBJECTID (OID), SHAPE (Geometry)

**1 - Well Locations**: UNIQID (Integer), API (String/8), GIS_API5 (String/5), GIS_WELL_NUMBER (String/6), SYMNUM (SmallInteger), GIS_SYMBOL_DESCRIPTION (String/50), RELIAB (String/2), GIS_LOCATION_SOURCE (String/80), GIS_LAT27 (Double), GIS_LONG27 (Double), GIS_LAT83 (Double), GIS_LONG83 (Double), OBJECTID (OID), SHAPE (Geometry)

**2 - Orphan Wells**: OBJECTID (OID), API (String/8), SHAPE (Geometry)

**3 - Commercial Disposal**: OBJECTID (OID), API (String/8), SHAPE (Geometry)

**4 - Injection/Disposal**: OBJECTID (OID), API (String/8), SHAPE (Geometry)

**5 - HCTS Deeper than 15,000 ft.**: OBJECTID (OID), API (String/8), SHAPE (Geometry)

**6 - High Cost Tight Sands**: OBJECTID (OID), API (String/8), SHAPE (Geometry)

**7 - EOR H13 Oil Wells**: OBJECTID (OID), API (String/8), SHAPE (Geometry)

**8 - Well Logs**: API (String/8), OBJECTID (OID), SHAPE (Geometry)

**9 - Horiz/Dir Surface Locations**: API (String/8), GIS_SYMBOL_DESCRIPTION (String/50), GIS_LOCATION_SOURCE (String/80), GIS_LAT27 (Double), GIS_LONG27 (Double), GIS_LAT83 (Double), GIS_LONG83 (Double), OBJECTID (OID), SHAPE (Geometry)

**10 - Horizontal/Directional Lines**: OBJECTID (OID), QUADNUM (String/7), SHAPE (Geometry), SHAPE.LEN (Double)

**11 - LPGAS Sites**: INSTALL_ID (String/30), NAME (String/50), DESCR (String/60), CONTACT (String/60), PH_NUMBER (String/15), NEAR_CITY (String/28), LOCATION (String/320), ZIPCODE (String/5), CITY_FLAG (String/1), LONGITUDE (String/14), NEWLONG (Double), LATITUDE (String/20), NEWLAT (Double), INSP_STATUS (String/12), OBJECTID (OID), SHAPE (Geometry)

**12 - QPipelines**: OPERATOR (String/40), CONTACT_PHONE_NUMBER (String/10), COMMODITY_DESCRIPTION (String/40), SYSTEM_NAME (String/40), SUBSYSTEM_NAME (String/40), DIAMETER (Double), T4PERMIT (String/5), T4PERMIT_MILES (Double), COMMODITY (String/30), INTERSTATE (String/3), SYSTEM_TYPE (String/40), STATUS (String/10), COUNTY_FIPS (String/3), SHAPE (Geometry), OBJECTID (OID), COUNTY_NAME (String/14), SHAPE.LEN (Double), P5_NUM (String/6)

**13 - Pipelines**: OPERATOR (String/40), CONTACT_PHONE_NUMBER (String/10), COMMODITY_DESCRIPTION (String/40), SYSTEM_NAME (String/40), SUBSYSTEM_NAME (String/40), DIAMETER (Double), T4PERMIT (String/5), T4PERMIT_MILES (Double), COMMODITY (String/30), INTERSTATE (String/3), SYSTEM_TYPE (String/40), STATUS (String/10), COUNTY_FIPS (String/3), SHAPE (Geometry), OBJECTID (OID), COUNTY_NAME (String/14), SHAPE.LEN (Double), P5_NUM (String/6)

**14 - Pipelines**: OPERATOR (String/40), CONTACT_PHONE_NUMBER (String/10), COMMODITY_DESCRIPTION (String/40), SYSTEM_NAME (String/40), SUBSYSTEM_NAME (String/40), DIAMETER (Double), T4PERMIT (String/5), T4PERMIT_MILES (Double), COMMODITY (String/30), INTERSTATE (String/3), SYSTEM_TYPE (String/40), STATUS (String/10), COUNTY_FIPS (String/3), SHAPE (Geometry), OBJECTID (OID), SHAPE.LEN (Double), COUNTY_NAME (String/14), P5_NUM (String/6)

**15 - Bay Tracts**: BAY_NAME (String/32), TRACT_NUMBER (String/6), SHAPE (Geometry), OBJECTID (OID), SHAPE.AREA (Double), SHAPE.LEN (Double)

**16 - Offshore Areas**: FIPS (String/3), AREA_NAME (String/50), SHAPE (Geometry), OBJECTID (OID), SHAPE.AREA (Double)

**17 - Offshore Tracts**: TRACT_ID (String/9), FIPS (String/3), TRACT_NUMBER (String/6), SHAPE (Geometry), OBJECTID (OID), SHAPE.AREA (Double), SHAPE.LEN (Double)

**18 - Water Lines**: QUAD15M (String/6), SHAPE (Geometry), OBJECTID (OID), SHAPE.LEN (Double)

**19 - Subdivision Labels**: OBJECTID (OID), TEXTSTRING (String/255), FONTNAME (String/255), FONTSIZE (Double), ANGLE (Double), JUST (String/2), NAME (String/60), ID (Integer), SYMBOL (Integer), SHAPE (Geometry), QUAD15M (String/6)

**20 - Subdivisions**: QUAD15M (String/6), LTYPE (SmallInteger), SHAPE (Geometry), OBJECTID (OID), SHAPE.LEN (Double)

**21 - Railroads**: QUAD15M (String/6), SHAPE (Geometry), OBJECTID (OID), SHAPE.LEN (Double)

**22 - Survey Abstract Labels**: OBJECTID (OID), SYMBOLID (Integer), TEXTSTRING (String/255), FONTNAME (String/255), FONTSIZE (Double), ANGLE (Double), JUST (String/2), NAME (String/10), ID (Integer), SYMBOL (Integer), SHAPE (Geometry)

**23 - Survey Labels**: NAME (String/40), SHAPE (Geometry), OBJECTID (OID), TEXTSTRING (String/255), FONTNAME (String/255), FONTSIZE (Double), ANGLE (Double), JUST (String/2), ID (Integer), SYMBOL (Integer)

**24 - Surveys**: ABSTRACT_NUMBER (String/12), LEVEL1_SURVEY_NAME (String/32), LEVEL2_BLOCK_NUMBER (String/10), LEVEL3_SURVEY_NUMBER (String/8), LEVEL4_SURVEY_NAME (String/32), ABSTRACT_LABEL (String/11), OBJECTID (OID), SCRAP_FILE (String/9), SHAPE (Geometry), SHAPE.AREA (Double), SHAPE.LEN (Double)

**25 - Quads**: QUAD_NUMBER (String/7), QUAD_NAME (String/32), SHAPE (Geometry), OBJECTID (OID), SHAPE.AREA (Double), SHAPE.LEN (Double)

**26 - Alert Areas**: CATEGORY (String/25), ALERTHEADING (String/20), AREA_NAME (String/50), DATE_CREATED (Date), RESTRICTION_TYPE (String/20), RESTRICTION_SOURCE (String/20), COMMENTS (String/300), SHAPE (Geometry), OBJECTID (OID), SHAPE.AREA (Double), SHAPE.LEN (Double), URL (String/70)

**27 - Water**: LW_CODE (String/1), SHAPE (Geometry), OBJECTID (OID), SHAPE.AREA (Double), SHAPE.LEN (Double)

**28 - City Limits**: OBJECTID (OID), PLACENS (String/8), GEOID (String/7), NAMELSAD (String/100), CLASSFP (String/2), FUNCSTAT (String/1), ALAND (Double), AWATER (Double), INTPTLAT (String/11), INTPTLON (String/12), CITY_NAME (String/50), SHAPE (Geometry), SHAPE.AREA (Double), SHAPE.LEN (Double)

**29 - Counties**: FIPS (String/3), COUNTY_NAME (String/14), SHAPE (Geometry), OBJECTID (OID), SHAPE.AREA (Double), SHAPE.LEN (Double)

**30 - District Offices**: NAME (String/25), OBJECTID (OID), SHAPE (Geometry)

**31 - Districts**: DISTRICT (String/2), SHAPE (Geometry), OBJECTID (OID), SHAPE.AREA (Double), SHAPE.LEN (Double)

**32 - Water Labels**: WATER_NAME (String/30), LTYPE (SmallInteger), QUAD15M (String/6), SHAPE (Geometry), OBJECTID (OID), SHAPE.LEN (Double)

**33 - Operator Cleanup Program Sites**: SITE_NAME (String/60), LATITUDE (Double), LONGITUDE (Double), COUNTY (String/40), DISTRICT (String/2), STATUS (String/12), OCP_ID (Integer), SHAPE (Geometry), OBJECTID (OID)

**34 - Voluntary Cleanup Program Sites**: OBJECTID (OID), SITENUM (Integer), TYPE (String/255), STATUS (String/255), DISTRICT (String/255), COUNTY (String/255), SITENAME (String/255), SITESIZE (Double), LATITUDE (Double), LONGITUDE (Double), DATUM (String/255), CLTYPE (String/255), SHAPE (Geometry), COC (String/255)

**35 - Brownfield Response Program Sites**: OBJECTID (OID), SITENUM (Integer), TYPE (String/255), STATUS (String/255), DISTRICT (String/255), COUNTY (String/255), SITENAME (String/255), SITESIZE (Double), LATITUDE (Double), LONGITUDE (Double), DATUM (String/255), CLTYPE (String/255), SHAPE (Geometry), COC (String/255)

**36 - Commercial Waste Disposal Sites**: OBJECTID (OID), OPERATOR_NAME (String/60), LEASE_OR_FACILITY_NAME (String/60), PERMIT_NO (String/60), PERMIT_TYPE (String/60), DISCHARGE_TYPE (String/60), PERMIT_EXPIRATION (String/60), LATITUDE (Double), LONGITUDE (Double), RRC_DISTRICT_OFFICE (String/2), COUNTY (String/40), PERMIT_URL (String/1073741822), SHAPE (Geometry)

**37 - Discharge Permits**: OBJECTID (OID), OPERATOR_NAME (String/60), LEASE_OR_FACILITY_NAME (String/60), PERMIT_NO (String/60), PERMIT_TYPE (String/60), DISCHARGE_TYPE (String/60), PERMIT_EXPIRATION (String/60), OUTFALL_NO (Double), LATITUDE (Double), LONGITUDE (Double), RRC_DISTRICT_OFFICE (String/2), COUNTY (String/40), NPDES_PERMIT_NO (String/60), DISCHARGE_VOLUME (String/60), SURFACE_WATER_DISCHARGE_TO (String/60), PERMIT_URL (String/1073741822), SHAPE (Geometry), DISCHARGE_TO_COASTAL_WATERS (String/60)

**38 - AED Districts**: OBJECTID (OID), DISTRICT (String/2), CITY (String/20), STREET (String/30), PHONE (String/12), SHAPE (Geometry), SHAPE.AREA (Double), SHAPE.LEN (Double)

**39 - PS Regions**: OBJECTID (OID), REGION (String/2), STREET (String/30), CITY (String/20), PHONE (String/12), SHAPE (Geometry), SHAPE.AREA (Double), SHAPE.LEN (Double), ZIP_CODE (String/10), REGION_CITY (String/20)

**40 - Places**: OBJECTID (OID), FEATURE_ID (String/254), FEATURE_NA (String/254), FEATURE_CL (String/254), STATE_ALPH (String/254), STATE_NUME (String/254), COUNTY_NAM (String/254), COUNTY_NUM (String/254), PRIMARY_LA (String/254), PRIM_LONG_ (String/254), PRIM_LAT_D (Double), PRIM_LONG1 (Double), SOURCE_LAT (String/254), SOURCE_LON (String/254), SOURCE_L_1 (String/254), SOURCE_L_2 (String/254), ELEV_IN_M (String/254), ELEV_IN_FT (String/254), MAP_NAME (String/254), DATE_CREAT (String/254), DATE_EDITE (String/254), SHAPE (Geometry)
