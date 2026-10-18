// Rain — protagonista em estilo anime cel-shaded. Coordenadas: pés em (0,0), olhando para a direita.
const RC = {
  skin: '#f0c3a1', skinS: '#cf8f72', skinD: '#b9785e', skinLine: '#5a2c2a',
  hair: '#f6f5fc', hairS: '#bdb9d3', hairD: '#8f8aab', hairBack: '#d4d1e6',
  top: '#2b2c35', topS: '#16161c', topHi: '#535668',
  jeans: '#4d72aa', jeansS: '#33507f', jeansD: '#253b61', jeansHi: '#8eaedc',
  tattoo: '#7e1d26', band: '#3a2a22', sandal: '#4b2f20', strap: '#2a1910',
  iris: '#566c80', irisL: '#a9c0cf',
  steel: '#d3d9e3', steelS: '#8890a0', steelD: '#5b6272',
};

function drawRainSword(ctx, hx, hy, a) {
  ctx.save();
  ctx.translate(hx, hy); ctx.rotate(a);
  // lâmina partida (u ao longo, v através)
  const blade = [3, -4, 20, -4.6, 23, -2.3, 27, -5, 40, -3.6, 49, 0.8, 42, 2.4, 35, 4.3, 29, 2.2, 23.5, 4.5, 3, 4];
  const bp = polyPath(blade);
  ctx.save(); ctx.clip(bp);
  ctx.fillStyle = RC.steelS; ctx.fill(bp);
  ctx.fillStyle = RC.steel; ctx.fillRect(0, -6, 60, 6);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, -6, 60, 1.6);
  ctx.fillStyle = RC.steelD; ctx.fillRect(0, 3, 60, 3);
  // ferrugem e lascas
  ctx.fillStyle = 'rgba(120,70,40,0.45)';
  ctx.beginPath(); ctx.ellipse(31, 1.5, 4, 1.6, 0.2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(13, 2.6, 3, 1, 0, 0, TAU); ctx.fill();
  ctx.restore();
  strokeLine(ctx, [5, 0.3, 26, 0.2], 0.8, 'rgba(70,76,92,0.9)');
  outline(ctx, bp, 1.1);
  // guarda
  const gp = polyPath([-1, -8, 3, -7, 4, 7, -1, 8, -2.5, 0]);
  part(ctx, gp, '#9a7848', '#5e4527', { w: 1 });
  // empunhadura com tiras
  const grip = capsule(-1, 0, 2.4, -11, 0, 2.2);
  part(ctx, grip, '#4f3424', '#2f1d13', { w: 1 });
  for (let u = -10; u < -1; u += 2.2) strokeLine(ctx, [u, -2.2, u + 1.5, 2.2], 0.7, '#21140c');
  const pom = new Path2D(); pom.arc(-12.6, 0, 2.6, 0, TAU);
  part(ctx, pom, '#a8875a', '#6b5233', { w: 1 });
  ctx.restore();
}

