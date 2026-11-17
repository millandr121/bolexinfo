"use client";

/**
 * The hero's primary button.
 *
 * It is a real anchor to the lookup card, so with no JavaScript it still
 * jumps there — which is the behaviour that matters on a phone, where the
 * card is stacked below the fold. With JavaScript it also puts the cursor in
 * the field, so on a desktop, where the card is already sitting beside the
 * button, pressing it does something visible rather than appearing to do
 * nothing at all.
 */
export function LookupCta({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="#identify"
      onClick={(e) => {
        const input = document.getElementById("serial-input");
        if (!(input instanceof HTMLInputElement)) return; // let the anchor do its job
        e.preventDefault();
        input.scrollIntoView({ block: "center", behavior: "smooth" });
        input.focus({ preventScroll: true });
      }}
      className="tap-target bg-[var(--accent)] text-[var(--bg)] px-6 text-[0.8rem] uppercase tracking-[0.08em] hover:bg-[var(--accent-soft)] transition-colors duration-200"
    >
      {children}
    </a>
  );
}
