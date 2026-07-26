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
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "li";
}) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[Tag];
  if (reduceMotion) return <Tag>{children}</Tag>;
  return (
    <MotionTag
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.2, 0.65, 0.25, 1] }}
    >
      {children}
    </MotionTag>
  );
}
