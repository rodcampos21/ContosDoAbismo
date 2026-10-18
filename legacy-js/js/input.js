// Teclado + gamepad, mapeados em ações
const BINDS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  down: ['ArrowDown', 'KeyS'],
  up: ['ArrowUp', 'KeyW'],
  jump: ['Space', 'KeyZ', 'KeyK', 'ArrowUp', 'KeyW'],
  attack: ['KeyX', 'KeyJ'],
  run: ['ShiftLeft', 'ShiftRight', 'KeyL', 'KeyC'],
  start: ['Enter', 'NumpadEnter'],
  pause: ['Escape', 'KeyP'],
  mute: ['KeyM'],
};
// Botões padrão (layout Xbox): A=0 B=1 X=2 Y=3 LB=4 RB=5 LT=6 RT=7 Start=9 D-pad 12-15
const PAD_BINDS = {
  left: [14], right: [15], down: [13], up: [12],
  jump: [0], attack: [2, 3], run: [1, 5, 7], start: [9], pause: [9, 8],
};

const Input = {
  keys: {},
  keyPressed: {},
  held: {},
  pressed: {},
  init() {
    addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) this.keyPressed[e.code] = true;
      this.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      Sfx.unlock();
    });
    addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    addEventListener('blur', () => { this.keys = {}; });
    addEventListener('pointerdown', () => Sfx.unlock());
  },
  update() {
    let pad = null;
    if (navigator.getGamepads) {
      for (const p of navigator.getGamepads()) if (p && p.connected) { pad = p; break; }
    }
    for (const a in BINDS) {
      let v = BINDS[a].some(k => this.keys[k]);
      const kp = BINDS[a].some(k => this.keyPressed[k]);
      if (pad) {
        const pb = PAD_BINDS[a];
        if (pb && pb.some(i => pad.buttons[i] && pad.buttons[i].pressed)) v = true;
        const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
        if (a === 'left' && ax < -0.45) v = true;
        if (a === 'right' && ax > 0.45) v = true;
        if (a === 'down' && ay > 0.55) v = true;
        if (a === 'up' && ay < -0.6) v = true;
      }
      this.pressed[a] = kp || (v && !this.held[a]);
      this.held[a] = v;
    }
    this.keyPressed = {};
  },
};
