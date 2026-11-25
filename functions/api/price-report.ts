/**
 * What people paid, taken in and given back out.
 *
 * POST  /api/price-report            — someone reports a sale
 * GET   /api/price-report?slug=…     — the approved reports for one item
 *
 * Two rules shape this whole file.
 *
 * Nothing is published unmoderated. An archive whose argument is that
 * every figure is cited cannot start printing medians of whatever
 * strangers typed, and one mistyped zero would poison an average for
 * years. Reports land as `new` and only approved ones are ever read
 * back out.
 *
 * Nothing is converted between currencies. Rates move, and a figure the
 * archive converted on the day it arrived would quietly rot. Reports are
 * kept in the currency they happened in and only ever compared with
 * others in the same one.
 */

interface Env {
  DB?: D1Database;
  ADMIN_KEY?: string;
}

const CONDITIONS = ["broken", "as-is", "fair", "good", "excellent", "serviced"] as const;
const VENUES = ["ebay", "facebook", "shop", "auction", "private", "other"] as const;
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY"] as const;
const SECTIONS = ["cameras", "projectors", "lenses", "accessories"] as const;
const SIDES = ["bought", "sold"] as const;

/* Generous at both ends, because a lens cap really did cost a dollar and
   a boxed EL really does fetch five figures. The job of these bounds is
   only to catch a typed-in phone number. */
const LIMITS = { min: 0.5, max: 100_000, notes: 2_000, short: 200 } as const;

/* Per sender. Someone cataloguing a shelf of equipment might file six or
   seven in a sitting, and should be able to. */
const RATE = { max: 12, windowMinutes: 60 } as const;

/**
 * How many approved reports an item needs before any figure is shown.
 *
 * Two is not a market, but it is enough to say "two people reported
 * this" honestly with both numbers visible. One is an anecdote wearing
 * the clothes of a statistic, so one shows nothing.
 */
const MIN_TO_SHOW = 2;

const json = (body: unknown, status = 200, cache = "no-store") =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": cache },
  });

/* `FormDataEntryValue` is a DOM type and does not exist in the Workers
   runtime; there, a form entry is a string or a File. */
function clean(value: string | File | null, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

function oneOf<T extends readonly string[]>(
  value: string | undefined,
  allowed: T,
): T[number] | undefined {
  return value && (allowed as readonly string[]).includes(value) ? (value as T[number]) : undefined;
}

/** A coarse sender fingerprint for rate limiting. Never stored as an address. */
async function fingerprint(request: Request): Promise<string> {
  const raw = `${request.headers.get("cf-connecting-ip") ?? ""}|${request.headers.get("user-agent") ?? ""}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ————————————————————————————————————————————————————————————
// Taking one in
// ————————————————————————————————————————————————————————————

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) {
    return json({ error: "Price reports are not connected to a database yet." }, 503);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "That did not arrive as a form." }, 400);
  }

  /*
   * Three cheap gates before anything is read, in rising order of how
   * often they are wrong.
   *
   * All of them answer `ok` rather than an error. A bot told exactly
   * which check it failed is a bot that is one edit from passing, and
   * nobody legitimate ever sees these.
   */

  /* One: a field no person sees. A filler that completes every input
     gives itself away. */
  if (clean(form.get("website"), 10)) return json({ ok: true });

  /* Two: where it was posted from. A browser sends Origin on a form
     post to its own site, so a mismatch is a submission from somewhere
     that is not this site. A missing Origin is allowed through, because
     some privacy tooling strips it and a reader should not be punished
     for that. */
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return json({ ok: true });
  }

  /* Three: how long the form was open. The field is stamped when the
     form renders, so the gap is how long somebody spent filling it in.
     Under three seconds is not a person choosing a condition from a
     list; a day old is a stale tab, or a replayed capture. */
  const openedAt = Number(clean(form.get("opened"), 20) ?? "");
  if (Number.isFinite(openedAt) && openedAt > 0) {
    const elapsed = Date.now() - openedAt;
    if (elapsed < 3_000 || elapsed > 86_400_000) return json({ ok: true });
  }

  const slug = clean(form.get("slug"), 120);
  const section = oneOf(clean(form.get("section"), 20), SECTIONS);
  const condition = oneOf(clean(form.get("condition"), 20), CONDITIONS);
  const currency = oneOf(clean(form.get("currency"), 8), CURRENCIES) ?? "USD";
  const venue = oneOf(clean(form.get("venue"), 20), VENUES);
  const side = oneOf(clean(form.get("side"), 10), SIDES) ?? "bought";

  if (!slug || !section) return json({ error: "That form lost track of which item it is for." }, 400);
  if (!condition) return json({ error: "Please say what condition it was in." }, 400);

  const amount = Number((clean(form.get("amount"), 20) ?? "").replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(amount) || amount < LIMITS.min || amount > LIMITS.max) {
    return json({ error: "That price does not look like a price." }, 400);
  }

  /* "2024-07" or nothing. A year alone is accepted and stored as its
     January, because most people remember the year and guess the month. */
  const soldRaw = clean(form.get("sold_on"), 10);
  let soldOn: string | undefined;
  if (soldRaw) {
    const m = /^(\d{4})(?:-(\d{2}))?$/.exec(soldRaw);
    const year = m ? Number(m[1]) : NaN;
    if (!m || year < 1960 || year > new Date().getFullYear() + 1) {
      return json({ error: "That date does not look right. Use a year, or a year and month." }, 400);
    }
    soldOn = m[2] ? `${m[1]}-${m[2]}` : `${m[1]}-01`;
  }

  const who = await fingerprint(request);
  const since = new Date(Date.now() - RATE.windowMinutes * 60_000).toISOString();
  try {
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM submission_rate WHERE fingerprint = ? AND at > ?",
    )
      .bind(who, since)
      .first<{ n: number }>();
    if ((recent?.n ?? 0) >= RATE.max) {
      return json({ error: "That is a lot of reports in an hour. Please come back shortly." }, 429);
    }
  } catch {
    /* A missing rate-limit table must not stop a genuine report. Losing
       one is the worse failure of the two. */
  }

  const now = new Date().toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO price_reports
         (id, created_at, slug, section, amount, currency, sold_on, condition,
          venue, side, notes, name, contact, country, user_agent, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'new')`,
    )
      .bind(
        crypto.randomUUID(),
        now,
        slug,
        section,
        amount,
        currency,
        soldOn ?? null,
        condition,
        venue ?? null,
        side,
        clean(form.get("notes"), LIMITS.notes) ?? null,
        clean(form.get("name"), LIMITS.short) ?? null,
        clean(form.get("contact"), LIMITS.short) ?? null,
        (request as { cf?: { country?: string } }).cf?.country ?? null,
        (request.headers.get("user-agent") ?? "").slice(0, 300) || null,
      )
      .run();
  } catch (error) {
    return json({ error: `Could not record that: ${String(error)}` }, 500);
  }

  try {
    await env.DB.prepare("INSERT INTO submission_rate (fingerprint, at) VALUES (?, ?)")
      .bind(who, now)
      .run();
  } catch {
    /* Same again: the report is already safely in. */
  }

  return json({
    ok: true,
    message:
      "Thank you. It is in the queue and will appear once it has been looked over, which is how every figure on this site works.",
  });
};

