/* Intersection and access spacing, curb returns, intersection angle, parking clearances. */
FST.card({
  id: 'spacing', tab: 'int',
  title: 'Intersection and access spacing',
  intro: 'Pick the dimension you are checking. The minimum comes from the selected street classification.',
  cites: ['t232', 's2313', 's231311', 's2315', 's2316', 's2323'],
  defaults: (c) => ({ kind: c.cls.spacing.unsignal ? 'unsignal' : 'lvDrivewayToInt', val: 300, both: false, com: false, trucks: false }),
  kinds(c) {
    const sp = c.cls.spacing, C = c.C, I = C.intersection;
    const k = [];
    const d = (id, label, req, cite, opts = {}) => k.push({ id, label, req, cite, ...opts });
    if (sp.signal) d('signal', 'Signalized intersection to signalized intersection', sp.signal, ['t232'], { note: 'Measured from the nearest points of the radius returns.' });
    if (sp.unsignal) d('unsignal', 'Unsignalized intersection spacing', sp.unsignal, ['t232'], { note: 'Measured from the nearest points of the radius returns. Locals: 125 ft where both streets are cul-de-sacs (note d).' });
    if (c.cls.group === 'arterial') d('localArt', 'Local street intersecting this arterial', I.localToArterial, ['s2323'], { note: '§2.3.23(21). Full-movement access to major arterials is limited to about ½-mile intervals.' });
    if (c.cls.group === 'local') d('jog', 'Street jog (centerline offset) on a local street', I.localJog, ['s2313'], { note: '§2.3.13(4). 125 ft when both intersecting streets are cul-de-sacs.' });
    if (c.cls.id === 'majArt') d('opposite', 'Offset from an opposite-side street (no signal or roundabout)', I.oppositeOffset, ['s2323'], { note: '§2.3.23(18). Aligned only where a signal or roundabout will be permitted or a raised median restricts to right-in/right-out.' });
    if (sp.hvDriveway) d('hvDriveway', 'High-volume driveway, alley or mews to street', sp.hvDriveway, ['t232'], { note: 'Measured from the nearest points of the radius returns.' });
    if (sp.lvDrivewayToInt) d('lvDrivewayToInt', 'Low-volume driveway to intersecting street', sp.lvDrivewayToInt, ['t232', 's2323'], { note: '§2.3.23(4): from the PT of the intersecting street right-of-way curve to the nearest point of the driveway radius return.' });
    if (sp.lvDriveway) d('lvDriveway', 'Between low-volume driveways (separate lots)', sp.lvDriveway, ['t232', 's2323'], { note: 'Measured from the nearest points of the radius returns (§2.3.23(5)).' });
    if (c.cls.median) d('median', 'Median opening spacing', C.medianOpeningSpacing, ['s2315'], { note: '§2.3.15(4): normally at least 600 ft on major streets for back-to-back left-turn lanes.' });
    if (c.cls.parkingAllowed) {
      d('parkDw', 'On-street parking space to edge of driveway', C.parking.driveway, ['s2316']);
      d('parkInt', 'On-street parking space to intersection flow line', C.parking.intersection, ['s2316'], { note: '§2.3.16(9): also confirm the intersection sight triangle stays clear.' });
    }
    d('radius', 'Curb return radius', null, ['s231311']);
    d('angle', 'Intersection angle', null, ['s2313']);
    d('shift', 'Lane alignment shift through intersection', I.laneShiftMax, ['s2313'], { max: true, note: '§2.3.13(5): up to 2 ft only in hardship cases with agency approval.' });
    return k;
  },
  fields(c, s, set) {
    const u = c.ui, kinds = this.kinds(c);
    if (!kinds.find((k) => k.id === s.kind)) s.kind = kinds[0].id;
    const kind = kinds.find((k) => k.id === s.kind);
    const isAngle = s.kind === 'angle', isRad = s.kind === 'radius', isShift = s.kind === 'shift';
    const range = isAngle ? { min: 45, max: 135, step: 1, unit: '°' } : isRad ? { min: 0, max: 80, step: 1, unit: 'ft' } : isShift ? { min: 0, max: 6, step: 0.5, unit: 'ft' } : { min: 0, max: Math.max(3000, (kind.req || 0) * 2), step: 5, unit: 'ft' };
    return [
      u.select({ label: 'Dimension being checked', value: s.kind, options: kinds.map((k) => ({ value: k.id, label: k.label })), onChange: (v) => {
        s.val = v === 'angle' ? 90 : v === 'radius' ? 25 : v === 'shift' ? 0 : (kinds.find((k) => k.id === v).req || 100);
        set('kind', v, { rebuild: true });
      } }),
      u.range({ label: isAngle ? 'Angle between street centerlines' : 'Value on plans', ...range, value: s.val, onChange: (v) => set('val', v) }),
      (s.kind === 'unsignal' && c.cls.group === 'local') || s.kind === 'jog' ? u.toggle({ label: 'Both intersecting streets are cul-de-sacs', checked: s.both, onChange: (v) => set('both', v) }) : null,
      isRad ? u.toggle({ label: 'Commercial / industrial area, or residential street meeting a non-residential street', checked: s.com, onChange: (v) => set('com', v) }) : null,
      isRad ? u.toggle({ label: 'More than 10 right-turning trucks in the design hour', checked: s.trucks, onChange: (v) => set('trucks', v) }) : null
    ];
  },
  evaluate(c, s) {
    const { ui, cls, C } = c;
    const kinds = this.kinds(c);
    const kind = kinds.find((k) => k.id === s.kind) || kinds[0];
    const R = [];
    let req = kind.req, ok, reqText;
    if (s.kind === 'angle') {
      ok = s.val >= C.intersection.angleMin && s.val <= C.intersection.angleMax;
      reqText = `${C.intersection.angleMin}°–${C.intersection.angleMax}° (90° preferred)`;
      R.push({ status: ok ? 'pass' : 'fail', label: kind.label, required: reqText, provided: `${s.val}°`, cite: kind.cite });
    } else if (s.kind === 'radius') {
      req = s.com ? C.intersection.curbRadiusCom : C.intersection.curbRadiusRes;
      ok = s.val >= req;
      R.push(ui.check(ok, kind.label, ui.ft(req), ui.ft(s.val), kind.cite, `Design vehicle for ${cls.name}: ${cls.vehicle}. Verify with turning templates (§2.3.4).`));
      if (s.trucks) R.push({ status: 'note', label: 'Over 10 right-turning trucks per hour: use larger radii or a 3-centered compound curve', cite: ['s231311'] });
      R.push({ status: 'info', label: 'On State Highways, TDOT curb radius requirements supersede these minimums', cite: ['s231311'] });
    } else if (s.kind === 'shift') {
      ok = s.val <= req;
      R.push({ status: s.val === 0 ? 'pass' : ok ? 'note' : 'fail', label: kind.label, required: `≤ ${req} ft (hardship only)`, provided: ui.ft(s.val, 1), cite: kind.cite, detail: kind.note });
    } else {
      if ((s.kind === 'jog' || (s.kind === 'unsignal' && cls.group === 'local')) && s.both) req = C.intersection.localJogCds;
      ok = s.val >= req;
      R.push(ui.check(ok, kind.label, ui.ft(req), ui.ft(s.val), kind.cite, kind.note));
    }

    // ---- Diagram ----
    const W = 640, H = 220;
    const g = ui.svg(W, H, `${kind.label} (plan)`, `${kind.label}: ${ok ? 'meets' : 'does not meet'} the minimum.`);
    if (s.kind === 'angle') {
      const cx = 320, cy = 150, len = 150, a = (s.val * Math.PI) / 180;
      g.rect(0, cy - 14, W, 28, 'pave');
      g.add('path', { d: `M${cx},${cy} L${cx + len * Math.cos(Math.PI - a)},${cy - len * Math.sin(a)}`, class: 'road', 'stroke-width': 26, stroke: 'currentColor', opacity: 0.35 });
      g.add('path', { d: `M${cx},${cy} L${cx + len * Math.cos(Math.PI - a)},${cy - len * Math.sin(a)}`, class: ok ? 'ok' : 'bad' });
      for (const lim of [C.intersection.angleMin, C.intersection.angleMax]) {
        const b = (lim * Math.PI) / 180;
        g.path(`M${cx},${cy} L${cx + len * Math.cos(Math.PI - b)},${cy - len * Math.sin(b)}`, 'req');
      }
      g.text(cx + 12, 40, `${s.val}° (allowed 80°–100°)`, 't t-b');
    } else if (s.kind === 'radius') {
      const ox = 220, oy = 60, scale = 3;
      const rr = req * scale, rp = Math.max(s.val, 1) * scale;
      g.rect(ox - 40, 0, 80, H, 'pave');
      g.rect(0, oy + 40, W, 60, 'pave');
      // corner at (ox+40, oy+40) for the minor street east edge / major north edge
      const cx0 = ox + 40, cy0 = oy + 40;
      g.path(`M${cx0},${cy0 - rr} A${rr},${rr} 0 0 0 ${cx0 + rr},${cy0}`, 'req');
      g.path(`M${cx0},${cy0 - rp} A${rp},${rp} 0 0 0 ${cx0 + rp},${cy0}`, ok ? 'ok' : 'bad');
      g.text(cx0 + Math.max(rr, rp) + 14, cy0 - 10, `Provided R = ${s.val} ft · minimum ${req} ft`, 't t-b');
    } else {
      const val = s.val, need = req || 1;
      const span = Math.max(val, need) * 1.15 + 1;
      const x0 = 60, sc = (W - 120) / span;
      g.rect(0, 70, W, 50, 'pave');
      g.line(0, 95, W, 95, 'mark');
      const feat = (x, label) => { g.rect(x - 14, 120, 28, 60, 'pave-2'); g.text(x, 198, label, 't t-sm', { 'text-anchor': 'middle' }); };
      const [la, lb] = {
        signal: ['Signal', 'Signal'], unsignal: ['Street', 'Street'], localArt: ['Street', 'Local street'], jog: ['Street', 'Street (opposite side)'],
        opposite: ['Street', 'Opposite street'], hvDriveway: ['Street', 'HV driveway'], lvDrivewayToInt: ['Street', 'Driveway'], lvDriveway: ['Driveway', 'Driveway'],
        median: ['Opening', 'Opening'], parkDw: ['Driveway', 'Parking space'], parkInt: ['Intersection', 'Parking space'], shift: ['Lane', 'Lane']
      }[s.kind] || ['', ''];
      feat(x0, la); feat(x0 + val * sc, lb);
      g.line(x0, 50, x0 + val * sc, 50, ok ? 'ok' : 'bad');
      g.text(x0 + (val * sc) / 2, 42, `Plans ${ui.fmt(val)} ft`, 't t-b', { 'text-anchor': 'middle' });
      if (req != null) { g.line(x0, 136, x0 + need * sc, 136, 'req'); g.text(x0 + need * sc + 6, 140, `Minimum ${need} ft`, 't t-sm'); }
    }
    return {
      svg: g,
      legend: ui.legend([['req', 'Required limit'], [ok ? 'ok' : 'bad', 'Plans']]),
      results: R,
      basis: [
        ['Source values', `Table 2.3(2) for ${cls.name}: signalized ${cls.spacing.signal ?? 'n/a'} ft; unsignalized ${cls.spacing.unsignal ?? 'n/a'} ft; high-volume driveway ${cls.spacing.hvDriveway ?? 'n/a'} ft; low-volume driveway to street ${cls.spacing.lvDrivewayToInt ?? 'n/a'} ft; between low-volume driveways ${cls.spacing.lvDriveway ?? 'n/a'} ft.`],
        ['Other limits', 'Curb returns 25 ft residential / 30 ft commercial (§2.3.13(11)); intersection angle 80°–100° (§2.3.13(6)); lane shift ≤ 2 ft (§2.3.13(5)); median openings 600 ft (§2.3.15(4)); parking 6 ft from driveways and 30 ft from the intersection flow line (§2.3.16).'],
        ['Measurement', 'Spacing is measured from the nearest points of the radius returns (Table 2.3(2) note e) unless noted.']
      ]
    };
  }
});
