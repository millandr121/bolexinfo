# Applying to eBay for sold-listing data

Written to be used, not filed. The application is an account action and
has to be done by the person who owns the eBay account; what is here is
the route, the requirement that trips people up, and a draft of the one
part eBay actually reads.

Last checked: 2026-11-24. eBay moves these pages, so treat the URLs as
starting points rather than gospel.

## What is being asked for

The **Marketplace Insights API**. It is the only official eBay API that
returns sold items. It covers roughly the last 90 days. The old Finding
API call that did this, `findCompletedItems`, was decommissioned in
February 2025, and the Browse API returns active listings only.

It is a restricted API. eBay's own documentation describes it as not
open to new users, and developer support has said access is generally
reserved for approved partners. Several developers report being turned
down. The application is free and costs an hour, so it is worth making,
but it should be made expecting a no.

## The route

1. **A developer account.** developer.ebay.com, sign in with the eBay
   account. Free.
2. **Enrol in the eBay Partner Network.** Community replies say this is
   a precondition. It is eBay's affiliate programme; joining is free.
3. **File an Application Growth Check.** This is the form that actually
   requests restricted scopes, filed through the support-ticket section
   of the developer portal. Ask for the scope
   `https://api.ebay.com/oauth/api_scope/buy.marketplace.insights`.

## The part that decides it

The form asks for the use case and, in substance, what eBay gets out of
it. A developer who asked eBay directly was told plainly that an
application which only wants to compare pricing will not be approved.
So the case has to be about sending buyers to eBay, not about reading
eBay.

That happens to be true here, which is the only reason this is worth
filing. The archive's readers are people who own or are about to buy a
sixty-year-old camera. They arrive asking what a thing is and what it
is worth, and a price figure on an item page is exactly the moment
someone decides to go and buy one.

### Draft use case

> BolexCollector.org is a non-commercial reference archive for Bolex
> and Paillard motion picture equipment, continuing a site that ran
> from 2005 to 2013. It documents 56 cameras, 18 projectors, 119
> lenses and 98 accessories, with manufacturer price lists from 1952
> to 1979 already transcribed and published.
>
> We would use Marketplace Insights to show, on each item's page, a
> recent median sold price and the number of sales it came from,
> alongside the original 1950s to 1970s list price we already publish.
> Figures would be refreshed quarterly, not continuously, and shown
> with the date and sample size.
>
> Each figure would carry a link to the matching eBay search for that
> item, so a reader who has just learned what their camera is, or what
> one costs, can go straight to eBay listings. The archive sells
> nothing and has no competing marketplace; the only transactional
> action available to a reader would be the link to eBay. Our traffic
> is enthusiasts and collectors of discontinued equipment, which is
> second-hand demand by definition.
>
> Expected call volume is low: a single quarterly batch across roughly
> 300 catalogued items, well under 1,000 calls per quarter.

Adjust the figures before sending; they are current as of this file's
date and the catalogue keeps growing.

## If it is refused

Not a dead end, and arguably not even the best option.

**Terapeak, now called Product Research, is eBay's own tool and it is
free.** eBay bought Terapeak in December 2017; it had been licensing
eBay's data since 2004, and it is now part of Seller Hub. It reports
actual completed sales, and it reaches back about **three years**
against the API's ninety days.

It is a web interface rather than an API, so it is read by hand. That
is a feature at this scale: an hour a quarter on the thirty or forty
items people actually ask about produces better evidence than the API
would, over a longer window, with no terms-of-service question at all.

What matters is recording it the way everything else here is recorded:
the date it was read, the number of sales behind each figure, and the
condition the sales were in. A median from three sales and a median
from sixty are not the same claim.

**What not to do.** Scraping eBay's public sold search is against their
terms and is blocked in practice. The third-party "sold data" APIs are
resellers of scraped data; one independent comparison found wrong-item
rates between 5.4% and 31.6%. Neither belongs in an archive whose whole
argument is that every figure is cited and checked.
