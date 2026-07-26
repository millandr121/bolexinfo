import { POLITENESS } from "./config";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class PolicyDeniedError extends Error {
  constructor(url: string) {
    super(
      `Egress policy denied access to ${new URL(url).host}. ` +
        `Add the host to the environment's network egress allowlist, or run the ` +
        `pipeline from a network-enabled environment (see docs/PIPELINE.md).`,
    );
    this.name = "PolicyDeniedError";
  }
}

/**
 * Fetch with retry + exponential backoff and a politeness delay, tuned for
 * archive.org's rate limits. A CONNECT-level 403 from a corporate egress
 * proxy is surfaced as PolicyDeniedError immediately — retrying a policy
 * denial is pointless and impolite.
 */
export async function politeFetch(url: string, init?: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= POLITENESS.retries; attempt++) {
    if (attempt > 0) await sleep(POLITENESS.backoffBaseMs * 2 ** (attempt - 1));
    const timeoutController = new AbortController();
    const timeout = setTimeout(() => timeoutController.abort(), POLITENESS.requestTimeoutMs);
    try {
      const res = await fetch(url, {
        ...init,
        signal: timeoutController.signal,
        headers: {
          "user-agent":
            "bolexcollector-preservation/1.0 (+https://github.com/millandr121/bolexinfo; archival mirror with owner permission)",
          ...init?.headers,
        },
      });
      // A 403 from an egress gateway (rather than the archive itself) is a
      // policy denial — detect it by body and fail fast with guidance.
      if (res.status === 403) {
        const body = await res.clone().text();
        if (/allowlist|egress|network policy|proxy/i.test(body)) throw new PolicyDeniedError(url);
      }
      // 429/5xx are retryable; anything else returns to the caller.
      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`HTTP ${res.status} for ${url}`);
        continue;
      }
      await sleep(POLITENESS.delayMs);
      return res;
    } catch (err) {
      if (err instanceof PolicyDeniedError) throw err;
      if (err instanceof Error && err.name === "AbortError") {
        lastError = new Error(`Timed out after ${POLITENESS.requestTimeoutMs}ms fetching ${url}`);
        continue;
      }
      const message = err instanceof Error ? String(err.cause ?? err.message) : String(err);
      if (/CONNECT.*403|tunnel.*403|proxy.*403/i.test(message)) throw new PolicyDeniedError(url);
      lastError = err;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`Failed to fetch ${url}`);
}

/** Fetch JSON with the same retry semantics. */
export async function fetchJson<T>(url: string): Promise<T> {
  const res = await politeFetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return (await res.json()) as T;
}

/** Fetch a body as text, tolerating the Latin-1 encodings common on 2000s sites. */
export async function fetchText(url: string): Promise<{ status: number; text: string }> {
  const res = await politeFetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "";
  const charsetMatch = /charset=([\w-]+)/i.exec(contentType);
  const charset = (charsetMatch?.[1] ?? "utf-8").toLowerCase();
  const decoder = new TextDecoder(charset === "iso-8859-1" ? "latin1" : charset, { fatal: false });
  return { status: res.status, text: decoder.decode(buf) };
}
