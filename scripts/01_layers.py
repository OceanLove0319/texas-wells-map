"""Step 1: fetch service + layer metadata, record counts; write data/layers_summary.md + data/layers_meta.json."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import BASE, get

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
svc = get(BASE)
json.dump(svc, open(f"{ROOT}/data/raw/service.json", "w"), indent=1)
layers = svc.get("layers", []) + svc.get("tables", [])
meta = {}
API_PAT = re.compile(r"API", re.I)
for L in layers:
    lid = L["id"]
    m = get(f"{BASE}/{lid}")
    cnt = None
    if m.get("type") in ("Feature Layer", "Table"):
        try:
            cnt = get(f"{BASE}/{lid}/query", {"where": "1=1", "returnCountOnly": "true"}).get("count")
        except Exception as e:
            cnt = f"ERR {e}"
    m["_count"] = cnt
    meta[lid] = m
    print(lid, m.get("name"), m.get("type"), m.get("geometryType"), cnt, flush=True)
json.dump(meta, open(f"{ROOT}/data/layers_meta.json", "w"), indent=1)
