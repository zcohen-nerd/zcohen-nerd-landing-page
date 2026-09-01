# Final acceptance — zcohen-nerd ecosystem post-release remediation

**Date:** 2026-09-01 · **Scope:** `zcohen-nerd-brand`, `zcohen-nerd-landing-page`
(hub), `Portfolio`, `connector-engineering-field-guide` (guide), `PinmapGen`,
`Fusion_System_Blocks` (FSB), `FusionToGitHub` (FTG), `SPARK`. SENTRY is
referenced but not modified (institutional; local clone points at a personal
fork).

This document is the independent evidence-and-acceptance pass that follows the
implementation run recorded in
[`POST_RELEASE_CLOSURE_REPORT.md`](./POST_RELEASE_CLOSURE_REPORT.md). Every
repository and every live deployment was re-inspected directly; the prior report
was not taken on trust.

---

## Verdict

**Fully launched, in maintenance mode, with three documented accepted
limitations** — all three are credential-gated operator actions with exact
runbooks, none is a correctness defect, and none was converted into a stronger
public claim.

- No changed repository has red required CI.
- No deployment is stale (hub, Portfolio, guide re-deployed and re-verified live
  on 2026-09-01).
- No release/tag version is inconsistent (PinmapGen `v0.5.2`, FTG `0.3.1` verified
  self-consistent across every surface; immutable tags untouched).
- The live privacy statement is accurate (hub `/privacy/` discloses both
  Plausible and the Cloudflare Web Analytics beacon; CSP, NOTICE, and the actual
  request set agree).
- No regression was hidden by skipping or disabling a test. Where a tool broke CI
  with no code change (ruff default-broadening on FSB/FTG), the tool version was
  pinned and the finding documented — no rule class was disabled.

