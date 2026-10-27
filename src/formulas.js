/*
 * Pure calculation functions. Each cites its source; constants come from the criteria registry.
 * Units: feet, mph, percent grades and slopes unless noted. Superelevation e is in ft/ft.
 */
import { C } from './criteria.js';

export const ceilTo = (x, step) => Math.ceil(x / step - 1e-9) * step;
export const fmt1 = (x) => (isFinite(x) ? Number(x).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—');
export const fmt0 = (x) => (isFinite(x) ? (Math.round(x) + 0).toLocaleString('en-US') : '—');
export const fmt = (x, d = 0) => (x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));
const G = C.gb;

/* ---------- Sight distance ---------- */

/* GB §3.2.2. Level: Eq. 3-2, d = 1.47 V t + 1.075 V²/a. On grades: Eq. 3-3, braking = V² / [30 ((a/32.2) ± G)].
   G = grade in percent (negative = downgrade). Returns ft. */
export function ssd(V, grade = 0) {
  const brake = grade === 0 ? (G.brakeConst * V * V) / G.decel : (V * V) / (30 * (G.decel / G.g + grade / 100));
  return G.mphToFps * V * G.prt + brake;
}
export const ssdParts = (V, grade = 0) => {
  const reaction = G.mphToFps * V * G.prt;
  return { reaction, brake: ssd(V, grade) - reaction, total: ssd(V, grade) };
};
/* Design value: rounded up to the next 5 ft (GB practice). */
export const ssdDesign = (V, grade = 0) => ceilTo(ssd(V, grade), G.rounding.ssd);

/* GB §3.2.3 decision sight distance. kind A–E; t is the pre-maneuver time in s (A and B include braking). */
export function dsd(kind, V, t) {
  const k = G.dsd[kind];
  const d = G.mphToFps * V * t + (k.brake ? (V * V) / (30 * (G.decel / G.g)) : 0);
  return { raw: d, design: ceilTo(d, 5) };
}

/* GB §9.5.3, Eq. 9-1: ISD = 1.47 V tg. */
export function isd(caseId, veh, V, extraLanes = 0, approachGrade = 0) {
  const c = G.isd[caseId];
  let tg = c[veh] + extraLanes * c.perLane[veh];
  if (approachGrade > 3 && c.gradePerPct) tg += (approachGrade - 3) * c.gradePerPct;
  const d = G.mphToFps * V * tg;
  return { tg, isd: d, design: ceilTo(d, G.rounding.isd) };
}

/* ---------- Vertical ---------- */

/* GB §3.4.6: K for S < L. Crest uses h1 = 3.5 ft, h2 = 2.0 ft; sag uses headlight 2 ft, 1° beam. */
export const kCrest = (S) => (S * S) / G.kCrestDen;
export const kSag = (S) => (S * S) / (400 + 3.5 * S);
export const kPass = (S) => (S * S) / G.kPassDen;
export const kComfort = (V) => (V * V) / G.kComfortDen;
/* Sag curve under a structure, GB §3.4.6: K = S² / [800 (C − (h1 + h2)/2)] for S < L. Cclear in ft. */
export const kSagUnder = (S, Cclear) => (S * S) / (800 * (Cclear - (G.sagUnder.h1 + G.sagUnder.h2) / 2));
/* GB design K: calculated K shown to one decimal, then rounded up to a whole number. */
export const kDesign = (k) => Math.ceil(Math.round(k * 10) / 10 - 1e-9);

/* Required curve length for sight distance S and algebraic difference A (%). Handles S > L. */
export function lengthRequired(type, S, A) {
  if (A <= 0) return 0;
  const den = type === 'crest' ? G.kCrestDen : type === 'pass' ? G.kPassDen : 400 + 3.5 * S;
  const L1 = (A * S * S) / den;
  if (L1 >= S) return L1;
  return Math.max(0, 2 * S - den / A);
}

/* Vertical curve geometry. Grades in %, stations in ft. */
export function vcurve(g1, g2, L, pviSta = 1000, pviElev = 100) {
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
    E: (Math.abs(A) * L) / 800, pvcSta, pvtSta, pvcElev, pvtElev, pviSta, pviElev, elevAt, turning };
}

/* ---------- Horizontal ---------- */

