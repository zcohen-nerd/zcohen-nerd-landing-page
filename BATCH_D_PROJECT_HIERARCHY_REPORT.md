# Batch D Project Hierarchy Report

## Registry Schema

Every entry in the shared registry (`@zcohen-nerd/brand` `src/data/projects.js`) gains `category` (`destination` | `tool` | `project`), `featured` (boolean), and `order` (unique ascending sort key). The flat default export is sorted by `order`, so unchanged consumers keep working. New helpers: `getFeaturedProjects()`, `getProjectsByCategory(categoryOrArray)`, `CATEGORIES`.

## Category Definitions

- **destination** — a major property people visit (site, publication, guide)
- **tool** — installable/open engineering tooling
- **project** — a documented hardware/engineering system

## Featured Destinations

Portfolio, Literacy for Kids, Connector Guide, **Writing** (order 10–40). Writing was classified as a fourth featured destination — it postdates the original three-destination plan and gives balanced 4+4 hub grids.

## Tools and Projects

PinmapGen, Fusion System Blocks, FusionToGitHub (tools), SENTRY (project) — order 50–80. No Surfer Fleet.

## Backward Compatibility

`projects.map(...)` unchanged; helpers are additive. Registry validation (`npm run test:registry` in the brand repo) asserts unique names/order, valid URLs/categories/statuses, no Surfer Fleet, no legacy URLs.

## Shared Navigation Grouping

Navbar disclosure and mobile drawer group links as "Featured destinations" / "Tools & projects" via non-interactive labels; Batch C disclosure semantics (no menu roles, server-rendered links, Escape/focus behavior, external indicators, current-project highlighting) are unchanged. Footer stays flat but inherits registry ordering.

## Hub Homepage Result

The single "Everything in one place" grid became two sections: **Start here / Featured destinations** (4 cards) and **Open tools & systems / Engineering tools & projects** (4 cards), both driven by registry metadata. Count wording fixed to "8 public destinations & tools · growing" (nothing is miscounted as a "project"). The "More on the way" placeholder card was removed — both grids are complete 2×2 blocks and the placeholder would have unbalanced them.

## Brand Package Version

Stays **1.0.3** (never published; Batch C + Batch D ride in its first publish per Zac's stacked-mode decision). Registry validation, build (5 files), and pack dry-run (22 files) all pass.

## Build Results

Hub and portfolio build strict and pass their full post-build validation suites against the updated brand components.

## Browser and Keyboard Validation

DOM-verified: section order and card membership, grouped disclosure labels, meta wording, placeholder removal. Keyboard semantics unchanged from Batch C (validated then). Screenshot-level visual pass deferred (browser pane not compositing this session).

## Remaining Risks

- The npm publish (1.0.3) and consumer migration off `file:` remain the gating manual steps; Connector Guide and Literacy pick up grouping via their normal dependency update afterward.
- PR merge order: brand C → brand D → hub C → hub D → portfolio branches (hub/portfolio CI validate against brand main).
