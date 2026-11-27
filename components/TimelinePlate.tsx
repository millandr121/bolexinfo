import Link from "next/link";
import type { Plate } from "@/lib/scenes";

/**
 * A photograph given the whole screen.
 *
 * The chronology's entry panels lay a camera behind a paragraph, which
 * is right for a sentence about a camera and wrong for everything else:
 * half this page is company history, and a cut-out product on cream
 * paper has nothing to say about a merger or a decade. A plate is the
 * other move. It holds the screen on its own, edge to edge, with a
 * chapter title over it or nothing at all, and then gets out of the way.
 *
 * Three things keep it honest rather than decorative:
 *
 *  - It is captioned, visibly, with what it is, when the document says
 *    so, and who to credit. A photograph with a caption is a document;
 *    the same photograph without one is set dressing.
 *  - It never sits against a dated entry, only over a chapter or
 *    between them, so it is never standing in as evidence for a year.
 *  - The credit links to where the original can be seen.
 *
 * The movement is driven by `--lit`, which the cinema layer already
 * paints on every beat from its distance to the focal line. The picture
 * is a little larger and a little dimmer while it is away and settles
 * as it arrives, so the motion is tied to the reader's own scrolling
 * and reverses when they scroll back. Nothing here runs on a timer.
 */
export function TimelinePlate({
  plate,
  children,
  height = "full",
}: {
  plate: Plate;
  /** A chapter title to set over it; omitted, the photograph stands alone. */
  children?: React.ReactNode;
  height?: "full" | "tall";
}) {
  const external = plate.href.startsWith("http");
  return (
    <section data-beat className={`timeline-plate timeline-plate--${height}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="timeline-plate__image"
        src={plate.src}
        alt={plate.alt}
        loading="lazy"
        decoding="async"
      />
      <div className="timeline-plate__scrim" aria-hidden="true" />

      <div className="timeline-plate__body">
        {children}

        <p className="timeline-plate__caption">
          <span className="timeline-plate__title">{plate.title}</span>
          {plate.when && <span className="timeline-plate__when">{plate.when}</span>}
          {external ? (
            <a href={plate.href} target="_blank" rel="noreferrer">
              {plate.credit}
            </a>
          ) : (
            <Link href={plate.href}>{plate.credit}</Link>
          )}
        </p>
      </div>
    </section>
  );
}
