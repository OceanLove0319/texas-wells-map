"""Mississippi State Oil and Gas Board (MSOGB) one-time snapshot -> data/raw/ms/.

MSOGB regenerates bulk files every business day under dated names on www.ogb.state.ms.us/Downloads.
Its robots.txt disallows crawlers; Ocean approved ONE polite download of the daily well CSV (and the
small well shapefile for row-count reconciliation). This script makes three sequential requests in total
(downloads page, CSV, shapefile zip), sleeps between them, and never runs on a schedule. Files that
already exist are not downloaded again. Everything after the download works offline.

  1. ms_wells_download.orig   (the newest YYYYMMDD_All_WellInfoList.csv exactly as served)
  2. ms_wells.csv             (the same rows re-written with standard CSV quoting: the served file has stray
                               double quotes inside unquoted fields, which the build's strict parser rejects.
                               Every column kept. API10 = 10-digit API with the state code 23, API14 = 14-digit.
                               Lat/Long are NAD83 per the column names and the shapefile .prj. DirectURL = well page)
  3. ms_wells_shapefile.zip   (YYYYMMDD_Wells.zip; its .dbf record count and .prj are read for the report)
  4. source_count.json        (rows in the CSV, rows with coordinates, shapefile point count, file date)
  5. ms_counties.geojson      (US Census TIGERweb counties for state FIPS 28, simplified)
  6. ms_county_meridians.json (MSOGB gives Sec/Twn/Rng but no meridian, and Mississippi is surveyed from seven
                               meridians. For each county, the wells that DO have coordinates are located in the BLM
                               grid (data/raw/plss/MS_sections.jsonl) and the meridian whose section contains them is
                               tallied; a county gets a meridian only when >= 90% of its located wells agree and at
                               least 10 wells were located. Used to place the wells without coordinates.)

Usage: python3 -I scripts/pull_ms.py
"""
import csv, datetime, json, os, re, struct, sys, time, urllib.error, urllib.parse, urllib.request, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "ms")
SITE = "https://www.ogb.state.ms.us"
PAGE = f"{SITE}/downloadsnomenu.php"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential; approved single download)"
SLEEP = 1.0
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
iso = lambda yyyymmdd: f"{yyyymmdd[:4]}-{yyyymmdd[4:6]}-{yyyymmdd[6:]}"


def get(url, params=None, retries=3):
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
            if e.code in (401, 403, 429):  # blocked: stop immediately, do not retry
                raise RuntimeError(f"blocked ({e.code}) at {url} - stopping, report to Ocean")
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 10 * attempt)
        except Exception as e:
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 10 * attempt)
    raise RuntimeError(f"failed (stopping): {url}")


def log(rec):
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")


def newest_links():
    """Scrape the downloads page once; return the newest WellInfoList CSV and Wells shapefile paths + dates."""
    html, _ = get(PAGE)
    html = html.decode("utf-8", "replace")
    csvs = sorted(set(re.findall(r"(Downloads/WellInfoList/(\d{8})_All_WellInfoList\.csv)", html)), key=lambda t: t[1])
    shps = sorted(set(re.findall(r"(Downloads/WellShapeFiles/(\d{8})_Wells\.zip)", html)), key=lambda t: t[1])
    if not csvs:
        raise RuntimeError("no WellInfoList CSV link found on the downloads page (page layout changed?)")
    return csvs[-1], (shps[-1] if shps else None)


def download(url_path, out_name):
    p = os.path.join(OUT, out_name)
    if os.path.exists(p) and os.path.getsize(p) > 0:
        print(f"[skip] {out_name} exists")
        return
    print(f"[download] {url_path}")
    data, h = get(f"{SITE}/{url_path}")
    open(p + ".part", "wb").write(data)
    os.replace(p + ".part", p)
    log({"name": out_name, "url": f"{SITE}/{url_path}", "bytes": len(data), "last_modified": h.get("Last-Modified"),
         "file_date": iso(re.search(r"(\d{8})_", url_path).group(1)), "status": "downloaded", "finished_utc": now()})
    print(f"  {len(data)/1e6:.1f} MB")


def normalize_csv(file_date):
    """ms_wells_download.orig -> ms_wells.csv with standard quoting; returns (rows, rows with coordinates, header)."""
    src, dst = os.path.join(OUT, "ms_wells_download.orig"), os.path.join(OUT, "ms_wells.csv")
    rows, with_xy, header, li, lo = 0, 0, None, None, None
    with open(src, newline="", encoding="utf-8-sig", errors="replace") as f, open(dst + ".part", "w", newline="") as g:
        w = csv.writer(g)
        for rec in csv.reader(f):  # Python's reader keeps a stray quote inside an unquoted field as a literal character
            if header is None:
                header = [h.strip() for h in rec]
                li = next((i for i, h in enumerate(header) if h.lower().startswith("lat")), None)
                lo = next((i for i, h in enumerate(header) if h.lower().startswith("long")), None)
                w.writerow(header)
                continue
            w.writerow(rec)
            rows += 1
            try:
                if li is not None and lo is not None and float(rec[li]) and float(rec[lo]):
                    with_xy += 1
            except (ValueError, IndexError):
                pass
    os.replace(dst + ".part", dst)
    log({"name": "ms_wells.csv", "from": "ms_wells_download.orig", "rows": rows, "rows_with_coordinates": with_xy,
         "file_date": file_date, "status": "normalized", "finished_utc": now()})
    print(f"[normalize] ms_wells.csv: {rows} rows, {with_xy} with coordinates")
    return rows, with_xy, header


