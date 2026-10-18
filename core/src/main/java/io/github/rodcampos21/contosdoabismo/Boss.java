package io.github.rodcampos21.contosdoabismo;

import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.math.MathUtils;
import com.badlogic.gdx.math.Rectangle;

/** Surubim Guerreiro — guardião da Cisterna Esquecida. */
public class Boss {
  static final float SCALE = 1.22f;
  static final float FY = Level.FLOOR_Y;

  // ---------- perigos ----------
  public abstract static class Hazard {
    float x, y, t, dmg; boolean dead;
    final Rectangle r = new Rectangle();
    abstract void update(float dt, Play G);
    abstract void draw(Assets g);
    abstract Rectangle box();
    boolean harmful() { return true; }
  }

  static class Shockwave extends Hazard {
    float dir, speed, h, life = 1.7f;
    Shockwave(float x, float dir, boolean big) { this.x = x; this.dir = dir; speed = big ? 470 : 400; h = big ? 36 : 28; dmg = 14; }
    Rectangle box() { return r.set(x - 16, FY - h, 32, h); }
    void update(float dt, Play G) {
      t += dt; x += dir * speed * dt;
      if (t > life || x < G.level.arenaX0 + 4 || x > G.level.arenaX1 - 4) dead = true;
      if (MathUtils.randomBoolean(0.6f)) G.fx.add(x + MathUtils.random(-10, 10), FY - MathUtils.random(0, h), MathUtils.random(-40, 40), MathUtils.random(-180, -60), 0.4f, MathUtils.random(2f, 3.5f), Fx.WATER[MathUtils.random(2)], 900, Fx.DOT, false);
    }
    void draw(Assets g) {
      float k = Math.min(1, t * 6) * (t > life - 0.25f ? (life - t) / 0.25f : 1);
      g.sprite("shock", ((int) (t * 12)) % 4, x, FY + 2, dir, (h / 30f) * Math.max(0.2f, k), 0, 1, 1, 1, 1);
    }
  }

  static class Glob extends Hazard {
    float vx, vy;
    Glob(float x, float y, float vx, float vy) { this.x = x; this.y = y; this.vx = vx; this.vy = vy; dmg = 12; }
    Rectangle box() { return r.set(x - 9, y - 9, 18, 18); }
    void update(float dt, Play G) {
      t += dt; vy += 1100 * dt; x += vx * dt; y += vy * dt;
      if (y >= FY - 6 || x < G.level.arenaX0 || x > G.level.arenaX1) {
        dead = true;
        G.fx.splash(x, FY - 4, 10);
        G.fx.blood(x, FY - 4, 6, Fx.SLIME);
        G.a.play("splash", 0.6f);
      }
    }
    void draw(Assets g) { g.sprite("glob", 0, x, y, 1, 1, MathUtils.atan2(-vy, vx) * MathUtils.radiansToDegrees, 1, 1, 1, 1); }
  }

  static class Geyser extends Hazard {
    float warn = 0.95f, erupt = 0.6f; boolean sounded;
    Geyser(float x, float delay) { this.x = x; t = -delay; dmg = 16; }
    @Override boolean harmful() { return t > warn && t < warn + erupt; }
    Rectangle box() { return r.set(x - 26, FY - 330, 52, 330); }
    void update(float dt, Play G) {
      t += dt;
      if (t > 0 && t < warn && MathUtils.randomBoolean(0.35f)) {
        G.fx.add(x + MathUtils.random(-22, 22), FY - 2, 0, MathUtils.random(-60, -20), 0.5f, MathUtils.random(2f, 4f), Fx.WATER[2], 0, Fx.RING, false);
        if (MathUtils.randomBoolean(0.15f)) G.a.play("bubble", 0.5f);
      }
      if (t > warn && !sounded) { sounded = true; G.a.play("geyser"); G.fx.shake(4, 0.2f); G.fx.splash(x, FY - 8, 20); }
      if (t > warn && t < warn + erupt && MathUtils.randomBoolean(0.8f)) {
        G.fx.add(x + MathUtils.random(-20, 20), FY - 300, MathUtils.random(-120, 120), MathUtils.random(-200, -50), 0.6f, MathUtils.random(2f, 4f), Fx.WATER[2], 900, Fx.DOT, false);
      }
      if (t > warn + erupt) dead = true;
    }
    void draw(Assets g) {
      if (t < 0) return;
      if (t < warn) {
        float a = 0.4f + MathUtils.sin(t * 30) * 0.2f;
        g.setAdditive(true);
        g.sprite("glow", 0, x, FY - 2, 2.2f, 0.8f, 0, 0.5f, 0.85f, 1f, a);
        g.setAdditive(false);
        return;
      }
      float k = (t - warn) / erupt;
      float hh = 330 * Math.min(1, k * 5) * (k > 0.75f ? (1 - k) / 0.25f : 1);
      int f = ((int) (t * 16)) % 4;
      for (float yy = 0; yy < hh; yy += 160) {
        float seg = Math.min(160, hh - yy);
        g.stretch("geyser", f, x - 28, FY - yy - seg, 56, seg, 0.95f);
      }
      g.sprite("splash", f, x, FY - hh + 10, 1, 0.9f, 0, 1, 1, 1, 0.9f);
      g.sprite("splash", (f + 2) % 4, x, FY + 2, 1, 1.2f, 0, 1, 1, 1, 0.9f);
    }
  }

