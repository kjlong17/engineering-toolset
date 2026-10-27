/* Horizontal alignment: minimum radius, curve elements, sightline offset, superelevation transition, spirals, tapers. */
import { C } from '../criteria.js';
import * as f from '../formulas.js';

const G = C.gb, T = C.tdot2;
const speedVar = { k: 'V', label: 'Design speed', unit: 'mph', ctx: 'V', min: 15, max: 80, step: 5 };
const emaxOpts = [{ value: -2, label: 'Normal crown, adverse (−2 %)' }, { value: 0, label: 'Flat (0 %)' }, { value: 2, label: '2 %' }, ...G.emax.map((e) => ({ value: e, label: `${e} %` }))];

export default [
  {
    id: 'rmin', kind: 'formula', topic: 'horiz', title: 'Minimum radius of curve',
    aliases: ['Rmin', 'minimum radius', 'superelevation', 'side friction', '3-8'], cite: ['gb333'],
    eq: ['R_min = V² / [15·(0.01·e_max + f_max)]   (Eq. 3-8, e in %)', 'e + f = V² / (15·R)   (point-mass equation, Eq. 3-7)'],
    vars: [speedVar, { k: 'e', label: 'Maximum superelevation e_max', options: emaxOpts, value: 8 }],
    consts: [['f_max', 'Maximum side friction factor from the table in Design controls', '']],
    compute: (v) => {
      const fm = f.fFor(v.V), r = f.rmin(v.V, v.e / 100);
      return [
        { label: 'f_max at this speed', value: fm.toFixed(2) },
        { label: 'Computed R_min', value: f.fmt1(r), unit: 'ft' },
        { label: 'Design R_min (rounded to 5 ft, 10 ft above 1,000)', value: f.rminDesign(v.V, v.e / 100), unit: 'ft', strong: true }
      ];
    },
    notes: ['Normal crown against the curve uses e = −2 % (adverse crown). The 7th edition applies the same f values to low-speed urban streets.', 'Radii above the minimum take their superelevation from the Method 5 distribution (Tables 3-8 to 3-12) for rural and high-speed urban, or Method 2 (Figure 3-14) for low-speed urban streets.',
      `TDOT practice (§2-101.01): desirable e_max ${T.emaxUrban} ft/ft on urban projects and ${T.emaxRural} ft/ft on rural projects; rates and runoff lengths come from the RD18-SE and RD18-LR series; a rate that cannot be met needs a Design Exception.`]
  },
  {
    id: 'rminTable', kind: 'table', topic: 'horiz', title: 'Design minimum radius by speed and e_max',
    aliases: ['Rmin table', 'Table 3-7', 'minimum radius table'], cite: ['gb333'],
    cols: ['Design speed (mph)', 'f max', 'e = −2 % (NC)', 'e = 4 %', 'e = 6 %', 'e = 8 %', 'e = 10 %', 'e = 12 %'],
    rows: () => C.speeds.map((V) => [V, G.f[V].toFixed(2), f.rminDesign(V, -0.02), ...G.emax.map((e) => f.rminDesign(V, e / 100))]),
    keyIndex: 0,
    notes: ['Values in ft, computed from Eq. 3-8 and rounded as the Green Book does. e_max of 4 % suits urban areas with intersections and ice; 6 % is common urban/suburban; 8 % is the usual rural maximum; 10–12 % only where ice and snow are rare.']
  },
  {
    id: 'hcurve', kind: 'formula', topic: 'horiz', title: 'Circular curve elements',
    aliases: ['tangent length', 'curve length', 'external distance', 'middle ordinate', 'long chord', 'degree of curve', 'deflection angle', 'PC', 'PT', 'PI'],
    cite: ['gb33'],
    eq: ['T = R·tan(Δ/2)', 'L = R·Δ (Δ in radians) = π·R·Δ° / 180', 'E = R·[sec(Δ/2) − 1]', 'M = R·[1 − cos(Δ/2)]', 'LC = 2·R·sin(Δ/2)', 'D = 5729.58 / R   (arc definition, degrees per 100 ft)'],
    vars: [{ k: 'R', label: 'Radius R', unit: 'ft', value: 1000, min: 10, max: 20000, step: 5 }, { k: 'd', label: 'Deflection angle Δ', unit: '°', value: 30, min: 0.1, max: 180, step: 0.1 }],
    compute: (v) => {
      const h = f.hcurve(v.R, v.d);
      return [
        { label: 'Tangent T', value: f.fmt(h.T, 2), unit: 'ft', strong: true },
        { label: 'Curve length L', value: f.fmt(h.L, 2), unit: 'ft', strong: true },
        { label: 'External E', value: f.fmt(h.E, 2), unit: 'ft' },
        { label: 'Middle ordinate M', value: f.fmt(h.M, 2), unit: 'ft' },
        { label: 'Long chord LC', value: f.fmt(h.LC, 2), unit: 'ft' },
        { label: 'Degree of curve D (arc)', value: f.fmt(h.D, 3), unit: '°' }
      ];
    },
    sketch: 'hcurve',
    notes: ['Stationing: PC = PI − T; PT = PC + L. Chord-definition degree of curve (railroads) is D = 2·asin(50/R).']
  },
  {
    id: 'hso', kind: 'formula', topic: 'horiz', title: 'Horizontal sightline offset (middle ordinate for sight distance)',
    aliases: ['HSO', 'sightline offset', 'sight distance on curve', 'middle ordinate', '3-37', '3-38'], cite: ['gb3312'],
    eq: ['HSO = R·[1 − cos(28.65·S / R)]   (Eq. 3-37, angle in degrees)', 'S = (R / 28.65)·acos[(R − HSO) / R]   (Eq. 3-38)'],
    vars: [speedVar, { k: 'R', label: 'Radius to centerline of inside lane', unit: 'ft', value: 1000, min: 50, max: 20000, step: 5 },
      { k: 'S', label: 'Sight distance S (0 = design SSD at this speed)', unit: 'ft', value: 0, min: 0, max: 3000, step: 5 }],
    compute: (v) => {
      const S = v.S || f.ssdDesign(v.V);
      const m = f.hso(v.R, S);
      return [
        { label: 'Sight distance used', value: S, unit: 'ft', note: v.S ? '' : 'design SSD at the selected speed' },
        { label: 'Required clear offset HSO', value: f.fmt1(m), unit: 'ft', strong: true },
        { label: 'Check: S available for this HSO', value: f.fmt1(f.sightFromOffset(v.R, m)), unit: 'ft' }
      ];
    },
    sketch: 'hso',
    notes: ['Measured from the centerline of the inside lane to the obstruction. Applies when S is within the curve length; otherwise use the graphical method.', 'Sightline height: 3.5 ft eye to 2.0 ft object, so obstructions below about 2.75 ft at mid-curve may not control.']
  },
  {
    id: 'runoff', kind: 'formula', topic: 'horiz', title: 'Superelevation runoff and tangent runout',
    aliases: ['runoff', 'runout', 'transition length', 'relative gradient', 'axis of rotation', '3-23', '3-24'], cite: ['gb338'],
    eq: ['L_r = (w·n1·e_d / Δ)·b_w   (Eq. 3-23, e_d and Δ in %)', 'L_t = (e_NC / e_d)·L_r   (Eq. 3-24)'],
    vars: [speedVar, { k: 'w', label: 'Lane width w', unit: 'ft', value: 12, min: 9, max: 16, step: 0.5 },
      { k: 'n1', label: 'Lanes rotated n1', options: [1, 1.5, 2, 2.5, 3, 3.5].map((n) => ({ value: n, label: String(n) })), value: 1 },
      { k: 'ed', label: 'Design superelevation e_d', unit: '%', value: 6, min: 1, max: 12, step: 0.5 },
      { k: 'enc', label: 'Normal crown e_NC', unit: '%', value: 2, min: 1, max: 3, step: 0.5 }],
    consts: [['Δ', 'Maximum relative gradient from the table in Design controls', ''], ['b_w', 'Adjustment for lanes rotated: 1 → 1.00, 1.5 → 0.83, 2 → 0.75, 2.5 → 0.70, 3 → 0.67, 3.5 → 0.64 (Table 3-16)', '']],
    compute: (v) => {
      const r = f.runoff(v.w, v.n1, v.ed, v.V);
      const Lt = f.tangentRunout(v.enc, v.ed, r.Lr);
      const [lo, hi] = G.runoffOnTangent;
      return [
        { label: 'Δ at this speed', value: r.delta.toFixed(2), unit: '%' },
        { label: 'b_w', value: r.bw.toFixed(2) },
        { label: 'Runoff length L_r', value: f.fmt0(r.Lr), unit: 'ft', strong: true },
        { label: 'Tangent runout L_t', value: f.fmt0(Lt), unit: 'ft', strong: true },
        { label: 'Total transition L_r + L_t', value: f.fmt0(r.Lr + Lt), unit: 'ft' },
        { label: `Runoff on the tangent (${lo}–${hi} %)`, value: `${f.fmt0(r.Lr * lo / 100)}–${f.fmt0(r.Lr * hi / 100)}`, unit: 'ft' }
      ];
    },
    unverified: 'The portion of runoff placed on the tangent (60–90 %) is the Green Book range; the recommended value by speed and lanes (Table 3-18) and any TDOT fixed split are not yet entered.',
    notes: ['Runoff is the length over which the outside lane rotates from flat to full superelevation. Runout is the additional length to remove the adverse crown. With a spiral, the runoff is the spiral length.']
  },
  {
    id: 'spiral', kind: 'formula', topic: 'horiz', title: 'Spiral curve transition length',
    aliases: ['spiral', 'Ls', 'clothoid', 'transition curve', '3-26', '3-27', '3-28', 'Table 3-20'], cite: ['gb338'],
    eq: ['L_s,min = √(24·p_min·R)   (Eq. 3-26, p_min = 0.66 ft)', 'L_s,min = 3.15·V³ / (R·C)   (Eq. 3-27, comfort; C = 1–3 ft/s³)', 'L_s,max = √(24·p_max·R)   (Eq. 3-28, p_max = 3.3 ft)', 'L_s,desirable ≈ 2 s of travel = 2.94·V   (Table 3-20)'],
    vars: [speedVar, { k: 'R', label: 'Radius R', unit: 'ft', value: 1000, min: 50, max: 10000, step: 5 }, { k: 'Cc', label: 'Rate of change of centripetal acceleration C', unit: 'ft/s³', value: 1, min: 1, max: 3, step: 0.5 }],
    compute: (v) => {
      const s = f.spiral(v.R, v.V, v.Cc);
      return [
        { label: 'Minimum by lateral offset (Eq. 3-26)', value: f.fmt0(s.lsMinOffset), unit: 'ft' },
        { label: 'Minimum by comfort (Eq. 3-27)', value: f.fmt0(s.lsMinComfort), unit: 'ft' },
        { label: 'Minimum spiral length (larger of the two)', value: f.fmt0(s.lsMin), unit: 'ft', strong: true },
        { label: 'Desirable spiral length (2 s of travel)', value: f.fmt0(s.lsDes), unit: 'ft', strong: true },
        { label: 'Maximum spiral length (Eq. 3-28)', value: f.fmt0(s.lsMax), unit: 'ft' }
      ];
    },
    unverified: 'Table 3-20 desirable lengths are reproduced here as 2.94·V; the printed table differs by a foot at some speeds.',
    notes: ['Spirals are considered where the radius is below the "maximum radius for use of a spiral" in Table 3-19 (not yet entered).',
      `TDOT (§2-101.01): spirals are recommended for curves at ${T.spiralSpeed} mph or more with superelevation of ${T.spiralE * 100} % or more; the RD18-LR tables say when. In the urban e_max 0.04 example (Table 2-1) the first 50 mph radius needing a spiral is ${f.fmt0(T.spiralExampleRadius)} ft. Spirals may be omitted on isolated bridge replacements, intersection improvements and widenings where they give no benefit.`]
  },
  {
    id: 'taper', kind: 'formula', topic: 'horiz', title: 'Taper length (approach, bay and departure tapers)',
    aliases: ['taper', 'lane transition', 'merging taper', 'approach taper', 'bay taper', 'departure taper', 'WS²/60', 'WS', 'WS/3', '2-602'], cite: ['tdot2602', 'tdot2601', 'mutcd3b09', 'gbTurn'],
    eq: ['Approach taper:   L = W·S² / 60   (S < 45 mph)', 'Approach taper:   L = W·S   (S ≥ 45 mph)', 'Bay taper:   L = W·S / 3', 'Departure taper: begins at the end of the bay taper; rate no sharper than the approach taper'],
    vars: [{ k: 'W', label: 'Width of offset W', unit: 'ft', value: 12, min: 1, max: 24, step: 0.5 }, { ...speedVar, label: 'Design speed S' }],
    compute: (v) => {
      const L = f.taper(v.W, v.V);
      return [
        { label: 'Approach taper L', value: f.fmt0(L), unit: 'ft', strong: true },
        { label: 'Approach taper rate', value: `${(L / v.W).toFixed(1)}:1` },
        { label: 'Bay taper W·S/3', value: f.fmt0((v.W * v.V) / 3), unit: 'ft', strong: true },
        { label: 'MUTCD shifting taper (½ L)', value: f.fmt0(L / 2), unit: 'ft' },
        { label: 'MUTCD shoulder taper (⅓ L)', value: f.fmt0(L / 3), unit: 'ft' }
      ];
    },
    notes: ['TDOT Figure 2-10: approach taper, bay taper, full-width turn lane. Turn-lane warrants and full-width length are in the TDOT Highway System Access Manual, Volume 3.', `Opposing left-turn lanes in medians up to ${T.medianLeftTurnAlignMax} ft wide are placed on the median centerline, directly opposite each other, with channelization striping; wider medians use offset left-turn lanes (§2-800.03).`]
  },
  {
    id: 'laneDrop', kind: 'formula', topic: 'horiz', title: 'Lane drop after an intersection',
    aliases: ['lane drop', 'lane reduction', 'X = 750 + d', 'advance placement', 'Table 2-4', 'Condition A', '2-601', 'lane ends sign'], cite: ['tdot2601', 'mutcd2c05', 'mutcd3b09'],
    eq: ['X = 750 ft + d   (minimum lane length past the intersection before the taper begins)', 'L = W·S² / 60   (S < 45 mph)   or   L = W·S   (S ≥ 45 mph)'],
    vars: [{ ...speedVar, label: 'Posted or 85th-percentile speed S' }, { k: 'W', label: 'Transition width W', unit: 'ft', value: 12, min: 1, max: 30, step: 0.5 }],
    consts: [['750 ft', 'Distance from the intersection within which the Lane Ends sign is not visible to approaching traffic', ''], ['d', 'Condition A advance placement distance from Table 2-4 (MUTCD Table 2C-4)', ''], ['L', 'Taper length per MUTCD §3B.09', '']],
    compute: (v) => {
      const ld = f.laneDrop(v.V);
      if (!ld) return [{ label: 'd', value: 'Not tabulated', note: 'Table 2-4 covers 20–75 mph' }];
      const L = f.taper(v.W, v.V);
      return [
        { label: 'Advance placement d (Condition A)', value: ld.d, unit: 'ft' },
        { label: 'Minimum lane length X = 750 + d', value: f.fmt0(ld.X), unit: 'ft', strong: true },
        { label: 'Lane reduction taper L', value: f.fmt0(L), unit: 'ft', strong: true },
        { label: 'Total from the intersection to the end of the taper', value: f.fmt0(ld.X + L), unit: 'ft' }
      ];
    },
    notes: [`Worked example in §2-601: 55 mph posted, 30 ft to 12 ft transition (W = 18 ft): X = 750 + 990 = 1,740 ft and L = 55 × 18 = 990 ft.`, 'Condition B (deceleration to an advisory speed) uses the other columns of Table 2-4; the sign legibility adjustments are 180 ft for Condition A and 250 ft for Condition B.', 'Avoid lane drops on horizontal or vertical curves so drivers are on a tangent (§2-102.04). Ending the outside lane as a right-turn lane is subject to TDOT Signal Section approval.']
  },
  {
    id: 'condATable', kind: 'table', topic: 'horiz', title: 'Advance placement distance, Condition A (Table 2-4)',
    aliases: ['Table 2-4', 'Table 2C-4', 'advance placement', 'warning sign placement'], cite: ['tdot2601', 'mutcd2c05'],
    cols: ['Posted or 85th-percentile speed (mph)', 'Condition A d (ft)', 'X = 750 + d (ft)'],
    rows: () => Object.entries(T.condA).map(([s, d]) => [+s, d, 750 + d]),
    keyIndex: 0,
    notes: ['Condition A: speed reduction and lane changing in heavy traffic (Merge, Right Lane Ends). Based on a 14.0–14.5 s decision sight distance pre-maneuver time less 180 ft legibility distance. Add 100 ft for signs with less than 6 in legend or more than four words.']
  }
];
