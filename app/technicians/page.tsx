import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { TechnicianDirectory } from "@/components/TechnicianDirectory";
import { TECHNICIANS } from "@/lib/technicians";

/*
 * The page is headed "Bolex Technicians" while the navigation still
 * says "Repair & service".
 *
 * Deliberate. In a menu the reader is scanning for the thing they
 * want done, and "Repair & service" is what they are looking for;
 * "Bolex Technicians" beside "Cameras" and "Lenses" would read as
 * another catalogue. Arriving on the page, the subject is the people,
 * and naming them is the point.
 */
export const metadata: Metadata = {
  title: "Bolex Technicians",
  description:
    "The people who service, repair and convert Bolex cameras: what each one actually does, where they are, and how current the listing is.",
};

export default function TechniciansPage() {
  const checked = TECHNICIANS.filter((t) => t.evidence.kind === "site").length;

  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          Bolex Technicians
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
          A spring-wound Bolex is a mechanism, and a mechanism that has sat for forty years
          wants cleaning and relubricating before it is trusted with film. These are the
          people who do that work.
        </p>

        {/*
         * The caveat, in one line.
         *
         * It was a bordered box of five lines, which is a lot of screen to
         * spend saying "ring first", and a warning that large is one a
         * reader learns to skip. The substance is unchanged: every entry
         * says underneath it what it rests on, which is where someone
         * about to post a camera will actually look.
         */}
        <p className="mt-6 border-l-2 border-[var(--accent)] pl-4 text-sm leading-relaxed text-[var(--fg-soft)]">
          <strong className="font-[560] text-[var(--fg)]">Write before you ship.</strong> The
          small-gauge trade is thin, prices and turnarounds move, and businesses go quiet
          without taking their sites down. Each entry says below it what it rests on
          {checked < TECHNICIANS.length && (
            <>
              , and {TECHNICIANS.length - checked} of these {TECHNICIANS.length} have no site
              of their own
            </>
          )}
          .
        </p>
      </Reveal>

      <TechnicianDirectory technicians={TECHNICIANS} />

      <Reveal>
        <aside className="rule mt-14 pt-4 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)]">
          <span className="uppercase tracking-[0.18em]">Know someone: </span>
          this list is short because every entry had to be found and read. If you have had
          good work done, or if an entry here is out of date, that is worth telling us.
        </aside>
      </Reveal>
    </div>
  );
}
