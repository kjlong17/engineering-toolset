/* Checks formulas against published design values. Run with `npm test` (node --test). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as f from '../src/formulas.js';
import { C } from '../src/criteria.js';

const near = (got, want, tol = 0) => assert.ok(Math.abs(got - want) <= tol, `got ${got}, expected ${want}${tol ? ' ±' + tol : ''}`);

test('GB 7th design SSD on level grade (Table 3-1)', () => {
  for (const [v, d] of [[15, 80], [20, 115], [25, 155], [30, 200], [35, 250], [40, 305], [45, 360], [50, 425], [55, 495], [60, 570], [65, 645], [70, 730], [75, 820], [80, 910]]) {
    assert.equal(f.ssdDesign(v), d, `SSD ${v} mph`);
  }
});
test('GB 7th SSD on grades (Eq. 3-3)', () => {
  // 60 mph, 6 % downgrade: 220.5 + 3600 / (30 (0.3478 − 0.06)) = 220.5 + 416.9
  near(f.ssd(60, -6), 637.4, 0.5);
  assert.ok(f.ssd(60, -6) > f.ssd(60, 0) && f.ssd(60, 0) > f.ssd(60, 6));
});
test('GB 7th crest and sag design K (Table 3-34, 3-36)', () => {
  for (const [v, k] of [[15, 3], [20, 7], [25, 12], [30, 19], [35, 29], [40, 44], [45, 61], [50, 84], [55, 114], [60, 151], [65, 193], [70, 247], [75, 312], [80, 384]]) {
    assert.equal(f.kDesign(f.kCrest(f.ssdDesign(v))), k, `crest K ${v}`);
  }
  for (const [v, k] of [[15, 10], [20, 17], [25, 26], [30, 37], [35, 49], [40, 64], [45, 79], [50, 96], [55, 115], [60, 136], [65, 157], [70, 181], [75, 206], [80, 231]]) {
    assert.equal(f.kDesign(f.kSag(f.ssdDesign(v))), k, `sag K ${v}`);
  }
});
test('Crest length when S > L', () => {
  assert.equal(f.lengthRequired('crest', 200, 2), 0);
  near(f.lengthRequired('crest', 200, 6), 40.33, 0.05);
});
test('Vertical curve geometry matches TDOT Figure 2-4 (E = AL/800)', () => {
  const vc = f.vcurve(3, -2, 600, 1000, 100);
  near(vc.E, (5 * 600) / 800, 1e-9);
  near(vc.turning.x, (3 * 600) / 5, 1e-9);
});
test('Decision sight distance (Table 3-5 samples)', () => {
  assert.equal(f.dsd('A', 30, 3.0).design, 220);
  assert.equal(f.dsd('B', 30, 9.1).design, 490);
  assert.equal(f.dsd('A', 50, 3.0).design, 465);
  assert.equal(f.dsd('C', 30, 10.2).design, 450);
});
test('GB minimum radius (Table 3-7 samples)', () => {
  assert.equal(f.rminDesign(60, 0.08), 1200);
  assert.equal(f.rminDesign(70, 0.08), 1810);
  assert.equal(f.rminDesign(30, 0.06), 230);
  assert.equal(f.rminDesign(45, 0.04), 710);
  near(f.rmin(30, -0.02), 333, 1);
});
test('GB ISD (Tables 9-5, 9-7, 9-15)', () => {
  for (const [v, d] of [[25, 280], [30, 335], [35, 390], [40, 445], [45, 500], [50, 555]]) assert.equal(f.isd('B1', 'P', v).design, d);
  assert.equal(f.isd('B2', 'P', 30).design, 290);
  assert.equal(f.isd('F', 'P', 45).design, 365);
});
test('Curve elements R = 1000, Δ = 30° and TDOT Figure 2-1 curve data', () => {
  const hc = f.hcurve(1000, 30);
  near(hc.T, 267.95, 0.01); near(hc.L, 523.60, 0.01); near(hc.E, 35.28, 0.01); near(hc.M, 34.07, 0.01); near(hc.LC, 517.64, 0.01);
  near(hc.D, 5.73, 0.01);
  // TDOT Figure 2-1: D = 1°00'00", R = 5729.58, Δ = 3°33'33" → L = 355.92, T = 178.02
  const c = f.hcurve(5729.58, 3 + 33 / 60 + 33 / 3600);
  near(c.L, 355.92, 0.05); near(c.T, 178.02, 0.05); near(c.D, 1.0, 1e-4);
});
test('Horizontal sightline offset and its inverse', () => {
  const m = f.hso(1000, 500);
  near(m, 31.0, 0.1);
  near(f.sightFromOffset(1000, m), 500, 0.01);
});
test('Superelevation runoff (GB §3.3.8)', () => {
  const r = f.runoff(12, 1, 8, 50);
  near(r.Lr, 192, 0.01);
  near(f.runoff(12, 2, 8, 50).Lr, 288, 0.01);
  near(f.tangentRunout(2, 8, 192), 48, 0.01);
});
test('Spiral lengths', () => {
  const s = f.spiral(1000, 50);
  near(s.lsMinOffset, Math.sqrt(24 * 0.66 * 1000), 0.01);
  near(s.lsMax, Math.sqrt(24 * 3.3 * 1000), 0.01);
  near(s.lsDes, 147, 0.5);
});
test('Tapers and lane drop (TDOT §2-601 example)', () => {
  assert.equal(f.taper(12, 40), 320);
  assert.equal(f.taper(12, 45), 540);
  // TDOT example: 55 mph, W = 18 → L = 990; X = 750 + 990 = 1,740
  assert.equal(f.taper(18, 55), 990);
  assert.equal(f.laneDrop(55).X, 1740);
  assert.equal(f.laneDrop(80), null);
});
test('Roadside lookups against S-CZ-1 and S-PL-1 drawings', () => {
  // S-CZ-1 Table A
  assert.deepEqual([f.clearZone(45, '>6000', 'f4').low, f.clearZone(45, '>6000', 'f4').high], [24, 28]);
  assert.deepEqual([f.clearZone(40, '750-1500', 'b3').low, f.clearZone(40, '750-1500', 'b3').high], [12, 14]);
  assert.deepEqual([f.clearZone(70, '1500-6000', 'b3').low, f.clearZone(70, '1500-6000', 'b3').high], [16, 20]);
  assert.deepEqual([f.clearZone(60, '>6000', 'f4').low, f.clearZone(60, '>6000', 'f4').high], [36, 44]);
  assert.equal(f.clearZone(75, '>6000', 'f4'), null);
  // S-CZ-1 Table B
  assert.equal(f.kcz(50, 820), 1.4);
  assert.equal(f.kcz(40, 820), 1.3);
  assert.equal(f.kcz(60, 1475), 1.4);
  assert.equal(f.kcz(55, 1640), 1.3);
  assert.equal(f.kcz(50, 3000), 1.0);
  // S-PL-1 Table B
  assert.equal(f.runoutLength(45, 0).LR, 195);
  assert.equal(f.runoutLength(20, 3).LR, 25);
  assert.equal(f.runoutLength(80, 0).LR, null);
  // S-PL-1 formula and Tables C and D (6 ft shoulder)
  near(f.lon(16, 6, 135), 84.375, 0.01);
  assert.equal(f.lonSuggested(70, 0, 'near'), 313);
  assert.equal(f.lonSuggested(30, 0, 'near'), 63);
  assert.equal(f.lonSuggested(70, 0, 'far'), 266);
  assert.equal(f.lonSuggested(40, 3, 'far'), 33);
  assert.equal(f.lonSuggested(20, 2, 'near'), 14);
  // RDG Eq. 5-1 flared: LA = 30, L2 = 10, L1 = 50, LR = 300, flare 15:1 → 140
  near(f.lon(30, 10, 300, 50, 15), 140, 0.05);
});
test('Registry integrity', () => {
  for (const v of C.speeds) assert.ok(C.gb.f[v] != null && C.gb.relGrad[v] != null, `tables cover ${v} mph`);
  for (const s of C.rdg.clearZone.speeds) for (const a of C.rdg.clearZone.adt) for (const k of Object.keys(C.rdg.clearZone.slopeLabels)) {
    const cell = C.rdg.clearZone.table[s][a][k];
    assert.ok(Array.isArray(cell) && cell.length === 2 && cell[0] <= cell[1], `clear zone ${s} ${a} ${k}`);
  }
  for (const [r, vals] of C.rdg.kcz.rows) assert.equal(vals.length, C.rdg.kcz.speeds.length, `kcz row ${r}`);
});
