/**
 * Texas Wells Map - renderer.
 * Loads compact binary point data and renders it with deck.gl; well details are
 * loaded on demand from per-county shards. All requests go to the local app:// scheme.
 */
import { Deck, MapView, WebMercatorViewport } from '@deck.gl/core';
import { ScatterplotLayer, GeoJsonLayer } from '@deck.gl/layers';
import { DataFilterExtension } from '@deck.gl/extensions';

const DATA = 'app://local/data/';
const $ = (id) => document.getElementById(id);

const state = {
  meta: null,
  points: null, // Float32Array [lon, lat] * N
  types: null, // Uint8Array * N
  apis: null, // Uint32Array * N
  colors: null, // Uint8Array RGBA * N
  filter: null, // Float32Array 1 = visible
  visibleTypes: [],
  counties: null,
  countyNames: new Map(),
  selected: -1,
  zoom: 5,
  shardCache: new Map(),
  deck: null,
};

// ---------- data loading ----------
async function fetchJson(p) {
  const r = await fetch(DATA + p);
  if (!r.ok) throw new Error(`${p}: HTTP ${r.status}`);
  return r.json();
}
async function fetchBin(p, Type) {
  const r = await fetch(DATA + p);
  if (!r.ok) throw new Error(`${p}: HTTP ${r.status}`);
  return new Type(await r.arrayBuffer());
}

async function loadAll() {
  const [meta, points, types, apis, counties] = await Promise.all([
    fetchJson('meta.json'),
    fetchBin('points.bin', Float32Array),
    fetchBin('types.bin', Uint8Array),
    fetchBin('apis.bin', Uint32Array),
    fetchJson('counties.json'),
  ]);
  Object.assign(state, { meta, points, types, apis, counties });
  state.visibleTypes = meta.types.map(() => true);

  const n = types.length;
  const colors = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) {
    const c = meta.types[types[i]].color;
    colors[i * 4] = c[0]; colors[i * 4 + 1] = c[1]; colors[i * 4 + 2] = c[2]; colors[i * 4 + 3] = 220;
  }
  state.colors = colors;
  rebuildFilter();

  for (const f of counties.features || []) {
    const p = f.properties || {};
    const code = String(p.FIPS ?? p.fips ?? p.COUNTY_FIPS ?? '').padStart(3, '0');
    const name = p.COUNTY_NAME ?? p.NAME ?? p.name;
    if (code && name) state.countyNames.set(code, titleCase(String(name)));
  }
}

function rebuildFilter() {
  const { types, visibleTypes } = state;
  const f = new Float32Array(types.length);
  for (let i = 0; i < types.length; i++) f[i] = visibleTypes[types[i]] ? 1 : 0;
  state.filter = f;
}

// ---------- formatting ----------
const fmtInt = (n) => n.toLocaleString('en-US');
const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
function fmtApi(api) {
  if (/^\d{8}$/.test(api)) return `42-${api.slice(0, 3)}-${api.slice(3)}`;
  if (/^\d{3}$/.test(api)) return `42-${api} (county code only)`;
  return api || '(no API)';
}
const api8Of = (i) => (state.apis[i] ? String(state.apis[i]).padStart(8, '0') : '');
function countyOf(api) {
  if (!/^\d{3}/.test(api)) return '';
  return state.countyNames.get(api.slice(0, 3)) || '';
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Accepts 8-digit RRC API, 10-digit with "42" prefix, or 12/14-digit with sidetrack/suffix; ignores punctuation. */
function normalizeApiQuery(q) {
  const d = String(q).replace(/\D/g, '');
  if (d.length === 8) return d;
  if ((d.length === 10 || d.length === 12 || d.length === 14) && d.startsWith('42')) return d.slice(2, 10);
  return null;
}

// ---------- map ----------
function radiusScaleFor(zoom) {
  if (zoom < 6) return 1;
  if (zoom < 7.5) return 1.5;
  if (zoom < 9) return 2.2;
  if (zoom < 11) return 3;
  return 4;
}

function buildLayers() {
  const { meta, points, colors, filter, counties, selected } = state;
  const n = state.types.length;
  const layers = [
    new GeoJsonLayer({
      id: 'counties',
      data: counties,
      stroked: true,
      filled: true,
      getFillColor: [255, 255, 255, 255],
      getLineColor: [150, 158, 170, 255],
      lineWidthUnits: 'pixels',
      getLineWidth: 0.7,
      pickable: false,
    }),
    new ScatterplotLayer({
      id: 'wells',
      data: {
        length: n,
        attributes: {
          getPosition: { value: points, size: 2 },
          getFillColor: { value: colors, size: 4, normalized: true },
          getFilterValue: { value: filter, size: 1 },
        },
      },
      radiusUnits: 'pixels',
      getRadius: 1,
      radiusScale: radiusScaleFor(state.zoom),
      radiusMinPixels: 1,
      stroked: false,
      pickable: true,
      extensions: [new DataFilterExtension({ filterSize: 1 })],
      filterRange: [0.5, 1.5],
      updateTriggers: { getFilterValue: filter },
    }),
  ];
  if (selected >= 0) {
    layers.push(new ScatterplotLayer({
      id: 'selected',
      data: [selected],
      getPosition: (i) => [points[i * 2], points[i * 2 + 1]],
      getFillColor: (i) => [...meta.types[state.types[i]].color, 255],
      getLineColor: [17, 17, 17, 255],
      radiusUnits: 'pixels',
      getRadius: 7,
      stroked: true,
      lineWidthUnits: 'pixels',
      getLineWidth: 2.5,
      pickable: false,
    }));
  }
  return layers;
}

function render() { state.deck.setProps({ layers: buildLayers() }); }

function fitView() {
  const { bbox } = state.meta;
  const el = $('map-wrap');
  const vp = new WebMercatorViewport({ width: el.clientWidth || 800, height: el.clientHeight || 600 });
  const b = Number.isFinite(bbox[0]) ? bbox : [-106.7, 25.8, -93.5, 36.6];
  const { longitude, latitude, zoom } = vp.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 24 });
  return { longitude, latitude, zoom, minZoom: 3, maxZoom: 18, pitch: 0, bearing: 0 };
}

