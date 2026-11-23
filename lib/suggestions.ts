/**
 * The suggestion form's shape, and how a filled-in form becomes an email.
 *
 * Kept out of the component so the composition is testable without a
 * browser: getting a `mailto:` wrong fails silently — the mail app simply
 * opens with a mangled body — so it is worth asserting on.
 */

/**
 * Where suggestions go.
 *
 * A role address on the project's own domain, deliberately not a personal
 * one: this appears in a `mailto:` link on a public page, where address
 * harvesters will find it. A role address can be filtered, forwarded, handed
 * on, or abandoned if it is ever flooded; a personal address can do none of
 * those things once it is public.
 *
 * It must be set up to forward before this is any use. Cloudflare Email
 * Routing does it free on a domain already served by Cloudflare Pages.
 */
export const SUGGESTIONS_EMAIL = "suggestions@bolexcollector.org";

export type SuggestionKind = "correction" | "missing" | "media" | "knowledge";

export interface SuggestionKindSpec {
  readonly id: SuggestionKind;
  readonly label: string;
  /** Shown under the choice, so people pick the right one. */
  readonly blurb: string;
  /** Placeholder for the free-text box, which changes with the choice. */
  readonly prompt: string;
}

export const SUGGESTION_KINDS: readonly SuggestionKindSpec[] = [
  {
    id: "correction",
    label: "Something here is wrong",
    blurb: "A wrong date, specification, model name or description.",
    prompt:
      "What does the page say, and what should it say? If you know where the correct figure comes from, a manual, a catalogue, the camera in your hands, say so, as that is what lets it be checked.",
  },
  {
    id: "missing",
    label: "Something is missing",
    blurb: "A model, variant or accessory Bolex made that is not here yet.",
    prompt:
      "What is it called, what gauge, roughly what years? Anything you know about it helps, even if it is incomplete.",
  },
  {
    id: "media",
    label: "I have photographs or documents",
    blurb: "Photographs, manuals, brochures, advertising, memorabilia.",
    prompt:
      "What do you have? Attach anything you like to the email this opens. Tell us how you would like to be credited, because this site names its sources.",
  },
  {
    id: "knowledge",
    label: "I know something about these cameras",
    blurb: "Repair experience, history, how one of these actually behaves.",
    prompt:
      "Tell it however you like. First-hand knowledge of these machines is the hardest thing to find and the most worth keeping.",
  },
] as const;

export function kindSpec(id: SuggestionKind): SuggestionKindSpec {
  const found = SUGGESTION_KINDS.find((k) => k.id === id);
  if (!found) throw new Error(`unknown suggestion kind: ${id}`);
  return found;
}

export interface SuggestionDraft {
  kind: SuggestionKind;
  /** Which page it concerns. Optional: not every suggestion has one. */
  page?: string;
  message: string;
  /** Optional, and said to be optional on the form. */
  name?: string;
  credit?: string;
}

/** What lands in the subject line, so a full inbox stays sortable. */
export function suggestionSubject(draft: SuggestionDraft): string {
  const spec = kindSpec(draft.kind);
  const where = draft.page ? `: ${draft.page}` : "";
  return `Bolex Collector: ${spec.label.toLowerCase()}${where}`;
}

export function suggestionBody(draft: SuggestionDraft): string {
  const lines: string[] = [draft.message.trim(), ""];
  if (draft.page) lines.push(`Page: ${draft.page}`);
  if (draft.name) lines.push(`From: ${draft.name}`);
  if (draft.credit) lines.push(`Credit as: ${draft.credit}`);
  lines.push(`Kind: ${kindSpec(draft.kind).label}`);
  return lines.join("\n");
}

/**
 * The `mailto:` the form opens.
 *
 * `encodeURIComponent` rather than `URLSearchParams`, which encodes a space
 * as `+`. In a query string that is correct; in a mail body it is not, and
 * the recipient reads a message with every space replaced by a plus sign.
 */
export function suggestionMailto(draft: SuggestionDraft, to = SUGGESTIONS_EMAIL): string {
  const subject = encodeURIComponent(suggestionSubject(draft));
  const body = encodeURIComponent(suggestionBody(draft));
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

/**
 * Some mail clients, and some operating systems handing a URL to one, drop
 * everything past a few thousand characters without saying so. Warning while
 * the message is still on screen is far better than a silent truncation the
 * sender never sees.
 */
export const SAFE_MAILTO_LENGTH = 1900;

export function isTooLongToMail(draft: SuggestionDraft): boolean {
  return suggestionMailto(draft).length > SAFE_MAILTO_LENGTH;
}
