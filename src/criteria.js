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
  tdotRdg: {
    short: 'TDOT RDG',
    name: 'TDOT Roadway Design Guidelines, Chapters 2–6',
    edition: 'Current',
    url: 'https://www.tn.gov/tdot/state-engineering-technical-training/production-support/design-standards/design-guidelines2.html',
    note: 'Section mapping for Chapters 3–6 is pending; only Chapter 2 sections are cited by number so far.'
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
  tdot2302: ['tdot2', '§2-302 Roadside barrier warrants'],
  tdot230205: ['tdot2', '§2-302.05 Barrier on low-speed urban streets'],
  tdot2601: ['tdot2', '§2-601 Lane drops'],
  tdot2: ['tdot2', 'Chapter 2'],
  scz1A: ['scz1', 'Table A (clear zone)'],
  scz1B: ['scz1', 'Table B (curve correction)'],
  scz1Fig: ['scz1', 'Figure B (low-speed curbed streets)'],
  spl1: ['spl1', 'Tables A–B and length-of-need layout'],
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
    vertClearance: { verify: true, freeway: 16.0, arterial: 16.0, local: 14.0, resurfacing: 0.5, pedestrianBridge: 17.0, signTruss: 17.0 }, // ft
    laneWidth: { range: [9, 12], arterial: 12 },           // ft (§4.3)
    rounding: { ssd: 5, isd: 5, k: 1 }
  },

  /* MUTCD taper formulas (Part 6, Table 6K-? in the 11th edition; section number to verify). Also used by TDOT and the GB for turn-lane tapers. */
  mutcd: { verify: true, taperBreak: 45 }, // L = WS²/60 below 45 mph; L = WS at 45 mph and above

  /* Roadside: AASHTO RDG 2011 as adapted by TDOT S-CZ-1 and S-PL-1. */
  rdg: {
    criticalSlope: 3,            // 1V:3H and steeper is critical (non-traversable)
    recoverableSlope: 4,         // 1V:4H and flatter is recoverable
    runoutAreaDesired: 10,       // ft clear runout area at the toe of a non-recoverable slope
    barrierLowSpeedPosted: 35,   // mph; barrier typically not recommended on low-speed urban streets (TDOT §2-302.05)
    criticalFillExemption: { length: 100, drop: 10 }, // ft; short, low critical fills need no barrier (TDOT §2-302.05)
    lonMinSpeed: 30,             // mph; TDOT S-PL-1 does not compute LON below this
    lonBeginsAtPost: 3,          // length of need begins at the third post of an energy-absorbing terminal (S-PL-1)
    lowSpeedOffsetMin: 4, lowSpeedOffsetEnhanced: 6, // ft lateral offset from face of curb on curbed streets ≤ 45 mph (S-CZ-1 Figure B), verify
    /* Clear zone distances (ft) [low, high], S-CZ-1 Table A / RDG Table 3-1. Foreslopes f6 (6:1 or flatter), f4 (5:1 to 4:1); backslopes b3 (3:1), b4 (5:1 to 4:1), b6 (6:1 or flatter). 3:1 foreslopes are non-recoverable. */
    clearZone: {
      verify: true,
      speeds: ['40', '45-50', '55', '60', '65-70'],
      adt: ['<750', '750-1500', '1500-6000', '>6000'],
      table: {
        '40': {
          '<750': { f6: [7, 10], f4: [7, 10], b3: [7, 10], b4: [7, 10], b6: [7, 10] },
          '750-1500': { f6: [10, 12], f4: [12, 14], b3: [10, 12], b4: [10, 12], b6: [10, 12] },
          '1500-6000': { f6: [12, 14], f4: [14, 16], b3: [12, 14], b4: [12, 14], b6: [12, 14] },
          '>6000': { f6: [14, 16], f4: [16, 18], b3: [14, 16], b4: [14, 16], b6: [14, 16] }
        },
        '45-50': {
          '<750': { f6: [10, 12], f4: [12, 14], b3: [8, 10], b4: [8, 10], b6: [10, 12] },
          '750-1500': { f6: [14, 16], f4: [16, 20], b3: [10, 12], b4: [12, 14], b6: [14, 16] },
          '1500-6000': { f6: [16, 18], f4: [20, 26], b3: [12, 14], b4: [14, 16], b6: [16, 18] },
          '>6000': { f6: [20, 22], f4: [24, 28], b3: [14, 16], b4: [18, 20], b6: [20, 22] }
        },
        '55': {
          '<750': { f6: [12, 14], f4: [14, 18], b3: [8, 10], b4: [10, 12], b6: [10, 12] },
          '750-1500': { f6: [16, 18], f4: [20, 24], b3: [10, 12], b4: [14, 16], b6: [16, 18] },
          '1500-6000': { f6: [20, 22], f4: [24, 30], b3: [14, 16], b4: [16, 18], b6: [20, 22] },
          '>6000': { f6: [22, 24], f4: [26, 32], b3: [16, 18], b4: [20, 22], b6: [22, 24] }
        },
        '60': {
          '<750': { f6: [16, 18], f4: [20, 24], b3: [10, 12], b4: [12, 14], b6: [14, 16] },
          '750-1500': { f6: [20, 24], f4: [26, 32], b3: [12, 14], b4: [16, 18], b6: [20, 22] },
          '1500-6000': { f6: [26, 30], f4: [32, 40], b3: [14, 18], b4: [18, 22], b6: [24, 26] },
          '>6000': { f6: [30, 32], f4: [36, 44], b3: [20, 22], b4: [24, 26], b6: [26, 28] }
        },
        '65-70': {
          '<750': { f6: [18, 20], f4: [20, 26], b3: [10, 12], b4: [14, 16], b6: [14, 16] },
          '750-1500': { f6: [24, 26], f4: [28, 36], b3: [12, 14], b4: [18, 20], b6: [20, 22] },
          '1500-6000': { f6: [28, 32], f4: [34, 42], b3: [14, 18], b4: [22, 24], b6: [26, 28] },
          '>6000': { f6: [30, 34], f4: [38, 46], b3: [22, 24], b4: [26, 30], b6: [28, 30] }
        }
      },
      slopeLabels: { f6: 'Foreslope 6:1 or flatter', f4: 'Foreslope 5:1 to 4:1', b3: 'Backslope 3:1', b4: 'Backslope 5:1 to 4:1', b6: 'Backslope 6:1 or flatter' }
    },
    /* Horizontal curve adjustment factor Kcz (outside of curves), S-CZ-1 Table B / RDG Table 3-2. */
    kcz: {
      verify: true,
      speeds: [40, 45, 50, 55, 60, 65, 70],
      rows: [
        [2950, [1.1, 1.1, 1.1, 1.2, 1.2, 1.2, 1.3]], [2300, [1.1, 1.1, 1.2, 1.2, 1.2, 1.3, 1.3]],
        [1970, [1.1, 1.2, 1.2, 1.2, 1.3, 1.3, 1.4]], [1640, [1.1, 1.2, 1.2, 1.2, 1.3, 1.4, 1.5]],
        [1475, [1.2, 1.2, 1.2, 1.3, 1.3, 1.4, 1.5]], [1315, [1.2, 1.2, 1.2, 1.3, 1.3, 1.4, null]],
        [1150, [1.2, 1.2, 1.3, 1.3, 1.4, 1.5, null]], [985, [1.2, 1.2, 1.3, 1.4, 1.5, null, null]],
        [820, [1.2, 1.3, 1.4, 1.5, null, null, null]], [660, [1.3, 1.4, 1.5, null, null, null, null]],
        [495, [1.4, 1.5, null, null, null, null, null]], [330, [1.5, null, null, null, null, null, null]]
      ]
    },
    /* Runout length LR (ft) by design speed and ADT, S-PL-1 Table B / RDG Table 5-10(b).
       Rows at 30, 40, 50, 60, 70 (and 80) are the RDG values; the others are TDOT interpolations to verify. */
    runout: {
      verify: true,
      adt: ['>10000', '5000-10000', '1000-5000', '<1000'],
      rows: {
        80: [470, 430, 380, 330], 70: [360, 330, 290, 250], 65: [330, 290, 250, 225], 60: [300, 250, 210, 200],
        55: [265, 220, 185, 175], 50: [230, 190, 160, 150], 45: [195, 160, 135, 125], 40: [160, 130, 110, 100],
        35: [135, 110, 95, 85], 30: [110, 90, 80, 70], 25: [85, 70, 60, 50], 20: [60, 50, 35, 25]
      }
    },
    /* Suggested flare rates (horizontal:1), RDG Table 5-9. */
    flare: { verify: true, speeds: [30, 40, 45, 50, 55, 60, 70], insideShy: [11, 15, 20, 21, 24, 26, 30], beyondShy: [8, 11, 12, 14, 16, 18, 20] },
    /* Shy-line offset Ls (ft), RDG Table 5-7. */
    shyLine: { verify: true, values: { 30: 4.0, 40: 5.0, 45: 6.0, 50: 6.5, 55: 8.0, 60: 10.0, 70: 11.5, 75: 12.0, 80: 12.5 } }
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
