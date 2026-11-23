import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "@/api/localDb";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import GoldButton from "@/components/game/GoldButton";
import GiftFields from "@/components/admin/GiftFields";
import JobsEditor from "@/components/admin/JobsEditor";
import ActionsEditor from "@/components/admin/ActionsEditor";
import BranchesEditor from "@/components/admin/BranchesEditor";

export default function Admin() {
  const [data, setData] = useState({ gifts: [], jobs: [], actions: [], branches: [] });
  const [activeNumber, setActiveNumber] = useState(1);

  const load = async () => {
    const [giftPage, jobPage, actionPage, branchPage] = await Promise.all([
      db.entities.Gift.list({ sort: "number" }),
      db.entities.Job.list({ sort: "created_date" }),
      db.entities.Action.list({ sort: "number" }),
      db.entities.Branch.list({ sort: "number" }),
    ]);
    setData({
      gifts: giftPage.items,
      jobs: jobPage.items,
      actions: actionPage.items,
      branches: branchPage.items,
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleReset = async () => {
    if (!window.confirm("Undo all edits and go back to the original content?")) return;
    db.reset();
    await load();
  };

  const handleExport = () => {
    const blob = new Blob([db.exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "content.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const gift = data.gifts.find((item) => item.number === activeNumber);
  const jobs = gift ? data.jobs.filter((job) => job.gift_id === gift.id) : [];
  const actions = gift
    ? data.actions.filter((action) => action.gift_id === gift.id).sort((a, b) => a.number - b.number)
    : [];
  const branches = gift
    ? data.branches
        .filter((branch) => branch.gift_id === gift.id)
        .sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
    : [];

  return (
    <div className="min-h-screen pb-20 pt-4">
      <div className="stage-wrap">
      <header className="border-b border-primary/20 px-4 py-5 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-heading text-[10px] uppercase tracking-[0.3em] text-primary">
              Content editor
            </p>
            <h1 className="mt-2 font-display text-xl text-foreground">TO DISRUPT · admin</h1>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to game
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {data.gifts.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveNumber(item.number)}
              className={cn(
                "rounded-full border px-4 py-2 font-heading text-[10px] uppercase tracking-[0.16em] transition-colors",
                item.number === activeNumber
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              Gift {String(item.number).padStart(2, "0")}
            </button>
          ))}
        </div>

        {gift ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="space-y-5">
              <GiftFields gift={gift} jobs={jobs} onSaved={load} />
              <BranchesEditor branches={branches} onSaved={load} />
            </div>
            <div className="space-y-5">
              <JobsEditor jobs={jobs} onSaved={load} />
              <ActionsEditor actions={actions} onSaved={load} />
            </div>
          </div>
        ) : (
          <p className="mt-10 text-sm text-muted-foreground">No gifts found.</p>
        )}

        <p className="mt-10 text-[11px] leading-relaxed text-muted-foreground/70">
          The "What I learned" notes live on the bonus level inside the game — they save as you
          type. Edits are saved in this browser. To make them permanent, download the content
          file and replace <code>src/data/content.json</code> with it.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <GoldButton type="button" onClick={handleExport} className="px-6 py-2.5">
            Download content file
          </GoldButton>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-border px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            Reset to original
          </button>
        </div>
      </main>
      </div>
    </div>
  );
}