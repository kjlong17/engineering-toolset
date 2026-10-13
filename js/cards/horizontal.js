/* Horizontal curve: minimum radius, tangents, compound ratio, small-deflection arc length, curve elements, sightline offset. */
FST.card({
  id: 'horizontal', tab: 'align',
  title: 'Horizontal curve',
  intro: 'For a design speed, cross slope and deflection, gives the minimum radius, the minimum tangent to the next curve, the curve elements, and the clear sightline needed on the inside of the curve.',
  cites: ['t232', 't232b', 't234', 's238', 's2388', 'gbHc', 'gbHso'],
  defaults: (c) => ({ V: c.cls.designSpeed, e: 'nc', delta: 40, pair: 'reverse', use: 'res', R: 0, compound: false }),
  fields(c, s, set) {
    const u = c.ui, cls = c.cls;
    const eOpts = [{ value: 'nc', label: 'Normal crown (no superelevation)' }];
    if (cls.superAllowed) eOpts.push({ value: 'e02', label: 'Superelevated 0.02 ft/ft' }, { value: 'e04', label: 'Superelevated 0.04 ft/ft' });
    return [
      u.range({ label: 'Design speed', min: 15, max: 60, step: 5, value: s.V, unit: 'mph', onChange: (v) => set('V', v) }),
      u.select({ label: 'Cross slope through the curve', options: eOpts, value: s.e, onChange: (v) => set('e', v), hint: cls.superAllowed ? 'Superelevation is limited to 4% on arterials and collectors (§2.3.8(8)).' : 'Superelevation is not allowed on local streets or alleys.' }),
      u.range({ label: 'Deflection angle (Δ)', min: 1, max: 120, step: 1, value: s.delta, unit: '°', onChange: (v) => set('delta', v) }),
      u.segmented({ label: 'Adjacent land use (for small deflections)', value: s.use, onChange: (v) => set('use', v), options: [{ value: 'res', label: 'Residential' }, { value: 'com', label: 'Commercial / industrial' }] }),
      u.segmented({ label: 'Next curve or feature', value: s.pair, onChange: (v) => set('pair', v), options: [
        { value: 'reverse', label: 'Reverse curve' }, { value: 'broken', label: 'Same-direction curve' }, { value: 'intersection', label: 'Intersection (minor leg)' }] }),
      u.toggle({ label: 'Part of a compound curve', checked: s.compound, onChange: (v) => set('compound', v) }),
      u.range({ label: 'Design radius for curve elements (0 = minimum)', min: 0, max: 3000, step: 5, value: s.R, unit: 'ft', onChange: (v) => set('R', v), hint: 'A radius below the minimum is replaced by the minimum.' })
    ];
  },
  evaluate(c, s) {
    const { f, ui, cls, C } = c;
    const R = [];
    const eVal = { nc: C.gb.ncSlope, e02: 0.02, e04: 0.04 }[s.e];
    const atClass = s.V === cls.designSpeed;
    const rTsts = atClass ? cls.rmin[s.e] : null;
    const rGB = Math.round(f.rmin(s.V, eVal));
    const rSpeed = Math.max(rGB, rTsts || 0);
    // Small deflections: the minimum arc length sets a minimum radius of its own.
    const aReq = s.delta <= 10 ? cls.arc[s.use] : null;
    const rArc = aReq ? Math.ceil((aReq * 180) / (Math.PI * s.delta)) : 0;
    const rMin = Math.max(rSpeed, rArc);
    const Rd = Math.max(s.R || 0, rMin);

    R.push(ui.val('Minimum centerline radius', ui.ft(rMin), rArc > rSpeed ? ['t234', 't232'] : ['t232', 'gbHc'],
      `For speed: TSTS ${rTsts ? ui.ft(rTsts) : 'n/a at this speed'}; AASHTO ${ui.ft(rGB)} (e = ${eVal}, f = ${f.fFor(s.V).toFixed(2)}).${aReq ? ` For Δ = ${s.delta}°: ${ui.ft(rArc)} to give the ${aReq} ft minimum arc length.` : ''}`));
    if (rTsts != null && rTsts < rGB) R.push(ui.note(`TSTS minimum radius (${rTsts} ft) is below the AASHTO value (${rGB} ft) — AASHTO governs`, ['t232b', 's15']));
    if (aReq) R.push(ui.val(`Minimum arc length (Δ ≤ 10°, ${s.use === 'res' ? 'residential' : 'commercial / industrial'})`, ui.ft(aReq), ['t234']));
    if (s.e !== 'nc' && s.V <= 30) R.push(ui.note('Superelevation is not typically used at design speeds of 30 mph or less', ['s2388']));
    if (s.e !== 'nc' && s.V >= 50) R.push(ui.note('At 50 mph and above, AASHTO distributes e and f by Method 5 — for radii above the minimum, take e from the GB §3.3 superelevation tables', ['gbHc']));
    if (s.e !== 'nc') R.push(ui.info('Use the TDOT 50/50 split of the superelevation transition about the tangent point; gutters must be inflow type', ['s2388']));

    const tReq = s.pair === 'broken' ? 2 * cls.minTangent : cls.minTangent;
    const tLabel = { reverse: 'Minimum tangent between reverse curves', broken: 'Minimum tangent between same-direction (broken-back) curves', intersection: 'Minimum tangent on the minor leg at an intersection' }[s.pair];
    R.push(ui.val(tLabel, ui.ft(tReq), ['t232', 's238'], s.pair === 'intersection' ? 'Measured from the nearest gutter flow line of the intersected street to the PC. Departure angle may not exceed 10° along the tangent.' : null));
    if (s.compound) R.push(ui.val('Other radius of the compound curve (ratio ≤ 1.5 preferred)', `${ui.fmt(Math.ceil(Rd / 1.5))}–${ui.fmt(Math.floor(Rd * 1.5))} ft`, ['s238'], `For a ${ui.ft(Rd)} radius, and never below the ${ui.ft(rMin)} minimum.`));

    const hc = f.hcurve(Rd, s.delta);
    R.push(ui.val('Curve elements', `R ${ui.fmt(Rd)} · T ${ui.fmt(hc.T, 2)} · L ${ui.fmt(hc.L, 2)} ft`, ['gbHc'],
      `External E = ${ui.fmt(hc.E, 2)} ft; middle ordinate M = ${ui.fmt(hc.M, 2)} ft; long chord LC = ${ui.fmt(hc.LC, 2)} ft.${s.R && s.R < rMin ? ' The entered radius is below the minimum, so the minimum is used.' : ''}`));
    const sGB = f.ssdDesign(s.V);
    const S = Math.max(sGB, atClass ? cls.ssd : 0);
    const mReq = f.hso(Rd, S);
    R.push(ui.val('Horizontal sightline offset to keep clear', ui.ft(mReq, 1), ['gbHso'],
      `For SSD = ${S} ft on R = ${ui.fmt(Rd)} ft, measured from the centerline of the inside lane. Keep this band clear above 2 ft; a sight distance easement may be needed (§2.3.10(3)).`));

    // ---- Diagram: plan view ----
    const W = 640, H = 300;
    const d = Math.min(Math.max(s.delta, 4), 150) * Math.PI / 180;
    const chordPx = 380;
    const Rpx = Math.min(chordPx / (2 * Math.sin(d / 2)), 1600);
    const scale = Rpx / Rd; // px per ft
    const cx = 320, cy = 70 + Rpx;
    const P = (th, r = Rpx) => [cx + r * Math.cos(th), cy - r * Math.sin(th)];
    const a0 = Math.PI / 2 + d / 2, a1 = Math.PI / 2 - d / 2;
    const g = ui.svg(W, H, 'Plan view of horizontal curve',
      `Curve of radius ${Rd} feet deflecting ${s.delta} degrees; minimum radius ${rMin} feet. Clear sightline band ${mReq.toFixed(1)} feet on the inside of the curve.`);
    const arcPath = (r) => { const p0 = P(a0, r), p1 = P(a1, r); return `M${p0[0]},${p0[1]} A${r},${r} 0 0 1 ${p1[0]},${p1[1]}`; };
    const tan = 120;
    const pc = P(a0), pt = P(a1);
    // Direction of travel along the arc is (sin θ, cos θ) in SVG coordinates.
    const back0 = [pc[0] - Math.sin(a0) * tan, pc[1] - Math.cos(a0) * tan];
    const fwd1 = [pt[0] + Math.sin(a1) * tan, pt[1] + Math.cos(a1) * tan];
    const mPx = Math.min(mReq * scale, Rpx * 0.9);
    g.add('path', { d: `${arcPath(Rpx)} L${P(a1, Rpx - mPx)[0]},${P(a1, Rpx - mPx)[1]} A${Rpx - mPx},${Rpx - mPx} 0 0 0 ${P(a0, Rpx - mPx)[0]},${P(a0, Rpx - mPx)[1]} Z`, class: 'tri' });
    g.path(arcPath(Rpx - mPx), 'req');
    g.path(`M${back0[0]},${back0[1]} L${pc[0]},${pc[1]}`, 'road');
    g.path(arcPath(Rpx), 'ok');
    g.path(`M${pt[0]},${pt[1]} L${fwd1[0]},${fwd1[1]}`, 'road');
    for (const [p, lab] of [[pc, 'PC'], [pt, 'PT']]) { g.add('circle', { cx: p[0], cy: p[1], r: 3.5, class: 'pt' }); g.text(p[0], p[1] - 10, lab, 't t-sm', { 'text-anchor': 'middle' }); }
    const top = P(Math.PI / 2);
    g.line(top[0], top[1], top[0], Math.min(cy, H - 30), 'dim');
    g.text(top[0] + 8, Math.min(cy, H - 30) - 4, cy > H - 30 ? `R = ${Rd} ft (to center, off sheet)` : `R = ${Rd} ft`, 't t-sm');
    g.text(20, 22, `R = ${Rd} ft (minimum ${rMin}) · Δ = ${s.delta}° · T = ${ui.fmt(hc.T, 1)} ft · L = ${ui.fmt(hc.L, 1)} ft`, 't t-b');
    g.text(20, 40, `Clear sightline band: ${mReq.toFixed(1)} ft`, 't t-sm');

    return {
      svg: g,
      legend: ui.legend([['ok', 'Design curve'], ['tri', 'Sightline band to keep clear'], ['req', 'Inside edge of band']]),
      results: R,
      basis: [
        ['Minimum radius', 'AASHTO R = V² / [15(e + f)]. Normal crown uses e = −0.02 (adverse crown). Side friction f uses AASHTO low-speed urban values for ≤ 45 mph. TSTS Table 2.3(2) values apply when the design speed matches the classification; the larger governs.'],
        ['Tangents', `Table 2.3(2) minimum tangent: ${cls.minTangent} ft. Same-direction curves need 2× (§2.3.8(2)(c)). Compound curve radius ratio preferably ≤ 1.5 (§2.3.8).`],
        ['Small deflections', 'Table 2.3(4) minimum arc length for Δ ≤ 10°: local residential 100 ft, local commercial 200 ft, minor collector 250 ft, major collector 250/300 ft, minor arterial 300 ft, major arterial 400 ft. Radius = arc × 180 / (π·Δ).'],
        ['Curve elements', 'T = R·tan(Δ/2); L = R·Δ (radians); E = R[sec(Δ/2) − 1]; M = R[1 − cos(Δ/2)]; LC = 2R·sin(Δ/2).'],
        ['Sightline offset', 'AASHTO HSO = R[1 − cos(28.65·S/R)], with R to the centerline of the inside lane and S = stopping sight distance.']
      ]
    };
  }
});
