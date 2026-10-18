// Surubim Guerreiro — guardião da Cisterna Esquecida
const BOSS_SCALE = 1.22;
const FLOOR_Y = 14 * TS;

// ---------- projéteis / perigos do chefe ----------
class Shockwave {
  constructor(x, dir, big) { this.x = x; this.dir = dir; this.t = 0; this.life = 1.7; this.speed = big ? 470 : 400; this.h = big ? 34 : 26; this.dead = false; this.dmg = 14; }
  get box() { return { x: this.x - 16, y: FLOOR_Y - this.h, w: 32, h: this.h }; }
  update(dt) {
    this.t += dt; this.x += this.dir * this.speed * dt;
    if (this.t > this.life || this.x < Level.arena.x0 + 4 || this.x > Level.arena.x1 - 4) this.dead = true;
    if (Math.random() < 0.6) FX.add({ x: this.x + rand(-10, 10), y: FLOOR_Y - rand(0, this.h), vx: rand(-40, 40), vy: rand(-180, -60), life: 0.4, size: rand(2, 3.5), color: pick(['#bfe8f2', '#7fc0d4']), g: 900 });
  }
  draw(ctx) {
    const x = this.x, h = this.h * Math.min(1, this.t * 6) * (this.t > this.life - 0.25 ? (this.life - this.t) / 0.25 : 1);
    ctx.save();
    ctx.translate(x, FLOOR_Y); ctx.scale(this.dir, 1);
    const g = ctx.createLinearGradient(0, -h, 0, 0);
    g.addColorStop(0, 'rgba(220,250,255,0.95)'); g.addColorStop(0.4, 'rgba(110,190,215,0.85)'); g.addColorStop(1, 'rgba(40,90,110,0.6)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-34, 0);
    ctx.quadraticCurveTo(-12, -h * 0.4, 4, -h);
    ctx.quadraticCurveTo(14, -h * 1.05, 18, -h * 0.75);
    ctx.quadraticCurveTo(12, -h * 0.7, 14, -h * 0.4);
    ctx.quadraticCurveTo(18, -h * 0.15, 22, 0);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-6, -h * 0.75); ctx.quadraticCurveTo(6, -h * 1.02, 16, -h * 0.8); ctx.stroke();
    ctx.restore();
  }
}

class Glob {
  constructor(x, y, vx, vy) { this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.t = 0; this.dead = false; this.dmg = 12; }
  get box() { return { x: this.x - 9, y: this.y - 9, w: 18, h: 18 }; }
  update(dt) {
    this.t += dt; this.vy += 1100 * dt; this.x += this.vx * dt; this.y += this.vy * dt;
    if (Math.random() < 0.5) FX.add({ x: this.x, y: this.y, vx: 0, vy: 0, life: 0.3, size: 3, color: 'rgba(120,170,90,0.6)' });
    if (this.y >= FLOOR_Y - 6 || this.x < Level.arena.x0 || this.x > Level.arena.x1) {
      this.dead = true;
      FX.splash(this.x, FLOOR_Y - 4, 10);
      FX.blood(this.x, FLOOR_Y - 4, 6, ['#6a8a3a', '#4a6a2a']);
      Sfx.play('splash');
    }
  }
  draw(ctx) {
    glow(ctx, this.x, this.y, 22, 'rgba(120,200,120,0.5)', 0.6);
    ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(Math.atan2(this.vy, this.vx));
    ctx.beginPath(); ctx.ellipse(0, 0, 11, 8, 0, 0, TAU);
    const g = ctx.createRadialGradient(-3, -3, 1, 0, 0, 11);
    g.addColorStop(0, '#d8f0b0'); g.addColorStop(0.5, '#7aa04a'); g.addColorStop(1, '#3a5a20');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.restore();
  }
}

