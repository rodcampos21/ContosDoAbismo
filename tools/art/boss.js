// Surubim Guerreiro — chefe, estilo anime cel-shaded. Pés em (0,0), olhando para a direita.
const SC = {
  skin: '#86843f', skinS: '#5a582b', skinD: '#3d3c1e', belly: '#cdbd80', bellyS: '#9c8d55',
  spot: 'rgba(36,34,14,0.55)', wet: 'rgba(255,255,240,0.75)',
  rust: '#a2643a', rustS: '#5e3521', rustHi: '#d79a62', metal: '#9a978b', metalS: '#5f5d55', metalHi: '#e2dfd2',
  leather: '#6e4329', leatherS: '#3e2616', moss: '#56763a', mossS: '#2d4421', mossD: '#1e2f16',
  eye: '#ff3b2a', fin: '#7a6532', finS: '#4e3f1d', bone: '#ebe1c7', boneS: '#b3a888',
};

function bossSword(ctx, hx, hy, a, t) {
  ctx.save();
  ctx.translate(hx, hy); ctx.rotate(a);
  const L = 128;
  const pts = [14, -9];
  for (let u = 20; u < L - 10; u += 9) pts.push(u, -10, u + 4.5, -17.5);
  pts.push(L - 8, -11, L + 6, -4, L, 9, 14, 9);
  const bp = polyPath(pts);
  outline(ctx, bp, 4.2);
  ctx.save(); ctx.clip(bp);
  ctx.fillStyle = '#6a685e'; ctx.fill(bp);
  ctx.fillStyle = '#b9b9ae'; ctx.fillRect(0, -20, L + 10, 22);
  ctx.fillStyle = '#e6e6dc'; ctx.fillRect(0, -11, L + 10, 3);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 5.2, L + 10, 1.4);
  // ferrugem
  ctx.fillStyle = 'rgba(140,72,30,0.6)';
  for (const [u, v, r] of [[30, 2, 6], [60, -4, 8], [92, 4, 7], [110, -6, 5], [45, 6, 4], [75, -12, 3]]) { ctx.beginPath(); ctx.ellipse(u, v, r * 1.6, r, 0.3, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(90,40,15,0.6)';
  for (const [u, v, r] of [[33, 3, 2], [63, -3, 3], [95, 5, 2.5]]) { ctx.beginPath(); ctx.ellipse(u, v, r * 1.4, r, 0.3, 0, TAU); ctx.fill(); }
  ctx.restore();
  // dentes com brilho
  for (let u = 20; u < L - 10; u += 9) strokeLine(ctx, [u + 1, -11, u + 4, -16], 0.8, 'rgba(255,255,255,0.8)');
  // lodo escorrendo
  for (const u of [34, 58, 79, 101]) {
    const dl = 7 + Math.sin(t * 2 + u) * 3 + (u % 7);
    const d = new Path2D(); d.moveTo(u - 3.5, 8); d.lineTo(u + 3.5, 8); d.lineTo(u + 1.2, 8 + dl); d.arc(u, 8 + dl, 1.8, 0, Math.PI); d.closePath();
    part(ctx, d, '#79a957', '#4c7234', { w: 0.9 });
    ctx.fillStyle = 'rgba(230,255,200,0.8)'; ctx.fillRect(u - 1.5, 9, 1, dl * 0.5);
  }
  // guarda
  part(ctx, polyPath([7, -17, 15, -15, 15, 15, 7, 17, 10, 0]), '#7c6142', '#463521', { w: 1.4 });
  part(ctx, polyPath([10, -16, 12, -28, 15, -15]), '#9c8768', '#5a4a33', { w: 1.1 });
  part(ctx, polyPath([10, 16, 12, 28, 15, 15]), '#9c8768', '#5a4a33', { w: 1.1 });
  // cabo
  part(ctx, capsule(8, 0, 4, -14, 0, 3.6), SC.leather, SC.leatherS, { w: 1.4 });
  for (let u = -12; u < 7; u += 3.5) strokeLine(ctx, [u, -3, u + 2, 3], 1.1, '#2c1a10');
  const ring = new Path2D(); ring.arc(-18.5, 0, 5, 0, TAU); ring.arc(-18.5, 0, 2.4, 0, TAU, true);
  part(ctx, ring, '#a19c90', '#5f5c54', { w: 1.2 });
  ctx.restore();
  return [hx + Math.cos(a) * -18.5, hy + Math.sin(a) * -18.5];
}

function bossChain(ctx, x0, y0, x1, y1, sag, t) {
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const x = lerp(x0, x1, s) + Math.sin(t * 2 + s * 3) * 2;
    const y = lerp(y0, y1, s) + Math.sin(s * Math.PI) * sag;
    ctx.save(); ctx.translate(x, y); ctx.rotate(i % 2 ? 0.9 : -0.6);
    const l = new Path2D(); l.ellipse(0, 0, 4.4, 2.7, 0, 0, TAU); l.ellipse(0, 0, 2.6, 1.1, 0, 0, TAU, true);
    part(ctx, l, '#aaa59a', '#5f5c54', { w: 0.9 });
    ctx.restore();
  }
}

