/* Pedestrian facilities: PROWAG 2023 final rule. */
import { C } from '../criteria.js';

const P = C.prowag;
const inch = (x) => `${x} in`;

export default [
  {
    id: 'par', kind: 'constants', topic: 'ped', title: 'Pedestrian access route (PAR)',
    aliases: ['sidewalk width', 'clear width', 'passing space', 'running slope', 'cross slope', 'vertical discontinuity', 'R302', 'ADA sidewalk'],
    cite: ['pr302'],
    items: [
      { label: 'Continuous clear width', value: `${inch(P.par.clearWidth)} (4.0 ft) minimum`, note: 'R302.3. Excludes the curb; 5 ft sidewalks are typical to avoid passing spaces.' },
      { label: 'Passing spaces', value: `${inch(P.par.passingSpace)} × ${inch(P.par.passingSpace)} at least every ${P.par.passingInterval} ft`, note: 'R302.4, where the clear width is less than 5 ft.' },
      { label: 'Running slope', value: `${P.par.runningSlopeMax} % maximum`, note: 'R302.5. Within a street or highway right-of-way the PAR may follow the general grade of the adjacent roadway (R302.5.1).' },
      { label: 'Cross slope', value: `${P.par.crossSlopeMax} % maximum`, note: 'R302.6.' },
      { label: 'Cross slope at crossings without stop or yield control', value: `${P.par.crossSlopeUncontrolled} % maximum`, note: 'R302.6.2. At midblock crossings the cross slope may equal the street grade (R302.6.1).' },
      { label: 'Vertical surface discontinuity', value: `${P.par.verticalMax} in maximum; ${P.par.verticalMax}–${P.par.verticalBevelMax} in beveled at ${P.par.bevelSlope}`, note: 'R302.7.2.' },
      { label: 'Horizontal openings (grates, joints)', value: `${P.par.openingMax} in maximum`, note: 'R302.7.3; elongated openings perpendicular to travel.' },
      { label: 'Surface', value: 'firm, stable and slip resistant', note: 'R302.7.' }
    ]
  },
  {
    id: 'curbRamp', kind: 'constants', topic: 'ped', title: 'Curb ramps and blended transitions',
    aliases: ['curb ramp', 'ramp slope', '8.33', 'landing', 'turning space', 'flare', 'counter slope', 'blended transition', 'R304'],
    cite: ['pr304'],
    items: [
      { label: 'Ramp running slope', value: `${P.curbRamp.runningSlopeMin} % to ${P.curbRamp.runningSlopeMax} % (1:12)`, note: `R304.2.2, R304.3.2. Need not exceed ${P.curbRamp.lengthNotRequiredBeyond} ft in length where site constraints require.` },
      { label: 'Ramp cross slope', value: `${P.curbRamp.crossSlopeMax} % maximum`, note: 'R304.5.3. At midblock crossings it may match the street grade.' },
      { label: 'Clear width of ramp run', value: `${inch(P.curbRamp.clearWidth)} minimum`, note: 'R304.5.1.' },
      { label: 'Turning space (landing)', value: `${inch(P.curbRamp.turningSpace)} × ${inch(P.curbRamp.turningSpace)} minimum; ${inch(P.curbRamp.turningSpace)} × ${inch(P.curbRamp.turningSpaceConstrained)} where constrained at the back of curb`, note: 'R304.2.1 (perpendicular, at the top), R304.3.1 (parallel, at the bottom). Slope 2 % maximum in all directions.' },
      { label: 'Flared sides', value: `${P.curbRamp.flareSlopeMax} % maximum`, note: 'R304.2.3, measured parallel to the curb; required where pedestrians could walk across the ramp.' },
      { label: 'Counter slope of the gutter or street at the foot', value: `${P.curbRamp.counterSlopeMax} % maximum`, note: 'R304.5.4.' },
      { label: 'Blended transition running slope', value: `${P.curbRamp.blendedTransitionSlopeMax} % maximum`, note: 'R304.4.1.' },
      { label: 'Grade breaks', value: 'perpendicular to the direction of travel; none on the ramp run', note: 'R304.5.2.' },
      { label: 'Clear space at the bottom', value: `${inch(P.curbRamp.turningSpace)} × ${inch(P.curbRamp.turningSpace)} within the crosswalk, outside parallel traffic`, note: 'R304.5.5.' }
    ],
    unverified: 'Subsection numbers within R304 (flares, clear width) are from memory; the values are not in doubt.'
  },
  {
    id: 'detectable', kind: 'constants', topic: 'ped', title: 'Detectable warning surfaces',
    aliases: ['truncated domes', 'detectable warning', 'DWS', 'R305'],
    cite: ['pr305'],
    items: [
      { label: 'Depth in the direction of travel', value: `${inch(P.detectable.depth)} minimum`, note: 'R305.2.1.' },
      { label: 'Width', value: P.detectable.widthRule, note: 'R305.2.1, R305.2.2.' },
      { label: 'Placement at curb ramps', value: `at the back of curb; where the ramp or blended transition meets the street, within ${P.detectable.setback[0]}–${P.detectable.setback[1]} in of the curb line`, note: 'R305.2.1.' },
      { label: 'Dome base diameter', value: `${P.detectable.domeBase[0]}–${P.detectable.domeBase[1]} in`, note: 'R305.1.1.' },
      { label: 'Dome top diameter', value: P.detectable.domeTop },
      { label: 'Dome height', value: inch(P.detectable.domeHeight) },
      { label: 'Dome center-to-center spacing', value: `${P.detectable.domeCenterSpacing[0]}–${P.detectable.domeCenterSpacing[1]} in` },
      { label: 'Dome base-to-base spacing', value: `${inch(P.detectable.domeBaseSpacing)} minimum` },
      { label: 'Contrast', value: P.detectable.contrast },
      { label: 'Also required at', value: 'rail crossings (R305.2.4), boarding platforms, and the edge of blended transitions', note: 'R305.2.' }
    ],
    unverified: 'The 6–8 in setback rule and sub-section numbers are from memory; confirm against R305.2.'
  },
  {
    id: 'crossings', kind: 'constants', topic: 'ped', title: 'Street crossings and pedestrian signals',
    aliases: ['crosswalk', 'pedestrian signal', 'walk speed', '3.5 ft/s', 'APS', 'accessible pedestrian signal', 'pushbutton', 'reach range', 'R306', 'R209'],
    cite: ['pr306', 'pr403'],
    items: [
      { label: 'Pedestrian clearance walking speed', value: `${P.crossing.walkSpeed} ft/s`, note: 'MUTCD §4I.06 (11th ed. renumbering to verify); slower where justified.' },
      { label: 'Crosswalk cross slope', value: '2 % at stop- or yield-controlled approaches; 5 % uncontrolled; street grade at midblock', note: 'R302.6.' },
      { label: 'Accessible pedestrian signals and detectors', value: 'required at new and altered pedestrian signals', note: 'R209, R306.' },
      { label: 'Pushbutton reach range', value: `${P.operable.reachMin}–${P.operable.reachMax} in above the ground surface`, note: 'R403.' },
      { label: 'Pushbutton operating force', value: `${P.operable.forceMax} lbf maximum` },
      { label: 'Pushbutton size', value: `${P.operable.buttonMinSize} in minimum in one dimension`, note: 'R209.' },
      { label: 'Clear space at the pushbutton', value: '30 × 48 in, with a 2 % maximum slope', note: 'R403.' },
      { label: 'Medians and pedestrian refuge islands', value: `PAR through the island, ${inch(P.par.clearWidth)} wide, 6 ft long minimum`, note: 'R306.' }
    ],
    unverified: 'Pushbutton size and the island length are from memory; confirm against R209 and R306.'
  },
  {
    id: 'ramps', kind: 'constants', topic: 'ped', title: 'Ramps, stairs and handrails',
    aliases: ['ramp', 'rise', 'landing', 'handrail', 'stair', 'riser', 'tread', 'R407', 'R408', 'R409'],
    cite: ['pr407', 'pr408', 'pr409'],
    items: [
      { label: 'Ramp running slope', value: `${P.ramp.slopeMax} % (1:12) maximum`, note: 'R407.2.' },
      { label: 'Ramp cross slope', value: `${P.ramp.crossSlopeMax} % maximum`, note: 'R407.3.' },
      { label: 'Ramp clear width', value: `${inch(P.ramp.clearWidth)} minimum`, note: 'R407.4.' },
      { label: 'Maximum rise per run', value: `${inch(P.ramp.riseMax)}`, note: 'R407.5.' },
      { label: 'Landings', value: `at top and bottom of each run; ${inch(P.ramp.landingLength)} long, at least as wide as the ramp; 60 × 60 in where the direction changes`, note: 'R407.6.' },
      { label: 'Handrails on ramps', value: `both sides where the rise exceeds ${inch(P.ramp.handrailRise)}`, note: 'R407.7.' },
      { label: 'Handrail height', value: `${P.handrail.height[0]}–${P.handrail.height[1]} in above the surface`, note: 'R409.' },
      { label: 'Handrail extensions', value: `${inch(P.handrail.extension)} horizontal beyond the top and bottom of ramps`, note: 'R409.' },
      { label: 'Handrail gripping surface', value: `${P.handrail.gripDiameter[0]}–${P.handrail.gripDiameter[1]} in circular diameter` },
      { label: 'Stair risers and treads', value: `risers ${P.stairs.riserRange[0]}–${P.stairs.riserRange[1]} in; treads ${inch(P.stairs.treadMin)} minimum; uniform`, note: 'R408.' },
      { label: 'Stair nosings', value: `${P.stairs.nosingMax} in maximum projection; no open risers` }
    ],
    unverified: 'Stair riser and tread limits are from memory of R408; confirm.'
  },
  {
    id: 'protruding', kind: 'constants', topic: 'ped', title: 'Protruding objects and headroom',
    aliases: ['protruding object', 'headroom', '80 in', '27 in', 'post-mounted', 'R402'],
    cite: ['pr402'],
    items: [
      { label: 'Maximum projection into the circulation path', value: `${inch(P.protruding.maxProjection)}`, note: `For objects with leading edges between ${P.protruding.zone[0]} and ${P.protruding.zone[1]} in above the surface (R402.2).` },
      { label: 'Post-mounted objects', value: '4 in maximum overhang where the leading edge is 27–80 in high; 12 in between posts more than 12 in apart', note: 'R402.3.' },
      { label: 'Vertical clearance (headroom)', value: `${inch(P.protruding.headroom)} minimum`, note: 'R402.4; provide a cane-detectable barrier where lower.' },
      { label: 'Objects 27 in or lower', value: 'may protrude any amount (cane detectable)', note: 'R402.2.' }
    ]
  },
  {
    id: 'parking', kind: 'table', topic: 'ped', title: 'Accessible on-street parking spaces required',
    aliases: ['on-street parking', 'accessible parking', 'R214'], cite: ['pr214'],
    cols: ['Marked or metered spaces on the block perimeter', 'Accessible spaces required'],
    rows: () => [...P.parking.rows.map(([lo, hi, n]) => [`${lo}–${hi}`, n]), ['201 and over', P.parking.over200]],
    unverified: 'R214 counts are from memory; confirm against the rule text.',
    notes: ['Accessible spaces: 8 ft wide minimum parallel spaces with a 5 ft access aisle at street level, or 20 ft long where the sidewalk is narrow; PAR connection required (R309).']
  }
];
