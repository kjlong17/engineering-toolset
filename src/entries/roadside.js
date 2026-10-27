/* Roadside safety: clear zone, slopes, barrier warrants, length of need. */
import { C } from '../criteria.js';
import * as f from '../formulas.js';

const R = C.rdg;
const speedVar = { k: 'V', label: 'Design speed', unit: 'mph', ctx: 'V', min: 15, max: 80, step: 5 };
const adtOpts = R.clearZone.adt.map((a) => ({ value: a, label: a.replace('<', 'Under ').replace('>', 'Over ') }));
const slopeOpts = Object.entries(R.clearZone.slopeLabels).map(([k, l]) => ({ value: k, label: l }));

export default [
  {
    id: 'clearZone', kind: 'formula', topic: 'roadside', title: 'Clear zone distance',
    aliases: ['clear zone', 'recovery area', 'Kcz', 'curve correction', 'Table 3.1', 'Table 3.2', 'S-CZ-1'],
    cite: ['scz1A', 'scz1B', 'rdg32'],
    eq: ['CZ_c = L_c × K_cz   (outside of horizontal curves)'],
    vars: [speedVar, { k: 'adt', label: 'Design ADT', options: adtOpts, value: '>6000' }, { k: 'slope', label: 'Slope', options: slopeOpts, value: 'f4' },
      { k: 'Rc', label: 'Horizontal curve radius (0 = tangent or inside of curve)', unit: 'ft', value: 0, min: 0, max: 5000, step: 5 }],
    compute: (v) => {
      const cz = f.clearZone(v.V, v.adt, v.slope);
      const k = f.kcz(v.V, v.Rc);
      return [
        { label: `Clear zone range, ${cz.band} mph`, value: `${cz.low}–${cz.high}`, unit: 'ft', strong: true },
        { label: 'Curve correction K_cz', value: k.toFixed(1), note: v.Rc ? (v.Rc > 2950 ? 'no correction above 2,950 ft radius' : 'outside of curve') : 'tangent' },
        { label: 'Corrected clear zone (upper value × K_cz)', value: f.fmt1(cz.high * k), unit: 'ft', strong: true }
      ];
    },
    unverified: 'Clear zone Table A and curve correction Table B were transcribed from TDOT S-CZ-1 drawing text; check them against the drawing graphic (RDG Tables 3-1 and 3-2).',
    notes: ['Clear zone is measured from the edge of the traveled way. Foreslopes 3:1 are traversable but not recoverable: the clear zone extends to the toe with a 10 ft clear runout area desired beyond it.', `Low-speed curbed urban streets (posted ≤ 45 mph) use a lateral offset instead: ${R.lowSpeedOffsetMin} ft minimum from the face of curb, ${R.lowSpeedOffsetEnhanced} ft where practical (S-CZ-1 Figure B).`, 'Where the clear zone exceeds about 30 ft on high-speed, high-volume roads the upper values may be reduced with judgment (RDG §3.1).']
  },
  {
    id: 'clearZoneTable', kind: 'table', topic: 'roadside', title: 'Clear zone table (ft) by speed, ADT and slope',
    aliases: ['clear zone table', 'S-CZ-1 Table A', 'RDG Table 3-1'], cite: ['scz1A', 'rdg32'],
    cols: ['Speed (mph) / ADT', ...Object.values(R.clearZone.slopeLabels)],
    rows: () => R.clearZone.speeds.flatMap((s) => R.clearZone.adt.map((a) => {
      const r = R.clearZone.table[s][a];
      return [`${s} · ADT ${a}`, ...Object.keys(R.clearZone.slopeLabels).map((k) => `${r[k][0]}–${r[k][1]}`)];
    })),
    keyFn: (V) => f.speedBand(V), keyMatch: (row, key) => row[0].startsWith(key + ' '),
    unverified: 'Transcribed from drawing text; verify against S-CZ-1.',
    notes: ['Foreslopes 3:1: use the 5:1–4:1 clear zone to the slope and extend across the slope to a 10 ft runout at the toe.']
  },
  {
    id: 'kczTable', kind: 'table', topic: 'roadside', title: 'Curve correction factor K_cz',
    aliases: ['Kcz', 'S-CZ-1 Table B', 'RDG Table 3-2'], cite: ['scz1B', 'rdg32'],
    cols: ['Radius (ft)', ...R.kcz.speeds.map((s) => `${s} mph`)],
    rows: () => R.kcz.rows.map(([r, vals]) => [r, ...vals.map((x) => (x == null ? '—' : x.toFixed(1)))]),
    unverified: 'Transcribed from drawing text; verify against S-CZ-1.',
    notes: ['Applies to the outside of curves only. Use 1.0 above a 2,950 ft radius; round the radius down to the next tabulated row.']
  },
  {
    id: 'slopes', kind: 'constants', topic: 'roadside', title: 'Roadside slopes and barrier warrants',
    aliases: ['recoverable slope', 'traversable', 'critical slope', 'non-recoverable', 'embankment warrant', 'fixed object', 'shy line', 'deflection'],
    cite: ['rdg33', 'rdg52', 'tdot2302', 'tdot230205'],
    items: [
      { label: 'Recoverable foreslope', value: `1:${R.recoverableSlope} or flatter`, note: 'Most drivers can stop or return to the road.' },
      { label: 'Traversable, non-recoverable foreslope', value: '1:3 (steeper than 1:4, not steeper than 1:3)', note: `Drivers reach the toe; provide a ${R.runoutAreaDesired} ft clear runout area there.` },
      { label: 'Critical foreslope', value: `steeper than 1:${R.criticalSlope}`, note: 'Likely rollover. Barrier warranted by the embankment criterion (height and slope chart, RDG Figure 5-1).' },
      { label: 'Embankment barrier exemption (TDOT)', value: `fills shorter than ${R.criticalFillExemption.length} ft with less than ${R.criticalFillExemption.drop} ft drop`, note: 'TDOT RDG §2-302.05.' },
      { label: 'Low-speed urban streets', value: `barrier typically not recommended where posted ≤ ${R.barrierLowSpeedPosted} mph`, note: 'Remove, relocate or make breakaway instead (TDOT RDG §2-302.05).' },
      { label: 'Fixed objects warranting treatment', value: 'trees ≥ 4 in diameter, poles, headwalls, wall ends, piers, non-traversable drainage inside the clear zone', note: 'Order of preference: remove, relocate, make breakaway or traversable, shield, delineate.' },
      { label: 'Shy-line offset L_s', value: Object.entries(R.shyLine.values).map(([v, s]) => `${v} mph ${s} ft`).join('; '), note: 'Barrier closer than this affects driver behavior (RDG Table 5-7).' },
      { label: 'Suggested flare rate, inside shy line', value: R.flare.speeds.map((s, i) => `${s} mph ${R.flare.insideShy[i]}:1`).join('; '), note: 'RDG Table 5-9.' },
      { label: 'Suggested flare rate, beyond shy line', value: R.flare.speeds.map((s, i) => `${s} mph ${R.flare.beyondShy[i]}:1`).join('; '), note: 'RDG Table 5-9.' }
    ],
    unverified: 'Shy-line offsets and flare rates are from memory of RDG Tables 5-7 and 5-9; confirm before relying on them.'
  },
  {
    id: 'lon', kind: 'formula', topic: 'roadside', title: 'Barrier length of need',
    aliases: ['length of need', 'LON', 'runout length', 'LR', 'LA', 'L2', 'flare', 'S-PL-1', '5-1'],
    cite: ['spl1', 'rdg56'],
    eq: ['X = (L_A + (b/a)·L_1 − L_2) / [(b/a) + L_A / L_R]   (RDG Eq. 5-1)', 'Parallel barrier (b/a = 0):   X = (L_A − L_2) / (L_A / L_R)'],
    vars: [speedVar, { k: 'adt', label: 'ADT band for runout', options: R.runout.adt.map((a, i) => ({ value: i, label: a.replace('<', 'Under ').replace('>', 'Over ') })), value: 0 },
      { k: 'LA', label: 'L_A: edge of travel lane to back of hazard (limited to the clear zone)', unit: 'ft', value: 16, min: 1, max: 60, step: 0.5 },
      { k: 'L2', label: 'L_2: edge of travel lane to face of barrier', unit: 'ft', value: 6, min: 0, max: 40, step: 0.5 },
      { k: 'L1', label: 'L_1: tangent barrier length ahead of the hazard before the flare', unit: 'ft', value: 0, min: 0, max: 500, step: 5 },
      { k: 'flare', label: 'Flare rate a (b:a = 1:a; 0 = parallel)', unit: ':1', value: 0, min: 0, max: 40, step: 1 }],
    compute: (v) => {
      const r = f.runoutLength(v.V, v.adt);
      const X = f.lon(v.LA, v.L2, r.LR, v.L1, v.flare);
      return [
        { label: `Runout length L_R (${r.speed} mph row)`, value: r.LR, unit: 'ft' },
        { label: 'Length of need X ahead of the hazard', value: f.fmt0(Math.ceil(X)), unit: 'ft', strong: true },
        { label: 'Lateral offset of the runout line at X', value: f.fmt1(v.LA - (v.LA / r.LR) * X), unit: 'ft' }
      ];
    },
    sketch: 'lon',
    unverified: 'Runout rows at 20, 25, 35, 45, 55 and 65 mph are TDOT interpolations transcribed from S-PL-1; the 30, 40, 50, 60, 70 and 80 mph rows are the RDG 2011 values.',
    notes: [`TDOT S-PL-1 does not compute length of need below ${R.lonMinSpeed} mph; length of need begins at post ${R.lonBeginsAtPost} of an energy-absorbing terminal.`, 'Repeat from the opposite direction for two-way roads, measuring L_A and L_2 from the centerline for opposing traffic.', 'Keep deflection space behind the barrier (about 3–4 ft for strong-post W-beam) or use a stiffer system.']
  },
  {
    id: 'runoutTable', kind: 'table', topic: 'roadside', title: 'Runout length L_R (ft) by speed and ADT',
    aliases: ['runout table', 'S-PL-1 Table B', 'RDG Table 5-10'], cite: ['spl1', 'rdg56'],
    cols: ['Design speed (mph)', ...R.runout.adt.map((a) => `ADT ${a}`)],
    rows: () => Object.keys(R.runout.rows).map(Number).sort((a, b) => b - a).map((s) => [s, ...R.runout.rows[s]]),
    keyIndex: 0,
    unverified: 'See the length-of-need entry: the intermediate speed rows are to be verified against S-PL-1.'
  }
];