function rainLeg(ctx, hx, hy, L, back, footAng = 0) {
  const base = back ? RC.jeansS : RC.jeans, shade = back ? RC.jeansD : RC.jeansS;
  const kx = L.jx, ky = L.jy, ax = L.ex, ay = L.ey;
  const thigh = capsule(hx, hy, 6.2, kx, ky, 5.0);
  const shin = capsule(kx, ky, 5.0, ax, ay - 1, 4.4);
  const leg = new Path2D(); leg.addPath(thigh); leg.addPath(shin);
  outline(ctx, leg, 2.3);
  cel(ctx, leg, base, shade, 1.6, -1.2);
  // desgaste claro nas coxas
  ctx.save(); ctx.clip(leg);
  ctx.fillStyle = back ? 'rgba(140,170,215,0.25)' : 'rgba(150,185,230,0.45)';
  ctx.beginPath(); ctx.ellipse(lerp(hx, kx, 0.45) + 1.5, lerp(hy, ky, 0.45), 3, 6, Math.atan2(ky - hy, kx - hx) + Math.PI / 2, 0, TAU); ctx.fill();
  ctx.restore();
  // rasgos com pele e fios
  const holes = [[lerp(hx, kx, 0.86), lerp(hy, ky, 0.86), 3.2, 2.2], [lerp(kx, ax, 0.5) + 0.8, lerp(ky, ay, 0.5), 2.0, 1.5]];
  for (const [x, y, rx, ry] of holes) {
    const hp = new Path2D();
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * TAU, r = (i % 2 ? 0.75 : 1);
      const px = x + Math.cos(a) * rx * r, py = y + Math.sin(a) * ry * r;
      i ? hp.lineTo(px, py) : hp.moveTo(px, py);
    }
    hp.closePath();
    outline(ctx, hp, 1.3, '#22304a');
    ctx.fillStyle = back ? RC.skinS : RC.skin; ctx.fill(hp);
    ctx.save(); ctx.clip(hp);
    ctx.fillStyle = 'rgba(90,40,40,0.28)'; ctx.fillRect(x - rx, y - ry, rx * 2, ry * 0.8);
    strokeLine(ctx, [x - rx, y + 0.1, x + rx, y - 0.2], 0.35, 'rgba(235,240,250,0.85)');
    ctx.restore();
  }
  // barra esfarrapada
  const ang = Math.atan2(ay - ky, ax - kx);
  ctx.save(); ctx.translate(ax, ay - 1); ctx.rotate(ang - Math.PI / 2);
  const hem = polyPath([-5.4, -2, 5.4, -2, 5.8, 2.6, 3.6, 1.2, 2.4, 3.4, 0.4, 1.4, -1.4, 3.2, -3.2, 1.4, -5.6, 2.8]);
  part(ctx, hem, back ? RC.jeansS : RC.jeansHi, back ? RC.jeansD : RC.jeans, { w: 0.9 });
  strokeLine(ctx, [-2.5, 3, -2.8, 5], 0.4, '#d8e2f0'); strokeLine(ctx, [1.5, 3, 1.9, 5.2], 0.4, '#d8e2f0');
  ctx.restore();
  // tornozelo e pé com chinelo
  const ank = capsule(ax, ay + 0.5, 2.4, ax + 0.6, ay + 3.2, 2.3);
  part(ctx, ank, back ? RC.skinS : RC.skin, back ? RC.skinD : RC.skinS, { w: 0.9 });
  ctx.save(); ctx.translate(ax, ay + 3.5); ctx.rotate(footAng);
  const foot = smoothPath([-3.6, -1.6, 2, -1.8, 9, -0.6, 10.6, 1.6, 9.5, 2.6, -3.8, 2.6]);
  part(ctx, foot, back ? RC.skinS : RC.skin, back ? RC.skinD : RC.skinS, { w: 0.9 });
  const sole = polyPath([-4.6, 2.4, 11, 2.4, 11.3, 4, -4.6, 4]);
  part(ctx, sole, RC.sandal, RC.strap, { w: 0.8 });
  strokeLine(ctx, [6.5, 0.0, 3.6, 2.4], 1.1, RC.strap); strokeLine(ctx, [6.5, 0, 1.0, 1.8], 0.9, RC.strap);
  ctx.restore();
}

