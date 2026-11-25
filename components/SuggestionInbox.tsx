"use client";

import { useCallback, useEffect, useState } from "react";
import { conditionLabel, venueLabel } from "@/lib/conditions";

/**
 * Reads the suggestion queue and shows it.
 *
 * The key is held in sessionStorage rather than localStorage, so it does not
 * outlive the browser session on a shared or borrowed machine. It is also
 * read from `?key=` on first load, which is what makes a bookmark work: the
 * URL is then rewritten without it so the key is not left sitting in the
 * address bar or in whatever gets screenshotted next.
 *
 * Deliberately read-only. Marking an entry handled would mean a write
 * endpoint and a second secret to worry about, and the useful half of the
 * problem is simply being able to read what came in without opening a SQL
 * console.
 */

interface Row {
  id: number;
  created_at: string;
  kind: string;
  page: string | null;
  message: string;
  name: string | null;
  contact: string | null;
  credit: string | null;
  media: string | null;
  country: string | null;
  status: string | null;
}

interface Report {
  id: string;
  created_at: string;
  slug: string;
  section: string;
  amount: number;
  currency: string;
  sold_on: string | null;
  condition: string;
  venue: string | null;
  side: string;
  notes: string | null;
  name: string | null;
  contact: string | null;
  country: string | null;
  status: string;
}

const KEY_STORE = "bolex-admin-key";

