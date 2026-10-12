"""Alaska Oil and Gas Conservation Commission (AOGCC) one-time snapshot -> data/raw/ak/.

Source: AOGCC/AOGCC_SQL_Test MapServer (the service is literally named "Test"; it backs the AOGCC
well map and may change). Wells are spread over six "Surface Hole" point layers by well class:
1 Exploration, 5 Development, 9 Service Injection, 13 Service Disposal, 17 Gas Storage, 21 Geothermal.
All six are pulled (each ONCE; sequential, polite) and tagged in SRC_LAYER. The companion "Wells"
layers (0, 4, 8, ...) are attribute tables without geometry and are not used.
The AOGCC bulk Data Miner page (commerce.alaska.gov/web/aogcc/Data) sits behind a bot wall and is
NOT touched. Attributes are thin (API, well name, class, status, permit; no operator, dates, depth).
Coordinates: the service is EPSG 4326; Longitude/Latitude attribute columns plus LON_4326/LAT_4326.
The AOGCC site describes its coordinates as NAD27; the service metadata says WGS84 (unverified).

Usage: python3 -I scripts/pull_ak.py
"""
SVC = "https://maps.commerce.alaska.gov/server/rest/services/AOGCC/AOGCC_SQL_Test/MapServer"
CFG = {
    "id": "AK", "name": "Alaska", "fips": "02", "base": "ak_wells.csv", "service": SVC,
    "layers": [(f"{SVC}/{i}", f"layer{i}") for i in (1, 5, 9, 13, 17, 21)],
}

def derive(rows, header, counties):
    """No derived columns for this state: every regulator attribute is kept as delivered."""
    return rows, header, {}
# ---------------------------------------------------------------------------------------------
# Shared body (identical in every scripts/pull_<st>.py that reads an ArcGIS REST layer). Kept
# inline so each state script stays standalone (python3 -I scripts/pull_<st>.py).
# ---------------------------------------------------------------------------------------------
import csv, datetime, json, math, os, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", CFG["id"].lower())
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 0.5
EPOCH = datetime.datetime(1970, 1, 1, tzinfo=datetime.timezone.utc)
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class Blocked(Exception):
    """403 / 429 or repeated connection failures: stop, do not hammer the server."""


def get(url, params=None, retries=5, timeout=300):
    """One polite GET (sequential; sleep after every request; exponential backoff on errors)."""
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                data, headers = r.read(), dict(r.headers)
            time.sleep(SLEEP)
            return data, headers
        except urllib.error.HTTPError as e:
            if e.code in (403, 429):
                raise Blocked(f"HTTP {e.code} on {url[:120]}")
            print(f"  retry {attempt}/{retries} HTTP {e.code} {url[:120]}", file=sys.stderr)
        except Exception as e:
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
        time.sleep(SLEEP * 4 * attempt)
    raise RuntimeError(f"failed: {url[:160]}")


def get_json(url, params):
    params = dict(params, f="json")
    for attempt in range(1, 6):
        j = json.loads(get(url, params)[0])
        if "error" not in j:
            return j
        code = j["error"].get("code")
        if code in (403, 429):
            raise Blocked(f"ArcGIS error {j['error']}")
        print(f"  ArcGIS error (attempt {attempt}): {j['error']}", file=sys.stderr)
        time.sleep(SLEEP * 6 * attempt)
    raise RuntimeError(f"ArcGIS error persists: {url}")


def log(rec):
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")


def layer_meta(url):
    m = get_json(url, {})
    fields = m.get("fields") or []
    oid = next((f["name"] for f in fields if f["type"] == "esriFieldTypeOID"), m.get("objectIdField"))
    dates = {f["name"] for f in fields if f["type"] == "esriFieldTypeDate"}
    names = [f["name"] for f in fields if f["type"] not in ("esriFieldTypeGeometry",)]
    return {"name": m.get("name"), "oid": oid, "max": int(m.get("maxRecordCount") or 1000), "fields": names, "dates": dates,
            "sr": (m.get("extent") or {}).get("spatialReference")}


def fmt_date(v):
    if v is None or v == "":
        return ""
    try:
        return (EPOCH + datetime.timedelta(milliseconds=int(v))).strftime("%Y-%m-%d")
    except Exception:
        return str(v)


