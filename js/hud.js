// Interface: HUD, caixas de texto, barra do chefe e telas
const FONT_T = 'Cinzel, "Times New Roman", serif';
const FONT_B = 'Spectral, Georgia, serif';

function wrapText(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = []; let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function ornateFrame(ctx, x, y, w, h, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, 'rgba(14,18,28,0.92)'); g.addColorStop(1, 'rgba(6,8,14,0.95)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x + 10, y); ctx.lineTo(x + w - 10, y); ctx.lineTo(x + w, y + 10); ctx.lineTo(x + w, y + h - 10);
  ctx.lineTo(x + w - 10, y + h); ctx.lineTo(x + 10, y + h); ctx.lineTo(x, y + h - 10); ctx.lineTo(x, y + 10); ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8a7a52'; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = 'rgba(200,180,120,0.25)'; ctx.lineWidth = 1;
  ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
  ctx.fillStyle = '#c9b27a';
  for (const [cx, cy] of [[x, y + h / 2], [x + w, y + h / 2]]) {
    ctx.beginPath(); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx + 5, cy); ctx.lineTo(cx, cy + 6); ctx.lineTo(cx - 5, cy); ctx.fill();
  }
  ctx.restore();
}

const HUD = {
  hpTrail: 100, areaName: '', areaT: 0, signText: null, signA: 0,
  bannerText: '', bannerT: 0, bannerMax: 0,
  bossNameT: 0,

  update(dt, game) {
    const p = game.player;
    this.hpTrail = this.hpTrail > p.hp ? approach(this.hpTrail, p.hp, dt * 40) : p.hp;
    if (this.areaT > 0) this.areaT -= dt;
    if (this.bannerT > 0) this.bannerT -= dt;
    if (this.bossNameT > 0) this.bossNameT -= dt;
    this.signA = approach(this.signA, game.activeSign ? 1 : 0, dt * 6);
    if (game.activeSign) this.signText = game.activeSign.text;
  },
  showArea(name) { this.areaName = name; this.areaT = 3.2; },
  banner(text, t = 2.5) { this.bannerText = text; this.bannerT = t; this.bannerMax = t; },

  draw(ctx, game) {
    const p = game.player;
    // --- retrato e vida
    ctx.save();
    ornateFrame(ctx, 14, 12, 290, 64);
    // retrato
    ctx.save();
    ctx.beginPath(); ctx.arc(46, 44, 24, 0, TAU);
    const pg = ctx.createRadialGradient(46, 40, 4, 46, 44, 26);
    pg.addColorStop(0, '#2a3550'); pg.addColorStop(1, '#0a0e18');
    ctx.fillStyle = pg; ctx.fill();
    ctx.clip();
    ctx.translate(46, 44);
    ctx.scale(1.9, 1.9);
    drawRain(ctx, -1, 62, 1, { state: 'idle', t: game.time, phase: 0, crouchK: 0, attack: null, deadT: 0, vx: 0 });
    ctx.restore();
    ctx.strokeStyle = '#c9b27a'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(46, 44, 24, 0, TAU); ctx.stroke();
    ctx.font = `700 15px ${FONT_T}`; ctx.fillStyle = '#e8dcc0'; ctx.textAlign = 'left';
    ctx.fillText('RAIN', 80, 34);
    // barra HP
    const bx = 80, by = 42, bw = 206, bh = 12;
    ctx.fillStyle = '#05060a'; ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
    ctx.fillStyle = 'rgba(255,240,220,0.75)'; ctx.fillRect(bx, by, bw * clamp(this.hpTrail / p.maxHp, 0, 1), bh);
    const hg = ctx.createLinearGradient(0, by, 0, by + bh);
    hg.addColorStop(0, '#ff6a5a'); hg.addColorStop(0.5, '#c4202a'); hg.addColorStop(1, '#6a0c14');
    ctx.fillStyle = hg; ctx.fillRect(bx, by, bw * clamp(p.hp / p.maxHp, 0, 1), bh);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(bx, by, bw * clamp(p.hp / p.maxHp, 0, 1), 3);
    ctx.strokeStyle = '#8a7a52'; ctx.lineWidth = 1; ctx.strokeRect(bx - 2, by - 2, bw + 4, bh + 4);
    ctx.font = `600 11px ${FONT_T}`; ctx.fillStyle = '#e8dcc0';
    ctx.fillText(`HP ${Math.ceil(p.hp)} / ${p.maxHp}`, bx, by + 27);
    ctx.textAlign = 'right'; ctx.fillStyle = '#9aa6c0';
    ctx.fillText('Lâmina Partida', bx + bw, by + 27);
    ctx.restore();

    // --- nome da área
    if (this.areaT > 0) {
      const a = clamp(Math.min(this.areaT, 3.2 - this.areaT) * 2, 0, 1);
      ctx.save(); ctx.globalAlpha = a;
      ctx.textAlign = 'right';
      ctx.font = `700 20px ${FONT_T}`;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText(this.areaName, VIEW_W - 22, 42);
      ctx.fillStyle = '#e8dcc0'; ctx.fillText(this.areaName, VIEW_W - 24, 40);
      ctx.strokeStyle = 'rgba(201,178,122,0.8)'; ctx.lineWidth = 1;
      const w = ctx.measureText(this.areaName).width;
      ctx.beginPath(); ctx.moveTo(VIEW_W - 24 - w, 50); ctx.lineTo(VIEW_W - 24, 50); ctx.stroke();
      ctx.restore();
    }

    // --- placa de tutorial
    if (this.signA > 0.01 && this.signText) {
      ctx.save();
      ctx.globalAlpha = this.signA;
      ctx.font = `400 19px ${FONT_B}`;
      const lines = wrapText(ctx, this.signText, 620);
      const h = 34 + lines.length * 25;
      const y = VIEW_H - h - 24 + (1 - this.signA) * 14;
      ornateFrame(ctx, VIEW_W / 2 - 340, y, 680, h);
      ctx.fillStyle = '#7ee6dc'; ctx.font = `700 12px ${FONT_T}`; ctx.textAlign = 'center';
      ctx.fillText('✦  INSCRIÇÃO ANTIGA  ✦', VIEW_W / 2, y + 20);
      ctx.fillStyle = '#ece4d0'; ctx.font = `400 19px ${FONT_B}`;
      lines.forEach((l, i) => ctx.fillText(l, VIEW_W / 2, y + 44 + i * 25));
      ctx.restore();
    }

    // --- barra do chefe
    const b = game.boss;
    if (game.bossFight && b.state !== 'dormant' && b.state !== 'dead' && !(b.state === 'emerge' && b.t < 2.1)) {
      const a = b.state === 'emerge' ? clamp((b.t - 2.1) * 2, 0, 1) : b.state === 'dying' ? clamp(1 - (b.t - 2.8), 0, 1) : 1;
      ctx.save(); ctx.globalAlpha = a;
      const w = 560, x = VIEW_W / 2 - w / 2, y = VIEW_H - 38;
      ctx.font = `700 15px ${FONT_T}`; ctx.textAlign = 'left';
      ctx.fillStyle = '#000'; ctx.fillText('SURUBIM GUERREIRO', x + 1, y - 9);
      ctx.fillStyle = '#e8dcc0'; ctx.fillText('SURUBIM GUERREIRO', x, y - 10);
      ctx.fillStyle = '#05060a'; ctx.fillRect(x - 3, y - 3, w + 6, 16);
      ctx.fillStyle = 'rgba(255,230,200,0.7)'; ctx.fillRect(x, y, w * b.displayHp / b.maxHp, 10);
      const g = ctx.createLinearGradient(0, y, 0, y + 10);
      g.addColorStop(0, b.phase === 2 ? '#ffb040' : '#d8b048'); g.addColorStop(1, b.phase === 2 ? '#8a2a10' : '#7a5414');
      ctx.fillStyle = g; ctx.fillRect(x, y, w * b.hp / b.maxHp, 10);
      ctx.strokeStyle = '#8a7a52'; ctx.lineWidth = 1.5; ctx.strokeRect(x - 3, y - 3, w + 6, 16);
      // marca de metade
      ctx.fillStyle = '#c9b27a'; ctx.fillRect(x + w / 2 - 1, y - 5, 2, 20);
      ctx.restore();
    }

    // --- nome do chefe (apresentação)
    if (this.bossNameT > 0) {
      const tt = 3.6 - this.bossNameT;
      const a = clamp(Math.min(tt * 2, this.bossNameT * 1.5), 0, 1);
      ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center';
      const y = 150;
      const grd = ctx.createLinearGradient(0, y - 60, 0, y + 30);
      grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(0.5, 'rgba(0,0,0,0.65)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd; ctx.fillRect(0, y - 70, VIEW_W, 110);
      ctx.font = `italic 400 18px ${FONT_B}`; ctx.fillStyle = '#b8c4d8';
      ctx.fillText('Guardião da Cisterna Esquecida', VIEW_W / 2, y - 38);
      ctx.font = `900 52px ${FONT_T}`;
      const sp = 1 + (1 - easeOut(clamp(tt, 0, 1))) * 0.15;
      ctx.translate(VIEW_W / 2, y + 12); ctx.scale(sp, 1);
      ctx.lineWidth = 6; ctx.strokeStyle = '#05070c'; ctx.strokeText('SURUBIM GUERREIRO', 0, 0);
      const tg = ctx.createLinearGradient(0, -40, 0, 4);
      tg.addColorStop(0, '#f2f0ea'); tg.addColorStop(0.55, '#a9b3c4'); tg.addColorStop(1, '#5d6678');
      ctx.fillStyle = tg; ctx.fillText('SURUBIM GUERREIRO', 0, 0);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = a;
      ctx.strokeStyle = 'rgba(201,178,122,0.8)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(VIEW_W / 2 - 300, y + 26); ctx.lineTo(VIEW_W / 2 + 300, y + 26); ctx.stroke();
      ctx.restore();
    }

    // --- banner central
    if (this.bannerT > 0) {
      const a = clamp(Math.min((this.bannerMax - this.bannerT) * 3, this.bannerT * 2), 0, 1);
      ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 150, VIEW_W, 60);
      ctx.font = `700 26px ${FONT_T}`;
      ctx.fillStyle = '#000'; ctx.fillText(this.bannerText, VIEW_W / 2 + 2, 190);
      ctx.fillStyle = '#efe4c8'; ctx.fillText(this.bannerText, VIEW_W / 2, 188);
      ctx.restore();
    }
  },
};

