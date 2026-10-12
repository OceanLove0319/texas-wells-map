"""Wyoming Oil and Gas Conservation Commission (WOGCC) one-time snapshot -> data/raw/wy/.

LOCATIONS ONLY (WFS). Operator, dates, depth and documents live on the legacy pipeline.wyo.gov site,
whose robots.txt disallows everything, so they are not pulled.

Polite by design: one request for the whole layer (GeoServer returned every well in one CSV in
testing), one tiny `resultType=hits` request for the live count, retry with backoff, stop on 403/429,
files that already exist are not downloaded again. No recurring pulls.

  1. wy_wells.csv        WFS 2.0 GetFeature WY_SHPS:WELL as CSV (RBDMS Data Explorer GeoServer), every
                         attribute, plus lon_4326 / lat_4326 parsed from the_geom "POINT (x y)". The layer
                         CRS is EPSG:4269 (NAD83), which differs from WGS84 by about a meter.
                         WellId is the dashed API ("49-001-05001").
  2. source_count.json   numberMatched from a resultType=hits request
  3. wy_counties.geojson US Census TIGERweb counties for state FIPS 56, simplified

Usage: python3 -I scripts/pull_wy.py
"""
import csv, datetime, io, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "wy")
WFS = "https://dataexplorer.wogcc.wyo.gov/geoserver/wfs"
TYPENAME = "WY_SHPS:WELL"
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
            with urllib.request.urlopen(req, timeout=900) as r:
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


def pull_count():
    p = os.path.join(OUT, "source_count.json")
    if os.path.exists(p):
        print("[skip] source_count.json exists")
        return json.load(open(p))["count"]
    data, _ = get(WFS, {"service": "WFS", "version": "2.0.0", "request": "GetFeature", "typeNames": TYPENAME, "resultType": "hits"})
    m = re.search(rb'numberMatched="(\d+)"', data)
    if not m:
        raise RuntimeError("no numberMatched in hits response: " + data[:200].decode("utf8", "replace"))
    count = int(m.group(1))
    json.dump({"service": f"{WFS} ({TYPENAME}, resultType=hits)", "count": count, "fetched_utc": now()}, open(p, "w"), indent=1)
    log({"name": "source_count.json", "service": WFS, "server_count": count, "status": "OK", "finished_utc": now()})
    print(f"[count] {TYPENAME}: {count:,} wells")
    return count


def pull_wells(count):
    path = os.path.join(OUT, "wy_wells.csv")
    if os.path.exists(path):
        print("[skip] wy_wells.csv exists")
        return
    raw = os.path.join(OUT, "wy_wells_wfs.txt")  # the WFS response as received (.txt so the build does not treat it as a layer)
    if os.path.exists(raw):
        print("[skip] wy_wells_wfs.txt exists (not downloading again)")
        data = open(raw, "rb").read()
    else:
        print("[download] WY_SHPS:WELL as CSV (one request)")
        data, h = get(WFS, {"service": "WFS", "version": "2.0.0", "request": "GetFeature", "typeNames": TYPENAME, "outputFormat": "csv"})
        open(raw + ".part", "wb").write(data)
        os.replace(raw + ".part", raw)
    text = data.decode("utf-8-sig", "replace")
    rdr = csv.reader(io.StringIO(text))
    header = next(rdr)
    gi = header.index("the_geom") if "the_geom" in header else None
    rows, n_null, swapped = [], 0, 0
    for rec in rdr:
        if not rec:
            continue
        lon = lat = ""
        if gi is not None:
            m = re.match(r"\s*POINT\s*\(\s*(-?[\d.]+)\s+(-?[\d.]+)\s*\)", rec[gi] or "")
            if m:
                a, b = float(m.group(1)), float(m.group(2))
                # WFS 2.0 with EPSG:4269 uses the CRS axis order (latitude first): "POINT (41.23 -105.97)".
                # Decide per point from the magnitudes (Wyoming: lat 41..45, lon -111..-104).
                if abs(a) <= 90 < abs(b):
                    lat, lon = m.group(1), m.group(2)
                    swapped += 1
                else:
                    lon, lat = m.group(1), m.group(2)
            else:
                n_null += 1
        rows.append(rec + [lon, lat])
    with open(path + ".part", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header + ["lon_4326", "lat_4326"])
        w.writerows(rows)
    os.replace(path + ".part", path)
    status = "OK" if len(rows) == count else "MISMATCH"
    log({"name": "wy_wells.csv", "service": WFS, "typeName": TYPENAME, "rows": len(rows), "server_count": count, "no_geometry": n_null,
         "lat_first_axis_order": swapped, "bytes": len(data), "crs": "EPSG:4269 (layer CRS per GetFeature)", "status": status, "finished_utc": now()})
    print(f"  wrote wy_wells.csv: {len(rows)} rows ({status}), {n_null} without geometry, {swapped} lat-first points, {len(data)/1e6:.1f} MB")


def pull_counties():
    p = os.path.join(OUT, "wy_counties.geojson")
    if os.path.exists(p):
        print("[skip] wy_counties.geojson exists")
        return
    data, _ = get(TIGER, {"where": "STATE='56'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                          "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    gj = json.loads(data)
    json.dump(gj, open(p, "w"))
    log({"name": "wy_counties.geojson", "service": TIGER, "rows": len(gj["features"]), "status": "OK", "finished_utc": now()})
    print(f"[counties] {len(gj['features'])} Wyoming counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    try:
        count = pull_count()
        pull_wells(count)
        pull_counties()
    except Blocked as e:
        log({"name": "BLOCKED", "error": str(e), "finished_utc": now()})
        print(f"[blocked] {e}", file=sys.stderr)
        sys.exit(2)
