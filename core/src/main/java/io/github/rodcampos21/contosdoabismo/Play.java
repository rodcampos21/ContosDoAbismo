package io.github.rodcampos21.contosdoabismo;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.Pixmap;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.math.MathUtils;
import com.badlogic.gdx.math.Rectangle;
import com.badlogic.gdx.scenes.scene2d.utils.ScissorStack;
import com.badlogic.gdx.utils.Array;
import com.badlogic.gdx.utils.viewport.FitViewport;

/** Estado do jogo, simulação e renderização. */
public class Play {
  enum State { TITLE, PLAY, PAUSED, DEAD, VICTORY }
  static final float W = Assets.VIEW_W, H = Assets.VIEW_H, STEP = 1f / 60f;

  final Assets a;
  final Controls in = new Controls();
  final Level level;
  final Fx fx = new Fx();
  final Hud hud = new Hud();
  Player player;
  final Boss boss = new Boss();
  final Array<Enemies.Entity> entities = new Array<>();
  final Array<Enemies.HealOrb> pickups = new Array<>();
  final Array<Boss.Hazard> hazards = new Array<>();
  State state = State.TITLE;
  float time, elapsed, acc, camX, hitstop, fade;
  int deaths, kills, area = -1;
  boolean control = true, bossFight, bossDefeated;
  Level.Sign activeSign;

  final OrthographicCamera cam = new OrthographicCamera(), uiCam = new OrthographicCamera();
  final FitViewport viewport = new FitViewport(W, H, cam);
  Texture vignette;
  final Rectangle scissors = new Rectangle(), clip = new Rectangle();
  final float[] fgPillars = { 480 + 1.3f * 300, 480 + 1.3f * 1150, 480 + 1.3f * 4950 };

  Play() {
    a = new Assets();
    level = new Level();
    player = new Player(level.startX, level.startY);
    spawnEntities();
    Gdx.input.setInputProcessor(in);
    uiCam.setToOrtho(false, W, H);
    // vinheta gerada em tempo de execução
    Pixmap pm = new Pixmap(240, 136, Pixmap.Format.RGBA8888);
    for (int y = 0; y < 136; y++) for (int x = 0; x < 240; x++) {
      float dx = (x - 120) / 120f, dy = (y - 68) / 68f;
      float d = (float) Math.sqrt(dx * dx * 0.85f + dy * dy * 0.75f);
      float al = MathUtils.clamp((d - 0.55f) / 0.75f, 0, 1);
      pm.drawPixel(x, y, Color.rgba8888(0, 0, 0.03f, al * 0.78f));
    }
    vignette = new Texture(pm);
    vignette.setFilter(Texture.TextureFilter.Linear, Texture.TextureFilter.Linear);
    pm.dispose();
    a.music("ambient");
  }

  void spawnEntities() {
    entities.clear();
    for (Level.Spawn s : level.spawns) {
      if (s.type.equals("bat")) entities.add(new Enemies.Bat(s.x, s.y));
      else if (s.type.equals("crawler")) entities.add(new Enemies.Crawler(s.x, s.y, s.min, s.max));
      else entities.add(new Enemies.Urn(s.x, s.y));
    }
  }

  void newGame() {
    player.reset(level.startX, level.startY);
    boss.reset(); spawnEntities(); hazards.clear(); pickups.clear();
    level.checkpointLit = false; level.resetGates();
    bossFight = bossDefeated = false; elapsed = 0; deaths = kills = 0; control = true; area = -1; camX = 0;
    fx.reset(); hud.hpTrail = 100; state = State.PLAY; fade = 1;
    a.music("ambient");
  }
  void respawn() {
    float px = level.checkpointLit ? level.checkX + 40 : level.startX, py = level.checkpointLit ? level.checkY : level.startY;
    player.reset(px, py);
    if (!bossDefeated) { boss.reset(); bossFight = false; if (level.setGate(0, false)) a.play("gate"); }
    spawnEntities(); hazards.clear(); pickups.clear();
    control = true; fx.reset(); hud.hpTrail = player.hp; state = State.PLAY; fade = 1; area = -1;
    a.music(bossDefeated ? "calm" : "ambient");
  }
  void onPlayerDeath() { deaths++; control = false; a.music(""); }
  void onBossDying() { hazards.clear(); a.music(""); hitstop = 0.25f; }
  void onBossDefeated() {
    bossDefeated = true; bossFight = false;
    level.setGate(0, false); level.setGate(1, false); a.play("gate");
    hud.banner("INIMIGO DERROTADO", 3.5f);
    a.play("victory"); a.music("calm");
    kills++;
  }
  void startBossFight() {
    bossFight = true;
    if (level.setGate(0, true)) a.play("gate");
    control = false; player.vx = 0;
    boss.start(); a.music("boss");
  }

