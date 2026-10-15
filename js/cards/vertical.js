/* Vertical alignment: design K, minimum curve length and curve geometry from TSTS Table 2.3(2) and AASHTO SSD criteria. */
FST.card({
  id: 'vertical', tab: 'align',
  title: 'Vertical curve and stopping sight distance',
  intro: 'For a design speed and the two tangent grades, gives the governing stopping sight distance, the minimum K and curve length, and the curve geometry. The more restrictive of the TSTS and AASHTO values governs.',
  cites: ['t232', 't232a', 'gbSsd', 'gbVc', 's239', 's15'],
  defaults: (c) => ({ V: c.cls.designSpeed, g1: 3, g2: -2, lit: false, L: 0, pviSta: 1000, pviElev: 100 }),
  fields(c, s, set) {
    const u = c.ui;
    return [
      u.range({ label: 'Design speed', min: 15, max: 60, step: 5, value: s.V, unit: 'mph', onChange: (v) => set('V', v), hint: `TSTS default for ${c.cls.name}: ${c.cls.designSpeed} mph (posted + 5).` }),
      u.range({ label: 'Grade in (g1)', min: -10, max: 10, step: 0.1, value: s.g1, unit: '%', onChange: (v) => set('g1', v) }),
      u.range({ label: 'Grade out (g2)', min: -10, max: 10, step: 0.1, value: s.g2, unit: '%', onChange: (v) => set('g2', v) }),
      u.toggle({ label: 'Sag curve has continuous street lighting', checked: s.lit, onChange: (v) => set('lit', v), hint: 'AASHTO allows the comfort criterion instead of headlight sight distance on lit sags.' }),
      u.group('Curve layout (optional)',
        u.range({ label: 'Curve length to lay out (0 = minimum, rounded up to 10 ft)', min: 0, max: 1500, step: 10, value: s.L, unit: 'ft', onChange: (v) => set('L', v), hint: 'A length shorter than the minimum is replaced by the minimum.' }),
        u.range({ label: 'PVI station', min: 0, max: 10000, step: 10, value: s.pviSta, unit: 'ft', onChange: (v) => set('pviSta', v) }),
        u.range({ label: 'PVI elevation', min: 0, max: 2000, step: 0.01, value: s.pviElev, unit: 'ft', onChange: (v) => set('pviElev', v) }))
    ];
  },
  evaluate(c, s) {
    const { f, ui, cls, C } = c;
    const A = Math.abs(s.g2 - s.g1), type = s.g2 - s.g1 < 0 ? 'crest' : 'sag';
    const R = [];
    const sta = (x) => { const n = Math.round(x); const neg = n < 0; const a = Math.abs(n); return `${neg ? '-' : ''}${Math.floor(a / 100)}+${String(a % 100).padStart(2, '0')}`; };

    // TSTS value applies only at the class design speed.
    const atClassSpeed = s.V === cls.designSpeed;
    const sGB = f.ssdDesign(s.V);
    const sTsts = atClassSpeed ? cls.ssd : null;
    const S = Math.max(sGB, sTsts || 0);
    const kTsts = atClassSpeed ? (type === 'crest' ? cls.kCrest : cls.kSag) : null;
    let kGB = f.kDesign(type === 'crest' ? f.kCrest(sGB) : f.kSag(sGB));
    let comfortUsed = false;
    if (type === 'sag' && s.lit) { kGB = f.kDesign(f.kComfort(s.V)); comfortUsed = true; }
    const kReq = Math.max(kGB, kTsts || 0);
    const lGB = comfortUsed ? kGB * A : f.lengthRequired(type, sGB, A);
    const lTsts = kTsts ? kTsts * A : 0;
    const lMin = 3 * s.V;
    const lReq = Math.max(lGB, lTsts, lMin);
    const needCurve = A > C.gradeBreak.max;
    const Lmin = Math.ceil(lReq - 1e-9);
    const Luse = needCurve ? Math.max(s.L || 0, f.ceilTo(lReq, 10)) : 0;

    R.push(ui.val('Algebraic difference in grade (A)', ui.pct(A), null, `${type === 'crest' ? 'Crest' : 'Sag'} curve.`));
    R.push(ui.val('Stopping sight distance (governing)', ui.ft(S), ['gbSsd', 't232'], `AASHTO ${ui.ft(sGB)}; TSTS Table 2.3(2) ${sTsts != null ? ui.ft(sTsts) : 'n/a at this speed'}.`));
    if (!needCurve) {
      R.push(ui.val('Vertical curve', 'Not required', ['s239'], `A = ${ui.pct(A)} is within the ${C.gradeBreak.max}% single-point grade break limit.`));
    } else {
      R.push(ui.val(`Minimum K (${type})`, String(kReq), ['t232', 'gbVc'], comfortUsed ? 'Comfort criterion, lit sag.' : `AASHTO ${kGB}; TSTS ${kTsts ?? 'n/a at this speed'}.`));
      R.push(ui.val('Minimum curve length', ui.ft(Lmin), ['t232', 'gbVc'],
        `Largest of TSTS K·A ${ui.fmt(lTsts, 0)} ft, AASHTO ${ui.fmt(lGB, 0)} ft and 3V = ${lMin} ft.`));
    }
    if (kTsts != null && kTsts < kGB) {
      R.push(ui.note(`TSTS K (${kTsts}) is below the AASHTO value (${kGB}) for ${s.V} mph — AASHTO governs`, ['t232a', 's15'], 'Table 2.3(2) note a says the latest Green Book values supersede the table.'));
    }
    if (sTsts != null && sTsts < sGB) {
      R.push(ui.note(`TSTS stopping sight distance (${sTsts} ft) is below AASHTO (${sGB} ft) — AASHTO governs`, ['t232a', 'gbSsd']));
    }
    R.push(ui.val(`Maximum tangent grade, ${cls.name}`, ui.pct(cls.maxGrade, 0), ['t235']));
    // Steepest downgrade for either direction of travel.
    const down = Math.min(s.g2, -s.g1, 0);
    if (down < -3) R.push(ui.info(`On a ${ui.pct(Math.abs(down), 1)} downgrade, AASHTO stopping sight distance increases to ${ui.ft(f.ssdDesign(s.V, down))}`, ['gbSsd']));

    const vc = f.vcurve(s.g1, s.g2, Math.max(Luse, 1), s.pviSta, s.pviElev);
    if (needCurve) {
      R.push(ui.val('Curve length used for layout', ui.ft(Luse), null, `K = ${ui.fmt(Luse / A, 1)}.${s.L && s.L < Luse ? ' The entered length is below the minimum, so the minimum is used.' : ''}`));
      R.push(ui.val('PVC', `Sta. ${sta(vc.pvcSta)}, elev. ${ui.fmt(vc.pvcElev, 2)}`));
      R.push(ui.val('PVT', `Sta. ${sta(vc.pvtSta)}, elev. ${ui.fmt(vc.pvtElev, 2)}`));
      if (vc.turning) {
        R.push(ui.val(`${type === 'crest' ? 'High' : 'Low'} point`, `Sta. ${sta(vc.turning.sta)}, elev. ${ui.fmt(vc.turning.elev, 2)}`, null,
          `${ui.fmt(vc.turning.x, 1)} ft past the PVC.${type === 'sag' ? ' Place an inlet at the low point (double inlet per §3.2.1(2)).' : ''}`));
      }
    }

    // ---- Diagram: profile with design curve ----
    const W = 640, H = 270, x0 = 40, x1 = 600, yTop = 34, yBot = 196;
    const Lp = Math.max(Luse, 1);
    const span = Lp * 1.6 + 80;
    const staL = s.pviSta - span / 2, staR = s.pviSta + span / 2;
    const elevAt = (st) => {
      if (!needCurve) return s.pviElev + ((st < s.pviSta ? s.g1 : s.g2) / 100) * (st - s.pviSta);
      if (st <= vc.pvcSta) return vc.pvcElev + (s.g1 / 100) * (st - vc.pvcSta);
      if (st >= vc.pvtSta) return vc.pvtElev + (s.g2 / 100) * (st - vc.pvtSta);
      return vc.elevAt(st - vc.pvcSta);
    };
    const pts = []; for (let i = 0; i <= 120; i++) { const st = staL + (span * i) / 120; pts.push([st, elevAt(st)]); }
    let eMin = Math.min(...pts.map((p) => p[1]), s.pviElev), eMax = Math.max(...pts.map((p) => p[1]), s.pviElev);
    const minRange = span * 0.04; // keep visible exaggeration bounded
    if (eMax - eMin < minRange) { const m = (eMax + eMin) / 2; eMin = m - minRange / 2; eMax = m + minRange / 2; }
    const X = (st) => x0 + ((st - staL) / span) * (x1 - x0);
    const Y = (e) => yBot - ((e - eMin) / (eMax - eMin)) * (yBot - yTop);
    const g = ui.svg(W, H, `${type === 'crest' ? 'Crest' : 'Sag'} vertical curve profile`,
      needCurve ? `Profile from grade ${s.g1}% to ${s.g2}% with a ${Luse} foot curve. Minimum K ${kReq}; minimum length ${Lmin} feet.` : `Grade break of ${A.toFixed(2)}% without a vertical curve.`);
    g.path(`M${X(staL)},${Y(elevAt(staL))} L${X(s.pviSta)},${Y(s.pviElev)} L${X(staR)},${Y(elevAt(staR))}`, 'dim');
    g.path('M' + pts.map((p) => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' L'), 'ok');
    const marks = needCurve ? [[vc.pvcSta, vc.pvcElev, 'PVC'], [s.pviSta, s.pviElev, 'PVI'], [vc.pvtSta, vc.pvtElev, 'PVT']] : [[s.pviSta, s.pviElev, 'PVI']];
    for (const [st, el, lab] of marks) {
      g.add('circle', { cx: X(st), cy: Y(el), r: 3.5, class: 'pt' });
      g.text(X(st), Y(el) + (lab === 'PVI' ? (type === 'crest' ? -8 : 16) : (type === 'crest' ? 16 : -8)), lab, 't t-sm', { 'text-anchor': 'middle' });
    }
    if (needCurve && vc.turning) {
      g.add('circle', { cx: X(vc.turning.sta), cy: Y(vc.turning.elev), r: 4, class: 'pt' });
      g.text(X(vc.turning.sta), Y(vc.turning.elev) + (type === 'crest' ? 18 : -10), type === 'crest' ? 'High point' : 'Low point', 't t-sm', { 'text-anchor': 'middle' });
    }
    g.text(x0, 18, `g1 = ${s.g1}%`, 't t-b');
    g.text(x1, 18, `g2 = ${s.g2}%`, 't t-b', { 'text-anchor': 'end' });
    g.text((x0 + x1) / 2, 18, needCurve ? `A = ${ui.fmt(A, 2)}%  ·  K min ${kReq}  ·  L min ${Lmin} ft` : `A = ${ui.fmt(A, 2)}% — no curve needed`, 't', { 'text-anchor': 'middle' });
    if (needCurve) {
      const a = X(s.pviSta - Luse / 2), b = X(s.pviSta + Luse / 2);
      g.dimH(a, b, 232, `L = ${Luse} ft`);
    }
    g.text(x0, 262, 'Vertical scale exaggerated for clarity.', 't t-sm');

    return {
      svg: g,
      legend: ui.legend([['ok', 'Profile with design curve']]),
      results: R,
      basis: [
        ['Stopping sight distance', `AASHTO: SSD = 1.47·V·t + V²/[30(a/32.2 ± G)], t = ${C.gb.prt} s, a = ${C.gb.decel} ft/s², rounded up to 5 ft → ${sGB} ft at ${s.V} mph. TSTS Table 2.3(2): ${sTsts ?? 'n/a at this speed'} ft.`],
        ['Crest K', 'K = S² / 2158 (driver eye 3.5 ft, object 2.0 ft), when S < L. When S > L: L = 2S − 2158/A.'],
        ['Sag K', 'K = S² / (400 + 3.5S) (headlight 2 ft, 1° beam). Lit sags may use comfort K = V²/46.5.'],
        ['Governing', 'Minimum length is the largest of TSTS K·A, AASHTO and 3V, per §1.5 (more restrictive governs). Layout length is rounded up to 10 ft.'],
        ['Grade break', `No vertical curve needed if A ≤ ${C.gradeBreak.max}% (§2.3.9(2)); 1.0% at sag flow lines; 3.0% in curb returns.`]
      ]
    };
  }
});
