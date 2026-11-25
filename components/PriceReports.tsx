"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CONDITIONS,
  CURRENCIES,
  VENUES,
  conditionLabel,
  conditionRank,
} from "@/lib/conditions";

/**
 * What people have actually paid for this one, and a way to add to it.
 *
 * The archive publishes what Paillard charged new between 1952 and 1979.
 * That is not the question anyone arrives with. They are holding a
 * camera and want to know what it is worth now, and no usable public
 * record of that exists for Bolex equipment: eBay keeps ninety days and
 * Facebook, where most of these change hands, keeps nothing. So the only
 * way to have one is to start keeping it.
 *
 * Three things this will not do.
 *
 * It will not show a figure from a single report. One sale is an
 * anecdote wearing the clothes of a statistic. Two is still not a
 * market, but two can be shown honestly with both numbers visible, so
 * two is the floor.
 *
 * It will not convert currencies. Rates move, and a figure converted on
 * the day it arrived would quietly rot. Dollars are compared with
 * dollars.
 *
 * It will not publish anything unread. Reports go into a queue. An
 * archive whose whole argument is that every figure is cited cannot
 * start printing medians of whatever strangers typed, and one mistyped
 * zero would poison an average for years.
 *
 * And until there is something to say, it says nothing. No heading, no
 * empty state, no explanation of why there are no numbers — an item
 * page is about the object, and a paragraph apologising for missing
 * data on every one of three hundred pages is clutter that teaches the
 * reader to skip the section for good. All that remains is one quiet
 * line offering the form. The collecting carries on either way.
 */

interface Summary {
  n: number;
  median: number;
  low: number;
  high: number;
  from: string | null;
  to: string | null;
}

interface Group extends Summary {
  currency: string;
  byCondition: Array<Summary & { condition: string }>;
}

interface Payload {
  groups: Group[];
  total: number;
  minToShow: number;
}

function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: amount >= 100 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

/** "2024-07" → "July 2024". A bare year stays a year. */
function when(value: string | null): string | null {
  if (!value) return null;
  const [year, month] = value.split("-");
  if (!month || month === "01") return year ?? null;
  const name = new Date(`${value}-01T00:00:00Z`).toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  return `${name} ${year}`;
}