def shapefile_summary(zip_path):
    with zipfile.ZipFile(zip_path) as z:
        dbf = next((n for n in z.namelist() if n.lower().endswith(".dbf")), None)
        prj = next((n for n in z.namelist() if n.lower().endswith(".prj")), None)
        n = struct.unpack("<I", z.read(dbf)[4:8])[0] if dbf else None
        return n, (z.read(prj).decode("ascii", "replace") if prj else None)


def derive_county_meridians():
    grid = os.path.join(ROOT, "data", "raw", "plss", "MS_sections.jsonl")
    out = os.path.join(OUT, "ms_county_meridians.json")
    if not os.path.exists(grid):
        print("[meridians] skip: run python3 -I scripts/plss_pull.py MS first")
        return
    boxes = {}
    for line in open(grid):
        j = json.loads(line)
        p = j["plssid"]  # ST MM TTT t D RRR r D d
        if p[7] != "0" or p[12] != "0" or not j.get("rings") or not str(j["sec"]).isdigit():
            continue
        key = (p[2:4], int(p[4:7]), p[8], int(p[9:12]), p[13], int(j["sec"]))
        b = boxes.setdefault(key, [999.0, 999.0, -999.0, -999.0])
        for ring in j["rings"]:
            for x, y in ring:
                b[0], b[1], b[2], b[3] = min(b[0], x), min(b[1], y), max(b[2], x), max(b[3], y)
    meridians = sorted({k[0] for k in boxes})
    tally, located, unlocated = {}, 0, 0
    with open(os.path.join(OUT, "ms_wells.csv"), newline="", encoding="utf-8-sig", errors="replace") as f:
        for row in csv.DictReader(f):
            try:
                x, y = float(row["Long(NAD83)"]), float(row["Lat(NAD83)"])
                t, r, sec = int(row["Twn"]), int(row["Rng"]), int(row["Sec"])
                td, rd = row["TwnDir"].strip().upper()[:1], row["RngDir"].strip().upper()[:1]
            except (ValueError, KeyError):
                continue
            if not x or not y or td not in ("N", "S") or rd not in ("E", "W"):
                continue
            hits = [m for m in meridians if (b := boxes.get((m, t, td, r, rd, sec))) and b[0] - 0.01 <= x <= b[2] + 0.01 and b[1] - 0.01 <= y <= b[3] + 0.01]
            c = tally.setdefault(row["County"].strip().upper(), {})
            if len(hits) == 1:
                c[hits[0]] = c.get(hits[0], 0) + 1
                located += 1
            else:
                unlocated += 1
    result = {}
    for county, c in sorted(tally.items()):
        n = sum(c.values())
        top = max(c, key=c.get) if c else None
        ok = top is not None and n >= 10 and c[top] / n >= 0.9
        result[county] = {"meridian": top if ok else None, "located_wells": n, "counts": dict(sorted(c.items()))}
    json.dump({"source": "derived: MSOGB wells with coordinates located in BLM CadNSDI MS sections by Sec/Twn/Rng; "
                         "meridian = CadNSDI PLSSID characters 3-4", "written_utc": now(), "wells_located": located,
               "wells_with_coordinates_not_located": unlocated, "meridians_in_grid": meridians, "counties": result}, open(out, "w"), indent=1)
    print(f"[meridians] {located} wells located, {unlocated} not; {sum(1 for v in result.values() if v['meridian'])}/{len(result)} counties assigned")


def main():
    os.makedirs(OUT, exist_ok=True)
    count_p = os.path.join(OUT, "source_count.json")
    if os.path.exists(os.path.join(OUT, "ms_wells.csv")) and os.path.exists(count_p):
        print("[skip] ms_wells.csv and source_count.json exist")
    else:
        if os.path.exists(os.path.join(OUT, "ms_wells_download.orig")):
            csv_path = json.loads([l for l in open(os.path.join(OUT, "pull_log.jsonl")) if '"ms_wells_download.orig"' in l][-1])["url"][len(SITE) + 1:]
            csv_date = re.search(r"(\d{8})_", csv_path).group(1)
        else:
            (csv_path, csv_date), shp = newest_links()
            print(f"[page] newest CSV {csv_date}, shapefile {shp[1] if shp else 'none'}")
            download(csv_path, "ms_wells_download.orig")
            if shp:
                download(shp[0], "ms_wells_shapefile.zip")
        rows, with_xy, header = normalize_csv(iso(csv_date))
        shp_n, prj = (None, None)
        if os.path.exists(os.path.join(OUT, "ms_wells_shapefile.zip")):
            shp_n, prj = shapefile_summary(os.path.join(OUT, "ms_wells_shapefile.zip"))
        sc = {"service": f"{SITE}/{csv_path}", "count": rows, "rows_with_coordinates": with_xy, "shapefile_points": shp_n,
              "shapefile_prj": prj, "file_date": iso(csv_date), "columns": header, "fetched_utc": now()}
        json.dump(sc, open(count_p, "w"), indent=1)
        log({"name": "source_count.json", "rows": rows, "rows_with_coordinates": with_xy, "shapefile_points": shp_n, "status": "OK", "finished_utc": now()})
        print(f"[csv] {rows} rows, {with_xy} with coordinates; shapefile {shp_n} points; prj: {(prj or '')[:60]}")
    p = os.path.join(OUT, "ms_counties.geojson")
    if os.path.exists(p):
        print("[skip] ms_counties.geojson exists")
    else:
        data, _ = get(TIGER, {"where": "STATE='28'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                              "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
        gj = json.loads(data)
        json.dump(gj, open(p, "w"))
        print(f"[counties] {len(gj['features'])} Mississippi counties")
    derive_county_meridians()


if __name__ == "__main__":
    main()
