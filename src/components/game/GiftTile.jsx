import React from "react";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { GIFT_ART } from "@/fun/art";
import { BOSSES } from "@/fun/pixel";

export default function GiftTile({ gift, locked, mastered, onSelect }) {
  const villain = BOSSES[gift.number - 1];
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => onSelect(gift)}
      aria-label={`Gift ${gift.number}: ${gift.name}${locked ? " (locked)" : ""}${mastered ? " (done)" : ""}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border-[3px] bg-[#140b2e] text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/60",
        locked
          ? "cursor-not-allowed border-border"
          : "border-[#f6b93b] shadow-[6px_6px_0_rgba(255,111,174,0.5)] hover:-translate-y-1"
      )}
    >
      <span className="relative block aspect-[16/9] w-full overflow-hidden">
        <img
          src={GIFT_ART[gift.number]}
          alt=""
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
            locked && "grayscale opacity-35"
          )}
        />
        <span className="kanji-badge absolute right-3 top-3 h-11 w-11 text-xl">{gift.kanji}</span>
        {locked && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center gap-2 rounded-full bg-[#140b2e]/90 px-4 py-2 text-sm font-semibold text-foreground">
              <Lock className="h-4 w-4" aria-hidden /> Finish gift {String(gift.number - 1).padStart(2, "0")} first
            </span>
          </span>
        )}
      </span>

      <span className="flex flex-1 flex-col gap-1 p-4">
        <span className="flex items-center justify-between gap-2">
          <span className="pill">Gift {String(gift.number).padStart(2, "0")}</span>
          {mastered && (
            <span className="flex items-center gap-1 text-sm font-bold text-primary">
              <Check className="h-4 w-4" aria-hidden /> Done
            </span>
          )}
        </span>
        <span className="mt-2 font-display text-2xl text-gold">{gift.name}</span>
        <span className="text-base text-foreground/90">{gift.short_verb}</span>
        {villain && <span className="mt-1 text-sm text-muted-foreground">Shadow to beat: {villain.name}</span>}
      </span>
    </button>
  );
}
