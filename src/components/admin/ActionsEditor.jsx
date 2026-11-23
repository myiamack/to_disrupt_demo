import React, { useEffect, useState } from "react";
import { db } from "@/api/localDb";
import { Check } from "lucide-react";
import GoldButton from "@/components/game/GoldButton";

export default function ActionsEditor({ actions, onSaved }) {
  const [drafts, setDrafts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDrafts(actions.map((action) => ({ id: action.id, text: action.text || "" })));
    setSaved(false);
  }, [actions]);

  const update = (id, value) =>
    setDrafts((prev) => prev.map((action) => (action.id === id ? { ...action, text: value } : action)));

  const handleSave = async () => {
    setSaving(true);
    await db.entities.Action.bulkUpdate(drafts);
    await onSaved();
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="rounded-3xl border border-primary/25 tile-surface p-5 sm:p-6">
      <h2 className="font-heading text-[11px] uppercase tracking-[0.24em] text-primary">
        Training arc actions
      </h2>

      <div className="mt-4 space-y-3">
        {drafts.map((action, index) => (
          <div key={action.id}>
            <label htmlFor={`action-${action.id}`} className="block text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Action {index + 1}
            </label>
            <textarea
              id={`action-${action.id}`}
              value={action.text}
              onChange={(event) => update(action.id, event.target.value)}
              rows={2}
              className="mt-1.5 w-full resize-y rounded-xl border border-border bg-background/60 px-3 py-2 text-sm leading-relaxed text-foreground focus:border-primary/60 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <GoldButton type="button" onClick={handleSave} disabled={saving} className="px-6 py-2.5">
          {saving ? "Saving…" : "Save actions"}
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