function rainArm(ctx, sx, sy, A, back, holdSword) {
  const base = back ? RC.skinS : RC.skin, shade = back ? RC.skinD : RC.skinS;
  const upper = limbPath(sx, sy, 4.5, lerp(sx, A.jx, 0.45), lerp(sy, A.jy, 0.45), 4.2, A.jx, A.jy, 3.3);
  const fore = limbPath(A.jx, A.jy, 3.3, lerp(A.jx, A.ex, 0.4), lerp(A.jy, A.ey, 0.4), 3.4, A.ex, A.ey, 2.6);
  const arm = new Path2D(); arm.addPath(upper); arm.addPath(fore);
  outline(ctx, arm, 2.2);
  cel(ctx, arm, base, shade, 1.3, -1.3);
  if (!back) {
    // tatuagem tribal no ombro/braço
    ctx.save(); ctx.clip(upper);
    const ang = Math.atan2(A.jy - sy, A.jx - sx);
    ctx.translate(lerp(sx, A.jx, 0.42), lerp(sy, A.jy, 0.42)); ctx.rotate(ang);
    ctx.fillStyle = RC.tattoo;
    inkStroke(ctx, -6, -3, -1, 2.5, 5, -3.5, 1.6, RC.tattoo);
    inkStroke(ctx, -4, 3.5, 1, -1, 6.5, 2.5, 1.3, RC.tattoo);
    inkStroke(ctx, -7, 0.5, -3, -1, 0, 0.5, 1.1, RC.tattoo);
    ctx.restore();
    // definição muscular
    curve(ctx, lerp(sx, A.jx, 0.25) - 1, lerp(sy, A.jy, 0.25), lerp(sx, A.jx, 0.5) - 2.6, lerp(sy, A.jy, 0.5), lerp(sx, A.jx, 0.75) - 1, lerp(sy, A.jy, 0.75), 0.5, 'rgba(120,60,50,0.55)');
  }
  // pulseira (braço de trás) / munhequeira
  const wx = lerp(A.jx, A.ex, 0.78), wy = lerp(A.jy, A.ey, 0.78);
  const ang2 = Math.atan2(A.ey - A.jy, A.ex - A.jx);
  if (back) {
    ctx.save(); ctx.translate(wx, wy); ctx.rotate(ang2);
    const b = polyPath([-1.6, -3.4, 1.6, -3.4, 1.6, 3.4, -1.6, 3.4]);
    part(ctx, b, '#5a4030', RC.band, { w: 0.8 });
    ctx.fillStyle = '#c9a36a'; ctx.fillRect(-0.4, -1.4, 0.8, 0.8);
    ctx.restore();
  }
  // mão
  if (!holdSword) {
    const fist = smoothPath([A.ex - 2.6, A.ey - 2, A.ex + 2.4, A.ey - 2.6, A.ex + 3.4, A.ey + 1.2, A.ex + 0.8, A.ey + 3.6, A.ex - 2.8, A.ey + 2.2]);
    part(ctx, fist, base, shade, { w: 1 });
    strokeLine(ctx, [A.ex + 0.5, A.ey - 1.8, A.ex + 0.8, A.ey + 2], 0.5, RC.skinLine);
  }
}

