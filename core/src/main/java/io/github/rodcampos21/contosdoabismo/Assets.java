package io.github.rodcampos21.contosdoabismo;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.audio.Music;
import com.badlogic.gdx.audio.Sound;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.BitmapFont;
import com.badlogic.gdx.graphics.g2d.GlyphLayout;
import com.badlogic.gdx.graphics.g2d.NinePatch;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureAtlas;
import com.badlogic.gdx.graphics.g2d.TextureAtlas.AtlasRegion;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.utils.Align;
import com.badlogic.gdx.utils.Array;
import com.badlogic.gdx.utils.JsonReader;
import com.badlogic.gdx.utils.JsonValue;
import com.badlogic.gdx.utils.ObjectMap;

/** Carrega a arte e oferece funções de desenho em coordenadas "y para baixo" (como no mapa). */
public class Assets {
  public static final float VIEW_W = 960, VIEW_H = 544;

  public final SpriteBatch batch;
  private final Array<TextureAtlas> atlases = new Array<>();
  private final ObjectMap<String, Array<AtlasRegion>> anims = new ObjectMap<>();
  private final ObjectMap<String, float[]> meta = new ObjectMap<>();
  public Texture[] near, tiles;
  public Texture farNave, farCistern, mid, title;
  public BitmapFont fontUi, fontBody, fontTitle, fontNum;
  public NinePatch panel;
  public TextureRegion pixel;
  private final ObjectMap<String, Sound> sounds = new ObjectMap<>();
  private final ObjectMap<String, Music> musics = new ObjectMap<>();
  private Music currentMusic;
  private String currentMusicName = "";
  public boolean muted = false;
  private final GlyphLayout layout = new GlyphLayout();
  private final Color tmp = new Color();
  private boolean additive = false;

  public Assets() {
    batch = new SpriteBatch(4000);
    JsonValue sprites = new JsonReader().parse(Gdx.files.internal("data/sprites.json"));
    for (JsonValue v = sprites.child; v != null; v = v.next) {
      meta.put(v.name, new float[] { v.getFloat("scale"), v.getFloat("ax"), v.getFloat("ay"), v.getFloat("w"), v.getFloat("h") });
    }
    for (String a : new String[] { "rain", "boss", "obj", "fx", "ui" }) {
      TextureAtlas atlas = new TextureAtlas(Gdx.files.internal("gfx/" + a + ".atlas"));
      atlases.add(atlas);
      for (Texture t : atlas.getTextures()) t.setFilter(Texture.TextureFilter.Linear, Texture.TextureFilter.Linear);
      for (AtlasRegion r : atlas.getRegions()) {
        Array<AtlasRegion> list = anims.get(r.name);
        if (list == null) { list = new Array<>(); anims.put(r.name, list); }
        list.add(r);
      }
    }
    for (Array<AtlasRegion> list : anims.values()) list.sort((x, y) -> x.index - y.index);

    JsonValue layers = new JsonReader().parse(Gdx.files.internal("data/layers.json"));
    near = loadChunks("near", layers.get("near").getInt("count"), "png");
    tiles = loadChunks("tiles", layers.get("tiles").getInt("count"), "png");
    farNave = tex("gfx/far_nave.jpg");
    farCistern = tex("gfx/far_cistern.jpg");
    mid = tex("gfx/mid.png");
    title = tex("gfx/title.jpg");
    farNave.setWrap(Texture.TextureWrap.Repeat, Texture.TextureWrap.ClampToEdge);
    farCistern.setWrap(Texture.TextureWrap.Repeat, Texture.TextureWrap.ClampToEdge);
    mid.setWrap(Texture.TextureWrap.Repeat, Texture.TextureWrap.ClampToEdge);

    fontUi = font("ui"); fontBody = font("body"); fontTitle = font("title"); fontNum = font("num");

    AtlasRegion p = region("panel", 0);
    panel = new NinePatch(p, 28, 28, 28, 28);
    panel.scale(0.5f, 0.5f);
    AtlasRegion px = region("pixel", 0);
    pixel = new TextureRegion(px, 1, 1, 2, 2);

    for (String s : new String[] { "jump", "land", "step", "swing", "hit", "clang", "hurt", "break", "heal", "save", "enemydie", "roar",
        "slam", "splash", "spit", "bubble", "geyser", "windup", "gate", "bosshit", "death", "victory", "select", "read" }) {
      sounds.put(s, Gdx.audio.newSound(Gdx.files.internal("sfx/" + s + ".mp3")));
    }
    for (String m : new String[] { "ambient", "boss", "calm" }) {
      Music mu = Gdx.audio.newMusic(Gdx.files.internal("music/" + m + ".mp3"));
      mu.setLooping(true);
      musics.put(m, mu);
    }
  }

