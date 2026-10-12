"""South Dakota DANR Oil & Gas (data from the SD Geological Survey) one-time snapshot -> data/raw/sd/.

Polite by design: one download, a sleep between requests, retry with backoff, stop on 403/429, files
that already exist are not downloaded again. No recurring pulls.

  1. SDOILexport.zip      https://sddenr.net/pubs/og/SDOILexport.zip (~18 MB, Excel workbooks)  ONE download
  2. tables/<name>.csv    every sheet of every workbook in the zip, converted with openpyxl (kept for reference;
                          the build only reads top-level CSVs)
  3. sd_wells.csv         Wells.xlsx (base file: one row per well)
  4. other top-level CSVs per-well tables that have an API column (LAYERS below), joined by the build on API
  5. source_count.json    row count of Wells.xlsx (DANR publishes no live count; the export IS the source)
  6. sd_counties.geojson  US Census TIGERweb counties for state FIPS 46, simplified

Usage: python3 -I scripts/pull_sd.py
"""
import csv, datetime, io, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "sd")
ZIP_URL = "https://sddenr.net/pubs/og/SDOILexport.zip"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 1.0
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
# workbook/sheet -> top-level CSV. Wells is the base; the others are per-well layers (must have an API column).
BASE_TABLE = ("Wells", "sd_wells.csv")
LAYERS = {"Well_Completions": "sd_well_completions.csv", "Formation_Tops": "sd_formation_tops.csv"}
# Not promoted (kept in tables/ only): UIC_InjectionData_All_Years (35k monthly injection reports, not per-well
# attributes) and Oil_Gas_Production_All_Years (production, out of scope; openpyxl reads no sheet from it).


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
    z = os.path.join(OUT, "SDOILexport.zip")
    if os.path.exists(z) and os.path.getsize(z) > 0:
        print("[skip] SDOILexport.zip exists")
        return z
    print("[download] SDOILexport.zip (one time)")
    data, h = get(ZIP_URL)
    open(z + ".part", "wb").write(data)
    os.replace(z + ".part", z)
    log({"name": "SDOILexport.zip", "url": ZIP_URL, "bytes": len(data), "last_modified": h.get("Last-Modified"), "status": "downloaded", "finished_utc": now()})
    print(f"  {len(data)/1e6:.1f} MB, Last-Modified {h.get('Last-Modified')}")
    return z


def cell(v):
    if v is None:
        return ""
    if isinstance(v, datetime.datetime):
        return v.strftime("%Y-%m-%d") if (v.hour, v.minute, v.second) == (0, 0, 0) else v.strftime("%Y-%m-%d %H:%M:%S")
    if isinstance(v, datetime.date):
        return v.strftime("%Y-%m-%d")
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    return str(v)


def convert_tables(z):
    import openpyxl  # stdlib has no xlsx reader; openpyxl is installed system-wide
    tdir = os.path.join(OUT, "tables")
    os.makedirs(tdir, exist_ok=True)
    with zipfile.ZipFile(z) as zf:
        entries = [i for i in zf.infolist() if not i.is_dir()]
        print("[zip] " + ", ".join(f"{i.filename} ({i.file_size/1e6:.1f} MB, {datetime.datetime(*i.date_time):%Y-%m-%d})" for i in entries))
        for info in entries:
            stem = os.path.splitext(os.path.basename(info.filename))[0]
            if not info.filename.lower().endswith(".xlsx"):
                target = os.path.join(tdir, os.path.basename(info.filename))
                if not os.path.exists(target):
                    open(target, "wb").write(zf.read(info))
                continue
            marker = os.path.join(tdir, f"{stem}.done")
            if os.path.exists(marker):
                continue
            wb = openpyxl.load_workbook(io.BytesIO(zf.read(info)), read_only=True, data_only=True)
            for ws in wb.worksheets:
                name = stem if len(wb.worksheets) == 1 else f"{stem}__{re.sub(r'[^A-Za-z0-9_-]+', '_', ws.title)}"
                out = os.path.join(tdir, name + ".csv")
                n = -1
                with open(out + ".part", "w", newline="", encoding="utf8") as f:
                    w = csv.writer(f)
                    for row in ws.iter_rows(values_only=True):
                        if n == -1 and all(v is None for v in row):
                            continue
                        w.writerow([cell(v) for v in row])
                        n += 1
                os.replace(out + ".part", out)
                built = datetime.datetime(*info.date_time).strftime("%Y-%m-%d")
                log({"name": f"tables/{name}.csv", "from": info.filename, "sheet": ws.title, "rows": n, "zip_entry_date": built, "status": "converted", "finished_utc": now()})
                print(f"[xlsx] {info.filename} / {ws.title} -> tables/{name}.csv: {n} rows (built {built})")
            wb.close()
            open(marker, "w").write(now())


def promote(table, out_name):
    src = os.path.join(OUT, "tables", table + ".csv")
    dst = os.path.join(OUT, out_name)
    if os.path.exists(dst):
        print(f"[skip] {out_name} exists")
        return
    if not os.path.exists(src):
        raise RuntimeError(f"table {table} not found in the export")
    with open(src, encoding="utf8", newline="") as f:
        rows = list(csv.reader(f))
    header = [h.strip() for h in rows[0]]
    # "API Number" / "API_Number" -> "API" so the build's API-column rule (API / api_number / api_no / apinum) matches
    api_i = next((i for i, h in enumerate(header) if re.fullmatch(r"api[ _]?(number|no|num)?", h, re.I)), None)
    renamed = None
    if api_i is not None and header[api_i].upper() != "API":
        renamed = header[api_i]
        header[api_i] = "API"
    ed_i = next((i for i, h in enumerate(header) if re.fullmatch(r"(table )?export[ _]?date", h, re.I)), None)
    export_date = max((r[ed_i] for r in rows[1:] if ed_i is not None and len(r) > ed_i and r[ed_i]), default=None)
    with open(dst + ".part", "w", newline="", encoding="utf8") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows[1:])
    os.replace(dst + ".part", dst)
    log({"name": out_name, "from": f"tables/{table}.csv", "rows": len(rows) - 1, "api_column_renamed_from": renamed,
         "export_date": export_date, "status": "OK", "finished_utc": now()})
    print(f"[table] {table} -> {out_name}: {len(rows)-1} rows")
    return len(rows) - 1


def pull_counties():
    p = os.path.join(OUT, "sd_counties.geojson")
    if os.path.exists(p):
        print("[skip] sd_counties.geojson exists")
        return
    data, _ = get(TIGER, {"where": "STATE='46'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                          "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    gj = json.loads(data)
    json.dump(gj, open(p, "w"))
    log({"name": "sd_counties.geojson", "service": TIGER, "rows": len(gj["features"]), "status": "OK", "finished_utc": now()})
    print(f"[counties] {len(gj['features'])} South Dakota counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    try:
        z = pull_zip()
        convert_tables(z)
        n = promote(*BASE_TABLE)
        for table, out_name in LAYERS.items():
            promote(table, out_name)
        sc = os.path.join(OUT, "source_count.json")
        if not os.path.exists(sc):
            with open(os.path.join(OUT, BASE_TABLE[1]), encoding="utf8", newline="") as f:
                n = sum(1 for _ in csv.reader(f)) - 1
            json.dump({"service": ZIP_URL + " (Wells.xlsx; DANR publishes no live count)", "count": n, "fetched_utc": now()}, open(sc, "w"), indent=1)
        pull_counties()
    except Blocked as e:
        log({"name": "BLOCKED", "error": str(e), "finished_utc": now()})
        print(f"[blocked] {e}", file=sys.stderr)
        sys.exit(2)
