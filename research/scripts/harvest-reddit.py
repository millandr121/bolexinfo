#!/usr/bin/env python3
"""
Harvest Bolex discussion from Reddit into the research corpus.

Why not Reddit itself
---------------------
Reddit answers 403 to every unauthenticated request from a datacenter
address, which is every route tried: www, old.reddit, the .json
endpoints, search.json and oauth.reddit without a token. Pushshift,
which used to be the answer, now redirects to an authenticated service.

Arctic Shift (arctic-shift.photon-reddit.com) is a public mirror of the
Reddit archive maintained for research, and it answers plainly. It
returns the same post and comment objects Reddit's own API does, so the
records below are the real thing rather than scraped page text.

What it writes
--------------
research/corpus/bolex-reddit-corpus.jsonl, one JSON object per line, in
the same shape as the cinematography.com corpus so that both can be
read by one reader later:

    source, thread_id, thread, url, n, author, date, text

`n` is 0 for the submission and counts up through its comments, so a
thread reassembles in order by sorting on (thread_id, n).

The same rules apply as to the forum corpus, and they are the reason
this file exists rather than a pile of scraped HTML: facts may be
restated in our own words with a citation, short quotations may be used
with the author named, and bulk text is never republished as page
content. Deleted and removed content is dropped on the way in, because
someone who deleted their post has asked not to be quoted.

Usage
-----
    python3 research/scripts/harvest-reddit.py            # incremental
    python3 research/scripts/harvest-reddit.py --full     # from scratch

It is incremental: it reads the newest timestamp already in the corpus
and asks only for what came after, so a rerun is cheap and a stopped
run loses nothing.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
OUT = REPO / "research" / "corpus" / "bolex-reddit-corpus.jsonl"

API = "https://arctic-shift.photon-reddit.com/api"

# Where Bolex talk actually happens. r/bolex is the obvious one; the
# others carry a steady trickle worth having, and are filtered by query
# rather than taken wholesale.
SUBREDDITS_WHOLE = ["bolex"]
SUBREDDITS_SEARCHED = [
    "16mm",
    "super8",
    "AnalogCommunity",
    "Filmmakers",
    "cinematography",
    "8mm",
]
QUERY = "bolex"

# Arctic Shift caps a page at 100 and rate-limits firmly. It answers 422
# with "Timeout. Maybe slow down a bit" rather than 429, which is easy to
# read as a bad request and was: the first run of this treated every 422
# as a malformed call and silently dropped the comments on half the
# threads. 422 is a retry, with a long pause.
PAGE = 100
PAUSE = 3.0
TIMEOUT = 60

REMOVED = {"[deleted]", "[removed]", "", None}


def get(path: str, **params: object) -> list[dict]:
    """One page from Arctic Shift, or [] if it has nothing more."""
    # `after=0` is not "from the beginning" to this API, it is a 400:
    # "'after' must be a valid date". Dropping a zero is the difference
    # between a full harvest and an empty one, and the first --full run
    # of this returned nothing at all because of it.
    url = f"{API}/{path}?" + urllib.parse.urlencode(
        {k: v for k, v in params.items() if v not in (None, "", 0)}
    )
    request = urllib.request.Request(
        url,
        headers={
            # Generic, and says what it is. No personal details: this is
            # a public API and the request does not need to identify
            # anyone.
            "User-Agent": "bolexcollector-archive/1.0 (preservation research)",
            "Accept": "application/json",
        },
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
                payload = json.load(response)
            data = payload.get("data") if isinstance(payload, dict) else payload
            return data if isinstance(data, list) else []
        except urllib.error.HTTPError as error:
            if error.code == 404:
                return []
            if error.code in (422, 429, 500, 502, 503, 504) and attempt < 3:
                time.sleep(8 * (attempt + 1))
                continue
            print(f"  ! HTTP {error.code} on {path} {params}", file=sys.stderr)
            return []
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
            if attempt < 3:
                time.sleep(4 * (attempt + 1))
                continue
            print(f"  ! {error} on {path} {params}", file=sys.stderr)
            return []
    return []


def day(epoch: object) -> str:
    try:
        return time.strftime("%Y-%m-%d", time.gmtime(int(epoch)))
    except (TypeError, ValueError):
        return ""


def clean(text: object) -> str:
    """Post text, or empty where there is nothing usable."""
    if not isinstance(text, str) or text.strip() in REMOVED:
        return ""
    return text.strip()


def usable_author(author: object) -> str:
    return "" if author in REMOVED or author == "AutoModerator" else str(author)


def submissions(after: int, subreddit: str, field: str | None, query: str | None) -> list[dict]:
    """
    Every submission matching, oldest first, paging until exhausted.

    There is no general `q`. The API takes `title` and `selftext`, and
    either one requires a `subreddit` or an `author` alongside it, so a
    keyword sweep is done per subreddit and per field rather than in one
    call. Passing `q` returned 400 and harvested nothing from any
    subreddit but r/bolex.
    """
    out: list[dict] = []
    cursor = after
    while True:
        page = get(
            "posts/search",
            subreddit=subreddit,
            after=cursor or None,
            limit=PAGE,
            sort="asc",
            **({field: query} if field and query else {}),
        )
        if not page:
            break
        out.extend(page)
        newest = max(int(p.get("created_utc", 0) or 0) for p in page)
        if newest <= cursor or len(page) < PAGE:
            break
        cursor = newest
        print(f"    … {len(out)} posts, through {day(cursor)}")
        time.sleep(PAUSE)
    return out


def comments_for(post_id: str) -> list[dict]:
    """
    Comments on one submission.

    `link_id` is the bare post id. Reddit's own API wants the `t3_`
    fullname prefix here and this one rejects it, which is the sort of
    difference that costs an afternoon.
    """
    page = get("comments/search", link_id=post_id, limit=PAGE, sort="asc")
    time.sleep(PAUSE)
    return page


def newest_in_corpus() -> int:
    """The latest date already harvested, as an epoch, or 0."""
    if not OUT.exists():
        return 0
    latest = ""
    with OUT.open(encoding="utf8") as handle:
        for line in handle:
            try:
                date = json.loads(line).get("date", "")
            except json.JSONDecodeError:
                continue
            if date > latest:
                latest = date
    if not latest:
        return 0
    return int(time.mktime(time.strptime(latest, "%Y-%m-%d"))) - 86400


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--full", action="store_true", help="ignore what is already harvested")
    parser.add_argument("--since", default=None, help="YYYY-MM-DD to start from")
    args = parser.parse_args()

    if args.since:
        after = int(time.mktime(time.strptime(args.since, "%Y-%m-%d")))
    elif args.full:
        after = 0
    else:
        after = newest_in_corpus()

    print(f"Harvesting from {day(after) if after else 'the beginning'}")

    seen_ids: set[str] = set()
    if OUT.exists() and not args.full:
        with OUT.open(encoding="utf8") as handle:
            for line in handle:
                try:
                    seen_ids.add(json.loads(line)["thread_id"])
                except (json.JSONDecodeError, KeyError):
                    pass
        print(f"  {len(seen_ids)} threads already held")

    # r/bolex wholesale; everywhere else by keyword, in both the title
    # and the body, since a thread that only mentions a Bolex in passing
    # is often where the useful answer is.
    targets: list[tuple[str, str | None, str | None]] = [
        (s, None, None) for s in SUBREDDITS_WHOLE
    ]
    for subreddit in SUBREDDITS_SEARCHED:
        targets.append((subreddit, "title", QUERY))
        targets.append((subreddit, "selftext", QUERY))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    if args.full and OUT.exists():
        OUT.unlink()

    def flush(batch: list[dict]) -> int:
        """
        Append what we have so far and forget it.

        The first version of this held every record in memory and wrote
        once at the end, so a run that was interrupted — a lost
        container, a timeout, a stopped session — lost everything it had
        fetched, which for a full sweep is hours of polite, rate-limited
        requests. Appending per subreddit means the worst case is losing
        one subreddit's worth, and a rerun skips what is already held.
        """
        if not batch:
            return 0
        with OUT.open("a", encoding="utf8") as handle:
            for record in batch:
                handle.write(json.dumps(record, ensure_ascii=False) + "\n")
        written = len(batch)
        batch.clear()
        return written

    total = 0
    threads_seen: set[str] = set()
    records: list[dict] = []
    for subreddit, field, query in targets:
        label = f"r/{subreddit}" + (f" {field}~{query}" if field else " (all)")
        print(f"  {label}")
        posts = submissions(after, subreddit, field, query)
        print(f"    {len(posts)} submissions")

        for post in posts:
            post_id = str(post.get("id") or "")
            if not post_id or post_id in seen_ids:
                continue

            title = clean(post.get("title"))
            if not title:
                continue
            permalink = post.get("permalink") or f"/r/{subreddit}/comments/{post_id}/"
            url = f"https://www.reddit.com{permalink}"
            thread = {
                "source": f"reddit.com/r/{subreddit}",
                "thread_id": post_id,
                "thread": title,
                "url": url,
            }

            author = usable_author(post.get("author"))
            body = clean(post.get("selftext"))
            if author:
                records.append(
                    {
                        **thread,
                        "n": 0,
                        "author": author,
                        "date": day(post.get("created_utc")),
                        "text": body or title,
                    }
                )

            threads_seen.add(post_id)
            # Per subreddit was still too coarse: r/bolex alone is hours,
            # so an interrupted run reached the end of no subreddit and
            # saved nothing. Little and often.
            if len(records) >= 50:
                total += flush(records)
            if int(post.get("num_comments") or 0) == 0:
                continue
            for i, comment in enumerate(comments_for(post_id), start=1):
                text = clean(comment.get("body"))
                who = usable_author(comment.get("author"))
                if not text or not who:
                    continue
                records.append(
                    {
                        **thread,
                        "n": i,
                        "author": who,
                        "date": day(comment.get("created_utc")),
                        "text": text,
                    }
                )

        total += flush(records)
        print(f"    written so far: {total} records, {len(threads_seen)} threads", flush=True)

    total += flush(records)
    if not total:
        print("Nothing new.")
        return 0
    print(f"Wrote {total} records across {len(threads_seen)} threads → {OUT.relative_to(REPO)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
