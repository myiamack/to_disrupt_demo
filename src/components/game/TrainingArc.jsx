import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Lock, RotateCcw } from "lucide-react";
import GoldButton from "./GoldButton";
import { useFun } from "@/fun/FunProvider";
import { cn } from "@/lib/utils";
import { speak } from "@/fun/voice";

const CPS = 38; // reading speed: characters per second
const WAIT = 45; // seconds before Myia's Hero checks in

/** Myia's Hero walks the viewer through each training quest, one at a time. */
export default function TrainingArc({ actions, learned, onLearn }) {
  const fun = useFun();
  const firstOpen = actions.findIndex((a) => !learned[a.id]);
  const [current, setCurrent] = useState(firstOpen === -1 ? actions.length : firstOpen);
  const [typed, setTyped] = useState(0);
  const [left, setLeft] = useState(WAIT);
  const nudges = useRef(0);
  const reduced = fun.reduceMotion;

  const quest = actions[current];
  const fullText = quest ? quest.text : "";
  const explain = quest ? quest.explain || "" : "";
  const total = fullText.length + explain.length;
  const done = typed >= total;

  // start each quest: she points and reads it
  useEffect(() => {
    if (!quest) {
      if (actions.length) {
        fun.petRef.current?.play("cheer");
        fun.petRef.current?.tip("Training complete! You know all my quests now.");
      }
      return;
    }
    setTyped(reduced ? total : 0);
    setLeft(WAIT);
    nudges.current = 0;
    const readMs = Math.round((total / CPS) * 1000) + 600;
    fun.petRef.current?.explain(`Quest ${current + 1}! Let me break it down.`, readMs);
    if (fun.stats.sound) speak(`Quest ${current + 1}. ${fullText} ${explain}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // typewriter
  useEffect(() => {
    if (!quest || done) return undefined;
    const id = window.setInterval(() => setTyped((t) => Math.min(total, t + 1)), 1000 / CPS);
    return () => window.clearInterval(id);
  }, [quest, done, total]);

  // "still there?" timer, once the quest has been read
  useEffect(() => {
    if (!quest || !done) return undefined;
    const id = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          nudges.current += 1;
          fun.petRef.current?.stillThere(nudges.current);
          return WAIT;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quest, done]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const gotIt = () => {
    if (!quest) return;
    onLearn(quest.id);
    setCurrent((c) => c + 1);
  };

  const restart = () => {
    setCurrent(0);
    setTyped(0);
  };

  const shownText = fullText.slice(0, Math.min(typed, fullText.length));
  const shownExplain = explain.slice(0, Math.max(0, typed - fullText.length));

  return (
    <div className="mx-auto mt-8 max-w-2xl space-y-4">
      {actions.map((a, i) => {
        if (i < current) {
          return (
            <div key={a.id} className="flex items-center gap-4 rounded-2xl border-2 border-primary/40 bg-[#140b2e]/90 px-4 py-3">
              <span className="num-dot">
                <Check className="h-4 w-4" aria-hidden />
              </span>
              <span className="flex-1 text-sm leading-relaxed text-foreground/80">{a.text}</span>
            </div>
          );
        }
        if (i > current) {
          return (
            <div key={a.id} className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-border bg-[#140b2e]/70 px-4 py-3 text-muted-foreground">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2c1f5c]">
                <Lock className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-sm font-semibold">Quest {i + 1}</span>
            </div>
          );
        }
        return (
          <section
            key={a.id}
            aria-live="polite"
            className={cn("quest-card gold-box p-6 sm:p-7", !done && "is-reading")}
            onClick={() => !done && setTyped(total)}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="pill">
                Quest {i + 1} of {actions.length}
              </span>
              {!done && <span className="text-xs font-semibold text-muted-foreground">Tap to finish reading</span>}
            </div>
            <p className="mt-4 min-h-[3.5rem] text-xl font-semibold leading-relaxed text-foreground">
              {shownText}
              {!done && typed < fullText.length && <span className="type-caret" aria-hidden />}
            </p>
            {explain && (typed > fullText.length || done) && (
              <div className="mt-5 border-t-2 border-primary/25 pt-4">
                <p className="font-heading text-xs font-extrabold uppercase tracking-[0.14em] text-[#ff6fae]">
                  What this means
                </p>
                <p className="mt-2 text-base leading-relaxed text-foreground/90">
                  {shownExplain}
                  {!done && <span className="type-caret" aria-hidden />}
                </p>
              </div>
            )}
            {done && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-[10rem] flex-1 items-center gap-3" title="Myia's Hero checks in when this runs out">
                  <span className="text-xs font-semibold text-muted-foreground">⏳ {left}s</span>
                  <span className="quest-timer">
                    <span style={{ width: `${(left / WAIT) * 100}%` }} />
                  </span>
                </div>
                <GoldButton onClick={gotIt} className={cn(left <= 10 && "animate-pulse")}>
                  {i === actions.length - 1 ? "Got it! Finish training" : "Got it! Next quest"}{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </GoldButton>
              </div>
            )}
          </section>
        );
      })}

      {current >= actions.length && (
        <div className="gold-box p-6 text-center">
          <p className="font-display text-2xl text-gold">Training complete!</p>
          <p className="mt-2 text-base text-foreground/90">You learned all {actions.length} quests for this gift.</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-6 pt-2 text-sm font-semibold text-muted-foreground">
        {current < actions.length && (
          <button type="button" className="hover:text-primary" onClick={() => setCurrent(actions.length)}>
            Skip ahead and show all
          </button>
        )}
        {current > 0 && (
          <button type="button" className="inline-flex items-center gap-1.5 hover:text-primary" onClick={restart}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Walk me through again
          </button>
        )}
      </div>
    </div>
  );
}
