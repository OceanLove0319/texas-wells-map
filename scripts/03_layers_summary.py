"""Write data/layers_summary.md from data/layers_meta.json (no network)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
m = json.load(open(f"{ROOT}/data/layers_meta.json"))
svc = json.load(open(f"{ROOT}/data/raw/service.json"))
API_FIELDS = {"API", "GIS_API5", "API_NUMBER", "API_NO", "APINUM"}
NOTES = {
 "0": "Duplicate of layer 1 (same fields, same count) - label/well-number rendering of the same features. Not pulled separately.",
 "1": "PULLED -> data/raw/wells.csv. API = 8-digit string (3-digit county code + 5-digit unique no., no '42' state prefix); GIS_API5 = 5-digit unique no. only.",
 "2": "PULLED -> data/raw/orphan_wells.csv. API 8-digit. OBJECTID values fall in layer-1 OBJECTID range.",
 "3": "PULLED -> data/raw/commercial_disposal.csv. API 8-digit.",
 "4": "PULLED -> data/raw/injection_disposal.csv. API 8-digit.",
 "5": "PULLED -> data/raw/hcts_deeper_15000ft.csv. API 8-digit.",
 "6": "PULLED -> data/raw/high_cost_tight_sands.csv. API 8-digit.",
 "7": "PULLED -> data/raw/eor_h13_oil_wells.csv. API 8-digit.",
 "8": "PULLED -> data/raw/well_logs.csv. API 8-digit.",
 "9": "PULLED -> data/raw/horiz_dir_surface_locations.csv. API 8-digit.",
 "10": "NOT pulled: well-related but has no API field (only OBJECTID, QUADNUM, SHAPE.LEN) - cannot join to wells.",
 "29": "PULLED (basemap) -> data/raw/counties.geojson, maxAllowableOffset=0.005, outSR 4326.",
}
out = [f"# RRC Public Viewer MapServer - layer summary\n",
       f"Service: https://gis.rrc.texas.gov/server/rest/services/rrc_public/RRC_Public_Viewer_Srvs/MapServer  ",
       f"currentVersion: {svc.get('currentVersion')}, layers: {len(m)}, maxRecordCount: {svc.get('maxRecordCount')}  ",
       f"Counts are returnCountOnly at metadata fetch time (includes server-side duplicate rows where present).\n",
       "| id | name | geometry | count | API join field | notes |", "|---|---|---|---|---|---|"]
for k, v in m.items():
    fs = v.get("fields") or []
    api = [f"{f['name']} (String({f.get('length')}))" for f in fs if f["name"].upper() in API_FIELDS]
    out.append(f"| {k} | {v['name']} | {(v.get('geometryType') or '').replace('esriGeometry','')} | {v['_count']} | {', '.join(api) or '-'} | {NOTES.get(k,'')} |")
out.append("\n## Field lists\n")
for k, v in m.items():
    fs = v.get("fields") or []
    out.append(f"**{k} - {v['name']}**: " + ", ".join(f"{f['name']} ({f['type'].replace('esriFieldType','')}{'/'+str(f['length']) if f.get('length') and f['type']=='esriFieldTypeString' else ''})" for f in fs) + "\n")
open(f"{ROOT}/data/layers_summary.md", "w").write("\n".join(out))
print("ok")
