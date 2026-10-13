/* Taper lengths: TSTS lane transition (§2.3.11), TDOT turn-lane tapers and lane drop. */
FST.card({
  id: 'taper', tab: 'int',
  title: 'Taper length',
  intro: 'Computes the minimum taper for lane transitions, turn-lane approach and bay tapers, and lane drops after an intersection, and checks the taper shown on the plans.',
  cites: ['s2311', 'hsamTaper', 'hsamDrop', 'mutcdDrop'],
  defaults: (c) => ({ mode: 'transition', W: 12, V: Math.max(20, c.cls.designSpeed), L: 300 }),
  fields(c, s, set) {
    const u = c.ui;
    return [
      u.segmented({ label: 'Taper type', value: s.mode, onChange: (v) => set('mode', v, { rebuild: true }), options: [
        { value: 'transition', label: 'Lane transition / shift' }, { value: 'bay', label: 'Turn-lane bay' }, { value: 'drop', label: 'Lane drop after intersection' }] }),
      u.range({ label: s.mode === 'bay' ? 'Turn lane width (W)' : 'Lateral offset (W)', min: 1, max: 24, step: 0.5, value: s.W, unit: 'ft', onChange: (v) => set('W', v) }),
      u.range({ label: 'Design speed (S)', min: 20, max: 70, step: 5, value: s.V, unit: 'mph', onChange: (v) => set('V', v) }),
      u.range({ label: s.mode === 'drop' ? 'Lane extension past intersection on plans (X)' : 'Taper length on plans', min: 0, max: 2500, step: 5, value: s.L, unit: 'ft', onChange: (v) => set('L', v) })
    ];
  },
  evaluate(c, s) {
    const { f, ui } = c;
    const R = [];
    let req, eq, cite, parts = null;
    if (s.mode === 'transition') {
      req = f.taperTsts(s.W, s.V);
      eq = s.V <= 40 ? `L = WS²/60 = ${s.W}·${s.V}²/60` : `L = WS = ${s.W}·${s.V}`;
      cite = ['s2311'];
      R.push(ui.check(s.L >= req, 'Lane transition taper', ui.ft(req), ui.ft(s.L), cite, eq));
      R.push({ status: 'info', label: 'Tapers on a curve: design each side with its own curve — no angle points', cite: ['s2311'] });
    } else if (s.mode === 'bay') {
      const b = f.bayTaper(s.W, s.V);
      req = b.length;
      eq = `L = WS/3 = ${ui.fmt(b.raw, 1)} ft, held between 8:1 (${b.min} ft) and 15:1 (${b.max} ft)`;
      cite = ['hsamTaper'];
      R.push({ status: s.L >= b.min && s.L <= b.max ? (s.L >= req ? 'pass' : 'note') : 'fail', label: 'Turn-lane bay taper', required: `${ui.ft(req)} (range ${b.min}–${b.max})`, provided: `${ui.ft(s.L)} (${(s.L / s.W).toFixed(1)}:1)`, cite, detail: eq });
    } else {
      const d = f.laneDrop(s.V);
      req = d ? d.X : null;
      const taper = f.taperTsts(s.W, s.V);
      eq = d ? `X = 750 ft + d = 750 + ${d.d} (MUTCD Condition A at ${s.V} mph)` : 'Speed outside table';
      cite = ['hsamDrop', 'mutcdDrop'];
      parts = { X: req, taper };
      if (req) R.push(ui.check(s.L >= req, 'Lane extension past the intersection before the merge taper', ui.ft(req), ui.ft(s.L), cite, eq));
      R.push({ status: 'info', label: `Merge taper after the extension: ${ui.ft(taper)}`, detail: s.V <= 40 ? 'L = WS²/60' : 'L = WS', cite: ['s2311', 'hsamDrop'] });
      R.push({ status: 'info', label: 'Avoid lane drops on horizontal or vertical curves', cite: ['hsamDrop'] });
    }

    // ---- Diagram: taper sketch ----
    const W = 640, H = 240, x0 = 30, x1 = 610, laneH = 34, y0 = 120;
    const g = ui.svg(W, H, 'Taper plan sketch (not to scale)',
      `${s.mode === 'drop' ? 'Lane drop' : 'Taper'}: required ${req != null ? Math.round(req) : 'unknown'} feet, ${s.L} feet on plans.`);
    const ok = req != null && s.L >= req - 1e-6;
    if (s.mode === 'drop') {
      const sum = (req || 0) + parts.taper + 120;
      const sc = (x1 - x0 - 60) / sum;
      const a = x0 + 60, b = a + (req || 0) * sc, cpt = b + parts.taper * sc;
      g.rect(0, y0 - laneH, W, laneH, 'pave');
      g.add('path', { d: `M0,${y0 - 1} L${cpt},${y0 - 1} L${b},${y0 + laneH} L0,${y0 + laneH} Z`, class: 'pave' });
      g.line(0, y0, b, y0, 'lane-line');
      g.rect(0, y0 - laneH - 10, a - 10, laneH * 2 + 20, 'pave-2');
      g.text((a - 10) / 2, y0 + laneH + 26, 'Intersection', 't t-sm', { 'text-anchor': 'middle' });
      g.dimH(a, b, y0 + laneH + 22, `X = ${req ?? '—'} ft`);
      g.dimH(b, cpt, y0 - laneH - 14, `Taper ${Math.round(parts.taper)} ft`);
      const pb = a + Math.min(s.L, sum) * sc;
      g.line(a, y0 + laneH + 50, pb, y0 + laneH + 50, ok ? 'ok' : 'bad');
      g.text(a, y0 + laneH + 66, `On plans: X = ${s.L} ft`, 't t-sm');
    } else {
      const span = Math.max(req || 0, s.L) * 1.25 + 40;
      const sc = (x1 - x0) / span;
      const a = x0 + 20 * sc, b = a + (req || 0) * sc, pb = a + s.L * sc;
      const off = Math.min(laneH, 10 + s.W * 2);
      g.rect(0, y0 - laneH, W, laneH, 'pave');
      g.add('path', { d: `M${0},${y0} L${a},${y0} L${b},${y0 + off} L${W},${y0 + off} L${W},${y0 - 1} L0,${y0 - 1} Z`, class: 'pave' });
      g.path(`M${a},${y0} L${b},${y0 + off}`, 'req');
      g.path(`M${a},${y0 - 4} L${pb},${y0 + off - 4}`, ok ? 'ok' : 'bad');
      g.dimV(Math.min(b + 16, x1 - 40), y0, y0 + off, `W = ${s.W} ft`);
      g.dimH(a, b, y0 + off + 40, `Required L = ${Math.round(req)} ft`);
      g.line(a, y0 + off + 70, pb, y0 + off + 70, ok ? 'ok' : 'bad');
      g.text(a, y0 + off + 86, `On plans: ${s.L} ft (${(s.L / s.W).toFixed(1)}:1)`, 't t-sm');
    }
    g.text(x0, 24, eq, 't t-b');

    return {
      svg: g,
      legend: ui.legend([['req', 'Required minimum'], [ok ? 'ok' : 'bad', 'Plans']]),
      results: R,
      basis: [
        ['Lane transition', 'TSTS §2.3.11: L = WS²/60 for S ≤ 40 mph; L = WS for S > 40 mph. W = lateral offset (ft); S = design speed (mph). TDOT uses the same formulas with the break at 45 mph; results match at 5-mph design speeds.'],
        ['Turn-lane bay', 'TDOT HSAM Figure 3-21: L = WS/3, minimum rate 8:1 (low speed), maximum 15:1 (higher speed). Departure taper may not be sharper than the approach taper.'],
        ['Lane drop', 'TDOT HSAM Figure 3-22 / RDG §2-601: extend the added lane X = 750 ft + d past the intersection, where d is the MUTCD Table 2C-3 Condition A advance placement distance; then merge with L = WS or WS²/60.']
      ]
    };
  }
});
