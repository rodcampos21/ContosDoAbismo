// Loop principal e orquestração do jogo
const AREAS = [
  [0, 30, 'Capela do Despertar'],
  [30, 58, 'Corredor dos Saltos'],
  [58, 76, 'Poço das Plataformas'],
  [76, 89, 'Fenda Estreita'],
  [89, 128, 'Galeria das Urnas'],
  [128, 137, 'Vela de Repouso'],
  [137, 167, 'Cisterna Esquecida'],
  [167, 188, 'Selo do Abismo'],
];

const Game = {
  state: 'title', time: 0, elapsed: 0, deaths: 0, kills: 0,
  cam: { x: 0, y: 0 }, control: true, hitstop: 0, fade: 0,
  bossFight: false, bossDefeated: false, activeSign: null, area: -1,
  hazards: [], pickups: [], entities: [],

  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    Level.build();
    this.resize();
    addEventListener('resize', () => this.resize());
    const bake = clamp(Math.ceil(this.pixelScale * 2) / 2, 1, 2);
    Level.bake(bake);
    this.makeVignette();
    this.player = new Player();
    this.boss = new Boss();
    this.entities = spawnEntities();
    Input.init();
    this.fgPillars = [300, 1150, 4950].map(c => 480 + 1.3 * c);
    this.last = performance.now();
    this.acc = 0;
    requestAnimationFrame((t) => this.frame(t));
  },

  resize() {
    const s = Math.min(innerWidth / VIEW_W, innerHeight / VIEW_H);
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = Math.floor(VIEW_W * s) + 'px';
    this.canvas.style.height = Math.floor(VIEW_H * s) + 'px';
    this.canvas.width = Math.round(VIEW_W * s * dpr);
    this.canvas.height = Math.round(VIEW_H * s * dpr);
    this.pixelScale = this.canvas.width / VIEW_W;
  },

  makeVignette() {
    const c = document.createElement('canvas');
    c.width = VIEW_W; c.height = VIEW_H;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.35, VIEW_W / 2, VIEW_H / 2, VIEW_W * 0.68);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,8,0.72)');
    x.fillStyle = g; x.fillRect(0, 0, VIEW_W, VIEW_H);
    this.vignette = c;
  },

  newGame() {
    this.player.reset(Level.start.x, Level.start.y);
    this.boss.reset();
    this.entities = spawnEntities();
    this.hazards = []; this.pickups = [];
    Level.checkpoint.lit = false;
    Level.gates[0].closed = false; Level.gates[0].vis = 0;
    Level.gates[1].closed = true; Level.gates[1].vis = 1;
    Level.applyGates();
    this.bossFight = false; this.bossDefeated = false;
    this.elapsed = 0; this.deaths = 0; this.kills = 0;
    this.control = true; this.area = -1;
    this.cam.x = 0;
    FX.reset();
    HUD.hpTrail = 100;
    this.state = 'play';
    this.fade = 1;
    Music.play('ambient');
  },

  respawn() {
    const cp = Level.checkpoint;
    const pos = cp.lit ? { x: cp.x + 40, y: cp.y } : Level.start;
    this.player.reset(pos.x, pos.y);
    if (!this.bossDefeated) {
      this.boss.reset();
      this.bossFight = false;
      Level.setGate(0, false);
    }
    this.entities = spawnEntities();
    this.hazards = []; this.pickups = [];
    this.control = true;
    FX.reset();
    HUD.hpTrail = this.player.hp;
    this.state = 'play';
    this.fade = 1;
    this.area = -1;
    Music.play(this.bossDefeated ? 'calm' : 'ambient');
  },

  onPlayerDeath() { this.deaths++; this.control = false; Music.stop(); },
  showBossName() { HUD.bossNameT = 3.6; },
  banner(t, d) { HUD.banner(t, d); },
  onBossDying() { this.hazards = []; Music.stop(); this.hitstop = 0.25; },
  onBossDefeated() {
    this.bossDefeated = true; this.bossFight = false;
    Level.setGate(0, false); Level.setGate(1, false);
    HUD.banner('INIMIGO DERROTADO', 3.5);
    Sfx.play('victory');
    setTimeout(() => Music.play('calm'), 1500);
    this.kills++;
  },

  startBossFight() {
    this.bossFight = true;
    Level.setGate(0, true);
    this.control = false;
    this.player.vx = 0;
    this.boss.start();
    Music.play('boss');
  },

  frame(now) {
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.acc += dt;
    const STEP = 1 / 60;
    while (this.acc >= STEP) { this.tick(STEP); this.acc -= STEP; }
    this.render();
    requestAnimationFrame((t) => this.frame(t));
  },

  tick(dt) {
    Input.update();
    this.time += dt;
    if (Input.pressed.mute) Sfx.toggleMute();

    if (this.state === 'title') {
      this.cam.x = 2 * TS + Math.sin(this.time * 0.15) * 60 + 60;
      if (Input.pressed.start || Input.pressed.attack || Input.pressed.jump) { Sfx.unlock(); Sfx.play('select'); this.newGame(); }
      return;
    }
    if (this.state === 'victory') {
      if (Input.pressed.start) { Sfx.play('select'); this.state = 'title'; Music.play('ambient'); }
      return;
    }
    if (this.state === 'paused') {
      if (Input.pressed.pause || Input.pressed.start) this.state = 'play';
      return;
    }
    if (this.state === 'dead') {
      this.player.update(dt, this);
      FX.update(dt);
      if (this.player.deadT > 1.6 && (Input.pressed.start || Input.pressed.attack || Input.pressed.jump)) this.respawn();
      return;
    }
    if (Input.pressed.pause) { this.state = 'paused'; return; }

    if (this.fade > 0) this.fade -= dt * 1.5;
    if (this.hitstop > 0) { this.hitstop -= dt; FX.update(dt * 0.2); return; }

    this.elapsed += dt;
    const p = this.player;
    p.update(dt, this);
    if (p.dead) { this.state = 'dead'; }

    for (const e of this.entities) e.update(dt, this);
    for (const o of this.pickups) o.update(dt, this);
    this.pickups = this.pickups.filter(o => !o.dead);
    this.boss.update(dt, this);
    for (const h of this.hazards) h.update(dt, this);

    this.combat();
    this.hazards = this.hazards.filter(h => !h.dead);
    this.entities = this.entities.filter(e => !e.dead);

    // portões
    for (const g of Level.gates) g.vis = approach(g.vis, g.closed ? 1 : 0, dt * (g.closed ? 4 : 1.2));

    // gatilho do chefe
    if (!this.bossDefeated && !this.bossFight && p.x > 138 * TS + 8 && p.onGround && !p.dead) this.startBossFight();

    // vela de repouso
    const cp = Level.checkpoint;
    if (Math.abs(p.cx - cp.x) < 34 && Math.abs(p.feet - cp.y) < 20 && !p.dead) {
      if (!cp.lit || p.hp < p.maxHp) {
        const first = !cp.lit;
        cp.lit = true;
        p.hp = p.maxHp;
        Sfx.play('save');
        FX.burst(cp.x, cp.y - 90, 30, { speed: [40, 200], life: [0.5, 1], size: [2, 4], colors: ['#7ad0ff', '#d0f0ff'], add: true, g: -60 });
        HUD.banner(first ? 'Vela de Repouso acesa — vida restaurada' : 'Vida restaurada', 2.2);
      }
    }

    // saída
    if (this.bossDefeated && Math.abs(p.cx - Level.exit.x) < 40 && !p.dead) {
      this.state = 'victory'; Sfx.play('victory'); Music.play('calm');
    }

    // placas
    this.activeSign = null;
    for (const s of Level.signs) {
      const near = Math.abs(p.cx - s.x) < 46 && Math.abs(p.feet - s.y) < 40;
      s.glow = approach(s.glow, near ? 1 : 0, dt * 4);
      if (near) { this.activeSign = s; if (!s.read) { s.read = true; Sfx.play('read'); } }
    }

    // nome de área
    const tx = p.cx / TS;
    const ai = AREAS.findIndex(a => tx >= a[0] && tx < a[1]);
    if (ai !== this.area && ai >= 0) { this.area = ai; HUD.showArea(AREAS[ai][2]); }

    this.ambient(dt);
    FX.update(dt);
    HUD.update(dt, this);
    this.updateCamera(dt);
  },

  combat() {
    const p = this.player;
    const ab = p.attackBox();
    const dmgBase = p.attackKind === 2 ? 10 : 12;
    if (ab) {
      for (const e of this.entities) {
        if (e.dead || p.hitList.has(e) || !overlap(ab, e.box)) continue;
        p.hitList.add(e);
        const b = e.box;
        const hx = clamp(p.cx + p.facing * 30, b.x, b.x + b.w), hy = b.y + b.h / 2;
        if (e.kind === 'urn') {
          e.dead = true;
          Sfx.play('break');
          FX.burst(e.x, e.y - 14, 16, { speed: [80, 260], life: [0.4, 0.8], size: [2, 4], colors: ['#8a5034', '#4a2a1c', '#c9a36a'], g: 1000 });
          if (Math.random() < 0.8) this.pickups.push(new HealOrb(e.x, e.y - 20));
          continue;
        }
        const dmg = dmgBase + randi(0, 2);
        e.hit(dmg, p.cx);
        Sfx.play('hit');
        FX.sparks(hx, hy, p.facing > 0 ? 0 : Math.PI, 8);
        FX.blood(hx, hy, 6);
        FX.number(hx, b.y - 6, dmg);
        this.hitstop = 0.035;
        if (e.hp <= 0) {
          e.dead = true; this.kills++;
          Sfx.play('enemyDie');
          FX.burst(e.x, e.y - 8, 22, { speed: [60, 260], life: [0.4, 0.9], size: [2, 5], colors: ['#55682a', '#3a4a1a', '#9ab060'], g: 500 });
          FX.burst(e.x, e.y - 8, 10, { speed: [20, 80], life: [0.6, 1], size: [4, 8], colors: ['rgba(120,90,200,0.6)'], add: true, g: -100 });
          if (Math.random() < 0.35) this.pickups.push(new HealOrb(e.x, e.y - 10, 15));
        }
      }
      const B = this.boss;
      if (B.active && !p.hitList.has(B) && B.hurtBoxes().some(h => overlap(ab, h))) {
        p.hitList.add(B);
        const hx = p.cx + p.facing * 40, hy = p.feet - (p.attackKind === 2 ? 18 : 44);
        if (B.isBlocking(p)) {
          Sfx.play('clang');
          FX.sparks(B.x + B.facing * 50, hy, B.facing > 0 ? 0 : Math.PI, 16);
          FX.number(B.x + B.facing * 40, B.y - 150, 'Bloqueado', '#aab4c8');
          p.vx = -p.facing * 240;
          this.hitstop = 0.06;
        } else if (B.vulnerable) {
          const dmg = dmgBase + randi(0, 2);
          B.takeHit(dmg, this);
          FX.sparks(hx, hy, p.facing > 0 ? 0 : Math.PI, 10);
          FX.blood(hx, hy, 8);
          this.hitstop = 0.045;
        } else {
          Sfx.play('clang');
          FX.sparks(hx, hy, p.facing > 0 ? Math.PI : 0, 8);
        }
      }
    }
    // dano de contato
    if (!p.dead) {
      for (const e of this.entities) if (e.contact && !e.dead && overlap(e.box, p.box)) p.damage(e.contact, e.x, this);
      for (const h of this.hazards) {
        const harmful = h.active !== undefined ? h.active : h.falling !== undefined ? h.falling : true;
        if (harmful && !h.dead && overlap(h.box, p.box)) {
          if (p.damage(h.dmg, h.x, this) && h instanceof Glob) h.dead = true;
        }
      }
    }
  },

  ambient(dt) {
    // gotas d'água caindo do teto
    for (const d of Level.drips) {
      if (d.x < this.cam.x - 20 || d.x > this.cam.x + VIEW_W + 20) continue;
      if (Math.random() < dt * 0.25) FX.add({ x: d.x, y: d.y, vx: 0, vy: 0, g: 900, life: 1.2, size: 1.8, color: 'rgba(170,220,240,0.8)' });
    }
    // poeira flutuando
    if (Math.random() < dt * 6) FX.add({ x: this.cam.x + rand(0, VIEW_W), y: rand(80, 440), vx: rand(-8, 8), vy: rand(-10, -3), life: rand(2, 4), size: rand(0.8, 1.6), color: 'rgba(200,210,255,0.35)', add: true });
    // ondulações quando o jogador anda na água da cisterna
    const p = this.player;
    if (p.cx > Level.arena.x0 && p.cx < Level.arena.x1 && p.onGround && Math.abs(p.vx) > 120 && Math.random() < dt * 10) FX.splash(p.cx, FLOOR_Y - 2, 2);
  },

  updateCamera(dt) {
    const p = this.player;
    let target;
    if (this.bossFight || (this.boss.state === 'dying')) target = Level.arena.x0;
    else target = p.cx - VIEW_W / 2 + p.facing * 50;
    target = clamp(target, 0, Level.W * TS - VIEW_W);
    this.cam.x = lerp(this.cam.x, target, Math.min(1, dt * (this.bossFight ? 3 : 6)));
    this.cam.y = 0;
  },

  render() {
    const ctx = this.ctx;
    const ps = this.pixelScale;
    ctx.setTransform(ps, 0, 0, ps, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = '#07080d'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    let sx = 0, sy = 0;
    if (FX.shakeT > 0) { sx = rand(-1, 1) * FX.shakeMag; sy = rand(-1, 1) * FX.shakeMag; }
    const cx = Math.round(this.cam.x * ps) / ps, cy = this.cam.y;

    ctx.save();
    ctx.translate(-cx + sx, -cy + sy);
    // cenário pré-renderizado
    const bs = Level.bakeScale;
    const x0 = clamp(cx - 24, 0, Level.W * TS - VIEW_W - 48);
    ctx.drawImage(Level.canvas, x0 * bs, 0, (VIEW_W + 48) * bs, Level.H * TS * bs, x0, 0, VIEW_W + 48, Level.H * TS);

    this.drawBeams(ctx);
    for (const c of Level.candles) if (c.x > cx - 150 && c.x < cx + VIEW_W + 150) candleGlow(ctx, c, this.time);
    for (const c of Level.candles) if (c.x > cx - 40 && c.x < cx + VIEW_W + 40) drawCandelabra(ctx, c, this.time);
    for (const s of Level.signs) if (s.x > cx - 60 && s.x < cx + VIEW_W + 60) drawSign(ctx, s, this.time);
    drawCheckpoint(ctx, Level.checkpoint, this.time);
    if (Level.exit.x > cx - 150 && Level.exit.x < cx + VIEW_W + 150) drawExitSeal(ctx, Level.exit, this.time, this.bossDefeated);
    this.drawHazardWater(ctx);
    Level.drawGates(ctx, this.time);

    for (const e of this.entities) e.draw(ctx);
    for (const o of this.pickups) o.draw(ctx);
    this.boss.draw(ctx, this);
    if (this.state !== 'title') this.player.draw(ctx);
    for (const h of this.hazards) h.draw(ctx);
    this.drawArenaWater(ctx);
    FX.draw(ctx);
    ctx.restore();

    this.drawForeground(ctx, cx);
    ctx.drawImage(this.vignette, 0, 0);
    if (FX.flashT > 0) { ctx.globalAlpha = clamp(FX.flashT * 3, 0, 0.6); ctx.fillStyle = FX.flashCol; ctx.fillRect(0, 0, VIEW_W, VIEW_H); ctx.globalAlpha = 1; }
    if (this.fade > 0) { ctx.fillStyle = `rgba(0,0,0,${clamp(this.fade, 0, 1)})`; ctx.fillRect(0, 0, VIEW_W, VIEW_H); }

    if (this.state === 'title') { drawTitle(ctx, this); return; }
    HUD.draw(ctx, this);
    if (this.state === 'paused') drawPause(ctx);
    if (this.state === 'dead') drawDeath(ctx, this);
    if (this.state === 'victory') drawVictory(ctx, this);
  },

  drawBeams(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const b of Level.beams) {
      if (b.x < this.cam.x - 400 || b.x > this.cam.x + VIEW_W + 400) continue;
      const a = 0.07 + Math.sin(this.time * 0.6 + b.x) * 0.02;
      const g = ctx.createLinearGradient(b.x, b.y, b.x + 160, FLOOR_Y);
      g.addColorStop(0, `rgba(150,180,255,${a})`); g.addColorStop(1, 'rgba(150,180,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(b.x - b.w * 0.4, b.y - b.h * 0.2);
      ctx.lineTo(b.x + b.w * 0.4, b.y - b.h * 0.2);
      ctx.lineTo(b.x + b.w * 0.6 + 180, FLOOR_Y);
      ctx.lineTo(b.x - b.w * 0.6 + 120, FLOOR_Y);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  },

  drawHazardWater(ctx) {
    // água sobre as estacas do vão
    const x0 = 46 * TS, x1 = 52 * TS, y = 16 * TS + 10;
    if (x1 < this.cam.x || x0 > this.cam.x + VIEW_W) return;
    ctx.save();
    ctx.fillStyle = 'rgba(40,110,130,0.55)';
    ctx.beginPath(); ctx.moveTo(x0, y);
    for (let x = x0; x <= x1; x += 8) ctx.lineTo(x, y + Math.sin(this.time * 3 + x * 0.08) * 2.5);
    ctx.lineTo(x1, Level.H * TS); ctx.lineTo(x0, Level.H * TS); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(170,230,240,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  },

  drawArenaWater(ctx) {
    const A = Level.arena;
    if (A.x1 < this.cam.x || A.x0 > this.cam.x + VIEW_W) return;
    const depth = this.boss.phase === 2 && !this.bossDefeated ? 14 : 8;
    ctx.save();
    const g = ctx.createLinearGradient(0, FLOOR_Y - depth, 0, FLOOR_Y + 6);
    g.addColorStop(0, 'rgba(80,150,170,0.45)'); g.addColorStop(1, 'rgba(20,60,80,0.6)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(A.x0, FLOOR_Y + 6);
    for (let x = A.x0; x <= A.x1; x += 10) ctx.lineTo(x, FLOOR_Y - depth + Math.sin(this.time * 2.2 + x * 0.05) * 2 + Math.sin(this.time * 3.1 + x * 0.013) * 1.5);
    ctx.lineTo(A.x1, FLOOR_Y + 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(190,235,245,0.45)'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = A.x0; x <= A.x1; x += 10) {
      const yy = FLOOR_Y - depth + Math.sin(this.time * 2.2 + x * 0.05) * 2 + Math.sin(this.time * 3.1 + x * 0.013) * 1.5;
      if (x === A.x0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, cx) {
    for (const wx of this.fgPillars) {
      const x = wx - cx * 1.3;
      if (x < -120 || x > VIEW_W + 120) continue;
      const g = ctx.createLinearGradient(x - 34, 0, x + 34, 0);
      g.addColorStop(0, 'rgba(2,3,6,0)'); g.addColorStop(0.25, 'rgba(3,4,7,0.92)'); g.addColorStop(0.75, 'rgba(5,6,10,0.92)'); g.addColorStop(1, 'rgba(2,3,6,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 34, 0, 68, VIEW_H);
      ctx.strokeStyle = 'rgba(60,70,90,0.35)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 14, 0); ctx.lineTo(x - 14, VIEW_H); ctx.stroke();
      // corrente pendurada
      ctx.strokeStyle = '#05060a'; ctx.lineWidth = 3;
      for (let i = 0; i < 14; i++) {
        const yy = i * 12, xx = x + 44 + Math.sin(this.time + i * 0.3) * 2;
        ctx.beginPath(); ctx.ellipse(xx, yy, i % 2 ? 2 : 4, 6, 0, 0, TAU); ctx.stroke();
      }
    }
  },
};

window.addEventListener('load', () => {
  const go = () => Game.init();
  if (document.fonts && document.fonts.load) {
    Promise.race([
      Promise.all([document.fonts.load('700 20px Cinzel'), document.fonts.load('400 18px Spectral')]),
      new Promise(r => setTimeout(r, 1500)),
    ]).then(go, go);
  } else go();
});
