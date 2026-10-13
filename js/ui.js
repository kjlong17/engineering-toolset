/* DOM, form-field, citation and SVG helpers shared by every card. */
window.FST = window.FST || {};
FST.ui = (function () {
  let uid = 0;
  const nextId = (p) => `${p}-${++uid}`;

  function el(tag, props, ...kids) {
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
    for (const k of kids.flat()) {
      if (k == null || k === false) continue;
      n.append(k.nodeType ? k : document.createTextNode(String(k)));
    }
    return n;
  }

  const fmt = (x, d = 0) => (x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));
  const ft = (x, d = 0) => `${fmt(x, d)} ft`;
  const pct = (x, d = 2) => `${fmt(x, d)}%`;

  /* ---------- Fields ---------- */
  function hintEl(id, hint) { return hint ? el('p', { class: 'hint', id }, hint) : null; }

  function select({ label, options, value, onChange, hint }) {
    const id = nextId('sel'), hid = hint ? id + '-h' : null;
    const s = el('select', { id, 'aria-describedby': hid });
    for (const o of options) {
      const opt = el('option', { value: o.value }, o.label);
      if (String(o.value) === String(value)) opt.selected = true;
      s.append(opt);
    }
    s.addEventListener('change', () => onChange(s.value));
    return el('div', { class: 'field' }, el('label', { for: id }, label), s, hintEl(hid, hint));
  }

  function segmented({ label, options, value, onChange, hint }) {
    const name = nextId('seg');
    const fs = el('fieldset', { class: 'field seg' }, el('legend', null, label));
    const wrap = el('div', { class: 'seg-opts' });
    for (const o of options) {
      const id = nextId('r');
      const input = el('input', { type: 'radio', name, id, value: o.value });
      if (String(o.value) === String(value)) input.checked = true;
      input.addEventListener('change', () => input.checked && onChange(o.value));
      wrap.append(el('span', { class: 'seg-opt' }, input, el('label', { for: id }, o.label)));
    }
    fs.append(wrap);
    if (hint) fs.append(el('p', { class: 'hint' }, hint));
    return fs;
  }

  /* Slider paired with a number box. Only the number box is a typed entry; the slider is the default control. */
  function range({ label, min, max, step = 1, value, unit = '', onChange, hint }) {
    const id = nextId('rng'), hid = hint ? id + '-h' : null;
    const r = el('input', { type: 'range', id, min, max, step, value, 'aria-describedby': hid });
    const n = el('input', { type: 'number', min, max, step, value, class: 'num', 'aria-label': `${label} (${unit || 'value'})` });
    const sync = (v, src) => {
      if (v === '' || isNaN(+v)) return;
      if (src !== r) r.value = v;
      if (src !== n) n.value = v;
      onChange(+v);
    };
    r.addEventListener('input', () => sync(r.value, r));
    n.addEventListener('input', () => sync(n.value, n));
    return el('div', { class: 'field range' },
      el('label', { for: id }, label),
      el('div', { class: 'range-row' }, r, el('span', { class: 'num-wrap' }, n, unit ? el('span', { class: 'unit', 'aria-hidden': 'true' }, unit) : null)),
      hintEl(hid, hint));
  }

  function toggle({ label, checked, onChange, hint }) {
    const id = nextId('tg');
    const i = el('input', { type: 'checkbox', id, role: 'switch' });
    i.checked = !!checked;
    i.addEventListener('change', () => onChange(i.checked));
    return el('div', { class: 'field toggle' }, el('span', { class: 'toggle-row' }, i, el('label', { for: id }, label)), hint ? el('p', { class: 'hint' }, hint) : null);
  }

  function group(title, ...fields) {
    return el('div', { class: 'field-group' }, el('p', { class: 'group-title' }, title), ...fields);
  }

  /* ---------- Citations ---------- */
  function citeText(key) {
    const c = FST.cites[key];
    if (!c) return key;
    const src = FST.sources[c[0]];
    return `${src.short} ${c[1]}`;
  }
  function chips(keys) {
    return el('ul', { class: 'chips', 'aria-label': 'Standards used' },
      keys.map((k) => {
        const c = FST.cites[k];
        const src = c && FST.sources[c[0]];
        return el('li', { class: `chip chip-${c ? c[0] : 'x'}`, title: src ? `${src.name} — ${src.edition}` : '' }, citeText(k));
      }));
  }

  /* ---------- Results ---------- */
  const STATUS = {
    pass: { icon: '✓', word: 'Pass' },
    fail: { icon: '✕', word: 'Fail' },
    note: { icon: '!', word: 'Note' },
    info: { icon: 'i', word: 'Info' }
  };
  function results(list) {
    const ul = el('ul', { class: 'results' });
    for (const r of list) {
      const st = STATUS[r.status] || STATUS.info;
      ul.append(el('li', { class: `res res-${r.status}` },
        el('span', { class: 'badge', 'aria-hidden': 'true' }, st.icon),
        el('div', { class: 'res-body' },
          el('p', { class: 'res-head' }, el('span', { class: 'res-word' }, st.word + ':'), ' ', r.label),
          (r.required != null || r.provided != null) ? el('p', { class: 'res-vals' },
            r.required != null ? el('span', null, el('span', { class: 'k' }, 'Required '), r.required) : null,
            r.provided != null ? el('span', null, el('span', { class: 'k' }, 'Provided '), r.provided) : null) : null,
          r.detail ? el('p', { class: 'res-detail' }, r.detail) : null,
          r.cite && r.cite.length ? el('p', { class: 'res-cite' }, r.cite.map(citeText).join(' · ')) : null)));
    }
    return ul;
  }
  const check = (ok, label, required, provided, cite, detail) => ({ status: ok ? 'pass' : 'fail', label, required, provided, cite, detail });

  /* ---------- SVG ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  function svg(w, h, title, desc) {
    const id = nextId('svg');
    const root = document.createElementNS(NS, 'svg');
    root.setAttribute('viewBox', `0 0 ${w} ${h}`);
    root.setAttribute('role', 'img');
    root.setAttribute('aria-labelledby', `${id}-t ${id}-d`);
    root.setAttribute('class', 'diagram');
    const t = document.createElementNS(NS, 'title'); t.id = `${id}-t`; t.textContent = title;
    const d = document.createElementNS(NS, 'desc'); d.id = `${id}-d`; d.textContent = desc;
    root.append(t, d);
    const api = {
      root,
      add(tag, attrs = {}, text, parent = root) {
        const n = document.createElementNS(NS, tag);
        for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
        if (text != null) n.textContent = text;
        parent.append(n);
        return n;
      },
      line(x1, y1, x2, y2, cls, extra = {}) { return api.add('line', { x1, y1, x2, y2, class: cls, ...extra }); },
      text(x, y, s, cls = 't', extra = {}) { return api.add('text', { x, y, class: cls, ...extra }, s); },
      path(d, cls) { return api.add('path', { d, class: cls }); },
      rect(x, y, w2, h2, cls, extra = {}) { return api.add('rect', { x, y, width: Math.max(0, w2), height: Math.max(0, h2), class: cls, ...extra }); },
      /* Horizontal dimension line with arrows and centered label. */
      dimH(x1, x2, y, label, cls = 'dim') {
        api.line(x1, y, x2, y, cls, { 'marker-start': `url(#${id}-arr)`, 'marker-end': `url(#${id}-arr)` });
        api.line(x1, y - 6, x1, y + 6, cls);
        api.line(x2, y - 6, x2, y + 6, cls);
        api.text((x1 + x2) / 2, y - 6, label, 't dim-t', { 'text-anchor': 'middle' });
      },
      dimV(x, y1, y2, label, cls = 'dim') {
        api.line(x, y1, x, y2, cls, { 'marker-start': `url(#${id}-arr)`, 'marker-end': `url(#${id}-arr)` });
        api.text(x + 6, (y1 + y2) / 2 + 4, label, 't dim-t');
      }
    };
    const defs = api.add('defs');
    const m = api.add('marker', { id: `${id}-arr`, viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, null, defs);
    api.add('path', { d: 'M0,1 L9,5 L0,9 z', class: 'arrowhead' }, null, m);
    return api;
  }

  /* Bullet chart: one row per check, allowed range shaded, provided value as a bar with a ✓/✕ mark.
     rows: { label, value, lo, hi, max, unit, d } — lo/hi may be null. */
  function bullets(title, rows) {
    const W = 640, rowH = 46, top = 16, left = 200, right = 560;
    const H = top + rows.length * rowH + 10;
    const desc = rows.map((r) => `${r.label}: ${fmt(r.value, r.d ?? 1)} ${r.unit}, allowed ${r.lo != null ? 'at least ' + fmt(r.lo, r.d ?? 1) : ''}${r.lo != null && r.hi != null ? ' and ' : ''}${r.hi != null ? 'at most ' + fmt(r.hi, r.d ?? 1) : ''}`).join('. ');
    const g = svg(W, H, title, desc);
    rows.forEach((r, i) => {
      const y = top + i * rowH;
      const max = r.max || Math.max(r.value, r.hi || 0, r.lo || 0) * 1.3 || 1;
      const X = (v) => left + (Math.min(Math.max(v, 0), max) / max) * (right - left);
      const ok = (r.lo == null || r.value >= r.lo - 1e-9) && (r.hi == null || r.value <= r.hi + 1e-9);
      g.text(left - 10, y + 17, r.label, 't', { 'text-anchor': 'end' });
      g.rect(left, y + 6, right - left, 16, 'pave-2');
      g.rect(X(r.lo ?? 0), y + 6, X(r.hi ?? max) - X(r.lo ?? 0), 16, 'ok-fill');
      g.rect(left, y + 10, X(r.value) - left, 8, ok ? 'car' : 'hazard');
      for (const lim of [r.lo, r.hi]) {
        if (lim == null) continue;
        g.line(X(lim), y + 2, X(lim), y + 26, 'edge');
        g.text(X(lim), y + 38, fmt(lim, r.d ?? 1), 't t-sm', { 'text-anchor': 'middle' });
      }
      g.text(right + 10, y + 18, `${ok ? '✓' : '✕'} ${fmt(r.value, r.d ?? 1)} ${r.unit}`, `t t-b`);
    });
    return g;
  }

  /* Legend under a diagram; status conveyed by text, not color alone. */
  function legend(items) {
    return el('ul', { class: 'legend' }, items.map(([cls, label]) => el('li', null, el('span', { class: `swatch ${cls}`, 'aria-hidden': 'true' }), label)));
  }

  return { el, fmt, ft, pct, select, segmented, range, toggle, group, chips, citeText, results, check, svg, legend, bullets, nextId };
})();
