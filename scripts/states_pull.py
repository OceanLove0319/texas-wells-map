"""US state boundaries (Census TIGERweb, generalized) -> data/raw/us_states.geojson. One request, no paging.

All 50 states + DC (no territories), simplified with maxAllowableOffset so the file stays small.
Usage: python3 -I scripts/states_pull.py
"""
import json, os, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "raw", "us_states.geojson")
URL = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/0/query"
params = {"where": "CAST(STATE AS INT) <= 56", "outFields": "NAME,STUSAB,STATE,CENTLAT,CENTLON,INTPTLAT,INTPTLON",
          "returnGeometry": "true", "outSR": 4326, "maxAllowableOffset": 0.002, "geometryPrecision": 5, "f": "geojson"}
req = urllib.request.Request(URL + "?" + urllib.parse.urlencode(params), headers={"User-Agent": "tx-wells-map one-time snapshot"})
gj = json.load(urllib.request.urlopen(req, timeout=300))
json.dump(gj, open(OUT, "w"), separators=(",", ":"))
print(len(gj["features"]), "states,", os.path.getsize(OUT) // 1024, "KB ->", OUT)
print(sorted(f["properties"]["STUSAB"] for f in gj["features"]))
