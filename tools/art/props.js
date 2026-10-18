// Objetos de cenário, efeitos e interface
function drawFlameArt(ctx, t, cold) {
  // t: 0..1
  const f = Math.sin(t * TAU) * 0.15 + Math.sin(t * TAU * 2 + 1) * 0.08;
  const h = 16 * (1 + f), w = 5.2 * (1 - f * 0.5);
  const sway = Math.sin(t * TAU + 0.5) * 1.2;
  const outer = cold ? ['rgba(40,140,255,0.0)', '#2f8cff', '#9fd4ff'] : ['rgba(255,90,20,0)', '#ff7a1c', '#ffd27a'];
  glowDot(ctx, 0, -h * 0.4, 14, cold ? 'rgba(80,170,255,0.55)' : 'rgba(255,150,60,0.55)', 1);
  const o = new Path2D(); o.moveTo(sway, -h); o.quadraticCurveTo(w, -h * 0.35, 0, 0); o.quadraticCurveTo(-w, -h * 0.35, sway, -h); o.closePath();
  ctx.fillStyle = lin(ctx, 0, -h, 0, 0, [[0, outer[1]], [1, outer[2]]]); ctx.fill(o);
  const i = new Path2D(); i.moveTo(sway * 0.6, -h * 0.62); i.quadraticCurveTo(w * 0.5, -h * 0.2, 0, -0.5); i.quadraticCurveTo(-w * 0.5, -h * 0.2, sway * 0.6, -h * 0.62); i.closePath();
  ctx.fillStyle = cold ? '#eefaff' : '#fff8d8'; ctx.fill(i);
  ctx.fillStyle = cold ? 'rgba(20,60,160,0.8)' : 'rgba(120,40,10,0.7)';
  ctx.beginPath(); ctx.ellipse(0, -0.6, 1.2, 1.4, 0, 0, TAU); ctx.fill();
}

function drawCandle(ctx, x, y, h) {
  const c = polyPath([x - 2.6, y, x + 2.6, y, x + 2.6, y - h, x - 2.6, y - h]);
  part(ctx, c, '#f2ead8', '#c3b79d', { w: 0.8, lx: 1, ly: 0 });
  part(ctx, polyPath([x - 2.6, y - h, x - 3.2, y - h + 6, x - 1.8, y - h + 3]), '#f2ead8', '#c3b79d', { w: 0.6 });
  strokeLine(ctx, [x, y - h, x, y - h - 2], 0.7, '#2a2020');
}
function drawCandelabraArt(ctx) {
  // origem: base no chão; velas nas posições (-16,-74), (0,-80), (16,-74)
  const iron = '#3a3430', ironS = '#1d1916', ironHi = '#8f8173';
  part(ctx, polyPath([-12, 0, 12, 0, 6, -7, -6, -7]), iron, ironS, { w: 1 });
  part(ctx, capsule(0, -6, 2.6, 0, -70, 2), iron, ironS, { w: 1, hi: ironHi, hx: -0.6, hy: 0 });
  for (const yy of [-24, -48]) { const k = new Path2D(); k.ellipse(0, yy, 4.2, 2.6, 0, 0, TAU); part(ctx, k, iron, ironS, { w: 0.9 }); }
  const arm = new Path2D(); arm.moveTo(-16, -72); arm.quadraticCurveTo(-14, -60, 0, -60); arm.quadraticCurveTo(14, -60, 16, -72);
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = LINE; ctx.lineWidth = 4.4; ctx.stroke(arm);
  ctx.strokeStyle = iron; ctx.lineWidth = 2.4; ctx.stroke(arm);
  ctx.restore();
  for (const dx of [-16, 0, 16]) {
    const cy = dx === 0 ? -72 : -71;
    part(ctx, polyPath([dx - 5, cy, dx + 5, cy, dx + 3.5, cy + 3, dx - 3.5, cy + 3]), iron, ironS, { w: 0.9 });
    drawCandle(ctx, dx, cy, dx === 0 ? 9 : 7);
  }
}
function drawSconceArt(ctx) {
  const iron = '#3a3430', ironS = '#1d1916';
  part(ctx, polyPath([-3, -8, 3, -8, 3, 10, -3, 10]), iron, ironS, { w: 0.9 });
  part(ctx, polyPath([-9, 2, 9, 2, 6, 6, -6, 6]), iron, ironS, { w: 0.9 });
  drawCandle(ctx, 0, 2, 12);
}

