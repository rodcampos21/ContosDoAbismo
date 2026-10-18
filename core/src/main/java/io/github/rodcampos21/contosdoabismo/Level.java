package io.github.rodcampos21.contosdoabismo;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.utils.Array;
import com.badlogic.gdx.utils.JsonReader;
import com.badlogic.gdx.utils.JsonValue;

/** Mapa em blocos (lido de data/level.json) e colisão. Coordenadas com y para baixo. */
public class Level {
  public static final int TS = 32;
  public static final char EMPTY = '.', STONE = '#', FLOOR = '=', PLAT = '-', HAZARD = '^', GATE = 'G';
  public static final float FLOOR_Y = 14 * TS;

  public static class Gate { public int tx, y0, y1; public boolean closed; public float vis; }
  public static class Sign { public float x, y, glow; public String text; public boolean read; }
  public static class Candle { public float x, y; public boolean stand; public float seed; }
  public static class Spawn { public String type; public float x, y, min, max; }
  public static class Area { public int x0, x1; public String name; }

  public final int W, H;
  public final char[][] grid;
  public final Array<Gate> gates = new Array<>();
  public final Array<Sign> signs = new Array<>();
  public final Array<Candle> candles = new Array<>();
  public final Array<Spawn> spawns = new Array<>();
  public final Array<Area> areas = new Array<>();
  public final float startX, startY, arenaX0, arenaX1, bossTrigger, checkX, checkY, exitX, exitY;
  public boolean checkpointLit;

  public Level() {
    JsonValue j = new JsonReader().parse(Gdx.files.internal("data/level.json"));
    W = j.getInt("width"); H = j.getInt("height");
    grid = new char[H][W];
    JsonValue rows = j.get("rows");
    int y = 0;
    for (JsonValue r = rows.child; r != null; r = r.next, y++) {
      String s = r.asString();
      for (int x = 0; x < W; x++) grid[y][x] = s.charAt(x);
    }
    startX = j.get("start").getFloat("x"); startY = j.get("start").getFloat("y");
    arenaX0 = j.get("arena").getFloat("x0"); arenaX1 = j.get("arena").getFloat("x1");
    bossTrigger = j.getFloat("bossTrigger");
    checkX = j.get("checkpoint").getFloat("x"); checkY = j.get("checkpoint").getFloat("y");
    exitX = j.get("exit").getFloat("x"); exitY = j.get("exit").getFloat("y");
    for (JsonValue g = j.get("gates").child; g != null; g = g.next) {
      Gate gt = new Gate();
      gt.tx = g.getInt("tx"); gt.y0 = g.getInt("y0"); gt.y1 = g.getInt("y1");
      gates.add(gt);
    }
    for (JsonValue s = j.get("signs").child; s != null; s = s.next) {
      Sign sg = new Sign(); sg.x = s.getFloat("x"); sg.y = s.getFloat("y"); sg.text = s.getString("text"); signs.add(sg);
    }
    int i = 0;
    for (JsonValue c = j.get("candles").child; c != null; c = c.next) {
      Candle cd = new Candle(); cd.x = c.getFloat("x"); cd.y = c.getFloat("y"); cd.stand = c.getString("kind").equals("stand"); cd.seed = i++ * 1.7f;
      candles.add(cd);
    }
    for (JsonValue s = j.get("spawns").child; s != null; s = s.next) {
      Spawn sp = new Spawn(); sp.type = s.getString("type"); sp.x = s.getFloat("x"); sp.y = s.getFloat("y");
      sp.min = s.getFloat("min", 0); sp.max = s.getFloat("max", 0);
      spawns.add(sp);
    }
    for (JsonValue a = j.get("areas").child; a != null; a = a.next) {
      Area ar = new Area(); ar.x0 = a.getInt(0); ar.x1 = a.getInt(1); ar.name = a.getString(2); areas.add(ar);
    }
    resetGates();
  }

  public void resetGates() {
    gates.get(0).closed = false; gates.get(0).vis = 0;
    gates.get(1).closed = true; gates.get(1).vis = 1;
    applyGates();
  }
  public void applyGates() {
    for (Gate g : gates) for (int y = g.y0; y <= g.y1; y++) grid[y][g.tx] = g.closed ? GATE : EMPTY;
  }
  /** Retorna true se mudou. */
  public boolean setGate(int i, boolean closed) {
    Gate g = gates.get(i);
    if (g.closed == closed) return false;
    g.closed = closed;
    applyGates();
    return true;
  }

  public char tile(int tx, int ty) {
    if (tx < 0 || tx >= W || ty < 0) return STONE;
    if (ty >= H) return EMPTY;
    return grid[ty][tx];
  }
  public boolean solid(int tx, int ty) {
    char t = tile(tx, ty);
    return t == STONE || t == FLOOR || t == GATE;
  }
  public boolean rectSolid(float x, float y, float w, float h) {
    int x0 = (int) Math.floor(x / TS), x1 = (int) Math.floor((x + w - 0.01f) / TS);
    int y0 = (int) Math.floor(y / TS), y1 = (int) Math.floor((y + h - 0.01f) / TS);
    for (int ty = y0; ty <= y1; ty++) for (int tx = x0; tx <= x1; tx++) if (solid(tx, ty)) return true;
    return false;
  }
  public boolean rectHazard(float x, float y, float w, float h) {
    int x0 = (int) Math.floor(x / TS), x1 = (int) Math.floor((x + w - 0.01f) / TS);
    int y0 = (int) Math.floor(y / TS), y1 = (int) Math.floor((y + h - 0.01f) / TS);
    for (int ty = y0; ty <= y1; ty++) for (int tx = x0; tx <= x1; tx++) if (tile(tx, ty) == HAZARD) return true;
    return false;
  }
}
