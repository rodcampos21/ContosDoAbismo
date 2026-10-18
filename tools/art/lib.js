// Biblioteca de desenho cel-shaded (estilo anime) usada para gerar os sprites do jogo.
const TAU = Math.PI * 2;
const LINE = '#1b1322';
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - (1 - t) * (1 - t);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ik(sx, sy, ex, ey, l1, l2, bend) {
  let dx = ex - sx, dy = ey - sy, d = Math.hypot(dx, dy);
  const maxd = l1 + l2 - 0.01;
  if (d > maxd) { ex = sx + (dx / d) * maxd; ey = sy + (dy / d) * maxd; d = maxd; }
  if (d < 0.01) d = 0.01;
  const a = Math.atan2(ey - sy, ex - sx);
  const c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const ang = a + bend * Math.acos(c);
  return { jx: sx + Math.cos(ang) * l1, jy: sy + Math.sin(ang) * l1, ex, ey };
}

// Cápsula afunilada entre dois pontos
function capsule(ax, ay, ra, bx, by, rb) {
  const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 0.001;
  const a = Math.atan2(dy, dx);
  const off = Math.asin(clamp((ra - rb) / d, -1, 1));
  const p = new Path2D();
  p.arc(ax, ay, ra, a + Math.PI / 2 + off, a - Math.PI / 2 - off);
  p.arc(bx, by, rb, a - Math.PI / 2 - off, a + Math.PI / 2 + off);
  p.closePath();
  return p;
}
// Membro com "barriga" muscular: três pontos de controle
function limbPath(ax, ay, ra, mx, my, rm, bx, by, rb) {
  const p = new Path2D();
  p.addPath(capsule(ax, ay, ra, mx, my, rm));
  p.addPath(capsule(mx, my, rm, bx, by, rb));
  return p;
}
function polyPath(pts, close = true) {
  const p = new Path2D();
  p.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) p.lineTo(pts[i], pts[i + 1]);
  if (close) p.closePath();
  return p;
}
// Caminho suave passando pelos pontos (Catmull-Rom fechado)
function smoothPath(pts, close = true, tension = 0.5) {
  const n = pts.length / 2;
  const P = (i) => { i = close ? (i + n) % n : clamp(i, 0, n - 1); return [pts[i * 2], pts[i * 2 + 1]]; };
  const p = new Path2D();
  const [x0, y0] = P(0);
  p.moveTo(x0, y0);
  const last = close ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const [ax, ay] = P(i - 1), [bx, by] = P(i), [cx, cy] = P(i + 1), [dx, dy] = P(i + 2);
    const t = tension / 3 * 2;
    p.bezierCurveTo(bx + (cx - ax) * t / 2, by + (cy - ay) * t / 2, cx - (dx - bx) * t / 2, cy - (dy - by) * t / 2, cx, cy);
  }
  if (close) p.closePath();
  return p;
}

// Preenchimento cel: sombra dura no lado oposto à luz (lx, ly)
function cel(ctx, path, base, shade, lx = 1.2, ly = -1.2) {
  ctx.save();
  ctx.clip(path);
  ctx.fillStyle = shade; ctx.fill(path);
  ctx.translate(lx, ly);
  ctx.fillStyle = base; ctx.fill(path);
  ctx.restore();
}
// rimLight com 'destination-out' apaga o que está embaixo; usamos uma camada separada
function rim(ctx, path, color, dx, dy) {
  const c = rim.canvas || (rim.canvas = document.createElement('canvas'));
  const W = ctx.canvas.width, H = ctx.canvas.height;
  if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  const x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, W, H);
  x.setTransform(ctx.getTransform());
  x.fillStyle = color; x.fill(path);
  x.globalCompositeOperation = 'destination-out';
  x.fillStyle = '#000';
  x.translate(dx, dy); x.fill(path);
  x.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(c, 0, 0); ctx.restore();
}
function outline(ctx, path, w = 1.1, color = LINE) {
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.lineWidth = w; ctx.strokeStyle = color; ctx.stroke(path);
  ctx.restore();
}
// desenha parte completa: cel + brilho de borda + contorno
function part(ctx, path, base, shade, opts = {}) {
  // contorno por baixo (largura dupla): só a metade externa fica visível, sem linhas internas entre subcaminhos
  outline(ctx, path, (opts.w ?? 1.1) * 2, opts.line ?? LINE);
  cel(ctx, path, base, shade, opts.lx ?? 1.1, opts.ly ?? -1.1);
  if (opts.hi) rim(ctx, path, opts.hi, opts.hx ?? -0.8, opts.hy ?? 0.8);
  if (opts.rimc) rim(ctx, path, opts.rimc, opts.rx ?? 1.0, opts.ry ?? 0);
}
function strokeLine(ctx, pts, w, color, cap = 'round') {
  ctx.save();
  ctx.lineCap = cap; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.lineWidth = w; ctx.strokeStyle = color; ctx.stroke();
  ctx.restore();
}
function curve(ctx, x0, y0, cx, cy, x1, y1, w, color) {
  ctx.save(); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1);
  ctx.lineWidth = w; ctx.strokeStyle = color; ctx.stroke(); ctx.restore();
}
// Traço afinado nas pontas (linha de arte "pincel")
function inkStroke(ctx, x0, y0, cx, cy, x1, y1, w, color) {
  const p = new Path2D();
  const n = 10;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    pts.push([x, y]);
  }
  const L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    const k = Math.sin((i / n) * Math.PI) * w / 2;
    L.push([pts[i][0] - dy / d * k, pts[i][1] + dx / d * k]);
    R.push([pts[i][0] + dy / d * k, pts[i][1] - dx / d * k]);
  }
  p.moveTo(L[0][0], L[0][1]);
  for (const q of L) p.lineTo(q[0], q[1]);
  for (let i = R.length - 1; i >= 0; i--) p.lineTo(R[i][0], R[i][1]);
  p.closePath();
  ctx.fillStyle = color; ctx.fill(p);
}
function glowDot(ctx, x, y, r, color, a = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.restore();
}
function lin(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}
