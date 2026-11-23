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
         * The caveat is the most important thing on the page. The small-gauge
         * trade is thin, businesses go quiet without taking their sites down,
         * and a stale listing here costs somebody a camera and a shipping bill
         * — so the page says plainly what each entry rests on rather than
         * presenting all of them with the same confidence.
         */}
        <div className="mt-8 border-l-2 border-[var(--accent)] bg-[var(--bg-raised)] px-5 py-4">
          {/*
            Written from the counts rather than around them. The old copy
            said "{checked} of these {total} were read from the business's
            own site; the rest come from another directory" — which, once
            the one unconfirmed entry was removed, read "6 of these 6 …
            the rest come from another directory", describing a remainder
            that does not exist.
          */}
          <p className="text-sm leading-relaxed">
            <strong className="font-[560]">Check before you ship.</strong>{" "}
            {checked === TECHNICIANS.length ? (
              <>
                Every entry here was read from the business&rsquo;s own site.
              </>
            ) : (
              <>
                {checked} of these {TECHNICIANS.length} were read from the
                business&rsquo;s own site. The{" "}
                {TECHNICIANS.length - checked === 1
                  ? "other is named by a directory"
                  : `other ${TECHNICIANS.length - checked} are named by directories`}{" "}
                and by people who have used them, and could not be confirmed here from a
                site of their own.
              </>
            )}{" "}
            That is not the same as a guarantee of their work: the small-gauge trade is
            thin, businesses go quiet without taking their sites down, and prices and
            turnarounds move. Write first and ask whether they are taking work.
          </p>
        </div>
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