function drawCheckpointArt(ctx) {
  const st = '#8d93a8', stS = '#4b4f60', stHi = '#e2e6f4';
  part(ctx, polyPath([-26, 0, 26, 0, 18, -12, -18, -12]), st, stS, { w: 1.2 });
  part(ctx, polyPath([-7, -12, 7, -12, 5, -66, -5, -66]), st, stS, { w: 1.2, hi: stHi, hx: -1, hy: 0 });
  part(ctx, polyPath([-19, -66, 19, -66, 12, -76, -12, -76]), st, stS, { w: 1.2 });
  // anjos/asas estilizadas
  for (const s of [-1, 1]) {
    const wg = smoothPath([s * 6, -40, s * 22, -60, s * 28, -48, s * 20, -36, s * 26, -28, s * 12, -30]);
    part(ctx, wg, '#b4bacb', '#6b7088', { w: 1, lx: -s, ly: -1 });
  }
  const cand = polyPath([-5.5, -76, 5.5, -76, 5.5, -96, -5.5, -96]);
  part(ctx, cand, '#f4efe2', '#c8bfa8', { w: 0.9 });
  part(ctx, polyPath([-5.5, -96, -7, -86, -4, -90]), '#f4efe2', '#c8bfa8', { w: 0.7 });
}

function drawSignArt(ctx) {
  const st = '#5c6478', stS = '#323746';
  const p = smoothPath([-15, 0, 15, 0, 14, -32, 9, -42, 0, -45, -9, -42, -14, -32], true, 0.25);
  part(ctx, p, st, stS, { w: 1.2, lx: 2, ly: -1, hi: 'rgba(200,215,255,0.5)', hx: -1, hy: 1 });
  ctx.save(); ctx.clip(p);
  ctx.fillStyle = 'rgba(70,110,70,0.6)'; ctx.beginPath(); ctx.ellipse(-8, -2, 9, 4, 0, 0, TAU); ctx.fill();
  ctx.restore();
  // runa entalhada
  strokeLine(ctx, [0, -36, 0, -10], 2.6, '#1a1d26');
  strokeLine(ctx, [-6, -30, 6, -24], 2.2, '#1a1d26');
  strokeLine(ctx, [6, -30, -6, -17], 2.2, '#1a1d26');
}
function drawRuneGlowArt(ctx) {
  ctx.save();
  ctx.shadowColor = 'rgba(120,255,240,0.9)'; ctx.shadowBlur = 6;
  strokeLine(ctx, [0, -36, 0, -10], 1.4, '#9ffff2');
  strokeLine(ctx, [-6, -30, 6, -24], 1.2, '#9ffff2');
  strokeLine(ctx, [6, -30, -6, -17], 1.2, '#9ffff2');
  ctx.restore();
}

function drawGateArt(ctx, h) {
  // grade de ferro (origem topo-esquerda, largura 40)
  for (let i = 0; i < 4; i++) {
    const bx = 5 + i * 10;
    const bar = polyPath([bx - 2.6, 0, bx + 2.6, 0, bx + 2.6, h, bx - 2.6, h]);
    part(ctx, bar, '#5a6070', '#262a33', { w: 0.9, lx: 1.4, ly: 0, hi: 'rgba(210,220,240,0.7)', hx: -1.2, hy: 0 });
    part(ctx, polyPath([bx - 3.4, h, bx, h + 11, bx + 3.4, h]), '#8a909e', '#4a4f5c', { w: 0.9 });
  }
  for (let yy = 22; yy < h; yy += 52) {
    const cross = polyPath([0, yy, 40, yy, 40, yy + 7, 0, yy + 7]);
    part(ctx, cross, '#3e434f', '#1d2027', { w: 0.9, lx: 0, ly: -1.5 });
    for (let i = 0; i < 4; i++) { const r = new Path2D(); r.arc(5 + i * 10, yy + 3.5, 1.4, 0, TAU); ctx.fillStyle = '#a7adbb'; ctx.fill(r); }
  }
}

