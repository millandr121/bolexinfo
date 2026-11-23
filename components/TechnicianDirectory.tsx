"use client";

import { useState } from "react";
import { TechnicianMap } from "./TechnicianMap";
import {
  CAPABILITIES,
  slug,
  TECHNICIAN_REGIONS,
  type Capability,
  type Technician,
} from "@/lib/technicians";

/**
 * The directory: what someone wants done, then who does it, then where.
 *
 * The filter, the map and the list are one component because they are
 * one question. Choosing "Super 16 conversion" has to empty the marks
 * that cannot do it as well as the entries, or the map would be
 * answering a question the reader has stopped asking.
 *
 * Three states, never two. A listing that does not mention Super 8 is
 * not a listing that refuses it, and flattening the two would be the
 * same guesswork this project refuses everywhere else. So a filter
 * sorts the entries into three: the ones that say yes, the ones that
 * say no, and the ones that have not said. The third group is shown,
 * quietly, under its own heading, because for most of these people it
 * is the honest answer and hiding them would send a reader away from
 * someone who might be exactly right.
 */
export function TechnicianDirectory({ technicians }: { technicians: readonly Technician[] }) {
  const [wanted, setWanted] = useState<Capability | null>(null);

  const says = (t: Technician, c: Capability) => t.does?.includes(c) ?? false;
  const refuses = (t: Technician, c: Capability) => t.doesNot?.includes(c) ?? false;

  const yes = wanted ? technicians.filter((t) => says(t, wanted)) : [...technicians];
  const unstated = wanted
    ? technicians.filter((t) => !says(t, wanted) && !refuses(t, wanted))
    : [];
  const shownOnMap = wanted ? [...yes, ...unstated] : technicians;

  return (
    <>
      <section aria-labelledby="filter-heading" className="mt-10">
        <h2
          id="filter-heading"
          className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
        >
          What needs doing
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip on={wanted === null} onClick={() => setWanted(null)}>
            Anything
          </Chip>
          {CAPABILITIES.map((c) => (
            <Chip key={c.id} on={wanted === c.id} onClick={() => setWanted(c.id)}>
              {c.label}
            </Chip>
          ))}
        </div>
      </section>

      <TechnicianMap technicians={shownOnMap} />

      {wanted && (
        <p className="mt-6 text-sm leading-relaxed text-[var(--fg-soft)]">
          {yes.length > 0 ? (
            <>
              <strong className="font-[560] text-[var(--fg)]">{yes.length}</strong>{" "}
              {yes.length === 1 ? "says" : "say"} they do this.
            </>
          ) : (
            <>None of them say outright that they do this.</>
          )}{" "}
          {unstated.length > 0 && (
            <>
              {unstated.length} others have not said either way, and are listed below the
              first group rather than hidden, because not mentioning a thing is not the same
              as refusing it.
            </>
          )}
        </p>
      )}

      {wanted ? (
        <>
          <Group heading={`Say they do this`} people={yes} />
          <Group heading="Have not said" people={unstated} muted />
        </>
      ) : (
        TECHNICIAN_REGIONS.map((region) => (
          <Group
            key={region}
            heading={region}
            people={technicians.filter((t) => t.region === region)}
          />
        ))
      )}
    </>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`border px-3 py-1.5 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em] transition-colors ${
        on
          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]"
          : "border-[var(--line)] text-[var(--fg-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }`}
    >
      {children}
    </button>
  );
}

function Group({
  heading,
  people,
  muted,
}: {
  heading: string;
  people: Technician[];
  muted?: boolean;
}) {
  if (people.length === 0) return null;

  return (
    <section className="mt-12" aria-label={heading}>
      <h2
        className={`font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] ${
          muted ? "text-[var(--fg-soft)]" : "text-[var(--accent)]"
        }`}
      >
        {heading}
      </h2>
      <ul className="mt-4 border-t border-[var(--line)]">
        {people.map((t) => (
          <li key={t.name} id={slug(t.name)} className="scroll-mt-28 border-b border-[var(--line)] py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-[560]">
                {t.url ? (
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noreferrer nofollow"
                    className="transition-colors hover:text-[var(--accent)]"
                  >
                    {t.name}{" "}
                    <span aria-hidden="true" className="text-xs text-[var(--accent)]">
                      ↗
                    </span>
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

            {/*
              The capabilities as small type under the description: what
              they take, and then what they have said they do not, which
              saves a letter as surely as a yes does.
            */}
            {(t.does?.length || t.doesNot?.length) && (
              <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-[family-name:var(--font-mono)] text-[0.66rem]">
                {t.does?.map((c) => (
                  <span key={c} className="border border-[var(--line)] px-1.5 py-0.5">
                    {CAPABILITIES.find((x) => x.id === c)?.label}
                  </span>
                ))}
                {t.doesNot?.map((c) => (
                  <span key={c} className="text-[var(--fg-soft)] line-through">
                    {CAPABILITIES.find((x) => x.id === c)?.label}
                  </span>
                ))}
              </p>
            )}

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
              {t.evidence.kind === "site" ? "Read from their site: " : "Not confirmed here: "}
              {t.evidence.note}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
