"""Sintetiza efeitos sonoros e músicas (numpy) e exporta em MP3 para assets/sfx e assets/music."""
import os, subprocess, wave
import numpy as np

SR = 44100
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
rng = np.random.default_rng(7)


def env(n, a=0.005, r=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4))
    dur = n / SR
    e *= np.exp(-t / (r or dur / 4))
    return e


def tone(freq, dur, kind='square', vol=0.3, slide=None, a=0.005, r=None):
    n = int(SR * dur)
    f = np.full(n, float(freq)) if slide is None else np.geomspace(freq, max(20, slide), n)
    ph = np.cumsum(2 * np.pi * f / SR)
    if kind == 'sine': w = np.sin(ph)
    elif kind == 'tri': w = 2 / np.pi * np.arcsin(np.sin(ph))
    elif kind == 'saw': w = 2 * ((ph / (2 * np.pi)) % 1) - 1
    else: w = np.sign(np.sin(ph)) * 0.7
    return w * env(n, a, r) * vol


def lowpass(x, cutoff):
    cut = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    y = np.zeros_like(x); s = 0.0
    alpha = 1 - np.exp(-2 * np.pi * cut / SR)
    for i in range(len(x)):
        s += alpha[i] * (x[i] - s); y[i] = s
    return y


def noise(dur, vol=0.3, cutoff=2000, cut_to=None, hp=False, r=None):
    n = int(SR * dur)
    x = rng.uniform(-1, 1, n)
    c = np.full(n, cutoff, float) if cut_to is None else np.geomspace(cutoff, cut_to, n)
    y = lowpass(x, c)
    if hp: y = x - y
    y /= (np.abs(y).max() + 1e-9)
    return y * env(n, 0.004, r) * vol


def mix(*parts, delays=None):
    delays = delays or [0] * len(parts)
    n = max(int(d * SR) + len(p) for p, d in zip(parts, delays))
    out = np.zeros(n)
    for p, d in zip(parts, delays):
        i = int(d * SR); out[i:i + len(p)] += p
    return out


