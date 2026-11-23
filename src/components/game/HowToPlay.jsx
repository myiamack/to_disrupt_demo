import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import GoldButton from "./GoldButton";
import Portrait from "./Portrait";
import { cn } from "@/lib/utils";

/** A short, page-by-page beginner guide. One idea per page, lots of space. */
export default function HowToPlay({ open, onClose, gifts = [] }) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (open) setPage(0);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setPage((p) => Math.min(p + 1, PAGES.length - 1));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!open) return null;

  const PAGES = [
    {
      title: "Welcome! 👋",
      body: (
        <>
          <p>This is my Planetary Responsibility, turned into a game.</p>
          <p>
            My purpose, in one word, is <strong className="text-primary">DISRUPT</strong>.
          </p>
          <p className="gold-box px-5 py-4 italic text-primary">
            Seeing what's broken, saying what others won't, and standing with people until it changes for the
            better.
          </p>
        </>
      ),
    },
    {
      title: "What's a gift?",
      body: (
        <>
          <p>A gift is a strength I bring to the world.</p>
          <p>I have 5 of them. They work like a power chain: each one powers up the next.</p>
          <ul className="space-y-3">
            {gifts.map((g) => (
              <li key={g.id} className="flex items-center gap-4">
                <Portrait number={g.number} size={46} />
                <span>
                  <strong className="font-heading text-primary">{g.name}</strong>
                  <span className="text-foreground/85"> · {g.short_verb}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      title: "How each gift works",
      body: (
        <>
          <p>Every gift is a short chapter with 5 steps:</p>
          <ol className="space-y-3">
            {[
              ["Meet", "See the gift and flip cards to learn about it."],
              ["Choose", "Pick one of two ways to use it."],
              ["Train", "Myia's Hero walks you through 5 real-life quests."],
              ["Jobs", "See 2 jobs this gift is great for."],
              ["Fight", "Answer 5 questions to beat that gift's shadow."],
            ].map(([name, text], i) => (
              <li key={name} className="flex items-start gap-4">
                <span className="num-dot">{i + 1}</span>
                <span className="pt-1">
                  <strong className="font-heading text-primary">{name}</strong>
                  <span className="text-foreground/85"> · {text}</span>
                </span>
              </li>
            ))}
          </ol>
        </>
      ),
    },
    {
      title: "Meet Myia's Hero",
      body: (
        <>
          <p>She's your guide. She lives on the side of the screen.</p>
          <ul className="space-y-3">
            <li>✋ Drag her anywhere. Drop her on a side and she'll peek in.</li>
            <li>👆 Tap her for moves, magic and fun stuff.</li>
            <li>⚔️ In a fight, right answers are her attacks.</li>
            <li>💔 Wrong answers let the shadow hit her. That's okay. Just try again!</li>
          </ul>
        </>
      ),
    },
    {
      title: "Ready?",
      body: (
        <>
          <p>There are no grades here.</p>
          <p>Explore, click around, and have fun.</p>
          <p>
            By the end, you'll know my 5 gifts, the jobs they lead to, and the actions I'm taking to grow them.
          </p>
        </>
      ),
    },
  ];

  const last = page === PAGES.length - 1;
  const P = PAGES[page];

  return (
    <div className="guide-backdrop" role="dialog" aria-modal="true" aria-labelledby="guide-title" onClick={onClose}>
      <div className="guide-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="guide-close" onClick={onClose} aria-label="Close the guide">
          <X className="h-5 w-5" aria-hidden />
        </button>
        <span className="pill">How to play · {page + 1} of {PAGES.length}</span>
        <h2 id="guide-title" className="mt-4 font-display text-3xl text-gold sm:text-4xl">
          {P.title}
        </h2>
        <div key={page} className="guide-body fade-up">
          {P.body}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <div className="flex gap-2" aria-hidden>
            {PAGES.map((_, i) => (
              <span key={i} className={cn("h-2.5 w-2.5 rounded-full", i === page ? "bg-primary" : "bg-[#3a2c6e]")} />
            ))}
          </div>
          <div className="flex gap-2">
            {page > 0 && (
              <GoldButton variant="outline" onClick={() => setPage(page - 1)}>
                <ArrowLeft className="h-4 w-4" aria-hidden /> Back
              </GoldButton>
            )}
            <GoldButton onClick={() => (last ? onClose() : setPage(page + 1))}>
              {last ? "Let's go!" : "Next"} {!last && <ArrowRight className="h-4 w-4" aria-hidden />}
            </GoldButton>
          </div>
        </div>
      </div>
    </div>
  );
}
