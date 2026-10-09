#!/usr/bin/env node
/**
 * state_report.mjs - generic snapshot report for one state (no network).
 *
 * Reads the state's raw base file (per scripts/states.config.mjs) and the built app/assets/data/meta.json
 * (run "npm run data" first, so location / repair / approximate counts match the app exactly), and writes
 *   data/raw/<st>/<st>_snapshot_report.md   and a committed copy at data/<st>_snapshot_report.md
 *
 * Contents: pull log, row count vs the regulator's count, coordinates (null / zero / invalid / outside the
 * state, repaired, approximate, unmapped and why), API quality, type and status counts, every field with
 * its blank count.
 *
 * Usage: node scripts/state_report.mjs KS
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { STATES, ROOT, snapshotFromPullLog } from './states.config.mjs';
import { canonicalApi } from '../app/src/api.mjs';
import { stateOutlines, inState } from './lib/geo.mjs';

const id = (process.argv[2] || '').toUpperCase();
const S = STATES.find((s) => s.id === id);
if (!S) { console.error(`usage: node scripts/state_report.mjs <${STATES.map((s) => s.id).join('|')}>`); process.exit(1); }
const require = createRequire(path.join(ROOT, 'app', 'package.json'));
const { parse } = require('csv-parse');

const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'app', 'assets', 'data', 'meta.json'), 'utf8'));
const M = meta.states.find((s) => s.id === id);
if (!M) { console.error(`${id} is not in meta.json - run "npm run data" first`); process.exit(1); }
const fmt = (n) => Number(n).toLocaleString('en-US');
const outline = stateOutlines(ROOT)[id];

const file = path.join(S.raw, S.base);
let header = null, rows = 0;
const blanks = [], apiLens = new Map(), canonCount = new Map();
let nullCoords = 0, invalid = 0, outBox = 0, outPoly = 0, noCanon = 0;
const parser = fs.createReadStream(file).pipe(parse({ relax_column_count: true, bom: true }));
for await (const rec of parser) {
  if (!header) { header = rec; header.forEach(() => blanks.push(0)); continue; }
  rows++;
  rec.forEach((v, i) => { if (String(v ?? '').trim() === '') blanks[i]++; });
  const ai = S.apiField ? header.indexOf(S.apiField) : header.findIndex((n) => /^api(_number|_no|num)?$/i.test(n));
  const raw = String(rec[ai] ?? '').trim();
  apiLens.set(raw.length, (apiLens.get(raw.length) || 0) + 1);
  const c = canonicalApi(S, raw);
  if (c) canonCount.set(c, (canonCount.get(c) || 0) + 1); else noCanon++;
  const first = (cands) => { for (const n of cands) { const v = parseFloat(rec[header.indexOf(n)]); if (Number.isFinite(v) && v !== 0) return v; } return NaN; };
  const x = first(S.lon), y = first(S.lat);
  if (!Number.isFinite(x) || !Number.isFinite(y)) { nullCoords++; continue; }
  if (Math.abs(x) > 180 || Math.abs(y) > 90) { invalid++; continue; }
  if (outline) {
    const b = outline.bbox;
    if (x < b[0] - 0.05 || x > b[2] + 0.05 || y < b[1] - 0.05 || y > b[3] + 0.05) outBox++;
    if (!inState(outline, x, y)) outPoly++;
  }
}

const L = [];
const snap = snapshotFromPullLog(S);
L.push(`# Snapshot report - ${S.agency} well data (${S.name})\n`);
L.push(`Report generated: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC  `);
L.push(`Data date shown in the app: **${snap.date}** (from ${snap.source})  `);
const logPath = path.join(S.raw, 'pull_log.jsonl');
if (fs.existsSync(logPath)) {
  L.push('\nPull log:\n');
  for (const l of fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean)) L.push(`- \`${l}\``);
}
L.push('\n## Row count\n');
L.push('| what | rows |'); L.push('|---|---|');
L.push(`| ${S.base} (rows in file) | ${fmt(rows)} |`);
L.push(`| wells in the app (meta.json) | ${fmt(M.wellCount)} |`);
if (S.sourceCount && fs.existsSync(S.sourceCount)) {
  const sc = JSON.parse(fs.readFileSync(S.sourceCount, 'utf8'));
  L.push(`| regulator live count (${sc.service}, ${sc.fetched_utc}) | ${fmt(sc.count)} |`);
  L.push(`\nDifference live count - file: **${fmt(sc.count - rows)}** (the bulk file is a periodic build; the live service is updated nightly).`);
}
L.push(`\nFile rows = wells in the app: **${rows === M.wellCount ? 'yes' : 'NO'}**`);

L.push('\n## Coordinates\n');
L.push(`Columns: lon ${S.lon.join(' / ')}, lat ${S.lat.join(' / ')}; datum ${S.datum || 'not stated'}.\n`);
L.push('| what | wells |'); L.push('|---|---|');
L.push(`| null or 0 | ${fmt(nullCoords)} |`);
L.push(`| invalid (outside -180..180 / -90..90) | ${fmt(invalid)} |`);
L.push(`| valid but outside the ${S.name} outline bbox (+0.05 deg) | ${fmt(outBox)} |`);
L.push(`| valid but outside the ${S.name} outline (Census, generalized; points on the border can fall just outside) | ${fmt(outPoly)} |`);
L.push(`| **on the map: exact** | ${fmt(M.exact)} |`);
L.push(`| **on the map: exact after repair** (lost decimal point) | ${fmt(M.repaired)} |`);
L.push(`| **on the map: approximate** (PLSS section / quarter center) | ${fmt(M.approximate)} |`);
L.push(`| **not on the map** | ${fmt(M.unplottable)} |`);
const reasons = Object.entries(M.approxFailed || {});
if (reasons.length) { L.push('\nWhy wells without usable coordinates could not be placed:\n'); for (const [k, v] of reasons) L.push(`- ${k}: ${fmt(v)}`); }
const rf = Object.entries(M.repairFailed || {});
if (rf.length) { L.push('\nInvalid coordinates not repaired:\n'); for (const [k, v] of rf) L.push(`- ${k}: ${fmt(v)}`); }
if (M.plss) L.push(`\nPLSS grid: ${M.plss.file}, ${fmt(M.plss.sections)} sections, ${fmt(M.plss.keys)} keys (${fmt(M.plss.ambiguous)} ambiguous, not used).`);

L.push('\n## API\n');
L.push('| raw API length | wells |'); L.push('|---|---|');
for (const [k, v] of [...apiLens.entries()].sort((a, b) => a[0] - b[0])) L.push(`| ${k} | ${fmt(v)} |`);
const dup = [...canonCount.values()].filter((v) => v > 1).length;
L.push(`\nWells with a full API (10 digits starting ${S.apiPrefix}): ${fmt(rows - noCanon)}; distinct: ${fmt(canonCount.size)}; APIs on more than one row: ${fmt(dup)}; without a full API (not searchable by API): ${fmt(noCanon)}`);

const catTable = (title, field, list) => {
  L.push(`\n## ${title} (${field})\n`);
  L.push('| legend entry | raw values | category | wells | on map | approximate |'); L.push('|---|---|---|---|---|---|');
  for (const t of list) L.push(`| ${t.name} | ${(t.variants || [t.code]).map((v) => v || '(blank)').join(', ')} | ${t.category || '-'} | ${fmt(t.total)} | ${fmt(t.count)} | ${fmt(t.approx || 0)} |`);
};
catTable('Type', S.typeField, meta.types.slice(...M.typeRange));
if (S.statusField) catTable('Status', S.statusField, meta.statuses.slice(...M.statusRange));

L.push(`\n## Fields (${header.length}) and blank counts\n`);
L.push('| field | label in app | blank |'); L.push('|---|---|---|');
header.forEach((h, i) => L.push(`| ${h} | ${M.base.fields[i]?.label ?? ''} | ${fmt(blanks[i])} |`));

const out = path.join(S.raw, `${id.toLowerCase()}_snapshot_report.md`);
fs.writeFileSync(out, L.join('\n') + '\n');
fs.copyFileSync(out, path.join(ROOT, 'data', `${id.toLowerCase()}_snapshot_report.md`));
console.log(`[state_report] ${id}: rows=${rows} null=${nullCoords} invalid=${invalid} outsideOutline=${outPoly} -> ${path.relative(ROOT, out)}`);
