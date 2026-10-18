// Mapa da área tutorial "Cisterna Esquecida" + arte do cenário pré-renderizada
const TS = 32;
const T_EMPTY = 0, T_STONE = 1, T_FLOOR = 2, T_PLAT = 3, T_HAZARD = 4, T_GATE = 5;

const Level = {
  W: 188, H: 17, grid: null, canvas: null, bakeScale: 1,
  signs: [], candles: [], spawns: [], beams: [], drips: [],
  arena: { x0: 137 * TS, x1: 167 * TS },
  gates: [],
  checkpoint: null, exit: null,
  start: { x: 5 * TS, y: 14 * TS },

  build() {
    const W = this.W, H = this.H;
    const g = [];
    for (let y = 0; y < H; y++) g.push(new Array(W).fill(T_EMPTY));
    this.grid = g;
    const fill = (x0, y0, x1, y1, t) => {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++)
        if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = t;
    };
    // Estrutura geral
    fill(0, 0, W - 1, 1, T_STONE);
    fill(0, 14, W - 1, 16, T_FLOOR);
    fill(0, 0, 1, 16, T_STONE);
    fill(W - 2, 0, W - 1, 16, T_STONE);

    // A — Capela do despertar (2..29): ceiling alto, colunas
    fill(28, 2, 29, 3, T_STONE);
    // B — Corredor dos saltos (30..57)
    fill(30, 0, 57, 4, T_STONE);
    fill(38, 11, 45, 13, T_STONE);           // plataforma alta 1
    fill(46, 11, 51, 15, T_EMPTY);            // vão
    fill(46, 16, 51, 16, T_HAZARD);           // água com estacas
    fill(52, 11, 57, 13, T_STONE);           // plataforma alta 2
    // Escalada (58..75)
    fill(58, 0, 75, 1, T_STONE);
    fill(61, 11, 63, 11, T_PLAT);
    fill(65, 9, 67, 9, T_PLAT);
    fill(69, 6, 75, 7, T_STONE);             // beiral superior com urna
    // C — Fenda estreita (76..88)
    fill(76, 0, 88, 3, T_STONE);
    fill(78, 4, 88, 11, T_STONE);            // só as linhas 12-13 ficam livres
    // D — Galeria do combate (89..127)
    fill(89, 0, 127, 2, T_STONE);
    fill(111, 10, 116, 10, T_PLAT);
    fill(94, 11, 96, 11, T_PLAT);
    fill(98, 8, 101, 8, T_PLAT);
    // E — Vela de repouso (128..135)
    fill(128, 0, 135, 3, T_STONE);
    // F — Arena da cisterna (137..166)
    fill(141, 10, 144, 10, T_PLAT);
    fill(159, 10, 162, 10, T_PLAT);
    // Saída (168..185)
    fill(168, 0, 185, 3, T_STONE);

    this.gates = [
      { tx: 136, y0: 2, y1: 13, closed: false, vis: 0 },
      { tx: 167, y0: 4, y1: 13, closed: true, vis: 1 },
    ];
    fill(136, 0, 136, 1, T_STONE);
    fill(167, 0, 167, 3, T_STONE);
    this.applyGates();

    const sign = (tx, ty, text) => this.signs.push({ x: tx * TS + 16, y: ty * TS, text, glow: 0, read: false });
    sign(5, 14, 'Desperte, Rain. Use ← → (ou A / D) para andar.');
    sign(15, 14, 'Segure SHIFT (ou L) enquanto anda para correr.');
    sign(33, 14, 'Pressione ESPAÇO (ou Z) para pular. Segure o botão para pular mais alto.');
    sign(42, 11, 'Vãos longos exigem impulso: corra com SHIFT e pule perto da borda.');
    sign(59, 14, 'Plataformas finas podem ser atravessadas por baixo. Segure ↓ e pule para descer delas.');
    sign(75, 14, 'Segure ↓ (ou S) para agachar. Agachado, você se esgueira por fendas estreitas.');
    sign(92, 14, 'Pressione X (ou J) para atacar com sua lâmina partida. Quebre urnas para achar Fragmentos de Vida.');
    sign(105, 14, 'Criaturas rasteiras escapam de golpes altos: agache e ataque (↓ + X).');
    sign(134, 14, 'Algo enorme respira sob a água adiante. Seu escudo bloqueia golpes de frente: ataque pelas costas ou quando ele hesitar.');
    sign(173, 14, 'Além deste selo, o Abismo aguarda... (fim da área tutorial)');

    this.checkpoint = { x: 130 * TS + 16, y: 14 * TS, lit: false };
    this.exit = { x: 180 * TS, y: 14 * TS };

    // Inimigos e objetos
    this.spawns = [
      { type: 'urn', x: 72 * TS + 16, y: 6 * TS },
      { type: 'urn', x: 96 * TS + 16, y: 14 * TS },
      { type: 'urn', x: 100 * TS, y: 8 * TS },
      { type: 'urn', x: 121 * TS + 16, y: 14 * TS },
      { type: 'urn', x: 126 * TS, y: 14 * TS },
      { type: 'bat', x: 103 * TS, y: 9 * TS },
      { type: 'bat', x: 114 * TS, y: 7 * TS },
      { type: 'bat', x: 124 * TS, y: 8 * TS },
      { type: 'crawler', x: 108 * TS, y: 14 * TS, min: 102 * TS, max: 111 * TS },
      { type: 'crawler', x: 119 * TS, y: 14 * TS, min: 117 * TS, max: 126 * TS },
      { type: 'crawler', x: 113 * TS, y: 10 * TS, min: 111 * TS + 8, max: 117 * TS - 8 },
    ];

    // Velas (chamas animadas desenhadas em tempo real)
    const candelabra = (tx) => this.candles.push({ x: tx * TS + 16, y: 14 * TS, kind: 'stand' });
    const sconce = (tx, ty) => this.candles.push({ x: tx * TS + 16, y: ty * TS, kind: 'sconce' });
    [8, 22, 63, 97, 109, 125, 139, 164, 176].forEach(candelabra);
    [[4, 8], [26, 8], [34, 9], [55, 7], [71, 9], [92, 7], [118, 7], [132, 8], [146, 6], [157, 6], [184, 9]].forEach(([x, y]) => sconce(x, y));
  },

  applyGates() {
    for (const gt of this.gates)
      for (let y = gt.y0; y <= gt.y1; y++) this.grid[y][gt.tx] = gt.closed ? T_GATE : T_EMPTY;
  },
  setGate(i, closed) {
    const gt = this.gates[i];
    if (gt.closed === closed) return;
    gt.closed = closed;
    this.applyGates();
    Sfx.play('gate');
  },
  tile(tx, ty) {
    if (tx < 0 || tx >= this.W) return T_STONE;
    if (ty < 0) return T_STONE;
    if (ty >= this.H) return T_EMPTY;
    return this.grid[ty][tx];
  },
  solid(tx, ty) {
    const t = this.tile(tx, ty);
    return t === T_STONE || t === T_FLOOR || t === T_GATE;
  },
  rectSolid(x, y, w, h) {
    const x0 = Math.floor(x / TS), x1 = Math.floor((x + w - 0.01) / TS);
    const y0 = Math.floor(y / TS), y1 = Math.floor((y + h - 0.01) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (this.solid(tx, ty)) return true;
    return false;
  },
  rectHazard(x, y, w, h) {
    const x0 = Math.floor(x / TS), x1 = Math.floor((x + w - 0.01) / TS);
    const y0 = Math.floor(y / TS), y1 = Math.floor((y + h - 0.01) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (this.tile(tx, ty) === T_HAZARD) return true;
    return false;
  },

  // ---------- Arte pré-renderizada ----------
  bake(scale) {
    this.bakeScale = scale;
    const c = document.createElement('canvas');
    c.width = Math.ceil(this.W * TS * scale);
    c.height = Math.ceil(this.H * TS * scale);
    const ctx = c.getContext('2d');
    ctx.scale(scale, scale);
    const rng = mulberry32(1337);
    this.drawBackWall(ctx, rng);
    this.drawArchitecture(ctx, rng);
    this.drawTiles(ctx, rng);
    this.canvas = c;
  },

  drawBackWall(ctx, rng) {
    const Wp = this.W * TS, Hp = this.H * TS;
    const grad = ctx.createLinearGradient(0, 0, 0, Hp);
    grad.addColorStop(0, '#0d1018'); grad.addColorStop(0.5, '#161b26'); grad.addColorStop(1, '#10131b');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, Wp, Hp);
    // Tijolos
    const bw = 40, bh = 20;
    for (let row = 0; row * bh < Hp; row++) {
      const off = (row % 2) * bw / 2;
      for (let x = -bw; x < Wp + bw; x += bw) {
        const v = rng();
        const l = 11 + v * 6;
        ctx.fillStyle = `hsl(${218 + rng() * 14}, ${14 + rng() * 8}%, ${l}%)`;
        ctx.fillRect(x + off + 1, row * bh + 1, bw - 2, bh - 2);
        if (v > 0.85) { // tijolo com desgaste
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.fillRect(x + off + 1 + rng() * 20, row * bh + 1, 8 + rng() * 10, bh - 2);
        }
        ctx.fillStyle = 'rgba(160,180,220,0.05)';
        ctx.fillRect(x + off + 1, row * bh + 1, bw - 2, 2);
      }
    }
    // Rachaduras
    for (let i = 0; i < 40; i++) this.crack(ctx, rng() * Wp, 100 + rng() * 300, 30 + rng() * 60, rng);
    // Musgo/umidade perto do chão
    const mg = ctx.createLinearGradient(0, 360, 0, 448);
    mg.addColorStop(0, 'rgba(30,60,50,0)'); mg.addColorStop(1, 'rgba(30,60,50,0.35)');
    ctx.fillStyle = mg; ctx.fillRect(0, 360, Wp, 88);
  },

  crack(ctx, x, y, len, rng) {
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const branch = (x, y, a, l, w) => {
      if (l < 6) return;
      ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(x, y);
      let cx = x, cy = y;
      const steps = 3;
      for (let i = 0; i < steps; i++) {
        a += (rng() - 0.5) * 0.9;
        cx += Math.cos(a) * l / steps; cy += Math.sin(a) * l / steps;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
      if (rng() < 0.7) branch(cx, cy, a + (rng() - 0.5) * 1.6, l * 0.6, w * 0.7);
      if (rng() < 0.4) branch(cx, cy, a - (rng() - 0.5) * 1.6, l * 0.5, w * 0.6);
    };
    branch(x, y, rng() * TAU, len, 2.5);
  },

  pointedArch(ctx, cx, top, w, bottom) {
    // caminho de arco ogival
    const hw = w / 2;
    const spring = top + hw * 1.1;
    ctx.beginPath();
    ctx.moveTo(cx - hw, bottom);
    ctx.lineTo(cx - hw, spring);
    ctx.quadraticCurveTo(cx - hw, top + hw * 0.15, cx, top);
    ctx.quadraticCurveTo(cx + hw, top + hw * 0.15, cx + hw, spring);
    ctx.lineTo(cx + hw, bottom);
    ctx.closePath();
  },

  pillar(ctx, x, top, bottom, w) {
    const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, '#1a1f2b'); g.addColorStop(0.35, '#3a4255'); g.addColorStop(0.6, '#2a3040'); g.addColorStop(1, '#141820');
    ctx.fillStyle = g;
    ctx.fillRect(x - w / 2, top, w, bottom - top);
    // canelura
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x + i * w / 4, top + 20); ctx.lineTo(x + i * w / 4, bottom - 24); ctx.stroke(); }
    // capitel e base
    ctx.fillStyle = '#3c4458';
    ctx.fillRect(x - w / 2 - 6, top, w + 12, 10);
    ctx.fillRect(x - w / 2 - 8, bottom - 16, w + 16, 16);
    ctx.fillStyle = '#4c566e';
    ctx.fillRect(x - w / 2 - 6, top, w + 12, 3);
    ctx.fillRect(x - w / 2 - 8, bottom - 16, w + 16, 3);
    ctx.fillStyle = '#0c0e14';
    ctx.fillRect(x - w / 2 - 6, top + 10, w + 12, 3);
  },

  stainedWindow(ctx, cx, top, w, h, hue) {
    const bottom = top + h;
    // moldura de pedra
    ctx.save();
    this.pointedArch(ctx, cx, top - 10, w + 20, bottom + 8);
    ctx.fillStyle = '#2b3242'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#0b0d12'; ctx.stroke();
    this.pointedArch(ctx, cx, top, w, bottom);
    ctx.fillStyle = '#05070b'; ctx.fill();
    ctx.clip();
    // vitrais
    const cols = ['#2c4f8a', '#7a2433', '#8a6a2a', '#2c6a62', '#4a2f78', '#1d3a6a'];
    const r = mulberry32(hue * 97 + cx | 0);
    const cell = 13;
    for (let y = top; y < bottom; y += cell) {
      for (let x = cx - w / 2; x < cx + w / 2; x += cell) {
        const col = cols[Math.floor(r() * cols.length)];
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.55 + r() * 0.4;
        ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      }
    }
    ctx.globalAlpha = 1;
    // figura central (cruz/flor)
    ctx.fillStyle = 'rgba(230,200,140,0.55)';
    ctx.beginPath(); ctx.arc(cx, top + h * 0.38, w * 0.22, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#05070b'; ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      ctx.beginPath(); ctx.moveTo(cx, top + h * 0.38);
      ctx.lineTo(cx + Math.cos(a) * w * 0.22, top + h * 0.38 + Math.sin(a) * w * 0.22); ctx.stroke();
    }
    // chumbo
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, bottom); ctx.stroke();
    for (let y = top + h * 0.6; y < bottom; y += 26) { ctx.beginPath(); ctx.moveTo(cx - w, y); ctx.lineTo(cx + w, y); ctx.stroke(); }
    // brilho
    const lg = ctx.createLinearGradient(cx - w / 2, top, cx + w / 2, bottom);
    lg.addColorStop(0, 'rgba(180,200,255,0.25)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lg; ctx.fillRect(cx - w, top, w * 2, h);
    ctx.restore();
    // feixe de luz
    this.beams.push({ x: cx, y: top + h * 0.5, w, h });
  },

  roseWindow(ctx, cx, cy, r) {
    ctx.save();
    ctx.fillStyle = '#2b3242';
    ctx.beginPath(); ctx.arc(cx, cy, r + 14, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#0b0d12'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
    const cols = ['#24456f', '#6b1f2c', '#2a5e57', '#3d2a66', '#7a5c22'];
    for (let ring = 0; ring < 4; ring++) {
      const n = 8 + ring * 4;
      for (let i = 0; i < n; i++) {
        const a0 = i / n * TAU, a1 = (i + 1) / n * TAU;
        ctx.beginPath();
        ctx.arc(cx, cy, r * (ring + 1) / 4, a0, a1);
        ctx.arc(cx, cy, r * ring / 4, a1, a0, true);
        ctx.closePath();
        ctx.fillStyle = cols[(i + ring) % cols.length];
        ctx.globalAlpha = 0.6 + ((i * 7 + ring) % 4) * 0.1;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#05070b'; ctx.lineWidth = 2; ctx.stroke();
      }
    }
    // peixe estilizado no centro (emblema da cisterna)
    ctx.fillStyle = 'rgba(220,210,170,0.7)';
    ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.2, r * 0.09, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + r * 0.18, cy); ctx.lineTo(cx + r * 0.3, cy - r * 0.08); ctx.lineTo(cx + r * 0.3, cy + r * 0.08); ctx.fill();
    ctx.restore();
    this.beams.push({ x: cx, y: cy, w: r * 1.4, h: r * 2 });
  },

  archBay(ctx, cx, top, bottom, w) {
    ctx.save();
    this.pointedArch(ctx, cx, top, w, bottom);
    const g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#2e3546'; ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = '#4a5368'; ctx.stroke();
    ctx.restore();
  },

  drawArchitecture(ctx, rng) {
    const fy = 14 * TS;
    // A — Capela
    this.archBay(ctx, 14.5 * TS, 2.6 * TS, fy, 9 * TS);
    this.stainedWindow(ctx, 14.5 * TS, 3.6 * TS, 3.2 * TS, 6 * TS, 1);
    this.pillar(ctx, 9.3 * TS, 2 * TS, fy, 34);
    this.pillar(ctx, 19.7 * TS, 2 * TS, fy, 34);
    this.archBay(ctx, 25 * TS, 4 * TS, fy, 4 * TS);
    this.archBay(ctx, 4.5 * TS, 4 * TS, fy, 4 * TS);
    // altar
    ctx.fillStyle = '#2a3040'; ctx.fillRect(12 * TS, fy - 40, 5 * TS, 40);
    ctx.fillStyle = '#3c4458'; ctx.fillRect(11.8 * TS, fy - 44, 5.4 * TS, 6);
    ctx.fillStyle = '#5a1e22'; ctx.fillRect(13.6 * TS, fy - 38, 1.8 * TS, 30);
    // B — corredor
    for (let x = 33; x < 58; x += 6) this.archBay(ctx, x * TS, 5.5 * TS, fy, 3 * TS);
    // Escalada — janela estreita
    this.stainedWindow(ctx, 66 * TS, 2.6 * TS, 2 * TS, 4 * TS, 2);
    this.pillar(ctx, 60 * TS, 2 * TS, fy, 26);
    // D — galeria
    for (let x = 94; x < 128; x += 10) {
      this.archBay(ctx, x * TS, 4 * TS, fy, 5 * TS);
      this.stainedWindow(ctx, x * TS, 5 * TS, 1.8 * TS, 3.4 * TS, x);
    }
    for (let x = 99; x < 128; x += 10) this.pillar(ctx, x * TS, 3 * TS, fy, 28);
    // E — nicho da vela
    this.archBay(ctx, 131 * TS, 5.5 * TS, fy, 5 * TS);
    // F — Arena
    this.roseWindow(ctx, 152 * TS, 5 * TS, 2.4 * TS);
    this.pillar(ctx, 140 * TS, 2 * TS, fy, 40);
    this.pillar(ctx, 164 * TS, 2 * TS, fy, 40);
    this.archBay(ctx, 146 * TS, 6 * TS, fy, 4 * TS);
    this.archBay(ctx, 158 * TS, 6 * TS, fy, 4 * TS);
    // marca d'água nas paredes da cisterna
    ctx.fillStyle = 'rgba(40,80,70,0.35)';
    ctx.fillRect(137 * TS, fy - 70, 30 * TS, 70);
    ctx.fillStyle = 'rgba(120,170,150,0.12)';
    ctx.fillRect(137 * TS, fy - 72, 30 * TS, 3);
    // canos/bocas de esgoto
    for (const x of [143, 151, 161]) {
      ctx.fillStyle = '#0a0c10';
      ctx.beginPath(); ctx.arc(x * TS, fy - 30, 18, Math.PI, 0); ctx.lineTo(x * TS + 18, fy); ctx.lineTo(x * TS - 18, fy); ctx.fill();
      ctx.strokeStyle = '#3a4255'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(x * TS, fy - 30, 20, Math.PI, 0); ctx.stroke();
      ctx.strokeStyle = '#1d2129'; ctx.lineWidth = 2;
      for (let i = -12; i <= 12; i += 6) { ctx.beginPath(); ctx.moveTo(x * TS + i, fy - 46); ctx.lineTo(x * TS + i, fy); ctx.stroke(); }
    }
    // Saída — portal de selo
    this.archBay(ctx, 180 * TS, 5 * TS, fy, 5 * TS);
  },

  drawTiles(ctx, rng) {
    for (let ty = 0; ty < this.H; ty++) {
      for (let tx = 0; tx < this.W; tx++) {
        const t = this.grid[ty][tx];
        const x = tx * TS, y = ty * TS;
        if (t === T_STONE || t === T_FLOOR) {
          const up = !this.solidBake(tx, ty - 1), dn = !this.solidBake(tx, ty + 1);
          const lf = !this.solidBake(tx - 1, ty), rt = !this.solidBake(tx + 1, ty);
          const exposed = up || dn || lf || rt;
          if (t === T_FLOOR && up) this.floorTile(ctx, x, y, rng);
          else if (exposed) this.stoneTile(ctx, x, y, rng, up, dn, lf, rt);
          else {
            ctx.fillStyle = `hsl(222, 16%, ${8 + rng() * 3}%)`; ctx.fillRect(x, y, TS, TS);
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.fillRect(x, y + TS / 2 - 1, TS, 2); ctx.fillRect(x, y + TS - 2, TS, 2);
            ctx.fillRect(x + ((ty % 2) ? 0 : TS / 2), y, 2, TS / 2);
            ctx.fillRect(x + ((ty % 2) ? TS / 2 : 0), y + TS / 2, 2, TS / 2);
            ctx.fillStyle = 'rgba(120,140,180,0.05)'; ctx.fillRect(x, y, TS, 2);
          }
        } else if (t === T_PLAT) {
          this.platformTile(ctx, x, y, rng);
        } else if (t === T_HAZARD) {
          this.hazardTile(ctx, x, y, rng);
        }
      }
    }
  },
  solidBake(tx, ty) {
    if (tx < 0 || tx >= this.W || ty < 0 || ty >= this.H) return true;
    const t = this.grid[ty][tx];
    return t === T_STONE || t === T_FLOOR || t === T_GATE;
  },
  stoneTile(ctx, x, y, rng, up, dn, lf, rt) {
    const l = 15 + rng() * 5;
    ctx.fillStyle = `hsl(220, 14%, ${l}%)`;
    ctx.fillRect(x, y, TS, TS);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x, y + TS - 3, TS, 3);
    ctx.fillRect(x + TS - 3, y, 3, TS);
    ctx.fillStyle = 'rgba(170,190,230,0.12)';
    ctx.fillRect(x, y, TS, 2); ctx.fillRect(x, y, 2, TS);
    // meia junta
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x, y + TS / 2 - 1, TS, 2);
    if (up) { ctx.fillStyle = '#5d6780'; ctx.fillRect(x, y, TS, 3); ctx.fillStyle = 'rgba(70,120,90,0.6)'; if (rng() < 0.5) ctx.fillRect(x + rng() * 20, y + 3, 6 + rng() * 10, 2); }
    if (dn) {
      ctx.fillStyle = '#07080c'; ctx.fillRect(x, y + TS - 5, TS, 5);
      ctx.fillStyle = '#39415a'; ctx.fillRect(x, y + TS - 8, TS, 3);
      if (rng() < 0.35) { // gota/limo pendurado
        ctx.fillStyle = 'rgba(60,100,80,0.8)';
        const dx = x + rng() * 26;
        ctx.beginPath(); ctx.moveTo(dx, y + TS); ctx.lineTo(dx + 6, y + TS); ctx.lineTo(dx + 3, y + TS + 6 + rng() * 8); ctx.fill();
        this.drips.push({ x: dx + 3, y: y + TS + 4 });
      }
    }
    if (lf) { ctx.fillStyle = 'rgba(150,170,210,0.18)'; ctx.fillRect(x, y, 3, TS); }
    if (rt) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x + TS - 4, y, 4, TS); }
  },
  floorTile(ctx, x, y, rng) {
    const g = ctx.createLinearGradient(0, y, 0, y + TS);
    g.addColorStop(0, '#3a4a52'); g.addColorStop(1, '#1d262c');
    ctx.fillStyle = g; ctx.fillRect(x, y, TS, TS);
    ctx.fillStyle = '#6b8590'; ctx.fillRect(x, y, TS, 2);
    ctx.fillStyle = 'rgba(160,200,210,0.15)'; ctx.fillRect(x + 2, y + 2, TS - 4, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(x + TS - 2, y, 2, TS);
    ctx.fillRect(x, y + TS - 2, TS, 2);
    if (rng() < 0.25) { ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + rng() * TS, y + 4); ctx.lineTo(x + rng() * TS, y + TS - 4); ctx.stroke(); }
  },
  platformTile(ctx, x, y, rng) {
    ctx.fillStyle = '#0b0d12'; ctx.fillRect(x, y + 1, TS, 12);
    const g = ctx.createLinearGradient(0, y, 0, y + 12);
    g.addColorStop(0, '#5a6378'); g.addColorStop(1, '#2a3040');
    ctx.fillStyle = g; ctx.fillRect(x, y, TS, 10);
    ctx.fillStyle = '#7c87a0'; ctx.fillRect(x, y, TS, 2);
    // mísula
    ctx.fillStyle = '#232836';
    ctx.beginPath(); ctx.moveTo(x + 8, y + 10); ctx.lineTo(x + 24, y + 10); ctx.lineTo(x + 16, y + 22); ctx.fill();
  },
  hazardTile(ctx, x, y, rng) {
    ctx.fillStyle = '#0d1e22'; ctx.fillRect(x, y, TS, TS);
    for (let i = 0; i < 4; i++) {
      const sx = x + 4 + i * 8;
      const g = ctx.createLinearGradient(0, y - 12, 0, y + 10);
      g.addColorStop(0, '#9aa3b5'); g.addColorStop(1, '#2a2f3a');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(sx - 4, y + 12); ctx.lineTo(sx, y - 14 + rng() * 6); ctx.lineTo(sx + 4, y + 12); ctx.fill();
    }
  },

  // Portões (dinâmicos)
  drawGates(ctx, time) {
    for (const gt of this.gates) {
      const x = gt.tx * TS;
      const top = gt.y0 * TS, bottom = (gt.y1 + 1) * TS;
      const h = bottom - top;
      const lift = (1 - gt.vis) * h;
      if (gt.vis <= 0.01) continue;
      ctx.save();
      ctx.beginPath(); ctx.rect(x - 4, top, TS + 8, h); ctx.clip();
      const y0 = top - lift;
      for (let i = 0; i < 4; i++) {
        const bx = x + 3 + i * 8.5;
        const g = ctx.createLinearGradient(bx - 2, 0, bx + 3, 0);
        g.addColorStop(0, '#20242e'); g.addColorStop(0.5, '#6c7488'); g.addColorStop(1, '#1a1d25');
        ctx.fillStyle = g; ctx.fillRect(bx - 2, y0, 5, h);
        ctx.fillStyle = '#7c8499';
        ctx.beginPath(); ctx.moveTo(bx - 3, y0 + h); ctx.lineTo(bx + 0.5, y0 + h + 10); ctx.lineTo(bx + 4, y0 + h); ctx.fill();
      }
      ctx.fillStyle = '#2b303c';
      for (let yy = y0 + 20; yy < y0 + h; yy += 48) { ctx.fillRect(x - 2, yy, TS + 4, 6); ctx.fillStyle = '#4b5265'; ctx.fillRect(x - 2, yy, TS + 4, 2); ctx.fillStyle = '#2b303c'; }
      ctx.restore();
    }
  },
};
