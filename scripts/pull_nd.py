"""North Dakota DMR Oil and Gas Division (NDIC) one-time snapshot -> data/raw/nd/.

LOCATIONS ONLY. The public All_Wells MapServer is free; the Well Index spreadsheet, scout tickets,
well files and production are behind NDIC's premium subscription and are NOT pulled.

Polite by design: one sequential request at a time (well under the 2-concurrent limit), a sleep
between requests, retry with backoff, stop on 403/429, and files that already exist are not
downloaded again. No recurring pulls.

  1. nd_wells.csv        All_Wells MapServer layer 0, every attribute, keyset-paged on OBJECTID
                         (2,000 per page, about 22 pages), geometry returned in WGS84 (outSR 4326; the
                         service stores Web Mercator / EPSG:3857). The latitude/longitude attribute
                         columns are kept too (datum not stated by NDIC; they agree with the geometry).
                         api_no is the dashed API ("33-043-00002-00-00"), api the 14-digit form.
                         Epoch-ms spud_date -> YYYY-MM-DD. PLSS: twp (N), rng (W), sec, qq ("SWSW",
                         smallest call first); all of North Dakota is on the Fifth Principal Meridian.
  2. source_count.json   the service's live count (returnCountOnly) for the row-count reconciliation
  3. nd_counties.geojson US Census TIGERweb counties for state FIPS 38, simplified

Usage: python3 -I scripts/pull_nd.py
"""
import csv, datetime, json, os, sys, time, urllib.error, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "nd")
LAYER = "https://gis.dmr.nd.gov/dmrpublicservices/rest/services/All_Wells/MapServer/0"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 0.6
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class Blocked(Exception):
    pass


def get(url, params=None, retries=5):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=300) as r:
                data = r.read()
            time.sleep(SLEEP)
            j = json.loads(data)
            if "error" in j:
                raise RuntimeError(j["error"])
            return j
        except urllib.error.HTTPError as e:
            if e.code in (403, 429):
                raise Blocked(f"HTTP {e.code} from {url[:100]} - stopping, not retrying")
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 5 * attempt)
        except Exception as e:
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 5 * attempt)
    raise RuntimeError(f"failed: {url}")


def log(rec):
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")


def epoch_to_date(ms):
    try:
        return datetime.datetime.fromtimestamp(ms / 1000, datetime.timezone.utc).strftime("%Y-%m-%d")
    except (OverflowError, OSError, ValueError):
        return str(ms)


def pull_wells():
    path = os.path.join(OUT, "nd_wells.csv")
    if os.path.exists(path):
        print("[skip] nd_wells.csv exists")
        return
    meta = get(LAYER, {"f": "json"})
    fields = [f["name"] for f in meta["fields"] if f["type"] != "esriFieldTypeGeometry"]
    date_fields = {f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeDate"}
    oid = meta.get("objectIdField") or next(f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeOID")
    page = int(meta.get("maxRecordCount") or 2000)
    count = get(LAYER + "/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    sr = (meta.get("extent") or {}).get("spatialReference", {})
    print(f"[layer] All_Wells/0: {count} wells, {len(fields)} fields, page {page}, native SR {sr.get('latestWkid') or sr.get('wkid')}")
    json.dump({"service": LAYER, "count": count, "fields": fields, "native_wkid": sr.get("latestWkid") or sr.get("wkid"),
               "fetched_utc": now()}, open(os.path.join(OUT, "source_count.json"), "w"), indent=1)
    rows, last, no_geom = [], -1, 0
    while True:
        j = get(LAYER + "/query", {"where": f"{oid} > {last}", "outFields": "*", "orderByFields": f"{oid} ASC",
                                   "resultRecordCount": page, "returnGeometry": "true", "outSR": 4326, "f": "json"})
        feats = j.get("features", [])
        if not feats:
            break
        for ft in feats:
            a = ft["attributes"]
            for k in date_fields:
                if a.get(k) is not None:
                    a[k] = epoch_to_date(a[k])
            g = ft.get("geometry") or {}
            if g.get("x") is None:
                no_geom += 1
            rows.append([a.get(k) for k in fields] + [g.get("x"), g.get("y")])
        last = feats[-1]["attributes"][oid]
        print(f"  {len(rows)}/{count}")
    with open(path + ".part", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(fields + ["lon_4326", "lat_4326"])
        w.writerows(rows)
    os.replace(path + ".part", path)
    status = "OK" if len(rows) == count else "MISMATCH"
    log({"name": "nd_wells.csv", "service": LAYER, "rows": len(rows), "server_count": count, "no_geometry": no_geom,
         "status": status, "finished_utc": now()})
    print(f"  wrote nd_wells.csv: {len(rows)} rows ({status}), {no_geom} without geometry")


def pull_counties():
    p = os.path.join(OUT, "nd_counties.geojson")
    if os.path.exists(p):
        print("[skip] nd_counties.geojson exists")
        return
    gj = get(TIGER, {"where": "STATE='38'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                     "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    json.dump(gj, open(p, "w"))
    log({"name": "nd_counties.geojson", "service": TIGER, "rows": len(gj["features"]), "status": "OK", "finished_utc": now()})
    print(f"[counties] {len(gj['features'])} North Dakota counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    try:
        pull_wells()
        pull_counties()
    except Blocked as e:
        log({"name": "BLOCKED", "error": str(e), "finished_utc": now()})
        print(f"[blocked] {e}", file=sys.stderr)
        sys.exit(2)