  static class Debris extends Hazard {
    float vy, rot = MathUtils.random(360f);
    Debris(float x, float delay) { this.x = x; y = 2 * Level.TS; t = -delay; dmg = 12; }
    @Override boolean harmful() { return t > 0.6f; }
    Rectangle box() { return r.set(x - 13, y - 13, 26, 26); }
    void update(float dt, Play G) {
      t += dt;
      if (t < 0) return;
      if (t < 0.6f) {
        if (MathUtils.randomBoolean(0.4f)) G.fx.add(x + MathUtils.random(-12, 12), 2 * Level.TS + 2, 0, MathUtils.random(40, 120), 0.5f, 2, Fx.DUST[0], 400, Fx.DOT, false);
        return;
      }
      vy += 1500 * dt; y += vy * dt; rot += dt * 280;
      if (y > FY - 12) {
        dead = true; G.a.play("break");
        G.fx.burst(x, FY - 10, 12, Float.NaN, 0, 80, 260, 0.3f, 0.7f, 2, 4, Fx.DUST, 1000, 0, Fx.DOT, false);
      }
    }
    void draw(Assets g) {
      if (t < 0) return;
      g.sprite("dot", 0, x, FY, 4.5f, 1f, 0, 0, 0, 0, t < 0.6f ? 0.3f : 0.45f);
      if (t >= 0.6f) g.sprite("debris", 0, x, y, 1, 1, rot, 1, 1, 1, 1);
    }
  }

  // ---------- o chefe ----------
  enum S { DORMANT, EMERGE, IDLE, WALK, SLASH, GUARD, CHARGE_W, CHARGE, STUN, LEAP_W, LEAP, LEAP_L, SPIT_W, SPIT, GEY_W, GEY_H, PHASE, DYING, DEAD }

  float x, y; S state = S.DORMANT; float t, anim; float maxHp = 320, hp = 320, displayHp = 320;
  int phase = 1; float facing = -1, flash, walkPhase, sink = 1;
  S lastAttack; int slashCount, leapChain; boolean quick, roared, fired; float x0, tx; int deathBursts;
  final Rectangle body = new Rectangle(), head = new Rectangle(), slash = new Rectangle(), tmp = new Rectangle();

  Boss() { reset(); }
  void reset() {
    x = 152 * Level.TS + 16; y = FY; state = S.DORMANT; t = anim = 0; hp = displayHp = maxHp; phase = 1; facing = -1; flash = 0;
    walkPhase = 0; sink = 1; lastAttack = null; slashCount = leapChain = 0; quick = roared = fired = false; deathBursts = 0;
  }
  boolean active() { return state != S.DORMANT && state != S.DEAD; }
  boolean vulnerable() { return state != S.DORMANT && state != S.EMERGE && state != S.PHASE && state != S.DYING && state != S.DEAD; }
  Rectangle bodyBox() { return body.set(x - 46, y - 160, 92, 160); }
  Rectangle headBox() { return head.set(facing > 0 ? x + 20 : x - 98, y - 182, 78, 50); }
  Rectangle slashBox() { return slash.set(facing > 0 ? x + 10 : x - 200, y - 190, 190, 190); }

