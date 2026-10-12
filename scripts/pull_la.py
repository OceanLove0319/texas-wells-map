"""Louisiana Office of Conservation (SONRIS GIS) one-time snapshot -> data/raw/la/.

Louisiana publishes no bulk well file, so the SONRIS ArcGIS MapServer is paged politely: one
sequential request at a time (well under the 2-concurrent limit), ~0.5 s sleep between requests,
retry with backoff, and files that already exist are not downloaded again. No recurring pulls.

  1. la_wells.csv             (DNRSvc/OC/MapServer/0 "Oil/Gas Wells", all attributes + WGS84 point,
                               keyset paging on OBJECTID, 1000 per page, about 248 pages)
  2. la_bottom_holes.csv      (layer 1 "Oil/Gas Well Bottom Holes and Bores"; has no API column, so
                               API_NUM is added from the base file via WELL_SERIAL_NUM)
  3. la_injection_wells.csv   (layer 9 "Injection Wells", all attributes)
     Both layer files also get a column named API (= API_NUM): the build joins per-well layers on a column
     named API / api_number / api_no / apinum, and SONRIS's API_NUM is not one of those names.
  4. la_codes.json            (code -> label for WELL_STATUS_CODE / PRODUCT_TYPE_CODE /
                               WELL_CLASS_TYPE_CODE, built from SONRIS's own legend renderer:
                               LEGEND = status code (2) + product code (2) [+ UIC class]; the product
                               codes 00/10/20/25 are also documented in the Office of Conservation
                               data-entry guides FC3.pdf / FC5.pdf)
  5. source_count.json        (regulator's live count, returnCountOnly)
  6. la_counties.geojson      (US Census TIGERweb parishes for state FIPS 22, simplified)
  7. TYPE_GROUP column        (added to la_wells.csv, no network). SONRIS has no well-type field: only a product
                               code (00 none / 10 oil / 20 gas / 25 dry gas) and a status code, and their 111
                               combinations (LEGEND_DESC) are too many for one legend. TYPE_GROUP is the legend
                               "type": the product label for statuses that still describe a product (active,
                               shut-in, orphan, temporarily abandoned, ...), and the status group for terminal or
                               product-less statuses (plugged and abandoned, dry and plugged, shut-in dry hole,
                               plugged back, injection/UIC, permit, virtual/bad data). Raw codes stay in the row.

API_NUM is already a 14-digit API that starts with the state code 17.
Coordinates: SURFACE_LAT/LONG_DEC_DEG (SONRIS decimal degrees, NAD83 per SURFACE_UTM83_X/Y naming)
plus lon_4326/lat_4326 from the service geometry reprojected to WGS84 by the server.

Usage: python3 -I scripts/pull_la.py
"""
import csv, datetime, json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "la")
SVC = "https://sonris-gis.dnr.la.gov/arcgis/rest/services/DNRSvc/OC/MapServer"
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
        except Exception as e:  # network hiccup or server error: back off and retry
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 10 * attempt)
    raise RuntimeError(f"failed (stopping, do not hammer the server): {url}")


def log(rec):
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")


