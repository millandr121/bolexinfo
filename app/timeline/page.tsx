import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Timeline",
  description: "The history of Paillard and Bolex, as documented by the original BolexCollector.com timeline.",
};

export default function TimelinePage() {
  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Timeline
        </h1>
        <p className="mt-4 text-[var(--fg-soft)] leading-relaxed">
          The original site presented a timeline of the history of Paillard — from
          Sainte-Croix music boxes to the last Bolex cameras.
        </p>
        <div className="mt-10 border border-[var(--line)] bg-[var(--bg-raised)] p-8">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">Awaiting recovery</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
            The timeline page (<span className="font-[family-name:var(--font-mono)]">/timeline.html</span>)
            is inventoried and will be reproduced here verbatim — then extended into an
            interactive chronology — once the preservation pipeline recovers it. Historical
            content is never reconstructed from memory; it is extracted from the archived
            original or it waits.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