// ————————————————————————————————————————————————————————————
// Giving them back
// ————————————————————————————————————————————————————————————

interface Row {
  amount: number;
  currency: string;
  condition: string;
  venue: string | null;
  sold_on: string | null;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function summarise(rows: Row[]) {
  const amounts = rows.map((r) => r.amount);
  const dates = rows.map((r) => r.sold_on).filter((d): d is string => Boolean(d)).sort();
  return {
    n: rows.length,
    median: Math.round(median(amounts) * 100) / 100,
    low: Math.min(...amounts),
    high: Math.max(...amounts),
    from: dates[0] ?? null,
    to: dates[dates.length - 1] ?? null,
  };
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return json({ error: "No item given." }, 400);
  if (!env.DB) return json({ groups: [], total: 0, minToShow: MIN_TO_SHOW });

  let rows: Row[] = [];
  try {
    const result = await env.DB.prepare(
      `SELECT amount, currency, condition, venue, sold_on
         FROM price_reports
        WHERE slug = ? AND status = 'approved'`,
    )
      .bind(slug)
      .all<Row>();
    rows = result.results ?? [];
  } catch {
    /* No table yet, or it cannot be read. An item page that cannot show
       reports should show none, not an error. */
    return json({ groups: [], total: 0, minToShow: MIN_TO_SHOW });
  }

  /*
   * Grouped by currency and never across it. Two sales in dollars and
   * one in euros are two sales and one sale, not three.
   */
  const byCurrency = new Map<string, Row[]>();
  for (const row of rows) {
    const list = byCurrency.get(row.currency) ?? [];
    list.push(row);
    byCurrency.set(row.currency, list);
  }

  const groups = [...byCurrency.entries()]
    .filter(([, list]) => list.length >= MIN_TO_SHOW)
    .map(([currency, list]) => ({
      currency,
      ...summarise(list),
      /* Broken out by condition only where a band has enough of its own
         to be worth separating. Below that the overall figure is the
         honest one. */
      byCondition: [...new Set(list.map((r) => r.condition))]
        .map((condition) => ({
          condition,
          ...summarise(list.filter((r) => r.condition === condition)),
        }))
        .filter((g) => g.n >= MIN_TO_SHOW),
    }))
    .sort((a, b) => b.n - a.n);

  /* Cached briefly at the edge: these move slowly and an item page
     should not wait on the database to render its own numbers. */
  return json(
    { groups, total: rows.length, minToShow: MIN_TO_SHOW },
    200,
    "public, max-age=300",
  );
};
