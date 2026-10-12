"""Oregon DOGAMI (Mineral Land Regulation and Reclamation, MLRR) one-time snapshot -> data/raw/or/.

DATA LAST UPDATED 2021: DOGAMI publishes its oil and gas permit list as a static spreadsheet,
OG_Permits_01-29-2021.xls (page https://www.oregon.gov/dogami/mlrr/pages/oilgas-logs.aspx). There is
no REST service for Oregon wells, so the snapshot is as of 2021-01-29 whatever day it is pulled.

Polite by design: ONE download of the spreadsheet (skipped when it already exists), one small Census
request for county outlines. No recurring pulls.

  1. OG_Permits_01-29-2021.xls   the DOGAMI spreadsheet (two sheets: "prmqry_E_OG_Permits_Other",
                                 all permits that are not currently permitted, and "PermittedOnly")
  2. or_wells.csv                base file: both sheets, every column kept, SRC_SHEET added, DOGAMI's
                                 "99-999-99999 / Dummy File" test row dropped,
                                 ApplicationDate converted from an Excel serial to YYYY-MM-DD,
                                 LON_4326/LAT_4326 copied from Longitude/Latitude (datum not stated)
  3. or_counties.geojson         US Census TIGERweb counties for state FIPS 41, simplified

Oregon has NO API numbers in this file. The DOGAMI PermitID is written in API form ("36-009-00015",
sometimes with a "-01" sidetrack suffix): 36 + 3-digit county code + 5-digit serial. The app keys
Oregon wells by that PermitID (apiField), so search works as 36-009-00015. Whether these PermitIDs
are registered API numbers is unverified.

Usage: python3 -I scripts/pull_or.py
"""
import csv, datetime, json, os, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "or")
XLS_URL = "https://www.oregon.gov/dogami/mlrr/spreadsheets/OG_Permits_01-29-2021.xls"
XLS = "OG_Permits_01-29-2021.xls"
DATA_DATE = "2021-01-29"  # from the file name and the DOGAMI page
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 0.5
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get(url, params=None, retries=4, timeout=300):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
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


def pull_xls():
    p = os.path.join(OUT, XLS)
    if os.path.exists(p) and os.path.getsize(p) > 0:
        print(f"[skip] {XLS} exists")
        return p
    print(f"[download] {XLS}")
    data, h = get(XLS_URL)
    open(p + ".part", "wb").write(data)
    os.replace(p + ".part", p)
    log({"name": XLS, "url": XLS_URL, "bytes": len(data), "last_modified": h.get("Last-Modified"),
         "content_type": h.get("Content-Type"), "status": "downloaded", "finished_utc": now()})
    return p


def cell_text(sheet, book, r, c, name):
    import xlrd
    cell = sheet.cell(r, c)
    v = cell.value
    if cell.ctype == xlrd.XL_CELL_EMPTY:
        return ""
    if name == "ApplicationDate" and cell.ctype in (xlrd.XL_CELL_NUMBER, xlrd.XL_CELL_DATE) and v:
        try:
            return datetime.datetime(*xlrd.xldate_as_tuple(v, book.datemode)).strftime("%Y-%m-%d")
        except Exception:
            return str(v)
    if cell.ctype == xlrd.XL_CELL_NUMBER and float(v).is_integer() and name not in ("Latitude", "Longitude"):
        return str(int(v))
    return str(v).strip()


def build_base(xls):
    import xlrd  # stdlib has no .xls reader; xlrd 2.x reads legacy .xls only
    book = xlrd.open_workbook(xls)
    rows, header, dropped = [], None, []
    for sheet in book.sheets():
        names = [str(sheet.cell_value(0, c)).strip() for c in range(sheet.ncols)]
        if header is None:
            header = names + ["SRC_SHEET", "LON_4326", "LAT_4326"]
        elif names != header[: len(names)]:
            raise RuntimeError(f"sheet {sheet.name} has a different header: {names}")
        for r in range(1, sheet.nrows):
            row = {n: cell_text(sheet, book, r, c, n) for c, n in enumerate(names)}
            if not any(row.values()):
                continue
            if str(row.get("PermitID", "")).startswith("99-999"):
                dropped.append(row.get("PermitID"))  # DOGAMI's own "Dummy File" test row, not a well
                continue
            row["SRC_SHEET"] = sheet.name
            row["LON_4326"], row["LAT_4326"] = row.get("Longitude", ""), row.get("Latitude", "")
            rows.append(row)
        print(f"  sheet {sheet.name}: {sheet.nrows - 1} rows")
    p = os.path.join(OUT, "or_wells.csv")
    with open(p + ".part", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=header)
        w.writeheader()
        w.writerows(rows)
    os.replace(p + ".part", p)
    log({"name": "or_wells.csv", "from": XLS, "rows": len(rows), "dropped_test_rows": dropped, "data_date": DATA_DATE, "status": "written", "finished_utc": now()})
    json.dump({"service": XLS_URL, "count": len(rows), "note": "static spreadsheet dated 2021-01-29; no live service exists",
               "fetched_utc": now()}, open(os.path.join(OUT, "source_count.json"), "w"), indent=1)
    print(f"[write] or_wells.csv: {len(rows):,} rows (data date {DATA_DATE})")


def pull_counties():
    p = os.path.join(OUT, "or_counties.geojson")
    if os.path.exists(p):
        print("[skip] or_counties.geojson exists")
        return
    data, _ = get(TIGER, {"where": "STATE='41'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                          "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    gj = json.loads(data)
    json.dump(gj, open(p, "w"))
    log({"name": "or_counties.geojson", "service": TIGER, "features": len(gj["features"]), "status": "OK", "finished_utc": now()})
    print(f"[counties] {len(gj['features'])} Oregon counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    build_base(pull_xls())
    pull_counties()
