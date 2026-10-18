// Cenários pintados (estilo fundo de anime): camada distante, intermediária, parede próxima e blocos
const TSZ = 32;

function gothicArch(p, cx, top, w, bottom) {
  const hw = w / 2, spring = top + hw * 1.15;
  p.moveTo(cx - hw, bottom); p.lineTo(cx - hw, spring);
  p.quadraticCurveTo(cx - hw, top + hw * 0.12, cx, top);
  p.quadraticCurveTo(cx + hw, top + hw * 0.12, cx + hw, spring);
  p.lineTo(cx + hw, bottom); p.closePath();
  return p;
}

// ---------- camada distante (nave da catedral), tileável ----------
function paintFarNave(ctx, W, H) {
  const rng = mulberry32(77);
  ctx.fillStyle = lin(ctx, 0, 0, 0, H, [[0, '#0a0e1d'], [0.45, '#18233e'], [0.8, '#1d2a44'], [1, '#0d1220']]);
  ctx.fillRect(0, 0, W, H);
  const wrap = (fn) => { for (const o of [-W, 0, W]) { ctx.save(); ctx.translate(o, 0); fn(); ctx.restore(); } };
  // janelas altas distantes com luar
  ctx.save(); ctx.filter = 'blur(3px)';
  for (let i = 0; i < 4; i++) {
    const cx = (i + 0.5) * W / 4;
    wrap(() => {
      const p = gothicArch(new Path2D(), cx, 40, 54, 300);
      ctx.fillStyle = lin(ctx, 0, 40, 0, 300, [[0, 'rgba(170,200,255,0.55)'], [1, 'rgba(90,120,190,0.25)']]); ctx.fill(p);
      ctx.strokeStyle = 'rgba(10,14,28,0.9)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx, 40); ctx.lineTo(cx, 300); ctx.moveTo(cx - 27, 160); ctx.lineTo(cx + 27, 160); ctx.stroke();
    });
  }
  ctx.restore();
  // feixes de luz
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(10px)';
  for (let i = 0; i < 4; i++) {
    const cx = (i + 0.5) * W / 4;
    wrap(() => {
      ctx.fillStyle = lin(ctx, cx, 60, cx + 120, H, [[0, 'rgba(120,160,255,0.22)'], [1, 'rgba(120,160,255,0)']]);
      ctx.beginPath(); ctx.moveTo(cx - 25, 80); ctx.lineTo(cx + 25, 80); ctx.lineTo(cx + 200, H); ctx.lineTo(cx + 60, H); ctx.closePath(); ctx.fill();
    });
  }
  ctx.restore();
  // fileira de arcos em perspectiva (névoa)
  ctx.save(); ctx.filter = 'blur(2px)';
  for (let i = 0; i < 8; i++) {
    const cx = (i + 0.25) * W / 8;
    wrap(() => {
      ctx.fillStyle = 'rgba(14,20,38,0.85)';
      ctx.fillRect(cx - 9, 120, 18, H);
      const p = new Path2D(); p.moveTo(cx - 9, 200); p.quadraticCurveTo(cx + W / 16, 120, cx + W / 8 - 9, 200);
      ctx.strokeStyle = 'rgba(14,20,38,0.85)'; ctx.lineWidth = 10; ctx.stroke(p);
      ctx.fillStyle = 'rgba(120,150,210,0.12)'; ctx.fillRect(cx - 9, 120, 3, H);
    });
  }
  ctx.restore();
  // lustres pendurados
  for (let i = 0; i < 3; i++) {
    const cx = (i + 0.7) * W / 3;
    wrap(() => {
      ctx.save(); ctx.filter = 'blur(1.5px)';
      ctx.strokeStyle = 'rgba(8,10,18,0.9)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, 90); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, 96, 26, 6, 0, 0, TAU); ctx.stroke();
      ctx.restore();
      for (let k = -2; k <= 2; k++) glowDot(ctx, cx + k * 11, 90, 12, 'rgba(255,170,90,0.6)', 0.8);
    });
  }
  // névoa no chão
  ctx.fillStyle = lin(ctx, 0, H * 0.55, 0, H, [[0, 'rgba(60,80,120,0)'], [1, 'rgba(70,95,140,0.45)']]);
  ctx.fillRect(0, H * 0.55, W, H * 0.45);
  // poeira
  for (let i = 0; i < 120; i++) { ctx.fillStyle = `rgba(200,215,255,${0.1 + rng() * 0.25})`; ctx.fillRect(rng() * W, rng() * H, 1, 1); }
}

