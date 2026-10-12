"""BIA Osage Agency well locations for Osage County, Oklahoma (via the Osage Minerals Council's public
ArcGIS Online layer "Osage BIA Wells") -> data/raw/ok_osage/.

Osage County minerals are federally administered (BIA), so these wells are NOT in the OCC RBDMS file.
The layer has no API numbers, operators or dates: only the BIA lease well number (WNUM), a STATUS code
and coordinates. Data last edited 2021-01-25 (service editingInfo); treat it as a static 2021 snapshot.

Paged politely: one sequential request at a time, ~0.5 s sleep, retry with backoff, existing files are
not re-downloaded. No recurring pulls.

  1. osage_bia_wells.csv      (Osage_BIA_Wells/FeatureServer/0, all attributes + WGS84 point, keyset
                               paging on FID, 2000 per page, 22 pages) + an empty API column (the build
                               needs one; these wells have no API and are not searchable by API)
  2. ok_osage_codes.json      (STATUS abbreviation -> label; see the file for which ones are
                               documented and which are our reading of the abbreviation)
  3. source_count.json        (live count)
  4. ok_osage_counties.geojson (US Census TIGERweb, Osage County only: STATE='40' AND COUNTY='113')

Usage: python3 -I scripts/pull_ok_osage.py
"""
import csv, datetime, json, os, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "ok_osage")
LAYER = "https://services5.arcgis.com/4R6INh2sx387p4Ll/arcgis/rest/services/Osage_BIA_Wells/FeatureServer/0"
ITEM = "https://www.arcgis.com/sharing/rest/content/items/f3e2c94e54d44b5bab8f591a02168c16"
TIGER = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 0.5
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
to_date = lambda ms: datetime.datetime.fromtimestamp(ms / 1000, datetime.timezone.utc).strftime("%Y-%m-%d")

