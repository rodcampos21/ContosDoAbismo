// Utilidades gerais
const TAU = Math.PI * 2;
const VIEW_W = 960, VIEW_H = 544;

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function rand(a, b) { return a + Math.random() * (b - a); }
function randi(a, b) { return Math.floor(rand(a, b + 1)); }
function sign(v) { return v < 0 ? -1 : v > 0 ? 1 : 0; }
function easeOut(t) { return 1 - (1 - t) * (1 - t); }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function approach(v, target, step) {
  if (v < target) return Math.min(v + step, target);
  return Math.max(v - step, target);
}
function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// RNG determinístico (para arte "baked" consistente)
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// IK de dois ossos. bend = +1 / -1 escolhe para que lado a articulação dobra.
function ik(sx, sy, ex, ey, l1, l2, bend) {
  let dx = ex - sx, dy = ey - sy;
  let d = Math.hypot(dx, dy);
  const maxd = l1 + l2 - 0.01;
  if (d > maxd) { ex = sx + dx / d * maxd; ey = sy + dy / d * maxd; d = maxd; }
  if (d < 0.01) d = 0.01;
  const a = Math.atan2(ey - sy, ex - sx);
  const c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const ang = a + bend * Math.acos(c);
  return { jx: sx + Math.cos(ang) * l1, jy: sy + Math.sin(ang) * l1, ex, ey };
}
