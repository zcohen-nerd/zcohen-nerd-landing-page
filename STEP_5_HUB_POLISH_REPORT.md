# Step 5 Hub Polish Report

## Scope

Final metadata, 404, analytics review, robots-policy review, and regression validation.

## Branch Base

`hub-step-5-final-polish` from `main` @ `7d1f156` (Step 4 merged via PR #8).

## Custom 404

Swizzled `@theme/NotFound/Content`: ecosystem-voice copy with links to hub home, About, the portfolio, and the ecosystem grid; shared Navbar/Footer preserved. Served as `build/404.html` (GitHub Pages native).

## Browser Titles and Metadata

Hub homepage title "zcohen-nerd — Engineering, Systems Thinking, and Modern Literacy" is 58 characters — concise, no duplication; left unchanged. Canonical metadata remains apex; OG card unchanged.

## Plausible

**Previous integration:** one `script.outbound-links.js` with `data-domain="zcohen-nerd.com"` (Zac's Batch C decision to keep). **No source change committed** — no newer dashboard snippet was provided this session, and the gate forbids guessing. **Portfolio has no analytics by design so far**; adding it is a deliberate decision requiring the dashboard snippet for a `portfolio.zcohen-nerd.com` site entry (or the same domain with subdomain rollup, per dashboard preference). **Dashboard verification remaining:** site registered, pageview received, outbound click received, file-downloads measurement enabled if résumé-download tracking is wanted (Plausible's file-downloads script variant covers PDF clicks without custom JS), 404 tracking per Plausible's docs.

## Robots Policy

**Repository policy (chosen Option B):** permissive + Sitemap directive — now serving correctly on the live portfolio. **Live hub response:** still Cloudflare's managed robots.txt (Content-Signals + AI-crawler Disallows), overriding the repo file at the edge. **Exact dashboard action:** Cloudflare → zcohen-nerd.com → Settings (or Security → Bots) → disable "Managed robots.txt" / content signals — after which the repo's permissive file serves. No change made from here; no policy re-chosen.

## Résumé / Current Focus Verification

Both intact and covered by existing Step 4 assertions.

## Validation

New assertions: custom 404 content + links, homepage title length ≤70. Full suite (Batch C + Steps 2/4/5) passes.

## Build / Browser Result

Strict build clean; validator-verified 404 content and links; zero console errors on the homepage.

## Files Changed

`src/theme/NotFound/Content/index.js`, `scripts/validate-build.js`, this report.

## Manual Steps Remaining

- Cloudflare managed-robots toggle (above) if Option B should actually serve on the hub
- Plausible dashboard: register site(s), verify events, optionally enable file-downloads measurement and provide the snippet if the script should change
- Brand npm publication + consumer migration (unchanged blocker)
