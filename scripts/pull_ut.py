"""Utah Division of Oil, Gas and Mining (DNR DOGM) one-time snapshot -> data/raw/ut/.

Polite by design: one sequential request at a time, a sleep between requests, retry with backoff,
stop on 403/429, and files that already exist are not downloaded again. No recurring pulls.

Daily RBDMS bulk exports from https://oilgas.ogm.utah.gov/pub/Database/ (each ONE download):
  1. Wells.zip               -> ut_wells.csv              one row per well, every column (base file)
  2. LatLongCoordinates.zip  -> ut_latlong_coordinates.csv per-well coordinate records (layer, joins on API)
  3. WellHistory.zip         -> ut_well_history.csv        per-well history incl. spud dates (layer, joins on API)
  4. source_count.json       row count of Wells.csv (DOGM has no live count service; the file IS the source)
  5. ut_counties.geojson     US Census TIGERweb counties for state FIPS 49, simplified

The CSV header of each export is kept as published, except that the per-well key column of a layer is
renamed to API when it is not already an API column the build recognizes (WellHistory.csv calls it WellID);
the original name is recorded in pull_log.jsonl.

Not pulled: the DOGM read-me PDFs under /pub/database_download_read/ (the directory index answers 403, so the
datum of Latitude / Longitude is not documented here; the download index page calls them lat/long only).

Usage: python3 -I scripts/pull_ut.py
"""
import csv, datetime, io, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "ut")
BASE = "https://oilgas.ogm.utah.gov/pub/Database/"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 1.0
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
FILES = [("Wells.zip", "ut_wells.csv"), ("LatLongCoordinates.zip", "ut_latlong_coordinates.csv"), ("WellHistory.zip", "ut_well_history.csv")]


class Blocked(Exception):
    pass


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
        except urllib.error.HTTPError as e:
            if e.code in (403, 429):
                raise Blocked(f"HTTP {e.code} from {url[:100]} - stopping, not retrying")
            if e.code == 404:
                return None, {}
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 5 * attempt)
        except Exception as e:
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 5 * attempt)
    raise RuntimeError(f"failed: {url}")


def log(rec):
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")


def download(name):
    path = os.path.join(OUT, name)
    if os.path.exists(path) and os.path.getsize(path) > 0:
        print(f"[skip] {name} exists")
        return path
    print(f"[download] {name}")
    data, h = get(BASE + name)
    if data is None:
        raise RuntimeError(f"{name}: 404")
    open(path + ".part", "wb").write(data)
    os.replace(path + ".part", path)
    log({"name": name, "url": BASE + name, "bytes": len(data), "last_modified": h.get("Last-Modified"), "status": "downloaded", "finished_utc": now()})
    print(f"  {len(data)/1e6:.1f} MB, Last-Modified {h.get('Last-Modified')}")
    return path


def extract_csv(zpath, out_name):
    out = os.path.join(OUT, out_name)
    if os.path.exists(out):
        print(f"[skip] {out_name} exists")
        return
    with zipfile.ZipFile(zpath) as zf:
        entries = [i for i in zf.infolist() if not i.is_dir()]
        info = next((i for i in entries if i.filename.lower().endswith(".csv")), entries[0])
        raw = zf.read(info)
    text = raw.decode("utf-8-sig", "replace") if raw[:3] == b"\xef\xbb\xbf" or b"\x00" not in raw[:1000] else raw.decode("utf-16", "replace")
    rdr = csv.reader(io.StringIO(text))
    header = next(rdr)
    renamed = None
    api_i = next((i for i, h in enumerate(header) if re.fullmatch(r"api(_?number|_?no|_?num|_?well_?no)?|well_?id", h.strip(), re.I)), None)
    if api_i is not None and header[api_i].strip().upper() != "API":
        renamed = header[api_i]
        header[api_i] = "API"
    n = 0
    with open(out + ".part", "w", newline="", encoding="utf8") as f:
        w = csv.writer(f)
        w.writerow([h.strip() for h in header])
        for rec in rdr:
            if rec:
                w.writerow(rec)
                n += 1
    os.replace(out + ".part", out)
    built = datetime.datetime(*info.date_time).strftime("%Y-%m-%d")
    log({"name": out_name, "from": os.path.basename(zpath), "entry": info.filename, "rows": n, "zip_entry_date": built,
         "api_column_renamed_from": renamed, "status": "extracted", "finished_utc": now()})
    print(f"[extract] {info.filename} -> {out_name}: {n} rows (built {built}){' API column renamed from ' + renamed if renamed else ''}")
    return n


def pull_counties():
    p = os.path.join(OUT, "ut_counties.geojson")
    if os.path.exists(p):
        print("[skip] ut_counties.geojson exists")
        return
    data, _ = get(TIGER, {"where": "STATE='49'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                          "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    gj = json.loads(data)
    json.dump(gj, open(p, "w"))
    log({"name": "ut_counties.geojson", "service": TIGER, "rows": len(gj["features"]), "status": "OK", "finished_utc": now()})
    print(f"[counties] {len(gj['features'])} Utah counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    try:
        for zname, out_name in FILES:
            extract_csv(download(zname), out_name)
        sc = os.path.join(OUT, "source_count.json")
        if not os.path.exists(sc):
            with open(os.path.join(OUT, "ut_wells.csv"), encoding="utf8", newline="") as f:
                n = sum(1 for _ in csv.reader(f)) - 1
            json.dump({"service": BASE + "Wells.zip (bulk file; DOGM publishes no live count)", "count": n, "fetched_utc": now()}, open(sc, "w"), indent=1)
        pull_counties()
    except Blocked as e:
        log({"name": "BLOCKED", "error": str(e), "finished_utc": now()})
        print(f"[blocked] {e}", file=sys.stderr)
        sys.exit(2)
