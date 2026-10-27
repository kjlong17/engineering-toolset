/* Pedestrian facilities: PROWAG 2023 final rule and TDOT RDG Chapter 3, Multimodal Design. */
import { C } from '../criteria.js';

const P = C.prowag, T = C.tdot3;
const inch = (x) => `${x} in`;

export default [
  {
    id: 'par', kind: 'constants', topic: 'ped', title: 'Pedestrian access route (PAR)',
    aliases: ['sidewalk width', 'clear width', 'passing space', 'running slope', 'cross slope', 'vertical discontinuity', 'R302', 'ADA sidewalk'],
    cite: ['pr302', 't3403'],
    items: [
      { label: 'Continuous clear width (PROWAG)', value: `${inch(P.par.clearWidth)} (4.0 ft) minimum`, note: 'R302.3. Excludes the curb.' },
      { label: 'Sidewalk width (TDOT)', value: `${T.sidewalk.width} ft minimum clear; ${T.sidewalk.widthCommercial} ft recommended in commercial areas; ${T.sidewalk.widthConstrained} ft only with a Design Waiver`, note: '§3-403. The 4 ft clear width must be kept around signposts, luminaire and signal poles.' },
      { label: 'Passing spaces (PROWAG)', value: `${inch(P.par.passingSpace)} × ${inch(P.par.passingSpace)} at least every ${P.par.passingInterval} ft`, note: 'R302.4, where the clear width is less than 5 ft.' },
      { label: 'Running slope (PROWAG and TDOT)', value: `${P.par.runningSlopeMax} % maximum`, note: 'R302.5, §3-403. Within a street or highway right-of-way the PAR may match, but not exceed, the general grade of the adjacent roadway.' },
      { label: 'Cross slope (PROWAG)', value: `${P.par.crossSlopeMax} % maximum`, note: 'R302.6.' },
      { label: 'Cross slope (TDOT)', value: `${T.sidewalk.crossSlope} % standard; ${T.sidewalk.crossSlopeRange[0]}–${T.sidewalk.crossSlopeRange[1]} % allowable`, note: '§3-403. 1.5 % allows for construction tolerance; below 1 % water does not shed. The 1.5 % maximum applies across driveways.' },
      { label: 'Cross slope at crossings without stop or yield control', value: `${P.par.crossSlopeUncontrolled} % maximum`, note: 'R302.6.2. At midblock crossings the cross slope may equal the street grade (R302.6.1).' },
      { label: 'Vertical surface discontinuity', value: `${P.par.verticalMax} in maximum; ${P.par.verticalMax}–${P.par.verticalBevelMax} in beveled at ${P.par.bevelSlope}`, note: 'R302.7.2. TDOT §3-405.60: crosswalk joints under ½ in, lips under ¼ in.' },
      { label: 'Horizontal openings (grates, joints)', value: `${P.par.openingMax} in maximum`, note: 'R302.7.3; elongated openings perpendicular to travel.' },
      { label: 'Surface', value: 'firm, stable and slip resistant', note: 'R302.7. TDOT: asphalt or concrete; no brick, granite or cobblestone in accessible pathways (§3-405.40).' },
      { label: 'Sidewalk on non-curbed roadways (TDOT)', value: `at least ${T.sidewalk.nonCurbedOffset} ft from the outside edge of shoulder; on the far side of any ditch`, note: '§3-404. Consider a barrier where the sidewalk is inside the clear zone of a high-speed road.' }
    ]
  },
  {
    id: 'sidewalkWidthTable', kind: 'table', topic: 'ped', title: 'TDOT minimum pedestrian route widths (Table 3-1)',
    aliases: ['Table 3-1', 'sidewalk width by classification', 'shared-use path width', '3-402'], cite: ['t3402'],
    cols: ['Roadway classification / context', 'Facility', 'Minimum width'],
    rows: () => T.sidewalk.table31,
    notes: ['Minimum widths; 5 ft is the floor everywhere. Sidewalks are typically on both sides; a shared-use path is typically on one side, with a sidewalk opposite where needed. Shared-use paths not adjacent to a roadway have a 5 % maximum running grade.']
  },
  {
    id: 'bufferTable', kind: 'table', topic: 'ped', title: 'TDOT pedestrian route buffer from the traveled way (Table 3-2)',
    aliases: ['Table 3-2', 'buffer', 'separation', 'planting strip', 'furnishing zone', '3-402'], cite: ['t3402', 't3600'],
    cols: ['Posted speed', 'Buffer minimum (ft)', 'Buffer preferred (ft)'],
    rows: () => T.sidewalk.table32,
    notes: [`At 35 mph and below no sidewalk buffer is required, but a shared-use path still needs ${T.sidewalk.pathBufferMin} ft from the travel lane (§3-606). On rural sections with a paved shoulder the buffer is ${T.sidewalk.bufferRuralShoulder} ft from the edge of the traveled lane or the table value, whichever is greater; a ${T.sidewalk.bufferConstrained45} ft minimum at 45 mph and above is allowed with a Design Waiver. Shoulders, bike lanes and parking lanes count toward the buffer; where it cannot be attained a physical barrier is needed.`]
  },
  {
    id: 'curbRamp', kind: 'constants', topic: 'ped', title: 'Curb ramps and blended transitions',
    aliases: ['curb ramp', 'ramp slope', '8.33', 'landing', 'turning space', 'flare', 'counter slope', 'blended transition', 'R304', '3-406', 'CR series'],
    cite: ['pr304', 't3406'],
    items: [
      { label: 'Ramp running slope', value: `${P.curbRamp.runningSlopeMin} % to ${P.curbRamp.runningSlopeMax} % (1:12)`, note: `R304.2.2, R304.3.2; TDOT §3-406. Need not exceed ${P.curbRamp.lengthNotRequiredBeyond} ft in length.` },
      { label: 'Ramp cross slope', value: `${P.curbRamp.crossSlopeMax} % maximum`, note: 'R304.5.3. At midblock crossings it may match the street grade.' },
      { label: 'Clear width of ramp run', value: `${inch(P.curbRamp.clearWidth)} minimum`, note: 'R304.5.1. TDOT: 5 ft ramps get 5 ft wide truncated domes.' },
      { label: 'Turning space (landing)', value: `${inch(P.curbRamp.turningSpace)} × ${inch(P.curbRamp.turningSpace)} minimum; ${inch(P.curbRamp.turningSpace)} × ${inch(P.curbRamp.turningSpaceConstrained)} where constrained at the back of curb`, note: 'R304.2.1 (perpendicular, at the top), R304.3.1 (parallel, at the bottom). Slope 2 % maximum in all directions.' },
      { label: 'Flared sides', value: `${P.curbRamp.flareSlopeMax} % maximum`, note: 'R304.2.3, measured parallel to the curb; required where pedestrians could walk across the ramp.' },
      { label: 'Counter slope of the gutter or street at the foot', value: `${P.curbRamp.counterSlopeMax} % maximum`, note: 'R304.5.4.' },
      { label: 'Blended transition running slope', value: `less than ${P.curbRamp.blendedTransitionSlopeMax} %`, note: 'R304.4.1; TDOT §3-406.' },
      { label: 'Grade breaks', value: 'perpendicular to the direction of travel; none on the ramp run', note: 'R304.5.2.' },
      { label: 'Clear space at the bottom', value: `${inch(P.curbRamp.turningSpace)} × ${inch(P.curbRamp.turningSpace)} within the crosswalk, outside parallel traffic`, note: 'R304.5.5.' },
      { label: 'TDOT ramp type and layout', value: 'perpendicular ramps preferred; two ramps per corner; parallel, blended and lowered-corner ramps where right-of-way is constrained', note: '§3-406. Single or radial ramps only in alterations with physical constraints, and never directing pedestrians into moving traffic. Broom finish only. Show the CR-series drawing number and all features at each corner.' },
      { label: 'Quantities', value: 'estimate for a 90° intersection on 0 % grade', note: '§3-406.' }
    ],
    unverified: 'PROWAG sub-section numbers within R304 (flares, clear width) are from memory; the values are not in doubt and the TDOT items are from Chapter 3.'
  },
  {
    id: 'detectable', kind: 'constants', topic: 'ped', title: 'Detectable warning surfaces',
    aliases: ['truncated domes', 'detectable warning', 'DWS', 'R305', 'CR-DWS-1'],
    cite: ['pr305', 't3406'],
    items: [
      { label: 'Depth in the direction of travel', value: `${inch(P.detectable.depth)} (${T.curbRamp.dwsDepth} ft) minimum`, note: 'R305.2.1; TDOT §3-406.' },
      { label: 'Width', value: 'full width of the curb ramp run, blended transition or shared-use path', note: 'R305.2; TDOT: full width of any flush transition from ramp to roadway.' },
      { label: 'Placement at curb ramps', value: `at the back of curb; where the ramp or blended transition meets the street, within ${P.detectable.setback[0]}–${P.detectable.setback[1]} in of the curb line`, note: 'R305.2.1.' },
      { label: 'Refuge islands (TDOT)', value: `required on cut-through islands ${T.curbRamp.refugeMinForDws} ft or longer: ${T.curbRamp.dwsDepth} ft on each side separated by at least ${T.curbRamp.dwsSeparation} ft without domes; omitted on shorter islands, where the signal is then timed for a full crossing`, note: '§3-406.' },
      { label: 'Driveways (TDOT)', value: 'not at residential driveways; consider at two-way commercial driveways, stop- or yield-controlled driveways and driveways that function like streets', note: '§3-406.' },
      { label: 'Material (TDOT)', value: 'yellow rigid composite polymer plate; cast-in-place preferred; no surface-applied plates on new ramps', note: '§3-406, CR-DWS-1.' },
      { label: 'Dome base diameter', value: `${P.detectable.domeBase[0]}–${P.detectable.domeBase[1]} in`, note: 'R305.1.1.' },
      { label: 'Dome top diameter', value: P.detectable.domeTop },
      { label: 'Dome height', value: inch(P.detectable.domeHeight) },
      { label: 'Dome center-to-center spacing', value: `${P.detectable.domeCenterSpacing[0]}–${P.detectable.domeCenterSpacing[1]} in` },
      { label: 'Dome base-to-base spacing', value: `${inch(P.detectable.domeBaseSpacing)} minimum` },
      { label: 'Contrast', value: P.detectable.contrast },
      { label: 'Also required at', value: 'rail crossings, boarding platforms and the edge of blended transitions', note: 'R305.2. At rail crossings TDOT places them per the MUTCD stop-line criteria (§3-411). At bicycle ramps place them at the top, not the bottom.' }
    ],
    unverified: 'The PROWAG 6–8 in setback rule and sub-section numbers are from memory; the TDOT items are from Chapter 3.'
  },
  {
    id: 'crossings', kind: 'constants', topic: 'ped', title: 'Street crossings, crosswalks and pedestrian signals',
    aliases: ['crosswalk', 'unmarked crosswalk', 'pedestrian signal', 'walk speed', '3.5 ft/s', 'APS', 'accessible pedestrian signal', 'pushbutton', 'reach range', 'R306', 'R209', '3-405', '3-410'],
    cite: ['t3405', 't3410', 'pr306', 'pr403'],
    items: [
      { label: 'Legal crosswalks in Tennessee (TCA 55-8-101(16))', value: 'the extension of sidewalk lines across an intersection, whether marked or not, and any portion marked for pedestrian crossing', note: '§3-405. An unmarked crosswalk exists only where a sidewalk continues on the opposite side or pedestrian signals exist; curb ramps alone do not create one (Figure 3-6).' },
      { label: 'Where TDOT requires crosswalk markings', value: 'state routes at signal-controlled crossings, all stop- or yield-controlled crossings, and midblock crossings; designated school crossings', note: '§3-405.20. Longitudinal (piano key) markings on all TDOT routes; see T-M-4.' },
      { label: 'Uncontrolled crossings', value: 'engineering judgment or study per MUTCD §1D.03 and §3C; no ADT or speed prohibition in the 11th edition', note: '§3-405.10. See the FHWA Guide for Improving Pedestrian Safety at Uncontrolled Crossing Locations and Table 3-3.' },
      { label: 'Crosswalk cross slope (PROWAG)', value: '2 % at stop- or yield-controlled approaches; 5 % uncontrolled; street grade at midblock', note: 'R302.6.' },
      { label: 'Textured crosswalks', value: `keep a 5 ft smooth section in the middle with transverse reflective markings; no brick, granite or cobblestone`, note: '§3-405.40.' },
      { label: 'Curb extensions', value: `extend the parking or shoulder width with the curb face about ${T.curbExtension.offsetFromThroughLane} ft from the through-lane edge line; not where they conflict with a bike lane or the design vehicle`, note: '§3-408. Bus bulbs are typically 6 ft wide (§3-703).' },
      { label: 'Pedestrian clearance walking speed', value: `${P.crossing.walkSpeed} ft/s`, note: 'MUTCD Part 4 pedestrian signal timing; slower where justified. TDOT: see the Traffic Design Manual for effective crosswalk length.' },
      { label: 'Accessible pedestrian signals (APS)', value: 'required wherever pedestrian signals are newly installed, replaced or significantly modified, with countdown displays', note: '§3-410, R209. Locator tone during Don\'t Walk; audible and vibrotactile Walk; tactile arrow; high contrast; percussive tone when buttons are 10 ft apart or more, speech message when closer.' },
      { label: 'Pushbutton location (TDOT)', value: `${T.pushbutton.fromCurb[0]}–${T.pushbutton.fromCurb[1]} ft from the curb or shoulder line (1.5–6 ft preferred); within ${T.pushbutton.fromCrosswalkLine} ft of the far crosswalk line; face parallel to the crosswalk`, note: '§3-410, Figure 3-8.' },
      { label: 'Pushbutton height and reach (TDOT)', value: `about ${T.pushbutton.height[0]} ft, not more than ${T.pushbutton.height[1]} ft; within ${T.pushbutton.reach} in of a ${T.pushbutton.clearGround[0]} × ${T.pushbutton.clearGround[1]} in clear ground space sloped ${T.pushbutton.surfaceSlope} % or less`, note: `§3-410. Two buttons on a corner at least ${T.pushbutton.separation} ft apart (${T.pushbutton.separationMedian} ft on medians); no APS in landings; keep the route 4 ft clear.` },
      { label: 'Pushbutton reach range and force (PROWAG)', value: `${P.operable.reachMin}–${P.operable.reachMax} in above grade; ${P.operable.forceMax} lbf maximum`, note: 'R403.' },
      { label: 'Signalized intersections without sidewalks', value: 'no pedestrian signals unless sidewalks are planned; where signals exist without ramps, add accessible ramps and landings', note: '§3-301.02.' }
    ],
    unverified: 'The PROWAG pushbutton size (2 in) and island length wording are from memory; the TDOT values are from Chapter 3.'
  },
  {
    id: 'midblock', kind: 'constants', topic: 'ped', title: 'Midblock crossings and refuge islands (TDOT)',
    aliases: ['midblock', 'refuge island', 'median refuge', 'HAWK', 'pedestrian hybrid beacon', 'PHB', '3-407'],
    cite: ['t3407'],
    items: [
      { label: 'Consider a raised median or refuge island where', value: `a two-way arterial over 35 mph with moderate to high ADT and high pedestrian volume; pedestrian crash history; near a school or community center; crossing distance over ${T.midblock.crossingDistanceTrigger} ft; midblock transit stops; complex intersections`, note: '§3-407.' },
      { label: 'Curbed urban and suburban sections', value: `refuge islands particularly where ADT exceeds ${f0(T.midblock.refugeMedianADT)} with intermediate or high speeds` },
      { label: 'Non-curbed sections', value: `refuge islands apply at posted speeds ≤ ${T.midblock.refugeNonCurbedPosted} mph or design speeds ≤ ${T.midblock.refugeNonCurbedDesign} mph`, note: 'Above that, clear zone criteria usually rule out median islands.' },
      { label: 'Refuge island width', value: `${T.midblock.refugeWidthDesirable} ft desirable (pedestrian 4 ft from traffic); ${T.midblock.refugeWidthAlt} ft or ${T.midblock.refugeWidthMin} ft minimum; 8 ft where a shared-use path crosses`, note: `Cut-throughs ${T.midblock.cutThroughWidth} ft wide minimum; raised, not painted; slight grade ≤ 1.5 % for drainage; ramps at 8.3 % only on large islands.` },
      { label: 'Refuge island length', value: `${T.midblock.refugeIslandLength} ft minimum (4 ft wide) to serve as a refuge`, note: 'Table 3-3 note. Detectable warnings separated by 2 ft; islands under 6 ft get none.' },
      { label: 'Pedestrian hybrid beacon (HAWK)', value: `examine where pedestrians per hour exceed ${T.midblock.hawkPedPerHour} and the 85th-percentile speed exceeds ${T.midblock.hawkSpeed85} mph`, note: `At least ${T.midblock.hawkOffsetFromSideStreet} ft from stop- or yield-controlled side streets and driveways; coordinate within a signal system; see T-M-4A to T-M-4B2 and RD18-SD.` },
      { label: 'Markings', value: 'longitudinal crosswalk markings on all midblock crossings; MUTCD §3C', note: '§3-407.' },
      { label: 'Transit stops', value: `consider midblock crosswalks at stops more than ${T.transit.midblockCrossingBeyond} mi from a signalized or stop-controlled intersection; accommodations within ${T.transit.catchmentMiles} mi of a transit facility`, note: '§3-701.' }
    ]
  },
  {
    id: 'midblockTable', kind: 'table', topic: 'ped', title: 'Midblock crosswalk recommendations (Table 3-3)',
    aliases: ['Table 3-3', 'marked crosswalk', 'uncontrolled crosswalk', 'C P N', '3-407'], cite: ['t3407'],
    cols: ['Vehicle ADT · speed limit', ...T.midblock.table33.cols],
    rows: () => T.midblock.table33.adt.flatMap((a, i) => T.midblock.table33.speeds.map((s, j) => [`${a} · ${s} mph`, ...T.midblock.table33.cells[i][j]])),
    notes: ['C = candidate for a marked crosswalk (engineering study; 20 crossings per peak hour, or 15 elderly or child pedestrians, recommended before priority). P = possible increase in crash risk with markings alone; add enhancements. N = markings alone are insufficient; use other treatments.', 'Applies to uncontrolled locations, intersection and midblock, not school crossings. Above 40 mph do not use marked crosswalks alone. A two-way left-turn lane is not a median; a raised median must be at least 4 ft wide and 6 ft long. Adapted from FHWA 2005, Table 11.']
  },
  {
    id: 'sharedUsePath', kind: 'constants', topic: 'ped', title: 'Shared-use paths (TDOT)',
    aliases: ['shared-use path', 'SUP', 'greenway', 'multi-use trail', 'path width', 'path clear zone', 'path design speed', '3-600', 'MM-TS-3'],
    cite: ['t3600'],
    items: [
      { label: 'Width', value: `${T.path.width} ft standard; ${T.path.widthConstrained} ft only with a Design Waiver and possibly a level-of-service study`, note: '§3-604.' },
      { label: 'Lateral clearance', value: `${T.path.clearEachSide} ft clear zone each side, fill slope ${T.path.clearFillSlope}:1 maximum; ${T.path.clearAtRail} ft against a pedestrian or bicycle rail`, note: '§3-607. Structures carry the path width plus 1 ft each side with a safety rail (§3-610).' },
      { label: 'Vertical clearance', value: `${T.path.vertClear} ft minimum; ${T.path.vertClearMin} ft with extreme limitations`, note: '§3-607.' },
      { label: 'Design speed', value: `${T.path.designSpeed} mph minimum`, note: '§3-601. Show design speed and capacity on the title sheet.' },
      { label: 'Minimum horizontal curve radius', value: `${T.path.radiusMin} ft`, note: `§3-603. Below 60 ft (with a waiver) place a curve warning sign at least ${T.path.curveSignAdvance} ft ahead. No superelevation; geometric design per the AASHTO Guide for the Development of Bicycle Facilities.` },
      { label: 'Cross slope', value: `${T.path.crossSlope} % standard; ${T.path.crossSlopeRange[0]}–${T.path.crossSlopeRange[1]} % allowable`, note: '§3-608. Crown on center in fill; single slope toward the fill side in cut-and-fill.' },
      { label: 'Running grade', value: `${T.path.grade} % maximum outside a roadway right-of-way; may follow the roadway grade within one`, note: '§3-602. Grade warning signs where the grade exceeds 5 %.' },
      { label: 'Offset from a curbed roadway at 45 mph or less', value: `${T.path.offsetCurbed45} ft minimum from the edge of the adjacent travel lane, including shoulder`, note: '§3-606.' },
      { label: 'Buffer from a non-curbed roadway', value: `${T.path.bufferNonCurbed} ft or Table 3-2, whichever applies; far side of any ditch; barrier where the buffer cannot be attained`, note: '§3-606. A 2 ft grass strip is preferred at driveways.' },
      { label: 'Crossings', value: `truncated domes and any ramp the full path width; midblock crossings as near perpendicular as practical, ${T.path.crossingAngleMin}° minimum`, note: '§3-611.' },
      { label: 'Drainage', value: 'no concentrated offsite runoff across the path; pedestrian-scale structures per MM-SW-2', note: '§3-609.' }
    ]
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
      { label: 'Stair nosings', value: `${P.stairs.nosingMax} in maximum projection; no open risers` },
      { label: 'Pedestrian safety rails (TDOT)', value: 'MM-BPR-1 or MM-BPR-2 where steep slopes or drop-offs adjoin a sidewalk or path; placed clear of the accessible route', note: '§3-412.' }
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
      { label: 'Objects 27 in or lower', value: 'may protrude any amount (cane detectable)', note: 'R402.2.' },
      { label: 'Work zones (TDOT)', value: `keep a ${T.workZone.clearWidthPed} ft clear path for pedestrians, ${T.workZone.clearWidthPedBike} ft for pedestrians and bicyclists; continuous, rigid, cane-detectable barriers; head space clear`, note: '§3-417, MUTCD Chapter 6D.' }
    ]
  },
  {
    id: 'transit', kind: 'constants', topic: 'ped', title: 'Bus stops and boarding areas (TDOT)',
    aliases: ['bus stop', 'boarding area', 'transit', 'bus bulb', 'bus turnout', '3-702', 'R308'],
    cite: ['t3702'],
    items: [
      { label: 'Boarding and alighting area', value: `${T.transit.boardingArea[0]} ft wide parallel to the road by ${T.transit.boardingArea[1]} ft long perpendicular, clear of obstructions`, note: '§3-702; PROWAG R308. May overlap the PAR in constrained corridors with infrequent service.' },
      { label: 'Boarding area slopes', value: `grade parallel to the road equal to the roadway slope; cross slope ${T.transit.boardingCrossSlope} % maximum` },
      { label: 'Bus bulbs', value: `curb extensions typically ${T.curbExtension.busBulbWidth} ft wide, long enough for front and back doors (standard bus 40 ft, articulated 60 ft)`, note: '§3-703.' },
      { label: 'Accommodation area', value: `within ${T.transit.catchmentMiles} mi of a fixed-route stop, station or park-and-ride`, note: '§3-701.' }
    ]
  },
  {
    id: 'adaScope', kind: 'constants', topic: 'ped', title: 'When ADA upgrades are triggered (TDOT)',
    aliases: ['alteration', 'maintenance', 'resurfacing', 'ADA trigger', 'curb ramp upgrade', '3-301', 'signal project'],
    cite: ['t3301'],
    items: [
      { label: 'New construction', value: 'all pedestrian facilities fully meet current accessibility criteria', note: '§3-301.01.' },
      { label: 'Alterations', value: 'any change that affects usability, access, circulation or use; resurfacing is an alteration', note: '§3-301.02. Evaluate every curb ramp and crosswalk within the construction limits; replace disturbed facilities to current criteria; all corners with a sidewalk connection get ramps.' },
      { label: 'Resurfacing', value: 'treat as an alteration; work on any leg of an intersection requires upgrading the whole intersection; existing signals and pushbuttons need not be upgraded but must be accessible', note: 'Not alterations: spot repair, liquid-asphalt or slurry seal, chip seal, crack sealing, restriping that does not alter shoulder use. Microsurfacing and cape seal are alterations.' },
      { label: 'Signal projects', value: 'altering pedestrian signal operation, timing, phasing or heads triggers full compliance of all pedestrian facilities at the intersection; vehicular controller or head changes alone do not', note: 'PROWAG R209.2.' },
      { label: 'Maintenance', value: 'no ADA upgrade required: restriping, pothole patching, mowing, ditch cleaning, guardrail repair, trash pickup', note: '§3-301.03.' },
      { label: 'Exceptions', value: 'cost is never a justification; terrain or structural impacts may limit to the maximum extent feasible; Design Waiver with documentation for elements that are virtually impossible', note: 'Consult the TDOT ADA Coordinator.' }
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

function f0(x) { return Number(x).toLocaleString('en-US'); }
