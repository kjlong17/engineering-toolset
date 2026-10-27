/* App shell: global design speed, search, topic navigation, entry rendering, URL state, About page. */
import { C, sources, cites } from './criteria.js';
import * as f from './formulas.js';
import { el, fmt, chips, citeText, numberField, selectField, table, results, linkButton } from './ui.js';
import { sketches } from './sketches.js';
import controls from './entries/controls.js';
import sight from './entries/sight.js';
import horiz from './entries/horiz.js';
import vert from './entries/vert.js';
import roadside from './entries/roadside.js';
import ped from './entries/ped.js';

const topics = [
  { id: 'controls', label: 'Design controls' },
  { id: 'sight', label: 'Sight distance' },
  { id: 'horiz', label: 'Horizontal alignment' },
  { id: 'vert', label: 'Vertical alignment' },
  { id: 'roadside', label: 'Roadside safety' },
  { id: 'ped', label: 'Pedestrian (PROWAG)' },
  { id: 'about', label: 'About & verification' }
];
const entries = [...controls, ...sight, ...horiz, ...vert, ...roadside, ...ped];
const KIND = { formula: 'Formula', table: 'Table', constants: 'Constants' };

/* ---------- State and URL ---------- */
const state = { V: 45, q: '', topic: 'all', e: '' };
function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  if (p.has('v') && C.speeds.includes(+p.get('v'))) state.V = +p.get('v');
  state.q = p.get('q') || '';
  state.topic = p.get('t') || 'all';
  state.e = p.get('e') || '';
}
function writeHash() {
  const p = new URLSearchParams();
  p.set('v', state.V);
  if (state.q) p.set('q', state.q);
  if (state.topic !== 'all') p.set('t', state.topic);
  history.replaceState(null, '', '#' + p.toString());
}
const entryHash = (id) => `v=${state.V}&e=${id}`;

/* ---------- Search ---------- */
function haystack(e) {
  const parts = [e.title, ...(e.aliases || []), KIND[e.kind], topics.find((t) => t.id === e.topic)?.label,
    ...(e.cite || []).map(citeText), ...(e.eq || []), ...(e.vars || []).map((v) => v.label + ' ' + v.k),
    ...(e.items || []).map((i) => i.label), ...(e.notes || [])];
  return parts.join(' ').toLowerCase();
}
const hay = new Map(entries.map((e) => [e.id, haystack(e)]));
function matches(e) {
  if (state.topic !== 'all' && e.topic !== state.topic) return false;
  const q = state.q.trim().toLowerCase();
  if (!q) return true;
  const h = hay.get(e.id);
  return q.split(/\s+/).every((tok) => h.includes(tok));
}

/* ---------- Entry rendering ---------- */
const entryState = new Map(); // id → { vals, touched }
function initVals(e) {
  const vals = {}, touched = new Set();
  for (const v of e.vars || []) vals[v.k] = v.ctx ? state[v.ctx] : v.value;
  return { vals, touched };
}

