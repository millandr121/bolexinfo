import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Revisit the original site",
  description:
    "Browse BolexCollector.com as it was — the preserved pages, stylesheets and photographs of Michael Tisdale's original site, kept online while it is down.",
};

/** The old site's own front page. */
const ENTRY = "/original/index.html";

/**
 * The original site, browsable.
 *
 * Every page of BolexCollector.com is preserved here byte for byte, along
 * with its stylesheets and photographs, so this is not a reconstruction: it is
 * the site itself, served as it was written. Its internal links are relative,
 * so once the frame is pointed at the front page the whole site navigates
 * normally inside it.
 *
 * The frame exists so the preserved pages can stay untouched. A strip injected
 * into the archived HTML would mean altering the record to add our own
 * furniture; keeping our strip outside the frame leaves every preserved byte
 * exactly as captured while still giving a constant line of attribution and a
 * way back.
 *
 * It fills the viewport rather than sitting inside the modern page, both for
 * the sake of the old layout — which was built for a fixed-width window — and
 * because a frame nested inside a scrolling page is miserable on a phone.
 */
export default function RevisitPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)]">
      <div className="safe-top shrink-0 border-b border-[var(--line)] bg-[var(--bg-raised)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
          <p className="min-w-0 font-[family-name:var(--font-mono)] text-[0.68rem] leading-snug text-[var(--fg-soft)]">
            <span className="text-[var(--fg)]">BolexCollector.com as it was</span>
            <span className="hidden sm:inline">
              {" "}
              — the work of Michael Tisdale, kept online while the original is down
            </span>
          </p>
          <Link
            href="/"
            className="tap-target shrink-0 border border-[var(--fg)] px-3 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.12em] transition-colors duration-200 hover:bg-[var(--fg)] hover:text-[var(--bg)]"
          >
            Leave
          </Link>
        </div>
      </div>

      {/*
       * `sandbox` without `allow-scripts` keeps the period page quiet — the
       * dead AddThis and eBay widgets it still calls cannot run — while links
       * inside the frame continue to navigate the frame itself.
       */}
      <iframe
        src={ENTRY}
        title="The preserved BolexCollector.com"
        className="min-h-0 w-full flex-1 bg-white"
        sandbox="allow-same-origin"
      />
    </div>
  );
}