function rainHead(ctx, hx, hy, sway, mood) {
  ctx.save();
  ctx.translate(hx, hy + 8); ctx.scale(1.24, 1.24); ctx.translate(-hx, -hy - 8);
  rainHeadInner(ctx, hx, hy, sway, mood);
  ctx.restore();
}
function rainHeadInner(ctx, hx, hy, sway, mood) {
  // orelha + rosto
  const face = new Path2D();
  face.moveTo(hx + 7.4, hy - 8);
  face.bezierCurveTo(hx + 8.4, hy - 4, hx + 8.2, hy - 0.5, hx + 9.3, hy + 2.6);
  face.lineTo(hx + 8.3, hy + 4.0);
  face.bezierCurveTo(hx + 8.0, hy + 7.4, hx + 7.4, hy + 9.4, hx + 5.1, hy + 11.4);
  face.bezierCurveTo(hx + 2.4, hy + 11.8, hx - 1.6, hy + 9.6, hx - 4.6, hy + 6.4);
  face.bezierCurveTo(hx - 8.6, hy + 2, hx - 10.2, hy - 6, hx - 6, hy - 11);
  face.bezierCurveTo(hx - 2, hy - 15, hx + 5, hy - 13, hx + 7.4, hy - 8);
  face.closePath();
  outline(ctx, face, 2.2);
  cel(ctx, face, RC.skin, RC.skinS, 2.2, -0.6);
  // sombra do cabelo na testa
  ctx.save(); ctx.clip(face);
  ctx.fillStyle = 'rgba(190,120,105,0.55)';
  ctx.beginPath(); ctx.moveTo(hx - 10, hy - 4); ctx.lineTo(hx + 10, hy - 4.6); ctx.lineTo(hx + 10, hy - 1.8); ctx.lineTo(hx + 7, hy - 2.4); ctx.lineTo(hx + 4, hy - 0.8); ctx.lineTo(hx + 1, hy - 2.6); ctx.lineTo(hx - 10, hy - 1); ctx.fill();
  ctx.restore();
  // orelha
  const ear = smoothPath([hx - 5.4, hy - 1.4, hx - 2.6, hy - 0.2, hx - 2.8, hy + 3.8, hx - 5.0, hy + 4.2, hx - 6.6, hy + 1.6]);
  part(ctx, ear, RC.skin, RC.skinS, { w: 0.9 });
  curve(ctx, hx - 4.6, hy + 0.3, hx - 3.5, hy + 1.6, hx - 4.6, hy + 3, 0.5, RC.skinLine);
  // olho anime
  const ex = hx + 4.6, ey = hy + 0.6;
  ctx.save(); ctx.translate(ex, ey); ctx.scale(1.3, 1.3); ctx.translate(-ex, -ey);
  const sclera = smoothPath([ex - 3.4, ey - 1.8, ex + 0.2, ey - 2.8, ex + 3.0, ey - 2.0, ex + 3.0, ey + 1.8, ex - 0.4, ey + 2.6, ex - 3.0, ey + 1.0]);
  ctx.fillStyle = '#fbfbff'; ctx.fill(sclera);
  ctx.save(); ctx.clip(sclera);
  const ig = ctx.createLinearGradient(0, ey - 3, 0, ey + 3);
  ig.addColorStop(0, '#1f2a36'); ig.addColorStop(0.45, RC.iris); ig.addColorStop(1, RC.irisL);
  ctx.fillStyle = ig;
  const irx = mood === 'hurt' ? ex + 0.2 : ex + 0.9;
  ctx.beginPath(); ctx.ellipse(irx, ey + 0.1, 2.0, 2.8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#0d1219'; ctx.beginPath(); ctx.ellipse(irx + 0.1, ey + 0.2, 0.9, 1.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(30,30,60,0.35)'; ctx.fillRect(ex - 4, ey - 3, 8, 1.6);
  ctx.restore();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(irx - 0.6, ey - 0.9, 0.75, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(irx + 0.8, ey + 1.3, 0.35, 0, TAU); ctx.fill();
  // pálpebra superior grossa + cílio
  if (mood === 'hurt') {
    inkStroke(ctx, ex - 3.4, ey - 0.5, ex, ey + 1.2, ex + 3.4, ey - 0.8, 1.4, LINE);
  } else {
    inkStroke(ctx, ex - 3.8, ey - 1.2, ex - 0.4, ey - 3.6, ex + 3.6, ey - 2.2, 1.8, LINE);
    strokeLine(ctx, [ex + 3.2, ey - 2.2, ex + 4.6, ey - 3.0], 0.8, LINE);
    strokeLine(ctx, [ex + 1.2, ey + 3.3, ex + 3.0, ey + 2.4], 0.5, 'rgba(60,30,40,0.8)');
  }
  // sobrancelha determinada
  inkStroke(ctx, ex - 4.2, ey - 5.6, ex - 0.6, ey - 5.2, ex + 3.8, ey - 3.6, 1.7, '#3e3a4c');
  ctx.restore();
  // sombra do nariz
  ctx.fillStyle = 'rgba(190,120,100,0.6)';
  ctx.beginPath(); ctx.moveTo(hx + 8.6, hy + 1.4); ctx.lineTo(hx + 7.4, hy + 4.2); ctx.lineTo(hx + 8.4, hy + 4.0); ctx.fill();
  // nariz e boca
  strokeLine(ctx, [hx + 9.0, hy + 2.4, hx + 8.3, hy + 4.0], 0.6, RC.skinLine);
  if (mood === 'shout') {
    const m = smoothPath([hx + 5.4, hy + 6.4, hx + 7.6, hy + 6.2, hx + 7.2, hy + 8.4, hx + 5.6, hy + 8.2]);
    ctx.fillStyle = '#6a2328'; ctx.fill(m); outline(ctx, m, 0.6, RC.skinLine);
  } else {
    strokeLine(ctx, [hx + 5.2, hy + 7.0, hx + 7.6, hy + 6.6], 0.6, RC.skinLine);
  }
  // sombra do queixo no pescoço é feita pelo pescoço
  rainHair(ctx, hx, hy, sway);
}

function rainHair(ctx, hx, hy, sway) {
  const s = sway;
  const T = (x, y, k = 1) => [hx + x + s * k * (y < 0 ? 0.35 : 0.2) * (x < 0 ? 1.3 : 0.6), hy + y];
  // camada de trás
  const backPts = [
    T(-4, -10), T(-17, -19, 1.2), T(-10, -6), T(-23, -9, 1.4), T(-11, -1), T(-20, 5, 1.3), T(-8, 3), T(-13, 12, 1), T(-5, 6),
  ];
  const bp = spiky(backPts.flat(), hx, hy);
  part(ctx, bp, RC.hairBack, RC.hairD, { lx: 1.6, ly: -1.8, w: 1.15 });
  // camada principal
  const main = [
    T(8.6, -7.2), T(15.5, -14.5, 0.6), T(7.4, -12.6), T(10.5, -26.5, 0.8), T(2.8, -16.2), T(-1.2, -31.5, 1), T(-4.4, -17.2),
    T(-13.8, -27.5, 1.1), T(-9.6, -13.2), T(-22.5, -19.6, 1.3), T(-12.2, -7.0), T(-25.5, -7.6, 1.4), T(-11.8, -0.6),
    T(-19.2, 6.4, 1.2), T(-9.4, 2.6), T(-11.6, 10.6, 0.8), T(-6.0, 4.2), T(-6.2, -0.6),
    T(-2.4, -5.0), T(-0.6, 1.4, 0.3), T(2.0, -4.6), T(3.4, -0.6, 0.3), T(5.6, -5.0), T(9.6, -1.6, 0.3), T(9.4, -5.4),
  ];
  const mp = spiky(main.flat(), hx, hy);
  outline(ctx, mp, 2.4);
  cel(ctx, mp, RC.hair, RC.hairS, 1.7, -2.2);
  // faixa de brilho (anel de luz)
  ctx.save(); ctx.clip(mp);
  ctx.fillStyle = '#ffffff';
  for (const [x, y, w, a] of [[-6, -18.5, 7, -0.5], [1, -20.5, 5, -0.2], [-13, -14, 5, -0.8], [6, -12, 4, 0.1]]) {
    ctx.save(); ctx.translate(hx + x, hy + y); ctx.rotate(a);
    ctx.beginPath(); ctx.ellipse(0, 0, w / 2, 0.8, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  // sombra lavanda nas raízes
  ctx.fillStyle = 'rgba(150,145,185,0.5)';
  ctx.beginPath(); ctx.ellipse(hx - 6, hy - 6, 7, 4, 0.3, 0, TAU); ctx.fill();
  ctx.restore();
  rim(ctx, mp, 'rgba(150,220,255,0.75)', 0.9, 0.6);
  // linhas internas das mechas
  const lines = [[-2, -10, -6, -20, -10, -24], [3, -10, 4, -17, 6, -22], [-7, -7, -13, -11, -19, -15], [-6, -3, -12, -4, -20, -6], [2, -6, 3, -3, 3.2, -1]];
  for (const [x0, y0, cx, cy, x1, y1] of lines) inkStroke(ctx, hx + x0, hy + y0, hx + cx + s * 0.2, hy + cy, hx + x1 + s * 0.4, hy + y1, 0.9, 'rgba(110,104,140,0.9)');
}
function spiky(pts, cx, cy) {
  // pontos alternados ponta/vale, com laterais levemente côncavas
  const p = new Path2D();
  const n = pts.length / 2;
  p.moveTo(pts[0], pts[1]);
  for (let i = 1; i <= n; i++) {
    const j = i % n;
    const x0 = pts[(i - 1) * 2], y0 = pts[(i - 1) * 2 + 1], x1 = pts[j * 2], y1 = pts[j * 2 + 1];
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const qx = lerp(mx, cx, 0.12), qy = lerp(my, cy, 0.12);
    p.quadraticCurveTo(qx, qy, x1, y1);
  }
  p.closePath();
  return p;
}

// ---------- pose ----------
function rainPose(P) {
  const t = P.t || 0, k = P.crouchK || 0, st = P.state, ph = P.phase || 0;
  let lean = 0, bob = 0;
  if (st === 'idle') bob = Math.sin(t) * 0.9;
  if (st === 'walk') bob = -Math.abs(Math.sin(ph)) * 2.2;
  if (st === 'run') { bob = -Math.abs(Math.sin(ph)) * 3.4; lean = 8; }
  if (st === 'hurt') lean = -8;
  if (k > 0.1) lean += 5 * k;
  const atk = P.attack;
  if (atk && atk.s > 0.18 && atk.s < 0.55) lean += 4;
  const hipX = 0, hipY = -46 + k * 17 + bob * 0.4;
  const shX = lean, shY = -71 + k * 24 + bob;
  const hx = shX + 3 + lean * 0.15, hy = shY - 14;
  let fF, fB, fa = 0;
  const moving = st === 'walk' || st === 'run' || (k > 0.5 && P.crouchWalk);
  if (moving) {
    const stride = st === 'run' ? 21 : k > 0.5 ? 8 : 13;
    const lift = st === 'run' ? 14 : k > 0.5 ? 3 : 8;
    fF = [hipX + Math.sin(ph) * stride + (k > 0.5 ? 10 : 1.5), -Math.max(0, Math.cos(ph)) * lift];
    fB = [hipX + Math.sin(ph + Math.PI) * stride - (k > 0.5 ? 8 : 1.5), -Math.max(0, Math.cos(ph + Math.PI)) * lift];
  } else if (st === 'jump') { fF = [hipX + 11, hipY + 26]; fB = [hipX - 8, hipY + 31]; fa = 0.4; }
  else if (st === 'fall') { fF = [hipX + 8, hipY + 38]; fB = [hipX - 8, hipY + 35]; fa = 0.25; }
  else if (k > 0.1) { fF = [hipX + 7 + 6 * k, 0]; fB = [hipX - 6 - 5 * k, 0]; }
  else { fF = [hipX + 7, 0]; fB = [hipX - 6.5, 0]; }

  let hB, hF, swordA;
  if (st === 'walk') { hB = [shX - 6 + Math.sin(ph) * 9, shY + 30]; hF = [14 + Math.sin(ph + Math.PI) * 5, -46 + bob]; swordA = 0.8; }
  else if (st === 'run') { hB = [shX - 3 + Math.sin(ph) * 14, shY + 24 - Math.max(0, Math.sin(ph)) * 6]; hF = [shX + 12 + Math.sin(ph + Math.PI) * 9, shY + 24]; swordA = 0.45; }
  else if (st === 'jump') { hB = [shX - 14, shY + 11]; hF = [shX + 17, shY + 16]; swordA = -0.25; }
  else if (st === 'fall') { hB = [shX - 17, shY + 6]; hF = [shX + 19, shY + 13]; swordA = 0.25; }
  else if (st === 'hurt') { hB = [shX - 17, shY + 5]; hF = [shX + 16, shY + 2]; swordA = -0.9; }
  else if (k > 0.1) { hB = [shX + 3, shY + 21]; hF = [shX + 18, shY + 19]; swordA = 0.12; }
  else { hB = [shX - 9, shY + 30 + Math.sin(t) * 0.6]; hF = [14, -47 + bob]; swordA = 0.78; }

  const fsx = shX + 7, fsy = shY + 3.5;
  let trail = null, mood = st === 'hurt' ? 'hurt' : null;
  if (atk) {
    let a0, a1, R = 23;
    if (atk.kind === 2) { a0 = -1.1; a1 = 0.45; R = 22; }
    else if (atk.kind === 1) { a0 = 1.3; a1 = -1.55; }
    else { a0 = -2.45; a1 = 0.95; }
    const s = atk.s;
    let a;
    if (s < 0.18) a = lerp(swordA, a0, s / 0.18);
    else if (s < 0.5) a = lerp(a0, a1, easeOut((s - 0.18) / 0.32));
    else a = a1;
    swordA = a;
    const ha = atk.kind === 2 ? a * 0.6 : a * 0.85;
    hF = [fsx + Math.cos(ha) * R, fsy + Math.sin(ha) * R];
    hB = [shX - 12, shY + 19];
    if (s > 0.16 && s < 0.66) trail = { a0, a, R, fade: s < 0.5 ? 1 : 1 - (s - 0.5) / 0.16 };
    if (s > 0.15 && s < 0.6) mood = 'shout';
  }
  return { hipX, hipY, shX, shY, hx, hy, fF, fB, fa, hB, hF, swordA, fsx, fsy, trail, mood, lean };
}

function drawRain(ctx, P) {
  const Q = rainPose(P);
  const { hipX, hipY, shX, shY, hx, hy, fF, fB, hB, hF, swordA, fsx, fsy, trail } = Q;
  const bsx = shX - 6, bsy = shY + 3.5;
  const legB = ik(hipX - 3.5, hipY, fB[0], fB[1] - 4, 21, 21, -1);
  const legF = ik(hipX + 3.5, hipY, fF[0], fF[1] - 4, 21, 21, -1);
  const armB = ik(bsx, bsy, hB[0], hB[1], 16, 15, 1);
  const armF = ik(fsx, fsy, hF[0], hF[1], 16, 15, 1);
  const sway = clamp(-(P.vx || 0) * 0.02, -5, 5) + Math.sin((P.t || 0) * 1.3) * 0.5;

  rainArm(ctx, bsx, bsy, armB, true, false);
  rainLeg(ctx, hipX - 3.5, hipY, legB, true, Q.fa * 0.6);
  // quadril (jeans)
  const hips = smoothPath([hipX - 9, hipY - 6, hipX + 9.5, hipY - 6.5, hipX + 10, hipY + 3, hipX + 2, hipY + 6, hipX - 9.5, hipY + 3]);
  part(ctx, hips, RC.jeans, RC.jeansS, { w: 1.1 });
  strokeLine(ctx, [hipX - 8.6, hipY - 4.2, hipX + 9.4, hipY - 4.6], 0.6, RC.jeansD);
  // pescoço
  const neck = capsule(shX + 0.5, shY + 1, 3.6, hx + 0.2, hy + 7, 3.4);
  part(ctx, neck, RC.skinS, RC.skinD, { w: 1 });
  // tronco: regata preta rasgada
  const torsoPts = [
    shX - 10.5, shY + 1, shX - 4, shY - 0.5, shX + 0.5, shY + 6.5, shX + 6, shY - 0.5, shX + 12, shY + 1.5,
    shX + 13, shY + 9, shX + 11, shY + 17, hipX + 10, hipY - 4,
    hipX + 8, hipY - 1, hipX + 6, hipY - 4.5, hipX + 3, hipY - 0.5, hipX, hipY - 4, hipX - 3, hipY - 1, hipX - 6.5, hipY - 4.5, hipX - 9.5, hipY - 1.5,
    hipX - 10.5, hipY - 8, shX - 12, shY + 12,
  ];
  const torso = polyPath(torsoPts);
  // peito de pele no decote
  const chest = smoothPath([shX - 4, shY - 0.6, shX + 6, shY - 0.6, shX + 0.8, shY + 7.5]);
  ctx.fillStyle = RC.skin; ctx.fill(chest);
  outline(ctx, torso, 2.3);
  ctx.fillStyle = RC.skin; ctx.fill(chest);
  cel(ctx, torso, RC.top, RC.topS, 2.4, -1.4);
  ctx.save(); ctx.clip(torso);
  // rasgos/furos com pele
  ctx.fillStyle = RC.skinS;
  ctx.beginPath(); ctx.ellipse(shX + 6, shY + 16, 1.6, 1.0, 0.3, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hipX + 2, hipY - 8, 1.2, 0.8, 0, 0, TAU); ctx.fill();
  // dobras do tecido
  for (const [x0, y0, cx, cy, x1, y1] of [[4, 8, 6, 14, 3, 21], [-2, 10, -4, 16, -3, 22], [8, 18, 6, 21, 4, 24]])
    inkStroke(ctx, shX + x0, shY + y0, shX + cx, shY + cy, shX + x1, shY + y1, 1, 'rgba(0,0,0,0.6)');
  ctx.restore();
  rim(ctx, torso, RC.topHi, -1.0, 0.4);
  rim(ctx, torso, 'rgba(120,200,255,0.55)', 0.9, 0);
  // alça
  strokeLine(ctx, [shX + 3, shY - 0.4, shX + 7, shY + 1], 2, RC.topS);
  rainLeg(ctx, hipX + 3.5, hipY, legF, false, Q.fa);
  rainHead(ctx, hx, hy, sway, Q.mood);
  // braço da frente com espada
  rainArm(ctx, fsx, fsy, armF, false, true);
  drawRainSword(ctx, armF.ex, armF.ey, swordA);
  const hand = smoothPath([armF.ex - 3, armF.ey - 2.6, armF.ex + 2.6, armF.ey - 3, armF.ex + 3.6, armF.ey + 1.2, armF.ex + 0.4, armF.ey + 3.8, armF.ex - 3.2, armF.ey + 1.8]);
  part(ctx, hand, RC.skin, RC.skinS, { w: 1 });
  strokeLine(ctx, [armF.ex - 0.6, armF.ey - 2.4, armF.ex - 0.2, armF.ey + 2.4], 0.5, RC.skinLine);

  if (trail && trail.fade > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const ccw = trail.a < trail.a0;
    const r0 = trail.R + 14, r1 = trail.R + 54;
    const g = ctx.createRadialGradient(fsx, fsy, r0, fsx, fsy, r1);
    g.addColorStop(0, 'rgba(90,150,255,0)');
    g.addColorStop(0.7, `rgba(140,200,255,${0.4 * trail.fade})`);
    g.addColorStop(0.93, `rgba(230,245,255,${0.95 * trail.fade})`);
    g.addColorStop(1, `rgba(255,255,255,0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(fsx, fsy, r1, trail.a0, trail.a, ccw);
    ctx.arc(fsx, fsy, r0, trail.a, trail.a0, !ccw);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

// Retrato (busto) para o HUD e tela de título
function drawRainBust(ctx) {
  const P = { state: 'idle', t: 0, crouchK: 0, vx: 0 };
  const Q = rainPose(P);
  const neck = capsule(Q.shX + 0.5, Q.shY + 1, 3.6, Q.hx + 0.2, Q.hy + 7, 3.4);
  const torso = polyPath([Q.shX - 14, Q.shY + 2, Q.shX - 4, Q.shY - 0.5, Q.shX + 0.5, Q.shY + 6.5, Q.shX + 6, Q.shY - 0.5, Q.shX + 15, Q.shY + 2, Q.shX + 16, Q.shY + 20, Q.shX - 15, Q.shY + 20]);
  const shoulderF = capsule(Q.shX + 11, Q.shY + 3, 5, Q.shX + 14, Q.shY + 18, 4.4);
  part(ctx, neck, RC.skinS, RC.skinD);
  part(ctx, torso, RC.top, RC.topS, { lx: 2.4, ly: -1.4 });
  part(ctx, shoulderF, RC.skin, RC.skinS);
  ctx.save(); ctx.clip(shoulderF);
  inkStroke(ctx, Q.shX + 8, Q.shY + 6, Q.shX + 13, Q.shY + 9, Q.shX + 17, Q.shY + 4, 1.6, RC.tattoo);
  ctx.restore();
  rainHead(ctx, Q.hx, Q.hy, 0, null);
  return Q;
}
