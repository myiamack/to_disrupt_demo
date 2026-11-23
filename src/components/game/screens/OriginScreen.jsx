import React from "react";
import { ArrowRight } from "lucide-react";
import GoldButton from "../GoldButton";

export default function OriginScreen({ onContinue }) {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-10 sm:py-14">
      <div className="fade-up w-full max-w-4xl">
        <h2 className="font-display text-3xl text-gold sm:text-4xl">My purpose, in one word</h2>

        <div className="mt-8 grid items-center gap-8 sm:grid-cols-[auto,1fr]">
          <div className="flex flex-col items-center gap-3">
            <span className="kanji-badge h-40 w-40 border-[5px] text-7xl sm:h-48 sm:w-48 sm:text-8xl">破</span>
            <span className="rounded-full border-2 border-[#8b5cf6] px-4 py-1 text-sm font-semibold text-foreground/90">
              破 (ha) · to break
            </span>
          </div>

          <div className="space-y-5">
            <p className="font-display text-4xl text-foreground sm:text-5xl">DISRUPT</p>
            <p className="gold-box p-4 text-lg italic leading-relaxed text-primary">
              Seeing what's broken, saying what others won't, and standing with people until it changes for
              the better.
            </p>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#c4b5fd] px-4 py-1.5 font-heading text-xs font-extrabold uppercase tracking-[0.12em] text-[#22103a]">
                Serve
              </span>
              <ArrowRight className="h-5 w-5 text-[#ff6fae]" aria-hidden />
              <span className="rounded-full bg-primary px-4 py-1.5 font-heading text-xs font-extrabold uppercase tracking-[0.12em] text-primary-foreground">
                Disrupt
              </span>
            </div>
            <p className="rounded-2xl border-2 border-[#8b5cf6]/70 bg-[#140b2e]/90 p-4 text-base leading-relaxed text-foreground/90">
              My first word was <strong>serve</strong>. But <strong>disrupt</strong> fits how I really show up.
              Serving is still part of me. It lives in my gift of <strong className="text-primary">Support</strong>.
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <GoldButton onClick={onContinue}>
            Meet my 5 gifts <ArrowRight className="h-4 w-4" aria-hidden />
          </GoldButton>
        </div>
      </div>
    </main>
  );
}
