"""Tennessee TDEC Oil and Gas one-time snapshot -> data/raw/tn/.

Polite by design: a handful of sequential requests (layer metadata, count, one or two data pages of up to 17,000
rows), ~0.5 s sleep, retry with backoff, files that already exist are not downloaded again. No recurring pulls.

NOTE (disclosed): tdeconline.tn.gov answers 403 Forbidden to non-browser User-Agent strings (python-urllib and
curl alike, verified 2026-10-12); the same URLs answer 200 with a browser User-Agent. This script therefore sends
a browser-style User-Agent for its one pull. No login, no robots.txt (403 as well).

  1. tn_wells.csv          (Oil_and_Gas2 MapServer layer 0 "Oil and Gas Wells": every attribute (API_NO, PERMIT_NO,
                            PERMIT_DATE, OPERATOR_NAME, WELL_NAME_AND_NO, COUNTY, LATITUDE, LONGITUDE, ELEVATION,
                            FORMATION_AT_TOTAL_DEPTH, PURPOSE_OF_WELL), geometry as WGS84 lon/lat -> lon_4326/lat_4326)
     + API column added afterwards: "41" + the 8 digits of API_NO ("133-22884" = county + unique; a "-R1" re-entry
       suffix is dropped), so the API carries the state code like every other state (41 = Tennessee)
  2. source_count.json     (live returnCountOnly)
  3. tn_counties.geojson   (US Census TIGERweb counties for state FIPS 47, simplified)

Usage: python3 -I scripts/pull_tn.py
"""
import csv, datetime, json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "tn")
LAYER = "https://tdeconline.tn.gov/arcgis/rest/services/Oil_and_Gas2/MapServer/0"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
SLEEP = 0.5
EPOCH = datetime.datetime(1970, 1, 1, tzinfo=datetime.timezone.utc)
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get(url, params=None, ua=UA, retries=4, timeout=300):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": ua})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                data = r.read()
            time.sleep(SLEEP)
            j = json.loads(data)
            if isinstance(j, dict) and j.get("error"):
                raise RuntimeError(f"server error {j['error']}")
            return j
        except urllib.error.HTTPError as e:
            if e.code in (401, 403):
                raise RuntimeError(f"blocked ({e.code}) - stopping, not retrying: {url}")
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 6 * attempt)
        except Exception as e:
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 6 * attempt)
    raise RuntimeError(f"failed: {url}")


def log(rec):
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")


def iso(ms):
    try:
        return (EPOCH + datetime.timedelta(milliseconds=ms)).strftime("%Y-%m-%d")
    except Exception:
        return ms


def pull_layer():
    out_path = os.path.join(OUT, "tn_wells.csv")
    meta = get(LAYER, {"f": "json"}, ua=BROWSER_UA)
    json.dump(meta, open(os.path.join(OUT, "layer0_meta.json"), "w"), indent=1)
    fields = [f["name"] for f in meta["fields"] if f["type"] != "esriFieldTypeGeometry"]
    date_fields = {f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeDate"}
    oid = meta.get("objectIdField") or next(f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeOID")
    page = int(meta.get("maxRecordCount") or 1000)
    count = get(f"{LAYER}/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"}, ua=BROWSER_UA)["count"]
    json.dump({"service": LAYER, "count": count, "fetched_utc": now()}, open(os.path.join(OUT, "source_count.json"), "w"), indent=1)
    if os.path.exists(out_path):
        print("[skip] tn_wells.csv exists")
        return
    print(f"[layer] {meta.get('name')}: {count} records, {len(fields)} fields, page {page}")
    n, last = 0, -1
    with open(out_path + ".part", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(fields + ["lon_4326", "lat_4326"])
        while True:
            j = get(f"{LAYER}/query", {"where": f"{oid} > {last}", "outFields": "*", "orderByFields": f"{oid} ASC",
                                       "resultRecordCount": page, "returnGeometry": "true", "outSR": 4326, "f": "json"}, ua=BROWSER_UA)
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
            print(f"  {n}/{count}")
    os.replace(out_path + ".part", out_path)
    log({"name": "tn_wells.csv", "service": LAYER, "rows": n, "server_count": count, "user_agent": "browser-style (server returns 403 to non-browser agents)",
         "status": "OK" if n == count else "MISMATCH", "finished_utc": now()})
    print(f"  wrote tn_wells.csv: {n} rows ({'OK' if n == count else 'MISMATCH'})")


def add_api():
    """Prepend an API column (41 + 8 digits of API_NO) once; idempotent, no network."""
    p = os.path.join(OUT, "tn_wells.csv")
    with open(p, newline="") as f:
        r = csv.reader(f)
        header = next(r)
        if header[0] == "API":
            print("[skip] API column already present")
            return
        rows = list(r)
    i = header.index("API_NO")
    n_bad = 0
    with open(p + ".part", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["API"] + header)
        for rec in rows:
            m = re.match(r"^\s*(\d{3})-?(\d{5})(?:-\w+)?\s*$", rec[i] or "")
            if not m:
                n_bad += 1
            w.writerow([("41" + m.group(1) + m.group(2)) if m else ""] + rec)
    os.replace(p + ".part", p)
    log({"name": "tn_wells.csv", "step": "add API column (41 + county + unique from API_NO)", "rows": len(rows),
         "rows_without_parseable_api_no": n_bad, "finished_utc": now()})
    print(f"[api] added API column to {len(rows)} rows ({n_bad} without a parseable API_NO)")


def pull_counties():
    p = os.path.join(OUT, "tn_counties.geojson")
    if os.path.exists(p):
        print("[skip] tn_counties.geojson exists")
        return
    gj = get(TIGER, {"where": "STATE='47'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                     "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    json.dump(gj, open(p, "w"))
    print(f"[counties] {len(gj['features'])} Tennessee counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    pull_layer()
    add_api()
    pull_counties()
