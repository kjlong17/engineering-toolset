/*
 * Criteria registry: every constant and tabulated value the reference uses, with its source.
 * Entries and formulas must not hard-code design values; they read them from here.
 *
 * Values marked `verify: true` were transcribed from memory or from drawing text and have not been
 * checked against the printed source. The About page lists every entry that depends on one.
 * AASHTO publications are copyrighted: Green Book and Roadside Design Guide values are computed from
 * the published equations and cited by section; where a short list of published constants is needed
 * (friction factors, time gaps, relative gradients) it is cited, not reproduced as a table image.
 */

export const sources = {
  gb: {
    short: 'AASHTO GB 7th',
    name: 'AASHTO, A Policy on Geometric Design of Highways and Streets ("Green Book")',
    edition: '7th edition, 2018',
    url: 'https://store.transportation.org/',
    note: 'Copyrighted. Values are computed from the published design equations and cited by section.'
  },
  rdg: {
    short: 'AASHTO RDG 4th',
    name: 'AASHTO Roadside Design Guide',
    edition: '4th edition, 2011',
    url: 'https://store.transportation.org/',
    note: 'Copyrighted. Tabulated values are shown as adapted and published by TDOT on its standard drawings.'
  },
  tdot2: {
    short: 'TDOT RDG Ch. 2',
    name: 'TDOT Roadway Design Guidelines, Chapter 2 — Geometric Design',
    edition: 'Rev. 07/31/2026',
    url: 'https://www.tn.gov/tdot/state-engineering-technical-training/production-support/design-standards/design-guidelines2.html'
  },
  tdot3: {
    short: 'TDOT RDG Ch. 3',
    name: 'TDOT Roadway Design Guidelines (PDN), Chapter 3 — Multimodal Design',
    edition: 'Rev. 07/31/2026',
    url: 'https://www.tn.gov/tdot/state-engineering-technical-training/production-support/design-standards/design-guidelines2.html'
  },
  tdotRdg: {
    short: 'TDOT RDG',
    name: 'TDOT Roadway Design Guidelines, Chapters 4–6',
    edition: 'Current',
    url: 'https://www.tn.gov/tdot/state-engineering-technical-training/production-support/design-standards/design-guidelines2.html',
    note: 'Section mapping for Chapters 4–6 is pending; Chapters 2 and 3 are cited by section number.'
  },
  scz1: {
    short: 'TDOT S-CZ-1',
    name: 'TDOT Standard Drawing S-CZ-1, Clear Zone Criteria (adapted from AASHTO RDG 2011 Tables 3.1 and 3.2)',
    edition: 'Rev. 06-28-2019',
    url: 'https://www.tn.gov/content/dam/tn/tdot/engineering-production-support/documents/standard-drawings/roadway-standard-drawings/current/safety-design-and-fences/clear-zone-and-safety-plans/SCZ1.pdf'
  },
  spl1: {
    short: 'TDOT S-PL-1',
    name: 'TDOT Standard Drawing S-PL-1, Safety Plan — Length of Need for Barrier',
    edition: 'Rev. 03-01-2023',
    url: 'https://www.tn.gov/content/dam/tn/tdot/engineering-production-support/documents/standard-drawings/roadway-standard-drawings/current/safety-design-and-fences/clear-zone-and-safety-plans/SPL1.pdf'
  },
  mutcd: {
    short: 'MUTCD 11th',
    name: 'FHWA Manual on Uniform Traffic Control Devices',
    edition: '11th edition, December 2023',
    url: 'https://mutcd.fhwa.dot.gov/'
  },
  prowag: {
    short: 'PROWAG',
    name: 'U.S. Access Board, Accessibility Guidelines for Pedestrian Facilities in the Public Right-of-Way (36 CFR Part 1190)',
    edition: 'Final rule, August 8, 2023 (adopted by FHWA at 23 CFR Part 652, 2025)',
    url: 'https://www.access-board.gov/prowag/'
  }
};

