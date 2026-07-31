import { SUPPORT } from "@/lib/support";

/**
 * Carries forward the modest "buy me a cup of coffee" gesture from the
 * original site — redirected, in Michael Tisdale's spirit, toward the people
 * still making films on cameras like these.
 *
 * Deliberately a plain outbound link: no script, no embed, no tracking. The
 * donation goes directly to the organization's own PayPal, so this archive
 * never touches the money.
 */
export function SupportCallout() {
  return (
    <section
      aria-labelledby="support-heading"
      className="mt-14 border border-[var(--line)] bg-[var(--bg-raised)] p-7 sm:p-9"
    >
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
        In his spirit
      </p>
      <h2
        id="support-heading"
        className="mt-4 font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-[560] leading-snug"
      >
        Buy a roll of film for a rural filmmaker.
      </h2>
      <p className="mt-4 leading-relaxed text-[var(--fg-soft)] max-w-xl">
        The original site kept a small invitation to buy its author a cup of coffee. This
        edition points that same gesture somewhere fitting: {SUPPORT.organization},{" "}
        {SUPPORT.purpose}. These cameras were built for people making films far from any
        studio &mdash; this helps keep them running.
      </p>

      <a
        href={SUPPORT.donateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-7 inline-block border border-[var(--fg)] px-6 py-3 text-sm uppercase tracking-[0.12em] hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors duration-200"
      >
        Donate via PayPal ↗
      </a>

      <p className="mt-5 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--fg-soft)] max-w-xl">
        Donations go directly to {SUPPORT.organization} through their own PayPal account.
        This archive collects nothing, holds nothing, and takes no cut.
      </p>
    </section>
  );
}
