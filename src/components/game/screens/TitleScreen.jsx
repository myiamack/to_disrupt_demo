import React from "react";
import GoldButton from "../GoldButton";
import { bgTitle } from "@/fun/art";

export default function TitleScreen({ onStart }) {
  return (
    <main className="flex flex-1 items-center px-4 py-8 sm:px-6">
      <section
        className="comic-panel mx-auto w-full max-w-5xl bg-cover bg-center"
        style={{ backgroundImage: `url(${bgTitle})` }}
      >
        <div className="flex min-h-[26rem] flex-col justify-center gap-6 p-7 sm:min-h-[32rem] sm:p-12">
          <span className="pill self-start">✦ My planetary responsibility ✦</span>
          <h1 className="font-display text-[clamp(3rem,10vw,6rem)] leading-[0.95] text-foreground">
            TO <span className="text-gold">DISRUPT</span>
          </h1>
          <p className="gold-box max-w-lg p-4 text-base italic leading-relaxed text-foreground sm:text-lg">
            Seeing what's broken, saying what others won't, and standing with people until it changes for
            the better.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <GoldButton onClick={onStart} className="px-10 py-4 text-sm">
              Press start
            </GoldButton>
            <span className="text-sm font-semibold text-muted-foreground">Myia Mack · i.c.stars · about 5 minutes</span>
          </div>
        </div>
      </section>
    </main>
  );
}
