// Rain — o protagonista
const GRAV = 2000, JUMP_V = 690, MAX_FALL = 900;

class Player {
  constructor() { this.reset(Level.start.x, Level.start.y); }

  reset(fx, fy) {
    this.w = 22; this.hStand = 66; this.hCrouch = 34; this.h = this.hStand;
    this.x = fx - this.w / 2; this.y = fy - this.h;
    this.vx = 0; this.vy = 0; this.facing = 1;
    this.onGround = false; this.crouch = false; this.crouchK = 0;
    this.maxHp = 100; this.hp = this.maxHp;
    this.attackDur = 0.3; this.attackT = 0; this.attackKind = 0; this.attackId = 0;
    this.comboQueued = false; this.hitList = new Set();
    this.invT = 0; this.stunT = 0;
    this.coyote = 0; this.jumpBuf = 0; this.jumpHeld = false; this.dropT = 0;
    this.phase = 0; this.t = 0; this.stepAcc = 0;
    this.dead = false; this.deadT = 0;
    this.lastSafe = { x: fx, y: fy }; this.safeT = 0;
  }
  get cx() { return this.x + this.w / 2; }
  get feet() { return this.y + this.h; }
  get box() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  setCrouch(c) {
    const f = this.feet;
    this.crouch = c;
    this.h = c ? this.hCrouch : this.hStand;
    this.y = f - this.h;
  }
  canStand() { return !Level.rectSolid(this.x, this.feet - this.hStand, this.w, this.hStand); }

  onPlatformOnly() {
    const ty = Math.floor((this.feet + 1) / TS);
    const x0 = Math.floor(this.x / TS), x1 = Math.floor((this.x + this.w - 0.01) / TS);
    let plat = false;
    for (let tx = x0; tx <= x1; tx++) {
      const t = Level.tile(tx, ty);
      if (t === T_PLAT) plat = true;
      else if (t !== T_EMPTY) return false;
    }
    return plat;
  }

  startAttack() {
    if (this.crouch) this.attackKind = 2;
    else this.attackKind = this.comboQueued && this.attackKind === 0 ? 1 : 0;
    this.attackT = this.attackDur;
    this.attackId++;
    this.hitList.clear();
    this.comboQueued = false;
    Sfx.play('swing');
  }
  get attackS() { return 1 - this.attackT / this.attackDur; }
  attackBox() {
    if (this.attackT <= 0) return null;
    const s = this.attackS;
    if (s < 0.2 || s > 0.56) return null;
    const fx = this.cx, fy = this.feet;
    if (this.attackKind === 2) return { x: this.facing > 0 ? fx + 2 : fx - 66, y: fy - 40, w: 64, h: 39 };
    return { x: this.facing > 0 ? fx + 2 : fx - 72, y: fy - 82, w: 70, h: 62 };
  }

  update(dt, game) {
    this.t += dt;
    if (this.dead) {
      this.deadT += dt;
      this.vy = Math.min(this.vy + GRAV * dt, MAX_FALL);
      this.vx *= 0.9;
      this.moveX(dt); this.moveY(dt);
      return;
    }
    if (this.invT > 0) this.invT -= dt;
    if (this.stunT > 0) this.stunT -= dt;
    const I = Input.held, P = Input.pressed;
    const ctl = this.stunT <= 0 && game.control;
    const dir = ctl ? (I.right ? 1 : 0) - (I.left ? 1 : 0) : 0;

    // agachar
    const wantCrouch = ctl && I.down && this.onGround;
    if (wantCrouch && !this.crouch) this.setCrouch(true);
    else if (!wantCrouch && this.crouch && this.canStand()) this.setCrouch(false);
    this.crouchK = approach(this.crouchK, this.crouch ? 1 : 0, dt * 9);

    // ataque
    if (this.attackT > 0) {
      this.attackT -= dt;
      if (this.attackT <= 0) {
        this.attackT = 0;
        if (this.comboQueued && ctl) this.startAttack();
      }
    }
    if (ctl && P.attack) {
      if (this.attackT <= 0) this.startAttack();
      else if (this.attackS > 0.45) this.comboQueued = true;
    }
    if (dir && this.attackT <= 0) this.facing = dir;

    // movimento horizontal
    const running = I.run && !this.crouch;
    const maxV = this.crouch ? 95 : running ? 300 : 180;
    let target = dir * maxV;
    if (this.attackT > 0 && this.onGround) target = 0;
    if (this.stunT <= 0) {
      const acc = this.onGround ? (target === 0 ? 2000 : 2600) : 1600;
      this.vx = approach(this.vx, target, acc * dt);
    }

    // pulo (com buffer e coyote time)
    if (ctl && P.jump) this.jumpBuf = 0.13; else this.jumpBuf -= dt;
    if (this.onGround) this.coyote = 0.1; else this.coyote -= dt;
    if (this.jumpBuf > 0) {
      if (I.down && this.onGround && this.onPlatformOnly()) {
        if (this.crouch) this.setCrouch(false);
        this.dropT = 0.22; this.y += 3; this.onGround = false; this.jumpBuf = 0;
      } else if (this.coyote > 0 && (!this.crouch || this.canStand())) {
        if (this.crouch) this.setCrouch(false);
        this.vy = -JUMP_V; this.onGround = false; this.coyote = 0; this.jumpBuf = 0; this.jumpHeld = true;
        Sfx.play('jump');
        FX.dust(this.cx, this.feet, 4);
      }
    }
    if (this.jumpHeld && !I.jump) { this.jumpHeld = false; if (this.vy < -280) this.vy = -280; }
    if (this.vy >= 0) this.jumpHeld = false;

    this.vy = Math.min(this.vy + GRAV * dt, MAX_FALL);
    if (this.dropT > 0) this.dropT -= dt;

    const wasGround = this.onGround;
    const fallSpeed = this.vy;
    this.moveX(dt);
    this.moveY(dt);
    if (!wasGround && this.onGround) {
      if (fallSpeed > 300) { Sfx.play('land'); FX.dust(this.cx, this.feet, 6); }
    }

    // perigos
    if (Level.rectHazard(this.x, this.y, this.w, this.h) || this.y > Level.H * TS) { this.hazardHit(game); return; }

    // posição segura
    if (this.onGround && !this.onPlatformOnly()) {
      this.safeT += dt;
      if (this.safeT > 0.3) this.lastSafe = { x: this.cx, y: this.feet };
    } else this.safeT = 0;

    // animação
    if (this.onGround) {
      const sp = Math.abs(this.vx);
      this.phase += sp * dt * (running ? 0.058 : this.crouch ? 0.11 : 0.075);
      this.stepAcc += sp * dt;
      if (this.stepAcc > (running ? 70 : 52) && sp > 40) { this.stepAcc = 0; Sfx.play('step'); if (running) FX.dust(this.cx - this.facing * 6, this.feet, 1); }
    }
  }

