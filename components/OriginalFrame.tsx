import { ViewToggle } from "./ViewToggle";

/** The old site's own front page. */
export const ORIGINAL_ENTRY = "/original/index.html";

/**
 * The preserved site, filling the viewport beneath a strip of our own.
 *
 * Every page of BolexCollector.com is here byte for byte with its stylesheets
 * and photographs, and its internal links are relative, so pointing a frame at
 * the front page is enough to make the whole site navigate inside it. Nothing
 * is rebuilt and the modern data layer is not involved.
 *
 * The strip stays outside the frame so the record can stay untouched: injecting
 * it into the archived HTML would mean editing the pages to carry our own
 * furniture. Outside, every preserved byte is exactly as captured and the
 * attribution and the way back are still always visible.
 */
export function OriginalFrame({ lazy = false }: { lazy?: boolean }) {
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
          <ViewToggle to="modern" className="tap-target shrink-0 border border-[var(--fg)] px-3 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.12em] transition-colors duration-200 hover:bg-[var(--fg)] hover:text-[var(--bg)]">
            Modern site
          </ViewToggle>
        </div>
      </div>

      {/*
       * `sandbox` without `allow-scripts` keeps the period page quiet — the
       * dead AddThis and eBay widgets it still calls cannot run — while links
       * inside the frame continue to navigate the frame itself.
       *
       * `lazy` matters on the homepage, where this markup is served to every
       * visitor but hidden by CSS for those reading the modern edition. A
       * lazily loaded frame that is never near the viewport is never fetched,
       * so phone visitors do not pay for a site they were not shown.
       */}
      <iframe
        src={ORIGINAL_ENTRY}
        title="The preserved BolexCollector.com"
        className="min-h-0 w-full flex-1 bg-white"
        sandbox="allow-same-origin"
        {...(lazy ? { loading: "lazy" as const } : {})}
      />
    </div>
  );
}
