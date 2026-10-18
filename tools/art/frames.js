// Catálogo de tudo que é renderizado para o jogo.
// Cada item: { atlas, name, index, x0, y0, w, h, scale, draw(ctx) }  (x0,y0 = canto sup. esq. em unidades; origem = âncora)
const ITEMS = [];
function add(atlas, name, index, box, scale, draw) {
  ITEMS.push({ atlas, name, index, x0: box[0], y0: box[1], w: box[2], h: box[3], scale, draw });
}

// ---------- Rain ----------
const RBOX = [-95, -125, 215, 140];
const RS = 2;
const rainAnim = (name, n, fn) => { for (let i = 0; i < n; i++) add('rain', name, i, RBOX, RS, (ctx) => drawRain(ctx, fn(i, n))); };
rainAnim('idle', 8, (i, n) => ({ state: 'idle', t: i / n * TAU }));
rainAnim('walk', 8, (i, n) => ({ state: 'walk', phase: i / n * TAU, t: i * 0.3, vx: 150 }));
rainAnim('run', 8, (i, n) => ({ state: 'run', phase: i / n * TAU, t: i * 0.3, vx: 300 }));
rainAnim('jump', 2, (i) => ({ state: 'jump', t: i * 1.5, vx: 120 }));
rainAnim('fall', 2, (i) => ({ state: 'fall', t: i * 1.5, vx: 120 }));
rainAnim('crouch', 1, () => ({ state: 'crouch', crouchK: 1 }));
rainAnim('crouchwalk', 6, (i, n) => ({ state: 'crouch', crouchK: 1, crouchWalk: true, phase: i / n * TAU, vx: 90 }));
rainAnim('atk0', 8, (i, n) => ({ state: 'idle', attack: { s: (i + 0.5) / n, kind: 0 } }));
rainAnim('atk1', 8, (i, n) => ({ state: 'idle', attack: { s: (i + 0.5) / n, kind: 1 } }));
rainAnim('atkc', 8, (i, n) => ({ state: 'crouch', crouchK: 1, attack: { s: (i + 0.5) / n, kind: 2 } }));
rainAnim('atkj', 8, (i, n) => ({ state: 'jump', attack: { s: (i + 0.5) / n, kind: 0 } }));
rainAnim('hurt', 1, () => ({ state: 'hurt', t: 0.5 }));
for (let i = 0; i < 6; i++) add('rain', 'dead', i, RBOX, RS, (ctx) => {
  const r = Math.min(1, i / 4);
  ctx.translate(-r * 24, 0); ctx.rotate(-r * Math.PI / 2 * 0.97);
  drawRain(ctx, { state: i < 2 ? 'hurt' : 'fall', t: 0 });
});

