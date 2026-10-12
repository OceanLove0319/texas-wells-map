# Snapshot report - national county basemap (US Census cartographic boundary counties)

Report generated: 2026-10-12T14:15:46Z  
Source: https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_county_500k.zip (Census Bureau cartographic boundary file, 1:500,000, vintage 2025; shapefile dated 2026-04-10; zip Last-Modified Thu, 23 Apr 2026 13:45:35 GMT)  
Licensing / terms: U.S. Census Bureau public domain (no restrictions; Census asks for attribution). No login, no key.  
Update frequency: one release per year (GENZ<year>); the 2025 vintage was published 2026-04. One-time pull.  

Pull log:

- `{"name": "cb_2025_us_county_500k.zip", "url": "https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_county_500k.zip", "bytes": 11758981, "last_modified": "Thu, 23 Apr 2026 13:45:35 GMT", "status": "downloaded", "finished_utc": "2026-10-12T14:02:59Z"}`
- `{"name": "us_counties.geojson", "from": "cb_2025_us_county_500k.zip", "shp_entry_date": "2026-04-10", "source_records": 3235, "features": 3144, "dropped_by_statefp": {"78": 3, "72": 78, "69": 4, "60": 5, "66": 1}, "tolerance_deg": 0.002, "points_in": 1014167, "points_out": 260182, "bytes": 6087309, "status": "OK", "finished_utc": "2026-10-12T14:03:01Z"}`

## Counts

| what | count |
|---|---|
| records in the Census shapefile (50 states + DC + PR + territories) | 3,235 |
| dropped: territories by STATEFP {'78': 3, '72': 78, '69': 4, '60': 5, '66': 1} (60 AS, 66 GU, 69 MP, 72 PR, 78 VI) | 91 |
| **counties / county-equivalents written (50 states + DC)** | 3,144 |
| states + DC present | 51 |
| vertices before -> after Douglas-Peucker 0.002 deg, 5 decimals | 1,014,167 -> 260,182 |
| file size | 6.09 MB (target under 10 MB: yes) |
| geometry types | {'Polygon': 2969, 'MultiPolygon': 175} |

3,144 is the Census count of counties and county-equivalents for the 50 states + DC (Connecticut is 9 planning regions since 2022; Alaska 30 boroughs / census areas; Virginia independent cities counted as counties).

## Output format (same roles as the per-state files the app reads today)

`properties: { NAME, COUNTY (3-digit county FIPS), GEOID, STATE (2-digit state FIPS), STUSPS, NAMELSAD }`; geometry Polygon / MultiPolygon, WGS84/NAD83 degrees. Config: `counties: { file: 'us_counties.geojson', code: 'COUNTY', name: 'NAME' }` plus a filter on STUSPS (or STATE) per state - see scripts/states/NOTES.md. `build_data.mjs` already strips a trailing " County" from NAME; here NAME has no suffix (NAMELSAD does).

## Like-for-like check against the current per-state county files

| state | current file | counties now | counties in basemap | codes missing in basemap | extra in basemap | current size KB |
|---|---|---|---|---|---|---|
| TX | data/raw/counties.geojson | 255 | 254 | 1 | 0 | 209 |
| OK | data/raw/ok/ok_counties.geojson | 77 | 77 | 0 | 0 | 49 |
| KS | data/raw/ks/ks_counties.geojson | 105 | 105 | 0 | 0 | 34 |

Texas: the RRC county file has 255 features = 254 counties + one `FIPS: 'FED'` / `FEDERAL WATERS` polygon (the RRC's offshore federal-waters area). Census has no such polygon, so the basemap drops it; the BOEM planning-area / protraction outlines in data/raw/boem/ are the offshore replacement. All 254 real county codes match.

## Per-state county counts

| state | counties |
|---|---|
| AK | 30 |
| AL | 67 |
| AR | 75 |
| AZ | 15 |
| CA | 58 |
| CO | 64 |
| CT | 9 |
| DC | 1 |
| DE | 3 |
| FL | 67 |
| GA | 159 |
| HI | 5 |
| IA | 99 |
| ID | 44 |
| IL | 102 |
| IN | 92 |
| KS | 105 |
| KY | 120 |
| LA | 64 |
| MA | 14 |
| MD | 24 |
| ME | 16 |
| MI | 83 |
| MN | 87 |
| MO | 115 |
| MS | 82 |
| MT | 56 |
| NC | 100 |
| ND | 53 |
| NE | 93 |
| NH | 10 |
| NJ | 21 |
| NM | 33 |
| NV | 17 |
| NY | 62 |
| OH | 88 |
| OK | 77 |
| OR | 36 |
| PA | 67 |
| RI | 5 |
| SC | 46 |
| SD | 66 |
| TN | 95 |
| TX | 254 |
| UT | 29 |
| VA | 133 |
| VT | 14 |
| WA | 39 |
| WI | 72 |
| WV | 55 |
| WY | 23 |

## State-boundary layer coverage (data/raw/us_states.geojson, Census TIGERweb)

- Features: 51 (50 states + DC). Alaska: present, MultiPolygon, 5,246 vertices, longitude -179.23 .. 179.86 (crosses the antimeridian: the Aleutians west of 180 are stored as positive longitudes near +179, so a flat Web-Mercator view draws them at the far right edge, not next to the rest of Alaska).
- Offshore planning areas: NOT covered. TIGER state polygons stop at the coast / 3-nautical-mile state-waters line; federal OCS planning areas and protraction blocks are not in it. Optional reference layers were pulled from BOEM instead: data/raw/boem/boem_planning_areas.geojson (19 planning areas: 3 Gulf, 4 Pacific, 12 Alaska; 60 KB) and data/raw/boem/boem_protraction.geojson (400 protraction diagram / leasing map outlines; 269 KB). No Atlantic polygons were pulled.
- The basemap counties are also coast-limited; offshore wells draw over water with no outline unless a BOEM reference layer is enabled.

## Unverified

- Shared edges are simplified per polygon (same as the existing TIGERweb maxAllowableOffset pulls), so hairline gaps/overlaps between neighbours can appear at high zoom. Not measured.
- Hole assignment (21 polygons with holes, mostly Virginia independent cities) relies on first-vertex containment; visually unchecked in the app.