# STATUS abbreviations. The layer publishes no code dictionary. Text before "--" is the legend label (the
# build drops everything after "--", as with the OCC dictionary); the text after it says whether the label is
# the BIA's own wording or our reading of the abbreviation. The raw code is always shown in the panel.
STATUS_LABELS = {
    "OIL": "Oil well",
    "GAS": "Gas well",
    "O&G": "Oil and gas well",
    "INJ": "Injection well",
    "DRY": "Dry hole",
    "LOC": "Permitted location--may never have been drilled",
    "WSW": "Water supply well",
    "OBS": "Observation well",
    "D_A": "Dry and abandoned--reading of the abbreviation",
    "TA": "Temporarily abandoned--reading of the abbreviation",
    "ABD-OIL": "Abandoned oil well--reading of the abbreviation",
    "ABD-GAS": "Abandoned gas well--reading of the abbreviation",
    "ABD-O&G": "Abandoned oil and gas well--reading of the abbreviation",
    "ABD-INJ": "Abandoned injection well--reading of the abbreviation",
    "ABD-SWD": "Abandoned salt water disposal well--reading of the abbreviation",
    "ABD-WSW": "Abandoned water supply well--reading of the abbreviation",
    "ABD_CO2": "Abandoned CO2 injection well--reading of the abbreviation",
    "CO2_INJ": "CO2 injection well--reading of the abbreviation",
    "SWD_WOE": "Salt water disposal well, WOE--reading of the abbreviation; suffix not documented",
    "SWD_WE": "Salt water disposal well, WE--reading of the abbreviation; suffix not documented",
    "OIL_SWD": "Oil well / salt water disposal--reading of the abbreviation",
    "GAS_ST": "Gas storage well--reading of the abbreviation",
    "GAS_WE": "Gas well, WE--suffix not documented",
    "INJ_WE": "Injection well, WE--suffix not documented",
    "WSW_WE": "Water supply well, WE--suffix not documented",
    "WS-WI": "Water supply / water injection--reading of the abbreviation",
    "ABD-SWE": "Abandoned, SWE--abbreviation not documented",
    "ABD_WSE": "Abandoned, WSE--abbreviation not documented",
    "ABD-RPW": "Abandoned, RPW--abbreviation not documented",
    "RPW": "RPW--abbreviation not documented",
    "ABD-CT": "Abandoned, CT--abbreviation not documented",
    "CT": "CT--abbreviation not documented",
    "ABD_DUA": "Abandoned, DUA--abbreviation not documented",
    "DUA": "DUA--abbreviation not documented",
    "DUA_INJ": "DUA injection--abbreviation not documented",
}


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
        except Exception as e:
            print(f"  retry {attempt}/{retries} {url[:120]}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 10 * attempt)
    raise RuntimeError(f"failed (stopping, do not hammer the server): {url}")


def log(rec):
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")


def pull_wells():
    path = os.path.join(OUT, "osage_bia_wells.csv")
    if os.path.exists(path):
        print("[skip] osage_bia_wells.csv exists")
        return
    meta = get(LAYER, {"f": "json"})
    fields = [f["name"] for f in meta["fields"] if f["type"] != "esriFieldTypeGeometry"]
    oid = meta.get("objectIdField") or "FID"
    page = int(meta.get("maxRecordCount") or 2000)
    count = get(f"{LAYER}/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    edit = (meta.get("editingInfo") or {}).get("dataLastEditDate") or (meta.get("editingInfo") or {}).get("lastEditDate")
    print(f"[layer] {meta['name']}: {count} records, {len(fields)} fields, page {page}, data last edited {to_date(edit) if edit else 'n/a'}")
    rows, last, statuses = [], -1, {}
    while True:
        j = get(f"{LAYER}/query", {"where": f"{oid} > {last}", "outFields": "*", "orderByFields": f"{oid} ASC",
                                   "resultRecordCount": page, "returnGeometry": "true", "outSR": 4326, "f": "json"})
        feats = j.get("features", [])
        if not feats:
            break
        for ft in feats:
            a = ft["attributes"]
            s = str(a.get("STATUS") or "").strip()
            statuses[s] = statuses.get(s, 0) + 1
            g = ft.get("geometry") or {}
            rows.append([a.get(k) for k in fields] + [g.get("x"), g.get("y"), ""])
        last = feats[-1]["attributes"][oid]
        print(f"  {len(rows)}/{count}")
    with open(path + ".part", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(fields + ["lon_4326", "lat_4326", "API"])
        w.writerows(rows)
    os.replace(path + ".part", path)
    item = get(ITEM, {"f": "json"})
    rec = {"name": "osage_bia_wells.csv", "service": LAYER, "rows": len(rows), "server_count": count,
           "data_last_edit": to_date(edit) if edit else None, "item_modified": to_date(item["modified"]) if item.get("modified") else None,
           "item_title": item.get("title"), "item_owner": item.get("owner"), "item_access": item.get("access"),
           "item_license": item.get("licenseInfo"), "item_credits": item.get("accessInformation"),
           "status": "OK" if len(rows) == count else "MISMATCH", "finished_utc": now()}
    log(rec)
    print(f"  wrote osage_bia_wells.csv: {len(rows)} rows ({rec['status']}); statuses: {statuses}")


def write_codes():
    """STATUS -> label from the values present in osage_bia_wells.csv (no network; safe to rerun)."""
    statuses = {}
    with open(os.path.join(OUT, "osage_bia_wells.csv"), newline="") as f:
        for row in csv.DictReader(f):
            s = str(row.get("STATUS") or "").strip()
            statuses[s] = statuses.get(s, 0) + 1
    codes = {s: STATUS_LABELS.get(s, f"{s}--abbreviation not documented by the source") for s in sorted(statuses)}
    json.dump({"source": f"{LAYER} (STATUS values seen in the data; the layer publishes no code dictionary; labels marked "
                         "'reading of the abbreviation' are ours)", "written_utc": now(), "counts": statuses,
               "fields": {"STATUS": codes}}, open(os.path.join(OUT, "ok_osage_codes.json"), "w"), indent=1)
    print(f"[codes] {len(codes)} STATUS values; undocumented: {[s for s in codes if 'not documented' in codes[s]]}")


def pull_count():
    p = os.path.join(OUT, "source_count.json")
    if os.path.exists(p):
        print("[skip] source_count.json exists")
        return
    cnt = get(f"{LAYER}/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
    json.dump({"service": LAYER, "count": cnt, "fetched_utc": now()}, open(p, "w"), indent=1)
    log({"name": "source_count.json", "service": LAYER, "server_count": cnt, "status": "OK", "finished_utc": now()})
    print(f"[count] Osage BIA layer: {cnt:,} wells")


def pull_counties():
    p = os.path.join(OUT, "ok_osage_counties.geojson")
    if os.path.exists(p):
        print("[skip] ok_osage_counties.geojson exists")
        return
    gj = get(TIGER, {"where": "STATE='40' AND COUNTY='113'", "outFields": "NAME,COUNTY,GEOID", "returnGeometry": "true",
                     "outSR": 4326, "maxAllowableOffset": 0.005, "f": "geojson"})
    json.dump(gj, open(p, "w"))
    print(f"[counties] {len(gj['features'])} county (Osage)")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    pull_count()
    pull_wells()
    write_codes()
    pull_counties()
