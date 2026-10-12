/**
 * US Wells Map - renderer. The sources (states, the Federal Offshore pseudo-state, the USGS orphan-well
 * overlay) come from meta.json. Loads compact binary point data and renders it with deck.gl; well details
 * are loaded on demand from per-county shards. All requests go to the local app:// scheme. The only way
 * anything leaves the machine is the user clicking a document link, which the main process opens in the
 * default browser.
 */
import { Deck, MapView, WebMercatorViewport } from '@deck.gl/core';
import { ScatterplotLayer, GeoJsonLayer, TextLayer, IconLayer, PointCloudLayer } from '@deck.gl/layers';
import { DataFilterExtension } from '@deck.gl/extensions';
import { canonicalApi, countyCodeOf, apiOfKey, fmtApi as fmtApiFor, fmtCanon, parseQuery, digitsOf, normId } from './api.mjs';

const DATA = 'app://local/data/';
const $ = (id) => document.getElementById(id);
const NO_STATUS = 65535;
const FV = { HIDDEN: 0, EXACT: 1, APPROX: 2, OVERLAY: 3 }; // per-well filter value (which layer draws it)

const state = {
  meta: null,
  points: null, // Float32Array [lon, lat] * N
  types: null, // Uint16Array global type index * N
  status: null, // Uint16Array global status index * N (65535 = none)
  apis: null, // Uint32Array search key * N (8 digits after the state code; compared within one shard's prefix)
  locs: null, // Uint8Array location kind * N: 0 exact, 1 repaired, 2 approximate (PLSS), 255 not drawn
  showApprox: true,
  showReference: true,
  colors: null,
  filter: null,
  visibleStates: {},
  visibleTypes: [],
  visibleStatuses: [],
  visibleRegions: {}, // `${stateId}|${regionCode}` -> bool
  colorBy: {}, // stateId -> 'type' | 'status'
  counties: null,
  states: null, // US state outlines (bold boundary layer) + label points
  reference: [], // [{ name, data }] faint reference outlines (BOEM planning areas / protraction diagrams)
  countyNames: new Map(),
  selected: -1,
  zoom: 5,
  shardCache: new Map(),
  idIndexCache: new Map(),
  deck: null,
  triangleIcon: null,
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
  const [meta, points, types, status, apis, locs, counties, states] = await Promise.all([
    fetchJson('meta.json'),
    fetchBin('points.bin', Float32Array),
    fetchBin('types.bin', Uint16Array),
    fetchBin('status.bin', Uint16Array),
    fetchBin('apis.bin', Uint32Array),
    fetchBin('loc.bin', Uint8Array),
    fetchJson('counties.json'),
    fetchJson('states.json').catch(() => ({ type: 'FeatureCollection', features: [] })),
  ]);
  Object.assign(state, { meta, points, types, status, apis, locs, counties, states });
  state.reference = await Promise.all((meta.referenceLayers || []).map(async (rl) => ({ ...rl, data: await fetchJson(rl.file).catch(() => null) })));
  state.visibleTypes = meta.types.map(() => true);
  state.visibleStatuses = meta.statuses.map(() => true);
  for (const s of meta.states) {
    state.visibleStates[s.id] = true;
    state.colorBy[s.id] = s.defaultColorBy === 'status' && s.statusRange[1] > s.statusRange[0] ? 'status' : 'type';
    for (const r of s.regions || []) state.visibleRegions[`${s.id}|${r.code}`] = true;
  }
  for (const f of counties.features || []) {
    const p = f.properties || {};
    if (p.state && p.code && p.name) state.countyNames.set(`${p.state}-${p.code}`, titleCase(String(p.name)));
  }
  const ai = [];
  for (let i = 0; i < locs.length; i++) if (locs[i] === 2) ai.push(i);
  state.approxIdx = Int32Array.from(ai); // global indices of approximate (PLSS) wells, in order
  state.triangleIcon = await makeTriangleIcon();
  rebuildColors();
  rebuildFilter();
}

const stateIdOf = (i) => state.meta.types[state.types[i]].state;
const stateMeta = (id) => state.meta.states.find((s) => s.id === id);
const isOverlay = (s) => s.kind === 'overlay';
const sourcesOnMap = () => state.meta.states.filter((s) => !isOverlay(s));
const overlays = () => state.meta.states.filter(isOverlay);

/** Shard record that contains global well index i (binary search over the contiguous shard list). */
function shardMetaOf(i) {
  const { shards } = state.meta;
  let lo = 0, hi = shards.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (shards[mid].start <= i) lo = mid; else hi = mid - 1;
  }
  return shards[lo];
}

/** Hollow orange triangle for the USGS orphan-well overlay, drawn locally (an ImageBitmap: nothing is fetched). */
async function makeTriangleIcon() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  // Drawn as an alpha mask (IconLayer mask: true) so the overlay color and opacity are set per zoom in buildLayers.
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#fff';
  ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(32, 6); ctx.lineTo(59, 57); ctx.lineTo(5, 57); ctx.closePath();
  ctx.stroke();
  return createImageBitmap(c);
}

function rebuildColors() {
  const { types, status, meta, colorBy } = state;
  const n = types.length;
  const colors = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) {
    const t = meta.types[types[i]];
    const c = colorBy[t.state] === 'status' && status[i] !== NO_STATUS ? meta.statuses[status[i]].color : t.color;
    colors[i * 4] = c[0]; colors[i * 4 + 1] = c[1]; colors[i * 4 + 2] = c[2]; colors[i * 4 + 3] = 220;
  }
  state.colors = colors;
}

/** Filter value per well: 0 hidden, 1 exact point, 2 approximate (hollow) point, 3 overlay marker. */
function rebuildFilter() {
  const { types, status, locs, meta, visibleTypes, visibleStatuses, visibleStates, visibleRegions, showApprox } = state;
  const f = new Float32Array(types.length);
  const overlayType = new Uint8Array(meta.types.length);
  meta.types.forEach((t, k) => { if (isOverlay(stateMeta(t.state))) overlayType[k] = 1; });
  for (let i = 0; i < types.length; i++) {
    const t = types[i];
    const on = visibleStates[meta.types[t].state] && visibleTypes[t] && (status[i] === NO_STATUS || visibleStatuses[status[i]]);
    if (!on || locs[i] === 255) f[i] = FV.HIDDEN;
    else if (overlayType[t]) f[i] = FV.OVERLAY;
    else f[i] = locs[i] === 2 ? (showApprox ? FV.APPROX : FV.HIDDEN) : FV.EXACT;
  }
  for (const s of meta.states) {
    for (const r of s.regions || []) if (!visibleRegions[`${s.id}|${r.code}`]) f.fill(FV.HIDDEN, r.start, r.end);
  }
  state.filter = f;
}

