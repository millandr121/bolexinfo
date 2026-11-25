# Turning on the price reports

Two things, both in the Cloudflare dashboard, both about five minutes.
Until the first is done the form will say it cannot record anything;
until the second is done `/inbox` refuses everyone, including you.

Written down because this is the kind of setup nobody remembers a year
later, and because the second step has a trap in it.

---

## How the thing works, before touching anything

A reader opens an item page, say the Switar 25mm. At the foot of the
page is one line of small type: **Know what one of these goes for?
Add what you paid**. That opens a short form — bought or sold, how
much and in what currency, roughly when, where, and the condition.

What happens to it:

1. The form posts to `/api/price-report`, a Cloudflare Pages Function
   running on the same origin. No third party sees it.
2. The function checks it is a plausible price, rate-limits the sender,
   and writes one row to the **`price_reports`** table in D1 with
   `status = 'new'`.
3. **Nothing is shown.** A `new` row is invisible to the public side.
4. You open `/inbox`, see it in the queue with everything needed to
   judge it, and press **Approve** or **Decline**.
5. Once a thing has **two approved reports in the same currency**, its
   item page starts showing a figure: the middle of them, the range,
   the date span, and a breakdown per condition where a band has two
   of its own.

Three deliberate refusals, so none of this surprises you later:

- **One report shows nothing.** One sale is an anecdote wearing the
  clothes of a statistic.
- **Currencies are never converted.** Two sales in dollars and one in
  euros are two sales and one sale, not three. A currency with fewer
  than two is simply not shown.
- **Nothing is published unread.** There is no auto-approve and no
  plan for one.

---

## Part 1: the table

The database already exists — it is the same one the suggestion box
uses, `bolex-suggestions`, bound to the Pages project as `DB`. This
adds one table to it and changes nothing that is already there.

**In the dashboard**, which is the easier way:

1. Cloudflare dashboard → **Storage & Databases** → **D1 SQL Database**
2. Open **bolex-suggestions**
3. Open the **Console** tab
4. Paste the block below and **Run**

```sql
CREATE TABLE IF NOT EXISTS price_reports (
  id          TEXT PRIMARY KEY,
  created_at  TEXT    NOT NULL,
  slug        TEXT    NOT NULL,
  section     TEXT    NOT NULL,
  amount      REAL    NOT NULL,
  currency    TEXT    NOT NULL,
  sold_on     TEXT,
  condition   TEXT    NOT NULL,
  venue       TEXT,
  side        TEXT    NOT NULL,
  notes       TEXT,
  name        TEXT,
  contact     TEXT,
  country     TEXT,
  user_agent  TEXT,
  status      TEXT    NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS price_reports_item  ON price_reports (slug, status);
CREATE INDEX IF NOT EXISTS price_reports_queue ON price_reports (status, created_at DESC);
```

`CREATE TABLE IF NOT EXISTS` means running it twice is harmless, and
it will not touch the `suggestions` table beside it.

**Or from a terminal**, if you have wrangler and would rather:

```
npx wrangler d1 execute bolex-suggestions --remote --file db/schema.sql
```

That applies the whole schema file, which includes the suggestions
table as well. Also harmless to re-run, for the same reason.

To check it worked, in the console:

```sql
SELECT COUNT(*) FROM price_reports;
```

`0` is the right answer.

---

## Part 2: the key for /inbox

`/inbox` reads the queue, so it is behind a secret. Without one set it
refuses everybody, which is the safe way round: a missing variable must
never mean an open door.

1. Cloudflare dashboard → **Workers & Pages** → **bolexinfo**
2. **Settings** → **Variables and Secrets**
3. **Add** — name it exactly `ADMIN_KEY`
4. Choose **Secret**, not Text. A plaintext variable is readable in the
   dashboard by anyone with access to it.
5. The value is any long random string. From a terminal,
   `openssl rand -hex 24` gives a good one. Keep a copy: the dashboard
   will not show it to you again.
6. Apply it to **Production**, and to **Preview** too if you want the
   branch previews to work.

**The trap: variables only take effect on a new deployment.** Setting
it changes nothing until the site is built again. Either push any
commit, or use **Deployments → the latest one → Retry deployment**.

Then go to:

```
https://www.bolexcollector.org/inbox?key=YOUR_KEY_HERE
```

It stores the key for that browser session, strips it out of the
address bar, and shows the queue. Bookmark `/inbox` plain — it will ask
for the key again when the session ends.

---

## Checking the whole loop

Worth doing once, before a real reader meets it.

1. Open any item page, scroll to the foot, **Add what you paid**.
2. Fill it in with something obviously fake — $1, broken, a note
   saying it is a test.
3. It should say it is in the queue. Nothing appears on the page.
4. Open `/inbox`. The report should be at the top, waiting.
5. Press **Approve**. The item page still shows nothing, because one
   report is not enough.
6. Add a second fake report on the same item in the same currency,
   approve it, and the figure should appear.
7. Clear up afterwards, in the D1 console:

```sql
DELETE FROM price_reports WHERE notes LIKE '%test%';
```

---

## If something is wrong

- **"Price reports are not connected to a database yet"** — the `DB`
  binding is missing from the Pages project, not the table. Settings →
  Bindings.
- **The form sends but the inbox is empty** — the table was created in
  a different D1 database from the one bound as `DB`. There is only one
  here, so this would mean a second was made by mistake.
- **`/inbox` says Not authorised with the right key** — the deployment
  predates the variable. Redeploy.
- **Figures never appear** — check the reports are `approved` and not
  `new`, and that two of them share a currency.