function bossShield(ctx, x, y, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  const sp = new Path2D();
  sp.moveTo(-29, -39); sp.quadraticCurveTo(0, -44, 29, -39);
  sp.lineTo(29, 4); sp.quadraticCurveTo(27, 29, 0, 46); sp.quadraticCurveTo(-27, 29, -29, 4); sp.closePath();
  outline(ctx, sp, 4.4);
  ctx.save(); ctx.clip(sp);
  ctx.fillStyle = lin(ctx, -29, -40, 29, 46, [[0, '#c08454'], [0.45, SC.rust], [1, '#4e2b19']]); ctx.fill(sp);
  // sombra cel
  ctx.fillStyle = 'rgba(40,18,8,0.45)';
  ctx.beginPath(); ctx.moveTo(-30, 10); ctx.quadraticCurveTo(0, 22, 30, -2); ctx.lineTo(30, 50); ctx.lineTo(-30, 50); ctx.fill();
  // manchas e arranhões
  ctx.fillStyle = 'rgba(60,28,12,0.45)';
  ctx.beginPath(); ctx.ellipse(14, 20, 14, 9, 0.5, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-16, -26, 10, 6, -0.3, 0, TAU); ctx.fill();
  for (const [x0, y0, x1, y1] of [[-20, -10, -8, -2], [8, -30, 20, -22], [-6, 24, 6, 30]]) strokeLine(ctx, [x0, y0, x1, y1], 0.8, 'rgba(255,220,180,0.45)');
  // emblema: esqueleto de peixe
  const skull = new Path2D(); skull.ellipse(-14, -8, 8.5, 7.2, 0, 0, TAU);
  part(ctx, skull, SC.bone, SC.boneS, { w: 1 });
  ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(-16.5, -10, 2.2, 0, TAU); ctx.fill();
  strokeLine(ctx, [-6, -8, 17, -8], 3, LINE); strokeLine(ctx, [-6, -8, 17, -8], 1.8, SC.bone);
  for (let i = 0; i < 5; i++) {
    const bx = -2 + i * 4, h = 9.5 - i * 1.3;
    ctx.save(); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bx, -8 - h); ctx.quadraticCurveTo(bx + 2.5, -8, bx, -8 + h);
    ctx.strokeStyle = LINE; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = SC.bone; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.restore();
  }
  part(ctx, polyPath([15, -8, 25, -16, 22.5, -8, 25, 0]), SC.bone, SC.boneS, { w: 1 });
  // peixinho verde
  const fish = new Path2D(); fish.ellipse(0, 21, 9.5, 5.2, 0, 0, TAU); fish.moveTo(-8, 21); fish.lineTo(-15, 15); fish.lineTo(-15, 27); fish.closePath();
  part(ctx, fish, '#6d8f57', '#45633a', { w: 1 });
  ctx.fillStyle = '#1b1322'; ctx.beginPath(); ctx.arc(5, 20, 1, 0, TAU); ctx.fill();
  ctx.restore();
  // borda metálica
  ctx.save(); ctx.lineJoin = 'round';
  ctx.strokeStyle = '#4e4a40'; ctx.lineWidth = 4.2; ctx.stroke(sp);
  ctx.strokeStyle = '#8f8a7c'; ctx.lineWidth = 1.4; ctx.stroke(sp);
  ctx.restore();
  // rebites
  for (const [rx, ry] of [[-23, -33], [23, -33], [-25, 2], [25, 2], [0, 39], [-15, 27], [15, 27], [0, -38]]) {
    const r = new Path2D(); r.arc(rx, ry, 2, 0, TAU);
    part(ctx, r, '#d8cfbd', '#8a826f', { w: 0.6 });
  }
  rim(ctx, sp, 'rgba(140,220,255,0.6)', 1.2, 0.4);
  ctx.restore();
}