// ---------- Surubim ----------
const BBOX = [-215, -265, 470, 290];
const BS = 1.4, BK = 1.22;
const BASEP = (o = {}) => Object.assign({ t: 0, phase: 0, walking: false, swordA: -2.25, swordFront: false, hand: null, shield: null, crouch: 0, mouth: 0, lean: 0, eyeGlow: 0, dizzy: false, air: false, headTilt: 0 }, o);
const H = (x, y, c = 0) => [x, y + c * 14];
const bossAnim = (name, n, fn) => { for (let i = 0; i < n; i++) add('boss', name, i, BBOX, BS, (ctx) => { ctx.scale(BK, BK); drawSurubim(ctx, fn(i, n)); }); };
bossAnim('idle', 8, (i, n) => BASEP({ t: i / n * Math.PI, swordA: -2.25 + Math.sin(i / n * TAU) * 0.05 }));
bossAnim('walk', 8, (i, n) => BASEP({ t: i * 0.4, walking: true, phase: i / n * TAU }));
bossAnim('slashW', 6, (i, n) => { const k = easeOut((i + 1) / n); return BASEP({ t: i * 0.2, hand: [lerp(-26, -16, k), lerp(-70, -150, k)], swordA: lerp(-2.25, -1.85, k), lean: -4 * k, eyeGlow: k }); });
bossAnim('slashA', 4, (i, n) => { const k = easeInOut((i + 0.5) / n); return BASEP({ t: 1, hand: [lerp(-16, 54, k), lerp(-150, -62, k)], swordA: lerp(-1.85, 0.8, k), swordFront: k > 0.3, lean: lerp(-4, 12, k), mouth: 0.6, eyeGlow: 1 }); });
bossAnim('slashR', 6, (i, n) => { const k = (i + 0.5) / n; const kk = clamp((k - 0.5) / 0.5, 0, 1); return BASEP({ t: 1 + i * 0.2, hand: [lerp(54, -26, kk), lerp(-62, -70, kk)], swordA: lerp(0.8, -2.25, kk), swordFront: kk < 0.5, lean: lerp(12, 0, k) }); });
bossAnim('guard', 2, (i) => BASEP({ t: i * 1.4, crouch: 0.25, shield: { x: 56, y: -82, r: -0.1 }, hand: H(-32, -66, 0.25) }));
bossAnim('chargeW', 4, (i, n) => BASEP({ t: i * 0.3, crouch: 0.45, lean: 8, shield: { x: 56, y: -62, r: 0.05 }, eyeGlow: 1, hand: H(-32, -62, 0.45), walking: true, phase: i / n * TAU * 0.5 }));
bossAnim('charge', 6, (i, n) => BASEP({ t: i * 0.3, lean: 16, walking: true, phase: i / n * TAU, shield: { x: 60, y: -68, r: 0.05 }, eyeGlow: 1, hand: [-30, -64] }));
bossAnim('stun', 6, (i, n) => BASEP({ t: i / n * (TAU / 4), crouch: 0.6, headTilt: 0.3, dizzy: true, hand: H(-18, -40, 0.6), swordA: 2.5, shield: { x: 30, y: -36, r: 0.45 } }));
bossAnim('leapW', 1, () => BASEP({ crouch: 0.85, hand: H(-20, -120, 0.85), swordA: -1.9, eyeGlow: 1 }));
bossAnim('leap', 4, (i, n) => { const s = (i + 0.5) / n; const P = BASEP({ t: i * 0.3, air: true, shield: { x: 44, y: -76, r: -0.1 } }); if (s < 0.65) { P.hand = [-6, -160]; P.swordA = -1.6; } else { const k = (s - 0.65) / 0.35; P.hand = [lerp(-6, 50, k), lerp(-160, -60, k)]; P.swordA = lerp(-1.6, 1.3, k); P.swordFront = k > 0.3; } return P; });
bossAnim('leapL', 1, () => BASEP({ crouch: 0.5, hand: H(50, -52, 0.5), swordA: 1.35, swordFront: true, mouth: 0.4 }));
bossAnim('spitW', 3, (i, n) => { const k = (i + 1) / n; return BASEP({ headTilt: -0.35 * k, mouth: 0.25, lean: -4 * k, t: i * 0.3 }); });
bossAnim('spit', 3, (i, n) => BASEP({ headTilt: 0.12, mouth: 1 - i * 0.3, lean: 4, t: i * 0.3 }));
bossAnim('geyW', 4, (i, n) => { const k = (i + 1) / n; return BASEP({ crouch: 0.4 * k, hand: H(lerp(-16, 36, k), lerp(-150, -58, k), 0.4 * k), swordA: lerp(-1.8, 1.5, k), swordFront: k > 0.5 }); });
bossAnim('geyH', 2, (i) => BASEP({ t: i, crouch: 0.4, hand: H(36, -58, 0.4), swordA: 1.5, swordFront: true, eyeGlow: 0.7 }));
bossAnim('roar', 2, (i) => BASEP({ t: i * 0.7, mouth: 1, headTilt: -0.28 + i * 0.03, eyeGlow: 1, lean: -6 }));
bossAnim('dying', 6, (i, n) => { const k = i / (n - 1); return BASEP({ crouch: k, headTilt: 0.4 * k, hand: H(-18, -40, k), swordA: 2.6, eyeGlow: 1 - k, shield: { x: 30, y: -40 + k * 14, r: 0.6 * k }, mouth: 0.5 }); });

