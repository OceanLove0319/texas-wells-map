"""BOEM federal offshore (OCS) wells, one-time snapshot -> data/raw/boem/.

Polite by design: sequential requests (well under the 2-concurrent limit), a sleep between requests,
retry with backoff, and files that already exist are not downloaded again. No recurring pulls.

  1. BoreholeRawData.zip -> mv_boreholes_all.txt   BOEM daily all-region borehole file (ONE download, ~3.5 MB zip,
                                                    ~13.6 MB quoted CSV, every column kept). This is the BASE file.
  2. boem_rest_wells.csv                             The three regional REST well layers (Gulf, Pacific, Alaska).
                                                    Pulled only because they carry fields the CSV lacks
                                                    (TYPE_CODE / TYPE_CODE_DESC, STATUS_DESCRIPTION, COMPLETION, OPERATOR code).
                                                    Joined to the base file on API_NUMBER by the build. A REGION column is added.
  3. boem_planning_areas.geojson                     BOEM Oil and Gas Planning Areas (Gulf, Pacific, Alaska), generalized.
  4. boem_protraction.geojson                        BOEM OCS Protraction Diagrams & Leasing Maps outlines, generalized.
     (3 and 4 are an OPTIONAL offshore reference layer; the app does not need them to draw wells.)
  5. source_count.json                               returnIdsOnly counts of the three REST well layers (returnCountOnly
                                                    returns nothing on this server) for row-count reconciliation.
  6. pull_log.jsonl                                  one JSON line per download.

Usage: python3 -I scripts/pull_boem.py
"""
import csv, datetime, io, json, os, ssl, sys, time, urllib.parse, urllib.request, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# gis.boem.gov does not send its intermediate certificate (DigiCert Global G2 TLS RSA SHA256 2020 CA1; openssl
# "unable to verify the first certificate", 2026-10-12). curl works because macOS fetches it via AIA; Python does not.
# We download that public intermediate ONCE from DigiCert (over a normally verified connection), cache it next to the
# data and add it to the trust context. Certificate verification stays ON.
INTERMEDIATE_URL = "https://cacerts.digicert.com/DigiCertGlobalG2TLSRSASHA2562020CA1-1.crt.pem"
_SSL_CTX = None


def ssl_ctx():
    global _SSL_CTX
    if _SSL_CTX is None:
        try:
            import certifi
            ctx = ssl.create_default_context(cafile=certifi.where())
        except ImportError:  # pragma: no cover
            ctx = ssl.create_default_context()
        pem = os.path.join(ROOT, "data", "raw", "boem", "digicert_g2_tls_2020_ca1.pem")
        if not os.path.exists(pem):
            req = urllib.request.Request(INTERMEDIATE_URL, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60, context=ctx) as r:
                data = r.read()
            if b"BEGIN CERTIFICATE" not in data:
                raise RuntimeError("intermediate certificate download did not return a PEM")
            open(pem, "wb").write(data)
        ctx.load_verify_locations(cafile=pem)
        _SSL_CTX = ctx
    return _SSL_CTX


OUT = os.path.join(ROOT, "data", "raw", "boem")
ZIP_URL = "https://www.data.boem.gov/Well/Files/BoreholeRawData.zip"
GIS = "https://gis.boem.gov/arcgis/rest/services/BOEM_BSEE"
# region -> (service, wells layer, planning-areas layer, protraction layer). Layer ids differ per service (verified 2026-10-12).
REGIONS = {
    "GOM": ("GOA_Layers", 1, 8, 5),  # Gulf of America (BOEM's current name for the Gulf of Mexico region)
    "PAC": ("POC_Layers", 1, 8, 5),  # Pacific
    "AK": ("AK_Layers", 1, 7, 4),    # Alaska
}
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 0.6
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get(url, params=None, retries=5):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=600, context=ssl_ctx()) as r:
                data, headers = r.read(), dict(r.headers)
            time.sleep(SLEEP)
            return data, headers
        except Exception as e:
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 5 * attempt)
    raise RuntimeError(f"failed: {url}")


def get_json(url, params):
    data, _ = get(url, params)
    j = json.loads(data)
    if isinstance(j, dict) and j.get("error"):
        raise RuntimeError(f"ArcGIS error {j['error']}")
    return j


