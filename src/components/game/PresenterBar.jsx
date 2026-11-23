import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PresenterBar({ onBack, onNext, canBack, canNext, label }) {
  const buttonClass =
    "flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary/60 hover:text-primary disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground";

  return (
    <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-primary/40 bg-card/95 px-2 py-1.5 shadow-xl backdrop-blur">
      <button type="button" onClick={onBack} disabled={!canBack} aria-label="Previous" className={buttonClass}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="px-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <button type="button" onClick={onNext} disabled={!canNext} aria-label="Next" className={buttonClass}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}