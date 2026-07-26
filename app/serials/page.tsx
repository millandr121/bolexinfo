import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { ProvenanceNote } from "@/components/RecoveryBadge";
import { getSerialDataset } from "@/lib/content";
import { SerialLookup } from "./SerialLookup";

export const metadata: Metadata = {
  title: "Serial Number Lookup",
  description:
    "Date a Paillard-Bolex camera or projector from its serial number, using the year ranges preserved from the original BolexCollector.com.",
};

export default function SerialsPage() {
  const dataset = getSerialDataset();

  return (
    <div className="pt-14 pb-8">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Serial Number Lookup
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--fg-soft)] leading-relaxed">
          Paillard allocated a block of serial numbers to each production year. Enter a
          serial number to estimate the year of manufacture and where in that year&rsquo;s
          run the camera falls.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 max-w-2xl">
          {dataset.ranges.length > 0 ? (
            <SerialLookup ranges={dataset.ranges} />
          ) : (
            <div className="border border-[var(--line)] bg-[var(--bg-raised)] p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-[560]">
                Dataset awaiting recovery
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
                The serial number tables — which the original site preserved from the Bolex
                International S.A. bulletin <em>Serial Numbers and Date of Manufacture</em>{" "}
                (September&nbsp;1, 1977) and original Paillard service manuals — have not yet been
                extracted from the archived pages. The lookup engine is built and tested; it
                activates automatically the moment{" "}
                <span className="font-[family-name:var(--font-mono)] text-xs">data/serials/ranges.json</span>{" "}
                is populated by the preservation pipeline.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
                Serial data is never entered from memory or secondary sources — fidelity to the
                archived original comes first.
              </p>
            </div>
          )}
        </div>
      </Reveal>

      <ProvenanceNote>{dataset.source}</ProvenanceNote>
    </div>
  );
}