class Geyser {
  constructor(x, delay) { this.x = x; this.t = -delay; this.warn = 0.95; this.erupt = 0.6; this.dead = false; this.dmg = 16; this.sounded = false; }
  get active() { return this.t > this.warn && this.t < this.warn + this.erupt; }
  get box() { return { x: this.x - 26, y: FLOOR_Y - 330, w: 52, h: 330 }; }
  update(dt) {
    this.t += dt;
    if (this.t > 0 && this.t < this.warn && Math.random() < 0.35) {
      FX.add({ x: this.x + rand(-22, 22), y: FLOOR_Y - 2, vx: 0, vy: rand(-60, -20), life: 0.5, size: rand(2, 4), color: 'rgba(170,230,240,0.8)', shape: 'ring' });
      if (Math.random() < 0.2) Sfx.play('bubble');
    }
    if (this.t > this.warn && !this.sounded) { this.sounded = true; Sfx.play('geyser'); FX.shake(4, 0.2); FX.splash(this.x, FLOOR_Y - 8, 20); }
    if (this.t > this.warn + this.erupt) this.dead = true;
  }
  draw(ctx) {
    if (this.t < 0) return;
    if (this.t < this.warn) {
      const a = 0.4 + Math.sin(this.t * 30) * 0.2;
      ctx.fillStyle = `rgba(140,220,240,${a})`;
      ctx.beginPath(); ctx.ellipse(this.x, FLOOR_Y - 1, 30, 5, 0, 0, TAU); ctx.fill();
      glow(ctx, this.x, FLOOR_Y - 4, 40, 'rgba(120,220,255,0.5)', a);
      return;
    }
    const k = (this.t - this.warn) / this.erupt;
    const h = 330 * Math.min(1, k * 5) * (k > 0.75 ? (1 - k) / 0.25 : 1);
    const w = 44 + Math.sin(this.t * 40) * 4;
    ctx.save();
    const g = ctx.createLinearGradient(this.x - w / 2, 0, this.x + w / 2, 0);
    g.addColorStop(0, 'rgba(80,160,190,0.55)'); g.addColorStop(0.5, 'rgba(225,250,255,0.95)'); g.addColorStop(1, 'rgba(80,160,190,0.55)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(this.x - w / 2 - 8, FLOOR_Y);
    for (let yy = 0; yy <= h; yy += 20) ctx.lineTo(this.x - w / 2 + Math.sin(this.t * 25 + yy * 0.1) * 4, FLOOR_Y - yy);
    ctx.lineTo(this.x, FLOOR_Y - h - 14);
    for (let yy = h; yy >= 0; yy -= 20) ctx.lineTo(this.x + w / 2 + Math.sin(this.t * 25 + yy * 0.12 + 2) * 4, FLOOR_Y - yy);
    ctx.lineTo(this.x + w / 2 + 8, FLOOR_Y);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    if (Math.random() < 0.8) FX.add({ x: this.x + rand(-20, 20), y: FLOOR_Y - h, vx: rand(-120, 120), vy: rand(-200, -50), life: 0.6, size: rand(2, 4), color: '#d8f6ff', g: 900 });
  }
}

class Debris {
  constructor(x, delay) { this.x = x; this.y = 2 * TS; this.t = -delay; this.vy = 0; this.dead = false; this.dmg = 12; this.rot = rand(0, TAU); }
  get box() { return { x: this.x - 13, y: this.y - 13, w: 26, h: 26 }; }
  get falling() { return this.t > 0.6; }
  update(dt) {
    this.t += dt;
    if (this.t < 0) return;
    if (this.t < 0.6) { if (Math.random() < 0.4) FX.add({ x: this.x + rand(-12, 12), y: 2 * TS + 2, vx: 0, vy: rand(40, 120), life: 0.5, size: 2, color: 'rgba(150,150,160,0.8)', g: 400 }); return; }
    this.vy += 1500 * dt; this.y += this.vy * dt; this.rot += dt * 5;
    if (this.y > FLOOR_Y - 12) {
      this.dead = true; Sfx.play('break');
      FX.burst(this.x, FLOOR_Y - 10, 12, { speed: [80, 260], life: [0.3, 0.7], size: [2, 4], colors: ['#5a6070', '#3a4050', '#7a8090'], g: 1000 });
    }
  }
  draw(ctx) {
    if (this.t < 0) return;
    if (!this.falling) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(this.x, FLOOR_Y, 18, 4, 0, 0, TAU); ctx.fill();
      return;
    }
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(this.x, FLOOR_Y, 16, 4, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rot);
    poly(ctx, [-12, -6, -4, -13, 9, -10, 13, 2, 6, 12, -8, 10, -13, 2], '#4a5062', OUT, 2);
    ctx.fillStyle = '#6a7084'; ctx.fillRect(-6, -9, 8, 3);
    ctx.restore();
  }
}

