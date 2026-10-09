#!/usr/bin/env node
/**
 * build_check_data.mjs - sanity-check the built app assets in app/assets/data before packaging.
 * Used locally and in CI (CI never downloads from any regulator; it packages the committed assets).
 * Exits non-zero if anything is missing, inconsistent, or too large for GitHub (50 MB per file).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'app', 'assets', 'data');
const MAX_FILE = 50 * 1024 * 1024;
const fail = (m) => { console.error(`[check_data] FAIL: ${m}`); process.exit(1); };

if (!fs.existsSync(path.join(DIR, 'meta.json'))) fail(`no meta.json in ${DIR} - run "npm run data" first`);
const meta = JSON.parse(fs.readFileSync(path.join(DIR, 'meta.json'), 'utf8'));
const N = meta.wellCount;
const expect = { 'points.bin': N * 8, 'types.bin': N, 'status.bin': N, 'apis.bin': N * 4, 'loc.bin': N };
for (const [f, bytes] of Object.entries(expect)) {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) fail(`missing ${f}`);
  if (fs.statSync(p).size !== bytes) fail(`${f} is ${fs.statSync(p).size} bytes, expected ${bytes}`);
}
if (!fs.existsSync(path.join(DIR, 'counties.json'))) fail('missing counties.json');
if (!fs.existsSync(path.join(DIR, 'states.json'))) fail('missing states.json - run "node scripts/build_states.mjs"');

const loc = new Uint8Array(fs.readFileSync(path.join(DIR, 'loc.bin')));
const ptsBuf = fs.readFileSync(path.join(DIR, 'points.bin'));
const pts = new Float32Array(ptsBuf.buffer, ptsBuf.byteOffset, ptsBuf.byteLength / 4);
let start = 0;
for (const s of meta.states) {
  if (s.start !== start) fail(`${s.id} starts at ${s.start}, expected ${start}`);
  if (s.sourceRowCount !== s.wellCount) fail(`${s.id} sourceRowCount ${s.sourceRowCount} != wellCount ${s.wellCount}`);
  const types = meta.types.slice(...s.typeRange);
  const mapped = types.reduce((a, t) => a + t.count, 0);
  const total = types.reduce((a, t) => a + t.total, 0);
  if (mapped !== s.mapped) fail(`${s.id} legend type counts ${mapped} != mapped ${s.mapped}`);
  if (total !== s.wellCount || s.mapped + s.unplottable !== s.wellCount) fail(`${s.id} counts do not add up`);
  if (s.exact + s.repaired + s.approximate !== s.mapped) fail(`${s.id} exact + repaired + approximate != mapped`);
  // loc.bin and points.bin must agree with the counts in meta.json.
  const n = { 0: 0, 1: 0, 2: 0, 255: 0 };
  for (let i = s.start; i < s.start + s.wellCount; i++) {
    const k = loc[i];
    if (!(k in n)) fail(`${s.id} well ${i} has unknown location kind ${k}`);
    n[k]++;
    if ((k === 255) === Number.isFinite(pts[i * 2])) fail(`${s.id} well ${i}: location kind ${k} disagrees with its point`);
  }
  if (n[0] !== s.exact || n[1] !== s.repaired || n[2] !== s.approximate || n[255] !== s.unplottable) fail(`${s.id} loc.bin counts ${JSON.stringify(n)} disagree with meta`);
  if (s.statusRange[1] > s.statusRange[0]) {
    const sm = meta.statuses.slice(...s.statusRange).reduce((a, t) => a + t.count, 0);
    if (sm !== s.mapped) fail(`${s.id} status counts ${sm} != mapped ${s.mapped}`);
  }
  start += s.wellCount;
}
if (start !== N) fail(`states cover ${start} wells, expected ${N}`);

let covered = 0;
for (const sh of meta.shards) {
  if (sh.start !== covered) fail(`shard ${sh.key} starts at ${sh.start}, expected ${covered}`);
  if (!fs.existsSync(path.join(DIR, sh.file))) fail(`missing ${sh.file}`);
  covered += sh.count;
}
if (covered !== N) fail(`shards cover ${covered} wells, expected ${N}`);

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
let bytes = 0;
for (const f of walk(DIR)) {
  const sz = fs.statSync(f).size;
  bytes += sz;
  if (sz > MAX_FILE) fail(`${path.relative(DIR, f)} is ${(sz / 1e6).toFixed(1)} MB (GitHub limit 50 MB) - shard it`);
}
const per = meta.states.map((s) => `${s.id} ${s.wellCount.toLocaleString()} wells (${s.exact.toLocaleString()} exact, ${s.repaired.toLocaleString()} repaired, ${s.approximate.toLocaleString()} approximate, ${s.unplottable.toLocaleString()} unmapped, snapshot ${s.snapshot})`).join('; ');
console.log(`[check_data] OK: ${per}; ${meta.types.length} types, ${meta.shards.length} shards, ${meta.countyCount} counties, ${(bytes / 1e6).toFixed(1)} MB`);
