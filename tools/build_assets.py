"""Renderiza toda a arte (tools/art) com Chromium e gera atlas/texturas/fontes em assets/.

Uso: python3 tools/build_assets.py [sprites|layers|fonts|all]
Requer: playwright (chromium) e Pillow.
"""
import base64, io, json, os, sys
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ART = os.path.join(ROOT, 'tools', 'art', 'index.html')
OUT = os.path.join(ROOT, 'assets')
os.makedirs(os.path.join(OUT, 'gfx'), exist_ok=True)
os.makedirs(os.path.join(OUT, 'data'), exist_ok=True)
os.makedirs(os.path.join(OUT, 'fonts'), exist_ok=True)
PAGE = 2048


def decode(data_url):
    return Image.open(io.BytesIO(base64.b64decode(data_url.split(',', 1)[1]))).convert('RGBA')


def pack(items):
    """Empacotamento por prateleiras. items: dicts com img. Retorna lista de páginas [(w,h,[(item,x,y)])]."""
    items = sorted(items, key=lambda it: (-it['img'].height, -it['img'].width))
    pages = []
    cur = None
    for it in items:
        w, h = it['img'].size
        placed = False
        for pg in pages:
            for shelf in pg['shelves']:
                if h <= shelf['h'] and shelf['x'] + w <= PAGE:
                    pg['placed'].append((it, shelf['x'], shelf['y'])); shelf['x'] += w + 2; placed = True; break
            if placed: break
            if pg['y'] + h <= PAGE:
                shelf = {'y': pg['y'], 'h': h, 'x': w + 2}
                pg['shelves'].append(shelf); pg['placed'].append((it, 0, pg['y'])); pg['y'] += h + 2; placed = True; break
        if not placed:
            pg = {'shelves': [{'y': 0, 'h': h, 'x': w + 2}], 'placed': [(it, 0, 0)], 'y': h + 2}
            pages.append(pg)
    out = []
    for pg in pages:
        mw = max(x + it['img'].width for it, x, y in pg['placed'])
        mh = max(y + it['img'].height for it, x, y in pg['placed'])
        pw = 1 << (mw - 1).bit_length(); ph = 1 << (mh - 1).bit_length()
        out.append((pw, ph, pg['placed']))
    return out


def save_png(img, path, quantize=False):
    if quantize:
        img = img.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
    img.save(path, optimize=True)


def build_sprites(pg):
    items = pg.evaluate('listItems()')
    groups = {}
    meta = {}
    for it in items:
        img = decode(pg.evaluate('(i)=>renderItem(i)', it['i']))
        bbox = img.getbbox() or (0, 0, 1, 1)
        trimmed = img.crop(bbox)
        it.update({'img': trimmed, 'bbox': bbox, 'ow': img.width, 'oh': img.height})
        groups.setdefault(it['atlas'], []).append(it)
        meta[it['name']] = {'scale': it['scale'], 'ax': round(-it['x0'] * it['scale'], 2), 'ay': round(-it['y0'] * it['scale'], 2),
                            'w': img.width, 'h': img.height}
    for atlas, its in groups.items():
        pages = pack(its)
        lines = []
        for pi, (pw, ph, placed) in enumerate(pages):
            fname = f'{atlas}{pi if pi else ""}.png'
            page = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
            lines += ['', fname, f'size: {pw}, {ph}', 'format: RGBA8888', 'filter: Linear, Linear', 'repeat: none']
            for it, x, y in sorted(placed, key=lambda p: (p[0]['name'], p[0]['index'])):
                page.paste(it['img'], (x, y))
                l, t, r, b = it['bbox']
                w, h = r - l, b - t
                lines += [it['name'], '  rotate: false', f'  xy: {x}, {y}', f'  size: {w}, {h}', f"  orig: {it['ow']}, {it['oh']}",
                          f"  offset: {l}, {it['oh'] - b}", f"  index: {it['index']}"]
            save_png(page, os.path.join(OUT, 'gfx', fname), quantize=(atlas in ('boss',)))
            print(f'  {fname}: {pw}x{ph}, {len(placed)} quadros')
        open(os.path.join(OUT, 'gfx', f'{atlas}.atlas'), 'w').write('\n'.join(lines) + '\n')
    json.dump(meta, open(os.path.join(OUT, 'data', 'sprites.json'), 'w'), indent=0)


def build_layers(pg):
    L = json.load(open(os.path.join(OUT, 'data', 'level.json'), encoding='utf-8'))
    info = {}
    for kind, scale, chunk, fmt in [('near', 2, 1024, 'png'), ('tiles', 2, 1024, 'png'), ('far_nave', 2, 2048, 'jpg'),
                                    ('far_cistern', 2, 2048, 'jpg'), ('mid', 1.5, 1536, 'png'), ('title', 2, 1920, 'jpg')]:
        w, h = pg.evaluate('([k,L,s])=>renderLayer(k,L,s)', [kind, L, scale])
        n = 0
        for sx in range(0, w, chunk):
            sw = min(chunk, w - sx)
            data = pg.evaluate('([sx,sw,t])=>layerSlice(sx,sw,t)', [sx, sw, fmt])
            name = f'{kind}_{n}.{fmt}' if w > chunk else f'{kind}.{fmt}'
            path = os.path.join(OUT, 'gfx', name)
            raw = base64.b64decode(data.split(',', 1)[1])
            if fmt == 'png':
                save_png(Image.open(io.BytesIO(raw)).convert('RGBA'), path, quantize=kind in ('near', 'tiles'))
            else:
                open(path, 'wb').write(raw)
            n += 1
        info[kind] = {'scale': scale, 'chunk': chunk, 'count': n, 'fmt': fmt, 'w': w, 'h': h}
        print(f'  {kind}: {n} pedaço(s)')
    json.dump(info, open(os.path.join(OUT, 'data', 'layers.json'), 'w'), indent=1)


def build_fonts(pg):
    specs = [
        ('ui', '600 32px Lora', 32, 0, '#efe4c8', 1024),
        ('body', '400 38px Lora', 38, 0, '#ece4d0', 1024),
        ('title', '900 56px "Noto Serif CJK JP"', 56, 4, '#efe4c8', 2048),
        ('num', '700 34px "Noto Serif CJK JP"', 34, 3.5, '#ffffff', 1024),
    ]
    for name, css, size, stroke, color, pw in specs:
        r = pg.evaluate('([n,c,s,st,col,pw])=>bakeFont(n,c,s,st,col,pw)', [name, css, size, stroke, color, pw])
        open(os.path.join(OUT, 'fonts', f'{name}.fnt'), 'w', encoding='utf-8').write(r['fnt'])
        decode(r['png']).save(os.path.join(OUT, 'fonts', f'{name}.png'), optimize=True)
        print(f'  fonte {name}')


if __name__ == '__main__':
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ART)
        pg.wait_for_timeout(500)
        pg.evaluate('document.fonts.ready')
        if what in ('sprites', 'all'): build_sprites(pg)
        if what in ('layers', 'all'): build_layers(pg)
        if what in ('fonts', 'all'): build_fonts(pg)
        if errs: print('ERROS:', errs)
        b.close()
