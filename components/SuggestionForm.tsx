"use client";

import { useEffect, useRef, useState } from "react";
import {
  SUGGESTIONS_EMAIL,
  SUGGESTION_KINDS,
  kindSpec,
  suggestionMailto,
  type SuggestionDraft,
  type SuggestionKind,
} from "@/lib/suggestions";

interface Capability {
  ready: boolean;
  media: boolean;
  maxFiles: number;
  maxFileBytes: number;
}

type Status =
  | { state: "editing" }
  | { state: "sending" }
  | { state: "sent"; stored: number; rejected: string[] }
  | { state: "failed"; error: string };

/**
 * Tell us something.
 *
 * Submissions go to a Cloudflare Function on this same origin, which stores
 * them in the project's own database — not to a third party, and not into
 * someone's inbox where a correction is one unread message among hundreds.
 *
 * What the backend can do is asked, not assumed: file uploads need a bucket
 * that may not be bound, so the form asks on mount and only offers to take
 * photographs when they can actually be stored. Offering an upload that
 * silently discards the file would be worse than not offering one.
 *
 * Deliberately under-validated. The one thing required is the message; a
 * name and a way to reply are optional and say so, because demanding
 * identification from someone offering a correction is a good way not to
 * receive corrections.
 */
export function SuggestionForm({ defaultPage }: { defaultPage?: string }) {
  const [kind, setKind] = useState<SuggestionKind>("correction");
  const [page, setPage] = useState(defaultPage ?? "");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [credit, setCredit] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>({ state: "editing" });
  const [cap, setCap] = useState<Capability | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!defaultPage) {
      const from = new URLSearchParams(window.location.search).get("page");
      if (from) setPage(from);
    }
    let live = true;
    fetch("/api/suggest")
      .then((r) => (r.ok ? r.json() : null))
      .then((c: Capability | null) => {
        if (live && c) setCap(c);
      })
      .catch(() => {
        /* Offline, or the function is not deployed. The form still works:
           `cap` stays null, uploads are not offered, and a failed submit
           falls back to email. */
      });
    return () => {
      live = false;
    };
  }, [defaultPage]);

  const spec = kindSpec(kind);
  const ready = message.trim().length > 0;
  const draft: SuggestionDraft = {
    kind,
    page: page.trim() || undefined,
    message,
    name: name.trim() || undefined,
    credit: credit.trim() || undefined,
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || status.state === "sending") return;
    setStatus({ state: "sending" });

    const body = new FormData();
    body.set("kind", kind);
    body.set("message", message);
    if (page.trim()) body.set("page", page.trim());
    if (name.trim()) body.set("name", name.trim());
    if (contact.trim()) body.set("contact", contact.trim());
    if (credit.trim()) body.set("credit", credit.trim());
    for (const f of files) body.append("files", f);

    try {
      const res = await fetch("/api/suggest", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        stored?: number;
        rejected?: string[];
      };
      if (!res.ok || !data.ok) {
        setStatus({ state: "failed", error: data.error ?? `The server answered ${res.status}.` });
        return;
      }
      setStatus({ state: "sent", stored: data.stored ?? 0, rejected: data.rejected ?? [] });
    } catch {
      setStatus({
        state: "failed",
        error: "Could not reach the server. Your connection may have dropped.",
      });
    }
  }

  const field =
    "w-full border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[0.95rem] text-[var(--fg)] placeholder:text-[var(--fg-soft)]/70";
  const legend =
    "font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.18em] text-[var(--fg-soft)]";

  if (status.state === "sent") {
    return (
      <div className="mt-8 max-w-2xl border border-[var(--accent)] bg-[var(--bg-raised)] p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-[560]">Thank you.</h2>
        <p className="mt-3 leading-relaxed text-[var(--fg-soft)]">
          It is saved and will be read.
          {status.stored > 0 &&
            ` ${status.stored} file${status.stored === 1 ? "" : "s"} came with it.`}
          {contact.trim()
            ? " You will hear back if anything needs checking."
            : " You did not leave a way to reply, so this is where it ends — which is fine, and thank you all the same."}
        </p>
        {status.rejected.length > 0 && (
          <div className="mt-4 border-l-2 border-[var(--accent)] pl-4 text-sm leading-relaxed">
            <p className="font-medium">These did not make it through:</p>
            <ul className="mt-1 list-disc pl-5 text-[var(--fg-soft)]">
              {status.rejected.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className="mt-2 text-[var(--fg-soft)]">
              Nothing else was affected — the message itself is saved.
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setFiles([]);
            if (fileInput.current) fileInput.current.value = "";
            setStatus({ state: "editing" });
          }}
          className="mt-5 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--accent)] underline underline-offset-4"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="mt-8 max-w-2xl" onSubmit={submit}>
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

      {cap?.media && (
        <div className="mt-6">
          <label htmlFor="sg-files" className={legend}>
            Photographs or scans (optional)
          </label>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--fg-soft)]">
            Up to {cap.maxFiles} files, {Math.round(cap.maxFileBytes / (1024 * 1024))}MB each —
            JPEG, PNG, WebP, TIFF or PDF. Send the largest version you have; it can always be
            made smaller here, never bigger.
          </p>
          <input
            id="sg-files"
            ref={fileInput}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/tiff,application/pdf"
            onChange={(e) => setFiles([...(e.target.files ?? [])])}
            className="mt-2 block w-full text-sm text-[var(--fg-soft)] file:mr-3 file:border file:border-[var(--line)] file:bg-[var(--bg-raised)] file:px-3 file:py-1.5 file:text-[var(--fg)]"
          />
          {files.length > 0 && (
            <p className="mt-2 font-[family-name:var(--font-mono)] text-xs text-[var(--fg-soft)]">
              {files.length} selected ·{" "}
              {(files.reduce((n, f) => n + f.size, 0) / (1024 * 1024)).toFixed(1)}MB
            </p>
          )}
        </div>
      )}

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

      <div className="mt-6">
        <label htmlFor="sg-contact" className={legend}>
          Email, if you would like a reply (optional)
        </label>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--fg-soft)]">
          Only used to answer this. Leave it blank and the suggestion still arrives — it just
          ends there.
        </p>
        <input
          id="sg-contact"
          type="email"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className={`mt-2 ${field}`}
        />
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

      {/* Not shown to anyone; a bot that fills every field gives itself away. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        onChange={() => {}}
      />

      {status.state === "failed" && (
        <div className="mt-6 border-l-2 border-[var(--accent)] pl-4 text-sm leading-relaxed">
          <p>{status.error}</p>
          <p className="mt-2 text-[var(--fg-soft)]">
            Nothing you wrote has been lost. Try again, or{" "}
            <a href={suggestionMailto(draft)} className="text-[var(--accent)] underline">
              send it by email instead
            </a>{" "}
            — that opens your mail app with all of this already written.
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={!ready || status.state === "sending"}
          className="tap-target border border-[var(--accent)] bg-[var(--accent)] px-5 text-[0.8rem] uppercase tracking-[0.14em] text-[var(--bg)] transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status.state === "sending" ? "Sending…" : "Send this"}
        </button>
        <span className="text-sm text-[var(--fg-soft)]">
          {ready ? "Goes straight to the archive's own records." : "Write something first."}
        </span>
      </div>

      {cap && !cap.ready && (
        <p className="mt-5 border-l-2 border-[var(--accent)] pl-4 text-sm leading-relaxed text-[var(--fg-soft)]">
          The suggestion box is not finished being set up. Until it is, write to{" "}
          <a href={`mailto:${SUGGESTIONS_EMAIL}`} className="text-[var(--accent)] underline">
            {SUGGESTIONS_EMAIL}
          </a>
          .
        </p>
      )}
    </form>
  );
}