def fetch_layer(url, tag):
    """Download one point layer (all attributes, geometry reprojected to WGS84 by the server) once into
    data/raw/<st>/raw_<tag>.jsonl; returns (meta, rows) where each row is a dict of attributes + LON_4326/LAT_4326."""
    meta = layer_meta(url)
    cache = os.path.join(OUT, f"raw_{tag}.jsonl")
    count = get_json(url + "/query", {"where": "1=1", "returnCountOnly": "true"})["count"]
    if not os.path.exists(cache):
        print(f"[download] {CFG['id']} {meta['name']} ({count:,} features, {meta['max']}/page, oid {meta['oid']})")
        n, last = 0, -1
        with open(cache + ".part", "w") as f:
            while True:
                j = get_json(url + "/query", {"where": f"{meta['oid']} > {last}", "outFields": "*", "orderByFields": f"{meta['oid']} ASC",
                                              "resultRecordCount": meta["max"], "returnGeometry": "true", "outSR": 4326})
                feats = j.get("features", [])
                if not feats:
                    break
                for ft in feats:
                    f.write(json.dumps(ft, separators=(",", ":")) + "\n")
                n += len(feats)
                last = feats[-1]["attributes"][meta["oid"]]
                print(f"  {CFG['id']} {meta['name']}: {n:,}/{count:,}")
                if len(feats) < meta["max"]:
                    break
        os.replace(cache + ".part", cache)
        log({"name": f"raw_{tag}.jsonl", "layer": meta["name"], "url": url, "rows": n, "server_count": count,
             "status": "OK" if n == count else "MISMATCH", "source_sr": meta["sr"], "finished_utc": now()})
    else:
        print(f"[skip] raw_{tag}.jsonl exists")
    rows = []
    with open(cache) as f:
        for line in f:
            ft = json.loads(line)
            a = ft.get("attributes") or {}
            row = {k: (fmt_date(v) if k in meta["dates"] else ("" if v is None else v)) for k, v in a.items()}
            g = ft.get("geometry") or {}
            # a missing geometry, or NaN x/y (the server's way of saying "no location"), is written as blank
            fin = lambda v: v if isinstance(v, (int, float)) and math.isfinite(v) else ""
            row["LON_4326"], row["LAT_4326"] = fin(g.get("x")), fin(g.get("y"))
            rows.append(row)
    return meta, rows, count


def pull_counties():
    p = os.path.join(OUT, f"{CFG['id'].lower()}_counties.geojson")
    if os.path.exists(p):
        print(f"[skip] {os.path.basename(p)} exists")
    else:
        data, _ = get(TIGER, {"where": f"STATE='{CFG['fips']}'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                              "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
        gj = json.loads(data)
        json.dump(gj, open(p, "w"))
        log({"name": os.path.basename(p), "service": TIGER, "features": len(gj["features"]), "status": "OK", "finished_utc": now()})
        print(f"[counties] {len(gj['features'])} {CFG['name']} counties")
    return json.load(open(p))


def write_csv(path, rows, header):
    with open(path + ".part", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=header, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow(r)
    os.replace(path + ".part", path)


def main():
    os.makedirs(OUT, exist_ok=True)
    counties = pull_counties()
    base = os.path.join(OUT, CFG["base"])
    header, rows, layers = [], [], []
    for url, tag in CFG["layers"]:
        meta, lrows, count = fetch_layer(url, tag)
        for n in meta["fields"]:
            if n not in header:
                header.append(n)
        if len(CFG["layers"]) > 1:
            for r in lrows:
                r["SRC_LAYER"] = meta["name"]
        rows.extend(lrows)
        layers.append({"url": url, "name": meta["name"], "count": count, "rows": len(lrows), "source_sr": meta["sr"]})
    header += ["LON_4326", "LAT_4326"] + (["SRC_LAYER"] if len(CFG["layers"]) > 1 else [])
    rows, header, extra_files = derive(rows, header, counties)
    write_csv(base, rows, header)
    for name, (erows, eheader) in extra_files.items():
        write_csv(os.path.join(OUT, name), erows, eheader)
        print(f"[write] {name}: {len(erows):,} rows")
    log({"name": CFG["base"], "from": [l["name"] for l in layers], "rows": len(rows), "status": "written", "finished_utc": now()})
    json.dump({"service": CFG["service"], "count": sum(l["count"] for l in layers), "layers": layers, "fetched_utc": now()},
              open(os.path.join(OUT, "source_count.json"), "w"), indent=1)
    print(f"[write] {CFG['base']}: {len(rows):,} rows, {len(header)} columns; source count {sum(l['count'] for l in layers):,}")


if __name__ == "__main__":
    try:
        main()
    except Blocked as e:
        print(f"BLOCKED - stopping: {e}", file=sys.stderr)
        sys.exit(2)
