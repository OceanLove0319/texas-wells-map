"""Nebraska Oil and Gas Conservation Commission (NOGCC) one-time snapshot -> data/raw/ne/.

Polite by design: one download per source, a sleep between requests, retry with backoff, stop on
403/429, files that already exist are not downloaded again. No recurring pulls.

  1. NebraskaWellData.zip  http://nogcc.ne.gov/Publications/NebraskaWellData.zip (Access 2003 .mdb, ~1.6 MB)
  2. ne_wells.csv          table tblNebraskaWellData exported with mdbtools (`mdb-export`, Homebrew), every
                           column, dates and timestamps as YYYY-MM-DD (the stored times are
                           timezone artifacts), plus two columns joined from the WFS on API_WellNo:
                             WFS_Longitude / WFS_Latitude  (NOGCC:NEWells GeoServer point, EPSG:4269)
                           The API column is renamed to API only if it is not already matched by the build's
                           API-column rule (API / api_number / api_no / apinum); API_WellNo is NOT matched, so
                           a copy named API is appended (the original column is kept).
  3. ne_wfs_wells.txt      the WFS GetFeature response (GeoJSON) as received, kept as .txt so the build
                           ignores it (its only attributes are API_WellNo, Well_Name, X, Y)
  4. source_count.json     mdb row count and WFS numberMatched (two different counts; see the report)
  5. ne_counties.geojson   US Census TIGERweb counties for state FIPS 31, simplified

Usage: python3 -I scripts/pull_ne.py            (needs: brew install mdbtools)
"""
import csv, datetime, io, json, os, re, shutil, subprocess, sys, time, urllib.error, urllib.parse, urllib.request, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "ne")
ZIP_URL = "http://nogcc.ne.gov/Publications/NebraskaWellData.zip"
WFS = "http://datamining.nogcc.ne.gov:8080/geoserver/wfs"
TYPENAME = "NOGCC:NEWells"
TABLE = "tblNebraskaWellData"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 1.0
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


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
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 5 * attempt)
        except Exception as e:
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 5 * attempt)
    raise RuntimeError(f"failed: {url}")


def log(rec):
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")


def pull_zip():
    z = os.path.join(OUT, "NebraskaWellData.zip")
    if os.path.exists(z) and os.path.getsize(z) > 0:
        print("[skip] NebraskaWellData.zip exists")
        return z
    print("[download] NebraskaWellData.zip (one time)")
    data, h = get(ZIP_URL)
    open(z + ".part", "wb").write(data)
    os.replace(z + ".part", z)
    log({"name": "NebraskaWellData.zip", "url": ZIP_URL, "bytes": len(data), "last_modified": h.get("Last-Modified"), "status": "downloaded", "finished_utc": now()})
    print(f"  {len(data)/1e6:.1f} MB, Last-Modified {h.get('Last-Modified')}")
    return z


def extract_mdb(z):
    with zipfile.ZipFile(z) as zf:
        info = next(i for i in zf.infolist() if i.filename.lower().endswith((".mdb", ".accdb")))
        target = os.path.join(OUT, os.path.basename(info.filename))
        if not os.path.exists(target):
            open(target, "wb").write(zf.read(info))
            log({"name": os.path.basename(info.filename), "from": "NebraskaWellData.zip", "bytes": info.file_size,
                 "zip_entry_date": datetime.datetime(*info.date_time).strftime("%Y-%m-%d"), "status": "extracted", "finished_utc": now()})
        return target, datetime.datetime(*info.date_time).strftime("%Y-%m-%d")


def pull_wfs():
    raw = os.path.join(OUT, "ne_wfs_wells.txt")
    if os.path.exists(raw):
        print("[skip] ne_wfs_wells.txt exists")
        return json.load(open(raw))
    print("[download] NOGCC:NEWells (WFS, one request)")
    data, _ = get(WFS, {"service": "WFS", "version": "1.0.0", "request": "GetFeature", "typeName": TYPENAME, "outputFormat": "application/json"})
    gj = json.loads(data)
    open(raw + ".part", "wb").write(data)
    os.replace(raw + ".part", raw)
    log({"name": "ne_wfs_wells.txt", "service": WFS, "typeName": TYPENAME, "rows": len(gj.get("features", [])), "server_count": gj.get("totalFeatures"),
         "crs": (gj.get("crs") or {}).get("properties", {}).get("name"), "status": "OK", "finished_utc": now()})
    print(f"  {len(gj.get('features', []))} WFS points (totalFeatures {gj.get('totalFeatures')})")
    return gj