// ---------- o chefe ----------
class Boss {
  constructor() { this.reset(); }
  reset() {
    this.x = 152 * TS + 16; this.y = FLOOR_Y;
    this.state = 'dormant'; this.t = 0; this.anim = 0;
    this.maxHp = 320; this.hp = this.maxHp; this.displayHp = this.hp;
    this.phase = 1; this.facing = -1; this.flash = 0;
    this.walkPhase = 0; this.sink = 1; this.lastAttack = null;
    this.slashCount = 0; this.leapChain = 0; this.quick = false;
    this.roared = false; this.fired = false; this.x0 = 0; this.tx = 0;
    this.deathBursts = 0;
  }
  get active() { return !['dormant', 'dead'].includes(this.state); }
  get vulnerable() { return !['dormant', 'emerge', 'phaseShift', 'dying', 'dead'].includes(this.state); }
  bodyBox() { return { x: this.x - 46, y: this.y - 160, w: 92, h: 160 }; }
  headBox() { return { x: this.facing > 0 ? this.x + 20 : this.x - 98, y: this.y - 182, w: 78, h: 50 }; }
  hurtBoxes() { return [this.bodyBox(), this.headBox()]; }

  set(s) { this.state = s; this.t = 0; this.fired = false; }
  facePlayer(p) { const d = sign(p.cx - this.x); if (d) this.facing = d; }

  start() { this.set('emerge'); this.roared = false; }

  choose(p) {
    const adx = Math.abs(p.cx - this.x);
    const opts = [];
    if (adx < 180) { opts.push(['slash', 4], ['guard', this.phase === 2 ? 1 : 1.6], ['leapWind', 1]); }
    else { opts.push(['walk', 2], ['chargeWind', 2.2], ['leapWind', 2]); }
    if (this.phase === 2) opts.push(['spitWind', 2], ['geyserWind', 2.2]);
    for (const o of opts) if (o[0] === this.lastAttack) o[1] *= 0.25;
    let total = opts.reduce((a, o) => a + o[1], 0), r = Math.random() * total;
    let choice = opts[0][0];
    for (const o of opts) { r -= o[1]; if (r <= 0) { choice = o[0]; break; } }
    this.lastAttack = choice;
    this.slashCount = 0; this.quick = false;
    this.facePlayer(p);
    this.set(choice);
  }

