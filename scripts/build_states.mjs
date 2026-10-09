#!/usr/bin/env node
/**
 * build_states.mjs - data/raw/us_states.geojson (Census TIGERweb, from scripts/states_pull.py)
 * -> app/assets/data/states.json: state outlines for the bold state-boundary layer and label points.
 * Properties are normalized to { abbr, name, label: [lon, lat] }.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'data', 'raw', 'us_states.geojson');
const OUT = path.join(ROOT, 'app', 'assets', 'data', 'states.json');
const round = (c) => (typeof c[0] === 'number' ? [Math.round(c[0] * 1e5) / 1e5, Math.round(c[1] * 1e5) / 1e5] : c.map(round));

const gj = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const features = gj.features.map((f) => {
  const p = f.properties;
  return {
    type: 'Feature',
    geometry: { type: f.geometry.type, coordinates: round(f.geometry.coordinates) },
    properties: { abbr: p.STUSAB, name: p.NAME, label: [Number(p.INTPTLON), Number(p.INTPTLAT)] },
  };
});
fs.writeFileSync(OUT, JSON.stringify({ type: 'FeatureCollection', source: 'US Census TIGERweb State_County/0, generalized', features }));
console.log(`[build_states] ${features.length} states -> ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