**SPARK physical evidence remains visibly pending.** SPARK is Prototype; the
repository publishes no fabrication, assembly, or measurement records, and the
Portfolio case study and hub line were corrected downward to match. See
[`SPARK/validation/EVIDENCE-CHECKLIST.md`](https://github.com/zcohen-nerd/SPARK/blob/main/validation/EVIDENCE-CHECKLIST.md).

---

## Live endpoints verified (2026-09-01)

| Property | URL | Server | Notes |
|---|---|---|---|
| Hub | <https://zcohen-nerd.com/> | Cloudflare → GitHub Pages | Full security header set (see below) |
| Portfolio | <https://portfolio.zcohen-nerd.com/> | GitHub Pages (direct) | No custom headers — documented limitation |
| Guide | <https://zcohen-nerd.github.io/connector-engineering-field-guide/> | GitHub Pages (direct) | github.io HSTS only |

**Redirects (all single-hop unless noted):** `http://zcohen-nerd.com` → `https://zcohen-nerd.com`;
`https://www.zcohen-nerd.com` → `https://zcohen-nerd.com`; `http://portfolio…` →
`https://portfolio…`; guide `http` → `https`. **`http://www.zcohen-nerd.com`
still double-hops** (`→ https://www → apex`) — collapsing it is operator action
OP-3 §C.

**Hub live headers:** `Content-Security-Policy` (`script-src`/`connect-src` =
`'self'` + 2 sha256 + `https://plausible.io` + `https://static.cloudflareinsights.com`;
`style-src 'self' 'unsafe-inline'`; `upgrade-insecure-requests`),
`Strict-Transport-Security: max-age=2592000` (30 d, no `includeSubDomains`, no
`preload`), `Referrer-Policy: strict-origin-when-cross-origin`,
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, locked-down
`Permissions-Policy`, `Cache-Control: max-age=600` on HTML.

**Lighthouse mobile (2026-09-01, headless Chrome, `--form-factor=mobile
--screenEmulation.mobile`):**

| Route | Perf | A11y | Best-practices | SEO | CLS |
|---|:-:|:-:|:-:|:-:|:-:|
| hub `/` | 97 | 100 | 100 | 100 | 0 |
| hub `/about/` | 96 | 100 | 100 | 100 | 0 |
| Portfolio `/` | 99 | 100 | 100 | 100 | 0 |
| Portfolio `/projects/stlink-v3mods/` | 99 | 100 | 100 | 100 | 0 |
| Portfolio `/documentation/custom-pcb-portfolio/` | 97 | 100 | 100 | 100 | 0 |
| guide `/` | 99 | 100 | 100 | 100 | 0 |

Baseline was 93/96/99 performance and 100 a11y/BP/SEO. **No regression.** One cold
first run of the SPARK route reported P76/CLS 0.408; the immediate re-run and all
subsequent runs returned P99/CLS 0 — a transient runner artifact, not a layout
defect. The only recurring Lighthouse finding is `unsized-images` on the shared
`zcohen-nerd-logo.png` (brand navbar) — fixed in `@zcohen-nerd/brand@1.3.0`,
pending npm publish (OP-1).

**Live behaviour checks (Playwright, Chromium, 390 px / DPR 3):** no console
errors on any route (the one "404" console line on the hub 404 route is the
intended HTTP 404 for the missing page); no `http://` responses / mixed content
anywhere; responsive `<img>` selects `-156w` headshot and `-768w` work images on
the hub and `-640w` gallery images on the guide — appropriately sized for the
slots.

**Structured data / metadata:** sitemap.xml, robots.txt, `/site.webmanifest`,
and the résumé PDF (`application/pdf`) all return 200 on every property; custom
404s return HTTP 404 with `<meta name="robots" content="noindex, follow">`; hub
`Person`+`TechArticle`-family JSON-LD and Portfolio global `Person` JSON-LD parse;
OG images are 1200×630 and absolute.

**External links:** guide crawl 2026-09-01 — **459 links, 373 ok, 81 skipped, 5
blocked/indeterminate, 0 broken** (`timedOut: false`). The 5 blocked are 403-to-
crawler bot walls (`phoenixcontact.com` ×2, `jst.com`, `digikey.com`,
`wiki.dronecode.org`) — reachable in a browser, correctly classified as blocked,
not dead.

The Portfolio and hub `links-external` workflows dispatched 2026-09-01 were
**cancelled at the 20-minute job timeout** — their (pre-fix) copy of
`check-external-links.mjs` had no overall crawl cap and wedged on linkinator's
queue. This workflow is a `--warn-only` scheduled diagnostic, never a PR gate, so
this is not red required CI. The fix was ported from the guide and merged
(Portfolio `9f1e3e1` [#35](https://github.com/zcohen-nerd/Portfolio/pull/35),
hub `b10d506` [#19](https://github.com/zcohen-nerd/zcohen-nerd-landing-page/pull/19))
and smoke-tested directly against the built Portfolio site: **115 links, 112 ok,
3 skipped, 0 blocked, 0 broken, `timedOut: false`**. The next scheduled runs will
self-cap at 8 minutes and publish a report.

**CI:** every changed repository's `main` is green — guide (build / deploy-pages /
quality), hub (build+deploy / quality), Portfolio (build+deploy / quality),
PinmapGen (Build and Test / Validate Pinmaps / Docs Integrity), FSB (CI), FTG
(CI), brand (ci), SPARK (integrity).

---

## Acceptance matrix

Findings from the 31 August 2026 post-release audit, grouped by priority: **P1** —
anything that would mislead a reader, misstate rights, break a release, or leave
red CI; **P2** — accessibility, content delivery, link integrity, supply-chain
hardening; **P3** — hygiene, tooling, and documentation accuracy.

### P1 — correctness, claims, rights, release integrity

| # | Item | Result | Evidence |
|---|---|:-:|---|
| P1-1 | Live privacy statement is accurate (Plausible **and** the Cloudflare beacon disclosed; CSP + NOTICE + live requests agree) | **PASS** | hub PR [#12](https://github.com/zcohen-nerd/zcohen-nerd-landing-page/pull/12); live `curl https://zcohen-nerd.com/privacy/` names both; served HTML loads only `plausible.io/js/script.outbound-links.js`; CSP allows `static.cloudflareinsights.com` (edge-injected). Fully removing the beacon = OP-2 (cleanup, not a correctness gate). |
| P1-2 | PinmapGen release integrity — corrective `v0.5.2`, one version on every surface, immutable tags untouched, recurrence prevented | **PASS** | `v0.5.2` tag → `bb43825`; tag contents `pyproject.toml` = `0.5.2`, `_FALLBACK_VERSION` = `0.5.2`; release assets `pinmapgen-0.5.2-*`; notes state old `v0.5.0`/`v0.5.1` carried stale `0.1.0` metadata without implying the tags moved. `v0.5.0` → `866e07d`, `v0.5.1` → `3264e3d` unchanged. `.github/workflows/release.yml` "Tag is unused / not being moved" + "All version surfaces agree" guards. 392 tests pass. |
| P1-3 | FusionToGitHub — live docs, runtime constant, manifest, CLI `--version`, test output, release, tag, and `main` CI all one version; CI green | **PASS** | `src/fusion_git_core.py:VERSION = "0.3.1"`; manifest `"version": "0.3.1"`; `Push_To_GitHub.py VERSION = CORE_VERSION`; `push_cli.py --version` → `FusionToGitHub 0.3.1`; README "Version: `0.3.1`"; CHANGELOG `## 0.3.1`; release `0.3.1` (Latest) from `44c00aa`; tag `0.3` untouched. `T_VERSION` test guards drift. 19/19 tests. `main` CI success on `ff5a0d3`. Only `V7.7` mentions left are the CHANGELOG history line and the guard test itself. |
| P1-4 | SPARK maturity and validation wording match published evidence; not promoted beyond Prototype | **PASS** | SPARK repo PR [#2](https://github.com/zcohen-nerd/SPARK/pull/2) → `e474e72`: README per-stage status table (Fabricated / Assembled = "Not documented here"; Electrically verified / Bench-validated = "No"). Portfolio PR [#32](https://github.com/zcohen-nerd/Portfolio/pull/32) → `20eb22d` and hub PR [#16](https://github.com/zcohen-nerd/zcohen-nerd-landing-page/pull/16) → `dab6308` removed "beta PCBs received / assembly underway / execution started" and the "Gerbers" claim (V0.4 exports ODB++ only). Live SPARK page confirmed: over-claim wording absent, "No fabrication, assembly, or measurement records are published" present. Status stays **Prototype**. |
| P1-5 | "30+ custom PCBs" claim is substantiated and its evidence basis is public-safe | **PASS** | New `/documentation/custom-pcb-portfolio/` (Portfolio PR [#33](https://github.com/zcohen-nerd/Portfolio/pull/33) → `204c2ce`, live). Figure is stated twice in the résumé (`static/files/zac-cohen-resume.pdf`: USNA role + consulting summary). Appendix lists 7 individually documented boards (4 SURFER deployed, 1 SENTRY deployed w/ public GPL-3.0 repo, 1 SPARK Prototype w/ public repo, 1 teaching rig) plus 4 categories of USNA-owned institutional work with the résumé as the evidence basis. No schematics/layouts exposed; institutional ownership stated explicitly. **Number kept** — it is backed by an authorized record. |
| P1-6 | Portfolio split-license does not over-claim rights; unknown rights excluded, not relicensed | **PASS** | `LICENSE.md` (umbrella) + `LICENSE-CODE` (MIT) + `LICENSE-CONTENT.md` (CC BY-NC 4.0) + `TRADEMARKS.md` + `NOTICE.md`; `package.json` `"license": "SEE LICENSE IN LICENSE.md"`. All 53 shipped non-code assets reconcile with NOTICE.md (SENTRY count corrected 12→11, PR [#34](https://github.com/zcohen-nerd/Portfolio/pull/34)). Photos / résumé = Reserved; project imagery = "project repo governs" (SPARK CERN-OHL-S-2.0, SENTRY GPL-3.0, FSB "custom community license" — all verified against the repos); USNA facility photo + FRC event photos + literacy-project image = "owner confirmation required", excluded. Nothing marked CC BY-NC merely for being in the repo. |
| P1-7 | Hub / landing split-license files match actual package and static contents | **PASS** | brand `package.json` `files[]` + `npm pack --dry-run` ship code + 2 `assets/` marks + `LICENSE-CODE`/`LICENSE.md`/`TRADEMARKS.md`; `LICENSE.md` excludes `assets/` brand artwork from MIT — consistent. Landing `NOTICE.md` updated (PR [#17](https://github.com/zcohen-nerd/zcohen-nerd-landing-page/pull/17) → `f99f65f`) to cover the 15 responsive WebP variants and to split `work/*` by real rights, matching Portfolio (SURFER photo → "owner confirmation required"). |
| P1-8 | SENTRY described consistently with GPL-3.0 public source; no claim of owning external targeting software | **PASS** | `zcohen-nerd/SENTRY` is public, `licenseInfo` = `gpl-3.0`. Portfolio case study: "released publicly by the institution", "Higher-level vision processing, targeting software, and autonomy experiments … developed by the platform's users … not by me". Hub line mirrors this. "Open source" is accurate for GPL-3.0. (Minor: the case study says "open source" rather than naming GPL-3.0 explicitly — the linked repo and `NOTICE.md` both carry GPL-3.0; recorded as a P3 nicety, not a defect.) |
| P1-9 | No changed repo has red required CI; no stale deployment | **PASS** | All eight repos' `main` CI green (list above). Hub / Portfolio / guide re-deployed 2026-09-01 and re-verified live. |
| P1-10 | Guide v1.0 / "source-verified" language still supported after the SD-22 link/source update | **PASS** | `docs/appendix/source-notes.md` SD-22 row unchanged (source named, not URL'd); the dead `www.dau.mil` URL in `docs/lifecycle-and-procurement.md` → current `https://dau.edu/tools/t/SD-22-…` + ASSIST/QuickSearch note. Guide crawl: 0 broken. The v1.0 milestone text explicitly anticipates continuous post-1.0 source review; a dead-link fix maintains it. |

### P2 — accessibility, delivery, link integrity, supply chain

| # | Item | Result | Evidence |
|---|---|:-:|---|
| P2-1 | Guide Navbar home link — accessible name contains the visible wordmark and communicates "home" (was an `aria-label` that replaced it) | **PASS** | guide PR [#88](https://github.com/zcohen-nerd/connector-engineering-field-guide/pull/88) → `9e78cf9`. Live `/` HTML: no `aria-label="Connector Field Guides home"`; visible wordmark + visually-hidden " — home page". `scripts/validate-build.mjs` blocking guard + `e2e/a11y-home-link.spec.ts` (scoped `label-content-name-mismatch` axe run). 17/17 Playwright. |
| P2-2 | All six landing keyboard contracts run (were `test.fixme`) | **PASS** | hub PR [#12](https://github.com/zcohen-nerd/zcohen-nerd-landing-page/pull/12). `e2e/keyboard.spec.ts` — 9/9 specs run and pass locally and in CI (`keyboard` job green). In-drawer "Close menu" locator scoped to `#zc-mobile-drawer`. |
| P2-3 | Custom 404 pages carry `noindex` while keeping HTTP 404 + recovery links | **PASS** | guide PR [#89](https://github.com/zcohen-nerd/connector-engineering-field-guide/pull/89), hub PR [#13](https://github.com/zcohen-nerd/zcohen-nerd-landing-page/pull/13), Portfolio PR [#31](https://github.com/zcohen-nerd/Portfolio/pull/31). Live: all three return HTTP 404 + `<meta name="robots" content="noindex, follow">`; recovery nav/links intact. |
| P2-4 | Image delivery — responsive variants where it materially reduces transfer; alt/lazy/aspect preserved; budgets pass | **PASS** | guide PR #88 (16 gallery WebP variants; mobile gallery ≈ 760 → ≈ 61 KiB); hub PR [#14](https://github.com/zcohen-nerd/zcohen-nerd-landing-page/pull/14) (15 WebP variants; mobile home imagery ≈ 300 → ≈ 75 KiB). Live responsive `<img>` picks appropriately sized files. `size-limit` green on both. Portfolio hero (50 KiB WebP, `eager`/`fetchpriority=high`) left as-is with rationale — Lighthouse does not flag it. |
| P2-5 | Reduced motion respected | **PASS** | guide — `@media (prefers-reduced-motion)` in `zcohen-nerd-tokens.css` + `Navbar/styles.module.css`. Portfolio — `src/clientModules/reduced-motion.js` pauses ambient autoplay video (wired in `docusaurus.config.js`). Landing — no CSS animations at all (only hover/focus transitions). |
| P2-6 | External-link integrity — no internal breaks; external failures classified | **PASS** | guide `scripts/check-external-links.mjs` re-run 2026-09-01: 0 broken (internal + external), 5 blocked (403 bot walls, classified). 401/403/429 → browser-UA recheck → `BLOCKED` bucket, never `BROKEN`; overall + recheck-phase caps so a hung host can't wedge the run. |
| P2-7 | Supporting-repo workflows hardened — actions SHA-pinned, permissions minimised, Dependabot added, release perms separate | **PASS** | PinmapGen PR [#62](https://github.com/zcohen-nerd/PinmapGen/pull/62), FTG PR [#7](https://github.com/zcohen-nerd/FusionToGitHub/pull/7), FSB PR [#328](https://github.com/zcohen-nerd/Fusion_System_Blocks/pull/328). SHA pins with `# vX.Y.Z` comments; `contents: read` on CI, `contents: write` scoped to release job; FSB `checks: write` scoped to the `test` job; `.github/dependabot.yml` in all three. FSB also pinned `ruff==0.16.5` (unpinned-ruff drift was reddening CI) — no rule class disabled. |
| P2-8 | FSB stays Public Beta; 775 Python / 24 JS test baseline still passes | **PASS** | `pyproject.toml` version `0.1.1`; README "early release (v0.1.1)" + "775 passing Python tests, 24 JS harness tests"; Portfolio case study `status: Public Beta` with 775/24/30 evidence (`validate-build.js` guard). Local re-run: **775 passed**, **24 passed**. License badge "Community", not "open source". |
| P2-9 | Brand / caching / HSTS / AI-crawler architecture documented for the operator | **PASS (doc)** | `CLOUDFLARE-OPERATOR-CHECKLIST.md` (hub, PR #14) — §B cache rules, §C `www` one-hop redirect, §D AI-crawler block (intentional default; how to change; "do not silently enable"), §E HSTS ramp (30 d → 180 d → 1 y → `includeSubDomains`; **no preload**), §F GitHub-Pages header limitation for Portfolio + guide (accepted). Applying the zone changes = OP-3. |

### P3 — hygiene, tooling, documentation accuracy

| # | Item | Result | Evidence |
|---|---|:-:|---|
| P3-1 | Lint warnings on changed maintained code cleared | **PASS** | guide: unused `React` import removed from Navbar; `eslint.config.mjs` ignores local `.venv/`; MD025 config synced. Changed files 0 eslint warnings / 0 prettier issues (LF). Pre-existing warnings in `bump-version.mjs` / `bundle-report.mjs` (not in scope) tracked as a background chip. |
| P3-2 | Dependency-audit gate no longer trips on `npm audit`'s non-zero exit | **PASS** | `scripts/audit-ci.mjs` try/catch on `e.stdout` + un-piped workflow step in brand / hub / Portfolio / guide. |
| P3-3 | Build validators aligned with live output (guide TechArticle JSON-LD; "no JSON-LD" note removed) | **PASS** | guide `scripts/validate-build.mjs` — 7 `TechArticle` shape assertions + a blocking home-link regression guard; `validate` 23/23. Live `/` carries the `TechArticle` block. |
| P3-4 | Dead `www.dau.mil` SD-22 source replaced with a current authoritative URL | **PASS** | `docs/lifecycle-and-procurement.md` → `https://dau.edu/tools/t/SD-22-Diminishing-Manufacturing-Sources-and-Material-Shortages-(DMSMS)-Guidebook` (DAU migrated `.mil` → `.edu`) + note that it is distributed via the DoD ASSIST/QuickSearch repository. |
| P3-5 | SPARK repository is internally accurate and has an evidence-capture path | **PASS** | SPARK PR #2 — per-stage status table, `validation/bring_up.md`, `validation/results/TEMPLATE.md`, `validation/EVIDENCE-CHECKLIST.md` (operator to-do: minimum artifacts to flip each stage, exactly where each belongs, and "no public claim moves ahead of committed evidence"), `hardware/README.md` (ODB++-only), `.github/workflows/integrity.yml` (links / markdown / artifacts / BOM / consistency; no EDA tooling). Integrity CI green. |
| P3-6 | NOTICE inventories are complete and consistent across hub and Portfolio | **PASS** | Portfolio `NOTICE.md` — 53/53 assets reconciled (SENTRY count fixed). Landing `NOTICE.md` — responsive variants added, `work/*` split by real rights, `og-zcohen-nerd.png` → MIT build output, icons → reserved. Terminology aligned between the two. 3 unused placeholder SVGs (`hero/project/diagram-placeholder.svg`) are dead assets, not a rights problem — noted, not deleted. |
| P3-7 | Post-release closure report is accurate | **PASS (with this addendum)** | `POST_RELEASE_CLOSURE_REPORT.md` updated 2026-09-01 with the final-pass results and pointers to this file. |

**No item is marked closed on the strength of a deferral.** SPARK physical
evidence (P1-4 / P3-5) is accepted as *pending*, with the public claim held at
its conservative floor and an operator checklist produced — it is not counted as
a completed measurement.

---

## Accepted limitations

| # | Limitation | Why accepted | Owner | Review by |
|---|---|---|---|---|
| L-1 (OP-1) | `@zcohen-nerd/brand@1.3.0` not yet on npm — the three consumers still pin `1.2.0`, so the deployed navbar wordmark image lacks intrinsic `width`/`height` and Lighthouse keeps one `unsized-images` finding. | `npm publish` needs a 2FA OTP that cannot be supplied here. Repo side is done and verified (`main` `b4499c3`, `prepublishOnly` green, pack contents checked). No behaviour or correctness impact. | site owner | 2026-11-30 |
| L-2 (OP-2) | Cloudflare Web Analytics beacon (`static.cloudflareinsights.com`) still loads. | Requires the Cloudflare dashboard. The live privacy statement **discloses** the beacon and the CSP allows it, so this is a cleanup, not an inaccuracy. Runbook: `CLOUDFLARE-OPERATOR-CHECKLIST.md` §A. | site owner | 2026-11-30 |
| L-3 (OP-3) | Cloudflare zone changes not applied: immutable/revalidatable `Cache-Control` split, one-hop `http://www` → apex redirect, staged HSTS ramp. | Requires the Cloudflare dashboard. Each change has a copy-paste rule and a `curl` verification in `CLOUDFLARE-OPERATOR-CHECKLIST.md` §B/§C/§E. Current headers are safe (HSTS 30 d, no `preload`); `www` double-hop is cosmetic. | site owner | 2026-11-30 |
| L-4 | SPARK has **no** fabrication / assembly / measurement records. | The evidence does not exist yet. Public claim held at "Prototype — design complete, nothing verified"; `SPARK/validation/EVIDENCE-CHECKLIST.md` names the minimum artifacts and where each belongs. Must remain visibly pending — not upgraded until real results are committed. | repo owner | when a bench session happens |
| L-5 | Portfolio + guide ship no CSP / HSTS / Referrer-Policy (GitHub Pages direct). | Static content, no credentialed surface, no third-party scripts on Portfolio, none on the guide. Proxying purely to attach headers adds a moving part for no threat reduction. Migration path in `CLOUDFLARE-OPERATOR-CHECKLIST.md` §F. | site owner | 2026-11-30 |
| L-6 | Pre-existing `no-unused-vars` warnings in guide `scripts/bump-version.mjs` and `scripts/bundle-report.mjs`, and in Portfolio `scripts/validate-build.js` (`homeVisible`). | Out of scope for the touched changes; not in changed maintained code. Background chip spawned for the guide ones. | repo owner | next change to those files |
| L-7 | FSB `README.md` has a large uncommitted rewrite in the working tree (adds an explicit "Public Beta" badge); untracked `SECURITY.md` / `.github/ISSUE_TEMPLATE/`. | Pre-existing owner work-in-progress, left byte-for-byte intact. The committed `main` is already accurate ("early release v0.1.1", 775/24). | repo owner | — |
| L-8 | SENTRY case study says "open source" rather than naming GPL-3.0. | Accurate (GPL-3.0 is open source) and the linked repo + `NOTICE.md` both carry GPL-3.0. A one-word precision improvement, not a defect. | repo owner | next Portfolio content pass |

---

## Quarterly maintenance checklist

Run every quarter (next: **2026-12**). Roughly 30–45 minutes.

**Claims**

- [ ] Re-read the SURFER, SENTRY, SPARK, FSB, PinmapGen, FTG hub lines and Portfolio case studies against their repositories. Figures still approximate and first-party? Maturity labels (Concept / Prototype / Public Beta / Deployed) still earned?
- [ ] `/documentation/custom-pcb-portfolio/` — still consistent with the résumé; any newly public board moved from a category row to its own row.
- [ ] Résumé PDF in `Portfolio/static/files/` matches the About page.

**Links**

- [ ] `cd connector-engineering-field-guide && npm run build && node scripts/check-external-links.mjs --warn-only` — 0 broken; every blocked host still a real bot wall (spot-check 2–3 in a browser).
- [ ] Trigger `links-external.yml` on Portfolio and hub; review `reports/quality/linkinator.json`.

**Dependencies**

- [ ] Review open Dependabot PRs across all eight repos. Merge patch/minor after CI; hold majors for a deliberate look (e.g. `actions/checkout` v4 → v7 changes the runner).
- [ ] `node scripts/audit-ci.mjs` in brand / hub / Portfolio / guide — still PASS; refresh `.github/audit-allowlist.json` `review_by` dates.

**Releases**

- [ ] PinmapGen / FTG: `git tag`, `pyproject`/runtime constant, CLI `--version`, release name, and `main` CI all agree. Never move a published tag.
- [ ] brand: if a new version shipped, the three consumers pin the exact new version (no `file:` paths).

**Privacy origins**

- [ ] `curl -sS https://zcohen-nerd.com/ | grep -oE 'https://[^"]+\.js'` — only `plausible.io`. Load the site with devtools open — cross-origin requests match `/privacy/` exactly (Plausible + `static.cloudflareinsights.com` unless OP-2 was done).
- [ ] `curl -I https://zcohen-nerd.com/` — CSP `script-src`/`connect-src`, HSTS, Referrer-Policy, nosniff, Permissions-Policy all present; HSTS value matches the documented ramp step.

**SPARK evidence**

- [ ] Any new material in `SPARK/validation/results/`? If so, flip only the matching README status stage and update the Portfolio + hub wording per `EVIDENCE-CHECKLIST.md` §5. Bench measurements alone do **not** move SPARK past Prototype.
- [ ] If still nothing: `EVIDENCE-CHECKLIST.md` and the "Prototype / no measurement records" wording stay exactly as they are.

---

## Genuinely non-automatable, deferred to a human

- Publish `@zcohen-nerd/brand@1.3.0` (2FA), tag, release, repin consumers (OP-1).
- Cloudflare dashboard: OP-2 (Web Analytics) and OP-3 (cache / redirect / HSTS), then capture the post-change `curl` headers.
- Google / Bing Search Console: verify properties, submit the three sitemaps, paste verification tokens into the `headTags` placeholders, record the 28-day baseline (`SEARCH-CONSOLE-CHECKLIST.md`).
- SPARK: fabricate / assemble / bench a board and commit the artifacts named in `EVIDENCE-CHECKLIST.md`.
- Real-hardware visual QA of the guide gallery and hub Selected Work cards at 2×/3× DPR (automated responsive + Lighthouse cover layout and transfer, not subjective sharpness).
- Execute the manual test plans in FTG `tests/MANUAL_TESTS.md` and FSB `docs/FUSION_MANUAL_TEST_PLAN.md` (need Autodesk Fusion + a GitHub account); both were reviewed for staleness, not run.
