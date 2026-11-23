import React, { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFun } from "@/fun/FunProvider";
import GoldButton from "./GoldButton";
import { BOSSES } from "@/fun/pixel";

const shuffle = (items) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const pick = (items, n) => shuffle(items).slice(0, n);
const unique = (items) => [...new Set(items.filter(Boolean))];

/** Builds five questions for a gift, using only the game's own content. */
export function buildQuestions(gift, gifts, jobs, actions) {
  const others = gifts.filter((g) => g.id !== gift.id);
  const giftJobs = jobs.filter((j) => j.gift_id === gift.id);
  const otherJobs = jobs.filter((j) => j.gift_id !== gift.id);
  const giftActions = actions.filter((a) => a.gift_id === gift.id);
  const otherActions = actions.filter((a) => a.gift_id !== gift.id);
  const questions = [];

  if (gift.quiz_scenario && gift.quiz_answer) {
    questions.push({
      label: "Real life",
      prompt: gift.quiz_scenario,
      answer: gift.quiz_answer,
      options: shuffle(unique([...giftJobs.map((j) => j.title), ...pick(otherJobs, 2).map((j) => j.title), gift.quiz_answer])),
    });
  }

  if (gift.short_verb) {
    questions.push({
      label: "Battle cry",
      prompt: `Which gift says “${gift.short_verb}”?`,
      answer: gift.name,
      options: shuffle(unique([gift.name, ...pick(others, 3).map((g) => g.name)])),
    });
  }

  if (gift.kanji && gift.meaning) {
    questions.push({
      label: "Kanji",
      prompt: `The symbol ${gift.kanji} is on the ${gift.name} badge. What does it mean?`,
      answer: gift.meaning,
      options: shuffle(unique([gift.meaning, ...pick(others, 3).map((g) => g.meaning)])),
    });
  }

  const otherJob = giftJobs.find((j) => j.title !== gift.quiz_answer) || giftJobs[0];
  if (otherJob) {
    questions.push({
      label: "Jobs",
      prompt: `Which job is a great fit for someone with ${gift.name}?`,
      answer: otherJob.title,
      options: shuffle(unique([otherJob.title, ...pick(otherJobs, 3).map((j) => j.title)])),
    });
  }

  if (giftActions.length) {
    const action = pick(giftActions, 1)[0];
    questions.push({
      label: "Training arc",
      prompt: `Which of these will help me grow ${gift.name}?`,
      answer: action.text,
      options: shuffle(unique([action.text, ...pick(otherActions, 3).map((a) => a.text)])),
    });
  }

  return questions;
}

export default function BossQuiz({ gift, gifts, jobs, actions, mastered, onComplete }) {
  const fun = useFun();
  const [round, setRound] = useState(0);
  const questions = useMemo(
    () => buildQuestions(gift, gifts, jobs, actions),
    // a new round reshuffles the questions
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gift.id, gifts, jobs, actions, round]
  );
  const [index, setIndex] = useState(0);
  const [wrongPicks, setWrongPicks] = useState([]);
  const [solved, setSolved] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setIndex(0);
    setWrongPicks([]);
    setSolved(false);
    setMistakes(0);
    setDone(false);
    fun.startFight(gift.number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gift.id, round]);

  const villain = BOSSES[gift.number - 1];

  useEffect(() => {
    if (!solved) return undefined;
    const timer = window.setTimeout(() => {
      if (index < questions.length - 1) {
        setIndex((i) => i + 1);
        setWrongPicks([]);
        setSolved(false);
      } else {
        setDone(true);
        onComplete(mistakes === 0);
      }
    }, 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved]);

  const q = questions[index];
  if (!q) return null;

  const choose = (option) => {
    if (solved || wrongPicks.includes(option)) return;
    if (option === q.answer) {
      setSolved(true);
      fun.correct({ gift: gift.number, left: questions.length - index - 1, total: questions.length });
    } else {
      setWrongPicks((prev) => [...prev, option]);
      setMistakes((m) => m + 1);
      fun.wrong();
    }
  };

  if (done) {
    const perfect = mistakes === 0;
    return (
      <section className="gold-box p-6 text-center sm:p-8">
        <span className="pill">{perfect ? "Perfect!" : "You won!"}</span>
        <h3 className="mt-4 font-display text-2xl text-gold sm:text-3xl">
          {villain ? `${villain.name} is beaten` : "Shadow beaten"}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-foreground/90">
          {perfect
            ? `You got all ${questions.length} right on the first try. The ${gift.name} badge is yours!`
            : `You got through all ${questions.length} questions. The ${gift.name} badge is yours!`}
        </p>
        <GoldButton className="mt-5" variant="outline" onClick={() => setRound((r) => r + 1)}>
          Fight again
        </GoldButton>
      </section>
    );
  }

  return (
    <section aria-labelledby="quiz-heading" className="gold-box p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="pill">Boss fight</span>
          <h3 id="quiz-heading" className="mt-3 font-display text-xl text-foreground sm:text-2xl">
            Beat {villain ? villain.name : "the shadow"}
          </h3>
        </div>
        <div className="flex items-center gap-1.5" aria-label={`Question ${index + 1} of ${questions.length}`}>
          {questions.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2.5 w-5 border-2",
                i < index || (i === index && solved)
                  ? "border-primary bg-primary"
                  : i === index
                    ? "border-[#ff6fae] bg-transparent"
                    : "border-border bg-transparent"
              )}
            />
          ))}
        </div>
      </div>

      <p className="mt-5 font-heading text-xs uppercase tracking-[0.14em] text-primary">
        Question {index + 1} of {questions.length} · {q.label}
        {mastered && " · rematch"}
      </p>
      <p className="mt-2 text-lg leading-relaxed text-foreground">{q.prompt}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {q.options.map((option) => {
          const isAnswer = option === q.answer;
          const wrong = wrongPicks.includes(option);
          const right = solved && isAnswer;
          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(option)}
              disabled={wrong || solved}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-[15px] leading-snug transition-colors",
                right && "border-primary bg-primary/15 text-primary",
                wrong && "border-destructive/70 bg-destructive/10 text-foreground/60",
                !right && !wrong && "border-border text-foreground/85 hover:border-primary/50 hover:text-foreground",
                solved && !isAnswer && "opacity-50"
              )}
            >
              <span>{option}</span>
              {right && <Check className="h-4 w-4 shrink-0" aria-hidden />}
              {wrong && <X className="h-4 w-4 shrink-0" aria-hidden />}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-4 min-h-[1.25rem] text-sm">
        {solved && <span className="font-semibold text-primary">Hit! {fun.stats.combo >= 2 ? `Combo x${fun.stats.combo}!` : ""}</span>}
        {!solved && wrongPicks.length > 0 && (
          <span className="text-foreground/80">Ouch, that cost you a heart. Try another answer.</span>
        )}
        {!solved && wrongPicks.length === 0 && (
          <span className="text-muted-foreground">Right answers attack. Get 3 in a row for a power beam!</span>
        )}
      </p>
    </section>
  );
}
