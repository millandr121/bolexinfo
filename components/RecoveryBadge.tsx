const LABELS = {
  full: { text: "Fully recovered", tone: "text-[var(--fg-soft)]" },
  "summary-only": { text: "Summary recovered · full page pending", tone: "text-[var(--brass,#8c6d3f)]" },
  pending: { text: "Recovery pending", tone: "text-[var(--fg-soft)] opacity-70" },
} as const;

/**
 * Honest provenance labeling: every entry states exactly how much of the
 * original record has been recovered so far. Nothing is presented as more
 * complete than it is.
 */
export function RecoveryBadge({ status }: { status: keyof typeof LABELS }) {
  const label = LABELS[status];
  return (
    <span
      className={`inline-block font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] ${label.tone}`}
    >
      {label.text}
    </span>
  );
}

export function ProvenanceNote({ children }: { children: React.ReactNode }) {
  return (
    <aside className="rule mt-12 pt-4 text-xs leading-relaxed text-[var(--fg-soft)] font-[family-name:var(--font-mono)] max-w-2xl">
      <span className="uppercase tracking-[0.18em]">Provenance — </span>
      {children}
    </aside>
  );
}
