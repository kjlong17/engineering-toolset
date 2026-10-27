/* Vertical alignment: K values, curve length, curve geometry, sag under structures. */
import { C } from '../criteria.js';
import * as f from '../formulas.js';

const G = C.gb;
const speedVar = { k: 'V', label: 'Design speed', unit: 'mph', ctx: 'V', min: 15, max: 80, step: 5 };

export default [
  {
    id: 'kvalues', kind: 'formula', topic: 'vert', title: 'Vertical curve K and minimum length',
    aliases: ['K value', 'crest', 'sag', 'rate of vertical curvature', 'minimum curve length', '3-41', '3-42', '3-43', '3-44', 'headlight'],
    cite: ['gb346', 'tdot220002'],
    eq: ['L = K·A   (K = length per percent of A)', 'Crest, S < L:   L = A·S² / 2158   →   K = S² / 2158   (Eq. 3-41)', 'Crest, S > L:   L = 2·S − 2158 / A   (Eq. 3-42)',
      'Sag, S < L:   L = A·S² / (400 + 3.5·S)   →   K = S² / (400 + 3.5·S)   (Eq. 3-43)', 'Sag, S > L:   L = 2·S − (400 + 3.5·S) / A   (Eq. 3-44)', 'Sag comfort:   K = V² / 46.5', 'Appearance:   L_min = 3·V'],
    vars: [speedVar, { k: 'type', label: 'Curve type', options: [{ value: 'crest', label: 'Crest' }, { value: 'sag', label: 'Sag' }], value: 'crest' },
      { k: 'A', label: 'Algebraic difference A = |g2 − g1|', unit: '%', value: 4, min: 0.1, max: 20, step: 0.1 },
      { k: 'S', label: 'Sight distance S (0 = design SSD)', unit: 'ft', value: 0, min: 0, max: 3000, step: 5 }],
    compute: (v) => {
      const S = v.S || f.ssdDesign(v.V);
      const kRaw = v.type === 'crest' ? f.kCrest(S) : f.kSag(S);
      const K = f.kDesign(kRaw);
      const L = f.lengthRequired(v.type, S, v.A);
      const Lmin = G.minLengthFactor * v.V;
      const out = [
        { label: 'Sight distance used', value: S, unit: 'ft', note: v.S ? '' : 'design SSD at the selected speed' },
        { label: 'K computed', value: f.fmt1(kRaw) },
        { label: 'Design K (rounded up)', value: K, strong: true },
        { label: `Length for sight distance (${L >= S ? 'S < L' : 'S > L'} case)`, value: f.fmt0(L), unit: 'ft' },
        { label: 'Length by design K: K·A', value: f.fmt0(K * v.A), unit: 'ft' },
        { label: 'Length for appearance 3·V', value: Lmin, unit: 'ft' },
        { label: 'Governing minimum length', value: f.fmt0(Math.max(K * v.A, Lmin)), unit: 'ft', strong: true }
      ];
      if (v.type === 'sag') out.splice(3, 0, { label: 'Comfort K (lit sags) V²/46.5', value: f.kDesign(f.kComfort(v.V)) });
      return out;
    },
    sketch: 'vcurve',
    notes: ['Design K uses the design SSD; the Green Book tabulates K rounded up to the next whole number and uses it even when S > L would give a shorter curve.', 'Drainage: K above 167 (crest or sag) needs attention to drainage on curbed sections because the grade stays below 0.3 % for more than 50 ft either side of the high or low point.']
  },
  {
    id: 'kTable', kind: 'table', topic: 'vert', title: 'Design K values by speed',
    aliases: ['K table', 'Table 3-34', 'Table 3-36', 'crest K', 'sag K'], cite: ['gb346'],
    cols: ['Design speed (mph)', 'Design SSD (ft)', 'Crest K', 'Sag K', 'Comfort K (V²/46.5)', 'L min = 3V (ft)'],
    rows: () => C.speeds.map((V) => { const S = f.ssdDesign(V); return [V, S, f.kDesign(f.kCrest(S)), f.kDesign(f.kSag(S)), f.kDesign(f.kComfort(V)), 3 * V]; }),
    keyIndex: 0,
    notes: ['Computed from Eq. 3-41 and 3-43 with the design SSD; these reproduce the Green Book design values.']
  },
  {
    id: 'vcgeom', kind: 'formula', topic: 'vert', title: 'Vertical curve geometry (parabola)',
    aliases: ['PVC', 'PVI', 'PVT', 'high point', 'low point', 'turning point', 'elevation on curve', 'external', 'middle ordinate vertical', 'Figure 2-4'],
    cite: ['gb346', 'tdot220002'],
    eq: ['y = y_PVC + (g1/100)·x + (A/(200·L))·x²   (x from PVC)', 'x_turn = −g1·L / A   (high or low point, where the grade is zero)', 'E = A·L / 800   (offset from PVI to curve)', 'PVC = PVI − L/2;   PVT = PVI + L/2'],
    vars: [{ k: 'g1', label: 'Grade in g1', unit: '%', value: 3, min: -15, max: 15, step: 0.1 }, { k: 'g2', label: 'Grade out g2', unit: '%', value: -2, min: -15, max: 15, step: 0.1 },
      { k: 'L', label: 'Curve length L', unit: 'ft', value: 600, min: 10, max: 5000, step: 10 },
      { k: 'sta', label: 'PVI station', unit: 'ft', value: 1000, min: 0, max: 100000, step: 1 }, { k: 'elev', label: 'PVI elevation', unit: 'ft', value: 100, min: -1000, max: 10000, step: 0.01 }],
    compute: (v) => {
      const vc = f.vcurve(v.g1, v.g2, v.L, v.sta, v.elev);
      const sta = (x) => { const n = Math.round(x * 100) / 100; const a = Math.abs(n); return `${n < 0 ? '-' : ''}${Math.floor(a / 100)}+${(a % 100).toFixed(2).padStart(5, '0')}`; };
      const out = [
        { label: 'A = g2 − g1', value: f.fmt(vc.A, 2), unit: '%', note: vc.type === 'crest' ? 'crest' : 'sag' },
        { label: 'K = L / |A|', value: f.fmt1(vc.K), strong: true },
        { label: 'PVC', value: `Sta. ${sta(vc.pvcSta)}, elev. ${f.fmt(vc.pvcElev, 2)}` },
        { label: 'PVT', value: `Sta. ${sta(vc.pvtSta)}, elev. ${f.fmt(vc.pvtElev, 2)}` },
        { label: 'External E = A·L/800', value: f.fmt(vc.E, 2), unit: 'ft' }
      ];
      if (vc.turning) out.push({ label: `${vc.type === 'crest' ? 'High' : 'Low'} point`, value: `Sta. ${sta(vc.turning.sta)}, elev. ${f.fmt(vc.turning.elev, 2)}`, note: `${f.fmt1(vc.turning.x)} ft from PVC`, strong: true });
      else out.push({ label: 'High/low point', value: 'Not within the curve', note: 'grades do not change sign' });
      return out;
    },
    sketch: 'vcurve',
    notes: ['TDOT Figure 2-4 (§2-200.02) states the same relations: E = A·L/800 and y = 4·D²·E/L² = D²·A/(200·L), with D the distance from the nearest PC or PT. TDOT refers vertical curve design to the AASHTO Green Book Chapter 3 and takes maximum grades and minimum K from the RD18-TS series.']
  },
  {
    id: 'sagUnder', kind: 'formula', topic: 'vert', title: 'Sag curve under a structure (sight distance to the undercrossing)',
    aliases: ['undercrossing', 'sag under bridge', 'overhead structure', '3-49', '3-50'], cite: ['gb346'],
    eq: ['S < L:   L = A·S² / [800·(C − (h1 + h2)/2)]   (Eq. 3-49)', 'S > L:   L = 2·S − 800·(C − (h1 + h2)/2) / A   (Eq. 3-50)'],
    vars: [speedVar, { k: 'A', label: 'Algebraic difference A', unit: '%', value: 4, min: 0.1, max: 20, step: 0.1 }, { k: 'Cc', label: 'Vertical clearance C', unit: 'ft', value: 16.5, min: 10, max: 30, step: 0.1 },
      { k: 'S', label: 'Sight distance S (0 = design SSD)', unit: 'ft', value: 0, min: 0, max: 3000, step: 5 }],
    consts: [['h1', 'Truck driver eye height', `${G.sagUnder.h1} ft`], ['h2', 'Object height', `${G.sagUnder.h2} ft`]],
    compute: (v) => {
      const S = v.S || f.ssdDesign(v.V);
      const den = 800 * (v.Cc - (G.sagUnder.h1 + G.sagUnder.h2) / 2);
      const L1 = (v.A * S * S) / den;
      const L = L1 >= S ? L1 : Math.max(0, 2 * S - den / v.A);
      return [
        { label: 'Sight distance used', value: S, unit: 'ft' },
        { label: 'K for this clearance', value: f.fmt1(f.kSagUnder(S, v.Cc)) },
        { label: `Minimum length (${L1 >= S ? 'S < L' : 'S > L'})`, value: f.fmt0(L), unit: 'ft', strong: true },
        { label: 'Headlight sag K for comparison', value: f.kDesign(f.kSag(S)) }
      ];
    },
    notes: ['Rarely governs: the headlight criterion usually gives a longer sag curve. Check it where the structure is near the low point and the clearance is at the minimum.']
  }
];