export function PriceReports({
  slug,
  section,
  name,
}: {
  slug: string;
  section: "cameras" | "projectors" | "lenses" | "accessories";
  name: string;
}) {
  const [data, setData] = useState<Payload | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/price-report?slug=${encodeURIComponent(slug)}`);
      if (!response.ok) return;
      setData((await response.json()) as Payload);
    } catch {
      /* Offline, or the endpoint is not deployed. The section simply
         offers the form and shows no figures, which is the same thing it
         does before anyone has reported a sale. */
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    form.set("slug", slug);
    form.set("section", section);
    try {
      const response = await fetch("/api/price-report", { method: "POST", body: form });
      const body = (await response.json()) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || body.error) {
        setError(body.error ?? `That did not go through (${response.status}).`);
      } else {
        setSent(body.message ?? "Thank you.");
        setFormOpen(false);
        void load();
      }
    } catch (cause) {
      setError(`Could not reach the server: ${String(cause)}`);
    } finally {
      setBusy(false);
    }
  }

  const groups = data?.groups ?? [];
  const hasFigures = groups.length > 0;

  /*
   * Quiet by default. With nothing to show and nothing being asked,
   * this is a single line of small type among the other utility links
   * at the foot of the page, not a section.
   */
  if (!hasFigures && !formOpen && !sent) {
    return (
      <p className="mt-4 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]">
        Know what one of these goes for?{" "}
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="text-[var(--accent)] underline underline-offset-2"
        >
          Add what you paid
        </button>
        {" · "}
        <a href="/articles/what-one-is-worth" className="underline underline-offset-2 hover:text-[var(--accent)]">
          How to value one
        </a>
      </p>
    );
  }

  return (
    <section className={hasFigures ? "rule mt-14 pt-4" : "mt-8"} aria-labelledby="reports">
      {hasFigures && (
        <h2
          id="reports"
          className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--accent)]"
        >
          What people have paid
        </h2>
      )}

      {hasFigures && (
        <div className="mt-3 space-y-5">
          {groups.map((group) => (
            <div key={group.currency}>
              <p className="font-[family-name:var(--font-mono)] text-sm">
                <span className="text-[var(--fg)]">{money(group.median, group.currency)}</span>
                <span className="text-[var(--fg-soft)]">
                  {" "}
                  middle of {group.n} report{group.n === 1 ? "" : "s"}
                  {group.low !== group.high && (
                    <>
                      , {money(group.low, group.currency)} to {money(group.high, group.currency)}
                    </>
                  )}
                  {when(group.from) && (
                    <>
                      {" · "}
                      {when(group.from) === when(group.to)
                        ? when(group.from)
                        : `${when(group.from)} to ${when(group.to)}`}
                    </>
                  )}
                </span>
              </p>

              {group.byCondition.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {[...group.byCondition]
                    .sort((a, b) => conditionRank(a.condition) - conditionRank(b.condition))
                    .map((band) => (
                      <li
                        key={band.condition}
                        className="flex flex-wrap items-baseline gap-x-3 font-[family-name:var(--font-mono)] text-[0.7rem]"
                      >
                        <span className="min-w-[6rem] text-[var(--fg-soft)]">
                          {conditionLabel(band.condition)}
                        </span>
                        <span className="text-[var(--fg)]">
                          {money(band.median, group.currency)}
                        </span>
                        <span className="text-[var(--fg-soft)]">
                          from {band.n} report{band.n === 1 ? "" : "s"}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))}
          <p className="font-[family-name:var(--font-mono)] text-[0.66rem] leading-relaxed text-[var(--fg-soft)]">
            Reported by readers and checked before publishing. Second-hand prices turn far more
            on condition than on model, so read the bands rather than the middle figure, and
            treat a small number of reports as exactly that.
          </p>
        </div>
      )}

      {sent ? (
        <p className="mt-4 border border-[var(--accent)] px-4 py-3 text-sm leading-relaxed text-[var(--accent)]">
          {sent}
        </p>
      ) : formOpen ? (
        <form onSubmit={submit} className="mt-5 space-y-4">
          {/* Seen by nothing with eyes. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute h-0 w-0 overflow-hidden opacity-0"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Did you buy it or sell it?">
              <select name="side" defaultValue="bought" className={selectClass}>
                <option value="bought">I bought it</option>
                <option value="sold">I sold it</option>
              </select>
            </Field>

            <Field label="When? (a year is fine)">
              <input
                type="text"
                name="sold_on"
                placeholder="2025-06, or 2025"
                inputMode="numeric"
                className={selectClass}
              />
            </Field>

            <Field label="How much?">
              <div className="flex gap-2">
                <input
                  type="text"
                  name="amount"
                  required
                  placeholder="450"
                  inputMode="decimal"
                  className={`${fieldBase} min-w-0 flex-1`}
                />
                <select name="currency" defaultValue="USD" className={`${fieldBase} w-[5.5rem] shrink-0`}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </Field>

            <Field label="Where?">
              <select name="venue" defaultValue="ebay" className={selectClass}>
                {VENUES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <fieldset>
            <legend className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
              What condition was it in?
            </legend>
            <div className="mt-2 space-y-1.5">
              {CONDITIONS.map((c, i) => (
                <label key={c.id} className="flex cursor-pointer items-baseline gap-2.5">
                  <input
                    type="radio"
                    name="condition"
                    value={c.id}
                    required
                    defaultChecked={i === 3}
                    className="mt-1 accent-[var(--accent)]"
                  />
                  <span className="text-sm">
                    <span className="text-[var(--fg)]">{c.label}</span>{" "}
                    <span className="text-[var(--fg-soft)]">— {c.blurb}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field label="Anything worth knowing? (optional)">
            <textarea
              name="notes"
              rows={2}
              placeholder="What came with it, what it needed, how it was described…"
              className={`${selectClass} resize-y`}
            />
          </Field>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em] text-[var(--bg)] disabled:opacity-40"
            >
              {busy ? "Sending" : "Send it in"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="font-[family-name:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.12em] text-[var(--fg-soft)] underline underline-offset-4 hover:text-[var(--accent)]"
            >
              Never mind
            </button>
          </div>

          {error && (
            <p className="border border-[var(--accent)] px-3 py-2 text-sm text-[var(--accent)]">
              {error}
            </p>
          )}

          <p className="font-[family-name:var(--font-mono)] text-[0.62rem] leading-relaxed text-[var(--fg-soft)]">
            Nothing is published until it has been read, and nothing identifying you is stored
            unless you type it. Figures are kept in the currency you give and never converted.
          </p>
        </form>
      ) : (
        <p className="mt-4 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]">
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="text-[var(--accent)] underline underline-offset-2"
          >
            Add what you paid
          </button>
          {" · "}
          <a href="/articles/what-one-is-worth" className="underline underline-offset-2 hover:text-[var(--accent)]">
            How to value one
          </a>
        </p>
      )}
    </section>
  );
}

/* Split so the amount row can compose them. `w-full` and `flex-1`
   together collapsed the amount box to nothing beside the currency
   select, which is how this came to be two constants. */
const fieldBase =
  "border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm";
const selectClass = `w-full ${fieldBase}`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
        {label}
      </span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}
