/*
 * Pure calculation functions. Each cites its source; constants come from FST.criteria.
 * Units: feet, mph, percent grades unless noted.
 */
window.FST = window.FST || {};
FST.f = (function () {
  const C = FST.criteria;
  const ceilTo = (x, step) => Math.ceil(x / step - 1e-9) * step;

  /* AASHTO GB 7th §3.2.2, Eq. 3-2 and 3-3. G = grade in percent (negative = downgrade). */
  function ssd(V, G = 0) {
    const t = C.gb.prt, a = C.gb.decel;
    const brake = (V * V) / (30 * (a / 32.2 + G / 100));
    return 1.47 * V * t + brake;
  }
  /* Design value: computed SSD on level grade, rounded up to the next 5 ft (GB practice). */
  const ssdDesign = (V, G = 0) => ceilTo(ssd(V, G), 5);

  /* GB §3.4.6: K for S < L. Crest uses h1 = 3.5 ft, h2 = 2.0 ft; sag uses headlight 2 ft, 1° beam. */
  const kCrest = (S) => (S * S) / C.gb.kCrestDen;
  const kSag = (S) => (S * S) / (400 + 3.5 * S);
  const kComfort = (V) => (V * V) / 46.5;
  /* GB design K: calculated K shown to one decimal, then rounded up to a whole number. */
  const kDesign = (k) => Math.ceil(Math.round(k * 10) / 10 - 1e-9);

  /* Required curve length for sight distance S, algebraic difference A (%). */
  function lengthRequired(type, S, A) {
    if (A <= 0) return 0;
    if (type === 'crest') {
      const L1 = (A * S * S) / C.gb.kCrestDen;
      if (L1 >= S) return L1;
      return Math.max(0, 2 * S - C.gb.kCrestDen / A);
    }
    const L1 = (A * S * S) / (400 + 3.5 * S);
    if (L1 >= S) return L1;
    return Math.max(0, 2 * S - (400 + 3.5 * S) / A);
  }

  /* Vertical curve geometry. Grades in %, stations in ft. */
  function vcurve(g1, g2, L, pviSta = 1000, pviElev = 100) {
    const A = g2 - g1;
    const pvcSta = pviSta - L / 2, pvtSta = pviSta + L / 2;
    const pvcElev = pviElev - (g1 / 100) * (L / 2);
    const pvtElev = pviElev + (g2 / 100) * (L / 2);
    const elevAt = (x) => pvcElev + (g1 / 100) * x + (A / (200 * L)) * x * x;
    let turning = null;
    if (A !== 0) {
      const x = (-g1 * L) / A;
      if (x > 0 && x < L) turning = { sta: pvcSta + x, elev: elevAt(x), x };
    }
    return { A, absA: Math.abs(A), type: A < 0 ? 'crest' : 'sag', K: Math.abs(A) > 0 ? L / Math.abs(A) : Infinity,
      pvcSta, pvtSta, pvcElev, pvtElev, pviSta, pviElev, elevAt, turning };
  }

  /* GB §3.3, Eq. 3-8: R = V² / 15(e + f). e and f in ft/ft. */
  function fFor(V) {
    const t = C.gb.fLowSpeed;
    const keys = Object.keys(t).map(Number).sort((a, b) => a - b);
    if (V <= keys[0]) return t[keys[0]];
    if (V >= keys[keys.length - 1]) return t[keys[keys.length - 1]];
    for (let i = 0; i < keys.length - 1; i++) {
      if (V >= keys[i] && V <= keys[i + 1]) {
        const r = (V - keys[i]) / (keys[i + 1] - keys[i]);
        return t[keys[i]] + r * (t[keys[i + 1]] - t[keys[i]]);
      }
    }
  }
  const rmin = (V, e) => (V * V) / (15 * (e + fFor(V)));

  /* GB §3.3.12, Eq. 3-37: horizontal sightline offset (ft). Angle in degrees. */
  function hso(R, S) {
    const arg = (28.65 * S) / R;
    if (arg >= 180) return R; // sight distance longer than half circle — not meaningful
    return R * (1 - Math.cos((arg * Math.PI) / 180));
  }

  /* GB §9.5.3, Eq. 9-1: ISD = 1.47 V tg. */
  function isd(caseId, veh, V, extraLanes = 0, approachGrade = 0) {
    const c = C.gb.isd[caseId];
    let tg = c[veh] + extraLanes * c.perLane[veh];
    // Upgrade on the minor-road approach steeper than 3% adds time (GB §9.5.3 adjustment).
    if (approachGrade > 3 && c.gradePerPct) tg += (approachGrade - 3) * c.gradePerPct;
    return { tg, isd: 1.47 * V * tg, design: ceilTo(1.47 * V * tg, 5) };
  }

  /* TSTS §2.3.11 lane transition taper (ft). */
  const taperTsts = (W, S) => (S <= 40 ? (W * S * S) / 60 : W * S);
  /* TDOT HSAM Fig. 3-21 bay taper: L = WS/3, between 8:1 and 15:1. */
  function bayTaper(W, S) {
    const raw = (W * S) / 3;
    const min = C.hsam.bayRateMin * W, max = C.hsam.bayRateMax * W;
    return { raw, length: Math.min(Math.max(raw, min), max), min, max };
  }
  /* TDOT HSAM Fig. 3-22 lane drop: X = 750 + d (MUTCD Condition A). */
  function laneDrop(S) {
    const d = C.mutcdCondA[S];
    return d == null ? null : { d, X: C.laneDropBase + d };
  }

  /* TDOT HSAM Table 3-12, rounded up to the next tabulated row and column (conservative). */
  function storageUnsig(leftVol, oppVol) {
    const h = C.hsam;
    const ri = h.storageVols.findIndex((v) => leftVol <= v);
    const ci = h.storageOpp.findIndex((v) => oppVol <= v);
    if (ri < 0 || ci < 0) return null;
    return { length: h.storage[ri][ci], rowVol: h.storageVols[ri], colVol: h.storageOpp[ci] };
  }
  /* GB §9.7.2: signalized storage ≈ 2 × average arrivals per cycle × vehicle length. */
  function storageSig(leftVol, cycle, factor = 2) {
    const perCycle = (leftVol * cycle) / 3600;
    return { perCycle, length: ceilTo(factor * perCycle * C.hsam.vehLength, 25) };
  }
  const decel = (S) => C.hsam.decel[S] ?? null;

  /* HEC-22 uniform gutter (Izzard): Q = (Ku/n) Sx^1.67 SL^0.5 T^2.67 → T. Slopes ft/ft. */
  function spread(Q, n, Sx, SL) {
    if (Q <= 0) return 0;
    return Math.pow((Q * n) / (C.hec22.ku * Math.pow(Sx, 1.67) * Math.sqrt(SL)), 0.375);
  }

  /* Manning full-flow capacity for a circular pipe. D in inches, S in ft/ft. */
  function pipeFull(Din, S, n) {
    const D = Din / 12, A = (Math.PI * D * D) / 4, R = D / 4;
    const Q = (1.49 / n) * A * Math.pow(R, 2 / 3) * Math.sqrt(S);
    return { Q, V: Q / A, A };
  }
  /* Normal depth ratio y/D in a circular pipe by bisection (Q ≤ ~1.07 Qfull). */
  function pipeDepth(Din, S, n, Q) {
    const D = Din / 12;
    const flow = (y) => {
      const th = 2 * Math.acos(1 - (2 * y) / D);
      const A = ((D * D) / 8) * (th - Math.sin(th));
      const P = (D * th) / 2;
      return { Q: (1.49 / n) * A * Math.pow(A / P, 2 / 3) * Math.sqrt(S), A };
    };
    // Maximum discharge occurs near y/D = 0.938
    const qmax = flow(0.938 * D).Q;
    if (Q > qmax) return { ratio: null, surcharged: true, qmax };
    let lo = 1e-4 * D, hi = 0.938 * D;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (flow(mid).Q < Q) lo = mid; else hi = mid;
    }
    const y = (lo + hi) / 2, f = flow(y);
    return { ratio: y / D, depth: y, V: Q / f.A, surcharged: false, qmax };
  }

  /* Clear zone lookup (TDOT S-CZ-1 Table A). slope: 'f6' | 'f4'. */
  function speedBand(V) {
    if (V <= 40) return '40';
    if (V <= 50) return '45-50';
    if (V <= 55) return '55';
    if (V <= 60) return '60';
    return '65-70';
  }
  function clearZone(V, adt, slope) {
    const cz = C.clearZone.table[speedBand(V)][adt][slope];
    return { low: cz[0], high: cz[1], band: speedBand(V) };
  }
  /* TDOT S-CZ-1 Table B: Kcz for the outside of curves; R rounded down to the next tabulated radius. */
  function kcz(V, R) {
    if (!R || R > 2950) return 1.0;
    const k = C.kcz;
    const si = k.speeds.findIndex((s) => V <= s);
    const col = si < 0 ? k.speeds.length - 1 : si;
    let row = k.rows[k.rows.length - 1];
    for (const r of k.rows) { if (R >= r[0]) { row = r; break; } }
    const val = row[1][col];
    return val == null ? 1.5 : val;
  }
  /* TDOT S-PL-1 Table B runout length. adtIdx: 0..3. Speed rounded up to the next tabulated row. */
  function runout(V, adtIdx) {
    const rows = C.runout.rows;
    const speeds = Object.keys(rows).map(Number).sort((a, b) => a - b);
    const s = speeds.find((x) => V <= x) ?? speeds[speeds.length - 1];
    return { LR: rows[s][adtIdx], speed: s };
  }
  /* TDOT S-PL-1 / AASHTO RDG §5.6.4 parallel barrier: LON = (LA − L2) / (LA / LR). */
  function lon(LA, L2, LR) {
    if (LA <= L2) return 0;
    return (LA - L2) / (LA / LR);
  }

  return { ssd, ssdDesign, kCrest, kSag, kComfort, kDesign, lengthRequired, vcurve, fFor, rmin, hso, isd,
    taperTsts, bayTaper, laneDrop, storageUnsig, storageSig, decel, spread, pipeFull, pipeDepth,
    speedBand, clearZone, kcz, runout, lon, ceilTo };
})();
