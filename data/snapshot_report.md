# Snapshot report - RRC well data

Report generated: 2026-10-09 11:07 CDT  
Pull finish times (UTC): commercial_disposal 2026-10-09T15:51:26Z, orphan_wells 2026-10-09T15:51:45Z, injection_disposal 2026-10-09T15:52:27Z, hcts_deeper_15000ft 2026-10-09T15:52:30Z, high_cost_tight_sands 2026-10-09T15:54:16Z, eor_h13_oil_wells 2026-10-09T15:54:43Z, well_logs 2026-10-09T15:57:12Z, horiz_dir_surface_locations 2026-10-09T15:59:03Z, wells 2026-10-09T16:06:49Z

## Row counts and reconciliation

Server returnCountOnly includes exact duplicate rows the service emits (same OBJECTID, same attributes/geometry). Files are deduped on full row content; reconciliation = distinct OBJECTIDs in file vs distinct OBJECTIDs from returnIdsOnly.

| file | rows in file | distinct OIDs | server count | server distinct OIDs | status | size |
|---|---|---|---|---|---|---|
| commercial_disposal.csv | 1,908 | 1,908 | 1,913 | 1,908 | OK | 0.1 MB |
| orphan_wells.csv | 12,239 | 12,239 | 12,239 | 12,239 | OK | 0.7 MB |
| injection_disposal.csv | 46,828 | 46,828 | 47,026 | 46,828 | OK | 2.6 MB |
| hcts_deeper_15000ft.csv | 943 | 943 | 980 | 943 | OK | 0.1 MB |
| high_cost_tight_sands.csv | 98,645 | 98,645 | 102,699 | 98,645 | OK | 5.4 MB |
| eor_h13_oil_wells.csv | 22,656 | 22,656 | 26,191 | 22,656 | OK | 1.2 MB |
| well_logs.csv | 237,913 | 237,913 | 237,913 | 237,913 | OK | 12.9 MB |
| horiz_dir_surface_locations.csv | 171,799 | 171,799 | 171,799 | 171,799 | OK | 28.3 MB |
| wells.csv | 1,397,386 | 1,397,386 | 1,397,386 | 1,397,386 | OK | 239.8 MB |
| counties.geojson | 255 | - | 255 | - | OK | 0.2 MB |

Total size of output files (csv + geojson): 291.3 MB (excludes data/raw/parts/ checkpoint JSONL).

## API field quality in wells.csv

API string length distribution (8 = full county+unique; shorter = county code only / missing):

| length | wells |
|---|---|
| 3 | 362,997 |
| 7 | 3 |
| 8 | 1,034,386 |

Wells with a full 8-digit API: 1,034,386; distinct 8-digit APIs: 1,017,531; 8-digit APIs appearing on >1 well row: 11,604

Note: RRC API here omits the '42' Texas state prefix. Full 10-digit API = '42' + API.

## Join coverage (wells.csv API, 8-digit, vs each layer)

| layer file | rows | distinct 8-digit APIs in layer | layer APIs found in wells | wells rows with a match | 3-digit (county-only) APIs in layer | OBJECTID is wells OBJECTID? (OID-join rows with same API) |
|---|---|---|---|---|---|---|
| commercial_disposal | 1,908 | 1,856 | 1,856 (100.00%) | 1,908 | 0 | yes (1,908 / 1,908) |
| orphan_wells | 12,239 | 12,038 | 12,038 (100.00%) | 12,239 | 0 | yes (12,239 / 12,239) |
| injection_disposal | 46,828 | 46,310 | 46,310 (100.00%) | 46,828 | 0 | yes (46,828 / 46,828) |
| hcts_deeper_15000ft | 943 | 853 | 853 (100.00%) | 943 | 0 | yes (943 / 943) |
| high_cost_tight_sands | 98,645 | 95,444 | 95,444 (100.00%) | 98,645 | 0 | yes (98,645 / 98,645) |
| eor_h13_oil_wells | 22,656 | 21,434 | 21,434 (100.00%) | 22,656 | 0 | yes (22,656 / 22,656) |
| well_logs | 237,913 | 162,990 | 162,990 (100.00%) | 167,128 | 0 | no (0 / 237,913) |
| horiz_dir_surface_locations | 171,799 | 171,045 | 171,024 (99.99%) | 187,775 | 743 | no (0 / 171,799) |

