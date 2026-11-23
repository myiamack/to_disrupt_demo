import React from "react";
import { cn } from "@/lib/utils";
import { useFun } from "@/fun/FunProvider";

/** Tap-to-reveal cards that introduce a gift. Each first reveal gives XP. */
export default function GiftIntel({ gift, presenter }) {
  const fun = useFun();
  const cards = [
    { key: "meaning", label: "What the symbol means", front: gift.kanji, body: gift.meaning, big: true },
    { key: "cry", label: "My battle cry", front: "“ ”", body: `“${gift.short_verb}”` },
    { key: "mission", label: "What it looks like", front: "?", body: gift.tagline },
  ].filter((c) => c.body);

  const isRevealed = (key) => presenter || !!fun.stats.awarded[`intel:${gift.id}:${key}`];
  const revealedCount = cards.filter((c) => isRevealed(c.key)).length;

  const reveal = (key) => {
    if (isRevealed(key)) return;
    fun.award(`intel:${gift.id}:${key}`, 5);
    fun.sfx("reveal");
  };

  return (
    <section aria-label="Learn about this gift">
      <p className="text-center text-sm text-muted-foreground">
        {revealedCount === cards.length ? "Nice! You found everything." : "Tap each card to flip it. (+5 XP each)"}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const open = isRevealed(card.key);
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => reveal(card.key)}
              aria-label={open ? `${card.label}: ${card.body}` : `Flip card: ${card.label}`}
              className={cn("intel-card", open && "is-revealed")}
            >
              <span className="block font-heading text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#ff6fae]">
                {card.label}
              </span>
              {open ? (
                <span className="mt-3 block">
                  {card.big && <span className="block font-kanji text-4xl leading-none text-gold">{gift.kanji}</span>}
                  {card.big && gift.say && (
                    <span className="mt-2 block text-sm text-muted-foreground">
                      Say it: <strong className="text-foreground">{gift.say}</strong>
                    </span>
                  )}
                  <span className={cn("block text-base leading-relaxed text-foreground", card.big && "mt-1")}>{card.body}</span>
                </span>
              ) : (
                <span className="mt-4 flex flex-col items-center gap-2 text-center">
                  <span className={cn("leading-none text-primary/80", card.big ? "font-kanji text-4xl" : "font-display text-3xl")}>
                    {card.front}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Tap to flip</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
