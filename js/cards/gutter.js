/* Gutter spread vs. half-lane limit (TSTS §3.2.1(2), HEC-22), with Table 3.1 design storm and rational-method helper. */
FST.card({
  id: 'gutter', tab: 'drain',
  title: 'Gutter spread and design storm',
  intro: 'Finds the design storm for the selected classification, then checks how far gutter flow spreads into the street against the TSTS limit of half the travel lane.',
  cites: ['c31', 's3212', 's322', 'hec22'],
  defaults: (c) => ({ facility: 'inlet', Q: 2.0, SL: 1.0, Sx: 2.0, n: 0.016, gutterW: 2, side: c.cls.bike ? 'bike' : c.cls.parking ? 'park' : 'none', sideW: c.cls.bike || c.cls.parking || 0,
    useRat: false, Cc: 0.5, i: 6.0, A: 2 }),
  fields(c, s, set) {
    const u = c.ui;
    return [
      u.select({ label: 'Facility (for design storm)', value: s.facility, onChange: (v) => set('facility', v), options: [
        { value: 'inlet', label: 'Inlets / gutter spread' }, { value: 'sewer', label: 'Storm sewer' }, { value: 'culvert', label: 'Culvert' }, { value: 'ditch', label: 'Ditch' }, { value: 'freeboard', label: 'Roadway freeboard' }] }),
      u.toggle({ label: 'Compute flow with the rational method (Q = CiA)', checked: s.useRat, onChange: (v) => set('useRat', v, { rebuild: true }) }),
      s.useRat ? u.group('Rational method (basins under 100 acres)',
        u.select({ label: 'Runoff coefficient C', value: s.Cc, onChange: (v) => set('Cc', +v), options: [
          { value: 0.3, label: '0.30 — lawns, parks' }, { value: 0.5, label: '0.50 — single-family residential' }, { value: 0.7, label: '0.70 — multifamily / mixed' },
          { value: 0.85, label: '0.85 — commercial' }, { value: 0.95, label: '0.95 — pavement and roofs' }] }),
        u.range({ label: 'Rainfall intensity for the design storm and Tc', min: 0.5, max: 12, step: 0.1, value: s.i, unit: 'in/h', onChange: (v) => set('i', v), hint: 'From the approved local IDF data (NOAA Atlas 14 per TDOT Drainage Manual).' }),
        u.range({ label: 'Drainage area to the inlet', min: 0.1, max: 120, step: 0.1, value: s.A, unit: 'ac', onChange: (v) => set('A', v) }))
        : u.range({ label: 'Gutter flow at the inlet (design storm)', min: 0.1, max: 15, step: 0.1, value: s.Q, unit: 'cfs', onChange: (v) => set('Q', v) }),
      u.range({ label: 'Longitudinal (gutter) slope', min: 0.3, max: 10, step: 0.1, value: s.SL, unit: '%', onChange: (v) => set('SL', v) }),
      u.range({ label: 'Pavement cross slope', min: 1, max: 5, step: 0.1, value: s.Sx, unit: '%', onChange: (v) => set('Sx', v) }),
      u.select({ label: "Manning's n (pavement)", value: s.n, onChange: (v) => set('n', +v), options: [{ value: 0.013, label: '0.013 — smooth concrete' }, { value: 0.016, label: '0.016 — asphalt (HEC-22 typical)' }] }),
      u.range({ label: 'Gutter pan width', min: 0, max: 3, step: 0.5, value: s.gutterW, unit: 'ft', onChange: (v) => set('gutterW', v) }),
      u.select({ label: 'Lane next to the gutter', value: s.side, onChange: (v) => set('side', v), options: [
        { value: 'none', label: 'Travel lane' }, { value: 'bike', label: 'Bike lane (full width usable)' }, { value: 'shoulder', label: 'Shoulder (full width usable)' }, { value: 'park', label: 'Parking lane' }] }),
      s.side !== 'none' ? u.range({ label: 'Width of that lane', min: 0, max: 12, step: 0.5, value: s.sideW, unit: 'ft', onChange: (v) => set('sideW', v) }) : null
    ];
  },
  evaluate(c, s) {
    const { f, ui, cls, C } = c;
    const R = [];
    const storm = C.storm[cls.storm][s.facility];
    R.push({ status: 'info', label: `Design storm for ${s.facility === 'freeboard' ? 'roadway freeboard' : s.facility + 's'} on a ${cls.group === 'alley' ? 'local street' : cls.group} street: ${storm}-year${s.facility === 'culvert' ? ', checked for the 100-year' : ''}`, cite: ['c31'] });
    let Q = s.Q;
    if (s.useRat) {
      Q = s.Cc * s.i * s.A;
      R.push({ status: s.A < C.rationalMaxAcres ? 'info' : 'fail', label: s.A < C.rationalMaxAcres ? `Rational method Q = ${s.Cc} × ${s.i} × ${s.A} = ${ui.fmt(Q, 2)} cfs` : 'Rational method is acceptable only for drainage basins under 100 acres', cite: ['s322'] });
    }
    const T = f.spread(Q, s.n, s.Sx / 100, s.SL / 100);
    const lane = cls.lane || 10;
    const usable = s.side === 'bike' || s.side === 'shoulder' ? s.sideW : 0;
    const allowed = s.gutterW + usable + lane / 2;
    const ok = T <= allowed;
    if (s.facility === 'inlet') {
      R.push(ui.check(ok, 'Spread from face of curb', `≤ ${ui.ft(allowed, 1)}`, ui.ft(T, 1), ['s3212', 'hec22'],
        `Allowed = gutter ${s.gutterW} ft${usable ? ` + ${s.side} ${usable} ft` : ''} + ½ of ${lane} ft lane. Depth at curb ${ui.fmt(T * s.Sx / 100 * 12, 1)} in.`));
    } else R.push({ status: 'info', label: `Spread for this flow: ${ui.ft(T, 1)} (spread limit applies to inlet design)`, cite: ['hec22'] });
    if (s.side === 'park') R.push({ status: 'note', label: 'Parking lanes are not listed in §3.2.1(2) as usable for spread; counted as zero here — confirm with the approving agency', cite: ['s3212'] });
    if (s.SL < cls.minGutter) R.push({ status: 'fail', label: 'Gutter slope below the TSTS minimum', required: ui.pct(cls.minGutter, 2), provided: ui.pct(s.SL, 2), cite: ['t232'] });
    R.push({ status: 'info', label: 'Use combination (grate + curb opening) inlets where possible; double inlets at low points and cul-de-sac ends; inlets at the downstream end of inset parking bays', cite: ['s3212'] });

    // ---- Diagram: cross-section with spread ----
    const W = 640, H = 230, curbX = 590, y0 = 150, sc = Math.min(18, 540 / Math.max(allowed, T, 1) / 1.1);
    const g = ui.svg(W, H, 'Gutter cross-section with water spread',
      `Spread ${T.toFixed(1)} feet from the curb face; allowed ${allowed.toFixed(1)} feet. ${ok ? 'Within' : 'Exceeds'} the limit.`);
    const ex = 6; // vertical exaggeration of the cross slope
    const surf = (x) => y0 - (curbX - x) * (s.Sx / 100) * ex;
    g.add('path', { d: `M0,${surf(0)} L${curbX},${y0} L${curbX},${y0 + 30} L0,${y0 + 30} Z`, class: 'pave' });
    g.rect(curbX, y0 - 14, 30, 44, 'curb');
    const tx = curbX - T * sc;
    g.add('path', { d: `M${Math.max(tx, 0)},${surf(Math.max(tx, 0))} L${curbX},${y0} L${curbX},${surf(Math.max(tx, 0))} Z`, class: 'water' });
    const ax = curbX - allowed * sc;
    g.line(ax, 40, ax, y0 + 30, 'req');
    g.text(ax - 4, 36, `Limit ${allowed.toFixed(1)} ft`, 't t-sm', { 'text-anchor': 'end' });
    // lane markings
    const gx = curbX - s.gutterW * sc, bx = gx - (s.side !== 'none' ? s.sideW : 0) * sc;
    g.line(gx, y0 + 30, gx, y0 + 40, 'edge');
    if (s.side !== 'none') { g.line(bx, surf(bx) - 2, bx, surf(bx) + 6, 'mark-solid'); g.text((bx + gx) / 2, y0 + 56, s.side === 'bike' ? 'Bike' : s.side === 'park' ? 'Parking' : 'Shoulder', 't t-sm', { 'text-anchor': 'middle' }); }
    g.text((bx + bx - lane * sc) / 2, y0 + 56, 'Travel lane', 't t-sm', { 'text-anchor': 'middle' });
    g.dimH(Math.max(tx, 4), curbX, y0 + 80, `Spread T = ${T.toFixed(1)} ft`);
    g.text(20, 24, `Q = ${ui.fmt(Q, 2)} cfs · SL = ${s.SL}% · Sx = ${s.Sx}% · n = ${s.n}`, 't t-b');
    g.text(W - 10, H - 6, 'Cross slope exaggerated', 't t-sm', { 'text-anchor': 'end' });

    return {
      svg: g,
      legend: ui.legend([['water', 'Gutter flow'], ['req', 'Allowed spread']]),
      results: R,
      basis: [
        ['Design storm', 'TSTS Table 3.1: inlets and storm sewers 10-year (50-year on interstates and limited access); culverts 50-year with 100-year check; roadway freeboard 50-year; ditches 10-year (50-year on interstates).'],
        ['Spread', 'HEC-22 uniform cross-slope gutter: Q = (0.56/n)·Sx^1.67·SL^0.5·T^2.67, solved for T. A depressed or composite gutter carries more flow; this check is conservative for those sections.'],
        ['Limit', 'TSTS §3.2.1(2): spread no more than one-half of the travel lane; bike lanes and shoulders may be used full width.'],
        ['Hydrology', 'TSTS §3.2.2: rational method only for basins under 100 acres; other methods per TDOT. Intensity must come from approved IDF data.']
      ]
    };
  }
});