// ---------- inimigos ----------
for (let i = 0; i < 6; i++) add('obj', 'bat', i, [-40, -30, 80, 50], 2, (ctx) => drawBatArt(ctx, i / 6));
for (let i = 0; i < 6; i++) add('obj', 'crawler', i, [-40, -26, 66, 30], 2, (ctx) => drawCrawlerArt(ctx, i / 6, 0));
add('obj', 'crawler_hit', 0, [-40, -26, 66, 30], 2, (ctx) => drawCrawlerArt(ctx, 0, 1));
add('obj', 'urn', 0, [-18, -40, 36, 42], 2, drawUrnArt);
add('obj', 'healorb', 0, [-24, -24, 48, 48], 2, drawHealOrbArt);
// ---------- objetos ----------
add('obj', 'candelabra', 0, [-26, -90, 52, 92], 2, drawCandelabraArt);
add('obj', 'sconce', 0, [-12, -16, 24, 30], 2, drawSconceArt);
for (let i = 0; i < 6; i++) add('obj', 'flame', i, [-14, -30, 28, 34], 2, (ctx) => drawFlameArt(ctx, i / 6, false));
for (let i = 0; i < 6; i++) add('obj', 'flame_cold', i, [-14, -30, 28, 34], 2, (ctx) => drawFlameArt(ctx, i / 6, true));
add('obj', 'checkpoint', 0, [-32, -100, 64, 102], 2, drawCheckpointArt);
add('obj', 'sign', 0, [-18, -48, 36, 50], 2, drawSignArt);
add('obj', 'rune', 0, [-14, -44, 28, 40], 2, drawRuneGlowArt);
add('obj', 'gate', 0, [0, 0, 40, 400], 1.5, (ctx) => drawGateArt(ctx, 384));
add('obj', 'seal0', 0, [-64, -64, 128, 128], 2, (ctx) => drawSealArt(ctx, 0));
add('obj', 'seal1', 0, [-64, -64, 128, 128], 2, (ctx) => drawSealArt(ctx, 1));
add('obj', 'fg_pillar', 0, [0, 0, 64, 544], 1, (ctx) => paintForeground(ctx, 0));
add('obj', 'fg_chain', 0, [0, 0, 24, 300], 1, (ctx) => paintForeground(ctx, 1));
// ---------- efeitos ----------
add('fx', 'glow', 0, [-32, -32, 64, 64], 2, fxGlow);
add('fx', 'dot', 0, [-4, -4, 8, 8], 2, fxDot);
add('fx', 'spark', 0, [-10, -2, 20, 4], 2, fxSpark);
add('fx', 'ring', 0, [-8, -8, 16, 16], 2, fxRing);
add('fx', 'pixel', 0, [-2, -2, 4, 4], 1, fxPixel);
add('fx', 'hitstar', 0, [-17, -17, 34, 34], 2, fxHitStar);
for (let i = 0; i < 4; i++) add('fx', 'shock', i, [-40, -40, 66, 44], 2, (ctx) => fxShock(ctx, i / 4));
add('fx', 'glob', 0, [-18, -18, 36, 36], 2, fxGlob);
add('fx', 'debris', 0, [-16, -16, 32, 32], 2, fxDebris);
for (let i = 0; i < 4; i++) add('fx', 'geyser', i, [0, 0, 64, 160], 1.5, (ctx) => fxGeyser(ctx, i / 4));
for (let i = 0; i < 4; i++) add('fx', 'splash', i, [-45, -40, 90, 44], 2, (ctx) => fxSplashCrown(ctx, i / 4));
add('fx', 'water', 0, [0, 0, 256, 24], 2, fxWater);
// ---------- interface ----------
add('ui', 'panel', 0, [0, 0, 64, 64], 2, uiPanel);
add('ui', 'diamond', 0, [-6, -7, 12, 14], 2, uiDiamond);
add('ui', 'ringframe', 0, [-32, -32, 64, 64], 2, uiRingFrame);
add('ui', 'portrait', 0, [-24, -24, 48, 48], 3, (ctx) => {
  const c = new Path2D(); c.arc(0, 0, 23.5, 0, TAU);
  ctx.fillStyle = lin(ctx, 0, -24, 0, 24, [[0, '#2c3a5c'], [1, '#0b0f1c']]); ctx.fill(c);
  ctx.save(); ctx.clip(c); ctx.translate(-2, 104); ctx.scale(1.25, 1.25); drawRainBust(ctx); ctx.restore();
});
add('ui', 'logo', 0, [-470, -95, 940, 160], 2, drawLogo);
add('ui', 'bossname', 0, [-470, -80, 940, 110], 2, drawBossName);

