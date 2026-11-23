// Animated "light in the dark" background: diagonal light streaks glide down
// in three depth layers (parallax), sparkles float, and the whole scene drifts
// gently like it's floating. Shows a still frame if the computer asks for less motion.
import { useEffect, useRef } from "react";

const ANGLE = (-62 * Math.PI) / 180; // same tilt as the slide streaks
const COLORS = ["246,185,59", "192,132,252", "255,111,174", "139,92,246", "255,224,138"];

function makeScene(w, h) {
  const diag = Math.hypot(w, h);
  const streaks = [];
  const layers = [
    { n: 8, depth: 0.35, width: [1, 2], alpha: [0.12, 0.22], speed: 0.25, len: [0.25, 0.45] },
    { n: 6, depth: 0.65, width: [2, 4], alpha: [0.22, 0.36], speed: 0.55, len: [0.3, 0.6] },
    { n: 4, depth: 1, width: [3, 7], alpha: [0.3, 0.5], speed: 1, len: [0.35, 0.7] },
  ];
  const rnd = (a, b) => a + Math.random() * (b - a);
  layers.forEach((L) => {
    for (let i = 0; i < L.n; i += 1) {
      streaks.push({
        across: rnd(-0.6, 1.6) * diag * 0.6,
        along: rnd(0, diag * 1.6),
        len: rnd(L.len[0], L.len[1]) * diag,
        width: rnd(L.width[0], L.width[1]),
        alpha: rnd(L.alpha[0], L.alpha[1]),
        speed: L.speed * rnd(0.6, 1.1),
        depth: L.depth,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
  });
  const sparks = Array.from({ length: Math.round((w * h) / 26000) }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: rnd(1.5, 5),
    depth: rnd(0.3, 1),
    phase: Math.random() * 6.28,
    color: Math.random() < 0.55 ? "255,224,138" : Math.random() < 0.5 ? "255,111,174" : "233,227,255",
  }));
  return { streaks, sparks, diag };
}

function star(ctx, x, y, r, rgb, a) {
  ctx.fillStyle = `rgba(${rgb},${a})`;
  ctx.beginPath();
  ctx.moveTo(x, y - r * 2);
  ctx.quadraticCurveTo(x, y, x + r * 2, y);
  ctx.quadraticCurveTo(x, y, x, y + r * 2);
  ctx.quadraticCurveTo(x, y, x - r * 2, y);
  ctx.quadraticCurveTo(x, y, x, y - r * 2);
  ctx.fill();
}

export default function MotionBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext("2d");
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let scene = null;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = makeScene(w, h);
    };

    const draw = (t) => {
      // deep indigo base with a soft glow, like the slides
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#0f0828");
      g.addColorStop(0.55, "#170d38");
      g.addColorStop(1, "#1f1048");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const glow = ctx.createRadialGradient(w * 0.75, h * 0.15, 0, w * 0.75, h * 0.15, Math.max(w, h) * 0.6);
      glow.addColorStop(0, "rgba(139,92,246,0.18)");
      glow.addColorStop(1, "rgba(139,92,246,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const floatY = Math.sin(t / 2600) * 8; // the whole scene floats a little
      const floatX = Math.cos(t / 3400) * 5;
      const dx = Math.cos(ANGLE);
      const dy = Math.sin(ANGLE);
      const px = -dy; // perpendicular, to spread streaks across the screen
      const py = dx;

      for (const s of scene.streaks) {
        const along = reduced ? s.along : (s.along + t * 0.06 * s.speed) % (scene.diag * 1.6);
        // move "down" the line: start top-right, travel to bottom-left
        const cx = w * 0.5 + px * s.across - dx * (along - scene.diag * 0.8) + floatX * s.depth;
        const cy = h * 0.5 + py * s.across - dy * (along - scene.diag * 0.8) + floatY * s.depth;
        const x1 = cx - dx * s.len * 0.5;
        const y1 = cy - dy * s.len * 0.5;
        const x2 = cx + dx * s.len * 0.5;
        const y2 = cy + dy * s.len * 0.5;
        const lg = ctx.createLinearGradient(x1, y1, x2, y2);
        lg.addColorStop(0, `rgba(${s.color},0)`);
        lg.addColorStop(0.5, `rgba(${s.color},${s.alpha})`);
        lg.addColorStop(1, `rgba(${s.color},0)`);
        ctx.strokeStyle = lg;
        ctx.lineWidth = s.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      for (const p of scene.sparks) {
        const rise = reduced ? 0 : (t * 0.008 * p.depth) % (h + 40);
        let y = p.y - rise;
        if (y < -20) y += h + 40;
        const x = p.x + (reduced ? 0 : Math.sin(t / 1800 + p.phase) * 12 * p.depth) + floatX * p.depth;
        const a = reduced ? 0.6 : 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t / 900 + p.phase));
        star(ctx, x, y + floatY * p.depth, p.size * p.depth, p.color, a * p.depth);
      }
    };

    const loop = (t) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    if (reduced) draw(0);
    else raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="motion-bg" aria-hidden />;
}