/* Maximum side friction factor by design speed (GB Table 3-7), interpolated between tabulated speeds. */
export function fFor(V) {
  const t = G.f;
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
/* GB §3.3.3, Eq. 3-8: Rmin = V² / [15 (e + f)], e in ft/ft. */
export const rmin = (V, e) => (V * V) / (15 * (e + fFor(V)));
/* GB practice: minimum radius rounded to the nearest 5 ft (10 ft above 1000). */
export const rminDesign = (V, e) => { const r = rmin(V, e); return r > 1000 ? Math.round(r / 10) * 10 : Math.round(r / 5) * 5; };

/* Circular curve elements. R in ft, delta in degrees. */
export function hcurve(R, delta) {
  const d = (delta * Math.PI) / 180;
  return { T: R * Math.tan(d / 2), L: R * d, E: R * (1 / Math.cos(d / 2) - 1), M: R * (1 - Math.cos(d / 2)), LC: 2 * R * Math.sin(d / 2), D: 5729.578 / R };
}
export const degreeOfCurve = (R) => 5729.578 / R;
export const radiusFromDegree = (D) => 5729.578 / D;

/* GB §3.3.12, Eq. 3-37: horizontal sightline offset (ft). */
export function hso(R, S) {
  const arg = (28.65 * S) / R;
  if (arg >= 180) return R;
  return R * (1 - Math.cos((arg * Math.PI) / 180));
}
/* Inverse: sight distance available for a given middle ordinate M (GB Eq. 3-38). */
export const sightFromOffset = (R, M) => (R / 28.65) * (Math.acos(1 - M / R) * 180 / Math.PI);

/* GB §3.3.8, Eq. 3-23: superelevation runoff Lr = (w n1 ed / Δ) bw. w ft, ed and Δ in %, n1 lanes rotated. */
export function runoff(w, n1, ed, V) {
  const delta = G.relGrad[V] ?? null;
  if (delta == null) return null;
  const bw = G.bw[n1] ?? (1 + 0.5 * (n1 - 1)) / n1; // bw = (1 + C(n1 − 1)) / n1 with C = 0.5
  return { delta, bw, Lr: ((w * n1 * ed) / delta) * bw };
}
/* GB Eq. 3-24: tangent runout Lt = (eNC / ed) Lr. */
export const tangentRunout = (eNC, ed, Lr) => (eNC / ed) * Lr;

/* GB §3.3.8 spiral lengths. R ft, V mph, Cc ft/s³. */
export function spiral(R, V, Cc = G.spiral.Cdefault) {
  const lsMinOffset = Math.sqrt(24 * G.spiral.pMin * R);     // Eq. 3-26
  const lsMinComfort = (3.15 * V * V * V) / (R * Cc);        // Eq. 3-27
  const lsMax = Math.sqrt(24 * G.spiral.pMax * R);           // Eq. 3-28
  const lsDes = G.mphToFps * V * G.spiral.desirableSeconds;  // 2 s of travel (Table 3-20 basis)
  return { lsMinOffset, lsMinComfort, lsMin: Math.max(lsMinOffset, lsMinComfort), lsMax, lsDes };
}

/* Taper (TDOT RDG §2-601/§2-602, MUTCD §3B.09): L = WS²/60 below 45 mph; L = WS at 45 mph and above. */
export const taper = (W, S) => (S < C.mutcd.taperBreak ? (W * S * S) / 60 : W * S);
/* TDOT RDG §2-601 Figure 2-9 lane drop after an intersection: X = 750 ft + d, d from Table 2-4 Condition A. Returns null if S is not tabulated. */
export function laneDrop(S) {
  const d = C.tdot2.condA[S];
  return d == null ? null : { d, X: C.tdot2.laneDrop.base + d };
}

/* ---------- Roadside ---------- */

export function speedBand(V) {
  if (V <= 40) return '40';
  if (V <= 50) return '45-50';
  if (V <= 55) return '55';
  if (V <= 60) return '60';
  return '65-70';
}
/* Clear zone lookup (S-CZ-1 Table A). slope: f6 | f4 | b6 | b4 | b3. Returns null above the tabulated speeds. */
export function clearZone(V, adt, slope) {
  if (V > C.rdg.maxTabulatedSpeed) return null;
  const cz = C.rdg.clearZone.table[speedBand(V)][adt][slope];
  return { low: cz[0], high: cz[1], band: speedBand(V) };
}
/* S-CZ-1 Table B: Kcz on the outside of curves; R rounded down to the next tabulated radius. */
export function kcz(V, R) {
  if (!R || R > 2950) return 1.0;
  const k = C.rdg.kcz;
  const si = k.speeds.findIndex((s) => V <= s);
  const col = si < 0 ? k.speeds.length - 1 : si;
  let row = k.rows[k.rows.length - 1];
  for (const r of k.rows) { if (R >= r[0]) { row = r; break; } }
  const val = row[1][col];
  return val == null ? 1.5 : val;
}
/* S-PL-1 Table B runout length. adtIdx 0..3. Speed rounded up to the next tabulated row; null above 70 mph. */
export function runoutLength(V, adtIdx) {
  const rows = C.rdg.runout.rows;
  const speeds = Object.keys(rows).map(Number).sort((a, b) => a - b);
  const s = speeds.find((x) => V <= x);
  if (s == null) return { LR: null, speed: null };
  return { LR: rows[s][adtIdx], speed: s };
}
/* S-PL-1 Tables C and D: suggested length of need from Table A clear zone, Table B runout and a 6 ft shoulder. side: 'near' (L2 = 6) | 'far' (L2 = 12). */
export function lonSuggested(V, adtIdx, side = 'near') {
  const Lc = C.rdg.lonLcMax[V], r = runoutLength(V, adtIdx);
  if (Lc == null || r.LR == null) return null;
  const L2 = side === 'far' ? C.rdg.lonTables.L2far : C.rdg.lonTables.L2near;
  return Math.round(lon(Lc, L2, r.LR));
}
/* RDG §5.6.4, Eq. 5-1: X = (LA + (b/a)·L1 − L2) / ((b/a) + LA/LR). flareRate is the a in b:a = 1:a; 0 for parallel. */
export function lon(LA, L2, LR, L1 = 0, flareRate = 0) {
  const ba = flareRate > 0 ? 1 / flareRate : 0;
  if (LA <= L2 && ba === 0) return 0;
  return (LA + ba * L1 - L2) / (ba + LA / LR);
}
