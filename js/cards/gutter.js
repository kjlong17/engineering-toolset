/* Gutter spread, allowable spread and gutter capacity (TSTS §3.2.1(2), HEC-22), with Table 3.1 design storm and rational-method helper. */
FST.card({
  id: 'gutter', tab: 'drain',
  title: 'Gutter spread and design storm',
  intro: 'Gives the design storm for the classification, the allowable spread (half the travel lane), the gutter capacity at that spread, and the spread for a design flow.',
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
    R.push(ui.val(`Design storm, ${s.facility === 'freeboard' ? 'roadway freeboard' : s.facility + 's'} (${cls.group === 'alley' ? 'local' : cls.group} street)`, `${storm}-year${s.facility === 'culvert' ? ', 100-year check' : ''}`, ['c31']));
    let Q = s.Q;
    if (s.useRat) {
      Q = s.Cc * s.i * s.A;
      R.push(ui.val('Design flow, rational method', `${ui.fmt(Q, 2)} cfs`, ['s322'], `Q = CiA = ${s.Cc} × ${s.i} × ${s.A}.`));
      if (s.A >= C.rationalMaxAcres) R.push(ui.note('The rational method is acceptable only for drainage basins under 100 acres — use another method per TDOT', ['s322']));
    }
    const T = f.spread(Q, s.n, s.Sx / 100, s.SL / 100);
    const lane = cls.lane || 10;
    const usable = s.side === 'bike' || s.side === 'shoulder' ? s.sideW : 0;
    const allowed = s.gutterW + usable + lane / 2;
    const qAllow = f.gutterCapacity(allowed, s.n, s.Sx / 100, s.SL / 100);
    R.push(ui.val('Allowable spread from face of curb', ui.ft(allowed, 1), ['s3212'], `Gutter ${s.gutterW} ft${usable ? ` + ${s.side} ${usable} ft` : ''} + ½ of the ${lane} ft travel lane.`));
    R.push(ui.val('Gutter capacity at the allowable spread', `${ui.fmt(qAllow, 2)} cfs`, ['s3212', 'hec22'], `Place inlets so the ${C.storm[cls.storm].inlet}-year gutter flow does not exceed this. Depth at curb ${ui.fmt(allowed * s.Sx / 100 * 12, 1)} in.`));
    R.push(ui.val(`Spread for ${ui.fmt(Q, 2)} cfs`, ui.ft(T, 1), ['hec22'], `Depth at curb ${ui.fmt(T * s.Sx / 100 * 12, 1)} in.`));
    if (s.side === 'park') R.push(ui.note('Parking lanes are not listed in §3.2.1(2) as usable for spread; counted as zero here — confirm with the approving agency', ['s3212']));
    R.push(ui.val(`Minimum gutter grade, ${cls.name}`, ui.pct(cls.minGutter, 2), ['t232']));
    R.push(ui.info('Use combination (grate + curb opening) inlets where possible; double inlets at low points and cul-de-sac ends; inlets at the downstream end of inset parking bays', ['s3212']));

    // ---- Diagram: cross-section with spread ----
    const W = 640, H = 230, curbX = 590, y0 = 150, sc = Math.min(18, 540 / Math.max(allowed, T, 1) / 1.1);
    const g = ui.svg(W, H, 'Gutter cross-section with water spread',
      `Spread ${T.toFixed(1)} feet from the curb face for ${Q.toFixed(2)} cfs; allowable spread ${allowed.toFixed(1)} feet carries ${qAllow.toFixed(2)} cfs.`);
    const ex = 6; // vertical exaggeration of the cross slope
    const surf = (x) => y0 - (curbX - x) * (s.Sx / 100) * ex;
    g.add('path', { d: `M0,${surf(0)} L${curbX},${y0} L${curbX},${y0 + 30} L0,${y0 + 30} Z`, class: 'pave' });
    g.rect(curbX, y0 - 14, 30, 44, 'curb');
    const tx = curbX - T * sc;
    g.add('path', { d: `M${Math.max(tx, 0)},${surf(Math.max(tx, 0))} L${curbX},${y0} L${curbX},${surf(Math.max(tx, 0))} Z`, class: 'water' });
    const ax = curbX - allowed * sc;
    g.line(ax, 40, ax, y0 + 30, 'req');
    g.text(ax - 4, 36, `Allowable ${allowed.toFixed(1)} ft (${ui.fmt(qAllow, 2)} cfs)`, 't t-sm', { 'text-anchor': 'end' });
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
      legend: ui.legend([['water', 'Gutter flow'], ['req', 'Allowable spread']]),
      results: R,
      basis: [
        ['Design storm', 'TSTS Table 3.1: inlets and storm sewers 10-year (50-year on interstates and limited access); culverts 50-year with 100-year check; roadway freeboard 50-year; ditches 10-year (50-year on interstates).'],
        ['Spread and capacity', 'HEC-22 uniform cross-slope gutter: Q = (0.56/n)·Sx^1.67·SL^0.5·T^2.67, solved for T (spread) or Q (capacity). A depressed or composite gutter carries more flow; these values are conservative for those sections.'],
        ['Limit', 'TSTS §3.2.1(2): spread no more than one-half of the travel lane; bike lanes and shoulders may be used full width.'],
        ['Hydrology', 'TSTS §3.2.2: rational method only for basins under 100 acres; other methods per TDOT. Intensity must come from approved IDF data.']
      ]
    };
  }
});
