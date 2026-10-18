// Inimigos menores em estilo anime
function drawBatArt(ctx, t) {
  // t: 0..1 ciclo de batida de asa
  const flap = Math.sin(t * TAU);
  const wy = flap * 13;
  for (const s of [-1, 1]) {
    const back = s < 0;
    const tip = [s * 30, -6 - wy];
    const w = smoothPath([0, -3, s * 10, -9 - wy * 0.5, tip[0], tip[1], s * 32, 5 - wy * 0.6, s * 24, 2 - wy * 0.3, s * 19, 9 - wy * 0.1, s * 12, 4, s * 7, 9, 0, 4], true, 0.15);
    part(ctx, w, back ? '#3e3048' : '#5a4566', back ? '#251c2c' : '#3a2c44', { w: 1, lx: 0, ly: 2 });
    ctx.save(); ctx.clip(w);
    ctx.fillStyle = back ? 'rgba(160,60,90,0.18)' : 'rgba(200,80,110,0.3)';
    ctx.beginPath(); ctx.ellipse(s * 16, 0 - wy * 0.4, 9, 5, 0, 0, TAU); ctx.fill();
    ctx.restore();
    for (const [fx, fy] of [[tip[0], tip[1]], [s * 24, 2 - wy * 0.3], [s * 12, 4]]) strokeLine(ctx, [s * 4, -2, fx, fy], 1.1, back ? '#1d1622' : '#2a2030');
  }
  const body = smoothPath([-7, -3, -4, -9, 4, -9, 8, -2, 6, 6, 0, 9, -6, 6]);
  part(ctx, body, '#6b5a5a', '#3f3333', { w: 1.1, lx: 1, ly: -1.5 });
  ctx.save(); ctx.clip(body);
  ctx.fillStyle = '#9b8676'; ctx.beginPath(); ctx.ellipse(1.5, 3, 4.5, 4, 0, 0, TAU); ctx.fill();
  ctx.restore();
  part(ctx, polyPath([-6, -6, -6, -15, -1.5, -8]), '#6b5a5a', '#3f3333', { w: 1 });
  part(ctx, polyPath([5, -6, 6, -15, 1.5, -8]), '#6b5a5a', '#3f3333', { w: 1 });
  for (const ex of [-1.8, 3.4]) {
    glowDot(ctx, ex, -2.5, 5, 'rgba(255,40,40,0.7)', 0.8);
    const e = new Path2D(); e.ellipse(ex, -2.5, 1.9, 1.5, 0, 0, TAU);
    ctx.fillStyle = '#ff3a2c'; ctx.fill(e); outline(ctx, e, 0.6);
    ctx.fillStyle = '#fff'; ctx.fillRect(ex - 0.9, -3.4, 0.8, 0.8);
  }
  part(ctx, polyPath([-0.5, 2.5, 0.5, 6.5, 1.5, 2.5]), '#ffffff', '#cccccc', { w: 0.5 });
  part(ctx, polyPath([2, 2.5, 3, 6, 4, 2.5]), '#ffffff', '#cccccc', { w: 0.5 });
}

