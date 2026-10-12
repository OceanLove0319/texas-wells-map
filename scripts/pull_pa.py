"""Pennsylvania DEP (eMapPA) one-time snapshot -> data/raw/pa/.

Polite by design: one sequential request at a time (well under the 2-concurrent limit), ~0.5 s sleep
between requests, retry with backoff, files that already exist are not downloaded again. No recurring pulls.

  1. parts/layer54.csv, parts/layer53.csv  (eMapPA_External_Extraction MapServer layers 54 "Conventional Wells"
                                            and 53 "Unconventional Wells", every attribute, keyset-paged on OBJECTID,
                                            geometry returned as WGS84 lon/lat)
  2. pa_wells.csv                           (union of both layers + API (37 + PERMIT_NUMBER digits), WELL_CLASS
                                            Conventional/Unconventional, SOURCE_LAYER, lon_4326/lat_4326)
  3. source_count.json                      (live returnCountOnly of both layers, for row-count reconciliation)
  4. pa_counties.geojson                    (US Census TIGERweb counties for state FIPS 42, simplified)

Usage: python3 -I scripts/pull_pa.py
"""
import csv, datetime, json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "pa")
PARTS = os.path.join(OUT, "parts")
SVC = "https://gis.dep.pa.gov/depgisprd/rest/services/emappa/eMapPA_External_Extraction/MapServer"
LAYERS = [(54, "Conventional"), (53, "Unconventional")]
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 0.5
EPOCH = datetime.datetime(1970, 1, 1, tzinfo=datetime.timezone.utc)
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get(url, params=None, binary=False, retries=5, timeout=300):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                data = r.read()
            time.sleep(SLEEP)
            if binary:
                return data
            j = json.loads(data)
            if isinstance(j, dict) and j.get("error"):
                raise RuntimeError(f"server error {j['error']}")
            return j
        except Exception as e:
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 6 * attempt)
    raise RuntimeError(f"failed (stopping, do not hammer the server): {url}")


def log(rec):
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")


def iso(ms):
    try:
        return (EPOCH + datetime.timedelta(milliseconds=ms)).strftime("%Y-%m-%d")
    except Exception:
        return ms


def pull_layer(layer_id, out_path):
    """All features of one layer -> CSV (every attribute + lon_4326/lat_4326). Returns (rows, server_count)."""
    base = f"{SVC}/{layer_id}"
    meta = get(base, {"f": "json"})
    json.dump(meta, open(os.path.join(OUT, f"layer{layer_id}_meta.json"), "w"), indent=1)
    fields = [f["name"] for f in meta["fields"] if f["type"] != "esriFieldTypeGeometry"]
    date_fields = {f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeDate"}
    oid = meta.get("objectIdField") or next(f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeOID")
    page = int(meta.get("maxRecordCount") or 1000)
    count = get(f"{base}/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    if os.path.exists(out_path):
        print(f"[skip] {os.path.relpath(out_path, ROOT)} exists")
        return count
    print(f"[layer] {layer_id} {meta.get('name')}: {count} records, {len(fields)} fields, page {page}")
    n, last = 0, -1
    with open(out_path + ".part", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(fields + ["lon_4326", "lat_4326"])
        while True:  # keyset paging on the object id, one request at a time
            j = get(f"{base}/query", {"where": f"{oid} > {last}", "outFields": "*", "orderByFields": f"{oid} ASC",
                                      "resultRecordCount": page, "returnGeometry": "true", "outSR": 4326, "f": "json"})
            feats = j.get("features", [])
            if not feats:
                break
            for ft in feats:
                a = ft["attributes"]
                for k in date_fields:
                    if a.get(k) is not None:
                        a[k] = iso(a[k])
                g = ft.get("geometry") or {}
                w.writerow([a.get(k) for k in fields] + [g.get("x"), g.get("y")])
            n += len(feats)
            last = feats[-1]["attributes"][oid]
            if n % (page * 20) == 0 or len(feats) < page:
                print(f"  {n}/{count}")
    os.replace(out_path + ".part", out_path)
    log({"name": os.path.basename(out_path), "service": base, "layer": layer_id, "rows": n, "server_count": count,
         "status": "OK" if n == count else "MISMATCH", "finished_utc": now()})
    print(f"  wrote {os.path.relpath(out_path, ROOT)}: {n} rows ({'OK' if n == count else 'MISMATCH'})")
    return count


def union(counts):
    out = os.path.join(OUT, "pa_wells.csv")
    if os.path.exists(out):
        print("[skip] pa_wells.csv exists")
        return
    n, bad_api = 0, 0
    with open(out + ".part", "w", newline="") as fo:
        w = None
        for layer_id, cls in LAYERS:
            with open(os.path.join(PARTS, f"layer{layer_id}.csv"), newline="") as fi:
                r = csv.reader(fi)
                header = next(r)
                if w is None:
                    w = csv.writer(fo)
                    w.writerow(["API", "WELL_CLASS", "SOURCE_LAYER"] + header)
                ip = header.index("PERMIT_NUMBER")
                for rec in r:
                    d = re.sub(r"\D", "", rec[ip] or "")
                    api = "37" + d if len(d) == 8 else ""  # PERMIT_NUMBER "083-02072" = county + unique; 37 = PA
                    if not api:
                        bad_api += 1
                    w.writerow([api, cls, layer_id] + rec)
                    n += 1
    os.replace(out + ".part", out)
    log({"name": "pa_wells.csv", "from": [f"parts/layer{l}.csv" for l, _ in LAYERS], "rows": n,
         "rows_without_8_digit_permit_number": bad_api, "server_count": sum(counts.values()), "status": "OK",
         "finished_utc": now()})
    print(f"[union] pa_wells.csv: {n} rows ({bad_api} without an 8-digit PERMIT_NUMBER)")


def write_count(counts):
    p = os.path.join(OUT, "source_count.json")
    json.dump({"service": SVC + " layers 54 (Conventional) + 53 (Unconventional)", "count": sum(counts.values()),
               "per_layer": counts, "fetched_utc": now()}, open(p, "w"), indent=1)
    print(f"[count] eMapPA: {sum(counts.values()):,} wells {counts}")


def pull_counties():
    p = os.path.join(OUT, "pa_counties.geojson")
    if os.path.exists(p):
        print("[skip] pa_counties.geojson exists")
        return
    gj = get(TIGER, {"where": "STATE='42'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                     "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    json.dump(gj, open(p, "w"))
    print(f"[counties] {len(gj['features'])} Pennsylvania counties")


if __name__ == "__main__":
    os.makedirs(PARTS, exist_ok=True)
    counts = {}
    for layer_id, cls in LAYERS:
        counts[f"layer{layer_id}_{cls}"] = pull_layer(layer_id, os.path.join(PARTS, f"layer{layer_id}.csv"))
    write_count(counts)
    union(counts)
    pull_counties()