// ---------- formatting ----------
const fmtInt = (n) => n.toLocaleString('en-US');
const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
/** Display an API (raw regulator value or canonical 10 digits) as 42-389-34010. */
const fmtApi = (stateId, api) => fmtApiFor(stateMeta(stateId), api);
/** Canonical API of well i from its search key and its shard's prefix. */
const apiFromKey = (i) => apiOfKey(shardMetaOf(i).prefix, state.apis[i]);
function countyOf(sm, api) {
  if (!sm.countyFromApi) return '';
  const code = countyCodeOf(sm, api);
  return code ? state.countyNames.get(`${sm.id}-${code}`) || '' : '';
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const isStale = (s) => {
  if (!/^\d{4}/.test(s.snapshot)) return false;
  const built = new Date(state.meta.builtAt);
  return new Date(s.snapshot) < new Date(built.getFullYear() - 2, built.getMonth(), built.getDate());
};

// ---------- map ----------
function radiusScaleFor(zoom) {
  if (zoom < 4.5) return 0.8;
  if (zoom < 6) return 1;
  if (zoom < 7.5) return 1.5;
  if (zoom < 9) return 2.2;
  if (zoom < 11) return 3;
  return 4;
}

/** Well-layer decimation stride for a zoom level (see wellData). */
function strideFor(zoom) { return zoom < 4.75 ? 4 : zoom < 6.25 ? 2 : 1; }

function overlaySizeFor(zoom) {
  if (zoom < 4.5) return 3.5;
  if (zoom < 6) return 5;
  if (zoom < 7.5) return 7;
  if (zoom < 9) return 9;
  return 12;
}

/**
 * Binary attribute tables for the well layers. The same objects are reused across renders (deck.gl only
 * re-uploads attributes when the data object or an attribute array changes), so zoom-band and selection
 * re-renders do not re-send ~100 MB to the GPU; only filter / color rebuilds do.
 */
let wellDataCache = null;
function wellData() {
  const { points, colors, filter } = state;
  if (!wellDataCache || wellDataCache.points !== points || wellDataCache.colors !== colors || wellDataCache.filter !== filter) {
    const n = state.types.length;
    const overlay = {};
    for (const s of overlays()) {
      overlay[s.id] = { length: s.wellCount, attributes: {
        getPosition: { value: points.subarray(s.start * 2, (s.start + s.wellCount) * 2), size: 2 },
        getFilterValue: { value: filter.subarray(s.start, s.start + s.wellCount), size: 1 },
      } };
    }
    // Approximate (PLSS) wells are a small subset: compact tables so the ring layer does not re-process every well.
    const idx = state.approxIdx;
    const ap = new Float32Array(idx.length * 2), ac = new Uint8Array(idx.length * 4), af = new Float32Array(idx.length);
    for (let k = 0; k < idx.length; k++) {
      const i = idx[k];
      ap[k * 2] = points[i * 2]; ap[k * 2 + 1] = points[i * 2 + 1];
      ac[k * 4] = colors[i * 4]; ac[k * 4 + 1] = colors[i * 4 + 1]; ac[k * 4 + 2] = colors[i * 4 + 2]; ac[k * 4 + 3] = colors[i * 4 + 3];
      af[k] = filter[i];
    }
    // Level of detail: at national / regional zoom every well is on screen and overdrawn many times, so the
    // GPU draws every 4th (stride 4) or 2nd (stride 2) well there; zoomed in, every well is drawn.
    const lod = {};
    for (const stride of [2, 4]) {
      const m = Math.ceil(n / stride);
      const lp = new Float32Array(m * 2), lc = new Uint8Array(m * 4), lf = new Float32Array(m);
      for (let k = 0, i = 0; k < m; k++, i += stride) {
        lp[k * 2] = points[i * 2]; lp[k * 2 + 1] = points[i * 2 + 1];
        lc[k * 4] = colors[i * 4]; lc[k * 4 + 1] = colors[i * 4 + 1]; lc[k * 4 + 2] = colors[i * 4 + 2]; lc[k * 4 + 3] = colors[i * 4 + 3];
        lf[k] = filter[i];
      }
      lod[stride] = { length: m, attributes: {
        getPosition: { value: lp, size: 2 },
        getColor: { value: lc, size: 4, normalized: true },
        getFilterValue: { value: lf, size: 1 },
      } };
    }
    lod[1] = { length: n, attributes: {
      getPosition: { value: points, size: 2 },
      getColor: { value: colors, size: 4, normalized: true },
      getFilterValue: { value: filter, size: 1 },
    } };
    wellDataCache = { points, colors, filter, overlay, lod,
      approx: { length: idx.length, attributes: {
        getPosition: { value: ap, size: 2 },
        getLineColor: { value: ac, size: 4, normalized: true },
        getFilterValue: { value: af, size: 1 },
      } } };
  }
  return wellDataCache;
}

function buildLayers() {
  const { points, colors, filter, counties, selected } = state;
  const wd = wellData();
  const layers = [
    new GeoJsonLayer({
      id: 'counties',
      data: counties,
      stroked: true,
      filled: true,
      getFillColor: [255, 255, 255, 255],
      getLineColor: [150, 158, 170, 255],
      lineWidthUnits: 'pixels',
      getLineWidth: state.zoom < 5 ? 0.4 : 0.7,
      pickable: false,
      updateTriggers: { getLineWidth: state.zoom < 5 },
    }),
  ];
  if (state.showReference) {
    for (const rl of state.reference) {
      if (!rl.data) continue;
      layers.push(new GeoJsonLayer({
        id: `ref-${rl.file}`,
        data: rl.data,
        stroked: true,
        filled: false,
        getLineColor: [40, 100, 170, 90],
        lineWidthUnits: 'pixels',
        getLineWidth: 0.8,
        pickable: false,
      }));
    }
  }
  // Exact locations: one GPU vertex per well (PointCloudLayer draws round points), about 4x cheaper than
  // instanced circles at national zoom where every well is on screen.
  const stride = strideFor(state.zoom);
  layers.push(new PointCloudLayer({
    id: `wells-${stride}`,
    data: wd.lod[stride],
    sizeUnits: 'pixels',
    pointSize: Math.max(1.6, 2 * radiusScaleFor(state.zoom)),
    material: false,
    pickable: true,
    extensions: [new DataFilterExtension({ filterSize: 1 })],
    filterRange: [0.5, 1.5],
  }));
  // Approximate (PLSS) locations: hollow rings in the type color, from the compact subset.
  layers.push(new ScatterplotLayer({
    id: 'wells-approx',
    data: wd.approx,
    radiusUnits: 'pixels',
    getRadius: 1.6,
    radiusScale: radiusScaleFor(state.zoom),
    radiusMinPixels: 2.5,
    stroked: true,
    filled: false,
    lineWidthUnits: 'pixels',
    getLineWidth: 1.2,
    pickable: true,
    extensions: [new DataFilterExtension({ filterSize: 1 })],
    filterRange: [1.5, 2.5],
  }));
  // Overlay sources (USGS orphan wells): one contiguous index range each, drawn as hollow orange triangles.
  for (const s of overlays()) {
    layers.push(new IconLayer({
      id: `overlay-${s.id}`,
      data: wd.overlay[s.id],
      iconAtlas: state.triangleIcon,
      iconMapping: { tri: { x: 0, y: 0, width: 64, height: 64, mask: true } },
      getIcon: () => 'tri',
      getColor: s.marker && s.marker.stroke ? s.marker.stroke : [230, 120, 0, 255],
      sizeUnits: 'pixels',
      getSize: 1,
      // Small and lighter at national zoom so the state wells stay readable; larger when zoomed in.
      sizeScale: overlaySizeFor(state.zoom),
      opacity: state.zoom < 6 ? 0.55 : 0.9,
      sizeMinPixels: 3,
      pickable: true,
      extensions: [new DataFilterExtension({ filterSize: 1 })],
      filterRange: [2.5, 3.5],
      updateTriggers: { getFilterValue: filter },
    }));
  }
  // State boundaries on top of counties and wells: thicker and darker than county lines.
  layers.push(new GeoJsonLayer({
    id: 'state-boundaries',
    data: state.states,
    stroked: true,
    filled: false,
    getLineColor: [38, 50, 68, 235],
    lineWidthUnits: 'pixels',
    getLineWidth: state.zoom < 5 ? 1.6 : 2.75,
    lineJointRounded: true,
    lineCapRounded: true,
    pickable: false,
    updateTriggers: { getLineWidth: state.zoom < 5 },
  }));
  if (state.zoom < 7) {
    layers.push(new TextLayer({
      id: 'state-labels',
      data: state.states.features,
      getPosition: (f) => f.properties.label,
      getText: (f) => (state.zoom < 4.5 ? f.properties.abbr : f.properties.name.toUpperCase()),
      getSize: state.zoom < 4.5 ? 11 : 13,
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
      updateTriggers: { getText: state.zoom < 4.5, getSize: state.zoom < 4.5 },
    }));
  }
  if (selected >= 0 && Number.isFinite(points[selected * 2])) {
    layers.push(new ScatterplotLayer({
      id: 'selected',
      data: [selected],
      getPosition: (i) => [points[i * 2], points[i * 2 + 1]],
      getFillColor: (i) => [colors[i * 4], colors[i * 4 + 1], colors[i * 4 + 2], 255],
      getLineColor: [17, 17, 17, 255],
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

function render() { const ls = buildLayers(); state.deck.setProps({ layers: state.layerFilter ? ls.filter((l) => state.layerFilter(l.id)) : ls }); }

const viewportOfMap = () => { const el = $('map-wrap'); return new WebMercatorViewport({ width: el.clientWidth || 800, height: el.clientHeight || 600 }); };

function fitView(b, padding = 24) {
  const vp = viewportOfMap();
  const bb = b && Number.isFinite(b[0]) ? b : [-125, 24, -66, 50];
  const { longitude, latitude, zoom } = vp.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { padding });
  return { longitude, latitude, zoom, minZoom: 2.5, maxZoom: 18, pitch: 0, bearing: 0 };
}

/** Initial national view: the lower 48 (Alaska and the Pacific/Atlantic offshore are a pan away). */
function nationalView() { return fitView([-125, 24.5, -66.5, 49.5], 12); }

function initDeck() {
  const initialViewState = nationalView();
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
      const bands = (z) => `${radiusScaleFor(z)}|${overlaySizeFor(z)}|${strideFor(z)}|${z < 7}|${z < 6}|${z < 5}|${z < 4.5}`;
      const changed = bands(viewState.zoom) !== bands(state.zoom);
      state.zoom = viewState.zoom;
      if (changed) render();
      return viewState;
    },
    onHover: (info) => {
      const tip = $('tooltip');
      const i = pickedIndex(info);
      if (i >= 0) {
        const sm = stateMeta(stateIdOf(i));
        const api = apiFromKey(i);
        tip.textContent = `${sm.short || sm.id} ${api ? fmtCanon(api) : 'no API'} - ${state.meta.types[state.types[i]].name}${state.locs[i] === 2 ? ' (approximate location)' : ''}`;
        tip.style.left = `${info.x + 12}px`;
        tip.style.top = `${info.y + 12}px`;
        tip.hidden = false;
      } else tip.hidden = true;
    },
    onClick: (info) => {
      const i = pickedIndex(info);
      if (i >= 0) selectWell(i, false);
    },
  });
}

/** Global well index of a picked object, or -1. Overlay layers index from their source's start. */
function pickedIndex(info) {
  if (!info.layer || info.index < 0) return -1;
  if (info.layer.id === 'wells-approx') return state.approxIdx[info.index];
  if (info.layer.id.startsWith('wells-')) return info.index * Number(info.layer.id.slice(6));
  if (info.layer.id.startsWith('overlay-')) { const s = stateMeta(info.layer.id.slice(8)); return s ? s.start + info.index : -1; }
  return -1;
}

function flyTo(i) {
  const lon = state.points[i * 2], lat = state.points[i * 2 + 1];
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return false;
  const zoom = Math.max(state.zoom, 13);
  state.zoom = zoom;
  state.deck.setProps({
    initialViewState: { longitude: lon, latitude: lat, zoom, minZoom: 2.5, maxZoom: 18, pitch: 0, bearing: 0, transitionDuration: 600 },
  });
  return true;
}

/** Zoom to a source: its state outline when there is one, else its (percentile-trimmed) well bbox. */
function zoomToSource(s) {
  let b = null;
  const f = (state.states.features || []).find((x) => x.properties.abbr === s.id);
  if (f) {
    b = [Infinity, Infinity, -Infinity, -Infinity];
    const walk = (c) => { if (typeof c[0] === 'number') { b[0] = Math.min(b[0], c[0]); b[1] = Math.min(b[1], c[1]); b[2] = Math.max(b[2], c[0]); b[3] = Math.max(b[3], c[1]); } else c.forEach(walk); };
    walk(f.geometry.coordinates);
  } else if (s.bbox) b = s.bbox;
  if (!b) return;
  const v = fitView(b, 40);
  state.zoom = v.zoom;
  state.deck.setProps({ initialViewState: { ...v, transitionDuration: 700 } });
  render();
}

// ---------- legend ----------
function catItems(list, range, kind) {
  const cats = Object.fromEntries((state.meta.categories || []).map((c) => [c.id, c]));
  let prev = null;
  return list.slice(...range).map((t, k) => {
    const idx = range[0] + k;
    let head = '';
    if (t.category && t.category !== prev) {
      prev = t.category;
      const c = cats[t.category];
      const n = list.slice(...range).filter((u) => u.category === t.category).reduce((a, u) => a + u.count, 0);
      head = `<li class="cat-group"><span class="swatch" style="background: rgb(${c.color.join(',')})"></span><span>${esc(c.name)}</span><span class="tcount">${fmtInt(n)}</span></li>`;
    }
    const tip = [t.name, t.variants && t.variants.length > 1 ? `raw values: ${t.variants.join(', ')}` : '',
      t.approx ? `${fmtInt(t.approx)} at approximate (PLSS) locations` : '',
      t.total !== t.count ? `${fmtInt(t.total - t.count)} more not on the map` : ''].filter(Boolean).join(' - ');
    return `${head}<li><label title="${esc(tip)}">
      <input type="checkbox" ${state[kind === 'type' ? 'visibleTypes' : 'visibleStatuses'][idx] ? 'checked' : ''} data-kind="${kind}" data-idx="${idx}">
      <span class="swatch" style="background: rgb(${t.color.join(',')})"></span>
      <span class="tname">${esc(t.name)}</span>
      <span class="tcount">${fmtInt(t.count)}</span></label></li>`;
  }).join('');
}

function sourceDetail(s) {
  const hasStatus = s.statusRange[1] > s.statusRange[0];
  let html = '';
  if (s.note) html += `<div class="src-note">${esc(s.note)}</div>`;
  html += `<div class="src-snap">Snapshot <b>${esc(s.snapshot)}</b> <span class="muted" title="${esc(s.snapshotSource || '')}">(${esc(s.agency)})</span></div>`;
  if (s.regions) {
    html += `<div class="cat-head">Region</div><ul class="cat-list">${s.regions.map((r) => `<li><label>
      <input type="checkbox" ${state.visibleRegions[`${s.id}|${r.code}`] ? 'checked' : ''} data-kind="region" data-state="${s.id}" data-code="${esc(r.code)}">
      <span class="swatch none"></span><span class="tname">${esc(r.name)} (${esc(r.code)})</span><span class="tcount">${fmtInt(r.mapped)}</span></label></li>`).join('')}</ul>`;
  }
  if (hasStatus) {
    html += `<div class="colorby">Color by
      <label><input type="radio" name="colorby-${s.id}" value="type" ${state.colorBy[s.id] === 'type' ? 'checked' : ''} data-state="${s.id}"> Type</label>
      <label><input type="radio" name="colorby-${s.id}" value="status" ${state.colorBy[s.id] === 'status' ? 'checked' : ''} data-state="${s.id}"> Status</label></div>`;
  }
  html += `<div class="cat-head">Type <span class="cat-actions"><button type="button" data-all="type" data-state="${s.id}">All</button><button type="button" data-none="type" data-state="${s.id}">None</button></span></div>
    <ul class="cat-list">${catItems(state.meta.types, s.typeRange, 'type')}</ul>`;
  if (hasStatus) {
    html += `<div class="cat-head">Status <span class="cat-actions"><button type="button" data-all="status" data-state="${s.id}">All</button><button type="button" data-none="status" data-state="${s.id}">None</button></span></div>
      <ul class="cat-list">${catItems(state.meta.statuses, s.statusRange, 'status')}</ul>`;
  }
  html += `<div class="state-foot" id="state-foot-${s.id}"></div>`;
  return html;
}

function buildLegend() {
  const { meta } = state;
  const box = $('source-list');
  const row = (s) => {
    const stale = isStale(s);
    const sub = [`exact ${fmtInt(s.exact + s.repaired)}`, s.approximate ? `approx ${fmtInt(s.approximate)}` : '', `unmapped ${fmtInt(s.unplottable)}`].filter(Boolean).join(' &middot; ');
    return `<section class="src" data-state="${s.id}">
      <div class="src-row">
        <input type="checkbox" ${state.visibleStates[s.id] ? 'checked' : ''} data-kind="state" data-state="${s.id}" title="Show / hide ${esc(s.name)}">
        <a class="sname" data-zoom="${s.id}" title="Zoom to ${esc(s.name)}">${esc(s.name)}</a>
        <span class="tcount" title="Wells on the map">${fmtInt(s.mapped)}</span>
        <button type="button" class="disclose" data-toggle="${s.id}" title="Types, statuses and counts" aria-expanded="false">&#9656;</button>
      </div>
      <div class="src-sub"><span class="snap" title="Data date: ${esc(s.snapshot)} (${esc(s.snapshotSource || '')})">${esc(s.snapshot)}</span> &middot; ${sub}${stale ? ` <span class="stale">data last updated ${esc(s.snapshot.slice(0, 4))}</span>` : ''}</div>
      <div class="src-detail" hidden></div>
    </section>`;
  };
  box.innerHTML = sourcesOnMap().map(row).join('');

  // Overlays, reference outlines and the approximate-location toggle live below the source list.
  const ov = $('overlay-list');
  ov.innerHTML = overlays().map((s) => `<label class="overlay-toggle" title="${esc(s.agency)} - snapshot ${esc(s.snapshot)}. ${esc(s.note || '')}">
      <input type="checkbox" ${state.visibleStates[s.id] ? 'checked' : ''} data-kind="state" data-state="${s.id}"> <span class="tri"></span>
      <span class="tname">${esc(s.name)}</span><span class="tcount">${fmtInt(s.mapped)}</span></label>`).join('')
    + (state.reference.length ? `<label class="overlay-toggle" title="${esc(state.reference.map((r) => `${r.name} (${r.features})`).join('; '))}">
      <input type="checkbox" ${state.showReference ? 'checked' : ''} data-kind="reference"> <span class="refline"></span>
      <span class="tname">Offshore reference outlines (BOEM)</span></label>` : '')
    + (meta.states.some((s) => s.approximate) ? `<label class="overlay-toggle" title="Wells with no coordinates in the regulator file, placed at the center of their PLSS section (or quarter call). Drawn as hollow rings.">
      <input type="checkbox" ${state.showApprox ? 'checked' : ''} data-kind="approx"> <span class="ring"></span> <span class="tname">Approximate locations (PLSS)</span></label>` : '');

  const onChange = (e) => {
    const el = e.target;
    if (el.type === 'radio') {
      state.colorBy[el.dataset.state] = el.value;
      rebuildColors();
      render();
      return;
    }
    const kind = el.dataset.kind;
    if (kind === 'state') state.visibleStates[el.dataset.state] = el.checked;
    else if (kind === 'approx') state.showApprox = el.checked;
    else if (kind === 'reference') { state.showReference = el.checked; render(); return; }
    else if (kind === 'type') state.visibleTypes[Number(el.dataset.idx)] = el.checked;
    else if (kind === 'status') state.visibleStatuses[Number(el.dataset.idx)] = el.checked;
    else if (kind === 'region') state.visibleRegions[`${el.dataset.state}|${el.dataset.code}`] = el.checked;
    else return;
    onFilterChange();
  };
  box.addEventListener('change', onChange);
  ov.addEventListener('change', onChange);
  box.addEventListener('click', (e) => {
    const z = e.target.closest('a[data-zoom]');
    if (z) { zoomToSource(stateMeta(z.dataset.zoom)); return; }
    const d = e.target.closest('button[data-toggle]');
    if (d) {
      const sec = d.closest('.src');
      const det = sec.querySelector('.src-detail');
      const open = det.hidden;
      if (open && !det.innerHTML) det.innerHTML = sourceDetail(stateMeta(d.dataset.toggle));
      det.hidden = !open;
      d.innerHTML = open ? '&#9662;' : '&#9656;';
      d.setAttribute('aria-expanded', String(open));
      if (open) updateLegendTotal();
      return;
    }
    const b = e.target.closest('button[data-state]');
    if (!b) return;
    const v = b.dataset.all !== undefined;
    const kind = b.dataset.all || b.dataset.none;
    const s = stateMeta(b.dataset.state);
    const [a, zz] = kind === 'type' ? s.typeRange : s.statusRange;
    const arr = kind === 'type' ? state.visibleTypes : state.visibleStatuses;
    for (let i = a; i < zz; i++) arr[i] = v;
    box.querySelectorAll(`input[data-kind="${kind}"]`).forEach((c) => { const i = Number(c.dataset.idx); if (i >= a && i < zz) c.checked = v; });
    onFilterChange();
  });
  $('types-all').onclick = () => setEverything(true);
  $('types-none').onclick = () => setEverything(false);
  $('legend-cats').innerHTML = `<div class="cat-legend">${meta.categories.map((c) => `<span><i class="swatch" style="background: rgb(${c.color.join(',')})"></i>${esc(c.name)}</span>`).join('')}
    <span><i class="ring"></i>approximate location</span><span><i class="tri"></i>USGS orphan well</span></div>`;
  updateLegendTotal();
}

function setEverything(v) {
  for (const s of sourcesOnMap()) state.visibleStates[s.id] = v;
  $('source-list').querySelectorAll('input[data-kind="state"]').forEach((c) => { c.checked = v; });
  onFilterChange();
}

/** Shown count per source = mapped wells passing the source, type, status and region filters. */
function updateLegendTotal() {
  const { meta, filter } = state;
  let mapped = 0, shown = 0, unmapped = 0, shownOverlay = 0;
  for (const s of meta.states) {
    let n = 0;
    for (let i = s.start; i < s.start + s.wellCount; i++) if (filter[i]) n++;
    if (isOverlay(s)) { shownOverlay += n; continue; }
    mapped += s.mapped; shown += n; unmapped += s.unplottable;
    const foot = $(`state-foot-${s.id}`);
    if (foot) {
      foot.innerHTML = `Source rows: <b>${fmtInt(s.wellCount)}</b> &middot; Shown: <b>${fmtInt(n)}</b>`
        + `<br>Mapped: <b>${fmtInt(s.mapped)}</b> = exact <b>${fmtInt(s.exact + s.repaired)}</b>`
        + (s.approximate ? ` + approximate <b>${fmtInt(s.approximate)}</b>` : '')
        + (s.repaired ? `<br>Exact includes <b>${fmtInt(s.repaired)}</b> with repaired coordinates` : '')
        + `<br>Unmapped (no usable location): <b>${fmtInt(s.unplottable)}</b>`
        + (s.noApi ? `<br>Rows without a full API: <b>${fmtInt(s.noApi)}</b>${s.idIndex ? ` (searchable by ${esc(s.idIndex.label)})` : ''}` : '');
    }
  }
  $('legend-total').innerHTML = `<div>${fmtInt(sourcesOnMap().length)} sources &middot; Mapped: <b>${fmtInt(mapped)}</b> &middot; Unmapped: <b>${fmtInt(unmapped)}</b></div>`
    + `<div>Shown: <b>${fmtInt(shown)}</b>${overlays().length ? ` &middot; USGS orphan markers shown: <b>${fmtInt(shownOverlay)}</b>` : ''}</div>`;
  return { mapped, shown };
}

function onFilterChange() { rebuildFilter(); updateLegendTotal(); render(); }

// ---------- details panel ----------
async function loadShardFor(i) {
  const sh = shardMetaOf(i);
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

function fieldsTable(fields, row, decode, first) {
  let order = fields.map((_, k) => k);
  if (first && first.length) {
    const pos = new Map(first.map((n, k) => [n, k]));
    order.sort((a, b) => (pos.has(fields[a].name) ? pos.get(fields[a].name) : 1e6 + a) - (pos.has(fields[b].name) ? pos.get(fields[b].name) : 1e6 + b));
  }
  const rows = order.map((k) => {
    const f = fields[k];
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

/** Wells in [start, end) whose search key equals `key` (excluding `skip`). */
function scanRange(start, end, key, skip, limit = 50) {
  const out = [];
  const { apis } = state;
  for (let i = start; i < end && out.length < limit; i++) if (i !== skip && apis[i] === key) out.push(i);
  return out;
}

/** Wells in other sources sharing this API (same 10 digits): overlay <-> state cross references. */
function crossRefs(i, canon) {
  if (!canon) return [];
  const key = Number(canon.slice(2)), prefix = canon.slice(0, 2);
  const sm = stateMeta(stateIdOf(i));
  const out = [];
  if (isOverlay(sm)) {
    const forState = shardMetaOf(i).forState;
    for (const sh of state.meta.shards) if (sh.state === forState && sh.prefix === prefix) for (const j of scanRange(sh.start, sh.start + sh.count, key, i)) out.push(j);
  } else {
    for (const o of overlays()) for (const r of o.stateRanges || []) if (r.state === sm.id && r.prefix === prefix) for (const j of scanRange(r.start, r.end, key, i)) out.push(j);
  }
  return out;
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
  const shMeta = shardMetaOf(i);
  const li = i - shard.start;
  const row = rowOf(shard.wells, li);
  const fieldIdx = (name) => sm.base.fields.findIndex((f) => f.name === name);
  const apiIdx = sm.apiField ? fieldIdx(sm.apiField) : sm.base.fields.findIndex((f) => /^api(_number|_no|num)?$/i.test(f.name));
  const api = apiIdx >= 0 ? String(row[apiIdx] ?? '').trim().replace(/\.0+$/, '') : '';
  const canon = apiOfKey(shMeta.prefix, state.apis[i]);
  const apiText = canon ? (sm.apiKey === 'string12' && digitsOf(api).length === 12 ? fmtCanon(digitsOf(api)) : fmtCanon(canon)) : '';
  const idIdx = sm.stateIdField ? fieldIdx(sm.stateIdField) : -1;
  const stateId = idIdx >= 0 ? String(row[idIdx] ?? '').trim() : '';
  let place = '';
  if (sm.countyFromApi) { const c = countyOf(sm, api); if (c) place = `${c} ${sm.id === 'LA' ? 'Parish' : 'County'}`; }
  if (!place && sm.countyField) { const k = fieldIdx(sm.countyField); if (k >= 0 && row[k]) place = `${titleCase(String(row[k]))} County`; }
  if (!place && sm.areaField) { const k = fieldIdx(sm.areaField); if (k >= 0 && row[k]) place = `Area ${row[k]}`; }
  const note = (shard.notes || {})[li];
  const locKind = ['exact', 'repaired', 'approximate'][state.locs[i]] || 'none';
  const statusName = state.status[i] !== NO_STATUS ? meta.statuses[state.status[i]].name : '';
  const forState = shMeta.forState ? stateMeta(shMeta.forState) : null;

  const idLabel = sm.idIndex ? sm.idIndex.label : sm.stateIdField;
  $('panel-title').textContent = apiText ? `${sm.short || sm.id} API ${apiText}` : stateId ? `${sm.short || sm.id} ${idLabel} ${stateId}` : `${sm.short || sm.id} (no API)`;
  $('panel-sub').textContent = [typeName, statusName, place, forState ? forState.name : '', sm.name].filter(Boolean).join(' - ');

  let html = '';
  if (state.locs[i] === 2) html += `<p class="note approx-note"><b>${esc(note || 'Location: APPROXIMATE')}</b></p>`;
  else if (note) html += `<p class="note">${esc(note)}</p>`;
  if (!placed && state.locs[i] === 255) html += '<p class="note">This well has no usable location on file (null, 0, or invalid coordinates, and no usable township/range/section), so it is not drawn on the map.</p>';
  if (apiText && stateId) html += `<p class="note">${esc(idLabel)}: <b>${esc(stateId)}</b></p>`;
  const same = state.apis[i] ? scanRange(shard.start, shard.start + shard.count, state.apis[i], i, 200) : [];
  if (same.length) {
    html += `<div class="note">${same.length + 1} rows in ${esc(sm.base.name)} share API ${esc(fmtCanon(canon))}. Showing the one you selected.
      <ul class="others">${same.map((j) => `<li><a data-idx="${j}">Show row: ${esc(meta.types[state.types[j]].name)}${sm.apiKey === 'string12' && apiIdx >= 0 ? ` - ${esc(String(rowOf(shard.wells, j - shard.start)[apiIdx]))}` : ''}</a></li>`).join('')}</ul></div>`;
  }
  const xref = crossRefs(i, canon);
  if (xref.length) {
    const other = stateMeta(stateIdOf(xref[0]));
    html += `<div class="note xref"><b>Also in ${esc(isOverlay(other) ? other.name : `${other.name} data (${other.short})`)}:</b> ${xref.length} record${xref.length > 1 ? 's' : ''} with API ${esc(fmtCanon(canon))}
      <ul class="others">${xref.map((j) => `<li><a data-idx="${j}">${esc(stateMeta(stateIdOf(j)).short || '')}: ${esc(meta.types[state.types[j]].name)}</a></li>`).join('')}</ul></div>`;
  } else if (isOverlay(sm) && forState && canon) {
    html += `<p class="note">API ${esc(fmtCanon(canon))} was not found in the ${esc(forState.name)} data (${esc(forState.short)}, snapshot ${esc(forState.snapshot)}).</p>`;
  }

  html += `<div class="layer"><h3><span>${esc(sm.base.name)}</span><span class="lcount">1 record</span></h3>${fieldsTable(sm.base.fields, row, sm.decode, sm.panelFirst)}</div>`;
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
  if (!canon && sm.layers.length) html += '<p class="note">This well has no full API, so layers matched on API cannot be linked to it.</p>';
  html += `<p class="note">Source: ${esc(sm.agency)}, snapshot ${esc(sm.snapshot)}${isStale(sm) ? ' (data last updated ' + esc(sm.snapshot.slice(0, 4)) + ')' : ''}. Document links open in your web browser only when you click them.</p>`;
  $('panel-body').innerHTML = html;
  $('panel-body').querySelectorAll('a[data-idx]').forEach((a) => { a.onclick = () => selectWell(Number(a.dataset.idx), true); });
  $('panel-body').querySelectorAll('a.ext').forEach((a) => {
    a.onclick = (e) => { e.preventDefault(); window.twm.openExternal(a.dataset.url); };
  });
  const nFields = $('panel-body').querySelectorAll('table.fields tr').length;
  console.log(`TWM_SELECTED state=${sm.id} api=${api} canon=${canon} id=${stateId} index=${i} type="${typeName}" status="${statusName}" place="${place}" loc=${locKind} fieldRows=${nFields} links=${$('panel-body').querySelectorAll('a.ext').length} layersWithRecords=${$('panel-body').querySelectorAll('.layer:not(.empty)').length} sharedApiRows=${same.length + 1} xref=${xref.length}`);
}

function closePanel() {
  $('panel').hidden = true;
  state.selected = -1;
  render();
}

// ---------- search ----------
async function idIndexOf(s) {
  if (!s.idIndex) return null;
  if (!state.idIndexCache.has(s.id)) state.idIndexCache.set(s.id, fetchJson(s.idIndex.file));
  return state.idIndexCache.get(s.id);
}

function searchHelp() {
  const ex = sourcesOnMap().filter((s) => s.apiPrefix).slice(0, 6).map((s) => `${s.id} ${s.apiPrefix}`).join(', ');
  const ids = sourcesOnMap().filter((s) => s.idIndex).map((s) => `${s.id} ${s.idIndex.label}`).join(', ');
  return `Enter a 10-digit API (first two digits = state code: ${ex}, ...; 8 digits = Texas RRC; 12 digits for offshore sidetracks), or a regulator id for ${ids}.`;
}

async function search(q) {
  const msg = $('search-msg');
  msg.className = '';
  const raw = String(q || '').trim();
  if (!raw) { msg.textContent = searchHelp(); msg.className = 'err'; return; }
  // Optional leading source id ("VA BU-4401", "LA 976014") restricts the search to that source.
  let only = null, text = raw;
  const m = raw.match(/^([A-Za-z_]{2,9})\s+(.+)$/);
  if (m && stateMeta(m[1].toUpperCase())) { only = m[1].toUpperCase(); text = m[2]; }

  const sk = parseQuery(state.meta.states, text);
  if (sk) {
    let hits = [];
    for (const sh of state.meta.shards) {
      if (sh.prefix !== sk.prefix) continue;
      const src = stateMeta(sh.state);
      if (only ? sh.state !== only : !(sk.states.includes(sh.state) || isOverlay(src))) continue;
      for (const j of scanRange(sh.start, sh.start + sh.count, sk.key, -1, 500)) hits.push(j);
    }
    // 12-digit query on a 12-digit keyed source (BOEM): keep only the boreholes whose full API matches.
    if (sk.full) {
      const keep = [];
      for (const j of hits) {
        const sm = stateMeta(stateIdOf(j));
        if (sm.apiKey !== 'string12') { keep.push(j); continue; }
        const shard = await loadShardFor(j);
        const ai = sm.base.fields.findIndex((f) => f.name === sm.apiField);
        if (digitsOf(shard.wells[ai][j - shard.start]).startsWith(sk.full)) keep.push(j);
      }
      hits = keep;
    }
    const primary = hits.filter((j) => !isOverlay(stateMeta(stateIdOf(j))));
    const label = fmtCanon(sk.full || sk.api);
    if (!hits.length) {
      const where = only ? stateMeta(only).name : sk.states.map((id) => stateMeta(id).name).join(' / ') || `state code ${sk.prefix}`;
      msg.textContent = `No well found with API ${label} in ${where}${sk.states.length ? '' : ' (no source uses that state code)'}.`;
      msg.className = 'err';
      return;
    }
    if (primary.length === 1 || hits.length === 1) {
      const h = primary.length === 1 ? primary[0] : hits[0];
      const lk = state.locs[h];
      const extra = hits.length - 1;
      msg.textContent = `Found ${stateMeta(stateIdOf(h)).short || ''} ${label}${lk === 255 ? ' (no location on file)' : lk === 2 ? ' (approximate location)' : ''}${extra ? ` - also ${extra} USGS orphan record${extra > 1 ? 's' : ''} (see panel)` : ''}`;
      pickHit(h);
      return;
    }
    msg.textContent = `${hits.length} records match API ${label} - pick one`;
    showHitList(`API ${label}`, hits);
    return;
  }

  // Not an API: regulator well ids (file numbers, permits, serials) of the sources that define one.
  const key = normId(text);
  if (!key) { msg.textContent = searchHelp(); msg.className = 'err'; return; }
  const hits = [];
  const sources = sourcesOnMap().filter((s) => s.idIndex && (!only || s.id === only));
  for (const s of sources) {
    const ix = await idIndexOf(s);
    if (!ix) continue;
    let lo = 0, hi = ix.keys.length - 1;
    while (lo <= hi) { const mid = (lo + hi) >> 1; if (ix.keys[mid] < key) lo = mid + 1; else if (ix.keys[mid] > key) hi = mid - 1; else { hits.push(...ix.idx[mid]); break; } }
  }
  if (!hits.length) {
    msg.textContent = `No well with id "${text}" in ${sources.map((s) => `${s.id} ${s.idIndex.label}`).join(', ')}. ${sk === null && /^\d+$/.test(digitsOf(text)) ? 'APIs need 8, 10, 12 or 14 digits.' : ''}`;
    msg.className = 'err';
    return;
  }
  if (hits.length === 1) {
    const s = stateMeta(stateIdOf(hits[0]));
    msg.textContent = `Found ${s.short || s.id} ${s.idIndex.label} ${text}${state.locs[hits[0]] === 255 ? ' (no location on file)' : ''}`;
    pickHit(hits[0]);
    return;
  }
  msg.textContent = `${hits.length} records match id ${text} - pick one`;
  showHitList(`Id ${text}`, hits);
}

function pickHit(idx) {
  const { meta } = state;
  const t = state.types[idx];
  const st = meta.types[t].state;
  let changed = false;
  if (!state.visibleStates[st]) { state.visibleStates[st] = true; changed = true; }
  if (!state.visibleTypes[t]) { state.visibleTypes[t] = true; changed = true; }
  const s = state.status[idx];
  if (s !== NO_STATUS && !state.visibleStatuses[s]) { state.visibleStatuses[s] = true; changed = true; }
  const sm = stateMeta(st);
  for (const r of sm.regions || []) if (idx >= r.start && idx < r.end && !state.visibleRegions[`${st}|${r.code}`]) { state.visibleRegions[`${st}|${r.code}`] = true; changed = true; }
  if (changed) {
    document.querySelectorAll(`input[data-kind="state"][data-state="${st}"]`).forEach((c) => { c.checked = true; });
    const tcb = document.querySelector(`input[data-kind="type"][data-idx="${t}"]`); if (tcb) tcb.checked = true;
    const scb = document.querySelector(`input[data-kind="status"][data-idx="${s}"]`); if (scb) scb.checked = true;
    document.querySelectorAll(`input[data-kind="region"][data-state="${st}"]`).forEach((c) => { c.checked = state.visibleRegions[`${st}|${c.dataset.code}`]; });
    onFilterChange();
  }
  selectWell(idx, true);
}

function showHitList(title, hits) {
  state.selected = -1;
  render();
  $('panel').hidden = false;
  $('panel-title').textContent = title;
  $('panel-sub').textContent = `${hits.length} records match`;
  const bySource = new Map();
  for (const i of hits) { const id = stateIdOf(i); if (!bySource.has(id)) bySource.set(id, []); bySource.get(id).push(i); }
  let k = 0;
  const groups = [...bySource.entries()].map(([id, list]) => {
    const s = stateMeta(id);
    const items = list.map((i) => {
      const lon = state.points[i * 2], lat = state.points[i * 2 + 1];
      const where = Number.isFinite(lon) ? `${lat.toFixed(5)}, ${lon.toFixed(5)}${state.locs[i] === 2 ? ' (approximate)' : ''}` : 'no location';
      const api = apiFromKey(i);
      return `<li><a data-idx="${i}">${++k}. ${esc(state.meta.types[state.types[i]].name)}</a> <span class="muted">${api ? esc(fmtCanon(api)) + ' - ' : ''}${esc(where)}</span></li>`;
    });
    return `<div class="hit-group"><h3>${esc(s.name)} <span class="muted">(${esc(s.short || s.id)}, snapshot ${esc(s.snapshot)})</span></h3><ul class="others hits">${items.join('')}</ul></div>`;
  });
  $('panel-body').innerHTML = `<p class="note">Choose a record:</p>${groups.join('')}`;
  $('panel-body').querySelectorAll('a[data-idx]').forEach((a) => { a.onclick = () => pickHit(Number(a.dataset.idx)); });
  console.log(`TWM_HITLIST title="${title}" hits=${hits.length} sources=${[...bySource.keys()].join(',')}`);
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
  const { meta } = state;
  const r = meta.snapshotRange;
  const list = meta.states.map((s) => `${s.id} ${s.short || ''}: ${s.snapshot}`).join('\n');
  $('snapshot').innerHTML = r ? `<span title="${esc(list)}">Snapshots <b>${esc(r[0])}</b> to <b>${esc(r[1])}</b> (per source in the list)</span>` : '';
  $('brand').textContent = meta.app;
  document.title = meta.app;
  $('search-input').placeholder = 'Search API (10 digits, e.g. 42-389-34010) or a regulator well id';
  buildLegend();
  initDeck();
  $('loading').hidden = true;
  $('search').addEventListener('submit', (e) => { e.preventDefault(); search($('search-input').value); });
  $('panel-close').onclick = closePanel;
  $('home').onclick = () => { const v = nationalView(); state.zoom = v.zoom; state.deck.setProps({ initialViewState: { ...v, transitionDuration: 600 } }); render(); };
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

  const { mapped } = updateLegendTotal();
  const per = meta.states.map((s) => {
    const legend = meta.types.slice(...s.typeRange).reduce((a, t) => a + t.count, 0);
    return `${s.id}:rows=${s.wellCount},mapped=${s.mapped},legendSum=${legend},exact=${s.exact},repaired=${s.repaired},approx=${s.approximate},unmapped=${s.unplottable},snapshot=${s.snapshot}`;
  }).join(' ');
  console.log(`TWM_READY points=${state.types.length} sources=${meta.states.length} legendMappedTotal=${mapped} ${per}`);

  const params = new URLSearchParams(location.search);
  const pre = params.get('select');
  const pick = Number(params.get('pick'));
  if (pre) {
    $('search-input').value = pre;
    setTimeout(async () => {
      await search(pre);
      const links = $('panel-body').querySelectorAll('.hits a[data-idx]');
      if (pick && links[pick - 1]) setTimeout(() => links[pick - 1].click(), 1500);
    }, 300);
  }
}

// Verification hook (used by main.js --click-after): screen position of the selected well, in window pixels.
window.__twm = {
  selectedScreenXY: () => {
    if (state.selected < 0 || !state.deck) return null;
    const vp = state.deck.getViewports()[0];
    if (!vp) return null;
    const [x, y] = vp.project([state.points[state.selected * 2], state.points[state.selected * 2 + 1]]);
    const r = $('map').getBoundingClientRect();
    return { x: r.left + x, y: r.top + y, index: state.selected };
  },
  status: () => ({ selected: state.selected, zoom: state.zoom, panelOpen: !$('panel').hidden }),
  setLayerFilter: (fn) => { state.layerFilter = fn; render(); },
  /** Pick at a window pixel and report the global well index with a projection check (verification only). */
  pickAt: (x, y) => {
    const r = $('map').getBoundingClientRect();
    const info = state.deck.pickObject({ x: x - r.left, y: y - r.top, radius: 4 });
    const i = info ? pickedIndex(info) : -1;
    if (i < 0) return { x, y, layer: info && info.layer ? info.layer.id : null, index: -1 };
    const vp = state.deck.getViewports()[0];
    const [px, py] = vp.project([state.points[i * 2], state.points[i * 2 + 1]]);
    return { x, y, layer: info.layer.id, index: i, state: stateIdOf(i), api: apiFromKey(i), dx: Math.round(px + r.left - x), dy: Math.round(py + r.top - y), zoom: state.zoom };
  },
  /** Forced redraws at a fixed view for ~2.5 s: the per-frame GPU cost of drawing every well (verification only). */
  redrawRate: (lon, lat, zoom) => new Promise((resolve) => {
    state.zoom = zoom;
    state.deck.setProps({ initialViewState: { longitude: lon, latitude: lat, zoom, minZoom: 2.5, maxZoom: 18, pitch: 0, bearing: 0 } });
    render();
    const deltas = [];
    let last = performance.now();
    const t0 = last;
    const tick = (now) => { deltas.push(now - last); last = now; state.deck.redraw('perf'); if (now - t0 < 2500) requestAnimationFrame(tick); else { deltas.sort((a, b) => a - b); resolve({ zoom, frames: deltas.length, avgMs: deltas.reduce((a, b) => a + b, 0) / deltas.length, p95Ms: deltas[Math.floor(deltas.length * 0.95)], maxMs: deltas[deltas.length - 1] }); } };
    setTimeout(() => requestAnimationFrame(tick), 300);
  }),
  /** Pan/zoom animation over the national view while sampling frame times (verification only). */
  perf: () => new Promise((resolve) => {
    const views = [[-99, 31.5, 6.2], [-120, 36, 5.5], [-80, 40, 6], [-97, 38, 3.8]];
    let k = 0;
    const go = () => { const [lon, lat, zoom] = views[k++ % views.length]; state.zoom = zoom; state.deck.setProps({ initialViewState: { longitude: lon, latitude: lat, zoom, minZoom: 2.5, maxZoom: 18, pitch: 0, bearing: 0, transitionDuration: 1200 } }); render(); };
    const deltas = [];
    let last = performance.now();
    const t0 = last;
    go();
    const timer = setInterval(go, 1300);
    const tick = (now) => { deltas.push(now - last); last = now; if (now - t0 < 5500) requestAnimationFrame(tick); else { clearInterval(timer); deltas.sort((a, b) => a - b); resolve({ frames: deltas.length, seconds: (now - t0) / 1000, avgMs: deltas.reduce((a, b) => a + b, 0) / deltas.length, p95Ms: deltas[Math.floor(deltas.length * 0.95)], maxMs: deltas[deltas.length - 1] }); } };
    requestAnimationFrame(tick);
  }),
};

boot();
