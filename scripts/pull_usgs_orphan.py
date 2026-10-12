"""USGS Documented Orphaned Well Database (DOWDB) 2026 release, one-time snapshot -> data/raw/usgs_orphan/.

This is an OVERLAY (documented unplugged orphan wells in 28 states), not a state layer.

Polite by design: sequential requests, a sleep between requests, retry with backoff, files that already exist are
not downloaded again. No recurring pulls.

  1. US_orphaned_wells_2026.csv   the bulk CSV on ScienceBase (ONE download, ~29 MB, every column kept). BASE file.
  2. US_orphaned_wells_2026.xml   the FGDC metadata record (terms, dates, field definitions), small.
  3. source_count.json            returnCountOnly + field list of the ArcGIS FeatureServer copy, for row-count reconciliation.
  4. pull_log.jsonl               one JSON line per download.

ScienceBase item 6aad481a1ba49ba9a487439b, DOI 10.5066/P13FHBYG (public domain / CC0, USGS).
Usage: python3 -I scripts/pull_usgs_orphan.py
"""
import datetime, json, os, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "usgs_orphan")
ITEM = "6aad481a1ba49ba9a487439b"
SB_ITEM = f"https://www.sciencebase.gov/catalog/item/{ITEM}"
SB_FILE = f"https://www.sciencebase.gov/catalog/file/get/{ITEM}"
FS = "https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/US_Documented_Unplugged_Orphaned_Oil_and_Gas_Well_Dataset/FeatureServer/0"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 0.6
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get(url, params=None, retries=5):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
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


def pull_file(name, item_meta):
    p = os.path.join(OUT, name)
    if os.path.exists(p) and os.path.getsize(p) > 0:
        print(f"[skip] {name} exists")
        return
    fmeta = next((f for f in item_meta.get("files", []) if f.get("name") == name), {})
    print(f"[download] {name} ({int(fmeta.get('size') or 0)/1e6:.1f} MB per ScienceBase)")
    data, h = get(SB_FILE, {"name": name})
    open(p + ".part", "wb").write(data)
    os.replace(p + ".part", p)
    log({"name": name, "url": f"{SB_FILE}?name={name}", "bytes": len(data), "sciencebase_bytes": fmeta.get("size"),
         "sciencebase_date_uploaded": fmeta.get("dateUploaded"), "content_type": h.get("Content-Type"),
         "status": "downloaded" if not fmeta.get("size") or len(data) == int(fmeta["size"]) else "SIZE_MISMATCH",
         "finished_utc": now()})
    print(f"  {len(data)/1e6:.1f} MB")