function bossLeg(ctx, hx, hy, foot, back) {
  const base = back ? SC.skinS : SC.skin, shade = back ? SC.skinD : SC.skinS;
  const ankle = [foot[0] - 6, foot[1] - 12];
  const L = ik(hx, hy, ankle[0], ankle[1], 30, 28, -1);
  const thigh = limbPath(hx, hy, 10, lerp(hx, L.jx, 0.5) + 2, lerp(hy, L.jy, 0.5), 10.5, L.jx, L.jy, 7.5);
  const shin = capsule(L.jx, L.jy, 7.5, L.ex, L.ey, 6);
  const leg = new Path2D(); leg.addPath(thigh); leg.addPath(shin);
  // pé com garras
  const fx = foot[0], fy = foot[1];
  const ft = smoothPath([L.ex - 7, L.ey - 2, L.ex + 6, L.ey - 4, fx + 15, fy - 7, fx + 19, fy - 1, fx + 10, fy + 0.5, fx - 10, fy + 0.5, fx - 11, fy - 6]);
  leg.addPath(ft);
  outline(ctx, leg, 3.6);
  cel(ctx, leg, base, shade, 2.4, -2);
  ctx.save(); ctx.clip(leg);
  ctx.fillStyle = SC.spot;
  for (const [x, y, r] of [[lerp(hx, L.jx, 0.3) - 3, lerp(hy, L.jy, 0.3), 3], [lerp(hx, L.jx, 0.7) + 2, lerp(hy, L.jy, 0.7), 2.4]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  ctx.restore();
  rim(ctx, leg, 'rgba(150,230,255,0.45)', 1.4, 0);
  // garras
  for (const [cx, cl] of [[fx + 19, 7], [fx + 11, 6.5], [fx + 3, 5.5]]) part(ctx, polyPath([cx - 3, fy - 4, cx + cl, fy + 1.2, cx - 2, fy + 1.2]), '#f2e8cf', '#b4a785', { w: 0.8 });
  // greva
  ctx.save();
  ctx.translate(lerp(L.jx, L.ex, 0.5), lerp(L.jy, L.ey, 0.5));
  ctx.rotate(Math.atan2(L.ey - L.jy, L.ex - L.jx));
  const gr = polyPath([-11, -9.5, 11, -10.5, 12, 10, -11, 9]);
  part(ctx, gr, back ? SC.rustS : SC.rust, back ? '#3a2014' : SC.rustS, { w: 1.3, lx: 0, ly: -2.4 });
  ctx.fillStyle = back ? 'rgba(255,220,180,0.2)' : SC.rustHi; ctx.fillRect(-9, -8, 18, 1.6);
  ctx.fillStyle = '#d8cfbd'; ctx.beginPath(); ctx.arc(-7, -5, 1.3, 0, TAU); ctx.arc(7, -5, 1.3, 0, TAU); ctx.fill();
  ctx.restore();
  const knee = new Path2D(); knee.arc(L.jx, L.jy, 7.6, 0, TAU);
  part(ctx, knee, back ? SC.metalS : SC.metal, back ? '#3e3d38' : SC.metalS, { w: 1.2, hi: back ? null : 'rgba(255,255,255,0.7)', hx: -1, hy: 1 });
  return L;
}

function bossHead(ctx, nx, ny, P) {
  const t = P.t, mouth = P.mouth || 0;
  ctx.save();
  ctx.translate(nx, ny); ctx.rotate(P.headTilt || 0);
  // barbatana dorsal
  const fin = [-8, -12];
  for (let i = 0; i < 7; i++) {
    const fx = -6 + i * 6.2, h = 28 + Math.sin(i * 1.3 + t * 3) * 2 + (i < 3 ? i * 3 : (6 - i) * 2.4);
    fin.push(fx - 5, -h, fx + 0.5, -17);
  }
  fin.push(38, -13);
  const fp = polyPath(fin);
  part(ctx, fp, SC.fin, SC.finS, { w: 1.3, lx: 2, ly: 0 });
  for (let i = 0; i < 7; i++) {
    const fx = -6 + i * 6.2, h = 28 + Math.sin(i * 1.3 + t * 3) * 2 + (i < 3 ? i * 3 : (6 - i) * 2.4);
    strokeLine(ctx, [fx + 0.5, -15, fx - 5, -h + 1], 2.4, LINE);
    strokeLine(ctx, [fx + 0.5, -15, fx - 5, -h + 1], 1.2, SC.bone);
  }
  // mandíbula
  ctx.save();
  ctx.translate(4, 10); ctx.rotate(mouth * 0.45);
  const jaw = smoothPath([-7, -4, 24, -6, 52, -6, 60, 0, 53, 7, 22, 11, -5, 7]);
  if (mouth > 0.05) {
    const inner = smoothPath([2, -6, 58, -8, 50, 2, 8, 2]);
    ctx.fillStyle = '#4a1215'; ctx.fill(inner);
  }
  part(ctx, jaw, SC.belly, SC.bellyS, { w: 1.6, lx: 0, ly: -2.6 });
  for (let i = 0; i < 8; i++) { const tx = 13 + i * 5.6; part(ctx, polyPath([tx, -5, tx + 2.2, -11, tx + 4.4, -5]), '#f6f0de', '#c4b99c', { w: 0.7, lx: 0.6, ly: 0 }); }
  for (const bx of [22, 32, 41]) {
    const w = Math.sin(t * 3 + bx) * 3;
    ctx.save(); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx, 9); ctx.quadraticCurveTo(bx + 2, 18, bx - 2 + w, 25);
    ctx.strokeStyle = LINE; ctx.lineWidth = 4.2; ctx.stroke(); ctx.strokeStyle = SC.skinS; ctx.lineWidth = 2.2; ctx.stroke(); ctx.restore();
  }
  ctx.restore();
  if (mouth > 0.05) {
    const m = polyPath([6, 8, 62, 2, 58, 8 + mouth * 24, 10, 10 + mouth * 9]);
    ctx.fillStyle = '#521417'; ctx.fill(m);
    ctx.fillStyle = '#8a2a2a'; ctx.beginPath(); ctx.ellipse(32, 10 + mouth * 12, 14, 3 + mouth * 4, -0.1, 0, TAU); ctx.fill();
    for (let i = 0; i < 8; i++) { const tx = 14 + i * 5.8; part(ctx, polyPath([tx, 6.5, tx + 2.2, 12.5, tx + 4.4, 6]), '#f6f0de', '#c4b99c', { w: 0.7 }); }
  }
  // crânio achatado
  const head = smoothPath([-12, -12, 6, -21, 34, -21, 58, -13, 70, -3, 72, 5, 62, 10.5, 30, 10.5, 4, 12.5, -13, 6], true, 0.35);
  outline(ctx, head, 3.6);
  ctx.save(); ctx.clip(head);
  ctx.fillStyle = SC.skinS; ctx.fill(head);
  ctx.translate(0, -3); ctx.fillStyle = SC.skin; ctx.fill(head); ctx.translate(0, 3);
  ctx.fillStyle = SC.belly; ctx.beginPath(); ctx.ellipse(36, 13, 38, 6, -0.04, 0, TAU); ctx.fill();
  ctx.fillStyle = SC.spot;
  for (const [sx, sy, r] of [[14, -12, 3.4], [26, -15, 2.6], [41, -13, 3.6], [8, -4, 2.2], [52, -7, 2.2], [20, -6, 1.6], [33, -8, 1.6]]) { ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU); ctx.fill(); }
  // brilho molhado
  ctx.fillStyle = SC.wet;
  for (const [sx, sy, rx, ry, a] of [[24, -17, 8, 1.6, -0.1], [50, -12, 5, 1.2, 0.3], [62, -3, 2.4, 0.9, 0.8]]) { ctx.beginPath(); ctx.ellipse(sx, sy, rx, ry, a, 0, TAU); ctx.fill(); }
  ctx.restore();
  rim(ctx, head, 'rgba(150,230,255,0.5)', 1.4, 0.6);
  // lábio
  inkStroke(ctx, 6, 9, 40, 13.5, 70, 4, 2.4, '#2a2614');
  // guelras
  for (const gx of [1, 6.5]) inkStroke(ctx, gx, -10, gx - 6, 0, gx, 10, 2, 'rgba(30,25,10,0.9)');
  // olho com brilho vermelho e sobrancelha óssea
  const ex = 47, ey = -9;
  glowDot(ctx, ex, ey, 22, 'rgba(255,60,40,0.75)', 0.55 + (P.eyeGlow || 0) * 0.45);
  const eye = new Path2D(); eye.ellipse(ex, ey, 5, 4.4, 0, 0, TAU);
  outline(ctx, eye, 3);
  ctx.save(); ctx.clip(eye);
  ctx.fillStyle = lin(ctx, 0, ey - 5, 0, ey + 5, [[0, '#ff8a5a'], [0.5, SC.eye], [1, '#9a1208']]); ctx.fill(eye);
  ctx.restore();
  ctx.fillStyle = '#1a0303'; ctx.beginPath(); ctx.ellipse(ex + 0.4, ey, 1, 3.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff4e8'; ctx.beginPath(); ctx.arc(ex - 1.6, ey - 1.8, 1.2, 0, TAU); ctx.fill();
  inkStroke(ctx, ex - 9, ey - 8.5, ex - 1, ey - 8, ex + 8, ey - 3.5, 3, '#2a2614');
  // barbilhões longos
  const wv = Math.sin(t * 2.4) * 5;
  for (const [ox, oy, len, w] of [[66, 6, 1, 4], [59, 9, 0.75, 3.2]]) {
    ctx.save(); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ox, oy);
    ctx.bezierCurveTo(ox + 18 * len, oy + 4, ox + 26 * len + wv, oy + 20 * len, ox + 18 * len + wv * 1.4, oy + 46 * len);
    ctx.strokeStyle = LINE; ctx.lineWidth = w + 2.8; ctx.stroke();
    ctx.strokeStyle = SC.skinS; ctx.lineWidth = w; ctx.stroke();
    ctx.strokeStyle = 'rgba(220,230,180,0.6)'; ctx.lineWidth = w * 0.3; ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawSurubim(ctx, P) {
  const t = P.t, cr = P.crouch || 0;
  const breathe = Math.sin(t * 2) * 1.5;
  const lean = P.lean || 0;
  const by = cr * 14 + breathe * 0.4;
  const hipY = -62 + by, shY = -108 + by + breathe, shX = 2 + lean;

  let fB = [-14, 0], fF = [14, 0];
  if (P.walking) {
    const ph = P.phase;
    fF = [10 + Math.sin(ph) * 18, -Math.max(0, Math.cos(ph)) * 10];
    fB = [-10 + Math.sin(ph + Math.PI) * 18, -Math.max(0, Math.cos(ph + Math.PI)) * 10];
  }
  if (P.air) { fF = [16, -20]; fB = [-12, -14]; }
  if (cr > 0.3) { fF = [20, 0]; fB = [-20, 0]; }

  // capa esfarrapada
  const sw = Math.sin(t * 1.6) * 5 - lean * 0.6;
  const cape = smoothPath([
    shX - 14, shY - 8, shX - 34 + sw * 0.3, shY + 2, shX - 52 + sw, shY + 40, -58 + sw, hipY + 30,
    -52 + sw, -12 + by * 0.3, -46 + sw, -24, -40 + sw, -6, -32 + sw * 0.6, -24, -25 + sw * 0.5, -10, -18, hipY + 8,
  ], true, 0.25);
  outline(ctx, cape, 3.6);
  cel(ctx, cape, SC.moss, SC.mossS, 3, -1);
  ctx.save(); ctx.clip(cape);
  ctx.fillStyle = SC.mossD;
  ctx.beginPath(); ctx.moveTo(shX - 40, shY + 10); ctx.lineTo(-58 + sw, hipY + 40); ctx.lineTo(-48 + sw, hipY + 40); ctx.closePath(); ctx.fill();
  for (const [x0, y0, x1, y1] of [[shX - 30, shY + 10, -44 + sw, -26], [shX - 22, shY + 14, -30 + sw * 0.6, -28], [shX - 40, shY + 18, -54 + sw, -20]]) inkStroke(ctx, x0, y0, (x0 + x1) / 2 - 3, (y0 + y1) / 2, x1, y1, 1.8, 'rgba(10,20,8,0.7)');
  // furos
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath(); ctx.ellipse(-44 + sw * 0.8, -50, 3, 5, 0.3, 0, TAU); ctx.fill();
  ctx.restore();

  // braço de trás + espada
  const bS = [shX - 10, shY + 4];
  const hand = P.hand || [-26, -70 + by];
  const armB = ik(bS[0], bS[1], hand[0], hand[1], 30, 30, 1);
  const drawSwordArm = () => {
    const arm = new Path2D();
    arm.addPath(limbPath(bS[0], bS[1], 10.5, lerp(bS[0], armB.jx, 0.5), lerp(bS[1], armB.jy, 0.5), 10, armB.jx, armB.jy, 7.5));
    arm.addPath(limbPath(armB.jx, armB.jy, 7.5, lerp(armB.jx, armB.ex, 0.4), lerp(armB.jy, armB.ey, 0.4), 8.2, armB.ex, armB.ey, 6.5));
    part(ctx, arm, SC.skinS, SC.skinD, { w: 1.7, lx: 2, ly: -2 });
    // bracelete
    ctx.save(); ctx.translate(lerp(armB.jx, armB.ex, 0.55), lerp(armB.jy, armB.ey, 0.55)); ctx.rotate(Math.atan2(armB.ey - armB.jy, armB.ex - armB.jx));
    part(ctx, polyPath([-9, -10, 9, -10, 9, 10, -9, 10]), SC.rustS, '#3a2014', { w: 1.3 });
    ctx.fillStyle = 'rgba(255,200,160,0.35)'; ctx.fillRect(-8, -9, 16, 1.5);
    ctx.restore();
    const pom = bossSword(ctx, armB.ex, armB.ey, P.swordA, t);
    bossChain(ctx, pom[0], pom[1], armB.ex - 6, armB.ey + 18, 18, t);
    const fist = new Path2D(); fist.arc(armB.ex, armB.ey, 8.2, 0, TAU);
    part(ctx, fist, SC.skinS, SC.skinD, { w: 1.6 });
    strokeLine(ctx, [armB.ex - 3, armB.ey - 6, armB.ex - 2, armB.ey + 6], 1, SC.skinD);
  };
  if (!P.swordFront) drawSwordArm();

  bossLeg(ctx, -10, hipY, fB, true);

  // tronco
  const torso = smoothPath([shX - 16, shY - 6, shX - 4, shY - 17, shX + 16, shY - 10, shX + 27, shY + 10, 31, hipY - 14, 20, hipY + 4, -16, hipY + 4, -25, hipY - 18, shX - 25, shY + 14], true, 0.3);
  outline(ctx, torso, 3.6);
  ctx.save(); ctx.clip(torso);
  ctx.fillStyle = SC.skinS; ctx.fill(torso);
  ctx.translate(3, -1.5); ctx.fillStyle = SC.skin; ctx.fill(torso); ctx.translate(-3, 1.5);
  ctx.fillStyle = SC.belly; ctx.beginPath(); ctx.ellipse(28, (shY + hipY) / 2 + 4, 12, 30, 0.1, 0, TAU); ctx.fill();
  ctx.fillStyle = SC.bellyS; ctx.beginPath(); ctx.ellipse(31, (shY + hipY) / 2 + 12, 6, 22, 0.1, 0, TAU); ctx.fill();
  ctx.fillStyle = SC.spot;
  for (const [sx, sy, r] of [[-12, shY + 12, 4.4], [-4, shY + 24, 3.2], [-16, hipY - 18, 3.6], [6, shY + 6, 2.6], [-20, shY + 26, 2]]) { ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU); ctx.fill(); }
  ctx.fillStyle = SC.wet;
  for (const [sx, sy, rx] of [[0, shY + 2, 6], [-14, shY + 18, 3.5], [16, shY + 4, 2.4]]) { ctx.beginPath(); ctx.ellipse(sx, sy, rx, 1.1, -0.4, 0, TAU); ctx.fill(); }
  ctx.restore();
  rim(ctx, torso, 'rgba(150,230,255,0.5)', -1.6, 0.4);
  // placas da barriga
  for (let i = 0; i < 3; i++) {
    const py = shY + 22 + i * 12;
    const pl = smoothPath([4, py, 29 - i * 0.5, py - 2, 31 - i, py + 9.5, 6, py + 10.5], true, 0.2);
    part(ctx, pl, i % 2 ? '#8c5634' : SC.rust, SC.rustS, { w: 1.4, lx: 0, ly: -2.6 });
    ctx.fillStyle = SC.rustHi; ctx.fillRect(7, py + 0.5, 20, 1.3);
    for (const rx of [9, 26]) { const r = new Path2D(); r.arc(rx, py + 5, 1.6, 0, TAU); part(ctx, r, '#d8cfbd', '#8a826f', { w: 0.5 }); }
  }
  // tiras de couro + fivela
  const strap1 = capsule(shX - 12, shY - 2, 3.4, 24, hipY - 8, 3.4), strap2 = capsule(shX + 18, shY - 6, 3.4, -14, hipY - 4, 3.4);
  part(ctx, strap1, SC.leather, SC.leatherS, { w: 1.3 });
  part(ctx, strap2, SC.leather, SC.leatherS, { w: 1.3 });
  const bx = lerp(shX - 12, 24, 0.52), byy = lerp(shY - 2, hipY - 8, 0.52);
  const buckle = new Path2D(); buckle.arc(bx, byy, 6.4, 0, TAU);
  part(ctx, buckle, '#b5944b', '#6e5626', { w: 1.3, hi: 'rgba(255,240,190,0.9)', hx: -1, hy: 1 });
  const bh = new Path2D(); bh.arc(bx, byy, 2.6, 0, TAU); ctx.fillStyle = '#4a3618'; ctx.fill(bh);
  // cinto + saiote de musgo/pano
  const belt = polyPath([-21, hipY - 6, 31, hipY - 8, 31, hipY + 2.5, -19, hipY + 4.5]);
  part(ctx, belt, SC.leather, SC.leatherS, { w: 1.4 });
  const ss = Math.sin(t * 2.2) * 2;
  for (let i = 0; i < 7; i++) {
    const sx = -18 + i * 7.6, len = 22 + ((i * 7) % 5) * 3.4;
    const strip = polyPath([sx, hipY + 2, sx + 8, hipY + 2, sx + 6 + ss, hipY + len, sx + 3.6 + ss, hipY + len - 5, sx + 1 + ss, hipY + len]);
    part(ctx, strip, i % 2 ? SC.moss : SC.mossS, SC.mossD, { w: 1.1 });
  }
  part(ctx, polyPath([-2, hipY - 9.5, 8.5, hipY - 9.5, 8.5, hipY + 4.5, -2, hipY + 4.5]), '#b5944b', '#6e5626', { w: 1.2 });

  bossLeg(ctx, 10, hipY, fF, false);
  bossHead(ctx, shX + 6, shY - 4, P);

  // ombreira com escamas
  const pX = shX + 14, pY = shY - 2;
  for (const sp of [[pX - 6, pY - 14, pX + 2, pY - 31, pX + 6, pY - 14], [pX - 16, pY - 8, pX - 19, pY - 25, pX - 8, pY - 12], [pX + 6, pY - 10, pX + 17, pY - 23, pX + 12, pY - 6]])
    part(ctx, polyPath(sp), SC.metal, SC.metalS, { w: 1.2, lx: 1.5, ly: 0 });
  const pa = new Path2D(); pa.ellipse(pX, pY, 19, 14, -0.2, Math.PI, TAU); pa.lineTo(pX + 19, pY + 5); pa.lineTo(pX - 19, pY + 5); pa.closePath();
  outline(ctx, pa, 3.4);
  ctx.save(); ctx.clip(pa);
  ctx.fillStyle = lin(ctx, 0, pY - 14, 0, pY + 5, [[0, '#76a5a0'], [1, '#2a4644']]); ctx.fill(pa);
  for (let row = 0; row < 3; row++) for (let i = -3; i <= 3; i++) {
    const sx = pX + i * 6 + (row % 2) * 3, sy = pY - 10 + row * 5;
    const sc = new Path2D(); sc.arc(sx, sy, 3.6, 0, Math.PI);
    ctx.strokeStyle = 'rgba(10,25,25,0.75)'; ctx.lineWidth = 1; ctx.stroke(sc);
    ctx.fillStyle = 'rgba(200,255,250,0.3)'; ctx.fillRect(sx - 1.5, sy + 0.5, 2, 0.8);
  }
  ctx.restore();
  rim(ctx, pa, 'rgba(255,255,255,0.55)', -1, 1.2);

  // braço da frente + escudo
  const fS = [shX + 14, shY + 6];
  const sh = P.shield || { x: 30, y: -54 + by, r: 0.1 };
  const armF = ik(fS[0], fS[1], sh.x - 4, sh.y + 6, 26, 26, 1);
  const armP = new Path2D();
  armP.addPath(limbPath(fS[0], fS[1], 10.5, lerp(fS[0], armF.jx, 0.5), lerp(fS[1], armF.jy, 0.5), 10.4, armF.jx, armF.jy, 7.6));
  armP.addPath(capsule(armF.jx, armF.jy, 7.6, armF.ex, armF.ey, 7));
  part(ctx, armP, SC.skin, SC.skinS, { w: 1.7, lx: 2.2, ly: -2, rimc: 'rgba(150,230,255,0.45)' });
  bossShield(ctx, sh.x, sh.y, sh.r);

  if (P.swordFront) drawSwordArm();

  if (P.dizzy) {
    for (let i = 0; i < 3; i++) {
      const a = t * 4 + i * TAU / 3;
      const sx = shX + 34 + Math.cos(a) * 18, sy = shY - 40 + Math.sin(a) * 5;
      const st = new Path2D();
      for (let j = 0; j < 5; j++) {
        const aa = j / 5 * TAU - Math.PI / 2;
        st.lineTo(sx + Math.cos(aa) * 5, sy + Math.sin(aa) * 5);
        st.lineTo(sx + Math.cos(aa + TAU / 10) * 2.2, sy + Math.sin(aa + TAU / 10) * 2.2);
      }
      st.closePath();
      part(ctx, st, '#ffe78f', '#e0a83a', { w: 0.9 });
    }
  }
}