  private Texture tex(String path) {
    Texture t = new Texture(Gdx.files.internal(path));
    t.setFilter(Texture.TextureFilter.Linear, Texture.TextureFilter.Linear);
    return t;
  }
  private Texture[] loadChunks(String name, int n, String ext) {
    Texture[] arr = new Texture[n];
    for (int i = 0; i < n; i++) arr[i] = tex("gfx/" + name + "_" + i + "." + ext);
    return arr;
  }
  private BitmapFont font(String name) {
    BitmapFont f = new BitmapFont(Gdx.files.internal("fonts/" + name + ".fnt"));
    f.getRegion().getTexture().setFilter(Texture.TextureFilter.Linear, Texture.TextureFilter.Linear);
    f.getData().setScale(0.5f);
    f.setUseIntegerPositions(false);
    return f;
  }

  public AtlasRegion region(String name, int index) {
    Array<AtlasRegion> list = anims.get(name);
    if (list == null) throw new IllegalArgumentException("sprite inexistente: " + name);
    return list.get(Math.max(0, Math.min(index, list.size - 1)));
  }
  public int frames(String name) {
    Array<AtlasRegion> list = anims.get(name);
    return list == null ? 0 : list.size;
  }

  // ---------- desenho ----------
  public static float gy(float yDown) { return VIEW_H - yDown; }

  public void setAdditive(boolean add) {
    if (add == additive) return;
    additive = add;
    if (add) batch.setBlendFunction(GL20.GL_SRC_ALPHA, GL20.GL_ONE);
    else batch.setBlendFunction(GL20.GL_SRC_ALPHA, GL20.GL_ONE_MINUS_SRC_ALPHA);
  }

  /** Desenha um quadro com a âncora em (x, yDown). facing -1 espelha. rot em graus. */
  public void sprite(String name, int index, float x, float yDown, float facing, float k, float rot, float r, float g, float b, float a) {
    AtlasRegion reg = region(name, index);
    float[] m = meta.get(name);
    float s = m[0], ax = m[1], ay = m[2];
    float ayb = reg.originalHeight - ay;
    float w = reg.packedWidth / s * k, h = reg.packedHeight / s * k;
    float ox = (ax - reg.offsetX) / s * k, oy = (ayb - reg.offsetY) / s * k;
    float lx = x - ox, ly = gy(yDown) - oy;
    batch.setColor(r, g, b, a);
    batch.draw(reg, lx, ly, ox, oy, w, h, facing, 1f, rot);
    batch.setColor(Color.WHITE);
  }
  public void sprite(String name, int index, float x, float yDown, float facing) {
    sprite(name, index, x, yDown, facing, 1f, 0f, 1, 1, 1, 1);
  }
  public void sprite(String name, int index, float x, float yDown, float facing, float a) {
    sprite(name, index, x, yDown, facing, 1f, 0f, 1, 1, 1, a);
  }
  /** Quadro esticado (ex.: coluna de gêiser), origem no canto superior esquerdo. */
  public void stretch(String name, int index, float x, float yDown, float w, float h, float a) {
    AtlasRegion reg = region(name, index);
    batch.setColor(1, 1, 1, a);
    batch.draw(reg, x, gy(yDown + h), w, h);
    batch.setColor(Color.WHITE);
  }
  public void glow(float x, float yDown, float radius, Color c, float a) {
    sprite("glow", 0, x, yDown, 1, radius / 32f, 0, c.r, c.g, c.b, a);
  }
  public void rect(float x, float yDown, float w, float h, float r, float g, float b, float a) {
    batch.setColor(r, g, b, a);
    batch.draw(pixel, x, gy(yDown + h), w, h);
    batch.setColor(Color.WHITE);
  }
  public void tex(Texture t, float x, float yDown, float w, float h) {
    batch.draw(t, x, gy(yDown + h), w, h);
  }
  public void texRegion(Texture t, float x, float yDown, float w, float h, float u, float v, float u2, float v2, float a) {
    batch.setColor(1, 1, 1, a);
    batch.draw(t, x, gy(yDown + h), w, h, u, v2, u2, v);
    batch.setColor(Color.WHITE);
  }

