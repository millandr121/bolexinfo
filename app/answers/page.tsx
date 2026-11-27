import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { AnswersSearch } from "@/components/AnswersSearch";
import { FACEBOOK_GROUP_URL } from "@/lib/community";

export const metadata: Metadata = {
  title: "Answers",
  description:
    "Search what Bolex owners worked out between them: short quotations from the cinematography.com Bolex forum and from Reddit, each one named, dated and linked back to where it was written.",
};

/**
 * What people worked out.
 *
 * The rest of this site is about objects. This is the other half of
 * knowing how to use one, and it was never written down anywhere
 * durable: it is in forum threads from 2008 that load behind a
 * challenge page now, and in Reddit posts that are already hard to
 * find a year later.
 *
 * So the archive harvested two corpora and this is the way in. A
 * search returns short quotations, each with the name of whoever
 * wrote it, the date, and a link to the thread it came from. It never
 * returns a page of its own holding somebody's whole post, and there
 * is no route on this site that does: the index is built with the
 * quotations already cut short, so the wrong thing is not available
 * to build rather than merely discouraged. See
 * scripts/build-answers-index.ts.
 *
 * What this deliberately is not: an answer. The page does not
 * summarise, rank by confidence or put words in anybody's mouth. Two
 * of these people will often disagree, and showing both, named, is
 * more use than a confident paragraph that is wrong.
 */
export default function AnswersPage() {
  return (
    <div className="pt-14 pb-16">
      <Reveal>
        <p className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.2em] text-[var(--accent)]">
          Searching two forums
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-[560] tracking-tight sm:text-5xl">
          What people worked out
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-[var(--fg-soft)]">
          Describe your problem in your own words.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 max-w-3xl">
          <AnswersSearch />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <section className="rule mt-16 max-w-2xl pt-5">
          <h2 className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em] text-[var(--fg-soft)]">
            Whose words these are
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
            Not this archive&rsquo;s. Every passage was written by somebody else, on{" "}
            <a
              href="https://cinematography.com/index.php?/forums/forum/78-bolex/"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              the Bolex forum at cinematography.com
            </a>{" "}
            or on Reddit, and is shown here as a short quotation with their name, the date,
            and a link to the thread it came from. Nothing is edited, summarised or
            rewritten, and no page here reproduces a whole post. If you wrote something
            quoted here and would rather it were not,{" "}
            <Link href="/suggest" className="text-[var(--accent)] underline underline-offset-4">
              say so and it comes out
            </Link>
            .
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
            The reason for collecting it at all is that it is going. A third of the forum
            threads the archive found now exist only as titles, and the forum itself is
            hard to reach without getting past a challenge page. This does not replace
            either place; it is a way of finding what is in them, and every result is a
            door back to the original.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">
            For a question nobody has answered yet, the{" "}
            <a
              href={FACEBOOK_GROUP_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Bolex group on Facebook
            </a>{" "}
            is busy most days, and{" "}
            <Link href="/technicians" className="text-[var(--accent)] underline underline-offset-4">
              a technician
            </Link>{" "}
            is the answer to a good many of them.
          </p>
        </section>
      </Reveal>
    </div>
  );
}
