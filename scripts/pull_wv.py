"""West Virginia DEP (TAGIS) one-time snapshot -> data/raw/wv/.

Polite by design: one sequential request at a time, ~0.5 s sleep between requests, retry with backoff,
files that already exist are not downloaded again. No recurring pulls. tagis.dep.wv.gov/robots.txt says
"Disallow: /arcgis/" (aimed at crawlers); Ocean approved exactly ONE polite pull of this layer.

  1. wv_wells.csv          (WVDEP_enterprise/oil_gas MapServer layer 7 "All DEP Wells", every attribute,
                            keyset-paged on objectid, geometry returned as WGS84 lon/lat -> lon_4326/lat_4326;
                            wellx/welly stay as published: UTM zone 17N NAD83 metres)
     + afterwards (no network, idempotent): rows whose location is the service's placeholder (wellx/welly =
       500000/4000000, i.e. the UTM 17N false origin, which plots in Virginia) get lon_4326/lat_4326 blanked and
       location_flag = PLACEHOLDER_500000_4000000, so they count as unmapped instead of being drawn in the wrong place.
       wellx/welly stay as published.
  2. source_count.json     (live returnCountOnly, for row-count reconciliation)
  3. wv_counties.geojson   (US Census TIGERweb counties for state FIPS 54, simplified)

Not pulled: layer 5 (54,887 WVGES wells "not in the DEP database", many without a location).

Usage: python3 -I scripts/pull_wv.py
"""
import csv, datetime, json, os, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "wv")
LAYER = "https://tagis.dep.wv.gov/arcgis/rest/services/WVDEP_enterprise/oil_gas/MapServer/7"
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


def pull_layer(base, out_name):
    out_path = os.path.join(OUT, out_name)
    meta = get(base, {"f": "json"})
    json.dump(meta, open(os.path.join(OUT, "layer7_meta.json"), "w"), indent=1)
    fields = [f["name"] for f in meta["fields"] if f["type"] != "esriFieldTypeGeometry"]
    date_fields = {f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeDate"}
    oid = meta.get("objectIdField") or next(f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeOID")
    page = int(meta.get("maxRecordCount") or 1000)
    count = get(f"{base}/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    json.dump({"service": base, "count": count, "fetched_utc": now()}, open(os.path.join(OUT, "source_count.json"), "w"), indent=1)
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
            if n % (page * 10) == 0 or len(feats) < page:
                print(f"  {n}/{count}")
    os.replace(out_path + ".part", out_path)
    log({"name": out_name, "service": base, "layer": 7, "rows": n, "server_count": count,
         "status": "OK" if n == count else "MISMATCH", "finished_utc": now()})
    print(f"  wrote {out_name}: {n} rows ({'OK' if n == count else 'MISMATCH'})")


def flag_placeholders():
    """Blank the WGS84 columns of placeholder locations (UTM 500000/4000000); adds location_flag. Idempotent."""
    p = os.path.join(OUT, "wv_wells.csv")
    with open(p, newline="") as f:
        r = csv.reader(f)
        header = next(r)
        if "location_flag" in header:
            print("[skip] location_flag column already present")
            return
        rows = list(r)
    ix, iy, ilon, ilat = (header.index(k) for k in ("wellx", "welly", "lon_4326", "lat_4326"))
    n = 0
    is_ph = lambda v, w: (v, w) == ("500000.0", "4000000.0")
    with open(p + ".part", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header + ["location_flag"])
        for rec in rows:
            try:
                near = abs(float(rec[ilon]) - -81.0000005) < 1e-5 and abs(float(rec[ilat]) - 37.0462212) < 1e-5
            except ValueError:
                near = False
            if is_ph(rec[ix], rec[iy]) or near:
                rec[ilon] = rec[ilat] = ""
                w.writerow(rec + ["PLACEHOLDER_500000_4000000"])
                n += 1
            else:
                w.writerow(rec + [""])
    os.replace(p + ".part", p)
    log({"name": "wv_wells.csv", "step": "blank placeholder coordinates (UTM 500000/4000000 -> lon/lat empty, location_flag set)",
         "rows": len(rows), "placeholder_rows": n, "finished_utc": now()})
    print(f"[placeholders] {n} rows at the UTM false-origin placeholder: lon/lat blanked, location_flag set")


def pull_counties():
    p = os.path.join(OUT, "wv_counties.geojson")
    if os.path.exists(p):
        print("[skip] wv_counties.geojson exists")
        return
    gj = get(TIGER, {"where": "STATE='54'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                     "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    json.dump(gj, open(p, "w"))
    print(f"[counties] {len(gj['features'])} West Virginia counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    pull_layer(LAYER, "wv_wells.csv")
    flag_placeholders()
    pull_counties()
