/**
 * _shared.mjs - helpers every config fragment in scripts/states/ may import.
 * (Files starting with "_" are not loaded as fragments by scripts/states.config.mjs.)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const r = (...p) => path.join(ROOT, ...p);

// ---- helpers for PLSS columns ----
export const int = (v) => { const n = parseInt(String(v ?? '').trim(), 10); return Number.isFinite(n) && n > 0 ? n : null; };
/** "26N" / "026N" / "26 N" -> { n: 26, dir: 'N' } */
export const tr = (v) => { const m = String(v ?? '').trim().toUpperCase().match(/^0*(\d+)\s*([NSEW])$/); return m ? { n: Number(m[1]), dir: m[2] } : null; };
/** number column + direction column ("16", "South") -> { n: 16, dir: 'S' } */
export const trDir = (num, dir, ok) => { const n = int(num); const d = String(dir ?? '').trim().toUpperCase().charAt(0); return n && ok.includes(d) ? { n, dir: d } : null; };

// ---- snapshot helpers ----
export function layerNamesFromSummary(p) {
  const names = {};
  if (!fs.existsSync(p)) return names;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|.*data\/raw\/([\w.-]+\.csv)/);
    if (m) names[m[3]] = m[2];
  }
  return names;
}

export function snapshotFromReport(rep) {
  if (fs.existsSync(rep)) {
    const txt = fs.readFileSync(rep, 'utf8');
    const m = txt.match(/Pull finish times[^\n]*?(\d{4}-\d{2}-\d{2})/) || txt.match(/(\d{4}-\d{2}-\d{2})/);
    if (m) return { date: m[1], source: path.relative(ROOT, rep) };
  }
  return { date: 'unknown', source: 'none' };
}

/** Latest pull_log.jsonl line for `name`; the date is rec[field] when given, else finished_utc. */
export function snapshotFromPullLog(S) {
  const spec = S.snapshot;
  if (typeof spec === 'function') return spec();
  const p = path.join(S.raw, spec.log);
  if (!fs.existsSync(p)) return { date: 'unknown', source: 'none' };
  const rows = fs.readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter((x) => x && x.finished_utc && (!spec.name || x.name === spec.name));
  const dates = rows.map((x) => String((spec.field && x[spec.field]) || x.finished_utc)).sort();
  return dates.length
    ? { date: dates[dates.length - 1].slice(0, 10), source: `${path.relative(ROOT, p)} (${spec.name}${spec.field ? `, ${spec.field}` : ''})` }
    : { date: 'unknown', source: 'none' };
}
