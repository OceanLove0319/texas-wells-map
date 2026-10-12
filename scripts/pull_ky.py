"""Kentucky Geological Survey (KGS) one-time snapshot -> data/raw/ky/.

Polite by design: ONE download of the zipped shapefile (kgs.uky.edu/robots.txt disallows query strings, so the
REST service is not queried at all), one request for county outlines, files that already exist are not downloaded
again. No recurring pulls. Pure-Python DBF/SHP reader (no GDAL/pyshp needed).

  1. kyog_dd.zip -> shp/        (KGS "Oil and gas well locations" shapefile, listed at https://kygs.uky.edu/data/oilgas
                                 as updated monthly; ~17 MB)
  2. ky_wells.csv               (every DBF attribute + lon_4326/lat_4326 read from the .shp point geometry; .prj saved
                                 next to it as ky_wells.prj so the datum is on record)
  3. ky_codes.json              (code -> description for Org_Result / Org_WClass / PlotSymbol / bore_type / IOF_IP, parsed
                                 from ogwells.htm inside the zip; Plug_Afdvt "PA" labelled from its field description)
  4. ky_counties.geojson        (US Census TIGERweb counties for state FIPS 21, simplified)

Usage: python3 -I scripts/pull_ky.py
"""
import csv, datetime, html, json, os, re, struct, sys, time, urllib.parse, urllib.request, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "ky")
SHP_DIR = os.path.join(OUT, "shp")
ZIP_URL = "https://kgs.uky.edu/ogdata/kyog_dd.zip"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 0.5
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get(url, params=None, retries=4, timeout=600):
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
            time.sleep(SLEEP * 6 * attempt)
    raise RuntimeError(f"failed: {url}")


def log(rec):
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")


def pull_zip():
    z = os.path.join(OUT, "kyog_dd.zip")
    if not (os.path.exists(z) and os.path.getsize(z) > 0):
        print("[download] kyog_dd.zip")
        data, h = get(ZIP_URL)
        open(z + ".part", "wb").write(data)
        os.replace(z + ".part", z)
        log({"name": "kyog_dd.zip", "url": ZIP_URL, "bytes": len(data), "last_modified": h.get("Last-Modified"),
             "status": "downloaded", "finished_utc": now()})
        print(f"  {len(data)/1e6:.1f} MB, Last-Modified {h.get('Last-Modified')}")
    else:
        print("[skip] kyog_dd.zip exists")
    os.makedirs(SHP_DIR, exist_ok=True)
    entries = []
    with zipfile.ZipFile(z) as zf:
        for info in zf.infolist():
            if not info.filename or info.is_dir():
                continue
            target = os.path.join(SHP_DIR, os.path.basename(info.filename))
            entries.append((target, datetime.datetime(*info.date_time).strftime("%Y-%m-%d"), info.file_size))
            if os.path.exists(target):
                continue
            with zf.open(info) as src, open(target + ".part", "wb") as dst:
                while chunk := src.read(1 << 20):
                    dst.write(chunk)
            os.replace(target + ".part", target)
            print(f"[extract] {info.filename} {info.file_size/1e6:.1f} MB (dated {entries[-1][1]})")
    return entries


def read_dbf(path, encoding):
    """Yields (fields, record dicts) of a dBase III/IV file. Deleted records are skipped."""
    with open(path, "rb") as f:
        hdr = f.read(32)
        nrec, hlen, rlen = struct.unpack("<I", hdr[4:8])[0], struct.unpack("<H", hdr[8:10])[0], struct.unpack("<H", hdr[10:12])[0]
        fields = []
        while True:
            fd = f.read(32)
            if fd[0] == 0x0D or len(fd) < 32:
                break
            name = fd[:11].split(b"\x00")[0].decode("ascii", "replace")
            fields.append((name, chr(fd[11]), fd[16], fd[17]))
        f.seek(hlen)
        yield [n for n, *_ in fields]
        for _ in range(nrec):
            rec = f.read(rlen)
            if len(rec) < rlen or rec[0:1] == b"*":
                continue
            pos, out = 1, []
            for name, typ, ln, dec in fields:
                raw = rec[pos:pos + ln]; pos += ln
                if typ in ("C", "M"):
                    out.append(raw.decode(encoding, "replace").rstrip("\x00 ").strip())
                elif typ in ("N", "F"):
                    s = raw.decode("ascii", "replace").strip()
                    out.append(s if s and s != "*" * len(s) else "")
                elif typ == "D":
                    s = raw.decode("ascii", "replace").strip()
                    out.append(f"{s[:4]}-{s[4:6]}-{s[6:8]}" if len(s) == 8 and s.isdigit() else "")
                elif typ == "L":
                    c = raw[:1].decode("ascii", "replace")
                    out.append("Y" if c in "YyTt" else "N" if c in "NnFf" else "")
                else:
                    out.append(raw.decode(encoding, "replace").strip())
            yield out


