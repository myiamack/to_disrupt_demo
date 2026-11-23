import React from "react";
import { Sparkles } from "lucide-react";
import GiftTile from "../GiftTile";
import GoldButton from "../GoldButton";
import { cn } from "@/lib/utils";

export default function LevelSelect({
  gifts,
  isUnlocked,
  mastered,
  freePlay,
  onToggleFreePlay,
  onSelectGift,
  onOpenDevLog,
  onFinish,
}) {
  return (
    <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <div className="fade-up mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl leading-tight text-gold sm:text-4xl">
              Level select: choose your path
            </h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-foreground/90">
              Start with Gift 01. Beat its shadow to unlock the next gift. Want to jump around? Turn on
              Free play.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleFreePlay}
            aria-pressed={freePlay}
            className={cn(
              "flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors",
              freePlay
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-[#140b2e]/90 text-foreground/80 hover:border-primary"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Free play {freePlay ? "on" : "off"}
          </button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map((gift) => (
            <GiftTile
              key={gift.id}
              gift={gift}
              locked={!isUnlocked(gift.number)}
              mastered={mastered.includes(gift.number)}
              onSelect={onSelectGift}
            />
          ))}

          <button
            type="button"
            onClick={onOpenDevLog}
            className="group relative flex flex-col justify-center overflow-hidden rounded-2xl border-[3px] border-dashed border-[#8b5cf6] bg-[#140b2e]/95 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary"
          >
            <span aria-hidden className="pointer-events-none absolute -right-2 -top-5 font-kanji text-[88px] leading-none text-primary/10">
              ⚙
            </span>
            <div className="relative">
              <span className="pill">Bonus level</span>
              <h3 className="mt-3 font-display text-2xl leading-tight text-gold">How I built this</h3>
              <p className="mt-2 text-base text-foreground/90">The 4 stages of making this game.</p>
            </div>
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-center font-heading text-base font-extrabold text-foreground">
            {mastered.length} of 5 gifts done
          </p>
          {mastered.length === 5 && (
            <GoldButton onClick={onFinish}>See your badges</GoldButton>
          )}
        </div>
      </div>
    </main>
  );
}