package io.github.rodcampos21.contosdoabismo;

import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.math.MathUtils;
import com.badlogic.gdx.utils.Align;
import com.badlogic.gdx.utils.Array;

/** Partículas, números de dano, tremor e clarão de tela. */
public class Fx {
  public static final int DOT = 0, SPARK = 1, RING = 2, GLOW = 3, SPLASHC = 4, HITSTAR = 5;

  public static class P {
    float x, y, vx, vy, life, max, size, g, drag; int type; boolean add; float r, gg, b, a;
  }
  static class Num { float x, y, vy, life; String text; float r, g, b; }

  final Array<P> parts = new Array<>(false, 512);
  final Array<Num> nums = new Array<>();
  public float shakeT, shakeMag, flashT;
  public final Color flashCol = new Color(1, 1, 1, 1);

  public void reset() { parts.clear(); nums.clear(); shakeT = 0; shakeMag = 0; flashT = 0; }
  public void shake(float mag, float t) { shakeMag = Math.max(shakeT > 0 ? shakeMag : 0, mag); shakeT = Math.max(shakeT, t); }
  public void flash(Color c, float t) { flashCol.set(c); flashT = t; }

  public P add(float x, float y, float vx, float vy, float life, float size, Color c, float g, int type, boolean add) {
    P p = new P();
    p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.size = size; p.g = g; p.type = type; p.add = add;
    p.r = c.r; p.gg = c.g; p.b = c.b; p.a = c.a;
    if (parts.size < 900) parts.add(p);
    return p;
  }
  public void burst(float x, float y, int n, float angle, float spread, float s0, float s1, float l0, float l1, float z0, float z1,
      Color[] cols, float g, float drag, int type, boolean add) {
    for (int i = 0; i < n; i++) {
      float a = Float.isNaN(angle) ? MathUtils.random(MathUtils.PI2) : angle + MathUtils.random(-spread, spread);
      float sp = MathUtils.random(s0, s1);
      P p = add(x, y, MathUtils.cos(a) * sp, MathUtils.sin(a) * sp, MathUtils.random(l0, l1), MathUtils.random(z0, z1), cols[MathUtils.random(cols.length - 1)], g, type, add);
      p.drag = drag;
    }
  }

  static final Color[] SPARKS = { new Color(1f, 0.96f, 0.82f, 1), new Color(1f, 0.82f, 0.48f, 1), Color.WHITE };
  static final Color[] SLIME = { new Color(0.23f, 0.29f, 0.10f, 1), new Color(0.33f, 0.41f, 0.16f, 1), new Color(0.6f, 0.69f, 0.38f, 1) };
  static final Color[] BLOOD = { new Color(0.54f, 0.1f, 0.1f, 1), new Color(0.69f, 0.16f, 0.16f, 1), new Color(0.35f, 0.05f, 0.05f, 1) };
  static final Color[] DUST = { new Color(0.55f, 0.59f, 0.67f, 0.5f), new Color(0.4f, 0.43f, 0.51f, 0.5f) };
  static final Color[] WATER = { new Color(0.56f, 0.82f, 0.88f, 1), new Color(0.37f, 0.66f, 0.75f, 1), new Color(0.78f, 0.94f, 1f, 1) };

  public void sparks(float x, float y, float dir, int n) {
    burst(x, y, n, dir, Float.isNaN(dir) ? 0 : 0.9f, 150, 420, 0.15f, 0.4f, 0.8f, 1.4f, SPARKS, 600, 0, SPARK, true);
    add(x, y, 0, 0, 0.12f, 1.2f, Color.WHITE, 0, HITSTAR, true);
  }
  public void blood(float x, float y, int n, Color[] cols) { burst(x, y, n, Float.NaN, 0, 60, 260, 0.3f, 0.7f, 2, 4, cols, 900, 0, DOT, false); }
  public void dust(float x, float y, int n) { burst(x, y, n, -MathUtils.HALF_PI, 1.4f, 20, 90, 0.3f, 0.6f, 3, 6, DUST, -20, 2, DOT, false); }
  public void splash(float x, float y, int n) {
    burst(x, y, n, -MathUtils.HALF_PI, 1.0f, 150, 420, 0.4f, 0.9f, 2, 4.5f, WATER, 1100, 0, DOT, false);
    if (n >= 10) add(x, y, 0, 0, 0.4f, 1f + n / 30f, Color.WHITE, 0, SPLASHC, false);
  }
  public void number(float x, float y, String text, Color c) {
    Num n = new Num(); n.x = x; n.y = y; n.vy = -60; n.life = 0.8f; n.text = text; n.r = c.r; n.g = c.g; n.b = c.b;
    nums.add(n);
  }

  public void update(float dt) {
    for (int i = parts.size - 1; i >= 0; i--) {
      P p = parts.get(i);
      p.life -= dt;
      if (p.life <= 0) { parts.removeIndex(i); continue; }
      p.vy += p.g * dt;
      if (p.drag > 0) { p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt; }
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
    for (int i = nums.size - 1; i >= 0; i--) {
      Num n = nums.get(i);
      n.life -= dt; n.y += n.vy * dt; n.vy *= 1 - 3 * dt;
      if (n.life <= 0) nums.removeIndex(i);
    }
    if (shakeT > 0) { shakeT -= dt; if (shakeT <= 0) shakeMag = 0; }
    if (flashT > 0) flashT -= dt;
  }

  public void draw(Assets g) {
    for (int pass = 0; pass < 2; pass++) {
      g.setAdditive(pass == 1);
      for (P p : parts) {
        if (p.add != (pass == 1)) continue;
        float a = MathUtils.clamp(p.life / p.max, 0, 1);
        switch (p.type) {
          case SPARK: {
            float rot = MathUtils.atan2(-p.vy, p.vx) * MathUtils.radiansToDegrees;
            g.sprite("spark", 0, p.x, p.y, 1, p.size, rot, p.r, p.gg, p.b, a * p.a);
            break;
          }
          case RING: g.sprite("ring", 0, p.x, p.y, 1, p.size / 6f * (1.5f - a), 0, p.r, p.gg, p.b, a * p.a); break;
          case GLOW: g.sprite("glow", 0, p.x, p.y, 1, p.size / 32f, 0, p.r, p.gg, p.b, a * p.a); break;
          case SPLASHC: {
            int f = MathUtils.clamp((int) ((1 - a) * 4), 0, 3);
            g.sprite("splash", f, p.x, p.y, 1, p.size, 0, 1, 1, 1, 1);
            break;
          }
          case HITSTAR: g.sprite("hitstar", 0, p.x, p.y, 1, p.size * (0.6f + (1 - a)), a * 90, 1, 1, 1, a); break;
          default: g.sprite("dot", 0, p.x, p.y, 1, p.size * (0.5f + a * 0.5f) / 3f, 0, p.r, p.gg, p.b, a * p.a);
        }
      }
    }
    g.setAdditive(false);
    for (Num n : nums) {
      float a = MathUtils.clamp(n.life / 0.3f, 0, 1);
      g.text(g.fontNum, n.text, n.x, n.y - 14, Align.center, n.r, n.g, n.b, a);
    }
  }
}
