/* Sight distance: stopping, decision, passing, intersection. */
import { C } from '../criteria.js';
import * as f from '../formulas.js';

const G = C.gb;
const speedVar = { k: 'V', label: 'Design speed', unit: 'mph', ctx: 'V', min: 15, max: 80, step: 5 };

export default [
  {
    id: 'ssd', kind: 'formula', topic: 'sight', title: 'Stopping sight distance (SSD)',
    aliases: ['SSD', 'braking distance', 'brake reaction', 'perception reaction', '3-2', '3-3'],
    cite: ['gb322'],
    eq: ['SSD = 1.47·V·t + 1.075·V² / a   (level, Eq. 3-2)', 'SSD = 1.47·V·t + V² / [30·((a/32.2) ± G)]   (on grade, Eq. 3-3)'],
    vars: [speedVar, { k: 'G', label: 'Grade (− downgrade)', unit: '%', value: 0, min: -12, max: 12, step: 0.5 }],
    consts: [['t', 'Brake reaction time', `${G.prt} s`], ['a', 'Deceleration rate', `${G.decel} ft/s²`], ['G', 'Grade as a decimal, + upgrade / − downgrade', '']],
    compute: (v) => {
      const p = f.ssdParts(v.V, v.G);
      return [
        { label: 'Brake reaction distance 1.47·V·t', value: f.fmt1(p.reaction), unit: 'ft' },
        { label: 'Braking distance', value: f.fmt1(p.brake), unit: 'ft' },
        { label: 'Computed SSD', value: f.fmt1(p.total), unit: 'ft' },
        { label: 'Design SSD (rounded up to 5 ft)', value: f.ssdDesign(v.V, v.G), unit: 'ft', strong: true }
      ];
    },
    notes: ['Driver eye height 3.5 ft, object height 2.0 ft (§3.2.1). Truck driver eye height 7.6 ft.', 'On two-lane roads use the steeper downgrade of the two travel directions.']
  },
  {
    id: 'ssdTable', kind: 'table', topic: 'sight', title: 'Design stopping sight distance by speed (level)',
    aliases: ['SSD table', 'Table 3-1'], cite: ['gb322'],
    cols: ['Design speed (mph)', 'Brake reaction (ft)', 'Braking (ft)', 'Computed (ft)', 'Design SSD (ft)'],
    rows: () => C.speeds.map((V) => { const p = f.ssdParts(V); return [V, f.fmt1(p.reaction), f.fmt1(p.brake), f.fmt1(p.total), f.ssdDesign(V)]; }),
    keyIndex: 0,
    notes: ['Computed from Eq. 3-2 with t = 2.5 s and a = 11.2 ft/s²; these reproduce the Green Book design values.']
  },
  {
    id: 'dsd', kind: 'formula', topic: 'sight', title: 'Decision sight distance (DSD)',
    aliases: ['DSD', 'avoidance maneuver', 'pre-maneuver time', '3-4', '3-5'], cite: ['gb323'],
    eq: ['Maneuvers A, B (stop):   DSD = 1.47·V·t + 1.075·V² / a   (Eq. 3-4)', 'Maneuvers C, D, E (speed, path or direction change):   DSD = 1.47·V·t   (Eq. 3-5)'],
    vars: [speedVar,
      { k: 'M', label: 'Avoidance maneuver', options: Object.entries(G.dsd).map(([k, d]) => ({ value: k, label: d.label })), value: 'A' },
      { k: 't', label: 'Pre-maneuver time t', unit: 's', value: 3.0, min: 3, max: 14.5, step: 0.1 }],
    consts: [['t', 'Pre-maneuver time: A 3.0 s; B 9.1 s; C 10.2–11.2 s; D 12.1–12.9 s; E 14.0–14.5 s', ''], ['a', 'Deceleration rate', `${G.decel} ft/s²`]],
    link: (v, changed) => { if (changed !== 'M') return null; const t = G.dsd[v.M].t; return { t: Array.isArray(t) ? t[0] : t }; },
    compute: (v) => {
      const r = f.dsd(v.M, v.V, v.t);
      const t = G.dsd[v.M].t;
      return [
        { label: 'Pre-maneuver time range for this maneuver', value: Array.isArray(t) ? `${t[0]}–${t[1]}` : t, unit: 's' },
        { label: 'Computed DSD', value: f.fmt1(r.raw), unit: 'ft' },
        { label: 'Design DSD (rounded up to 5 ft)', value: r.design, unit: 'ft', strong: true }
      ];
    },
    notes: ['The Green Book tabulates one design value per speed within each time range; the calculator lets you choose t within the range.']
  },
  {
    id: 'psd', kind: 'table', topic: 'sight', title: 'Passing sight distance (two-lane highways)',
    aliases: ['PSD', 'passing zone', 'Table 3-4'], cite: ['gb324'],
    cols: ['Design speed (mph)', 'Design PSD (ft)', 'Crest K for PSD (S < L)'],
    rows: () => Object.entries(G.psd.values).map(([V, d]) => [+V, d, f.kDesign(f.kPass(d))]),
    keyIndex: 0,
    unverified: 'Passing sight distance values are the 2018 Green Book design values (Table 3-4) transcribed from memory; confirm against the printed table.',
    notes: ['The 2018 values come from the revised passing model (passing driver eye 3.5 ft, opposing vehicle 3.5 ft). They are much shorter than the 2011 edition values.', 'Crest K for passing: K = S² / 2800 with h1 = h2 = 3.5 ft.']
  },
  {
    id: 'isd', kind: 'formula', topic: 'sight', title: 'Intersection sight distance (ISD)',
    aliases: ['ISD', 'sight triangle', 'time gap', 'Case B1', 'Case B2', 'Case B3', 'Case F', '9-1'], cite: ['gb953'],
    eq: ['ISD = 1.47·V(major)·t_g   (Eq. 9-1)'],
    vars: [{ ...speedVar, label: 'Major road design speed' },
      { k: 'K', label: 'Case', options: Object.entries(G.isd).map(([k, d]) => ({ value: k, label: d.label })), value: 'B1' },
      { k: 'veh', label: 'Design vehicle', options: [{ value: 'P', label: 'Passenger car' }, { value: 'SU', label: 'Single-unit truck' }, { value: 'WB', label: 'Combination truck' }], value: 'P' },
      { k: 'lanes', label: 'Additional lanes crossed (beyond one)', unit: 'lanes', value: 0, min: 0, max: 5, step: 1 },
      { k: 'grade', label: 'Upgrade on the minor approach', unit: '%', value: 0, min: 0, max: 10, step: 0.5 }],
    consts: [['t_g', 'Time gap: B1 (left from stop) P 7.5 s, SU 9.5 s, WB 11.5 s; B2 (right from stop) and B3 (crossing) P 6.5 s, SU 8.5 s, WB 10.5 s; F (left from major) P 5.5 s, SU 6.5 s, WB 7.5 s', ''],
      ['', 'Add 0.5 s (car) or 0.7 s (truck) per additional lane crossed (not for B2); add 0.2 s (B1) or 0.1 s (B2, B3) per percent of minor-road upgrade above 3 %', ''],
      ['', `Decision point ${G.isdDecisionPoint} ft from the edge of the major-road traveled way (${G.isdDecisionPointDesirable} ft desirable)`, '']],
    compute: (v) => {
      const r = f.isd(v.K, v.veh, v.V, v.lanes, v.K === 'F' ? 0 : v.grade);
      return [
        { label: 'Time gap t_g', value: r.tg.toFixed(1), unit: 's' },
        { label: 'Computed ISD', value: f.fmt1(r.isd), unit: 'ft' },
        { label: 'Design ISD (rounded up to 5 ft)', value: r.design, unit: 'ft', strong: true }
      ];
    },
    sketch: 'isd',
    notes: ['Sight triangle legs are measured along the major road from the minor-road decision point; the triangle is kept clear above about 3.5 ft (object height 3.5 ft for ISD).', 'Case A (no control) and Cases C, D, E (yield, signal, all-way stop) follow §9.5.3 separately.']
  },
  {
    id: 'isdTable', kind: 'table', topic: 'sight', title: 'Design ISD by speed, passenger car',
    aliases: ['ISD table', 'Table 9-5', 'Table 9-7', 'Table 9-15'], cite: ['gb953'],
    cols: ['Major road speed (mph)', 'B1 left from stop (ft)', 'B2 right / B3 crossing (ft)', 'F left from major (ft)'],
    rows: () => C.speeds.map((V) => [V, f.isd('B1', 'P', V).design, f.isd('B2', 'P', V).design, f.isd('F', 'P', V).design]),
    keyIndex: 0
  }
];
