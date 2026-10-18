package io.github.rodcampos21.contosdoabismo;

import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.math.MathUtils;
import com.badlogic.gdx.math.Rectangle;
import com.badlogic.gdx.utils.ObjectSet;

/** Rain — o protagonista. */
public class Player {
  static final float GRAV = 2000, JUMP_V = 690, MAX_FALL = 900;
  static final float W = 22, H_STAND = 76, H_CROUCH = 40;

  float x, y, w = W, h = H_STAND, vx, vy;
  float facing = 1;
  boolean onGround, crouch;
  int maxHp = 100; float hp = 100;
  float attackDur = 0.3f, attackT; int attackKind; boolean comboQueued;
  final ObjectSet<Object> hitList = new ObjectSet<>();
  float invT, stunT, coyote, jumpBuf, dropT; boolean jumpHeld;
  float phase, t, stepAcc;
  boolean dead; float deadT;
  float safeX, safeY, safeT;
  final Rectangle box = new Rectangle(), atk = new Rectangle();

  public Player(float fx, float fy) { reset(fx, fy); }

  public void reset(float fx, float fy) {
    h = H_STAND; x = fx - w / 2; y = fy - h;
    vx = vy = 0; facing = 1; onGround = false; crouch = false;
    hp = maxHp; attackT = 0; attackKind = 0; comboQueued = false; hitList.clear();
    invT = stunT = coyote = jumpBuf = dropT = 0; jumpHeld = false;
    phase = t = stepAcc = 0; dead = false; deadT = 0;
    safeX = fx; safeY = fy; safeT = 0;
  }
  float cx() { return x + w / 2; }
  float feet() { return y + h; }
  Rectangle box() { return box.set(x, y, w, h); }

  void setCrouch(boolean c) { float f = feet(); crouch = c; h = c ? H_CROUCH : H_STAND; y = f - h; }
  boolean canStand(Level L) { return !L.rectSolid(x, feet() - H_STAND, w, H_STAND); }

  boolean onPlatformOnly(Level L) {
    int ty = (int) Math.floor((feet() + 1) / Level.TS);
    int x0 = (int) Math.floor(x / Level.TS), x1 = (int) Math.floor((x + w - 0.01f) / Level.TS);
    boolean plat = false;
    for (int tx = x0; tx <= x1; tx++) {
      char c = L.tile(tx, ty);
      if (c == Level.PLAT) plat = true;
      else if (c != Level.EMPTY) return false;
    }
    return plat;
  }

  float attackS() { return 1 - attackT / attackDur; }
  void startAttack(Play G) {
    if (crouch) attackKind = 2;
    else attackKind = comboQueued && attackKind == 0 ? 1 : 0;
    attackT = attackDur; hitList.clear(); comboQueued = false;
    G.a.play("swing");
  }
  Rectangle attackBox() {
    if (attackT <= 0) return null;
    float s = attackS();
    if (s < 0.2f || s > 0.56f) return null;
    float fx = cx(), fy = feet();
    if (attackKind == 2) return atk.set(facing > 0 ? fx + 2 : fx - 70, fy - 44, 68, 43);
    return atk.set(facing > 0 ? fx + 2 : fx - 78, fy - 96, 76, 74);
  }

