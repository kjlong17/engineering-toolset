/* Storm pipe sizing: TSTS minimums (Ch. 3 §3.2.1(3), Ch. 7 §7.3) and Manning capacity. */
FST.card({
  id: 'pipe', tab: 'drain',
  title: 'Storm sewer pipe',
  intro: 'For a 10-year design flow and pipe slope, gives the smallest standard pipe that keeps the flow below the crown, with its capacity, depth and velocity, and the TSTS minimum size, slope and cover.',
  cites: ['s3213', 's73', 's738', 's76', 'hec22m'],
  defaults: () => ({ Q: 6, S: 1.0, up: 0, row: true }),
  fields(c, s, set) {
    const u = c.ui;
    const sizes = c.C.pipe.sizes.map((d) => ({ value: d, label: `${d} in` }));
    return [
      u.range({ label: '10-year design flow in this run', min: 0.1, max: 150, step: 0.1, value: s.Q, unit: 'cfs', onChange: (v) => set('Q', v) }),
      u.range({ label: 'Pipe slope', min: c.C.pipe.minSlope, max: 10, step: 0.05, value: s.S, unit: '%', onChange: (v) => set('S', v), hint: `TSTS minimum ${c.C.pipe.minSlope}%.` }),
      u.select({ label: 'Largest pipe entering upstream', value: s.up, options: [{ value: 0, label: 'None (first run)' }, ...sizes], onChange: (v) => set('up', +v), hint: 'Pipes may not be downsized downstream.' }),
      u.toggle({ label: 'Pipe is in public right-of-way or easement', checked: s.row, onChange: (v) => set('row', v) })
    ];
  },
  evaluate(c, s) {
    const { f, ui, C } = c;
    const P = C.pipe, R = [];
    const S = Math.max(s.S, P.minSlope) / 100;
    const minD = Math.max(P.minDia, s.up || 0);
    const D = f.pipeSize(s.Q, S, P.manningN, minD);
    if (D == null) {
      R.push(ui.note(`No standard size up to ${P.sizes[P.sizes.length - 1]} in carries ${ui.fmt(s.Q, 1)} cfs at ${ui.pct(S * 100)} — use a box culvert, parallel pipes or a steeper slope`, ['s3213', 'hec22m']));
    }
    const Dd = D ?? P.sizes[P.sizes.length - 1];
    const full = f.pipeFull(Dd, S, P.manningN);
    const dep = f.pipeDepth(Dd, S, P.manningN, s.Q);
    if (D != null) {
      R.push(ui.val('Pipe diameter', `${D} in`, ['s3213', 's73', 'hec22m'],
        `Smallest standard size ≥ ${minD} in${s.up && s.up >= P.minDia ? ' (no downsizing from the upstream pipe)' : ` (TSTS ${P.minDia} in minimum)`} whose full-flow capacity carries the 10-year flow.`));
      R.push(ui.val('Full-flow capacity', `${ui.fmt(full.Q, 2)} cfs`, ['hec22m'], `Manning n = ${P.manningN}, S = ${ui.pct(S * 100)}. Full-flow velocity ${ui.fmt(full.V, 1)} ft/s.`));
      if (!dep.surcharged) R.push(ui.val('Normal depth and velocity at the design flow', `${Math.round(dep.ratio * 100)}% of diameter, ${ui.fmt(dep.V, 1)} ft/s`, ['hec22m'], 'Confirm with an HGL analysis including junction losses and tailwater.'));
    }
    R.push(ui.val('Minimum pipe size', `${P.minDia} in`, ['s73'], 'Side drains and storm sewers.'));
    R.push(ui.val('Minimum pipe slope', ui.pct(P.minSlope, 2), ['s3213']));
    R.push(ui.val('Minimum cover to top of pavement', `${P.minCover} in`, ['s738']));
    R.push(ui.val('Inflow angle at a structure', '90° or more to the outlet direction', ['s3213'], 'No hydraulic jump in the pipe.'));
    if (s.row) R.push(ui.val('Material in right-of-way', P.material, ['s73'], 'Corrugated metal and PVC are prohibited; HDPE only outside the right-of-way (36 in max).'));
    R.push(ui.info('Pipe ends need a structure, endwall or safety end section; culverts under roads follow Table 3.1 (50-yr, 100-yr check). Bridges: low chord ≥ 1 ft above the 100-yr flood', ['s3213', 's74', 's76', 'c31']));

    // ---- Diagram: pipe section + cover sketch ----
    const W = 640, H = 260;
    const g = ui.svg(W, H, 'Storm pipe section and cover',
      `${Dd}-inch pipe at ${ui.fmt(S * 100, 2)}% carrying ${s.Q} cfs; capacity ${full.Q.toFixed(1)} cfs. ${dep.surcharged ? 'Surcharged.' : `Flow depth ${Math.round(dep.ratio * 100)}% of diameter.`} Minimum cover ${P.minCover} inches.`);
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
    g.text(cx, cy - r - 14, `${Dd} in · ${dep.surcharged ? 'surcharged' : Math.round(ratio * 100) + '% full'}`, 't t-b', { 'text-anchor': 'middle' });
    g.text(cx, cy + r + 22, `Q ${ui.fmt(s.Q, 1)} of ${ui.fmt(full.Q, 1)} cfs`, 't t-sm', { 'text-anchor': 'middle' });
    const px = 320, ground = 60, sc = 1.4;
    g.rect(px, ground - 10, 290, 10, 'pave');
    g.text(px + 4, ground - 16, 'Top of pavement', 't t-sm');
    const pipeTop = ground + P.minCover * sc;
    const dpx = Math.max(Dd * sc * 0.6, 10);
    g.rect(px + 30, pipeTop, 230, dpx, 'pave-2', { rx: dpx / 2 });
    g.line(px + 20, pipeTop, px + 280, pipeTop, 'req');
    g.dimV(px + 150, ground, pipeTop, `${P.minCover} in min cover`);
    g.text(px, 238, `Minimum ${P.minDia} in · ${ui.pct(P.minSlope, 2)} · ${P.minCover} in cover`, 't t-b');

    return {
      svg: g,
      legend: ui.legend([['water', 'Design flow'], ['req', 'Minimum cover line']]),
      results: R,
      basis: [
        ['TSTS minimums', 'Ch. 7 §7.3: 15 in minimum for side drains and storm sewers; RCP Class III in right-of-way; §7.3.8: 24 in cover to top of pavement. Ch. 3 §3.2.1(3): 0.50% minimum slope; 10-yr flow not above the inside crown and no hydraulic jump; downstream area ≥ upstream; inflow ≥ 90° to the outlet.'],
        ['Sizing', `Smallest standard RCP size (${P.sizes.join(', ')} in) whose Manning full-flow capacity Q = (1.49/n)·A·R^(2/3)·S^(1/2) ≥ the 10-year flow, n = ${P.manningN}. Normal depth found by iteration on the circular section.`],
        ['Limits', 'A single-run normal-depth sizing. The full storm sewer design still needs an HGL analysis with junction losses and tailwater (HEC-22).']
      ]
    };
  }
});
