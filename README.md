# Contos do Abismo

Metroidvania gótico para navegador, inspirado em *Bloodstained: Ritual of the Night*, com arte vetorial desenhada inteiramente em código (Canvas 2D). Nenhum arquivo de imagem ou som — tudo é gerado proceduralmente.

## Como jogar

Abra `index.html` em qualquer navegador moderno (ou ative o GitHub Pages neste repositório: **Settings → Pages → Deploy from branch → `main` / root**).

| Ação | Teclado | Gamepad |
|---|---|---|
| Andar | ← → ou A D | Analógico / D-pad |
| Correr | segure SHIFT ou L | B / RB |
| Pular (segure = mais alto) | ESPAÇO, Z ou ↑ | A |
| Agachar | ↓ ou S | ↓ |
| Atacar | X ou J | X / Y |
| Descer de plataforma fina | ↓ + Pular | ↓ + A |
| Pausar | ESC ou P | Start |
| Som liga/desliga | M | — |

## Conteúdo atual — Área Tutorial: A Cisterna Esquecida

1. **Capela do Despertar** — andar e correr
2. **Corredor dos Saltos** — pulo, pulo variável e salto com corrida sobre um vão com estacas
3. **Poço das Plataformas** — plataformas finas atravessáveis e descida
4. **Fenda Estreita** — passagem só agachado
5. **Galeria das Urnas** — combate, urnas com Fragmentos de Vida, morcegos e girinos rasteiros (que só se acerta agachado)
6. **Vela de Repouso** — restaura a vida e vira ponto de retorno
7. **Cisterna Esquecida** — chefe **Surubim Guerreiro**
8. **Selo do Abismo** — fim do tutorial

### Surubim Guerreiro
Um bagre guerreiro de armadura enferrujada, espada serrilhada acorrentada e escudo com esqueleto de peixe.

- **Fase 1:** golpe descendente (brilho na espada avisa), postura de escudo que bloqueia ataques frontais seguida de contra-ataque, investida com escudo que o deixa atordoado ao bater na parede (dano crítico ×1,5), salto esmagador que gera ondas pelo chão.
- **Fase 2 (abaixo de 50% de vida):** golpes duplos, saltos em sequência, cuspe de lodo em arco, gêiseres que brotam do chão sob o jogador e destroços que caem do teto após a investida.

## Estrutura

```
index.html
style.css
js/util.js     utilitários, IK de dois ossos
js/input.js    teclado + gamepad
js/audio.js    efeitos e música sintetizados (WebAudio)
js/level.js    mapa, colisão e cenário pré-renderizado
js/art.js      desenhos vetoriais (Rain, Surubim, inimigos, objetos)
js/fx.js       partículas, números de dano, tremor de tela
js/player.js   física e estados do Rain
js/enemies.js  morcegos, girinos, urnas, orbes de vida
js/boss.js     IA e ataques do Surubim Guerreiro
js/hud.js      interface e telas
js/main.js     loop principal, câmera, combate
```
