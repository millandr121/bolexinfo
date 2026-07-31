import type { ContentBlock } from "@/lib/recovered";

/**
 * Renders the ordered blocks of a recovered page — the author's own prose,
 * headings and inline photographs, in their original sequence.
 *
 * `treatment` decides how images are presented: product photography is
 * multiplied against a warm plate so its white studio background dissolves
 * into the page, while document scans (period advertising, catalogues) are
 * framed, because their aged paper is part of the artefact.
 */
export function RecoveredContent({
  blocks,
  treatment = "product",
}: {
  blocks: ContentBlock[];
  treatment?: "product" | "document";
}) {
  if (blocks.length === 0) return null;

  return (
    <div className="prose-archive mt-8">
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          return (
            <h2 key={`h-${i}`} className="font-[family-name:var(--font-display)]">
              {block.text}
            </h2>
          );
        }
        if (block.kind === "paragraph") {
          return <p key={`p-${i}`}>{block.text}</p>;
        }
        return (
          <figure key={block.src} className="not-prose my-7">
            <div className={treatment === "product" ? "plate inline-block p-3" : "document inline-block p-2"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.src}
                alt={block.alt || ""}
                loading="lazy"
                className="max-w-full h-auto"
              />
            </div>
            {block.alt && (
              <figcaption className="mt-2 font-[family-name:var(--font-mono)] text-xs text-[var(--fg-soft)]">
                {block.alt}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