  // ---------- loop ----------
  void render(float delta) {
    float dt = Math.min(0.1f, delta);
    acc += dt;
    while (acc >= STEP) { tick(STEP); acc -= STEP; }
    draw();
  }

  void tick(float dt) {
    in.update();
    time += dt;
    if (in.pressed(Controls.MUTE)) a.toggleMute();
    switch (state) {
      case TITLE:
        camX = 2 * Level.TS + MathUtils.sin(time * 0.15f) * 60 + 60;
        if (in.pressed(Controls.START) || in.pressed(Controls.ATTACK) || in.pressed(Controls.JUMP)) { a.play("select"); newGame(); }
        return;
      case VICTORY:
        if (in.pressed(Controls.START)) { a.play("select"); state = State.TITLE; a.music("ambient"); }
        return;
      case PAUSED:
        if (in.pressed(Controls.PAUSE) || in.pressed(Controls.START)) state = State.PLAY;
        return;
      case DEAD:
        player.update(dt, this); fx.update(dt);
        if (player.deadT > 1.6f && (in.pressed(Controls.START) || in.pressed(Controls.ATTACK) || in.pressed(Controls.JUMP))) respawn();
        return;
      default: break;
    }
    if (in.pressed(Controls.PAUSE)) { state = State.PAUSED; return; }
    debugWarp();
    if (fade > 0) fade -= dt * 1.5f;
    if (hitstop > 0) { hitstop -= dt; fx.update(dt * 0.2f); return; }

    elapsed += dt;
    Player p = player;
    p.update(dt, this);
    if (p.dead) state = State.DEAD;
    for (Enemies.Entity e : entities) e.update(dt, this);
    for (int i = pickups.size - 1; i >= 0; i--) { pickups.get(i).update(dt, this); if (pickups.get(i).dead) pickups.removeIndex(i); }
    boss.update(dt, this);
    for (int i = 0; i < hazards.size; i++) hazards.get(i).update(dt, this);
    combat();
    for (int i = hazards.size - 1; i >= 0; i--) if (hazards.get(i).dead) hazards.removeIndex(i);
    for (int i = entities.size - 1; i >= 0; i--) if (entities.get(i).dead) entities.removeIndex(i);

    for (Level.Gate g : level.gates) g.vis = Player.approach(g.vis, g.closed ? 1 : 0, dt * (g.closed ? 4 : 1.2f));
    if (!bossDefeated && !bossFight && p.x > level.bossTrigger && p.onGround && !p.dead) startBossFight();

    // vela de repouso
    if (Math.abs(p.cx() - level.checkX) < 34 && Math.abs(p.feet() - level.checkY) < 20 && !p.dead) {
      if (!level.checkpointLit || p.hp < p.maxHp) {
        boolean first = !level.checkpointLit;
        level.checkpointLit = true; p.hp = p.maxHp;
        a.play("save");
        fx.burst(level.checkX, level.checkY - 95, 30, Float.NaN, 0, 40, 200, 0.5f, 1f, 2, 4, new Color[] { COLD }, -60, 0, Fx.DOT, true);
        hud.banner(first ? "Vela de Repouso acesa — vida restaurada" : "Vida restaurada", 2.2f);
      }
    }
    if (bossDefeated && Math.abs(p.cx() - level.exitX) < 40 && !p.dead) { state = State.VICTORY; a.play("victory"); a.music("calm"); }

    activeSign = null;
    for (Level.Sign s : level.signs) {
      boolean near = Math.abs(p.cx() - s.x) < 46 && Math.abs(p.feet() - s.y) < 40;
      s.glow = Player.approach(s.glow, near ? 1 : 0, dt * 4);
      if (near) { activeSign = s; if (!s.read) { s.read = true; a.play("read", 0.6f); } }
    }
    float tx = p.cx() / Level.TS;
    for (int i = 0; i < level.areas.size; i++) {
      Level.Area ar = level.areas.get(i);
      if (tx >= ar.x0 && tx < ar.x1 && i != area) { area = i; hud.showArea(ar.name); }
    }
    ambient(dt);
    fx.update(dt);
    hud.update(dt, this);
    float target = bossFight || boss.state == Boss.S.DYING ? level.arenaX0 : p.cx() - W / 2 + p.facing * 50;
    target = MathUtils.clamp(target, 0, level.W * Level.TS - W);
    camX = MathUtils.lerp(camX, target, Math.min(1, dt * (bossFight ? 3 : 6)));
  }

