import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { COMMUNITY_LINKS } from "@/lib/community";

export const metadata: Metadata = {
  title: "What one is worth",
  description:
    "How to work out what a Bolex is actually worth: read sold listings rather than asking prices, why auctions give fairer figures, and where collectors trade.",
};

/**
 * How to value a Bolex, when the archive cannot do it for you.
 *
 * This page exists because the honest answer to "what is mine worth" is
 * a method rather than a number. Condition decides most of it, no
 * public record of second-hand prices exists for this equipment, and
 * the one place everybody looks — eBay's asking prices — is the most
 * misleading number on the internet for old cameras.
 *
 * Written from what collectors who actually trade this gear report,
 * not from a pricing model. Where it gives a rule of thumb it says it
 * is one.
 */
export default function WorthPage() {
  return (
    <div className="pt-14 pb-8 max-w-3xl">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-[560] tracking-tight">
          What one is worth
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">
          This archive can tell you what Paillard charged for a thing when it was new, and it
          cannot tell you what yours is worth now. Nobody can, from a page: condition decides
          most of it, and there is no public record of what this equipment actually trades for.
          What follows is how to find out for yourself, in the order the answers are worth
          having.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="mt-12" aria-labelledby="sold">
          <h2
            id="sold"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            1. Read sold listings, never asking prices
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--fg-soft)]">
            <p>
              <span className="text-[var(--fg)]">
                This is the single most important habit, and almost nobody does it.
              </span>{" "}
              eBay is full of Bolex gear priced far above anything that ever sells, sitting
              unsold for years and relisted forever. Those numbers are what a hopeful seller
              wants, not what anyone paid, and averaging them will tell you your camera is
              worth two or three times what it is.
            </p>
            <p>On eBay, the filter you want is buried but free:</p>
            <ol className="space-y-2 pl-5">
              <li className="list-decimal">
                Search for the model, then open{" "}
                <span className="text-[var(--fg)]">Filter</span> or scroll the left-hand
                sidebar.
              </li>
              <li className="list-decimal">
                Tick <span className="text-[var(--fg)]">Sold items</span>. Completed items
                shows unsold ones too, which is not what you want.
              </li>
              <li className="list-decimal">
                Sort by most recent, and ignore anything that is obviously a different model,
                a lot of mixed gear, or a parts camera unless that is what you have.
              </li>
            </ol>
            <p>
              That gives roughly the last ninety days. If you sell on eBay at all, your{" "}
              <span className="text-[var(--fg)]">Seller Hub has a Research tab</span> — the
              tool that used to be sold separately as Terapeak, which eBay bought and folded
              in. It is free, and it reaches back about three years instead of ninety days,
              which for equipment that sells a few times a month is the difference between a
              figure and a guess.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="mt-12" aria-labelledby="auctions">
          <h2
            id="auctions"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            2. Auction results are the fairest figures
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--fg-soft)]">
            An auction price is what two or more people who both wanted the thing were willing
            to pay on the day, with no seller&rsquo;s wishful thinking in it. That makes
            auction results the closest thing to a true market value this equipment has. They
            run lower than a dealer&rsquo;s price and higher than a car-boot find, and if you
            only look at one kind of number, look at these. Camera-specialist auction houses
            publish past results, and eBay listings that ran as real auctions rather than
            fixed price are the same thing in miniature.
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="mt-12" aria-labelledby="community">
          <h2
            id="community"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            3. Ask the people who actually trade them
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--fg-soft)]">
            <p>
              After sold listings and auctions, the collectors themselves are the best source,
              and for some things they are the only one. A great deal of Bolex equipment never
              touches eBay at all: it changes hands inside the user groups, between people who
              know what they are looking at.
            </p>
            <p>
              <span className="text-[var(--fg)]">Those groups also keep prices honest.</span>{" "}
              Post something at a silly number and somebody will say so, kindly or otherwise,
              and post something underpriced and somebody will tell you that too. It is a
              market with its own referees, which is more than can be said for a search results
              page.
            </p>
            <ul className="mt-2 space-y-2">
              {COMMUNITY_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer nofollow"
                    className="text-[var(--accent)] underline underline-offset-4"
                  >
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="mt-12" aria-labelledby="marketplace">
          <h2
            id="marketplace"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            4. Marketplace is luck, and where the bargains are
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--fg-soft)]">
            Facebook Marketplace and the local classifieds are the worst place to find a price
            and the best place to find a deal. Sellers there are usually clearing a house
            rather than trading cameras, so a working H-16 can appear at a tenth of what it
            would fetch among collectors, and equally a seized one can be listed at the price
            of a serviced one. There is no record of what sold, no history, and no way to
            research it. <span className="text-[var(--fg)]">Location decides everything</span>
            : you are limited to what happens to surface near you, and this equipment is far
            too heavy and too fragile to be worth shipping on a chance. Worth watching
            patiently. Not worth valuing from.
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="mt-12 border-t border-[var(--line)] pt-6" aria-labelledby="judging">
          <h2
            id="judging"
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-[var(--accent)]"
          >
            Reading the number once you have it
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--fg-soft)]">
            <p>
              <span className="text-[var(--fg)]">Condition is most of the price.</span> A
              recently serviced body and an untested one are the same model and nowhere near
              the same money. A camera that has not run in twenty years will want a service
              costing a meaningful fraction of what the camera is worth, and that cost comes
              off the price, not out of the buyer&rsquo;s goodwill.
            </p>
            <p>
              <span className="text-[var(--fg)]">What is attached matters as much.</span> The
              glass is often worth more than the body it is on. A turret with three good
              Switars is a different object from the same camera bare, and a rare lens can
              carry an otherwise ordinary outfit.
            </p>
            <p>
              <span className="text-[var(--fg)]">Three sales is not a market.</span> This gear
              sells rarely enough that any figure you arrive at is a range, not a price.
              Treat the middle of several recent sold results as the honest answer and the
              extremes as noise.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="mt-12 border border-[var(--line)] bg-[var(--bg-raised)] px-5 py-4">
          <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Help build the record
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-[var(--fg-soft)]">
            None of the above exists as a dataset anyone can consult, which is why this page is
            a method and not a table. So the archive is building one: every item page takes
            what readers paid, with the condition and where it was bought, and shows a figure
            once enough reports agree. Nothing is published until it has been read, and nothing
            is shown from a single sale.{" "}
            <span className="text-[var(--fg)]">
              If you have bought or sold anything Bolex, adding it is the most useful minute
              you can give this site.
            </span>{" "}
            Find the item and use the line at the foot of its page, or{" "}
            <Link href="/suggest" className="text-[var(--accent)] underline underline-offset-4">
              tell us here
            </Link>
            .
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.05}>
        <p className="mt-12 font-[family-name:var(--font-mono)] text-[0.66rem] leading-relaxed text-[var(--fg-soft)]">
          For what Paillard charged when these were new, 1952 to 1979, see{" "}
          <Link href="/prices" className="text-[var(--accent)] underline underline-offset-4">
            Prices
          </Link>
          . Those are cited to the company&rsquo;s own dated price lists and are the one part of
          this the archive can state outright.
        </p>
      </Reveal>
    </div>
  );
}
