/* Turn lane need and length: TSTS triggers + TDOT HSAM Vol. 3 sizing. */
FST.card({
  id: 'turnlane', tab: 'int',
  title: 'Turn lane need and length',
  intro: 'Checks whether a left or right turn lane is required, then sizes it: lane change and deceleration, storage, bay taper and approach taper. The TSTS sets when lanes are needed and defers dimensions to the traffic impact analysis; sizing here follows the TDOT Highway System Access Manual.',
  cites: ['t231', 't236', 's23138', 's23139', 's231310', 's2323', 'hsam311', 'hsam312', 'hsamTaper', 'gbTurn'],
  defaults: (c) => ({ turn: 'left', ctrl: 'unsig', V: Math.max(20, c.cls.designSpeed), constrained: false, vol: 100, opp: 400, cycle: 90, queue: 0,
    thru: 300, W: 12, Woff: 12, provided: 300, dw: false }),
  fields(c, s, set) {
    const u = c.ui;
    return [
      u.segmented({ label: 'Turn lane', value: s.turn, onChange: (v) => { s.Woff = v === 'left' ? 12 : 0; set('turn', v, { rebuild: true }); }, options: [{ value: 'left', label: 'Left turn' }, { value: 'right', label: 'Right turn' }] }),
      u.segmented({ label: 'Intersection control', value: s.ctrl, onChange: (v) => set('ctrl', v, { rebuild: true }), options: [{ value: 'unsig', label: 'Unsignalized' }, { value: 'sig', label: 'Signalized' }] }),
      u.range({ label: 'Through-movement design speed', min: 20, max: 70, step: 5, value: s.V, unit: 'mph', onChange: (v) => set('V', v) }),
      u.toggle({ label: 'Constrained site (use speed 10 mph lower for deceleration)', checked: s.constrained, onChange: (v) => set('constrained', v), hint: 'Allowed by TDOT HSAM when the full length is not practical. Agency approval needed.' }),
      u.range({ label: 'Turning volume (design hour)', min: 0, max: 600, step: 10, value: s.vol, unit: 'veh/h', onChange: (v) => set('vol', v) }),
      s.ctrl === 'unsig' && s.turn === 'left' ? u.range({ label: 'Opposing volume', min: 0, max: 1200, step: 10, value: s.opp, unit: 'veh/h', onChange: (v) => set('opp', v) }) : null,
      s.ctrl === 'sig' ? u.range({ label: 'Signal cycle length', min: 50, max: 180, step: 5, value: s.cycle, unit: 's', onChange: (v) => set('cycle', v) }) : null,
      s.ctrl === 'sig' ? u.range({ label: 'Queue from the traffic study (0 = estimate)', min: 0, max: 800, step: 25, value: s.queue, unit: 'ft', onChange: (v) => set('queue', v), hint: 'Use the 95th-percentile queue from the TIA when available.' }) : null,
      s.ctrl === 'sig' && s.turn === 'right' ? u.range({ label: 'Adjacent through volume per lane', min: 0, max: 1200, step: 10, value: s.thru, unit: 'veh/h/ln', onChange: (v) => set('thru', v) }) : null,
      u.range({ label: 'Turn lane width', min: 10, max: 14, step: 0.5, value: s.W, unit: 'ft', onChange: (v) => set('W', v) }),
      u.range({ label: 'Through-lane shift for approach taper (0 = none)', min: 0, max: 14, step: 0.5, value: s.Woff, unit: 'ft', onChange: (v) => set('Woff', v), hint: 'Lateral shift of the through lanes to make room for the turn lane.' }),
      u.range({ label: 'Turn lane length on plans (bay taper + full width)', min: 0, max: 1200, step: 5, value: s.provided, unit: 'ft', onChange: (v) => set('provided', v) }),
      u.toggle({ label: 'Serves a nonresidential driveway adding > 1,000 trips/day or > 100 peak-hour trips', checked: s.dw, onChange: (v) => set('dw', v) })
    ];
  },
  evaluate(c, s) {
    const { f, ui, cls, C } = c;
    const H = C.hsam, R = [];
    const art = cls.group === 'arterial', colArt = art || cls.group === 'collector';

    // ---- Need ----
    if (s.turn === 'left') {
      if (art) R.push({ status: 'note', label: 'Left turn lanes are required on all arterial streets', cite: ['s23138', 't231'] });
      else if (s.ctrl === 'sig') R.push({ status: 'note', label: 'A separate left turn lane is required at signalized intersections unless the approving agency decides otherwise', cite: ['s23138'] });
      else R.push({ status: 'info', label: 'Need at unsignalized intersections is set by the traffic impact analysis (through, left and opposing volumes)', detail: 'TDOT HSAM Figures 3-15 to 3-17 (NCHRP 745 volume warrants) may be used in the TIA.', cite: ['s23138', 'hsamTurn'] });
      if (s.ctrl === 'sig') {
        if (s.vol > H.sigDualLeft) R.push({ status: 'note', label: `Left turns over ${H.sigDualLeft} veh/h — consider dual left turn lanes (protected-only phasing)`, cite: ['hsamTurn'] });
        else if (s.vol > H.sigLeftConsider) R.push({ status: 'info', label: `Left turns over ${H.sigLeftConsider} veh/h at a signal — exclusive lane warranted by TDOT criteria`, cite: ['hsamTurn'] });
      }
    } else {
      const req = cls.rightReq;
      R.push({ status: req === 'Yes' ? 'note' : 'info', label: `Right turn lanes for ${cls.name}: "${req}" (Table 2.3(1)); the TIA determines need at each intersection or access`, cite: ['t231', 's23139'] });
      if (s.ctrl === 'unsig' && s.V < 40) R.push({ status: s.vol >= H.unsigRightLowSpeed ? 'note' : 'info', label: `Below 40 mph, TDOT uses ${H.unsigRightLowSpeed} right turns/h as the warrant — ${s.vol >= H.unsigRightLowSpeed ? 'met' : 'not met'}`, cite: ['hsamTurn'] });
      if (s.ctrl === 'unsig' && s.V >= 40) R.push({ status: 'info', label: 'At 40 mph or more, use TDOT HSAM Figures 3-18 and 3-19 (NCHRP 457) right-turn warrants', cite: ['hsamTurn'] });
      if (s.ctrl === 'sig') R.push({ status: s.vol > H.sigRight && s.thru > H.sigRightThruPerLane ? 'note' : 'info', label: `TDOT signalized warrant (right > ${H.sigRight} veh/h and through > ${H.sigRightThruPerLane} veh/h/lane) — ${s.vol > H.sigRight && s.thru > H.sigRightThruPerLane ? 'met' : 'not met'}`, cite: ['hsamTurn'] });
    }
    if (s.dw) {
      R.push({ status: colArt ? 'note' : 'info', label: colArt ? 'A deceleration lane is required for this driveway on an arterial or collector (12 ft minimum width, length per the Green Book measured from the driveway centerline)' : 'Driveway deceleration-lane trigger applies only on arterial and collector streets', cite: ['s2323'] });
    }

    // ---- Length ----
    const Vd = s.constrained ? Math.max(20, s.V - 10) : s.V;
    const D = f.decel(Vd);
    let storage, storageNote;
    if (s.ctrl === 'unsig' && s.turn === 'left') {
      const st = f.storageUnsig(Math.max(s.vol, 1), s.opp);
      if (st) { storage = st.length; storageNote = `Table 3-12 at ${st.rowVol} veh/h left, ${st.colVol} veh/h opposing (rounded up).`; }
      else { storage = null; storageNote = 'Volumes exceed Table 3-12 — storage must come from a queue analysis in the TIA.'; }
    } else if (s.ctrl === 'unsig') {
      storage = H.minStorageUrban; storageNote = 'Right-turn storage at unsignalized locations is by engineering judgment; urban minimum shown.';
    } else {
      const est = f.storageSig(s.vol, s.cycle);
      storage = Math.max(s.queue || est.length, H.minStorageUrban);
      storageNote = s.queue ? 'Queue from the traffic study.' : `Estimate: 2 × ${est.perCycle.toFixed(1)} vehicles per cycle × ${H.vehLength} ft. Replace with the TIA 95th-percentile queue.`;
    }
    if (storage != null) storage = Math.max(storage, H.minStorageUrban);
    const bay = f.bayTaper(s.W, s.V);
    const total = storage != null ? D + storage : null;
    const app = s.Woff > 0 ? f.taperTsts(s.Woff, s.V) : 0;

    if (total != null) {
      R.push(ui.check(s.provided >= total, 'Turn lane length (bay taper + full-width lane)', ui.ft(total), ui.ft(s.provided), ['hsam311', 'hsam312'],
        `Lane change and deceleration ${D} ft${s.constrained ? ` (at ${Vd} mph, constrained)` : ''} + storage ${storage} ft. ${storageNote}`));
    } else {
      R.push({ status: 'note', label: 'Storage length needs a queue analysis', detail: storageNote, cite: ['hsam312'] });
    }
    R.push({ status: 'info', label: `Bay taper: ${ui.ft(bay.length)} (${(bay.length / s.W).toFixed(1)}:1)`, detail: `L = WS/3 = ${ui.fmt(bay.raw)} ft, held between 8:1 (${bay.min} ft) and 15:1 (${bay.max} ft). The bay taper counts toward the deceleration length.`, cite: ['hsamTaper'] });
    if (app) R.push({ status: 'info', label: `Approach (redirect) taper: ${ui.ft(app)}; departure taper no sharper than this rate`, detail: `${s.V <= 40 ? 'L = WS²/60' : 'L = WS'} with W = ${s.Woff} ft, S = ${s.V} mph.`, cite: ['s2311', 'hsamTaper'] });
    if (s.W < 12 && (s.dw || cls.lane >= 12)) R.push({ status: 'fail', label: 'Turn lane narrower than the TSTS lane width', required: ui.ft(Math.max(12, cls.lane || 12)), provided: ui.ft(s.W, 1), cite: ['t231', 's2323'] });
    R.push({ status: 'info', label: 'TSTS Figures 2.3(3) and 2.3(4) are reserved; final dimensions are set by the TIA and approved by the agency', cite: ['s231310'] });

    // ---- Diagram: plan view, traffic moving left to right ----
    // u = offset from the turn-side edge of the through lanes (positive toward the turn lane).
    const W = 640, Hh = 262, top = s.turn === 'left';
    const segs = [app, bay.length, Math.max(D - bay.length, 0), storage || 0];
    const sum = segs.reduce((a, b) => a + b, 0) || 1;
    const x0 = 20, x1 = 620, sc = (x1 - x0) / sum;
    const xs = [x0]; segs.forEach((v) => xs.push(xs[xs.length - 1] + v * sc));
    const [xa0, xa1, xb1] = [xs[0], xs[1], xs[2]];
    const L = 26, Tw = (L * s.W) / 12, off = app ? (L * s.Woff) / 12 : 0;
    const base = top ? 124 : 160;
    const Y = (u) => (top ? base - u : base + u);
    const outer = Math.max(0, Tw - off);
    const g = ui.svg(W, Hh, `${top ? 'Left' : 'Right'} turn lane layout (plan, horizontal scale compressed)`,
      `Approach taper ${Math.round(app)} feet, bay taper ${Math.round(bay.length)} feet, deceleration ${D} feet including the bay taper, storage ${storage ?? 'unknown'} feet. Total ${total ?? 'unknown'} feet; ${s.provided} feet provided.`);
    // pavement outline
    g.add('path', { class: 'pave', d: `M0,${Y(0)} L${xa1},${Y(0)} L${xb1},${Y(outer)} L${W},${Y(outer)} L${W},${Y(-2 * L - off)} L${xa1},${Y(-2 * L - off)} L${xa0},${Y(-2 * L)} L0,${Y(-2 * L)} Z` });
    // turn lane
    g.add('path', { class: 'pave-2', d: `M${xa1},${Y(-off)} L${xb1},${Y(Tw - off)} L${x1},${Y(Tw - off)} L${x1},${Y(-off)} Z` });
    // through lane edge (shifts across the approach taper) and lane line
    g.path(`M0,${Y(0)} L${xa0},${Y(0)} L${xa1},${Y(-off)} L${W},${Y(-off)}`, top ? 'mark-solid' : 'edge');
    g.path(`M0,${Y(-L)} L${xa0},${Y(-L)} L${xa1},${Y(-L - off)} L${W},${Y(-L - off)}`, 'lane-line');
    // stop bar and queued vehicles
    g.line(x1, Y(-off), x1, Y(Tw - off), 'mark-solid');
    if (storage) {
      const n = Math.min(Math.floor(storage / H.vehLength), 24);
      const step = H.vehLength * sc, carW = Math.max(Math.min(step - 3, 22), 3);
      for (let i = 0; i < n; i++) g.add('rect', { x: x1 - 4 - (i + 1) * step + (step - carW), y: Y(Tw / 2 - off) - 6, width: carW, height: 12, rx: 2, class: 'car' });
    }
    g.text(x1 - 4, Y(-off - L / 2) + 4, 'Intersection →', 't t-sm', { 'text-anchor': 'end' });
    // provided length (turn-lane side)
    const okLen = total != null && s.provided >= total;
    const provX = Math.max(x1 - s.provided * sc, 0);
    const pY = Y(outer + 26);
    g.line(provX, pY, x1, pY, okLen ? 'ok' : 'bad');
    g.line(provX, pY - 5, provX, pY + 5, okLen ? 'ok' : 'bad');
    g.text(provX, pY + (top ? -8 : 16), `On plans ${s.provided} ft ${okLen ? '✓' : '✕'}`, 't t-sm');
    // required dimension chain (outer side)
    const labels = ['Approach taper', 'Bay taper', 'Decel.', 'Storage'];
    const dY = top ? Y(-2 * L - off) + 30 : Y(-2 * L - off) - 30;
    segs.forEach((v, i) => { if (v > 0) g.dimH(xs[i], xs[i + 1], dY + (top ? 1 : -1) * (i % 2) * 22, `${labels[i]} ${Math.round(v)}`); });
    g.text(x0, top ? 20 : Hh - 8, `Required ${total ?? '—'} ft = deceleration ${D} (incl. bay taper) + storage ${storage ?? '—'}`, 't t-b');

    return {
      svg: g,
      legend: ui.legend([['pave', 'Pavement'], [okLen ? 'ok' : 'bad', 'Length on plans']]),
      results: R,
      basis: [
        ['TSTS triggers', 'Table 2.3(1) turn lanes by class; Table 2.3(6) minimum turn lanes by intersection type; §2.3.13(8)–(10); driveway deceleration lanes §2.3.23(7) when a nonresidential use adds > 1,000 trips/day or > 100 peak-hour trips on an arterial or collector.'],
        ['Deceleration', `TDOT HSAM Table 3-11 (from AASHTO GB 7th): lane change and deceleration by through design speed — ${Object.entries(H.decel).map(([k, v]) => `${k} mph ${v} ft`).join(', ')}.`],
        ['Storage', 'Unsignalized left: TDOT HSAM Table 3-12 by left-turn and opposing volume, 50 ft urban minimum. Signalized: from the TIA, or estimated as 2 × average arrivals per cycle (AASHTO GB §9.7.2).'],
        ['Tapers', 'Bay taper L = WS/3, 8:1 to 15:1 (HSAM Fig. 3-21). Approach taper per TSTS §2.3.11 (WS²/60 at ≤ 40 mph, WS above).']
      ]
    };
  }
});
