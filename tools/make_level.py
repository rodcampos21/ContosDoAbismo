"""Gera assets/data/level.json — fonte única do mapa (usada pelo jogo e pelo gerador de arte)."""
import json, os
W, H, TS = 188, 17, 32
g = [['.'] * W for _ in range(H)]
def fill(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if 0 <= x < W and 0 <= y < H: g[y][x] = c
# '#' pedra, '=' piso, '-' plataforma fina, '^' estacas na água
fill(0, 0, W - 1, 1, '#'); fill(0, 14, W - 1, 16, '=')
fill(0, 0, 1, 16, '#'); fill(W - 2, 0, W - 1, 16, '#')
fill(28, 2, 29, 3, '#')
fill(30, 0, 57, 3, '#')                       # corredor
fill(38, 11, 45, 13, '#')                     # plataforma alta 1
fill(46, 11, 51, 15, '.'); fill(46, 16, 51, 16, '^')
fill(52, 11, 57, 13, '#')                     # plataforma alta 2
fill(58, 0, 75, 1, '#')
fill(61, 11, 63, 11, '-'); fill(65, 9, 67, 9, '-')
fill(69, 6, 75, 7, '#')                       # beiral com urna
fill(76, 0, 88, 3, '#'); fill(78, 4, 88, 11, '#')   # fenda (livre: linhas 12-13)
fill(89, 0, 127, 2, '#')
fill(94, 11, 96, 11, '-'); fill(98, 8, 101, 8, '-'); fill(111, 10, 116, 10, '-')
fill(128, 0, 135, 3, '#')
fill(136, 0, 136, 1, '#'); fill(167, 0, 167, 3, '#')
fill(141, 10, 144, 10, '-'); fill(159, 10, 162, 10, '-')
fill(168, 0, 185, 3, '#')
rows = [''.join(r) for r in g]

def sign(tx, ty, text): return {'x': tx * TS + 16, 'y': ty * TS, 'text': text}
data = {
  'width': W, 'height': H, 'tile': TS, 'rows': rows,
  'start': {'x': 5 * TS, 'y': 14 * TS},
  'arena': {'x0': 137 * TS, 'x1': 167 * TS},
  'bossTrigger': 138 * TS + 8,
  'gates': [{'tx': 136, 'y0': 2, 'y1': 13, 'closed': False}, {'tx': 167, 'y0': 4, 'y1': 13, 'closed': True}],
  'checkpoint': {'x': 130 * TS + 16, 'y': 14 * TS},
  'exit': {'x': 180 * TS, 'y': 14 * TS},
  'signs': [
    sign(5, 14, 'Desperte, Rain. Use ← → (ou A / D) para andar.'),
    sign(15, 14, 'Segure SHIFT (ou L) enquanto anda para correr.'),
    sign(33, 14, 'Pressione ESPAÇO (ou Z) para pular. Segure o botão para pular mais alto.'),
    sign(42, 11, 'Vãos longos exigem impulso: corra com SHIFT e pule perto da borda.'),
    sign(59, 14, 'Plataformas finas podem ser atravessadas por baixo. Segure ↓ e pule para descer delas.'),
    sign(75, 14, 'Segure ↓ (ou S) para agachar. Agachado, você se esgueira por fendas estreitas.'),
    sign(92, 14, 'Pressione X (ou J) para atacar com sua lâmina partida. Quebre urnas para achar Fragmentos de Vida.'),
    sign(105, 14, 'Criaturas rasteiras escapam de golpes altos: agache e ataque (↓ + X).'),
    sign(134, 14, 'Algo enorme respira sob a água adiante. Seu escudo bloqueia golpes de frente: ataque pelas costas ou quando ele hesitar.'),
    sign(173, 14, 'Além deste selo, o Abismo aguarda... (fim da área tutorial)'),
  ],
  'spawns': [
    {'type': 'urn', 'x': 72 * TS + 16, 'y': 6 * TS},
    {'type': 'urn', 'x': 96 * TS + 16, 'y': 14 * TS},
    {'type': 'urn', 'x': 100 * TS, 'y': 8 * TS},
    {'type': 'urn', 'x': 121 * TS + 16, 'y': 14 * TS},
    {'type': 'urn', 'x': 126 * TS, 'y': 14 * TS},
    {'type': 'bat', 'x': 103 * TS, 'y': 9 * TS},
    {'type': 'bat', 'x': 114 * TS, 'y': 7 * TS},
    {'type': 'bat', 'x': 124 * TS, 'y': 8 * TS},
    {'type': 'crawler', 'x': 108 * TS, 'y': 14 * TS, 'min': 102 * TS, 'max': 111 * TS},
    {'type': 'crawler', 'x': 119 * TS, 'y': 14 * TS, 'min': 117 * TS, 'max': 126 * TS},
    {'type': 'crawler', 'x': 113 * TS, 'y': 10 * TS, 'min': 111 * TS + 8, 'max': 117 * TS - 8},
  ],
  'candles': [{'x': tx * TS + 16, 'y': 14 * TS, 'kind': 'stand'} for tx in [8, 22, 63, 97, 109, 125, 139, 164, 176]] +
             [{'x': x * TS + 16, 'y': y * TS, 'kind': 'sconce'} for x, y in [[4, 8], [26, 8], [34, 8], [55, 7], [71, 10], [92, 7], [118, 7], [132, 8], [146, 6], [157, 6], [184, 9]]],
  'areas': [[0, 30, 'Capela do Despertar'], [30, 58, 'Corredor dos Saltos'], [58, 76, 'Poço das Plataformas'], [76, 89, 'Fenda Estreita'],
            [89, 128, 'Galeria das Urnas'], [128, 137, 'Vela de Repouso'], [137, 167, 'Cisterna Esquecida'], [167, 188, 'Selo do Abismo']],
}
out = os.path.join(os.path.dirname(__file__), '..', 'assets', 'data', 'level.json')
json.dump(data, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('\n'.join(r[56:92] for r in rows))
