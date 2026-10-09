#!/usr/bin/env node
/**
 * build_check_data.mjs - sanity-check the built app assets in app/assets/data before packaging.
 * Used locally and in CI (CI never pulls from RRC; it packages the committed assets).
 * Exits non-zero if anything is missing or inconsistent.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'app', 'assets', 'data');
const fail = (m) => { console.error(`[check_data] FAIL: ${m}`); process.exit(1); };

if (!fs.existsSync(path.join(DIR, 'meta.json'))) fail(`no meta.json in ${DIR} - run "npm run data" first`);
const meta = JSON.parse(fs.readFileSync(path.join(DIR, 'meta.json'), 'utf8'));
const N = meta.wellCount;
const expect = { 'points.bin': N * 8, 'types.bin': N, 'apis.bin': N * 4 };
for (const [f, bytes] of Object.entries(expect)) {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) fail(`missing ${f}`);
  if (fs.statSync(p).size !== bytes) fail(`${f} is ${fs.statSync(p).size} bytes, expected ${bytes}`);
}
if (!fs.existsSync(path.join(DIR, 'counties.json'))) fail('missing counties.json');
const typeSum = meta.types.reduce((a, t) => a + t.count, 0);
if (typeSum !== N) fail(`type counts sum ${typeSum} != wellCount ${N}`);
if (meta.sourceRowCount !== N) fail(`sourceRowCount ${meta.sourceRowCount} != wellCount ${N}`);
let covered = 0;
for (const s of meta.shards) {
  if (s.start !== covered) fail(`shard ${s.key} starts at ${s.start}, expected ${covered}`);
  if (!fs.existsSync(path.join(DIR, s.file))) fail(`missing ${s.file}`);
  covered += s.count;
}
if (covered !== N) fail(`shards cover ${covered} wells, expected ${N}`);
console.log(`[check_data] OK: ${N.toLocaleString()} wells, ${meta.types.length} types, ${meta.layers.length} joined layers, ${meta.shards.length} shards, ${meta.countyCount} counties, snapshot ${meta.snapshot}`);
