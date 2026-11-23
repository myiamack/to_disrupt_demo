// The game layer: XP, ranks, combos, day streaks, hearts, boss progress,
// achievements, confetti and sound. Everything is saved in the browser.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { setSoundEnabled, sfx } from "./sound";

const KEY = "todisrupt.fun.v1";
const MAX_HEARTS = 5;
export const XP_PER_LEVEL = 100;

const DEFAULT = {
  xp: 0,
  combo: 0,
  bestCombo: 0,
  streak: 0,
  lastDay: null,
  hearts: MAX_HEARTS,
  beaten: {},
  sound: false,
  arenaHidden: false,
  awarded: {},
  achievements: {},
  defeated: 0,
  respawns: 0,
  perfects: 0,
  correct: 0,
};

export const RANKS = [
  { level: 1, name: "Rookie" },
  { level: 2, name: "Apprentice" },
  { level: 4, name: "Fighter" },
  { level: 6, name: "Elite" },
  { level: 8, name: "Champion" },
  { level: 10, name: "Master" },
  { level: 12, name: "Legend" },
];

export const levelFor = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const rankFor = (level) => [...RANKS].reverse().find((r) => level >= r.level).name;

export const ACHIEVEMENTS = [
  { id: "first", icon: "👊", title: "First Strike", text: "Land your first hit.", check: (s) => s.correct >= 1 },
  { id: "combo3", icon: "⚡", title: "Combo Starter", text: "3 right answers in a row.", check: (s) => s.bestCombo >= 3 },
  { id: "combo10", icon: "🌀", title: "Unstoppable", text: "10 right answers in a row.", check: (s) => s.bestCombo >= 10 },
  { id: "boss", icon: "💥", title: "Shadow Down", text: "Beat your first shadow.", check: (s) => s.defeated >= 1 },
  { id: "round", icon: "🏆", title: "Lights On", text: "Beat all five shadows.", check: (s) => Object.keys(s.beaten || {}).length >= 5 },
  { id: "perfect", icon: "✨", title: "Flawless", text: "Finish a gift quiz with no mistakes.", check: (s) => s.perfects >= 1 },
  { id: "comeback", icon: "❤️‍🔥", title: "Back Up Again", text: "Respawn after losing every heart.", check: (s) => s.respawns >= 1 },
  { id: "streak3", icon: "🔥", title: "On Fire", text: "Study 3 days in a row.", check: (s) => s.streak >= 3 },
  { id: "training", icon: "🥋", title: "Training Arc", text: "Check off 5 actions.", check: (s) => Object.keys(s.awarded).filter((k) => k.startsWith("action:")).length >= 5 },
  { id: "level5", icon: "⬆️", title: "Powered Up", text: "Reach level 5.", check: (s) => levelFor(s.xp) >= 5 },
  { id: "allgifts", icon: "🎖️", title: "Purpose Unlocked", text: "Master all five gifts.", check: (s, extra) => extra.masteredCount >= 5 },
  { id: "legend", icon: "👑", title: "Legend", text: "Reach the Legend rank.", check: (s) => rankFor(levelFor(s.xp)) === "Legend" },
];

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
  }
}

const dayKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const FunContext = createContext(null);

export function useFun() {
  return useContext(FunContext);
}

