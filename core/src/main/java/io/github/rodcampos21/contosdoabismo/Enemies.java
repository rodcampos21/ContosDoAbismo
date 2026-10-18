package io.github.rodcampos21.contosdoabismo;

import com.badlogic.gdx.math.MathUtils;
import com.badlogic.gdx.math.Rectangle;

/** Inimigos menores, urnas e orbes de vida. */
public class Enemies {
  public abstract static class Entity {
    String kind; float x, y, hp; boolean dead; float contact, flash, t;
    final Rectangle r = new Rectangle();
    abstract Rectangle box();
    abstract void update(float dt, Play G);
    abstract void hit(float dmg, float srcX);
    abstract void draw(Assets g);
  }

  public static class Bat extends Entity {
    float hx, hy, st, vx, vy, facing = 1; int state; // 0 pairando, 1 mergulho, 2 retorno
    Bat(float x, float y) { kind = "bat"; this.x = hx = x; this.y = hy = y; hp = 20; t = MathUtils.random(5f); contact = 8; }
    Rectangle box() { return r.set(x - 14, y - 9, 28, 18); }
    void update(float dt, Play G) {
      t += dt; st += dt; if (flash > 0) flash -= dt;
      Player p = G.player;
      float dx = p.cx() - x, dy = (p.y + 24) - y;
      if (state == 0) {
        x = MathUtils.lerp(x, hx + MathUtils.sin(t * 1.3f) * 40, dt * 3);
        y = MathUtils.lerp(y, hy + MathUtils.sin(t * 2.6f) * 14, dt * 3);
        facing = dx < 0 ? -1 : 1;
        if (Math.abs(dx) < 260 && Math.abs(dy) < 220 && st > 1.2f && !p.dead) {
          state = 1; st = 0;
          float d = (float) Math.sqrt(dx * dx + dy * dy); if (d < 1) d = 1;
          vx = dx / d * 260; vy = dy / d * 260;
        }
      } else if (state == 1) {
        x += vx * dt; y += vy * dt;
        if (st > 0.9f || G.level.rectSolid(x - 6, y - 6, 12, 12)) { state = 2; st = 0; }
      } else {
        x = MathUtils.lerp(x, hx, dt * 2.2f); y = MathUtils.lerp(y, hy, dt * 2.2f);
        if (st > 1.2f) { state = 0; st = 0; }
      }
    }
    void hit(float dmg, float srcX) { hp -= dmg; flash = 0.1f; state = 2; st = 0; x += Math.signum(x - srcX) * 14; }
    void draw(Assets g) {
      int f = ((int) (t * 14)) % 6;
      g.sprite("bat", f, x, y, facing, flash > 0 ? 0.6f : 1f);
      if (flash > 0) { g.setAdditive(true); g.sprite("bat", f, x, y, facing, 0.8f); g.setAdditive(false); }
    }
  }

  public static class Crawler extends Entity {
    float min, max, facing = -1, pause;
    Crawler(float x, float y, float min, float max) { kind = "crawler"; this.x = x; this.y = y; this.min = min; this.max = max; hp = 24; t = MathUtils.random(3f); contact = 9; }
    Rectangle box() { return r.set(x - 15, y - 18, 32, 18); }
    void update(float dt, Play G) {
      t += dt; if (flash > 0) flash -= dt;
      if (pause > 0) { pause -= dt; return; }
      Player p = G.player;
      boolean near = Math.abs(p.cx() - x) < 160 && Math.abs(p.feet() - y) < 40;
      float sp = near ? 95 : 55;
      if (near) facing = p.cx() < x ? -1 : 1;
      x += facing * sp * dt;
      if (x < min) { x = min; facing = 1; }
      if (x > max) { x = max; facing = -1; }
    }
    void hit(float dmg, float srcX) { hp -= dmg; flash = 0.12f; pause = 0.35f; x = MathUtils.clamp(x + Math.signum(x - srcX) * 10, min, max); }
    void draw(Assets g) {
      g.sprite("dot", 0, x, y, 4.5f, 1f, 0, 0, 0, 0, 0.35f);
      if (pause > 0) g.sprite("crawler_hit", 0, x, y, facing, flash > 0 ? 0.7f : 1f);
      else g.sprite("crawler", ((int) (t * 10)) % 6, x, y, facing);
      if (flash > 0) { g.setAdditive(true); g.sprite("crawler_hit", 0, x, y, facing, 0.7f); g.setAdditive(false); }
    }
  }

  public static class Urn extends Entity {
    Urn(float x, float y) { kind = "urn"; this.x = x; this.y = y; hp = 1; }
    Rectangle box() { return r.set(x - 13, y - 34, 26, 34); }
    void update(float dt, Play G) { t += dt; }
    void hit(float dmg, float srcX) { hp = 0; }
    void draw(Assets g) { g.sprite("urn", 0, x, y + 1, 1); }
  }

  public static class HealOrb {
    float x, y, vy = -260, t; int amount; boolean dead, grounded;
    final Rectangle r = new Rectangle();
    HealOrb(float x, float y, int amount) { this.x = x; this.y = y; this.amount = amount; }
    void update(float dt, Play G) {
      t += dt;
      if (!grounded) {
        vy += 1200 * dt; y += vy * dt;
        int ty = (int) Math.floor((y + 10) / Level.TS), tx = (int) Math.floor(x / Level.TS);
        char c = G.level.tile(tx, ty);
        if (vy > 0 && (c == Level.STONE || c == Level.FLOOR || c == Level.PLAT)) { y = ty * Level.TS - 16; grounded = true; }
      }
      Player p = G.player;
      if (!p.dead && r.set(x - 11, y - 11, 22, 22).overlaps(p.box())) {
        dead = true;
        p.heal(G, amount);
        G.a.play("heal");
        G.fx.burst(x, y, 14, Float.NaN, 0, 40, 160, 0.3f, 0.6f, 2, 4, HEALC, 0, 0, Fx.DOT, true);
      }
    }
    void draw(Assets g) {
      float b = MathUtils.sin(t * 4) * 3;
      g.setAdditive(true);
      g.sprite("glow", 0, x, y + b, 1, 0.9f, 0, 1f, 0.25f, 0.35f, 0.6f);
      g.setAdditive(false);
      g.sprite("healorb", 0, x, y + b, MathUtils.cos(t * 3), 1f, 0, 1, 1, 1, 1);
    }
  }
  static final com.badlogic.gdx.graphics.Color[] HEALC = { new com.badlogic.gdx.graphics.Color(1f, 0.54f, 0.63f, 1), new com.badlogic.gdx.graphics.Color(1f, 0.82f, 0.86f, 1) };
}
