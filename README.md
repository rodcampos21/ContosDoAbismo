# Contos do Abismo

Metroidvania gótico feito com **LibGDX** (Java), inspirado em *Bloodstained: Ritual of the Night*, com arte em estilo anime cel-shaded. Roda no navegador (GWT/WebGL) e no desktop.

## Jogar

- **Navegador:** a versão web é compilada automaticamente pelo GitHub Actions e publicada no branch `gh-pages`. Em **Settings → Pages**, escolha *Deploy from a branch* → `gh-pages` / `(root)`.
- **Desktop:** `./gradlew lwjgl3:run` (Java 17+), ou baixe o `.jar` em `download/` no site publicado.
- **Compilar a versão web localmente:** `./gradlew web:dist` → `web/build/dist/`.

| Ação | Teclado |
|---|---|
| Andar | ← → ou A D |
| Correr | segure SHIFT ou L |
| Pular (segure = mais alto) | ESPAÇO, Z ou ↑ |
| Agachar | ↓ ou S |
| Atacar | X ou J |
| Descer de plataforma fina | ↓ + Pular |
| Pausar | ESC ou P |
| Som liga/desliga | M |

## Conteúdo — Área Tutorial: A Cisterna Esquecida

Capela do Despertar → Corredor dos Saltos → Poço das Plataformas → Fenda Estreita → Galeria das Urnas → Vela de Repouso → **Surubim Guerreiro** → Selo do Abismo.

O **Surubim Guerreiro** tem duas fases: golpe telegrafado, postura de escudo (bloqueia ataques frontais) com contra-ataque, investida que o atordoa na parede (dano crítico), salto com ondas de choque; abaixo de 50% de vida ganha golpes duplos, saltos em sequência, cuspe de lodo, gêiseres e destroços do teto.

## Estrutura

```
core/      lógica do jogo (Java, compartilhada)
lwjgl3/    versão desktop
web/       versão navegador (GWT)
assets/    atlas de sprites, camadas do cenário, fontes, sons (gerados)
tools/     geradores de arte, áudio e mapa
legacy-js/ protótipo anterior em JavaScript puro
```

### Arte

Todos os gráficos são desenhados por código em `tools/art/*.js` (Canvas 2D, técnicas de cel-shading: sombra dura, contorno, luz de borda) e renderizados em alta resolução com Chromium:

```
python3 tools/make_level.py      # mapa -> assets/data/level.json
python3 tools/build_assets.py    # sprites, cenário e fontes -> assets/
python3 tools/make_audio.py      # efeitos e músicas -> assets/sfx, assets/music
```

Para trocar a arte por desenhos próprios, basta substituir os quadros nos atlas (`assets/gfx/*.atlas`) mantendo os mesmos nomes.
