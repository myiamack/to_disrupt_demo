// Pixel-art drawing helpers for the battle arena.
// Everything is drawn on a small low-resolution canvas and scaled up with
// `image-rendering: pixelated`, so every rectangle becomes a chunky pixel.
// The heroine is Myia's character; the five shadows are original designs.

/* ---------- tiny 3x5 pixel font (numbers + a few letters) ---------- */
const FONT = {
  0: ["111", "101", "101", "101", "111"],
  1: ["010", "110", "010", "010", "111"],
  2: ["111", "001", "111", "100", "111"],
  3: ["111", "001", "111", "001", "111"],
  4: ["101", "101", "111", "001", "001"],
  5: ["111", "100", "111", "001", "111"],
  6: ["111", "100", "111", "101", "111"],
  7: ["111", "001", "010", "010", "010"],
  8: ["111", "101", "111", "101", "111"],
  9: ["111", "101", "111", "001", "111"],
  "+": ["000", "010", "111", "010", "000"],
  "-": ["000", "000", "111", "000", "000"],
  "!": ["010", "010", "010", "000", "010"],
  A: ["111", "101", "111", "101", "101"],
  B: ["110", "101", "110", "101", "110"],
  C: ["111", "100", "100", "100", "111"],
  D: ["110", "101", "101", "101", "110"],
  E: ["111", "100", "111", "100", "111"],
  F: ["111", "100", "111", "100", "100"],
  G: ["111", "100", "101", "101", "111"],
  H: ["101", "101", "111", "101", "101"],
  I: ["111", "010", "010", "010", "111"],
  K: ["101", "101", "110", "101", "101"],
  L: ["100", "100", "100", "100", "111"],
  M: ["101", "111", "111", "101", "101"],
  N: ["111", "101", "101", "101", "101"],
  O: ["111", "101", "101", "101", "111"],
  P: ["111", "101", "111", "100", "100"],
  R: ["110", "101", "110", "101", "101"],
  S: ["111", "100", "111", "001", "111"],
  T: ["111", "010", "010", "010", "010"],
  U: ["101", "101", "101", "101", "111"],
  V: ["101", "101", "101", "101", "010"],
  W: ["101", "101", "111", "111", "101"],
  X: ["101", "101", "010", "101", "101"],
  Y: ["101", "101", "010", "010", "010"],
};

export function textWidth(text, scale = 1) {
  return Math.max(0, String(text).length * 4 * scale - scale);
}

export function drawText(ctx, text, x, y, color, scale = 1) {
  let cx = Math.round(x);
  ctx.fillStyle = color;
  for (const ch of String(text).toUpperCase()) {
    const glyph = FONT[ch];
    if (glyph) {
      for (let r = 0; r < 5; r += 1) {
        for (let c = 0; c < 3; c += 1) {
          if (glyph[r][c] === "1") ctx.fillRect(cx + c * scale, Math.round(y) + r * scale, scale, scale);
        }
      }
    }
    cx += 4 * scale;
  }
}

/* ---------- grid sprites ---------- */
function normalize(rows) {
  const width = Math.max(...rows.map((row) => row.length));
  return rows.map((row) => row.padEnd(width, "."));
}

export function drawGrid(ctx, grid, palette, x, y, scale = 1, flash = false) {
  for (let r = 0; r < grid.length; r += 1) {
    const row = grid[r];
    for (let c = 0; c < row.length; c += 1) {
      const ch = row[c];
      if (ch === ".") continue;
      ctx.fillStyle = flash ? "#ffffff" : palette[ch] || "#ff00ff";
      ctx.fillRect(Math.round(x + c * scale), Math.round(y + r * scale), scale, scale);
    }
  }
}

