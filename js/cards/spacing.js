/* Intersection and access spacing, curb returns, intersection angle, parking clearances. */
FST.card({
  id: 'spacing', tab: 'int',
  title: 'Intersection and access spacing',
  intro: 'Lists the minimum spacing, curb return radius, intersection angle and parking clearances for the selected street classification. Pick a dimension to draw it.',
  cites: ['t232', 's2313', 's231311', 's2315', 's2316', 's2323'],
  defaults: (c) => ({ kind: c.cls.spacing.unsignal ? 'unsignal' : 'lvDrivewayToInt', both: false, com: false, trucks: false }),
  kinds(c, s) {
    const sp = c.cls.spacing, C = c.C, I = C.intersection;
    const local = c.cls.group === 'local';
    const k = [];
    const d = (id, label, req, cite, opts = {}) => k.push({ id, label, req, cite, ...opts });
    if (sp.signal) d('signal', 'Signalized intersection spacing', sp.signal, ['t232'], { note: 'Measured from the nearest points of the radius returns.' });
    if (sp.unsignal) d('unsignal', 'Unsignalized intersection spacing', local && s.both ? I.localJogCds : sp.unsignal, ['t232'], { note: local ? `Measured from the nearest points of the radius returns. ${s.both ? 'Both streets are cul-de-sacs (Table 2.3(2) note d).' : '125 ft where both streets are cul-de-sacs (Table 2.3(2) note d).'}` : 'Measured from the nearest points of the radius returns.' });
    if (c.cls.group === 'arterial') d('localArt', 'Spacing of local street intersections on this arterial', I.localToArterial, ['s2323'], { note: '§2.3.23(21). Full-movement access to major arterials is limited to about ½-mile intervals.' });
    if (local) d('jog', 'Street jog (centerline offset) on a local street', s.both ? I.localJogCds : I.localJog, ['s2313'], { note: `§2.3.13(4).${s.both ? ' Both streets are cul-de-sacs.' : ' 125 ft when both intersecting streets are cul-de-sacs.'}` });
    if (c.cls.id === 'majArt') d('opposite', 'Offset from an opposite-side street (no signal or roundabout)', I.oppositeOffset, ['s2323'], { note: '§2.3.23(18). Streets may align only where a signal or roundabout will be permitted, or where a raised median restricts access to right-in/right-out.' });
    if (sp.hvDriveway) d('hvDriveway', 'High-volume driveway, alley or mews to street', sp.hvDriveway, ['t232'], { note: 'Measured from the nearest points of the radius returns.' });
    if (sp.lvDrivewayToInt) d('lvDrivewayToInt', 'Low-volume driveway to intersecting street', sp.lvDrivewayToInt, ['t232', 's2323'], { note: '§2.3.23(4): from the PT of the intersecting street right-of-way curve to the nearest point of the driveway radius return.' });
    if (sp.lvDriveway) d('lvDriveway', 'Between low-volume driveways (separate lots)', sp.lvDriveway, ['t232', 's2323'], { note: 'Measured from the nearest points of the radius returns (§2.3.23(5)).' });
    if (c.cls.median) d('median', 'Median opening spacing', C.medianOpeningSpacing, ['s2315'], { note: '§2.3.15(4): normally at least 600 ft on major streets for back-to-back left-turn lanes.' });
    if (c.cls.parkingAllowed) {
      d('parkDw', 'On-street parking space to edge of driveway', C.parking.driveway, ['s2316']);
      d('parkInt', 'On-street parking space to intersection flow line', C.parking.intersection, ['s2316'], { note: '§2.3.16(9): also keep the intersection sight triangle clear.' });
    }
    d('radius', 'Minimum curb return radius', s.com ? I.curbRadiusCom : I.curbRadiusRes, ['s231311'], { note: `${s.com ? 'Commercial / industrial area, or residential meeting nonresidential.' : 'Residential.'} Design vehicle for ${c.cls.name}: ${c.cls.vehicle}. Verify with turning templates (§2.3.4).` });
    d('angle', 'Intersection angle', null, ['s2313'], { text: `${I.angleMin}–${I.angleMax}° (90° preferred)`, note: '§2.3.13(6).' });
    d('shift', 'Maximum lane alignment shift through intersection', I.laneShiftMax, ['s2313'], { note: '§2.3.13(5): hardship cases only, with agency approval. Align lanes where possible.' });
    return k;
  },
  fields(c, s, set) {
    const u = c.ui, kinds = this.kinds(c, s);
    if (!kinds.find((k) => k.id === s.kind)) s.kind = kinds[0].id;
    const local = c.cls.group === 'local';
    return [
      local ? u.toggle({ label: 'Both intersecting streets are cul-de-sacs', checked: s.both, onChange: (v) => set('both', v) }) : null,
      u.toggle({ label: 'Commercial / industrial area, or residential street meeting a nonresidential street', checked: s.com, onChange: (v) => set('com', v) }),
      u.toggle({ label: 'More than 10 right-turning trucks in the design hour', checked: s.trucks, onChange: (v) => set('trucks', v) }),
      u.select({ label: 'Dimension to draw', value: s.kind, options: kinds.map((k) => ({ value: k.id, label: k.label })), onChange: (v) => set('kind', v) })
    ];
  },
  evaluate(c, s) {
    const { ui, cls, C } = c;
    const kinds = this.kinds(c, s);
    const kind = kinds.find((k) => k.id === s.kind) || kinds[0];
    const R = kinds.map((k) => ui.val(k.label, k.text || (/^(Minimum|Maximum)/.test(k.label) ? ui.ft(k.req) : `${ui.ft(k.req)} minimum`), k.cite, k.note));
    if (s.trucks) R.push(ui.note('Over 10 right-turning trucks per hour: use larger radii or a 3-centered compound curve', ['s231311']));
    R.push(ui.info('On State Highways, TDOT curb radius requirements supersede these minimums', ['s231311']));

    // ---- Diagram ----
    const W = 640, H = 220;
    const g = ui.svg(W, H, `${kind.label} (plan)`, `${kind.label}: ${kind.text || ui.ft(kind.req)}.`);
    if (s.kind === 'angle') {
      const cx = 320, cy = 150, len = 150;
      g.rect(0, cy - 14, W, 28, 'pave');
      const lo = (C.intersection.angleMin * Math.PI) / 180, hi = (C.intersection.angleMax * Math.PI) / 180;
      const pt = (b) => [cx + len * Math.cos(Math.PI - b), cy - len * Math.sin(b)];
      g.add('path', { d: `M${cx},${cy} L${pt(lo)[0]},${pt(lo)[1]} L${pt(hi)[0]},${pt(hi)[1]} Z`, class: 'ok-fill' });
      for (const b of [lo, hi]) g.path(`M${cx},${cy} L${pt(b)[0]},${pt(b)[1]}`, 'ok');
      g.path(`M${cx},${cy} L${cx},${cy - len}`, 'dim');
      g.text(cx + 12, 40, `Allowed ${C.intersection.angleMin}–${C.intersection.angleMax}° (90° preferred)`, 't t-b');
    } else if (s.kind === 'radius') {
      const ox = 220, oy = 60, scale = 3;
      const rr = kind.req * scale;
      g.rect(ox - 40, 0, 80, H, 'pave');
      g.rect(0, oy + 40, W, 60, 'pave');
      const cx0 = ox + 40, cy0 = oy + 40;
      g.path(`M${cx0},${cy0 - rr} A${rr},${rr} 0 0 0 ${cx0 + rr},${cy0}`, 'ok');
      g.text(cx0 + rr + 14, cy0 - 10, `Minimum R = ${kind.req} ft`, 't t-b');
    } else {
      const need = kind.req || 1;
      const x0 = 60, sc = (W - 120) / (need * 1.15);
      g.rect(0, 70, W, 50, 'pave');
      g.line(0, 95, W, 95, 'mark');
      const feat = (x, label) => { g.rect(x - 14, 120, 28, 60, 'pave-2'); g.text(x, 198, label, 't t-sm', { 'text-anchor': 'middle' }); };
      const [la, lb] = {
        signal: ['Signal', 'Signal'], unsignal: ['Street', 'Street'], localArt: ['Street', 'Local street'], jog: ['Street', 'Street (opposite side)'],
        opposite: ['Street', 'Opposite street'], hvDriveway: ['Street', 'High-volume driveway'], lvDrivewayToInt: ['Street', 'Driveway'], lvDriveway: ['Driveway', 'Driveway'],
        median: ['Opening', 'Opening'], parkDw: ['Driveway', 'Parking space'], parkInt: ['Intersection', 'Parking space'], shift: ['Lane', 'Lane']
      }[s.kind] || ['', ''];
      feat(x0, la); feat(x0 + need * sc, lb);
      g.dimH(x0, x0 + need * sc, 50, `${s.kind === 'shift' ? 'Maximum' : 'Minimum'} ${ui.fmt(need)} ft`);
    }
    return {
      svg: g,
      legend: ['angle', 'radius'].includes(s.kind) ? ui.legend([['ok', 'Design limit']]) : null,
      results: R,
      basis: [
        ['Source values', `Table 2.3(2) for ${cls.name}: signalized ${cls.spacing.signal ?? 'n/a'} ft; unsignalized ${cls.spacing.unsignal ?? 'n/a'} ft; high-volume driveway ${cls.spacing.hvDriveway ?? 'n/a'} ft; low-volume driveway to street ${cls.spacing.lvDrivewayToInt ?? 'n/a'} ft; between low-volume driveways ${cls.spacing.lvDriveway ?? 'n/a'} ft.`],
        ['Other limits', 'Curb returns 25 ft residential / 30 ft commercial (§2.3.13(11)); intersection angle 80–100° (§2.3.13(6)); lane shift ≤ 2 ft (§2.3.13(5)); median openings 600 ft (§2.3.15(4)); parking 6 ft from driveways and 30 ft from the intersection flow line (§2.3.16).'],
        ['Measurement', 'Spacing is measured from the nearest points of the radius returns (Table 2.3(2) note e) unless noted.']
      ]
    };
  }
});
