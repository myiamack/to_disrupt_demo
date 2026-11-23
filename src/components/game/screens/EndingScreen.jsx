import React, { useState } from "react";
import { Github, RotateCcw } from "lucide-react";
import GoldButton from "../GoldButton";
import GiftBadge from "../GiftBadge";

export default function EndingScreen({ gifts, mastered, trail = [], onReplay }) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <div className="fade-up mx-auto w-full max-w-3xl">
        <p className="text-center font-heading text-[10px] uppercase tracking-[0.4em] text-primary/80">
          <span aria-hidden className="sparkle">✦</span> Walkthrough complete <span aria-hidden className="sparkle">✦</span>
        </p>
        <h1 className="mt-5 text-center font-display text-3xl leading-tight text-gold sm:text-4xl">
          Your badges
        </h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {mastered.length}/5 gifts mastered
        </p>

        <div className="mt-8 grid grid-cols-2 gap-5 rounded-3xl border border-primary/25 tile-surface p-6 sm:grid-cols-5 sm:gap-3">
          {gifts.map((gift) => (
            <GiftBadge key={gift.id} gift={gift} earned={mastered.includes(gift.number)} />
          ))}
        </div>

        {trail.length > 0 && (
          <section
            aria-labelledby="path-heading"
            className="mt-6 rounded-3xl border border-primary/25 tile-surface p-5 sm:p-6"
          >
            <h2
              id="path-heading"
              className="font-heading text-[11px] uppercase tracking-[0.24em] text-primary"
            >
              The path you took
            </h2>
            <ol className="mt-4 space-y-2.5">
              {trail.map((item) => (
                <li
                  key={item.number}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm"
                >
                  <span className="font-heading text-[10px] uppercase tracking-[0.18em] text-primary">
                    {String(item.number).padStart(2, "0")} · {item.name}
                  </span>
                  <span className="text-foreground">{item.label}</span>
                  {item.title && (
                    <span className="text-muted-foreground/80">— {item.title}</span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        <section aria-labelledby="question-heading" className="mt-8 rounded-3xl border border-primary/30 tile-surface p-6 sm:p-8">
          <h2
            id="question-heading"
            className="font-display text-2xl leading-snug text-foreground sm:text-3xl"
          >
            How do YOU define disruption?
          </h2>

          {submitted ? (
            <div className="mt-5">
              <blockquote className="rounded-2xl border border-primary/40 bg-primary/10 p-5 text-base leading-relaxed text-foreground">
                "{answer}"
              </blockquote>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
              >
                Write another answer
              </button>
            </div>
          ) : (
            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (answer.trim()) setSubmitted(true);
              }}
            >
              <label htmlFor="visitor-answer" className="sr-only">
                Your definition of disruption
              </label>
              <textarea
                id="visitor-answer"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                rows={3}
                placeholder="Type your answer…"
                className="w-full resize-y rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
              <GoldButton type="submit" className="mt-4" disabled={!answer.trim()}>
                Share my answer
              </GoldButton>
            </form>
          )}
        </section>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <GoldButton variant="outline" onClick={onReplay} className="gap-2">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Replay
          </GoldButton>
          <GoldButton
            as="a"
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="gap-2"
          >
            <Github className="h-3.5 w-3.5" aria-hidden /> View my GitHub
          </GoldButton>
        </div>
      </div>
    </main>
  );
}