const CONTROLS = [
  ['← →  /  A D', 'Andar'],
  ['SHIFT  /  L', 'Correr (segure)'],
  ['ESPAÇO  /  Z', 'Pular (segure = mais alto)'],
  ['↓  /  S', 'Agachar'],
  ['X  /  J', 'Atacar'],
  ['↓ + Pular', 'Descer de plataforma fina'],
  ['ESC  /  P', 'Pausar'],
  ['M', 'Som liga/desliga'],
];

function drawControls(ctx, x, y) {
  ctx.textAlign = 'left';
  CONTROLS.forEach(([k, d], i) => {
    ctx.font = `700 14px ${FONT_T}`; ctx.fillStyle = '#c9b27a';
    ctx.fillText(k, x, y + i * 24);
    ctx.font = `400 16px ${FONT_B}`; ctx.fillStyle = '#e4dccb';
    ctx.fillText(d, x + 170, y + i * 24);
  });
}

function drawTitle(ctx, game) {
  const t = game.time;
  ctx.fillStyle = 'rgba(4,5,10,0.55)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const vg = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, 100, VIEW_W / 2, VIEW_H / 2, 600);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.8)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.font = `italic 400 18px ${FONT_B}`; ctx.fillStyle = '#9aa8c4';
  ctx.fillText('— um conto de lâminas partidas e águas profundas —', VIEW_W / 2, 92);
  ctx.font = `900 64px ${FONT_T}`;
  ctx.lineWidth = 8; ctx.strokeStyle = '#04050a'; ctx.strokeText('CONTOS DO ABISMO', VIEW_W / 2, 160);
  const g = ctx.createLinearGradient(0, 110, 0, 165);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#b8c2d4'); g.addColorStop(1, '#5a6276');
  ctx.fillStyle = g; ctx.fillText('CONTOS DO ABISMO', VIEW_W / 2, 160);
  glow(ctx, VIEW_W / 2, 140, 300, 'rgba(90,140,255,0.15)', 1);
  ctx.strokeStyle = 'rgba(201,178,122,0.8)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(VIEW_W / 2 - 280, 182); ctx.lineTo(VIEW_W / 2 + 280, 182); ctx.stroke();
  ctx.font = `700 16px ${FONT_T}`; ctx.fillStyle = '#c9b27a';
  ctx.fillText('ÁREA TUTORIAL · A CISTERNA ESQUECIDA', VIEW_W / 2, 206);

  // Rain em destaque
  ctx.save();
  ctx.translate(250, 452); ctx.scale(2.25, 2.25);
  drawRain(ctx, 0, 0, 1, { state: 'idle', t, phase: 0, crouchK: 0, attack: null, deadT: 0, vx: 0 });
  ctx.restore();

  ornateFrame(ctx, 470, 240, 400, 220, 0.95);
  drawControls(ctx, 494, 274);

  const blink = 0.55 + Math.sin(t * 4) * 0.45;
  ctx.textAlign = 'center';
  ctx.globalAlpha = blink;
  ctx.font = `700 22px ${FONT_T}`; ctx.fillStyle = '#efe4c8';
  ctx.fillText('Pressione ENTER ou X para começar', VIEW_W / 2, 504);
  ctx.globalAlpha = 1;
  ctx.font = `400 12px ${FONT_B}`; ctx.fillStyle = '#6a7490';
  ctx.fillText('Gamepad suportado · Arte vetorial inspirada em metroidvanias góticos', VIEW_W / 2, 530);
}