  void set(S s) { state = s; t = 0; fired = false; }
  void facePlayer(Player p) { float d = Math.signum(p.cx() - x); if (d != 0) facing = d; }
  void start() { set(S.EMERGE); roared = false; }
  boolean fast() { return phase == 2; }
  float slashWind() { return quick ? 0.28f : (fast() ? 0.45f : 0.62f); }
  float slashRec() { return fast() ? 0.42f : 0.6f; }
  static final float SLASH_ACT = 0.17f;

  void choose(Player p) {
    float adx = Math.abs(p.cx() - x);
    S[] opts = new S[6]; float[] w = new float[6]; int n = 0;
    if (adx < 180) { opts[n] = S.SLASH; w[n++] = 4; opts[n] = S.GUARD; w[n++] = fast() ? 1 : 1.6f; opts[n] = S.LEAP_W; w[n++] = 1; }
    else { opts[n] = S.WALK; w[n++] = 2; opts[n] = S.CHARGE_W; w[n++] = 2.2f; opts[n] = S.LEAP_W; w[n++] = 2; }
    if (fast()) { opts[n] = S.SPIT_W; w[n++] = 2; opts[n] = S.GEY_W; w[n++] = 2.2f; }
    float total = 0;
    for (int i = 0; i < n; i++) { if (opts[i] == lastAttack) w[i] *= 0.25f; total += w[i]; }
    float r = MathUtils.random(total);
    S choice = opts[0];
    for (int i = 0; i < n; i++) { r -= w[i]; if (r <= 0) { choice = opts[i]; break; } }
    lastAttack = choice; slashCount = 0; quick = false;
    facePlayer(p);
    set(choice);
  }