def write(path, x, stereo=False):
    x = np.clip(x, -1, 1)
    pcm = (x * 32000).astype(np.int16)
    tmp = path + '.wav'
    with wave.open(tmp, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-codec:a', 'libmp3lame', '-qscale:a', '5', path], check=True)
    os.remove(tmp)


SFX = {
    'jump': lambda: mix(tone(180, 0.14, 'tri', 0.35, 380), noise(0.08, 0.12, 4000, hp=True)),
    'land': lambda: noise(0.12, 0.45, 500, 120),
    'step': lambda: noise(0.05, 0.12, 1400, 600),
    'swing': lambda: noise(0.18, 0.5, 900, 5000, r=0.06),
    'hit': lambda: mix(noise(0.14, 0.7, 3000, 300), tone(140, 0.12, 'square', 0.25, 60)),
    'clang': lambda: mix(tone(1250, 0.45, 'tri', 0.35, 1180, r=0.15), tone(1870, 0.3, 'square', 0.12, 1800, r=0.08), noise(0.06, 0.3, 6000, hp=True)),
    'hurt': lambda: mix(tone(320, 0.28, 'saw', 0.35, 90), noise(0.18, 0.35, 1400)),
    'break': lambda: mix(noise(0.3, 0.6, 3500, 400), tone(600, 0.08, 'square', 0.12, 200), delays=[0, 0.02]),
    'heal': lambda: mix(*[tone(f, 0.3, 'sine', 0.22) for f in (523, 659, 784, 1047)], delays=[0, 0.06, 0.12, 0.18]),
    'save': lambda: mix(*[tone(f, 0.8, 'sine', 0.2, r=0.3) for f in (392, 494, 587, 784)], delays=[0, 0.1, 0.2, 0.3]),
    'enemydie': lambda: mix(noise(0.35, 0.5, 2000, 200), tone(220, 0.35, 'saw', 0.15, 50)),
    'roar': lambda: mix(tone(95, 1.4, 'saw', 0.45, 55, a=0.08, r=0.6), tone(142, 1.3, 'saw', 0.25, 70, a=0.1, r=0.5), noise(1.3, 0.35, 700, 150, r=0.5)),
    'slam': lambda: mix(noise(0.7, 0.8, 500, 60, r=0.25), tone(70, 0.6, 'sine', 0.7, 35, r=0.2)),
    'splash': lambda: noise(0.4, 0.45, 2600, 500, r=0.12),
    'spit': lambda: mix(noise(0.22, 0.4, 900, 2600), tone(300, 0.16, 'sine', 0.2, 600)),
    'bubble': lambda: tone(500, 0.09, 'sine', 0.2, 1100),
    'geyser': lambda: noise(0.9, 0.6, 300, 3200, r=0.35),
    'windup': lambda: tone(200, 0.4, 'saw', 0.15, 420, r=0.3),
    'gate': lambda: mix(noise(1.1, 0.55, 300, 90, r=0.4), tone(55, 1.0, 'square', 0.15, 45, r=0.4)),
    'bosshit': lambda: mix(noise(0.16, 0.7, 1800, 250), tone(90, 0.15, 'square', 0.3, 50)),
    'death': lambda: mix(tone(300, 1.3, 'saw', 0.35, 40, r=0.5), noise(1.1, 0.35, 800, 80, r=0.4)),
    'victory': lambda: mix(*[tone(f, 0.6, 'tri', 0.25, r=0.25) for f in (262, 330, 392, 523, 392, 523, 659)], delays=[i * 0.14 for i in range(7)]),
    'select': lambda: tone(660, 0.12, 'square', 0.2, 990),
    'read': lambda: tone(880, 0.14, 'sine', 0.15, 1320),
}


def music_ambient(seconds=32):
    n = SR * seconds
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f, v in [(55, 0.10), (82.4, 0.06), (55.4, 0.07)]:
        saw = 2 * ((t * f) % 1) - 1
        lfo = 280 + 120 * np.sin(2 * np.pi * 0.0625 * t + f)
        out += lowpass(saw, lfo) * v
    scale = [220, 261.6, 293.7, 329.6, 392, 440, 523.3]
    r = np.random.default_rng(3)
    for k in range(int(seconds / 1.3)):
        if r.random() < 0.6:
            f = scale[r.integers(len(scale))] * (0.5 if r.random() < 0.3 else 1)
            bell = mix(tone(f, 2.6, 'sine', 0.06, r=0.8), tone(f * 2.01, 1.8, 'sine', 0.02, r=0.5))
            i = int(k * 1.3 * SR)
            seg = bell[:max(0, n - i)]
            out[i:i + len(seg)] += seg
    fade = int(SR * 2)
    out[:fade] *= np.linspace(0, 1, fade) ** 0.5
    out[-fade:] *= np.linspace(1, 0, fade) ** 0.5
    return out * 1.3


def music_boss(bars=8):
    step = 0.15
    steps = bars * 16
    n = int(SR * step * steps)
    out = np.zeros(n)
    t = np.arange(n) / SR
    for f, v in [(41.2, 0.08), (61.7, 0.05)]:
        out += lowpass(2 * ((t * f) % 1) - 1, 300) * v
    bass = [55, 55, 65.4, 55, 73.4, 55, 65.4, 49]
    lead = [440, 0, 523, 0, 494, 440, 0, 392, 440, 0, 587, 523, 494, 0, 440, 0]
    for s in range(steps):
        i = int(s * step * SR)
        def put(x):
            seg = x[:max(0, n - i)]; out[i:i + len(seg)] += seg
        put(tone(bass[(s >> 1) % len(bass)], 0.22, 'square', 0.12, r=0.08))
        if s % 4 == 0: put(tone(60, 0.2, 'sine', 0.4, 35, r=0.06))
        if s % 4 == 2: put(noise(0.06, 0.08, 6000, hp=True, r=0.02))
        note = lead[s % len(lead)]
        if note and s % 32 >= 16: put(tone(note, 0.3, 'tri', 0.09, r=0.12))
    return out * 1.2


def music_calm(seconds=24):
    n = SR * seconds
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f, v in [(65.4, 0.07), (98, 0.045)]:
        out += lowpass(2 * ((t * f) % 1) - 1, 260) * v
    r = np.random.default_rng(5)
    for k in range(int(seconds / 0.9)):
        f = [523, 659, 784, 1047][r.integers(4)]
        bell = tone(f, 2.0, 'sine', 0.05, r=0.6)
        i = int(k * 0.9 * SR); seg = bell[:max(0, n - i)]; out[i:i + len(seg)] += seg
    return out * 1.3


if __name__ == '__main__':
    os.makedirs(os.path.join(ROOT, 'assets', 'sfx'), exist_ok=True)
    os.makedirs(os.path.join(ROOT, 'assets', 'music'), exist_ok=True)
    for name, fn in SFX.items():
        write(os.path.join(ROOT, 'assets', 'sfx', name + '.mp3'), fn() * 0.9)
    write(os.path.join(ROOT, 'assets', 'music', 'ambient.mp3'), music_ambient())
    write(os.path.join(ROOT, 'assets', 'music', 'boss.mp3'), music_boss())
    write(os.path.join(ROOT, 'assets', 'music', 'calm.mp3'), music_calm())
    print('ok')
