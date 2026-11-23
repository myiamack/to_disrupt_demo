import React, { useState } from "react";
import { cn } from "@/lib/utils";

export default function JobCard({ job }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="h-48 [perspective:1400px]">
      <button
        type="button"
        onClick={() => setFlipped((prev) => !prev)}
        aria-expanded={flipped}
        aria-label={`${job.title} — ${flipped ? "hide" : "show"} job details`}
        className="relative h-full w-full rounded-2xl text-left transition-transform duration-500 [transform-style:preserve-3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border-2 border-[#f6b93b]/60 bg-[#140b2e] p-5 [backface-visibility:hidden]">
          <span className="pill self-start">Job</span>
          <div>
            <h4 className="font-heading text-xl font-extrabold leading-snug text-foreground">
              {job.title}
            </h4>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Tap to flip
            </p>
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-center rounded-2xl border-2 border-primary bg-[#22164d] p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <h4 className="font-heading text-base font-extrabold leading-snug text-primary">
            {job.title}
          </h4>
          <p className="mt-2 text-base leading-relaxed text-foreground">{job.description}</p>
        </div>
      </button>
    </div>
  );
}