// ---------- API do renderizador ----------
window.listItems = () => ITEMS.map((it, i) => ({ i, atlas: it.atlas, name: it.name, index: it.index, x0: it.x0, y0: it.y0, w: it.w, h: it.h, scale: it.scale }));
window.renderItem = (i) => {
  const it = ITEMS[i];
  const c = document.createElement('canvas');
  c.width = Math.ceil(it.w * it.scale); c.height = Math.ceil(it.h * it.scale);
  const ctx = c.getContext('2d');
  ctx.scale(it.scale, it.scale);
  ctx.translate(-it.x0, -it.y0);
  rim.canvas = null;
  it.draw(ctx);
  return c.toDataURL('image/png');
};
window.renderLayer = (kind, L, scale) => {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w * scale); c.height = Math.ceil(h * scale); const x = c.getContext('2d'); x.scale(scale, scale); return [c, x]; };
  let c, x;
  if (kind === 'near') { [c, x] = mk(L.width * 32, L.height * 32); paintNear(x, L); }
  else if (kind === 'tiles') { [c, x] = mk(L.width * 32, L.height * 32); paintTiles(x, L); }
  else if (kind === 'far_nave') { [c, x] = mk(1024, 544); paintFarNave(x, 1024, 544); }
  else if (kind === 'far_cistern') { [c, x] = mk(1024, 544); paintFarCistern(x, 1024, 544); }
  else if (kind === 'mid') { [c, x] = mk(1024, 544); paintMid(x, 1024, 544); }
  else if (kind === 'title') { [c, x] = mk(960, 544); paintTitle(x); }
  window._layer = c;
  return [c.width, c.height];
};
window.layerSlice = (sx, sw, type) => {
  const src = window._layer;
  const c = document.createElement('canvas'); c.width = sw; c.height = src.height;
  c.getContext('2d').drawImage(src, -sx, 0);
  return type === 'jpg' ? c.toDataURL('image/jpeg', 0.88) : c.toDataURL('image/png');
};

