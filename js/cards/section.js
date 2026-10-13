/* Typical section dimensions (TS-1 to TS-7, Table 2.3(1)), cul-de-sacs, emergency access, clearances. */
FST.card({
  id: 'section', tab: 'xs',
  title: 'Typical section',
  intro: 'Gives the TSTS typical section for the selected classification: the minimum width of each element, the right-of-way, and cul-de-sac and clearance dimensions.',
  cites: ['ts', 't231', 's237', 's2321', 's2397'],
  defaults(c) {
    return { variant: FST.sections[c.cls.id][0].id, cds: false, sprink: false };
  },
  fields(c, s, set) {
    const u = c.ui;
    const vars = FST.sections[c.cls.id];
    return [
      u.select({ label: 'Section', value: s.variant, options: vars.map((x) => ({ value: x.id, label: `${c.cls.tableTS} — ${x.label}` })), onChange: (id) => set('variant', id) }),
      c.cls.cdsAllowed ? u.toggle({ label: 'Includes a cul-de-sac', checked: s.cds, onChange: (v) => set('cds', v, { rebuild: true }) }) : null,
      s.cds && c.cls.cdsAllowed ? u.toggle({ label: 'Adjoining properties have fire sprinklers', checked: s.sprink, onChange: (v) => set('sprink', v) }) : null
    ];
  },
  evaluate(c, s) {
    const { ui, cls, C } = c;
    const vars = FST.sections[cls.id];
    const v = vars.find((x) => x.id === s.variant) || vars[0];
    const R = [];
    const w = (x) => ui.ft(x, 2).replace('.00', '').replace(/(\.\d)0 ft$/, '$1 ft');
    const half = v.parts.reduce((a, p) => a + p[1], 0);
    R.push(ui.val('Right-of-way width', ui.ft(v.row), ['ts'], `Elements below are a half section, centerline outward, totaling ${w(half)}; half the right-of-way is ${w(v.row / 2)}.`));
    for (const p of v.parts) R.push(ui.val(p[2], w(p[1]), ['ts', 't231']));
    if (cls.sidewalkNote && cls.sidewalkNote.includes('8')) R.push(ui.info(`Table 2.3(1) sidewalk width for ${cls.name}: ${cls.sidewalkNote}`, ['t231']));
    if (cls.median) R.push(ui.info(`Median width ${cls.median} ft; raised medians at least 4 ft face to face`, ['t231', 's2315']));
    if (cls.parkingAllowed === false && cls.group !== 'alley') R.push(ui.info('On-street parking is not allowed on major collectors and arterials', ['s2316']));
    R.push(ui.val('Minimum vertical clearance over the street', ui.ft(C.vertClearance, 1), ['s2397']));
    if (s.cds && cls.cdsAllowed) {
      const maxL = s.sprink ? C.cds.maxLenSprinkler : C.cds.maxLen;
      R.push(ui.val('Maximum cul-de-sac length', ui.ft(maxL), ['s237'], 'From the center of the turnaround to the right-of-way of the adjoining street. Longer cul-de-sacs need a secondary access.'));
      R.push(ui.val('Cul-de-sac right-of-way radius', ui.ft(C.cds.rowRadius), ['s237']));
      R.push(ui.val('Cul-de-sac paved radius (outside edge)', ui.ft(C.cds.pavedRadius), ['s237']));
      R.push(ui.info('No medians or parking in cul-de-sacs; four "No Parking" signs evenly spaced', ['s237']));
    }
    R.push(ui.val('Private emergency access lanes', `${C.fireLane.width} ft wide, ${C.fireLane.vertClear} ft clear height`, ['s2321'], `Grade ${C.fireLane.gradeMin}–${C.fireLane.gradeMax}%; cross slope ${C.fireLane.xsMin}–${C.fireLane.xsMax}%.`));

    // ---- Diagram: half cross-section ----
    const W = 640, H = 240, x0 = 40, x1 = 600;
    const sc = (x1 - x0) / Math.max(half, v.row / 2);
    const g = ui.svg(W, H, `${cls.name} half cross-section`, `${v.label}. Right-of-way ${v.row} feet. ${v.parts.map((p) => `${p[2]} ${p[1]} feet`).join(', ')}.`);
    const fill = { median: 'grass', mcurb: 'curb', lane: 'pave', twltl: 'pave', bike: 'pave-2', park: 'pave-2', curb: 'curb', grass: 'grass', walk: 'walk', mup: 'walk', back: 'grass' };
    const short = { median: 'Median', mcurb: '', lane: 'Lane', twltl: 'TWLTL', bike: 'Bike', park: 'Parking', curb: '', grass: 'Grass', walk: 'Walk', mup: 'Trail', back: '' };
    let x = x0;
    const base = 150;
    g.line(x0, 40, x0, 200, 'dim'); g.text(x0, 34, 'CL', 't t-b', { 'text-anchor': 'middle' });
    v.parts.forEach((p, i) => {
      const pw = p[1] * sc;
      const raised = ['median', 'grass', 'walk', 'mup', 'back'].includes(p[0]);
      g.rect(x, raised ? base - 8 : base, pw, 18, fill[p[0]]);
      if (p[0] === 'lane' && i > 0 && v.parts[i - 1][0] === 'lane') g.line(x, base, x, base + 18, 'lane-line');
      if (short[p[0]] && pw > 26) g.text(x + pw / 2, base + 40, short[p[0]], 't t-sm', { 'text-anchor': 'middle' });
      if (pw > 18) g.text(x + pw / 2, base - 18 - (i % 2) * 14, `${p[1]}'`, 't t-sm', { 'text-anchor': 'middle' });
      x += pw;
    });
    const rowX = x0 + (v.row / 2) * sc;
    g.line(rowX, 50, rowX, 200, 'req');
    g.text(rowX, 214, `ROW (½ of ${v.row}')`, 't t-sm', { 'text-anchor': 'middle' });
    g.text(x0 + 8, 24, `${cls.tableTS} — ${v.label}`, 't t-b');

    return {
      svg: g,
      legend: ui.legend([['pave', 'Travel lane'], ['grass', 'Grass / median'], ['walk', 'Sidewalk / trail'], ['req', 'Right-of-way line']]),
      results: R,
      basis: [
        ['Section source', `TSTS Typical Street Sections ${cls.tableTS} (dated 7/1/2021, published with the 2025 Standards). Dimensions shown are minimums; Table 2.3(1) lane width ${cls.lane ?? 'n/a'} ft.`],
        ['Cul-de-sacs', '§2.3.7(1): local streets only; 500 ft maximum (1,000 ft with fire sprinklers); 65 ft right-of-way radius; 50 ft paved radius.'],
        ['Clearances', '§2.3.9(7): 16.5 ft vertical clearance over streets; §2.3.21: 13.5 ft over fire lanes; §2.3.14: 10 ft over sidewalks.']
      ]
    };
  }
});
