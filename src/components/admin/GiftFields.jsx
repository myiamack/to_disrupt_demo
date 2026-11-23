import React, { useEffect, useState } from "react";
import { db } from "@/api/localDb";
import { Check } from "lucide-react";
import GoldButton from "@/components/game/GoldButton";

const FIELDS = [
  { key: "name", label: "Name", hint: "EXPOSE" },
  { key: "kanji", label: "Kanji", hint: "照" },
  { key: "meaning", label: "Meaning", hint: "to illuminate" },
  { key: "short_verb", label: "Short verb", hint: "I see it." },
  { key: "tagline", label: "Tagline", hint: "One sentence that sets the scene." },
  { key: "quiz_scenario", label: "Quiz scenario", hint: "A short situation that points to one job." },
];

export default function GiftFields({ gift, jobs, onSaved }) {
  const [form, setForm] = useState(gift);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(gift);
    setSaved(false);
  }, [gift]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    await db.entities.Gift.update(gift.id, {
      number: gift.number,
      name: form.name || "",
      kanji: form.kanji || "",
      meaning: form.meaning || "",
      short_verb: form.short_verb || "",
      tagline: form.tagline || "",
      quiz_scenario: form.quiz_scenario || "",
      quiz_answer: form.quiz_answer || "",
    });
    await onSaved();
    setSaving(false);
    setSaved(true);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 rounded-3xl border border-primary/25 tile-surface p-5 sm:p-6">
      <h2 className="font-heading text-[11px] uppercase tracking-[0.24em] text-primary">
        Gift {String(gift.number).padStart(2, "0")} details
      </h2>

      {FIELDS.map((field) => (
        <div key={field.key}>
          <label htmlFor={`gift-${field.key}`} className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {field.label}
          </label>
          <input
            id={`gift-${field.key}`}
            value={form[field.key] || ""}
            onChange={set(field.key)}
            placeholder={field.hint}
            className="mt-1.5 w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none"
          />
        </div>
      ))}

      <div>
        <label htmlFor="gift-quiz_answer" className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Correct answer
        </label>
        <select
          id="gift-quiz_answer"
          value={form.quiz_answer || ""}
          onChange={set("quiz_answer")}
          className="mt-1.5 w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none"
        >
          <option value="">Choose a job…</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.title}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <GoldButton type="submit" disabled={saving} className="px-6 py-2.5">
          {saving ? "Saving…" : "Save gift"}
        </GoldButton>
        {saved && (
          <span className="flex items-center gap-1 text-[11px] text-primary">
            <Check className="h-3 w-3" aria-hidden /> Saved
          </span>
        )}
      </div>
    </form>
  );
}