import React, { useEffect, useState } from "react";
import { db } from "@/api/localDb";
import { Check } from "lucide-react";
import GoldButton from "@/components/game/GoldButton";

export default function BranchesEditor({ branches, onSaved }) {
  const [drafts, setDrafts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDrafts(
      branches.map((branch) => ({
        id: branch.id,
        label: branch.label || "",
        title: branch.title || "",
        text: branch.text || "",
      }))
    );
    setSaved(false);
  }, [branches]);

  const update = (id, field, value) =>
    setDrafts((prev) =>
      prev.map((branch) => (branch.id === id ? { ...branch, [field]: value } : branch))
    );

  const handleSave = async () => {
    setSaving(true);
    await db.entities.Branch.bulkUpdate(drafts);
    await onSaved();
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="rounded-3xl border border-primary/25 tile-surface p-5 sm:p-6">
      <h2 className="font-heading text-[11px] uppercase tracking-[0.24em] text-primary">
        Fork paths
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        The two choices players pick between on this gift. Label is the button; the beat appears
        once they choose it.
      </p>

      <div className="mt-4 space-y-5">
        {drafts.map((branch, index) => (
          <div key={branch.id} className="rounded-2xl border border-border p-4">
            <p className="font-heading text-[10px] uppercase tracking-[0.16em] text-primary/80">
              Path {String.fromCharCode(65 + index)}
            </p>

            <label
              htmlFor={`branch-label-${branch.id}`}
              className="mt-3 block text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
            >
              Choice label
            </label>
            <input
              id={`branch-label-${branch.id}`}
              value={branch.label}
              onChange={(event) => update(branch.id, "label", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none"
            />

            <label
              htmlFor={`branch-title-${branch.id}`}
              className="mt-3 block text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
            >
              Beat title
            </label>
            <input
              id={`branch-title-${branch.id}`}
              value={branch.title}
              onChange={(event) => update(branch.id, "title", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none"
            />

            <label
              htmlFor={`branch-text-${branch.id}`}
              className="mt-3 block text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
            >
              Beat text
            </label>
            <textarea
              id={`branch-text-${branch.id}`}
              value={branch.text}
              onChange={(event) => update(branch.id, "text", event.target.value)}
              rows={3}
              className="mt-1.5 w-full resize-y rounded-xl border border-border bg-background/60 px-3 py-2 text-sm leading-relaxed text-foreground focus:border-primary/60 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <GoldButton type="button" onClick={handleSave} disabled={saving} className="px-6 py-2.5">
          {saving ? "Saving…" : "Save paths"}
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