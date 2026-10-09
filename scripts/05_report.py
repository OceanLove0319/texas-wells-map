"""Write data/snapshot_report.md from the pulled files (no network)."""
import json, os, glob, time
import pandas as pd
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = f"{ROOT}/data/raw"
log = [json.loads(l) for l in open(f"{RAW}/pull_log.jsonl")]
W = pd.read_csv(f"{RAW}/wells.csv", dtype={"API": str, "GIS_API5": str, "GIS_WELL_NUMBER": str, "RELIAB": str})
W["API_s"] = W["API"].fillna("").str.strip()
L = []
L.append("# Snapshot report - RRC well data\n")
L.append(f"Report generated: {time.strftime('%Y-%m-%d %H:%M %Z')}  ")
L.append(f"Pull finish times (UTC): " + ", ".join(f"{r['name']} {r['finished_utc']}" for r in log) + "\n")
L.append("## Row counts and reconciliation\n")
L.append("Server returnCountOnly includes exact duplicate rows the service emits (same OBJECTID, same attributes/geometry). Files are deduped on full row content; reconciliation = distinct OBJECTIDs in file vs distinct OBJECTIDs from returnIdsOnly.\n")
L.append("| file | rows in file | distinct OIDs | server count | server distinct OIDs | status | size |")
L.append("|---|---|---|---|---|---|---|")
for r in log:
    p = f"{RAW}/{r['name']}.csv"
    L.append(f"| {r['name']}.csv | {r['rows_written']:,} | {r['distinct_oids']:,} | {r['server_count']:,} | {r['server_distinct_oids']:,} | {r['status']} | {os.path.getsize(p)/1e6:.1f} MB |")
cg = f"{RAW}/counties.geojson"
if os.path.exists(cg):
    n = len(json.load(open(cg))["features"])
    L.append(f"| counties.geojson | {n} | - | 255 | - | {'OK' if n==255 else 'MISMATCH'} | {os.path.getsize(cg)/1e6:.1f} MB |")
tot = sum(os.path.getsize(p) for p in glob.glob(f"{RAW}/*.csv") + glob.glob(f"{RAW}/*.geojson"))
L.append(f"\nTotal size of output files (csv + geojson): {tot/1e6:.1f} MB (excludes data/raw/parts/ checkpoint JSONL).\n")

L.append("## API field quality in wells.csv\n")
lens = W["API_s"].str.len().value_counts().sort_index()
L.append("API string length distribution (8 = full county+unique; shorter = county code only / missing):\n")
L.append("| length | wells |"); L.append("|---|---|")
for k, v in lens.items(): L.append(f"| {k} | {v:,} |")
full = W[W["API_s"].str.fullmatch(r"\d{8}")]
L.append(f"\nWells with a full 8-digit API: {len(full):,}; distinct 8-digit APIs: {full['API_s'].nunique():,}; "
         f"8-digit APIs appearing on >1 well row: {(full['API_s'].value_counts()>1).sum():,}\n")
L.append("Note: RRC API here omits the '42' Texas state prefix. Full 10-digit API = '42' + API.\n")

L.append("## Join coverage (wells.csv API, 8-digit, vs each layer)\n")
L.append("| layer file | rows | distinct 8-digit APIs in layer | layer APIs found in wells | wells rows with a match | 3-digit (county-only) APIs in layer | OBJECTID is wells OBJECTID? (OID-join rows with same API) |")
L.append("|---|---|---|---|---|---|---|")
wapis = set(full["API_s"]); woids = set(W["OBJECTID"])
for r in log:
    if r["name"] == "wells": continue
    D = pd.read_csv(f"{RAW}/{r['name']}.csv", dtype={"API": str})
    a = D["API"].fillna("").str.strip(); a8 = set(a[a.str.fullmatch(r"\d{8}")])
    inw = len(a8 & wapis)
    wm = full["API_s"].isin(a8).sum()
    m = D[["OBJECTID", "API"]].merge(W[["OBJECTID", "API_s"]], on="OBJECTID")
    same = int((m["API"].fillna("").str.strip() == m["API_s"]).sum())
    n3 = int((a.str.len() == 3).sum())
    L.append(f"| {r['name']} | {len(D):,} | {len(a8):,} | {inw:,} ({inw/max(len(a8),1):.2%}) | {wm:,} | {n3:,} | {'yes' if same == len(D) else 'no'} ({same:,} / {len(D):,}) |")

L.append("\n## GIS_SYMBOL_DESCRIPTION (wells.csv)\n")
L.append("| value | wells |"); L.append("|---|---|")
for k, v in W["GIS_SYMBOL_DESCRIPTION"].fillna("<null>").value_counts().items(): L.append(f"| {k} | {v:,} |")

L.append("\n## Coordinates (wells.csv)\n")
def nz(c): return int((W[c].isna() | (W[c] == 0)).sum())
L.append("| column | null or zero |"); L.append("|---|---|")
for c in ["lon_4326", "lat_4326", "GIS_LAT83", "GIS_LONG83", "GIS_LAT27", "GIS_LONG27"]:
    L.append(f"| {c} | {nz(c):,} |")
ok = W.dropna(subset=["lon_4326", "lat_4326"])
oob = ok[~ok["lon_4326"].between(-107, -93) | ~ok["lat_4326"].between(25.5, 37)]
L.append(f"\nGeometry outside a loose Texas bbox (lon -107..-93, lat 25.5..37): {len(oob):,}\n")
d = (ok["lon_4326"] - ok["GIS_LONG83"]).abs().combine((ok["lat_4326"] - ok["GIS_LAT83"]).abs(), max)
L.append(f"Max |geometry(4326) - GIS_LAT83/LONG83| (deg): median {d.median():.2e}, p99 {d.quantile(.99):.2e}, max {d.max():.2e}\n")
L.append(f"Wells where geometry differs from GIS_LAT83/LONG83 by >0.01 deg: {int((d > 0.01).sum()):,}\n")
L.append("## Notes\n")
L.append("- Layer 0 (Well Number) is the same feature class as layer 1 (identical count/fields; a 1,000-row spot check matched exactly) - not pulled separately.")
L.append("- Layer 10 (Horizontal/Directional Lines, 181,153 polylines) has no API field (OBJECTID, QUADNUM, SHAPE.LEN only) - not pulled.")
L.append("- Layers 2-7 reuse the wells OBJECTID, so OBJECTID is an exact alternate join key for them; layers 8-9 have their own OBJECTIDs and must join on API.")
L.append("- 'wells rows with a match' can exceed layer rows because some 8-digit APIs appear on multiple well rows.")
open(f"{ROOT}/data/snapshot_report.md", "w").write("\n".join(L))
print("\n".join(L))
