package io.github.rodcampos21.contosdoabismo;

import com.badlogic.gdx.graphics.g2d.BitmapFont;
import com.badlogic.gdx.math.MathUtils;
import com.badlogic.gdx.utils.Align;

/** Interface: vida, placas, barra do chefe e telas. Coordenadas de tela 960x544, y para baixo. */
public class Hud {
  static final float W = Assets.VIEW_W, H = Assets.VIEW_H;
  float hpTrail = 100, areaT, bannerT, bannerMax, signA, bossNameT;
  String areaName = "", bannerText = "", signText;

  static final String[][] CONTROLS = {
    { "← →  /  A D", "Andar" },
    { "SHIFT  /  L", "Correr (segure)" },
    { "ESPAÇO  /  Z", "Pular (segure = mais alto)" },
    { "↓  /  S", "Agachar" },
    { "X  /  J", "Atacar" },
    { "↓ + Pular", "Descer de plataforma fina" },
    { "ESC  /  P", "Pausar" },
    { "M", "Som liga/desliga" },
  };

  void showArea(String n) { areaName = n; areaT = 3.2f; }
  void banner(String text, float t) { bannerText = text; bannerT = t; bannerMax = t; }

  void update(float dt, Play G) {
    Player p = G.player;
    hpTrail = hpTrail > p.hp ? Player.approach(hpTrail, p.hp, dt * 40) : p.hp;
    if (areaT > 0) areaT -= dt;
    if (bannerT > 0) bannerT -= dt;
    if (bossNameT > 0) bossNameT -= dt;
    signA = Player.approach(signA, G.activeSign != null ? 1 : 0, dt * 6);
    if (G.activeSign != null) signText = G.activeSign.text;
  }

  static void small(Assets g, BitmapFont f, String s, float x, float y, int align, float scale, float r, float gg, float b, float a) {
    f.getData().setScale(scale);
    g.text(f, s, x, y, align, r, gg, b, a);
    f.getData().setScale(0.5f);
  }

