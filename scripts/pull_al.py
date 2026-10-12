"""Alabama State Oil and Gas Board (OGB, Geological Survey of Alabama) one-time snapshot -> data/raw/al/.

The OGB MapServer advertises 25,000 records per request but answers HTTP 500 to a full-layer request,
so layers are paged with resultOffset at 2,000 per request (9 requests for the well layer). Polite:
sequential, ~0.5 s sleep, retry with backoff, existing files are not re-downloaded. No recurring pulls.

  1. al_wells.csv              (OGB/map/MapServer/3 "WebWell Search Layer": the complete well list, 17,373 rows,
                                all attributes + WGS84 point. The service prefixes field names with
                                WEBOGBSDE.DBO.WebWell_Prj. (stripped) and joins WEBOGBSDE.DBO.BottomHoleLocations.
                                fields (kept with a BHL_ prefix). Layer 2 "Wells" (16,197) omits the 1,166
                                directionally drilled wells that have a bottom-hole record, so layer 3 is the base;
                                10 APIs repeat in layer 3 (one row per bottom hole).)
  2. al_wells_layer2.txt       (layer 2 "Wells", same schema; reconciliation only - .txt so the build ignores it)
  3. al_surface_locations.csv  (layer 5 "Surface Location" of directionally drilled wells; APINumber copied to API)
  4. al_bhl_locations.csv      (layer 7 "BHL Location", bottom-hole points; APINumber copied to API)
  5. al_codes.json             (WellType / WellStatus code -> description from the TypeDesc / StatusDesc columns)
  6. al_county_meridians.json  (county -> CadNSDI meridian learned from wells with coordinates; the layer has
                                SecNum/Township/Range but no meridian and Alabama has two: Huntsville 16, St. Stephens 25)
  7. source_count.json         (live counts of layers 3 and 2)
  8. al_counties.geojson       (US Census TIGERweb counties for state FIPS 01, simplified)

API is "01-097-20351-00-00": 14 digits with the state code 01.
Data date: the layer's last_edited_date is not usable (thousands of rows are dated after the pull date), so the
header shows the pull date (finished_utc); the newest non-future dates are logged for the report.

Usage: python3 -I scripts/pull_al.py
"""
import csv, datetime, json, os, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "al")
SVC = "https://map.ogb.state.al.us/arcgis/rest/services/OGB/map/MapServer"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 0.5
PREFIX = "WEBOGBSDE.DBO.WebWell_Prj."
BHL_PREFIX = "WEBOGBSDE.DBO.BottomHoleLocations."
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
to_date = lambda ms: datetime.datetime.fromtimestamp(ms / 1000, datetime.timezone.utc).strftime("%Y-%m-%d")


def get(url, params=None, retries=6):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=600) as r:
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


def short(name):
    if name.startswith(PREFIX):
        return name[len(PREFIX):]
    if name.startswith(BHL_PREFIX):
        return "BHL_" + name[len(BHL_PREFIX):]
    return name


