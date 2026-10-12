"""Ohio DNR Division of Oil & Gas Resources one-time snapshot -> data/raw/oh/.

Polite by design: one sequential request at a time, ~0.5 s sleep between requests, retry with backoff,
files that already exist are not downloaded again. No recurring pulls. gis.ohiodnr.gov/robots.txt says
"Disallow: /" (aimed at crawlers); Ocean approved exactly ONE polite pull of these two layers.

  1. oh_wells.csv          (DOG_Services/Oilgas_Wells_public MapServer layer 0 "Wells by Type (Symbol)": every
                            attribute (14-digit API_WELLNO, map symbol = type, status, owner, wellhead and
                            bottom-hole lat/long, formations, orphan-program status), keyset-paged on OBJECTID,
                            geometry returned as WGS84 lon/lat -> lon_4326/lat_4326)
  2. oh_offline.csv        (DOG_Services/ogwells_offline FeatureServer layer 0: companion layer with TOTAL_DEPTH,
                            PERMIT_ISSUED_DATE, COMP_DATE, PLUG_DATE, status code; joins on API_NO = API_WELLNO)
  3. source_count.json     (live returnCountOnly of the base layer)
  4. oh_counties.geojson   (US Census TIGERweb counties for state FIPS 39, simplified)

Usage: python3 -I scripts/pull_oh.py
"""
import csv, datetime, json, os, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "oh")
BASE = "https://gis.ohiodnr.gov/arcgis/rest/services/DOG_Services/Oilgas_Wells_public/MapServer/0"
OFFLINE = "https://gis.ohiodnr.gov/arcgis/rest/services/DOG_Services/ogwells_offline/FeatureServer/0"
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


def pull_layer(base, out_name, meta_name, count_file=None):
    out_path = os.path.join(OUT, out_name)
    meta = get(base, {"f": "json"})
    json.dump(meta, open(os.path.join(OUT, meta_name), "w"), indent=1)
    fields = [f["name"] for f in meta["fields"] if f["type"] != "esriFieldTypeGeometry"]
    date_fields = {f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeDate"}
    oid = meta.get("objectIdField") or next(f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeOID")
    page = int(meta.get("maxRecordCount") or 1000)
    count = get(f"{base}/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    if count_file:
        json.dump({"service": base, "count": count, "fetched_utc": now()}, open(os.path.join(OUT, count_file), "w"), indent=1)
    if os.path.exists(out_path):
        print(f"[skip] {out_name} exists")
        return
    print(f"[layer] {meta.get('name')}: {count} records, {len(fields)} fields, page {page}")
    n, last = 0, -1
    with open(out_path + ".part", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(fields + ["lon_4326", "lat_4326"])
        while True:
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
    log({"name": out_name, "service": base, "rows": n, "server_count": count,
         "status": "OK" if n == count else "MISMATCH", "finished_utc": now()})
    print(f"  wrote {out_name}: {n} rows ({'OK' if n == count else 'MISMATCH'})")


def pull_counties():
    p = os.path.join(OUT, "oh_counties.geojson")
    if os.path.exists(p):
        print("[skip] oh_counties.geojson exists")
        return
    gj = get(TIGER, {"where": "STATE='39'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                     "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    json.dump(gj, open(p, "w"))
    print(f"[counties] {len(gj['features'])} Ohio counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    pull_layer(BASE, "oh_wells.csv", "layer0_meta.json", count_file="source_count.json")
    pull_layer(OFFLINE, "oh_offline.csv", "offline_meta.json")
    pull_counties()
