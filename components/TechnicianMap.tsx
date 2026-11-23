"use client";

import { useState } from "react";
import { WORLD_PATH, WORLD_WIDTH, WORLD_HEIGHT, project } from "@/lib/world-map";
import { slug, type Technician } from "@/lib/technicians";

/**
 * Where in the world the technicians are.
 *
 * The question this answers is the one the list cannot: not "who is
 * there" but "is anyone near me". Reading seven entries and matching
 * each town against your own idea of where it is takes longer than
 * glancing at a map, and the glance is the whole point. So this is
 * deliberately an atlas and not a tool: no zoom, no pan, no search, no
 * tiles. Land, sea, and a mark per place.
 *
 * Nothing is loaded from anywhere. The outline is an SVG path
 * generated into the repository from public-domain Natural Earth data
 * (see scripts/build-world-map.mjs), so the page makes no request to a
 * map service and nobody is counting who looked at it.
 *
 * The list below is still the record. A mark carries names and a way
 * to make contact, which is enough to decide whether to scroll down;
 * what each person actually does, and how good the evidence for the
 * entry is, stay in the list where they can be read properly. Anyone
 * whose location is too vague to place honestly is named under the map
 * rather than dropped, because being absent from a map reads as not
 * existing.
 */

/**
 * How close two workshops have to be, in frame units, to share a mark.
 *
 * They have to share one. Pigeon Creek in Ontario, Visual Products in
 * Ohio and Du-All in New Jersey fall 13, 16 and 22 units apart on a
 * map of the whole world, so their marks overlap at any size a finger
 * could hit, and whichever drew last would swallow the clicks meant
 * for the others. Grouping them is also the truer picture: at this
 * scale "three of them around the Great Lakes and the north-east" is
 * what a reader can actually use.
 *
 * The window is narrower than it looks. The four North American
 * workshops have to merge, and the widest gap inside that group is 23.
 * London and Äsch, 24.2 apart, have to stay separate: they are 750 km
 * and a customs border apart, which is the first thing anyone posting
 * a camera needs to know. So the threshold sits between the two, and
 * Albuquerque and Los Angeles at 33 are untouched either way.
 *
 * 24.2 units is about 18 px once the map is drawn at the width of the
 * reading column, against marks 16 px across, so the two still do not
 * overlap. Below roughly 18 units apart they would, which is what the
 * test guards.
 */
const CLUSTER_WITHIN = 24;

export interface Cluster {
  x: number;
  y: number;
  people: Technician[];
}

/**
 * Group the placed technicians into marks.
 *
 * Single-linkage and greedy: each one joins the first cluster it is
 * near enough to, and the cluster's position is the mean of its
 * members. With seven entries the order this produces is stable and
 * the result is checked by a test, which is cheaper than anything
 * cleverer would be worth.
 */
export function clusterTechnicians(technicians: readonly Technician[]): Cluster[] {
  const clusters: Cluster[] = [];

  for (const person of technicians) {
    if (!person.place) continue;
    const { x, y } = project(person.place.lat, person.place.lon);
    const near = clusters.find((c) => Math.hypot(c.x - x, c.y - y) <= CLUSTER_WITHIN);
    if (near) {
      near.people.push(person);
      near.x = (near.x * (near.people.length - 1) + x) / near.people.length;
      near.y = (near.y * (near.people.length - 1) + y) / near.people.length;
    } else {
      clusters.push({ x, y, people: [person] });
    }
  }

  return clusters;
}

