// Partículas, números de dano e efeitos de tela
const FX = {
  parts: [], nums: [], shakeT: 0, shakeMag: 0, flashT: 0, flashCol: '#fff',
  reset() { this.parts = []; this.nums = []; this.shakeT = 0; },
  shake(mag, t = 0.3) { this.shakeMag = Math.max(this.shakeMag * (this.shakeT > 0 ? 1 : 0), mag); this.shakeT = Math.max(this.shakeT, t); },
  flash(col = '#fff', t = 0.15) { this.flashCol = col; this.flashT = t; },
  add(p) {
    p.life = p.life || 0.5; p.max = p.life; p.g = p.g ?? 0; p.size = p.size || 3;
    p.drag = p.drag ?? 0; p.add = p.add || false; p.shape = p.shape || 'dot';
    this.parts.push(p);
  },
  burst(x, y, n, opts) {
    for (let i = 0; i < n; i++) {
      const a = opts.angle !== undefined ? opts.angle + rand(-opts.spread, opts.spread) : rand(0, TAU);
      const sp = rand(opts.speed[0], opts.speed[1]);
      this.add({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(opts.life[0], opts.life[1]),
        size: rand(opts.size[0], opts.size[1]), color: pick(opts.colors), g: opts.g || 0, drag: opts.drag || 0,
        add: opts.add, shape: opts.shape,
      });
    }
  },
  sparks(x, y, dir = 0, n = 10) {
    this.burst(x, y, n, { angle: dir, spread: dir === 0 ? Math.PI : 0.9, speed: [120, 380], life: [0.15, 0.4], size: [1.5, 3], colors: ['#fff6d0', '#ffd27a', '#ffffff'], g: 600, add: true, shape: 'line' });
  },
  blood(x, y, n = 8, col = ['#3a4a1a', '#55682a', '#2a3a10']) {
    this.burst(x, y, n, { speed: [60, 240], life: [0.3, 0.7], size: [2, 4], colors: col, g: 900 });
  },
  dust(x, y, n = 6) {
    this.burst(x, y, n, { angle: -Math.PI / 2, spread: 1.4, speed: [20, 90], life: [0.3, 0.6], size: [3, 6], colors: ['rgba(140,150,170,0.5)', 'rgba(100,110,130,0.5)'], g: -20, drag: 2 });
  },
  splash(x, y, n = 16) {
    this.burst(x, y, n, { angle: -Math.PI / 2, spread: 1.0, speed: [150, 420], life: [0.4, 0.9], size: [2, 4.5], colors: ['#8fd0e0', '#5fa8c0', '#c8f0ff'], g: 1100 });
  },
  number(x, y, val, col = '#fff') { this.nums.push({ x, y, val, col, life: 0.8, vy: -60 }); },
  update(dt) {
    for (const p of this.parts) {
      p.life -= dt;
      p.vy += p.g * dt;
      if (p.drag) { p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt; }
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
    this.parts = this.parts.filter(p => p.life > 0);
    for (const n of this.nums) { n.life -= dt; n.y += n.vy * dt; n.vy *= 1 - 3 * dt; }
    this.nums = this.nums.filter(n => n.life > 0);
    if (this.shakeT > 0) { this.shakeT -= dt; if (this.shakeT <= 0) this.shakeMag = 0; }
    if (this.flashT > 0) this.flashT -= dt;
  },
  draw(ctx) {
    for (const p of this.parts) {
      const a = clamp(p.life / p.max, 0, 1);
      ctx.globalAlpha = a;
      if (p.add) ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = p.color; ctx.strokeStyle = p.color;
      if (p.shape === 'line') {
        ctx.lineWidth = p.size; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); ctx.stroke();
      } else if (p.shape === 'ring') {
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1.5 - a), 0, TAU); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.5 + a * 0.5), 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    for (const n of this.nums) {
      ctx.globalAlpha = clamp(n.life / 0.3, 0, 1);
      ctx.font = '700 16px Cinzel, serif';
      ctx.lineWidth = 3; ctx.strokeStyle = '#000';
      ctx.strokeText(n.val, n.x, n.y);
      ctx.fillStyle = n.col; ctx.fillText(n.val, n.x, n.y);
    }
    ctx.globalAlpha = 1;
  },
};