function drawPause(ctx) {
  ctx.fillStyle = 'rgba(3,4,8,0.75)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ornateFrame(ctx, VIEW_W / 2 - 230, 90, 460, 330);
  ctx.textAlign = 'center';
  ctx.font = `900 32px ${FONT_T}`; ctx.fillStyle = '#efe4c8';
  ctx.fillText('PAUSA', VIEW_W / 2, 136);
  drawControls(ctx, VIEW_W / 2 - 200, 178);
  ctx.textAlign = 'center';
  ctx.font = `400 15px ${FONT_B}`; ctx.fillStyle = '#9aa6c0';
  ctx.fillText('ESC para continuar', VIEW_W / 2, 400);
}

function drawDeath(ctx, game) {
  const a = clamp((game.player.deadT - 1.2) * 1.2, 0, 1);
  ctx.fillStyle = `rgba(20,0,0,${a * 0.75})`; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.globalAlpha = a;
  ctx.textAlign = 'center';
  ctx.font = `900 54px ${FONT_T}`;
  ctx.lineWidth = 6; ctx.strokeStyle = '#000'; ctx.strokeText('VOCÊ PERECEU', VIEW_W / 2, VIEW_H / 2 - 10);
  ctx.fillStyle = '#b8202a'; ctx.fillText('VOCÊ PERECEU', VIEW_W / 2, VIEW_H / 2 - 10);
  ctx.font = `400 18px ${FONT_B}`; ctx.fillStyle = '#e4d4c4';
  ctx.fillText('Pressione ENTER ou X para despertar novamente', VIEW_W / 2, VIEW_H / 2 + 34);
  ctx.globalAlpha = 1;
}