  void update(float dt, Play G) {
    anim += dt; t += dt;
    if (flash > 0) flash -= dt;
    displayHp = Player.approach(displayHp, hp, dt * 90);
    Player p = G.player;
    float adx = Math.abs(p.cx() - x);
    float ax0 = G.level.arenaX0, ax1 = G.level.arenaX1;
    switch (state) {
      case DORMANT: return;
      case EMERGE: {
        sink = 1 - easeOut(MathUtils.clamp((t - 0.5f) / 1.5f, 0, 1));
        if (t < 2.1f && MathUtils.randomBoolean(0.6f)) G.fx.splash(x + MathUtils.random(-60, 60), FY - 4, 2);
        if (t > 0.5f && t - dt <= 0.5f) { G.a.play("splash"); G.fx.splash(x, FY - 4, 40); }
        if (t > 2.1f && !roared) { roared = true; G.a.play("roar"); G.fx.shake(10, 1.0f); G.hud.bossNameT = 3.6f; }
        facePlayer(p);
        if (t > 3.6f) { set(S.IDLE); G.control = true; }
        break;
      }
      case IDLE:
        facePlayer(p);
        if (t > (fast() ? 0.3f : 0.55f)) choose(p);
        break;
      case WALK: {
        facePlayer(p);
        x += facing * (fast() ? 150 : 110) * dt;
        float prev = walkPhase; walkPhase += dt * 5.5f;
        if ((int) (walkPhase / MathUtils.PI) != (int) (prev / MathUtils.PI)) { G.a.play("land", 0.8f); G.fx.shake(2, 0.1f); }
        if (adx < 150) { lastAttack = S.SLASH; set(MathUtils.randomBoolean(0.75f) ? S.SLASH : S.GUARD); }
        else if (t > 1.6f) choose(p);
        break;
      }
      case SLASH: {
        float wind = slashWind(), rec = slashRec();
        if (t < wind) { facePlayer(p); if (t < dt * 1.5f) G.a.play("windup"); }
        if (t >= wind && !fired) { fired = true; G.a.play("swing"); G.a.play("swing", 0.7f); }
        if (t >= wind && t < wind + SLASH_ACT) {
          x += facing * 240 * dt;
          if (slashBox().overlaps(p.box())) p.damage(20, x, G, 320);
          if (t - dt < wind + SLASH_ACT * 0.6f && t >= wind + SLASH_ACT * 0.6f) { G.fx.shake(4, 0.15f); G.fx.splash(x + facing * 150, FY - 4, 8); }
        }
        if (t > wind + SLASH_ACT + rec) {
          if (fast() && slashCount == 0) { slashCount = 1; quick = true; facePlayer(p); set(S.SLASH); }
          else set(S.IDLE);
        }
        break;
      }
      case GUARD:
        facePlayer(p);
        if (t > (fast() ? 0.8f : 1.15f)) { quick = true; slashCount = 1; set(S.SLASH); }
        break;
      case CHARGE_W:
        facePlayer(p);
        if (MathUtils.randomBoolean(0.5f)) G.fx.dust(x - facing * 30, FY, 1);
        if (t < dt * 1.5f) G.a.play("windup");
        if (t > (fast() ? 0.55f : 0.8f)) { set(S.CHARGE); G.a.play("roar", 0.7f); }
        break;
      case CHARGE: {
        x += facing * (fast() ? 640 : 540) * dt;
        walkPhase += dt * 14;
        if (MathUtils.randomBoolean(0.8f)) G.fx.dust(x - facing * 40, FY, 1);
        if (MathUtils.randomBoolean(0.5f)) G.fx.splash(x - facing * 20, FY - 2, 1);
        if (bodyBox().overlaps(p.box())) p.damage(18, x, G, 420);
        float lim = facing > 0 ? ax1 - 50 : ax0 + 50;
        if ((facing > 0 && x >= lim) || (facing < 0 && x <= lim)) {
          x = lim;
          G.fx.shake(14, 0.5f); G.a.play("slam"); G.a.play("clang");
          G.fx.sparks(x + facing * 60, FY - 100, facing > 0 ? MathUtils.PI : 0, 18);
          G.fx.burst(x + facing * 60, FY - 110, 14, Float.NaN, 0, 60, 250, 0.4f, 0.8f, 2, 4, Fx.DUST, 900, 0, Fx.DOT, false);
          if (fast()) for (int i = 0; i < 4; i++) G.hazards.add(new Debris(MathUtils.clamp(p.cx() + (i - 1.5f) * 120 + MathUtils.random(-30, 30), ax0 + 40, ax1 - 40), i * 0.15f));
          set(S.STUN);
        }
        break;
      }
      case STUN: if (t > (fast() ? 1.15f : 1.6f)) set(S.IDLE); break;
      case LEAP_W:
        facePlayer(p);
        if (t > (fast() ? 0.38f : 0.5f)) {
          x0 = x; tx = MathUtils.clamp(p.cx(), ax0 + 70, ax1 - 70);
          set(S.LEAP); G.a.play("jump"); G.fx.dust(x, FY, 10);
        }
        break;
      case LEAP: {
        float s = Math.min(1, t / 0.85f);
        x = MathUtils.lerp(x0, tx, s);
        y = FY - MathUtils.sin(s * MathUtils.PI) * 240;
        if (s > 0.15f && tx != x0) facing = Math.signum(tx - x0);
        if (bodyBox().overlaps(p.box()) && s > 0.75f) p.damage(16, x, G, 300);
        if (s >= 1) {
          y = FY;
          G.fx.shake(13, 0.45f); G.a.play("slam"); G.a.play("splash");
          G.fx.splash(x, FY - 4, 36);
          G.hazards.add(new Shockwave(x - 50, -1, fast()));
          G.hazards.add(new Shockwave(x + 50, 1, fast()));
          if (tmp.set(x - 70, FY - 40, 140, 40).overlaps(p.box())) p.damage(16, x, G, 300);
          set(S.LEAP_L);
        }
        break;
      }
      case LEAP_L:
        if (t > (fast() ? 0.45f : 0.75f)) {
          if (fast() && leapChain < 1) { leapChain++; set(S.LEAP_W); } else { leapChain = 0; set(S.IDLE); }
        }
        break;
      case SPIT_W: facePlayer(p); if (t > 0.55f) set(S.SPIT); break;
      case SPIT:
        if (!fired) {
          fired = true; G.a.play("spit");
          float mx = x + facing * 90, my = y - 150;
          float dist = Math.abs(p.cx() - mx);
          for (int i = 0; i < 5; i++) {
            float tf = 0.75f + i * 0.12f;
            float vx = facing * MathUtils.clamp((dist + (i - 2) * 70) / tf, 60, 700);
            float vy = (FY - my - 0.5f * 1100 * tf * tf) / tf;
            G.hazards.add(new Glob(mx, my, vx, vy));
          }
        }
        if (t > 0.8f) set(S.IDLE);
        break;
      case GEY_W:
        if (t < dt * 1.5f) G.a.play("windup");
        if (t > 0.5f) {
          set(S.GEY_H);
          G.a.play("slam"); G.fx.shake(6, 0.3f);
          float[] xs = { p.cx(), p.cx() - 170, p.cx() + 170 };
          for (int i = 0; i < 3; i++) G.hazards.add(new Geyser(MathUtils.clamp(xs[i], ax0 + 40, ax1 - 40), i * 0.22f));
        }
        break;
      case GEY_H: if (t > 1.5f) set(S.IDLE); break;
      case PHASE:
        if (t > 0.3f && !fired) {
          fired = true; G.a.play("roar"); G.fx.shake(12, 1.2f); G.fx.flash(PHASE_FLASH, 0.25f);
          G.hud.banner("O Surubim se enfurece!", 2.0f);
        }
        if (MathUtils.randomBoolean(0.7f)) G.fx.splash(x + MathUtils.random(-80, 80), FY - 4, 2);
        if (t > 2.0f) { phase = 2; set(S.IDLE); }
        break;
      case DYING:
        if (t > deathBursts * 0.25f && t < 2.6f) {
          deathBursts++;
          G.fx.blood(x + MathUtils.random(-40, 40), y - MathUtils.random(40, 170), 10, Fx.SLIME);
          G.fx.sparks(x + MathUtils.random(-40, 40), y - MathUtils.random(40, 170), Float.NaN, 6);
          G.a.play("bosshit");
          G.fx.shake(5, 0.2f);
        }
        if (t > 2.6f && !fired) {
          fired = true;
          G.a.play("slam"); G.a.play("splash"); G.fx.shake(16, 0.8f); G.fx.flash(Color.WHITE, 0.35f);
          G.fx.splash(x, FY - 4, 60);
          G.fx.burst(x, y - 90, 50, Float.NaN, 0, 60, 320, 0.6f, 1.4f, 2, 5, Fx.WATER, -40, 1.5f, Fx.DOT, true);
        }
        if (t > 4.2f) { set(S.DEAD); G.onBossDefeated(); }
        break;
      default: break;
    }
    if (state != S.LEAP) y = FY;
    x = MathUtils.clamp(x, ax0 + 50, ax1 - 50);
    if (vulnerable() && state != S.CHARGE && state != S.STUN && !p.dead && bodyBox().overlaps(p.box())) p.damage(10, x, G, 260);
  }
  static final Color PHASE_FLASH = new Color(0.37f, 0.82f, 1f, 1);
  static final Color CRIT = new Color(1f, 0.85f, 0.29f, 1);

