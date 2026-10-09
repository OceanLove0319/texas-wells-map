"""Oklahoma Corporation Commission (OCC) one-time snapshot -> data/raw/ok/.

Polite by design: one sequential request at a time (well under the 2-concurrent limit), a sleep
between requests, and files that already exist are not downloaded again.

  1. rbdms-wells.csv              (OCC nightly well file, ONE download)
  2. rbdms-wells-data-dictionary.xlsx (code -> label for wellstatus / welltype)
  3. orphan_funds_wells.csv       (FeatureServer Hosted/RBDMS_ORPHAN_FUNDS_WELLS, all attributes)
  4. comp_wells.csv               (FeatureServer Hosted/COMP_WELLS, all attributes)
  5. ok_counties.geojson          (US Census TIGERweb counties for state FIPS 40, simplified)

Usage: python3 -I scripts/ok_pull.py
"""
import csv, datetime, json, os, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "ok")
DAM = "https://oklahoma.gov/content/dam/ok/en/occ/documents/og/ogdatafiles"
FS = "https://gis.occ.ok.gov/server/rest/services/Hosted"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 1.0


def get(url, params=None, binary=False, retries=5):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=300) as r:
                data = r.read()
            time.sleep(SLEEP)
            return data if binary else json.loads(data)
        except Exception as e:  # network hiccup: back off and retry
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 5 * attempt)
    raise RuntimeError(f"failed: {url}")


def download(name):
    path = os.path.join(OUT, name)
    if os.path.exists(path) and os.path.getsize(path) > 0:
        print(f"[skip] {name} exists ({os.path.getsize(path)/1e6:.1f} MB)")
        return
    print(f"[download] {name}")
    data = get(f"{DAM}/{name}", binary=True)
    with open(path + ".part", "wb") as f:
        f.write(data)
    os.replace(path + ".part", path)
    print(f"  {len(data)/1e6:.1f} MB")


def pull_feature_layer(service, out_name):
    path = os.path.join(OUT, out_name)
    if os.path.exists(path):
        print(f"[skip] {out_name} exists")
        return
    svc = get(f"{FS}/{service}/FeatureServer", {"f": "json"})
    layer_id = svc["layers"][0]["id"]
    base = f"{FS}/{service}/FeatureServer/{layer_id}"
    meta = get(base, {"f": "json"})
    fields = [f["name"] for f in meta["fields"]]
    date_fields = {f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeDate"}
    oid = meta.get("objectIdField") or next(f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeOID")
    page = int(meta.get("maxRecordCount") or 2000)
    count = get(f"{base}/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    print(f"[layer] {service}/{layer_id}: {count} records, {len(fields)} fields, page {page}")
    rows, last = [], -1
    while True:  # keyset paging on the object id
        j = get(f"{base}/query", {
            "where": f"{oid} > {last}", "outFields": "*", "orderByFields": f"{oid} ASC",
            "resultRecordCount": page, "returnGeometry": "true", "outSR": 4326, "f": "json"})
        feats = j.get("features", [])
        if not feats:
            break
        for ft in feats:
            a = ft["attributes"]
            for k in date_fields:
                if a.get(k) is not None:
                    a[k] = datetime.datetime.fromtimestamp(a[k] / 1000, datetime.timezone.utc).strftime("%Y-%m-%d")
            g = ft.get("geometry") or {}
            rows.append([a.get(k) for k in fields] + [g.get("x"), g.get("y")])
        last = feats[-1]["attributes"][oid]
        print(f"  {len(rows)}/{count}")
    with open(path + ".part", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(fields + ["lon_4326", "lat_4326"])
        w.writerows(rows)
    os.replace(path + ".part", path)
    status = "OK" if len(rows) == count else "MISMATCH"
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps({"name": out_name, "service": service, "layer": layer_id, "rows": len(rows),
                            "server_count": count, "status": status,
                            "finished_utc": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}) + "\n")
    print(f"  wrote {out_name}: {len(rows)} rows ({status})")


def pull_counties():
    path = os.path.join(OUT, "ok_counties.geojson")
    if os.path.exists(path):
        print("[skip] ok_counties.geojson exists")
        return
    gj = get(TIGER, {"where": "STATE='40'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                     "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    with open(path, "w") as f:
        json.dump(gj, f)
    print(f"[counties] {len(gj['features'])} Oklahoma counties")


def main():
    os.makedirs(OUT, exist_ok=True)
    download("rbdms-wells.csv")
    download("rbdms-wells-data-dictionary.xlsx")
    pull_feature_layer("RBDMS_ORPHAN_FUNDS_WELLS", "orphan_funds_wells.csv")
    pull_feature_layer("COMP_WELLS", "comp_wells.csv")
    pull_counties()
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps({"name": "rbdms-wells.csv", "status": "downloaded",
                            "finished_utc": datetime.datetime.fromtimestamp(
                                os.path.getmtime(os.path.join(OUT, "rbdms-wells.csv")), datetime.timezone.utc
                            ).strftime("%Y-%m-%dT%H:%M:%SZ")}) + "\n")


if __name__ == "__main__":
    main()
