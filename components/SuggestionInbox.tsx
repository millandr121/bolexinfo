"use client";

import { useCallback, useEffect, useState } from "react";

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
        | { rows: Row[]; pending: number }
        | { error: string };
      if (!response.ok || "error" in body) {
        setError("error" in body ? body.error : `Request failed (${response.status}).`);
        setRows(null);
        return;
      }
      setRows(body.rows);
      setPending(body.pending);
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

      {rows && (
        <>
          <p className="mt-8 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.14em] text-[var(--fg-soft)]">
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