  boolean isBlocking(Player p) { return state == S.GUARD && Math.signum(p.cx() - x) == facing; }

  void takeHit(float dmg, Play G) {
    if (!vulnerable()) return;
    boolean crit = state == S.STUN;
    if (crit) dmg = Math.round(dmg * 1.5f);
    hp = Math.max(0, hp - dmg);
    flash = 0.09f;
    G.a.play("bosshit");
    G.fx.number(x + MathUtils.random(-20, 20), y - 195, String.valueOf((int) dmg), crit ? CRIT : Color.WHITE);
    if (phase == 1 && hp <= maxHp / 2 && hp > 0) {
      set(S.PHASE);
      for (int i = G.hazards.size - 1; i >= 0; i--) if (!(G.hazards.get(i) instanceof Shockwave)) G.hazards.removeIndex(i);
    }
    if (hp <= 0) { set(S.DYING); G.onBossDying(); }
  }

  /** Nome do quadro e índice para o estado atual. */
  private String fname; private int fidx;
  private void frame() {
    float wind = slashWind(), rec = slashRec();
    switch (state) {
      case WALK: fname = "walk"; fidx = Player.frameOf(walkPhase, 8); break;
      case SLASH:
        if (t < wind) { fname = "slashW"; fidx = (int) (t / wind * 6); }
        else if (t < wind + SLASH_ACT) { fname = "slashA"; fidx = (int) ((t - wind) / SLASH_ACT * 4); }
        else { fname = "slashR"; fidx = (int) ((t - wind - SLASH_ACT) / rec * 6); }
        break;
      case GUARD: fname = "guard"; fidx = ((int) (anim * 1.5f)) % 2; break;
      case CHARGE_W: fname = "chargeW"; fidx = ((int) (t * 8)) % 4; break;
      case CHARGE: fname = "charge"; fidx = Player.frameOf(walkPhase, 6); break;
      case STUN: fname = "stun"; fidx = Player.frameOf(anim * 4, 6); break;
      case LEAP_W: fname = "leapW"; fidx = 0; break;
      case LEAP: fname = "leap"; fidx = (int) (Math.min(0.999f, t / 0.85f) * 4); break;
      case LEAP_L: fname = "leapL"; fidx = 0; break;
      case SPIT_W: fname = "spitW"; fidx = (int) (Math.min(0.999f, t / 0.55f) * 3); break;
      case SPIT: fname = "spit"; fidx = Math.min(2, (int) (t / 0.27f)); break;
      case GEY_W: fname = "geyW"; fidx = (int) (Math.min(0.999f, t / 0.5f) * 4); break;
      case GEY_H: fname = "geyH"; fidx = ((int) (anim * 3)) % 2; break;
      case PHASE: if (t > 0.3f) { fname = "roar"; fidx = ((int) (anim * 6)) % 2; } else { fname = "idle"; fidx = 0; } break;
      case EMERGE: if (t > 2.1f && t < 3.4f) { fname = "roar"; fidx = ((int) (anim * 6)) % 2; } else { fname = "idle"; fidx = Player.frameOf(anim * 2, 8); } break;
      case DYING: fname = "dying"; fidx = (int) (Math.min(1, t / 1.6f) * 5); break;
      default: fname = "idle"; fidx = Player.frameOf(anim * 2, 8);
    }
  }

