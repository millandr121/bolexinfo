"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { VIEW_STORAGE_KEY, type View } from "@/lib/view-preference";

/**
 * Switch between the preserved site and the modern edition, and remember it.
 *
 * The choice is written to the browser and to the `data-view` attribute the
 * stylesheet reads, so on the homepage the swap is immediate — no navigation,
 * no reload, the attribute flips and CSS shows the other edition. Everywhere
 * else the visitor is sent home, where that same attribute decides what they
 * find.
 *
 * Remembering is the point: someone who has said which edition they want
 * should not be sorted by screen width again on their next visit.
 */
export function ViewToggle({
  to,
  className,
  children,
}: {
  to: View;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  const apply = () => {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, to);
    } catch {
      // Private browsing or blocked storage: the switch below still works for
      // this page view, it simply will not be remembered.
    }
    document.documentElement.setAttribute("data-view", to);

    // On the homepage both editions are already here, so flipping the
    // attribute is the whole switch. Elsewhere there is nothing to flip.
    if (window.location.pathname !== "/") router.push("/");
  };

  return (
    <button type="button" onClick={apply} className={className}>
      {children}
    </button>
  );
}
