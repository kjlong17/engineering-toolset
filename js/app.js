/* App shell: global street classification, tabs, card rendering, review comments, disclaimer. */
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

  const state = { classId: store.get('class', 'minCol'), tab: store.get('tab', 'align'), comments: store.get('comments', []) };
  const ctx = () => ({ cls: FST.classes.find((c) => c.id === state.classId), C: FST.criteria, f: FST.f, ui: FST.ui });

  /* ---------- Card rendering ---------- */
  function renderCard(def) {
    const c = ctx();
    const s = def.defaults(c);
    const headId = 'h-' + def.id;
    const inputs = el('div', { class: 'inputs' });
    const viz = el('figure', { class: 'viz', tabindex: '0', 'aria-label': `${def.title} diagram` });
    const out = el('div', { class: 'out', 'aria-live': 'polite' });
    const basis = el('div', { class: 'basis-body' });
    const addBtn = el('button', { type: 'button', class: 'btn' }, 'Add findings to review comments');
    let last = null;

    function refresh() {
      const r = def.evaluate(ctx(), s);
      last = r;
      viz.replaceChildren(r.svg ? r.svg.root || r.svg : '', r.legend || '', r.caption ? el('figcaption', null, r.caption) : '');
      out.replaceChildren(FST.ui.results(r.results));
      basis.replaceChildren(...(r.basis || []).map(([k, v]) => el('div', { class: 'basis-row' }, el('dt', null, k), el('dd', null, v))));
    }
    function buildFields() {
      inputs.replaceChildren(...def.fields(ctx(), s, set).filter(Boolean));
    }
    function set(key, value, opts = {}) {
      s[key] = value;
      if (opts.rebuild) buildFields();
      refresh();
    }
    addBtn.addEventListener('click', () => {
      if (!last) return;
      const items = last.results.filter((r) => r.status === 'fail' || r.status === 'note');
      const list = items.length ? items : [{ status: 'pass', label: 'All checks shown passed', cite: def.cites }];
      for (const r of list) addComment(def.title, r);
      addBtn.textContent = `Added ${list.length} item${list.length === 1 ? '' : 's'}`;
      setTimeout(() => (addBtn.textContent = 'Add findings to review comments'), 1800);
    });

    buildFields();
    refresh();
    return el('article', { class: 'card', id: 'card-' + def.id, 'aria-labelledby': headId },
      el('header', { class: 'card-head' },
        el('h2', { id: headId }, def.title),
        el('p', { class: 'intro' }, def.intro),
        FST.ui.chips(def.cites)),
      el('div', { class: 'card-grid' }, inputs, viz),
      el('h3', { class: 'out-title' }, 'Results'),
      out,
      el('details', { class: 'basis' }, el('summary', null, 'Basis — how this is computed'), el('dl', null, basis)),
      el('div', { class: 'card-actions' }, addBtn));
  }

  /* ---------- Review comments ---------- */
  function addComment(card, r) {
    const cites = (r.cite || []).map(FST.ui.citeText).join('; ');
    const vals = [r.required != null ? `required ${r.required}` : null, r.provided != null ? `provided ${r.provided}` : null].filter(Boolean).join(', ');
    const word = { pass: 'PASS', fail: 'REVISE', note: 'NOTE', info: 'INFO' }[r.status];
    state.comments.push(`${word} — ${card}: ${r.label}${vals ? ` (${vals})` : ''}.${r.detail ? ' ' + r.detail : ''}${cites ? ` [${cites}]` : ''}`);
    store.set('comments', state.comments);
    renderComments();
  }
  function renderComments() {
    const list = document.getElementById('comment-list');
    const count = document.getElementById('comment-count');
    count.textContent = state.comments.length;
    list.replaceChildren(...(state.comments.length
      ? state.comments.map((t, i) => el('li', null, el('span', null, t),
          el('button', { type: 'button', class: 'link', 'aria-label': `Remove comment ${i + 1}`, onclick: () => { state.comments.splice(i, 1); store.set('comments', state.comments); renderComments(); } }, 'Remove')))
      : [el('li', { class: 'empty' }, 'No comments yet. Use “Add findings to review comments” on any card.')]));
  }
  function commentsText() {
    const cls = ctx().cls;
    return [`Plan review comments — ${cls.name} (design speed ${cls.designSpeed} mph)`,
      `Basis: ${FST.sources.tsts.name}, ${FST.sources.tsts.edition}`, '',
      ...state.comments.map((t, i) => `${i + 1}. ${t}`)].join('\n');
  }

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
    document.getElementById('ctx-meta').textContent = `${c.tableTS} · ADT ${c.adt}`;
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
      document.getElementById('ctx-status').textContent = `Street classification set to ${ctx().cls.name}. All cards updated to its defaults.`;
    });
    renderContext(); renderTabs(); renderPanels(); renderComments();

    const drawer = document.getElementById('comments');
    const toggleBtn = document.getElementById('comments-toggle');
    const setDrawer = (open) => { drawer.hidden = !open; toggleBtn.setAttribute('aria-expanded', String(open)); if (open) drawer.querySelector('h2').focus(); };
    toggleBtn.addEventListener('click', () => setDrawer(drawer.hidden));
    document.getElementById('comments-close').addEventListener('click', () => { setDrawer(false); toggleBtn.focus(); });
    document.getElementById('comments-copy').addEventListener('click', async (e) => {
      const txt = commentsText();
      try { await navigator.clipboard.writeText(txt); e.target.textContent = 'Copied'; }
      catch (err) {
        const ta = el('textarea', { class: 'sr-only' }); ta.value = txt; document.body.append(ta); ta.select();
        try { document.execCommand('copy'); e.target.textContent = 'Copied'; } catch (e2) { e.target.textContent = 'Copy failed'; }
        ta.remove();
      }
      setTimeout(() => (e.target.textContent = 'Copy as text'), 1800);
    });
    document.getElementById('comments-print').addEventListener('click', () => {
      document.getElementById('print-comments').textContent = commentsText();
      window.print();
    });
    document.getElementById('comments-clear').addEventListener('click', () => {
      if (!state.comments.length || confirm('Clear all review comments?')) { state.comments = []; store.set('comments', []); renderComments(); }
    });

    const dlg = document.getElementById('disclaimer');
    document.getElementById('disclaimer-ok').addEventListener('click', () => { store.set('ack', 1); dlg.close(); });
    document.getElementById('disclaimer-open').addEventListener('click', () => dlg.showModal());
    if (!store.get('ack', 0) && dlg.showModal) dlg.showModal();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
