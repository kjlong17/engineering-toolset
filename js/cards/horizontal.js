/* Horizontal curve: minimum radius, tangents, compound ratio, small-deflection arc length, sightline offset. */
FST.card({
  id: 'horizontal', tab: 'align',
  title: 'Horizontal curve',
  intro: 'Checks curve radius, tangents between curves, compound-curve ratio, minimum arc length for small deflections, and the clear sightline needed on the inside of the curve.',
  cites: ['t232', 't232b', 't234', 's238', 's2388', 'gbHc', 'gbHso'],
  defaults: (c) => ({ V: c.cls.designSpeed, R: c.cls.rmin.nc, e: 'nc', delta: 40, pair: 'reverse', T: c.cls.minTangent, R2: 0, use: 'res', M: 20 }),
  fields(c, s, set) {
    const u = c.ui, cls = c.cls;
    const eOpts = [{ value: 'nc', label: 'Normal crown (no superelevation)' }];
    if (cls.superAllowed) eOpts.push({ value: 'e02', label: 'Superelevated 0.02 ft/ft' }, { value: 'e04', label: 'Superelevated 0.04 ft/ft' });
    return [
      u.range({ label: 'Design speed', min: 15, max: 60, step: 5, value: s.V, unit: 'mph', onChange: (v) => set('V', v) }),
      u.range({ label: 'Centerline radius on plans', min: 30, max: 3000, step: 1, value: s.R, unit: 'ft', onChange: (v) => set('R', v) }),
      u.select({ label: 'Cross slope through the curve', options: eOpts, value: s.e, onChange: (v) => set('e', v), hint: cls.superAllowed ? 'Superelevation is limited to 4% on arterials and collectors (§2.3.8(8)).' : 'Superelevation is not allowed on local streets or alleys.' }),
      u.range({ label: 'Deflection angle (Δ)', min: 1, max: 120, step: 1, value: s.delta, unit: '°', onChange: (v) => set('delta', v) }),
      u.group('Tangent to the next curve',
        u.segmented({ label: 'Next curve is', value: s.pair, onChange: (v) => set('pair', v), options: [
          { value: 'reverse', label: 'Reverse' }, { value: 'broken', label: 'Same direction' }, { value: 'intersection', label: 'Intersection (minor leg)' }] }),
        u.range({ label: 'Tangent length on plans', min: 0, max: 600, step: 5, value: s.T, unit: 'ft', onChange: (v) => set('T', v) })),
      u.range({ label: 'Compound curve: other radius (0 = none)', min: 0, max: 3000, step: 1, value: s.R2, unit: 'ft', onChange: (v) => set('R2', v) }),
      u.segmented({ label: 'Adjacent land use (for arc length)', value: s.use, onChange: (v) => set('use', v), options: [{ value: 'res', label: 'Residential' }, { value: 'com', label: 'Commercial / industrial' }] }),
      u.range({ label: 'Clear distance to nearest obstruction inside the curve', min: 0, max: 80, step: 1, value: s.M, unit: 'ft', onChange: (v) => set('M', v), hint: 'Measured from the centerline of the inside lane to a wall, fence, building or dense planting.' })
    ];
  },
  evaluate(c, s) {
    const { f, ui, cls, C } = c;
    const R = [];
    const eVal = { nc: C.gb.ncSlope, e02: 0.02, e04: 0.04 }[s.e];
    const atClass = s.V === cls.designSpeed;
    const rTsts = atClass ? cls.rmin[s.e] : null;
    const rGB = Math.round(f.rmin(s.V, eVal));
    const rReq = Math.max(rGB, rTsts || 0);

    if (s.e !== 'nc' && !cls.superAllowed) {
      R.push({ status: 'fail', label: 'Superelevation is not allowed on this classification', cite: ['t232', 's2388'] });
    }
    R.push(ui.check(s.R >= rReq, 'Minimum centerline radius', ui.ft(rReq), ui.ft(s.R), ['t232', 'gbHc'],
      `TSTS ${rTsts ? ui.ft(rTsts) : 'n/a at this speed'}; AASHTO ${ui.ft(rGB)} (e = ${eVal}, f = ${f.fFor(s.V).toFixed(2)}).`));
    if (rTsts != null && rTsts < rGB) {
      R.push({ status: 'note', label: `TSTS minimum radius (${rTsts} ft) is below the AASHTO value (${rGB} ft) — AASHTO governs`, cite: ['t232b', 's15'] });
    }
    if (s.e !== 'nc' && s.V <= 30) {
      R.push({ status: 'note', label: 'Superelevation is not typically used at design speeds of 30 mph or less', cite: ['s2388'] });
    }
    if (s.e !== 'nc' && s.V >= 50) {
      R.push({ status: 'note', label: 'At 50 mph and above, AASHTO distributes e and f by Method 5 — check radii for e below emax against GB §3.3 superelevation tables', cite: ['gbHc'] });
    }
    if (s.e !== 'nc') {
      R.push({ status: 'info', label: 'Use the TDOT 50/50 split of the superelevation transition about the tangent point; gutters must be inflow type', cite: ['s2388'] });
    }

    const tReq = s.pair === 'broken' ? 2 * cls.minTangent : cls.minTangent;
    const tLabel = { reverse: 'Tangent between reverse curves', broken: 'Tangent between same-direction (broken-back) curves', intersection: 'Tangent on minor leg at intersection' }[s.pair];
    R.push(ui.check(s.T >= tReq, tLabel, ui.ft(tReq), ui.ft(s.T), ['t232', 's238'], s.pair === 'intersection' ? 'Measured from the nearest gutter flow line of the intersected street to the PC. Departure angle may not exceed 10° along the tangent.' : null));

    if (s.R2 > 0) {
      const ratio = Math.max(s.R, s.R2) / Math.min(s.R, s.R2);
      R.push({ status: ratio <= 1.5 ? 'pass' : 'note', label: 'Compound curve radius ratio (preferably ≤ 1.5)', required: '≤ 1.5', provided: ui.fmt(ratio, 2), cite: ['s238'] });
    }
    const arc = (s.R * s.delta * Math.PI) / 180;
    if (s.delta <= 10) {
      const aReq = cls.arc[s.use];
      R.push(ui.check(arc >= aReq, 'Minimum arc length for a deflection of 10° or less', ui.ft(aReq), ui.ft(arc), ['t234']));
    }
    const sGB = f.ssdDesign(s.V);
    const S = Math.max(sGB, atClass ? cls.ssd : 0);
    const mReq = f.hso(s.R, S);
    R.push(ui.check(s.M >= mReq, 'Horizontal sightline offset (stopping sight distance)', ui.ft(mReq, 1), ui.ft(s.M), ['gbHso'],
      `For SSD = ${S} ft on R = ${s.R} ft. Keep this band clear above 2 ft; a sight distance easement may be needed (§2.3.10(3)).`));

    // ---- Diagram: plan view ----
    const W = 640, H = 300;
    const d = Math.min(Math.max(s.delta, 4), 150) * Math.PI / 180;
    const chordPx = 380;
    const Rpx = Math.min(chordPx / (2 * Math.sin(d / 2)), 1600);
    const scale = Rpx / s.R; // px per ft
    const cx = 320, cy = 70 + Rpx;
    const P = (th, r = Rpx) => [cx + r * Math.cos(th), cy - r * Math.sin(th)];
    const a0 = Math.PI / 2 + d / 2, a1 = Math.PI / 2 - d / 2;
    const ok = s.R >= rReq;
    const g = ui.svg(W, H, 'Plan view of horizontal curve',
      `Curve of radius ${s.R} feet deflecting ${s.delta} degrees. Minimum radius ${rReq} feet. Required clear sightline ${mReq.toFixed(1)} feet; ${s.M} feet provided.`);
    const arcPath = (r) => { const p0 = P(a0, r), p1 = P(a1, r); return `M${p0[0]},${p0[1]} A${r},${r} 0 0 1 ${p1[0]},${p1[1]}`; };
    // tangents
    const tan = 120;
    const pc = P(a0), pt = P(a1);
    // Direction of travel along the arc is (sin θ, cos θ) in SVG coordinates.
    const back0 = [pc[0] - Math.sin(a0) * tan, pc[1] - Math.cos(a0) * tan];
    const fwd1 = [pt[0] + Math.sin(a1) * tan, pt[1] + Math.cos(a1) * tan];
    // sight band (inside of curve)
    const mPx = Math.min(mReq * scale, Rpx * 0.9);
    g.add('path', { d: `${arcPath(Rpx)} L${P(a1, Rpx - mPx)[0]},${P(a1, Rpx - mPx)[1]} A${Rpx - mPx},${Rpx - mPx} 0 0 0 ${P(a0, Rpx - mPx)[0]},${P(a0, Rpx - mPx)[1]} Z`, class: 'tri' });
    g.path(arcPath(Rpx - mPx), 'req');
    // road
    g.path(`M${back0[0]},${back0[1]} L${pc[0]},${pc[1]}`, 'road');
    g.path(arcPath(Rpx), ok ? 'ok' : 'bad');
    g.path(`M${pt[0]},${pt[1]} L${fwd1[0]},${fwd1[1]}`, 'road');
    for (const [p, lab] of [[pc, 'PC'], [pt, 'PT']]) { g.add('circle', { cx: p[0], cy: p[1], r: 3.5, class: 'pt' }); g.text(p[0], p[1] - 10, lab, 't t-sm', { 'text-anchor': 'middle' }); }
    // obstruction at mid-curve
    const obs = P(Math.PI / 2, Rpx - Math.min(s.M * scale, Rpx * 0.95));
    g.rect(obs[0] - 6, obs[1] - 6, 12, 12, s.M >= mReq ? 'ok-fill' : 'hazard');
    g.text(obs[0] + 12, obs[1] + 4, `Obstruction at ${s.M} ft`, 't t-sm');
    // radius callout
    const top = P(Math.PI / 2);
    g.line(top[0], top[1], top[0], Math.min(cy, H - 30), 'dim');
    g.text(top[0] + 8, Math.min(cy, H - 30) - 4, cy > H - 30 ? `R = ${s.R} ft (to center, off sheet)` : `R = ${s.R} ft`, 't t-sm');
    g.text(20, 22, `R = ${s.R} ft · minimum ${rReq} ft · Δ = ${s.delta}° · arc ${ui.fmt(arc, 0)} ft`, 't t-b');
    g.text(20, 40, `Clear sightline band: ${mReq.toFixed(1)} ft required`, 't t-sm');

    return {
      svg: g,
      legend: ui.legend([[ok ? 'ok' : 'bad', 'Curve (meets / below minimum radius)'], ['tri', 'Sightline band to keep clear'], ['req', 'Inside edge of band']]),
      results: R,
      basis: [
        ['Minimum radius', `AASHTO R = V² / [15(e + f)]. Normal crown uses e = −0.02 (adverse crown). Side friction f uses AASHTO low-speed urban values for ≤ 45 mph. TSTS Table 2.3(2) values are shown when the design speed matches the classification.`],
        ['Tangents', `Table 2.3(2) minimum tangent: ${cls.minTangent} ft. Same-direction curves need 2× (§2.3.8(2)(c)).`],
        ['Small deflections', `Table 2.3(4): Local residential 100 ft, local commercial 200 ft, minor collector 250 ft, major collector 250/300 ft, minor arterial 300 ft, major arterial 400 ft.`],
        ['Sightline offset', 'AASHTO HSO = R[1 − cos(28.65·S/R)], with R to the centerline of the inside lane and S = stopping sight distance.']
      ]
    };
  }
});
