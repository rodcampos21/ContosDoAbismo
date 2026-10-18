package io.github.rodcampos21.contosdoabismo;

import com.badlogic.gdx.ApplicationAdapter;
import com.badlogic.gdx.Gdx;

/** Contos do Abismo — área tutorial. */
public class ContosDoAbismo extends ApplicationAdapter {
  private Play play;

  @Override public void create() { play = new Play(); }
  @Override public void resize(int width, int height) { if (play != null) play.resize(width, height); }
  @Override public void render() { play.render(Gdx.graphics.getDeltaTime()); }
  @Override public void dispose() { if (play != null) play.dispose(); }
}
