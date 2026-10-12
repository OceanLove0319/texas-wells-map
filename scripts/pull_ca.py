"""California Geologic Energy Management Division (CalGEM, WellSTAR) one-time snapshot -> data/raw/ca/.

Polite by design: ONE bulk download instead of about 49 REST pages, one sequential request at a
time, a sleep between requests, files that already exist are not downloaded again. No recurring pulls.

  1. hub/ca_wells_hub.csv  CalGEM "WellSTAR: Oil and Gas Wells" statewide CSV from the CNRA Open Data
                           hub (item ef53080fdf894761858dd1728610b9a0, layer 0; about 62 MB). The hub
                           file is a cached export (its Last-Modified header is the data date) and
                           lags the live service by a few weeks. It lives in the hub/ subfolder so the
                           build does not treat it as a second per-well layer (it has an API column).
  2. ca_wells.csv          the base file: every hub column kept, plus LON_4326/LAT_4326 copied from the
                           Longitude/Latitude attribute columns (the hub X/Y columns are Web Mercator).
  3. source_count.json     live count of the WellSTAR/Wells MapServer layer 0 (one small request),
                           used only to reconcile the CSV row count.
  4. ca_counties.geojson   US Census TIGERweb counties for state FIPS 06, simplified.

Fields: API (10 digits, 04 + county + serial), WellType / WellTypeLabel, WellStatus, OperatorName,
FieldName, CountyName, Section / Township / Range / BaseMeridian (PLSS: MD Mount Diablo, SB San
Bernardino, H Humboldt), Latitude / Longitude (datum not stated by CalGEM; WellSTAR publishes
WGS84 / NAD83), GISSource, SpudDate, isConfidential, isDirectionallyDrilled. No depth, no docs link.

Usage: python3 -I scripts/pull_ca.py
"""
import csv, datetime, json, os, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "ca")
HUB_CSV = "https://gis-cnra.hub.arcgis.com/api/download/v1/items/ef53080fdf894761858dd1728610b9a0/csv?layers=0"
REST = "https://gis.conservation.ca.gov/server/rest/services/WellSTAR/Wells/MapServer/0"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 0.5
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
csv.field_size_limit(1 << 28)


class Blocked(Exception):
    pass


def get(url, params=None, retries=4, timeout=900):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                data, headers = r.read(), dict(r.headers)
            time.sleep(SLEEP)
            return data, headers
        except urllib.error.HTTPError as e:
            if e.code in (403, 429):
                raise Blocked(f"HTTP {e.code} on {url[:120]}")
            print(f"  retry {attempt}/{retries} HTTP {e.code} {url[:120]}", file=sys.stderr)
        except Exception as e:
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
        time.sleep(SLEEP * 5 * attempt)
    raise RuntimeError(f"failed: {url}")


def log(rec):
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")


def pull_hub_csv():
    os.makedirs(os.path.join(OUT, "hub"), exist_ok=True)
    p = os.path.join(OUT, "hub", "ca_wells_hub.csv")
    if os.path.exists(p) and os.path.getsize(p) > 0:
        print("[skip] ca_wells_hub.csv exists")
        return p
    print("[download] ca_wells_hub.csv")
    data, h = get(HUB_CSV)
    open(p + ".part", "wb").write(data)
    os.replace(p + ".part", p)
    log({"name": "ca_wells_hub.csv", "url": HUB_CSV, "bytes": len(data), "last_modified": h.get("Last-Modified"),
         "content_type": h.get("Content-Type"), "status": "downloaded", "finished_utc": now()})
    print(f"  {len(data)/1e6:.1f} MB, Last-Modified {h.get('Last-Modified')}")
    return p


def hub_data_date():
    """Data date = the hub file's Last-Modified (from the pull log), as YYYY-MM-DD."""
    for line in open(os.path.join(OUT, "pull_log.jsonl")):
        rec = json.loads(line)
        if rec.get("name") == "ca_wells_hub.csv" and rec.get("last_modified"):
            dt = datetime.datetime.strptime(rec["last_modified"], "%a, %d %b %Y %H:%M:%S %Z")
            return dt.strftime("%Y-%m-%d")
    return None


def build_base(src):
    p = os.path.join(OUT, "ca_wells.csv")
    n = 0
    with open(src, encoding="utf-8-sig", newline="") as f, open(p + ".part", "w", newline="") as out:
        r = csv.DictReader(f)
        header = list(r.fieldnames) + ["LON_4326", "LAT_4326"]
        w = csv.DictWriter(out, fieldnames=header)
        w.writeheader()
        for row in r:
            row["LON_4326"], row["LAT_4326"] = row.get("Longitude", ""), row.get("Latitude", "")
            w.writerow(row)
            n += 1
    os.replace(p + ".part", p)
    log({"name": "ca_wells.csv", "from": "ca_wells_hub.csv", "rows": n, "hub_data_date": hub_data_date(), "status": "written", "finished_utc": now()})
    print(f"[write] ca_wells.csv: {n:,} rows")


def pull_count():
    p = os.path.join(OUT, "source_count.json")
    if os.path.exists(p):
        print("[skip] source_count.json exists")
        return
    cnt = json.loads(get(REST + "/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})[0])["count"]
    json.dump({"service": REST, "count": cnt, "fetched_utc": now()}, open(p, "w"), indent=1)
    log({"name": "source_count.json", "service": REST, "server_count": cnt, "status": "OK", "finished_utc": now()})
    print(f"[count] WellSTAR REST layer 0: {cnt:,} wells")


def pull_counties():
    p = os.path.join(OUT, "ca_counties.geojson")
    if os.path.exists(p):
        print("[skip] ca_counties.geojson exists")
        return
    data, _ = get(TIGER, {"where": "STATE='06'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                          "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    gj = json.loads(data)
    json.dump(gj, open(p, "w"))
    log({"name": "ca_counties.geojson", "service": TIGER, "features": len(gj["features"]), "status": "OK", "finished_utc": now()})
    print(f"[counties] {len(gj['features'])} California counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    try:
        src = pull_hub_csv()
        build_base(src)
        pull_count()
        pull_counties()
    except Blocked as e:
        print(f"BLOCKED - stopping: {e}", file=sys.stderr)
        sys.exit(2)
