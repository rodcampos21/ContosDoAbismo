package io.github.rodcampos21.contosdoabismo;

import com.badlogic.gdx.Input.Keys;
import com.badlogic.gdx.InputAdapter;
import com.badlogic.gdx.utils.IntSet;

/** Teclado mapeado em ações. "pressed" sobrevive até o próximo passo da simulação. */
public class Controls extends InputAdapter {
  public static final int LEFT = 0, RIGHT = 1, DOWN = 2, UP = 3, JUMP = 4, ATTACK = 5, RUN = 6, START = 7, PAUSE = 8, MUTE = 9;
  private static final int[][] BINDS = {
    { Keys.LEFT, Keys.A },
    { Keys.RIGHT, Keys.D },
    { Keys.DOWN, Keys.S },
    { Keys.UP, Keys.W },
    { Keys.SPACE, Keys.Z, Keys.K, Keys.UP, Keys.W },
    { Keys.X, Keys.J },
    { Keys.SHIFT_LEFT, Keys.SHIFT_RIGHT, Keys.L, Keys.C },
    { Keys.ENTER, Keys.NUMPAD_ENTER },
    { Keys.ESCAPE, Keys.P },
    { Keys.M },
  };
  private final IntSet down = new IntSet();
  private final IntSet justDown = new IntSet();
  public final boolean[] held = new boolean[BINDS.length];
  public final boolean[] pressed = new boolean[BINDS.length];
  public boolean anyKey;

  @Override public boolean keyDown(int keycode) {
    if (!down.contains(keycode)) justDown.add(keycode);
    down.add(keycode);
    anyKey = true;
    return true;
  }
  @Override public boolean keyUp(int keycode) {
    down.remove(keycode);
    return true;
  }

  /** Chamado uma vez por passo fixo. */
  public void update() {
    for (int a = 0; a < BINDS.length; a++) {
      boolean h = false, p = false;
      for (int k : BINDS[a]) {
        if (down.contains(k)) h = true;
        if (justDown.contains(k)) p = true;
      }
      pressed[a] = p || (h && !held[a]);
      held[a] = h;
    }
    justDown.clear();
  }
  public boolean held(int a) { return held[a]; }
  public boolean pressed(int a) { return pressed[a]; }
}
