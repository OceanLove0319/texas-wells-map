/**
 * API number rules shared by the data build (scripts/build_data.mjs) and the renderer, so search keys
 * are computed exactly the same way on both sides.
 *
 * Every state is described by two fields (from scripts/states.config.mjs, copied into meta.json):
 *   apiPrefix  2-digit state code of the API number ('42' TX, '35' OK, '15' KS, ...)
 *   apiForm    'full'    the regulator's API field includes the state code (35-017-24508, 15007200080000, ...)
 *              'county8' the field omits it: 8 digits = 3-digit county + 5-digit unique number (Texas RRC)
 *
 * The canonical API is 10 digits: state + county + unique (suffixes such as sidetrack -0001 are dropped).
 * The search key stored in apis.bin is the 8 digits after the state code (always < 10^8, fits Uint32).
 * Keys are only ever compared within one state's index range, so two states can never collide.
 */

export const digitsOf = (v) => String(v ?? '').trim().replace(/\.0+$/, '').replace(/\D/g, '');

/** Canonical 10-digit API for a raw regulator value, or '' when the value is not a full API. */
export function canonicalApi(st, raw) {
  const d = digitsOf(raw);
  if (st.apiForm === 'county8') return d.length === 8 ? st.apiPrefix + d : '';
  return d.length >= 10 && d.startsWith(st.apiPrefix) ? d.slice(0, 10) : '';
}

/** 3-digit county code from a raw API value (also works for a county-only value such as TX "389"). */
export function countyCodeOf(st, raw) {
  const d = digitsOf(raw);
  if (st.apiForm === 'county8') return d.length >= 3 ? d.slice(0, 3) : null;
  return d.length >= 5 && d.startsWith(st.apiPrefix) ? d.slice(2, 5) : null;
}

/** Uint32 search key for a canonical API (0 = none). */
export const keyOf = (canon) => (canon ? Number(canon.slice(2)) : 0);

/** Canonical API back from a key. */
export const apiOfKey = (st, key) => (key ? st.apiPrefix + String(key).padStart(8, '0') : '');

/** "42-389-34010" style display. */
export function fmtApi(st, raw) {
  const c = canonicalApi(st, raw);
  if (c) return `${c.slice(0, 2)}-${c.slice(2, 5)}-${c.slice(5)}`;
  const d = digitsOf(raw);
  if (st.apiForm === 'county8' && d.length === 3) return `${st.apiPrefix}-${d} (county code only)`;
  return String(raw ?? '').trim() || '(no API)';
}

/**
 * Parse a search query. 10/12/14 digits: the first two digits pick the state. 8 digits: the state whose
 * apiForm is 'county8' (Texas). Returns { state, key, api } or null.
 */
export function parseQuery(states, q) {
  const d = digitsOf(q);
  if (d.length === 8) {
    const st = states.find((s) => s.apiForm === 'county8');
    return st ? { state: st.id, key: Number(d), api: st.apiPrefix + d } : null;
  }
  if ([10, 12, 14].includes(d.length)) {
    const st = states.find((s) => s.apiPrefix === d.slice(0, 2));
    return st ? { state: st.id, key: Number(d.slice(2, 10)), api: d.slice(0, 10) } : null;
  }
  return null;
}
