"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CONDITIONS, CURRENCIES, VENUES } from "@/lib/conditions";

/**
 * A quiet ask, in the corner, once.
 *
 * The archive is building a record of what this equipment actually
 * trades for, and the only way to get one is to ask the people who
 * bought it. The question used to live on the page as a section, which
 * was the wrong place: an item page is about the object, not about its
 * resale value, and a standing block of price machinery on three hundred
 * pages is clutter on every one of them.
 *
 * So it is a card that slides into the corner a few seconds in, says one
 * sentence, and goes away again if nobody wants it. It appears once per
 * item, and dismissing it anywhere quiets it everywhere for a week, so
 * somebody reading through the catalogue is asked at most once.
 *
 * Figures are not shown here at all. They belong on /prices, beside what
 * the thing cost new.
 */

/** Long enough not to interrupt the first read; short enough to be seen. */
const APPEAR_AFTER_MS = 7_000;
/** If it is ignored, it leaves rather than sitting there. */
const LINGER_MS = 18_000;
/** Dismissed once, quiet everywhere for this long. */
const QUIET_DAYS = 7;

const SEEN_KEY = (slug: string) => `bolex:price-ask:${slug}`;
const QUIET_KEY = "bolex:price-ask-quiet-until";

/** Every read and write guarded: private windows throw on access. */
function readStore(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStore(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* Private window, or storage is full or blocked. The ask simply
       behaves as though it had never been dismissed, which is a smaller
       fault than refusing to work at all. */
  }
}

export function PriceAsk({
  slug,
  section,
  name,
}: {
  slug: string;
  section: "cameras" | "projectors" | "lenses" | "accessories";
  name: string;
}) {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const linger = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* Stamped when the form is opened, checked on the server. A form
     filled in under three seconds was not filled in by a person. */
  const openedAt = useRef<number>(0);

  const quieten = useCallback(
    (persist: boolean) => {
      setShown(false);
      if (!persist) return;
      writeStore(SEEN_KEY(slug), "1");
      writeStore(QUIET_KEY, String(Date.now() + QUIET_DAYS * 86_400_000));
    },
    [slug],
  );

  useEffect(() => {
    if (readStore(SEEN_KEY(slug))) return;
    const until = Number(readStore(QUIET_KEY) ?? 0);
    if (Number.isFinite(until) && until > Date.now()) return;

    const appear = setTimeout(() => {
      setShown(true);
      /* Leaves on its own if nobody engages. Opening the form clears
         this, because a half-filled form must never vanish. */
      linger.current = setTimeout(() => setShown(false), LINGER_MS);
    }, APPEAR_AFTER_MS);

    return () => {
      clearTimeout(appear);
      if (linger.current) clearTimeout(linger.current);
    };
  }, [slug]);

  function hold() {
    if (linger.current) {
      clearTimeout(linger.current);
      linger.current = null;
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    form.set("slug", slug);
    form.set("section", section);
    form.set("opened", String(openedAt.current));
    try {
      const response = await fetch("/api/price-report", { method: "POST", body: form });
      const body = (await response.json()) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || body.error) {
        setError(body.error ?? `That did not go through (${response.status}).`);
      } else {
        setSent(body.message ?? "Thank you.");
        setOpen(false);
        writeStore(SEEN_KEY(slug), "1");
      }
    } catch (cause) {
      setError(`Could not reach the server: ${String(cause)}`);
    } finally {
      setBusy(false);
    }
  }

  if (!shown && !open && !sent) return null;

  return (
    <div
      className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[22rem]"
      onMouseEnter={hold}
      onFocusCapture={hold}
    >
      <div className="border border-[var(--line)] bg-[var(--bg-raised)] shadow-lg">
        {sent ? (
          <div className="px-4 py-3">
            <p className="text-sm leading-relaxed text-[var(--fg-soft)]">{sent}</p>
            <button
              type="button"
              onClick={() => setSent(null)}
              className="mt-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--accent)] underline underline-offset-4"
            >
              Close
            </button>
          </div>
        ) : open ? (
          <form
            onSubmit={submit}
            className="max-h-[80vh] space-y-3.5 overflow-y-auto px-4 py-4"
            aria-label={`What you paid for a ${name}`}
          >
            <p className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--accent)]">
              What you paid
            </p>

            {/* The honeypot. Named for something a filler would want to
                complete and hidden from everyone who is not a machine. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-px w-px opacity-0"
            />

            <Field label="Did you buy it or sell it?">
              <select name="side" defaultValue="bought" className={selectClass}>
                <option value="bought">I bought it</option>
                <option value="sold">I sold it</option>
              </select>
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
                <select
                  name="currency"
                  defaultValue="USD"
                  className={`${fieldBase} w-[5.5rem] shrink-0`}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
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

            <Field label="Where?">
              <select name="venue" defaultValue="ebay" className={selectClass}>
                {VENUES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="What condition?">
              <select name="condition" defaultValue="good" required className={selectClass}>
                {CONDITIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} — {c.blurb}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Anything worth knowing? (optional)">
              <textarea
                name="notes"
                rows={2}
                placeholder="What came with it, what it needed…"
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
                onClick={() => {
                  setOpen(false);
                  quieten(true);
                }}
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

            <p className="font-[family-name:var(--font-mono)] text-[0.6rem] leading-relaxed text-[var(--fg-soft)]">
              Nothing is published until it has been read, and nothing identifying you is stored
              unless you type it.
            </p>
          </form>
        ) : (
          <div className="flex items-start gap-3 px-4 py-3">
            <p className="flex-1 text-sm leading-relaxed text-[var(--fg-soft)]">
              Bought or sold a <span className="text-[var(--fg)]">{name}</span> lately?{" "}
              <button
                type="button"
                onClick={() => {
                  hold();
                  openedAt.current = Date.now();
                  setOpen(true);
                }}
                className="text-[var(--accent)] underline underline-offset-2"
              >
                Tell us what it went for
              </button>{" "}
              and help build the record of what these actually sell for.
            </p>
            <button
              type="button"
              onClick={() => quieten(true)}
              aria-label="No thanks"
              className="-mr-1 -mt-1 px-2 py-1 font-[family-name:var(--font-mono)] text-sm leading-none text-[var(--fg-soft)] hover:text-[var(--accent)]"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const fieldBase =
  "border border-[var(--line)] bg-[var(--bg)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm";
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
