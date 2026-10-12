"""Missouri DNR / Missouri Geological Survey oil and gas wells -> data/raw/mo/.

The layer stopped updating in 2021 (metadata pubdate 2021-08-30, newest spud 2021-06); treat it as a
static snapshot. Paged politely: one sequential request at a time, ~0.5 s sleep, retry with backoff,
existing files are not re-downloaded. No recurring pulls.

  1. mo_wells.csv         (geology/oil_gas_wells/MapServer/0, all attributes + WGS84 point, keyset paging
                           on OBJECTID, 2000 per page, 6 pages) + column API = "24-" + API_NUMBER
                           (API_NUMBER is "037-20070", without the state code 24). Document links
                           (PERMIT_LINK, DOWN_LINK, STRAT_LINK) are kept as columns.
  2. source_count.json    (regulator's live count)
  3. mo_metadata.xml      (FGDC metadata; its pubdate is the data date written to pull_log.jsonl)
  4. mo_counties.geojson  (US Census TIGERweb counties for state FIPS 29, simplified)

Usage: python3 -I scripts/pull_mo.py
"""
import csv, datetime, json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "mo")
LAYER = "https://gis.dnr.mo.gov/host/rest/services/geology/oil_gas_wells/MapServer/0"
META_XML = "https://info.mo.gov/dnr/DNR_GIS/metadata/GEOLOGY.OIL_GAS_WELLS.xml"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 0.5
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
to_date = lambda ms: datetime.datetime.fromtimestamp(ms / 1000, datetime.timezone.utc).strftime("%Y-%m-%d")


def get(url, params=None, binary=False, retries=6):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=300) as r:
                data = r.read()
            time.sleep(SLEEP)
            if binary:
                return data
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


def api_of(api_number):
    m = re.fullmatch(r"\s*(\d{3})-?(\d{5})\s*", str(api_number or ""))
    return f"24-{m.group(1)}-{m.group(2)}" if m else ""


def pull_metadata():
    p = os.path.join(OUT, "mo_metadata.xml")
    if not os.path.exists(p):
        data = get(META_XML, binary=True)
        open(p, "wb").write(data)
    txt = open(p, "r", errors="replace").read()
    m = re.search(r"<pubdate>(\d{4})(\d{2})(\d{2})</pubdate>", txt)
    pub = f"{m.group(1)}-{m.group(2)}-{m.group(3)}" if m else None
    freq = re.search(r"<update>([^<]+)</update>", txt)
    print(f"[metadata] pubdate {pub}, update frequency {freq.group(1) if freq else 'n/a'}")
    return pub, (freq.group(1).strip() if freq else None)


def pull_wells():
    path = os.path.join(OUT, "mo_wells.csv")
    if os.path.exists(path):
        print("[skip] mo_wells.csv exists")
        return
    meta = get(LAYER, {"f": "json"})
    fields = [f["name"] for f in meta["fields"] if f["type"] != "esriFieldTypeGeometry"]
    dates = {f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeDate"}
    oid = next(f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeOID")
    page = int(meta.get("maxRecordCount") or 2000)
    count = get(f"{LAYER}/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    print(f"[layer] {meta['name']}: {count} records, {len(fields)} fields, page {page}")
    rows, last, newest, no_api = [], -1, {}, 0
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
                    if k in ("STATUSDATE", "SPUD_DATE", "PERMIT_DAT", "TYPE_DATE") and a[k] <= now()[:10]:
                        newest[k] = max(newest.get(k, ""), a[k])
            api = api_of(a.get("API_NUMBER"))
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
    pub, freq = pull_metadata()
    rec = {"name": "mo_wells.csv", "service": LAYER, "rows": len(rows), "server_count": count, "rows_without_api": no_api,
           "metadata_pubdate": pub, "metadata_update_frequency": freq, "newest_dates": newest,
           "status": "OK" if len(rows) == count else "MISMATCH", "finished_utc": now()}
    log(rec)
    print(f"  wrote mo_wells.csv: {len(rows)} rows ({rec['status']}); pubdate {pub}; newest {newest}")


def pull_count():
    p = os.path.join(OUT, "source_count.json")
    if os.path.exists(p):
        print("[skip] source_count.json exists")
        return
    cnt = get(f"{LAYER}/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    json.dump({"service": LAYER, "count": cnt, "fetched_utc": now()}, open(p, "w"), indent=1)
    log({"name": "source_count.json", "service": LAYER, "server_count": cnt, "status": "OK", "finished_utc": now()})
    print(f"[count] MoDNR layer: {cnt:,} wells")


def pull_counties():
    p = os.path.join(OUT, "mo_counties.geojson")
    if os.path.exists(p):
        print("[skip] mo_counties.geojson exists")
        return
    gj = get(TIGER, {"where": "STATE='29'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                     "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    json.dump(gj, open(p, "w"))
    print(f"[counties] {len(gj['features'])} Missouri counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    pull_count()
    pull_wells()
    pull_counties()
