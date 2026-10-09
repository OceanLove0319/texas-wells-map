/** Small geometry helpers: state outlines (Census TIGERweb, data/raw/us_states.geojson) and point-in-polygon. */
import fs from 'node:fs';
import path from 'node:path';

let cache = null;
/** { 'KS': [[ring, ...], ...polygons] } from data/raw/us_states.geojson (written by scripts/states_pull.py). */
export function stateOutlines(root) {
  if (cache) return cache;
  const p = path.join(root, 'data', 'raw', 'us_states.geojson');
  cache = {};
  if (!fs.existsSync(p)) return cache;
  for (const f of JSON.parse(fs.readFileSync(p, 'utf8')).features) {
    const g = f.geometry;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    const bbox = [Infinity, Infinity, -Infinity, -Infinity];
    for (const poly of polys) for (const [x, y] of poly[0]) { bbox[0] = Math.min(bbox[0], x); bbox[1] = Math.min(bbox[1], y); bbox[2] = Math.max(bbox[2], x); bbox[3] = Math.max(bbox[3], y); }
    cache[f.properties.STUSAB] = { polys, bbox };
  }
  return cache;
}

function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** True when (x, y) is inside the state's outline (outer rings minus holes). */
export function inState(outline, x, y) {
  if (!outline) return false;
  const b = outline.bbox;
  if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) return false;
  for (const poly of outline.polys) {
    if (inRing(x, y, poly[0]) && !poly.slice(1).some((h) => inRing(x, y, h))) return true;
  }
  return false;
}

/** Distance in degrees from a point to a bbox [minx, miny, maxx, maxy] (0 inside). */
export function distToBox(x, y, b) {
  const dx = Math.max(b[0] - x, 0, x - b[2]);
  const dy = Math.max(b[1] - y, 0, y - b[3]);
  return Math.hypot(dx, dy);
}
