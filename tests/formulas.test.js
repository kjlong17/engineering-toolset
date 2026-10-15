/* Checks formulas against published design values (AASHTO GB 7th tabulated results, TSTS Table 2.3(2), HEC-22 / Manning hand calcs). */
(function () {
  const f = FST.f, out = document.getElementById('out');
  let pass = 0, fail = 0;
  const eq = (name, got, want, tol = 0) => {
    const ok = Math.abs(got - want) <= tol;
    ok ? pass++ : fail++;
    const li = document.createElement('li');
    li.className = ok ? 'p' : 'f';
    li.textContent = `${ok ? 'PASS' : 'FAIL'} ${name}: got ${typeof got === 'number' ? +got.toFixed(3) : got}, expected ${want}${tol ? ' ±' + tol : ''}`;
    out.append(li);
  };
  // GB 7th design SSD (level)
  for (const [v, d] of [[15, 80], [20, 115], [25, 155], [30, 200], [35, 250], [40, 305], [45, 360], [50, 425], [55, 495], [60, 570]]) eq(`SSD ${v} mph`, f.ssdDesign(v), d);
  // GB 7th crest / sag K (design, rounded up)
  for (const [v, k] of [[20, 7], [25, 12], [30, 19], [35, 29], [40, 44], [45, 61], [50, 84]]) eq(`Crest K ${v} mph`, f.kDesign(f.kCrest(f.ssdDesign(v))), k);
  for (const [v, k] of [[20, 17], [25, 26], [30, 37], [35, 49], [40, 64], [45, 79], [50, 96]]) eq(`Sag K ${v} mph`, f.kDesign(f.kSag(f.ssdDesign(v))), k);
  // TSTS Table 2.3(2) normal-crown minimum radius reproduced by R = V²/15(e+f) with e = −0.02
  for (const [v, r] of [[30, 333], [35, 510], [40, 762]]) eq(`Rmin NC ${v} mph (TSTS table)`, Math.round(f.rmin(v, -0.02)), r, 1);
  eq('Rmin e=0.04 45 mph (TSTS 711)', Math.round(f.rmin(45, 0.04)), 711, 1);
  // GB high-speed side friction (f = 0.13 at 55 mph, 0.12 at 60 mph)
  eq('Rmin e=0.04 55 mph (GB 1,190)', f.rmin(55, 0.04), 1190, 5);
  eq('Rmin e=0.04 60 mph (GB 1,500)', f.rmin(60, 0.04), 1500, 1);
  // GB ISD (Case B1 passenger car) — tabulated design values
  for (const [v, d] of [[25, 280], [30, 335], [35, 390], [40, 445], [45, 500], [50, 555]]) eq(`ISD B1 P ${v} mph`, f.isd('B1', 'P', v).design, d);
  for (const [v, d] of [[30, 290], [45, 430]]) eq(`ISD B2 P ${v} mph`, f.isd('B2', 'P', v).design, d);
  for (const [v, d] of [[30, 245], [45, 365]]) eq(`ISD F P ${v} mph`, f.isd('F', 'P', v).design, d);
  // Tapers
  eq('Transition taper W=12 S=40', f.taperTsts(12, 40), 320);
  eq('Transition taper W=12 S=45', f.taperTsts(12, 45), 540);
  eq('Bay taper W=12 S=45 (WS/3 = 180, within 96–180)', f.bayTaper(12, 45).length, 180);
  eq('Bay taper W=12 S=20 (WS/3 = 80, raised to 8:1 = 96)', f.bayTaper(12, 20).length, 96);
  eq('Lane drop X at 55 mph (RDG example 1,740)', f.laneDrop(55).X, 1740);
  // HSAM tables
  eq('HSAM decel 45 mph', f.decel(45), 340);
  eq('HSAM storage 200 left / 1000 opp', f.storageUnsig(200, 1000).length, 200);
  eq('HSAM storage 150 left / 500 opp (rounds to 160/600)', f.storageUnsig(150, 500).length, 75);
  // Hydraulics
  eq('Manning 18 in @ 1% n=0.013 full Q', f.pipeFull(18, 0.01, 0.013).Q, 10.5, 0.1);
  eq('Manning 15 in @ 0.5% n=0.013 full Q', f.pipeFull(15, 0.005, 0.013).Q, 4.57, 0.05);
  eq('Depth ratio at Q = Qfull/2 (18 in) ≈ 0.50', f.pipeDepth(18, 0.01, 0.013, f.pipeFull(18, 0.01, 0.013).Q / 2).ratio, 0.50, 0.03);
  eq('Spread Q=2 n=.016 Sx=.02 SL=.01', f.spread(2, 0.016, 0.02, 0.01), 9.39, 0.05);
  eq('Gutter capacity is the inverse of spread', f.gutterCapacity(f.spread(2, 0.016, 0.02, 0.01), 0.016, 0.02, 0.01), 2, 1e-6);
  eq('Pipe size Q=10 cfs @ 1% (18 in carries 10.5)', f.pipeSize(10, 0.01, 0.013, 15), 18);
  eq('Pipe size Q=4.5 cfs @ 0.5% (15 in carries 4.57)', f.pipeSize(4.5, 0.005, 0.013, 15), 15);
  eq('Pipe size respects upstream minimum 24 in', f.pipeSize(1, 0.01, 0.013, 24), 24);
  // Curve elements, R = 1000 ft, Δ = 30°
  const hc = f.hcurve(1000, 30);
  eq('Curve T', hc.T, 267.95, 0.01); eq('Curve L', hc.L, 523.60, 0.01); eq('Curve E', hc.E, 35.28, 0.01);
  eq('Curve M', hc.M, 34.07, 0.01); eq('Curve LC', hc.LC, 517.64, 0.01);
  // Roadside
  eq('Clear zone 45-50 mph >6000 5:1–4:1 (upper)', f.clearZone(45, '>6000', 'f4').high, 28);
  eq('Kcz 50 mph R=820', f.kcz(50, 820), 1.4);
  eq('Runout 45 mph ADT>10000', f.runout(45, 0).LR, 195);
  eq('LON LA=16 L2=6 LR=135', f.lon(16, 6, 135), 84.375, 0.01);
  document.getElementById('sum').textContent = `${pass} passed, ${fail} failed`;
  document.getElementById('sum').className = fail ? 'f' : 'p';
})();
