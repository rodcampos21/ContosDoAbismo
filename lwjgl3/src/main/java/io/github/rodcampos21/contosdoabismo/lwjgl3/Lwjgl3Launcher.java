package io.github.rodcampos21.contosdoabismo.lwjgl3;

import com.badlogic.gdx.backends.lwjgl3.Lwjgl3Application;
import com.badlogic.gdx.backends.lwjgl3.Lwjgl3ApplicationConfiguration;
import io.github.rodcampos21.contosdoabismo.ContosDoAbismo;

/** Ponto de entrada da versão desktop. */
public class Lwjgl3Launcher {
  public static void main(String[] args) {
    Lwjgl3ApplicationConfiguration cfg = new Lwjgl3ApplicationConfiguration();
    cfg.setTitle("Contos do Abismo");
    cfg.useVsync(true);
    cfg.setForegroundFPS(Lwjgl3ApplicationConfiguration.getDisplayMode().refreshRate + 1);
    cfg.setWindowedMode(1280, 725);
    cfg.setBackBufferConfig(8, 8, 8, 8, 16, 0, 4);
    new Lwjgl3Application(new ContosDoAbismo(), cfg);
  }
}