  void update(float dt, Play G) {
    Level L = G.level;
    Controls in = G.in;
    t += dt;
    if (dead) {
      deadT += dt; vy = Math.min(vy + GRAV * dt, MAX_FALL); vx *= 0.9f;
      moveX(dt, L); moveY(dt, L);
      return;
    }
    if (invT > 0) invT -= dt;
    if (stunT > 0) stunT -= dt;
    boolean ctl = stunT <= 0 && G.control;
    int dir = ctl ? (in.held(Controls.RIGHT) ? 1 : 0) - (in.held(Controls.LEFT) ? 1 : 0) : 0;

    boolean wantCrouch = ctl && in.held(Controls.DOWN) && onGround;
    if (wantCrouch && !crouch) setCrouch(true);
    else if (!wantCrouch && crouch && canStand(L)) setCrouch(false);

    if (attackT > 0) {
      attackT -= dt;
      if (attackT <= 0) { attackT = 0; if (comboQueued && ctl) startAttack(G); }
    }
    if (ctl && in.pressed(Controls.ATTACK)) {
      if (attackT <= 0) startAttack(G);
      else if (attackS() > 0.45f) comboQueued = true;
    }
    if (dir != 0 && attackT <= 0) facing = dir;

    boolean running = in.held(Controls.RUN) && !crouch;
    float maxV = crouch ? 95 : running ? 300 : 180;
    float target = dir * maxV;
    if (attackT > 0 && onGround) target = 0;
    if (stunT <= 0) {
      float acc = onGround ? (target == 0 ? 2000 : 2600) : 1600;
      vx = approach(vx, target, acc * dt);
    }

    if (ctl && in.pressed(Controls.JUMP)) jumpBuf = 0.13f; else jumpBuf -= dt;
    if (onGround) coyote = 0.1f; else coyote -= dt;
    if (jumpBuf > 0) {
      if (in.held(Controls.DOWN) && onGround && onPlatformOnly(L)) {
        if (crouch) setCrouch(false);
        dropT = 0.22f; y += 3; onGround = false; jumpBuf = 0;
      } else if (coyote > 0 && (!crouch || canStand(L))) {
        if (crouch) setCrouch(false);
        vy = -JUMP_V; onGround = false; coyote = 0; jumpBuf = 0; jumpHeld = true;
        G.a.play("jump", 0.7f);
        G.fx.dust(cx(), feet(), 4);
      }
    }
    if (jumpHeld && !in.held(Controls.JUMP)) { jumpHeld = false; if (vy < -280) vy = -280; }
    if (vy >= 0) jumpHeld = false;

    vy = Math.min(vy + GRAV * dt, MAX_FALL);
    if (dropT > 0) dropT -= dt;

    boolean wasGround = onGround;
    float fallSpeed = vy;
    moveX(dt, L);
    moveY(dt, L);
    if (!wasGround && onGround && fallSpeed > 300) { G.a.play("land", 0.8f); G.fx.dust(cx(), feet(), 6); }

    if (L.rectHazard(x, y, w, h) || y > L.H * Level.TS) { hazardHit(G); return; }

    if (onGround && !onPlatformOnly(L)) {
      safeT += dt;
      if (safeT > 0.3f) { safeX = cx(); safeY = feet(); }
    } else safeT = 0;

    if (onGround) {
      float sp = Math.abs(vx);
      phase += sp * dt * (running ? 0.058f : crouch ? 0.11f : 0.075f);
      stepAcc += sp * dt;
      if (stepAcc > (running ? 70 : 52) && sp > 40) {
        stepAcc = 0; G.a.play("step", 0.5f);
        if (running) G.fx.dust(cx() - facing * 6, feet(), 1);
      }
    }
  }

  void moveX(float dt, Level L) {
    x += vx * dt;
    if (L.rectSolid(x, y, w, h)) {
      if (vx > 0) x = (float) Math.floor((x + w) / Level.TS) * Level.TS - w - 0.001f;
      else if (vx < 0) x = ((float) Math.floor(x / Level.TS) + 1) * Level.TS + 0.001f;
      vx = 0;
    }
  }
  void moveY(float dt, Level L) {
    float prevFeet = feet();
    y += vy * dt;
    onGround = false;
    if (vy > 0) {
      if (L.rectSolid(x, y, w, h)) {
        int ty = (int) Math.floor(feet() / Level.TS);
        y = ty * Level.TS - h; vy = 0; onGround = true;
      } else if (dropT <= 0) {
        int ty = (int) Math.floor(feet() / Level.TS);
        float top = ty * Level.TS;
        if (prevFeet <= top + 0.5f) {
          int x0 = (int) Math.floor(x / Level.TS), x1 = (int) Math.floor((x + w - 0.01f) / Level.TS);
          for (int tx = x0; tx <= x1; tx++) if (L.tile(tx, ty) == Level.PLAT) { y = top - h; vy = 0; onGround = true; break; }
        }
      }
    } else if (vy < 0 && L.rectSolid(x, y, w, h)) {
      y = ((float) Math.floor(y / Level.TS) + 1) * Level.TS + 0.001f; vy = 0;
    }
  }

