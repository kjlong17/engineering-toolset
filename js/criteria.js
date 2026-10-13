/*
 * Criteria registry — every number the tool checks against lives here, with its source.
 * UI and formula code must not hard-code design values; read them from FST.criteria.
 *
 * Edition policy: Transportation & Street Technical Standards (TSTS), 2025 edition
 * (adopted 2025-07-01). Ch. 3 and Ch. 7 carry 2024-07-01 dates within that edition.
 * Values with `verify: true` were read from TDOT drawings via text extraction and must be
 * checked against the drawing graphic before public release (see About tab).
 */
window.FST = window.FST || {};

FST.sources = {
  tsts: {
    short: 'TSTS 2025',
    name: 'Transportation & Street Technical Standards (TSTS)',
    note: 'Published by the City of Franklin, Tennessee. This tool is independent and is not affiliated with or endorsed by the City.',
    edition: '2025 edition, adopted 2025-07-01',
    url: 'https://www.franklintn.gov/'
  },
  tsd: {
    short: 'TSTS Typical Sections',
    name: 'TSTS Typical Street Sections TS-1 to TS-7',
    edition: 'Dated 7/1/2021, published with the 2025 edition',
    url: 'https://www.franklintn.gov/'
  },
  gb: {
    short: 'AASHTO GB 7th',
    name: 'AASHTO, A Policy on Geometric Design of Highways and Streets ("Green Book")',
    edition: '7th edition, 2018',
    url: 'https://store.transportation.org/',
    note: 'Copyrighted. This tool computes values from the published design equations and cites the section; AASHTO tables are not reproduced.'
  },
  rdg: {
    short: 'AASHTO RDG',
    name: 'AASHTO Roadside Design Guide',
    edition: '4th edition, 2011',
    url: 'https://store.transportation.org/',
    note: 'Copyrighted. Values shown are as adapted and published by TDOT.'
  },
  mutcd: {
    short: 'MUTCD 11th',
    name: 'FHWA Manual on Uniform Traffic Control Devices',
    edition: '11th edition, December 2023',
    url: 'https://mutcd.fhwa.dot.gov/'
  },
  hsam: {
    short: 'TDOT HSAM Vol. 3',
    name: 'TDOT Highway System Access Manual, Volume 3: Geometric Design Criteria',
    edition: 'April 2026',
    url: 'https://www.tn.gov/content/dam/tn/tdot/traffic-engineering/TDOT%20HSAM%20Vol%203%20Design%20Criteria%20042026%20PDF.pdf'
  },
  tdotRdg: {
    short: 'TDOT RDG Ch. 2',
    name: 'TDOT Roadway Design Guidelines, Chapter 2 — Geometric Design Criteria',
    edition: 'Rev. 07/31/2026',
    url: 'https://www.tn.gov/tdot/state-engineering-technical-training/production-support/design-standards/design-guidelines2.html'
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
  hec22: {
    short: 'FHWA HEC-22',
    name: 'FHWA Hydraulic Engineering Circular 22, Urban Drainage Design Manual',
    edition: 'Current edition (uniform-gutter and Manning equations)',
    url: 'https://www.fhwa.dot.gov/engineering/hydraulics/library_listing.cfm'
  }
};

/* Street classifications. Column order follows TSTS Tables 2.3(1) and 2.3(2). */
FST.classes = [
  {
    id: 'majArt', name: 'Major Arterial', group: 'arterial',
    designSpeed: 50, posted: 45,
    ssd: 425, psd: 1835,
    rmin: { nc: 1391, e02: 1011, e04: 905 }, emax: 0.04, superAllowed: true,
    minTangent: 200, maxGrade: 6, minGutter: 0.5, kCrest: 84, kSag: 96,
    signalApproach: { grade: 2, length: 500 },
    spacing: { signal: 2640, unsignal: 1200, hvDriveway: 800, lvDrivewayToInt: 250, lvDriveway: 250 },
    lane: 12, median: 40, curb: 'Vertical', bike: 5, parking: null, sidewalk: 6, sidewalkNote: "6' or 8'", mup: 12, grass: 6,
    leftReq: 'Yes', rightReq: 'Yes', adt: '>35,000',
    arc: { res: 400, com: 400 }, parkingAllowed: false, cdsAllowed: false,
    vehicle: 'P, S-40 transit bus, SU, school bus and WB-67 turn in lane without tracking onto curb',
    tableTS: 'TS-1', storm: 'arterial'
  },
  {
    id: 'minArt', name: 'Minor Arterial', group: 'arterial',
    designSpeed: 45, posted: 40,
    ssd: 360, psd: 1625,
    rmin: { nc: 1039, e02: 794, e04: 711 }, emax: 0.04, superAllowed: true,
    minTangent: 150, maxGrade: 7, minGutter: 0.5, kCrest: 61, kSag: 79,
    signalApproach: { grade: 2, length: 500 },
    spacing: { signal: 1320, unsignal: 600, hvDriveway: 600, lvDrivewayToInt: 250, lvDriveway: 250 },
    lane: 12, median: 36, curb: 'Vertical', bike: 5, parking: null, sidewalk: 6, sidewalkNote: "6' or 8'", mup: 12, grass: 6,
    leftReq: 'Yes', rightReq: 'Yes', adt: '20,000–35,000',
    arc: { res: 300, com: 300 }, parkingAllowed: false, cdsAllowed: false,
    vehicle: 'P, S-40 transit bus, SU, school bus and WB-67 turn in lane without tracking onto curb',
    tableTS: 'TS-2', storm: 'arterial'
  },
  {
    id: 'majCol', name: 'Major Collector', group: 'collector',
    designSpeed: 40, posted: 35,
    ssd: 305, psd: 1470,
    rmin: { nc: 762, e02: 593, e04: 533 }, emax: 0.04, superAllowed: true,
    minTangent: 150, maxGrade: 8, minGutter: 0.5, kCrest: 44, kSag: 64,
    signalApproach: { grade: 3, length: 400 },
    spacing: { signal: 1320, unsignal: 300, hvDriveway: 300, lvDrivewayToInt: 230, lvDriveway: 150 },
    lane: 12, median: 30, curb: 'Vertical', bike: 5, parking: null, sidewalk: 6, sidewalkNote: "6' or 8'", mup: 12, grass: 6,
    leftReq: 'Yes', rightReq: 'Maybe', adt: '15,000–20,000',
    arc: { res: 250, com: 300 }, parkingAllowed: false, cdsAllowed: false,
    vehicle: 'P, S-40 transit bus, SU, school bus and WB-62 turn in lane without tracking onto curb',
    tableTS: 'TS-3', storm: 'collector'
  },
  {
    id: 'minCol', name: 'Minor Collector', group: 'collector',
    designSpeed: 35, posted: 30,
    ssd: 250, psd: 1280,
    rmin: { nc: 510, e02: 408, e04: 371 }, emax: 0.04, superAllowed: true,
    minTangent: 100, maxGrade: 8, minGutter: 0.5, kCrest: 29, kSag: 49,
    signalApproach: { grade: 3, length: 300 },
    spacing: { signal: null, unsignal: 300, hvDriveway: 300, lvDrivewayToInt: 230, lvDriveway: 150 },
    lane: 12, median: null, curb: 'Vertical', bike: 5, parking: 8, sidewalk: 6, sidewalkNote: "6' or 8'", mup: 12, grass: 6,
    leftReq: 'Yes', rightReq: 'Maybe', adt: '10,000–15,000',
    arc: { res: 250, com: 250 }, parkingAllowed: true, cdsAllowed: false,
    vehicle: 'P, SU, school bus turn in lane; WB-50 may use full width without tracking onto curb',
    tableTS: 'TS-4', storm: 'collector'
  },
  {
    id: 'hvLocal', name: 'High Volume Local', group: 'local',
    designSpeed: 30, posted: 25,
    ssd: 200, psd: null,
    rmin: { nc: 333, e02: null, e04: null }, emax: null, superAllowed: false,
    minTangent: 100, maxGrade: 8, minGutter: 0.5, kCrest: 19, kSag: 37,
    signalApproach: { grade: 4, length: 200 },
    spacing: { signal: null, unsignal: 200, hvDriveway: 200, lvDrivewayToInt: 125, lvDriveway: 50 },
    lane: 12, median: null, curb: 'Vertical', bike: null, parking: 8, sidewalk: 5, sidewalkNote: "5'", mup: null, grass: 6,
    leftReq: 'Yes', rightReq: 'No', adt: '2,000–5,000',
    arc: { res: 100, com: 200 }, parkingAllowed: true, cdsAllowed: true,
    vehicle: 'P, SU-30, school bus turn in lane; WB-50 may use full width without tracking onto curb',
    tableTS: 'TS-5', storm: 'local'
  },
  {
    id: 'lvLocal', name: 'Low Volume Local', group: 'local',
    designSpeed: 25, posted: 25, postedNote: '25 or 20',
    ssd: 115, psd: null,
    rmin: { nc: 70, e02: null, e04: null }, emax: null, superAllowed: false,
    minTangent: 20, maxGrade: 10, minGutter: 0.5, minGutterNote: '0.5–1.0', kCrest: 7, kSag: 17,
    signalApproach: { grade: 4, length: 100 },
    spacing: { signal: null, unsignal: 200, hvDriveway: 200, lvDrivewayToInt: 50, lvDriveway: 20 },
    lane: 11, median: null, curb: 'Vertical or Mountable', bike: null, parking: 8, sidewalk: 5, sidewalkNote: "5'", mup: null, grass: 6,
    leftReq: 'Yes', rightReq: 'No', adt: '<2,000',
    arc: { res: 100, com: 200 }, parkingAllowed: true, cdsAllowed: true,
    vehicle: 'P, SU-30, school bus turn in lane; WB-50 may use full width without tracking onto curb',
    tableTS: 'TS-6', storm: 'local'
  },
  {
    id: 'alley', name: 'Alley / Mews', group: 'alley',
    designSpeed: 15, posted: 15,
    ssd: 80, psd: null,
    rmin: { nc: 55, e02: null, e04: null }, emax: null, superAllowed: false,
    minTangent: 0, maxGrade: 8, minGutter: 1.0, kCrest: 7, kSag: 17,
    signalApproach: null,
    spacing: { signal: null, unsignal: null, hvDriveway: null, lvDrivewayToInt: 40, lvDriveway: 10 },
    lane: null, median: null, curb: 'Ribbon/curb per TS-7', bike: null, parking: null, sidewalk: null, mup: null, grass: null,
    leftReq: 'n/a', rightReq: 'n/a', adt: 'n/a',
    arc: { res: 100, com: 100 }, parkingAllowed: false, cdsAllowed: false,
    vehicle: 'Passenger cars and single-unit trucks',
    tableTS: 'TS-7', storm: 'local'
  }
];

/* Typical sections, half-section from centerline outward (feet). From TS-1 to TS-7. */
FST.sections = {
  majArt: [
    { id: 'bike', label: 'With bike lanes', row: 136, left: null,
      parts: [['median', 20, 'Median (½ of 40\')'], ['mcurb', 2.75, 'Median curb'], ['lane', 12, 'Traffic lane'], ['lane', 12, 'Traffic lane'], ['bike', 5, 'Bike lane'], ['curb', 2.5, 'Curb & gutter'], ['grass', 6, 'Grass strip'], ['walk', 6, 'Sidewalk'], ['back', 1.75, 'Back of walk']] },
    { id: 'mup', label: 'With multi-use trail (trail side)', row: 132,
      parts: [['median', 20, 'Median (½ of 40\')'], ['mcurb', 2.75, 'Median curb'], ['lane', 12, 'Traffic lane'], ['lane', 12, 'Traffic lane'], ['curb', 2.5, 'Curb & gutter'], ['grass', 6, 'Grass strip'], ['mup', 12, 'Multi-use trail'], ['back', 1.75, 'Back of trail']] }
  ],
  minArt: [
    { id: 'bike', label: 'With bike lanes', row: 132,
      parts: [['median', 18, 'Median (½ of 36\')'], ['mcurb', 2.75, 'Median curb'], ['lane', 12, 'Traffic lane'], ['lane', 12, 'Traffic lane'], ['bike', 5, 'Bike lane'], ['curb', 2.5, 'Curb & gutter'], ['grass', 6, 'Grass strip'], ['walk', 6, 'Sidewalk'], ['back', 1.75, 'Back of walk']] },
    { id: 'mup', label: 'With multi-use trail (trail side)', row: 128,
      parts: [['median', 18, 'Median (½ of 36\')'], ['mcurb', 2.75, 'Median curb'], ['lane', 12, 'Traffic lane'], ['lane', 12, 'Traffic lane'], ['curb', 2.5, 'Curb & gutter'], ['grass', 6, 'Grass strip'], ['mup', 12, 'Multi-use trail'], ['back', 1.75, 'Back of trail']] }
  ],
  majCol: [
    { id: 'bike', label: 'With bike lanes', row: 126,
      parts: [['median', 15, 'Median (½ of 30\')'], ['mcurb', 2.75, 'Median curb'], ['lane', 12, 'Traffic lane'], ['lane', 12, 'Traffic lane'], ['bike', 5, 'Bike lane'], ['curb', 2.5, 'Curb & gutter'], ['grass', 6, 'Grass strip'], ['walk', 6, 'Sidewalk'], ['back', 1.75, 'Back of walk']] },
    { id: 'mup', label: 'With multi-use trail (trail side)', row: 122,
      parts: [['median', 15, 'Median (½ of 30\')'], ['mcurb', 2.75, 'Median curb'], ['lane', 12, 'Traffic lane'], ['lane', 12, 'Traffic lane'], ['curb', 2.5, 'Curb & gutter'], ['grass', 6, 'Grass strip'], ['mup', 12, 'Multi-use trail'], ['back', 1.75, 'Back of trail']] }
  ],
  minCol: [
    { id: 'bike', label: 'With bike lanes and center turn lane', row: 79,
      parts: [['twltl', 6, 'Center turn lane (½ of 12\')'], ['lane', 12, 'Traffic lane'], ['bike', 5, 'Bike lane'], ['curb', 2.5, 'Curb & gutter'], ['grass', 6, 'Grass strip'], ['walk', 6, 'Sidewalk'], ['back', 2, 'Back of walk (2\' with TWLTL)']] },
    { id: 'bikeNo', label: 'With bike lanes, no center turn lane', row: 79,
      parts: [['lane', 12, 'Traffic lane'], ['bike', 5, 'Bike lane'], ['curb', 2.5, 'Curb & gutter'], ['grass', 6, 'Grass strip'], ['walk', 6, 'Sidewalk'], ['back', 8, 'Back of walk (8\' without TWLTL)']] },
    { id: 'mup', label: 'With multi-use trail (trail side)', row: 75,
      parts: [['twltl', 6, 'Center turn lane (½ of 12\')'], ['lane', 12, 'Traffic lane'], ['curb', 2.5, 'Curb & gutter'], ['grass', 6, 'Grass strip'], ['mup', 12, 'Multi-use trail'], ['back', 2, 'Back of trail']] }
  ],
  hvLocal: [
    { id: 'std', label: 'Standard (no center turn lane)', row: 54,
      parts: [['lane', 12, 'Traffic lane'], ['curb', 2, 'Curb & gutter'], ['grass', 6, 'Grass strip'], ['walk', 5, 'Sidewalk'], ['back', 2, 'Back of walk']] },
    { id: 'twltl', label: 'With center turn lane', row: 66,
      parts: [['twltl', 6, 'Center turn lane (½ of 12\')'], ['lane', 12, 'Traffic lane'], ['curb', 2, 'Curb & gutter'], ['grass', 6, 'Grass strip'], ['walk', 5, 'Sidewalk'], ['back', 2, 'Back of walk']] },
    { id: 'park', label: 'With on-street parking', row: 54,
      parts: [['lane', 12, 'Traffic lane'], ['park', 8, 'On-street parking'], ['walk', 7, 'Sidewalk']] }
  ],
  lvLocal: [
    { id: 'std', label: 'Standard', row: 52,
      parts: [['lane', 11, 'Traffic lane'], ['curb', 2, 'Curb & gutter'], ['grass', 6, 'Grass strip'], ['walk', 5, 'Sidewalk'], ['back', 2, 'Back of walk']] },
    { id: 'park', label: 'With on-street parking', row: 52,
      parts: [['lane', 11, 'Traffic lane'], ['park', 8, 'On-street parking'], ['walk', 7, 'Sidewalk']] }
  ],
  alley: [
    { id: 'alley', label: 'Alley', row: 20,
      parts: [['lane', 8, 'Traffic lane (½ of 16\')'], ['curb', 2, 'Curb']] },
    { id: 'mews', label: 'Mews', row: 26,
      parts: [['lane', 11, 'Traffic lane (½ of 22\')'], ['curb', 2, 'Curb']] }
  ]
};

FST.criteria = {
  /* §2.3.8(7) cross slope */
  crossSlope: { newMin: 2.0, newMax: 2.0, reconMin: 1.5, reconMax: 4.0, cdsMin: 2.0, cdsMax: 5.0 },
  /* §2.3.9 grades */
  gradeBreak: { max: 0.40, sagFlowline: 1.0, curbReturn: 3.0 },
  gutterMinCds: 1.0, cdsMaxGrade: 5.0, intersectionMaxGrade: 3.0,
  vertClearance: 16.5,
  /* §2.3.7 cul-de-sacs */
  cds: { maxLen: 500, maxLenSprinkler: 1000, rowRadius: 65, pavedRadius: 50 },
  /* §2.3.21 emergency access */
  fireLane: { width: 20, vertClear: 13.5, gradeMin: 0.5, gradeMax: 10, xsMin: 1.0, xsMax: 4.0 },
  /* §2.3.13 intersections */
  intersection: { angleMin: 80, angleMax: 100, laneShiftMax: 2, localJog: 200, localJogCds: 125,
    curbRadiusRes: 25, curbRadiusCom: 30, localToArterial: 660, oppositeOffset: 125 },
  medianOpeningSpacing: 600, medianTransitionRadius: 100,
  /* §2.3.16 parking */
  parking: { driveway: 6, intersection: 30 },
  /* §2.3.18 roadside */
  curbOffsetDesirable: 2,
  wallGuardDistance: 5,
  /* §2.3.23 driveways */
  driveway: {
    width: { res: [10, 20], nonresOne: [15, 20], nonresTwo: [24, 36] },
    radius: { res: [5, 15], arterial: [25, 40], collector: [25, 30], local: [10, 25] },
    maxGradeNear: 8, nearLength: 20, angleTol: 10, angleLength: 25,
    throat: 30, medianMin: 4, medianMax: 14, ruralWidth: [12, 22],
    decelTrigger: { daily: 1000, peak: 100 }, decelWidth: 12
  },
  /* Ch. 3 Table 3.1 design storm frequency (years) */
  storm: {
    interstate: { inlet: 50, sewer: 50, culvert: 50, culvertCheck: 100, freeboard: 50, ditch: 50 },
    arterial:   { inlet: 10, sewer: 10, culvert: 50, culvertCheck: 100, freeboard: 50, ditch: 10 },
    collector:  { inlet: 10, sewer: 10, culvert: 50, culvertCheck: 100, freeboard: 50, ditch: 10 },
    local:      { inlet: 10, sewer: 10, culvert: 50, culvertCheck: 100, freeboard: 50, ditch: 10 }
  },
  rationalMaxAcres: 100,
  /* Ch. 3 §3.2.1(3) and Ch. 7 §7.3 storm pipe */
  pipe: { minDia: 15, minSlope: 0.50, minCover: 24, manningN: 0.013, material: 'RCP, Class III' },
  bridgeFreeboard: 1.0,

  /* AASHTO Green Book 7th ed. design constants (equations cited, tables not reproduced) */
  gb: {
    prt: 2.5, decel: 11.2,                 // §3.2.2 SSD
    h1: 3.5, h2: 2.0, headlight: 2.0, beam: 1.0, // §3.4.6 vertical curves
    kCrestDen: 2158,                         // 200(√h1+√h2)²
    // §3.3 low-speed urban side friction (≤45 mph) and high-speed (50 mph)
    fLowSpeed: { 15: 0.32, 20: 0.27, 25: 0.23, 30: 0.20, 35: 0.18, 40: 0.16, 45: 0.15, 50: 0.14 },
    ncSlope: -0.02,
    // §9.5.3 intersection sight distance time gaps (s), by case and design vehicle
    isd: {
      B1: { P: 7.5, SU: 9.5, WB: 11.5, perLane: { P: 0.5, SU: 0.7, WB: 0.7 }, gradePerPct: 0.2, label: 'Case B1 — Left turn from stop' },
      B2: { P: 6.5, SU: 8.5, WB: 10.5, perLane: { P: 0, SU: 0, WB: 0 }, gradePerPct: 0.1, label: 'Case B2 — Right turn from stop' },
      B3: { P: 6.5, SU: 8.5, WB: 10.5, perLane: { P: 0.5, SU: 0.7, WB: 0.7 }, gradePerPct: 0.1, label: 'Case B3 — Crossing from stop' },
      F:  { P: 5.5, SU: 6.5, WB: 7.5, perLane: { P: 0.5, SU: 0.7, WB: 0.7 }, gradePerPct: 0, label: 'Case F — Left turn from major road' }
    },
    isdDecisionPoint: 14.5, isdDecisionPointDesirable: 18,
    sightObstructionHeight: 2.0 // TSTS §2.3.10(2): 24 in above flow line
  },

  /* TDOT HSAM Vol. 3 (April 2026) turn lanes */
  hsam: {
    decel: { 20: 70, 25: 105, 30: 150, 35: 205, 40: 265, 45: 340, 50: 415, 55: 505, 60: 600, 65: 700, 70: 815 },
    storageVols: [40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300],
    storageOpp: [200, 400, 600, 800, 1000],
    storage: [
      [50, 50, 50, 50, 50], [50, 50, 50, 50, 50], [50, 50, 50, 50, 75], [50, 50, 50, 75, 75],
      [50, 50, 75, 75, 100], [50, 50, 75, 100, 125], [50, 75, 75, 100, 150], [50, 75, 75, 125, 150],
      [50, 75, 100, 125, 200], [75, 75, 100, 150, 225], [75, 75, 125, 150, 275], [75, 100, 125, 175, 325],
      [75, 100, 125, 200, 400], [75, 100, 150, 225, 525]
    ],
    minStorageUrban: 50, minStorageRural: 100,
    sigLeftConsider: 100, sigDualLeft: 300, sigRight: 300, sigRightThruPerLane: 300, unsigRightLowSpeed: 300,
    bayRateMin: 8, bayRateMax: 15, vehLength: 25
  },
  /* MUTCD 11th ed. Table 2C-3 Condition A advance placement (ft), used for lane drop d */
  mutcdCondA: { 20: 225, 25: 325, 30: 460, 35: 565, 40: 670, 45: 775, 50: 885, 55: 990, 60: 1100, 65: 1200, 70: 1250 },
  laneDropBase: 750,

  /* TDOT S-CZ-1 Table A clear zone (ft) [low, high] — verify against drawing graphic */
  clearZone: {
    verify: true,
    speeds: ['40', '45-50', '55', '60', '65-70'],
    adt: ['<750', '750-1500', '1500-6000', '>6000'],
    // foreslope columns: 'f6' (6:1 or flatter), 'f4' (5:1 to 4:1); 3:1 is non-recoverable
    table: {
      '40':    { '<750': { f6: [7, 10], f4: [7, 10] },   '750-1500': { f6: [10, 12], f4: [12, 14] }, '1500-6000': { f6: [12, 14], f4: [14, 16] }, '>6000': { f6: [14, 16], f4: [16, 18] } },
      '45-50': { '<750': { f6: [10, 12], f4: [12, 14] }, '750-1500': { f6: [14, 16], f4: [16, 20] }, '1500-6000': { f6: [16, 18], f4: [20, 26] }, '>6000': { f6: [20, 22], f4: [24, 28] } },
      '55':    { '<750': { f6: [12, 14], f4: [14, 18] }, '750-1500': { f6: [16, 18], f4: [20, 24] }, '1500-6000': { f6: [20, 22], f4: [24, 30] }, '>6000': { f6: [22, 24], f4: [26, 32] } },
      '60':    { '<750': { f6: [16, 18], f4: [20, 24] }, '750-1500': { f6: [20, 24], f4: [26, 32] }, '1500-6000': { f6: [26, 30], f4: [32, 40] }, '>6000': { f6: [30, 32], f4: [36, 44] } },
      '65-70': { '<750': { f6: [18, 20], f4: [20, 26] }, '750-1500': { f6: [24, 26], f4: [28, 36] }, '1500-6000': { f6: [28, 32], f4: [34, 42] }, '>6000': { f6: [30, 34], f4: [38, 46] } }
    },
    lowSpeedOffsetMin: 4, lowSpeedOffsetEnhanced: 6
  },
  /* TDOT S-CZ-1 Table B curve correction Kcz — verify against drawing graphic */
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
  /* TDOT S-PL-1 Table B runout length LR (ft) by ADT [>10000, 5000-10000, 1000-5000, <1000] */
  runout: {
    verifyRows: [20, 25, 35],
    adt: ['>10000', '5000-10000', '1000-5000', '<1000'],
    rows: { 70: [360, 330, 290, 250], 65: [330, 290, 250, 225], 60: [300, 250, 210, 200], 55: [265, 220, 185, 175],
      50: [230, 190, 160, 150], 45: [195, 160, 135, 125], 40: [160, 130, 110, 100], 35: [135, 110, 95, 85],
      30: [110, 90, 80, 70], 25: [85, 70, 60, 50], 20: [60, 50, 35, 25] }
  },
  /* TDOT S-PL-1 Table A maximum clear zone used for LON (ADT > 6000, 5:1–4:1 slope) */
  lonLcMax: { 20: 10, 25: 12, 30: 14, 35: 16, 40: 18, 45: 24, 50: 28, 55: 32, 60: 44, 65: 46, 70: 46 },
  lonMinSpeed: 30,
  barrierLowSpeedPosted: 35,             // TDOT RDG §2-302.05
  criticalFillExemption: { length: 100, drop: 10 },

  /* HEC-22 */
  hec22: { ku: 0.56, nPavement: 0.016 }
};

/* Citation keys used by result rows and chips. */
FST.cites = {
  t231: ['tsts', 'Table 2.3(1)'], t232: ['tsts', 'Table 2.3(2)'], t232a: ['tsts', 'Table 2.3(2) note a'],
  t232b: ['tsts', 'Table 2.3(2) note b'], t233: ['tsts', 'Table 2.3(3)'], t234: ['tsts', 'Table 2.3(4)'],
  t235: ['tsts', 'Table 2.3(5)'], t236: ['tsts', 'Table 2.3(6)'], t238: ['tsts', 'Table 2.3(8)'], t239: ['tsts', 'Table 2.3(9)'],
  s15: ['tsts', '§1.5'], s18: ['tsts', '§1.8'],
  s237: ['tsts', '§2.3.7'], s238: ['tsts', '§2.3.8'], s2387: ['tsts', '§2.3.8(7)'], s2388: ['tsts', '§2.3.8(8)'],
  s239: ['tsts', '§2.3.9'], s2397: ['tsts', '§2.3.9(7)'], s2310: ['tsts', '§2.3.10'], s2311: ['tsts', '§2.3.11'],
  s2313: ['tsts', '§2.3.13'], s23138: ['tsts', '§2.3.13(8)'], s23139: ['tsts', '§2.3.13(9)'], s231310: ['tsts', '§2.3.13(10)'],
  s231311: ['tsts', '§2.3.13(11)'], s2315: ['tsts', '§2.3.15'], s2316: ['tsts', '§2.3.16'], s2318: ['tsts', '§2.3.18'],
  s2319: ['tsts', '§2.3.19'], s2321: ['tsts', '§2.3.21'], s2323: ['tsts', '§2.3.23'],
  ts: ['tsd', 'TS-1 to TS-7'],
  c31: ['tsts', 'Table 3.1'], s3212: ['tsts', '§3.2.1(2)'], s3213: ['tsts', '§3.2.1(3)'], s322: ['tsts', '§3.2.2'],
  s73: ['tsts', '§7.3'], s738: ['tsts', '§7.3.8'], s74: ['tsts', '§7.4'], s76: ['tsts', '§7.6'], s78: ['tsts', '§7.8'],
  gbSsd: ['gb', '§3.2.2'], gbVc: ['gb', '§3.4.6'], gbHc: ['gb', '§3.3'], gbHso: ['gb', '§3.3.12'],
  gbIsd: ['gb', '§9.5.3'], gbTurn: ['gb', '§9.7.2'],
  hsamTurn: ['hsam', 'Turning Lanes'], hsam311: ['hsam', 'Table 3-11'], hsam312: ['hsam', 'Table 3-12'],
  hsamTaper: ['hsam', 'Fig. 3-21'], hsamDrop: ['hsam', 'Fig. 3-22'],
  mutcdDrop: ['mutcd', 'Table 2C-3'],
  rdg302: ['tdotRdg', '§2-302'], rdg30205: ['tdotRdg', '§2-302.05'],
  scz1: ['scz1', 'Tables A–B'], spl1: ['spl1', 'Tables A–B'],
  hec22: ['hec22', 'Gutter flow (uniform section)'], hec22m: ['hec22', 'Manning equation']
};
