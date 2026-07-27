"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ModelImage } from "@/lib/museum";

/**
 * Museum-quality image viewer: a quiet thumbnail grid that opens into a
 * full-screen lightbox with keyboard navigation and click-to-zoom. Recovered
 * images are served at their original site paths (staged into /public), so the
 * URLs match the historical record exactly.
 */
export function ImageGallery({ images, caption }: { images: ModelImage[]; caption: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

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
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  if (images.length === 0) return null;

  return (
    <>
      <ul className={`grid gap-3 ${images.length === 1 ? "sm:grid-cols-1 max-w-md" : "sm:grid-cols-2"}`}>
        {images.map((img, i) => (
          <li key={img.src}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full overflow-hidden border border-[var(--line)] bg-[var(--bg-raised)] cursor-zoom-in"
              aria-label={`View ${img.alt || caption} full screen`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt || caption}
                loading="lazy"
                className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </button>
            {img.alt && <p className="mt-1.5 text-xs text-[var(--fg-soft)] font-[family-name:var(--font-mono)]">{img.alt}</p>}
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open !== null && images[open] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-10"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={images[open].alt || caption}
          >
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                className="absolute left-3 sm:left-6 text-white/70 hover:text-white text-3xl p-3"
                aria-label="Previous image"
              >
                ‹
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={images[open].src}
              initial={{ scale: reduceMotion ? 1 : 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              src={images[open].src}
              alt={images[open].alt || caption}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                className="absolute right-3 sm:right-6 text-white/70 hover:text-white text-3xl p-3"
                aria-label="Next image"
              >
                ›
              </button>
            )}
            <button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-sm uppercase tracking-[0.2em] font-[family-name:var(--font-mono)]"
              aria-label="Close"
            >
              Close ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
