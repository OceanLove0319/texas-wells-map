"""Arkansas Oil and Gas Commission (AOGC) wells, hosted by the Arkansas GIS Office -> data/raw/ar/.

AOGC's own site answers 403 and no bulk file is known, so the FeatureServer is paged politely: one
sequential request at a time, ~0.5 s sleep, retry with backoff, existing files are not re-downloaded.

  1. ar_wells.csv          (FEATURESERVICES/Utilities/FeatureServer/5 "OIL_AND_GAS_WELLS_AOGC", all
                            attributes + WGS84 point, keyset paging on objectid, 500 per page, ~77 pages)
                            + column API: the 10-digit API with the state code 03 ("03-139-81092").
                            `wellid` is the API number without its leading zero (e.g. 313981092); the
                            script only fills API when the value re-reads as 03 + 3-digit county + 5 digits.
  2. ar_codes.json         (welltype / wellstatus code -> description, taken from the layer's own
                            welltypedescription / wellstatusdescription columns; no network)
  3. source_count.json     (regulator's live count)
  4. ar_counties.geojson   (US Census TIGERweb counties for state FIPS 05, simplified)

Data date: the hosting AGOL item's modified date (item f0d47d40a8cc4841b107d3256bbb5656) and the newest
wellstatusdate are both written to pull_log.jsonl.

Usage: python3 -I scripts/pull_ar.py
"""
import csv, datetime, json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "ar")
LAYER = "https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Utilities/FeatureServer/5"
ITEM = "https://www.arcgis.com/sharing/rest/content/items/f0d47d40a8cc4841b107d3256bbb5656"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 0.5
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
to_date = lambda ms: datetime.datetime.fromtimestamp(ms / 1000, datetime.timezone.utc).strftime("%Y-%m-%d")


def get(url, params=None, retries=6):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=300) as r:
                data = r.read()
            time.sleep(SLEEP)
            j = json.loads(data)
            if isinstance(j, dict) and "error" in j:
                raise RuntimeError(j["error"])
            return j
        except Exception as e:
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 10 * attempt)
    raise RuntimeError(f"failed (stopping, do not hammer the server): {url}")


def log(rec):
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")


def api_from_wellid(wellid):
    d = re.sub(r"\D", "", str(wellid or ""))
    if len(d) == 9:
        d = "0" + d
    if len(d) == 10 and d.startswith("03"):
        return f"{d[:2]}-{d[2:5]}-{d[5:]}"
    return ""


def mdy(s):
    m = re.fullmatch(r"\s*(\d{1,2})/(\d{1,2})/(\d{4})\s*", str(s or ""))
    return f"{m.group(3)}-{int(m.group(1)):02d}-{int(m.group(2)):02d}" if m else None


def pull_wells():
    path = os.path.join(OUT, "ar_wells.csv")
    if os.path.exists(path):
        print("[skip] ar_wells.csv exists")
        return
    meta = get(LAYER, {"f": "json"})
    fields = [f["name"] for f in meta["fields"] if f["type"] != "esriFieldTypeGeometry"]
    dates = {f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeDate"}
    oid = meta.get("objectIdField") or "objectid"
    page = int(meta.get("maxRecordCount") or 500)
    count = get(f"{LAYER}/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    print(f"[layer] {meta['name']}: {count} records, {len(fields)} fields, page {page}")
    rows, last, newest, no_api = [], -1, None, 0
    while True:
        j = get(f"{LAYER}/query", {"where": f"{oid} > {last}", "outFields": "*", "orderByFields": f"{oid} ASC",
                                   "resultRecordCount": page, "returnGeometry": "true", "outSR": 4326, "f": "json"})
        feats = j.get("features", [])
        if not feats:
            break
        for ft in feats:
            a = ft["attributes"]
            for k in dates:
                if a.get(k) is not None:
                    a[k] = to_date(a[k])
            d = mdy(a.get("wellstatusdate"))
            if d and (newest is None or d > newest):
                newest = d
            api = api_from_wellid(a.get("wellid"))
            no_api += not api
            g = ft.get("geometry") or {}
            rows.append([a.get(k) for k in fields] + [g.get("x"), g.get("y"), api])
        last = feats[-1]["attributes"][oid]
        print(f"  {len(rows)}/{count}")
    with open(path + ".part", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(fields + ["lon_4326", "lat_4326", "API"])
        w.writerows(rows)
    os.replace(path + ".part", path)
    item = get(ITEM, {"f": "json"})
    rec = {"name": "ar_wells.csv", "service": LAYER, "rows": len(rows), "server_count": count, "rows_without_api": no_api,
           "newest_wellstatusdate": newest, "item_modified": to_date(item["modified"]) if item.get("modified") else None,
           "status": "OK" if len(rows) == count else "MISMATCH", "finished_utc": now()}
    log(rec)
    print(f"  wrote ar_wells.csv: {len(rows)} rows ({rec['status']}); item modified {rec['item_modified']}; newest status date {newest}")


def write_codes():
    """Code -> description for the legend, from the description columns that travel with each row."""
    out = {"welltype": {}, "wellstatus": {}}
    with open(os.path.join(OUT, "ar_wells.csv"), newline="") as f:
        for row in csv.DictReader(f):
            for code_col, desc_col in (("welltype", "welltypedescription"), ("wellstatus", "wellstatusdescription")):
                c, d = (row.get(code_col) or "").strip(), (row.get(desc_col) or "").strip()
                if c and d and c not in out[code_col]:
                    out[code_col][c] = d
    json.dump({"source": f"{LAYER}: welltypedescription / wellstatusdescription columns", "written_utc": now(),
               "fields": {k: dict(sorted(v.items())) for k, v in out.items()}}, open(os.path.join(OUT, "ar_codes.json"), "w"), indent=1)
    print(f"[codes] {len(out['welltype'])} well types, {len(out['wellstatus'])} statuses")


def pull_count():
    p = os.path.join(OUT, "source_count.json")
    if os.path.exists(p):
        print("[skip] source_count.json exists")
        return
    cnt = get(f"{LAYER}/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    json.dump({"service": LAYER, "count": cnt, "fetched_utc": now()}, open(p, "w"), indent=1)
    log({"name": "source_count.json", "service": LAYER, "server_count": cnt, "status": "OK", "finished_utc": now()})
    print(f"[count] AOGC layer: {cnt:,} wells")


def pull_counties():
    p = os.path.join(OUT, "ar_counties.geojson")
    if os.path.exists(p):
        print("[skip] ar_counties.geojson exists")
        return
    gj = get(TIGER, {"where": "STATE='05'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                     "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    json.dump(gj, open(p, "w"))
    print(f"[counties] {len(gj['features'])} Arkansas counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    pull_count()
    pull_wells()
    write_codes()
    pull_counties()
