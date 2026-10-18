// Arte vetorial procedural: Rain, Surubim Guerreiro, inimigos e objetos
const OUT = '#0a0a10';

function limb(ctx, pts, w, col, outline = OUT, ow = 2.4) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.strokeStyle = outline; ctx.lineWidth = w + ow; ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
}
function poly(ctx, pts, fill, outline = OUT, ow = 1.8) {
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (outline) { ctx.lineJoin = 'round'; ctx.strokeStyle = outline; ctx.lineWidth = ow; ctx.stroke(); }
}
function circle(ctx, x, y, r, fill, outline = OUT, ow = 1.6) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (outline) { ctx.strokeStyle = outline; ctx.lineWidth = ow; ctx.stroke(); }
}
function glow(ctx, x, y, r, color, alpha = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

// ================== RAIN ==================
const RC = {
  skin: '#dca07a', skinShade: '#a8694a', hair: '#f1f3f8', hairShade: '#a7afc2',
  top: '#26272e', topShade: '#151519', jeans: '#41639a', jeansDark: '#2a4270', jeansLight: '#7d9cc9',
  tattoo: '#7a1c22', sandal: '#4d3222', strap: '#2a1a10', bracelet: '#3a2a20',
};

function drawBrokenSword(ctx, hx, hy, a, scale = 1) {
  ctx.save();
  ctx.translate(hx, hy); ctx.rotate(a); ctx.scale(scale, scale);
  // lâmina partida e serrilhada
  const blade = [2, -2.6, 13, -3, 15.5, -1.4, 18, -3.2, 26, -2.4, 31.5, 0.6, 26.5, 1.6, 22, 2.8, 18, 1.4, 14.5, 2.9, 2, 2.6];
  const g = ctx.createLinearGradient(0, -3, 0, 3);
  g.addColorStop(0, '#f4f7fb'); g.addColorStop(0.45, '#c9cfd9'); g.addColorStop(1, '#7c8494');
  poly(ctx, blade, g, OUT, 1.6);
  ctx.strokeStyle = 'rgba(90,98,112,0.9)'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(3, 0); ctx.lineTo(16, 0.2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(4, -2); ctx.lineTo(12.5, -2.4); ctx.stroke();
  // guarda
  poly(ctx, [-0.5, -5.2, 2.2, -5.2, 2.2, 5.2, -0.5, 5.2], '#5b4a3a', OUT, 1.4);
  ctx.fillStyle = '#8d7a5e'; ctx.fillRect(-0.2, -4.8, 1, 9.4);
  // empunhadura
  limb(ctx, [-0.5, 0, -6.5, 0], 3, '#4a3426', OUT, 2);
  ctx.strokeStyle = '#2a1c14'; ctx.lineWidth = 0.8;
  for (let i = -5.5; i < 0; i += 1.6) { ctx.beginPath(); ctx.moveTo(i, -1.5); ctx.lineTo(i + 0.8, 1.5); ctx.stroke(); }
  circle(ctx, -7.6, 0, 1.8, '#7d6a50', OUT, 1.2);
  ctx.restore();
}

function rainHair(ctx, hx, hy, sway) {
  const s = sway;
  const pts = [
    hx + 7.5, hy - 2.5,
    hx + 11 + s * 0.2, hy - 8.5,
    hx + 5.5, hy - 8,
    hx + 6 + s * 0.4, hy - 16.5,
    hx + 1.2, hy - 11,
    hx - 2 + s * 0.6, hy - 19.5,
    hx - 4, hy - 11.5,
    hx - 12 + s, hy - 16.5,
    hx - 8, hy - 8.5,
    hx - 16 + s * 1.2, hy - 8,
    hx - 9.5, hy - 3.5,
    hx - 15 + s * 1.1, hy + 2,
    hx - 8.5, hy + 1.5,
    hx - 10 + s * 0.6, hy + 7.5,
    hx - 4.5, hy + 3.5,
    hx - 3, hy - 1.5,
    hx + 0, hy - 4,
    hx + 2.5, hy + 0.5,
    hx + 4.5, hy - 3.5,
    hx + 8, hy + 1,
  ];
  const g = ctx.createLinearGradient(hx, hy - 18, hx - 6, hy + 6);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, RC.hair); g.addColorStop(1, RC.hairShade);
  poly(ctx, pts, g, OUT, 1.8);
  // mechas internas
  ctx.strokeStyle = 'rgba(120,130,150,0.8)'; ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(hx - 1, hy - 6); ctx.lineTo(hx - 8 + s * 0.5, hy - 12);
  ctx.moveTo(hx + 2, hy - 7); ctx.lineTo(hx + 3, hy - 13);
  ctx.moveTo(hx - 5, hy - 3); ctx.lineTo(hx - 12 + s, hy - 5);
  ctx.stroke();
}

// P: { state, t, phase, crouchK, attack:{s,kind}|null, hurt, deadT, vx }
function drawRain(ctx, x, y, facing, P) {
  ctx.save();
  ctx.translate(x, y);
  if (P.deadT > 0) {
    const r = Math.min(1, P.deadT / 0.6);
    ctx.translate(-facing * r * 20, 0);
    ctx.rotate(-facing * r * Math.PI / 2 * 0.98);
  }
  ctx.scale(facing * 1.18, 1.18);

  const t = P.t, k = P.crouchK, st = P.state, ph = P.phase;
  let lean = 0, bob = 0;
  if (st === 'idle') bob = Math.sin(t * 2.4) * 0.7;
  if (st === 'walk') bob = -Math.abs(Math.sin(ph)) * 1.4;
  if (st === 'run') { bob = -Math.abs(Math.sin(ph)) * 2.2; lean = 5; }
  if (st === 'hurt') lean = -5;
  if (k > 0.1) lean += 3 * k;
  const atk = P.attack;
  let swing = 0;
  if (atk) {
    swing = atk.s > 0.18 && atk.s < 0.55 ? 1 : 0;
    lean += swing * 2.5;
  }

  const hipX = 0, hipY = -27 + k * 11 + bob * 0.4;
  const shX = lean, shY = -45 + k * 18 + bob;
  const hx = 2 + lean * 1.15, hy = shY - 9.5;

  // ---- pés
  let fF, fB;
  if (st === 'walk' || st === 'run' || (k > 0.5 && Math.abs(P.vx) > 10)) {
    const stride = st === 'run' ? 13 : k > 0.5 ? 5 : 8;
    const lift = st === 'run' ? 9 : k > 0.5 ? 2 : 5;
    fF = [hipX + Math.sin(ph) * stride + (k > 0.5 ? 6 : 1), -1 - Math.max(0, Math.cos(ph)) * lift];
    fB = [hipX + Math.sin(ph + Math.PI) * stride - (k > 0.5 ? 5 : 1), -1 - Math.max(0, Math.cos(ph + Math.PI)) * lift];
  } else if (st === 'jump') {
    fF = [hipX + 7, hipY + 15]; fB = [hipX - 5, hipY + 19];
  } else if (st === 'fall') {
    fF = [hipX + 5, hipY + 23]; fB = [hipX - 5, hipY + 21];
  } else if (k > 0.1) {
    fF = [hipX + 4 + 4 * k, -1]; fB = [hipX - 4 - 3 * k, -1];
  } else {
    fF = [hipX + 4.5, -1]; fB = [hipX - 4, -1];
  }

  // ---- mãos
  let hB, hF, swordA;
  if (st === 'walk') {
    hB = [shX - 4 + Math.sin(ph) * 6, shY + 19]; hF = [9 + Math.sin(ph + Math.PI) * 3, -31 + bob]; swordA = 0.8;
  } else if (st === 'run') {
    hB = [shX - 2 + Math.sin(ph) * 9, shY + 15 - Math.max(0, Math.sin(ph)) * 4];
    hF = [shX + 7 + Math.sin(ph + Math.PI) * 6, shY + 15]; swordA = 0.45;
  } else if (st === 'jump') {
    hB = [shX - 9, shY + 7]; hF = [shX + 11, shY + 10]; swordA = -0.25;
  } else if (st === 'fall') {
    hB = [shX - 11, shY + 4]; hF = [shX + 12, shY + 8]; swordA = 0.25;
  } else if (st === 'hurt') {
    hB = [shX - 11, shY + 3]; hF = [shX + 10, shY + 1]; swordA = -0.9;
  } else if (k > 0.1) {
    hB = [shX + 2, shY + 13]; hF = [shX + 11, shY + 12]; swordA = 0.15;
  } else {
    hB = [shX - 6, shY + 19 + Math.sin(t * 2.4) * 0.4]; hF = [9, -31 + bob]; swordA = 0.78;
  }

  // ---- ataque sobrescreve braço da espada
  const fsx = shX + 7, fsy = shY + 2.5; // ombro da frente
  let trail = null;
  if (atk) {
    let a0, a1, R = 15;
    if (atk.kind === 2) { a0 = -1.1; a1 = 0.45; R = 14; }
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
    hB = [shX - 8, shY + 12];
    if (s > 0.16 && s < 0.62) trail = { a0, a: a, R, fade: s < 0.5 ? 1 : 1 - (s - 0.5) / 0.12 };
  }

  const bsx = shX - 6.5, bsy = shY + 2.5;
  const legB = ik(hipX - 2.5, hipY, fB[0], fB[1] - 3, 12.5, 12.5, -1);
  const legF = ik(hipX + 2.5, hipY, fF[0], fF[1] - 3, 12.5, 12.5, -1);
  const armB = ik(bsx, bsy, hB[0], hB[1], 10.5, 10, 1);
  const armF = ik(fsx, fsy, hF[0], hF[1], 10.5, 10, 1);

  // braço de trás
  limb(ctx, [bsx, bsy, armB.jx, armB.jy, armB.ex, armB.ey], 5, RC.skinShade);
  ctx.strokeStyle = RC.bracelet; ctx.lineWidth = 2.2;
  const bwx = lerp(armB.jx, armB.ex, 0.78), bwy = lerp(armB.jy, armB.ey, 0.78);
  ctx.beginPath(); ctx.arc(bwx, bwy, 2.6, 0, TAU); ctx.stroke();
  circle(ctx, armB.ex, armB.ey, 3.4, RC.skinShade);

  // perna de trás
  drawRainLeg(ctx, hipX - 2.5, hipY, legB, true);

  // cabelo de trás (sombra)
  const sway = clamp(-P.vx * 0.012, -3, 3) + Math.sin(t * 3) * 0.4;

  // quadril / jeans
  poly(ctx, [hipX - 8.5, hipY - 5, hipX + 8.5, hipY - 5, hipX + 8.5, hipY + 3, hipX - 8.5, hipY + 3], RC.jeans, OUT, 1.8);
  ctx.fillStyle = RC.jeansDark; ctx.fillRect(hipX - 8.5, hipY - 5, 17, 2);

  // pescoço + tronco (regata)
  poly(ctx, [hx - 2, hy + 5, hx + 3, hy + 5, shX + 3, shY + 2, shX - 3, shY + 2], RC.skinShade, OUT, 1.4);
  const torso = [
    shX - 9, shY + 0.5,
    shX - 3, shY - 0.5,
    shX + 1, shY + 4.5,
    shX + 5, shY - 0.5,
    shX + 9.5, shY + 0.5,
    shX + 10, shY + 6,
    hipX + 8.5, hipY - 2,
    hipX + 6.5, hipY - 5,
    hipX + 3.5, hipY - 2.5,
    hipX + 1, hipY - 5.5,
    hipX - 2, hipY - 3,
    hipX - 5.5, hipY - 5,
    hipX - 8.5, hipY - 2.5,
    shX - 9.5, shY + 6,
  ];
  const tg = ctx.createLinearGradient(shX - 9, 0, shX + 10, 0);
  tg.addColorStop(0, RC.topShade); tg.addColorStop(0.6, RC.top); tg.addColorStop(1, '#34353e');
  poly(ctx, torso, tg, OUT, 1.8);
  // dobras e rasgos da regata
  ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(shX + 3, shY + 8); ctx.lineTo(hipX + 4, hipY - 9);
  ctx.moveTo(shX - 3, shY + 10); ctx.lineTo(hipX - 4, hipY - 8);
  ctx.stroke();
  ctx.fillStyle = RC.skinShade;
  ctx.beginPath(); ctx.ellipse(shX + 2, (shY + hipY) / 2 + 2, 1.2, 0.8, 0, 0, TAU); ctx.fill();

  // perna da frente
  drawRainLeg(ctx, hipX + 2.5, hipY, legF, false);

  // cabeça
  ctx.save();
  // orelha + rosto
  const jaw = [hx - 5, hy - 3, hx + 6.5, hy - 4, hx + 7.5, hy + 1, hx + 6.8, hy + 4.5, hx + 3.5, hy + 7.2, hx - 1, hy + 7, hx - 5.5, hy + 3];
  const fg = ctx.createLinearGradient(hx - 5, 0, hx + 8, 0);
  fg.addColorStop(0, RC.skinShade); fg.addColorStop(0.5, RC.skin); fg.addColorStop(1, RC.skin);
  poly(ctx, jaw, fg, OUT, 1.6);
  circle(ctx, hx - 3, hy + 1.5, 1.9, RC.skinShade, OUT, 1.1);
  // olho e sobrancelha zangada
  ctx.fillStyle = '#ffffff'; ctx.fillRect(hx + 3.2, hy - 0.4, 2.8, 1.6);
  ctx.fillStyle = '#1a2230'; ctx.fillRect(hx + 4.3, hy - 0.4, 1.5, 1.6);
  ctx.strokeStyle = '#2a2a33'; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(hx + 2.3, hy - 2.6); ctx.lineTo(hx + 6.8, hy - 1.2); ctx.stroke();
  // boca
  ctx.strokeStyle = '#5a2e22'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(hx + 4.2, hy + 4.4); ctx.lineTo(hx + 6.2, hy + 4.1); ctx.stroke();
  ctx.restore();
  rainHair(ctx, hx, hy, sway);

  // braço da frente + espada
  limb(ctx, [fsx, fsy, armF.jx, armF.jy], 5.4, RC.skin);
  // tatuagem tribal
  ctx.save();
  ctx.strokeStyle = RC.tattoo; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
  const tx = lerp(fsx, armF.jx, 0.45), ty = lerp(fsy, armF.jy, 0.45);
  const ang = Math.atan2(armF.jy - fsy, armF.jx - fsx);
  ctx.translate(tx, ty); ctx.rotate(ang);
  ctx.beginPath(); ctx.moveTo(-4, -1.8); ctx.quadraticCurveTo(0, 2.2, 4, -1.5);
  ctx.moveTo(-2, 1.9); ctx.quadraticCurveTo(1, -0.5, 3.5, 2); ctx.stroke();
  ctx.restore();
  limb(ctx, [armF.jx, armF.jy, armF.ex, armF.ey], 4.8, RC.skin);
  drawBrokenSword(ctx, armF.ex, armF.ey, swordA);
  circle(ctx, armF.ex, armF.ey, 3.3, RC.skin, OUT, 1.4);

  if (trail && trail.fade > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const ccw = trail.a < trail.a0;
    const r0 = trail.R + 8, r1 = trail.R + 34;
    const g = ctx.createRadialGradient(fsx, fsy, r0, fsx, fsy, r1);
    g.addColorStop(0, 'rgba(120,170,255,0)'); g.addColorStop(0.75, `rgba(170,210,255,${0.45 * trail.fade})`); g.addColorStop(1, `rgba(255,255,255,${0.85 * trail.fade})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(fsx, fsy, r1, trail.a0, trail.a, ccw);
    ctx.arc(fsx, fsy, r0, trail.a, trail.a0, !ccw);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawRainLeg(ctx, hx, hy, L, back) {
  const col = back ? RC.jeansDark : RC.jeans;
  limb(ctx, [hx, hy, L.jx, L.jy], 7.6, col);
  limb(ctx, [L.jx, L.jy, L.ex, L.ey], 6.8, col);
  // rasgos (pele aparecendo)
  ctx.fillStyle = back ? RC.skinShade : RC.skin;
  const kx = lerp(hx, L.jx, 0.85), ky = lerp(hy, L.jy, 0.85);
  ctx.beginPath(); ctx.ellipse(kx, ky, 2.2, 1.4, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = RC.jeansLight; ctx.lineWidth = 0.8; ctx.stroke();
  const sx = lerp(L.jx, L.ex, 0.45), sy = lerp(L.jy, L.ey, 0.45);
  ctx.beginPath(); ctx.ellipse(sx + 0.6, sy, 1.4, 1.1, 0, 0, TAU); ctx.fillStyle = back ? RC.skinShade : RC.skin; ctx.fill();
  // barra esfarrapada
  const ax = L.ex, ay = L.ey;
  poly(ctx, [ax - 4.5, ay - 2, ax + 4.5, ay - 2, ax + 4, ay + 1.5, ax + 2, ay + 0.5, ax + 0.5, ay + 2, ax - 1.5, ay + 0.6, ax - 4, ay + 1.8], back ? RC.jeansDark : RC.jeansLight, OUT, 1.2);
  // tornozelo + pé de chinelo
  limb(ctx, [ax, ay + 1, ax + 0.5, ay + 3], 3, back ? RC.skinShade : RC.skin, OUT, 1.6);
  poly(ctx, [ax - 3, ay + 2, ax + 7, ay + 2.5, ax + 7.5, ay + 4.2, ax - 3.2, ay + 4.2], back ? RC.skinShade : RC.skin, OUT, 1.2);
  ctx.fillStyle = RC.sandal; ctx.fillRect(ax - 4, ay + 4, 12, 1.8);
  ctx.strokeStyle = RC.strap; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(ax + 3.5, ay + 2.4); ctx.lineTo(ax + 1, ay + 4.2); ctx.stroke();
}

// ================== SURUBIM GUERREIRO ==================
const SC = {
  skin: '#76703c', skinDark: '#4d4a26', belly: '#b3a46b', spot: 'rgba(30,28,12,0.45)',
  rust: '#8a5636', rustDark: '#4a2c1b', metal: '#7d7a70', leather: '#5a3a24', moss: '#3d5a2c', mossDark: '#253a1a',
  eye: '#ff3a2c',
};

function drawSerratedSword(ctx, hx, hy, a, t) {
  ctx.save();
  ctx.translate(hx, hy); ctx.rotate(a);
  const L = 128;
  // lâmina
  const pts = [14, -9];
  for (let u = 20; u < L - 10; u += 9) pts.push(u, -10, u + 4.5, -17);
  pts.push(L - 8, -11, L + 6, -4, L, 9, 14, 9);
  const g = ctx.createLinearGradient(0, -16, 0, 10);
  g.addColorStop(0, '#d2d4cc'); g.addColorStop(0.45, '#9c9b90'); g.addColorStop(1, '#5c5a50');
  poly(ctx, pts, g, OUT, 2.4);
  // ferrugem
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(130,70,30,0.55)';
  for (const [u, v, r] of [[30, 2, 6], [60, -4, 8], [92, 4, 7], [110, -6, 5], [45, 6, 4]]) { ctx.beginPath(); ctx.ellipse(u, v, r * 1.6, r, 0.3, 0, TAU); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(18, 6); ctx.lineTo(L - 4, 6); ctx.stroke();
  // lodo escorrendo
  ctx.fillStyle = 'rgba(90,140,70,0.85)';
  for (const u of [34, 58, 79, 101]) {
    const dl = 6 + Math.sin(t * 2 + u) * 3 + (u % 7);
    ctx.beginPath(); ctx.moveTo(u - 3, 8); ctx.lineTo(u + 3, 8); ctx.lineTo(u + 1, 8 + dl); ctx.arc(u, 8 + dl, 1.5, 0, Math.PI); ctx.fill();
  }
  // guarda com pontas
  poly(ctx, [8, -16, 15, -14, 15, 14, 8, 16, 10, 0], '#5a4632', OUT, 2);
  poly(ctx, [10, -16, 12, -26, 15, -15], '#6a5a46', OUT, 1.5);
  poly(ctx, [10, 16, 12, 26, 15, 15], '#6a5a46', OUT, 1.5);
  // cabo
  limb(ctx, [8, 0, -14, 0], 6, SC.leather, OUT, 2.4);
  ctx.strokeStyle = '#2c1a10'; ctx.lineWidth = 1.2;
  for (let u = -12; u < 7; u += 3.5) { ctx.beginPath(); ctx.moveTo(u, -3); ctx.lineTo(u + 2, 3); ctx.stroke(); }
  // argola do pomo
  ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-18, 0, 4.5, 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#8a8478'; ctx.lineWidth = 2.6; ctx.stroke();
  ctx.restore();
  // ponto do pomo no mundo
  return [hx + Math.cos(a) * -18, hy + Math.sin(a) * -18];
}

function drawChain(ctx, x0, y0, x1, y1, sag, t) {
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const x = lerp(x0, x1, s) + Math.sin(t * 2 + s * 3) * 2;
    const y = lerp(y0, y1, s) + Math.sin(s * Math.PI) * sag;
    ctx.save(); ctx.translate(x, y); ctx.rotate(i % 2 ? 0.9 : -0.6);
    ctx.beginPath(); ctx.ellipse(0, 0, 4, 2.4, 0, 0, TAU);
    ctx.strokeStyle = OUT; ctx.lineWidth = 3.2; ctx.stroke();
    ctx.strokeStyle = '#9a958a'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.restore();
  }
}

function drawShield(ctx, x, y, rot, scale = 1) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale);
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(-28, -38); ctx.lineTo(28, -38);
    ctx.lineTo(28, 4); ctx.quadraticCurveTo(26, 28, 0, 44);
    ctx.quadraticCurveTo(-26, 28, -28, 4); ctx.closePath();
  };
  shape();
  const g = ctx.createLinearGradient(-28, -38, 28, 40);
  g.addColorStop(0, '#a87650'); g.addColorStop(0.5, SC.rust); g.addColorStop(1, SC.rustDark);
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 7; ctx.strokeStyle = OUT; ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = '#5a5246'; ctx.stroke();
  ctx.save(); shape(); ctx.clip();
  // manchas
  ctx.fillStyle = 'rgba(60,30,15,0.4)';
  ctx.beginPath(); ctx.ellipse(14, 18, 14, 9, 0.5, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-16, -24, 10, 6, -0.3, 0, TAU); ctx.fill();
  // emblema: esqueleto de peixe
  ctx.strokeStyle = '#e4dcc4'; ctx.fillStyle = '#e4dcc4'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(-14, -8, 8, 7, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(-16, -10, 2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(16, -8); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const bx = -2 + i * 4;
    const h = 9 - i * 1.2;
    ctx.beginPath(); ctx.moveTo(bx, -8 - h); ctx.quadraticCurveTo(bx + 2, -8, bx, -8 + h); ctx.stroke();
  }
  ctx.fillStyle = '#e4dcc4';
  ctx.beginPath(); ctx.moveTo(15, -8); ctx.lineTo(24, -15); ctx.lineTo(22, -8); ctx.lineTo(24, -1); ctx.closePath(); ctx.fill();
  // peixinho verde
  ctx.fillStyle = '#5d7a4a';
  ctx.beginPath(); ctx.ellipse(0, 20, 9, 5, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-8, 20); ctx.lineTo(-14, 15); ctx.lineTo(-14, 25); ctx.fill();
  ctx.restore();
  // rebites
  ctx.fillStyle = '#c8bfae';
  for (const [rx, ry] of [[-22, -32], [22, -32], [-24, 2], [24, 2], [0, 37], [-14, 26], [14, 26]]) {
    ctx.beginPath(); ctx.arc(rx, ry, 1.8, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// P: { t, phase, walking, swordA, swordFront, hand (sword hand pos), shield:{x,y,r}, crouch, mouth, lean, eyeGlow, dizzy }
function drawSurubim(ctx, x, y, facing, P) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * BOSS_SCALE, BOSS_SCALE);
  const t = P.t, cr = P.crouch || 0;
  const breathe = Math.sin(t * 2) * 1.5;
  const lean = P.lean || 0;
  const by = cr * 14 + breathe * 0.4; // corpo abaixa
  const hipY = -62 + by;
  const shY = -108 + by + breathe;
  const shX = 2 + lean;

  // pés
  let fB = [-14, 0], fF = [14, 0];
  if (P.walking) {
    const ph = P.phase;
    fF = [10 + Math.sin(ph) * 18, -Math.max(0, Math.cos(ph)) * 10];
    fB = [-10 + Math.sin(ph + Math.PI) * 18, -Math.max(0, Math.cos(ph + Math.PI)) * 10];
  }
  if (P.air) { fF = [16, -20]; fB = [-12, -14]; }
  if (cr > 0.3) { fF = [20, 0]; fB = [-20, 0]; }

  // --- capa (atrás)
  const sw = Math.sin(t * 1.6) * 5 - lean * 0.6;
  const cape = [
    shX - 14, shY - 8,
    shX - 34 + sw * 0.3, shY + 2,
    shX - 52 + sw, shY + 40,
    -56 + sw, hipY + 30,
    -50 + sw, -14 + by * 0.3,
    -44 + sw, -22,
    -38 + sw, -8,
    -30 + sw * 0.6, -24,
    -24 + sw * 0.5, -12,
    -18, hipY + 8,
  ];
  const cg = ctx.createLinearGradient(-50, shY, -20, 0);
  cg.addColorStop(0, SC.moss); cg.addColorStop(1, SC.mossDark);
  poly(ctx, cape, cg, OUT, 2.4);
  ctx.strokeStyle = 'rgba(15,25,10,0.6)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(shX - 30, shY + 10); ctx.lineTo(-44 + sw, -26); ctx.moveTo(shX - 22, shY + 14); ctx.lineTo(-30 + sw * 0.6, -28); ctx.stroke();

  // --- braço de trás + espada
  const bS = [shX - 10, shY + 4];
  const hand = P.hand || [-26, -70 + by];
  const armB = ik(bS[0], bS[1], hand[0], hand[1], 30, 30, 1);
  const drawSwordArm = () => {
    limb(ctx, [bS[0], bS[1], armB.jx, armB.jy, armB.ex, armB.ey], 15, SC.skinDark, OUT, 3);
    // bracelete
    const bx = lerp(armB.jx, armB.ex, 0.5), byy = lerp(armB.jy, armB.ey, 0.5);
    ctx.save(); ctx.translate(bx, byy); ctx.rotate(Math.atan2(armB.ey - armB.jy, armB.ex - armB.jx));
    poly(ctx, [-9, -9, 9, -9, 9, 9, -9, 9], SC.rustDark, OUT, 2); ctx.restore();
    const pom = drawSerratedSword(ctx, armB.ex, armB.ey, P.swordA, t);
    drawChain(ctx, pom[0], pom[1], armB.ex - 6, armB.ey + 18, 18, t);
    circle(ctx, armB.ex, armB.ey, 8, SC.skinDark, OUT, 2.4);
  };
  if (!P.swordFront) drawSwordArm();

  // --- perna de trás
  drawSurubimLeg(ctx, -10, hipY, fB, true, cr);

  // --- torso
  const torso = [
    shX - 16, shY - 6,
    shX - 4, shY - 16,
    shX + 16, shY - 10,
    shX + 26, shY + 10,
    30, hipY - 14,
    20, hipY + 4,
    -16, hipY + 4,
    -24, hipY - 18,
    shX - 24, shY + 14,
  ];
  const tg = ctx.createLinearGradient(-24, 0, 30, 0);
  tg.addColorStop(0, SC.skinDark); tg.addColorStop(0.55, SC.skin); tg.addColorStop(1, SC.belly);
  poly(ctx, torso, tg, OUT, 3);
  // manchas
  ctx.fillStyle = SC.spot;
  for (const [sx, sy, r] of [[-12, shY + 12, 4], [-4, shY + 24, 3], [-16, hipY - 18, 3.5], [6, shY + 6, 2.5]]) { ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU); ctx.fill(); }
  // placas de barriga
  for (let i = 0; i < 3; i++) {
    const py = shY + 22 + i * 12;
    poly(ctx, [4, py, 28 - i * 0.5, py - 2, 30 - i, py + 9, 6, py + 10], i % 2 ? '#7a4e30' : SC.rust, OUT, 2);
    ctx.fillStyle = '#c9b49a'; ctx.beginPath(); ctx.arc(9, py + 4, 1.4, 0, TAU); ctx.arc(25, py + 3, 1.4, 0, TAU); ctx.fill();
  }
  // tiras de couro
  limb(ctx, [shX - 12, shY - 2, 24, hipY - 8], 6, SC.leather, OUT, 2.4);
  limb(ctx, [shX + 18, shY - 6, -14, hipY - 4], 6, SC.leather, OUT, 2.4);
  circle(ctx, lerp(shX - 12, 24, 0.52), lerp(shY - 2, hipY - 8, 0.52), 6, '#9a7a3c', OUT, 2.2);
  circle(ctx, lerp(shX - 12, 24, 0.52), lerp(shY - 2, hipY - 8, 0.52), 2.5, '#5a4220', null);
  // cinto + saiote de musgo
  poly(ctx, [-20, hipY - 6, 30, hipY - 8, 30, hipY + 2, -18, hipY + 4], SC.leather, OUT, 2.4);
  const skirtSway = Math.sin(t * 2.2) * 2;
  for (let i = 0; i < 6; i++) {
    const sx = -16 + i * 8.5;
    const len = 22 + ((i * 7) % 5) * 3;
    poly(ctx, [sx, hipY + 2, sx + 8, hipY + 2, sx + 6 + skirtSway, hipY + len, sx + 3 + skirtSway, hipY + len - 5, sx + 1 + skirtSway, hipY + len], i % 2 ? SC.moss : SC.mossDark, OUT, 1.6);
  }
  poly(ctx, [-2, hipY - 9, 8, hipY - 9, 8, hipY + 4, -2, hipY + 4], '#9a7a3c', OUT, 2);

  // --- perna da frente
  drawSurubimLeg(ctx, 10, hipY, fF, false, cr);

  // --- cabeça
  drawSurubimHead(ctx, shX + 6, shY - 4, P);

  // --- ombreira
  const pX = shX + 14, pY = shY - 2;
  poly(ctx, [pX - 6, pY - 14, pX + 2, pY - 30, pX + 6, pY - 14], '#7d7a70', OUT, 2);
  poly(ctx, [pX - 16, pY - 8, pX - 18, pY - 24, pX - 8, pY - 12], '#7d7a70', OUT, 2);
  poly(ctx, [pX + 6, pY - 10, pX + 16, pY - 22, pX + 12, pY - 6], '#7d7a70', OUT, 2);
  ctx.beginPath(); ctx.ellipse(pX, pY, 18, 13, -0.2, Math.PI, TAU); ctx.lineTo(pX + 18, pY + 4); ctx.lineTo(pX - 18, pY + 4); ctx.closePath();
  const pg = ctx.createLinearGradient(pX, pY - 13, pX, pY + 4);
  pg.addColorStop(0, '#5f8a86'); pg.addColorStop(1, '#2d4a48');
  ctx.fillStyle = pg; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.stroke();
  // escamas
  ctx.strokeStyle = 'rgba(10,20,20,0.6)'; ctx.lineWidth = 1.2;
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(pX + i * 6, pY - 2, 4, Math.PI, TAU); ctx.stroke(); }
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(pX + i * 6 + 3, pY - 7, 4, Math.PI, TAU); ctx.stroke(); }

  // --- braço da frente + escudo
  const fS = [shX + 14, shY + 6];
  const sh = P.shield || { x: 30, y: -54 + by, r: 0.1 };
  const armF = ik(fS[0], fS[1], sh.x - 4, sh.y + 6, 26, 26, 1);
  limb(ctx, [fS[0], fS[1], armF.jx, armF.jy, armF.ex, armF.ey], 15, SC.skin, OUT, 3);
  drawShield(ctx, sh.x, sh.y, sh.r, 1);

  if (P.swordFront) drawSwordArm();

  // tontura
  if (P.dizzy) {
    for (let i = 0; i < 3; i++) {
      const a = t * 4 + i * TAU / 3;
      const sx = shX + 34 + Math.cos(a) * 18, sy = shY - 34 + Math.sin(a) * 5;
      ctx.fillStyle = '#ffe28a';
      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const aa = j / 5 * TAU - Math.PI / 2;
        ctx.lineTo(sx + Math.cos(aa) * 4, sy + Math.sin(aa) * 4);
        ctx.lineTo(sx + Math.cos(aa + TAU / 10) * 1.8, sy + Math.sin(aa + TAU / 10) * 1.8);
      }
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawSurubimLeg(ctx, hx, hy, foot, back, cr) {
  const col = back ? SC.skinDark : SC.skin;
  const ankle = [foot[0] - 6, foot[1] - 12];
  const L = ik(hx, hy, ankle[0], ankle[1], 30, 28, -1);
  limb(ctx, [hx, hy, L.jx, L.jy], 17, col, OUT, 3);
  limb(ctx, [L.jx, L.jy, L.ex, L.ey], 13, col, OUT, 3);
  // grevas enferrujadas
  ctx.save();
  ctx.translate(lerp(L.jx, L.ex, 0.5), lerp(L.jy, L.ey, 0.5));
  ctx.rotate(Math.atan2(L.ey - L.jy, L.ex - L.jx));
  poly(ctx, [-11, -8, 11, -9, 11, 9, -11, 8], back ? SC.rustDark : SC.rust, OUT, 2.2);
  ctx.fillStyle = 'rgba(255,220,180,0.25)'; ctx.fillRect(-9, -7, 18, 2);
  ctx.restore();
  // joelheira
  circle(ctx, L.jx, L.jy, 7, back ? '#5a5650' : SC.metal, OUT, 2.2);
  // pé com garras
  const fx = foot[0], fy = foot[1];
  poly(ctx, [L.ex - 6, L.ey - 2, L.ex + 6, L.ey - 3, fx + 16, fy - 6, fx + 18, fy, fx - 10, fy, fx - 10, fy - 6], col, OUT, 2.4);
  for (const [cx, cl] of [[fx + 18, 7], [fx + 10, 6], [fx + 2, 5]]) {
    poly(ctx, [cx - 3, fy - 4, cx + cl, fy + 1, cx - 2, fy + 1], '#e8dcc0', OUT, 1.4);
  }
}

function drawSurubimHead(ctx, nx, ny, P) {
  const t = P.t;
  const mouth = P.mouth || 0;
  ctx.save();
  ctx.translate(nx, ny);
  ctx.rotate(P.headTilt || 0);
  // barbatana dorsal
  const finPts = [-6, -14];
  for (let i = 0; i < 6; i++) {
    const fx = -4 + i * 6;
    finPts.push(fx - 4, -30 - Math.sin(i * 1.3 + t * 3) * 2 - (i < 3 ? i * 2 : (5 - i) * 2), fx, -18);
  }
  finPts.push(34, -14);
  poly(ctx, finPts, 'rgba(110,90,46,0.95)', OUT, 2);
  ctx.strokeStyle = '#d9c9a0'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 6; i++) {
    const fx = -4 + i * 6;
    ctx.beginPath(); ctx.moveTo(fx, -16); ctx.lineTo(fx - 4, -29 - (i < 3 ? i * 2 : (5 - i) * 2)); ctx.stroke();
  }
  // mandíbula inferior (gira ao abrir a boca)
  ctx.save();
  ctx.translate(4, 10);
  ctx.rotate(mouth * 0.45);
  poly(ctx, [-6, -4, 50, -6, 58, 0, 52, 6, 20, 10, -4, 6], SC.belly, OUT, 2.6);
  // dentinhos
  ctx.fillStyle = '#eee8d6';
  for (let i = 0; i < 7; i++) { const tx = 14 + i * 6; ctx.beginPath(); ctx.moveTo(tx, -5); ctx.lineTo(tx + 2, -10); ctx.lineTo(tx + 4, -5); ctx.fill(); }
  // barbilhões do queixo
  ctx.strokeStyle = SC.skinDark; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  for (const bx of [24, 34, 42]) {
    ctx.beginPath(); ctx.moveTo(bx, 8); ctx.quadraticCurveTo(bx + 2, 16, bx - 2 + Math.sin(t * 3 + bx) * 3, 22); ctx.stroke();
  }
  ctx.restore();
  // interior da boca
  if (mouth > 0.05) {
    ctx.fillStyle = '#4a1414';
    ctx.beginPath(); ctx.moveTo(6, 8); ctx.lineTo(60, 2); ctx.lineTo(56, 8 + mouth * 22); ctx.lineTo(10, 10 + mouth * 8); ctx.fill();
  }
  // crânio superior achatado
  const head = [-10, -12, 8, -20, 34, -20, 56, -12, 68, -2, 70, 6, 62, 10, 30, 10, 4, 12, -12, 6];
  const hg = ctx.createLinearGradient(0, -20, 0, 12);
  hg.addColorStop(0, '#5e5a2e'); hg.addColorStop(0.6, SC.skin); hg.addColorStop(1, '#8e8550');
  poly(ctx, head, hg, OUT, 2.8);
  ctx.fillStyle = SC.spot;
  for (const [sx, sy, r] of [[14, -12, 3], [26, -14, 2.4], [40, -12, 3.2], [8, -4, 2], [50, -6, 2]]) { ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU); ctx.fill(); }
  // linha da boca (lábio)
  ctx.strokeStyle = '#2a2614'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(8, 9); ctx.quadraticCurveTo(40, 12, 68, 4); ctx.stroke();
  // guelra
  ctx.strokeStyle = 'rgba(30,25,10,0.8)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(2, -10); ctx.quadraticCurveTo(-4, 0, 2, 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(7, -9); ctx.quadraticCurveTo(2, 0, 7, 9); ctx.stroke();
  // olho
  const ex = 46, ey = -9;
  glow(ctx, ex, ey, 16, 'rgba(255,60,40,0.7)', 0.6 + (P.eyeGlow || 0) * 0.6);
  circle(ctx, ex, ey, 4.2, SC.eye, OUT, 1.8);
  ctx.fillStyle = '#2a0505'; ctx.fillRect(ex - 0.8, ey - 3, 1.6, 6);
  ctx.fillStyle = '#ffd0c0'; ctx.fillRect(ex + 1.2, ey - 2.6, 1.2, 1.2);
  ctx.strokeStyle = '#2a2614'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(ex - 7, ey - 7); ctx.lineTo(ex + 6, ey - 3); ctx.stroke();
  // barbilhões longos
  ctx.lineCap = 'round';
  const wv = Math.sin(t * 2.4) * 5;
  for (const [ox, oy, len, w] of [[64, 6, 1, 3.6], [58, 9, 0.75, 3]]) {
    ctx.beginPath(); ctx.moveTo(ox, oy);
    ctx.bezierCurveTo(ox + 18 * len, oy + 4, ox + 26 * len + wv, oy + 20 * len, ox + 18 * len + wv * 1.4, oy + 44 * len);
    ctx.strokeStyle = OUT; ctx.lineWidth = w + 2.4; ctx.stroke();
    ctx.strokeStyle = '#5a5530'; ctx.lineWidth = w; ctx.stroke();
  }
  ctx.restore();
}

// ================== INIMIGOS E OBJETOS ==================
function drawBat(ctx, x, y, facing, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(facing, 1);
  const flap = Math.sin(t * 16);
  const wy = flap * 12;
  for (const s of [-1, 1]) {
    poly(ctx, [0, -2, s * 10, -6 - wy * 0.5, s * 22, -4 - wy, s * 26, 4 - wy * 0.6, s * 18, 2 - wy * 0.2, s * 14, 7, s * 8, 3], s > 0 ? '#3a3a24' : '#2a2a1a', OUT, 1.6);
  }
  circle(ctx, 0, 0, 7.5, '#4d4a2c', OUT, 1.8);
  poly(ctx, [-5, -5, -3, -13, 0, -6], '#4d4a2c', OUT, 1.4);
  poly(ctx, [5, -5, 3, -13, 0, -6], '#4d4a2c', OUT, 1.4);
  ctx.fillStyle = '#ff4a35';
  ctx.fillRect(1, -2, 2.4, 2.4); ctx.fillRect(4.5, -2, 2.4, 2.4);
  ctx.fillStyle = '#eee';
  ctx.beginPath(); ctx.moveTo(2, 3); ctx.lineTo(3, 6); ctx.lineTo(4, 3); ctx.fill();
  ctx.restore();
}

function drawCrawler(ctx, x, y, facing, t, flat) {
  ctx.save(); ctx.translate(x, y); ctx.scale(facing, 1 - flat * 0.3);
  const w = Math.sin(t * 9);
  // cauda
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.quadraticCurveTo(-18, -9 + w * 4, -28, -6 + w * 7);
  ctx.quadraticCurveTo(-18, -3 + w * 3, -8, -2);
  ctx.closePath();
  ctx.fillStyle = '#4a5030'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 1.6; ctx.stroke();
  // corpo
  ctx.beginPath(); ctx.ellipse(2, -8, 14, 8.5, 0, 0, TAU);
  const g = ctx.createLinearGradient(0, -16, 0, 0);
  g.addColorStop(0, '#78804a'); g.addColorStop(1, '#3d4224');
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'rgba(200,220,150,0.35)';
  ctx.beginPath(); ctx.ellipse(0, -12, 7, 2, -0.2, 0, TAU); ctx.fill();
  // olho e boca
  circle(ctx, 9, -10, 2.6, '#f4d34a', OUT, 1.2);
  ctx.fillStyle = '#111'; ctx.fillRect(9.4, -11.2, 1.2, 2.4);
  ctx.fillStyle = '#2a0c0c';
  ctx.beginPath(); ctx.moveTo(10, -4); ctx.lineTo(16, -7); ctx.lineTo(16, -3); ctx.fill();
  ctx.fillStyle = '#eee';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(11 + i * 2, -5.5); ctx.lineTo(12 + i * 2, -3.5); ctx.lineTo(13 + i * 2, -5.8); ctx.fill(); }
  // gosma
  ctx.fillStyle = 'rgba(120,150,80,0.6)';
  ctx.beginPath(); ctx.ellipse(-2, 0, 14, 2, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawUrn(ctx, x, y, t) {
  ctx.save(); ctx.translate(x, y);
  const pts = [-6, -30, 6, -30, 5, -26, 12, -18, 13, -8, 8, 0, -8, 0, -13, -8, -12, -18, -5, -26];
  const g = ctx.createLinearGradient(-13, 0, 13, 0);
  g.addColorStop(0, '#4a2a1c'); g.addColorStop(0.45, '#8a5034'); g.addColorStop(1, '#3a2016');
  poly(ctx, pts, g, OUT, 2);
  ctx.strokeStyle = '#c9a36a'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-12, -15); ctx.lineTo(12, -15); ctx.moveTo(-12, -11); ctx.lineTo(12, -11); ctx.stroke();
  ctx.fillStyle = '#c9a36a';
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * 4.5, -13, 1, 0, TAU); ctx.fill(); }
  ctx.restore();
}

function drawHealOrb(ctx, x, y, t) {
  const b = Math.sin(t * 4) * 3;
  glow(ctx, x, y + b, 26, 'rgba(255,60,80,0.8)', 0.7);
  ctx.save(); ctx.translate(x, y + b); ctx.rotate(t * 1.5);
  poly(ctx, [0, -9, 6, 0, 0, 9, -6, 0], '#ff4d6a', '#4a0a14', 1.6);
  ctx.fillStyle = 'rgba(255,220,230,0.8)';
  ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(3, -1); ctx.lineTo(0, 0); ctx.fill();
  ctx.restore();
}

function drawFlame(ctx, x, y, t, s = 1, hue = 'warm') {
  const f = Math.sin(t * 13 + x) * 0.15 + Math.sin(t * 7.3 + x * 0.3) * 0.1;
  const h = (9 + f * 6) * s;
  ctx.save(); ctx.translate(x, y);
  const outer = hue === 'warm' ? '#ff8a2a' : '#3ab0ff';
  const inner = hue === 'warm' ? '#ffe9a0' : '#d8f4ff';
  ctx.fillStyle = outer;
  ctx.beginPath(); ctx.moveTo(0, -h); ctx.quadraticCurveTo(3.6 * s, -h * 0.35, 0, 0); ctx.quadraticCurveTo(-3.6 * s, -h * 0.35, 0, -h); ctx.fill();
  ctx.fillStyle = inner;
  ctx.beginPath(); ctx.moveTo(0, -h * 0.6); ctx.quadraticCurveTo(1.8 * s, -h * 0.2, 0, 0); ctx.quadraticCurveTo(-1.8 * s, -h * 0.2, 0, -h * 0.6); ctx.fill();
  ctx.restore();
}

function drawCandelabra(ctx, c, t) {
  const x = c.x, y = c.y;
  if (c.kind === 'stand') {
    ctx.fillStyle = '#1d1a16';
    ctx.fillRect(x - 2, y - 64, 4, 64);
    poly(ctx, [x - 10, y, x + 10, y, x + 4, y - 6, x - 4, y - 6], '#2c2620', OUT, 1.4);
    ctx.strokeStyle = '#2c2620'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - 14, y - 66); ctx.quadraticCurveTo(x, y - 52, x + 14, y - 66); ctx.stroke();
    for (const dx of [-14, 0, 14]) {
      const cy = y - (dx === 0 ? 70 : 66);
      ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x + dx - 2, cy - 10, 4, 10);
      drawFlame(ctx, x + dx, cy - 10, t, 0.9);
    }
  } else {
    ctx.fillStyle = '#2c2620';
    ctx.fillRect(x - 8, y + 2, 16, 4);
    ctx.fillRect(x - 2, y - 2, 4, 14);
    ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 2.5, y - 12, 5, 12);
    drawFlame(ctx, x, y - 12, t, 1);
  }
}
function candleGlow(ctx, c, t) {
  const f = 0.85 + Math.sin(t * 9 + c.x) * 0.08 + Math.sin(t * 23 + c.x * 2) * 0.05;
  const cy = c.kind === 'stand' ? c.y - 76 : c.y - 18;
  glow(ctx, c.x, cy, 120 * f, 'rgba(255,150,60,0.35)', 0.9);
  glow(ctx, c.x, cy, 30 * f, 'rgba(255,200,120,0.6)', 0.8);
}

function drawSign(ctx, s, t) {
  const x = s.x, y = s.y;
  poly(ctx, [x - 14, y, x + 14, y, x + 12, y - 30, x + 8, y - 38, x - 8, y - 38, x - 12, y - 30], '#3a4152', OUT, 2);
  ctx.fillStyle = '#4c556a'; ctx.fillRect(x - 11, y - 36, 22, 3);
  const a = 0.45 + s.glow * 0.55 + Math.sin(t * 3 + x) * 0.1;
  ctx.save();
  ctx.strokeStyle = `rgba(120,230,220,${a})`; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 32); ctx.lineTo(x, y - 8);
  ctx.moveTo(x - 6, y - 26); ctx.lineTo(x + 6, y - 20);
  ctx.moveTo(x + 6, y - 26); ctx.lineTo(x - 6, y - 14);
  ctx.stroke();
  ctx.restore();
  glow(ctx, x, y - 20, 34, 'rgba(80,220,210,0.5)', a * 0.6);
}

function drawCheckpoint(ctx, cp, t) {
  const x = cp.x, y = cp.y;
  // base ornamentada
  poly(ctx, [x - 22, y, x + 22, y, x + 14, y - 10, x - 14, y - 10], '#2b303c', OUT, 2);
  poly(ctx, [x - 6, y - 10, x + 6, y - 10, x + 4, y - 60, x - 4, y - 60], '#3a4152', OUT, 2);
  poly(ctx, [x - 16, y - 60, x + 16, y - 60, x + 10, y - 68, x - 10, y - 68], '#4c556a', OUT, 2);
  ctx.fillStyle = '#e8e4d8'; ctx.fillRect(x - 5, y - 86, 10, 18);
  ctx.fillStyle = 'rgba(200,190,170,0.9)';
  ctx.beginPath(); ctx.moveTo(x - 5, y - 80); ctx.lineTo(x - 7, y - 70); ctx.lineTo(x - 4, y - 72); ctx.fill();
  if (cp.lit) {
    drawFlame(ctx, x, y - 86, t, 1.8, 'cold');
    glow(ctx, x, y - 96, 150, 'rgba(60,160,255,0.35)', 1);
    glow(ctx, x, y - 96, 40, 'rgba(160,220,255,0.6)', 1);
  } else {
    ctx.fillStyle = '#222'; ctx.fillRect(x - 0.7, y - 90, 1.4, 4);
    glow(ctx, x, y - 50, 40, 'rgba(60,160,255,0.25)', 0.5 + Math.sin(t * 2) * 0.2);
  }
}

function drawExitSeal(ctx, ex, t, active) {
  const x = ex.x, y = ex.y - 70;
  ctx.save();
  ctx.translate(x, y);
  const a = active ? 1 : 0.35;
  glow(ctx, 0, 0, 120, `rgba(140,90,255,${0.5 * a})`, 1);
  ctx.strokeStyle = `rgba(200,170,255,${0.9 * a})`;
  ctx.lineWidth = 2.5;
  ctx.rotate(t * 0.4);
  ctx.beginPath(); ctx.arc(0, 0, 52, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const aa = i * (TAU * 3 / 7);
    ctx.lineTo(Math.cos(aa) * 40, Math.sin(aa) * 40);
  }
  ctx.closePath(); ctx.stroke();
  ctx.rotate(-t * 0.8);
  ctx.fillStyle = `rgba(230,210,255,${0.8 * a})`;
  for (let i = 0; i < 12; i++) {
    const aa = i / 12 * TAU;
    ctx.fillRect(Math.cos(aa) * 46 - 1.5, Math.sin(aa) * 46 - 1.5, 3, 3);
  }
  ctx.restore();
}