## GIS_SYMBOL_DESCRIPTION (wells.csv)

| value | wells |
|---|---|
| Plugged Oil Well | 333,006 |
| Oil Well | 315,774 |
| Dry Hole | 295,093 |
| Gas Well | 126,333 |
| Permitted Location | 114,062 |
| Plugged Gas Well | 68,419 |
| Canceled / Abandoned Location | 44,587 |
| Injection / Disposal from Oil | 24,941 |
| Plugged Oil / Gas | 23,492 |
| Oil/Gas Well | 23,241 |
| Injection / Disposal | 15,619 |
| Shut-In Oil | 5,831 |
| Shut-In Gas | 2,096 |
| Water Supply Well | 809 |
| Core Test | 763 |
| Injection / Disposal from Gas | 697 |
| Storage Well | 648 |
| Injection / Disposal from Oil/Gas | 613 |
| Water Supply from Oil | 385 |
| Observation from Oil | 197 |
| Observation Well | 150 |
| Observation from Oil / Gas | 114 |
| Storage from Gas | 105 |
| Brine Mining | 101 |
| Storage from Oil | 39 |
| Plugged Storage | 37 |
| Storage from Oil/Gas | 33 |
| Water Supply from Gas | 28 |
| Service | 27 |
| Water Supply from Oil/Gas | 26 |
| Plugged Brine Mining | 24 |
| Observation from Gas | 21 |
| Plugged Storage/Brine Mining | 15 |
| Injection/Disposal from Storage | 14 |
| Sulfur Core Test | 8 |
| Horizontal Drainhole | 4 |
| Injection/Disposal from Brine Mining | 4 |
| Injection/Disposal from Storage/Oil | 4 |
| Geothermal Well | 3 |
| Injection/Disposal from Storage/Gas | 3 |
| Storage/Brine Mining | 3 |
| Injection/Disposal from Storage/Brine Mining | 2 |
| Service from Oil | 2 |
| Observation from Storage | 2 |
| Observation from Storage/Gas | 2 |
| Plugged Storage/Gas | 2 |
| Observation from Storage/Brine Mining | 1 |
| Service from Oil / Gas | 1 |
| Service from Gas | 1 |
| Injection/Disposal from Brine Mining / Gas | 1 |
| Plugged Storage/Oil | 1 |
| Service from Storage/Gas | 1 |
| Plugged Storage/Brine Mining / Oil | 1 |

## Coordinates (wells.csv)

| column | null or zero |
|---|---|
| lon_4326 | 0 |
| lat_4326 | 0 |
| GIS_LAT83 | 0 |
| GIS_LONG83 | 0 |
| GIS_LAT27 | 0 |
| GIS_LONG27 | 0 |

Geometry outside a loose Texas bbox (lon -107..-93, lat 25.5..37): 0

Max |geometry(4326) - GIS_LAT83/LONG83| (deg): median 1.87e-05, p99 3.37e-04, max 6.41e+00

Wells where geometry differs from GIS_LAT83/LONG83 by >0.01 deg: 88

## Notes

- Layer 0 (Well Number) is the same feature class as layer 1 (identical count/fields; a 1,000-row spot check matched exactly) - not pulled separately.
- Layer 10 (Horizontal/Directional Lines, 181,153 polylines) has no API field (OBJECTID, QUADNUM, SHAPE.LEN only) - not pulled.
- Layers 2-7 reuse the wells OBJECTID, so OBJECTID is an exact alternate join key for them; layers 8-9 have their own OBJECTIDs and must join on API.
- 'wells rows with a match' can exceed layer rows because some 8-digit APIs appear on multiple well rows.