  update(dt, game) {
    this.anim += dt; this.t += dt;
    if (this.flash > 0) this.flash -= dt;
    this.displayHp = approach(this.displayHp, this.hp, dt * 90);
    const p = game.player;
    const adx = Math.abs(p.cx - this.x);
    const fast = this.phase === 2;
    const A = Level.arena;

    switch (this.state) {
      case 'dormant': return;
      case 'emerge': {
        this.sink = 1 - easeOut(clamp((this.t - 0.5) / 1.5, 0, 1));
        if (this.t < 2.1 && Math.random() < 0.6) FX.splash(this.x + rand(-60, 60), FLOOR_Y - 4, 2);
        if (this.t > 0.5 && this.t < 0.56) { Sfx.play('splash'); FX.splash(this.x, FLOOR_Y - 4, 40); }
        if (this.t > 2.1 && !this.roared) {
          this.roared = true; Sfx.play('roar'); FX.shake(10, 1.0);
          game.showBossName();
        }
        this.facePlayer(p);
        if (this.t > 3.6) { this.set('idle'); game.control = true; }
        break;
      }
      case 'idle':
        this.facePlayer(p);
        if (this.t > (fast ? 0.3 : 0.55)) this.choose(p);
        break;
      case 'walk':
        this.facePlayer(p);
        this.x += this.facing * (fast ? 150 : 110) * dt;
        this.walkPhase += dt * 5.5;
        if (Math.floor(this.walkPhase / Math.PI) !== Math.floor((this.walkPhase - dt * 5.5) / Math.PI)) { Sfx.play('land'); FX.shake(2, 0.1); }
        if (adx < 150) { this.lastAttack = 'slash'; this.set(Math.random() < 0.75 ? 'slash' : 'guard'); }
        else if (this.t > 1.6) this.choose(p);
        break;
      case 'slash': {
        const wind = this.quick ? 0.28 : (fast ? 0.45 : 0.62), act = 0.17, rec = fast ? 0.42 : 0.6;
        if (this.t < wind) { this.facePlayer(p); if (this.t < dt * 1.5) Sfx.play('windup'); }
        if (this.t >= wind && !this.fired) { this.fired = true; Sfx.play('swing'); Sfx.play('swing'); }
        if (this.t >= wind && this.t < wind + act) {
          this.x += this.facing * 240 * dt;
          const hb = this.slashBox();
          if (overlap(hb, p.box)) p.damage(20, this.x, game, 320);
          if (this.t - dt < wind + act * 0.6 && this.t >= wind + act * 0.6) { FX.shake(4, 0.15); FX.splash(this.x + this.facing * 140, FLOOR_Y - 4, 8); }
        }
        if (this.t > wind + act + rec) {
          if (fast && this.slashCount === 0) { this.slashCount = 1; this.quick = true; this.facePlayer(p); this.set('slash'); }
          else this.set('idle');
        }
        break;
      }
      case 'guard':
        this.facePlayer(p);
        if (this.t > (fast ? 0.8 : 1.15)) { this.quick = true; this.slashCount = 1; this.set('slash'); }
        break;
      case 'chargeWind':
        this.facePlayer(p);
        if (Math.random() < 0.5) FX.dust(this.x - this.facing * 30, FLOOR_Y, 1);
        if (this.t < dt * 1.5) Sfx.play('windup');
        if (this.t > (fast ? 0.55 : 0.8)) { this.set('charge'); Sfx.play('roar'); }
        break;
      case 'charge': {
        this.x += this.facing * (fast ? 640 : 540) * dt;
        this.walkPhase += dt * 14;
        if (Math.random() < 0.8) FX.dust(this.x - this.facing * 40, FLOOR_Y, 1);
        if (Math.random() < 0.5) FX.splash(this.x - this.facing * 20, FLOOR_Y - 2, 1);
        if (overlap(this.bodyBox(), p.box)) p.damage(18, this.x, game, 420);
        const lim = this.facing > 0 ? A.x1 - 50 : A.x0 + 50;
        if ((this.facing > 0 && this.x >= lim) || (this.facing < 0 && this.x <= lim)) {
          this.x = lim;
          FX.shake(14, 0.5); Sfx.play('slam'); Sfx.play('clang');
          FX.sparks(this.x + this.facing * 60, FLOOR_Y - 90, this.facing > 0 ? Math.PI : 0, 18);
          FX.burst(this.x + this.facing * 60, FLOOR_Y - 100, 14, { speed: [60, 250], life: [0.4, 0.8], size: [2, 4], colors: ['#5a6070', '#3a4050'], g: 900 });
          if (fast) for (let i = 0; i < 4; i++) game.hazards.push(new Debris(clamp(p.cx + (i - 1.5) * 120 + rand(-30, 30), A.x0 + 40, A.x1 - 40), i * 0.15));
          this.set('stun');
        }
        break;
      }
      case 'stun':
        if (this.t > (fast ? 1.15 : 1.6)) this.set('idle');
        break;
      case 'leapWind':
        this.facePlayer(p);
        if (this.t > (fast ? 0.38 : 0.5)) {
          this.x0 = this.x; this.tx = clamp(p.cx, A.x0 + 70, A.x1 - 70);
          this.set('leap'); Sfx.play('jump'); FX.dust(this.x, FLOOR_Y, 10);
        }
        break;
      case 'leap': {
        const dur = 0.85, s = Math.min(1, this.t / dur);
        this.x = lerp(this.x0, this.tx, s);
        this.y = FLOOR_Y - Math.sin(s * Math.PI) * 240;
        if (s > 0.15) this.facing = sign(this.tx - this.x0) || this.facing;
        if (overlap(this.bodyBox(), p.box) && s > 0.75) p.damage(16, this.x, game, 300);
        if (s >= 1) {
          this.y = FLOOR_Y;
          FX.shake(13, 0.45); Sfx.play('slam'); Sfx.play('splash');
          FX.splash(this.x, FLOOR_Y - 4, 36);
          game.hazards.push(new Shockwave(this.x - 50, -1, fast), new Shockwave(this.x + 50, 1, fast));
          if (overlap({ x: this.x - 70, y: FLOOR_Y - 40, w: 140, h: 40 }, p.box)) p.damage(16, this.x, game, 300);
          this.set('leapLand');
        }
        break;
      }
      case 'leapLand':
        if (this.t > (fast ? 0.45 : 0.75)) {
          if (fast && this.leapChain < 1) { this.leapChain++; this.set('leapWind'); }
          else { this.leapChain = 0; this.set('idle'); }
        }
        break;
      case 'spitWind':
        this.facePlayer(p);
        if (this.t > 0.55) this.set('spit');
        break;
      case 'spit':
        if (!this.fired) {
          this.fired = true; Sfx.play('spit');
          const n = 5;
          const mx = this.x + this.facing * 80, my = this.y - 128;
          const dist = Math.abs(p.cx - mx);
          for (let i = 0; i < n; i++) {
            const tFlight = 0.75 + i * 0.12;
            const vx = this.facing * clamp((dist + (i - 2) * 70) / tFlight, 60, 700);
            const vy = (FLOOR_Y - my - 0.5 * 1100 * tFlight * tFlight) / tFlight;
            game.hazards.push(new Glob(mx, my, vx, vy));
          }
        }
        if (this.t > 0.8) this.set('idle');
        break;
      case 'geyserWind':
        if (this.t < dt * 1.5) Sfx.play('windup');
        if (this.t > 0.5) {
          this.set('geyserHold');
          Sfx.play('slam'); FX.shake(6, 0.3);
          const xs = [p.cx, p.cx - 170, p.cx + 170];
          xs.forEach((gx, i) => game.hazards.push(new Geyser(clamp(gx, A.x0 + 40, A.x1 - 40), i * 0.22)));
        }
        break;
      case 'geyserHold':
        if (this.t > 1.5) this.set('idle');
        break;
      case 'phaseShift':
        if (this.t > 0.3 && !this.fired) {
          this.fired = true; Sfx.play('roar'); FX.shake(12, 1.2); FX.flash('#5fd0ff', 0.25);
          game.banner('O Surubim se enfurece!', 2.0);
        }
        if (Math.random() < 0.7) FX.splash(this.x + rand(-80, 80), FLOOR_Y - 4, 2);
        if (this.t > 2.0) { this.phase = 2; this.set('idle'); }
        break;
      case 'dying':
        if (this.t > this.deathBursts * 0.25 && this.t < 2.6) {
          this.deathBursts++;
          FX.blood(this.x + rand(-40, 40), this.y - rand(40, 150), 10);
          FX.sparks(this.x + rand(-40, 40), this.y - rand(40, 150), 0, 6);
          Sfx.play('bossHit');
          FX.shake(5, 0.2);
        }
        if (this.t > 2.6 && !this.fired) {
          this.fired = true;
          Sfx.play('slam'); Sfx.play('splash'); FX.shake(16, 0.8); FX.flash('#ffffff', 0.35);
          FX.splash(this.x, FLOOR_Y - 4, 60);
          FX.burst(this.x, this.y - 80, 50, { speed: [60, 320], life: [0.6, 1.4], size: [2, 5], colors: ['#9fe0ff', '#ffffff', '#6ab0d0'], add: true, g: -40, drag: 1.5 });
        }
        if (this.t > 4.2) { this.set('dead'); game.onBossDefeated(); }
        break;
    }

    if (this.state !== 'leap') this.y = FLOOR_Y;
    this.x = clamp(this.x, A.x0 + 50, A.x1 - 50);

    // dano de contato
    if (this.vulnerable && this.state !== 'charge' && this.state !== 'stun' && !p.dead) {
      if (overlap(this.bodyBox(), p.box)) p.damage(10, this.x, game, 260);
    }
  }

