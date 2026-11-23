import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForkSection({ branches, chosenId, onChoose }) {
  if (!branches || branches.length === 0) return null;
  const chosen = branches.some((branch) => branch.id === chosenId);

  return (
    <section aria-label="Choose a path" className="mt-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {branches.map((branch, index) => {
          const active = branch.id === chosenId;
          return (
            <button
              key={branch.id}
              type="button"
              onClick={() => onChoose(branch.id)}
              aria-pressed={active}
              className={cn(
                "rounded-2xl border-2 bg-[#140b2e]/95 p-5 text-left transition-colors",
                active
                  ? "border-primary"
                  : "border-[#f6b93b]/40 hover:border-primary",
                chosen && !active && "opacity-60 hover:opacity-100"
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="pill">Path {String.fromCharCode(65 + index)}</span>
                {active && <Check className="h-5 w-5 text-primary" aria-hidden />}
              </span>

              <span className="mt-3 block font-heading text-lg font-extrabold leading-snug text-foreground">
                {branch.label}
              </span>

              {active && (
                <span className="mt-4 block border-t-2 border-primary/30 pt-4">
                  {branch.title && (
                    <span className="block font-heading text-sm font-extrabold text-primary">
                      {branch.title}
                    </span>
                  )}
                  <span className="mt-1.5 block text-base leading-relaxed text-foreground/90">
                    {branch.text}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!chosen && (
        <p className="mt-4 text-center text-sm text-muted-foreground">Tap a path to see what happens.</p>
      )}
      {chosen && (
        <p className="mt-4 text-center text-sm text-muted-foreground">Both paths lead to the same place. Tap the other one to switch.</p>
      )}
    </section>
  );
}