function drawVictory(ctx, game) {
  ctx.fillStyle = 'rgba(4,5,12,0.85)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  glow(ctx, VIEW_W / 2, 180, 320, 'rgba(140,100,255,0.25)', 1);
  ctx.textAlign = 'center';
  ctx.font = `italic 400 18px ${FONT_B}`; ctx.fillStyle = '#b8a8e4';
  ctx.fillText('O selo se rompe, e a escuridão abaixo chama seu nome...', VIEW_W / 2, 120);
  ctx.font = `900 46px ${FONT_T}`; ctx.fillStyle = '#efe4c8';
  ctx.fillText('TUTORIAL CONCLUÍDO', VIEW_W / 2, 184);
  ornateFrame(ctx, VIEW_W / 2 - 200, 220, 400, 150);
  const s = Math.floor(game.elapsed);
  const tm = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  ctx.font = `400 19px ${FONT_B}`; ctx.fillStyle = '#e4dccb';
  ctx.textAlign = 'left';
  const rows = [['Tempo', tm], ['Mortes', String(game.deaths)], ['Chefe derrotado', 'Surubim Guerreiro'], ['Inimigos abatidos', String(game.kills)]];
  rows.forEach(([k, v], i) => {
    ctx.fillStyle = '#c9b27a'; ctx.fillText(k, VIEW_W / 2 - 170, 256 + i * 30);
    ctx.fillStyle = '#efe4c8'; ctx.textAlign = 'right'; ctx.fillText(v, VIEW_W / 2 + 170, 256 + i * 30); ctx.textAlign = 'left';
  });
  ctx.textAlign = 'center';
  ctx.globalAlpha = 0.55 + Math.sin(game.time * 4) * 0.45;
  ctx.font = `700 18px ${FONT_T}`; ctx.fillStyle = '#efe4c8';
  ctx.fillText('Pressione ENTER para voltar ao título', VIEW_W / 2, 430);
  ctx.globalAlpha = 1;
}
