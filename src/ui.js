/* DOM and formatting helpers shared by the app and entry renderers. */
import { sources, cites } from './criteria.js';

let uid = 0;
export const nextId = (p) => `${p}-${++uid}`;

export function el(tag, props, ...kids) {
  const n = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    n.append(k.nodeType ? k : document.createTextNode(String(k)));
  }
  return n;
}

export const fmt = (x, d = 0) => (x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));
export const ft = (x, d = 0) => `${fmt(x, d)} ft`;

/* ---------- Citations ---------- */
export function citeText(key) {
  const c = cites[key];
  if (!c) return key;
  return `${sources[c[0]].short} ${c[1]}`;
}
export function chips(keys = []) {
  return el('ul', { class: 'chips', 'aria-label': 'Sources' },
    keys.map((k) => {
      const c = cites[k];
      const src = c && sources[c[0]];
      return el('li', { class: `chip chip-${c ? c[0] : 'x'}`, title: src ? `${src.name} — ${src.edition}` : '' }, citeText(k));
    }));
}

/* ---------- Fields ---------- */
export function numberField({ label, unit, value, min, max, step = 1, onChange, hint, id }) {
  id = id || nextId('n');
  const n = el('input', { type: 'number', id, min, max, step, value, class: 'num', 'aria-describedby': hint ? id + '-h' : null });
  n.addEventListener('input', () => { if (n.value !== '' && !isNaN(+n.value)) onChange(+n.value); });
  return el('div', { class: 'field' },
    el('label', { for: id }, label),
    el('span', { class: 'num-wrap' }, n, unit ? el('span', { class: 'unit', 'aria-hidden': 'true' }, unit) : null),
    hint ? el('p', { class: 'hint', id: id + '-h' }, hint) : null);
}
export function selectField({ label, options, value, onChange, hint, id }) {
  id = id || nextId('s');
  const s = el('select', { id, 'aria-describedby': hint ? id + '-h' : null });
  for (const o of options) {
    const opt = el('option', { value: o.value }, o.label);
    if (String(o.value) === String(value)) opt.selected = true;
    s.append(opt);
  }
  s.addEventListener('change', () => onChange(isNaN(+s.value) || s.value === '' ? s.value : +s.value));
  return el('div', { class: 'field' }, el('label', { for: id }, label), s, hint ? el('p', { class: 'hint', id: id + '-h' }, hint) : null);
}

/* ---------- Tables ---------- */
export function table(cols, rows, { keyIndex = null, keyValue = null, caption = null } = {}) {
  const t = el('table', { class: 'ref-table' },
    caption ? el('caption', null, caption) : null,
    el('thead', null, el('tr', null, cols.map((c) => el('th', { scope: 'col' }, c)))),
    el('tbody', null, rows.map((r) => {
      const hit = keyIndex != null && keyValue != null && String(r[keyIndex]) === String(keyValue);
      return el('tr', { class: hit ? 'hit' : null, 'aria-current': hit ? 'true' : null },
        r.map((c, i) => el(i === 0 ? 'th' : 'td', i === 0 ? { scope: 'row' } : null, c == null ? '—' : c)));
    })));
  return el('div', { class: 'table-scroll' }, t);
}

/* Results list for a formula calculator: [{ label, value, unit, note, strong }] */
export function results(list) {
  return el('dl', { class: 'calc-out' }, list.map((r) => [
    el('dt', null, r.label),
    el('dd', { class: r.strong ? 'strong' : null }, el('span', { class: 'val' }, r.value, r.unit ? ` ${r.unit}` : ''), r.note ? el('span', { class: 'note'}, r.note) : null)
  ]));
}

/* Permalink button: copies a URL with the current hash. */
export function linkButton(getHash) {
  const b = el('button', { type: 'button', class: 'btn tiny', title: 'Copy link to this entry' }, 'Link');
  b.addEventListener('click', async () => {
    const url = location.origin + location.pathname + '#' + getHash();
    try { await navigator.clipboard.writeText(url); b.textContent = 'Copied'; } catch (e) { location.hash = getHash(); b.textContent = 'In address bar'; }
    setTimeout(() => { b.textContent = 'Link'; }, 1500);
  });
  return b;
}
