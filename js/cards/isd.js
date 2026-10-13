/* Intersection sight distance and sight triangle (AASHTO GB §9.5.3, TSTS §2.3.10). */
FST.card({
  id: 'isd', tab: 'int',
  title: 'Intersection sight distance',
  intro: 'Computes the sight distance and sight triangle a driver needs at a stop-controlled street or driveway, and checks the distance available on the plans.',
  cites: ['t232', 's2310', 'gbIsd'],
  defaults: (c) => ({ V: c.cls.designSpeed, kase: 'B1', veh: 'P', lanes: 0, grade: 0, avail: Math.ceil(c.f.isd('B1', 'P', c.cls.designSpeed).design) }),
  fields(c, s, set) {
    const u = c.ui;
    return [
      u.range({ label: 'Major street design speed', min: 15, max: 60, step: 5, value: s.V, unit: 'mph', onChange: (v) => set('V', v), hint: 'Defaults to the selected classification. Use the speed of the street being entered.' }),
      u.segmented({ label: 'Maneuver', value: s.kase, onChange: (v) => set('kase', v), options: [
        { value: 'B1', label: 'Left from stop' }, { value: 'B2', label: 'Right from stop' }, { value: 'B3', label: 'Crossing' }, { value: 'F', label: 'Left from major' }] }),
      u.segmented({ label: 'Design vehicle', value: s.veh, onChange: (v) => set('veh', v), options: [
        { value: 'P', label: 'Passenger car' }, { value: 'SU', label: 'Single-unit truck' }, { value: 'WB', label: 'Combination truck' }] }),
      u.range({ label: 'Additional lanes crossed (beyond one)', min: 0, max: 4, step: 1, value: s.lanes, unit: 'lanes', onChange: (v) => set('lanes', v), hint: 'Count medians wider than a lane as a lane. For left turns from the major street, count opposing lanes beyond one.' }),
      s.kase !== 'F' ? u.range({ label: 'Upgrade on the stopped approach', min: 0, max: 10, step: 0.5, value: s.grade, unit: '%', onChange: (v) => set('grade', v) }) : null,
      u.range({ label: 'Sight distance available on the plans', min: 0, max: 1500, step: 5, value: s.avail, unit: 'ft', onChange: (v) => set('avail', v), hint: 'Shortest of the directions that apply.' })
    ];
  },
  evaluate(c, s) {
    const { f, ui, C } = c;
    const r = f.isd(s.kase, s.veh, s.V, s.lanes, s.kase === 'F' ? 0 : s.grade);
    const cdef = C.gb.isd[s.kase];
    const ok = s.avail >= r.design;
    const R = [
      ui.check(ok, `${cdef.label}: sight distance along the major street`, ui.ft(r.design), ui.ft(s.avail), ['gbIsd', 't232'], `Time gap tg = ${r.tg.toFixed(1)} s at ${s.V} mph.`),
      { status: 'info', label: s.kase === 'F' ? 'Measure from the turning driver in the left-turn position to the opposing approach lane' : `Minor-leg decision point: ${C.gb.isdDecisionPoint} ft from the edge of the major-street traveled way (${C.gb.isdDecisionPointDesirable} ft desirable)`, cite: ['gbIsd'] },
      { status: 'info', label: 'Nothing in the sight triangle may be more than 24 in above the adjacent flow line', detail: 'Street trees may remain only if pruned up to 8 ft and their trunks do not collectively block sight lines. Lines of sight on private property need a sight distance easement shown on the plans.', cite: ['s2310'] }
    ];
    if (s.kase === 'B1' || s.kase === 'B3') R.push({ status: 'info', label: 'Check both directions: traffic from the left in the near lane and from the right in the far lane', cite: ['gbIsd'] });

    // ---- Diagram: plan view of a T intersection with sight triangle(s) ----
    const W = 640, H = 300;
    const roadY = 70, laneW = 26, edgeY = roadY + 2 * laneW; // major road two lanes
    const mx = 320; // minor road centerline
    const legPx = 60; // decision point offset (exaggerated)
    const isdPx = 270;
    const g = ui.svg(W, H, 'Intersection sight triangle (plan, not to scale)',
      `Required sight distance ${r.design} feet along the major street; ${s.avail} feet available. ${ok ? 'Meets' : 'Does not meet'} the requirement.`);
    g.rect(0, roadY, W, 2 * laneW, 'pave');
    g.line(0, roadY + laneW, W, roadY + laneW, 'mark');
    g.rect(mx - laneW, edgeY, 2 * laneW, H - edgeY, 'pave');
    g.line(mx, edgeY, mx, H, 'mark');
    g.line(mx - laneW, edgeY + 18, mx, edgeY + 18, 'mark-solid'); // stop bar
    const dp = [mx - laneW / 2, edgeY + legPx];
    const nearLane = roadY + laneW * 1.5, farLane = roadY + laneW * 0.5;
    const tri = (side, laneY) => {
      const x = side < 0 ? mx - isdPx : mx + isdPx;
      g.add('path', { d: `M${dp[0]},${dp[1]} L${x},${laneY} L${dp[0]},${laneY} Z`, class: 'tri' });
      g.line(dp[0], dp[1], x, laneY, 'sight');
      g.add('rect', { x: side < 0 ? x - 22 : x - 6, y: laneY - 7, width: 28, height: 14, rx: 3, class: 'car' });
    };
    if (s.kase === 'F') {
      // turning vehicle in far lane at intersection, opposing traffic from the right? Opposing arrives from the left in the near lane for a westbound left-turner.
      g.add('rect', { x: mx - 6, y: farLane - 7, width: 28, height: 14, rx: 3, class: 'car' });
      g.line(mx + 8, farLane, mx - isdPx, nearLane, 'sight');
      g.add('rect', { x: mx - isdPx - 22, y: nearLane - 7, width: 28, height: 14, rx: 3, class: 'car' });
      g.dimH(mx - isdPx, mx, roadY - 22, `ISD ${r.design} ft required`);
    } else {
      tri(-1, nearLane);
      g.dimH(mx - isdPx, dp[0], roadY - 22, `ISD ${r.design} ft (from left)`);
      if (s.kase !== 'B2') { tri(1, farLane); g.dimH(dp[0], mx + isdPx, roadY - 44, `ISD ${r.design} ft (from right)`); }
      g.add('circle', { cx: dp[0], cy: dp[1], r: 5, class: 'pt' });
      g.text(dp[0] - 10, dp[1] + 4, 'Driver eye', 't t-sm', { 'text-anchor': 'end' });
      g.dimV(mx + laneW + 12, edgeY, dp[1], `${C.gb.isdDecisionPoint} ft`);
    }
    g.text(16, H - 14, `Available: ${s.avail} ft ${ok ? '✓ meets' : '✕ short by ' + (r.design - s.avail) + ' ft'}`, 't t-b');
    g.text(W - 16, H - 14, 'Not to scale', 't t-sm', { 'text-anchor': 'end' });

    return {
      svg: g,
      legend: ui.legend([['tri', 'Sight triangle — keep clear above 24 in'], ['sight', 'Line of sight']]),
      results: R,
      basis: [
        ['Equation', 'AASHTO ISD = 1.47 · V(major) · tg, rounded up to 5 ft.'],
        ['Time gaps (tg)', `${cdef.label}: passenger car ${cdef.P} s, single-unit truck ${cdef.SU} s, combination truck ${cdef.WB} s. Add ${cdef.perLane.P} s (car) or ${cdef.perLane.SU} s (truck) per additional lane crossed.`],
        ['Approach grade', s.kase === 'F' ? 'Not applied for left turns from the major street.' : `Add ${cdef.gradePerPct} s for each percent of upgrade above 3% on the stopped approach.`],
        ['TSTS requirements', 'TSTS §2.3.10: sight distance per the Green Book; 24 in obstruction height above flow line; sight distance easements on plan and profile sheets.']
      ]
    };
  }
});
