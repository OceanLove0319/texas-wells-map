"""New York DEC Division of Mineral Resources one-time snapshot -> data/raw/ny/.

Polite by design: one sequential request at a time, ~0.5 s sleep, retry with backoff, files that already exist
are not downloaded again. No recurring pulls. The nightly bulk zip is preferred over paging the Socrata copy.

  1. wellDOS.zip -> wellspublic.csv   (DEC "Oil, Gas, and Other Regulated Wells", ONE download, ~3 MB zip / ~30 MB CSV,
                                      rebuilt nightly Mon-Fri; also extracts OilandGasMetadata.html)
  2. ny_codes.json                    (code -> description for Well_Type / Well_Status / Map_Symbol / confid / State_lease /
                                      Integration, parsed from OilandGasMetadata.html; same shape as data/ok_codes.json)
  3. source_count.json                (row count of the Socrata copy data.ny.gov szye-wmt3, one small request)
  4. ny_counties.geojson              (US Census TIGERweb counties for state FIPS 36, simplified)

Usage: python3 -I scripts/pull_ny.py
"""
import datetime, html, json, os, re, sys, time, urllib.parse, urllib.request, zipfile
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "ny")
ZIP_URL = "https://extapps.dec.ny.gov/fs/data/wellDOS.zip"
SOCRATA = "https://data.ny.gov/resource/szye-wmt3.json"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 0.5
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get(url, params=None, retries=4, timeout=300):
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
    z = os.path.join(OUT, "wellDOS.zip")
    if not (os.path.exists(z) and os.path.getsize(z) > 0):
        print("[download] wellDOS.zip")
        data, h = get(ZIP_URL)
        open(z + ".part", "wb").write(data)
        os.replace(z + ".part", z)
        log({"name": "wellDOS.zip", "url": ZIP_URL, "bytes": len(data), "last_modified": h.get("Last-Modified"),
             "status": "downloaded", "finished_utc": now()})
    else:
        print("[skip] wellDOS.zip exists")
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
            log({"name": os.path.basename(info.filename), "from": "wellDOS.zip", "bytes": info.file_size,
                 "zip_entry_date": built, "status": "extracted", "finished_utc": now()})
            print(f"[extract] {info.filename} {info.file_size/1e6:.1f} MB (built {built})")


class Tables(HTMLParser):
    """Headings / captions and 2-column table rows of the DEC metadata page, in document order."""
    def __init__(self):
        super().__init__()
        self.items, self.cell, self.row, self.in_td, self.in_h = [], [], [], False, False
    def handle_starttag(self, tag, attrs):
        if tag in ("td", "th"): self.in_td, self.cell = True, []
        elif tag == "tr": self.row = []
        elif tag == "caption" or re.fullmatch(r"h[1-6]", tag): self.in_h, self.cell = True, []  # code tables are titled in <caption>
    def handle_endtag(self, tag):
        if tag in ("td", "th"): self.in_td = False; self.row.append(" ".join("".join(self.cell).split()))
        elif tag == "tr" and len(self.row) >= 2: self.items.append(("row", self.row[:2]))
        elif tag == "caption" or re.fullmatch(r"h[1-6]", tag): self.in_h = False; self.items.append(("h", " ".join("".join(self.cell).split())))
    def handle_data(self, d):
        if self.in_td or self.in_h: self.cell.append(html.unescape(d))


def write_codes():
    p = os.path.join(OUT, "ny_codes.json")
    if os.path.exists(p):
        print("[skip] ny_codes.json exists")
        return
    t = Tables(); t.feed(open(os.path.join(OUT, "OilandGasMetadata.html"), encoding="utf-8", errors="replace").read())
    # heading text -> CSV column of wellspublic.csv
    want = {"Well Status Codes": "Well_Status", "Well Type Codes": "Well_Type",
            "Well Type Codes for Mapping": "Map_Symbol", "Confidential Information Codes": "confid",
            "State Lease Codes": "State_lease", "Integration Codes": "Integration"}
    fields, cur = {}, None
    for kind, v in t.items:
        if kind == "h":
            cur = next((f for h, f in want.items() if v.startswith(h)), None)
            if cur: fields.setdefault(cur, {})
        elif cur and v[0] and v[0] not in ("CODE",) and len(v[0]) <= 24:
            fields[cur][v[0]] = v[1]
    json.dump({"source": "OilandGasMetadata.html (inside wellDOS.zip)", "fields": fields}, open(p, "w"), indent=1)
    print("[codes] " + ", ".join(f"{k}: {len(v)}" for k, v in fields.items()))


def pull_count():
    p = os.path.join(OUT, "source_count.json")
    if os.path.exists(p):
        print("[skip] source_count.json exists")
        return
    data, _ = get(SOCRATA, {"$select": "count(*)"})
    cnt = int(json.loads(data)[0]["count"])
    json.dump({"service": SOCRATA + " (Socrata copy of the same DEC database, $select=count(*))", "count": cnt,
               "fetched_utc": now()}, open(p, "w"), indent=1)
    log({"name": "source_count.json", "service": SOCRATA, "server_count": cnt, "status": "OK", "finished_utc": now()})
    print(f"[count] Socrata szye-wmt3: {cnt:,} rows")


def pull_counties():
    p = os.path.join(OUT, "ny_counties.geojson")
    if os.path.exists(p):
        print("[skip] ny_counties.geojson exists")
        return
    data, _ = get(TIGER, {"where": "STATE='36'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                          "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    gj = json.loads(data)
    json.dump(gj, open(p, "w"))
    print(f"[counties] {len(gj['features'])} New York counties")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    pull_zip()
    write_codes()
    pull_count()
    pull_counties()
