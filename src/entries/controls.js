/* Design controls: the constants behind the sight distance and alignment equations, and basic conversions. */
import { C } from '../criteria.js';

const G = C.gb;

export default [
  {
    id: 'gbConstants', kind: 'constants', topic: 'controls', title: 'AASHTO design constants',
    aliases: ['perception reaction time', 'PRT', 'deceleration', 'eye height', 'object height', 'headlight', '1.47', '32.2'],
    cite: ['gb322', 'gb346'],
    items: [
      { label: 'Brake reaction time t', value: `${G.prt} s`, note: 'Used for stopping sight distance; 90th-percentile driver (§3.2.2).' },
      { label: 'Deceleration rate a', value: `${G.decel} ft/s²`, note: 'Comfortable deceleration on wet pavement, within most drivers\' capability (§3.2.2).' },
      { label: 'Speed conversion', value: '1 mph = 1.47 ft/s', note: 'Green Book rounds 1.4667 to 1.47 in its equations.' },
      { label: 'Gravitational acceleration g', value: `${G.g} ft/s²` },
      { label: 'Driver eye height, passenger car h1', value: `${G.h1} ft`, note: '§3.2.1' },
      { label: 'Driver eye height, truck', value: `${G.h1Truck} ft`, note: '§3.2.1' },
      { label: 'Object height for SSD h2', value: `${G.h2} ft`, note: 'Tail-light height (§3.2.1).' },
      { label: 'Object height for passing sight distance', value: `${G.h2Pass} ft`, note: 'Opposing vehicle (§3.2.4).' },
      { label: 'Object height for intersection sight distance', value: '3.5 ft', note: 'Approaching vehicle (§9.5.3).' },
      { label: 'Headlight height and beam divergence', value: `${G.headlight} ft, ${G.beam}° upward`, note: 'Sag vertical curves (§3.4.6).' },
      { label: 'Crest K denominator 200(√h1 + √h2)²', value: `${G.kCrestDen}`, note: 'With h1 = 3.5 ft, h2 = 2.0 ft.' },
      { label: 'Passing crest K denominator', value: `${G.kPassDen}`, note: 'With h1 = h2 = 3.5 ft.' },
      { label: 'Sag comfort criterion', value: 'K = V² / 46.5', note: 'Centripetal acceleration 1 ft/s²; applies where headlight sight distance is not controlling, e.g. lit sags (§3.4.6).' },
      { label: 'Minimum vertical curve length for appearance', value: 'L = 3·V (ft, V in mph)', note: '§3.4.6' },
      { label: 'Design value rounding', value: 'SSD and ISD up to 5 ft; K up to the next whole number', note: 'Green Book practice.' }
    ]
  },
  {
    id: 'frictionTable', kind: 'table', topic: 'controls', title: 'Maximum side friction factor f by design speed',
    aliases: ['side friction', 'f max', 'Table 3-7'], cite: ['gb333'],
    cols: ['Design speed (mph)', 'f max'],
    rows: () => C.speeds.map((V) => [V, G.f[V].toFixed(2)]),
    keyIndex: 0,
    notes: ['Low-speed urban streets (≤ 45 mph) use the same f values in the 7th edition (§3.3.3 and §3.3.11).']
  },
  {
    id: 'relGradTable', kind: 'table', topic: 'controls', title: 'Maximum relative gradient Δ for superelevation runoff',
    aliases: ['relative gradient', 'Table 3-15', 'runoff rate'], cite: ['gb338'],
    cols: ['Design speed (mph)', 'Δ (%)', 'Equivalent slope (1:x)'],
    rows: () => C.speeds.map((V) => [V, G.relGrad[V].toFixed(2), Math.round(100 / G.relGrad[V])]),
    keyIndex: 0,
    notes: ['Δ is the maximum grade of the pavement edge relative to the axis of rotation. Multiply the runoff by bw for more than one lane rotated: 1 lane 1.00, 2 lanes 0.75, 3 lanes 0.67 (Table 3-16).']
  },
  {
    id: 'crossSection', kind: 'constants', topic: 'controls', title: 'Cross slope, minimum grade and clearance',
    aliases: ['cross slope', 'minimum grade', 'vertical clearance', 'lane width', 'crown'],
    cite: ['gb42', 'gb344', 'gb3415'],
    unverified: 'Vertical clearance values and the 6 in resurfacing allowance are from memory; confirm against GB §3.4 and TDOT RDG Chapter 2 structure clearance criteria.',
    items: [
      { label: 'Cross slope, high-type pavement', value: `${G.crossSlope.highType[0]}–${G.crossSlope.highType[1]} %`, note: '2 % typical for TDOT (§4.2.2).' },
      { label: 'Cross slope, intermediate-type pavement', value: `${G.crossSlope.intermediate[0]}–${G.crossSlope.intermediate[1]} %` },
      { label: 'Cross slope, low-type pavement', value: `${G.crossSlope.lowType[0]}–${G.crossSlope.lowType[1]} %` },
      { label: 'Minimum longitudinal grade, curbed pavement', value: `${G.minGrade.curbed} %`, note: `${G.minGrade.highType} % may be used with high-type pavement and good drainage (§3.4.4).` },
      { label: 'Lane width range', value: `${G.laneWidth.range[0]}–${G.laneWidth.range[1]} ft`, note: `${G.laneWidth.arterial} ft on arterials and freeways (§4.3).` },
      { label: 'Vertical clearance, freeways and arterials', value: `${G.vertClearance.freeway} ft`, note: `Plus ${G.vertClearance.resurfacing * 12} in allowance for future resurfacing.` },
      { label: 'Vertical clearance, collectors and local roads', value: `${G.vertClearance.local} ft minimum`, note: `Plus ${G.vertClearance.resurfacing * 12} in for resurfacing.` },
      { label: 'Vertical clearance, pedestrian bridges and sign trusses', value: `${G.vertClearance.pedestrianBridge} ft` }
    ]
  }
];
