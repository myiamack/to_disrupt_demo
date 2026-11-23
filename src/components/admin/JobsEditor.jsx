import React, { useEffect, useState } from "react";
import { db } from "@/api/localDb";
import { Check } from "lucide-react";
import GoldButton from "@/components/game/GoldButton";

export default function JobsEditor({ jobs, onSaved }) {
  const [drafts, setDrafts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDrafts(jobs.map((job) => ({ id: job.id, title: job.title, description: job.description || "" })));
    setSaved(false);
  }, [jobs]);

  const update = (id, key, value) =>
    setDrafts((prev) => prev.map((job) => (job.id === id ? { ...job, [key]: value } : job)));

  const handleSave = async () => {
    setSaving(true);
    await db.entities.Job.bulkUpdate(drafts);
    await onSaved();
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="rounded-3xl border border-primary/25 tile-surface p-5 sm:p-6">
      <h2 className="font-heading text-[11px] uppercase tracking-[0.24em] text-primary">
        Jobs unlocked
      </h2>

      <div className="mt-4 space-y-4">
        {drafts.map((job) => (
          <div key={job.id} className="rounded-2xl border border-border p-4">
            <label htmlFor={`job-title-${job.id}`} className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Job title
            </label>
            <input
              id={`job-title-${job.id}`}
              value={job.title}
              onChange={(event) => update(job.id, "title", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none"
            />
            <label htmlFor={`job-desc-${job.id}`} className="mt-3 block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Description
            </label>
            <textarea
              id={`job-desc-${job.id}`}
              value={job.description}
              onChange={(event) => update(job.id, "description", event.target.value)}
              rows={2}
              className="mt-1.5 w-full resize-y rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <GoldButton type="button" onClick={handleSave} disabled={saving} className="px-6 py-2.5">
          {saving ? "Saving…" : "Save jobs"}
        </GoldButton>
        {saved && (
          <span className="flex items-center gap-1 text-[11px] text-primary">
            <Check className="h-3 w-3" aria-hidden /> Saved
          </span>
        )}
      </div>
    </section>
  );
}