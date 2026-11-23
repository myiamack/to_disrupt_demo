import React, { useEffect, useState } from "react";
import { Check, Volume2, X } from "lucide-react";
import GoldButton from "./GoldButton";
import { getVoiceName, listVoices, setVoiceName, speak } from "@/fun/voice";
import { cn } from "@/lib/utils";

const SAMPLE = "Quest one! Let me break it down. Each gift powers up the next one.";

/** Lets the presenter hear and choose Myia's Hero's read-aloud voice. */
export default function VoicePicker({ open, onClose }) {
  const [voices, setVoices] = useState([]);
  const [chosen, setChosen] = useState(getVoiceName());

  useEffect(() => {
    if (!open) return undefined;
    const load = () => setVoices(listVoices());
    load();
    window.speechSynthesis?.addEventListener?.("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", load);
  }, [open]);

  if (!open) return null;

  const pick = (name) => {
    setChosen(name);
    setVoiceName(name);
    speak("Okay! I'll sound like this now.", name);
  };

  return (
    <div className="guide-backdrop" role="dialog" aria-modal="true" aria-labelledby="voice-title" onClick={onClose}>
      <div className="guide-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="guide-close" onClick={onClose} aria-label="Close">
          <X className="h-5 w-5" aria-hidden />
        </button>
        <span className="pill">Myia's Hero · voice</span>
        <h2 id="voice-title" className="mt-4 font-display text-3xl text-gold">Pick her voice</h2>
        <p className="mt-3 text-base leading-relaxed text-foreground/90">
          Tap <strong>Try</strong> to hear a voice. Tap <strong>Use</strong> to pick it. She reads quests out loud
          when sound (🔊) is on.
        </p>

        <ul className="mt-5 space-y-2">
          {voices.length === 0 && (
            <li className="text-sm text-muted-foreground">Loading voices… If none show up, try the Microsoft Edge browser.</li>
          )}
          {voices.map((v) => (
            <li
              key={v.name}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 px-4 py-3",
                chosen === v.name ? "border-primary bg-[#22164d]" : "border-border bg-[#140b2e]"
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-heading text-sm font-extrabold text-foreground">
                  {v.name.replace(/^Microsoft /, "").replace(/ - English.*$/, "")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {v.lang}
                  {/natural|neural|online/i.test(v.name) ? " · sounds most natural" : ""}
                </span>
              </span>
              <button
                type="button"
                onClick={() => speak(SAMPLE, v.name)}
                className="inline-flex items-center gap-1 rounded-full border-2 border-primary/60 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden /> Try
              </button>
              <button
                type="button"
                onClick={() => pick(v.name)}
                className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
              >
                {chosen === v.name ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
                {chosen === v.name ? "Picked" : "Use"}
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Tip: Microsoft Edge has the most natural voices (they have "Natural" in the name). Chrome has a few Google
          voices.
        </p>
        <div className="mt-6 flex justify-end">
          <GoldButton onClick={onClose}>Done</GoldButton>
        </div>
      </div>
    </div>
  );
}