  /** Atalhos de teste (F2-F6): teleporta para cada seção da área. */
  void debugWarp() {
    int[] keys = { Input.Keys.F2, Input.Keys.F3, Input.Keys.F4, Input.Keys.F5, Input.Keys.F6 };
    float[][] pos = { { 40 * Level.TS, 11 * Level.TS }, { 77 * Level.TS, 14 * Level.TS }, { 104 * Level.TS, 14 * Level.TS }, { 131 * Level.TS, 14 * Level.TS }, { 140 * Level.TS, 14 * Level.TS } };
    for (int i = 0; i < keys.length; i++) if (Gdx.input.isKeyJustPressed(keys[i])) {
      player.x = pos[i][0] - player.w / 2; player.y = pos[i][1] - player.h; player.vx = player.vy = 0;
      camX = MathUtils.clamp(pos[i][0] - W / 2, 0, level.W * Level.TS - W);
    }
  }

  static final Color COLD = new Color(0.48f, 0.82f, 1f, 1);
  static final Color[] SHARDS = { new Color(0.54f, 0.31f, 0.2f, 1), new Color(0.29f, 0.16f, 0.11f, 1), new Color(0.79f, 0.64f, 0.42f, 1) };
  static final Color[] SOUL = { new Color(0.47f, 0.35f, 0.78f, 0.6f) };
  static final Color GREY = new Color(0.67f, 0.71f, 0.78f, 1);

