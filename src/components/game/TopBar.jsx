import React from "react";
import { cn } from "@/lib/utils";

function Toggle({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-wide transition-colors",
        active
          ? "border-primary/70 bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export default function TopBar({
  masteredCount,
  showProgress,
  onHome,
  onOpenGuide,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-primary/20 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onHome}
          className="flex items-center gap-2 font-display text-[11px] tracking-[0.18em] text-primary"
        >
          <span aria-hidden className="sparkle">✦</span>
          TO DISRUPT
        </button>

        {showProgress && (
          <div className="order-3 flex w-full items-center gap-3 sm:order-2 sm:w-auto">
            <span className="whitespace-nowrap text-[11px] font-medium tracking-wide text-muted-foreground">
              Gifts mastered: <span className="font-semibold text-primary">{masteredCount}/5</span>
            </span>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(masteredCount / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="order-2 flex items-center gap-2 sm:order-3">
          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              className="rounded-full border border-primary/60 px-4 py-1.5 text-xs font-bold tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              ❓ How to play
            </button>
          )}
        </div>
      </div>
    </header>
  );
}