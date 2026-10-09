/**
 * Texas & Oklahoma Wells Map - renderer.
 * Loads compact binary point data and renders it with deck.gl; well details are loaded on demand
 * from per-county shards. All requests go to the local app:// scheme. The only way anything leaves
 * the machine is the user clicking a document link, which the main process opens in the default browser.
 */
import { Deck, MapView, WebMercatorViewport } from '@deck.gl/core';
import { ScatterplotLayer, GeoJsonLayer, TextLayer } from '@deck.gl/layers';
import { DataFilterExtension } from '@deck.gl/extensions';

const DATA = 'app://local/data/';
const $ = (id) => document.getElementById(id);

const state = {
  meta: null,
  points: null, // Float32Array [lon, lat] * N
  types: null, // Uint8Array global type index * N
  status: null, // Uint8Array global status index * N (255 = none)
  apis: null, // Uint32Array state-aware search key * N
  colors: null,
  filter: null,
  visibleStates: {},
  visibleTypes: [],
  visibleStatuses: [],
  colorBy: {}, // stateId -> 'type' | 'status'
  counties: null,
  states: null, // US state outlines (bold boundary layer) + label points
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
  const [meta, points, types, status, apis, counties, states] = await Promise.all([
    fetchJson('meta.json'),
    fetchBin('points.bin', Float32Array),
    fetchBin('types.bin', Uint8Array),
    fetchBin('status.bin', Uint8Array),
    fetchBin('apis.bin', Uint32Array),
    fetchJson('counties.json'),
    fetchJson('states.json').catch(() => ({ type: 'FeatureCollection', features: [] })),
  ]);
  Object.assign(state, { meta, points, types, status, apis, counties, states });
  state.visibleTypes = meta.types.map(() => true);
  state.visibleStatuses = meta.statuses.map(() => true);
  for (const s of meta.states) { state.visibleStates[s.id] = true; state.colorBy[s.id] = 'type'; }
  for (const f of counties.features || []) {
    const p = f.properties || {};
    if (p.state && p.code && p.name) state.countyNames.set(`${p.state}-${p.code}`, titleCase(String(p.name)));
  }
  rebuildColors();
  rebuildFilter();
}

const stateIdOf = (i) => state.meta.types[state.types[i]].state;
const stateMeta = (id) => state.meta.states.find((s) => s.id === id);

function rebuildColors() {
  const { types, status, meta, colorBy } = state;
  const n = types.length;
  const colors = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) {
    const t = meta.types[types[i]];
    const c = colorBy[t.state] === 'status' && status[i] !== 255 ? meta.statuses[status[i]].color : t.color;
    colors[i * 4] = c[0]; colors[i * 4 + 1] = c[1]; colors[i * 4 + 2] = c[2]; colors[i * 4 + 3] = 220;
  }
  state.colors = colors;
}

function rebuildFilter() {
  const { types, status, meta, visibleTypes, visibleStatuses, visibleStates } = state;
  const f = new Float32Array(types.length);
  for (let i = 0; i < types.length; i++) {
    const t = types[i];
    f[i] = visibleStates[meta.types[t].state] && visibleTypes[t] && (status[i] === 255 || visibleStatuses[status[i]]) ? 1 : 0;
  }
  state.filter = f;
}