  void draw(Assets g, Play G) {
    Player p = G.player;
    // retrato e vida
    g.panel(14, 12, 292, 66, 1);
    g.sprite("portrait", 0, 47, 45, 1);
    g.sprite("ringframe", 0, 47, 45, 1);
    g.text(g.fontUi, "RAIN", 82, 18, Align.left, 0.94f, 0.89f, 0.78f, 1);
    float bx = 82, by = 42, bw = 206, bh = 11;
    g.rect(bx - 2, by - 2, bw + 4, bh + 4, 0.02f, 0.02f, 0.04f, 1);
    g.rect(bx, by, bw * MathUtils.clamp(hpTrail / p.maxHp, 0, 1), bh, 1f, 0.94f, 0.86f, 0.75f);
    float hw = bw * MathUtils.clamp(p.hp / p.maxHp, 0, 1);
    g.rect(bx, by, hw, bh, 0.55f, 0.06f, 0.09f, 1);
    g.rect(bx, by, hw, bh * 0.55f, 0.82f, 0.16f, 0.2f, 1);
    g.rect(bx, by, hw, 2, 1f, 0.55f, 0.5f, 0.9f);
    g.rect(bx - 2, by - 2, bw + 4, 1, 0.64f, 0.57f, 0.37f, 1);
    g.rect(bx - 2, by + bh + 1, bw + 4, 1, 0.64f, 0.57f, 0.37f, 1);
    small(g, g.fontUi, "HP " + (int) Math.ceil(p.hp) + " / " + p.maxHp, bx, 57, Align.left, 0.36f, 0.91f, 0.86f, 0.75f, 1);
    small(g, g.fontUi, "Lâmina Partida", bx + bw, 57, Align.right, 0.36f, 0.6f, 0.65f, 0.75f, 1);

    // nome da área
    if (areaT > 0) {
      float a = MathUtils.clamp(Math.min(areaT, 3.2f - areaT) * 2, 0, 1);
      float w = g.text(g.fontTitle, areaName, W - 24, 22, Align.right, 0.94f, 0.89f, 0.78f, a);
      g.rect(W - 24 - w, 52, w, 1, 0.84f, 0.75f, 0.51f, a * 0.8f);
    }

    // placa de tutorial
    if (signA > 0.01f && signText != null) {
      float tw = 620;
      float th = g.wrappedHeight(g.fontBody, signText, tw);
      float h = 40 + th + 14;
      float y = H - h - 24 + (1 - signA) * 14;
      g.panel(W / 2 - 340, y, 680, h, signA);
      small(g, g.fontUi, "✦  INSCRIÇÃO ANTIGA  ✦", W / 2, y + 12, Align.center, 0.36f, 0.5f, 0.92f, 0.86f, signA);
      g.wrapped(g.fontBody, signText, W / 2 - tw / 2, y + 32, tw, Align.center, 0.93f, 0.9f, 0.82f, signA);
    }

    // barra do chefe
    Boss b = G.boss;
    if (G.bossFight && b.state != Boss.S.DORMANT && b.state != Boss.S.DEAD && !(b.state == Boss.S.EMERGE && b.t < 2.1f)) {
      float a = b.state == Boss.S.EMERGE ? MathUtils.clamp((b.t - 2.1f) * 2, 0, 1) : b.state == Boss.S.DYING ? MathUtils.clamp(1 - (b.t - 2.8f), 0, 1) : 1;
      float w = 560, x = W / 2 - w / 2, y = H - 36;
      small(g, g.fontTitle, "SURUBIM GUERREIRO", x, y - 32, Align.left, 0.3f, 0.94f, 0.89f, 0.78f, a);
      g.rect(x - 3, y - 3, w + 6, 16, 0.02f, 0.02f, 0.04f, a);
      g.rect(x, y, w * b.displayHp / b.maxHp, 10, 1f, 0.9f, 0.78f, 0.7f * a);
      float fw = w * b.hp / b.maxHp;
      if (b.phase == 2) { g.rect(x, y, fw, 10, 0.55f, 0.16f, 0.06f, a); g.rect(x, y, fw, 5, 1f, 0.6f, 0.2f, a); }
      else { g.rect(x, y, fw, 10, 0.48f, 0.33f, 0.08f, a); g.rect(x, y, fw, 5, 0.85f, 0.69f, 0.28f, a); }
      g.rect(x - 3, y - 3, w + 6, 1, 0.64f, 0.57f, 0.37f, a);
      g.rect(x - 3, y + 12, w + 6, 1, 0.64f, 0.57f, 0.37f, a);
      g.rect(x + w / 2 - 1, y - 5, 2, 20, 0.84f, 0.75f, 0.51f, a);
    }

    // apresentação do chefe
    if (bossNameT > 0) {
      float tt = 3.6f - bossNameT;
      float a = MathUtils.clamp(Math.min(tt * 2, bossNameT * 1.5f), 0, 1);
      g.rect(0, 85, W, 115, 0, 0, 0, 0.55f * a);
      float sp = 1 + (1 - Boss.easeOut(MathUtils.clamp(tt, 0, 1))) * 0.15f;
      g.sprite("bossname", 0, W / 2, 160, sp, 1, 0, 1, 1, 1, a);
    }

    // banner
    if (bannerT > 0) {
      float a = MathUtils.clamp(Math.min((bannerMax - bannerT) * 3, bannerT * 2), 0, 1);
      g.rect(0, 150, W, 60, 0, 0, 0, 0.55f * a);
      small(g, g.fontTitle, bannerText, W / 2, 162, Align.center, 0.42f, 0.94f, 0.89f, 0.78f, a);
    }
  }

  void drawControls(Assets g, float x, float y) {
    for (int i = 0; i < CONTROLS.length; i++) {
      small(g, g.fontUi, CONTROLS[i][0], x, y + i * 25, Align.left, 0.42f, 0.84f, 0.74f, 0.5f, 1);
      small(g, g.fontBody, CONTROLS[i][1], x + 170, y + i * 25 - 1, Align.left, 0.42f, 0.9f, 0.87f, 0.8f, 1);
    }
  }

