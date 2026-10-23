"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ModelImage } from "@/lib/museum";

/**
 * Museum-quality image viewer: a thumbnail grid that opens into a full-screen
 * lightbox with swipe, keyboard navigation and thumb-reachable controls.
 *
 * Mobile shapes the interaction model here. Photographs are browsed by
 * swiping, not by aiming at edge arrows; the controls sit along the bottom
 * where a thumb rests rather than the top-right corner, which is the hardest
 * point to reach one-handed on a large phone.
 */
export function ImageGallery({ images, caption }: { images: ModelImage[]; caption: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: number) => setOpen((i) => (i === null ? null : (i + dir + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close, step]);

  if (images.length === 0) return null;
  const current = open === null ? null : images[open];

  return (
    <>
      <ul className={`grid gap-3 ${images.length === 1 ? "sm:grid-cols-1 max-w-md" : "grid-cols-2"}`}>
        {images.map((img, i) => (
          <li key={img.src}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full overflow-hidden border border-[var(--line)] plate p-2 cursor-zoom-in"
              aria-label={`View ${img.alt || caption} full screen`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt || caption}
                loading="lazy"
                className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02] no-touch-zoom"
              />
            </button>
            {img.alt && (
              <p className="mt-1.5 text-xs text-[var(--fg-soft)] font-[family-name:var(--font-mono)]">{img.alt}</p>
            )}
          </li>
        ))}
      </ul>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {current && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label={current.alt || caption}
              >
                {/* Tapping the backdrop dismisses, as in Photos. */}
                <div className="flex-1 flex items-center justify-center overflow-hidden" onClick={close}>
                  <motion.img
                    key={current.src}
                    // Horizontal drag = swipe between photographs. A short,
                    // fast flick counts as well as a long drag.
                    drag={images.length > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.15}
                    onDragEnd={(_, info) => {
                      const { offset, velocity } = info;
                      if (offset.x < -60 || velocity.x < -400) step(1);
                      else if (offset.x > 60 || velocity.x > 400) step(-1);
                    }}
                    initial={{ scale: reduceMotion ? 1 : 0.97, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                    src={current.src}
                    alt={current.alt || caption}
                    draggable={false}
                    className="max-h-full max-w-full object-contain touch-pan-y select-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Controls live along the bottom, within thumb reach. */}
                <div className="shrink-0 px-4 pt-3 safe-bottom bg-gradient-to-t from-black/80 to-transparent">
                  {current.alt && (
                    <p className="mb-3 text-center text-sm text-white/80 font-[family-name:var(--font-mono)]">
                      {current.alt}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={close}
                      className="tap-target px-4 text-white/80 text-xs uppercase tracking-[0.2em] font-[family-name:var(--font-mono)]"
                    >
                      Close
                    </button>
                    {images.length > 1 && (
                      <>
                        <span className="font-[family-name:var(--font-mono)] text-xs text-white/50 tabular-nums">
                          {open! + 1} / {images.length}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => step(-1)}
                            aria-label="Previous image"
                            className="tap-target px-5 text-white/80 text-2xl leading-none"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={() => step(1)}
                            aria-label="Next image"
                            className="tap-target px-5 text-white/80 text-2xl leading-none"
                          >
                            ›
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