  static final Color HURT = new Color(1f, 0.42f, 0.42f, 1), HEAL = new Color(0.5f, 1f, 0.63f, 1);

  boolean damage(float amount, float srcX, Play G, float knock) {
    if (invT > 0 || dead || G.state != Play.State.PLAY) return false;
    hp = Math.max(0, hp - amount);
    invT = 1.0f; stunT = 0.3f;
    float d = Math.signum(cx() - srcX); if (d == 0) d = -facing;
    vx = d * knock; vy = -320; onGround = false;
    attackT = 0; comboQueued = false;
    if (crouch && canStand(G.level)) setCrouch(false);
    G.a.play("hurt");
    G.fx.number(cx(), y - 6, String.valueOf((int) amount), HURT);
    G.fx.blood(cx(), y + 26, 8, Fx.BLOOD);
    G.fx.shake(6, 0.25f);
    G.hitstop = 0.06f;
    if (hp <= 0) die(G);
    return true;
  }
  boolean damage(float amount, float srcX, Play G) { return damage(amount, srcX, G, 230); }

  void hazardHit(Play G) {
    hp = Math.max(0, hp - 15);
    G.fx.splash(cx(), Math.min(feet(), G.level.H * Level.TS - 20), 14);
    G.a.play("splash"); G.a.play("hurt");
    if (hp <= 0) { die(G); return; }
    G.fx.number(cx(), y, "15", HURT);
    if (crouch) setCrouch(false);
    x = safeX - w / 2; y = safeY - h; vx = 0; vy = 0; invT = 1.2f; stunT = 0.2f;
    G.fade = 0.5f;
  }
  void die(Play G) { dead = true; deadT = 0; invT = 0; G.a.play("death"); G.onPlayerDeath(); }
  void heal(Play G, int n) {
    float before = hp;
    hp = Math.min(maxHp, hp + n);
    if (hp > before) G.fx.number(cx(), y - 6, "+" + (int) (hp - before), HEAL);
  }

  void draw(Assets g) {
    // sombra elíptica
    g.sprite("dot", 0, cx(), feet() + 1, 4.2f, 1.1f, 0, 0, 0, 0, 0.45f);
    float alpha = 1;
    if (invT > 0 && !dead && ((int) (invT * 14)) % 2 == 0) alpha = 0.35f;
    String name; int f;
    if (dead) { name = "dead"; f = Math.min(5, (int) (deadT / 0.1f)); }
    else if (attackT > 0) {
      name = attackKind == 2 ? "atkc" : attackKind == 1 ? "atk1" : onGround ? "atk0" : "atkj";
      f = MathUtils.clamp((int) (attackS() * 8), 0, 7);
    } else if (stunT > 0) { name = "hurt"; f = 0; }
    else if (!onGround) { name = vy < 0 ? "jump" : "fall"; f = ((int) (t * 7)) % 2; }
    else if (crouch) {
      if (Math.abs(vx) > 10) { name = "crouchwalk"; f = frameOf(phase, 6); } else { name = "crouch"; f = 0; }
    } else {
      float s = Math.abs(vx);
      if (s > 200) { name = "run"; f = frameOf(phase, 8); }
      else if (s > 15) { name = "walk"; f = frameOf(phase, 8); }
      else { name = "idle"; f = frameOf(t * 2.4f, 8); }
    }
    g.sprite(name, f, cx(), feet() + 1, facing, alpha);
  }
  static int frameOf(float ph, int n) {
    float p = ph % MathUtils.PI2; if (p < 0) p += MathUtils.PI2;
    return Math.min(n - 1, (int) (p / MathUtils.PI2 * n));
  }
  static float approach(float v, float target, float step) {
    return v < target ? Math.min(v + step, target) : Math.max(v - step, target);
  }
}
