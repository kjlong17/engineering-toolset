/* Taper lengths: TSTS lane transition (§2.3.11), TDOT turn-lane tapers and lane drop. */
FST.card({
  id: 'taper', tab: 'int',
  title: 'Taper length',
  intro: 'Gives the minimum taper for lane transitions, turn-lane bays and lane drops after an intersection, for the lateral offset and design speed.',
  cites: ['s2311', 'hsamTaper', 'hsamDrop', 'mutcdDrop'],
  defaults: (c) => ({ mode: 'transition', W: 12, V: Math.max(20, c.cls.designSpeed) }),
  fields(c, s, set) {
    const u = c.ui;
    return [
      u.segmented({ label: 'Taper type', value: s.mode, onChange: (v) => set('mode', v, { rebuild: true }), options: [
        { value: 'transition', label: 'Lane transition / shift' }, { value: 'bay', label: 'Turn-lane bay' }, { value: 'drop', label: 'Lane drop after intersection' }] }),
      u.range({ label: s.mode === 'bay' ? 'Turn lane width (W)' : 'Lateral offset (W)', min: 1, max: 24, step: 0.5, value: s.W, unit: 'ft', onChange: (v) => set('W', v) }),
      u.range({ label: 'Design speed (S)', min: 20, max: 70, step: 5, value: s.V, unit: 'mph', onChange: (v) => set('V', v) })
    ];
  },
  evaluate(c, s) {
    const { f, ui } = c;
    const R = [];
    let req, eq, parts = null;
    if (s.mode === 'transition') {
      req = Math.ceil(f.taperTsts(s.W, s.V) - 1e-9);
      eq = s.V <= 40 ? `L = WS²/60 = ${s.W}·${s.V}²/60` : `L = WS = ${s.W}·${s.V}`;
      R.push(ui.val('Minimum lane transition taper', `${ui.ft(req)} (${(req / s.W).toFixed(1)}:1)`, ['s2311'], eq));
      R.push(ui.info('Tapers on a curve: design each side with its own curve — no angle points', ['s2311']));
    } else if (s.mode === 'bay') {
      const b = f.bayTaper(s.W, s.V);
      req = Math.ceil(b.length - 1e-9);
      eq = `L = WS/3 = ${ui.fmt(b.raw, 1)} ft, held between 8:1 (${b.min} ft) and 15:1 (${b.max} ft)`;
      R.push(ui.val('Turn-lane bay taper', `${ui.ft(req)} (${(req / s.W).toFixed(1)}:1)`, ['hsamTaper'], eq));
      R.push(ui.val('Allowed bay taper range', `${ui.fmt(b.min)}–${ui.fmt(b.max)} ft (8:1 to 15:1)`, ['hsamTaper']));
      R.push(ui.info('The departure taper may be no sharper than the approach taper', ['hsamTaper']));
    } else {
      const d = f.laneDrop(s.V);
      req = d ? d.X : null;
      const taper = Math.ceil(f.taperTsts(s.W, s.V) - 1e-9);
      eq = d ? `X = 750 ft + d = 750 + ${d.d} (MUTCD Condition A at ${s.V} mph)` : 'Speed outside table';
      parts = { X: req, taper };
      if (req) R.push(ui.val('Lane extension past the intersection before the merge taper (X)', ui.ft(req), ['hsamDrop', 'mutcdDrop'], eq));
      R.push(ui.val('Merge taper after the extension', ui.ft(taper), ['s2311', 'hsamDrop'], s.V <= 40 ? 'L = WS²/60' : 'L = WS'));
      if (req) R.push(ui.val('Total from the intersection to the end of the merge', ui.ft(req + taper)));
      R.push(ui.info('Avoid lane drops on horizontal or vertical curves', ['hsamDrop']));
    }

    // ---- Diagram: taper sketch ----
    const W = 640, H = 220, x0 = 30, x1 = 610, laneH = 34, y0 = 110;
    const g = ui.svg(W, H, 'Taper plan sketch (not to scale)',
      s.mode === 'drop' ? `Lane drop: extend ${req ?? 'unknown'} feet past the intersection, then merge over ${parts.taper} feet.` : `Taper of ${req} feet for a ${s.W} foot offset at ${s.V} mph.`);
    if (s.mode === 'drop') {
      const sum = (req || 0) + parts.taper + 120;
      const sc = (x1 - x0 - 60) / sum;
      const a = x0 + 60, b = a + (req || 0) * sc, cpt = b + parts.taper * sc;
      g.rect(0, y0 - laneH, W, laneH, 'pave');
      g.add('path', { d: `M0,${y0 - 1} L${b},${y0 - 1} L${cpt},${y0 - 1} L${b},${y0 + laneH} L0,${y0 + laneH} Z`, class: 'pave' });
      g.line(0, y0, b, y0, 'lane-line');
      g.path(`M${b},${y0 + laneH} L${cpt},${y0}`, 'ok');
      g.rect(0, y0 - laneH - 10, a - 10, laneH * 2 + 20, 'pave-2');
      g.text((a - 10) / 2, y0 + laneH + 26, 'Intersection', 't t-sm', { 'text-anchor': 'middle' });
      g.dimH(a, b, y0 + laneH + 22, `X = ${req ?? '—'} ft`);
      g.dimH(b, cpt, y0 - laneH - 14, `Taper ${parts.taper} ft`);
    } else {
      const span = req * 1.25 + 40;
      const sc = (x1 - x0) / span;
      const a = x0 + 20 * sc, b = a + req * sc;
      const off = Math.min(laneH, 10 + s.W * 2);
      g.rect(0, y0 - laneH, W, laneH, 'pave');
      g.add('path', { d: `M${0},${y0} L${a},${y0} L${b},${y0 + off} L${W},${y0 + off} L${W},${y0 - 1} L0,${y0 - 1} Z`, class: 'pave' });
      g.path(`M${a},${y0} L${b},${y0 + off}`, 'ok');
      g.dimV(Math.min(b + 16, x1 - 40), y0, y0 + off, `W = ${s.W} ft`);
      g.dimH(a, b, y0 + off + 40, `L = ${req} ft (${(req / s.W).toFixed(1)}:1)`);
    }
    g.text(x0, 24, eq, 't t-b');

    return {
      svg: g,
      legend: ui.legend([['pave', 'Pavement'], ['ok', 'Taper']]),
      results: R,
      basis: [
        ['Lane transition', 'TSTS §2.3.11: L = WS²/60 for S ≤ 40 mph; L = WS for S > 40 mph. W = lateral offset (ft); S = design speed (mph). TDOT uses the same formulas with the break at 45 mph; results match at 5-mph design speeds. Lengths are rounded up to the next foot.'],
        ['Turn-lane bay', 'TDOT HSAM Figure 3-21: L = WS/3, minimum rate 8:1 (low speed), maximum 15:1 (higher speed). Departure taper may not be sharper than the approach taper.'],
        ['Lane drop', 'TDOT HSAM Figure 3-22 / RDG §2-601: extend the added lane X = 750 ft + d past the intersection, where d is the MUTCD Table 2C-3 Condition A advance placement distance; then merge with L = WS or WS²/60.']
      ]
    };
  }
});
