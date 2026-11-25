-- Suggestions sent from /suggest.
--
-- Apply with:
--   npx wrangler d1 execute bolex-suggestions --remote --file db/schema.sql
--
-- Deliberately plain. This is a queue someone reads and acts on, not an
-- application database: no joins, no foreign keys, nothing that has to be
-- migrated later. Every column is either what the sender typed or something
-- the edge knew at the time.

CREATE TABLE IF NOT EXISTS suggestions (
  id          TEXT PRIMARY KEY,
  created_at  TEXT    NOT NULL,          -- ISO 8601, UTC
  kind        TEXT    NOT NULL,          -- correction | missing | media | knowledge
  page        TEXT,                      -- the page it concerns, if any
  message     TEXT    NOT NULL,
  name        TEXT,
  contact     TEXT,                      -- so a reply is possible; optional
  credit      TEXT,                      -- how they wish to be credited
  media       TEXT,                      -- JSON array of stored object keys
  -- Kept for triage, not analytics: a country and a user agent are what
  -- distinguish a real correction from a flood of identical spam.
  country     TEXT,
  user_agent  TEXT,
  status      TEXT    NOT NULL DEFAULT 'new'   -- new | actioned | declined
);

CREATE INDEX IF NOT EXISTS suggestions_created_at ON suggestions (created_at DESC);
CREATE INDEX IF NOT EXISTS suggestions_status     ON suggestions (status, created_at DESC);

-- Rate limiting. One row per sender per window; old rows are swept on write
-- rather than by a scheduled job, so there is nothing else to keep running.
CREATE TABLE IF NOT EXISTS submission_rate (
  fingerprint TEXT NOT NULL,
  at          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS submission_rate_lookup ON submission_rate (fingerprint, at);

-- What people actually paid.
--
-- The other half of the prices work. The archive publishes what Paillard
-- charged new, 1952 to 1979, and that is not the question anyone arrives
-- with: they want to know what the thing in their hands is worth now. No
-- usable public record of that exists for Bolex equipment — eBay keeps
-- ninety days, Facebook keeps nothing — so the only way to have one is to
-- start keeping it.
--
-- Nothing here is published until it is approved. An archive whose whole
-- argument is that every figure is cited cannot start printing medians of
-- whatever strangers typed, and a single mistyped zero would poison an
-- average for years.
CREATE TABLE IF NOT EXISTS price_reports (
  id          TEXT PRIMARY KEY,
  created_at  TEXT    NOT NULL,          -- ISO 8601, UTC, when it was sent
  slug        TEXT    NOT NULL,          -- the item's slug
  section     TEXT    NOT NULL,          -- cameras | projectors | lenses | accessories
  amount      REAL    NOT NULL,          -- as typed, in the currency given
  currency    TEXT    NOT NULL,          -- ISO 4217; no conversion is done
  -- Kept as given rather than converted. Rates move, and a figure the
  -- archive converted on the day of submission would quietly rot.
  sold_on     TEXT,                      -- YYYY-MM, as near as they knew
  condition   TEXT    NOT NULL,          -- broken | as-is | fair | good | excellent | serviced
  venue       TEXT,                      -- ebay | facebook | shop | auction | private | other
  side        TEXT    NOT NULL,          -- bought | sold
  notes       TEXT,
  name        TEXT,
  contact     TEXT,
  country     TEXT,
  user_agent  TEXT,
  status      TEXT    NOT NULL DEFAULT 'new'  -- new | approved | declined
);

CREATE INDEX IF NOT EXISTS price_reports_item   ON price_reports (slug, status);
CREATE INDEX IF NOT EXISTS price_reports_queue  ON price_reports (status, created_at DESC);
