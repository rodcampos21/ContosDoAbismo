// Inimigos menores, urnas e itens
class Bat {
  constructor(x, y) {
    this.kind = 'bat'; this.hx = x; this.hy = y; this.x = x; this.y = y;
    this.hp = 20; this.t = rand(0, 5); this.state = 'hover'; this.st = 0;
    this.vx = 0; this.vy = 0; this.facing = 1; this.flash = 0; this.dead = false;
    this.contact = 8; this.w = 26; this.h = 16;
  }
  get box() { return { x: this.x - 13, y: this.y - 8, w: 26, h: 16 }; }
  update(dt, game) {
    this.t += dt; this.st += dt; if (this.flash > 0) this.flash -= dt;
    const p = game.player;
    const dx = p.cx - this.x, dy = (p.y + 20) - this.y;
    if (this.state === 'hover') {
      this.x = lerp(this.x, this.hx + Math.sin(this.t * 1.3) * 40, dt * 3);
      this.y = lerp(this.y, this.hy + Math.sin(this.t * 2.6) * 14, dt * 3);
      this.facing = sign(dx) || 1;
      if (Math.abs(dx) < 260 && Math.abs(dy) < 220 && this.st > 1.2 && !p.dead) {
        this.state = 'dive'; this.st = 0;
        const d = Math.hypot(dx, dy) || 1;
        this.vx = dx / d * 260; this.vy = dy / d * 260;
      }
    } else if (this.state === 'dive') {
      this.x += this.vx * dt; this.y += this.vy * dt;
      if (this.st > 0.9 || Level.rectSolid(this.x - 6, this.y - 6, 12, 12)) { this.state = 'return'; this.st = 0; }
    } else if (this.state === 'return') {
      this.x = lerp(this.x, this.hx, dt * 2.2); this.y = lerp(this.y, this.hy, dt * 2.2);
      if (this.st > 1.2) { this.state = 'hover'; this.st = 0; }
    }
  }
  hit(dmg, srcX) {
    this.hp -= dmg; this.flash = 0.1;
    this.state = 'return'; this.st = 0;
    this.x += sign(this.x - srcX) * 14;
  }
  draw(ctx) {
    if (this.flash > 0) ctx.globalAlpha = 0.6;
    drawBat(ctx, this.x, this.y, this.facing, this.t);
    ctx.globalAlpha = 1;
  }
}

class Crawler {
  constructor(x, y, min, max) {
    this.kind = 'crawler'; this.x = x; this.y = y; this.min = min; this.max = max;
    this.hp = 24; this.facing = -1; this.t = rand(0, 3); this.flash = 0; this.dead = false;
    this.contact = 9; this.speed = 55; this.pause = 0;
  }
  get box() { return { x: this.x - 14, y: this.y - 16, w: 30, h: 16 }; }
  update(dt, game) {
    this.t += dt; if (this.flash > 0) this.flash -= dt;
    if (this.pause > 0) { this.pause -= dt; return; }
    const p = game.player;
    // acelera quando o jogador está perto
    const near = Math.abs(p.cx - this.x) < 160 && Math.abs(p.feet - this.y) < 40;
    const sp = near ? 95 : this.speed;
    if (near) this.facing = sign(p.cx - this.x) || this.facing;
    this.x += this.facing * sp * dt;
    if (this.x < this.min) { this.x = this.min; this.facing = 1; }
    if (this.x > this.max) { this.x = this.max; this.facing = -1; }
  }
  hit(dmg, srcX) {
    this.hp -= dmg; this.flash = 0.12; this.pause = 0.35;
    this.x = clamp(this.x + sign(this.x - srcX) * 10, this.min, this.max);
  }
  draw(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(this.x, this.y, 16, 3, 0, 0, TAU); ctx.fill();
    if (this.flash > 0) ctx.globalAlpha = 0.6;
    drawCrawler(ctx, this.x, this.y, this.facing, this.t, this.pause > 0 ? 1 : 0);
    ctx.globalAlpha = 1;
  }
}

class Urn {
  constructor(x, y) { this.kind = 'urn'; this.x = x; this.y = y; this.hp = 1; this.dead = false; this.contact = 0; this.t = 0; }
  get box() { return { x: this.x - 12, y: this.y - 30, w: 24, h: 30 }; }
  update(dt) { this.t += dt; }
  hit(dmg) { this.hp = 0; }
  draw(ctx) { drawUrn(ctx, this.x, this.y, this.t); }
}

class HealOrb {
  constructor(x, y, amount = 25) { this.x = x; this.y = y; this.vy = -260; this.amount = amount; this.t = 0; this.dead = false; this.grounded = false; }
  update(dt, game) {
    this.t += dt;
    if (!this.grounded) {
      this.vy += 1200 * dt; this.y += this.vy * dt;
      const ty = Math.floor((this.y + 10) / TS);
      const tx = Math.floor(this.x / TS);
      const t = Level.tile(tx, ty);
      if (this.vy > 0 && (t === T_STONE || t === T_FLOOR || t === T_PLAT)) { this.y = ty * TS - 16; this.grounded = true; }
    }
    const p = game.player;
    if (!p.dead && overlap({ x: this.x - 10, y: this.y - 10, w: 20, h: 20 }, p.box)) {
      this.dead = true;
      p.heal(this.amount);
      Sfx.play('heal');
      FX.burst(this.x, this.y, 14, { speed: [40, 160], life: [0.3, 0.6], size: [2, 4], colors: ['#ff8aa0', '#ffd0dc'], add: true });
    }
  }
  draw(ctx) { drawHealOrb(ctx, this.x, this.y, this.t); }
}

function spawnEntities() {
  const list = [];
  for (const s of Level.spawns) {
    if (s.type === 'bat') list.push(new Bat(s.x, s.y));
    else if (s.type === 'crawler') list.push(new Crawler(s.x, s.y, s.min, s.max));
    else if (s.type === 'urn') list.push(new Urn(s.x, s.y));
  }
  return list;
}