def export_table(mdb, built, wfs):
    out = os.path.join(OUT, "ne_wells.csv")
    if os.path.exists(out):
        print("[skip] ne_wells.csv exists")
        return
    if not shutil.which("mdb-export"):
        raise RuntimeError("mdb-export not found: brew install mdbtools")
    tables = subprocess.run(["mdb-tables", "-1", mdb], capture_output=True, text=True, check=True).stdout.split()
    print(f"[mdb] tables: {tables}")
    if TABLE not in tables:
        raise RuntimeError(f"{TABLE} not in {tables}")
    csv_text = subprocess.run(["mdb-export", "-D", "%Y-%m-%d", "-T", "%Y-%m-%d", mdb, TABLE], capture_output=True, text=True, check=True).stdout
    rdr = csv.reader(io.StringIO(csv_text))
    header = next(rdr)
    rows = [r for r in rdr if r]
    # WFS coordinates by 14-digit API
    pts = {}
    for ft in wfs.get("features", []):
        a = ft.get("properties") or {}
        g = (ft.get("geometry") or {}).get("coordinates")
        key = re.sub(r"\D", "", str(a.get("API_WellNo", "")))
        if key and g:
            pts[key] = (g[0], g[1])
    api_i = next((i for i, h in enumerate(header) if re.fullmatch(r"api(_?well_?no|_?number|_?no|_?num)?", h.strip(), re.I)), None)
    if api_i is None:
        raise RuntimeError(f"no API column in {header}")
    add_api = not re.fullmatch(r"api(_number|_no|num)?", header[api_i].strip(), re.I)
    header2 = header + ["WFS_Longitude", "WFS_Latitude"] + (["API"] if add_api else [])
    matched = 0
    with open(out + ".part", "w", newline="", encoding="utf8") as f:
        w = csv.writer(f)
        w.writerow([h.strip() for h in header2])
        for r in rows:
            key = re.sub(r"\D", "", r[api_i])
            p = pts.get(key)
            if p:
                matched += 1
            w.writerow(r + ([p[0], p[1]] if p else ["", ""]) + ([r[api_i]] if add_api else []))
    os.replace(out + ".part", out)
    log({"name": "ne_wells.csv", "from": os.path.basename(mdb), "table": TABLE, "rows": len(rows), "zip_entry_date": built, "tool": "mdb-export (mdbtools)",
         "api_column": header[api_i], "api_copy_added": add_api, "wfs_points_joined": matched, "wfs_points_total": len(pts), "status": "exported", "finished_utc": now()})
    print(f"[export] {TABLE} -> ne_wells.csv: {len(rows)} rows, {len(header)} columns; WFS coordinates joined for {matched} of {len(pts)} WFS points")
    json.dump({"service": f"{ZIP_URL} ({TABLE}); WFS {WFS} {TYPENAME}", "count": len(rows), "wfs_count": wfs.get("totalFeatures"),
               "fetched_utc": now()}, open(os.path.join(OUT, "source_count.json"), "w"), indent=1)


def pull_counties():
    p = os.path.join(OUT, "ne_counties.geojson")
    if os.path.exists(p):
        print("[skip] ne_counties.geojson exists")
        return
    data, _ = get(TIGER, {"where": "STATE='31'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                          "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    gj = json.loads(data)
    json.dump(gj, open(p, "w"))
    log({"name": "ne_counties.geojson", "service": TIGER, "rows": len(gj["features"]), "status": "OK", "finished_utc": now()})
    print(f"[counties] {len(gj['features'])} Nebraska counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    try:
        mdb, built = extract_mdb(pull_zip())
        wfs = pull_wfs()
        export_table(mdb, built, wfs)
        pull_counties()
    except Blocked as e:
        log({"name": "BLOCKED", "error": str(e), "finished_utc": now()})
        print(f"[blocked] {e}", file=sys.stderr)
        sys.exit(2)
