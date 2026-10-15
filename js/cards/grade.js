/* Grades, grade breaks, gutter grade and cross slope limits for the selected classification. */
FST.card({
  id: 'grade', tab: 'align',
  title: 'Grades, grade breaks and cross slope',
  intro: 'Gives the profile grade limits for the classification, including the flatter grade near a signal and within intersections and cul-de-sacs, plus grade breaks, minimum gutter grade and pavement cross slope.',
  cites: ['t232', 't235', 's239', 's23137', 's2387', 's237'],
  defaults: () => ({ work: 'new', cds: false }),
  fields(c, s, set) {
    const u = c.ui, cls = c.cls;
    return [
      u.segmented({ label: 'Work type (for cross slope)', value: s.work, onChange: (v) => set('work', v), options: [{ value: 'new', label: 'New street' }, { value: 'recon', label: 'Reconstruction / overlay' }] }),
      cls.cdsAllowed ? u.toggle({ label: 'Street ends in a cul-de-sac', checked: s.cds, onChange: (v) => set('cds', v) }) : null
    ];
  },
  evaluate(c, s) {
    const { ui, cls, C } = c;
    const R = [], rows = [];
    const add = (label, lo, hi, cite, max, detail) => {
      const p = (x) => ui.pct(x, x < 1 ? 2 : 1);
      const v = lo != null && hi != null ? (lo === hi ? `${p(lo)} (minimum and maximum)` : `${ui.fmt(lo, lo < 1 ? 2 : 1)}–${p(hi)}`) : lo != null ? `${p(lo)} minimum` : `${p(hi)} maximum`;
      R.push(ui.val(label, v, cite, detail));
      rows.push({ label, lo, hi, max, unit: '%', d: Math.min(lo ?? 9, hi ?? 9) < 1 ? 2 : 1 });
    };
    const cds = s.cds && cls.cdsAllowed;
    add('Centerline grade', null, cls.maxGrade, ['t232', 't235'], 12);
    if (cls.signalApproach) add(`Grade within ${cls.signalApproach.length} ft of a signal`, null, cls.signalApproach.grade, ['t235'], 10);
    add('Grade within an intersection', null, C.intersectionMaxGrade, ['s23137'], 8);
    if (cds) add('Centerline grade in cul-de-sac bulb', null, C.cdsMaxGrade, ['s239', 't235'], 10);
    add(cds ? 'Gutter grade in cul-de-sac bulb' : 'Gutter flow-line grade', cds ? C.gutterMinCds : cls.minGutter, null, ['t232', 's239'], 3,
      cls.minGutterNote && !cds ? `Table 2.3(2) lists ${cls.minGutterNote}% for this classification.` : null);
    add('Grade break, profile (no curve)', null, C.gradeBreak.max, ['s239'], 4);
    add('Grade break, sag flow line', null, C.gradeBreak.sagFlowline, ['s239'], 4);
    add('Grade break, curb return', null, C.gradeBreak.curbReturn, ['s239'], 4, 'Allowed only for extreme circumstances.');
    const xs = C.crossSlope;
    const [lo, hi] = cds ? [xs.cdsMin, xs.cdsMax] : s.work === 'new' ? [xs.newMin, xs.newMax] : [xs.reconMin, xs.reconMax];
    add(cds ? 'Cul-de-sac cross slope' : 'Pavement cross slope', lo, hi, ['s2387'], 6,
      cds ? '2.0% desirable.' : s.work === 'recon' ? 'Widened sections and added turn lanes may not be flatter than the existing cross slope (§2.3.8(7)(c)).' : null);

    return {
      svg: ui.ranges(`Grade and cross slope limits for ${cls.name}`, rows),
      legend: ui.legend([['ok-fill', 'Allowed range']]),
      caption: 'Each row has its own scale. Tick marks are the limits.',
      results: R,
      basis: [
        ['Maximum grades', 'Table 2.3(2) and Table 2.3(5). Signal approach limits from Table 2.3(5); within the intersection 3% (§2.3.13(7)(b)). Values may be amended by the approving agency (note c).'],
        ['Grade breaks', '§2.3.9(2): 0.40% at any single point; 1.0% at sag flow lines; up to 3.0% in curb returns for extreme circumstances.'],
        ['Gutter grade', '§2.3.9(3) and Table 2.3(2): 0.50% minimum; 1.0% in cul-de-sac bulbs.'],
        ['Cross slope', '§2.3.8(7): new streets 2.0% (minimum and maximum); reconstruction or overlay 1.5–4.0%; cul-de-sacs 2.0–5.0% (2.0% desirable).']
      ]
    };
  }
});
