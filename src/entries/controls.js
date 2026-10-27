/* Design controls: the constants behind the sight distance and alignment equations, and basic conversions. */
import { C } from '../criteria.js';

const G = C.gb, T = C.tdot2;

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
    id: 'crossSection', kind: 'constants', topic: 'controls', title: 'Cross slope, shoulders, minimum grade and vertical clearance',
    aliases: ['cross slope', 'minimum grade', 'vertical clearance', 'lane width', 'crown', 'shoulder', 'paved shoulder', 'rollover', 'bridge clearance', '2-101', '2-102.05'],
    cite: ['tdot210104', 'tdot210103', 'tdot210205', 'gb42', 'gb344'],
    items: [
      { label: 'Normal crown (TDOT)', value: `${Math.abs(T.normalCrown * 100)} % (${T.normalCrown} ft/ft)`, note: 'Travel lanes outside superelevated sections (§2-101.04). Lane and shoulder slopes by classification are on the RD18-TS series.' },
      { label: 'Shoulder cross slope (TDOT)', value: `usually ${Math.abs(T.shoulderSlope * 100)} % (${T.shoulderSlope} ft/ft)`, note: `Algebraic difference between shoulder and pavement slopes not more than ${T.shoulderBreakMax} ft/ft (§2-101.04).` },
      { label: 'Paved portion of rural shoulders (TDOT)', value: `12 ft shoulder: ${T.shoulderPaved[12]} ft paved; 6 ft: ${T.shoulderPaved[6]} ft paved; under ${T.shoulderPaved.fullyPavedBelow} ft: fully paved`, note: '§2-101.03. Initial spread calculations may use the full shoulder plus half a travel lane.' },
      { label: 'Cross slope, high-type pavement (AASHTO)', value: `${G.crossSlope.highType[0]}–${G.crossSlope.highType[1]} %`, note: 'GB §4.2.2.' },
      { label: 'Cross slope, intermediate and low-type pavement (AASHTO)', value: `${G.crossSlope.intermediate[0]}–${G.crossSlope.intermediate[1]} % and ${G.crossSlope.lowType[0]}–${G.crossSlope.lowType[1]} %` },
      { label: 'Minimum longitudinal grade, curbed pavement (AASHTO)', value: `${G.minGrade.curbed} %`, note: `${G.minGrade.highType} % may be used with high-type pavement and good drainage (GB §3.4.4).` },
      { label: 'Lane width (AASHTO)', value: `${G.laneWidth.range[0]}–${G.laneWidth.range[1]} ft; ${G.laneWidth.arterial} ft on arterials and freeways`, note: 'TDOT widths by classification are on the RD-CTS series (§2-101.02).' },
      { label: 'Vertical clearance, all structures on all systems (TDOT)', value: `${T.vertClearance.structures} ft minimum over the entire roadway width including usable shoulder`, note: `Plus ${T.vertClearance.resurfacing * 12} in for future resurfacing (§2-102.05). Less requires a Design Exception with a joint cost analysis.` },
      { label: 'Vertical clearance, sign trusses and pedestrian overpasses (TDOT)', value: `${T.vertClearance.signTruss} ft`, note: `Also ${T.vertClearance.throughTruss} ft from deck to cross bracing on through trusses. Plus 6 in for resurfacing.` },
      { label: 'Vertical clearance over railroads (TDOT)', value: `${T.vertClearance.railroad} ft from the structure to top of rail`, note: 'Plus 6 in for resurfacing.' }
    ]
  },
  {
    id: 'exceptions', kind: 'constants', topic: 'controls', title: 'TDOT controlling criteria, design exceptions and waivers',
    aliases: ['controlling criteria', 'design exception', 'design waiver', 'Type I', 'Type II', 'FHWA review', 'NHS', '2-100', '2-105', '2-201'],
    cite: ['tdot2100', 'tdot2105', 'tdot2201'],
    items: [
      { label: 'The 10 FHWA controlling criteria', value: T.controlling.join(', '), note: 'A formal Design Exception is required when any cannot be met (§2-100).' },
      { label: 'Type I exception', value: T.typeI.join(', '), note: 'Rare; all NHS roadways may need FHWA review; Design Division Director gives final approval (§2-105).' },
      { label: 'Type II exception', value: T.typeII.join(', '), note: `NHS roadways with design speed ≥ ${T.fhwaReviewSpeed} mph may need FHWA review; non-NHS approved by the Design Division Director.` },
      { label: 'Design Waiver (non-controlling criteria)', value: T.waiverItems.join(', ') + ', and any other variance from the Standard Drawings', note: 'Approved by the Regional Preconstruction Director (§2-201).' },
      { label: 'Where approvals are noted', value: 'lower right corner of the title sheet and the Functional Design cover sheet, with approval date' },
      { label: 'Projects of limited scope', value: 'safety and operational projects with little or no roadway work may proceed without exceptions for elements beyond their scope (23 CFR 625.3(e))', note: 'Title sheet note "Project of Limited Scope".' },
      { label: 'Design exception narrative must address', value: 'crash data; effect on safety and operation; mitigation; compatibility with adjacent sections; cost of full vs. reduced standard; long-term effect; difficulty of the full standard; capacity or operational effects; level of service; cumulative effect of multiple reductions; future correction' }
    ]
  },
  {
    id: 'designVehicle', kind: 'constants', topic: 'controls', title: 'TDOT design vehicle selection',
    aliases: ['design vehicle', 'CITY-BUS', 'S-BUS-40', 'WB-67', 'school bus', 'turning template', '2-200.05'],
    cite: ['tdot220005'],
    items: [
      { label: 'Urban areas', value: T.designVehicle.urban, note: 'Public transportation vehicle.' },
      { label: 'Rural and suburban areas', value: T.designVehicle.ruralSuburban, note: 'Large school bus.' },
      { label: 'Truck traffic 2 % or more', value: `${T.designVehicle.truck} semi-truck`, note: 'Evaluate for both rural and urban areas when the traffic report shows ≥ 2 % trucks.' },
      { label: 'Where it matters', value: 'anywhere the vehicle turns through an intersection', note: 'Turning templates on the RD18-SD series. Inability to meet the design vehicle needs a Design Waiver.' }
    ]
  }
];
