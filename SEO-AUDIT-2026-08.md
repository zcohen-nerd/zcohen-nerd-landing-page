# SEO / metadata audit — zcohen-nerd.com (hub, 2026-08)

Canonical origin `https://zcohen-nerd.com/` (`trailingSlash: true`).
Analytics: cookieless Plausible (`script.outbound-links.js`, `data-domain:
zcohen-nerd.com`).

## Route inventory

| Route | Source | title | description | canonical | H1 | OG image | robots | sitemap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | `src/pages/index.js` | site title (≤ 70) | site tagline | `…com/` | "Practical engineering, systems thinking, and modern literacy." | `img/og-zcohen-nerd.png` (site-wide) | index | ✔ |
| `/about/` | `src/pages/about.md` | "About Me" | own FM description | `…com/about/` | "About Me" | site-wide fallback — **kept** (adequate) | index | ✔ |
| `/privacy/` | `src/pages/privacy.md` **(new)** | "Privacy" | own FM description | `…com/privacy/` | "Privacy" | site-wide fallback | index | ✔ |
| `/404.html` | swizzled `NotFound/Content` | — | — | — | — | — | n/a | no |

Click depth: every route is 1 click from `/`. Sitemap: `@docusaurus/plugin-sitemap`
via preset (all `<loc>` on the apex domain, trailing slash). `static/robots.txt`
+ `static/CNAME` = `zcohen-nerd.com`.

## Structured data

Two JSON-LD blocks on every route, from `docusaurus.config.js` `headTags`:

- **`WebSite`** — `name`, `url`, `description`. Unchanged.
- **`Person`** — now `name`, `alternateName`, `url`, **`image`**, `jobTitle`,
  **`description`**, **`knowsAbout`** (9 topics, all drawn from the sites' own
  pages), `sameAs` (4). **No `worksFor`, no `address`** (owner decision — employer
  stays on the Portfolio About page only).

`validate-build.js` still asserts **exactly 2** blocks, `@type ∈ {WebSite,
Person}` — unchanged and passing (the enhancement only added fields to the
existing `Person` block).

## What this pass changed

| Task | Change |
| --- | --- |
| 3 | `Person` JSON-LD: added `image` (`/img/zachary-cohen-headshot.jpg`), `description` (one line, matches the About page), `knowsAbout` (9 real topics). |
| 6 | New `src/pages/privacy.md` — Plausible, outbound-link events, no cookies/storage, data contact, third-party boundary. Footer "Privacy" link via a minimal `customFields.brand.connectLinks` block (the "Connect" column — a secondary column, not primary nav). Brand package untouched. `validate-build.js` unchanged (its Plausible checks still pass). |
| 7 | `icon-192/512.png`, `apple-touch-icon.png` (`scripts/generate-icons.ps1`), `site.webmanifest` (`display: "browser"` — not a PWA). `headTags` link entries added. |
| 8 | Commented verification-meta placeholders in `headTags`; see `SEARCH-CONSOLE-CHECKLIST.md`. |
| 1 | `scripts/validate-build.js` — the "exactly one headshot" check now counts the *visible* image only (the headshot file name legitimately also appears in `Person.image`). |

**Not changed:** `WebSite` schema, titles, descriptions, canonical handling,
sitemap, the homepage/About copy. `/about/` keeps the site-wide OG card
deliberately — the generic hub card is an adequate preview and there is no
per-page card generator on this repo.

## Copy (Task 5) — reviewed, no change

The homepage `heroQualifier` ("autonomous maritime systems, robotics, embedded
hardware, and systems integration — carried from architecture through field
deployment") and the About page already cover the target search intents
(electromechanical systems integration, autonomous maritime, embedded bring-up,
hardware safety, connector/cable design, Fusion 360, engineering documentation)
naturally, once each. The domain phrasing is intentionally parallel to the
Portfolio hero for a consistent identity; it reads as plain scope, not
keyword-stuffing. No location on the homepage (owner decision).

## Verified

`npm run build` SUCCESS · `node scripts/validate-build.js` all pass · exactly 2
JSON-LD blocks · `/privacy/` built + footer link present · `site.webmanifest`
valid, `display: "browser"`.
