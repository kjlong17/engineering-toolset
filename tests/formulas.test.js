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
  // S = 200 ft, A = 2 %: L1 = 2·200²/2158 = 37 < S, so L = 2S − 2158/A = 400 − 1079 = negative → 0
  assert.equal(f.lengthRequired('crest', 200, 2), 0);
  // A = 6 %: L1 = 111 < 200 → L = 400 − 359.7 = 40.3
  near(f.lengthRequired('crest', 200, 6), 40.33, 0.05);
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
  assert.equal(f.rminDesign(30, 0.06), 230); // 900/(15·0.26) = 230.8
  assert.equal(f.rminDesign(45, 0.04), 710); // 2025/(15·0.19) = 710.5
  near(f.rmin(30, -0.02), 333, 1);
});
test('GB ISD (Tables 9-5, 9-7, 9-15)', () => {
  for (const [v, d] of [[25, 280], [30, 335], [35, 390], [40, 445], [45, 500], [50, 555]]) assert.equal(f.isd('B1', 'P', v).design, d);
  assert.equal(f.isd('B2', 'P', 30).design, 290);
  assert.equal(f.isd('F', 'P', 45).design, 365);
});
test('Curve elements R = 1000, Δ = 30°', () => {
  const hc = f.hcurve(1000, 30);
  near(hc.T, 267.95, 0.01); near(hc.L, 523.60, 0.01); near(hc.E, 35.28, 0.01); near(hc.M, 34.07, 0.01); near(hc.LC, 517.64, 0.01);
  near(hc.D, 5.73, 0.01);
});
test('Horizontal sightline offset and its inverse', () => {
  const m = f.hso(1000, 500);
  near(m, 31.0, 0.1);           // GB Fig. 3-23 example: R = 1000, S = 500 → M ≈ 31 ft
  near(f.sightFromOffset(1000, m), 500, 0.01);
});
test('Superelevation runoff (GB §3.3.8 example)', () => {
  // 12 ft lane, one lane rotated, ed = 8 %, 50 mph: Δ = 0.50 % → Lr = 12·8/0.50 = 192 ft
  const r = f.runoff(12, 1, 8, 50);
  near(r.Lr, 192, 0.01);
  // Two lanes rotated: bw = 0.75 → 288
  near(f.runoff(12, 2, 8, 50).Lr, 288, 0.01);
  near(f.tangentRunout(2, 8, 192), 48, 0.01);
});
test('Spiral lengths', () => {
  const s = f.spiral(1000, 50);
  near(s.lsMinOffset, Math.sqrt(24 * 0.66 * 1000), 0.01);
  near(s.lsMax, Math.sqrt(24 * 3.3 * 1000), 0.01);
  near(s.lsDes, 147, 0.5);
});
test('MUTCD tapers', () => {
  assert.equal(f.taper(12, 40), 320);
  assert.equal(f.taper(12, 45), 540);
});
test('Roadside lookups', () => {
  assert.equal(f.clearZone(45, '>6000', 'f4').high, 28);
  assert.equal(f.kcz(50, 820), 1.4);
  assert.equal(f.kcz(50, 3000), 1.0);
  assert.equal(f.runoutLength(45, 0).LR, 195);
  near(f.lon(16, 6, 135), 84.375, 0.01);
  // RDG §5.6.4 flared example: LA = 30, L2 = 10, L1 = 50, LR = 300, flare 15:1 → X = (30 + 50/15 − 10)/(1/15 + 30/300) = 23.33/0.1667 = 140
  near(f.lon(30, 10, 300, 50, 15), 140, 0.05);
});
test('Registry integrity', () => {
  for (const v of C.speeds) assert.ok(C.gb.f[v] != null && C.gb.relGrad[v] != null, `tables cover ${v} mph`);
});