// ---------- arte de título ----------
function paintTitle(ctx) {
  paintFarNave(ctx, 960, 544);
  // janela gigante com lua
  const win = gothicArch(new Path2D(), 640, 30, 300, 560);
  ctx.save(); ctx.clip(win);
  ctx.fillStyle = lin(ctx, 0, 30, 0, 544, [[0, '#2a4a8a'], [0.6, '#16264a'], [1, '#0c1428']]); ctx.fill(win);
  glowDot(ctx, 650, 190, 230, 'rgba(170,200,255,0.55)', 1);
  const moon = new Path2D(); moon.arc(650, 190, 72, 0, TAU);
  ctx.fillStyle = lin(ctx, 600, 130, 700, 260, [[0, '#ffffff'], [1, '#c9d6f2']]); ctx.fill(moon);
  ctx.fillStyle = 'rgba(150,170,210,0.35)';
  for (const [x, y, r] of [[625, 170, 14], [680, 215, 10], [660, 160, 7], [630, 225, 6]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  // nuvens
  ctx.filter = 'blur(4px)'; ctx.fillStyle = 'rgba(20,30,60,0.8)';
  for (const [x, y, w] of [[560, 260, 160], [720, 290, 200], [600, 120, 120]]) { ctx.beginPath(); ctx.ellipse(x, y, w / 2, 14, 0, 0, TAU); ctx.fill(); }
  ctx.filter = 'none';
  ctx.strokeStyle = '#05070d'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(640, 30); ctx.lineTo(640, 560); ctx.moveTo(490, 330); ctx.lineTo(790, 330); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(640, 210, 120, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  ctx.restore();
  archMolding(ctx, 640, 30, 300, 560);
  // feixe de luar
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(12px)';
  ctx.fillStyle = lin(ctx, 600, 100, 400, 544, [[0, 'rgba(150,180,255,0.35)'], [1, 'rgba(150,180,255,0)']]);
  ctx.beginPath(); ctx.moveTo(520, 100); ctx.lineTo(760, 100); ctx.lineTo(560, 544); ctx.lineTo(160, 544); ctx.closePath(); ctx.fill();
  ctx.restore();
  // água escura com olhos vermelhos
  ctx.fillStyle = lin(ctx, 0, 440, 0, 544, [[0, '#0b1f28'], [1, '#03080c']]); ctx.fillRect(0, 445, 960, 100);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(150,200,255,${0.06 + (i % 5) * 0.03})`; ctx.fillRect((i * 97) % 960, 452 + (i * 37) % 80, 14 + (i % 4) * 8, 1.2); }
  ctx.restore();
  for (const [x, y] of [[808, 470], [836, 468]]) { glowDot(ctx, x, y, 16, 'rgba(255,50,30,0.9)', 1); ctx.fillStyle = '#ff5a3c'; ctx.beginPath(); ctx.ellipse(x, y, 4.5, 2.4, 0, 0, TAU); ctx.fill(); }
  // Rain heroico
  ctx.save(); ctx.translate(215, 540); ctx.scale(3.3, 3.3);
  drawRain(ctx, { state: 'idle', t: 0.6, vx: -40 });
  ctx.restore();
  // vinheta
  const v = ctx.createRadialGradient(480, 272, 160, 480, 272, 620);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,6,0.8)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, 960, 544);
}

// ---------- fontes bitmap (formato BMFont texto) ----------
const FONT_CHARS = (() => {
  let s = '';
  for (let c = 32; c < 127; c++) s += String.fromCharCode(c);
  return s + 'ÁÀÂÃÉÊÍÓÔÕÚÜÇáàâãéêíóôõúüç←→↑↓✦·—…ºª°×';
})();
window.bakeFont = (name, css, sizePx, stroke, color, pageW) => {
  const pad = Math.ceil(stroke) + 2;
  const mc = document.createElement('canvas').getContext('2d');
  mc.font = css;
  const fm = mc.measureText('ÁgjÇ|');
  const ascent = Math.ceil(fm.fontBoundingBoxAscent), descent = Math.ceil(fm.fontBoundingBoxDescent);
  const lineH = ascent + descent;
  const cellH = lineH + pad * 2;
  const glyphs = [];
  let x = 0, y = 0;
  for (const ch of FONT_CHARS) {
    const adv = mc.measureText(ch).width;
    const m = mc.measureText(ch);
    const left = Math.floor(-m.actualBoundingBoxLeft) - pad;
    const gw = Math.ceil(m.actualBoundingBoxRight + m.actualBoundingBoxLeft) + pad * 2;
    const w = Math.max(1, gw);
    if (x + w > pageW) { x = 0; y += cellH + 1; }
    glyphs.push({ ch, x, y, w, h: cellH, xoff: left, yoff: -pad, adv: Math.round(adv) });
    x += w + 1;
  }
  const pageH = Math.pow(2, Math.ceil(Math.log2(y + cellH + 2)));
  const c = document.createElement('canvas'); c.width = pageW; c.height = pageH;
  const ctx = c.getContext('2d');
  ctx.font = css; ctx.textBaseline = 'alphabetic';
  for (const g of glyphs) {
    const ox = g.x - g.xoff, oy = g.y + pad + ascent;
    if (stroke > 0) { ctx.lineJoin = 'round'; ctx.lineWidth = stroke * 2; ctx.strokeStyle = 'rgba(0,0,0,0.92)'; ctx.strokeText(g.ch, ox, oy); }
    ctx.fillStyle = color; ctx.fillText(g.ch, ox, oy);
  }
  let fnt = `info face="${name}" size=${sizePx} bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=1 aa=1 padding=0,0,0,0 spacing=1,1\n`;
  fnt += `common lineHeight=${lineH} base=${ascent} scaleW=${pageW} scaleH=${pageH} pages=1 packed=0\n`;
  fnt += `page id=0 file="${name}.png"\nchars count=${glyphs.length}\n`;
  for (const g of glyphs) fnt += `char id=${g.ch.codePointAt(0)} x=${g.x} y=${g.y} width=${g.w} height=${g.h} xoffset=${g.xoff} yoffset=${g.yoff} xadvance=${g.adv} page=0 chnl=15\n`;
  return { fnt, png: c.toDataURL('image/png') };
};
