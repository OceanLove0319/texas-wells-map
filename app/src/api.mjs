/**
 * API number rules shared by the data build (scripts/build_data.mjs) and the renderer, so search keys
 * are computed exactly the same way on both sides.
 *
 * Every source is described by (from scripts/states/*.config.mjs, copied into meta.json):
 *   apiPrefix   2-digit state code of the API number ('42' TX, '35' OK, '15' KS, ...); null = no API numbers
 *   apiPrefixes optional list when one source carries several codes (BOEM offshore: 60, 61, 55, 56, 01, 17, 42, 04, 50)
 *   apiForm     'full'    the regulator's API field includes the state code (35-017-24508, 15007200080000, ...)
 *               'county8' the field omits it: 8 digits = 3-digit county + 5-digit unique number (Texas RRC)
 *
 * The canonical API is 10 digits: state + county + unique (suffixes such as sidetrack -0001 are dropped).
 * The search key stored in apis.bin is the 8 digits after the state code (always < 10^8, fits Uint32).
 * Keys are compared within one source's index range (per state sub-range for multi-state sources), and a
 * query's first two digits pick which sources to search, so two states never collide; where two sources
 * really share a code (BOEM boreholes with Texas 42-prefixed APIs) both are searched and both are shown.
 */

export const digitsOf = (v) => String(v ?? '').trim().replace(/\.0+$/, '').replace(/\D/g, '');

/** All 2-digit API codes a source accepts. */
export const prefixesOf = (st) => (st.apiPrefixes && st.apiPrefixes.length ? st.apiPrefixes : st.apiPrefix ? [st.apiPrefix] : []);

/** Canonical 10-digit API for a raw regulator value, or '' when the value is not a full API. */
export function canonicalApi(st, raw) {
  const d = digitsOf(raw);
  if (st.apiForm === 'county8') return d.length === 8 ? st.apiPrefix + d : '';
  if (d.length < 10) return '';
  return prefixesOf(st).some((p) => d.startsWith(p)) ? d.slice(0, 10) : '';
}

/** Canonical 10-digit API when the value must start with a given state code (multi-state overlays). */
export function canonicalApiWithPrefix(prefix, raw) {
  const d = digitsOf(raw);
  return prefix && d.length >= 10 && d.startsWith(prefix) ? d.slice(0, 10) : '';
}

/** 3-digit county code from a raw API value (also works for a county-only value such as TX "389"). */
export function countyCodeOf(st, raw) {
  const d = digitsOf(raw);
  if (st.apiForm === 'county8') return d.length >= 3 ? d.slice(0, 3) : null;
  return d.length >= 5 && prefixesOf(st).some((p) => d.startsWith(p)) ? d.slice(2, 5) : null;
}

/** Uint32 search key for a canonical API (0 = none). */
export const keyOf = (canon) => (canon ? Number(canon.slice(2)) : 0);

/** Canonical API back from a key (the prefix must be known: a source's single prefix, or the one stored for the well). */
export const apiOfKey = (prefix, key) => (key ? prefix + String(key).padStart(8, '0') : '');

/** "42-389-34010" style display. */
export function fmtApi(st, raw) {
  const c = canonicalApi(st, raw);
  if (c) return `${c.slice(0, 2)}-${c.slice(2, 5)}-${c.slice(5)}`;
  const d = digitsOf(raw);
  if (st.apiForm === 'county8' && d.length === 3) return `${st.apiPrefix}-${d} (county code only)`;
  return String(raw ?? '').trim() || '(no API)';
}
export const fmtCanon = (c) => (c ? `${c.slice(0, 2)}-${c.slice(2, 5)}-${c.slice(5, 10)}${c.length > 10 ? `-${c.slice(10)}` : ''}` : '');

/**
 * Parse an API search query. 8 digits: the 'county8' source (Texas). 10/12/14 digits: every source whose
 * prefixes include the first two digits (a 12-digit query also keeps the 2-digit suffix for 'string12' sources).
 * Returns { api, prefix, key, full, states: [ids] } or null when the query is not API-shaped.
 */
export function parseQuery(states, q) {
  const d = digitsOf(q);
  if (!/^\d+$/.test(d) || d.length !== String(q).trim().replace(/[-\s.]/g, '').length) return null; // letters -> not an API
  if (d.length === 8) {
    const st = states.filter((s) => s.apiForm === 'county8');
    return st.length ? { api: st[0].apiPrefix + d, prefix: st[0].apiPrefix, key: Number(d), full: null, states: st.map((s) => s.id) } : null;
  }
  if ([10, 12, 14].includes(d.length)) {
    const prefix = d.slice(0, 2);
    const ids = states.filter((s) => s.kind !== 'overlay' && prefixesOf(s).includes(prefix)).map((s) => s.id);
    return { api: d.slice(0, 10), prefix, key: Number(d.slice(2, 10)), full: d.length === 12 ? d : null, states: ids };
  }
  return null;
}

/** Normalized form of a regulator's own well id for the id index ("BU-4401" -> "BU4401"). */
export const normId = (v) => String(v ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
