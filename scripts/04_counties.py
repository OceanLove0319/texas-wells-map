"""Pull Texas county boundaries (layer 29) as simplified GeoJSON -> data/raw/counties.geojson."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import BASE, get
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
feats = []
for off in range(0, 2000, 100):
    r = get(f"{BASE}/29/query", {"where": "1=1", "outFields": "FIPS,COUNTY_NAME,OBJECTID", "outSR": 4326,
            "maxAllowableOffset": 0.005, "geometryPrecision": 5, "orderByFields": "OBJECTID",
            "resultOffset": off, "resultRecordCount": 100, "f": "geojson"})
    fs = r.get("features", []); feats += fs
    if len(fs) < 100: break
expected = get(f"{BASE}/29/query", {"where": "1=1", "returnCountOnly": "true"})["count"]
json.dump({"type": "FeatureCollection", "features": feats}, open(f"{ROOT}/data/raw/counties.geojson", "w"))
print(f"counties: {len(feats)} expected {expected} {'OK' if len(feats)==expected else 'MISMATCH'}")
