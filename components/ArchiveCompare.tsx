"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * "View Original Archive" — reveals the byte-for-byte preserved page (served
 * from /public/original, staged from archive/wayback) beside the modern
 * edition, so the historical record is always one click away. The original is
 * shown in an isolated iframe exactly as it was captured; nothing about it is
 * altered.
 */
export function ArchiveCompare({ originalHref, title }: { originalHref: string; title: string }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <section aria-label="Original archive comparison" className="mt-12">
      <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] pt-4">
        <div>
          <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
            The original archive
          </h2>
          <p className="mt-1 text-sm text-[var(--fg-soft)]">
            The preserved BolexCollector.com page, exactly as captured.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="shrink-0 border border-[var(--fg)] px-4 py-2 text-xs uppercase tracking-[0.12em] hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors duration-200"
        >
          {open ? "Hide original" : "Compare original"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.2, 0.7, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 border border-[var(--line)] bg-[var(--bg-raised)]">
              <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-[var(--line)] font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]">
                <span>Preserved original · bolexcollector.com</span>
                <a
                  href={originalHref}
                  target="_blank"
                  rel="noreferrer"
                  className="tap-target text-[var(--accent)] hover:underline shrink-0"
                >
                  Open ↗
                </a>
              </div>

              {/*
               * The embedded frame is desktop-only by design. The archived
               * pages are fixed-width documents from the 2000s; on a phone an
               * iframe of one means a small scroll region nested inside the
               * page scroll — you fight to pan it, and vertical swipes get
               * captured by the wrong surface. Phones get a full-screen open
               * instead, which hands the document the whole viewport and the
               * browser's own pinch-zoom.
               */}
              <iframe
                src={originalHref}
                title={`Original archived page: ${title}`}
                loading="lazy"
                className="hidden sm:block w-full h-[60vh] bg-white"
                sandbox=""
              />

              <a
                href={originalHref}
                target="_blank"
                rel="noreferrer"
                className="sm:hidden flex items-center justify-between gap-4 px-4 py-5 active:bg-[var(--bg)]"
              >
                <span className="text-sm leading-snug">
                  Open the preserved page full screen
                  <span className="block mt-1 text-xs text-[var(--fg-soft)]">
                    Original 2000s layout — best viewed with pinch-to-zoom
                  </span>
                </span>
                <span aria-hidden="true" className="text-[var(--accent)] text-xl shrink-0">
                  ↗
                </span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
