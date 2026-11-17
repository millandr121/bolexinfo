import type { Metadata } from "next";
import { OriginalFrame } from "@/components/OriginalFrame";

export const metadata: Metadata = {
  title: "The original site",
  description:
    "Browse BolexCollector.com as it was — the preserved pages, stylesheets and photographs of Michael Tisdale's original site, kept online while it is down.",
};

/**
 * A permanent address for the preserved site.
 *
 * The front page shows it to most desktop visitors already, but that is a
 * preference and preferences change. This route always opens it, so it can be
 * linked to and bookmarked without depending on what the visitor last chose.
 *
 * The frame is not lazy here: it is the only reason anyone came.
 */
export default function RevisitPage() {
  return <OriginalFrame />;
}
