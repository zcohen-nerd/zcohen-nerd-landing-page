# Search Console checklist — zcohen-nerd.com (hub)

Owner runbook for Google Search Console (GSC) and Bing Webmaster Tools (BWT).
**Nothing here has been done automatically.** Every step needs the owner, signed
in, with authorization for the domain.

Property type: **Domain property** (`zcohen-nerd.com`) is possible because the
apex is owned and DNS is controllable — it covers `www.`, `http/https`, and every
subdomain in one place. (A URL-prefix property for `https://zcohen-nerd.com/` is
the fallback if DNS TXT is inconvenient.)

## 1. Verify

**Domain property (preferred):**

1. GSC → *Add property* → **Domain** → `zcohen-nerd.com`.
2. Add the `google-site-verification=…` **TXT record** to the `zcohen-nerd.com`
   DNS zone. Wait for propagation, click **Verify**.
3. BWT → *Add site* → import from GSC, or add its own DNS TXT.

**URL-prefix fallback (HTML tag):**

1. GSC → *Add property* → **URL prefix** → `https://zcohen-nerd.com/`.
2. In `docusaurus.config.js`, uncomment the placeholder in `headTags` and paste
   the token:
   ```js
   {tagName: 'meta', attributes: {name: 'google-site-verification', content: '<token>'}},
   {tagName: 'meta', attributes: {name: 'msvalidate.01', content: '<token>'}},
   ```
3. `npm run build`, deploy, **Verify**.

## 2. Submit the sitemap

- GSC → *Sitemaps* → `https://zcohen-nerd.com/sitemap.xml`
- BWT → *Sitemaps* → same.
- Generated on every build by `@docusaurus/plugin-sitemap` (`/`, `/about/`,
  `/privacy/`). `static/robots.txt` already carries the `Sitemap:` line.

## 3. URL inspection (first pass)

- `/` — the hub homepage
- `/about/`
- `/privacy/`
- (optionally) the ecosystem destinations linked from the footer, so GSC knows
  the outbound graph.

## 4. Baseline (after ~28 days)

- GSC → *Performance* → 28 days → export **top 25 queries** + **top pages**
  (clicks / impressions / CTR / position).
- GSC → *Pages* → note the indexed count (should be ~3–4).
- BWT → *Search Performance* → same.
- Cross-check against **Plausible** (already running): top pages, outbound-link
  events, referrers. Plausible is the traffic source of truth; GSC is the
  query/impression source of truth.

| date | queries file | pages file | indexed | notes |
| --- | --- | --- | --- | --- |
| _fill in_ | | | | first baseline |

## 5. Monthly review (~10 min — small site)

- GSC *Pages*: anything not indexed? For a 3-page site, everything should be
  "Indexed". A drop = investigate immediately.
- *Performance*: which queries bring people to `/` vs `/about/`? Any query the
  hub *should* rank for and doesn't (candidate for a copy tweak — keep it
  natural)?
- Confirm `sitemap.xml`, `robots.txt`, `site.webmanifest`, and `/privacy/` still
  resolve after any deploy.
- If Plausible shows a spike, check GSC for the matching query/referrer.