/* ---------- the five opponents (one per gift) ---------- */
const ELEPHANT = normalize(["CC......oooooo........", "cC....ooEEEEEEoo......", "cC...oEEEEEEEEEEo.....", "cC..oELLEEEEEEEoPPo...", "cC.oELLEEEEEEEEoPPPo..", "cC.oELEEwkEEEEEoPPPPo.", "cCoELEEEkkEEEEEoPPPPo.", "cCoEEEEEEEEEEEEoPPPPo.", "cCoEEEEEEEEEEEEEoPPo..", "cCoEoEwEEEEEEEEEEoo...", "cCoEo.oEEEEEEEEEEEo...", "cCoEo.oESEEEEEEESEo...", "cCoEo.oESoooooESSo....", "cC.oEooSSo...oSSo.....", "cC..oo.oo.....oo......"]);

const KNIGHT = normalize(["......oooooooo......", ".....oHHGGGGGGo.....", "....oHHGGGGGGGGo....", "....oHGGGGGGGGGo....", "....oGGooooooGGo....", "....oGGoPPPPoGGo....", "....oGGooooooGGo....", "....oGGGGooGGGGo....", ".....oSGGooGGSo.....", "..oooooSGGGGSooooo..", ".oCCCCCoSSSSoCCCCCo.", "oCCCCCCCooooCCCCCCCo", "oCDCCCCCCYYCCCCCCDCo", "oCDCCCCCYDDYCCCCCDCo", "oCDCCCCCCYYCCCCCCDCo", ".oCCCCCCCCCCCCCCCCo.", "..oooooooooooooooo.."]);

const HUSH = normalize(["........oo........", ".......oBBo.......", "......oBBBBo......", ".......oBBo.......", "....oooooooooo....", "...oWLLWWWWWWWo...", "..oWLLWWWWWWWWWo..", "..oWLgggWWgggWWo..", "..oWWgkgWWgkgWWo..", "..oWWgggWWgggWWo..", "..oWrWWWWWWWWrWo..", "..oWWWWWokoWWWWo..", "..oWWWWWWfWWWWWo..", "..oWWWWWWfWWWWWo..", "..oWWSWWWWWWWSWo..", "..oWSSWWWWWWSSSo..", "..oWSoSWWWWSoSSo..", "..ooo.oSWWSo.ooo..", ".......oooo......."]);

const GREMLIN = normalize(["oo..................oo", "oEo................oEo", "oeEo..oooooooooo..oEeo", ".oeEooGGGGGGGGGGooEeo.", "..oeEoGLLGGGGGGGoEeo..", "...ooGLGGGGGGGGGGoo...", "....oGGYYYGGGYYYGo....", "....oGGYkYGGGYkYGo....", "....oGGGGGGGGGGGGo....", "....oGGowowowowGGo....", ".....oGGoooooooGo.....", "....ooGGGGGGGGGGoo....", "...oGoSGGGGGGGGSoGo...", "...ooooSGGooGGSoooo...", "......oSSo..oSSo......", ".......oo....oo......."]);

const STORM = normalize(["........oooo..........", "......ooCCCCoo..ooo...", ".....oCCLLLCCCooCCCo..", "...ooCCLLCCCCCCCCLCCo.", "..oCCCLCCCCCCCCCCCCCo.", ".oCCCCCCCCCCCCCCCCCCCo", "oCCCCCbbCCCCCCbbCCCCCo", "oCCCCCCkCCCCCCkCCCCCCo", "oCCCCCCtCCCCCCCCCCCCCo", "oCCCCCCtCCooooCCCCCCCo", ".oCCCCCCCoCCCCoCCCCCo.", "..oSSSSSSSSSSSSSSSSo..", "...oooooooooooooooo...", "......y.......Y.......", ".....yY......yY.......", "......Y.......y.......", ".....y.......y........"]);

