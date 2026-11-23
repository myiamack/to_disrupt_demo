import React, { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import GoldButton from "../GoldButton";

const STAGES = [
  {
    stage: 1,
    title: "GitHub repo + README + Project board",
    detail: "25 actions tracked as Issues.",
  },
  {
    stage: 2,
    title: "HTML/CSS Level Select page on GitHub Pages",
    detail: "The level select built by hand, one tile at a time.",
  },
  {
    stage: 3,
    title: "JavaScript so clicking a gift shows its details",
    detail: "One click, one gift, its own panel of actions and jobs.",
  },
  {
    stage: 4,
    title: "SQL database with queries in purpose.sql",
    detail: "Gifts, jobs and actions tables, joined by hand.",
  },
];

export default function DevLogLevel({ devLogs, onSaveNote, onBack, onFinish }) {
  const [drafts, setDrafts] = useState({});
  const [savedStage, setSavedStage] = useState(null);

  useEffect(() => {
    const next = {};
    STAGES.forEach((item) => {
      const record = devLogs.find((entry) => entry.stage === item.stage);
      next[item.stage] = record?.learned || "";
    });
    setDrafts(next);
  }, [devLogs]);

  const handleBlur = async (stage) => {
    const original = devLogs.find((entry) => entry.stage === stage)?.learned || "";
    if (drafts[stage] === original) return;
    await onSaveNote(stage, drafts[stage] || "");
    setSavedStage(stage);
  };

  return (
    <main className="flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <div className="fade-up mx-auto w-full max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Level select
        </button>

        <header className="mt-6">
          <p className="font-heading text-[10px] uppercase tracking-[0.3em] text-primary">
            <span aria-hidden className="sparkle">✦</span> Bonus level
          </p>
          <h1 className="mt-4 font-display text-3xl leading-tight text-gold sm:text-4xl">
            How I Built This
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Four stages, in order. Type what each stage taught you — it saves as you go.
          </p>
        </header>

        <ol className="relative mt-9 space-y-4">
          <span
            aria-hidden
            className="absolute bottom-6 left-[22px] top-6 hidden w-px bg-gradient-to-b from-primary/60 via-primary/25 to-transparent sm:block"
          />
          {STAGES.map((item) => (
            <li key={item.stage} className="relative rounded-3xl border border-primary/25 tile-surface p-5 sm:pl-16">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/60 bg-primary/15 font-heading text-[11px] text-primary sm:absolute sm:left-3 sm:top-5">
                  {item.stage}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80">
                    Level {item.stage}
                  </p>
                  <h2 className="mt-1 font-heading text-sm leading-snug text-foreground">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">{item.detail}</p>

                  <label
                    htmlFor={`learned-${item.stage}`}
                    className="mt-4 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    What I learned
                  </label>
                  <textarea
                    id={`learned-${item.stage}`}
                    value={drafts[item.stage] ?? ""}
                    onChange={(event) =>
                      setDrafts((prev) => ({ ...prev, [item.stage]: event.target.value }))
                    }
                    onBlur={() => handleBlur(item.stage)}
                    rows={3}
                    placeholder="Write what this stage taught you…"
                    className="mt-2 w-full resize-y rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  />
                  <p aria-live="polite" className="mt-1.5 h-4 text-[11px] text-primary">
                    {savedStage === item.stage && drafts[item.stage] ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3" aria-hidden /> Saved
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex justify-center">
          <GoldButton onClick={onFinish}>Finish walkthrough</GoldButton>
        </div>
      </div>
    </main>
  );
}