import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 grid gap-8 sm:grid-cols-3 text-sm text-[var(--fg-soft)]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg text-[var(--fg)]">
            Bolex Collector
          </p>
          <p className="mt-2 max-w-xs leading-relaxed">
            A preservation of the original BolexCollector.com by Michael Tisdale,
            resurrected with permission as a permanent digital archive.
          </p>
        </div>
        <nav aria-label="Footer" className="grid gap-1.5">
          <Link href="/about" className="hover:text-[var(--accent)]">About the restoration</Link>
          <Link href="/archive" className="hover:text-[var(--accent)]">Recovery status</Link>
          <Link href="/serials" className="hover:text-[var(--accent)]">Serial number lookup</Link>
          <Link href="/timeline" className="hover:text-[var(--accent)]">Paillard timeline</Link>
        </nav>
        <div className="font-[family-name:var(--font-mono)] text-xs leading-relaxed">
          <p>Original site © Michael Tisdale.</p>
          <p className="mt-1">
            Historical texts and images are preserved unaltered; recovery
            provenance is recorded throughout.
          </p>
        </div>
      </div>
    </footer>
  );
}