def log(rec):
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")


def pull_zip():
    z = os.path.join(OUT, "BoreholeRawData.zip")
    if not (os.path.exists(z) and os.path.getsize(z) > 0):
        print("[download] BoreholeRawData.zip")
        data, h = get(ZIP_URL)
        open(z + ".part", "wb").write(data)
        os.replace(z + ".part", z)
        log({"name": "BoreholeRawData.zip", "url": ZIP_URL, "bytes": len(data), "last_modified": h.get("Last-Modified"),
             "status": "downloaded", "finished_utc": now()})
        print(f"  {len(data)/1e6:.1f} MB, Last-Modified {h.get('Last-Modified')}")
    else:
        print("[skip] BoreholeRawData.zip exists")
    with zipfile.ZipFile(z) as zf:
        for info in zf.infolist():
            target = os.path.join(OUT, os.path.basename(info.filename))
            if not info.filename or info.is_dir() or os.path.exists(target):
                continue
            with zf.open(info) as src, open(target + ".part", "wb") as dst:
                while chunk := src.read(1 << 20):
                    dst.write(chunk)
            os.replace(target + ".part", target)
            built = datetime.datetime(*info.date_time).strftime("%Y-%m-%d")
            log({"name": os.path.basename(info.filename), "from": "BoreholeRawData.zip", "bytes": info.file_size,
                 "zip_entry_date": built, "status": "extracted", "finished_utc": now()})
            print(f"[extract] {info.filename} {info.file_size/1e6:.1f} MB (built {built})")


def layer_ids(url):
    """All object ids of a layer (returnCountOnly is empty on gis.boem.gov; returnIdsOnly works)."""
    j = get_json(url + "/query", {"where": "1=1", "returnIdsOnly": "true", "f": "json"})
    return sorted(j.get("objectIds") or []), j.get("objectIdFieldName", "OBJECTID")


