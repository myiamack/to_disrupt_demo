import React from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import GoldButton from "../GoldButton";
import Portrait from "../Portrait";

export default function PowerChainScreen({ gifts, onContinue }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
      <div className="fade-up w-full max-w-5xl">
        <h2 className="font-display text-3xl text-gold sm:text-4xl">My 5 gifts: the power chain</h2>
        <p className="mt-3 inline-block rounded-full border-2 border-[#8b5cf6]/70 bg-[#140b2e]/90 px-4 py-1.5 text-sm italic text-foreground/90">
          They work in order. Each gift powers up the next one.
        </p>

        <ol className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {gifts.map((gift, index) => (
            <li key={gift.id} className="relative flex flex-col items-center">
              <Portrait number={gift.number} kanji={gift.kanji} size={104} />
              {index < gifts.length - 1 && (
                <ChevronRight className="absolute -right-4 top-10 hidden h-7 w-7 text-[#ff6fae] sm:block" aria-hidden />
              )}
              <div className="gold-box mt-4 w-full p-3 text-center">
                <p className="font-heading text-xs font-extrabold text-muted-foreground">
                  {String(gift.number).padStart(2, "0")}
                </p>
                <p className="font-heading text-base font-extrabold uppercase text-gold">{gift.name}</p>
                <p className="mt-1 text-sm text-foreground/90">{gift.short_verb.replace(/\.$/, "")}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-6 rounded-full border-2 border-[#8b5cf6]/70 bg-[#140b2e]/90 px-5 py-2.5 text-center text-sm font-semibold text-foreground">
          See it → question it → speak for others → pass the mic → stay through the change
        </p>

        <div className="mt-10 flex justify-center">
          <GoldButton onClick={onContinue}>
            Choose a gift <ArrowRight className="h-4 w-4" aria-hidden />
          </GoldButton>
        </div>
      </div>
    </main>
  );
}
