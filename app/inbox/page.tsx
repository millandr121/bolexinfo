import type { Metadata } from "next";
import { SuggestionInbox } from "@/components/SuggestionInbox";

/**
 * The queue of what readers have sent in.
 *
 * Not in the navigation, and told not to be indexed. It is not secret in the
 * sense that matters — the page itself holds nothing, and the endpoint
 * behind it refuses without the key — but there is no reason for it to turn
 * up in a search for Bolex accessories either.
 */
export const metadata: Metadata = {
  title: "Inbox",
  robots: { index: false, follow: false },
};

export default function InboxPage() {
  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-[560] tracking-tight">
        Inbox
      </h1>
      <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
        What readers have sent through the suggestion form, newest first.
      </p>
      <SuggestionInbox />
    </div>
  );
}
