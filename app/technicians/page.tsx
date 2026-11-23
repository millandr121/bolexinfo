import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { TechnicianMap } from "@/components/TechnicianMap";
import { slug, techniciansByRegion, TECHNICIANS } from "@/lib/technicians";

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
  const groups = techniciansByRegion();
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
                business&rsquo;s own site; the {TECHNICIANS.length - checked} others come
                from another directory and have not been confirmed here.
              </>
            )}{" "}
            That is not the same as a guarantee of their work: the small-gauge trade is
            thin, businesses go quiet without taking their sites down, and prices and
            turnarounds move. Write first and ask whether they are taking work.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <TechnicianMap technicians={TECHNICIANS} />
      </Reveal>

      {groups.map((group, g) => (
        <Reveal key={group.region} delay={g === 0 ? 0.05 : 0}>
          <section className="mt-12" aria-labelledby={`region-${g}`}>
            <h2
              id={`region-${g}`}
              className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
            >
              {group.region}
            </h2>
            <ul className="mt-4 border-t border-[var(--line)]">
              {group.people.map((t) => (
                <li
                key={t.name}
                id={slug(t.name)}
                className="scroll-mt-28 border-b border-[var(--line)] py-5"
              >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-[560]">
                      {t.url ? (
                        <a
                          href={t.url}
                          target="_blank"
                          rel="noreferrer nofollow"
                          className="hover:text-[var(--accent)] transition-colors"
                        >
                          {t.name} <span aria-hidden="true" className="text-xs text-[var(--accent)]">↗</span>
                        </a>
                      ) : (
                        t.name
                      )}
                    </h3>
                    <p className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                      {t.location}
                    </p>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed">{t.work}</p>

                  <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-1 font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--fg-soft)]">
                    {t.pricing && (
                      <div className="flex gap-2">
                        <dt className="uppercase tracking-[0.12em]">Indicative</dt>
                        <dd className="text-[var(--fg)]">{t.pricing}</dd>
                      </div>
                    )}
                    {t.phone && (
                      <div className="flex gap-2">
                        <dt className="uppercase tracking-[0.12em]">Phone</dt>
                        <dd className="text-[var(--fg)]">{t.phone}</dd>
                      </div>
                    )}
                    {t.email && (
                      <div className="flex gap-2">
                        <dt className="uppercase tracking-[0.12em]">Email</dt>
                        <dd className="text-[var(--fg)]">{t.email}</dd>
                      </div>
                    )}
                  </dl>

                  <p
                    className={`mt-3 font-[family-name:var(--font-mono)] text-[0.66rem] leading-relaxed ${
                      t.evidence.kind === "site" ? "text-[var(--fg-soft)]" : "text-[var(--accent)]"
                    }`}
                  >
                    {t.evidence.kind === "site" ? "Read from their site: " : "Unconfirmed: "}
                    {t.evidence.note}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      ))}

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
