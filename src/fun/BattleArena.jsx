// Pixel battle arena: the hero fights the six tech bosses at the top of the game.
// Quiz answers drive the fight through useFun() → arenaRef.enqueue(action).
import React, { useEffect, useRef, useState } from "react";
import { BOSSES, bossColors, drawAura, drawBoss, drawHero, drawText } from "./pixel";
import { useFun, XP_PER_LEVEL } from "./FunProvider";
import VoicePicker from "@/components/game/VoicePicker";

const H = 84; // logical canvas height in pixels
const GROUND = 74;
const HS = 2; // the heroine is drawn at double pixel size
const lerp = (a, b, k) => a + (b - a) * Math.min(Math.max(k, 0), 1);
const easeOutBounce = (x) => {
  const n = 7.5625;
  const d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
};

function makeStars(width) {
  const stars = [];
  for (let i = 0; i < Math.floor(width / 7); i += 1) {
    stars.push({ x: (i * 53) % width, y: (i * 29) % 44, p: i % 5 });
  }
  return stars;
}

function drawBackground(ctx, W, t, stars) {
  // deep indigo night, like the slides
  const bands = ["#120a2a", "#160c33", "#1a0f3b", "#1e1244", "#22154c", "#261752"];
  const bandH = Math.ceil(GROUND / bands.length);
  bands.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, i * bandH, W, bandH);
  });
  // twinkling sparkles
  for (const s of stars) {
    const on = (Math.floor(t / 500) + s.p) % 5 !== 0;
    ctx.fillStyle = on ? (s.p % 2 ? "#f6b93b" : "#e9e3ff") : "#2c1f5c";
    ctx.fillRect(s.x, s.y, 1, 1);
    if (on && s.p === 0) {
      ctx.fillRect(s.x - 1, s.y, 3, 1);
      ctx.fillRect(s.x, s.y - 1, 1, 3);
    }
  }
  // stone pillars in the distance
  for (let x = 6, i = 0; x < W; i += 1) {
    const h = 26 + ((i * 7) % 8);
    ctx.fillStyle = "#1c1340";
    ctx.fillRect(x, GROUND - h, 6, h);
    ctx.fillStyle = "#241a52";
    ctx.fillRect(x - 1, GROUND - h, 8, 2);
    x += 34 + ((i * 11) % 18);
  }
  // stone floor with a line of gold light
  ctx.fillStyle = "#1b1140";
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = "#f6b93b";
  ctx.fillRect(0, GROUND, W, 1);
  ctx.fillStyle = "#2a1c58";
  for (let x = 0; x < W; x += 12) ctx.fillRect(x, GROUND + 1, 1, H - GROUND);
  ctx.fillRect(0, GROUND + 5, W, 1);
}