def pull_layer(layer, out_name, add_api_from=None):
    path = os.path.join(OUT, out_name)
    if os.path.exists(path):
        print(f"[skip] {out_name} exists")
        return
    meta = get(f"{SVC}/{layer}", {"f": "json"})
    raw_fields = [f["name"] for f in meta["fields"] if f["type"] != "esriFieldTypeGeometry"]
    dates = {f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeDate"}
    oid = next((f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeOID"), None)
    page = min(int(meta.get("maxRecordCount") or 2000), 2000)  # 25,000 in one request -> server error 500
    count = get(f"{SVC}/{layer}/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    print(f"[layer] {layer} {meta['name']}: {count} records, {len(raw_fields)} fields, page {page}")
    rows, offset = [], 0
    while True:  # resultOffset paging, ordered by the object id
        j = get(f"{SVC}/{layer}/query", {"where": "1=1", "outFields": "*", "orderByFields": f"{oid} ASC", "resultOffset": offset,
                                         "resultRecordCount": page, "returnGeometry": "true", "outSR": 4326, "f": "json"})
        feats = j.get("features", [])
        if not feats:
            break
        for ft in feats:
            a = ft["attributes"]
            for k in dates:
                if a.get(k) is not None:
                    a[k] = to_date(a[k])
            g = ft.get("geometry") or {}
            row = [a.get(k) for k in raw_fields] + [g.get("x"), g.get("y")]
            if add_api_from:
                row.append(a.get(add_api_from) or "")
            rows.append(row)
        offset += len(feats)
        print(f"  {out_name} {len(rows)}/{count}")
        if len(feats) < page or not j.get("exceededTransferLimit", False):
            break
    with open(path + ".part", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow([short(n) for n in raw_fields] + ["lon_4326", "lat_4326"] + (["API"] if add_api_from else []))
        w.writerows(rows)
    os.replace(path + ".part", path)
    rec = {"name": out_name, "service": f"{SVC}/{layer}", "layer_name": meta["name"], "rows": len(rows), "server_count": count,
           "status": "OK" if len(rows) == count else "MISMATCH", "finished_utc": now()}
    log(rec)
    print(f"  wrote {out_name}: {len(rows)} rows ({rec['status']})")


def write_codes_and_dates():
    """Code dictionary from the description columns, and the date facts for the report (no network)."""
    codes = {"WellType": {}, "WellStatus": {}}
    newest, future, cols = {}, 0, ("last_edited_date", "PermitDate", "SpudDate", "StatusDate", "FirstProductionDate")
    today = now()[:10]
    with open(os.path.join(OUT, "al_wells.csv"), newline="") as f:
        for row in csv.DictReader(f):
            for code_col, desc_col in (("WellType", "TypeDesc"), ("WellStatus", "StatusDesc")):
                c, d = (row.get(code_col) or "").strip(), (row.get(desc_col) or "").strip()
                if c and d and c not in codes[code_col]:
                    codes[code_col][c] = d
            if (row.get("last_edited_date") or "") > today:
                future += 1
            for c in cols:
                v = row.get(c) or ""
                if v and v <= today:
                    newest[c] = max(newest.get(c, ""), v)
    json.dump({"source": f"{SVC}/3: TypeDesc / StatusDesc columns", "written_utc": now(),
               "fields": {k: dict(sorted(v.items())) for k, v in codes.items()}}, open(os.path.join(OUT, "al_codes.json"), "w"), indent=1)
    log({"name": "al_wells.csv (dates)", "newest_non_future_dates": newest, "rows_with_last_edited_date_after_pull": future,
         "note": "last_edited_date is not a usable data date; the header shows the pull date", "finished_utc": now()})
    print(f"[codes] {len(codes['WellType'])} well types, {len(codes['WellStatus'])} statuses; newest dates {newest}; {future} rows edited 'after' the pull")


def derive_county_meridians():
    """County -> CadNSDI meridian code (PLSSID chars 3-4), learned from wells with coordinates."""
    grid = os.path.join(ROOT, "data", "raw", "plss", "AL_sections.jsonl")
    if not os.path.exists(grid):
        print("[meridians] skip: run python3 -I scripts/plss_pull.py AL first")
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
    with open(os.path.join(OUT, "al_wells.csv"), newline="") as f:
        for row in csv.DictReader(f):
            try:
                x, y = float(row["lon_4326"]), float(row["lat_4326"])
                t, r, sec = int(float(row["Township"])), int(float(row["Range"])), int(row["SecNum"])
                td, rd = row["TownshipDir"].strip().upper()[:1], row["RangeDir"].strip().upper()[:1]
            except (ValueError, KeyError):
                continue
            if not x or not y or td not in ("N", "S") or rd not in ("E", "W"):
                continue
            hits = [m for m in meridians if (b := boxes.get((m, t, td, r, rd, sec))) and b[0] - 0.01 <= x <= b[2] + 0.01 and b[1] - 0.01 <= y <= b[3] + 0.01]
            c = tally.setdefault(row["CountyName"].strip().upper(), {})
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
    json.dump({"source": "derived: OGB wells with coordinates located in BLM CadNSDI AL sections by SecNum/Township/Range; "
                         "meridian = CadNSDI PLSSID characters 3-4 (16 Huntsville, 25 St. Stephens)", "written_utc": now(),
               "wells_located": located, "wells_with_coordinates_not_located": unlocated, "meridians_in_grid": meridians,
               "counties": result}, open(os.path.join(OUT, "al_county_meridians.json"), "w"), indent=1)
    print(f"[meridians] {located} wells located, {unlocated} not; {sum(1 for v in result.values() if v['meridian'])}/{len(result)} counties assigned")


def pull_count():
    p = os.path.join(OUT, "source_count.json")
    if os.path.exists(p):
        print("[skip] source_count.json exists")
        return
    c3 = get(f"{SVC}/3/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    c2 = get(f"{SVC}/2/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    json.dump({"service": f"{SVC}/3", "count": c3, "layer2_wells_count": c2, "fetched_utc": now()}, open(p, "w"), indent=1)
    log({"name": "source_count.json", "service": f"{SVC}/3", "server_count": c3, "layer2_count": c2, "status": "OK", "finished_utc": now()})
    print(f"[count] OGB layer 3 WebWell Search: {c3:,}; layer 2 Wells: {c2:,}")


def pull_counties():
    p = os.path.join(OUT, "al_counties.geojson")
    if os.path.exists(p):
        print("[skip] al_counties.geojson exists")
        return
    gj = get(TIGER, {"where": "STATE='01'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                     "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    json.dump(gj, open(p, "w"))
    print(f"[counties] {len(gj['features'])} Alabama counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    pull_count()
    pull_layer(3, "al_wells.csv")
    pull_layer(2, "al_wells_layer2.txt")
    pull_layer(5, "al_surface_locations.csv", add_api_from="APINumber")
    pull_layer(7, "al_bhl_locations.csv", add_api_from="APINumber")
    write_codes_and_dates()
    derive_county_meridians()
    pull_counties()