// ---------- formatting ----------
const fmtInt = (n) => n.toLocaleString('en-US');
const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
function fmtApi(stateId, api) {
  if (stateId === 'OK') return /^35\d{8}$/.test(api) ? `35-${api.slice(2, 5)}-${api.slice(5)}` : (api || '(no API)');
  if (/^\d{8}$/.test(api)) return `42-${api.slice(0, 3)}-${api.slice(3)}`;
  if (/^\d{3}$/.test(api)) return `42-${api} (county code only)`;
  return api || '(no API)';
}
/** Inverse of the build's search key, for tooltips (TX keys < 10^8, OK keys are 35xxxxxxxx). */
function apiFromKey(i) {
  const k = state.apis[i];
  if (!k) return '';
  return stateIdOf(i) === 'OK' ? String(k) : String(k).padStart(8, '0');
}
function countyOf(stateId, api) {
  const code = stateId === 'OK' ? (/^35\d{3}/.test(api) ? api.slice(2, 5) : null) : (/^\d{3}/.test(api) ? api.slice(0, 3) : null);
  return code ? state.countyNames.get(`${stateId}-${code}`) || '' : '';
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/**
 * State-aware API search key (must match scripts/build_data.mjs):
 *   TX: 8-digit RRC API, or 10/12/14 digits starting 42 -> the 8 digits after "42"   (key < 10^8)
 *   OK: 10/12/14 digits starting 35 -> the first 10 digits                            (key 35xxxxxxxx)
 * Punctuation is ignored. An 8-digit number is always Texas.
 */
function searchKey(q) {
  const d = String(q).replace(/\D/g, '');
  if (d.length === 8) return { state: 'TX', key: Number(d), api: d };
  if ([10, 12, 14].includes(d.length) && d.startsWith('42')) return { state: 'TX', key: Number(d.slice(2, 10)), api: d.slice(2, 10) };
  if ([10, 12, 14].includes(d.length) && d.startsWith('35')) return { state: 'OK', key: Number(d.slice(0, 10)), api: d.slice(0, 10) };
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
  const { points, colors, filter, counties, selected } = state;
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
      updateTriggers: { getFilterValue: filter, getFillColor: colors },
    }),
  ];
  // State boundaries on top of counties and wells: thicker and darker than county lines.
  layers.push(new GeoJsonLayer({
    id: 'state-boundaries',
    data: state.states,
    stroked: true,
    filled: false,
    getLineColor: [38, 50, 68, 235],
    lineWidthUnits: 'pixels',
    getLineWidth: 2.75,
    lineJointRounded: true,
    lineCapRounded: true,
    pickable: false,
  }));
  if (state.zoom < 7) {
    layers.push(new TextLayer({
      id: 'state-labels',
      data: state.states.features,
      getPosition: (f) => f.properties.label,
      getText: (f) => f.properties.name.toUpperCase(),
      getSize: 13,
      getColor: [38, 50, 68, 150],
      fontSettings: { sdf: true },
      outlineWidth: 4,
      outlineColor: [255, 255, 255, 190],
      fontFamily: '-apple-system, "Segoe UI", Roboto, Arial, sans-serif',
      fontWeight: 600,
      characterSet: 'auto',
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      pickable: false,
    }));
  }
  if (selected >= 0 && Number.isFinite(points[selected * 2])) {
    layers.push(new ScatterplotLayer({
      id: 'selected',
      data: [selected],
      getPosition: (i) => [points[i * 2], points[i * 2 + 1]],
      getFillColor: (i) => [colors[i * 4], colors[i * 4 + 1], colors[i * 4 + 2], 255],
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
  const b = Number.isFinite(bbox[0]) ? bbox : [-106.7, 25.8, -94.4, 37.1];
  const { longitude, latitude, zoom } = vp.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 24 });
  return { longitude, latitude, zoom, minZoom: 3, maxZoom: 18, pitch: 0, bearing: 0 };
}

function initDeck() {
  const initialViewState = fitView();
  const v = (new URLSearchParams(location.search).get('view') || '').split(',').map(Number);
  if (v.length === 3 && v.every(Number.isFinite)) Object.assign(initialViewState, { longitude: v[0], latitude: v[1], zoom: v[2] });
  state.zoom = initialViewState.zoom;
  state.deck = new Deck({
    canvas: 'map',
    views: new MapView({ repeat: false }),
    initialViewState,
    controller: { dragRotate: false, touchRotate: false, doubleClickZoom: true },
    layers: buildLayers(),
    getCursor: ({ isHovering, isDragging }) => (isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab'),
    onViewStateChange: ({ viewState }) => {
      const changed = radiusScaleFor(viewState.zoom) !== radiusScaleFor(state.zoom) || (viewState.zoom < 7) !== (state.zoom < 7);
      state.zoom = viewState.zoom;
      if (changed) render();
      return viewState;
    },
    onHover: (info) => {
      const tip = $('tooltip');
      if (info.layer && info.layer.id === 'wells' && info.index >= 0) {
        const i = info.index;
        const st = stateIdOf(i);
        const api = apiFromKey(i);
        tip.textContent = `${st} ${api ? fmtApi(st, api) : 'no full API'} - ${state.meta.types[state.types[i]].name}`;
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
function catItems(list, range, kind) {
  return list.slice(...range).map((t, k) => {
    const idx = range[0] + k;
    return `<li><label title="${esc(t.name)}${t.total !== t.count ? ` - ${fmtInt(t.total - t.count)} more without location` : ''}">
      <input type="checkbox" checked data-kind="${kind}" data-idx="${idx}">
      <span class="swatch" style="background: rgb(${t.color.join(',')})"></span>
      <span class="tname">${esc(t.name)}</span>
      <span class="tcount">${fmtInt(t.count)}</span></label></li>`;
  }).join('');
}

function buildLegend() {
  const { meta } = state;
  const box = $('type-list');
  box.innerHTML = meta.states.map((s) => {
    const hasStatus = s.statusRange[1] > s.statusRange[0];
    return `<section class="state-block" data-state="${s.id}">
      <label class="state-head"><input type="checkbox" checked data-kind="state" data-state="${s.id}">
        <span class="sname">${esc(s.name)}</span><span class="tcount" id="state-count-${s.id}"></span></label>
      ${hasStatus ? `<div class="colorby">Color by
        <label><input type="radio" name="colorby-${s.id}" value="type" checked data-state="${s.id}"> Type</label>
        <label><input type="radio" name="colorby-${s.id}" value="status" data-state="${s.id}"> Status</label></div>` : ''}
      <div class="cat-head">Type <span class="cat-actions"><button type="button" data-all="type" data-state="${s.id}">All</button><button type="button" data-none="type" data-state="${s.id}">None</button></span></div>
      <ul class="cat-list">${catItems(meta.types, s.typeRange, 'type')}</ul>
      ${hasStatus ? `<div class="cat-head">Status <span class="cat-actions"><button type="button" data-all="status" data-state="${s.id}">All</button><button type="button" data-none="status" data-state="${s.id}">None</button></span></div>
      <ul class="cat-list">${catItems(meta.statuses, s.statusRange, 'status')}</ul>` : ''}
      <div class="state-foot" id="state-foot-${s.id}"></div>
    </section>`;
  }).join('');

  box.addEventListener('change', (e) => {
    const el = e.target;
    if (el.type === 'radio') {
      state.colorBy[el.dataset.state] = el.value;
      rebuildColors();
      render();
      return;
    }
    const kind = el.dataset.kind;
    if (kind === 'state') state.visibleStates[el.dataset.state] = el.checked;
    else if (kind === 'type') state.visibleTypes[Number(el.dataset.idx)] = el.checked;
    else if (kind === 'status') state.visibleStatuses[Number(el.dataset.idx)] = el.checked;
    else return;
    onFilterChange();
  });
  box.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-state]');
    if (!b) return;
    const v = b.dataset.all !== undefined;
    const kind = b.dataset.all || b.dataset.none;
    const s = stateMeta(b.dataset.state);
    const [a, z] = kind === 'type' ? s.typeRange : s.statusRange;
    const arr = kind === 'type' ? state.visibleTypes : state.visibleStatuses;
    for (let i = a; i < z; i++) arr[i] = v;
    box.querySelectorAll(`input[data-kind="${kind}"]`).forEach((c) => { const i = Number(c.dataset.idx); if (i >= a && i < z) c.checked = v; });
    onFilterChange();
  });
  $('types-all').onclick = () => setEverything(true);
  $('types-none').onclick = () => setEverything(false);
  updateLegendTotal();
}

function setEverything(v) {
  state.visibleTypes = state.visibleTypes.map(() => v);
  state.visibleStatuses = state.visibleStatuses.map(() => v);
  for (const k of Object.keys(state.visibleStates)) state.visibleStates[k] = v;
  $('type-list').querySelectorAll('input[type=checkbox]').forEach((c) => { c.checked = v; });
  onFilterChange();
}

/** Shown count per state = mapped wells passing the state, type and status filters. */
function updateLegendTotal() {
  const { meta, filter, points } = state;
  const shownBy = {};
  for (const s of meta.states) {
    let n = 0;
    for (let i = s.start; i < s.start + s.wellCount; i++) if (filter[i] && Number.isFinite(points[i * 2])) n++;
    shownBy[s.id] = n;
    $(`state-count-${s.id}`).textContent = fmtInt(s.mapped);
    $(`state-foot-${s.id}`).innerHTML = `Mapped: <b>${fmtInt(s.mapped)}</b> &middot; Shown: <b>${fmtInt(n)}</b>`
      + (s.noLocation ? `<br>No location (not on map): <b>${fmtInt(s.noLocation)}</b>` : '')
      + (s.invalidLocation ? `<br>Invalid coordinates (not on map): <b>${fmtInt(s.invalidLocation)}</b>` : '');
  }
  const mapped = meta.states.reduce((a, s) => a + s.mapped, 0);
  const shown = Object.values(shownBy).reduce((a, b) => a + b, 0);
  $('legend-total').innerHTML = meta.states.map((s) => `<div>${esc(s.name)} wells mapped: <b id="mapped-${s.id}">${fmtInt(s.mapped)}</b></div>`).join('')
    + `<div>Total mapped: <b>${fmtInt(mapped)}</b> &middot; Shown: <b>${fmtInt(shown)}</b></div>`;
  return { mapped, shown, shownBy };
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
const isUrl = (v) => /^https?:\/\/\S+$/i.test(String(v).trim());

function fieldsTable(fields, row, decode) {
  const rows = fields.map((f, k) => {
    const v = row[k];
    const blank = v === undefined || v === null || String(v).trim() === '';
    let cell;
    if (blank) cell = '(blank)';
    else if (isUrl(v)) cell = `<a class="ext" href="#" data-url="${esc(String(v).trim())}" title="${esc(v)}">Open in browser</a>`;
    else {
      cell = esc(v);
      const d = decode && decode[f.name];
      const desc = d ? (d[String(v).trim()] ?? d[String(v).trim().toUpperCase()]) : null;
      if (desc) cell += `<span class="decode">${esc(desc)}</span>`;
    }
    return `<tr><td class="k"><span class="lbl">${esc(f.label)}</span><span class="raw">${esc(f.name)}</span></td>
      <td class="v${blank ? ' blank' : ''}">${cell}</td></tr>`;
  });
  return `<table class="fields">${rows.join('')}</table>`;
}

async function selectWell(i, fly) {
  state.selected = i;
  render();
  const placed = fly ? flyTo(i) : Number.isFinite(state.points[i * 2]);
  const { meta } = state;
  const typeName = meta.types[state.types[i]].name;
  $('panel').hidden = false;
  $('panel-body').innerHTML = '<p class="note">Loading...</p>';

  const shard = await loadShardFor(i);
  if (state.selected !== i) return; // a newer selection won
  const sm = stateMeta(shard.state);
  const li = i - shard.start;
  const row = rowOf(shard.wells, li);
  const apiIdx = sm.base.fields.findIndex((f) => /^api(_number|_no|num)?$/i.test(f.name));
  const api = String(row[apiIdx] ?? '').trim().replace(/\.0+$/, '');
  const apiCol = shard.wells[apiIdx];
  const county = countyOf(sm.id, api);
  const statusName = state.status[i] !== 255 ? meta.statuses[state.status[i]].name : '';

  $('panel-title').textContent = `${sm.id} API ${fmtApi(sm.id, api)}`;
  $('panel-sub').textContent = [typeName, statusName, county && `${county} County`, sm.name].filter(Boolean).join(' - ');

  let html = '';
  if (!placed) html += '<p class="note">This well has no usable location on file (null, 0, or invalid coordinates), so it is not drawn on the map.</p>';
  const full = sm.id === 'OK' ? /^35\d{8}$/ : /^\d{8}$/;
  const same = [];
  if (full.test(api)) {
    for (let j = 0; j < shard.count; j++) {
      if (j !== li && String(apiCol[j]).trim().replace(/\.0+$/, '') === api) same.push(shard.start + j);
    }
  }
  if (same.length) {
    html += `<div class="note">${same.length + 1} rows in ${esc(sm.base.name)} share this API. Showing the one you selected.
      <ul class="others">${same.map((j) => `<li><a data-idx="${j}">Show row: ${esc(meta.types[state.types[j]].name)}</a></li>`).join('')}</ul></div>`;
  }

  html += `<div class="layer"><h3><span>${esc(sm.base.name)}</span><span class="lcount">1 record</span></h3>${fieldsTable(sm.base.fields, row, sm.decode)}</div>`;
  for (const L of sm.layers) {
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
      html += fieldsTable(L.fields, r, null);
    });
    html += '</div>';
  }
  if (!full.test(api)) html += '<p class="note">This well has no full API, so layers matched on API cannot be linked to it.</p>';
  html += `<p class="note">Source: ${esc(sm.agency)}, snapshot ${esc(sm.snapshot)}. Document links open in your web browser only when you click them.</p>`;
  $('panel-body').innerHTML = html;
  $('panel-body').querySelectorAll('a[data-idx]').forEach((a) => { a.onclick = () => selectWell(Number(a.dataset.idx), true); });
  $('panel-body').querySelectorAll('a.ext').forEach((a) => {
    a.onclick = (e) => { e.preventDefault(); window.twm.openExternal(a.dataset.url); };
  });
  const nFields = $('panel-body').querySelectorAll('table.fields tr').length;
  console.log(`TWM_SELECTED state=${sm.id} api=${api} index=${i} type="${typeName}" status="${statusName}" county="${county}" fieldRows=${nFields} links=${$('panel-body').querySelectorAll('a.ext').length} layersWithRecords=${$('panel-body').querySelectorAll('.layer:not(.empty)').length} sharedApiRows=${same.length + 1}`);
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
  const sk = searchKey(q);
  if (!sk) { msg.textContent = 'Enter a TX API (8 digits, or 10 starting 42) or an OK API (10 digits starting 35).'; msg.className = 'err'; return; }
  const { apis } = state;
  const s = stateMeta(sk.state);
  const hits = [];
  for (let i = s.start; i < s.start + s.wellCount; i++) if (apis[i] === sk.key) hits.push(i);
  if (!hits.length) { msg.textContent = `No ${s.name} well found with API ${fmtApi(sk.state, sk.api)}.`; msg.className = 'err'; return; }
  if (hits.length === 1) {
    const placed = Number.isFinite(state.points[hits[0] * 2]);
    msg.textContent = `Found ${sk.state} ${fmtApi(sk.state, sk.api)}${placed ? '' : ' (no location on file)'}`;
    pickHit(hits[0]);
    return;
  }
  msg.textContent = `${hits.length} wells share ${sk.state} API ${fmtApi(sk.state, sk.api)} - pick one`;
  showHitList(sk, hits);
}

function pickHit(idx) {
  const { meta } = state;
  const t = state.types[idx];
  const st = meta.types[t].state;
  let changed = false;
  if (!state.visibleStates[st]) { state.visibleStates[st] = true; changed = true; }
  if (!state.visibleTypes[t]) { state.visibleTypes[t] = true; changed = true; }
  const s = state.status[idx];
  if (s !== 255 && !state.visibleStatuses[s]) { state.visibleStatuses[s] = true; changed = true; }
  if (changed) {
    const box = $('type-list');
    box.querySelector(`input[data-kind="state"][data-state="${st}"]`).checked = true;
    const tcb = box.querySelector(`input[data-kind="type"][data-idx="${t}"]`); if (tcb) tcb.checked = true;
    const scb = box.querySelector(`input[data-kind="status"][data-idx="${s}"]`); if (scb) scb.checked = true;
    onFilterChange();
  }
  selectWell(idx, true);
}

function showHitList(sk, hits) {
  state.selected = -1;
  render();
  $('panel').hidden = false;
  $('panel-title').textContent = `${sk.state} API ${fmtApi(sk.state, sk.api)}`;
  $('panel-sub').textContent = `${hits.length} well rows share this API`;
  const county = countyOf(sk.state, sk.api);
  const items = hits.map((i, k) => {
    const lon = state.points[i * 2], lat = state.points[i * 2 + 1];
    const where = Number.isFinite(lon) ? `${lat.toFixed(5)}, ${lon.toFixed(5)}` : 'no location';
    return `<li><a data-idx="${i}">${k + 1}. ${esc(state.meta.types[state.types[i]].name)}</a> <span class="muted">${esc(where)}</span></li>`;
  });
  $('panel-body').innerHTML = `<p class="note">Choose a well${county ? ` in ${esc(county)} County` : ''}:</p><ul class="others hits">${items.join('')}</ul>`;
  $('panel-body').querySelectorAll('a[data-idx]').forEach((a) => { a.onclick = () => pickHit(Number(a.dataset.idx)); });
  console.log(`TWM_HITLIST state=${sk.state} api=${sk.api} hits=${hits.length}`);
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
  $('snapshot').innerHTML = state.meta.states
    .map((s) => `${esc(s.id)} ${esc(s.agency.match(/\((\w+)\)/)?.[1] || '')} snapshot: <b>${esc(s.snapshot)}</b>`).join(' &middot; ');
  buildLegend();
  initDeck();
  $('loading').hidden = true;
  $('search').addEventListener('submit', (e) => { e.preventDefault(); search($('search-input').value); });
  $('panel-close').onclick = closePanel;
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

  const { mapped } = updateLegendTotal();
  const per = state.meta.states.map((s) => {
    const legend = state.meta.types.slice(...s.typeRange).reduce((a, t) => a + t.count, 0);
    return `${s.id}:rows=${s.wellCount},mapped=${s.mapped},legendSum=${legend},noLocation=${s.noLocation},invalidCoords=${s.invalidLocation},snapshot=${s.snapshot}`;
  }).join(' ');
  console.log(`TWM_READY points=${state.types.length} legendMappedTotal=${mapped} ${per}`);

  const params = new URLSearchParams(location.search);
  const pre = params.get('select');
  const pick = Number(params.get('pick'));
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