def pull_rest_wells():
    p = os.path.join(OUT, "boem_rest_wells.csv")
    counts = {}
    if os.path.exists(p):
        print("[skip] boem_rest_wells.csv exists")
    rows, fields = [], []
    for region, (svc, wells_lyr, _, _) in REGIONS.items():
        url = f"{GIS}/{svc}/FeatureServer/{wells_lyr}"
        meta = get_json(url, {"f": "json"})
        ids, oid_field = layer_ids(url)
        page = int(meta.get("maxRecordCount") or 1000)
        counts[region] = {"service": url, "ids": len(ids), "fetched_utc": now()}
        print(f"[rest] {region}: {len(ids):,} wells, page {page}")
        if os.path.exists(p):
            continue
        for f in meta.get("fields", []):
            if f["name"] not in fields and f["type"] != "esriFieldTypeGeometry":
                fields.append(f["name"])
        got = 0
        for i in range(0, len(ids), page):
            chunk = ids[i:i + page]
            j = get_json(url + "/query", {"where": f"{oid_field}>={chunk[0]} AND {oid_field}<={chunk[-1]}", "outFields": "*",
                                          "returnGeometry": "true", "outSR": 4326, "f": "json"})
            for feat in j.get("features", []):
                a = dict(feat.get("attributes") or {})
                g = feat.get("geometry") or {}
                a["REGION"] = region
                a["GEOM_LON"] = g.get("x")
                a["GEOM_LAT"] = g.get("y")
                rows.append(a)
                got += 1
            print(f"  {region} {got:,}/{len(ids):,}")
        log({"name": f"boem_rest_wells.csv[{region}]", "service": url, "rows_written": got, "server_ids": len(ids),
             "status": "OK" if got == len(ids) else "MISMATCH", "finished_utc": now()})
    json.dump({"regions": counts, "note": "returnIdsOnly counts of the regional REST well layers; the base file is the daily CSV",
               "fetched_utc": now()}, open(os.path.join(OUT, "source_count.json"), "w"), indent=1)
    if rows:
        cols = fields + ["REGION", "GEOM_LON", "GEOM_LAT"]
        with open(p + ".part", "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
            w.writeheader()
            for r in rows:
                for k in ("SPUD_DATE", "COMPLETION"):  # epoch ms -> ISO date
                    v = r.get(k)
                    if isinstance(v, (int, float)) and v:
                        r[k] = datetime.datetime.fromtimestamp(v / 1000, datetime.timezone.utc).strftime("%Y-%m-%d")
                w.writerow(r)
        os.replace(p + ".part", p)
        print(f"[write] boem_rest_wells.csv {len(rows):,} rows")


def pull_polygons(name, which, offset):
    """which = index into REGIONS tuple (2 planning areas, 3 protraction). Generalized with maxAllowableOffset."""
    p = os.path.join(OUT, name)
    if os.path.exists(p):
        print(f"[skip] {name} exists")
        return
    feats = []
    for region, spec in REGIONS.items():
        url = f"{GIS}/{spec[0]}/FeatureServer/{spec[which]}"
        meta = get_json(url, {"f": "json"})
        ids, oid_field = layer_ids(url)
        page = int(meta.get("maxRecordCount") or 1000)
        got = 0
        for i in range(0, len(ids), page):
            chunk = ids[i:i + page]
            j = get_json(url + "/query", {"where": f"{oid_field}>={chunk[0]} AND {oid_field}<={chunk[-1]}", "outFields": "*",
                                          "returnGeometry": "true", "outSR": 4326, "maxAllowableOffset": offset,
                                          "geometryPrecision": 4, "f": "geojson"})
            for feat in j.get("features", []):
                feat.setdefault("properties", {})["REGION"] = region
                feats.append(feat)
                got += 1
        log({"name": f"{name}[{region}]", "service": url, "layer_name": meta.get("name"), "rows_written": got,
             "server_ids": len(ids), "status": "OK" if got == len(ids) else "MISMATCH", "finished_utc": now()})
        print(f"[poly] {name} {region} ({meta.get('name')}): {got}/{len(ids)}")
    json.dump({"type": "FeatureCollection", "source": f"BOEM gis.boem.gov BOEM_BSEE {{GOA,POC,AK}}_Layers, generalized {offset} deg",
               "features": feats}, open(p, "w"), separators=(",", ":"))
    print(f"[write] {name} {len(feats)} features, {os.path.getsize(p)//1024} KB")


# Code dictionaries, copied from the drop-downs of BOEM's own borehole query page
# (https://www.data.boem.gov/Well/Borehole/Default.aspx, read 2026-10-12) and cross-checked against TYPE_CODE_DESC /
# STATUS_DESCRIPTION in the REST layers (every code present in both agreed).
CODES = {
    "WELL_TYPE_CODE": {"C": "Core Test", "D": "Development", "E": "Exploratory", "N": "Non-Operation", "O": "Other", "R": "Relief", "S": "Strat Test"},
    "BOREHOLE_STAT_CD": {"APD": "Application for Permit to Drill", "AST": "Approved Sidetrack", "CNL": "Cancelled", "COM": "Completed",
                         "CT": "Core Test Well", "DRL": "Drilling Active", "DSI": "Drilling Suspended", "PA": "Permanently Abandoned",
                         "ST": "Sidetracked", "TA": "Temporarily Abandoned", "VCW": "Volume Chamber Well"},
    "REGION_CODE": {"Y": "Alaska", "A": "Atlantic", "G": "Gulf of America", "P": "Pacific"},
}


def write_codes():
    p = os.path.join(OUT, "boem_codes.json")
    rest_p = os.path.join(OUT, "boem_rest_wells.csv")
    fields = {k: dict(v) for k, v in CODES.items()}
    if os.path.exists(rest_p):  # add anything the REST layers describe that the page did not
        for r in csv.DictReader(open(rest_p, newline="")):
            fields["WELL_TYPE_CODE"].setdefault(r["TYPE_CODE"], r["TYPE_CODE_DESC"])
            fields["BOREHOLE_STAT_CD"].setdefault(r["STATUS"], r["STATUS_DESCRIPTION"])
    json.dump({"source": "BOEM borehole query page drop-downs + BOEM_BSEE REST layer descriptions, 2026-10-12", "fields": fields},
              open(p, "w"), indent=1)
    print(f"[codes] {p}")
    return fields


def guess_category(code, desc):
    """Same order as CATEGORY_RULES in scripts/states.config.mjs (kept in sync by hand; informational only)."""
    import re
    s = f"{code} {desc}"
    for cat, rx in [("plugged", r"plugged|p\s*&\s*a\b|\bpa\b"), ("dry", r"\bdry\b|\bd\s*&\s*a\b"),
                    ("injection", r"inject|\binj\b|disposal|\buic\b|\bswd\b|\beor\b|enhanced recovery|\bwiw\b|class ?(1|one)\b"),
                    ("other", r"storage|\bstg\b|water|observ|\bobs\b|service|core|brine|geothermal|strat|cath|monitor|helium|permit|location|\bloc\b|intent|unknown|no type|temporarily|\bta\b"),
                    ("oil", r"\boil\b|\bo\s*&\s*g\b"), ("gas", r"\bgas\b|\bcbm\b")]:
        if re.search(rx, s, re.I):
            return cat
    return "(no rule) -> needs categoryOverrides"


def report():
    """data/raw/boem/boem_snapshot_report.md (offline)."""
    import collections
    csv.field_size_limit(1 << 30)
    codes = write_codes()
    base = list(csv.DictReader(open(os.path.join(OUT, "mv_boreholes_all.txt"), newline="", encoding="utf-8")))
    cols = list(base[0].keys())
    rest_p = os.path.join(OUT, "boem_rest_wells.csv")
    rest = list(csv.DictReader(open(rest_p, newline=""))) if os.path.exists(rest_p) else []
    src = json.load(open(os.path.join(OUT, "source_count.json"))) if os.path.exists(os.path.join(OUT, "source_count.json")) else {}
    logs = [json.loads(l) for l in open(os.path.join(OUT, "pull_log.jsonl")) if l.strip()]
    def num(v):
        try:
            return float(v)
        except (TypeError, ValueError):
            return None
    surf = [(num(r["SURF_LONGITUDE"]), num(r["SURF_LATITUDE"])) for r in base]
    no_surf = sum(1 for x, y in surf if x is None or y is None or x == 0 or y == 0)
    bad_surf = sum(1 for x, y in surf if x is not None and y is not None and not (-180 <= x <= 180 and -90 <= y <= 90))
    botm_blank = sum(1 for r in base if not r["BOTM_LATITUDE"].strip() or not r["BOTM_LONGITUDE"].strip())
    botm_stars = sum(1 for r in base if "*" in r["BOTM_LATITUDE"] or "*" in r["BOTM_LONGITUDE"])  # BOEM prints ***** for withheld values
    no_botm = sum(1 for r in base if num(r["BOTM_LONGITUDE"]) is None or num(r["BOTM_LATITUDE"]) is None)
    apis = [r["API_WELL_NUMBER"] for r in base]
    rest_apis = set(r["API_NUMBER"].strip() for r in rest)
    by_region = collections.Counter(r["REGION_CODE"] for r in base)
    L = []
    w = L.append
    w("# Snapshot report - BOEM federal offshore (OCS) boreholes - pseudo-state \"Federal Offshore\"\n")
    w(f"Report generated: {now()}  ")
    zl = next((l for l in logs if l.get("name") == "mv_boreholes_all.txt"), {})
    w(f"Data date shown in the app: **{zl.get('zip_entry_date', '?')}** (from data/raw/boem/pull_log.jsonl (mv_boreholes_all.txt, zip_entry_date))  ")
    w(f"Source: {ZIP_URL} (BOEM Data Center \"Borehole Raw Data\", all regions, rebuilt DAILY; Last-Modified "
      f"{next((l.get('last_modified') for l in logs if l.get('name') == 'BoreholeRawData.zip'), '?')})  ")
    w("Licensing / terms: U.S. Government work (BOEM, Department of the Interior), public domain; data.boem.gov publishes a general "
      "disclaimer (data provided as-is). robots.txt on data.boem.gov blocks only named crawlers; gis.boem.gov has no robots.txt (404). No login, no key.  ")
    w("Update frequency: the zip is rebuilt every day (Last-Modified today). The REST layers (gis.boem.gov) carry a smaller well set, see below.  \n")
    w("Pull log:\n")
    for l in logs:
        w(f"- `{json.dumps(l)}`")
    w("\n## Row count\n")
    w("| what | rows |\n|---|---|")
    w(f"| mv_boreholes_all.txt (rows in file = boreholes) | {len(base):,} |")
    w(f"| distinct 12-digit API_WELL_NUMBER | {len(set(apis)):,} |")
    w(f"| distinct 10-digit API (sidetrack/bypass suffix dropped) | {len(set(a[:10] for a in apis)):,} |")
    for reg, n in sorted(by_region.items(), key=lambda x: -x[1]):
        w(f"| region {reg} = {codes['REGION_CODE'].get(reg, '?')} | {n:,} |")
    w(f"| REST well layers (returnIdsOnly), GOM + PAC + AK | {sum(v['ids'] for v in src.get('regions', {}).values()):,} "
      f"({', '.join(f'{k} {v['ids']:,}' for k, v in src.get('regions', {}).items())}) |")
    w(f"| REST wells joined to the CSV on API (12 digits) | {len(rest_apis & set(apis)):,} of {len(rest_apis):,} REST rows; {len(set(apis) - rest_apis):,} CSV rows have no REST row |")
    w("\nThere is no separate \"live count\" for BOEM: the daily CSV IS the regulator's full borehole list. The REST well layers hold a "
      "subset (about 44%), so they are used only as a joined layer for the code descriptions / OPERATOR number, never for the count. "
      "The research note of 2026-10-09 quoted 54,576 for the Gulf REST layer; returnIdsOnly gave 23,501 on 2026-10-12 (not re-explained; the CSV is authoritative).\n")
    w("## API numbers\n")
    w("| raw API length | rows |\n|---|---|")
    for k, v in sorted(collections.Counter(len(a) for a in apis).items()):
        w(f"| {k} | {v:,} |")
    w("\nAPI digits 1-2 by region (offshore APIs use the OCS codes 55 Alaska, 56 Pacific, 60 Northern Gulf, 61 Atlantic, but older boreholes carry "
      "the ADJACENT STATE's code: 01 AL, 17 LA, 42 TX, 04 CA, 50 AK):\n")
    w("| region | digits 1-2 | rows |\n|---|---|---|")
    for (reg, pre), n in sorted(collections.Counter((r["REGION_CODE"], r["API_WELL_NUMBER"][:2]) for r in base).items()):
        w(f"| {reg} | {pre} | {n:,} |")
    w("\nDigits 3-5 are the OCS AREA code (e.g. 709 = High Island), not a county. **5,287 BOEM APIs start with 42; 14 of their 10-digit forms also "
      "exist in the Texas RRC base file** (checked 2026-10-12), so API search routing by the first two digits must consider the offshore layer too.\n")
    w("## Coordinates\n")
    w("Columns: lon SURF_LONGITUDE, lat SURF_LATITUDE (surface location); BOTM_* = bottom hole. Datum NAD27 per BOEM's borehole file notes (unverified against a control point).\n")
    w(f"| what | rows |\n|---|---|\n| surface null or 0 | {no_surf:,} |\n| surface invalid (outside -180..180 / -90..90) | {bad_surf:,} |\n"
      f"| bottom-hole unusable ({botm_blank:,} blank + {botm_stars:,} printed as `*****`, BOEM's marker for withheld/unknown values) | {no_botm:,} |\n"
      f"| **on the map (surface)** | {len(base) - no_surf - bad_surf:,} |\n| **not on the map** | {no_surf + bad_surf:,} |")
    w(f"\nUnmapped reasons: {no_surf:,} rows with blank surface lat/long (both Pacific: " +
      ", ".join(r["API_WELL_NUMBER"] for r in base if num(r["SURF_LONGITUDE"]) is None or num(r["SURF_LATITUDE"]) is None) + ").")
    w("Inside a STATE outline (us_states.geojson, generalized): 699 surface points (LA 627, AK 67, AL 4, CA 1) fall inside a state polygon; "
      "these are 8(g)-zone / bay boreholes near the coast, kept as offshore.\n")
    w("## Type (WELL_TYPE_CODE)\n")
    w("| code | description | category by shared rules | rows |\n|---|---|---|---|")
    for k, v in collections.Counter(r["WELL_TYPE_CODE"] for r in base).most_common():
        d = codes["WELL_TYPE_CODE"].get(k, "?")
        w(f"| {k} | {d} | {guess_category(k, d)} | {v:,} |")
    w("\nBOEM types do not say oil vs gas. The fragment maps every type to `other` (purple shades) so nothing is invented; "
      "colouring by STATUS (Permanently Abandoned = plugged) is the more useful default for this layer.\n")
    w("## Status (BOREHOLE_STAT_CD)\n")
    w("| code | description | category by shared rules | rows |\n|---|---|---|---|")
    for k, v in collections.Counter(r["BOREHOLE_STAT_CD"] for r in base).most_common():
        d = codes["BOREHOLE_STAT_CD"].get(k, "?")
        w(f"| {k} | {d} | {guess_category(k, d)} | {v:,} |")
    w("\n## Region sub-filter (REGION_CODE)\n")
    w("| code | region | rows | surface lon range | surface lat range |\n|---|---|---|---|---|")
    for reg in sorted(by_region):
        pts = [(x, y) for (x, y), r in zip(surf, base) if r["REGION_CODE"] == reg and x is not None and y is not None]
        w(f"| {reg} | {codes['REGION_CODE'].get(reg, '?')} | {by_region[reg]:,} | {min(p[0] for p in pts):.2f} .. {max(p[0] for p in pts):.2f} | {min(p[1] for p in pts):.2f} .. {max(p[1] for p in pts):.2f} |")
    w("\nNote: the task said regions Gulf / Pacific / Alaska; the file also has **Atlantic (A, 52 boreholes, 1970s-80s COST and exploratory wells)**. "
      "gis.boem.gov also has an ATL_Layers service; it was not pulled (no wells layer verified there).\n")
    w(f"## Fields ({len(cols)}) and blank counts - base file\n")
    w("| field | blank |\n|---|---|")
    for c in cols:
        w(f"| {c} | {sum(1 for r in base if not str(r.get(c) or '').strip()):,} |")
    if rest:
        w(f"\n## Joined layer boem_rest_wells.csv ({len(rest):,} rows) - fields\n")
        w("| field | blank | note |\n|---|---|---|")
        notes = {"API_NUMBER": "join key = API_WELL_NUMBER (12 digits); 100% of REST rows join", "OPERATOR": "5-digit BOEM company number, not a name (COMPANY_NAME is in the base file)",
                 "TYPE_CODE_DESC": "description; code agrees with WELL_TYPE_CODE on every joined row", "STATUS_DESCRIPTION": "description; code agrees with BOREHOLE_STAT_CD on every joined row",
                 "X": "longitude per REST attributes", "Y": "latitude per REST attributes", "GEOM_LON": "geometry x (WGS84), added", "GEOM_LAT": "geometry y (WGS84), added", "REGION": "GOM / PAC / AK, added"}
        for c in rest[0].keys():
            w(f"| {c} | {sum(1 for r in rest if not str(r.get(c) or '').strip()):,} | {notes.get(c, '')} |")
    w("\n## Optional offshore reference layers\n")
    for name in ("boem_planning_areas.geojson", "boem_protraction.geojson"):
        p = os.path.join(OUT, name)
        if os.path.exists(p):
            gj = json.load(open(p))
            w(f"- `{name}`: {len(gj['features'])} features, {os.path.getsize(p)//1024} KB, generalized 0.01 deg. Properties include "
              f"{', '.join(k for k in gj['features'][0]['properties'].keys() if k not in ('Shape__Area', 'Shape__Length'))}.")
    w("\n## Unverified\n")
    w("- NAD27 as the datum of SURF_*/BOTM_* columns is BOEM's documentation, not checked against a control point (offset vs NAD83 in the Gulf is tens of metres).")
    w("- Why the Gulf REST well layer has 23,501 features (research note said 54,576 three days earlier).")
    w("- ATL_Layers (Atlantic) service contents.")
    w("- WELL_NAME_SUFFIX / CASING_CUT_CODE / UNDWTR_COMP_STUB code meanings were not looked up (raw values are kept and shown).")
    p = os.path.join(OUT, "boem_snapshot_report.md")
    open(p, "w").write("\n".join(L) + "\n")
    print(f"[report] {p}")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    if "--report" in sys.argv:
        report()
        sys.exit(0)
    pull_zip()
    pull_rest_wells()
    pull_polygons("boem_planning_areas.geojson", 2, 0.01)
    pull_polygons("boem_protraction.geojson", 3, 0.01)