  slashBox() { return { x: this.facing > 0 ? this.x + 10 : this.x - 200, y: this.y - 190, w: 190, h: 190 }; }

  isBlocking(p) { return this.state === 'guard' && sign(p.cx - this.x) === this.facing; }

  takeHit(dmg, game) {
    if (!this.vulnerable) return;
    let crit = this.state === 'stun';
    if (crit) dmg = Math.round(dmg * 1.5);
    this.hp = Math.max(0, this.hp - dmg);
    this.flash = 0.09;
    Sfx.play('bossHit');
    FX.number(this.x + rand(-20, 20), this.y - 190, dmg, crit ? '#ffd84a' : '#ffffff');
    if (this.phase === 1 && this.hp <= this.maxHp / 2 && this.hp > 0) { this.set('phaseShift'); game.hazards = game.hazards.filter(h => h instanceof Shockwave); }
    if (this.hp <= 0) { this.set('dying'); game.onBossDying(); }
  }

  pose() {
    const t = this.t;
    const P = { t: this.anim, phase: this.walkPhase, walking: false, swordA: -2.25 + Math.sin(this.anim * 2) * 0.05, swordFront: false, hand: null, shield: null, crouch: 0, mouth: 0, lean: 0, eyeGlow: 0, dizzy: false, air: false, headTilt: 0 };
    const fast = this.phase === 2;
    const H = (x, y, c = P.crouch) => [x, y + c * 14];
    switch (this.state) {
      case 'walk': P.walking = true; break;
      case 'emerge':
        if (this.t > 2.1 && this.t < 3.4) { P.mouth = 1; P.headTilt = -0.25; P.eyeGlow = 1; P.lean = -6; }
        break;
      case 'slash': {
        const wind = this.quick ? 0.28 : (fast ? 0.45 : 0.62), act = 0.17, rec = fast ? 0.42 : 0.6;
        if (t < wind) {
          const k = easeOut(t / wind);
          P.hand = [lerp(-26, -16, k), lerp(-70, -150, k)]; P.swordA = lerp(-2.25, -1.85, k); P.lean = -4 * k; P.eyeGlow = k;
        } else if (t < wind + act) {
          const k = easeInOut((t - wind) / act);
          P.hand = [lerp(-16, 54, k), lerp(-150, -62, k)]; P.swordA = lerp(-1.85, 0.8, k); P.swordFront = k > 0.3; P.lean = lerp(-4, 12, k);
        } else {
          const k = clamp((t - wind - act) / rec, 0, 1);
          const kk = clamp((k - 0.6) / 0.4, 0, 1);
          P.hand = [lerp(54, -26, kk), lerp(-62, -70, kk)]; P.swordA = lerp(0.8, -2.25, kk); P.swordFront = kk < 0.5; P.lean = lerp(12, 0, k);
        }
        break;
      }
      case 'guard': P.crouch = 0.25; P.shield = { x: 56, y: -82, r: -0.1 }; P.hand = H(-32, -66); break;
      case 'chargeWind': P.crouch = 0.45; P.lean = 8; P.shield = { x: 56, y: -62, r: 0.05 }; P.eyeGlow = 1; P.hand = H(-32, -62); P.walking = true; P.phase = this.anim * 3; break;
      case 'charge': P.lean = 16; P.walking = true; P.shield = { x: 60, y: -68, r: 0.05 }; P.eyeGlow = 1; P.hand = [-30, -64]; break;
      case 'stun': P.crouch = 0.6; P.headTilt = 0.3; P.dizzy = true; P.hand = H(-18, -40); P.swordA = 2.5; P.shield = { x: 30, y: -36, r: 0.45 }; break;
      case 'leapWind': P.crouch = 0.85; P.hand = H(-20, -120); P.swordA = -1.9; break;
      case 'leap': {
        const s = Math.min(1, t / 0.85);
        P.air = true; P.shield = { x: 44, y: -76, r: -0.1 };
        if (s < 0.65) { P.hand = [-6, -160]; P.swordA = -1.6; }
        else { const k = (s - 0.65) / 0.35; P.hand = [lerp(-6, 50, k), lerp(-160, -60, k)]; P.swordA = lerp(-1.6, 1.3, k); P.swordFront = k > 0.3; }
        break;
      }
      case 'leapLand': P.crouch = 0.5; P.hand = H(50, -52); P.swordA = 1.35; P.swordFront = true; break;
      case 'spitWind': { const k = clamp(t / 0.55, 0, 1); P.headTilt = -0.35 * k; P.mouth = 0.25; P.lean = -4 * k; break; }
      case 'spit': P.headTilt = 0.12; P.mouth = t < 0.3 ? 1 : 1 - (t - 0.3) * 2; P.lean = 4; break;
      case 'geyserWind': { const k = clamp(t / 0.5, 0, 1); P.crouch = 0.4 * k; P.hand = H(lerp(-16, 36, k), lerp(-150, -58, k)); P.swordA = lerp(-1.8, 1.5, k); P.swordFront = k > 0.5; break; }
      case 'geyserHold': P.crouch = 0.4; P.hand = H(36, -58); P.swordA = 1.5; P.swordFront = true; P.eyeGlow = 0.7; break;
      case 'phaseShift': P.mouth = t > 0.3 ? 1 : 0; P.headTilt = -0.28; P.eyeGlow = 1; P.lean = -6; break;
      case 'dying': {
        const k = Math.min(1, t / 1.6);
        P.crouch = k; P.headTilt = 0.4 * k; P.hand = H(-18, -40); P.swordA = 2.6; P.eyeGlow = Math.max(0, 1 - t / 2.5); P.shield = { x: 30, y: -40 + k * 14, r: 0.6 * k };
        P.mouth = 0.5;
        break;
      }
    }
    if (!P.hand) P.hand = H(-26, -70);
    return P;
  }