  void drawTitle(Assets g, Play G) {
    g.tex(g.title, 0, 0, W, H);
    float t = G.time;
    g.sprite("logo", 0, W / 2, 112, 1, 1, 0, 1, 1, 1, MathUtils.clamp(t * 0.8f, 0, 1));
    g.panel(500, 228, 420, 236, 0.92f);
    drawControls(g, 524, 248);
    float blink = 0.55f + MathUtils.sin(t * 4) * 0.45f;
    small(g, g.fontTitle, "Pressione ENTER ou X para começar", W / 2, 488, Align.center, 0.4f, 0.94f, 0.89f, 0.78f, blink);
    small(g, g.fontBody, "Feito com LibGDX · arte cel-shaded gerada proceduralmente", W / 2, 520, Align.center, 0.32f, 0.5f, 0.56f, 0.7f, 1);
  }

  void drawPause(Assets g) {
    g.rect(0, 0, W, H, 0.01f, 0.02f, 0.04f, 0.75f);
    g.panel(W / 2 - 240, 80, 480, 350, 1);
    small(g, g.fontTitle, "PAUSA", W / 2, 100, Align.center, 0.6f, 0.94f, 0.89f, 0.78f, 1);
    drawControls(g, W / 2 - 205, 160);
    small(g, g.fontBody, "ESC para continuar", W / 2, 385, Align.center, 0.42f, 0.6f, 0.65f, 0.75f, 1);
  }

  void drawDeath(Assets g, Play G) {
    float a = MathUtils.clamp((G.player.deadT - 1.2f) * 1.2f, 0, 1);
    g.rect(0, 0, W, H, 0.08f, 0, 0, a * 0.75f);
    small(g, g.fontTitle, "VOCÊ PERECEU", W / 2, H / 2 - 50, Align.center, 0.95f, 0.75f, 0.13f, 0.17f, a);
    small(g, g.fontBody, "Pressione ENTER ou X para despertar novamente", W / 2, H / 2 + 14, Align.center, 0.48f, 0.9f, 0.84f, 0.78f, a);
  }

  void drawVictory(Assets g, Play G) {
    g.rect(0, 0, W, H, 0.015f, 0.02f, 0.05f, 0.85f);
    g.setAdditive(true);
    g.sprite("glow", 0, W / 2, 170, 1, 10, 0, 0.55f, 0.4f, 1f, 0.3f);
    g.setAdditive(false);
    small(g, g.fontBody, "O selo se rompe, e a escuridão abaixo chama seu nome...", W / 2, 96, Align.center, 0.46f, 0.72f, 0.66f, 0.9f, 1);
    small(g, g.fontTitle, "TUTORIAL CONCLUÍDO", W / 2, 132, Align.center, 0.8f, 0.94f, 0.89f, 0.78f, 1);
    g.panel(W / 2 - 210, 214, 420, 160, 1);
    int s = (int) G.elapsed;
    String tm = (s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60);
    String[][] rows = { { "Tempo", tm }, { "Mortes", String.valueOf(G.deaths) }, { "Chefe derrotado", "Surubim Guerreiro" }, { "Inimigos abatidos", String.valueOf(G.kills) } };
    for (int i = 0; i < rows.length; i++) {
      small(g, g.fontBody, rows[i][0], W / 2 - 180, 236 + i * 32, Align.left, 0.48f, 0.79f, 0.7f, 0.48f, 1);
      small(g, g.fontBody, rows[i][1], W / 2 + 180, 236 + i * 32, Align.right, 0.48f, 0.94f, 0.89f, 0.78f, 1);
    }
    small(g, g.fontTitle, "Pressione ENTER para voltar ao título", W / 2, 420, Align.center, 0.36f, 0.94f, 0.89f, 0.78f, 0.55f + MathUtils.sin(G.time * 4) * 0.45f);
  }
}