  void draw(Assets g) {
    if (state == S.DORMANT || state == S.DEAD) return;
    frame();
    float dy = state == S.EMERGE ? sink * 230 : 0;
    float alpha = state == S.DYING && t > 2.6f ? Math.max(0, 1 - (t - 2.6f) / 1.2f) : 1;
    if (state != S.EMERGE) {
      float air = (FY - y) / 240f;
      g.sprite("dot", 0, x, FY + 1, 6f * (1 - air * 0.4f), 2.2f * (1 - air * 0.4f), 0, 0, 0, 0, (0.45f - air * 0.25f) * alpha);
    }
    g.sprite(fname, fidx, x, y + dy, facing, alpha);
    if (flash > 0) { g.setAdditive(true); g.sprite(fname, fidx, x, y + dy, facing, 0.75f); g.setAdditive(false); }

    g.setAdditive(true);
    if (state == S.SLASH && t < slashWind()) {
      float k = t / slashWind();
      float ke = easeOut(Math.min(1, k + 1f / 6));
      float hx = MathUtils.lerp(-26, -16, ke), hy = MathUtils.lerp(-70, -150, ke), a = MathUtils.lerp(-2.25f, -1.85f, ke);
      float lx = hx + MathUtils.cos(a) * 128, ly = hy + MathUtils.sin(a) * 128;
      float tipX = x + facing * lx * SCALE, tipY = y + ly * SCALE;
      g.sprite("glow", 0, tipX, tipY, 1, (30 + k * 20) / 32f, 0, 1f, 0.95f, 0.8f, k);
      g.sprite("hitstar", 0, tipX, tipY, 1, 0.4f + k * 0.8f, anim * 300, 1, 1, 1, k);
    }
    if (state == S.CHARGE_W || state == S.LEAP_W || state == S.SPIT_W || state == S.GEY_W) {
      g.sprite("glow", 0, x + facing * 66 * SCALE, y - 135 * SCALE, 1, 1.5f, 0, 1f, 0.25f, 0.15f, 0.5f + MathUtils.sin(anim * 20) * 0.3f);
    }
    g.setAdditive(false);
  }

  static float easeOut(float t) { return 1 - (1 - t) * (1 - t); }
}
