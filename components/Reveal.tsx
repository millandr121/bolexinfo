"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Purposeful entrance: content settles into place as it enters the viewport,
 * communicating reading order. Fully disabled under prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "li";
  /** Forwarded so a revealed block can still be a positioned grid child. */
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[Tag];
  /*
   * `data-reveal` is the hook for the CSS backstop in globals.css.
   *
   * It is load-bearing, not decorative. This component is server-rendered with
   * motion's `initial` state inlined as `opacity: 0`, and the client decides
   * only afterwards whether to animate. If that decision ever fails to clear
   * the inline style — under prefers-reduced-motion, where this branch renders
   * a plain element that never owned the style, or with JavaScript disabled,
   * where no client render happens at all — the content stays invisible
   * forever. The stylesheet forces it visible in both cases.
   */
  if (reduceMotion) {
    return (
      <Tag data-reveal="" className={className}>
        {children}
      </Tag>
    );
  }
  return (
    <MotionTag
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.2, 0.65, 0.25, 1] }}
    >
      {children}
    </MotionTag>
  );
}
