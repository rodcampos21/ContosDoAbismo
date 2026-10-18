// Sons sintetizados com WebAudio (sem arquivos externos)
const Sfx = {
  ctx: null, master: null, sfxBus: null, musicBus: null, muted: false, noiseBuf: null,
  unlock() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.55;
        this.master.connect(this.ctx.destination);
        this.sfxBus = this.ctx.createGain(); this.sfxBus.connect(this.master);
        this.musicBus = this.ctx.createGain(); this.musicBus.gain.value = 0.32; this.musicBus.connect(this.master);
        const len = this.ctx.sampleRate * 1.5;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        Music.onReady();
      } catch (e) { this.ctx = null; }
    } else if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.55;
  },
  tone(freq, dur, type = 'square', vol = 0.15, slideTo = null, delay = 0, bus = null) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus || this.sfxBus);
    o.start(t); o.stop(t + dur + 0.05);
  },
  noise(dur, vol = 0.2, freq = 1200, ftype = 'lowpass', freqTo = null, delay = 0, q = 1) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = ftype; f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.sfxBus);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  },
  play(name) {
    if (!this.ctx || this.muted) return;
    switch (name) {
      case 'jump': this.tone(180, 0.12, 'triangle', 0.12, 360); this.noise(0.08, 0.05, 2000, 'highpass'); break;
      case 'land': this.noise(0.09, 0.12, 400, 'lowpass', 120); break;
      case 'step': this.noise(0.04, 0.025, 900, 'bandpass', null, 0, 2); break;
      case 'swing': this.noise(0.16, 0.16, 900, 'bandpass', 4200, 0, 3); break;
      case 'hit': this.noise(0.12, 0.28, 2500, 'lowpass', 300); this.tone(140, 0.12, 'square', 0.08, 60); break;
      case 'clang':
        this.tone(1250, 0.35, 'triangle', 0.14, 1180); this.tone(1870, 0.25, 'square', 0.05, 1800);
        this.noise(0.06, 0.15, 5000, 'highpass'); break;
      case 'hurt': this.tone(320, 0.25, 'sawtooth', 0.12, 90); this.noise(0.15, 0.15, 1200); break;
      case 'break': this.noise(0.25, 0.25, 3000, 'lowpass', 400); this.tone(600, 0.08, 'square', 0.05, 200, 0.02); break;
      case 'heal': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.25, 'sine', 0.09, null, i * 0.06)); break;
      case 'save': [392, 494, 587, 784].forEach((f, i) => this.tone(f, 0.6, 'sine', 0.08, null, i * 0.1)); break;
      case 'enemyDie': this.noise(0.3, 0.2, 1800, 'lowpass', 200); this.tone(220, 0.3, 'sawtooth', 0.06, 50); break;
      case 'roar':
        this.tone(95, 1.3, 'sawtooth', 0.22, 55); this.tone(142, 1.2, 'sawtooth', 0.12, 70, 0.05);
        this.noise(1.2, 0.18, 700, 'lowpass', 150); break;
      case 'slam': this.noise(0.6, 0.45, 500, 'lowpass', 60); this.tone(70, 0.5, 'sine', 0.35, 35); break;
      case 'splash': this.noise(0.35, 0.18, 2500, 'bandpass', 500, 0, 1.5); break;
      case 'spit': this.noise(0.2, 0.15, 900, 'bandpass', 2400, 0, 4); this.tone(300, 0.15, 'sine', 0.06, 600); break;
      case 'bubble': this.tone(rand(400, 700), 0.08, 'sine', 0.05, rand(900, 1300)); break;
      case 'geyser': this.noise(0.8, 0.3, 300, 'lowpass', 3000); break;
      case 'windup': this.tone(200, 0.35, 'sawtooth', 0.05, 420); break;
      case 'gate': this.noise(1.0, 0.25, 300, 'lowpass', 90); this.tone(55, 1.0, 'square', 0.06, 45); break;
      case 'bossHit': this.noise(0.14, 0.3, 1800, 'lowpass', 250); this.tone(90, 0.14, 'square', 0.1, 50); break;
      case 'death': this.tone(300, 1.2, 'sawtooth', 0.12, 40); this.noise(1.0, 0.15, 800, 'lowpass', 80); break;
      case 'victory': [262, 330, 392, 523, 392, 523, 659].forEach((f, i) => this.tone(f, 0.5, 'triangle', 0.1, null, i * 0.14)); break;
      case 'select': this.tone(660, 0.1, 'square', 0.07, 990); break;
      case 'read': this.tone(880, 0.12, 'sine', 0.05, 1320); break;
    }
  },
};