/* Citation keys: [source, section]. */
export const cites = {
  gb322: ['gb', '§3.2.2 Stopping sight distance'],
  gb323: ['gb', '§3.2.3 Decision sight distance'],
  gb324: ['gb', '§3.2.4 Passing sight distance'],
  gb33: ['gb', '§3.3 Horizontal alignment'],
  gb333: ['gb', '§3.3.3 Minimum radius'],
  gb338: ['gb', '§3.3.8 Transition design (superelevation runoff and spirals)'],
  gb3312: ['gb', '§3.3.12 Sight distance on horizontal curves'],
  gb346: ['gb', '§3.4.6 Vertical curves'],
  gb344: ['gb', '§3.4.4 Minimum grades'],
  gb3415: ['gb', '§3.4 Vertical clearance'],
  gb42: ['gb', '§4.2 Cross slope'],
  gb953: ['gb', '§9.5.3 Intersection sight distance'],
  gbTurn: ['gb', '§9.7 Turn lanes and tapers'],
  tdot2100: ['tdot2', '§2-100 Controlling criteria for design'],
  tdot210101: ['tdot2', '§2-101.01 Horizontal curve radius and superelevation'],
  tdot210103: ['tdot2', '§2-101.03 Shoulder widths'],
  tdot210104: ['tdot2', '§2-101.04 Cross slopes'],
  tdot210205: ['tdot2', '§2-102.05 Vertical clearances for bridges'],
  tdot2105: ['tdot2', '§2-105 Design exception requests'],
  tdot220002: ['tdot2', '§2-200.02 Vertical curves (Figure 2-4)'],
  tdot220003: ['tdot2', '§2-200.03 Roadside slope development'],
  tdot220004: ['tdot2', '§2-200.04 Clear zone'],
  tdot220005: ['tdot2', '§2-200.05 Design vehicle'],
  tdot2201: ['tdot2', '§2-201 Design waiver requests'],
  tdot2301: ['tdot2', '§2-301 Clear zone concept'],
  tdot2302: ['tdot2', '§2-302 Roadside barriers (warrants 1–4)'],
  tdot230202: ['tdot2', '§2-302.02 Barrier warrant 2: non-traversable slopes (Figure 2-7)'],
  tdot230203: ['tdot2', '§2-302.03 Barrier warrant 3: roadside obstacles'],
  tdot230205: ['tdot2', '§2-302.05 Exceptions to barrier warrants'],
  tdot230206: ['tdot2', '§2-302.06 Barrier length of need'],
  tdot230207: ['tdot2', '§2-302.07 Barrier type selection'],
  tdot2303: ['tdot2', '§2-303 Guardrail'],
  tdot2601: ['tdot2', '§2-601 Lane drop after intersection (Figure 2-9, Table 2-4)'],
  tdot2602: ['tdot2', '§2-602 Turning lanes at intersections (Figure 2-10)'],
  tdot280003: ['tdot2', '§2-800.03 Left turn lanes in medians'],
  tdot2: ['tdot2', 'Chapter 2'],
  mutcd3b09: ['mutcd', '§3B.09 taper length (Fig. 3B-14)'],
  mutcd2c05: ['mutcd', '§2C.05 Table 2C-4 advance placement of warning signs'],
  t3301: ['tdot3', '§3-301 Accessibility requirements by project type'],
  t3402: ['tdot3', '§3-402 Pedestrian route selection (Tables 3-1, 3-2)'],
  t3403: ['tdot3', '§3-403 Sidewalk design on curbed roadways'],
  t3404: ['tdot3', '§3-404 Sidewalk design on non-curbed roadways'],
  t3405: ['tdot3', '§3-405 Pedestrian crossings and crosswalk markings'],
  t3406: ['tdot3', '§3-406 Curb ramps and detectable warning surfaces'],
  t3407: ['tdot3', '§3-407 Midblock pedestrian crossings (Table 3-3)'],
  t3408: ['tdot3', '§3-408 Curb extensions'],
  t3410: ['tdot3', '§3-410 Pedestrian accommodation at signalized intersections'],
  t3417: ['tdot3', '§3-417 Work zone pedestrian accommodation'],
  t3600: ['tdot3', '§3-600 to 3-608 Shared-use paths'],
  t3702: ['tdot3', '§3-702 to 3-703 Bus stop accessibility and bus bulbs'],
  scz1A: ['scz1', 'Table A (clear zone)'],
  scz1B: ['scz1', 'Table B (curve correction)'],
  scz1Fig: ['scz1', 'Figure B (low-speed urban roads)'],
  spl1: ['spl1', 'Tables A–D and length-of-need layout'],
  rdg31: ['rdg', '§3.1 Clear zone concept'],
  rdg32: ['rdg', '§3.2 Clear zone distances and curve correction'],
  rdg33: ['rdg', '§3.3 Roadside slopes'],
  rdg52: ['rdg', '§5.2 Barrier warrants'],
  rdg56: ['rdg', '§5.6 Barrier placement and length of need'],
  mutcd6: ['mutcd', 'Part 6 taper length formulas'],
  pr214: ['prowag', 'R214 On-street parking'],
  pr302: ['prowag', 'R302 Pedestrian access routes'],
  pr304: ['prowag', 'R304 Curb ramps and blended transitions'],
  pr305: ['prowag', 'R305 Detectable warning surfaces'],
  pr306: ['prowag', 'R306 Pedestrian street crossings'],
  pr402: ['prowag', 'R402 Protruding objects'],
  pr403: ['prowag', 'R403 Operable parts'],
  pr407: ['prowag', 'R407 Ramps'],
  pr408: ['prowag', 'R408 Stairways'],
  pr409: ['prowag', 'R409 Handrails']
};

