// Arcade fighting-game sound effects, synthesised live with the Web Audio API
// (no audio files). Sound is off until the player turns it on.

let ctx = null;
let enabled = false;

export function setSoundEnabled(on) {
  enabled = on;
  if (!on) return;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  } catch {
    enabled = false;
  }
}

function tone({ type = "square", f0, f1 = f0, dur, vol = 0.1, delay = 0 }) {
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise({ dur, vol = 0.2, f = 1500, q = 1, delay = 0 }) {
  const t = ctx.currentTime + delay;
  const length = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = f;
  filter.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(t);
}

const arp = (notes, step, dur, vol, type = "square") =>
  notes.forEach((f, i) => tone({ type, f0: f, dur, vol, delay: i * step }));

const SOUNDS = {
  jab: () => { noise({ dur: 0.06, vol: 0.3, f: 3000 }); tone({ f0: 520, f1: 180, dur: 0.07, vol: 0.07 }); },
  kick: () => { noise({ dur: 0.1, vol: 0.35, f: 1200 }); tone({ type: "triangle", f0: 180, f1: 55, dur: 0.15, vol: 0.3 }); },
  flykick: () => {
    tone({ type: "sawtooth", f0: 300, f1: 900, dur: 0.14, vol: 0.05 });
    noise({ dur: 0.12, vol: 0.35, f: 1500, delay: 0.12 });
    tone({ type: "triangle", f0: 160, f1: 50, dur: 0.16, vol: 0.3, delay: 0.12 });
  },
  charge: () => { tone({ type: "sawtooth", f0: 110, f1: 900, dur: 0.6, vol: 0.06 }); tone({ f0: 220, f1: 1800, dur: 0.6, vol: 0.025 }); },
  beam: () => { noise({ dur: 0.55, vol: 0.3, f: 800, q: 0.5 }); tone({ type: "sawtooth", f0: 900, f1: 180, dur: 0.55, vol: 0.07 }); },
  hurt: () => { tone({ f0: 400, f1: 90, dur: 0.25, vol: 0.09 }); noise({ dur: 0.08, vol: 0.25, f: 900 }); },
  explode: () => { noise({ dur: 0.75, vol: 0.4, f: 450, q: 0.4 }); tone({ type: "triangle", f0: 120, f1: 30, dur: 0.6, vol: 0.3 }); },
  drop: () => { tone({ f0: 900, f1: 200, dur: 0.25, vol: 0.04 }); tone({ type: "triangle", f0: 90, f1: 40, dur: 0.2, vol: 0.3, delay: 0.4 }); },
  levelup: () => arp([523, 659, 784, 1047], 0.08, 0.12, 0.06),
  victory: () => arp([392, 523, 659, 784, 659, 1047], 0.11, 0.14, 0.06),
  ko: () => tone({ f0: 300, f1: 55, dur: 0.9, vol: 0.09 }),
  respawn: () => arp([262, 392, 523, 784], 0.07, 0.1, 0.05, "triangle"),
  achieve: () => arp([880, 1175, 1568], 0.07, 0.12, 0.05),
  reveal: () => tone({ f0: 660, f1: 990, dur: 0.07, vol: 0.04 }),
  wrong: () => tone({ type: "sawtooth", f0: 160, f1: 110, dur: 0.18, vol: 0.06 }),
};

export function sfx(name) {
  if (!enabled || !ctx) return;
  try {
    SOUNDS[name]?.();
  } catch {
    /* ignore audio errors */
  }
}
