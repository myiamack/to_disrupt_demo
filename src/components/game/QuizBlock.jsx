import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuizBlock({ gift, jobs, onCorrect }) {
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    setPicked(null);
  }, [gift.id]);

  const isCorrect = picked !== null && picked === gift.quiz_answer;

  const choose = (title) => {
    if (isCorrect) return;
    setPicked(title);
    if (title === gift.quiz_answer) onCorrect();
  };

  return (
    <section aria-labelledby="quiz-heading" className="rounded-3xl border border-primary/25 tile-surface p-5 sm:p-7">
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-primary">✦</span>
        <h3 id="quiz-heading" className="font-heading text-[11px] uppercase tracking-[0.24em] text-primary">
          Quick check
        </h3>
      </div>

      <p className="mt-4 text-base leading-relaxed text-foreground/90">{gift.quiz_scenario}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {jobs.map((job) => {
          const selected = picked === job.title;
          const correct = isCorrect && selected;
          const wrong = selected && !correct;
          return (
            <button
              key={job.id}
              type="button"
              onClick={() => choose(job.title)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                correct && "border-primary bg-primary/15 text-primary",
                wrong && "border-destructive/70 bg-destructive/10 text-foreground",
                !selected && "border-border text-foreground/80 hover:border-primary/50 hover:text-foreground"
              )}
            >
              <span>{job.title}</span>
              {correct && <Check className="h-4 w-4 shrink-0" aria-hidden />}
              {wrong && <X className="h-4 w-4 shrink-0" aria-hidden />}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-4 min-h-[1.25rem] text-sm">
        {isCorrect && (
          <span className="text-primary">That's it — badge earned. {gift.name} is yours.</span>
        )}
        {picked !== null && !isCorrect && (
          <span className="text-muted-foreground">Not quite. Read the jobs above and try the other one.</span>
        )}
        {picked === null && (
          <span className="text-muted-foreground/60">Pick the role that fits the scenario.</span>
        )}
      </p>
    </section>
  );
}