  swordTip(P) {
    const lx = P.hand[0] + Math.cos(P.swordA) * 128, ly = P.hand[1] + Math.sin(P.swordA) * 128;
    return [this.x + this.facing * lx * BOSS_SCALE, this.y + ly * BOSS_SCALE];
  }

  draw(ctx, game) {
    if (this.state === 'dormant' || this.state === 'dead') return;
    const P = this.pose();
    ctx.save();
    let dy = 0;
    if (this.state === 'emerge') dy = this.sink * 220;
    ctx.beginPath(); ctx.rect(this.x - 400, 0, 800, FLOOR_Y + 4); ctx.clip();
    if (this.state === 'dying' && this.t > 2.6) ctx.globalAlpha = Math.max(0, 1 - (this.t - 2.6) / 1.2);
    // sombra
    if (this.state !== 'emerge') {
      const air = (FLOOR_Y - this.y) / 240;
      ctx.fillStyle = `rgba(0,0,0,${0.4 - air * 0.25})`;
      ctx.beginPath(); ctx.ellipse(this.x, FLOOR_Y + 1, 70 * (1 - air * 0.4), 8, 0, 0, TAU); ctx.fill();
    }
    const useFilter = this.flash > 0 && 'filter' in ctx;
    if (useFilter) ctx.filter = 'brightness(2.4) saturate(0.5)';
    else if (this.flash > 0) ctx.globalAlpha *= 0.7;
    drawSurubim(ctx, this.x, this.y + dy, this.facing, P);
    if (useFilter) ctx.filter = 'none';
    ctx.restore();

    // brilho de aviso na ponta da espada
    if (this.state === 'slash') {
      const wind = this.quick ? 0.28 : (this.phase === 2 ? 0.45 : 0.62);
      if (this.t < wind) {
        const [tx, ty] = this.swordTip(P);
        const k = this.t / wind;
        glow(ctx, tx, ty, 30 + k * 20, 'rgba(255,240,200,0.9)', k);
        ctx.save(); ctx.translate(tx, ty); ctx.rotate(this.anim * 6);
        ctx.fillStyle = `rgba(255,255,255,${k})`;
        ctx.fillRect(-14 * k, -1, 28 * k, 2); ctx.fillRect(-1, -14 * k, 2, 28 * k);
        ctx.restore();
      } else if (this.t < wind + 0.24) {
        // rastro do golpe
        const k = (this.t - wind) / 0.24;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.translate(this.x, this.y); ctx.scale(this.facing * BOSS_SCALE, BOSS_SCALE);
        const cx = 0, cy = -100;
        const a1 = lerp(-1.9, 0.9, Math.min(1, k * 1.4));
        ctx.fillStyle = `rgba(200,235,255,${0.55 * (1 - k)})`;
        ctx.beginPath(); ctx.arc(cx, cy, 150, -1.9, a1); ctx.arc(cx, cy, 90, a1, -1.9, true); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
    if (this.state === 'chargeWind' || this.state === 'leapWind' || this.state === 'spitWind' || this.state === 'geyserWind') {
      const hx = this.x + this.facing * 52 * BOSS_SCALE, hy = this.y - 140 * BOSS_SCALE;
      glow(ctx, hx, hy, 50, 'rgba(255,60,40,0.7)', 0.5 + Math.sin(this.anim * 20) * 0.3);
    }
  }
}
