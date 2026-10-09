/**
 * Repair of obviously broken coordinates (a lost decimal point, e.g. longitude -1007768207 -> -100.7768207).
 * A value is only repaired when exactly one way of re-inserting the decimal point (for lat and/or lon)
 * puts the well inside its own state, and, when the well's PLSS section is known, within about 2 km of
 * that section. Anything else stays unrepaired (and unmapped).
 */
import { inState, distToBox } from './geo.mjs';

function candidates(v, limit) {
  if (Number.isFinite(v) && v !== 0 && Math.abs(v) <= limit) return [v];
  if (!Number.isFinite(v) || v === 0) return [];
  const sign = v < 0 ? -1 : 1;
  const s = String(Math.abs(v));
  if (/e/i.test(s)) return [];
  const [ip, fp = ''] = s.split('.');
  if (fp && !/^0*$/.test(fp)) return []; // only whole numbers can be a "lost decimal point"
  const out = [];
  for (let k = 1; k <= 3 && k < ip.length; k++) {
    const c = sign * Number(`${ip.slice(0, k)}.${ip.slice(k)}`);
    if (Math.abs(c) <= limit) out.push(c);
  }
  return out;
}

/** Returns { x, y, note } or { reason }. `sectionBox` (optional) is the well's PLSS section bbox. */
export function repair(outline, rawLon, rawLat, sectionBox) {
  const xs = candidates(rawLon, 180), ys = candidates(rawLat, 90);
  const hits = [];
  for (const x of xs) for (const y of ys) {
    if (!inState(outline, x, y)) continue;
    if (sectionBox && distToBox(x, y, sectionBox) > 0.02) continue;
    hits.push([x, y]);
  }
  if (hits.length !== 1) return { reason: hits.length ? 'ambiguous' : 'no candidate inside the state' + (sectionBox ? ' near its PLSS section' : '') };
  const [x, y] = hits[0];
  const parts = [];
  if (x !== rawLon) parts.push(`longitude ${rawLon} read as ${x}`);
  if (y !== rawLat) parts.push(`latitude ${rawLat} read as ${y}`);
  return { x, y, note: `Coordinates repaired: ${parts.join(', ')} (missing decimal point)` };
}
