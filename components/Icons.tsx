/**
 * The small set of icons the front page uses.
 *
 * Drawn inline rather than loaded from an icon font or a CDN: the site ships
 * a CSP that permits no third-party origins at all, and an icon that fails to
 * load is a hole in the card. Inline paths also take the current text colour,
 * so they follow the light and dark palettes without a second asset.
 *
 * Everything here is decorative — each one sits beside a heading that already
 * says what the card is — so they are marked aria-hidden and contribute no
 * text of their own.
 */

export type IconName = "facebook" | "wrench" | "book" | "history" | "portrait";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Paths({ name }: { name: IconName }) {
  switch (name) {
    /*
     * The Facebook mark, filled rather than stroked — the "f" only reads at
     * this size as a solid glyph.
     */
    case "facebook":
      return (
        <path
          fill="currentColor"
          d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z"
        />
      );

    case "wrench":
      return (
        <path
          {...STROKE}
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94L14.7 6.3Z"
        />
      );

    case "book":
      return (
        <>
          <path {...STROKE} d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path {...STROKE} d="M8 7h8M8 11h5" />
        </>
      );

    case "history":
      return (
        <>
          <path {...STROKE} d="M3 12a9 9 0 1 0 2.64-6.36L3 8" />
          <path {...STROKE} d="M3 3v5h5" />
          <path {...STROKE} d="M12 7v5l3.5 2" />
        </>
      );

    case "portrait":
      return (
        <>
          <circle {...STROKE} cx="12" cy="8" r="4" />
          <path {...STROKE} d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </>
      );
  }
}

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <Paths name={name} />
    </svg>
  );
}
