/* Intersection sight distance and sight triangle (AASHTO GB §9.5.3, TSTS §2.3.10). */
FST.card({
  id: 'isd', tab: 'int',
  title: 'Intersection sight distance',
  intro: 'Gives the sight distance and sight triangle a driver needs at a stop-controlled street or driveway, for the maneuver, design vehicle and major-street speed.',
  cites: ['t232', 's2310', 'gbIsd'],
  defaults: (c) => ({ V: c.cls.designSpeed, kase: 'B1', veh: 'P', lanes: 0, grade: 0 }),
  fields(c, s, set) {
    const u = c.ui;
    return [
      u.range({ label: 'Major street design speed', min: 15, max: 60, step: 5, value: s.V, unit: 'mph', onChange: (v) => set('V', v), hint: 'Defaults to the selected classification. Use the design speed of the major (through) street.' }),
      u.segmented({ label: 'Maneuver', value: s.kase, onChange: (v) => set('kase', v, { rebuild: true }), options: [
        { value: 'B1', label: 'Left turn from stop (B1)' }, { value: 'B2', label: 'Right turn from stop (B2)' }, { value: 'B3', label: 'Crossing from stop (B3)' }, { value: 'F', label: 'Left turn from major street (F)' }] }),
      u.segmented({ label: 'Design vehicle', value: s.veh, onChange: (v) => set('veh', v), options: [
        { value: 'P', label: 'Passenger car' }, { value: 'SU', label: 'Single-unit truck' }, { value: 'WB', label: 'Combination truck' }] }),
      s.kase === 'B2' ? null : u.range({ label: 'Additional lanes crossed (beyond one)', min: 0, max: 4, step: 1, value: s.lanes, unit: 'lanes', onChange: (v) => set('lanes', v), hint: 'Count medians wider than a lane as a lane. For left turns from the major street, count opposing lanes beyond one.' }),
      s.kase !== 'F' ? u.range({ label: 'Upgrade on the stopped approach', min: 0, max: 10, step: 0.5, value: s.grade, unit: '%', onChange: (v) => set('grade', v) }) : null
    ];
  },
  evaluate(c, s) {
    const { f, ui, C } = c;
    const r = f.isd(s.kase, s.veh, s.V, s.lanes, s.kase === 'F' ? 0 : s.grade);
    const cdef = C.gb.isd[s.kase];
    const R = [
      ui.val(`Intersection sight distance along the major street (${cdef.label})`, ui.ft(r.design), ['gbIsd', 't232'], `Computed ${ui.fmt(r.isd, 1)} ft, rounded up to the next 5 ft.`),
      ui.val('Time gap (tg)', `${r.tg.toFixed(1)} s`, ['gbIsd']),
      s.kase === 'F' ? ui.info('Measure from the turning driver in the left-turn position to the opposing approach lane', ['gbIsd'])
        : ui.val('Minor-leg decision point from the edge of the major-street traveled way', `${C.gb.isdDecisionPoint} ft (${C.gb.isdDecisionPointDesirable} ft desirable)`, ['gbIsd']),
      ui.val('Maximum height of objects in the sight triangle', '24 in above the adjacent flow line', ['s2310'], 'Street trees may remain only if pruned up to 8 ft and their trunks do not collectively block sight lines. Lines of sight on private property need a sight distance easement shown on the plans.')
    ];
    if (s.kase === 'B1' || s.kase === 'B3') R.push(ui.info('Provide the sight distance in both directions: traffic from the left in the near lane and from the right in the far lane', ['gbIsd']));

    // ---- Diagram: plan view of a T intersection with sight triangle(s) ----
    const W = 640, H = 300;
    const roadY = 70, laneW = 26, edgeY = roadY + 2 * laneW; // major road two lanes
    const mx = 320; // minor road centerline
    const legPx = 60; // decision point offset (exaggerated)
    const isdPx = 270;
    const g = ui.svg(W, H, 'Intersection sight triangle (plan, not to scale)',
      `Required sight distance ${r.design} feet along the major street, with the driver eye ${C.gb.isdDecisionPoint} feet back from the edge of the traveled way.`);
    g.rect(0, roadY, W, 2 * laneW, 'pave');
    g.line(0, roadY + laneW, W, roadY + laneW, 'mark');
    g.rect(mx - laneW, edgeY, 2 * laneW, H - edgeY, 'pave');
    g.line(mx, edgeY, mx, H, 'mark');
    g.line(mx, edgeY + 18, mx + laneW, edgeY + 18, 'stop-bar'); // stop bar on the approach (right-hand) lane
    const dp = [mx + laneW / 2, edgeY + legPx];
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
      g.dimH(mx - isdPx, mx, roadY - 22, `ISD ${r.design} ft`);
    } else {
      tri(-1, nearLane);
      g.dimH(mx - isdPx, dp[0], roadY - 22, `ISD ${r.design} ft (from left)`);
      if (s.kase !== 'B2') { tri(1, farLane); g.dimH(dp[0], mx + isdPx, roadY - 44, `ISD ${r.design} ft (from right)`); }
      g.add('circle', { cx: dp[0], cy: dp[1], r: 5, class: 'pt' });
      g.text(dp[0] + 10, dp[1] + 18, 'Driver eye', 't t-sm');
      g.dimV(mx + laneW + 12, edgeY, dp[1], '');
      g.text(mx + laneW + 18, edgeY + 16, `${C.gb.isdDecisionPoint} ft`, 't dim-t');
    }
    g.text(16, H - 14, `ISD ${r.design} ft · tg ${r.tg.toFixed(1)} s · ${s.V} mph`, 't t-b');
    g.text(W - 16, H - 14, 'Not to scale', 't t-sm', { 'text-anchor': 'end' });

    return {
      svg: g,
      legend: ui.legend([['tri', 'Sight triangle — keep clear above 24 in'], ['sight', 'Line of sight']]),
      results: R,
      basis: [
        ['Equation', 'AASHTO ISD = 1.47 · V(major) · tg, rounded up to the next 5 ft.'],
        ['Time gaps (tg)', `${cdef.label}: passenger car ${cdef.P} s, single-unit truck ${cdef.SU} s, combination truck ${cdef.WB} s. ${cdef.perLane.P ? `Add ${cdef.perLane.P} s (car) or ${cdef.perLane.SU} s (truck) per additional lane crossed.` : 'No adjustment for additional lanes.'}`],
        ['Approach grade', s.kase === 'F' ? 'Not applied for left turns from the major street.' : `Add ${cdef.gradePerPct} s for each percent of upgrade above 3% on the stopped approach.`],
        ['TSTS requirements', 'TSTS §2.3.10: sight distance per the Green Book; 24 in obstruction height above flow line; sight distance easements on plan and profile sheets.']
      ]
    };
  }
});