export function TechnicianMap({
  technicians,
  confirmed,
  wantedLabel,
}: {
  technicians: readonly Technician[];
  /**
   * Under a filter, the names that actually say they do the thing.
   * The rest are on the map because they have not said either way,
   * and they are drawn hollow so the map can be read at a glance
   * rather than looking unchanged.
   */
  confirmed?: ReadonlySet<string>;
  /** What the filter is asking for, for the caption. */
  wantedLabel?: string;
}) {
  const clusters = clusterTechnicians(technicians);
  const placed = technicians.filter((t) => t.place);
  const unplaced = technicians.filter((t) => !t.place);
  const [selected, setSelected] = useState<number | null>(null);

  if (clusters.length === 0) return null;
  const active = selected === null ? null : clusters[selected] ?? null;

  return (
    <section aria-labelledby="map-heading" className="mt-10">
      <h2 id="map-heading" className="sr-only">
        Where these technicians are
      </h2>

      <div className="relative border border-[var(--line)] bg-[var(--bg-raised)]">
        <svg
          viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`World map showing where ${placed.length} repair workshops are. The same workshops are listed below.`}
        >
          <path d={WORLD_PATH} className="fill-[var(--line)]" />
        </svg>

        {/*
         * The marks are real buttons positioned over the map rather
         * than circles inside it, so they focus, tab and take a visible
         * ring the way every other control on the site does.
         */}
        {clusters.map((cluster, i) => {
          const on = i === selected;
          const many = cluster.people.length > 1;
          /* Under a filter: solid if anyone here says yes, hollow if
             this mark is only people who have not said. */
          const says = confirmed ? cluster.people.some((p) => confirmed.has(p.name)) : true;
          const label =
            cluster.people.map((p) => `${p.name}, ${p.location}`).join("; ") +
            (confirmed && !says && wantedLabel ? ` (has not said whether they do this: ${wantedLabel})` : "");
          return (
            <button
              key={cluster.people[0]!.name}
              type="button"
              onClick={() => setSelected(on ? null : i)}
              aria-pressed={on}
              title={label}
              className={`absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ring-2 ring-[var(--bg)] transition-all hover:z-20 focus-visible:z-20 ${
                many ? "h-6 w-6" : "h-4 w-4 hover:h-5 hover:w-5"
              } ${
                on
                  ? "z-10 bg-[var(--accent)]"
                  : says
                    ? "bg-[var(--fg)] hover:bg-[var(--accent)]"
                    : "border-2 border-[var(--fg-soft)] bg-[var(--bg-raised)] hover:border-[var(--accent)]"
              }`}
              style={{
                left: `${(cluster.x / WORLD_WIDTH) * 100}%`,
                top: `${(cluster.y / WORLD_HEIGHT) * 100}%`,
              }}
            >
              <span className="sr-only">{label}</span>
              {many && (
                <span
                  aria-hidden="true"
                  className={`font-[family-name:var(--font-mono)] text-[0.6rem] font-[560] leading-none ${
                    says || on ? "text-[var(--bg)]" : "text-[var(--fg-soft)]"
                  }`}
                >
                  {cluster.people.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/*
       * One panel under the map rather than a bubble floating over it.
       * A popup anchored to a mark has to dodge the edges of the frame
       * and covers the very thing it describes, and on a phone it would
       * cover most of the map. A fixed place to look does neither.
       */}
      <div className="min-h-[6rem] border-x border-b border-[var(--line)] px-5 py-4">
        {active ? (
          <div className="space-y-4">
            {active.people.map((person) => (
              <div key={person.name}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-[560]">
                    {person.name}
                  </h3>
                  <p className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                    {person.location}
                  </p>
                </div>
                <p className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 font-[family-name:var(--font-mono)] text-[0.7rem]">
                  {person.url && (
                    <a
                      href={person.url}
                      target="_blank"
                      rel="noreferrer nofollow"
                      className="text-[var(--accent)] underline underline-offset-4"
                    >
                      Their site ↗
                    </a>
                  )}
                  {person.phone && <span className="text-[var(--fg-soft)]">{person.phone}</span>}
                  {person.email && (
                    <a
                      href={`mailto:${person.email}`}
                      className="text-[var(--accent)] underline underline-offset-4"
                    >
                      {person.email}
                    </a>
                  )}
                  <a
                    href={`#${slug(person.name)}`}
                    className="text-[var(--fg-soft)] underline underline-offset-4 hover:text-[var(--accent)]"
                  >
                    What they do ↓
                  </a>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-[var(--fg-soft)]">
            {confirmed && wantedLabel ? (
              <>
                <span className="mr-1 inline-block h-2.5 w-2.5 translate-y-px rounded-full bg-[var(--fg)]" />
                Filled marks say yes to {wantedLabel}.{" "}
                <span className="mr-1 inline-block h-2.5 w-2.5 translate-y-px rounded-full border-2 border-[var(--fg-soft)]" />
                Hollow ones have not said either way. Anyone who has said no is off the map.
                Choose a mark for the names and how to reach them.
              </>
            ) : (
              <>
                {placed.length} workshops, placed by their town rather than their street
                address. Choose a mark for the names and how to reach them, or read the full
                entries below. A numbered mark holds that many workshops too close together to
                separate at this scale.
              </>
            )}
            {unplaced.length > 0 && (
              <>
                {" "}
                Not on the map:{" "}
                {unplaced.map((t, i) => (
                  <span key={t.name}>
                    {i > 0 && ", "}
                    <a
                      href={`#${slug(t.name)}`}
                      className="underline underline-offset-4 hover:text-[var(--accent)]"
                    >
                      {t.name}
                    </a>{" "}
                    ({t.location})
                  </span>
                ))}
                , who give no location closer than that.
              </>
            )}
          </p>
        )}
      </div>
    </section>
  );
}