function renderFormula(e, body) {
  const st = entryState.get(e.id) || entryState.set(e.id, initVals(e)).get(e.id);
  for (const v of e.vars || []) if (v.ctx && !st.touched.has(v.k)) st.vals[v.k] = state[v.ctx];
  const inputs = el('div', { class: 'calc-in' });
  const out = el('div', { class: 'calc-res', 'aria-live': 'polite' });
  const refresh = () => out.replaceChildren(results(e.compute(st.vals, C, f)));
  const set = (k, val) => {
    st.vals[k] = val; st.touched.add(k);
    if (e.link) { const patch = e.link(st.vals, k); if (patch) { Object.assign(st.vals, patch); build(); } }
    refresh();
  };
  const build = () => inputs.replaceChildren(...(e.vars || []).map((v) => v.options
    ? selectField({ label: v.label, options: v.options, value: st.vals[v.k], onChange: (x) => set(v.k, x) })
    : numberField({ label: v.label, unit: v.unit, value: st.vals[v.k], min: v.min, max: v.max, step: v.step, onChange: (x) => set(v.k, x), hint: v.hint })));
  build(); refresh();
  body.append(
    el('div', { class: 'formula-grid' },
      el('div', { class: 'eq-block' },
        el('div', { class: 'eqs' }, (e.eq || []).map((q) => el('code', { class: 'eq' }, q))),
        e.consts && e.consts.length ? el('dl', { class: 'consts' }, e.consts.map(([sym, label, val]) => [el('dt', null, sym), el('dd', null, label, val ? el('strong', null, ' ' + val) : null)])) : null),
      el('div', { class: 'calc' }, el('p', { class: 'calc-title' }, 'Worked values'), inputs, out)),
    e.sketch && sketches[e.sketch] ? el('div', { class: 'sketch-wrap', html: sketches[e.sketch] }) : null);
}
function renderTable(e, body) {
  const rows = e.rows(C, f);
  let keyIndex = e.keyIndex ?? null, keyValue = state.V;
  if (e.keyFn) { // custom highlighting: mark rows via keyMatch
    const key = e.keyFn(state.V);
    rows.forEach((r) => { if (e.keyMatch(r, key)) r.__hit = true; });
  }
  const t = table(e.cols, rows, { keyIndex, keyValue });
  if (e.keyFn) t.querySelectorAll('tbody tr').forEach((tr, i) => { if (rows[i].__hit) { tr.classList.add('hit'); tr.setAttribute('aria-current', 'true'); } });
  body.append(t);
}
function renderConstants(e, body) {
  body.append(el('dl', { class: 'consts-list' }, e.items.map((i) => [
    el('dt', null, i.label),
    el('dd', null, el('strong', null, i.value), i.note ? el('span', { class: 'note' }, ' ' + i.note) : null)
  ])));
}

function renderEntry(e) {
  const body = el('div', { class: 'entry-body' });
  ({ formula: renderFormula, table: renderTable, constants: renderConstants })[e.kind](e, body);
  return el('article', { class: `entry entry-${e.kind}`, id: 'e-' + e.id, 'aria-labelledby': 'h-' + e.id },
    el('header', { class: 'entry-head' },
      el('div', { class: 'entry-title' }, el('span', { class: `kind kind-${e.kind}` }, KIND[e.kind]), el('h2', { id: 'h-' + e.id }, e.title)),
      el('div', { class: 'entry-tools' }, chips(e.cite), linkButton(() => entryHash(e.id)))),
    body,
    e.unverified ? el('p', { class: 'unverified' }, el('strong', null, 'Unverified: '), e.unverified) : null,
    e.notes && e.notes.length ? el('ul', { class: 'notes' }, e.notes.map((n) => el('li', null, n))) : null);
}

