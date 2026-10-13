/* Typical section compliance (TS-1 to TS-7, Table 2.3(1)), cul-de-sacs, emergency access, clearances. */
FST.card({
  id: 'section', tab: 'xs',
  title: 'Typical section',
  intro: 'Shows the TSTS typical section for the selected classification. Change only the widths that differ on the plans; each element is checked against its minimum.',
  cites: ['ts', 't231', 's237', 's2321', 's2397'],
  defaults(c) {
    const v = FST.sections[c.cls.id][0];
    return { variant: v.id, vals: v.parts.map((p) => p[1]), row: v.row, cds: false, cdsLen: 400, cdsRow: 65, cdsPave: 50, sprink: false, vclear: 16.5 };
  },
  fields(c, s, set) {
    const u = c.ui, el = u.el;
    const vars = FST.sections[c.cls.id];
    const v = vars.find((x) => x.id === s.variant) || vars[0];
    const grid = el('div', { class: 'field-group' }, el('p', { class: 'group-title' }, 'Half section, centerline outward (ft)'));
    v.parts.forEach((p, i) => {
      const id = u.nextId('w');
      const inp = el('input', { type: 'number', id, min: 0, max: 60, step: 0.25, value: s.vals[i], class: 'num' });
      inp.addEventListener('input', () => { if (inp.value !== '') { s.vals[i] = +inp.value; set('vals', s.vals); } });
      grid.append(el('div', { class: 'range-row' }, el('label', { for: id, style: null, class: 'grow' }, `${p[2]} (min ${p[1]})`), inp));
    });
    return [
      u.select({ label: 'Section', value: s.variant, options: vars.map((x) => ({ value: x.id, label: `${c.cls.tableTS} — ${x.label}` })), onChange: (id) => {
        const nv = vars.find((x) => x.id === id); s.vals = nv.parts.map((p) => p[1]); s.row = nv.row; set('variant', id, { rebuild: true });
      } }),
      grid,
      u.range({ label: 'Total right-of-way on plans', min: 10, max: 200, step: 1, value: s.row, unit: 'ft', onChange: (val) => set('row', val) }),
      u.range({ label: 'Vertical clearance over the street', min: 10, max: 25, step: 0.5, value: s.vclear, unit: 'ft', onChange: (val) => set('vclear', val) }),
      c.cls.cdsAllowed ? u.toggle({ label: 'Includes a cul-de-sac', checked: s.cds, onChange: (val) => set('cds', val, { rebuild: true }) }) : null,
      s.cds ? u.group('Cul-de-sac',
        u.range({ label: 'Length (center of turnaround to adjoining street ROW)', min: 0, max: 1500, step: 10, value: s.cdsLen, unit: 'ft', onChange: (val) => set('cdsLen', val) }),
        u.toggle({ label: 'Adjoining properties have fire sprinklers', checked: s.sprink, onChange: (val) => set('sprink', val) }),
        u.range({ label: 'Right-of-way radius', min: 30, max: 100, step: 1, value: s.cdsRow, unit: 'ft', onChange: (val) => set('cdsRow', val) }),
        u.range({ label: 'Paved radius (outside edge)', min: 20, max: 80, step: 1, value: s.cdsPave, unit: 'ft', onChange: (val) => set('cdsPave', val) })) : null
    ];
  },
  evaluate(c, s) {
    const { ui, cls, C } = c;
    const vars = FST.sections[cls.id];
    const v = vars.find((x) => x.id === s.variant) || vars[0];
    const R = [];
    v.parts.forEach((p, i) => {
      if (s.vals[i] < p[1] - 1e-9) R.push({ status: 'fail', label: p[2], required: ui.ft(p[1], 2).replace('.00', ''), provided: ui.ft(s.vals[i], 2).replace('.00', ''), cite: ['ts', 't231'] });
    });
    const fails = R.length;
    if (!fails) R.push({ status: 'pass', label: `All section elements meet ${cls.tableTS} minimums`, cite: ['ts'] });
    R.push(ui.check(s.row >= v.row, 'Right-of-way width', ui.ft(v.row), ui.ft(s.row), ['ts']));
    if (cls.sidewalkNote && cls.sidewalkNote.includes('8')) R.push({ status: 'info', label: `Table 2.3(1) sidewalk width for ${cls.name}: ${cls.sidewalkNote}`, cite: ['t231'] });
    if (cls.median) R.push({ status: 'info', label: `Median width ${cls.median} ft; raised medians at least 4 ft face to face`, cite: ['t231', 's2315'] });
    if (cls.parkingAllowed === false && cls.group !== 'alley') R.push({ status: 'info', label: 'On-street parking is not allowed on major collectors and arterials', cite: ['s2316'] });
    R.push(ui.check(s.vclear >= C.vertClearance, 'Vertical clearance over the street', ui.ft(C.vertClearance, 1), ui.ft(s.vclear, 1), ['s2397']));
    if (s.cds) {
      const maxL = s.sprink ? C.cds.maxLenSprinkler : C.cds.maxLen;
      R.push(ui.check(s.cdsLen <= maxL, 'Cul-de-sac length', `≤ ${maxL} ft`, ui.ft(s.cdsLen), ['s237'], 'Longer cul-de-sacs need a secondary access.'));
      R.push(ui.check(s.cdsRow >= C.cds.rowRadius, 'Cul-de-sac right-of-way radius', ui.ft(C.cds.rowRadius), ui.ft(s.cdsRow), ['s237']));
      R.push(ui.check(s.cdsPave >= C.cds.pavedRadius, 'Cul-de-sac paved radius', ui.ft(C.cds.pavedRadius), ui.ft(s.cdsPave), ['s237']));
      R.push({ status: 'info', label: 'No medians or parking in cul-de-sacs; four "No Parking" signs evenly spaced', cite: ['s237'] });
    }
    R.push({ status: 'info', label: `Private emergency access lanes: ${C.fireLane.width} ft wide, ${C.fireLane.vertClear} ft vertical clearance, grade ${C.fireLane.gradeMin}–${C.fireLane.gradeMax}%, cross slope ${C.fireLane.xsMin}–${C.fireLane.xsMax}%`, cite: ['s2321'] });

    // ---- Diagram: half cross-section ----
    const W = 640, H = 240, x0 = 40, x1 = 600;
    const tot = s.vals.reduce((a, b) => a + b, 0) || 1;
    const sc = (x1 - x0) / Math.max(tot, s.row / 2);
    const g = ui.svg(W, H, `${cls.name} half cross-section`, `${v.label}. ${fails ? fails + ' element(s) below minimum.' : 'All elements meet minimums.'} Right-of-way ${s.row} feet.`);
    const fill = { median: 'grass', mcurb: 'curb', lane: 'pave', twltl: 'pave', bike: 'pave-2', park: 'pave-2', curb: 'curb', grass: 'grass', walk: 'walk', mup: 'walk', back: 'grass' };
    const short = { median: 'Median', mcurb: '', lane: 'Lane', twltl: 'TWLTL', bike: 'Bike', park: 'Parking', curb: '', grass: 'Grass', walk: 'Walk', mup: 'Trail', back: '' };
    let x = x0;
    const base = 150;
    g.line(x0, 40, x0, 200, 'dim'); g.text(x0, 34, 'CL', 't t-b', { 'text-anchor': 'middle' });
    v.parts.forEach((p, i) => {
      const w = s.vals[i] * sc;
      const bad = s.vals[i] < p[1] - 1e-9;
      const raised = ['median', 'grass', 'walk', 'mup', 'back'].includes(p[0]);
      const y = raised ? base - 8 : base;
      g.rect(x, y, w, 18, fill[p[0]]);
      if (bad) g.rect(x, y - 3, w, 24, 'bad', { fill: 'none' });
      if (p[0] === 'lane' && i > 0 && v.parts[i - 1][0] === 'lane') g.line(x, base, x, base + 18, 'lane-line');
      if (short[p[0]] && w > 26) g.text(x + w / 2, base + 40, short[p[0]], 't t-sm', { 'text-anchor': 'middle' });
      if (w > 18) g.text(x + w / 2, base - 18 - (i % 2) * 14, `${s.vals[i]}'${bad ? ' ✕' : ''}`, `t ${bad ? 't-b' : 't-sm'}`, { 'text-anchor': 'middle' });
      x += w;
    });
    const rowX = x0 + (s.row / 2) * sc;
    g.line(rowX, 50, rowX, 200, 'req');
    g.text(rowX, 214, `ROW (½ of ${s.row}')`, 't t-sm', { 'text-anchor': 'middle' });
    g.text(x0 + 8, 24, `${cls.tableTS} — ${v.label}`, 't t-b');

    return {
      svg: g,
      legend: ui.legend([['pave', 'Travel lane'], ['grass', 'Grass / median'], ['walk', 'Sidewalk / trail'], ['bad', 'Below minimum']]),
      results: R,
      basis: [
        ['Section source', `TSTS Typical Street Sections ${cls.tableTS} (dated 7/1/2021, published with the 2025 Standards). Dimensions shown are minimums; Table 2.3(1) lane width ${cls.lane ?? 'n/a'} ft.`],
        ['Cul-de-sacs', '§2.3.7(1): local streets only; 500 ft maximum (1,000 ft with fire sprinklers); 65 ft right-of-way radius; 50 ft paved radius.'],
        ['Clearances', '§2.3.9(7): 16.5 ft vertical clearance over streets; §2.3.21: 13.5 ft over fire lanes; §2.3.14: 10 ft over sidewalks.']
      ]
    };
  }
});