export const BOSSES = [
  { name: "The Elephant in the Room", tagline: "Too big to ignore, but nobody will talk about it.", grid: ELEPHANT, palette: { o: '#140c2a', E: '#7a6aa8', L: '#a99be0', S: '#54467e', P: '#e2a6cf', w: '#ffffff', k: '#140a24', c: '#6e2c55', C: '#4a1f3a' } },
  { name: "Sir Same-Old", tagline: "Says “That's how we've always done it.”", grid: KNIGHT, palette: { o: '#05040a', G: '#43415a', H: '#8d8bad', S: '#2a283e', P: '#c084fc', C: '#2c1c4c', D: '#1a1030', Y: '#b8862a' } },
  { name: "The Hush", tagline: "Shushes anyone who tries to speak up.", grid: HUSH, palette: { o: '#1e1640', W: '#9a90c4', L: '#cfc7f2', S: '#6a609a', B: '#4a3c78', g: '#f2ecff', k: '#1a1236', f: '#efe6ff', r: '#ff9cc6' }, float: true },
  { name: "The Doubt Gremlin", tagline: "Whispers “you can't.” Grows when you miss.", grid: GREMLIN, palette: { o: '#120a20', E: '#5b4590', e: '#8a6fc4', G: '#4b3b6e', L: '#7460a6', S: '#2d2147', Y: '#c6ff4d', k: '#000000', w: '#ffffff' }, grows: true },
  { name: "The Lonely Storm", tagline: "Makes people feel alone when times get hard.", grid: STORM, palette: { o: '#0e1430', C: '#3b4a7a', L: '#6a7fbc', S: '#25305a', b: '#0d0d1a', k: '#ffe066', t: '#7cc8ff', y: '#ffe066', Y: '#fff4b0' }, float: true },
];

export function bossColors(boss) {
  return boss.colors || Object.values(boss.palette);
}

/** Draws a boss with its feet centred on (cx, groundY). */
export function drawBoss(ctx, boss, cx, groundY, t, { flash = false, alpha = 1, cell = 3 } = {}) {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha * (boss.float ? 0.88 : 1);
  const bob = boss.float ? Math.round(Math.sin(t / 380) * 2) - 4 : Math.round(Math.sin(t / 300));
  if (boss.draw) {
    boss.draw(ctx, Math.round(cx - 14), Math.round(groundY - 28 + bob), t, flash);
  } else {
    const w = boss.grid[0].length * cell;
    const h = boss.grid.length * cell;
    const x = cx - w / 2;
    const y = groundY - h + bob * 2;
    drawGrid(ctx, boss.grid, boss.palette, x, y, cell, flash);
    if (boss.label) drawText(ctx, boss.label, cx - textWidth(boss.label) / 2, y + 13, flash ? "#fff" : "#2a2350");
  }
  ctx.globalAlpha = 1;
}

/* ---------- the hero: Myia's heroine in pixel form ---------- */
const HERO = {
  skin: "#8a5a3c",
  skinS: "#6b412a",
  hair: "#24160f",
  hairH: "#3d281c",
  gold: "#f6b93b",
  goldD: "#c98a1a",
  top: "#7a4a2a",
  topD: "#5a341f",
  k1: "#f2a900",
  k2: "#1f8a3b",
  k3: "#d6312b",
  k4: "#1d4fa3",
  boot: "#3a2216",
  eye: "#140a06",
  white: "#ffffff",
};
const KENTE = ["k1", "k2", "k1", "k3", "k1", "k4", "k2", "k3"];

const POSES = {
  idle: { legs: "stand", arms: "guard" },
  guard: { legs: "wide", arms: "guard" },
  jab: { legs: "wide", arms: "jab" },
  kick: { legs: "kick", arms: "guard", ox: -1 },
  flykick: { legs: "fly", arms: "guard", oy: -9 },
  charge: { legs: "wide", arms: "charge" },
  beam: { legs: "wide", arms: "beam" },
  hurt: { legs: "stand", arms: "hurt", ox: -3 },
  victory: { legs: "stand", arms: "victory" },
  power: { legs: "wide", arms: "power" },
  stretch: { legs: "stand", arms: "stretch" },
};

