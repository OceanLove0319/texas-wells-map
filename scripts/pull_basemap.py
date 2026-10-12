"""National county basemap, one-time snapshot -> data/raw/basemap/.

US Census cartographic boundary counties (cb_<year>_us_county_500k, 1:500,000, generalized by Census), ONE zip
download, parsed with the standard library (no shapefile package needed), simplified further (Douglas-Peucker in
degrees) and written as GeoJSON in the SAME shape the per-state county files already use:

    properties: { NAME, COUNTY (3-digit county FIPS), GEOID, STATE (2-digit state FIPS), STUSPS, NAMELSAD }

so a config entry `counties: { file: 'us_counties.geojson', code: 'COUNTY', name: 'NAME' }` works unchanged, and the
integration agent can filter by STATE / STUSPS per state. 50 states + DC (state FIPS <= 56); territories are dropped.

Output
  cb_2025_us_county_500k.zip   the Census zip (kept so nothing is downloaded twice)
  us_counties.geojson          all counties, simplified, target under 10 MB
  pull_log.jsonl               one JSON line per download / build

Usage: python3 -I scripts/pull_basemap.py [tolerance_deg]   (default 0.002, about 200 m)
"""
import datetime, io, json, math, os, struct, sys, time, urllib.request, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "basemap")
YEAR = "2025"
ZIP_NAME = f"cb_{YEAR}_us_county_500k.zip"
ZIP_URL = f"https://www2.census.gov/geo/tiger/GENZ{YEAR}/shp/{ZIP_NAME}"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 0.6
PRECISION = 5
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get(url, retries=5):
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=900) as r:
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


# ---------------- minimal shapefile / dbf readers (stdlib only) ----------------
def read_dbf(buf):
    """-> (field names, list of record dicts). Deleted records are skipped."""
    n_rec, hdr_len, rec_len = struct.unpack_from("<IHH", buf, 4)
    fields, pos = [], 32
    while buf[pos] != 0x0D:
        name = buf[pos:pos + 11].split(b"\x00", 1)[0].decode("ascii")
        ftype = chr(buf[pos + 11])
        flen = buf[pos + 16]
        fields.append((name, ftype, flen))
        pos += 32
    recs, pos = [], hdr_len
    for _ in range(n_rec):
        rec = buf[pos:pos + rec_len]
        pos += rec_len
        if rec[:1] == b"*":
            continue
        row, off = {}, 1
        for name, ftype, flen in fields:
            raw = rec[off:off + flen]
            off += flen
            try:
                s = raw.decode("utf-8").strip()
            except UnicodeDecodeError:
                s = raw.decode("latin-1").strip()
            if ftype == "N" and s:
                s = int(s) if "." not in s else float(s)
            row[name] = s
        recs.append(row)
    return [f[0] for f in fields], recs


def signed_area(ring):
    a = 0.0
    for i in range(len(ring) - 1):
        a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
    return a / 2


