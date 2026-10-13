/* Driveway design: width, return radius, spacing, profile, entrance angle, throat, number permitted (§2.3.23). */
FST.card({
  id: 'driveway', tab: 'xs',
  title: 'Driveway design',
  intro: 'Checks a driveway against the TSTS access standards for the selected street classification.',
  cites: ['s2323', 't232', 't238', 't239'],
  defaults: (c) => ({ use: 'res', width: 16, radius: 10, toInt: c.cls.spacing.lvDrivewayToInt || 50, toNext: c.cls.spacing.lvDriveway || 50,
    grade: 6, angle: 90, throat: 30, frontage: 100, count: 1, rural: false }),
  fields(c, s, set) {
    const u = c.ui;
    return [
      u.segmented({ label: 'Driveway use', value: s.use, onChange: (v) => set('use', v, { rebuild: true }), options: [
        { value: 'res', label: 'Residential' }, { value: 'one', label: 'Nonresidential one-way' }, { value: 'two', label: 'Nonresidential two-way' }] }),
      u.toggle({ label: 'Street has no curb and gutter', checked: s.rural, onChange: (v) => set('rural', v) }),
      u.range({ label: 'Width at nearest points of radius returns', min: 6, max: 50, step: 1, value: s.width, unit: 'ft', onChange: (v) => set('width', v) }),
      u.range({ label: 'Return radius', min: 0, max: 60, step: 1, value: s.radius, unit: 'ft', onChange: (v) => set('radius', v) }),
      u.range({ label: 'Distance to intersecting street', min: 0, max: 600, step: 5, value: s.toInt, unit: 'ft', onChange: (v) => set('toInt', v), hint: 'From the PT of the intersecting street right-of-way curve to the nearest point of the driveway radius return.' }),
      u.range({ label: 'Distance to nearest driveway on another lot', min: 0, max: 600, step: 5, value: s.toNext, unit: 'ft', onChange: (v) => set('toNext', v) }),
      u.range({ label: 'Steepest grade within 20 ft of the flow line', min: -15, max: 15, step: 0.5, value: s.grade, unit: '%', onChange: (v) => set('grade', v) }),
      u.range({ label: 'Entrance angle to street centerline', min: 45, max: 135, step: 1, value: s.angle, unit: '°', onChange: (v) => set('angle', v) }),
      s.use !== 'res' ? u.range({ label: 'Throat length before first parking space or aisle', min: 0, max: 200, step: 5, value: s.throat, unit: 'ft', onChange: (v) => set('throat', v) }) : null,
      u.group('Number of driveways',
        u.range({ label: 'Lot frontage on this street', min: 0, max: 2000, step: 10, value: s.frontage, unit: 'ft', onChange: (v) => set('frontage', v) }),
        u.range({ label: 'Driveways onto this street', min: 1, max: 5, step: 1, value: s.count, unit: '', onChange: (v) => set('count', v) }))
    ];
  },
  evaluate(c, s) {
    const { ui, cls, C } = c;
    const D = C.driveway, R = [], rows = [];
    const row = (ok, label, lo, hi, value, unit, cite, max, detail, d = 0) => {
      R.push({ status: ok ? 'pass' : 'fail', label, required: lo != null && hi != null ? `${lo}–${hi} ${unit}` : lo != null ? `≥ ${lo} ${unit}` : `≤ ${hi} ${unit}`, provided: `${ui.fmt(value, d)} ${unit}`, cite, detail });
      rows.push({ label, value, lo, hi, max, unit, d });
    };
    const wr = s.rural ? D.ruralWidth : D.width[{ res: 'res', one: 'nonresOne', two: 'nonresTwo' }[s.use]];
    row(s.width >= wr[0] && s.width <= wr[1], 'Driveway width', wr[0], wr[1], s.width, 'ft', s.rural ? ['s2323'] : ['t238'], 50,
      s.use === 'two' ? 'Median driveways may be wider: 4–14 ft raised median, each lane within one-way limits (§2.3.23(13)).' : null);
    const rk = s.use === 'res' ? 'res' : cls.group === 'arterial' ? 'arterial' : cls.group === 'collector' ? 'collector' : 'local';
    const rr = D.radius[rk];
    row(s.radius >= rr[0] && s.radius <= rr[1], 'Return radius', rr[0], rr[1], s.radius, 'ft', ['t239'], 60, s.use === 'res' ? 'A flare may be used instead of a curve for residential driveways.' : null);
    if (cls.spacing.lvDrivewayToInt) row(s.toInt >= cls.spacing.lvDrivewayToInt, 'Distance to intersecting street', cls.spacing.lvDrivewayToInt, null, s.toInt, 'ft', ['t232', 's2323'], 600,
      s.use === 'res' && cls.group === 'local' ? 'A corner lot on two local streets may be allowed closer at the approving agency\'s discretion (§2.3.23(4)(e)).' : null);
    if (cls.spacing.lvDriveway) row(s.toNext >= cls.spacing.lvDriveway, 'Spacing to driveway on another lot', cls.spacing.lvDriveway, null, s.toNext, 'ft', ['t232'], 600);
    row(Math.abs(s.grade) <= D.maxGradeNear, 'Grade within 20 ft of flow line', null, D.maxGradeNear, Math.abs(s.grade), '%', ['s2323'], 15, 'Driveways within the sidewalk and parkway must slope toward the street.', 1);
    row(Math.abs(s.angle - 90) <= D.angleTol, 'Entrance angle (first 25 ft)', 90 - D.angleTol, 90 + D.angleTol, s.angle, '°', ['s2323'], 135);
    if (s.use !== 'res') row(s.throat >= D.throat, 'Throat length (nonresidential)', D.throat, null, s.throat, 'ft', ['s2323'], 200);

    // Number of driveways (§2.3.23(3))
    let allowed = 1, txt = '';
    if (cls.group === 'arterial') {
      allowed = s.frontage < 600 ? 1 : s.frontage <= 1200 ? 2 : 2; txt = 'Arterial: one driveway under 600 ft of frontage; a second at 600–1,200 ft; more only with agency approval.';
    } else if (cls.group === 'collector') {
      allowed = 1; txt = s.use === 'res' ? 'Residential lots generally may not access collectors; where no alternative exists, one driveway for 125 ft of frontage or less.' : 'Collector: one driveway under 300 ft of frontage; more only with agency approval.';
    } else {
      allowed = 1; txt = 'Local: one driveway under 100 ft of frontage; more only with approval, and at least 50 ft apart.';
    }
    const extraOk = (cls.group === 'arterial' && s.frontage > 1200) || (cls.group === 'collector' && s.frontage >= 300 && s.use !== 'res') || (cls.group === 'local' && s.frontage >= 100) || (cls.group === 'collector' && s.use === 'res' && s.frontage > 125);
    if (s.count <= allowed) R.push({ status: 'pass', label: 'Number of driveways', required: `≤ ${allowed}`, provided: String(s.count), cite: ['s2323'], detail: txt });
    else R.push({ status: extraOk ? 'note' : 'fail', label: 'Number of driveways', required: `≤ ${allowed}${extraOk ? ' (more with approval)' : ''}`, provided: String(s.count), cite: ['s2323'], detail: txt });
    if (cls.group === 'arterial' || cls.group === 'collector') {
      R.push({ status: 'info', label: 'Corner lots take access from the lower-classified street', cite: ['s2323'] });
      if (s.use !== 'res') R.push({ status: 'info', label: `A deceleration lane is required if the use adds > ${D.decelTrigger.daily} trips/day or > ${D.decelTrigger.peak} peak-hour trips — see the turn lane card`, cite: ['s2323'] });
    }
    if (s.rural) R.push({ status: 'info', label: 'Culvert under the driveway: 15 in minimum, flared end sections, 24 in minimum cover; paved within the right-of-way', cite: ['s2323'] });
    R.push({ status: 'info', label: 'Concrete (PCC) from the street to the right-of-way line or back of sidewalk; driveway sight distance per the intersection sight distance card', cite: ['s2323', 'gbIsd'] });

    return {
      svg: ui.bullets('Driveway checks against allowed ranges', rows),
      legend: ui.legend([['ok', 'Allowed range (shaded)'], ['bad', 'Outside allowed range']]),
      caption: 'Each bar is the plan value; the shaded band is the allowed range and the tick marks are the limits.',
      results: R,
      basis: [
        ['Widths', 'Table 2.3(8): residential 10–20 ft; nonresidential one-way 15–20 ft; two-way 24–36 ft. Streets without curb: 12–22 ft (§2.3.23(26)).'],
        ['Return radius', 'Table 2.3(9): residential 5–15 ft; nonresidential on arterial 25–40 ft, collector 25–30 ft, local 10–25 ft.'],
        ['Spacing', `Table 2.3(2) for ${cls.name}: ${cls.spacing.lvDrivewayToInt ?? 'n/a'} ft to an intersecting street; ${cls.spacing.lvDriveway ?? 'n/a'} ft between low-volume driveways.`],
        ['Profile and layout', '§2.3.23(24) 8% max within 20 ft of the flow line; §2.3.23(27) 90° ± 10° for 25 ft; §2.3.23(11) 30 ft throat for nonresidential and multifamily driveways.']
      ]
    };
  }
});