/** Draws the heroine facing right with feet centred on (x, y). */
export function drawHero(ctx, x, y, pose, t, { flash = false } = {}) {
  const p = (c, dx, dy, w = 1, h = 1) => {
    ctx.fillStyle = flash ? "#ffffff" : HERO[c];
    ctx.fillRect(Math.round(x + dx), Math.round(y + dy), w, h);
  };

  if (pose === "down") {
    p("hair", -17, -7, 7, 6);
    p("skin", -11, -5, 5, 4);
    p("k1", -11, -6, 1, 1); p("k2", -10, -6, 1, 1); p("k3", -9, -6, 1, 1);
    p("eye", -8, -4, 2, 1);
    p("top", -6, -5, 7, 4);
    p("gold", -6, -5, 1, 4);
    p("topD", 1, -4, 8, 3);
    p("k1", 3, -4, 1, 3); p("k2", 4, -4, 1, 3);
    p("boot", 9, -4, 2, 3);
    const a = t / 160;
    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = "#f6b93b";
      ctx.fillRect(Math.round(x - 12 + Math.cos(a + i * 2.1) * 5), Math.round(y - 12 + Math.sin(a + i * 2.1) * 2), 2, 2);
    }
    return;
  }

  const cfg = POSES[pose] || POSES.idle;
  const breathe = pose === "idle" ? Math.round(Math.sin(t / 260)) : 0;
  const ox = cfg.ox || 0;
  const oy = (cfg.oy || 0) + breathe;
  const P = (c, dx, dy, w, h) => p(c, dx + ox, dy + oy, w, h);
  const L = (c, dx, dy, w, h) => p(c, dx + ox, dy + (cfg.oy || 0), w, h);

  // legs (brown leggings with a kente stripe) and boots
  switch (cfg.legs) {
    case "wide":
      L("topD", -5, -8, 3, 4); L("topD", -6, -4, 3, 3); L("boot", -7, -1, 3, 1);
      L("topD", 2, -8, 3, 4); L("topD", 3, -4, 3, 3); L("boot", 3, -1, 4, 1);
      break;
    case "kick":
      L("topD", -3, -8, 3, 7); L("boot", -3, -1, 3, 1);
      L("skin", 1, -11, 8, 3); L("gold", 5, -11, 1, 3); L("boot", 9, -12, 2, 4);
      break;
    case "fly":
      L("topD", -6, -8, 4, 3); L("boot", -8, -8, 2, 3);
      L("skin", 1, -8, 4, 3); L("skin", 4, -7, 5, 3); L("boot", 9, -7, 3, 3);
      break;
    default:
      L("topD", -4, -8, 3, 7); L("boot", -4, -1, 3, 1);
      L("topD", 1, -8, 3, 7); L("boot", 1, -1, 4, 1);
  }

  // afro (drawn first so the face sits on top)
  P("hair", -4, -32, 8, 1);
  P("hair", -6, -31, 12, 1);
  P("hair", -7, -30, 14, 1);
  P("hair", -8, -29, 16, 8);
  P("hair", -7, -21, 13, 2);
  P("hair", -6, -19, 4, 2);
  P("hairH", -5, -30, 3, 1);
  P("hairH", -7, -27, 1, 3);
  P("hairH", 4, -29, 2, 1);

  // back arm
  const backArm = {
    guard: () => { P("skin", -6, -14, 2, 4); P("gold", -6, -13, 2, 1); P("skin", -6, -10, 2, 2); },
    jab: () => { P("skin", -6, -14, 2, 3); P("gold", -6, -13, 2, 1); P("skin", -5, -12, 2, 2); },
    charge: () => { P("skin", -7, -13, 3, 2); P("skin", -9, -14, 2, 3); },
    beam: () => { P("skin", 2, -12, 5, 2); P("gold", 4, -12, 1, 2); },
    hurt: () => { P("skin", -7, -16, 2, 3); P("skin", -8, -18, 2, 2); },
    victory: () => { P("skin", -6, -13, 2, 3); P("skin", -5, -10, 2, 2); },
    power: () => { P("skin", -7, -13, 2, 4); P("gold", -7, -12, 2, 1); P("skin", -7, -9, 2, 2); },
    stretch: () => { P("skin", -5, -19, 2, 5); P("skin", -5, -21, 2, 2); },
  };
  (backArm[cfg.arms] || backArm.guard)();

  // torso: leather top, bead necklace, kente sash, gold belt
  P("top", -4, -15, 8, 7);
  P("topD", 2, -15, 2, 7);
  KENTE.slice(0, 6).forEach((c, i) => P(c, -3 + i, -15, 1, 1));
  P("k1", -4, -13, 1, 1); P("k2", -3, -12, 1, 1); P("k3", -2, -11, 1, 1); P("k1", -1, -10, 1, 1);
  P("gold", -4, -9, 8, 1);
  P("k2", -1, -8, 1, 1); P("k1", 0, -8, 1, 1); P("k3", 1, -8, 1, 1);

  // face
  P("skin", -3, -22, 6, 6);
  P("skinS", -3, -18, 1, 2);
  P("eye", 1, -20, 1, 2);
  P("eye", -1, -20, 1, 1);
  P("white", 1, -20, 1, 1);
  P("skinS", 1, -17, 2, 1);

  // kente headwrap across the top of the afro
  KENTE.forEach((c, i) => P(c, -4 + i, -24, 1, 2));
  P("k1", 4, -23, 1, 1);

  // gold hoop earring
  P("gold", -4, -18, 1, 2);
  P("gold", -3, -16, 1, 1);

  // front arm
  const frontArm = {
    guard: () => { P("skin", 3, -14, 2, 3); P("gold", 3, -13, 2, 1); P("skin", 4, -12, 2, 2); },
    jab: () => { P("skin", 3, -14, 5, 2); P("gold", 5, -14, 1, 2); P("skin", 8, -14, 3, 2); },
    charge: () => { P("skin", -6, -12, 3, 2); P("skin", -8, -11, 2, 2); },
    beam: () => { P("skin", 3, -14, 5, 2); P("gold", 5, -14, 1, 2); P("skin", 8, -14, 2, 4); },
    hurt: () => { P("skin", 3, -16, 2, 3); P("skin", 4, -18, 2, 2); },
    victory: () => { P("skin", 3, -19, 2, 5); P("gold", 3, -17, 2, 1); P("skin", 3, -22, 2, 3); },
    power: () => { P("skin", 3, -13, 2, 4); P("gold", 3, -12, 2, 1); P("skin", 3, -9, 2, 2); },
    stretch: () => { P("skin", 2, -19, 2, 5); P("skin", 2, -21, 2, 2); },
  };
  (frontArm[cfg.arms] || frontArm.guard)();
}

/** Flickering golden aura around the hero. */
export function drawAura(ctx, x, y, t, strength = 1) {
  const n = Math.round(22 * strength);
  for (let i = 0; i < n; i += 1) {
    const seed = (i * 97 + Math.floor(t / 70) * 13) % 101;
    const ang = (i / n) * Math.PI * 2;
    const rx = 10 + (seed % 4);
    const ry = 16 + (seed % 5);
    const px = x + Math.cos(ang) * rx;
    const py = y - 13 + Math.sin(ang) * ry - ((t / 6 + seed * 3) % 6);
    ctx.fillStyle = seed % 3 === 0 ? "#ffffff" : seed % 3 === 1 ? "#f6b93b" : "#ffe08a";
    ctx.globalAlpha = 0.85;
    ctx.fillRect(Math.round(px), Math.round(py), seed % 2 ? 2 : 1, 2);
  }
  ctx.globalAlpha = 1;
}
