# Hub Cleanup Report

## Scope

Only the `zcohen-nerd.com` hub page was reviewed. Linked destination pages were not audited.

## Changes Made

- `src/pages/index.js` — hero subcopy, primary button label, section meta count
- `docusaurus.config.js` — page title expanded to include descriptive subtitle

## Hub Copy Result

- **Hero subcopy** replaced: "Everything I build and teach, documented in public — and a single door to each of it. Pick a project below." → "A home base for the engineering projects, technical guides, and education resources I'm building in public."
- **Primary button** relabeled: "Browse the ecosystem" → "Explore the projects"
- **Section meta** corrected: "2 live · growing" → "3 public projects · growing" (hardcoded; 3 public cards are present regardless of status label)

## Project Status Result

Portfolio and Literacy for Kids are labeled Live — accurate.

Connector Guide is labeled "In progress" in the project registry. The task spec calls for "Public Review Draft." **This requires a brand package edit (`src/data/projects.js`) and is listed as a remaining issue.**

## Metadata Result

- `title` updated to: `zcohen-nerd — Engineering, Systems Thinking, and Modern Literacy`
- `tagline` (meta description, OG description) is already: "Practical engineering, systems thinking, and modern literacy — documented in public." — no change needed.
- `url` is `https://www.zcohen-nerd.com` — the live canonical per the task is `https://zcohen-nerd.com` (no www). DNS/CNAME configuration is out of scope for this task.

## Link Target Result

- Hub root: `https://www.zcohen-nerd.com` ✓
- Portfolio: `https://zcohen-nerd.github.io/Portfolio/` ✓
- Literacy for Kids: `https://www.literacy-for-kids.com/` ✓ (user confirmed www variant; task spec references no-www — both should resolve via redirect)
- Connector Guide: `https://zcohen-nerd.github.io/connector-engineering-field-guide/` ✓

## Build Result

`npm run build` — success, no errors or warnings.

## Remaining Issues

1. **Connector Guide status** — "In progress" should be "Public Review Draft" per current ecosystem state. Requires a targeted edit to `src/data/projects.js` in the brand package and a new publish (`@zcohen-nerd/brand@1.0.4`).
2. **Canonical URL www vs no-www** — `docusaurus.config.js` uses `https://www.zcohen-nerd.com`; CNAME is `www.zcohen-nerd.com`. If the canonical should be the apex (`zcohen-nerd.com`), DNS needs an ALIAS/ANAME record for the apex and the CNAME updated. Out of scope here.
3. **Project blurbs** — Current blurbs are functional but could be tightened. Requires brand package edit.

## Recommended Next Step

Open a PR from `hub-copy-status-cleanup` into `main`.