function when(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SuggestionInbox() {
  const [key, setKey] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsPending, setReportsPending] = useState(0);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (adminKey: string) => {
    if (!adminKey) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/suggestions?limit=200", {
        headers: { "x-admin-key": adminKey },
      });
      const body = (await response.json()) as
        | { rows: Row[]; pending: number; reports?: Report[]; reportsPending?: number }
        | { error: string };
      if (!response.ok || "error" in body) {
        setError("error" in body ? body.error : `Request failed (${response.status}).`);
        setRows(null);
        return;
      }
      setRows(body.rows);
      setPending(body.pending);
      setReports(body.reports ?? []);
      setReportsPending(body.reportsPending ?? 0);
      try {
        sessionStorage.setItem(KEY_STORE, adminKey);
      } catch {
        /* Private window, or storage blocked. The page still works. */
      }
    } catch (cause) {
      setError(`Could not reach the server: ${String(cause)}`);
    } finally {
      setBusy(false);
    }
  }, []);

  /* On arrival: take the key from the URL if it is there, otherwise from
     this session, and clear it out of the address bar either way. */
  useEffect(() => {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("key");
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(KEY_STORE);
    } catch {
      stored = null;
    }
    const found = fromUrl ?? stored;
    if (fromUrl) {
      url.searchParams.delete("key");
      window.history.replaceState({}, "", url.toString());
    }
    if (found) {
      setKey(found);
      void load(found);
    }
  }, [load]);

  /**
   * Approve or decline one report. Updated in place rather than by
   * reloading the whole queue, so working through a batch does not
   * reshuffle the list under the cursor on every click.
   */
  async function decide(id: string, status: "approved" | "declined") {
    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "x-admin-key": key, "content-type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) {
        setError(`Could not update that (${response.status}).`);
        return;
      }
      setReports((all) => all.map((r) => (r.id === id ? { ...r, status } : r)));
      setReportsPending((n) => Math.max(0, n - 1));
    } catch (cause) {
      setError(`Could not reach the server: ${String(cause)}`);
    }
  }

  return (
    <div className="mt-8">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void load(key);
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="flex-1 min-w-[16rem]">
          <span className="block font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
            Key
          </span>
          <input
            type="password"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            autoComplete="off"
            className="mt-1.5 w-full border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !key}
          className="border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em] text-[var(--bg)] disabled:opacity-40"
        >
          {busy ? "Reading" : "Read the queue"}
        </button>
      </form>

      {error && (
        <p className="mt-6 border border-[var(--accent)] px-4 py-3 text-sm text-[var(--accent)]">
          {error}
        </p>
      )}

      {/*
        The price reports first, because they are the ones that need a
        decision. A suggestion is read and acted on in one's own time; a
        report sits invisible on the item's page until it is approved.
      */}
      {reports.length > 0 && (
        <section className="mt-10" aria-labelledby="reports-queue">
          <h2
            id="reports-queue"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            Price reports
          </h2>
          <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--fg-soft)]">
            {reportsPending} waiting · nothing shows on an item&rsquo;s page until approved, and
            nothing shows at all until two reports agree on a currency
          </p>

          <ul className="mt-4 border-t border-[var(--line)]">
            {reports.map((r) => (
              <li key={r.id} className="border-b border-[var(--line)] py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-[family-name:var(--font-mono)] text-sm">
                    <a
                      href={`/${r.section}/${r.slug}`}
                      className="text-[var(--accent)] underline underline-offset-4"
                    >
                      {r.slug}
                    </a>{" "}
                    <span className="text-[var(--fg)]">
                      {r.currency} {r.amount.toLocaleString("en-US")}
                    </span>
                  </h3>
                  <p className="font-[family-name:var(--font-mono)] text-[0.64rem] uppercase tracking-[0.12em] text-[var(--fg-soft)]">
                    {r.status === "new" ? "Waiting" : r.status} · {when(r.created_at)}
                  </p>
                </div>

                <p className="mt-1.5 font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--fg-soft)]">
                  {conditionLabel(r.condition)} · {r.side === "sold" ? "sold" : "bought"}
                  {r.venue && ` on ${venueLabel(r.venue)}`}
                  {r.sold_on && ` · ${r.sold_on}`}
                  {r.country && ` · ${r.country}`}
                </p>

                {r.notes && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{r.notes}</p>
                )}

                {(r.name || r.contact) && (
                  <p className="mt-1.5 font-[family-name:var(--font-mono)] text-[0.66rem] text-[var(--fg-soft)]">
                    {r.name}
                    {r.name && r.contact && " · "}
                    {r.contact}
                  </p>
                )}

                {r.status === "new" && (
                  <p className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => void decide(r.id, "approved")}
                      className="border border-[var(--accent)] px-3 py-1 font-[family-name:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.1em] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)]"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => void decide(r.id, "declined")}
                      className="border border-[var(--line)] px-3 py-1 font-[family-name:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.1em] text-[var(--fg-soft)] hover:border-[var(--fg-soft)]"
                    >
                      Decline
                    </button>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {rows && (
        <>
          <p className="mt-10 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
            {rows.length === 0
              ? "Nothing in the queue"
              : `${rows.length} shown · ${pending} not yet dealt with`}
          </p>

          <ul className="mt-4 border-t border-[var(--line)]">
            {rows.map((row) => (
              <li key={row.id} className="border-b border-[var(--line)] py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-[560]">
                    {row.kind}
                    {row.page && (
                      <>
                        {" "}
                        <a
                          href={row.page}
                          className="font-[family-name:var(--font-mono)] text-xs text-[var(--accent)] underline underline-offset-4"
                        >
                          {row.page}
                        </a>
                      </>
                    )}
                  </h2>
                  <p className="font-[family-name:var(--font-mono)] text-[0.66rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
                    #{row.id} · {when(row.created_at)}
                  </p>
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{row.message}</p>

                <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-1 font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--fg-soft)]">
                  {row.name && (
                    <div className="flex gap-2">
                      <dt className="uppercase tracking-[0.12em]">From</dt>
                      <dd className="text-[var(--fg)]">{row.name}</dd>
                    </div>
                  )}
                  {row.contact && (
                    <div className="flex gap-2">
                      <dt className="uppercase tracking-[0.12em]">Contact</dt>
                      <dd className="text-[var(--fg)]">
                        {row.contact.includes("@") ? (
                          <a
                            href={`mailto:${row.contact}`}
                            className="text-[var(--accent)] underline underline-offset-4"
                          >
                            {row.contact}
                          </a>
                        ) : (
                          row.contact
                        )}
                      </dd>
                    </div>
                  )}
                  {row.credit && (
                    <div className="flex gap-2">
                      <dt className="uppercase tracking-[0.12em]">Credit as</dt>
                      <dd className="text-[var(--fg)]">{row.credit}</dd>
                    </div>
                  )}
                  {row.country && (
                    <div className="flex gap-2">
                      <dt className="uppercase tracking-[0.12em]">Country</dt>
                      <dd className="text-[var(--fg)]">{row.country}</dd>
                    </div>
                  )}
                </dl>

                {row.media && (
                  <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--fg-soft)]">
                    Attached: {row.media}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