  /** Repete um quadro horizontalmente em [x, x+w) com deslocamento de fase (0..1). */
  public void texRegionSub(String name, float x, float yDown, float w, float h, float phase, float a) {
    AtlasRegion reg = region(name, 0);
    float[] m = meta.get(name);
    float tileW = reg.originalWidth / m[0] * (h / (reg.originalHeight / m[0]));
    float off = ((phase % 1f) + 1f) % 1f * tileW;
    batch.setColor(1, 1, 1, a);
    float cur = x - off;
    float y0 = gy(yDown + h);
    int rw = reg.getRegionWidth();
    while (cur < x + w) {
      float s0 = Math.max(cur, x), s1 = Math.min(cur + tileW, x + w);
      if (s1 > s0) {
        int px0 = (int) ((s0 - cur) / tileW * rw), px1 = (int) Math.ceil((s1 - cur) / tileW * rw);
        subTmp.setRegion(reg, px0, 0, Math.max(1, px1 - px0), reg.getRegionHeight());
        batch.draw(subTmp, s0, y0, s1 - s0, h);
      }
      cur += tileW;
    }
    batch.setColor(Color.WHITE);
  }
  private final TextureRegion subTmp = new TextureRegion();

  /** Texto: y é o topo da linha em coordenadas y-para-baixo. */
  public float text(BitmapFont f, String s, float x, float yDown, int align, float r, float g, float b, float a) {
    f.setColor(r, g, b, a);
    layout.setText(f, s);
    float xx = x;
    if (align == Align.center) xx = x - layout.width / 2f;
    else if (align == Align.right) xx = x - layout.width;
    f.draw(batch, s, xx, gy(yDown));
    f.setColor(Color.WHITE);
    return layout.width;
  }
  public float textWidth(BitmapFont f, String s) { layout.setText(f, s); return layout.width; }
  public void wrapped(BitmapFont f, String s, float x, float yDown, float width, int align, float r, float g, float b, float a) {
    f.setColor(r, g, b, a);
    f.draw(batch, s, x, gy(yDown), width, align, true);
    f.setColor(Color.WHITE);
  }
  public float wrappedHeight(BitmapFont f, String s, float width) {
    layout.setText(f, s, Color.WHITE, width, Align.center, true);
    return layout.height;
  }
  public void panel(float x, float yDown, float w, float h, float a) {
    panel.setColor(tmp.set(1, 1, 1, a));
    panel.draw(batch, x, gy(yDown + h), w, h);
  }

  // ---------- áudio ----------
  public void play(String name) { play(name, 1f); }
  public void play(String name, float vol) {
    if (muted) return;
    Sound s = sounds.get(name);
    if (s != null) s.play(vol * 0.8f);
  }
  public void music(String name) {
    if (name.equals(currentMusicName)) return;
    if (currentMusic != null) currentMusic.stop();
    currentMusicName = name;
    currentMusic = name.isEmpty() ? null : musics.get(name);
    if (currentMusic != null) {
      currentMusic.setVolume(muted ? 0 : 0.5f);
      currentMusic.play();
    }
  }
  public void toggleMute() {
    muted = !muted;
    if (currentMusic != null) currentMusic.setVolume(muted ? 0 : 0.5f);
  }

  public void dispose() {
    batch.dispose();
    for (TextureAtlas a : atlases) a.dispose();
    for (Texture t : near) t.dispose();
    for (Texture t : tiles) t.dispose();
    farNave.dispose(); farCistern.dispose(); mid.dispose(); title.dispose();
    fontUi.dispose(); fontBody.dispose(); fontTitle.dispose(); fontNum.dispose();
    for (Sound s : sounds.values()) s.dispose();
    for (Music m : musics.values()) m.dispose();
  }
}
