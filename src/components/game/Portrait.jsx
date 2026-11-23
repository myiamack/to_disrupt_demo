import React from "react";
import { cn } from "@/lib/utils";
import { ART_FOCUS, GIFT_ART } from "@/fun/art";

/** Round, zoomed-in portrait of the heroine from a gift's illustration. */
export default function Portrait({ number, kanji, size = 96, dim = false, className }) {
  return (
    <span className={cn("relative inline-block shrink-0", className)} style={{ width: size, height: size }}>
      <span
        aria-hidden
        className={cn("portrait block h-full w-full", dim && "grayscale opacity-40")}
        style={{
          backgroundImage: `url(${GIFT_ART[number]})`,
          backgroundSize: "auto 210%",
          backgroundPosition: ART_FOCUS[number],
        }}
      />
      {kanji && (
        <span
          className="kanji-badge absolute -right-1 -top-1"
          style={{ width: size * 0.38, height: size * 0.38, fontSize: size * 0.2 }}
        >
          {kanji}
        </span>
      )}
    </span>
  );
}
