"""Shared polite HTTP helper for RRC ArcGIS REST pulls."""
import time, json, sys, requests

BASE = "https://gis.rrc.texas.gov/server/rest/services/rrc_public/RRC_Public_Viewer_Srvs/MapServer"
SLEEP = 0.5
_s = requests.Session()
_s.headers["User-Agent"] = "tx-wells-map one-time snapshot (research; polite, <=2 concurrent)"

class Blocked(Exception):
    pass

def get(url, params=None, retries=6, timeout=120):
    params = dict(params or {})
    params.setdefault("f", "json")
    timeouts = 0
    for attempt in range(retries):
        time.sleep(SLEEP)
        try:
            r = _s.get(url, params=params, timeout=timeout)
        except (requests.Timeout, requests.ConnectionError) as e:
            timeouts += 1
            if timeouts >= 4:
                raise Blocked(f"repeated timeouts/conn errors: {e}")
            time.sleep(2 ** attempt * 2)
            continue
        if r.status_code in (403, 429):
            raise Blocked(f"HTTP {r.status_code} on {url}")
        if r.status_code >= 500:
            time.sleep(2 ** attempt * 2)
            continue
        r.raise_for_status()
        if params.get("f") in ("json", "geojson", "pjson"):
            j = r.json()
            if isinstance(j, dict) and "error" in j:
                code = j["error"].get("code")
                if code in (403, 429):
                    raise Blocked(f"ArcGIS error {j['error']}")
                print(f"  ArcGIS error (attempt {attempt}): {j['error']}", file=sys.stderr)
                time.sleep(2 ** attempt * 2)
                continue
            return j
        return r.text
    raise RuntimeError(f"failed after {retries} attempts: {url} {params}")
