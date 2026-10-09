"""Kansas Geological Survey (KGS) one-time snapshot -> data/raw/ks/.

Polite by design: one sequential request at a time (well under the 2-concurrent limit), a sleep
between requests, and files that already exist are not downloaded again. No recurring pulls.

  1. ks_wells.zip -> ks_wells.txt   (KGS bulk well file, ONE download, ~44 MB zip / ~205 MB CSV)
  2. source_count.json              (KGS oilgas_wells MapServer layer 0: returnCountOnly + field list,
                                     two small requests, used only to reconcile the row count)
  3. ks_counties.geojson            (US Census TIGERweb counties for state FIPS 20, simplified)

Usage: python3 -I scripts/ks_pull.py
"""
import datetime, json, os, sys, time, urllib.parse, urllib.request, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "ks")
ZIP_URL = "https://www.kgs.ku.edu/PRS/Ora_Archive/ks_wells.zip"
REST = "https://services.kgs.ku.edu/arcgis8/rest/services/oilgas/oilgas_wells/MapServer/0"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 2.0
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get(url, params=None, retries=4):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=600) as r:
                data, headers = r.read(), dict(r.headers)
            time.sleep(SLEEP)
            return data, headers
        except Exception as e:
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 5 * attempt)
    raise RuntimeError(f"failed: {url}")


def log(rec):
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")


def pull_zip():
    z = os.path.join(OUT, "ks_wells.zip")
    if not (os.path.exists(z) and os.path.getsize(z) > 0):
        print("[download] ks_wells.zip")
        data, h = get(ZIP_URL)
        open(z + ".part", "wb").write(data)
        os.replace(z + ".part", z)
        log({"name": "ks_wells.zip", "url": ZIP_URL, "bytes": len(data), "last_modified": h.get("Last-Modified"),
             "status": "downloaded", "finished_utc": now()})
        print(f"  {len(data)/1e6:.1f} MB, Last-Modified {h.get('Last-Modified')}")
    else:
        print("[skip] ks_wells.zip exists")
    with zipfile.ZipFile(z) as zf:
        for info in zf.infolist():
            target = os.path.join(OUT, os.path.basename(info.filename))
            if not info.filename or info.is_dir() or os.path.exists(target):
                continue
            with zf.open(info) as src, open(target + ".part", "wb") as dst:
                while chunk := src.read(1 << 20):
                    dst.write(chunk)
            os.replace(target + ".part", target)
            built = datetime.datetime(*info.date_time).strftime("%Y-%m-%d")
            log({"name": os.path.basename(info.filename), "from": "ks_wells.zip", "bytes": info.file_size,
                 "zip_entry_date": built, "status": "extracted", "finished_utc": now()})
            print(f"[extract] {info.filename} {info.file_size/1e6:.1f} MB (built {built})")


def pull_count():
    p = os.path.join(OUT, "source_count.json")
    if os.path.exists(p):
        print("[skip] source_count.json exists")
        return
    meta = json.loads(get(REST, {"f": "json"})[0])
    cnt = json.loads(get(REST + "/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})[0])["count"]
    json.dump({"service": REST, "count": cnt, "fields": [f["name"] for f in meta.get("fields", [])],
               "fetched_utc": now()}, open(p, "w"), indent=1)
    log({"name": "source_count.json", "service": REST, "server_count": cnt, "status": "OK", "finished_utc": now()})
    print(f"[count] KGS REST layer 0: {cnt:,} wells")


def pull_counties():
    p = os.path.join(OUT, "ks_counties.geojson")
    if os.path.exists(p):
        print("[skip] ks_counties.geojson exists")
        return
    data, _ = get(TIGER, {"where": "STATE='20'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                          "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    gj = json.loads(data)
    json.dump(gj, open(p, "w"))
    print(f"[counties] {len(gj['features'])} Kansas counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    pull_zip()
    pull_count()
    pull_counties()
