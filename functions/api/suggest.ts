/**
 * Receives suggestions from /suggest and stores them.
 *
 * A Cloudflare Pages Function, so it runs on the same origin as the static
 * site — no third party sees a reader's correction, and nothing has to be
 * allowed through a content policy.
 *
 * Two bindings, configured on the Pages project:
 *   DB            — D1 database, required. Schema in db/schema.sql.
 *   SUGGESTIONS_MEDIA — R2 bucket, optional. Without it the form is told not
 *                       to offer file uploads, rather than accepting files
 *                       and quietly dropping them.
 */

interface Env {
  DB?: D1Database;
  SUGGESTIONS_MEDIA?: R2Bucket;
}

const KINDS = ["correction", "missing", "media", "knowledge"] as const;
type Kind = (typeof KINDS)[number];

/* Generous enough for a long account of a repair, short enough that a single
   request cannot fill the database. */
const LIMITS = {
  message: 20_000,
  short: 400,
  files: 8,
  fileBytes: 12 * 1024 * 1024,
} as const;

/* Per sender, so one person cannot flood the queue; high enough that a
   genuine contributor sending several corrections in a sitting is unaffected. */
const RATE = { max: 6, windowMinutes: 30 } as const;

const ALLOWED_MEDIA = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/tiff", "application/pdf",
]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

/* `FormDataEntryValue` is a DOM type and does not exist in the Workers
   runtime; there, a form entry is a string or a File. */
function clean(value: string | File | null, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function extensionFor(type: string): string {
  return (
    { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/tiff": "tif", "application/pdf": "pdf" }[type] ?? "bin"
  );
}

/**
 * Who is sending, for rate limiting only.
 *
 * Cloudflare's own connecting-IP header, hashed. Storing the hash rather
 * than the address means the table cannot be turned into a log of who read
 * what, while still answering the only question it is for: has this sender
 * been here six times in the last half hour?
 */
async function fingerprint(request: Request): Promise<string> {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const bytes = new TextEncoder().encode(`bolex-suggest:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].slice(0, 16).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * What the box can actually do, so the form can ask rather than assume.
 *
 * `ready` means a suggestion sent right now would be stored — which takes
 * more than a binding. A database can be bound and still have no tables in
 * it, and that was worth getting right: reporting ready on the binding alone
 * told the sender their correction would be kept, then lost it to a generic
 * server error. The table is checked, not the binding.
 */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  let ready = false;
  let reason: string | undefined;

  if (!env.DB) {
    reason = "no-binding";
  } else {
    try {
      await env.DB.prepare("SELECT 1 FROM suggestions LIMIT 1").all();
      ready = true;
    } catch {
      reason = "no-schema";
    }
  }

  return json({
    ready,
    reason,
    media: Boolean(env.SUGGESTIONS_MEDIA),
    maxFileBytes: LIMITS.fileBytes,
    maxFiles: LIMITS.files,
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) {
    return json(
      { error: "The suggestion box is not connected to its database yet." },
      503,
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "That did not arrive as a form." }, 400);
  }

  /* A field no person can see and no person fills in. A bot that fills
     every input gives itself away here. */
  if (clean(form.get("website"), 10)) return json({ ok: true, id: "ignored" });

  const kindRaw = clean(form.get("kind"), 32);
  const kind = (KINDS as readonly string[]).includes(kindRaw ?? "") ? (kindRaw as Kind) : undefined;
  const message = clean(form.get("message"), LIMITS.message);

  if (!kind) return json({ error: "Pick what kind of suggestion this is." }, 400);
  if (!message) return json({ error: "The message is empty." }, 400);

  const who = await fingerprint(request);
  const since = new Date(Date.now() - RATE.windowMinutes * 60_000).toISOString();
  try {
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM submission_rate WHERE fingerprint = ? AND at > ?",
    )
      .bind(who, since)
      .first<{ n: number }>();
    if ((recent?.n ?? 0) >= RATE.max) {
      return json(
        { error: "That is several suggestions in a short time. Please try again shortly." },
        429,
      );
    }
  } catch {
    /* A rate-limit table that is missing or unreadable must not stop a
       genuine suggestion being received. Losing a correction is the worse
       failure of the two. */
  }

  // Attachments, if the bucket exists. Anything rejected is reported rather
  // than silently dropped, so nobody believes a photograph was received.
  const stored: string[] = [];
  const rejected: string[] = [];
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length && env.SUGGESTIONS_MEDIA) {
    for (const file of files.slice(0, LIMITS.files)) {
      if (!ALLOWED_MEDIA.has(file.type)) {
        rejected.push(`${file.name} (${file.type || "unknown type"})`);
        continue;
      }
      if (file.size > LIMITS.fileBytes) {
        rejected.push(`${file.name} (too large)`);
        continue;
      }
      const key = `suggestions/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extensionFor(file.type)}`;
      try {
        await env.SUGGESTIONS_MEDIA.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
          customMetadata: { originalName: file.name.slice(0, 200) },
        });
        stored.push(key);
      } catch {
        rejected.push(`${file.name} (could not be stored)`);
      }
    }
  } else if (files.length) {
    for (const file of files) rejected.push(`${file.name} (uploads are not set up)`);
  }

  const id = crypto.randomUUID();
  try {
    await env.DB.prepare(
      `INSERT INTO suggestions
        (id, created_at, kind, page, message, name, contact, credit, media, country, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        new Date().toISOString(),
        kind,
        clean(form.get("page"), LIMITS.short) ?? null,
        message,
        clean(form.get("name"), LIMITS.short) ?? null,
        clean(form.get("contact"), LIMITS.short) ?? null,
        clean(form.get("credit"), LIMITS.short) ?? null,
        stored.length ? JSON.stringify(stored) : null,
        request.headers.get("cf-ipcountry"),
        request.headers.get("user-agent")?.slice(0, 400) ?? null,
      )
      .run();
  } catch (cause) {
    /* "no such table" is a setup fault, not a passing failure, and telling
       someone to "try again" would send them round the same wall. */
    const missing = String(cause).includes("no such table");
    return json(
      {
        error: missing
          ? "The suggestion box is not finished being set up — its database has no tables yet."
          : "The suggestion could not be saved. Nothing was lost on your side — please try again.",
      },
      missing ? 503 : 500,
    );
  }

  try {
    await env.DB.batch([
      env.DB.prepare("INSERT INTO submission_rate (fingerprint, at) VALUES (?, ?)").bind(who, new Date().toISOString()),
      env.DB.prepare("DELETE FROM submission_rate WHERE at < ?").bind(since),
    ]);
  } catch {
    /* Bookkeeping only; the suggestion is already safely stored. */
  }

  return json({ ok: true, id, stored: stored.length, rejected });
};
