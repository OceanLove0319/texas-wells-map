"""Colorado Energy & Carbon Management Commission (ECMC, formerly COGCC) one-time snapshot -> data/raw/co/.

ONE download of the daily well shapefile. ecmc.state.co.us/robots.txt disallows /documents/ for
crawlers; Ocean approved a single polite pull of this publicly linked file (no recurring pulls, the
zip is never downloaded again once it exists).

  1. WELLS_SHP.ZIP        https://ecmc.state.co.us/documents/data/downloads/gis/WELLS_SHP.ZIP (~16 MB)
  2. co_wells.csv         every DBF attribute of the shapefile (read here without GDAL), plus
                            lon_4326 / lat_4326  from the .shp point geometry (NAD83 UTM zone 13N per the
                                                 .prj; converted here with the GRS80 inverse Transverse
                                                 Mercator; NAD83 and WGS84 differ by about a meter)
                            docs_url             ECMC facility page built from the API county+sequence
  3. co_counties.geojson  US Census TIGERweb counties for state FIPS 08, simplified

Usage: python3 -I scripts/pull_co.py
"""
import csv, datetime, json, math, os, struct, sys, time, urllib.error, urllib.parse, urllib.request, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "co")
ZIP_URL = "https://ecmc.state.co.us/documents/data/downloads/gis/WELLS_SHP.ZIP"
DOCS = "https://ecmc.state.co.us/cogisdb/Facility/FacilityDetailExpand?api="
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


# ---- minimal DBF / SHP readers (points only) ----
def read_dbf(data):
    nrec, hlen, rlen = struct.unpack("<IHH", data[4:12])
    fields, pos = [], 32
    while data[pos] != 0x0D:
        name = data[pos:pos + 11].split(b"\0")[0].decode("ascii", "replace")
        ftype = chr(data[pos + 11])
        flen, fdec = data[pos + 16], data[pos + 17]
        fields.append((name, ftype, flen, fdec))
        pos += 32
    rows = []
    for i in range(nrec):
        rec = data[hlen + i * rlen: hlen + (i + 1) * rlen]
        if not rec or rec[0:1] == b"*":  # deleted
            rows.append(None)
            continue
        vals, p = [], 1
        for name, ftype, flen, fdec in fields:
            raw = rec[p:p + flen]
            p += flen
            s = raw.decode("cp1252", "replace").strip()
            if ftype in "NF":
                if s == "":
                    vals.append("")
                else:
                    try:
                        vals.append(str(int(s)) if fdec == 0 and "." not in s else s)
                    except ValueError:
                        vals.append(s)
            elif ftype == "D":
                vals.append(f"{s[0:4]}-{s[4:6]}-{s[6:8]}" if len(s) == 8 and s.isdigit() else s)
            elif ftype == "L":
                vals.append({"T": "true", "Y": "true", "F": "false", "N": "false"}.get(s.upper(), s))
            else:
                vals.append(s.rstrip("\0"))
        rows.append(vals)
    return [f[0] for f in fields], rows


def read_shp_points(data):
    shape_type = struct.unpack("<i", data[32:36])[0]
    pts, pos = [], 100
    while pos + 8 <= len(data):
        _, clen = struct.unpack(">ii", data[pos:pos + 8])
        content = data[pos + 8: pos + 8 + clen * 2]
        pos += 8 + clen * 2
        st = struct.unpack("<i", content[0:4])[0]
        if st == 0 or len(content) < 20:
            pts.append((None, None))
        else:
            pts.append(struct.unpack("<dd", content[4:20]))
    return shape_type, pts


# ---- inverse Transverse Mercator, GRS80 (NAD83), UTM zone 13N ----
def utm13n_to_lonlat(x, y):
    a, f = 6378137.0, 1 / 298.257222101
    k0, lon0 = 0.9996, math.radians(-105.0)
    e2 = f * (2 - f)
    ep2 = e2 / (1 - e2)
    e1 = (1 - math.sqrt(1 - e2)) / (1 + math.sqrt(1 - e2))
    M = (y - 0.0) / k0
    mu = M / (a * (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256))
    phi1 = (mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * math.sin(2 * mu) + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * math.sin(4 * mu)
            + (151 * e1 ** 3 / 96) * math.sin(6 * mu) + (1097 * e1 ** 4 / 512) * math.sin(8 * mu))
    s1, c1, t1 = math.sin(phi1), math.cos(phi1), math.tan(phi1)
    N1 = a / math.sqrt(1 - e2 * s1 ** 2)
    T1 = t1 ** 2
    C1 = ep2 * c1 ** 2
    R1 = a * (1 - e2) / (1 - e2 * s1 ** 2) ** 1.5
    D = (x - 500000.0) / (N1 * k0)
    lat = phi1 - (N1 * t1 / R1) * (D ** 2 / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * ep2) * D ** 4 / 24
                                   + (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * ep2 - 3 * C1 ** 2) * D ** 6 / 720)
    lon = lon0 + (D - (1 + 2 * T1 + C1) * D ** 3 / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * ep2 + 24 * T1 ** 2) * D ** 5 / 120) / c1
    return math.degrees(lon), math.degrees(lat)


