# mail@bolexcollector.org

Receiving through Cloudflare Email Routing, sending through Gmail.
Both free. Written down because it is the kind of setup nobody
remembers a year later, and because one detail in it is easy to get
wrong in a way that quietly hurts deliverability.

Do the parts in this order. Gmail's verification email for the second
half is sent *to* mail@bolexcollector.org, so receiving has to work
first.

---

## Part 1: receiving (Cloudflare)

1. Cloudflare dashboard, pick **bolexcollector.org**, then **Email**
   in the sidebar, then **Email Routing**. Click **Get started**.

2. **Destination address.** Enter the Gmail you actually read.
   Cloudflare sends it a verification link. Click it. Nothing works
   until you do, and the link expires.

3. **Custom address.** Create the rule:
   `mail@bolexcollector.org` → your Gmail.
   Add others the same way later: `andrew@`, `suggestions@`,
   whatever. They all cost nothing.

4. **DNS.** Cloudflare offers **Add records automatically**. Take it.
   It writes three MX records and an SPF TXT record. Do not copy MX
   hostnames out of a blog post: they differ between accounts, and
   the dashboard is the only authority on yours.

5. **Remove any other MX records** for the domain first. Two sets of
   MX records is the single commonest reason this silently fails.
   Cloudflare usually warns you, but check the DNS tab yourself.

6. **Enable Email Routing.** Send a test from a different account and
   watch it land.

**Catch-all** is a checkbox that forwards every address at the domain
to you. Convenient, and it means every address you have ever typed
into a form becomes a spam target. Leave it off unless a reason
appears.

---

## Part 2: sending (Gmail)

Cloudflare Email Routing is **inbound only**. It cannot send. For
that, Gmail's "Send mail as" is used, pointed at Gmail's own SMTP.
No third-party relay is needed, which is the part most guides get
wrong.

1. **Turn on 2-Step Verification** on the Google account, if it is
   not on. The next step is impossible without it.

2. **Make an App Password.** Google Account → Security → 2-Step
   Verification → App passwords. Name it something like "Bolex
   send-as". You get a 16-character string. Copy it: it is shown
   once.

3. In Gmail: **Settings** (gear) → **See all settings** →
   **Accounts and Import** → **Send mail as** → **Add another email
   address**.

4. Name: whatever should appear on the message, e.g. *Bolex
   Collector*. Email: `mail@bolexcollector.org`.
   Leave **Treat as an alias** ticked.

5. SMTP settings, which is the screen people get wrong:

   | Field | Value |
   |---|---|
   | SMTP Server | `smtp.gmail.com` |
   | Port | `587` |
   | Username | your **full Gmail address** |
   | Password | the **App Password**, not your Google password |
   | Security | TLS |

   The username really is the Gmail address, not the new one.

6. Gmail emails a confirmation code to mail@bolexcollector.org.
   Cloudflare forwards it to the same inbox. Paste the code.

7. **Set it as default** if replies should come from it by default,
   on the same Accounts screen. Gmail also replies from whichever
   address a message was sent to, which usually does the right thing
   on its own.

---

## The one thing worth understanding

Sending this way, the message says it is **from**
bolexcollector.org, but it is **sent by** Google's servers under the
Gmail account. The two domains do not match.

That matters for **DMARC**. If a strict DMARC record is ever
published for bolexcollector.org (`p=quarantine` or `p=reject`),
alignment fails and the archive's own mail starts landing in spam.

So:

- **Leave DMARC at `p=none`**, or publish none at all, while sending
  this way. A monitoring-only record is fine and useful:
  `v=DMARC1; p=none; rua=mailto:mail@bolexcollector.org`
- **Do not hand-edit the SPF record** Cloudflare wrote. It is there
  for receiving.
- Recipients may see "via gmail.com" in some clients. Cosmetic.

**If the outreach volume grows**, or mail starts getting filtered,
that is the moment to switch sending to a proper relay (Brevo,
SMTP2GO and similar have free tiers in the hundreds per day). A relay
signs with DKIM for bolexcollector.org itself, which makes DMARC
align, and only then is it safe to tighten DMARC. Same Gmail
Send-as screen, different SMTP details.

Free Gmail sends about 500 messages a rolling 24 hours. Nothing this
project does will approach that.

---

## Unverified, worth watching

One vendor blog claims Google is removing "Send mail as" for
non-Google addresses in January 2027. It was not corroborated
anywhere else and the people saying it sell a competing product, so
treat it as a rumour. Worth a check against Google's own
announcements before relying on this long term.

---

## After it works

The outreach drafts in `outreach.md` can go out from this address
rather than a personal one, which is the point: the museums and
archives among them answer a project, not a stranger.
