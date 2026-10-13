/* Grades, grade breaks, gutter grade and cross slope. */
FST.card({
  id: 'grade', tab: 'align',
  title: 'Grades, grade breaks and cross slope',
  intro: 'Checks profile grades, the flatter grade required approaching a signal, grades within intersections and cul-de-sacs, grade breaks, minimum gutter grade and pavement cross slope.',
  cites: ['t232', 't235', 's239', 's23138', 's2387', 's237'],
  defaults: (c) => ({ g: Math.min(5, c.cls.maxGrade), sig: false, gApp: c.cls.signalApproach ? c.cls.signalApproach.grade : 2, gInt: 2, gutter: 0.6,
    brk: 0.3, brkAt: 'general', work: 'new', xs: 2.0, cds: false, gCds: 4 }),
  fields(c, s, set) {
    const u = c.ui, cls = c.cls;
    return [
      u.range({ label: 'Steepest centerline grade', min: 0, max: 15, step: 0.1, value: s.g, unit: '%', onChange: (v) => set('g', v) }),
      cls.signalApproach ? u.toggle({ label: 'Approach to a signalized intersection', checked: s.sig, onChange: (v) => set('sig', v, { rebuild: true }) }) : null,
      s.sig && cls.signalApproach ? u.range({ label: `Steepest grade within ${cls.signalApproach.length} ft of the signal`, min: 0, max: 10, step: 0.1, value: s.gApp, unit: '%', onChange: (v) => set('gApp', v) }) : null,
      u.range({ label: 'Profile grade within the intersection', min: 0, max: 10, step: 0.1, value: s.gInt, unit: '%', onChange: (v) => set('gInt', v) }),
      u.range({ label: 'Flattest gutter flow-line grade', min: 0, max: 5, step: 0.05, value: s.gutter, unit: '%', onChange: (v) => set('gutter', v) }),
      u.group('Largest single-point grade break',
        u.segmented({ label: 'Location', value: s.brkAt, onChange: (v) => set('brkAt', v), options: [
          { value: 'general', label: 'Profile' }, { value: 'sag', label: 'Sag flow line' }, { value: 'return', label: 'Curb return' }] }),
        u.range({ label: 'Grade break', min: 0, max: 5, step: 0.05, value: s.brk, unit: '%', onChange: (v) => set('brk', v) })),
      u.group('Pavement cross slope',
        u.segmented({ label: 'Work type', value: s.work, onChange: (v) => set('work', v), options: [{ value: 'new', label: 'New street' }, { value: 'recon', label: 'Reconstruction / overlay' }] }),
        u.range({ label: 'Cross slope', min: 0, max: 6, step: 0.1, value: s.xs, unit: '%', onChange: (v) => set('xs', v) })),
      cls.cdsAllowed ? u.toggle({ label: 'Street ends in a cul-de-sac', checked: s.cds, onChange: (v) => set('cds', v, { rebuild: true }) }) : null,
      s.cds && cls.cdsAllowed ? u.range({ label: 'Centerline grade in the bulb', min: 0, max: 10, step: 0.1, value: s.gCds, unit: '%', onChange: (v) => set('gCds', v) }) : null
    ];
  },
  evaluate(c, s) {
    const { ui, cls, C } = c;
    const R = [], rows = [];
    const add = (ok, label, lo, hi, value, cite, max, detail) => {
      R.push({ status: ok ? 'pass' : 'fail', label, required: lo != null && hi != null && lo !== hi ? `${lo}–${hi}%` : lo != null && hi != null ? `${lo}%` : lo != null ? `≥ ${lo}%` : `≤ ${hi}%`, provided: ui.pct(value, 2), cite, detail });
      rows.push({ label, value, lo, hi, max, unit: '%', d: 2 });
    };
    add(s.g <= cls.maxGrade, 'Maximum centerline grade', null, cls.maxGrade, s.g, ['t232', 't235'], 12);
    if (s.sig && cls.signalApproach) {
      add(s.gApp <= cls.signalApproach.grade, `Grade within ${cls.signalApproach.length} ft of signal`, null, cls.signalApproach.grade, s.gApp, ['t235'], 10);
    }
    add(s.gInt <= C.intersectionMaxGrade, 'Grade within intersection', null, C.intersectionMaxGrade, s.gInt, ['s23138'], 8);
    const gMin = s.cds ? C.gutterMinCds : cls.minGutter;
    add(s.gutter >= gMin, s.cds ? 'Gutter grade in cul-de-sac bulb' : 'Minimum gutter grade', gMin, null, s.gutter, ['t232', 's239'], 3);
    const brkMax = { general: C.gradeBreak.max, sag: C.gradeBreak.sagFlowline, return: C.gradeBreak.curbReturn }[s.brkAt];
    add(s.brk <= brkMax, `Grade break (${{ general: 'profile', sag: 'sag flow line', return: 'curb return' }[s.brkAt]})`, null, brkMax, s.brk, ['s239'], 4,
      s.brkAt === 'return' ? '3.0% is allowed in curb returns only for extreme circumstances.' : null);
    const xs = C.crossSlope;
    const [lo, hi] = s.cds ? [xs.cdsMin, xs.cdsMax] : s.work === 'new' ? [xs.newMin, xs.newMax] : [xs.reconMin, xs.reconMax];
    add(s.xs >= lo && s.xs <= hi, s.cds ? 'Cul-de-sac cross slope' : 'Pavement cross slope', lo, hi, s.xs, ['s2387'], 6,
      s.work === 'recon' && !s.cds ? 'Widened sections and added turn lanes may not be flatter than the existing cross slope (§2.3.8(7)(c)).' : null);
    if (s.cds && cls.cdsAllowed) add(s.gCds <= C.cdsMaxGrade, 'Centerline grade in cul-de-sac bulb', null, C.cdsMaxGrade, s.gCds, ['s239', 't235'], 10);

    return {
      svg: ui.bullets('Grade checks against allowed ranges', rows),
      legend: ui.legend([['ok', 'Allowed range (shaded)'], ['bad', 'Outside allowed range']]),
      caption: 'Each bar is the plan value; the shaded band is the allowed range and the tick marks are the limits.',
      results: R,
      basis: [
        ['Maximum grades', 'Table 2.3(2) and Table 2.3(5). Signal approach limits from Table 2.3(5); within the intersection 3% (§2.3.13(7)(b)). Values may be amended by the approving agency (note c).'],
        ['Grade breaks', '§2.3.9(2): 0.40% at any single point; 1.0% at sag flow lines; up to 3.0% in curb returns for extreme circumstances.'],
        ['Gutter grade', '§2.3.9(3) and Table 2.3(2): 0.50% minimum; 1.0% in cul-de-sac bulbs.'],
        ['Cross slope', '§2.3.8(7): new streets 2.0% (min and max); reconstruction or overlay 1.5%–4.0%; cul-de-sacs 2.0%–5.0% (2.0% desirable).']
      ]
    };
  }
});