def pull_zip():
    z = os.path.join(OUT, "WELLS_SHP.ZIP")
    if os.path.exists(z) and os.path.getsize(z) > 0:
        print("[skip] WELLS_SHP.ZIP exists")
        return z
    print("[download] WELLS_SHP.ZIP (one time)")
    data, h = get(ZIP_URL)
    open(z + ".part", "wb").write(data)
    os.replace(z + ".part", z)
    log({"name": "WELLS_SHP.ZIP", "url": ZIP_URL, "bytes": len(data), "last_modified": h.get("Last-Modified"),
         "status": "downloaded", "finished_utc": now()})
    print(f"  {len(data)/1e6:.1f} MB, Last-Modified {h.get('Last-Modified')}")
    return z


def convert(z):
    path = os.path.join(OUT, "co_wells.csv")
    if os.path.exists(path):
        print("[skip] co_wells.csv exists")
        return
    with zipfile.ZipFile(z) as zf:
        names = {os.path.splitext(n)[1].lower(): n for n in zf.namelist() if not n.endswith("/")}
        info = zf.getinfo(names[".dbf"])
        entry_date = datetime.datetime(*info.date_time).strftime("%Y-%m-%d")
        prj = zf.read(names[".prj"]).decode("ascii", "replace") if ".prj" in names else ""
        fields, rows = read_dbf(zf.read(names[".dbf"]))
        shape_type, pts = read_shp_points(zf.read(names[".shp"]))
    print(f"[shp] {names.get('.shp')} type {shape_type}, {len(rows)} records, {len(pts)} shapes, built {entry_date}")
    print(f"[prj] {prj[:160]}")
    if "UTM_Zone_13N" not in prj or "NAD_1983" not in prj:
        raise RuntimeError("unexpected projection; the converter assumes NAD83 UTM zone 13N: " + prj[:200])
    if len(pts) != len(rows):
        raise RuntimeError(f"shp/dbf record mismatch: {len(pts)} vs {len(rows)}")
    # API column: the shapefile has e.g. API (county+sequence), API_Label (05-xxx-xxxxx); use whichever exists.
    api_i = next((i for i, n in enumerate(fields) if n.upper() in ("API", "API_LABEL", "API_NUMBER", "APINUM")), None)
    header = fields + ["lon_4326", "lat_4326", "docs_url"]
    n_null = 0
    with open(path + ".part", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        for rec, (x, y) in zip(rows, pts):
            if rec is None:
                continue
            if x is None or y is None or (x == 0 and y == 0):
                lon = lat = ""
                n_null += 1
            else:
                lon, lat = utm13n_to_lonlat(x, y)
                lon, lat = f"{lon:.7f}", f"{lat:.7f}"
            digits = "".join(ch for ch in str(rec[api_i]) if ch.isdigit()) if api_i is not None else ""
            if len(digits) == 10 and digits.startswith("05"):
                digits = digits[2:]
            docs = DOCS + digits if len(digits) == 8 else ""
            w.writerow(rec + [lon, lat, docs])
    os.replace(path + ".part", path)
    log({"name": "co_wells.csv", "from": "WELLS_SHP.ZIP", "rows": len(rows), "null_geometry": n_null, "zip_entry_date": entry_date,
         "prj": prj.strip(), "status": "converted", "finished_utc": now()})
    print(f"  wrote co_wells.csv: {len(rows)} rows, {n_null} without geometry")


def pull_counties():
    p = os.path.join(OUT, "co_counties.geojson")
    if os.path.exists(p):
        print("[skip] co_counties.geojson exists")
        return
    data, _ = get(TIGER, {"where": "STATE='08'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                          "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    gj = json.loads(data)
    json.dump(gj, open(p, "w"))
    log({"name": "co_counties.geojson", "service": TIGER, "rows": len(gj["features"]), "status": "OK", "finished_utc": now()})
    print(f"[counties] {len(gj['features'])} Colorado counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    try:
        z = pull_zip()
        convert(z)
        pull_counties()
    except Blocked as e:
        log({"name": "BLOCKED", "error": str(e), "finished_utc": now()})
        print(f"[blocked] {e}", file=sys.stderr)
        sys.exit(2)