def pull_count():
    p = os.path.join(OUT, "source_count.json")
    if os.path.exists(p):
        print("[skip] source_count.json exists")
        return
    meta = json.loads(get(FS, {"f": "json"})[0])
    cnt = json.loads(get(FS + "/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})[0])["count"]
    edit = meta.get("editingInfo", {}).get("dataLastEditDate")
    json.dump({"service": FS, "count": cnt, "layer_name": meta.get("name"),
               "data_last_edit_utc": datetime.datetime.fromtimestamp(edit / 1000, datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ") if edit else None,
               "fields": [f["name"] for f in meta.get("fields", [])], "fetched_utc": now()}, open(p, "w"), indent=1)
    log({"name": "source_count.json", "service": FS, "server_count": cnt, "status": "OK", "finished_utc": now()})
    print(f"[count] USGS DOWDB FeatureServer: {cnt:,} wells")


def report():
    """data/raw/usgs_orphan/usgs_orphan_snapshot_report.md: counts vs source, fields, API match rate per state (offline)."""
    import collections, csv, re
    csv.field_size_limit(1 << 30)
    dig = lambda s: re.sub(r"\D", "", str(s or ""))
    base = os.path.join(OUT, "US_orphaned_wells_2026.csv")
    rows = list(csv.DictReader(open(base, newline="", encoding="utf-8-sig")))
    cols = list(rows[0].keys())
    src = json.load(open(os.path.join(OUT, "source_count.json")))
    item = json.load(open(os.path.join(OUT, "sciencebase_item.json")))
    logs = [json.loads(l) for l in open(os.path.join(OUT, "pull_log.jsonl")) if l.strip()]
    xml = open(os.path.join(OUT, "US_orphaned_wells_2026.xml"), encoding="utf-8", errors="replace").read()
    tag = lambda t: (re.search(rf"<{t}>(.*?)</{t}>", xml, re.S) or [None, ""])[1].strip()

    def num(v):
        try:
            return float(v)
        except (TypeError, ValueError):
            return None
    coords = [(num(r["longitude"]), num(r["latitude"])) for r in rows]
    nocoord = sum(1 for x, y in coords if x is None or y is None or x == 0 or y == 0)
    invalid = sum(1 for x, y in coords if x is not None and y is not None and not (-180 <= x <= 180 and -90 <= y <= 90))
    # USGS lists states by full name; the map's state entries use 2-letter ids. Match APIs against the state files we have.
    STATE_FILES = {  # state name -> (2-digit API prefix, base file, API column, form)
        "Texas": ("42", os.path.join(ROOT, "data", "raw", "wells.csv"), "API", "county8"),
        "Oklahoma": ("35", os.path.join(ROOT, "data", "raw", "ok", "rbdms-wells.csv"), "API", "full"),
        "Kansas": ("15", os.path.join(ROOT, "data", "raw", "ks", "ks_wells.txt"), "API_NUMBER", "full"),
    }
    by_state = collections.Counter(r["state"] for r in rows)
    id_types = collections.defaultdict(collections.Counter)
    for r in rows:
        id_types[r["state"]][r["primary_identifier_type"] or "(blank)"] += 1
    match = {}
    for st, (pre, p, col, form) in STATE_FILES.items():
        if not os.path.exists(p):
            match[st] = None
            continue
        S = set()
        with open(p, newline="", encoding="utf-8", errors="replace") as f:
            for row in csv.DictReader(f):
                d = dig(row.get(col))
                if form == "county8":
                    if len(d) == 8:
                        S.add(pre + d)
                elif len(d) >= 10 and d.startswith(pre):
                    S.add(d[:10])
        sub = [r for r in rows if r["state"] == st]
        with_api = [r for r in sub if r["primary_identifier_type"] == "API" and dig(r["primary_identifier"]).startswith(pre) and len(dig(r["primary_identifier"])) >= 10]
        matched = sum(1 for r in with_api if dig(r["primary_identifier"])[:10] in S)
        match[st] = {"rows": len(sub), "with_api": len(with_api), "matched": matched, "state_apis": len(S), "file": os.path.relpath(p, ROOT)}
    L = []
    w = L.append
    w("# Snapshot report - USGS Documented Orphaned Well Database (DOWDB) 2026 - OVERLAY, not a state\n")
    w(f"Report generated: {now()}  ")
    w(f"Source: ScienceBase item {ITEM} (DOI 10.5066/P13FHBYG), \"{item.get('title')}\"; FeatureServer copy {FS}  ")
    def mdy(s):
        try:
            return datetime.datetime.strptime(s.strip(), "%m/%d/%Y").date().isoformat()
        except ValueError:
            return None
    fdates = sorted(d for d in (mdy(r["data_file_date"]) for r in rows) if d)
    w(f"Publication date: {next((d['dateString'] for d in item.get('dates', []) if d.get('type') == 'Publication'), '?')}; "
      f"state data files dated {fdates[0]} .. {fdates[-1]} (data_file_date, per source agency)  ")
    w(f"Data date shown in the app (suggested): **{next((d['dateString'] for d in item.get('dates', []) if d.get('type') == 'Publication'), '?')}** (publication date; the CSV is a one-time release, not a feed)  ")
    w(f"Update frequency: irregular releases (2022 initial, 2026 this one; \"supersedes\" the previous). No API key, no paging needed.  ")
    w(f"Licensing / terms (FGDC metadata): access constraints \"{tag('accconst') or '?'}\"; use constraints \"{(tag('useconst') or '?')[:400]}\"  \n")
    w("Pull log:\n")
    for l in logs:
        w(f"- `{json.dumps(l)}`")
    w("\n## Row count\n")
    w("| what | rows |\n|---|---|")
    w(f"| US_orphaned_wells_2026.csv (rows in file) | {len(rows):,} |")
    w(f"| FeatureServer returnCountOnly ({src.get('fetched_utc')}) | {src.get('count'):,} |")
    w(f"| ScienceBase summary says | 130,121 wells in 28 states |")
    w(f"| distinct record_key | {len(set(r['record_key'] for r in rows)):,} |")
    w(f"| states present | {len(by_state)} |")
    w(f"\nFile rows = source count: **{'yes' if len(rows) == src.get('count') else 'NO'}**\n")
    w("## Coordinates\n")
    w("Columns: lon `longitude`, lat `latitude`; datum NAD83 per the metadata / location_notes (many records say \"USGS converted original NAD27 to NAD83\").\n")
    w(f"| what | wells |\n|---|---|\n| null or 0 | {nocoord:,} |\n| invalid (outside -180..180 / -90..90) | {invalid:,} |\n| **on the map** | {len(rows) - nocoord - invalid:,} |\n")
    w("## Unmapped\n")
    w(f"- {nocoord + invalid:,} rows without a usable coordinate (no PLSS fallback attempted for the overlay).\n")
    w("## Wells per state, identifier type, and match against the state layers we have\n")
    w("Match = USGS primary_identifier is an API whose first 10 digits equal a canonical API in that state's base file. "
      "States without a layer in this repo yet show `-`; rerun `python3 -I scripts/pull_usgs_orphan.py --report` after other states land (add them to STATE_FILES).\n")
    w("| state | USGS rows | identifier types | with 10+ digit API | matched to state layer | match rate (of rows) |\n|---|---|---|---|---|---|")
    for st, n in sorted(by_state.items(), key=lambda x: -x[1]):
        m = match.get(st)
        types = ", ".join(f"{k} {v:,}" for k, v in id_types[st].most_common())
        if m:
            w(f"| {st} | {n:,} | {types} | {m['with_api']:,} | {m['matched']:,} | {100 * m['matched'] / n:.1f}% |")
        else:
            w(f"| {st} | {n:,} | {types} | - | - | - |")
    w("\nNotes: Kansas (4,566), 512 Oklahoma and 249 Louisiana rows carry NO identifier at all (name/number/coords only) and "
      "cannot be matched by API. Kentucky uses KYPermit, Indiana IGSID, 319 Illinois rows ILRefNo. "
      "Oklahoma rows with API: 19,469; those not matched in OCC RBDMS: "
      f"{(match.get('Oklahoma') or {}).get('with_api', 0) - (match.get('Oklahoma') or {}).get('matched', 0):,}.\n")
    w("## Type (`type`, raw, top 40) - overlay keeps the raw value; suggested shared category in the last column\n")
    w("| raw type | wells | category guess |\n|---|---|---|")
    for k, v in collections.Counter(r["type"] for r in rows).most_common(40):
        w(f"| {k or '(blank)'} | {v:,} | {guess_category(k)} |")
    w("\n## Status (`status`, raw, top 40)\n")
    w("| raw status | wells |\n|---|---|")
    for k, v in collections.Counter(r["status"] for r in rows).most_common(40):
        w(f"| {k or '(blank)'} | {v:,} |")
    w("\n## Source agency (`source`)\n")
    w("| source | wells |\n|---|---|")
    for k, v in collections.Counter(r["source"] for r in rows).most_common():
        w(f"| {k or '(blank)'} | {v:,} |")
    w(f"\n## Fields ({len(cols)}) and blank counts\n")
    w("| field | blank |\n|---|---|")
    for c in cols:
        w(f"| {c} | {sum(1 for r in rows if not str(r.get(c) or '').strip()):,} |")
    w("\n## Unverified\n")
    w("- The REST API at https://energy.usgs.gov/api/dowdb/v1/wells was not used (CSV is complete); not re-verified here.")
    w("- Datum: the metadata says NAD83 for the dataset; per-record original datums vary (see location_notes). Not independently checked.")
    w("- Match rates above only cover states whose layer exists in this repo at report time.")
    p = os.path.join(OUT, "usgs_orphan_snapshot_report.md")
    open(p, "w").write("\n".join(L) + "\n")
    print(f"[report] {p}")


def guess_category(t):
    """Same order as CATEGORY_RULES in scripts/states.config.mjs (kept in sync by hand; informational only)."""
    import re
    s = str(t or "")
    for cat, rx in [("plugged", r"plugged|p\s*&\s*a\b|\bpa\b"), ("dry", r"\bdry\b|\bd\s*&\s*a\b"),
                    ("injection", r"inject|\binj\b|disposal|\buic\b|\bswd\b|\beor\b|enhanced recovery|\bwiw\b|class ?(1|one)\b"),
                    ("other", r"storage|\bstg\b|water|observ|\bobs\b|service|core|brine|geothermal|strat|cath|monitor|helium|permit|location|\bloc\b|intent|unknown|no type|temporarily|\bta\b"),
                    ("oil", r"\boil\b|\bo\s*&\s*g\b"), ("gas", r"\bgas\b|\bcbm\b")]:
        if re.search(rx, s, re.I):
            return cat
    return "other (no rule matched)"


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    if "--report" in sys.argv:
        report()
        sys.exit(0)
    item = json.loads(get(SB_ITEM, {"format": "json"})[0])
    meta_p = os.path.join(OUT, "sciencebase_item.json")
    if not os.path.exists(meta_p):
        json.dump(item, open(meta_p, "w"), indent=1)
        log({"name": "sciencebase_item.json", "url": SB_ITEM, "title": item.get("title"),
             "dates": item.get("dates"), "status": "OK", "finished_utc": now()})
    pull_file("US_orphaned_wells_2026.csv", item)
    pull_file("US_orphaned_wells_2026.xml", item)
    pull_count()
