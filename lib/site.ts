/**
 * Canonical site identity.
 *
 * Kept as one constant because it appears in canonical URLs, OpenGraph tags,
 * JSON-LD, the sitemap and robots.txt — if those disagree with the domain the
 * site is actually served from, search engines index the wrong host.
 *
 * Note this is deliberately *not* the historical domain. The original site
 * lived at bolexcollector.com, which no longer resolves; archived URLs are
 * still recorded and resolved against that host throughout the archive layer,
 * because that is where the material genuinely came from. This constant is
 * only about where the modern edition lives today.
 */
export const SITE = {
  /** Canonical origin of the modern edition, no trailing slash. */
  url: "https://bolexcollector.org",
  name: "Bolex Collector",
  /** The historical domain the archive was recovered from. */
  historicalDomain: "bolexcollector.com",
} as const;