export const C = {
  /* Design speeds offered by the global selector. */
  speeds: [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],

  /* AASHTO Green Book 7th ed. design constants. */
  gb: {
    mphToFps: 1.47,              // 1.466… ft/s per mph, GB convention
    g: 32.2,                     // ft/s²
    prt: 2.5,                    // s, brake reaction time (§3.2.2)
    decel: 11.2,                 // ft/s², deceleration rate (§3.2.2)
    brakeConst: 1.075,           // Eq. 3-2 braking constant (= g/30 rounded)
    h1: 3.5,                     // ft, driver eye height, passenger car (§3.2.1)
    h1Truck: 7.6,                // ft, driver eye height, truck (§3.2.1)
    h2: 2.0,                     // ft, object height for SSD (§3.2.1)
    h2Pass: 3.5,                 // ft, object height for passing sight distance (§3.2.4)
    headlight: 2.0,              // ft, headlight height for sag curves (§3.4.6)
    beam: 1.0,                   // degrees, upward divergence of headlight beam (§3.4.6)
    kCrestDen: 2158,             // 200(√h1 + √h2)² with h1 = 3.5, h2 = 2.0
    kPassDen: 2800,              // 200(√3.5 + √3.5)²
    sagUnder: { h1: 8.0, h2: 2.0 }, // ft, truck eye and object for sag curves under structures (§3.4.6)
    kComfortDen: 46.5,           // K = V²/46.5 comfort criterion on sag curves (§3.4.6)
    minLengthFactor: 3,          // L(min) = 3V for appearance (§3.4.6)
    /* Maximum side friction factors by design speed, GB Table 3-7 (§3.3.3). */
    f: { 15: 0.32, 20: 0.27, 25: 0.23, 30: 0.20, 35: 0.18, 40: 0.16, 45: 0.15, 50: 0.14, 55: 0.13, 60: 0.12, 65: 0.11, 70: 0.10, 75: 0.09, 80: 0.08 },
    emax: [4, 6, 8, 10, 12],     // % maximum superelevation rates in use (§3.3.3)
    adverseCrown: -0.02,         // ft/ft, normal crown against the curve
    /* Maximum relative gradient Δ (%), GB Table 3-15 (§3.3.8). */
    relGrad: { 15: 0.78, 20: 0.74, 25: 0.70, 30: 0.66, 35: 0.62, 40: 0.58, 45: 0.54, 50: 0.50, 55: 0.47, 60: 0.45, 65: 0.43, 70: 0.40, 75: 0.38, 80: 0.35 },
    /* Adjustment factor bw for number of lanes rotated, GB Table 3-16. */
    bw: { 1: 1.00, 1.5: 0.83, 2: 0.75, 2.5: 0.70, 3: 0.67, 3.5: 0.64 },
    runoffOnTangent: [60, 90],   // % of runoff placed on the tangent (§3.3.8), verify exact table by speed and lanes
    spiral: { pMin: 0.66, pMax: 3.3, Cdefault: 1.0, desirableSeconds: 2.0 }, // ft, ft, ft/s³, s (§3.3.8)
    /* Decision sight distance pre-maneuver times (s), GB §3.2.3. A and B include braking. */
    dsd: {
      A: { label: 'A — Stop on rural road', t: 3.0, brake: true },
      B: { label: 'B — Stop on urban road', t: 9.1, brake: true },
      C: { label: 'C — Speed/path/direction change, rural road', t: [10.2, 11.2], brake: false },
      D: { label: 'D — Speed/path/direction change, suburban road', t: [12.1, 12.9], brake: false },
      E: { label: 'E — Speed/path/direction change, urban road', t: [14.0, 14.5], brake: false }
    },
    /* Passing sight distance design values (ft), GB Table 3-4 (2018 model). */
    psd: { verify: true, values: { 20: 400, 25: 450, 30: 500, 35: 550, 40: 600, 45: 700, 50: 800, 55: 900, 60: 1000, 65: 1100, 70: 1200, 75: 1300, 80: 1400 } },
    /* Intersection sight distance time gaps (s), GB §9.5.3. */
    isd: {
      B1: { label: 'Case B1 — Left turn from stop', P: 7.5, SU: 9.5, WB: 11.5, perLane: { P: 0.5, SU: 0.7, WB: 0.7 }, gradePerPct: 0.2 },
      B2: { label: 'Case B2 — Right turn from stop', P: 6.5, SU: 8.5, WB: 10.5, perLane: { P: 0, SU: 0, WB: 0 }, gradePerPct: 0.1 },
      B3: { label: 'Case B3 — Crossing from stop', P: 6.5, SU: 8.5, WB: 10.5, perLane: { P: 0.5, SU: 0.7, WB: 0.7 }, gradePerPct: 0.1 },
      F: { label: 'Case F — Left turn from the major road', P: 5.5, SU: 6.5, WB: 7.5, perLane: { P: 0.5, SU: 0.7, WB: 0.7 }, gradePerPct: 0 }
    },
    isdDecisionPoint: 14.5, isdDecisionPointDesirable: 18, // ft from edge of major-road traveled way
    minGrade: { curbed: 0.5, highType: 0.3 },             // % (§3.4.4)
    crossSlope: { highType: [1.5, 2.0], intermediate: [1.5, 3.0], lowType: [2.0, 6.0] }, // % (§4.2)
    laneWidth: { range: [9, 12], arterial: 12 },           // ft (§4.3)
    rounding: { ssd: 5, isd: 5, k: 1 }
  },

  /* TDOT RDG Chapter 2, Geometric Design Criteria (rev. 07/31/26). Read from the chapter text. */
  tdot2: {
    controlling: ['Design speed', 'Design loading structural capacity', 'Lane width', 'Shoulder width', 'Horizontal curve radius', 'Superelevation rate', 'Cross slope', 'Maximum grade', 'Stopping sight distance', 'Vertical clearance'], // §2-100, §2-105
    typeI: ['Design speed', 'Design loading structural capacity'],
    typeII: ['Lane width', 'Horizontal curve radius', 'Stopping sight distance', 'Shoulder width', 'Cross slopes', 'Vertical clearance', 'Superelevation rate', 'Maximum grade'],
    fhwaReviewSpeed: 50,                                   // mph; NHS Type II exceptions at or above this may need FHWA review
    waiverItems: ['Clear zone width', 'Passing sight distance', 'Vertical curves', 'Multimodal features', 'Design vehicle'], // §2-201 (non-controlling; Design Waiver)
    emaxUrban: 0.04, emaxRural: 0.08,                      // ft/ft desirable maximum (§2-101.01)
    spiralSpeed: 50, spiralE: 0.03,                        // spirals recommended at ≥ 50 mph with e ≥ 3 % (§2-101.01)
    spiralExampleRadius: 2290,                             // ft; first radius needing a spiral at 50 mph in Table 2-1 (urban e_max 0.04)
    shoulderPaved: { 12: 10, 6: 4, fullyPavedBelow: 6 },   // ft paved portion of rural shoulders (§2-101.03)
    normalCrown: -0.02, shoulderSlope: -0.04, shoulderBreakMax: 0.07, // ft/ft (§2-101.04)
    vertClearance: { structures: 16, signTruss: 17, pedOverpass: 17, throughTruss: 17, railroad: 23, resurfacing: 0.5 }, // ft (§2-102.05)
    designVehicle: { urban: 'CITY-BUS', ruralSuburban: 'S-BUS-40', truckShare: 2, truck: 'WB-67' }, // §2-200.05
    farmClearPath: 24, urbanHazardToWalk: 4,              // ft (§2-200.04)
    curveClearZoneIncrease: [10, 50],                      // % larger on curves (§2-301, §2-302.06)
    slopes: { traversable: 3, recoverable: 4, fillRecoverable: [6, 4], fillNonRecoverable: [4, 3], criticalSteeperThan: 3, landing: 10, transverse: 6, medianCrossoverEndwall: 12 }, // §2-200.03, §2-302.02
    barrierType: { concreteWithin: 5 },                    // ft from edge of shoulder: closer → concrete barrier, farther → guardrail (§2-302.07)
    guardrail: { deflection: 5, longPostSlope: 6, longPost: 8, slopeBreakBehind: 2, heightTransition: '1 in per 6 ft 3½ in span (31 in to 27 in)', radiusShortRadius: 50, radiusShopBend: 150, intersectionForeslope: 10 }, // §2-303
    laneDrop: { base: 750, exampleSpeed: 55, exampleW: 18, exampleX: 1740 }, // §2-601 Figure 2-9
    /* Table 2-4 Condition A advance placement distance d (ft) by posted or 85th-percentile speed (from MUTCD 2009 Table 2C-4). */
    condA: { 20: 225, 25: 325, 30: 460, 35: 565, 40: 670, 45: 775, 50: 885, 55: 990, 60: 1100, 65: 1200, 70: 1250, 75: 1350 },
    turnLane: { bayTaperDivisor: 3 },                      // bay taper L = WS/3 (§2-602)
    medianLeftTurnAlignMax: 48                             // ft; align opposing left-turn lanes on the median centerline up to this width (§2-800.03)
  },

  /* Taper formulas: L = WS²/60 below 45 mph; L = WS at 45 mph and above (TDOT RDG §2-601, §2-602; MUTCD §3B.09). */
  mutcd: { taperBreak: 45 },

  /* Roadside: AASHTO RDG 2011 as adapted by TDOT S-CZ-1 and S-PL-1. */
  rdg: {
    criticalSlope: 3,            // 1V:3H and steeper is critical (non-traversable)
    recoverableSlope: 4,         // 1V:4H and flatter is recoverable
    runoutAreaDesired: 10,       // ft clear runout area at the toe of a non-recoverable slope
    barrierLowSpeedPosted: 35,   // mph; barrier typically not recommended on low-speed urban streets (TDOT §2-302.05)
    criticalFillExemption: { length: 100, drop: 10 }, // ft; short, low critical fills need no barrier (TDOT §2-302.05)
    lonMinSpeed: 30,             // mph; TDOT S-PL-1 does not compute LON below this
    lonBeginsAtPost: 3,          // length of need begins at the third post of an energy-absorbing terminal (S-PL-1)
    lowSpeedOffsetMin: 4, lowSpeedOffsetEnhanced: 6, // ft from face of curb on low-speed urban roads (S-CZ-1 Figure B, note 8); checked against the drawing
    maxTabulatedSpeed: 70,       // S-CZ-1 and S-PL-1 tabulate design speeds up to 70 mph only
    /* Clear zone distances (ft) [low, high], S-CZ-1 Table A (rev. 06-28-19), adapted from RDG 2011 Table 3.1. Checked cell by cell against the drawing.
       Foreslopes f6 (6:1 or flatter), f4 (5:1 to 4:1); 3:1 foreslopes are non-recoverable (drawing note 4). Backslopes b6, b4, b3. */
    clearZone: {
      speeds: ['40', '45-50', '55', '60', '65-70'],
      adt: ['<750', '750-1500', '1500-6000', '>6000'],
      table: {
        '40': {
          '<750': { f6: [7, 10], f4: [7, 10], b6: [7, 10], b4: [7, 10], b3: [7, 10] },
          '750-1500': { f6: [10, 12], f4: [12, 14], b6: [12, 14], b4: [12, 14], b3: [12, 14] },
          '1500-6000': { f6: [12, 14], f4: [14, 16], b6: [14, 16], b4: [14, 16], b3: [14, 16] },
          '>6000': { f6: [14, 16], f4: [16, 18], b6: [16, 18], b4: [16, 18], b3: [16, 18] }
        },
        '45-50': {
          '<750': { f6: [10, 12], f4: [12, 14], b6: [10, 12], b4: [8, 10], b3: [8, 10] },
          '750-1500': { f6: [14, 16], f4: [16, 20], b6: [14, 16], b4: [12, 14], b3: [10, 12] },
          '1500-6000': { f6: [16, 18], f4: [20, 26], b6: [16, 18], b4: [14, 16], b3: [12, 14] },
          '>6000': { f6: [20, 22], f4: [24, 28], b6: [20, 22], b4: [18, 20], b3: [14, 16] }
        },
        '55': {
          '<750': { f6: [12, 14], f4: [14, 18], b6: [10, 12], b4: [10, 12], b3: [8, 10] },
          '750-1500': { f6: [16, 18], f4: [20, 24], b6: [16, 18], b4: [14, 16], b3: [10, 12] },
          '1500-6000': { f6: [20, 22], f4: [24, 30], b6: [20, 22], b4: [16, 18], b3: [14, 16] },
          '>6000': { f6: [22, 24], f4: [26, 32], b6: [22, 24], b4: [20, 22], b3: [16, 18] }
        },
        '60': {
          '<750': { f6: [16, 18], f4: [20, 24], b6: [14, 16], b4: [12, 14], b3: [10, 12] },
          '750-1500': { f6: [20, 24], f4: [26, 32], b6: [20, 22], b4: [16, 18], b3: [12, 14] },
          '1500-6000': { f6: [26, 30], f4: [32, 40], b6: [24, 26], b4: [18, 22], b3: [14, 18] },
          '>6000': { f6: [30, 32], f4: [36, 44], b6: [26, 28], b4: [24, 26], b3: [20, 22] }
        },
        '65-70': {
          '<750': { f6: [18, 20], f4: [20, 26], b6: [14, 16], b4: [14, 16], b3: [10, 12] },
          '750-1500': { f6: [24, 26], f4: [28, 36], b6: [20, 22], b4: [18, 20], b3: [12, 16] },
          '1500-6000': { f6: [28, 32], f4: [34, 42], b6: [26, 28], b4: [22, 24], b3: [16, 20] },
          '>6000': { f6: [30, 34], f4: [38, 46], b6: [28, 30], b4: [26, 30], b3: [22, 24] }
        }
      },
      slopeLabels: { f6: 'Foreslope 6:1 or flatter', f4: 'Foreslope 5:1 to 4:1', b6: 'Backslope 6:1 or flatter', b4: 'Backslope 5:1 to 4:1', b3: 'Backslope 3:1' },
      /* Drawing note 9: 5:1–4:1 foreslope values at 60 mph and above carry the note "use 6:1 slopes only on roadways with design speeds 60 mph and above; if 6:1 is impractical, consider shielding". Note 3 marks the cells over 30 ft that may be reduced with judgment. */
      note9Speeds: ['60', '65-70'],
      over30: { '55': ['>6000'], '60': ['750-1500', '1500-6000', '>6000'], '65-70': ['750-1500', '1500-6000', '>6000'] }
    },
    /* Horizontal curve correction factor Kcz (outside of curves), S-CZ-1 Table B, adapted from RDG 2011 Table 3.2. Checked against the drawing. */
    kcz: {
      speeds: [40, 45, 50, 55, 60, 65, 70],
      rows: [
        [2950, [1.1, 1.1, 1.1, 1.2, 1.2, 1.2, 1.3]], [2300, [1.1, 1.1, 1.2, 1.2, 1.2, 1.3, 1.3]],
        [1970, [1.1, 1.2, 1.2, 1.2, 1.3, 1.3, 1.4]], [1640, [1.1, 1.2, 1.2, 1.3, 1.3, 1.3, 1.4]],
        [1475, [1.2, 1.2, 1.3, 1.3, 1.4, 1.4, 1.5]], [1315, [1.2, 1.2, 1.3, 1.3, 1.4, 1.4, null]],
        [1150, [1.2, 1.2, 1.3, 1.4, 1.5, 1.5, null]], [985, [1.2, 1.3, 1.4, 1.5, 1.5, null, null]],
        [820, [1.3, 1.3, 1.4, 1.5, null, null, null]], [660, [1.3, 1.4, 1.5, null, null, null, null]],
        [495, [1.4, 1.5, null, null, null, null, null]], [330, [1.5, null, null, null, null, null, null]]
      ]
    },
    /* S-PL-1 (rev. 03-01-2023) Table A: maximum clear zone Lc (ft) used for the suggested lengths of need (ADT > 6000, fill slope 1:5 to 1:4). */
    lonLcMax: { 70: 46, 65: 46, 60: 44, 55: 32, 50: 28, 45: 24, 40: 18, 35: 16, 30: 14, 25: 12, 20: 10 },
    /* S-PL-1 Table B: runout length LR (ft) by design speed and ADT. Checked against the drawing. */
    runout: {
      adt: ['>10000', '5000-10000', '1000-5000', '<1000'],
      rows: {
        70: [360, 330, 290, 250], 65: [330, 290, 250, 225], 60: [300, 250, 210, 200],
        55: [265, 220, 185, 175], 50: [230, 190, 160, 150], 45: [195, 160, 135, 125], 40: [160, 130, 110, 100],
        35: [135, 110, 95, 85], 30: [110, 90, 80, 70], 25: [85, 70, 60, 50], 20: [60, 50, 35, 25]
      }
    },
    /* S-PL-1 Tables C and D assume a 6 ft shoulder: L2 = 6 ft nearside, 12 ft farside (measured from the centerline or inside lane edge). */
    lonTables: { L2near: 6, L2far: 12, terminalLength: 12.5 },
    /* Suggested flare rates (horizontal:1), RDG Table 5-9. */
    flare: { verify: true, speeds: [30, 40, 45, 50, 55, 60, 70], insideShy: [11, 15, 20, 21, 24, 26, 30], beyondShy: [8, 11, 12, 14, 16, 18, 20] },
    /* Shy-line offset Ls (ft), RDG Table 5-7. */
    shyLine: { verify: true, values: { 30: 4.0, 40: 5.0, 45: 6.0, 50: 6.5, 55: 8.0, 60: 10.0, 70: 11.5, 75: 12.0, 80: 12.5 } }
  },

  /* TDOT RDG Chapter 3, Multimodal Design (rev. 07/31/26). Read from the chapter text. */
  tdot3: {
    sidewalk: {
      width: 5, widthConstrained: 4, widthCommercial: 6,       // ft (§3-403); 4 ft needs a Design Waiver
      crossSlope: 1.5, crossSlopeRange: [1, 2],                 // % standard, allowable range (§3-403, §3-404)
      grade: 5,                                                 // % max outside a street ROW; may match the roadway grade along it
      nonCurbedOffset: 5,                                       // ft from outside edge of shoulder to sidewalk (§3-404)
      /* Table 3-1: minimum pedestrian route widths by classification and context. */
      table31: [
        ['Rural roadways (< 2,000 ADT)', 'Sidewalks on both sides, or shared-use path', '5 ft sidewalk / 10 ft path'],
        ['Rural roadways (> 2,000 ADT)', 'Sidewalks on both sides, or shared-use path', '5 ft sidewalk / 10 ft path'],
        ['Suburban roadways', 'Sidewalks on both sides, or sidewalk + shared-use path', '5 ft sidewalk / 10 ft path'],
        ['Major arterials (residential)', 'Sidewalks on both sides', '6 ft'],
        ['Minor arterial and urban collector (residential)', 'Sidewalks on both sides', '5 ft'],
        ['All commercial-area urban streets', 'Sidewalks on both sides', '6 ft'],
        ['All industrial-area streets', 'Sidewalks on both sides', '5 ft']
      ],
      /* Table 3-2: pedestrian route buffer from the edge of the traveled way, ft [min, preferred], by posted speed. */
      table32: [['≤ 35 mph', 0, 5], ['40 mph', 4.5, 8], ['45–55 mph', 12.5, 16.5]],
      bufferRuralShoulder: 5, bufferConstrained45: 7, pathBufferMin: 5 // ft (§3-402 Table 3-2 notes)
    },
    curbRamp: { slopeMin: 5, slopeMax: 8.3, lengthMax: 15, blendedSlopeMax: 5, dwsDepth: 2, refugeMinForDws: 6, dwsSeparation: 2 }, // %, %, ft, %, ft, ft, ft (§3-406)
    midblock: {
      refugeWidthDesirable: 8, refugeWidthAlt: 6, refugeWidthMin: 4, cutThroughWidth: 5, refugeIslandLength: 6, refugeMedianADT: 12000, // ft, ft, ft, ft, ft, veh/day (§3-407)
      refugeNonCurbedPosted: 40, refugeNonCurbedDesign: 45, crossingDistanceTrigger: 30, // mph, mph, ft
      hawkPedPerHour: 20, hawkSpeed85: 35, hawkOffsetFromSideStreet: 100, // ped/h, mph, ft
      /* Table 3-3: midblock crosswalk recommendation. C = candidate, P = possible increase in risk, N = not alone. */
      table33: {
        adt: ['≤ 9,000', '> 9,000 to 12,000', '> 12,000 to 15,000', '> 15,000'],
        speeds: [30, 35, 40],
        cols: ['Two lanes', 'Three lanes', 'Multilane with raised median', 'Multilane without raised median'],
        cells: [
          [['C', 'C', 'C', 'C'], ['C', 'C', 'C', 'P'], ['P', 'P', 'P', 'N']],
          [['C', 'C', 'C', 'P'], ['C', 'P', 'P', 'P'], ['P', 'P', 'N', 'N']],
          [['C', 'P', 'P', 'N'], ['C', 'P', 'P', 'N'], ['N', 'N', 'N', 'N']],
          [['C', 'P', 'N', 'N'], ['P', 'N', 'N', 'N'], ['N', 'N', 'N', 'N']]
        ]
      }
    },
    curbExtension: { offsetFromThroughLane: 1, busBulbWidth: 6 }, // ft (§3-408, §3-703)
    pushbutton: { fromCurb: [1.5, 10], fromCrosswalkLine: 5, height: [3.5, 4], clearGround: [32, 54], reach: 10, separation: 10, separationMedian: 5, surfaceSlope: 1.5 }, // ft, ft, ft, in, in, ft, ft, % (§3-410, Figure 3-8)
    path: { width: 10, widthConstrained: 8, clearEachSide: 2, clearFillSlope: 6, clearAtRail: 1, vertClear: 10, vertClearMin: 8, designSpeed: 18, radiusMin: 60, crossSlope: 1.5, crossSlopeRange: [1, 2], grade: 5, offsetCurbed45: 8, bufferNonCurbed: 8, crossingAngleMin: 60, curveSignAdvance: 50 }, // §3-601 to 3-614
    transit: { boardingArea: [5, 8], boardingCrossSlope: 1.5, catchmentMiles: 0.75, midblockCrossingBeyond: 0.25 }, // ft × ft, %, mi, mi (§3-701, 3-702)
    workZone: { clearWidthPed: 4, clearWidthPedBike: 10 } // ft (§3-417)
  },

  /* PROWAG (2023 final rule). Dimensions in inches unless noted. */
  prowag: {
    par: {
      clearWidth: 48, passingSpace: 60, passingInterval: 200,    // in, in × in, ft (R302.3, R302.4)
      runningSlopeMax: 5, crossSlopeMax: 2,                       // % (R302.5, R302.6)
      crossSlopeMidblock: 'may equal the street grade', crossSlopeUncontrolled: 5, // % at crossings without stop or yield control (R302.6.1, R302.6.2)
      verticalMax: 0.25, verticalBevelMax: 0.5, bevelSlope: '1:2', // in (R302.7.2)
      openingMax: 0.5                                              // in, horizontal openings (R302.7.3)
    },
    curbRamp: {
      runningSlopeMax: 8.3, runningSlopeMin: 5, lengthNotRequiredBeyond: 15, // %, %, ft (R304.2.2, R304.3.2)
      crossSlopeMax: 2, clearWidth: 48,                            // %, in (R304.5.1, R304.5.3? verify)
      turningSpace: 48, turningSpaceConstrained: 60,               // in square; 48 × 60 where constrained at the back of the curb (R304.2.1, R304.3.1)
      flareSlopeMax: 10, counterSlopeMax: 5,                       // % (R304.2.3? verify; R304.5.4)
      blendedTransitionSlopeMax: 5                                 // % (R304.4.1)
    },
    detectable: {
      depth: 24, widthRule: 'full width of the curb ramp run, blended transition, or turning space', // in (R305.2.1, R305.2.2)
      domeBase: [0.9, 1.4], domeTop: '50–65 % of base diameter', domeHeight: 0.2, // in (R305.1.1)
      domeCenterSpacing: [1.6, 2.4], domeBaseSpacing: 0.65,        // in (R305.1.1)
      contrast: 'visually contrasts, light-on-dark or dark-on-light (R305.1.3)',
      setback: [6, 8]                                              // in from curb line at curb ramps without flush transitions (R305.2.1, verify)
    },
    crossing: { walkSpeed: 3.5, verify: true },                    // ft/s for pedestrian clearance time (MUTCD §4I.06 / PROWAG R306)
    protruding: { maxProjection: 4, zone: [27, 80], headroom: 80 }, // in (R402)
    operable: { reachMin: 15, reachMax: 48, forceMax: 5, buttonMinSize: 2 }, // in, in, lbf, in (R403, R209; verify button size)
    ramp: { slopeMax: 8.3, riseMax: 30, landingLength: 60, landingWidth: 'ramp width', handrailRise: 6, crossSlopeMax: 2, clearWidth: 48 }, // %, in (R407)
    stairs: { riserRange: [4, 7], treadMin: 11, nosingMax: 1.5 },  // in (R408, verify)
    handrail: { height: [34, 38], extension: 12, gripDiameter: [1.25, 2] }, // in (R409)
    parking: { verify: true, rows: [[1, 25, 1], [26, 50, 2], [51, 75, 3], [76, 100, 4], [101, 150, 5], [151, 200, 6]], over200: '4 % of total' } // R214
  }
};