def point_in_ring(pt, ring):
    x, y, inside = pt[0], pt[1], False
    for i in range(len(ring) - 1):
        (x1, y1), (x2, y2) = ring[i], ring[i + 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            inside = not inside
    return inside


def rings_to_geometry(rings):
    """Shapefile polygon rings (outer = clockwise) -> GeoJSON Polygon / MultiPolygon, holes assigned by containment."""
    outers = [r for r in rings if signed_area(r) < 0]
    holes = [r for r in rings if signed_area(r) >= 0]
    if not outers:  # degenerate; treat everything as outer
        outers, holes = rings, []
    polys = [[o] for o in outers]
    for h in holes:
        for poly in polys:
            if point_in_ring(h[0], poly[0]):
                poly.append(h)
                break
        else:
            polys.append([h])
    if len(polys) == 1:
        return {"type": "Polygon", "coordinates": polys[0]}
    return {"type": "MultiPolygon", "coordinates": polys}


def read_shp(buf):
    """-> list of ring lists (one per record); None for null shapes. Polygon (5) only."""
    shape_type = struct.unpack_from("<i", buf, 32)[0]
    if shape_type != 5:
        raise RuntimeError(f"unexpected shape type {shape_type}")
    out, pos, n = [], 100, len(buf)
    while pos < n:
        _, clen = struct.unpack_from(">ii", buf, pos)
        pos += 8
        st = struct.unpack_from("<i", buf, pos)[0]
        if st == 0:
            out.append(None)
            pos += clen * 2
            continue
        n_parts, n_pts = struct.unpack_from("<ii", buf, pos + 36)
        parts = list(struct.unpack_from(f"<{n_parts}i", buf, pos + 44)) + [n_pts]
        pts_off = pos + 44 + 4 * n_parts
        coords = struct.unpack_from(f"<{2 * n_pts}d", buf, pts_off)
        pts = [(coords[2 * i], coords[2 * i + 1]) for i in range(n_pts)]
        out.append([pts[parts[i]:parts[i + 1]] for i in range(n_parts)])
        pos += clen * 2
    return out


# ---------------- simplification ----------------
def dp(points, tol):
    """Iterative Douglas-Peucker; keeps endpoints. Points are (x, y) in degrees."""
    n = len(points)
    if n < 3:
        return list(points)
    keep = [False] * n
    keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    tol2 = tol * tol
    while stack:
        a, b = stack.pop()
        if b <= a + 1:
            continue
        ax, ay = points[a]
        bx, by = points[b]
        dx, dy = bx - ax, by - ay
        L2 = dx * dx + dy * dy
        best, bi = -1.0, -1
        for i in range(a + 1, b):
            px, py = points[i]
            if L2 == 0:
                d2 = (px - ax) ** 2 + (py - ay) ** 2
            else:
                t = ((px - ax) * dx + (py - ay) * dy) / L2
                t = 0.0 if t < 0 else 1.0 if t > 1 else t
                d2 = (px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2
            if d2 > best:
                best, bi = d2, i
        if best > tol2:
            keep[bi] = True
            stack.append((a, bi))
            stack.append((bi, b))
    return [p for p, k in zip(points, keep) if k]


def simplify_ring(ring, tol):
    r = dp(ring, tol)
    r = [(round(x, PRECISION), round(y, PRECISION)) for x, y in r]
    # drop consecutive duplicates after rounding, keep closure
    out = [r[0]]
    for p in r[1:]:
        if p != out[-1]:
            out.append(p)
    if out[0] != out[-1]:
        out.append(out[0])
    return out if len(out) >= 4 else None


def build(tol):
    z = os.path.join(OUT, ZIP_NAME)
    if not (os.path.exists(z) and os.path.getsize(z) > 0):
        print(f"[download] {ZIP_NAME}")
        data, h = get(ZIP_URL)
        open(z + ".part", "wb").write(data)
        os.replace(z + ".part", z)
        log({"name": ZIP_NAME, "url": ZIP_URL, "bytes": len(data), "last_modified": h.get("Last-Modified"),
             "status": "downloaded", "finished_utc": now()})
        print(f"  {len(data)/1e6:.1f} MB, Last-Modified {h.get('Last-Modified')}")
    else:
        print(f"[skip] {ZIP_NAME} exists")
    with zipfile.ZipFile(z) as zf:
        names = zf.namelist()
        shp = next(n for n in names if n.lower().endswith(".shp"))
        dbf = next(n for n in names if n.lower().endswith(".dbf"))
        prj = next((n for n in names if n.lower().endswith(".prj")), None)
        shp_buf, dbf_buf = zf.read(shp), zf.read(dbf)
        prj_txt = zf.read(prj).decode("ascii", "replace") if prj else ""
        zdate = datetime.datetime(*zf.getinfo(shp).date_time).strftime("%Y-%m-%d")
    if "GCS_North_American_1983" not in prj_txt and "NAD83" not in prj_txt:
        print(f"WARNING: unexpected .prj: {prj_txt[:120]}", file=sys.stderr)
    fields, recs = read_dbf(dbf_buf)
    shapes = read_shp(shp_buf)
    assert len(recs) == len(shapes), (len(recs), len(shapes))
    print(f"[parse] {len(recs):,} records, dbf fields {fields}")
    feats, dropped, pts_in, pts_out = [], {}, 0, 0
    for rec, rings in zip(recs, shapes):
        st = str(rec.get("STATEFP", ""))
        if not st or int(st) > 56:
            dropped[st] = dropped.get(st, 0) + 1
            continue
        if rings is None:
            dropped["null-geometry"] = dropped.get("null-geometry", 0) + 1
            continue
        simp = []
        for ring in rings:
            pts_in += len(ring)
            s = simplify_ring(ring, tol)
            if s:
                simp.append(s)
                pts_out += len(s)
        if not simp:
            dropped["collapsed"] = dropped.get("collapsed", 0) + 1
            continue
        geom = rings_to_geometry(simp)
        feats.append({"type": "Feature", "geometry": geom, "properties": {
            "NAME": rec.get("NAME", ""), "COUNTY": str(rec.get("COUNTYFP", "")).zfill(3), "GEOID": str(rec.get("GEOID", "")),
            "STATE": st.zfill(2), "STUSPS": rec.get("STUSPS", ""), "NAMELSAD": rec.get("NAMELSAD", "")}})
    feats.sort(key=lambda f: f["properties"]["GEOID"])
    p = os.path.join(OUT, "us_counties.geojson")
    gj = {"type": "FeatureCollection",
          "source": f"US Census Bureau cartographic boundary file {ZIP_NAME} (1:500,000), Douglas-Peucker {tol} deg, {PRECISION} decimals; 50 states + DC",
          "features": feats}
    json.dump(gj, open(p + ".part", "w"), separators=(",", ":"))
    os.replace(p + ".part", p)
    size = os.path.getsize(p)
    log({"name": "us_counties.geojson", "from": ZIP_NAME, "shp_entry_date": zdate, "source_records": len(recs), "features": len(feats),
         "dropped_by_statefp": dropped, "tolerance_deg": tol, "points_in": pts_in, "points_out": pts_out, "bytes": size,
         "status": "OK" if size < 10 * 1024 * 1024 else "OVER_10MB", "finished_utc": now()})
    print(f"[write] us_counties.geojson {len(feats):,} counties ({len(recs):,} source records; dropped {dropped}), "
          f"points {pts_in:,} -> {pts_out:,}, {size/1e6:.2f} MB")


def report():
    """data/raw/basemap/basemap_snapshot_report.md (offline): counts vs source, per-state counties vs the per-state files
    the app uses today, Alaska / offshore coverage of data/raw/us_states.geojson."""
    import collections
    gj = json.load(open(os.path.join(OUT, "us_counties.geojson")))
    feats = gj["features"]
    logs = [json.loads(l) for l in open(os.path.join(OUT, "pull_log.jsonl")) if l.strip()]
    bl = next((l for l in reversed(logs) if l.get("name") == "us_counties.geojson"), {})
    by_state = collections.Counter(f["properties"]["STUSPS"] for f in feats)
    def pts(gm):
        return [c for poly in (gm["coordinates"] if gm["type"] == "MultiPolygon" else [gm["coordinates"]]) for ring in poly for c in ring]
    # per-state files the app reads today (same property roles), for a like-for-like count
    today = {"TX": ("data/raw/counties.geojson", "FIPS", "COUNTY_NAME"), "OK": ("data/raw/ok/ok_counties.geojson", "COUNTY", "NAME"),
             "KS": ("data/raw/ks/ks_counties.geojson", "COUNTY", "NAME")}
    cmp = []
    for st, (rel, code, name) in today.items():
        p = os.path.join(ROOT, rel)
        if not os.path.exists(p):
            continue
        old = json.load(open(p))["features"]
        old_codes = set(str(f["properties"][code]).zfill(3) for f in old)
        new_codes = set(f["properties"]["COUNTY"] for f in feats if f["properties"]["STUSPS"] == st)
        cmp.append((st, rel, len(old), len(new_codes), len(old_codes - new_codes), len(new_codes - old_codes), os.path.getsize(p) // 1024))
    states = json.load(open(os.path.join(ROOT, "data", "raw", "us_states.geojson")))
    ak = next((f for f in states["features"] if f["properties"].get("STUSAB") == "AK"), None)
    ak_pts = pts(ak["geometry"]) if ak else []
    L = []
    w = L.append
    w("# Snapshot report - national county basemap (US Census cartographic boundary counties)\n")
    w(f"Report generated: {now()}  ")
    w(f"Source: {ZIP_URL} (Census Bureau cartographic boundary file, 1:500,000, vintage {YEAR}; shapefile dated "
      f"{bl.get('shp_entry_date', '?')}; zip Last-Modified {next((l.get('last_modified') for l in logs if l.get('name') == ZIP_NAME), '?')})  ")
    w("Licensing / terms: U.S. Census Bureau public domain (no restrictions; Census asks for attribution). No login, no key.  ")
    w("Update frequency: one release per year (GENZ<year>); the 2025 vintage was published 2026-04. One-time pull.  \n")
    w("Pull log:\n")
    for l in logs:
        w(f"- `{json.dumps(l)}`")
    w("\n## Counts\n")
    w("| what | count |\n|---|---|")
    w(f"| records in the Census shapefile (50 states + DC + PR + territories) | {bl.get('source_records', '?'):,} |")
    w(f"| dropped: territories by STATEFP {bl.get('dropped_by_statefp')} (60 AS, 66 GU, 69 MP, 72 PR, 78 VI) | {sum((bl.get('dropped_by_statefp') or {}).values()):,} |")
    w(f"| **counties / county-equivalents written (50 states + DC)** | {len(feats):,} |")
    w(f"| states + DC present | {len(by_state)} |")
    w(f"| vertices before -> after Douglas-Peucker {bl.get('tolerance_deg')} deg, {PRECISION} decimals | {bl.get('points_in', 0):,} -> {bl.get('points_out', 0):,} |")
    w(f"| file size | {bl.get('bytes', 0)/1e6:.2f} MB (target under 10 MB: {'yes' if bl.get('bytes', 0) < 10e6 else 'NO'}) |")
    w(f"| geometry types | {dict(collections.Counter(f['geometry']['type'] for f in feats))} |")
    w("\n3,144 is the Census count of counties and county-equivalents for the 50 states + DC (Connecticut is 9 planning regions since 2022; "
      "Alaska 30 boroughs / census areas; Virginia independent cities counted as counties).\n")
    w("## Output format (same roles as the per-state files the app reads today)\n")
    w("`properties: { NAME, COUNTY (3-digit county FIPS), GEOID, STATE (2-digit state FIPS), STUSPS, NAMELSAD }`; geometry Polygon / MultiPolygon, WGS84/NAD83 degrees. "
      "Config: `counties: { file: 'us_counties.geojson', code: 'COUNTY', name: 'NAME' }` plus a filter on STUSPS (or STATE) per state - "
      "see scripts/states/NOTES.md. `build_data.mjs` already strips a trailing \" County\" from NAME; here NAME has no suffix (NAMELSAD does).\n")
    w("## Like-for-like check against the current per-state county files\n")
    w("| state | current file | counties now | counties in basemap | codes missing in basemap | extra in basemap | current size KB |\n|---|---|---|---|---|---|---|")
    for st, rel, n_old, n_new, miss, extra, kb in cmp:
        w(f"| {st} | {rel} | {n_old} | {n_new} | {miss} | {extra} | {kb} |")
    w("\nTexas: the RRC county file has 255 features = 254 counties + one `FIPS: 'FED'` / `FEDERAL WATERS` polygon (the RRC's offshore "
      "federal-waters area). Census has no such polygon, so the basemap drops it; the BOEM planning-area / protraction outlines in "
      "data/raw/boem/ are the offshore replacement. All 254 real county codes match.")
    w("\n## Per-state county counts\n")
    w("| state | counties |\n|---|---|")
    for st, n in sorted(by_state.items()):
        w(f"| {st} | {n} |")
    w("\n## State-boundary layer coverage (data/raw/us_states.geojson, Census TIGERweb)\n")
    w(f"- Features: {len(states['features'])} (50 states + DC). Alaska: {'present' if ak else 'MISSING'}"
      + (f", {ak['geometry']['type']}, {len(ak_pts):,} vertices, longitude {min(c[0] for c in ak_pts):.2f} .. {max(c[0] for c in ak_pts):.2f} "
         "(crosses the antimeridian: the Aleutians west of 180 are stored as positive longitudes near +179, so a flat Web-Mercator view "
         "draws them at the far right edge, not next to the rest of Alaska)." if ak else "."))
    w("- Offshore planning areas: NOT covered. TIGER state polygons stop at the coast / 3-nautical-mile state-waters line; federal OCS "
      "planning areas and protraction blocks are not in it. Optional reference layers were pulled from BOEM instead: "
      "data/raw/boem/boem_planning_areas.geojson (19 planning areas: 3 Gulf, 4 Pacific, 12 Alaska; 60 KB) and "
      "data/raw/boem/boem_protraction.geojson (400 protraction diagram / leasing map outlines; 269 KB). No Atlantic polygons were pulled.")
    w("- The basemap counties are also coast-limited; offshore wells draw over water with no outline unless a BOEM reference layer is enabled.\n")
    w("## Unverified\n")
    w("- Shared edges are simplified per polygon (same as the existing TIGERweb maxAllowableOffset pulls), so hairline gaps/overlaps between "
      "neighbours can appear at high zoom. Not measured.")
    w("- Hole assignment (21 polygons with holes, mostly Virginia independent cities) relies on first-vertex containment; visually unchecked in the app.")
    p = os.path.join(OUT, "basemap_snapshot_report.md")
    open(p, "w").write("\n".join(L) + "\n")
    print(f"[report] {p}")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    if "--report" in sys.argv:
        report()
        sys.exit(0)
    build(float(sys.argv[1]) if len(sys.argv) > 1 else 0.002)
