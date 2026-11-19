import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SAFE_MAILTO_LENGTH,
  SUGGESTIONS_EMAIL,
  SUGGESTION_KINDS,
  isTooLongToMail,
  kindSpec,
  suggestionBody,
  suggestionMailto,
  suggestionSubject,
  type SuggestionDraft,
} from "../lib/suggestions";

const draft: SuggestionDraft = {
  kind: "correction",
  page: "/cameras/h16rex5",
  message: "The introduction year is given as 1966; the manual says 1965.",
  name: "A Collector",
};

test("every kind has a distinct id and real guidance", () => {
  const ids = SUGGESTION_KINDS.map((k) => k.id);
  assert.equal(new Set(ids).size, ids.length, "ids must be unique");
  for (const k of SUGGESTION_KINDS) {
    assert.ok(k.label.length > 0 && k.blurb.length > 0 && k.prompt.length > 0);
    assert.equal(kindSpec(k.id), k, "kindSpec should resolve each id");
  }
});

test("an unknown kind is refused rather than silently defaulted", () => {
  // @ts-expect-error deliberately wrong, to prove it throws instead of
  // quietly composing an email labelled as the first kind in the list.
  assert.throws(() => kindSpec("nonsense"));
});

test("the subject names the kind and the page", () => {
  const s = suggestionSubject(draft);
  assert.match(s, /Bolex Collector/);
  assert.match(s, /\/cameras\/h16rex5/);
});

test("the subject omits the page when there is none", () => {
  const s = suggestionSubject({ kind: "knowledge", message: "x" });
  assert.doesNotMatch(s, /—\s*$/, "no empty dash should be left dangling");
});

test("the body carries the message and the context", () => {
  const b = suggestionBody(draft);
  assert.match(b, /manual says 1965/);
  assert.match(b, /Page: \/cameras\/h16rex5/);
  assert.match(b, /From: A Collector/);
  assert.doesNotMatch(b, /Credit as:/, "an absent field should not appear at all");
});

/*
 * The failure this guards against is silent: URLSearchParams encodes a space
 * as "+", which is correct in a query string and wrong in a mail body — the
 * recipient simply reads a message with every space replaced by a plus.
 */
test("the mailto encodes spaces as %20, never as +", () => {
  const url = suggestionMailto(draft);
  assert.ok(url.startsWith(`mailto:${SUGGESTIONS_EMAIL}?`));
  const body = url.split("&body=")[1] ?? "";
  assert.doesNotMatch(body, /\+/, "a plus in the body would be read as a literal plus");
  assert.match(body, /%20/);
  assert.match(decodeURIComponent(body), /The introduction year/);
});

test("newlines survive the round trip", () => {
  const url = suggestionMailto({ kind: "knowledge", message: "one\n\ntwo" });
  const body = decodeURIComponent(url.split("&body=")[1] ?? "");
  assert.match(body, /one\n\ntwo/);
});

/*
 * Long messages are the case where a mailto quietly loses the end of what
 * someone wrote. The form must know before it opens the mail app.
 */
test("an over-long draft is flagged rather than truncated", () => {
  assert.equal(isTooLongToMail(draft), false);
  const long = { ...draft, message: "x".repeat(SAFE_MAILTO_LENGTH + 100) };
  assert.equal(isTooLongToMail(long), true);
});

/*
 * The address is published on a public page, so it must be a role address on
 * the project's own domain — not a personal one, which cannot be filtered,
 * handed on or abandoned once harvesters have it.
 */
test("the published address is a role address on the project domain", () => {
  assert.match(SUGGESTIONS_EMAIL, /@bolexcollector\.org$/);
  assert.doesNotMatch(SUGGESTIONS_EMAIL, /gmail|hotmail|outlook|yahoo|icloud/i);
});