function drawCrawlerArt(ctx, t, flat) {
  ctx.save(); ctx.scale(1, 1 - flat * 0.25); ctx.translate(0, flat * 2);
  const w = Math.sin(t * TAU);
  const tail = new Path2D();
  tail.moveTo(-9, -10);
  tail.quadraticCurveTo(-20, -11 + w * 4, -32, -7 + w * 8);
  tail.quadraticCurveTo(-24, -4 + w * 5, -27, 1 + w * 6);
  tail.quadraticCurveTo(-18, -1 + w * 3, -9, -1);
  tail.closePath();
  part(ctx, tail, '#5c6634', '#39401f', { w: 1 });
  const body = smoothPath([-12, -6, -6, -16, 6, -18, 16, -11, 19, -4, 14, 0.5, -10, 0.5]);
  outline(ctx, body, 2.4);
  ctx.save(); ctx.clip(body);
  ctx.fillStyle = '#4a5228'; ctx.fill(body);
  ctx.translate(1.5, -2); ctx.fillStyle = '#7c8a44'; ctx.fill(body); ctx.translate(-1.5, 2);
  ctx.fillStyle = '#b4be7a'; ctx.beginPath(); ctx.ellipse(4, -1, 14, 4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(40,46,18,0.5)';
  for (const [x, y, r] of [[-4, -11, 2.2], [3, -14, 1.6], [9, -12, 1.3], [-8, -6, 1.4]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,230,0.8)';
  ctx.beginPath(); ctx.ellipse(1, -14.5, 6, 1.4, -0.15, 0, TAU); ctx.fill();
  ctx.restore();
  // olho
  glowDot(ctx, 10, -11, 7, 'rgba(255,220,60,0.6)', 0.7);
  const eye = new Path2D(); eye.ellipse(10, -11, 3.2, 3, 0, 0, TAU);
  ctx.fillStyle = '#ffd84a'; ctx.fill(eye); outline(ctx, eye, 0.9);
  ctx.fillStyle = '#140a04'; ctx.fillRect(9.6, -13.2, 1.4, 4.4);
  ctx.fillStyle = '#fff'; ctx.fillRect(8.6, -12.6, 0.9, 0.9);
  inkStroke(ctx, 6, -15, 10, -16, 14, -13.5, 1.4, LINE);
  // boca com dentes
  const m = polyPath([11, -5, 19, -7.5, 19, -2.5, 12, -3]);
  ctx.fillStyle = '#3a0d0d'; ctx.fill(m); outline(ctx, m, 0.8);
  for (let i = 0; i < 3; i++) part(ctx, polyPath([12.4 + i * 2.2, -5.4, 13.4 + i * 2.2, -3.2, 14.4 + i * 2.2, -5.8]), '#fff', '#ccc', { w: 0.4 });
  // gosma no chão
  ctx.fillStyle = 'rgba(140,170,90,0.55)';
  ctx.beginPath(); ctx.ellipse(-2, 0.6, 17, 2.2, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawUrnArt(ctx) {
  const pts = [-6.5, -34, 6.5, -34, 5.5, -29, 13.5, -20, 14.5, -9, 9, 0, -9, 0, -14.5, -9, -13.5, -20, -5.5, -29];
  const up = smoothPath(pts, true, 0.3);
  outline(ctx, up, 2.4);
  ctx.save(); ctx.clip(up);
  ctx.fillStyle = '#4c2718'; ctx.fill(up);
  ctx.translate(2.5, -1); ctx.fillStyle = '#9b5a38'; ctx.fill(up); ctx.translate(-2.5, 1);
  ctx.fillStyle = '#c47d50'; ctx.beginPath(); ctx.ellipse(-3, -18, 3, 9, 0.1, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff3e0'; ctx.beginPath(); ctx.ellipse(-4, -20, 1, 5, 0.1, 0, TAU); ctx.fill();
  // faixas decorativas douradas
  ctx.fillStyle = '#d6ae6a'; ctx.fillRect(-15, -17, 30, 1.6); ctx.fillRect(-15, -12, 30, 1.6);
  ctx.fillStyle = '#2c160d';
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 4, -15.2); ctx.lineTo(i * 4 + 1.6, -13.6); ctx.lineTo(i * 4, -12.3); ctx.lineTo(i * 4 - 1.6, -13.6); ctx.fill(); }
  ctx.restore();
  const lip = new Path2D(); lip.ellipse(0, -34, 7.5, 2.2, 0, 0, TAU);
  part(ctx, lip, '#a86640', '#5a311d', { w: 1 });
  ctx.fillStyle = '#1a0c06'; ctx.beginPath(); ctx.ellipse(0, -34.2, 5, 1.2, 0, 0, TAU); ctx.fill();
}

function drawHealOrbArt(ctx) {
  glowDot(ctx, 0, 0, 22, 'rgba(255,60,90,0.9)', 0.8);
  const g = polyPath([0, -11, 7, -2, 0, 11, -7, -2]);
  part(ctx, g, '#ff5876', '#a3122f', { w: 1.1, lx: 2, ly: 0 });
  ctx.fillStyle = 'rgba(255,230,240,0.95)';
  ctx.beginPath(); ctx.moveTo(0, -8.5); ctx.lineTo(3.5, -2.2); ctx.lineTo(0, -1); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(-3, -4, 1.2, 1.2);
}