def layer_meta(layer):
    meta = get(f"{SVC}/{layer}", {"f": "json"})
    fields = [f["name"] for f in meta["fields"] if f["type"] not in ("esriFieldTypeGeometry", "esriFieldTypeBlob")]
    dates = {f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeDate"}
    oid = next(f["name"] for f in meta["fields"] if f["type"] == "esriFieldTypeOID")
    return meta, fields, dates, oid


def pull_layer(layer, out_name, extra=None):
    """Page one layer (keyset on OBJECTID) into a CSV with every attribute + lon_4326/lat_4326."""
    path = os.path.join(OUT, out_name)
    if os.path.exists(path):
        print(f"[skip] {out_name} exists")
        return
    meta, fields, dates, oid = layer_meta(layer)
    page = int(meta.get("maxRecordCount") or 1000)
    count = get(f"{SVC}/{layer}/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    print(f"[layer] {layer} {meta['name']}: {count} records, {len(fields)} fields, page {page}")
    rows, last, maxupd = [], -1, None
    while True:
        j = get(f"{SVC}/{layer}/query", {
            "where": f"{oid} > {last}", "outFields": "*", "orderByFields": f"{oid} ASC",
            "resultRecordCount": page, "returnGeometry": "true", "outSR": 4326, "f": "json"})
        feats = j.get("features", [])
        if not feats:
            break
        for ft in feats:
            a = ft["attributes"]
            if a.get("GIS_UPD_DATE"):
                maxupd = max(maxupd or 0, a["GIS_UPD_DATE"])
            for k in dates:
                if a.get(k) is not None:
                    a[k] = to_date(a[k])
            g = ft.get("geometry") or {}
            x, y = g.get("x"), g.get("y")
            if x is None and g.get("paths"):  # bottom-hole layer: polyline surface -> bottom hole; keep the end point
                x, y = g["paths"][0][-1]
            row = [a.get(k) for k in fields] + [x, y]
            if extra:
                row += extra(a)
            rows.append(row)
        last = feats[-1]["attributes"][oid]
        print(f"  {out_name} {len(rows)}/{count}")
    with open(path + ".part", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(fields + ["lon_4326", "lat_4326"] + (extra.names if extra else []))
        w.writerows(rows)
    os.replace(path + ".part", path)
    rec = {"name": out_name, "service": f"{SVC}/{layer}", "layer_name": meta["name"], "rows": len(rows), "server_count": count,
           "status": "OK" if len(rows) == count else "MISMATCH", "finished_utc": now()}
    if maxupd:
        rec["gis_upd_date"] = to_date(maxupd)
    log(rec)
    print(f"  wrote {out_name}: {len(rows)} rows ({rec['status']})")
    return rows


def serial_to_api():
    """WELL_SERIAL_NUM -> API_NUM from la_wells.csv (for the bottom-hole layer, which has no API)."""
    m = {}
    with open(os.path.join(OUT, "la_wells.csv"), newline="") as f:
        r = csv.DictReader(f)
        for row in r:
            if row.get("WELL_SERIAL_NUM") and row.get("API_NUM"):
                m[row["WELL_SERIAL_NUM"]] = row["API_NUM"]
    return m


def pull_codes():
    """code -> label dictionary from the SONRIS layer-0 legend renderer (the regulator's own labels)."""
    p = os.path.join(OUT, "la_codes.json")
    if os.path.exists(p):
        print("[skip] la_codes.json exists")
        return
    meta0 = get(f"{SVC}/0", {"f": "json"})
    meta9 = get(f"{SVC}/9", {"f": "json"})
    # Product codes: SONRIS legend suffixes and the Office of Conservation data-entry guides (FC3/FC5):
    # oil = 10, gas = 20, 25 = dry gas (listed, "not in use"), null product = 00.
    product = {"00": "NO PRODUCT SPECIFIED", "10": "OIL", "20": "GAS", "25": "DRY GAS"}
    product_suffix = re.compile(r"\s*(NO PRODUCT SPECIFIED|PRODUCT NOT SPECIFIED|DRY GAS|OIL|GAS)\s*$", re.I)
    status, legend = {}, {}
    for u in meta0["drawingInfo"]["renderer"]["uniqueValueInfos"]:
        code, label = str(u["value"]), str(u["label"]).strip()
        legend[code] = label
        m = re.fullmatch(r"(\d{2})(00|10|20|25)", code)
        if m and not re.fullmatch(r"\d{4} - GAS", label):  # skip the junk "4620 - GAS" labels
            s = product_suffix.sub("", label).strip(" -")
            if s and (m.group(1) not in status or m.group(2) == "00"):
                status[m.group(1)] = re.sub(r"\s{2,}", " ", s)
        elif re.fullmatch(r"\d{2}", code):  # permit-stage statuses 01/02/03 have no product
            status[code] = label
        elif code.startswith("09"):
            status.setdefault("09", "ACTIVE- INJECTION")
    uic = {str(u["value"]): str(u["label"]) for u in meta9["drawingInfo"]["renderer"]["uniqueValueInfos"]}
    out = {
        "source": "SONRIS GIS DNRSvc/OC/MapServer legend renderers (layer 0 LEGEND = WELL_STATUS_CODE + PRODUCT_TYPE_CODE; "
                  "layer 9 WELL_CLASS_TYPE_CODE). Product codes cross-checked with LDNR Office of Conservation data-entry "
                  "guides https://www.dnr.louisiana.gov/assets/OC/SONRIS/DataEntry/FC3.pdf and FC5.pdf (oil=10, gas=20, "
                  "25=dry gas not in use, null product=00).",
        "fetched_utc": now(),
        "fields": {"WELL_STATUS_CODE": dict(sorted(status.items())), "PRODUCT_TYPE_CODE": product,
                   "WELL_CLASS_TYPE_CODE": dict(sorted(uic.items())), "LEGEND": legend},
    }
    json.dump(out, open(p, "w"), indent=1)
    log({"name": "la_codes.json", "status_codes": len(status), "product_codes": len(product), "uic_codes": len(uic), "status": "OK", "finished_utc": now()})
    print(f"[codes] {len(status)} status, {len(product)} product, {len(uic)} UIC class codes")


def pull_count():
    p = os.path.join(OUT, "source_count.json")
    if os.path.exists(p):
        print("[skip] source_count.json exists")
        return
    cnt = get(f"{SVC}/0/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    json.dump({"service": f"{SVC}/0", "count": cnt, "fetched_utc": now()}, open(p, "w"), indent=1)
    log({"name": "source_count.json", "service": f"{SVC}/0", "server_count": cnt, "status": "OK", "finished_utc": now()})
    print(f"[count] SONRIS layer 0: {cnt:,} wells")


def pull_counties():
    p = os.path.join(OUT, "la_counties.geojson")
    if os.path.exists(p):
        print("[skip] la_counties.geojson exists")
        return
    gj = get(TIGER, {"where": "STATE='22'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                     "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    json.dump(gj, open(p, "w"))
    print(f"[counties] {len(gj['features'])} Louisiana parishes")


# Status codes whose legend type is the STATUS GROUP rather than the product (see TYPE_GROUP above).
STATUS_GROUPS = {
    "PLUGGED AND ABANDONED": ("30", "90"),
    "DRY AND PLUGGED": ("29",),
    "SHUT-IN DRY HOLE": ("31", "32"),
    "PLUGGED BACK - NO PERFORATIONS": ("35",),
    "INJECTION (UIC)": ("02", "08", "09", "26"),
    "PERMIT": ("01", "03"),
    "VIRTUAL/BAD DATA": ("ZZZZZ",),
}


def add_type_group():
    """Add the TYPE_GROUP legend column to la_wells.csv (idempotent; rewrites the file once)."""
    path = os.path.join(OUT, "la_wells.csv")
    product = json.load(open(os.path.join(OUT, "la_codes.json")))["fields"]["PRODUCT_TYPE_CODE"]
    group_of = {code: name for name, codes in STATUS_GROUPS.items() for code in codes}
    counts = {}
    with open(path, newline="") as f:
        r = csv.reader(f)
        header = next(r)
        if "TYPE_GROUP" in header:
            print("[type_group] la_wells.csv already has TYPE_GROUP")
            return
        i_s, i_p = header.index("WELL_STATUS_CODE"), header.index("PRODUCT_TYPE_CODE")
        with open(path + ".part", "w", newline="") as g:
            w = csv.writer(g)
            w.writerow(header + ["TYPE_GROUP"])
            for row in r:
                st, pr = (row[i_s] or "").strip(), (row[i_p] or "").strip()
                t = group_of.get(st) or product.get(pr) or (f"PRODUCT CODE {pr}" if pr else "NO PRODUCT SPECIFIED")
                counts[t] = counts.get(t, 0) + 1
                w.writerow(row + [t])
    os.replace(path + ".part", path)
    log({"name": "la_wells.csv (TYPE_GROUP)", "step": "TYPE_GROUP column added", "type_groups": counts, "finished_utc": now()})
    print(f"[type_group] {counts}")


def add_api_column(name):
    """Add API (= API_NUM) to a layer CSV so the build can join it (idempotent, no network)."""
    path = os.path.join(OUT, name)
    with open(path, newline="") as f:
        r = csv.reader(f)
        header = next(r)
        if "API" in header:
            print(f"[api] {name} already has API")
            return
        i = header.index("API_NUM")
        with open(path + ".part", "w", newline="") as g:
            w = csv.writer(g)
            w.writerow(header + ["API"])
            for row in r:
                w.writerow(row + [row[i]])
    os.replace(path + ".part", path)
    print(f"[api] {name}: API column added")


class Extra:
    """Extra output columns computed from the attributes of a layer row."""
    def __init__(self, names, fn):
        self.names, self.fn = names, fn

    def __call__(self, a):
        return self.fn(a)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    pull_count()
    pull_layer(0, "la_wells.csv")
    s2a = serial_to_api()
    pull_layer(1, "la_bottom_holes.csv", Extra(["API_NUM"], lambda a: [s2a.get(str(a.get("WELL_SERIAL_NUM")), "")]))
    pull_layer(9, "la_injection_wells.csv")
    pull_codes()
    add_type_group()
    add_api_column("la_bottom_holes.csv")
    add_api_column("la_injection_wells.csv")
    pull_counties()