function drawSealArt(ctx, ring) {
  ctx.save();
  ctx.shadowColor = 'rgba(190,150,255,1)'; ctx.shadowBlur = 8;
  ctx.strokeStyle = '#e4d6ff'; ctx.lineWidth = 2.2;
  if (ring === 0) {
    ctx.beginPath(); ctx.arc(0, 0, 54, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 47, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#efe6ff';
    ctx.font = '700 7px "Noto Serif CJK JP"';
    ctx.textAlign = 'center';
    const glyphs = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * TAU;
      ctx.save(); ctx.rotate(a); ctx.translate(0, -50.5);
      ctx.fillRect(-1, -1.6, 2, 3.2);
      ctx.restore();
    }
  } else {
    ctx.beginPath();
    for (let i = 0; i < 7; i++) { const a = i * (TAU * 3 / 7) - Math.PI / 2; ctx.lineTo(Math.cos(a) * 40, Math.sin(a) * 40); }
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}

// --- texturas de efeito ---
function fxGlow(ctx) { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(-32, -32, 64, 64); }
function fxDot(ctx) { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 4); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.6, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(-4, -4, 8, 8); }
function fxSpark(ctx) { const g = ctx.createLinearGradient(-10, 0, 10, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.8, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0.6)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 10, 1.4, 0, 0, TAU); ctx.fill(); }
function fxRing(ctx) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.stroke(); }
function fxPixel(ctx) { ctx.fillStyle = '#fff'; ctx.fillRect(-2, -2, 4, 4); }
function fxHitStar(ctx) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? 4 : 16; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  ctx.closePath(); ctx.fill();
}
function fxShock(ctx, k) {
  // onda de água (origem: base, olhando para a direita); k 0..1 animação
  const h = 30 + Math.sin(k * TAU) * 3;
  const wave = new Path2D();
  wave.moveTo(-36, 0);
  wave.quadraticCurveTo(-12, -h * 0.4, 4, -h);
  wave.quadraticCurveTo(15, -h * 1.08, 20, -h * 0.74 + Math.sin(k * TAU) * 2);
  wave.quadraticCurveTo(13, -h * 0.7, 15, -h * 0.4);
  wave.quadraticCurveTo(19, -h * 0.15, 24, 0);
  wave.closePath();
  outline(ctx, wave, 2, '#163a48');
  ctx.fillStyle = lin(ctx, 0, -h, 0, 0, [[0, '#e8fbff'], [0.35, '#8fd3e8'], [1, 'rgba(40,110,140,0.9)']]); ctx.fill(wave);
  ctx.save(); ctx.clip(wave);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.ellipse(6, -h * 0.82, 9, 2.6, -0.4, 0, TAU); ctx.fill();
  ctx.restore();
  for (let i = 0; i < 6; i++) { const a = -1.2 + i * 0.2 + k; ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.arc(10 + Math.cos(a) * 14, -h + Math.sin(a) * 6 - 4, 1.4, 0, TAU); ctx.fill(); }
}
function fxGlob(ctx) {
  glowDot(ctx, 0, 0, 18, 'rgba(140,230,120,0.6)', 0.7);
  const b = new Path2D(); b.ellipse(0, 0, 11, 8.5, 0, 0, TAU);
  part(ctx, b, '#8fbf5a', '#4a7430', { w: 1.2, lx: -1.5, ly: -1.5 });
  ctx.fillStyle = '#efffd8'; ctx.beginPath(); ctx.ellipse(-3, -3.5, 3.6, 1.6, -0.4, 0, TAU); ctx.fill();
}
function fxDebris(ctx) {
  const r = polyPath([-13, -6, -4, -14, 10, -11, 14, 2, 7, 13, -8, 11, -14, 2]);
  part(ctx, r, '#626a7e', '#363b48', { w: 1.2, lx: 1.5, ly: -1.5, hi: 'rgba(200,210,235,0.7)', hx: -1, hy: 1 });
  strokeLine(ctx, [-6, -4, 2, 4, 4, 10], 0.8, '#232733');
}
function fxGeyser(ctx, k) {
  // coluna de água, 64 x 160, tileável verticalmente (origem topo-esquerda)
  const W = 64, H = 160;
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, 'rgba(70,160,200,0)'); g.addColorStop(0.15, 'rgba(90,180,215,0.7)'); g.addColorStop(0.5, 'rgba(235,252,255,0.97)'); g.addColorStop(0.85, 'rgba(90,180,215,0.7)'); g.addColorStop(1, 'rgba(70,160,200,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.6;
  for (let i = 0; i < 6; i++) {
    const x = 12 + i * 8;
    ctx.beginPath();
    for (let y = 0; y <= H; y += 8) ctx.lineTo(x + Math.sin((y / H) * TAU * 2 + k * TAU + i) * 3, y);
    ctx.stroke();
  }
}
function fxSplashCrown(ctx, k) {
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI + (i / (n - 1)) * Math.PI;
    const r = 18 + k * 18;
    const x = Math.cos(a) * r * 1.4, y = Math.sin(a) * r * (1 - k * 0.3);
    const d = new Path2D(); d.ellipse(x, y, 3, 5, a + Math.PI / 2, 0, TAU);
    ctx.fillStyle = `rgba(220,248,255,${1 - k * 0.7})`; ctx.fill(d);
  }
}
function fxWater(ctx) {
  // faixa de superfície de água tileável 256 x 24 (origem topo-esquerda)
  const W = 256;
  const g = ctx.createLinearGradient(0, 0, 0, 24);
  g.addColorStop(0, 'rgba(120,200,220,0.6)'); g.addColorStop(0.3, 'rgba(60,130,160,0.55)'); g.addColorStop(1, 'rgba(20,60,80,0.75)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, 24);
  for (let x = 0; x <= W; x += 4) ctx.lineTo(x, 4 + Math.sin(x / W * TAU * 4) * 2 + Math.sin(x / W * TAU * 7) * 1);
  ctx.lineTo(W, 24); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(220,250,255,0.8)'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 4) ctx.lineTo(x, 4 + Math.sin(x / W * TAU * 4) * 2 + Math.sin(x / W * TAU * 7) * 1);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let x = 8; x < W; x += 32) ctx.fillRect(x, 10 + (x % 3) * 3, 12, 1);
}

// --- interface ---
function uiPanel(ctx) {
  // 64x64, nine-patch com 14px de borda
  const W = 64, H = 64;
  ctx.fillStyle = lin(ctx, 0, 0, 0, H, [[0, 'rgba(18,22,36,0.94)'], [1, 'rgba(7,9,16,0.96)']]);
  ctx.beginPath(); ctx.moveTo(8, 1); ctx.lineTo(W - 8, 1); ctx.lineTo(W - 1, 8); ctx.lineTo(W - 1, H - 8); ctx.lineTo(W - 8, H - 1); ctx.lineTo(8, H - 1); ctx.lineTo(1, H - 8); ctx.lineTo(1, 8); ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#a4915e'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.strokeStyle = 'rgba(214,190,130,0.35)'; ctx.lineWidth = 0.8;
  ctx.strokeRect(5, 5, W - 10, H - 10);
  ctx.fillStyle = '#d9c38a';
  for (const [x, y] of [[5, 5], [W - 5, 5], [5, H - 5], [W - 5, H - 5]]) { ctx.beginPath(); ctx.moveTo(x, y - 2.5); ctx.lineTo(x + 2.5, y); ctx.lineTo(x, y + 2.5); ctx.lineTo(x - 2.5, y); ctx.fill(); }
}
function uiDiamond(ctx) { ctx.fillStyle = '#e1cb90'; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4.5, 0); ctx.lineTo(0, 6); ctx.lineTo(-4.5, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#5a4a24'; ctx.lineWidth = 0.8; ctx.stroke(); }
function uiRingFrame(ctx) {
  ctx.lineWidth = 3; ctx.strokeStyle = '#c9b27a'; ctx.beginPath(); ctx.arc(0, 0, 25, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1; ctx.strokeStyle = '#5a4a24'; ctx.beginPath(); ctx.arc(0, 0, 27, 0, TAU); ctx.stroke();
  for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * TAU / 4); ctx.translate(0, -26); uiDiamond(ctx); ctx.restore(); }
}

function titleText(ctx, text, size, opts = {}) {
  ctx.save();
  ctx.font = `900 ${size}px "Noto Serif CJK JP"`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (opts.spacing) ctx.letterSpacing = opts.spacing + 'px';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.16; ctx.strokeStyle = '#05060c'; ctx.strokeText(text, 0, 0);
  const g = ctx.createLinearGradient(0, -size * 0.85, 0, size * 0.1);
  for (const [o, c] of (opts.grad || [[0, '#ffffff'], [0.5, '#c4ccdc'], [0.56, '#7e889e'], [1, '#d7deea']])) g.addColorStop(o, c);
  ctx.fillStyle = g; ctx.fillText(text, 0, 0);
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.strokeText(text, 0, -1);
  ctx.restore();
}
function drawLogo(ctx) {
  glowDot(ctx, 0, -30, 260, 'rgba(90,140,255,0.28)', 1);
  titleText(ctx, 'CONTOS DO ABISMO', 64, { spacing: 3 });
  ctx.strokeStyle = 'rgba(214,190,130,0.9)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-290, 22); ctx.lineTo(-20, 22); ctx.moveTo(20, 22); ctx.lineTo(290, 22); ctx.stroke();
  ctx.save(); ctx.translate(0, 22); uiDiamond(ctx); ctx.restore();
  ctx.font = '600 15px "Noto Serif CJK JP"'; ctx.textAlign = 'center'; ctx.fillStyle = '#dcc488';
  ctx.letterSpacing = '4px';
  ctx.fillText('ÁREA TUTORIAL · A CISTERNA ESQUECIDA', 0, 48);
}
function drawBossName(ctx) {
  ctx.font = 'italic 400 17px "Lora"'; ctx.textAlign = 'center'; ctx.fillStyle = '#c3cde2';
  ctx.fillText('Guardião da Cisterna Esquecida', 0, -50);
  titleText(ctx, 'SURUBIM GUERREIRO', 52, { spacing: 2 });
  ctx.strokeStyle = 'rgba(214,190,130,0.9)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-300, 16); ctx.lineTo(300, 16); ctx.stroke();
}
