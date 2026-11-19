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
