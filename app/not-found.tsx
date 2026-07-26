import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-24 pb-16 max-w-xl">
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
        404 — Not in the collection
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-[560] tracking-tight">
        This page isn&rsquo;t on the shelf.
      </h1>
      <p className="mt-4 text-[var(--fg-soft)] leading-relaxed">
        It may not have been recovered yet — the preservation effort is ongoing. Check the{" "}
        <Link href="/archive" className="text-[var(--accent)] underline underline-offset-4">
          recovery ledger
        </Link>{" "}
        or return to the{" "}
        <Link href="/" className="text-[var(--accent)] underline underline-offset-4">
          front hall
        </Link>
        .
      </p>
    </div>
  );
}
