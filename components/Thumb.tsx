/**
 * A small product thumbnail for an index list.
 *
 * The point of these is recognition, not decoration: someone holding a camera
 * often cannot tell a Rex 4 from a Rex 5 by name, but can tell them apart by
 * looking. A list of names alone makes them open pages until one matches.
 *
 * Uses the same `.plate` treatment as the object pages. Most archived product
 * shots were taken on white, and white multiplied against the warm plate *is*
 * the plate — so the subject reads as if it were cut out, with no hard white
 * box sitting on the paper. The ones that were not shot on white simply look
 * like photographs on a warm card, which is also fine. In dark mode the plate
 * stays light on purpose: these are dark metal bodies, and dropping them onto
 * a dark ground would erase them.
 *
 * The alt text is empty by design. Every one of these sits immediately beside
 * the model's name in the same link, so describing the picture as well would
 * make a screen reader announce the same thing twice.
 */
export function Thumb({
  src,
  className = "",
  size = "md",
  cutout = false,
}: {
  src?: string;
  className?: string;
  size?: "md" | "lg";
  /** True when the image already has an alpha channel, so skip the multiply. */
  cutout?: boolean;
}) {
  const box = size === "lg" ? "h-20 w-20" : "h-14 w-14 sm:h-16 sm:w-16";

  /*
   * No image is a real state — one camera page (the H-9) was recovered
   * without one. It keeps an empty tile rather than collapsing, so the names
   * in a column stay on the same left edge instead of one row jumping out of
   * alignment.
   */
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={`${box} ${className} shrink-0 border border-dashed border-[var(--line)] bg-[var(--bg-raised)]`}
      />
    );
  }

  return (
    <div className={`plate ${box} ${className} shrink-0 border border-[var(--line)] p-1`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" decoding="async" className={`h-full w-full object-contain${cutout ? " cutout" : ""}`} />
    </div>
  );
}
