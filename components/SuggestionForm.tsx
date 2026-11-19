"use client";

import { useEffect, useState } from "react";
import {
  SUGGESTIONS_EMAIL,
  SUGGESTION_KINDS,
  isTooLongToMail,
  kindSpec,
  suggestionBody,
  suggestionMailto,
  type SuggestionDraft,
  type SuggestionKind,
} from "@/lib/suggestions";

/**
 * Tell us something.
 *
 * The site is a static export, so there is no server here to receive a post.
 * The form gathers everything properly on the page and then hands it to the
 * sender's own mail app, fully written — which also means a photograph can
 * simply be attached, and the sender keeps a copy of what they sent.
 *
 * Deliberately not validated into submission. The one thing that must be
 * there is the message; a name and a credit line are optional and say so,
 * because demanding identification from someone offering a correction is a
 * good way not to receive corrections.
 */
export function SuggestionForm({ defaultPage }: { defaultPage?: string }) {
  const [kind, setKind] = useState<SuggestionKind>("correction");
  const [page, setPage] = useState(defaultPage ?? "");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [credit, setCredit] = useState("");
  const [sent, setSent] = useState(false);

  /*
   * A correction usually concerns the page the reader came from. Reading it
   * from the query string means "suggest a correction" links on object pages
   * can arrive with the field already filled.
   */
  useEffect(() => {
    if (defaultPage) return;
    const from = new URLSearchParams(window.location.search).get("page");
    if (from) setPage(from);
  }, [defaultPage]);

  const draft: SuggestionDraft = {
    kind,
    page: page.trim() || undefined,
    message,
    name: name.trim() || undefined,
    credit: credit.trim() || undefined,
  };
  const ready = message.trim().length > 0;
  const tooLong = ready && isTooLongToMail(draft);
  const spec = kindSpec(kind);

  const field =
    "w-full border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[0.95rem] text-[var(--fg)] placeholder:text-[var(--fg-soft)]/70";
  const legend =
    "font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.18em] text-[var(--fg-soft)]";

  return (
    <form
      className="mt-8 max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        // Navigating rather than window.open: a popup blocker will stop the
        // latter, and the sender sees nothing happen at all.
        window.location.href = suggestionMailto(draft);
        setSent(true);
      }}
    >
      <fieldset className="border-0 p-0">
        <legend className={legend}>What is it?</legend>
        <div className="mt-3 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
          {SUGGESTION_KINDS.map((k) => {
            const active = k.id === kind;
            return (
              <label
                key={k.id}
                className={`flex cursor-pointer flex-col gap-1 p-4 transition-colors ${
                  active ? "bg-[var(--bg-raised)]" : "bg-[var(--bg)] hover:bg-[var(--bg-raised)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="kind"
                    value={k.id}
                    checked={active}
                    onChange={() => setKind(k.id)}
                    className="accent-[var(--accent)]"
                  />
                  <span className="font-[family-name:var(--font-display)] text-base font-[560]">
                    {k.label}
                  </span>
                </span>
                <span className="pl-6 text-sm leading-relaxed text-[var(--fg-soft)]">{k.blurb}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-7">
        <label htmlFor="sg-message" className={legend}>
          Tell us
        </label>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--fg-soft)]">{spec.prompt}</p>
        <textarea
          id="sg-message"
          required
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`mt-2 ${field}`}
        />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="sg-page" className={legend}>
            Which page {page ? "" : "(if it is about one)"}
          </label>
          <input
            id="sg-page"
            type="text"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="/cameras/h16rex5"
            className={`mt-2 ${field}`}
          />
        </div>
        <div>
          <label htmlFor="sg-name" className={legend}>
            Your name (optional)
          </label>
          <input
            id="sg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`mt-2 ${field}`}
          />
        </div>
      </div>

      {kind === "media" && (
        <div className="mt-6">
          <label htmlFor="sg-credit" className={legend}>
            How should we credit you?
          </label>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--fg-soft)]">
            Everything here is credited to whoever it came from. Say the name you want shown, or
            say you would rather not be named.
          </p>
          <input
            id="sg-credit"
            type="text"
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
            className={`mt-2 ${field}`}
          />
        </div>
      )}

      {tooLong && (
        <p className="mt-6 border-l-2 border-[var(--accent)] pl-4 text-sm leading-relaxed text-[var(--fg-soft)]">
          This is long enough that some mail apps would quietly cut it short. Rather than risk
          losing the end of it, write to{" "}
          <a href={`mailto:${SUGGESTIONS_EMAIL}`} className="text-[var(--accent)] underline">
            {SUGGESTIONS_EMAIL}
          </a>{" "}
          directly and paste it in — or send the short version here and the rest separately.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={!ready || tooLong}
          className="tap-target border border-[var(--accent)] bg-[var(--accent)] px-5 text-[0.8rem] uppercase tracking-[0.14em] text-[var(--bg)] transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Open this in my email
        </button>
        <span className="text-sm text-[var(--fg-soft)]">
          {ready ? "Nothing is sent until you send it yourself." : "Write something first."}
        </span>
      </div>

      {sent && (
        <div className="mt-6 border border-[var(--line)] bg-[var(--bg-raised)] p-4">
          <p className="text-sm leading-relaxed">
            Your mail app should have opened with this ready to send — attach any photographs
            there. If nothing happened, your browser may have no mail app set up: copy the text
            below and send it to{" "}
            <a href={`mailto:${SUGGESTIONS_EMAIL}`} className="text-[var(--accent)] underline">
              {SUGGESTIONS_EMAIL}
            </a>
            .
          </p>
          <textarea
            readOnly
            rows={7}
            value={suggestionBody(draft)}
            className={`mt-3 ${field} font-[family-name:var(--font-mono)] text-xs`}
          />
        </div>
      )}
    </form>
  );
}
