import React from "react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-12 w-12 text-base",
  md: "h-20 w-20 text-2xl",
  lg: "h-24 w-24 text-3xl",
};

export default function GiftBadge({ gift, earned = true, size = "md" }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2 font-kanji leading-none transition-all duration-500",
          sizes[size],
          earned
            ? "border-primary bg-primary/15 text-primary glow-gold"
            : "border-border bg-secondary/40 text-muted-foreground/40"
        )}
      >
        {gift?.kanji || "✦"}
      </div>
      <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        Gift {String(gift?.number || 0).padStart(2, "0")}
      </span>
    </div>
  );
}