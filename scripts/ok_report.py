"""Oklahoma snapshot report + code dictionary (no network).

Reads data/raw/ok/* (from ok_pull.py) and writes:
  data/raw/ok/ok_snapshot_report.md  (also copied to data/ok_snapshot_report.md, which is committed)
  data/ok_codes.json                 (WELLSTATUS / WELLTYPE code -> description, from the OCC data dictionary)

Usage: python3 -I scripts/ok_report.py
"""
import json, os, shutil, time
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw", "ok")

# ---- code dictionary ----
codes = {}
xl = pd.read_excel(os.path.join(RAW, "rbdms-wells-data-dictionary.xlsx"), sheet_name=None, header=None, dtype=str)
for sheet, df in xl.items():
    head = [str(x) for x in df.iloc[0].tolist()]
    if "Code" not in head[0]:
        continue
    field = head[0].split()[0].upper()  # "Wellstatus Code" -> WELLSTATUS
    m = {}
    for code, desc in df.iloc[1:, :2].itertuples(index=False):
        key = "" if pd.isna(code) else str(code).strip()
        if key not in m and not pd.isna(desc):
            m[key] = str(desc).strip()
    codes[field] = m
json.dump({"source": "OCC rbdms-wells-data-dictionary.xlsx", "fields": codes},
          open(os.path.join(ROOT, "data", "ok_codes.json"), "w"), indent=1)

# ---- report ----
W = pd.read_csv(os.path.join(RAW, "rbdms-wells.csv"), dtype=str, keep_default_na=False)
O = pd.read_csv(os.path.join(RAW, "orphan_funds_wells.csv"), dtype=str, keep_default_na=False)
C = pd.read_csv(os.path.join(RAW, "comp_wells.csv"), dtype=str, keep_default_na=False)
log = [json.loads(l) for l in open(os.path.join(RAW, "pull_log.jsonl"))]


def num(s):
    return pd.to_numeric(s, errors="coerce")


def norm_api(s):
    return s.str.strip().str.replace(r"\.0$", "", regex=True)


W["api_s"] = norm_api(W["API"])
lat, lon = num(W["SH_LAT"]), num(W["SH_LON"])
noloc = lat.isna() | lon.isna() | (lat == 0) | (lon == 0)
L = ["# Snapshot report - Oklahoma Corporation Commission (OCC) well data\n",
     f"Report generated: {time.strftime('%Y-%m-%d %H:%M %Z')}  ",
     "Pull log (UTC): " + ", ".join(f"{r['name']} {r['finished_utc']}" for r in log) + "\n",
     "Sources: rbdms-wells.csv (OCC nightly file, one download), FeatureServer Hosted/RBDMS_ORPHAN_FUNDS_WELLS, "
     "Hosted/COMP_WELLS, US Census TIGERweb counties (state 40).\n",
     "## Row counts\n", "| file | rows | server count | status | size |", "|---|---|---|---|---|"]
L.append(f"| rbdms-wells.csv | {len(W):,} | - | downloaded | {os.path.getsize(os.path.join(RAW, 'rbdms-wells.csv'))/1e6:.1f} MB |")
for r in log:
    if "server_count" in r:
        p = os.path.join(RAW, r["name"])
        L.append(f"| {r['name']} | {r['rows']:,} | {r['server_count']:,} | {r['status']} | {os.path.getsize(p)/1e6:.1f} MB |")
cg = json.load(open(os.path.join(RAW, "ok_counties.geojson")))
L.append(f"| ok_counties.geojson | {len(cg['features'])} | 77 | {'OK' if len(cg['features']) == 77 else 'MISMATCH'} | - |")

L.append("\n## Locations\n")
L.append(f"Wells with null or 0 SH_LAT/SH_LON (not drawn on the map): **{int(noloc.sum()):,}**  ")
L.append(f"Wells with a location (mapped): **{int((~noloc).sum()):,}**\n")
oob = (~noloc) & ~(lat.between(33.5, 37.1) & lon.between(-103.1, -94.3))
L.append(f"Mapped wells outside a loose Oklahoma bbox (lat 33.5..37.1, lon -103.1..-94.3): {int(oob.sum()):,}\n")

L.append("## API\n")
lens = W["api_s"].str.len().value_counts().sort_index()
L.append("| API length | wells |"); L.append("|---|---|")
for k, v in lens.items():
    L.append(f"| {k} | {v:,} |")
ok10 = W["api_s"].str.fullmatch(r"35\d{8}")
L.append(f"\n10-digit APIs starting with 35: {int(ok10.sum()):,}; distinct: {W.loc[ok10, 'api_s'].nunique():,}; "
         f"APIs on more than one row: {int((W.loc[ok10, 'api_s'].value_counts() > 1).sum()):,}\n")

L.append("## Null / blank counts per field (rbdms-wells.csv)\n")
L.append("| field | blank |"); L.append("|---|---|")
for c in [c for c in W.columns if c != "api_s"]:
    L.append(f"| {c} | {int((W[c].str.strip() == '').sum()):,} |")

L.append("\n## Join coverage (on API)\n")
L.append("| layer | join field | rows | distinct APIs | APIs found in rbdms-wells | rows matched |")
L.append("|---|---|---|---|---|---|")
wapi = set(W.loc[ok10, "api_s"])
for name, df in [("orphan_funds_wells.csv", O), ("comp_wells.csv", C)]:
    jf = next(c for c in df.columns if c.lower() in ("api", "api_number", "api_no"))
    a = norm_api(df[jf])
    found = a.isin(wapi)
    L.append(f"| {name} | {jf} | {len(df):,} | {a.nunique():,} | {len(set(a) & wapi):,} | {int(found.sum()):,} |")

for field in ("WELLSTATUS", "WELLTYPE"):
    L.append(f"\n## {field}\n")
    L.append("| code | description | wells | mapped |"); L.append("|---|---|---|---|")
    vc = W[field].str.strip().value_counts()
    mapped = W.loc[~noloc, field].str.strip().value_counts()
    for k, v in vc.items():
        d = codes.get(field, {}).get(k, "(not in data dictionary)")
        L.append(f"| {k or '(blank)'} | {d} | {v:,} | {int(mapped.get(k, 0)):,} |")

out = os.path.join(RAW, "ok_snapshot_report.md")
open(out, "w").write("\n".join(L) + "\n")
shutil.copy(out, os.path.join(ROOT, "data", "ok_snapshot_report.md"))
print("\n".join(L[:30]))