  void combat() {
    Player p = player;
    Rectangle ab = p.attackBox();
    float base = p.attackKind == 2 ? 10 : 12;
    if (ab != null) {
      for (Enemies.Entity e : entities) {
        if (e.dead || p.hitList.contains(e) || !ab.overlaps(e.box())) continue;
        p.hitList.add(e);
        Rectangle b = e.box();
        float hx = MathUtils.clamp(p.cx() + p.facing * 30, b.x, b.x + b.width), hy = b.y + b.height / 2;
        if (e.kind.equals("urn")) {
          e.dead = true; a.play("break");
          fx.burst(e.x, e.y - 16, 16, Float.NaN, 0, 80, 260, 0.4f, 0.8f, 2, 4, SHARDS, 1000, 0, Fx.DOT, false);
          if (MathUtils.randomBoolean(0.8f)) pickups.add(new Enemies.HealOrb(e.x, e.y - 22, 25));
          continue;
        }
        float dmg = base + MathUtils.random(0, 2);
        e.hit(dmg, p.cx());
        a.play("hit");
        fx.sparks(hx, hy, p.facing > 0 ? 0 : MathUtils.PI, 8);
        fx.blood(hx, hy, 6, Fx.SLIME);
        fx.number(hx, b.y - 6, String.valueOf((int) dmg), Color.WHITE);
        hitstop = 0.035f;
        if (e.hp <= 0) {
          e.dead = true; kills++;
          a.play("enemydie");
          fx.burst(e.x, e.y - 8, 22, Float.NaN, 0, 60, 260, 0.4f, 0.9f, 2, 5, Fx.SLIME, 500, 0, Fx.DOT, false);
          fx.burst(e.x, e.y - 8, 10, Float.NaN, 0, 20, 80, 0.6f, 1f, 4, 8, SOUL, -100, 0, Fx.DOT, true);
          if (MathUtils.randomBoolean(0.35f)) pickups.add(new Enemies.HealOrb(e.x, e.y - 10, 15));
        }
      }
      if (boss.active() && !p.hitList.contains(boss) && (ab.overlaps(boss.bodyBox()) || ab.overlaps(boss.headBox()))) {
        p.hitList.add(boss);
        float hx = p.cx() + p.facing * 44, hy = p.feet() - (p.attackKind == 2 ? 20 : 52);
        if (boss.isBlocking(p)) {
          a.play("clang");
          fx.sparks(boss.x + boss.facing * 60, hy, boss.facing > 0 ? 0 : MathUtils.PI, 16);
          fx.number(boss.x + boss.facing * 50, boss.y - 170, "Bloqueado", GREY);
          p.vx = -p.facing * 240;
          hitstop = 0.06f;
        } else if (boss.vulnerable()) {
          boss.takeHit(base + MathUtils.random(0, 2), this);
          fx.sparks(hx, hy, p.facing > 0 ? 0 : MathUtils.PI, 10);
          fx.blood(hx, hy, 8, Fx.SLIME);
          hitstop = 0.045f;
        } else {
          a.play("clang");
          fx.sparks(hx, hy, p.facing > 0 ? MathUtils.PI : 0, 8);
        }
      }
    }
    if (!p.dead) {
      for (Enemies.Entity e : entities) if (e.contact > 0 && !e.dead && e.box().overlaps(p.box())) p.damage(e.contact, e.x, this);
      for (Boss.Hazard h : hazards) {
        if (h.harmful() && !h.dead && h.box().overlaps(p.box())) {
          if (p.damage(h.dmg, h.x, this) && h instanceof Boss.Glob) h.dead = true;
        }
      }
    }
  }

  void ambient(float dt) {
    if (MathUtils.randomBoolean(dt * 6)) fx.add(camX + MathUtils.random(W), MathUtils.random(80, 440), MathUtils.random(-8, 8), MathUtils.random(-10, -3), MathUtils.random(2, 4), MathUtils.random(0.8f, 1.6f), DUSTMOTE, 0, Fx.DOT, true);
    if (MathUtils.randomBoolean(dt * 1.2f)) {
      float x = camX + MathUtils.random(W);
      int tx = (int) (x / Level.TS);
      for (int ty = 1; ty < 13; ty++) if (level.solid(tx, ty) && !level.solid(tx, ty + 1)) { fx.add(x, (ty + 1) * Level.TS + 2, 0, 0, 1.2f, 1.6f, DRIP, 900, Fx.DOT, false); break; }
    }
    Player p = player;
    if (p.cx() > level.arenaX0 && p.cx() < level.arenaX1 && p.onGround && Math.abs(p.vx) > 120 && MathUtils.randomBoolean(dt * 10)) fx.splash(p.cx(), Level.FLOOR_Y - 2, 2);
  }
  static final Color DUSTMOTE = new Color(0.78f, 0.82f, 1f, 0.35f), DRIP = new Color(0.67f, 0.86f, 0.94f, 0.8f);

  // ---------- renderização ----------
  void resize(int w, int h) { viewport.update(w, h, false); }

  void draw() {
    Gdx.gl.glClearColor(0.02f, 0.02f, 0.04f, 1);
    Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);
    viewport.apply();
    float sx = 0, sy = 0;
    if (fx.shakeT > 0) { sx = MathUtils.random(-1f, 1f) * fx.shakeMag; sy = MathUtils.random(-1f, 1f) * fx.shakeMag; }
    cam.position.set(camX + W / 2 + sx, H / 2 + sy, 0);
    cam.update();
    a.batch.setProjectionMatrix(cam.combined);
    a.batch.begin();
    drawWorld();
    a.batch.end();

