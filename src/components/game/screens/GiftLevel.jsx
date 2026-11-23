import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import GoldButton from "../GoldButton";
import GiftBadge from "../GiftBadge";
import JobCard from "../JobCard";
import BossQuiz from "../BossQuiz";
import GiftIntel from "../GiftIntel";
import ForkSection from "../ForkSection";
import TrainingArc from "../TrainingArc";
import { useFun } from "@/fun/FunProvider";
import { BOSSES } from "@/fun/pixel";
import { ART_CAPTION, GIFT_ART } from "@/fun/art";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "meet", label: "Meet", hint: "Meet the gift" },
  { key: "choose", label: "Choose", hint: "Pick your path" },
  { key: "train", label: "Train", hint: "Train up" },
  { key: "jobs", label: "Jobs", hint: "Jobs it unlocks" },
  { key: "fight", label: "Fight", hint: "Beat the shadow" },
];

function StepTitle({ pill, title, children }) {
  return (
    <div className="text-center">
      <span className="pill">{pill}</span>
      <h2 className="mt-3 font-display text-2xl text-foreground sm:text-3xl">{title}</h2>
      {children && <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">{children}</p>}
    </div>
  );
}

export default function GiftLevel({
  gift,
  gifts,
  allJobs,
  allActions,
  jobs,
  actions,
  branches,
  chosenBranchId,
  progress,
  presenter,
  onToggleAction,
  onChooseBranch,
  onMaster,
  onBack,
  onNext,
  hasNext,
  startStep,
  onStepChange,
  fighter = "arena",
}) {
  const mastered = progress.mastered.includes(gift.number);
  const fun = useFun();
  const [step, setStep] = useState(0);
  const villain = BOSSES[gift.number - 1];
  const num = String(gift.number).padStart(2, "0");

  useEffect(() => {
    setStep(0);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [gift.id]);

  // Lets the game page jump straight to a step (used by the preview switch).
  useEffect(() => {
    if (startStep && startStep.key) setStep(startStep.step);
  }, [startStep]);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  const goTo = (i) => {
    setStep(i);
    const el = document.getElementById("chapter-top");
    if (el) el.scrollIntoView({ behavior: fun.reduceMotion ? "auto" : "smooth", block: "start" });
  };

  const handleQuizComplete = (perfect) => {
    onMaster(gift.number);
    fun.quizDone(gift.number, perfect);
  };

  const handlePresenterMaster = () => {
    onMaster(gift.number);
    fun.award(`master:${gift.number}`, 50);
  };

  const doneCount = actions.filter((a) => progress.actions[a.id]).length; // quests learned
  const stepDone = {
    meet: true,
    choose: !!chosenBranchId,
    train: doneCount > 0,
    jobs: true,
    fight: mastered,
  };

  return (
    <main className="flex-1 px-4 pb-14 pt-6 sm:px-6">
      <div className="fade-up mx-auto w-full max-w-4xl scroll-mt-20" id="chapter-top" style={{ scrollMarginTop: "8.5rem" }}>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> All gifts
        </button>

        {/* chapter header */}
        <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="pill">Gift {num}</span>
            <h1 className="mt-2 font-display text-5xl leading-none text-gold sm:text-6xl">{gift.name}</h1>
          </div>
          <span className="kanji-badge h-16 w-16 text-3xl sm:h-20 sm:w-20 sm:text-4xl">{gift.kanji}</span>
        </header>

        {/* stepper */}
        <nav aria-label="Chapter steps" className="mt-5 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === step ? "step" : undefined}
              className={cn("step-chip", i === step && "is-active", i !== step && stepDone[s.key] && i < step && "is-done")}
            >
              <span className="step-num">{i < step && stepDone[s.key] ? <Check className="h-3 w-3" aria-hidden /> : i + 1}</span>
              {s.label}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {step === 0 && (
            <div className="space-y-6">
              <figure className="comic-panel">
                <img src={GIFT_ART[gift.number]} alt={ART_CAPTION[gift.number]} className="block w-full" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#140b2e] via-[#140b2e]/85 to-transparent px-5 pb-4 pt-12 sm:px-7 sm:pb-5">
                  <p className="font-heading text-lg font-extrabold text-gold sm:text-2xl">“{gift.short_verb}”</p>
                  <p className="mt-1 max-w-2xl text-sm text-foreground/90 sm:text-base">{ART_CAPTION[gift.number]}</p>
                </figcaption>
              </figure>
              <GiftIntel gift={gift} presenter={presenter} />
            </div>
          )}

          {step === 1 && (
            <div>
              <StepTitle pill="Step 2 · Choose" title="Pick your path">
                There are two ways to use this gift. Pick the one that sounds most like you.
              </StepTitle>
              <ForkSection
                branches={branches}
                chosenId={chosenBranchId}
                onChoose={(branchId) => onChooseBranch(gift.id, branchId)}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <StepTitle pill="Step 3 · Train" title="My training arc">
                These are 5 real-life quests I'm taking on to grow this gift. Myia's Hero will walk you through each
                one.
              </StepTitle>
              <TrainingArc
                key={gift.id}
                actions={actions}
                learned={progress.actions}
                onLearn={(id) => {
                  if (!progress.actions[id]) onToggleAction(id);
                }}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <StepTitle pill="Step 4 · Jobs" title="Jobs this gift unlocks">
                People with this gift do great in these jobs. Tap a card to flip it.
              </StepTitle>
              <div className="mx-auto mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              {villain && (
                <div className="gold-box flex flex-col items-center gap-1 p-5 text-center">
                  <span className="pill">Step 5 · Fight</span>
                  <p className="mt-2 font-display text-2xl text-foreground">{villain.name}</p>
                  <p className="text-base text-muted-foreground">
                    {villain.tagline} {fighter === "pet" ? "Myia's Hero will fight it. Watch her go!" : "Watch the arena up top!"}
                  </p>
                </div>
              )}
              {presenter ? (
                <section className="gold-box p-6 text-center">
                  <p className="text-base text-muted-foreground">
                    Presenter mode hides the quiz. Mark the gift done after you talk it through.
                  </p>
                  {mastered ? (
                    <p className="mt-4 flex items-center justify-center gap-2 font-semibold text-primary">
                      <Check className="h-4 w-4" aria-hidden /> Gift done
                    </p>
                  ) : (
                    <GoldButton className="mt-5" onClick={handlePresenterMaster}>
                      Mark gift done
                    </GoldButton>
                  )}
                </section>
              ) : (
                <BossQuiz
                  gift={gift}
                  gifts={gifts}
                  jobs={allJobs}
                  actions={allActions}
                  mastered={mastered}
                  onComplete={handleQuizComplete}
                />
              )}

              <section
                className={cn(
                  "flex flex-col items-center gap-4 rounded-2xl border-2 p-5 text-center sm:flex-row sm:justify-between sm:text-left",
                  mastered ? "border-primary bg-[#140b2e]/95" : "border-border bg-[#140b2e]/90"
                )}
              >
                <div className="flex items-center gap-4">
                  <GiftBadge gift={gift} earned={mastered} size="sm" />
                  <p className="text-base text-foreground/90">
                    {mastered ? `You earned the ${gift.name} badge!` : `Win the fight to earn the ${gift.name} badge.`}
                  </p>
                </div>
                {hasNext && mastered && <GoldButton onClick={onNext}>Next gift</GoldButton>}
                {!hasNext && mastered && <GoldButton onClick={onBack}>Back to all gifts</GoldButton>}
              </section>
            </div>
          )}
        </div>

        {/* step navigation */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <GoldButton variant="outline" onClick={() => (step === 0 ? onBack() : goTo(step - 1))}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> {step === 0 ? "All gifts" : "Back"}
          </GoldButton>
          {step < STEPS.length - 1 && (
            <GoldButton onClick={() => goTo(step + 1)}>
              {STEPS[step + 1].hint} <ArrowRight className="h-4 w-4" aria-hidden />
            </GoldButton>
          )}
        </div>
      </div>
    </main>
  );
}
