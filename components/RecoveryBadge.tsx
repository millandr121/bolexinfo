/**
 * A short credit under a page: who made the thing above it.
 *
 * It used to be headed "Provenance" and used to describe the recovery —
 * which Wayback capture a page came from, how much of it had been
 * recovered so far, which fields were still pending. That is real and
 * worth keeping, but it is a note to ourselves: a reader looking up a
 * serial number wants the serial number, not an account of how the
 * site was rebuilt. The recovery record lives in the archive ledger
 * and in research/, and the page says who the work belongs to.
 *
 * The file keeps its name only because the import path is referenced
 * from several pages; renaming it is a separate, noisier change.
 */
export function SourceNote({ children }: { children: React.ReactNode }) {
  return (
    <aside className="rule mt-12 pt-4 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)] max-w-2xl">
      <span className="uppercase tracking-[0.18em]">Source — </span>
      {children}
    </aside>
  );
}
