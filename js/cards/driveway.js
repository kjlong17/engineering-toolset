/* Driveway design values: width, return radius, spacing, profile, entrance angle, throat, number permitted (§2.3.23). */
FST.card({
  id: 'driveway', tab: 'xs',
  title: 'Driveway design',
  intro: 'Gives the TSTS driveway dimensions for the selected street classification and driveway use, and the number of driveways allowed for a lot frontage.',
  cites: ['s2323', 't232', 't238', 't239'],
  defaults: () => ({ use: 'res', rural: false, frontage: 100 }),
  fields(c, s, set) {
    const u = c.ui;
    return [
      u.segmented({ label: 'Driveway use', value: s.use, onChange: (v) => set('use', v), options: [
        { value: 'res', label: 'Residential' }, { value: 'one', label: 'Nonresidential one-way' }, { value: 'two', label: 'Nonresidential two-way' }] }),
      u.toggle({ label: 'Street has no curb and gutter', checked: s.rural, onChange: (v) => set('rural', v) }),
      u.range({ label: 'Lot frontage on this street', min: 0, max: 2000, step: 10, value: s.frontage, unit: 'ft', onChange: (v) => set('frontage', v) })
    ];
  },
  evaluate(c, s) {
    const { ui, cls, C } = c;
    const D = C.driveway, R = [], rows = [];
    const add = (label, lo, hi, unit, cite, max, detail, d = 0) => {
      const u = unit === 'ft' ? ' ft' : unit; // no space before % or °
      const v = lo != null && hi != null ? `${ui.fmt(lo, d)}–${ui.fmt(hi, d)}${u}` : lo != null ? `${ui.fmt(lo, d)}${u} minimum` : `${ui.fmt(hi, d)}${u} maximum`;
      R.push(ui.val(label, v, cite, detail));
      rows.push({ label, lo, hi, max, unit, d });
    };
    const wr = s.rural ? D.ruralWidth : D.width[{ res: 'res', one: 'nonresOne', two: 'nonresTwo' }[s.use]];
    add('Driveway width', wr[0], wr[1], 'ft', s.rural ? ['s2323'] : ['t238'], 50,
      `Measured at the nearest points of the radius returns.${s.use === 'two' ? ' Median driveways may be wider: 4–14 ft raised median, each lane within one-way limits (§2.3.23(13)).' : ''}`);
    const rk = s.use === 'res' ? 'res' : cls.group === 'arterial' ? 'arterial' : cls.group === 'collector' ? 'collector' : 'local';
    const rr = D.radius[rk];
    add('Return radius', rr[0], rr[1], 'ft', ['t239'], 60, s.use === 'res' ? 'A flare may be used instead of a curve for residential driveways.' : null);
    if (cls.spacing.lvDrivewayToInt) add('Distance to intersecting street', cls.spacing.lvDrivewayToInt, null, 'ft', ['t232', 's2323'], 600,
      `From the PT of the intersecting street right-of-way curve to the nearest point of the driveway radius return.${s.use === 'res' && cls.group === 'local' ? ' A corner lot on two local streets may be allowed closer at the approving agency\'s discretion (§2.3.23(4)(e)).' : ''}`);
    if (cls.spacing.lvDriveway) add('Spacing to a driveway on another lot', cls.spacing.lvDriveway, null, 'ft', ['t232'], 600);
    add('Grade within 20 ft of the flow line', null, D.maxGradeNear, '%', ['s2323'], 15, 'Driveways within the sidewalk and parkway must slope toward the street.');
    add('Entrance angle (first 25 ft)', 90 - D.angleTol, 90 + D.angleTol, '°', ['s2323'], 135);
    if (s.use !== 'res') add('Throat length before the first parking space or aisle', D.throat, null, 'ft', ['s2323'], 200);

    // Number of driveways (§2.3.23(3))
    let allowed, txt;
    if (cls.group === 'arterial') {
      allowed = s.frontage < 600 ? '1' : s.frontage <= 1200 ? '2' : '2 (more with agency approval)';
      txt = 'Arterial: one driveway under 600 ft of frontage; a second at 600–1,200 ft; more only with agency approval.';
    } else if (cls.group === 'collector') {
      if (s.use === 'res') { allowed = '1, only where no alternative access exists'; txt = 'Residential lots generally may not access collectors; where no alternative exists, one driveway for 125 ft of frontage or less.'; }
      else { allowed = s.frontage < 300 ? '1' : '1 (more with agency approval)'; txt = 'Collector: one driveway under 300 ft of frontage; more only with agency approval.'; }
    } else {
      allowed = s.frontage < 100 ? '1' : '1 (more with agency approval, at least 50 ft apart)';
      txt = 'Local: one driveway under 100 ft of frontage; more only with agency approval, and at least 50 ft apart.';
    }
    R.push(ui.val(`Driveways allowed for ${ui.fmt(s.frontage)} ft of frontage`, allowed, ['s2323'], txt));
    if (cls.group === 'arterial' || cls.group === 'collector') {
      R.push(ui.info('Corner lots take access from the lower-classified street', ['s2323']));
      if (s.use !== 'res') R.push(ui.info(`A deceleration lane is required if the use adds more than ${ui.fmt(D.decelTrigger.daily)} trips/day or ${ui.fmt(D.decelTrigger.peak)} peak-hour trips — see the Turn lane card`, ['s2323']));
    }
    if (s.rural) R.push(ui.val('Culvert under the driveway', '15 in minimum diameter, 24 in minimum cover', ['s2323'], 'Flared end sections; paved within the right-of-way.'));
    R.push(ui.info('Concrete (PCC) from the street to the right-of-way line or back of sidewalk; driveway sight distance per the intersection sight distance card', ['s2323', 'gbIsd']));

    return {
      svg: ui.ranges(`Driveway dimensions for ${cls.name}`, rows),
      legend: ui.legend([['ok-fill', 'Allowed range']]),
      caption: 'Each row has its own scale. Tick marks are the limits.',
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