export function FunProvider({ children, reduceMotion: reduceMotionSetting = false, masteredCount = 0, scene = 1, showArena = true, showStage = true, fighter = "arena" }) {
  const [stats, setStats] = useState(read);
  const sRef = useRef(stats);
  const arenaRef = useRef(null);
  const petRef = useRef(null);
  const fighterRef = useRef(fighter);
  fighterRef.current = fighter;
  const pet = () => petRef.current;
  const [toasts, setToasts] = useState([]);
  const [osReduced, setOsReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return undefined;
    const onChange = () => setOsReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const reduceMotion = reduceMotionSetting || osReduced;

  // Lets the CSS turn glitter and shake off when the in-game "Reduce motion" toggle is on.
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion-root", reduceMotionSetting);
    return () => document.documentElement.classList.remove("reduce-motion-root");
  }, [reduceMotionSetting]);
  const reduceRef = useRef(reduceMotion);
  reduceRef.current = reduceMotion;

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(stats));
    } catch {
      /* storage unavailable */
    }
  }, [stats]);

  useEffect(() => {
    setSoundEnabled(stats.sound);
  }, [stats.sound]);

  const commit = useCallback((next) => {
    sRef.current = next;
    setStats(next);
  }, []);

  const enqueue = (action) => arenaRef.current?.enqueue(action);

  const burst = useCallback((big = false) => {
    if (reduceRef.current) return;
    confetti({
      particleCount: big ? 140 : 70,
      spread: big ? 100 : 70,
      origin: { y: 0.3 },
      colors: ["#ff3fa4", "#ffd23f", "#00f0ff", "#b26bff", "#ffffff"],
      disableForReducedMotion: true,
    });
  }, []);

  const shake = useCallback(() => {
    if (reduceRef.current) return;
    const root = document.documentElement;
    root.classList.remove("fun-shake");
    void root.offsetWidth;
    root.classList.add("fun-shake");
    window.setTimeout(() => root.classList.remove("fun-shake"), 450);
  }, []);

  const toast = useCallback((item) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-2), { ...item, id }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
  }, []);

  const masteredRef = useRef(masteredCount);
  masteredRef.current = masteredCount;

  // Checks achievements on a draft state; announces any new ones.
  const unlock = useCallback(
    (s) => {
      for (const a of ACHIEVEMENTS) {
        if (!s.achievements[a.id] && a.check(s, { masteredCount: masteredRef.current })) {
          s.achievements = { ...s.achievements, [a.id]: Date.now() };
          window.setTimeout(() => {
            toast({ kind: "achievement", icon: a.icon, title: a.title, text: a.text });
            sfx("achieve");
            burst();
          }, 350);
        }
      }
    },
    [toast, burst]
  );

  // Adds XP to a draft state; handles day streak and level-ups.
  const gainXp = (s, amount) => {
    const before = levelFor(s.xp);
    s.xp += amount;
    const today = dayKey(new Date());
    if (s.lastDay !== today) {
      const yesterday = dayKey(new Date(Date.now() - 86400000));
      s.streak = s.lastDay === yesterday ? s.streak + 1 : 1;
      s.lastDay = today;
    }
    const after = levelFor(s.xp);
    if (after > before) {
      enqueue({ type: "levelup" });
      window.setTimeout(() => {
        toast({ kind: "level", icon: "⬆️", title: `Level ${after}!`, text: `Rank: ${rankFor(after)}` });
        burst();
      }, 500);
    }
  };

  /**
   * A right answer. `left` = questions still to answer after this one,
   * `total` = questions in the quiz. The shadow's health drops in step.
   */
  const correct = useCallback(({ gift, left, total }) => {
    const s = { ...sRef.current };
    s.combo += 1;
    s.correct += 1;
    s.bestCombo = Math.max(s.bestCombo, s.combo);
    const beam = s.combo % 3 === 0;
    const kind = beam ? "beam" : ["jab", "kick", "flykick"][s.correct % 3];
    const hpAfter = Math.max(left / total, 0);
    enqueue({ type: beam ? "beam" : "attack", kind, hpAfter, label: beam ? "x3" : "HIT" });
    if (fighterRef.current === "pet") pet()?.fightHit(hpAfter, beam);
    else pet()?.rightAnswer(s.combo);
    if (left <= 0) {
      if (fighterRef.current === "pet") window.setTimeout(() => pet()?.fightWin(), 700);
      else window.setTimeout(() => pet()?.victory(), 1500);
      window.setTimeout(() => pet()?.narrate("win"), 3200);
      s.defeated += 1;
      s.beaten = { ...s.beaten, [gift]: true };
      enqueue({ type: "defeat" });
      window.setTimeout(() => burst(true), 900);
    }
    gainXp(s, 10 + Math.min(s.combo - 1, 5) * 2);
    unlock(s);
    commit(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commit, unlock, burst]);

  const wrong = useCallback(() => {
    const s = { ...sRef.current };
    s.combo = 0;
    s.hearts -= 1;
    enqueue({ type: "lunge" });
    if (fighterRef.current === "pet") pet()?.fightHurt();
    else pet()?.wrongAnswer();
    if (s.hearts <= 0) {
      enqueue({ type: "ko" });
      window.setTimeout(() => pet()?.knockdown(), 600);
      s.hearts = MAX_HEARTS;
      s.respawns += 1;
    }
    unlock(s);
    commit(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commit, unlock]);

  /** Gives XP once per key (e.g. revealing a card or checking an action). */
  const award = useCallback(
    (key, amount) => {
      if (sRef.current.awarded[key]) return false;
      const s = { ...sRef.current, awarded: { ...sRef.current.awarded, [key]: true } };
      gainXp(s, amount);
      unlock(s);
      commit(s);
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commit, unlock]
  );

  const quizDone = useCallback(
    (giftNumber, perfect) => {
      const s = { ...sRef.current, awarded: { ...sRef.current.awarded } };
      if (!s.awarded[`master:${giftNumber}`]) {
        s.awarded[`master:${giftNumber}`] = true;
        gainXp(s, 50);
      }
      if (perfect) {
        s.perfects += 1;
        if (!s.awarded[`perfect:${giftNumber}`]) {
          s.awarded[`perfect:${giftNumber}`] = true;
          gainXp(s, 25);
        }
        enqueue({ type: "victory" });
        window.setTimeout(() => {
          toast({ kind: "perfect", icon: "✨", title: "Perfect quiz!", text: "No mistakes. Victory pose earned." });
          burst(true);
        }, 300);
      }
      unlock(s);
      commit(s);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commit, unlock, toast, burst]
  );

  // "Purpose Unlocked" can be earned outside the quiz (e.g. presenter mode).
  useEffect(() => {
    const s = { ...sRef.current };
    const before = Object.keys(s.achievements).length;
    unlock(s);
    if (Object.keys(s.achievements).length !== before) commit(s);
  }, [masteredCount, unlock, commit]);

  /** Shows a gift's shadow in the arena at full health (used when a quiz starts). */
  const startFight = useCallback((gift) => {
    enqueue({ type: "spawn", gift });
    if (fighterRef.current === "pet") pet()?.fightStart(gift);
    window.setTimeout(() => pet()?.narrate("fight"), 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSound = useCallback(() => {
    const s = { ...sRef.current, sound: !sRef.current.sound };
    setSoundEnabled(s.sound);
    commit(s);
    if (s.sound) window.setTimeout(() => sfx("reveal"), 30);
  }, [commit]);

  const endFight = useCallback(() => {
    pet()?.endFight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePet = useCallback(() => {
    commit({ ...sRef.current, petHidden: !sRef.current.petHidden });
  }, [commit]);

  const toggleArena = useCallback(() => {
    commit({ ...sRef.current, arenaHidden: !sRef.current.arenaHidden });
  }, [commit]);

  const resetFun = useCallback(() => {
    commit({ ...DEFAULT, sound: sRef.current.sound, arenaHidden: sRef.current.arenaHidden });
  }, [commit]);

  const level = levelFor(stats.xp);
  const value = useMemo(
    () => ({
      stats,
      level,
      rank: rankFor(level),
      reduceMotion,
      arenaRef,
      correct,
      wrong,
      award,
      quizDone,
      startFight,
      endFight,
      togglePet,
      petRef,
      fighter,
      showStage,
      scene,
      showArena,
      toggleSound,
      toggleArena,
      resetFun,
      shake,
      sfx,
    }),
    [stats, level, reduceMotion, correct, wrong, award, quizDone, startFight, endFight, togglePet, fighter, showStage, scene, showArena, toggleSound, toggleArena, resetFun, shake]
  );

  return (
    <FunContext.Provider value={value}>
      {children}
      <div className="fun-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`fun-toast fun-toast--${t.kind}`}>
            <span className="fun-toast__icon" aria-hidden>{t.icon}</span>
            <span>
              <span className="fun-toast__title">{t.title}</span>
              <span className="fun-toast__text">{t.text}</span>
            </span>
          </div>
        ))}
      </div>
    </FunContext.Provider>
  );
}