export default function BattleArena() {
  const fun = useFun();
  const { stats, level, rank, arenaRef, sfx, shake, toggleSound, toggleArena, togglePet, reduceMotion, scene, showArena, showStage, fighter } = fun;
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const engine = useRef(null);
  const [display, setDisplay] = useState(() => ({ boss: scene - 1, hp: 1, gone: !!stats.beaten?.[scene] }));
  const [banner, setBanner] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [scale, setScale] = useState(3);

  // Keep callbacks fresh for the animation loop without restarting it.
  const live = useRef({});
  live.current = { sfx, shake, setDisplay, setBanner, reduceMotion };

  useEffect(() => {
    const E = {
      W: 300,
      t: 0,
      stars: makeStars(300),
      hero: { pose: "idle", dx: 0, dy: 0, flash: 0 },
      boss: { idx: display.boss, hp: display.hp, gone: display.gone, dx: 0, dy: 0, flash: 0, alpha: display.gone ? 0 : 1 },
      particles: [],
      floats: [],
      beam: 0,
      aura: 0,
      charge: 0,
      queue: [],
      cur: null,
      curT: 0,
      idleFor: 0,
    };
    engine.current = E;
    arenaRef.current = {
      enqueue: (action) => {
        if (E.queue.length < 12) E.queue.push(action);
      },
    };

    const heroX = () => Math.round(E.W * 0.28);
    const bossX = () => Math.round(E.W * 0.72);
    const pushDisplay = () => live.current.setDisplay({ boss: E.boss.idx, hp: E.boss.hp, gone: E.boss.gone });

    const spark = (x, y, big = false) => {
      const n = big ? 26 : 12;
      for (let i = 0; i < n; i += 1) {
        const a = (i / n) * Math.PI * 2;
        const v = (big ? 0.09 : 0.06) * (0.6 + (i % 3) * 0.3);
        E.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 320, max: 320, color: i % 2 ? "#ffffff" : "#f6b93b", size: 1, g: 0 });
      }
    };
    const floatText = (text, x, y, color) => E.floats.push({ text, x, y, life: 900, color });
    const explode = (x, y, colors) => {
      for (let i = 0; i < 46; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const v = 0.03 + Math.random() * 0.09;
        E.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.04, life: 700, max: 700, color: colors[i % colors.length], size: 1 + (i % 2), g: 0.00012 });
      }
    };
    const hitBoss = (label, hpAfter, big) => {
      const bx = bossX();
      spark(bx - 12, GROUND - 22, big);
      floatText(label, bx - 6, GROUND - 52, big ? "#ff6fae" : "#f6b93b");
      E.boss.flash = big ? 300 : 140;
      E.boss.hp = hpAfter;
      pushDisplay();
    };

    // Each action: { dur, step(elapsed, once) }.
    const once = (a, key) => {
      if (a[key]) return false;
      a[key] = true;
      return true;
    };
    const RUN = {
      attack(a, e) {
        const reach = bossX() - heroX() - 46;
        if (e < 150) {
          E.hero.pose = "guard";
          E.hero.dx = lerp(0, reach, e / 150);
          E.hero.dy = a.kind === "flykick" ? -Math.sin((e / 150) * Math.PI * 0.5) * 10 : 0;
        } else if (e < 340) {
          E.hero.pose = a.kind;
          E.hero.dx = reach;
          if (once(a, "hit")) {
            live.current.sfx(a.kind);
            hitBoss(a.label, a.hpAfter, false);
          }
        } else {
          E.hero.pose = "guard";
          E.hero.dx = lerp(reach, 0, (e - 340) / 180);
          E.hero.dy = 0;
        }
        return e >= 540;
      },
      beam(a, e) {
        if (e < 650) {
          E.hero.pose = "charge";
          E.aura = 80;
          E.charge = e / 650;
          if (once(a, "s")) live.current.sfx("charge");
        } else if (e < 1150) {
          E.hero.pose = "beam";
          E.charge = 0;
          E.beam = 60;
          if (once(a, "hit")) {
            live.current.sfx("beam");
            live.current.shake();
            hitBoss("x3", a.hpAfter, true);
            floatText("COMBO!", heroX() - 12, GROUND - 74, "#f6b93b");
          }
        } else {
          E.hero.pose = "idle";
        }
        return e >= 1300;
      },
      defeat(a, e) {
        if (e >= 150 && once(a, "boom")) {
          live.current.sfx("explode");
          explode(bossX(), GROUND - 20, [...bossColors(BOSSES[E.boss.idx]), "#f6b93b", "#ffffff"]);
          E.boss.alpha = 0;
          floatText("LIGHT WINS!", bossX() - 22, GROUND - 56, "#f6b93b");
        }
        if (e >= 160 && once(a, "gone")) {
          E.boss.gone = true;
          E.boss.hp = 0;
          pushDisplay();
        }
        E.hero.pose = e > 150 ? "victory" : "idle";
        return e >= 1300;
      },
      spawn(a, e) {
        if (once(a, "s")) {
          E.boss.idx = a.gift - 1;
          E.boss.hp = a.hp ?? 1;
          E.boss.gone = !!a.gone;
          E.boss.alpha = a.gone ? 0 : 1;
          E.boss.dy = -80;
          pushDisplay();
          if (!a.gone && !a.quiet) live.current.sfx("drop");
        }
        E.boss.dy = a.gone ? 0 : lerp(-80, 0, easeOutBounce(e / 550));
        return e >= 600;
      },
      lunge(a, e) {
        if (E.boss.gone) {
          if (once(a, "hit")) { live.current.sfx("hurt"); E.hero.flash = 160; }
          E.hero.pose = e < 400 ? "hurt" : "idle";
          return e >= 500;
        }
        const reach = bossX() - heroX() - 44;
        if (e < 240) {
          E.boss.dx = -lerp(0, reach, e / 240);
        } else if (e < 560) {
          if (once(a, "hit")) {
            live.current.sfx("hurt");
            spark(heroX() + 4, GROUND - 28, false);
            floatText("-1", heroX() - 2, GROUND - 74, "#ff5c8a");
            E.hero.flash = 160;
          }
          E.hero.pose = "hurt";
          E.boss.dx = -lerp(reach, 0, (e - 240) / 320);
        } else {
          E.hero.pose = "idle";
          E.boss.dx = 0;
        }
        return e >= 700;
      },
      ko(a, e) {
        if (once(a, "s")) {
          live.current.sfx("ko");
          live.current.setBanner(true);
        }
        E.hero.pose = e < 2300 ? "down" : "power";
        if (e >= 2300) E.aura = 80;
        if (e >= 2300 && once(a, "up")) {
          live.current.sfx("respawn");
          live.current.setBanner(false);
        }
        return e >= 2900;
      },
      levelup(a, e) {
        if (once(a, "s")) {
          live.current.sfx("levelup");
          floatText("LV UP!", heroX() - 12, GROUND - 76, "#f6b93b");
        }
        E.hero.pose = "power";
        E.aura = 80;
        return e >= 1300;
      },
      victory(a, e) {
        if (once(a, "s")) live.current.sfx("victory");
        E.hero.pose = "victory";
        E.hero.dy = e < 300 ? -Math.sin((e / 300) * Math.PI) * 10 : 0;
        if (Math.floor(e / 120) !== a.last) {
          a.last = Math.floor(e / 120);
          spark(heroX() + ((a.last * 7) % 40) - 20, GROUND - 60 - (a.last % 3) * 6, false);
        }
        return e >= 1700;
      },
      flourish(a, e) {
        if (a.move === "shadow") E.hero.pose = Math.floor(e / 160) % 2 ? "jab" : "guard";
        else if (a.move === "hop") {
          E.hero.pose = "guard";
          E.hero.dy = -Math.abs(Math.sin((e / 450) * Math.PI)) * 8;
        } else if (a.move === "kick") E.hero.pose = e < 450 ? "kick" : "guard";
        else E.hero.pose = "stretch";
        if (e >= 900) {
          E.hero.dy = 0;
          E.hero.pose = "idle";
        }
        return e >= 900;
      },
    };

    let raf = 0;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(now - last, 50);
      last = now;
      E.t += dt;
      const canvas = canvasRef.current;
      if (!canvas) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext("2d");

      // advance the action queue
      if (!E.cur && E.queue.length) {
        E.cur = E.queue.shift();
        E.curT = 0;
        E.idleFor = 0;
      }
      if (E.cur) {
        E.curT += dt;
        if (RUN[E.cur.type](E.cur, E.curT)) {
          E.cur = null;
          E.hero.dx = 0;
          E.hero.dy = 0;
          E.hero.pose = "idle";
        }
      } else {
        E.idleFor += dt;
        if (E.idleFor > 4200) {
          E.idleFor = 0;
          const moves = ["shadow", "hop", "kick", "stretch"];
          E.queue.push({ type: "flourish", move: moves[Math.floor(Math.random() * moves.length)] });
        }
      }
      E.hero.flash = Math.max(0, E.hero.flash - dt);
      E.boss.flash = Math.max(0, E.boss.flash - dt);
      E.beam = Math.max(0, E.beam - dt);
      E.aura = Math.max(0, E.aura - dt);

      // draw
      const W = E.W;
      ctx.imageSmoothingEnabled = false;
      drawBackground(ctx, W, E.t, E.stars);

      const bx = bossX() + E.boss.dx;
      const boss = BOSSES[E.boss.idx];
      drawBoss(ctx, boss, bx, GROUND + E.boss.dy, E.t, {
        flash: E.boss.flash > 0 && Math.floor(E.t / 50) % 2 === 0,
        alpha: E.boss.alpha,
      });

      const hx = Math.round(heroX() + E.hero.dx);
      const hy = Math.round(GROUND + E.hero.dy);
      ctx.save();
      ctx.translate(hx, hy);
      ctx.scale(HS, HS);
      if (E.aura > 0) drawAura(ctx, 0, 0, E.t, 1);
      drawHero(ctx, 0, 0, E.hero.pose, E.t, { flash: E.hero.flash > 0 && Math.floor(E.t / 50) % 2 === 0 });
      if (E.charge > 0) {
        const r = 1 + Math.round(E.charge * 3);
        ctx.fillStyle = Math.floor(E.t / 60) % 2 ? "#f6b93b" : "#ffffff";
        ctx.fillRect(-9 - r, -13 - r, r * 2, r * 2);
      }
      ctx.restore();
      if (E.beam > 0) {
        const sx = hx + 10 * HS;
        const ex = bx - 14;
        const by = hy - 15 * HS;
        const flick = Math.floor(E.t / 40) % 2;
        ctx.fillStyle = flick ? "#e09a1f" : "#f6b93b";
        ctx.fillRect(sx, by - 5, ex - sx, 11);
        ctx.fillStyle = flick ? "#ffe08a" : "#ffd36b";
        ctx.fillRect(sx, by - 3, ex - sx, 7);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(sx, by - 1, ex - sx, 3);
        ctx.fillRect(ex - 4, by - 8, 9, 17);
      }

      E.particles = E.particles.filter((p) => (p.life -= dt) > 0);
      for (const p of E.particles) {
        p.vy += (p.g || 0) * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.globalAlpha = Math.max(p.life / p.max, 0.2);
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      ctx.globalAlpha = 1;

      E.floats = E.floats.filter((f) => (f.life -= dt) > 0);
      for (const f of E.floats) {
        const rise = (900 - f.life) / 60;
        drawText(ctx, f.text, f.x + 1, f.y - rise + 1, "#120a24");
        drawText(ctx, f.text, f.x, f.y - rise, f.color);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      arenaRef.current = null;
    };
    // The engine runs for the life of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fit the logical canvas to the container width.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const fit = () => {
      const width = wrap.clientWidth;
      const s = width >= 900 ? 3 : 2;
      const W = Math.max(160, Math.floor(width / s));
      setScale(s);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = W;
        canvas.height = H;
      }
      if (engine.current) {
        engine.current.W = W;
        engine.current.stars = makeStars(W);
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [stats.arenaHidden, showArena, showStage]);

  // When the player moves to a different gift, bring in that gift's shadow.
  const firstScene = useRef(true);
  useEffect(() => {
    if (firstScene.current) {
      firstScene.current = false;
      return;
    }
    arenaRef.current?.enqueue({ type: "spawn", gift: scene, gone: !!stats.beaten?.[scene], quiet: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  if (!showArena) return null;

  const villain = BOSSES[display.boss];
  const xpInLevel = stats.xp % XP_PER_LEVEL;

  return (
    <section className="fun-arena" aria-label="Battle arena">
      <div className="fun-hud">
        <div className="fun-hud__group">
          <span className="fun-chip fun-chip--rank" title={`${stats.xp} XP total`}>
            Level {level} · {rank}
          </span>
          <span className="fun-xp" aria-label={`${xpInLevel} of ${XP_PER_LEVEL} XP to the next level`}>
            <span className="fun-xp__fill" style={{ width: `${xpInLevel}%` }} />
          </span>
          <span className="fun-hearts fun-hearts--hud" aria-label={`${stats.hearts} of 5 hearts`}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={i < stats.hearts ? "is-full" : ""}>♥</span>
            ))}
          </span>
          {stats.combo >= 2 && <span className="fun-chip fun-chip--combo">Combo x{stats.combo}</span>}
          <span className="fun-chip" title="Days in a row you played">🔥 {stats.streak} day{stats.streak === 1 ? "" : "s"}</span>
        </div>
        <div className="fun-hud__group">
          <button
            type="button"
            className="fun-btn"
            onClick={toggleSound}
            aria-pressed={stats.sound}
            aria-label={stats.sound ? "Turn sound effects off" : "Turn sound effects on"}
            title={stats.sound ? "Sound on" : "Sound off"}
          >
            {stats.sound ? "🔊" : "🔇"}
          </button>
          <button
            type="button"
            className="fun-btn fun-btn--wide"
            onClick={() => setVoiceOpen(true)}
            aria-label="Pick Myia's Hero's voice"
            title="Pick her voice"
          >
            🗣️ Voice
          </button>
          <button
            type="button"
            className="fun-btn"
            onClick={togglePet}
            aria-pressed={!stats.petHidden}
            aria-label={stats.petHidden ? "Show Myia's Hero" : "Hide Myia's Hero"}
            title={stats.petHidden ? "Show Myia's Hero" : "Hide Myia's Hero"}
          >
            {stats.petHidden ? "🙈" : "🐾"}
          </button>
          {showStage && (
          <button
            type="button"
            className="fun-btn"
            onClick={toggleArena}
            aria-expanded={!stats.arenaHidden}
            aria-label={stats.arenaHidden ? "Show battle arena" : "Hide battle arena"}
            title={stats.arenaHidden ? "Show arena" : "Hide arena"}
          >
            {stats.arenaHidden ? "▸" : "▾"}
          </button>
          )}
        </div>
      </div>

      {showStage && !stats.arenaHidden && (
        <div ref={wrapRef} className="fun-stage" style={{ height: H * scale }}>
          <canvas ref={canvasRef} className="fun-canvas" width={300} height={H} aria-hidden />
          {villain && (
            <div className="fun-overlay fun-overlay--right">
              <span>{villain.name}{display.gone ? " · beaten ✓" : ""}</span>
              {!display.gone && (
                <span className="fun-hp" aria-label={`${villain.name} health ${Math.round(display.hp * 100)} percent`}>
                  <span className="fun-hp__fill" style={{ width: `${display.hp * 100}%` }} />
                </span>
              )}
              <small>{villain.tagline}</small>
            </div>
          )}
          {banner && (
            <div className="fun-banner" role="status">
              Failure is the first step to success.
            </div>
          )}
        </div>
      )}
      <VoicePicker open={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </section>
  );
}