function initDeck() {
  const initialViewState = fitView();
  state.zoom = initialViewState.zoom;
  state.deck = new Deck({
    canvas: 'map',
    views: new MapView({ repeat: false }),
    initialViewState,
    controller: { dragRotate: false, touchRotate: false, doubleClickZoom: true },
    layers: buildLayers(),
    getCursor: ({ isHovering, isDragging }) => (isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab'),
    onViewStateChange: ({ viewState }) => {
      if (radiusScaleFor(viewState.zoom) !== radiusScaleFor(state.zoom)) {
        state.zoom = viewState.zoom;
        render();
      } else state.zoom = viewState.zoom;
      return viewState;
    },
    onHover: (info) => {
      const tip = $('tooltip');
      if (info.layer && info.layer.id === 'wells' && info.index >= 0) {
        const i = info.index;
        const api = api8Of(i);
        tip.textContent = `${api ? fmtApi(api) : 'No 8-digit API'} - ${state.meta.types[state.types[i]].name}`;
        tip.style.left = `${info.x + 12}px`;
        tip.style.top = `${info.y + 12}px`;
        tip.hidden = false;
      } else tip.hidden = true;
    },
    onClick: (info) => {
      if (info.layer && info.layer.id === 'wells' && info.index >= 0) selectWell(info.index, false);
    },
  });
}

function flyTo(i) {
  const lon = state.points[i * 2], lat = state.points[i * 2 + 1];
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return false;
  const zoom = Math.max(state.zoom, 13);
  state.zoom = zoom;
  state.deck.setProps({
    initialViewState: { longitude: lon, latitude: lat, zoom, minZoom: 3, maxZoom: 18, pitch: 0, bearing: 0, transitionDuration: 600 },
  });
  return true;
}

// ---------- legend ----------
function buildLegend() {
  const { meta } = state;
  const ul = $('type-list');
  ul.innerHTML = '';
  meta.types.forEach((t, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<label title="${esc(t.name)}">
      <input type="checkbox" checked data-idx="${idx}">
      <span class="swatch" style="background: rgb(${t.color.join(',')})"></span>
      <span class="tname">${esc(t.name)}</span>
      <span class="tcount">${fmtInt(t.count)}</span></label>`;
    ul.appendChild(li);
  });
  ul.addEventListener('change', (e) => {
    const idx = Number(e.target.dataset.idx);
    if (Number.isInteger(idx)) { state.visibleTypes[idx] = e.target.checked; onFilterChange(); }
  });
  const setAll = (v) => {
    state.visibleTypes = state.visibleTypes.map(() => v);
    ul.querySelectorAll('input[type=checkbox]').forEach((c) => { c.checked = v; });
    onFilterChange();
  };
  $('types-all').onclick = () => setAll(true);
  $('types-none').onclick = () => setAll(false);
  updateLegendTotal();
}

function updateLegendTotal() {
  const { meta, visibleTypes } = state;
  const total = meta.types.reduce((a, t) => a + t.count, 0);
  const shown = meta.types.reduce((a, t, i) => a + (visibleTypes[i] ? t.count : 0), 0);
  let html = `<div>Total wells: <b id="total-wells">${fmtInt(total)}</b></div>`;
  html += `<div>Shown: <b>${fmtInt(shown)}</b> (${meta.types.length} types)</div>`;
  if (meta.unplottable) html += `<div>Without coordinates (not drawn): <b>${fmtInt(meta.unplottable)}</b></div>`;
  $('legend-total').innerHTML = html;
  return { total, shown };
}

function onFilterChange() { rebuildFilter(); updateLegendTotal(); render(); }

// ---------- details panel ----------
async function loadShardFor(i) {
  const { shards } = state.meta;
  let lo = 0, hi = shards.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (shards[mid].start <= i) lo = mid; else hi = mid - 1;
  }
  const sh = shards[lo];
  if (!state.shardCache.has(sh.key)) state.shardCache.set(sh.key, fetchJson(sh.file).then(indexShard));
  return state.shardCache.get(sh.key);
}

/** Shards are columnar; build local-well -> record-row lookups once per shard. */
function indexShard(shard) {
  for (const block of Object.values(shard.layers)) {
    const byWell = new Map();
    block.well.forEach((li, r) => { const l = byWell.get(li); if (l) l.push(r); else byWell.set(li, [r]); });
    block.byWell = byWell;
  }
  return shard;
}
const rowOf = (cols, r) => cols.map((c) => c[r]);

function fieldsTable(fields, row) {
  const rows = fields.map((f, k) => {
    const v = row[k];
    const blank = v === undefined || v === null || String(v).trim() === '';
    return `<tr><td class="k"><span class="lbl">${esc(f.label)}</span><span class="raw">${esc(f.name)}</span></td>
      <td class="v${blank ? ' blank' : ''}">${blank ? '(blank)' : esc(v)}</td></tr>`;
  });
  return `<table class="fields">${rows.join('')}</table>`;
}

async function selectWell(i, fly) {
  state.selected = i;
  render();
  if (fly) flyTo(i);
  const { meta } = state;
  const typeName = meta.types[state.types[i]].name;
  const panel = $('panel');
  panel.hidden = false;
  $('panel-body').innerHTML = '<p class="note">Loading...</p>';

  const shard = await loadShardFor(i);
  if (state.selected !== i) return; // a newer selection won
  const li = i - shard.start;
  const row = rowOf(shard.wells, li);
  const apiIdx = meta.base.fields.findIndex((f) => f.name === 'API');
  const api = String(row[apiIdx] ?? '').trim();
  const apiCol = shard.wells[apiIdx];
  const county = countyOf(api);

  $('panel-title').textContent = `API ${fmtApi(api)}`;
  $('panel-sub').textContent = [typeName, county && `${county} County`].filter(Boolean).join(' - ');

  let html = '';
  // Other well rows sharing this API (rows in a shard are sorted by API, so they are adjacent).
  const same = [];
  if (/^\d{8}$/.test(api)) {
    for (let j = 0; j < shard.count; j++) {
      if (j !== li && String(apiCol[j]).trim() === api) same.push(shard.start + j);
    }
  }
  if (same.length) {
    html += `<div class="note">${same.length + 1} location rows in Well Locations share this API. Showing the one you selected.
      <ul class="others">${same.map((j) => `<li><a data-idx="${j}">Show row: ${esc(meta.types[state.types[j]].name)}</a></li>`).join('')}</ul></div>`;
  }

  html += `<div class="layer"><h3><span>${esc(meta.base.name)}</span><span class="lcount">1 record</span></h3>${fieldsTable(meta.base.fields, row)}</div>`;

  for (const L of meta.layers) {
    const block = shard.layers[L.key];
    const recs = block ? (block.byWell.get(li) || []).map((r) => rowOf(block.cols, r)) : [];
    if (!recs.length) {
      html += `<div class="layer empty"><h3><span>${esc(L.name)}</span><span class="lcount">No record</span></h3></div>`;
      continue;
    }
    html += `<div class="layer"><h3><span>${esc(L.name)}</span><span class="lcount">${recs.length} record${recs.length > 1 ? 's' : ''}</span></h3>`;
    html += `<div class="joinnote">Matched on ${esc(L.joinOn)}</div>`;
    recs.forEach((r, k) => {
      if (recs.length > 1) html += `<div class="record-sep">Record ${k + 1} of ${recs.length}</div>`;
      html += fieldsTable(L.fields, r);
    });
    html += '</div>';
  }
  if (!/^\d{8}$/.test(api)) {
    html += `<p class="note">This well has no full 8-digit API, so layers matched on API cannot be linked to it.</p>`;
  }
  html += `<p class="note">Source: Railroad Commission of Texas public GIS, snapshot ${esc(meta.snapshot)}.</p>`;
  $('panel-body').innerHTML = html;
  $('panel-body').querySelectorAll('a[data-idx]').forEach((a) => {
    a.onclick = () => selectWell(Number(a.dataset.idx), true);
  });
  const nFields = $('panel-body').querySelectorAll('table.fields tr').length;
  console.log(`TWM_SELECTED api=${api} index=${i} type="${typeName}" county="${county}" fieldRows=${nFields} sharedApiRows=${same.length + 1}`);
}

function closePanel() {
  $('panel').hidden = true;
  state.selected = -1;
  render();
}

// ---------- search ----------
function search(q) {
  const msg = $('search-msg');
  msg.className = '';
  const api = normalizeApiQuery(q);
  if (!api) { msg.textContent = 'Enter an 8-digit API (or 10-digit starting with 42).'; msg.className = 'err'; return; }
  const target = Number(api);
  const { apis } = state;
  const hits = [];
  for (let i = 0; i < apis.length; i++) if (apis[i] === target) hits.push(i);
  if (!hits.length) { msg.textContent = `No well found with API ${fmtApi(api)}.`; msg.className = 'err'; return; }
  if (hits.length === 1) {
    msg.textContent = `Found ${fmtApi(api)}`;
    pickHit(hits[0]);
    return;
  }
  msg.textContent = `${hits.length} wells share API ${fmtApi(api)} - pick one`;
  showHitList(api, hits);
}

function pickHit(idx) {
  const type = state.types[idx];
  if (!state.visibleTypes[type]) {
    state.visibleTypes[type] = true;
    const cb = document.querySelector(`#type-list input[data-idx="${type}"]`);
    if (cb) cb.checked = true;
    onFilterChange();
  }
  selectWell(idx, true);
}

function showHitList(api, hits) {
  state.selected = -1;
  render();
  $('panel').hidden = false;
  $('panel-title').textContent = `API ${fmtApi(api)}`;
  $('panel-sub').textContent = `${hits.length} well location rows share this API`;
  const county = countyOf(api);
  const items = hits.map((i, k) => {
    const lon = state.points[i * 2], lat = state.points[i * 2 + 1];
    const where = Number.isFinite(lon) ? `${lat.toFixed(5)}, ${lon.toFixed(5)}` : 'no coordinates';
    return `<li><a data-idx="${i}">${k + 1}. ${esc(state.meta.types[state.types[i]].name)}</a> <span class="muted">${esc(where)}</span></li>`;
  });
  $('panel-body').innerHTML = `<p class="note">Choose a well${county ? ` in ${esc(county)} County` : ''}:</p><ul class="others hits">${items.join('')}</ul>`;
  $('panel-body').querySelectorAll('a[data-idx]').forEach((a) => { a.onclick = () => pickHit(Number(a.dataset.idx)); });
  console.log(`TWM_HITLIST api=${api} hits=${hits.length}`);
}

// ---------- boot ----------
async function boot() {
  try {
    await loadAll();
  } catch (e) {
    $('loading').textContent = `Could not load data: ${e.message}`;
    console.error(e);
    return;
  }
  $('snapshot-date').textContent = state.meta.snapshot;
  buildLegend();
  initDeck();
  $('loading').hidden = true;
  $('search').addEventListener('submit', (e) => { e.preventDefault(); search($('search-input').value); });
  $('panel-close').onclick = closePanel;
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

  const { total } = updateLegendTotal();
  console.log(`TWM_READY wells=${state.types.length} legendTotal=${total} metaWellCount=${state.meta.wellCount} sourceRows=${state.meta.sourceRowCount} types=${state.meta.types.length} snapshot=${state.meta.snapshot}`);

  const pre = new URLSearchParams(location.search).get('select');
  const pick = Number(new URLSearchParams(location.search).get('pick'));
  if (pre) {
    $('search-input').value = pre;
    setTimeout(() => {
      search(pre);
      const links = $('panel-body').querySelectorAll('.hits a[data-idx]');
      if (pick && links[pick - 1]) setTimeout(() => links[pick - 1].click(), 1500);
    }, 300);
  }
}

boot();