def read_shp_points(path):
    """Yields (x, y) or (None, None) per record of a point shapefile (types 1, 11, 21; 0 = null shape)."""
    with open(path, "rb") as f:
        f.seek(100)
        while True:
            rh = f.read(8)
            if len(rh) < 8:
                break
            clen = struct.unpack(">i", rh[4:8])[0] * 2
            content = f.read(clen)
            st = struct.unpack("<i", content[:4])[0]
            if st in (1, 11, 21) and clen >= 20:
                yield struct.unpack("<dd", content[4:20])
            else:
                yield (None, None)


def convert():
    out = os.path.join(OUT, "ky_wells.csv")
    if os.path.exists(out):
        print("[skip] ky_wells.csv exists")
        return
    shp = next(f for f in sorted(os.listdir(SHP_DIR)) if f.lower().endswith(".shp"))
    stem = shp[:-4]
    find = lambda ext: next((os.path.join(SHP_DIR, f) for f in os.listdir(SHP_DIR) if f.lower() == (stem + ext).lower()), None)
    prj = find(".prj")
    if prj:
        open(os.path.join(OUT, "ky_wells.prj"), "w").write(open(prj).read())
    cpg = find(".cpg")
    encoding = open(cpg).read().strip() if cpg else "cp1252"
    try:
        "".encode(encoding)
    except LookupError:
        encoding = "cp1252"
    dbf = read_dbf(find(".dbf"), encoding)
    fields = next(dbf)
    n, nogeom = 0, 0
    with open(out + ".part", "w", newline="") as fo:
        w = csv.writer(fo)
        w.writerow(fields + ["lon_4326", "lat_4326"])
        for rec, (x, y) in zip(dbf, read_shp_points(find(".shp"))):
            if x is None:
                nogeom += 1
            w.writerow(rec + [x, y])
            n += 1
    os.replace(out + ".part", out)
    log({"name": "ky_wells.csv", "from": f"kyog_dd.zip/{shp}", "rows": n, "rows_without_geometry": nogeom,
         "prj": open(prj).read().strip()[:200] if prj else None, "dbf_encoding": encoding, "status": "OK", "finished_utc": now()})
    print(f"[convert] ky_wells.csv: {n} rows, {len(fields)} DBF fields, {nogeom} without geometry; prj: {open(prj).read()[:80] if prj else 'none'}")


def write_codes():
    """Code tables from ogwells.htm (KGS documentation shipped inside kyog_dd.zip)."""
    p = os.path.join(OUT, "ky_codes.json")
    if os.path.exists(p):
        print("[skip] ky_codes.json exists")
        return
    doc = open(os.path.join(SHP_DIR, "ogwells.htm"), encoding="utf-8", errors="replace").read()
    clean = lambda t: " ".join(html.unescape(re.sub(r"<[^>]+>", " ", t)).split())
    fields = {}
    # "Data supplied for each well" table: <td>FIELD</td><td>text ... CODE: description<br /> ...</td>
    for name, body in re.findall(r'<td valign="top">(Org_WClass|Org_Result|bore_type|IOF_IP)</td>\s*<td>(.*?)</td>', doc, re.S):
        codes = {}
        for line in re.split(r"<br\s*/?>", body):
            m = re.match(r"\s*([A-Z0-9&;]{1,6}):\s*(.+)", clean(line))
            if m:
                codes[html.unescape(m.group(1))] = m.group(2).strip()
        fields[name] = codes
    # "Key to values for the plot symbol field" table
    i = doc.find("Key to values for the plot symbol field")
    tbl = doc[i:doc.find("</table>", i)] if i >= 0 else ""
    fields["PlotSymbol"] = {clean(c): clean(d) for c, d in re.findall(r'<td valign="top">(.*?)</td>\s*<td>(.*?)</td>', tbl, re.S)}
    # Plug_Afdvt is documented only as "availability of documentation on the manner in which the well was plugged"
    fields["Plug_Afdvt"] = {"PA": "Plugging affidavit on file"}
    json.dump({"source": "ogwells.htm (inside kyog_dd.zip, KGS documentation V14); Plug_Afdvt label derived from its field description",
               "fields": fields}, open(p, "w"), indent=1)
    print("[codes] " + ", ".join(f"{k}: {len(v)}" for k, v in fields.items()))


def pull_counties():
    p = os.path.join(OUT, "ky_counties.geojson")
    if os.path.exists(p):
        print("[skip] ky_counties.geojson exists")
        return
    data, _ = get(TIGER, {"where": "STATE='21'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                          "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    gj = json.loads(data)
    json.dump(gj, open(p, "w"))
    print(f"[counties] {len(gj['features'])} Kentucky counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    entries = pull_zip()
    for target, dated, size in entries:
        if target.lower().endswith(".shp"):
            log({"name": os.path.basename(target), "from": "kyog_dd.zip", "bytes": size, "zip_entry_date": dated,
                 "status": "extracted", "finished_utc": now()})
    convert()
    write_codes()
    pull_counties()