/* ---------- About ---------- */
function renderAbout() {
  const flagged = entries.filter((e) => e.unverified);
  const srcRows = Object.values(sources).map((s) => el('tr', null,
    el('td', null, el('strong', null, s.short)),
    el('td', null, s.url ? el('a', { href: s.url, rel: 'noopener noreferrer', target: '_blank' }, s.name) : s.name, s.note ? el('p', { class: 'hint' }, s.note) : null),
    el('td', null, s.edition)));
  return el('div', { class: 'about' },
    el('section', null, el('h2', null, 'About this reference'),
      el('p', null, 'A desk reference for design engineers and quality reviewers: the formulas, constants and design minimums behind roadway geometric design, roadside safety and pedestrian facilities. Each entry cites its source. Enter the conditions (speed, grade, radius) and the entry shows the governing value and the intermediate steps. It takes no plan-specific inputs and gives no pass/fail result.'),
      el('p', null, 'Everything runs in the browser. Nothing you enter is sent anywhere. The selected design speed and search are kept in the page address so a link reproduces what you see.')),
    el('section', null, el('h3', null, 'Sources and editions'),
      el('div', { class: 'table-scroll' }, el('table', { class: 'ref-table' },
        el('thead', null, el('tr', null, el('th', { scope: 'col' }, 'Short name'), el('th', { scope: 'col' }, 'Document'), el('th', { scope: 'col' }, 'Edition used'))),
        el('tbody', null, srcRows)))),
    el('section', null, el('h3', null, `Entries awaiting verification (${flagged.length})`),
      el('p', { class: 'hint' }, 'These entries contain values or section numbers transcribed from memory or from drawing text. The VERIFY.md file in the repository lists the document, table or figure needed to confirm each one.'),
      el('ul', null, flagged.map((e) => el('li', null, el('a', { href: '#' + entryHash(e.id) }, e.title), ': ', e.unverified)))),
    el('section', null, el('h3', null, 'Copyright'),
      el('p', null, 'AASHTO publications are copyrighted. Green Book and Roadside Design Guide values here are computed from the published equations and constants and cited by section; AASHTO tables are not reproduced. TDOT standard drawings, TDOT design guidelines and PROWAG are public documents.')),
    el('section', null, el('h3', null, 'Disclaimer'),
      el('p', null, 'Engineering reference only. It does not replace engineering judgment, a sealed design or the owner\'s review. The adopted standards govern; check every value against the cited source.')));
}

/* ---------- Layout ---------- */
function renderNav() {
  const bar = document.getElementById('topicbar');
  const all = [{ id: 'all', label: 'All' }, ...topics];
  bar.replaceChildren(...all.map((t) => el('button', { type: 'button', class: 'topic', 'aria-pressed': String(t.id === state.topic), onclick: () => { state.topic = t.id; writeHash(); renderNav(); renderMain(); } }, t.label)));
}
function renderMain() {
  const main = document.getElementById('main');
  main.replaceChildren();
  if (state.topic === 'about') { main.append(renderAbout()); return; }
  let shown = 0;
  for (const t of topics) {
    if (t.id === 'about') continue;
    const list = entries.filter((e) => e.topic === t.id && matches(e));
    if (!list.length) continue;
    shown += list.length;
    main.append(el('section', { class: 'topic-section', 'aria-labelledby': 'ts-' + t.id },
      el('h2', { class: 'topic-h', id: 'ts-' + t.id }, t.label),
      ...list.map(renderEntry)));
  }
  if (!shown) main.append(el('p', { class: 'empty' }, `No entries match “${state.q}”. Try a variable name (K, Rmin, HSO), a section (3.2.2, R304) or a topic word.`));
  document.getElementById('count').textContent = `${shown} of ${entries.length} entries`;
}

function init() {
  readHash();
  const sel = document.getElementById('speed');
  for (const v of C.speeds) sel.append(el('option', { value: v, selected: v === state.V ? true : null }, `${v} mph`));
  sel.addEventListener('change', () => { state.V = +sel.value; writeHash(); renderMain(); });
  const q = document.getElementById('q');
  q.value = state.q;
  let timer;
  q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { state.q = q.value; if (state.topic === 'about') state.topic = 'all'; writeHash(); renderNav(); renderMain(); }, 120); });
  document.getElementById('clear').addEventListener('click', () => { q.value = ''; state.q = ''; writeHash(); renderMain(); q.focus(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === '/' && document.activeElement !== q && !/input|select|textarea/i.test(document.activeElement.tagName)) { ev.preventDefault(); q.focus(); q.select(); } });
  renderNav(); renderMain(); focusTarget();
  window.addEventListener('hashchange', () => { readHash(); sel.value = state.V; q.value = state.q; renderNav(); renderMain(); focusTarget(); });
}
function focusTarget() {
  if (!state.e) return;
  const n = document.getElementById('e-' + state.e);
  if (!n) return;
  n.classList.add('target'); n.setAttribute('tabindex', '-1');
  n.scrollIntoView({ block: 'start' }); n.focus({ preventScroll: true });
  state.e = '';
}
document.addEventListener('DOMContentLoaded', init);
