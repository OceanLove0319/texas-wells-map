"""Pull point layers completely via OBJECTID keyset paging (where OBJECTID > last ORDER BY OBJECTID).
Resumable: appends pages to data/raw/parts/<name>.jsonl and stores last OID in data/raw/parts/<name>.ckpt.
Usage: python -I scripts/02_pull.py <layer_id>:<name> [...]
At the end writes data/raw/<name>.csv and verifies row count == returnCountOnly."""
import csv, json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
from common import BASE, get, Blocked

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARTS = f"{ROOT}/data/raw/parts"
os.makedirs(PARTS, exist_ok=True)

def pull(lid, name):
    meta = get(f"{BASE}/{lid}")
    fields = [f["name"] for f in meta["fields"] if f["type"] != "esriFieldTypeGeometry"]
    expected = get(f"{BASE}/{lid}/query", {"where": "1=1", "returnCountOnly": "true"})["count"]
    jl, ck = f"{PARTS}/{name}.jsonl", f"{PARTS}/{name}.ckpt"
    last = int(open(ck).read()) if os.path.exists(ck) else 0
    if last == 0 and os.path.exists(jl):
        os.remove(jl)
    print(f"[{name}] layer {lid} expected={expected} resume_from_oid={last}", flush=True)
    t0 = time.time(); pages = 0
    while True:
        r = get(f"{BASE}/{lid}/query", {"where": f"OBJECTID>={last}", "outFields": "*", "outSR": 4326,
                "orderByFields": "OBJECTID ASC", "resultRecordCount": 1000, "returnGeometry": "true"})
        feats = r.get("features", [])
        # >= so a duplicate-OID group split across a page boundary is not lost; rows are deduped on full content later
        if not feats or max(ft["attributes"]["OBJECTID"] for ft in feats) <= last:
            with open(jl, "a") as f:
                for ft in feats:
                    a = ft["attributes"]; g = ft.get("geometry") or {}
                    a["_x"] = g.get("x"); a["_y"] = g.get("y")
                    f.write(json.dumps(a) + "\n")
            break
        with open(jl, "a") as f:
            for ft in feats:
                a = ft["attributes"]; g = ft.get("geometry") or {}
                a["_x"] = g.get("x"); a["_y"] = g.get("y")
                f.write(json.dumps(a) + "\n")
        last = max(ft["attributes"]["OBJECTID"] for ft in feats)
        with open(ck + ".tmp", "w") as f: f.write(str(last))
        os.replace(ck + ".tmp", ck)
        pages += 1
        if pages % 50 == 0:
            print(f"[{name}] pages={pages} last_oid={last} elapsed={time.time()-t0:.0f}s", flush=True)
    # The service returns some exact duplicate rows (same OBJECTID, same attributes+geometry).
    # Dedupe on full row content; reconcile distinct OIDs against returnIdsOnly.
    seen = set(); rows = []
    for line in open(jl):
        a = json.loads(line)
        k = json.dumps(a, sort_keys=True)
        if k not in seen:
            seen.add(k); rows.append(a)
    rows.sort(key=lambda a: a["OBJECTID"])
    ids = get(f"{BASE}/{lid}/query", {"where": "1=1", "returnIdsOnly": "true"}, timeout=600)["objectIds"]
    server_distinct_oids = len(set(ids))
    distinct_oids = len({a["OBJECTID"] for a in rows})
    out = f"{ROOT}/data/raw/{name}.csv"
    cols = fields + ["lon_4326", "lat_4326"]
    with open(out, "w", newline="") as f:
        w = csv.writer(f); w.writerow(cols)
        for a in rows:
            w.writerow([a.get(c) for c in fields] + [a["_x"], a["_y"]])
    status = "OK" if distinct_oids == server_distinct_oids else "MISMATCH"
    print(f"[{name}] DONE rows_written={len(rows)} distinct_oids={distinct_oids} server_count={expected} "
          f"server_ids={len(ids)} server_distinct_oids={server_distinct_oids} {status} -> {out}", flush=True)
    with open(f"{ROOT}/data/raw/pull_log.jsonl", "a") as f:
        f.write(json.dumps({"layer": lid, "name": name, "rows_written": len(rows), "distinct_oids": distinct_oids, "server_count": expected,
                            "server_ids": len(ids), "server_distinct_oids": server_distinct_oids,
                            "status": status, "finished_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}) + "\n")

if __name__ == "__main__":
    try:
        for arg in sys.argv[1:]:
            lid, name = arg.split(":")
            pull(int(lid), name)
    except Blocked as e:
        print(f"BLOCKED - stopping: {e}", flush=True); sys.exit(2)