function paintFarCistern(ctx, W, H) {
  const rng = mulberry32(99);
  ctx.fillStyle = lin(ctx, 0, 0, 0, H, [[0, '#071016'], [0.5, '#0f2229'], [1, '#081318']]);
  ctx.fillRect(0, 0, W, H);
  const wrap = (fn) => { for (const o of [-W, 0, W]) { ctx.save(); ctx.translate(o, 0); fn(); ctx.restore(); } };
  // abóbadas da cisterna
  ctx.save(); ctx.filter = 'blur(2.5px)';
  for (let i = 0; i < 6; i++) {
    const cx = (i + 0.5) * W / 6;
    wrap(() => {
      ctx.fillStyle = 'rgba(10,22,28,0.95)'; ctx.fillRect(cx - 12, 90, 24, H);
      ctx.fillStyle = 'rgba(110,190,190,0.12)'; ctx.fillRect(cx - 12, 90, 4, H);
      const p = new Path2D(); p.moveTo(cx + 12, 150); p.quadraticCurveTo(cx + W / 12, 60, cx + W / 6 - 12, 150);
      ctx.strokeStyle = 'rgba(10,22,28,0.95)'; ctx.lineWidth = 14; ctx.stroke(p);
    });
  }
  ctx.restore();
  // água distante com reflexos
  ctx.fillStyle = lin(ctx, 0, 380, 0, H, [[0, '#123a44'], [1, '#081a20']]);
  ctx.fillRect(0, 380, W, H - 380);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(120,220,230,${0.05 + rng() * 0.15})`; const x = rng() * W, y = 385 + rng() * 150; ctx.fillRect(x, y, 6 + rng() * 22, 1); }
  // luz verde vinda de cima
  ctx.filter = 'blur(14px)';
  for (let i = 0; i < 3; i++) {
    const cx = (i + 0.3) * W / 3;
    wrap(() => { ctx.fillStyle = 'rgba(90,200,180,0.16)'; ctx.beginPath(); ctx.moveTo(cx - 20, 0); ctx.lineTo(cx + 20, 0); ctx.lineTo(cx + 110, H); ctx.lineTo(cx + 30, H); ctx.fill(); });
  }
  ctx.restore();
  ctx.fillStyle = lin(ctx, 0, 300, 0, 400, [[0, 'rgba(60,120,120,0)'], [1, 'rgba(60,120,120,0.3)']]); ctx.fillRect(0, 300, W, 100);
}

// ---------- camada intermediária (colunas e estandartes), tileável, com alfa ----------
function paintMid(ctx, W, H) {
  const wrap = (fn) => { for (const o of [-W, 0, W]) { ctx.save(); ctx.translate(o, 0); fn(); ctx.restore(); } };
  ctx.save(); ctx.filter = 'blur(1.2px)';
  for (let i = 0; i < 3; i++) {
    const cx = (i + 0.5) * W / 3;
    wrap(() => {
      const w = 46;
      ctx.fillStyle = lin(ctx, cx - w / 2, 0, cx + w / 2, 0, [[0, '#0b0f1a'], [0.3, '#1c2438'], [0.6, '#141a2a'], [1, '#080b13']]);
      ctx.fillRect(cx - w / 2, 0, w, H);
      ctx.fillStyle = 'rgba(140,170,240,0.25)'; ctx.fillRect(cx - w / 2, 0, 2, H);
      ctx.fillStyle = '#1e263a'; ctx.fillRect(cx - w / 2 - 8, H - 70, w + 16, 70);
      ctx.fillStyle = '#29324a'; ctx.fillRect(cx - w / 2 - 8, H - 70, w + 16, 4);
      // estandarte rasgado
      const bx = cx + W / 6;
      const b = new Path2D(); b.moveTo(bx - 22, 30); b.lineTo(bx + 22, 30); b.lineTo(bx + 22, 230); b.lineTo(bx + 12, 214); b.lineTo(bx + 4, 236); b.lineTo(bx - 6, 212); b.lineTo(bx - 14, 232); b.lineTo(bx - 22, 210); b.closePath();
      ctx.fillStyle = lin(ctx, bx - 22, 0, bx + 22, 0, [[0, '#3b0c14'], [0.5, '#6e1a24'], [1, '#2d0910']]); ctx.fill(b);
      ctx.strokeStyle = 'rgba(200,160,90,0.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(bx, 100, 12, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#0b0d14'; ctx.fillRect(bx - 26, 26, 52, 5);
    });
  }
  ctx.restore();
}

// ---------- parede próxima (por nível) ----------
function stoneWall(ctx, x0, y0, x1, y1, rng, tone = 0) {
  const bh = 24;
  for (let y = y0, row = 0; y < y1; y += bh, row++) {
    let x = x0 - (row % 2) * 22 - rng() * 10;
    while (x < x1) {
      const bw = 38 + rng() * 34;
      const l = 13 + rng() * 6 + tone;
      ctx.fillStyle = `hsl(${220 + rng() * 12}, ${12 + rng() * 8}%, ${l}%)`;
      ctx.fillRect(x + 1.5, y + 1.5, bw - 3, bh - 3);
      ctx.fillStyle = `rgba(170,190,235,${0.07 + rng() * 0.06})`; ctx.fillRect(x + 1.5, y + 1.5, bw - 3, 2.2);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + 1.5, y + bh - 4, bw - 3, 2.5);
      if (rng() < 0.12) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 4 + rng() * (bw - 20), y + 4, 10 + rng() * 10, bh - 9); }
      x += bw;
    }
  }
}
function crackAt(ctx, x, y, len, rng) {
  ctx.strokeStyle = 'rgba(4,5,10,0.75)'; ctx.lineCap = 'round';
  const br = (x, y, a, l, w) => {
    if (l < 6) return;
    ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 0; i < 3; i++) { a += (rng() - 0.5) * 0.9; x += Math.cos(a) * l / 3; y += Math.sin(a) * l / 3; ctx.lineTo(x, y); }
    ctx.stroke();
    if (rng() < 0.7) br(x, y, a + (rng() - 0.5) * 1.6, l * 0.6, w * 0.7);
    if (rng() < 0.4) br(x, y, a - (rng() - 0.5) * 1.6, l * 0.5, w * 0.6);
  };
  br(x, y, rng() * TAU, len, 2.2);
}
function stainedGlass(ctx, cx, top, w, h, seed, palette) {
  const bottom = top + h;
  const frame = gothicArch(new Path2D(), cx, top - 10, w + 22, bottom + 9);
  ctx.fillStyle = '#2c3446'; ctx.fill(frame);
  ctx.strokeStyle = '#0a0c12'; ctx.lineWidth = 3; ctx.stroke(frame);
  ctx.fillStyle = 'rgba(160,180,230,0.2)'; ctx.save(); ctx.clip(frame); ctx.fillRect(cx - w, top - 10, 3, h + 20); ctx.restore();
  const p = gothicArch(new Path2D(), cx, top, w, bottom);
  ctx.save(); ctx.clip(p);
  ctx.fillStyle = '#06080e'; ctx.fill(p);
  const r = mulberry32(seed);
  const cols = palette || ['#3260a8', '#9a2a3c', '#b08a34', '#2f8478', '#5e3a9a', '#2450a0'];
  const cell = 12;
  for (let y = top; y < bottom; y += cell) for (let x = cx - w / 2; x < cx + w / 2; x += cell) {
    ctx.fillStyle = cols[Math.floor(r() * cols.length)]; ctx.globalAlpha = 0.6 + r() * 0.4;
    ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
  }
  ctx.globalAlpha = 1;
  // figura central: lua/rosácea
  ctx.fillStyle = 'rgba(245,225,170,0.75)'; ctx.beginPath(); ctx.arc(cx, top + h * 0.36, w * 0.22, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#06080e'; ctx.lineWidth = 2.6;
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ctx.beginPath(); ctx.moveTo(cx, top + h * 0.36); ctx.lineTo(cx + Math.cos(a) * w * 0.22, top + h * 0.36 + Math.sin(a) * w * 0.22); ctx.stroke(); }
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, top + h * 0.5); ctx.lineTo(cx, bottom); ctx.stroke();
  for (let y = top + h * 0.62; y < bottom; y += 24) { ctx.beginPath(); ctx.moveTo(cx - w, y); ctx.lineTo(cx + w, y); ctx.stroke(); }
  ctx.fillStyle = lin(ctx, cx - w / 2, top, cx + w / 2, bottom, [[0, 'rgba(200,220,255,0.35)'], [0.5, 'rgba(255,255,255,0)']]); ctx.fillRect(cx - w, top, w * 2, h);
  ctx.restore();
  glowDot(ctx, cx, top + h * 0.45, w * 1.6, 'rgba(120,150,255,0.25)', 1);
}
function roseWindow(ctx, cx, cy, r) {
  ctx.fillStyle = '#2c3446'; ctx.beginPath(); ctx.arc(cx, cy, r + 15, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#0a0c12'; ctx.lineWidth = 3; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
  const cols = ['#24508a', '#7a2232', '#2c6e66', '#46308a', '#8a6a24'];
  for (let ring = 0; ring < 4; ring++) {
    const n = 8 + ring * 4;
    for (let i = 0; i < n; i++) {
      const a0 = i / n * TAU, a1 = (i + 1) / n * TAU;
      ctx.beginPath(); ctx.arc(cx, cy, r * (ring + 1) / 4, a0, a1); ctx.arc(cx, cy, r * ring / 4, a1, a0, true); ctx.closePath();
      ctx.fillStyle = cols[(i + ring) % cols.length]; ctx.globalAlpha = 0.65 + ((i * 7 + ring) % 4) * 0.09; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = '#05070b'; ctx.lineWidth = 2.2; ctx.stroke();
    }
  }
  // emblema do peixe
  ctx.fillStyle = 'rgba(240,230,190,0.85)';
  ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.2, r * 0.09, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx + r * 0.18, cy); ctx.lineTo(cx + r * 0.3, cy - r * 0.09); ctx.lineTo(cx + r * 0.3, cy + r * 0.09); ctx.fill();
  ctx.fillStyle = lin(ctx, cx - r, cy - r, cx + r, cy + r, [[0, 'rgba(220,240,255,0.3)'], [0.5, 'rgba(255,255,255,0)']]); ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  ctx.restore();
  glowDot(ctx, cx, cy, r * 2.2, 'rgba(110,150,255,0.22)', 1);
}
function wallPillar(ctx, x, top, bottom, w) {
  ctx.fillStyle = lin(ctx, x - w / 2, 0, x + w / 2, 0, [[0, '#171c28'], [0.25, '#3f4860'], [0.5, '#2c3346'], [1, '#11151e']]);
  ctx.fillRect(x - w / 2, top, w, bottom - top);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  for (let i = -1; i <= 1; i++) ctx.fillRect(x + i * w / 4 - 1, top + 22, 2, bottom - top - 50);
  ctx.fillStyle = 'rgba(200,215,255,0.18)'; ctx.fillRect(x - w / 2 + 2, top, 2, bottom - top);
  for (const [yy, ex, hh] of [[top, 7, 12], [bottom - 18, 9, 18]]) {
    ctx.fillStyle = '#414a62'; ctx.fillRect(x - w / 2 - ex, yy, w + ex * 2, hh);
    ctx.fillStyle = '#5c6784'; ctx.fillRect(x - w / 2 - ex, yy, w + ex * 2, 3);
    ctx.fillStyle = '#0c0e14'; ctx.fillRect(x - w / 2 - ex, yy + hh, w + ex * 2, 3);
  }
}
function archMolding(ctx, cx, top, w, bottom) {
  const p = gothicArch(new Path2D(), cx, top, w, bottom);
  ctx.save(); ctx.lineJoin = 'round';
  ctx.strokeStyle = '#0a0c12'; ctx.lineWidth = 15; ctx.stroke(p);
  ctx.strokeStyle = '#353d52'; ctx.lineWidth = 11; ctx.stroke(p);
  ctx.strokeStyle = '#59647f'; ctx.lineWidth = 2; ctx.stroke(p);
  ctx.restore();
}
function statue(ctx, x, y, s) {
  // anjo de pedra com espada
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const st = '#3a4256', stS = '#1d2230';
  part(ctx, polyPath([-16, 0, 16, 0, 12, -10, -12, -10]), st, stS, { w: 1.2 });
  const robe = smoothPath([-9, -10, 9, -10, 7, -48, 4, -58, -4, -58, -7, -48]);
  part(ctx, robe, st, stS, { w: 1.2, lx: 2, ly: 0 });
  const head = new Path2D(); head.arc(0, -63, 5.5, 0, TAU);
  part(ctx, head, st, stS, { w: 1.1, lx: 1.5, ly: -1 });
  for (const sgn of [-1, 1]) {
    const wg = smoothPath([sgn * 4, -54, sgn * 22, -76, sgn * 28, -60, sgn * 22, -46, sgn * 26, -34, sgn * 10, -40]);
    part(ctx, wg, st, stS, { w: 1.1, lx: -sgn * 1.6, ly: -1 });
  }
  part(ctx, polyPath([-1.2, -30, 1.2, -30, 1.2, -2, -1.2, -2]), '#4d566e', stS, { w: 0.9 });
  ctx.restore();
}

function paintNear(ctx, L) {
  const W = L.width * TSZ, H = L.height * TSZ, fy = 14 * TSZ;
  const rng = mulberry32(1337);
  const T = (v) => v * TSZ;
  // base: parede de pedra em todo o nível
  ctx.fillStyle = '#12161f'; ctx.fillRect(0, 0, W, H);
  stoneWall(ctx, 0, 0, W, H, rng);
  // gradiente de iluminação vertical e umidade
  ctx.fillStyle = lin(ctx, 0, 0, 0, H, [[0, 'rgba(5,6,12,0.55)'], [0.4, 'rgba(0,0,0,0)'], [0.85, 'rgba(20,50,40,0.2)'], [1, 'rgba(5,10,10,0.4)']]);
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) crackAt(ctx, rng() * W, 80 + rng() * 320, 30 + rng() * 60, rng);

  // aberturas (vê-se a catedral ao fundo)
  const openings = [];
  const arch = (cx, top, w, bottom = fy) => openings.push(['arch', T(cx), T(top), T(w), bottom]);
  arch(4.5, 4, 3.6); arch(25, 4, 3.6);
  for (const x of [33, 39, 45, 51, 57]) arch(x, 5, 2.8);
  for (const x of [94, 104, 114, 124]) arch(x, 3.6, 5.4);
  arch(144, 6.5, 3.4); arch(160, 6.5, 3.4);
  // parede quebrada na escalada
  const broken = new Path2D();
  broken.moveTo(T(58.6), fy);
  const pts = [[58.6, 9], [59.4, 6], [58.9, 3.4], [60.4, 2.1], [63, 2.6], [65, 2.0], [68.5, 2.4], [70.2, 1.9], [73.5, 2.6], [74.6, 4.2], [74.2, 7.5], [75.2, 11], [75, 14]];
  for (const [x, y] of pts) broken.lineTo(T(x), T(y));
  broken.closePath();

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  for (const o of openings) { ctx.fill(gothicArch(new Path2D(), o[1], o[2], o[3], o[4])); }
  ctx.fill(broken);
  ctx.restore();
  // borda irregular da parede quebrada + tijolos soltos
  ctx.save(); ctx.lineJoin = 'round';
  ctx.strokeStyle = '#0a0c12'; ctx.lineWidth = 7; ctx.stroke(broken);
  ctx.strokeStyle = '#4a546e'; ctx.lineWidth = 2; ctx.stroke(broken);
  ctx.restore();
  for (const o of openings) archMolding(ctx, o[1], o[2], o[3], o[4]);

  // A — capela
  ctx.save();
  const bay = gothicArch(new Path2D(), T(14.5), T(2.6), T(9), fy);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(bay);
  ctx.restore();
  archMolding(ctx, T(14.5), T(2.6), T(9), fy);
  stainedGlass(ctx, T(14.5), T(3.6), T(3.2), T(6), 1);
  wallPillar(ctx, T(9.3), T(2), fy, 34); wallPillar(ctx, T(19.7), T(2), fy, 34);
  // altar com toalha vermelha
  part(ctx, polyPath([T(12), fy, T(17), fy, T(17), fy - 42, T(12), fy - 42]), '#3a4256', '#1e2331', { w: 1.4 });
  part(ctx, polyPath([T(11.8), fy - 42, T(17.2), fy - 42, T(17.2), fy - 48, T(11.8), fy - 48]), '#566079', '#2e3446', { w: 1.2 });
  part(ctx, polyPath([T(13.6), fy - 42, T(15.4), fy - 42, T(15.4), fy - 8, T(14.9), fy - 12, T(14.5), fy - 6, T(14.1), fy - 12, T(13.6), fy - 8]), '#8a1f2c', '#4e0e18', { w: 1 });
  statue(ctx, T(3), fy, 1.0); statue(ctx, T(26.5), fy, 1.0);
  // B — corredor: estátuas e tochas
  // escalada — janela fragmentada
  stainedGlass(ctx, T(66.3), T(3.2), T(1.8), T(3.4), 2);
  // D — galeria: pilares entre arcos
  for (const x of [99, 109, 119]) wallPillar(ctx, T(x), T(3), fy, 30);
  // E — nicho da vela
  ctx.save(); const niche = gothicArch(new Path2D(), T(131), T(5.2), T(5), fy);
  ctx.fillStyle = 'rgba(10,20,40,0.6)'; ctx.fill(niche); ctx.restore();
  archMolding(ctx, T(131), T(5.2), T(5), fy);
  glowDot(ctx, T(130.5), fy - 90, 140, 'rgba(60,150,255,0.3)', 1);
  // F — arena
  roseWindow(ctx, T(152), T(5), T(2.5));
  wallPillar(ctx, T(139.5), T(2), fy, 40); wallPillar(ctx, T(164.5), T(2), fy, 40);
  ctx.fillStyle = 'rgba(30,70,60,0.45)'; ctx.fillRect(T(137), fy - 78, T(30), 78);
  ctx.fillStyle = 'rgba(140,200,180,0.18)'; ctx.fillRect(T(137), fy - 80, T(30), 3);
  for (const x of [148, 156]) {
    ctx.fillStyle = '#07090d'; ctx.beginPath(); ctx.arc(T(x), fy - 30, 18, Math.PI, 0); ctx.lineTo(T(x) + 18, fy); ctx.lineTo(T(x) - 18, fy); ctx.fill();
    ctx.strokeStyle = '#46506a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(T(x), fy - 30, 21, Math.PI, 0); ctx.stroke();
    ctx.strokeStyle = '#1a1e28'; ctx.lineWidth = 2.4;
    for (let i = -12; i <= 12; i += 6) { ctx.beginPath(); ctx.moveTo(T(x) + i, fy - 47); ctx.lineTo(T(x) + i, fy); ctx.stroke(); }
    ctx.fillStyle = 'rgba(90,160,140,0.6)'; ctx.fillRect(T(x) - 4, fy - 12, 8, 12);
  }
  // saída — nicho roxo do selo
  ctx.save(); const sealN = gothicArch(new Path2D(), T(180), T(4.8), T(5.4), fy);
  ctx.fillStyle = 'rgba(30,10,50,0.7)'; ctx.fill(sealN); ctx.restore();
  archMolding(ctx, T(180), T(4.8), T(5.4), fy);
  // poças de luz das velas (quentes)
  ctx.save(); ctx.globalCompositeOperation = 'source-atop';
  for (const c of L.candles) {
    const cy = c.kind === 'stand' ? c.y - 80 : c.y - 16;
    const g = ctx.createRadialGradient(c.x, cy, 0, c.x, cy, 150);
    g.addColorStop(0, 'rgba(255,160,80,0.35)'); g.addColorStop(1, 'rgba(255,160,80,0)');
    ctx.fillStyle = g; ctx.fillRect(c.x - 150, cy - 150, 300, 300);
  }
  ctx.restore();
}

// ---------- blocos sólidos ----------
function paintTiles(ctx, L) {
  const W = L.width, H = L.height, rows = L.rows;
  const at = (x, y) => (x < 0 || x >= W || y < 0 || y >= H) ? '#' : rows[y][x];
  const solid = (c) => c === '#' || c === '=';
  const rng = mulberry32(4242);
  // profundidade (distância até uma borda exposta) para oclusão
  const depth = [];
  for (let y = 0; y < H; y++) { depth.push([]); for (let x = 0; x < W; x++) depth[y].push(solid(at(x, y)) ? 99 : 0); }
  for (let it = 0; it < 6; it++) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (depth[y][x] > 0) {
    const n = Math.min(depth[y]?.[x - 1] ?? 99, depth[y]?.[x + 1] ?? 99, depth[y - 1]?.[x] ?? 99, depth[y + 1]?.[x] ?? 99);
    depth[y][x] = Math.min(depth[y][x], n + 1);
  }
  // máscara sólida
  const mask = new Path2D();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (solid(at(x, y))) mask.rect(x * TSZ, y * TSZ, TSZ, TSZ);
  ctx.save(); ctx.clip(mask);
  ctx.fillStyle = '#1a1f2b'; ctx.fillRect(0, 0, W * TSZ, H * TSZ);
  // alvenaria grande
  const bh = 16;
  for (let yy = 0, row = 0; yy < H * TSZ; yy += bh, row++) {
    let xx = -(row % 2) * 18 - rng() * 8;
    while (xx < W * TSZ) {
      const bw = 26 + rng() * 26;
      const ty = Math.floor((yy + 8) / TSZ), tx = clamp(Math.floor((xx + bw / 2) / TSZ), 0, W - 1);
      const d = depth[ty] ? depth[ty][tx] : 3;
      const floorish = at(tx, ty) === '=';
      const l = (floorish ? 17 : 19) - Math.min(d, 4) * 2.4 + rng() * 4;
      ctx.fillStyle = `hsl(${floorish ? 200 : 222}, ${floorish ? 14 : 13}%, ${l}%)`;
      ctx.fillRect(xx + 1, yy + 1, bw - 2, bh - 2);
      ctx.fillStyle = `rgba(190,205,240,${0.12 - Math.min(d, 4) * 0.025})`; ctx.fillRect(xx + 1, yy + 1, bw - 2, 1.6);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(xx + 1, yy + bh - 3, bw - 2, 2);
      if (rng() < 0.06 && d < 3) { ctx.fillStyle = 'rgba(70,110,70,0.5)'; ctx.fillRect(xx + 3, yy + bh - 5, bw * 0.5, 3); }
      xx += bw;
    }
  }
  for (let i = 0; i < 90; i++) crackAt(ctx, rng() * W * TSZ, rng() * H * TSZ, 14 + rng() * 26, rng);
  ctx.restore();
  // bordas expostas
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = at(x, y), px = x * TSZ, py = y * TSZ;
    if (solid(c)) {
      const up = !solid(at(x, y - 1)), dn = !solid(at(x, y + 1)), lf = !solid(at(x - 1, y)), rt = !solid(at(x + 1, y));
      if (up) {
        if (c === '=') {
          // laje polida do piso
          ctx.fillStyle = lin(ctx, 0, py, 0, py + 12, [[0, '#6f8a96'], [0.25, '#3c5059'], [1, '#26323a']]);
          ctx.fillRect(px, py, TSZ, 12);
          ctx.fillStyle = '#a9c4cf'; ctx.fillRect(px, py, TSZ, 1.6);
          ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(px + TSZ - 1.5, py, 1.5, 12);
          ctx.fillStyle = 'rgba(180,215,230,0.18)'; ctx.fillRect(px + 4, py + 3, 10 + rng() * 10, 1);
        } else {
          ctx.fillStyle = lin(ctx, 0, py, 0, py + 8, [[0, '#7c87a3'], [1, '#384056']]);
          ctx.fillRect(px, py, TSZ, 7);
          ctx.fillStyle = '#b8c3dc'; ctx.fillRect(px, py, TSZ, 1.4);
        }
        // tufos de musgo
        if (rng() < 0.4) {
          for (let k = 0; k < 4; k++) {
            const mx = px + rng() * TSZ, mh = 2 + rng() * 4;
            ctx.fillStyle = rng() < 0.5 ? '#4e7a3c' : '#6d9a4e';
            ctx.beginPath(); ctx.moveTo(mx - 2, py + 1); ctx.lineTo(mx, py - mh); ctx.lineTo(mx + 2, py + 1); ctx.fill();
          }
        }
      }
      if (dn) {
        ctx.fillStyle = lin(ctx, 0, py + TSZ - 12, 0, py + TSZ, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.75)']]);
        ctx.fillRect(px, py + TSZ - 12, TSZ, 12);
        ctx.fillStyle = '#4a5470'; ctx.fillRect(px, py + TSZ - 3, TSZ, 1.4);
        if (rng() < 0.45) {
          // musgo pendurado com gota
          const dx = px + 4 + rng() * 22, dl = 5 + rng() * 12;
          ctx.fillStyle = '#3f6634';
          ctx.beginPath(); ctx.moveTo(dx - 3, py + TSZ); ctx.quadraticCurveTo(dx + 2, py + TSZ + dl * 0.6, dx, py + TSZ + dl); ctx.quadraticCurveTo(dx + 1, py + TSZ + dl * 0.5, dx + 4, py + TSZ); ctx.fill();
          ctx.fillStyle = 'rgba(180,230,240,0.8)'; ctx.beginPath(); ctx.arc(dx, py + TSZ + dl + 1.5, 1.2, 0, TAU); ctx.fill();
        }
      }
      if (lf) { ctx.fillStyle = 'rgba(170,190,235,0.22)'; ctx.fillRect(px, py, 2, TSZ); }
      if (rt) { ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(px + TSZ - 4, py, 4, TSZ); }
    } else if (c === '-') {
      // plataforma de pedra com mísulas
      const sl = polyPath([px, py, px + TSZ, py, px + TSZ, py + 10, px, py + 10]);
      ctx.fillStyle = lin(ctx, 0, py, 0, py + 10, [[0, '#8590ab'], [0.2, '#5a6480'], [1, '#2d3344']]); ctx.fill(sl);
      ctx.fillStyle = '#c4cee6'; ctx.fillRect(px, py, TSZ, 1.4);
      ctx.fillStyle = '#0a0c12'; ctx.fillRect(px, py + 10, TSZ, 1.6);
      if (at(x - 1, y) !== '-') { ctx.fillStyle = '#0a0c12'; ctx.fillRect(px, py, 1.6, 11); }
      if (at(x + 1, y) !== '-') { ctx.fillStyle = '#0a0c12'; ctx.fillRect(px + TSZ - 1.6, py, 1.6, 11); }
      const br = polyPath([px + 9, py + 11, px + 23, py + 11, px + 18, py + 17, px + 16, py + 24, px + 14, py + 17]);
      part(ctx, br, '#3d4559', '#1c2130', { w: 0.9 });
    } else if (c === '^') {
      ctx.fillStyle = '#0b1a1f'; ctx.fillRect(px, py, TSZ, TSZ);
      for (let i = 0; i < 4; i++) {
        const sx = px + 4 + i * 8;
        const sp = polyPath([sx - 3.6, py + 14, sx, py - 18 + rng() * 6, sx + 3.6, py + 14]);
        part(ctx, sp, '#9aa3b8', '#3d4352', { w: 0.9, lx: 1.4, ly: 0 });
      }
    }
  }
}

// ---------- primeiro plano (silhuetas desfocadas) ----------
function paintForeground(ctx, kind) {
  ctx.filter = 'blur(2.5px)';
  if (kind === 0) {
    // coluna escura com correntes (64 x 544)
    ctx.fillStyle = lin(ctx, 0, 0, 64, 0, [[0, 'rgba(3,4,8,0)'], [0.2, '#04050a'], [0.8, '#06070c'], [1, 'rgba(3,4,8,0)']]);
    ctx.fillRect(0, 0, 64, 544);
    ctx.fillStyle = 'rgba(80,100,150,0.25)'; ctx.fillRect(14, 0, 2, 544);
  } else {
    // corrente pendurada (24 x 300)
    ctx.strokeStyle = '#04050a'; ctx.lineWidth = 3;
    for (let i = 0; i < 24; i++) { ctx.beginPath(); ctx.ellipse(12, 6 + i * 12, i % 2 ? 2.2 : 4.4, 6.5, 0, 0, TAU); ctx.stroke(); }
  }
  ctx.filter = 'none';
}
