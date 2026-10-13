/* Storm pipe check: TSTS minimums (Ch. 3 §3.2.1(3), Ch. 7 §7.3) and Manning capacity. */
FST.card({
  id: 'pipe', tab: 'drain',
  title: 'Storm sewer pipe',
  intro: 'Checks one pipe run against the TSTS minimum size, slope and cover, the no-downsizing rule, and whether the design flow stays below the pipe crown.',
  cites: ['s3213', 's73', 's738', 's76', 'hec22m'],
  defaults: () => ({ D: 18, up: 15, S: 1.0, Q: 6, cover: 36, angle: 90, row: true }),
  fields(c, s, set) {
    const u = c.ui;
    const sizes = [12, 15, 18, 21, 24, 27, 30, 36, 42, 48, 54, 60, 66, 72].map((d) => ({ value: d, label: `${d} in` }));
    return [
      u.select({ label: 'Pipe diameter', value: s.D, options: sizes, onChange: (v) => set('D', +v) }),
      u.select({ label: 'Upstream pipe diameter (largest entering)', value: s.up, options: [{ value: 0, label: 'None (first run)' }, ...sizes], onChange: (v) => set('up', +v) }),
      u.range({ label: 'Pipe slope', min: 0.1, max: 10, step: 0.05, value: s.S, unit: '%', onChange: (v) => set('S', v) }),
      u.range({ label: '10-year design flow in this run', min: 0.1, max: 150, step: 0.1, value: s.Q, unit: 'cfs', onChange: (v) => set('Q', v) }),
      u.range({ label: 'Cover to top of pavement (minimum along run)', min: 0, max: 120, step: 1, value: s.cover, unit: 'in', onChange: (v) => set('cover', v) }),
      u.range({ label: 'Angle between inflow and outlet direction at the upstream structure', min: 0, max: 180, step: 5, value: s.angle, unit: '°', onChange: (v) => set('angle', v), hint: '180° = straight through.' }),
      u.toggle({ label: 'Pipe is in public right-of-way or easement', checked: s.row, onChange: (v) => set('row', v) })
    ];
  },
  evaluate(c, s) {
    const { f, ui, C } = c;
    const P = C.pipe, R = [];
    const full = f.pipeFull(s.D, s.S / 100, P.manningN);
    const dep = f.pipeDepth(s.D, s.S / 100, P.manningN, s.Q);
    R.push(ui.check(s.D >= P.minDia, 'Minimum pipe size', `${P.minDia} in`, `${s.D} in`, ['s73']));
    R.push(ui.check(s.S >= P.minSlope, 'Minimum pipe slope', ui.pct(P.minSlope, 2), ui.pct(s.S, 2), ['s3213']));
    R.push(ui.check(s.cover >= P.minCover, 'Minimum cover to top of pavement', `${P.minCover} in`, `${s.cover} in`, ['s738']));
    if (s.up) R.push(ui.check(s.D >= s.up, 'No downsizing: downstream area ≥ upstream area', `≥ ${s.up} in`, `${s.D} in`, ['s3213']));
    R.push(ui.check(s.angle >= 90, 'Inflow may not enter at less than 90° to the outlet direction', '≥ 90°', `${s.angle}°`, ['s3213']));
    const fullOk = s.Q <= full.Q;
    R.push(ui.check(fullOk, '10-year flow below the inside crown (no surcharge)', `≤ ${ui.fmt(full.Q, 2)} cfs full-flow capacity`, `${ui.fmt(s.Q, 2)} cfs`, ['s3213', 'hec22m'],
      dep.surcharged ? 'Flow exceeds the maximum open-channel capacity — the pipe will surcharge.' : `Normal depth ${Math.round(dep.ratio * 100)}% of diameter, velocity ${ui.fmt(dep.V, 1)} ft/s. Confirm with an HGL analysis including junction losses and tailwater.`));
    if (s.row) R.push({ status: 'info', label: `Material in right-of-way: ${P.material}. Corrugated metal and PVC are prohibited; HDPE only outside the right-of-way (36 in max)`, cite: ['s73'] });
    R.push({ status: 'info', label: 'Pipe ends need a structure, endwall or safety end section; culverts under roads follow Table 3.1 (50-yr, 100-yr check). Bridges: low chord ≥ 1 ft above the 100-yr flood', cite: ['s3213', 's74', 's76', 'c31'] });

    // ---- Diagram: pipe section + cover profile ----
    const W = 640, H = 260;
    const g = ui.svg(W, H, 'Storm pipe section and cover',
      `${s.D}-inch pipe at ${s.S}% carrying ${s.Q} cfs; capacity ${full.Q.toFixed(1)} cfs. ${dep.surcharged ? 'Surcharged.' : `Flow depth ${Math.round(dep.ratio * 100)}% of diameter.`} Cover ${s.cover} inches.`);
    // Section
    const cx = 140, cy = 140, r = 80;
    g.add('circle', { cx, cy, r, class: 'pipe' });
    const ratio = dep.surcharged ? 1 : dep.ratio;
    const yW = cy + r - 2 * r * ratio;
    if (ratio >= 0.999) g.add('circle', { cx, cy, r: r - 2, class: 'water' });
    else {
      const half = Math.sqrt(Math.max(r * r - (yW - cy) * (yW - cy), 0));
      const large = ratio > 0.5 ? 1 : 0;
      g.add('path', { d: `M${cx - half},${yW} A${r},${r} 0 ${large} 0 ${cx + half},${yW} Z`, class: 'water' });
    }
    g.text(cx, cy - r - 14, `${s.D} in · ${dep.surcharged ? 'surcharged' : Math.round(ratio * 100) + '% full'}`, 't t-b', { 'text-anchor': 'middle' });
    g.text(cx, cy + r + 22, `Q ${ui.fmt(s.Q, 1)} of ${ui.fmt(full.Q, 1)} cfs`, 't t-sm', { 'text-anchor': 'middle' });
    // Cover sketch
    const px = 320, ground = 60, sc = 1.4;
    g.rect(px, ground - 10, 290, 10, 'pave');
    g.text(px + 4, ground - 16, 'Top of pavement', 't t-sm');
    const pipeTop = ground + s.cover * sc;
    const dpx = Math.max(s.D * sc * 0.6, 10);
    g.rect(px + 30, pipeTop, 230, dpx, 'pave-2', { rx: dpx / 2 });
    g.line(px + 20, ground + P.minCover * sc, px + 280, ground + P.minCover * sc, 'req');
    g.text(px + 282, ground + P.minCover * sc + 4, `${P.minCover} in min`, 't t-sm');
    g.dimV(px + 270, ground, pipeTop, `${s.cover} in`);
    g.text(px, 238, `Slope ${s.S}% ${s.S >= P.minSlope ? '✓' : '✕'} · Cover ${s.cover >= P.minCover ? '✓' : '✕'} · Size ${s.D >= P.minDia ? '✓' : '✕'}`, 't t-b');

    return {
      svg: g,
      legend: ui.legend([['water', 'Design flow'], ['req', 'Minimum cover line']]),
      results: R,
      basis: [
        ['TSTS minimums', 'Ch. 7 §7.3: 15 in minimum for side drains and storm sewers; RCP Class III in right-of-way; §7.3.8: 24 in cover to top of pavement. Ch. 3 §3.2.1(3): 0.50% minimum slope; 10-yr flow not above the inside crown and no hydraulic jump; downstream area ≥ upstream; inflow ≥ 90° to the outlet.'],
        ['Capacity', `Manning: Q = (1.49/n)·A·R^(2/3)·S^(1/2), n = ${P.manningN} (concrete pipe). Normal depth found by iteration on the circular section.`],
        ['Limits of this check', 'A single-run normal-depth check. The full storm sewer design still needs an HGL analysis with junction losses and tailwater (HEC-22).']
      ]
    };
  }
});
