/**
 * Reads the suggestion queue back out, for whoever runs the archive.
 *
 * The companion to suggest.ts. Submissions land in D1 and, until this
 * existed, the only way to see them was the Cloudflare dashboard's SQL
 * console, which is a poor way to read someone's account of a repair.
 *
 * Bindings and variables, on the Pages project:
 *   DB         — the same D1 database suggest.ts writes to.
 *   ADMIN_KEY  — a secret. Without it this endpoint refuses everything,
 *                which is the safe way to fail: a missing variable must
 *                never mean an open door.
 *
 * The key travels in a header where it can, and in the query string as a
 * fallback, because a bookmarked link is how this will actually get used.
 * A query string is visible in logs, so the key is worth rotating if it is
 * ever pasted somewhere public. There is no session and no cookie: one
 * secret, held by one person, for a page nobody else knows about.
 */

interface Env {
  DB?: D1Database;
  ADMIN_KEY?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      /* Nothing here should ever be indexed, cached by a proxy, or framed. */
      "x-robots-tag": "noindex, nofollow",
    },
  });

/**
 * Compare without leaking the answer through timing.
 *
 * Probably over-careful for a single-reader admin page, but a plain `===`
 * on a secret is the kind of thing that gets copied into somewhere it
 * matters.
 */
function matches(given: string, expected: string): boolean {
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

function authorised(request: Request, env: Env): boolean {
  if (!env.ADMIN_KEY) return false;
  const header = request.headers.get("x-admin-key");
  const query = new URL(request.url).searchParams.get("key");
  const given = header ?? query;
  return typeof given === "string" && matches(given, env.ADMIN_KEY);
}

interface Row {
  id: number;
  created_at: string;
  kind: string;
  page: string | null;
  message: string;
  name: string | null;
  contact: string | null;
  credit: string | null;
  media: string | null;
  country: string | null;
  status: string | null;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!authorised(request, env)) {
    return json({ error: "Not authorised." }, 401);
  }
  if (!env.DB) {
    return json({ error: "No database is bound to this deployment." }, 503);
  }

  const url = new URL(request.url);
  /* Bounded, because this is read on a phone as often as not, and because
     an unbounded SELECT on a growing table is a slow page waiting to
     happen. */
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 100), 1), 500);

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, created_at, kind, page, message, name, contact, credit, media, country, status
         FROM suggestions
        ORDER BY created_at DESC
        LIMIT ?`,
    )
      .bind(limit)
      .all<Row>();

    const rows = results ?? [];
    /* A count of what is waiting, so the page can say "3 new" without
       counting client-side over a truncated list. */
    const pending = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM suggestions WHERE status IS NULL OR status = 'new'",
    ).first<{ n: number }>();

    return json({ rows, pending: pending?.n ?? 0, limit });
  } catch (error) {
    return json({ error: `Could not read the queue: ${String(error)}` }, 500);
  }
};
