"""BLM CadNSDI PLSS sections (first division) one-time snapshot -> data/raw/plss/<ST>_sections.jsonl.

Used to place wells that have no coordinates but do have meridian/township/range/section
("approximate location"). Generic for any PLSS state: pass the 2-letter state codes.

Source: https://gis.blm.gov/arcgis/rest/services/Cadastral/BLM_Natl_PLSS_CadNSDI/MapServer/2 (PLSS Section)
Polite by design: one sequential request at a time, a sleep between requests, keyset paging on
OBJECTID (2,000 per page), geometry generalized server-side; a state file that already exists is
not downloaded again. One output line per section: {"plssid", "sec", "dup", "typ", "rings"}.

Usage: python3 -I scripts/plss_pull.py OK KS
"""
import datetime, json, os, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "plss")
URL = "https://gis.blm.gov/arcgis/rest/services/Cadastral/BLM_Natl_PLSS_CadNSDI/MapServer/2/query"
UA = "tx-wells-map one-time snapshot (research; polite, sequential)"
SLEEP = 1.5


def get(params, retries=5):
    url = URL + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=300) as r:
                j = json.loads(r.read())
            time.sleep(SLEEP)
            if "error" in j:
                raise RuntimeError(j["error"])
            return j
        except Exception as e:
            print(f"  retry {attempt}/{retries}: {e}", file=sys.stderr)
            time.sleep(SLEEP * 5 * attempt)
    raise RuntimeError("failed: " + url[:200])


def pull(st):
    path = os.path.join(OUT, f"{st}_sections.jsonl")
    if os.path.exists(path):
        print(f"[skip] {st} exists")
        return
    where = f"PLSSID LIKE '{st}%'"
    count = get({"where": where, "returnCountOnly": "true", "f": "json"})["count"]
    print(f"[plss] {st}: {count} sections")
    n, last = 0, -1
    with open(path + ".part", "w") as f:
        while True:
            j = get({"where": f"{where} AND OBJECTID > {last}", "outFields": "OBJECTID,PLSSID,FRSTDIVNO,FRSTDIVDUP,FRSTDIVTYP",
                     "orderByFields": "OBJECTID ASC", "resultRecordCount": 2000, "returnGeometry": "true",
                     "outSR": 4326, "maxAllowableOffset": 0.0005, "geometryPrecision": 5, "f": "json"})
            feats = j.get("features", [])
            if not feats:
                break
            for ft in feats:
                a = ft["attributes"]
                f.write(json.dumps({"plssid": a["PLSSID"], "sec": a["FRSTDIVNO"], "dup": a["FRSTDIVDUP"], "typ": a["FRSTDIVTYP"],
                                    "rings": (ft.get("geometry") or {}).get("rings")}, separators=(",", ":")) + "\n")
            n += len(feats)
            last = feats[-1]["attributes"]["OBJECTID"]
            print(f"  {st} {n}/{count}")
    os.replace(path + ".part", path)
    with open(os.path.join(OUT, "pull_log.jsonl"), "a") as f:
        f.write(json.dumps({"name": f"{st}_sections.jsonl", "service": URL, "rows": n, "server_count": count,
                            "status": "OK" if n == count else "MISMATCH",
                            "finished_utc": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}) + "\n")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for st in sys.argv[1:]:
        pull(st.upper())
