/* App shell: global street classification, tabs, card rendering, disclaimer. */
window.FST = window.FST || {};
(function () {
  const { el } = FST.ui;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('fst:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('fst:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  FST.tabs = [
    { id: 'align', label: 'Alignment' },
    { id: 'int', label: 'Intersections' },
    { id: 'xs', label: 'Cross section & access' },
    { id: 'road', label: 'Roadside safety' },
    { id: 'drain', label: 'Drainage' },
    { id: 'about', label: 'About & sources' }
  ];
  FST.cardDefs = [];
  FST.card = (def) => FST.cardDefs.push(def);

  const state = { classId: store.get('class', 'minCol'), tab: store.get('tab', 'align') };
  const ctx = () => ({ cls: FST.classes.find((c) => c.id === state.classId), C: FST.criteria, f: FST.f, ui: FST.ui });

  /* ---------- Card rendering ---------- */
  function renderCard(def) {
    const c = ctx();
    const s = def.defaults(c);
    const headId = 'h-' + def.id;
    const inputs = el('div', { class: 'inputs' });
    const viz = el('figure', { class: 'viz', 'aria-label': `${def.title} diagram` });
    const out = el('div', { class: 'out' });
    const status = el('p', { class: 'sr-only', role: 'status' });
    const basis = el('div', { class: 'basis-body' });
    let announce = null, last = {};

    function refresh() {
      const r = def.evaluate(ctx(), s);
      viz.replaceChildren(r.svg ? r.svg.root || r.svg : '', r.legend || '', r.caption ? el('figcaption', null, r.caption) : '');
      syncScrollable(viz);
      out.replaceChildren(FST.ui.results(r.results));
      basis.replaceChildren(...(r.basis || []).map(([k, v]) => el('div', { class: 'basis-row' }, el('dt', null, k), el('dd', null, v))));
      // Announce the headline value once input settles, not the whole list on every slider step.
      const vals = r.results.filter((x) => x.status === 'value');
      const changed = vals.find((x) => last[x.label] !== x.value) || vals[0];
      last = Object.fromEntries(vals.map((x) => [x.label, x.value]));
      clearTimeout(announce);
      announce = setTimeout(() => { status.textContent = changed ? `${changed.label}: ${changed.value}` : ''; }, 600);
    }
    /* Which control has focus, as something that survives a rebuild: field label, input type, radio value. */
    const focusKey = (n) => {
      const f = n && inputs.contains(n) ? n.closest('.field') : null;
      const lab = f && f.querySelector('legend, label');
      return lab ? `${lab.textContent}|${n.type}|${n.type === 'radio' ? n.value : ''}` : null;
    };
    function buildFields() {
      const key = focusKey(document.activeElement);
      inputs.replaceChildren(...def.fields(ctx(), s, set).filter(Boolean));
      if (key) for (const n of inputs.querySelectorAll('input, select')) if (focusKey(n) === key) { n.focus(); break; }
    }
    function set(key, value, opts = {}) {
      s[key] = value;
      if (opts.rebuild) buildFields();
      refresh();
    }
    buildFields();
    refresh();
    return el('article', { class: 'card', id: 'card-' + def.id, 'aria-labelledby': headId },
      el('header', { class: 'card-head' },
        el('h2', { id: headId }, def.title),
        el('p', { class: 'intro' }, def.intro),
        FST.ui.chips(def.cites)),
      el('div', { class: 'card-grid' }, inputs, viz),
      el('h3', { class: 'out-title' }, 'Design values'),
      out, status,
      el('details', { class: 'basis' }, el('summary', null, 'Basis — how this is computed'), el('dl', null, basis)));
  }

  /* A diagram gets a tab stop only when it scrolls sideways (narrow screens), so keyboard users can scroll it. */
  function syncScrollable(v) {
    if (v.scrollWidth > v.clientWidth + 1) v.tabIndex = 0; else v.removeAttribute('tabindex');
  }
  addEventListener('resize', () => document.querySelectorAll('.viz').forEach(syncScrollable));

  /* ---------- Tabs ---------- */
  function renderTabs() {
    const bar = document.getElementById('tabbar');
    bar.replaceChildren(...FST.tabs.map((t) => el('button', {
      type: 'button', role: 'tab', id: 'tab-' + t.id, 'aria-controls': 'panel-' + t.id,
      'aria-selected': String(t.id === state.tab), tabindex: t.id === state.tab ? '0' : '-1',
      onclick: () => selectTab(t.id)
    }, t.label)));
    bar.onkeydown = (e) => {
      const i = FST.tabs.findIndex((t) => t.id === state.tab);
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % FST.tabs.length;
      if (e.key === 'ArrowLeft') j = (i - 1 + FST.tabs.length) % FST.tabs.length;
      if (e.key === 'Home') j = 0;
      if (e.key === 'End') j = FST.tabs.length - 1;
      if (j != null) { e.preventDefault(); selectTab(FST.tabs[j].id); document.getElementById('tab-' + FST.tabs[j].id).focus(); }
    };
  }
  function selectTab(id) {
    state.tab = id; store.set('tab', id);
    for (const t of FST.tabs) {
      const b = document.getElementById('tab-' + t.id);
      b.setAttribute('aria-selected', String(t.id === id));
      b.tabIndex = t.id === id ? 0 : -1;
      document.getElementById('panel-' + t.id).hidden = t.id !== id;
    }
    document.querySelectorAll(`#panel-${id} .viz`).forEach(syncScrollable);
  }

  function renderPanels() {
    const main = document.getElementById('panels');
    main.replaceChildren(...FST.tabs.map((t) => {
      const p = el('section', { role: 'tabpanel', id: 'panel-' + t.id, 'aria-labelledby': 'tab-' + t.id, tabindex: '0', class: 'panel' });
      if (t.id === 'about') p.append(FST.about());
      else FST.cardDefs.filter((d) => d.tab === t.id).forEach((d) => p.append(renderCard(d)));
      p.hidden = t.id !== state.tab;
      return p;
    }));
  }

  function renderContext() {
    const c = ctx().cls;
    document.getElementById('ctx-speed').textContent = `${c.designSpeed} mph design / ${c.postedNote || c.posted} mph posted`;
    document.getElementById('ctx-meta').textContent = c.tableTS;
    document.getElementById('ctx-adt').textContent = c.adt === 'n/a' ? 'n/a' : `${c.adt} veh/day`;
  }

  /* ---------- Init ---------- */
  function init() {
    const sel = document.getElementById('ctx-class');
    for (const c of FST.classes) {
      const o = el('option', { value: c.id }, c.name);
      if (c.id === state.classId) o.selected = true;
      sel.append(o);
    }
    sel.addEventListener('change', () => {
      state.classId = sel.value; store.set('class', sel.value);
      renderContext(); renderPanels();
      document.getElementById('ctx-status').textContent = `Street classification set to ${ctx().cls.name}. All tools updated to its defaults.`;
    });
    renderContext(); renderTabs(); renderPanels();

    const dlg = document.getElementById('disclaimer');
    document.getElementById('disclaimer-ok').addEventListener('click', () => { store.set('ack', 1); dlg.close(); });
    document.getElementById('disclaimer-open').addEventListener('click', () => dlg.showModal());
    if (!store.get('ack', 0) && dlg.showModal) dlg.showModal();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
