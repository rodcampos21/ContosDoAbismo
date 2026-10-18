package io.github.rodcampos21.contosdoabismo.gwt;

import com.badlogic.gdx.ApplicationListener;
import com.badlogic.gdx.backends.gwt.GwtApplication;
import com.badlogic.gdx.backends.gwt.GwtApplicationConfiguration;
import io.github.rodcampos21.contosdoabismo.ContosDoAbismo;

/** Ponto de entrada da versão para navegador. */
public class GwtLauncher extends GwtApplication {
  @Override
  public GwtApplicationConfiguration getConfig() {
    GwtApplicationConfiguration cfg = new GwtApplicationConfiguration(true);
    cfg.padVertical = 0;
    cfg.padHorizontal = 0;
    cfg.antialiasing = true;
    return cfg;
  }

  @Override
  public ApplicationListener createApplicationListener() {
    return new ContosDoAbismo();
  }
}
