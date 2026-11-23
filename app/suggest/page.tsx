import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { SuggestionForm } from "@/components/SuggestionForm";
import { SUGGESTIONS_EMAIL } from "@/lib/suggestions";

export const metadata: Metadata = {
  title: "Suggest an edit",
  description:
    "Corrections, missing models, photographs and first-hand knowledge: how to contribute to the Bolex Collector archive.",
};

export default function SuggestPage() {
  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Suggest an edit
        </h1>
        <div className="mt-5 max-w-2xl space-y-4 text-[var(--fg-soft)] leading-relaxed">
          <p>
            Most of what is here was recovered from one collector&rsquo;s work over twenty years,
            and a good deal of it has never been checked against a second source. If you own one
            of these cameras, have had one apart, or simply know better, saying so is the most
            useful thing you can do for this archive.
          </p>
          <p>
            Nothing here is a form that vanishes into a database. It writes the message and hands
            it to your own email, so you can attach photographs, keep a copy, and know exactly
            what you sent and to whom.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <SuggestionForm />
      </Reveal>

      <aside className="rule mt-16 pt-4 max-w-2xl font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)]">
        <span className="uppercase tracking-[0.18em]">On credit: </span>
        Anything used here is credited to whoever it came from, by the name they ask for. Material
        offered is not published without that being settled first, and a photograph or document
        can be withdrawn at any time by writing to {SUGGESTIONS_EMAIL}.
      </aside>
    </div>
  );
}