  moveX(dt) {
    this.x += this.vx * dt;
    if (Level.rectSolid(this.x, this.y, this.w, this.h)) {
      if (this.vx > 0) this.x = Math.floor((this.x + this.w) / TS) * TS - this.w - 0.001;
      else if (this.vx < 0) this.x = (Math.floor(this.x / TS) + 1) * TS + 0.001;
      this.vx = 0;
    }
  }
  moveY(dt) {
    const prevFeet = this.feet;
    this.y += this.vy * dt;
    this.onGround = false;
    if (this.vy > 0) {
      if (Level.rectSolid(this.x, this.y, this.w, this.h)) {
        const ty = Math.floor(this.feet / TS);
        this.y = ty * TS - this.h; this.vy = 0; this.onGround = true;
      } else if (this.dropT <= 0) {
        const ty = Math.floor(this.feet / TS), top = ty * TS;
        if (prevFeet <= top + 0.5) {
          const x0 = Math.floor(this.x / TS), x1 = Math.floor((this.x + this.w - 0.01) / TS);
          for (let tx = x0; tx <= x1; tx++) if (Level.tile(tx, ty) === T_PLAT) {
            this.y = top - this.h; this.vy = 0; this.onGround = true; break;
          }
        }
      }
    } else if (this.vy < 0 && Level.rectSolid(this.x, this.y, this.w, this.h)) {
      this.y = (Math.floor(this.y / TS) + 1) * TS + 0.001; this.vy = 0;
    }
  }

  damage(amount, srcX, game, knock = 230) {
    if (this.invT > 0 || this.dead || game.state !== 'play') return false;
    this.hp = Math.max(0, this.hp - amount);
    this.invT = 1.0; this.stunT = 0.3;
    const d = sign(this.cx - srcX) || -this.facing;
    this.vx = d * knock; this.vy = -320; this.onGround = false;
    this.attackT = 0; this.comboQueued = false;
    if (this.crouch && this.canStand()) this.setCrouch(false);
    Sfx.play('hurt');
    FX.number(this.cx, this.y - 6, amount, '#ff6a6a');
    FX.blood(this.cx, this.y + 20, 8, ['#8a1a1a', '#b02a2a', '#5a0e0e']);
    FX.shake(6, 0.25);
    game.hitstop = 0.06;
    if (this.hp <= 0) this.die(game);
    return true;
  }
  hazardHit(game) {
    this.hp = Math.max(0, this.hp - 15);
    FX.splash(this.cx, Math.min(this.feet, Level.H * TS - 20), 14);
    Sfx.play('splash'); Sfx.play('hurt');
    if (this.hp <= 0) { this.die(game); return; }
    FX.number(this.cx, this.y, 15, '#ff6a6a');
    if (this.crouch) this.setCrouch(false);
    this.x = this.lastSafe.x - this.w / 2; this.y = this.lastSafe.y - this.h;
    this.vx = 0; this.vy = 0; this.invT = 1.2; this.stunT = 0.2;
    game.fade = 0.5;
  }
  die(game) {
    this.dead = true; this.deadT = 0; this.invT = 0;
    Sfx.play('death');
    game.onPlayerDeath();
  }
  heal(n) {
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + n);
    if (this.hp > before) FX.number(this.cx, this.y - 6, '+' + (this.hp - before), '#7dffa0');
  }

  poseState() {
    if (this.stunT > 0) return 'hurt';
    if (!this.onGround) return this.vy < 0 ? 'jump' : 'fall';
    if (this.crouch) return 'crouch';
    const s = Math.abs(this.vx);
    if (s > 200) return 'run';
    if (s > 15) return 'walk';
    return 'idle';
  }

  draw(ctx) {
    // sombra
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(this.cx, this.feet + 1, 14, 3, 0, 0, TAU); ctx.fill();
    if (this.invT > 0 && !this.dead && Math.floor(this.invT * 14) % 2 === 0) ctx.globalAlpha = 0.35;
    drawRain(ctx, this.cx, this.feet + 1, this.facing, {
      state: this.poseState(), t: this.t, phase: this.phase, crouchK: this.crouchK,
      attack: this.attackT > 0 ? { s: this.attackS, kind: this.attackKind } : null,
      deadT: this.dead ? this.deadT : 0, vx: this.vx,
    });
    ctx.globalAlpha = 1;
  }
}
