/* Roadside safety: clear zone, slopes, barrier warrants, length of need. Values from TDOT S-CZ-1 and S-PL-1, checked against the drawings. */
import { C } from '../criteria.js';
import * as f from '../formulas.js';

const R = C.rdg, T = C.tdot2;
const speedVar = { k: 'V', label: 'Design speed', unit: 'mph', ctx: 'V', min: 15, max: 80, step: 5 };
const adtOpts = R.clearZone.adt.map((a) => ({ value: a, label: a.replace('<', 'Under ').replace('>', 'Over ') }));
const adtLonOpts = R.runout.adt.map((a, i) => ({ value: i, label: a.replace('<', 'Under ').replace('>', 'Over ') }));
const slopeOpts = Object.entries(R.clearZone.slopeLabels).map(([k, l]) => ({ value: k, label: l }));
const tabNote = `TDOT S-CZ-1 and S-PL-1 tabulate design speeds up to ${R.maxTabulatedSpeed} mph.`;

export default [
  {
    id: 'clearZone', kind: 'formula', topic: 'roadside', title: 'Clear zone distance',
    aliases: ['clear zone', 'recovery area', 'Kcz', 'curve correction', 'Table 3.1', 'Table 3.2', 'S-CZ-1', 'lateral offset'],
    cite: ['scz1A', 'scz1B', 'scz1Fig', 'rdg32'],
    eq: ['CZ_c = L_c × K_cz   (outside of horizontal curves; no correction for R > 2,950 ft)'],
    vars: [speedVar, { k: 'adt', label: 'Design ADT', options: adtOpts, value: '>6000' }, { k: 'slope', label: 'Slope', options: slopeOpts, value: 'f4' },
      { k: 'Rc', label: 'Horizontal curve radius (0 = tangent or inside of curve)', unit: 'ft', value: 0, min: 0, max: 5000, step: 5 }],
    compute: (v) => {
      const cz = f.clearZone(v.V, v.adt, v.slope);
      if (!cz) return [{ label: 'Clear zone', value: 'Not tabulated', note: tabNote }];
      const k = f.kcz(v.V, v.Rc);
      const out = [
        { label: `L_c range, ${cz.band} mph, ADT ${v.adt}`, value: `${cz.low}–${cz.high}`, unit: 'ft', strong: true },
        { label: 'Curve correction K_cz', value: k.toFixed(1), note: v.Rc ? (v.Rc > 2950 ? 'no correction above 2,950 ft radius' : 'outside of curve') : 'tangent' },
        { label: 'Corrected clear zone, upper value × K_cz', value: f.fmt1(cz.high * k), unit: 'ft', strong: true }
      ];
      if (v.slope === 'f4' && R.clearZone.note9Speeds.includes(cz.band)) out.push({ label: 'Drawing note 9', value: 'Use 6:1 slopes at 60 mph and above', note: 'if 6:1 is impractical, consider shielding with barrier' });
      if ((R.clearZone.over30[cz.band] || []).includes(v.adt) && (v.slope === 'f6' || v.slope === 'f4')) out.push({ label: 'Drawing note 3', value: 'Values over 30 ft', note: 'may be adjusted by site investigation or crash history (RDG §3.1)' });
      return out;
    },
    notes: ['Clear zone is measured from the edge of the traveled way (drawing note 1). 3:1 foreslopes are traversable but not recoverable: fixed objects should not be near the toe, and a recovery area at the toe is judged case by case (note 4).',
      `TDOT §2-301: the S-CZ-1 values are the approximate center of a range, not an absolute; on curves the clear zone is ${T.curveClearZoneIncrease[0]}–${T.curveClearZoneIncrease[1]} % larger than on tangents; under 2,000 ADT even the minimum may be impractical. Where the side slope changes within the clear zone, recompute with a weighted average slope (§2-200.04).`,
      `TDOT §2-200.04: rigid features on rural roads keep a ${T.farmClearPath} ft clear path (lanes plus shoulder) for farm equipment; a pole that must sit in an urban sidewalk area keeps ${T.urbanHazardToWalk} ft from the hazard to the edge of the sidewalk (MM-SW-1).`,
      `Low-speed urban roads: clear zone distances do not apply; provide ${R.lowSpeedOffsetMin} ft minimum from the edge of the traveled way to the curb face and keep ${R.lowSpeedOffsetEnhanced} ft as the recommended enhanced lateral offset (note 8, Figure B). Maintain stopping sight distance through the curve (note 10).`,
      'Hazards inside the clear zone, in order (Figure A): remove, redesign to be traversable, relocate outside the clear zone, make breakaway, shield with barrier, delineate.']
  },
  {
    id: 'clearZoneTable', kind: 'table', topic: 'roadside', title: 'Clear zone L_c (ft) by speed, ADT and slope',
    aliases: ['clear zone table', 'S-CZ-1 Table A', 'RDG Table 3-1', 'foreslope', 'backslope'], cite: ['scz1A', 'rdg32'],
    cols: ['Speed (mph) · ADT', ...Object.values(R.clearZone.slopeLabels)],
    rows: () => R.clearZone.speeds.flatMap((s) => R.clearZone.adt.map((a) => {
      const r = R.clearZone.table[s][a];
      return [`${s} · ADT ${a}`, ...Object.keys(R.clearZone.slopeLabels).map((k) => `${r[k][0]}–${r[k][1]}`)];
    })),
    keyFn: (V) => f.speedBand(V), keyMatch: (row, key) => row[0].startsWith(key + ' '),
    notes: ['The 3:1 foreslope column is not tabulated: 3:1 foreslopes are non-recoverable (note 4). At 60 mph and above the 5:1–4:1 values carry note 9 (use 6:1 slopes; if impractical, consider shielding). Low-volume roads (under 750 ADT) carry note 7: provide the maximum clear zone practical.', 'Checked cell by cell against S-CZ-1 rev. 06-28-19.']
  },
  {
    id: 'kczTable', kind: 'table', topic: 'roadside', title: 'Curve correction factor K_cz',
    aliases: ['Kcz', 'S-CZ-1 Table B', 'RDG Table 3-2'], cite: ['scz1B', 'rdg32'],
    cols: ['Radius (ft)', ...R.kcz.speeds.map((s) => `${s} mph`)],
    rows: () => R.kcz.rows.map(([r, vals]) => [r, ...vals.map((x) => (x == null ? '—' : x.toFixed(1)))]),
    notes: ['Applies to the outside of curves only. Curves flatter than 2,950 ft need no adjustment; round the radius down to the next tabulated row. Checked against S-CZ-1 rev. 06-28-19.']
  },
  {
    id: 'slopes', kind: 'constants', topic: 'roadside', title: 'Roadside slopes and barrier warrants',
    aliases: ['recoverable slope', 'traversable', 'critical slope', 'non-recoverable', 'embankment warrant', 'fixed object', 'transverse slope', 'warrant', '2-302', '2-200.03'],
    cite: ['tdot220003', 'tdot230202', 'tdot230203', 'tdot230205', 'rdg33', 'rdg52'],
    items: [
      { label: 'Traversable slope', value: `${T.slopes.traversable}:1 or flatter and free of obstructions in the clear zone`, note: '§2-200.03.' },
      { label: 'Recoverable slope', value: `${T.slopes.recoverable}:1 or flatter and free of obstructions`, note: 'Fill slopes 6:1 to 4:1: an errant vehicle can return to the road (§2-302.02).' },
      { label: 'Non-recoverable fill slope', value: `${T.slopes.fillNonRecoverable[0]}:1 to ${T.slopes.fillNonRecoverable[1]}:1`, note: `Vehicle usually reaches the toe; an additional ${T.slopes.landing} ft clear landing area is desired within the right-of-way (RDG §3.3.2).` },
      { label: 'Critical slope', value: `steeper than ${T.slopes.criticalSteeperThan}:1`, note: 'Non-traversable; protect with guardrail, retaining wall, barrier rail or cable barrier.' },
      { label: 'Transverse slopes inside the clear zone', value: `${T.slopes.transverse}:1 or flatter on high-speed facilities`, note: `Parallel pipe endwalls D-SEW-1A at 6:1; median crossover pipes D-SEW-12D at ${T.slopes.medianCrossoverEndwall}:1 (§2-302.02).` },
      { label: 'Warrant 1: bridges and culverts', value: 'barrier at every bridge, box culvert or slab bridge, with a bridge transition and end terminal', note: 'S-PL-1, S-PL-3, S-PL-4, S-PL-5 (§2-302.01).' },
      { label: 'Warrant 2: non-traversable slopes', value: 'combination of fill slope and fill height per Figure 2-7', note: 'Barrier considered above about 3:1 at any height, and for flatter slopes at low heights per the curve (§2-302.02).' },
      { label: 'Warrant 3: roadside obstacles inside the clear zone', value: 'critical fill slopes, steep transverse slopes, trees, poles, abutments and piers, retaining walls, streams, signal and lighting poles, overhead sign structures, utility structures, Type A/B/straight pipe headwalls', note: '§2-302.03. Not hazards: breakaway supports, smooth vertical rock backslopes, right-of-way fences, D-PE "U" endwalls and D-SEW parallel endwalls, trees under 4 in diameter.' },
      { label: 'Warrant 4: freeway median departures', value: 'barrier where a paved or depressed median cannot provide the clear zone', note: 'Double-sided guardrail, cable or concrete barrier (S-PL-6, S-PL-6A). Superseded by warrants 1–3.' },
      { label: 'Order of treatment', value: 'remove the obstacle; relocate it; redesign it to be traversable; make it breakaway; then shield', note: 'Also consider rumble strips, delineation, advance warning or a lower design speed (§2-302).' },
      { label: 'Exception: low-speed urban streets', value: `barrier typically not recommended on local roads and streets posted ${R.barrierLowSpeedPosted} mph or less`, note: '§2-302.05.' },
      { label: 'Exception: short, low critical fills', value: `sections under ${R.criticalFillExemption.length} ft along centerline with drop-offs under ${R.criticalFillExemption.drop} ft`, note: '§2-302.05.' },
      { label: 'Exception: utility poles', value: 'coordinate relocation as far from the roadway as possible; delineate poles that cannot be moved', note: '§2-302.05.' }
    ]
  },
  {
    id: 'barrierType', kind: 'constants', topic: 'roadside', title: 'Barrier type selection and guardrail placement',
    aliases: ['guardrail', 'W-beam', 'concrete barrier', 'deflection', 'post length', '8 ft post', 'shy line', 'flare rate', 'short radius', 'height transition', '2-302.07', '2-303'],
    cite: ['tdot230207', 'tdot2303', 'rdg56'],
    items: [
      { label: 'Object within 5 ft of the edge of shoulder', value: `concrete median barrier (S-SSMB-3 or S-SSMB-2)`, note: '§2-302.07. Critical features such as piers and MSE walls may need TL-5 or TL-6 hardware per the Structures Division.' },
      { label: 'Object more than 5 ft from the edge of shoulder', value: 'guardrail', note: 'S-PL-6.' },
      { label: 'Guardrail dynamic deflection', value: `up to ${T.guardrail.deflection} ft`, note: `Keep ${T.guardrail.deflection} ft behind the face of guardrail clear of rigid obstructions (§2-303).` },
      { label: 'Post length on fills', value: `${T.guardrail.longPost} ft posts on fill sections ${T.guardrail.longPostSlope}:1 and steeper`, note: `Or move the slope break ${T.guardrail.slopeBreakBehind} ft behind the guardrail face (2 ft earth pad) to use standard posts.` },
      { label: 'Height transition, 31 in MASH rail to existing 27 in rail', value: T.guardrail.heightTransition, note: 'S-GRS-4.' },
      { label: 'Guardrail at intersections', value: `radius ≤ ${T.guardrail.radiusShortRadius} ft: shop-bent short-radius system or concrete barrier; ${T.guardrail.radiusShortRadius}–${T.guardrail.radiusShopBend} ft: shop-bent W-beam with terminal or anchor; over ${T.guardrail.radiusShopBend} ft: regular W-beam`, note: `Approach foreslope ${T.guardrail.intersectionForeslope}:1 or flatter. S-PL-7, S-GRS-7, S-GRS-8.` },
      { label: 'Anchorage', value: 'both ends anchored; approach ends get a crashworthy terminal with earth pad; trailing ends outside the clear zone may use an anchor', note: '§2-303, §2-306.' },
      { label: 'Shy-line offset L_s (RDG)', value: Object.entries(R.shyLine.values).map(([v, s]) => `${v} mph ${s} ft`).join('; '), note: 'Barrier closer than this affects driver behavior (RDG Table 5-7).' },
      { label: 'Suggested flare rate, inside shy line (RDG)', value: R.flare.speeds.map((s, i) => `${s} mph ${R.flare.insideShy[i]}:1`).join('; '), note: 'RDG Table 5-9.' },
      { label: 'Suggested flare rate, beyond shy line (RDG)', value: R.flare.speeds.map((s, i) => `${s} mph ${R.flare.beyondShy[i]}:1`).join('; '), note: 'RDG Table 5-9.' }
    ],
    unverified: 'Shy-line offsets and flare rates are from memory of RDG Tables 5-7 and 5-9; confirm before relying on them. The TDOT items are from Chapter 2.'
  },
  {
    id: 'lon', kind: 'formula', topic: 'roadside', title: 'Barrier length of need',
    aliases: ['length of need', 'LON', 'runout length', 'LR', 'LA', 'Lc', 'L2', 'flare', 'S-PL-1', '5-1', 'minimum barrier installation'],
    cite: ['spl1', 'tdot230206', 'rdg56'],
    eq: ['LON_n or LON_f = (L_c − L_2) / (L_c / L_R)   (S-PL-1, parallel barrier)', 'X = (L_A + (b/a)·L_1 − L_2) / [(b/a) + L_A / L_R]   (RDG Eq. 5-1, flared barrier)', `Minimum barrier installation = LON_n + LON_f + hazard length + 2 × ${R.lonTables.terminalLength} ft   (S-PL-1 note F)`],
    vars: [speedVar, { k: 'adt', label: 'ADT band for runout', options: adtLonOpts, value: 0 },
      { k: 'LA', label: 'L_c or L_A: lateral extent of the hazard, limited to the clear zone', unit: 'ft', value: 16, min: 1, max: 60, step: 0.5 },
      { k: 'L2', label: 'L_2: edge of traveled way to face of barrier', unit: 'ft', value: 6, min: 0, max: 40, step: 0.5 },
      { k: 'L1', label: 'L_1: tangent barrier length ahead of the hazard before the flare', unit: 'ft', value: 0, min: 0, max: 500, step: 5 },
      { k: 'flare', label: 'Flare rate a (b:a = 1:a; 0 = parallel)', unit: ':1', value: 0, min: 0, max: 40, step: 1 }],
    compute: (v) => {
      const r = f.runoutLength(v.V, v.adt);
      if (r.LR == null) return [{ label: 'Runout length L_R', value: 'Not tabulated', note: tabNote }];
      const X = f.lon(v.LA, v.L2, r.LR, v.L1, v.flare);
      const out = [
        { label: `Runout length L_R (${r.speed} mph row)`, value: r.LR, unit: 'ft' },
        { label: 'Length of need ahead of the hazard', value: f.fmt0(Math.ceil(X)), unit: 'ft', strong: true },
        { label: 'Lateral offset of the runout line at that point', value: f.fmt1(v.LA - (v.LA / r.LR) * X), unit: 'ft' }
      ];
      if (R.lonLcMax[v.V] != null) out.push({ label: `S-PL-1 Table A maximum L_c at ${v.V} mph`, value: R.lonLcMax[v.V], unit: 'ft', note: 'ADT over 6,000, fill slope 1:5 to 1:4' });
      if (v.V < R.lonMinSpeed) out.push({ label: 'Below 30 mph', value: 'LON not calculated by TDOT', note: 'use engineering judgment for the end treatment' });
      return out;
    },
    sketch: 'lon',
    notes: [`Length of need starts from the third post of the end treatment (S-PL-1 note B). The farside length LON_f uses L_c and L_2 measured from the centerline, or from the inside lane edge on divided roads; the nearside LON_n measures from the nearside edge of lane.`,
      'Where the clear zone falls inside a 3:1 or steeper slope, extend the clear zone to the toe (note C). As a conservative approach the designer may use the runout length itself as the length of need (note 2).',
      'TDOT §2-302.06: a rigid object inside the traversable clear zone gives a shorter LON than a non-traversable hazard such as a river, which uses the maximum clear zone. Clear zones on curves are 10–50 % larger; consider extending the trailing end on the outside of curves.',
      'Flared layouts, curved roadways and rigid objects: S-PL-1A, S-PL-1B; bridge ends and piers: S-PL-3 to S-PL-5; terminals: S-GRT series.']
  },
  {
    id: 'lonTable', kind: 'table', topic: 'roadside', title: 'Suggested length of need (ft) by speed and ADT',
    aliases: ['LON table', 'S-PL-1 Table C', 'S-PL-1 Table D', 'nearside', 'farside'], cite: ['spl1'],
    cols: ['Design speed (mph)', 'Max L_c (ft)', ...R.runout.adt.map((a) => `LON_n · ADT ${a}`), ...R.runout.adt.map((a) => `LON_f · ADT ${a}`)],
    rows: () => Object.keys(R.lonLcMax).map(Number).sort((a, b) => b - a).map((s) => [s, R.lonLcMax[s], ...[0, 1, 2, 3].map((i) => f.lonSuggested(s, i, 'near')), ...[0, 1, 2, 3].map((i) => f.lonSuggested(s, i, 'far'))]),
    keyIndex: 0,
    notes: [`Computed from the S-PL-1 formula with Table A maximum clear zone, Table B runout and a 6 ft shoulder (L_2 = ${R.lonTables.L2near} ft nearside, ${R.lonTables.L2far} ft farside), which reproduces Tables C and D on the drawing. For 0–2 ft shoulders use the formula. Below 30 mph TDOT does not calculate LON.`]
  },
  {
    id: 'runoutTable', kind: 'table', topic: 'roadside', title: 'Runout length L_R (ft) by speed and ADT',
    aliases: ['runout table', 'S-PL-1 Table B', 'RDG Table 5-10'], cite: ['spl1', 'rdg56'],
    cols: ['Design speed (mph)', ...R.runout.adt.map((a) => `ADT ${a}`)],
    rows: () => Object.keys(R.runout.rows).map(Number).sort((a, b) => b - a).map((s) => [s, ...R.runout.rows[s]]),
    keyIndex: 0,
    notes: ['Checked against S-PL-1 rev. 03-01-2023. The 30, 40, 50, 60 and 70 mph rows match the RDG 2011 values; the intermediate rows are TDOT\'s.']
  }
];