// Música ambiente procedural (drone gótico + sinos) e tema do chefe
const Music = {
  mode: null, timer: null, nodes: [], step: 0,
  onReady() { if (this.wanted) this.play(this.wanted); },
  play(mode) {
    this.wanted = mode;
    if (!Sfx.ctx || this.mode === mode) return;
    this.stop();
    this.mode = mode;
    const ctx = Sfx.ctx;
    const t = ctx.currentTime;
    const drone = (f, vol) => {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
      const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 280;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08 + Math.random() * 0.05;
      const lg = ctx.createGain(); lg.gain.value = 120; lfo.connect(lg); lg.connect(flt.frequency);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 3);
      o.connect(flt); flt.connect(g); g.connect(Sfx.musicBus);
      o.start(); lfo.start();
      this.nodes.push(o, lfo, g);
    };
    if (mode === 'ambient') {
      drone(55, 0.12); drone(82.4, 0.07); drone(55.4, 0.08);
      const scale = [220, 261.6, 293.7, 329.6, 392, 440, 523.3];
      this.timer = setInterval(() => {
        if (Math.random() < 0.55) {
          const f = pick(scale) * (Math.random() < 0.3 ? 0.5 : 1);
          Sfx.tone(f, 2.4, 'sine', 0.05, null, 0, Sfx.musicBus);
          Sfx.tone(f * 2.01, 1.6, 'sine', 0.015, null, 0, Sfx.musicBus);
        }
      }, 1300);
    } else if (mode === 'boss') {
      drone(41.2, 0.1); drone(61.7, 0.06);
      const bass = [55, 55, 65.4, 55, 73.4, 55, 65.4, 49];
      const lead = [440, 0, 523, 0, 494, 440, 0, 392, 440, 0, 587, 523, 494, 0, 440, 0];
      this.step = 0;
      this.timer = setInterval(() => {
        const s = this.step++;
        Sfx.tone(bass[(s >> 1) % bass.length], 0.2, 'square', 0.07, null, 0, Sfx.musicBus);
        if (s % 4 === 0) { Sfx.tone(60, 0.18, 'sine', 0.18, 35, 0, Sfx.musicBus); }
        if (s % 4 === 2) Sfx.noise(0.06, 0.05, 6000, 'highpass');
        const n = lead[s % lead.length];
        if (n && s % 32 >= 16) Sfx.tone(n, 0.28, 'triangle', 0.045, null, 0, Sfx.musicBus);
      }, 150);
    } else if (mode === 'calm') {
      drone(65.4, 0.08); drone(98, 0.05);
      this.timer = setInterval(() => {
        Sfx.tone(pick([523, 659, 784, 1047]), 2, 'sine', 0.04, null, 0, Sfx.musicBus);
      }, 900);
    }
  },
  stop() {
    this.mode = null;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    const ctx = Sfx.ctx;
    for (const n of this.nodes) {
      try {
        if (n.gain) { n.gain.cancelScheduledValues(ctx.currentTime); n.gain.setValueAtTime(n.gain.value, ctx.currentTime); n.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6); }
        else n.stop(ctx.currentTime + 0.7);
      } catch (e) { }
    }
    this.nodes = [];
  },
};