    uiCam.update();
    a.batch.setProjectionMatrix(uiCam.combined);
    a.batch.begin();
    a.batch.draw(vignette, 0, 0, W, H);
    if (fx.flashT > 0) a.rect(0, 0, W, H, fx.flashCol.r, fx.flashCol.g, fx.flashCol.b, MathUtils.clamp(fx.flashT * 3, 0, 0.6f));
    if (fade > 0) a.rect(0, 0, W, H, 0, 0, 0, MathUtils.clamp(fade, 0, 1));
    if (state == State.TITLE) hud.drawTitle(a, this);
    else {
      hud.draw(a, this);
      if (state == State.PAUSED) hud.drawPause(a);
      if (state == State.DEAD) hud.drawDeath(a, this);
      if (state == State.VICTORY) hud.drawVictory(a, this);
    }
    a.batch.end();
  }

  void drawWorld() {
    float cx = camX;
    // camadas distantes com paralaxe
    float cist = MathUtils.clamp((cx - (level.arenaX0 - 900)) / 600f, 0, 1) * MathUtils.clamp(((level.arenaX1 + 300) - cx) / 300f, 0, 1);
    float u0 = cx * 0.35f / 1024f;
    a.batch.disableBlending();
    a.texRegion(a.farNave, cx - 40, 0, W + 80, H, u0, 0, u0 + (W + 80) / 1024f, 1, 1);
    a.batch.enableBlending();
    if (cist > 0) a.texRegion(a.farCistern, cx - 40, 0, W + 80, H, u0, 0, u0 + (W + 80) / 1024f, 1, cist);
    float u1 = cx * 0.65f / 1024f;
    a.texRegion(a.mid, cx - 40, 0, W + 80, H, u1, 0, u1 + (W + 80) / 1024f, 1, 1);
    // parede próxima
    int c0 = Math.max(0, (int) ((cx - 40) / 512)), c1 = Math.min(a.near.length - 1, (int) ((cx + W + 40) / 512));
    for (int i = c0; i <= c1; i++) a.tex(a.near[i], i * 512, 0, 512, H);

    // velas
    a.setAdditive(true);
    for (Level.Candle c : level.candles) {
      if (c.x < cx - 160 || c.x > cx + W + 160) continue;
      float f = 0.85f + MathUtils.sin(time * 9 + c.seed) * 0.08f + MathUtils.sin(time * 23 + c.seed * 2) * 0.05f;
      float cy = c.stand ? c.y - 82 : c.y - 16;
      a.sprite("glow", 0, c.x, cy, 1, 3.6f * f, 0, 1f, 0.55f, 0.22f, 0.32f);
    }
    a.setAdditive(false);
    for (Level.Candle c : level.candles) {
      if (c.x < cx - 60 || c.x > cx + W + 60) continue;
      int ff = ((int) (time * 12 + c.seed * 3)) % 6;
      if (c.stand) {
        a.sprite("candelabra", 0, c.x, c.y, 1);
        a.sprite("flame", ff, c.x - 16, c.y - 78, 1); a.sprite("flame", (ff + 2) % 6, c.x, c.y - 81, 1); a.sprite("flame", (ff + 4) % 6, c.x + 16, c.y - 78, 1);
      } else {
        a.sprite("sconce", 0, c.x, c.y, 1);
        a.sprite("flame", ff, c.x, c.y - 10, 1);
      }
    }
    // placas
    for (Level.Sign s : level.signs) {
      if (s.x < cx - 60 || s.x > cx + W + 60) continue;
      a.sprite("sign", 0, s.x, s.y + 1, 1);
      float ga = 0.45f + s.glow * 0.55f + MathUtils.sin(time * 3 + s.x) * 0.1f;
      a.setAdditive(true);
      a.sprite("rune", 0, s.x, s.y - 2, 1, 1, 0, 1, 1, 1, ga);
      a.sprite("glow", 0, s.x, s.y - 24, 1, 1.2f, 0, 0.3f, 0.9f, 0.85f, ga * 0.5f);
      a.setAdditive(false);
    }
    // vela de repouso
    if (level.checkX > cx - 200 && level.checkX < cx + W + 200) {
      a.sprite("checkpoint", 0, level.checkX, level.checkY + 1, 1);
      a.setAdditive(true);
      if (level.checkpointLit) {
        a.sprite("glow", 0, level.checkX, level.checkY - 104, 1, 5f, 0, 0.25f, 0.6f, 1f, 0.45f);
        a.setAdditive(false);
        a.sprite("flame_cold", ((int) (time * 12)) % 6, level.checkX, level.checkY - 95, 1, 1.8f, 0, 1, 1, 1, 1);
      } else {
        a.sprite("glow", 0, level.checkX, level.checkY - 50, 1, 1.4f, 0, 0.25f, 0.6f, 1f, 0.3f + MathUtils.sin(time * 2) * 0.15f);
        a.setAdditive(false);
      }
    }
    // selo de saída
    if (level.exitX > cx - 200 && level.exitX < cx + W + 200) {
      float al = bossDefeated ? 1 : 0.3f;
      a.setAdditive(true);
      a.sprite("glow", 0, level.exitX, level.exitY - 74, 1, 4f, 0, 0.55f, 0.35f, 1f, 0.5f * al);
      a.sprite("seal0", 0, level.exitX, level.exitY - 74, 1, 1, time * 25, 1, 1, 1, al);
      a.sprite("seal1", 0, level.exitX, level.exitY - 74, 1, 1, -time * 45, 1, 1, 1, al);
      a.setAdditive(false);
    }

    // blocos sólidos
    for (int i = c0; i <= c1; i++) a.tex(a.tiles[i], i * 512, 0, 512, H);
    // água do vão com estacas
    float wx0 = 46 * Level.TS, wx1 = 52 * Level.TS;
    if (wx1 > cx && wx0 < cx + W) {
      float u = time * 0.05f;
      a.texRegionSub("water", wx0, 16 * Level.TS + 6, wx1 - wx0, 26, u, 0.85f);
    }
    // portões
    for (Level.Gate g : level.gates) {
      if (g.vis <= 0.01f) continue;
      float top = g.y0 * Level.TS, bottom = (g.y1 + 1) * Level.TS, hh = bottom - top;
      float gx = g.tx * Level.TS - 4;
      a.batch.flush();
      clip.set(gx - 4, Assets.gy(bottom + 12), 48, hh + 12);
      ScissorStack.calculateScissors(cam, a.batch.getTransformMatrix(), clip, scissors);
      if (ScissorStack.pushScissors(scissors)) {
        float lift = (1 - g.vis) * hh;
        a.sprite("gate", 0, gx, top - lift - (400 - hh) , 1);
        a.batch.flush();
        ScissorStack.popScissors();
      }
    }

    for (Enemies.Entity e : entities) if (e.x > cx - 80 && e.x < cx + W + 80) e.draw(a);
    for (Enemies.HealOrb o : pickups) o.draw(a);
    // chefe (recortado no nível do piso para emergir da água)
    if (boss.active()) {
      a.batch.flush();
      clip.set(level.arenaX0 - 300, Assets.gy(Level.FLOOR_Y + 3), level.arenaX1 - level.arenaX0 + 600, H);
      ScissorStack.calculateScissors(cam, a.batch.getTransformMatrix(), clip, scissors);
      if (ScissorStack.pushScissors(scissors)) {
        boss.draw(a);
        a.batch.flush();
        ScissorStack.popScissors();
      }
    }
    if (state != State.TITLE) player.draw(a);
    for (Boss.Hazard h : hazards) h.draw(a);
    // água rasa da cisterna (primeiro plano)
    if (level.arenaX1 > cx && level.arenaX0 < cx + W) {
      float depth = boss.phase == 2 && !bossDefeated ? 18 : 12;
      a.texRegionSub("water", level.arenaX0, Level.FLOOR_Y - depth, level.arenaX1 - level.arenaX0, depth + 8, time * 0.04f, 0.9f);
    }
    fx.draw(a);
    // primeiro plano com paralaxe
    for (float wx : fgPillars) {
      float x = wx - cx * 1.3f + cx;
      if (x < cx - 120 || x > cx + W + 120) continue;
      a.sprite("fg_pillar", 0, x, 0, 1, 1, 0, 1, 1, 1, 0.92f);
      a.sprite("fg_chain", 0, x + 46, 0, 1, 1, 0, 1, 1, 1, 0.9f);
    }
  }

  void dispose() { a.dispose(); vignette.dispose(); }
}
