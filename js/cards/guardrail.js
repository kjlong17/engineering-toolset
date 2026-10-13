/* Guardrail need: clear zone (TDOT S-CZ-1), barrier warrants (TDOT RDG §2-302), length of need (TDOT S-PL-1). */
FST.card({
  id: 'guardrail', tab: 'road',
  title: 'Guardrail need and length of need',
  intro: 'Decides whether a slope or roadside object needs shielding, and if so how much barrier is needed ahead of it. Low-speed curbed streets use a lateral offset check instead of a clear zone.',
  cites: ['s2318', 's2319', 's78', 's74', 'scz1', 'rdg302', 'rdg30205', 'spl1'],
  defaults: (c) => ({ curbed: c.cls.group !== 'arterial', V: c.cls.designSpeed, posted: c.cls.posted, adt: '>6000', slope: 'f4', fill: 6, fillLen: 150,
    hazard: 'object', offset: 8, extent: 6, curveR: 0, L2: 6, adtLon: 1, wall: false, offsetCurb: 2 }),
  fields(c, s, set) {
    const u = c.ui;
    const f = [
      u.toggle({ label: 'Curbed street with posted speed 45 mph or less', checked: s.curbed, onChange: (v) => set('curbed', v, { rebuild: true }), hint: 'TDOT S-CZ-1: clear zone distances do not apply to low-speed curbed urban streets; a lateral offset applies instead.' }),
      u.range({ label: 'Design speed', min: 20, max: 70, step: 5, value: s.V, unit: 'mph', onChange: (v) => set('V', v) }),
      u.range({ label: 'Posted speed', min: 15, max: 65, step: 5, value: s.posted, unit: 'mph', onChange: (v) => set('posted', v) })
    ];
    if (s.curbed) {
      f.push(u.range({ label: 'Face of curb to nearest fixed object', min: 0, max: 12, step: 0.5, value: s.offsetCurb, unit: 'ft', onChange: (v) => set('offsetCurb', v) }));
    } else {
      f.push(
        u.select({ label: 'Design traffic (ADT)', value: s.adt, onChange: (v) => set('adt', v), options: FST.criteria.clearZone.adt.map((a) => ({ value: a, label: a.replace('<', 'Under ').replace('>', 'Over ') })) }),
        u.select({ label: 'Foreslope', value: s.slope, onChange: (v) => set('slope', v, { rebuild: true }), options: [
          { value: 'f6', label: '6:1 or flatter (recoverable)' }, { value: 'f4', label: '5:1 to 4:1 (recoverable)' },
          { value: 'f3', label: '3:1 (traversable, not recoverable)' }, { value: 'crit', label: 'Steeper than 3:1 (critical)' }] }),
        s.slope === 'crit' ? u.range({ label: 'Fill height (drop-off)', min: 0, max: 40, step: 0.5, value: s.fill, unit: 'ft', onChange: (v) => set('fill', v) }) : null,
        s.slope === 'crit' ? u.range({ label: 'Length of critical slope along the road', min: 0, max: 1000, step: 10, value: s.fillLen, unit: 'ft', onChange: (v) => set('fillLen', v) }) : null,
        u.select({ label: 'Roadside hazard', value: s.hazard, onChange: (v) => set('hazard', v, { rebuild: true }), options: [
          { value: 'none', label: 'None (slope only)' }, { value: 'object', label: 'Fixed object (tree ≥ 4 in, pole, headwall, wall end, pier)' },
          { value: 'water', label: 'Water, drop-off or other non-traversable feature' }] }),
        s.hazard !== 'none' ? u.range({ label: 'Edge of travel lane to front of hazard', min: 0, max: 50, step: 0.5, value: s.offset, unit: 'ft', onChange: (v) => set('offset', v) }) : null,
        s.hazard !== 'none' ? u.range({ label: 'Hazard depth away from road (back edge offset − front)', min: 0, max: 60, step: 0.5, value: s.extent, unit: 'ft', onChange: (v) => set('extent', v) }) : null,
        u.select({ label: 'Horizontal curve (outside of curve)', value: s.curveR, onChange: (v) => set('curveR', +v), options: [{ value: 0, label: 'Tangent or inside of curve' }, ...FST.criteria.kcz.rows.map((r) => ({ value: r[0], label: `R = ${r[0]} ft` }))] }),
        u.group('If shielded — length of need',
          u.range({ label: 'Edge of travel lane to face of barrier (L2)', min: 2, max: 30, step: 0.5, value: s.L2, unit: 'ft', onChange: (v) => set('L2', v) }),
          u.select({ label: 'ADT band for runout length', value: s.adtLon, onChange: (v) => set('adtLon', +v), options: FST.criteria.runout.adt.map((a, i) => ({ value: i, label: a.replace('<', 'Under ').replace('>', 'Over ') })) }))
      );
    }
    f.push(u.toggle({ label: 'A walk or path comes within 5 ft of the top of a retaining wall', checked: s.wall, onChange: (v) => set('wall', v) }));
    return f;
  },
  evaluate(c, s) {
    const { f, ui, C } = c;
    const R = [];
    let shield = false, lonVal = null, Lc = null, LR = null, LA = null;
    const verifyNote = 'TDOT drawing values transcribed for this draft; confirm against the S-CZ-1 / S-PL-1 sheets before public release.';

    if (s.curbed) {
      const tdotMin = C.clearZone.lowSpeedOffsetMin;
      R.push(ui.check(s.offsetCurb >= C.curbOffsetDesirable, 'Lateral offset, face of curb to fixed object (TSTS desirable minimum)', ui.ft(C.curbOffsetDesirable), ui.ft(s.offsetCurb, 1), ['s2318']));
      R.push({ status: s.offsetCurb >= tdotMin ? 'pass' : 'info', label: `TDOT low-speed urban lateral offset: ${tdotMin} ft minimum, ${C.clearZone.lowSpeedOffsetEnhanced} ft recommended`, provided: ui.ft(s.offsetCurb, 1), cite: ['scz1'], detail: 'Reference only on local streets; the TSTS governs outside State right-of-way (§1.8).' });
      if (s.posted <= C.barrierLowSpeedPosted) R.push({ status: 'info', label: `Barrier is typically not recommended on low-speed urban streets (posted ≤ ${C.barrierLowSpeedPosted} mph)`, cite: ['rdg30205'], detail: 'Remove, relocate or use breakaway hardware for objects instead.' });
      else R.push({ status: 'note', label: 'Posted speed above 35 mph — evaluate hazards with the clear zone method (turn off the curbed option) where curb does not redirect', cite: ['rdg30205'] });
    } else {
      const slopeKey = s.slope === 'f6' ? 'f6' : 'f4';
      const cz = f.clearZone(s.V, s.adt, slopeKey);
      const kcz = f.kcz(s.V, s.curveR);
      Lc = Math.round(cz.high * kcz * 10) / 10;
      R.push({ status: 'info', label: `Clear zone: ${ui.ft(Lc, 1)}${kcz > 1 ? ` (${cz.high} × Kcz ${kcz} on outside of curve)` : ''}`, detail: `S-CZ-1 range ${cz.low}–${cz.high} ft for ${cz.band} mph, ADT ${s.adt}, ${slopeKey === 'f6' ? '6:1 or flatter' : '5:1 to 4:1'} foreslope; upper value used.`, cite: ['scz1'] });
      if (s.slope === 'f3') R.push({ status: 'note', label: '3:1 slope is not recoverable — the clear zone extends to the toe, with a 10 ft clear runout area desired at the bottom', cite: ['rdg302', 'scz1'] });
      if (s.slope === 'crit') {
        const exempt = s.fillLen < C.criticalFillExemption.length && s.fill < C.criticalFillExemption.drop;
        if (exempt) R.push({ status: 'pass', label: `Critical slope shorter than ${C.criticalFillExemption.length} ft with less than ${C.criticalFillExemption.drop} ft drop — barrier not recommended`, cite: ['rdg30205'] });
        else { shield = true; R.push({ status: 'fail', label: 'Critical fill slope (steeper than 3:1) within the clear zone — barrier warranted (embankment warrant)', provided: `${s.fill} ft high, ${s.fillLen} ft long`, cite: ['rdg302'] }); }
      }
      if (s.hazard !== 'none') {
        const inside = s.offset < Lc;
        if (!inside) R.push({ status: 'pass', label: 'Hazard is outside the clear zone — no shielding needed', required: `≥ ${ui.ft(Lc, 1)}`, provided: ui.ft(s.offset, 1), cite: ['scz1'] });
        else {
          shield = true;
          R.push({ status: 'fail', label: s.hazard === 'object' ? 'Fixed object inside the clear zone' : 'Non-traversable hazard inside the clear zone', required: `≥ ${ui.ft(Lc, 1)}`, provided: ui.ft(s.offset, 1), cite: ['scz1', 'rdg302'],
            detail: 'In order: remove, relocate outside the clear zone, make breakaway or traversable, shield with barrier, or delineate (S-CZ-1 Figure A). Breakaway devices, traversable endwalls and trees under 4 in do not warrant barrier.' });
        }
      }
      if (shield) {
        if (s.V < C.lonMinSpeed) R.push({ status: 'note', label: `Length of need is not calculated below ${C.lonMinSpeed} mph — use engineering judgment`, cite: ['spl1'] });
        else {
          LR = f.runout(s.V, s.adtLon).LR;
          const back = s.hazard !== 'none' ? s.offset + s.extent : Lc;
          LA = Math.min(back, Math.max(Lc, C.lonLcMax[Math.min(70, Math.max(20, Math.round(s.V / 5) * 5))] || Lc));
          LA = Math.min(LA, Lc);
          lonVal = Math.ceil(f.lon(LA, s.L2, LR));
          R.push({ status: 'note', label: `Length of need ahead of the hazard (approach side): ${ui.ft(lonVal)}`, detail: `LON = (LA − L2)/(LA/LR) = (${ui.fmt(LA, 1)} − ${s.L2})/(${ui.fmt(LA, 1)}/${LR}). LA is limited to the clear zone. Length of need begins at the third post of the terminal. Add the far-side length for two-way traffic, measured from the centerline.`, cite: ['spl1'] });
          if (s.L2 > 0) R.push({ status: 'info', label: 'Keep about 5 ft of deflection space behind W-beam guardrail; use concrete barrier where the object is within 5 ft of the shoulder', cite: ['rdg302'] });
        }
        R.push({ status: 'info', label: 'Hardware: TDOT/FHWA crash-tested systems only; wood guardrail is prohibited; type and location approved by the agency', cite: ['s2318', 's2319'] });
      }
      R.push({ status: 'info', label: verifyNote, cite: ['scz1', 'spl1'] });
    }
    if (s.wall) R.push({ status: 'fail', label: 'Provide a pedestrian guard: path within 5 ft of the top of a retaining wall', cite: ['s78'] });
    R.push({ status: 'info', label: 'Culvert ends inside the clear zone need a safety end section or traversable endwall', cite: ['s74'] });

    // ---- Diagrams ----
    const W = 640, H = 300;
    const g = ui.svg(W, H, s.curbed ? 'Curbed street lateral offset (section)' : 'Clear zone section and barrier length of need',
      s.curbed ? `Object ${s.offsetCurb} feet behind face of curb; TSTS desirable minimum 2 feet.` :
        `Clear zone ${Lc} feet. ${shield ? `Shielding needed; length of need ${lonVal ?? 'not calculated'} feet.` : 'No shielding needed.'}`);
    if (s.curbed) {
      const sc = 22, x0 = 60, y = 150;
      g.rect(0, y, x0 + 100, 16, 'pave');
      g.rect(x0 + 100, y - 8, 14, 24, 'curb');
      g.rect(x0 + 114, y - 8, W, 8, 'grass');
      const fc = x0 + 100;
      g.add('path', { d: `M${fc},${y - 8} L${fc + C.curbOffsetDesirable * sc},${y - 8} L${fc + C.curbOffsetDesirable * sc},${y - 80} L${fc},${y - 80} Z`, class: 'req-fill' });
      g.line(fc + C.clearZone.lowSpeedOffsetMin * sc, y - 90, fc + C.clearZone.lowSpeedOffsetMin * sc, y, 'sight');
      g.text(fc + C.clearZone.lowSpeedOffsetMin * sc + 4, y - 94, 'TDOT 4 ft', 't t-sm');
      const ox = fc + s.offsetCurb * sc;
      g.rect(ox, y - 70, 10, 62, s.offsetCurb >= C.curbOffsetDesirable ? 'car' : 'hazard');
      g.dimH(fc, ox || fc + 1, y + 40, `${s.offsetCurb} ft to object`);
      g.text(fc + 4, y - 86, 'TSTS 2 ft min', 't t-sm');
      g.text(20, 24, 'Face of curb to fixed object (section)', 't t-b');
    } else {
      // Section (top) — clear zone shaded
      const x0 = 30, sc = Math.min(10, 520 / Math.max(Lc + 10, (s.offset + s.extent) + 10));
      const y = 70;
      g.rect(0, y, x0 + 60, 12, 'pave');
      const eot = x0 + 60;
      const slopeDrop = { f6: 1 / 6, f4: 1 / 4, f3: 1 / 3, crit: 1 / 2 }[s.slope];
      g.add('path', { d: `M${eot},${y} L${W},${y + (W - eot) * slopeDrop * 0.6}`, class: 'ground' });
      g.rect(eot, y - 40, Lc * sc, 40, 'ok-fill');
      g.line(eot + Lc * sc, y - 46, eot + Lc * sc, y + 30, 'req');
      g.text(eot + Lc * sc + 4, y - 34, `Clear zone ${Lc} ft`, 't t-sm');
      if (s.hazard !== 'none') g.rect(eot + s.offset * sc, y - 24, Math.max(s.extent * sc, 6), 20, 'hazard');
      g.text(10, 22, 'Section', 't t-b');
      // Plan (bottom) — length of need
      const py = 200;
      g.rect(0, py - 30, W, 30, 'pave');
      g.line(0, py, W, py, 'edge');
      g.text(10, py - 40, 'Plan — traffic →', 't t-b');
      if (shield && lonVal != null) {
        const hx = 500, psc = Math.min(1.2, 380 / (LR || 1));
        const hzY = py + LA * 2.2;
        g.rect(hx, py + s.offset * 2.2, 40, Math.max(s.extent * 2.2, 6), 'hazard');
        g.line(hx - LR * psc, py, hx, hzY, 'sight');
        g.line(hx - lonVal * psc, py + s.L2 * 2.2, hx + 40, py + s.L2 * 2.2, 'rail');
        g.dimH(hx - lonVal * psc, hx, py + s.L2 * 2.2 + 22, `LON ${lonVal} ft`);
        g.text(hx - LR * psc, py - 6, `Runout LR ${LR} ft`, 't t-sm');
      } else {
        g.text(W / 2, py + 40, shield ? 'Shielding needed — length of need by engineering judgment' : 'No barrier needed', 't t-b', { 'text-anchor': 'middle' });
      }
    }
    return {
      svg: g,
      legend: s.curbed ? ui.legend([['req', 'TSTS 2 ft desirable minimum'], ['sight', 'TDOT 4 ft reference']]) : ui.legend([['ok', 'Clear zone'], ['hazard', 'Hazard'], ['rail', 'Barrier (length of need)'], ['sight', 'Runout line']]),
      results: R,
      basis: [
        ['TSTS requirements', 'TSTS §2.3.18: consult the AASHTO Roadside Design Guide; desirable minimum 2 ft from face of curb to an object; guardrail type and location approved case by case; wood guardrail prohibited. §2.3.19 crash-tested barriers. Ch. 7 §7.8 guard where a path is within 5 ft of the top of a wall.'],
        ['Clear zone', 'TDOT S-CZ-1 Table A by design speed, ADT and foreslope (adapted from AASHTO RDG 2011 Table 3.1); outside of curves × Kcz (Table B). Low-speed curbed urban streets use lateral offset (Figure B).'],
        ['Warrants', 'TDOT RDG §2-302: embankments (critical slopes steeper than 3:1), obstacles within the clear zone, bridges and culverts. §2-302.05: not typically recommended on low-speed urban streets (posted ≤ 35 mph) or for critical fill under 100 ft long with less than 10 ft drop.'],
        ['Length of need', 'TDOT S-PL-1: LON = (LA − L2)/(LA/LR), runout length LR from Table B by speed and ADT; not calculated below 30 mph. Flared barrier: AASHTO RDG §5.6.4.']
      ]
    };
  }
});
