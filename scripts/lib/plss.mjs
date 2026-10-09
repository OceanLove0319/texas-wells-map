/**
 * Approximate well locations from the Public Land Survey System (PLSS).
 *
 * Input: data/raw/plss/<ST>_sections.jsonl from scripts/plss_pull.py (BLM CadNSDI PLSS sections).
 * Each section is reduced to its bounding box, keyed by meridian + township + range + section.
 * A well with no usable coordinates but a valid meridian/township/range/section is placed at the
 * center of that section, or at the center of the smallest quarter call that can be applied
 * (NE/NW/SE/SW quarters and N2/S2/E2/W2 halves, largest call first).
 *
 * CadNSDI PLSSID layout: ST MM TTT t D RRR r D d  e.g. OK170290N0260W0 = Oklahoma, meridian 17 (Indian),
 * T29N (fraction 0), R26W (fraction 0), duplicate flag 0.
 */
import fs from 'node:fs';
import path from 'node:path';

const MERIDIAN_NAMES = { '06': 'Sixth Principal Meridian', 11: 'Cimarron Meridian', 17: 'Indian Meridian' };

/** Build the section lookup for one state, or null when no PLSS file exists. */
export function loadSections(root, st) {
  const p = path.join(root, 'data', 'raw', 'plss', `${st}_sections.jsonl`);
  if (!fs.existsSync(p)) return null;
  const boxes = new Map();
  let rows = 0, skipped = 0;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    if (!line) continue;
    const j = JSON.parse(line);
    rows++;
    const m = String(j.plssid).match(/^[A-Z]{2}(\d{2})(\d{3})(\d)([NS])(\d{3})(\d)([EW])(\d)$/);
    const sec = parseInt(j.sec, 10);
    if (!m || m[3] !== '0' || m[6] !== '0' || !Number.isFinite(sec) || !j.rings) { skipped++; continue; }
    const key = `${m[1]}|${Number(m[2])}${m[4]}|${Number(m[5])}${m[7]}|${sec}`;
    const b = boxes.get(key) || [Infinity, Infinity, -Infinity, -Infinity];
    for (const ring of j.rings) for (const [x, y] of ring) { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); }
    boxes.set(key, b);
  }
  // A key whose merged box is much bigger than a section (about 0.018 x 0.0145 degrees) is ambiguous.
  let ambiguous = 0;
  for (const [k, b] of boxes) if (b[2] - b[0] > 0.04 || b[3] - b[1] > 0.04) { boxes.set(k, null); ambiguous++; }
  return { boxes, rows, skipped, ambiguous, file: path.relative(root, p) };
}

const HALF = { N2: [0, 0.5, 1, 1], S2: [0, 0, 1, 0.5], E2: [0.5, 0, 1, 1], W2: [0, 0, 0.5, 1],
  NE: [0.5, 0.5, 1, 1], NW: [0, 0.5, 0.5, 1], SE: [0.5, 0, 1, 0.5], SW: [0, 0, 0.5, 0.5] };
const normCall = (q) => String(q ?? '').trim().toUpperCase().replace(/[/½]/g, '').replace(/^([NSEW])1?2$/, '$12').replace(/^([NSEW])H$/, '$12');

/**
 * Locate one well. `g(field)` reads a column of the well's row. Returns
 * { point: [lon, lat], text } on success or { reason } on failure.
 */
export function locate(cfg, lookup, g) {
  if (!lookup) return { reason: 'no PLSS grid for this state' };
  const t = cfg.township(g), rg = cfg.range(g), sec = cfg.section(g);
  if (!t || !rg || !sec || sec > 36) return { reason: 'missing or invalid township/range/section' };
  const raw = cfg.meridian(g);
  const tail = `|${t.n}${t.dir}|${rg.n}${rg.dir}|${sec}`;
  let mer = cfg.meridians[raw];
  let inferred = false;
  if (!mer) {
    // Meridian missing or unknown: use it only if exactly one of the state's meridians has this section.
    const hits = Object.values(cfg.meridians).filter((m) => lookup.boxes.get(m + tail));
    if (hits.length !== 1) return { reason: raw ? `unknown meridian "${raw}"` : 'missing meridian' };
    mer = hits[0];
    inferred = true;
  }
  const box = lookup.boxes.get(mer + tail);
  if (box === null) return { reason: 'section is ambiguous in the BLM grid' };
  if (!box) return { reason: 'section not found in the BLM grid' };
  let b = box.slice();
  const used = [];
  for (const q of cfg.quarters(g)) {
    const c = normCall(q);
    const f = HALF[c];
    if (!f) break; // blank, "C" (center) or unrecognized: stop at the current level
    const w = b[2] - b[0], h = b[3] - b[1];
    b = [b[0] + f[0] * w, b[1] + f[1] * h, b[0] + f[2] * w, b[1] + f[3] * h];
    used.push(c);
  }
  const point = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
  const where = `${used.length ? `${used.slice().reverse().join(' ')} of ` : ''}Sec ${sec}, T${t.n}${t.dir}, R${rg.n}${rg.dir}, ${MERIDIAN_NAMES[mer] || `meridian ${mer}`}`;
  return { point, sectionBox: box, inferred, quarters: used.length,
    text: `center of ${where}${inferred ? ' (meridian inferred: the only meridian with this section)' : ''}` };
}
