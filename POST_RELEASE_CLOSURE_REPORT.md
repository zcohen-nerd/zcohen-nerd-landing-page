# Post-release audit closure report

Window: 2026-08-30 → 2026-09-01. Scope: the zcohen-nerd website ecosystem
(`zcohen-nerd-brand`, `zcohen-nerd-landing-page`, `Portfolio`,
`connector-engineering-field-guide`, `PinmapGen`, `Fusion_System_Blocks`,
`FusionToGitHub`, `SPARK`). All work landed through reviewed PRs on green CI and
was verified against the live sites.

> **Final acceptance pass — 2026-09-01.** After this report was first written, an
> independent evidence-and-acceptance pass re-inspected every repository and live
> deployment. Its PASS/FAIL matrix, the SPARK physical-evidence decision, the
> "30+ custom PCBs" evidence appendix, the rights re-verification, and the
> quarterly maintenance checklist are in **[`FINAL_ACCEPTANCE.md`](./FINAL_ACCEPTANCE.md)**.
> Deltas landed in that pass:
>
> - **SPARK** (`zcohen-nerd/SPARK` PR #2 → `e474e72`): the accurate V0.4 status
>   table, `validation/EVIDENCE-CHECKLIST.md`, bring-up procedure + results
>   template, `integrity.yml` CI. No physical evidence exists → SPARK stays
>   **Prototype**, "no measurement records published".
> - **Portfolio** PR #32 → `20eb22d` + **hub** PR #16 → `dab6308`: removed the
>   unsupported "beta PCBs received / assembly underway" and "Gerbers" claims from
>   the SPARK case study and Selected Work line (SPARK exports ODB++ only). Status
>   unchanged (Prototype).
> - **Portfolio** PR #33 → `204c2ce`: `/documentation/custom-pcb-portfolio/` —
>   public-safe evidence appendix for the "30+ custom PCBs" figure.
> - **Portfolio** PR #34 → `57aa459` + **hub** PR #17 → `f99f65f`: `NOTICE.md`
>   rights re-verification — SENTRY asset count 12→11; landing NOTICE now covers
>   the responsive variants and splits `work/*` by real rights.
>
> **Verdict: fully launched, in maintenance mode, with three documented,
> credential-gated accepted limitations (OP-1/2/3) and SPARK physical evidence
> visibly pending.**

Two items require operator credentials this run did not have and are the only
things not fully closed — see [Deferred operator actions](#deferred-operator-actions).

---

## Item status

| # | Item | Status |
|---|------|--------|
| 1 | Live privacy accuracy (Cloudflare beacon vs Plausible) | **Repo-side done** (hub PR #12). Live privacy prose / NOTICE / CSP / requests all agree. Disabling the beacon is OP-2. |
| 2 | Shared brand: a11y + asset dims + Vitest 4 + version bump + publish | **Repo-side done** (brand PR #7, `main` `b4499c3`, v1.3.0). npm publish + tag + downstream pin bump is OP-1. |
| 3 | Landing keyboard contracts (6 `test.fixme` → live) | **Done** (hub PR #12) — 9/9 keyboard specs run and pass in local + CI. |
| 4 | connector-guide a11y + links + image delivery | **Done** — guide PR #88, #89. |
| 5 | Hub + Portfolio image delivery + caching | **Done** — hub PR #14 (image variants); Cloudflare cache/redirect rules documented for the operator (OP-3). |
| 6 | Portfolio split-license + asset rights inventory | **Done** — Portfolio PR #30. |
| 7 | FusionToGitHub repair (version + Ruff + README) | **Done** — FTG PR #5, #6; release `0.3.1` published. |
| 8 | PinmapGen release integrity (corrective `v0.5.2`) | **Done** — PinmapGen PR #61; release `v0.5.2` published; `v0.5.0` / `v0.5.1` tags untouched. |
| 9 | Harden supporting-repo workflows | **Done** — PinmapGen PR #62, FTG PR #7, FSB PR #328. |
| 10 | SEO / 404 / header / policy decisions | **Done** — 404 `noindex` merged on all three sites; header / HSTS / AI-crawler policy documented for the operator (OP-3). |
| 11 | Full check sweep + live Lighthouse | **Done** — see [Verification](#verification). |
| 12 | This report | — |

---

## Changes by repository

### zcohen-nerd-brand — `main` @ `b4499c3` (v1.3.0)

| PR | Merge commit | What |
|----|--------------|------|
| [#7](https://github.com/zcohen-nerd/zcohen-nerd-brand/pull/7) | `b4499c3` | Navbar wordmark `width={347} height={55}` (no visual change); Vitest 2 / Vite 5 → **Vitest 4.1.11 / Vite 8.2.2** (oxc transformer, automatic JSX runtime); `esbuild` made an explicit devDep for the JSX-in-`.js` swizzle transform; removed the obsolete `vitest` / `vite` audit-allowlist exceptions (kept the justified Docusaurus build-only / dev-server ones); one-time Prettier baseline (33 files, SHA in `.git-blame-ignore-revs`); `CHANGELOG.md`; `audit-ci.mjs` de-pipe fix. `build` + `pack:dry` + `registry-validate` + `lint` + `format` + audit gate + 26 component tests green. |

Not done: `npm publish @zcohen-nerd/brand@1.3.0`, `git tag v1.3.0`, GitHub
release, and the hub / Portfolio / guide pin bump to `1.3.0` — **OP-1** (2FA OTP
required for `npm publish`).

### zcohen-nerd-landing-page (hub) — `main` @ `bdb463f`

| PR | Merge commit | What |
|----|--------------|------|
| [#12](https://github.com/zcohen-nerd/zcohen-nerd-landing-page/pull/12) | `2d06fb7` | **Item 1** — `privacy.md` + `NOTICE.md` rewritten to disclose the Cloudflare Web Analytics beacon (`static.cloudflareinsights.com/beacon.min.js`, `POST /cdn-cgi/rum`) alongside Plausible; new `scripts/check-third-party-origins.mjs` (built + live modes, explicit allowlist) wired into `validate-build.js` and a post-deploy live smoke step in `deploy.yml`. **Item 3** — all six `test.fixme` removed from `e2e/keyboard.spec.ts`; in-drawer "Close menu" locator scoped to `#zc-mobile-drawer`; 9/9 keyboard specs run + pass. `audit-ci.mjs` de-pipe fix; fresh-clone guard in `validate-build.js`; MD025 config. |
| [#13](https://github.com/zcohen-nerd/zcohen-nerd-landing-page/pull/13) | `93e0989` | **Item 10** — `<meta name="robots" content="noindex, follow">` on the custom 404 via `@docusaurus/Head` in `NotFound/Content`. HTTP 404 + recovery links unchanged. |
| [#14](https://github.com/zcohen-nerd/zcohen-nerd-landing-page/pull/14) | `bdb463f` | **Item 5** — `scripts/gen-image-variants.mjs` (sharp) → 15 WebP variants (headshot 52/104/156 w; SURFER / SENTRY / SPARK cards 340/512/768/1024 w); `src` / `srcSet` / `sizes` wired in `src/pages/index.js`; `sharp@^0.35.4` devDep (patched for the libvips CVEs); the `validate-build.js` "one headshot" guard now counts `<img>` elements. **Items 5 + 10** — `CLOUDFLARE-OPERATOR-CHECKLIST.md` (cache rules, `http://www` → apex redirect, AI-crawler policy, HSTS ramp, GitHub-Pages header limitation); `NOTICE.md` links it. |

### Portfolio — `main` @ `20a8c31`

| PR | Merge commit | What |
|----|--------------|------|
| [#30](https://github.com/zcohen-nerd/Portfolio/pull/30) | `e5e037e` | **Item 6** — replaced the overbroad `LICENSE.md` with a split license: `LICENSE-CODE` (MIT), `LICENSE-CONTENT.md` (CC BY-NC 4.0, original prose only), `LICENSE.md` (umbrella table), `TRADEMARKS.md` (marks reserved), `NOTICE.md` (53-asset rights inventory covering every shipped image / PDF / non-code artifact; institutional / third-party assets marked "rights status requires owner confirmation" and excluded, not deleted); `package.json` → `SEE LICENSE IN LICENSE.md`; `CONTRIBUTING.md` media-provenance rule. |
| [#31](https://github.com/zcohen-nerd/Portfolio/pull/31) | `20a8c31` | **Item 10** — 404 `noindex` (same pattern as the hub); dropped the unused `React` import. |

### connector-engineering-field-guide — `main` @ `de118f9`

| PR | Merge commit | What |
|----|--------------|------|
| [#88](https://github.com/zcohen-nerd/connector-engineering-field-guide/pull/88) | `9e78cf9` | **Item 4** — Navbar home link: removed the `aria-label` that replaced the visible wordmark (fixed axe `label-content-name-mismatch`), added a visually-hidden " — home page" purpose clause, dropped the unused `React` import. `validate-build.mjs`: replaced the stale "no JSON-LD" note with seven `TechArticle` shape assertions + a blocking regression guard on the home link (no `aria-label`; text contains both wordmark lines + "home"). New `e2e/a11y-home-link.spec.ts`. `scripts/gen-gallery-variants.mjs` → 16 WebP variants for the four `docs/index.md` home-gallery photos (320/480/640/800 w); `srcset` / `sizes` / explicit `width`/`height` / `loading="lazy"`; `docs/image-attributions.md` updated (same creator / source / license, size only); **AVIF intentionally omitted** — `validate-images.mjs` blocks it (the `image-size` parser can hang). `docs/lifecycle-and-procurement.md`: dead `www.dau.mil` SD-22 link → `https://dau.edu/tools/t/SD-22-…` + ASSIST/QuickSearch note. `check-external-links.mjs`: 401/403/429 → browser-UA recheck → `BLOCKED` (indeterminate), not `BROKEN`; overall + recheck-phase caps. `audit-ci.mjs` de-pipe fix; `eslint.config.mjs` ignores `.venv/`; `.markdownlint-cli2.jsonc` MD025. |
| [#89](https://github.com/zcohen-nerd/connector-engineering-field-guide/pull/89) | `de118f9` | **Item 10** — 404 `noindex` via a thin `@theme/NotFound/Content` wrapper. |

### PinmapGen — `main` @ `69bb8a7`

| PR | Merge commit | What |
|----|--------------|------|
| [#61](https://github.com/zcohen-nerd/PinmapGen/pull/61) | `bb43825` | **Item 8** — single `tools.pinmapgen.__version__` (importlib.metadata + `_FALLBACK_VERSION`); `cli.py`, `emit_json.py`, `emit_markdown.py` de-hardcoded to read it; `pyproject.toml` → `0.5.2`; new `tests/test_version_consistency.py`; `release.yml` refuses to build unless tag == pyproject == `__version__` == CLI `--version` == freshly-generated `pinmap.json` version, and refuses to move an existing tag; `CONTRIBUTING.md` "Cutting a release" rewritten; example outputs regenerated. **392 passed, 39 subtests**. Release [`v0.5.2`](https://github.com/zcohen-nerd/PinmapGen/releases/tag/v0.5.2) published from `bb43825`; notes state the older `v0.5.0` / `v0.5.1` snapshots carried stale internal `0.1.0` metadata and that `v0.5.2` is the first internally consistent release, without implying the immutable tags changed. `v0.5.0` → `866e07d`, `v0.5.1` → `3264e3d` unchanged. |
| [#62](https://github.com/zcohen-nerd/PinmapGen/pull/62) | `69bb8a7` | **Item 9** — `actions/checkout` `11d5960` (v4.4.0), `setup-python` `a26af69` (v5.6.0), `setup-node` `49933ea` (v4.4.0) pinned across all four workflows; `permissions: contents: read` on `build-test.yml` + `validate-pinmaps.yml`; `release.yml` keeps its job-scoped `contents: write`; new `.github/dependabot.yml` (weekly grouped github-actions). |

### FusionToGitHub — `main` @ `ff5a0d3`

| PR | Merge commit | What |
|----|--------------|------|
| [#5](https://github.com/zcohen-nerd/FusionToGitHub/pull/5) | `44c00aa` | **Item 7** — one version everywhere: `src/fusion_git_core.py:VERSION = "0.3.1"`, manifest, `Push_To_GitHub.py` (`VERSION = CORE_VERSION`), new `--version` CLI flag, README "Version: `0.3.1`" bullet; every stale `V7.7` product/version reference replaced across tests / docs / milestones (example branch names and generic VCS prose left alone); new `test_t_version_consistency` covering the manifest + all user-visible version surfaces; `ruff.toml` pins the historical `select` set + CI pins `ruff==0.16.5` (root cause of the red CI was ruff 0.16 broadening its default `select`, not a regression — no rule classes disabled); README "every version forever" / "nothing is ever overwritten" claims softened with a "History is durable, not immutable" note. 19/19 automated tests pass. Release [`0.3.1`](https://github.com/zcohen-nerd/FusionToGitHub/releases/tag/0.3.1) published; tag `0.3` never moved. |
| [#6](https://github.com/zcohen-nerd/FusionToGitHub/pull/6) | `939f5dc` | CHANGELOG wording fix (only the `0.3` tag ever existed). |
| [#7](https://github.com/zcohen-nerd/FusionToGitHub/pull/7) | `ff5a0d3` | **Item 9** — `checkout` / `setup-python` / `setup-node` SHA-pinned; `.github/dependabot.yml`. Workflow already had `permissions: contents: read`. |

### Fusion_System_Blocks — `main` @ `bf84865`

| PR | Merge commit | What |
|----|--------------|------|
| [#328](https://github.com/zcohen-nerd/Fusion_System_Blocks/pull/328) | `bf84865` | **Item 9** — `checkout` / `setup-python` / `setup-node` / `codecov/codecov-action` `b9fd7d1` (v4.6.0) / `dorny/test-reporter` `31a54ee` (v1.9.1) SHA-pinned; `checks: write` pushed from the workflow default down to the `test` job only; new `.github/dependabot.yml`. Also pinned `ruff==0.16.5` and scoped `ruff format --check` to the Python packages — a newer unpinned ruff had started reformatting Python snippets inside `.github/*.md` docs (red with no code change). **775 Python tests + 24 JS tests pass**; version stays `0.1.1` / Public Beta; no product or license language touched (no "open source" mislabel — confirmed by grep). The repo's other uncommitted work-in-progress (`README.md` rewrite etc.) was left untouched. |

---

## Verification

### Per-repo gates (local, unless noted)

| Repo | Result |
|------|--------|
| brand | `npm ci` (Node 22) → build + `prepublishOnly` (26 tests) + `pack:dry` (29 files / 128.8 kB) + registry-validate + lint + format + audit gate — all green. PR CI green. |
| hub | `npm run build` clean · `npm run validate` pass (incl. 2 JSON-LD blocks, Plausible-only built origins, `/privacy/` present) · `npm run size` JS 146.7 / 165 kB, CSS 17.6 / 20 kB · audit gate PASS · eslint clean · Playwright a11y + keyboard + responsive all pass. PR CI green. |
| Portfolio | `npm run build` clean · `npm run validate` pass · `npm run size` within budget · eslint clean · Playwright a11y + responsive pass. PR CI green. |
| guide | `npm run build` clean · `npm run validate` **23/23** · `npm run typecheck` clean · `npm run lint` 0 errors (3 pre-existing warnings in `bump-version.mjs` / `bundle-report.mjs`, not touched — flagged as a separate chip) · `npm run size` JS 154.5 / 175 kB, CSS 19.0 / 22 kB · Playwright **17/17** (a11y, a11y-home-link, responsive 360–1920). External-link crawl: **458 links — 370 ok, 81 skipped, 7 blocked/indeterminate, 0 broken.** PR CI green (build ×3, format-lint, validators, bundle-budget, audit, a11y, responsive). |
| PinmapGen | `python -m pytest -q` → **392 passed, 39 subtests**. PR CI green on ubuntu / macOS / windows × Python 3.11–3.14 + validate-pinmaps + validate-comprehensive + packaging + docs. Release workflow green. |
| FusionToGitHub | `python tests/test_runner.py` → **19/19**. PR CI green (Lint, Docs Integrity, Test on ubuntu/windows × 3.10–3.12). |
| FSB | `pytest` → **775 passed**; `node tests/js/run-tests.js` → **24 passed**; `ruff check .` → all checks pass. PR CI green (Lint, Type check, JS harness, Python 3.9–3.12). |

### Live sites (2026-09-01, after deploy)

**Lighthouse mobile** (`lighthouse … --form-factor=mobile --screenEmulation.mobile`, headless Chrome):

| Site | Performance | Accessibility | Best-practices | SEO | LCP | CLS | Total bytes |
|------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| zcohen-nerd.com | **100** | **100** | **100** | **100** | 1.1 s | 0 | — |
| portfolio.zcohen-nerd.com | **100** | **100** | **100** | **100** | 1.3 s | 0 | — |
| connector guide | **100** | **100** | **100** | **100** | 1.1 s | 0 | **271 KiB** |

Baseline was 93 / 96 / 99 performance and 100 a11y / BP / SEO. **No regression** —
hub and guide performance rose to 100. The guide's `uses-responsive-images` and
`modern-image-formats` audits no longer fire (the ~749 KiB "avoidable image
transfer" finding is gone); mobile home total transfer is **271 KiB**, well under
the ~988 KiB ceiling.

**Redirects / status:**

```text
http://zcohen-nerd.com/         301 → https://zcohen-nerd.com/
https://www.zcohen-nerd.com/    301 → https://zcohen-nerd.com/
http://www.zcohen-nerd.com/     301 → https://www.zcohen-nerd.com/   (then → apex; the extra hop is collapsed by CLOUDFLARE-OPERATOR-CHECKLIST.md §C)
http://portfolio.zcohen-nerd.com/  301 → https://portfolio.zcohen-nerd.com/
GET https://zcohen-nerd.com/<missing>            → HTTP 404 + <meta robots noindex, follow>
GET https://portfolio.zcohen-nerd.com/<missing>  → HTTP 404 + <meta robots noindex, follow>
GET …/connector-engineering-field-guide/<missing>→ HTTP 404 + <meta robots noindex, follow>
```

**Live headers — `zcohen-nerd.com`** (Cloudflare-proxied):

```text
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none';
  frame-src 'none'; form-action 'self'; worker-src 'none'; manifest-src 'self';
  script-src 'self' 'sha256-bI2b8zL8…' 'sha256-0MUyFJhU…' https://plausible.io https://static.cloudflareinsights.com;
  style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;
  connect-src 'self' https://plausible.io https://static.cloudflareinsights.com; upgrade-insecure-requests
Strict-Transport-Security: max-age=2592000          (30 d, no includeSubDomains, no preload — as intended)
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
Permissions-Policy: … (locked-down feature set)
Cache-Control: max-age=600                           (HTML)
```

`portfolio.zcohen-nerd.com` and the guide are `Server: GitHub.com` with **no**
CSP / HSTS / Referrer-Policy / Permissions-Policy — GitHub Pages does not allow
custom response headers. Accepted; rationale + migration path in
`CLOUDFLARE-OPERATOR-CHECKLIST.md` §F.

**Analytics origins vs privacy prose:** the hub's served HTML references only
`https://plausible.io/js/script.outbound-links.js`. `static.cloudflareinsights.com`
is Cloudflare edge-injected — disclosed in `/privacy/` and `NOTICE.md`, and
allowed in the live CSP `script-src` + `connect-src`. Prose, NOTICE, CSP, and the
actual request set agree.

**Structured data / metadata:** guide home carries `TechArticle` JSON-LD
(`@type`, canonical `url`, absolute `image`, named `author`, `isPartOf`);
`aria-label="Connector Field Guides home"` is gone and the visually-hidden
"home page" text is present. All OG images across the three sites are **1200 × 630**
(guide `og-card.png`; hub `og-zcohen-nerd.png`; Portfolio's ten route cards incl.
`og-surfer.jpg`), referenced by absolute URLs. `sitemap.xml` + `robots.txt` →
200 on all three; hub `/site.webmanifest` → 200; `zac-cohen-resume.pdf` → 200
`application/pdf`; `/privacy/` → 200 on hub + Portfolio.

**Repo metadata:** all seven repos have a description, homepage URL, and topics.
PinmapGen and FSB descriptions use neutral product language (no "open source").
CI on every `main` is green. Releases: PinmapGen `v0.5.2`, FusionToGitHub `0.3.1`
published; `v0.5.0` / `v0.5.1` / `0.3` and brand `v1.1.0` / `v1.2.0` untouched.

---

## Accepted risks

| Risk | Owner | Review by |
|------|-------|-----------|
| Hub HSTS is at a conservative `max-age=2592000` (30 d), no `includeSubDomains`. A stolen-then-downgraded first request is theoretically possible in that window. Ramp plan in `CLOUDFLARE-OPERATOR-CHECKLIST.md` §E; `preload` deliberately not pursued. | site owner | 2026-11-30 |
| `static.cloudflareinsights.com` beacon still loads (Cloudflare Web Analytics on). Disclosed and CSP-allowed, so **not** a privacy inaccuracy; removing it is a cleanup (OP-2). | site owner | 2026-11-30 |
| `portfolio.zcohen-nerd.com` + guide ship no CSP/HSTS (GitHub Pages direct). Static content, no credentialed surface, no third-party scripts on Portfolio, none on the guide. | site owner | 2026-11-30 |
| 3 pre-existing `no-unused-vars` warnings in the guide's `scripts/bump-version.mjs` / `bundle-report.mjs` (not in scope for item 4; a background chip was spawned). | — | next guide change |
| FSB has a large uncommitted `README.md` rewrite + untracked `SECURITY.md` / `.github/ISSUE_TEMPLATE/` predating this work; left untouched. | repo owner | — |
| `git config core.autocrlf=true` on the authoring machine makes local `prettier --check` / `eslint .` report false positives on CRLF and on `.venv/`. CI (Linux, LF) is authoritative and green. | — | — |

---

## Deferred operator actions

These are the only items that could not be completed here, each blocked on a
credential this run did not hold. Details, exact commands, and verification
steps: `zcohen-nerd-workspace/.../scratchpad/closeout/operator-actions.md` and
`CLOUDFLARE-OPERATOR-CHECKLIST.md`.

### OP-1 — publish `@zcohen-nerd/brand@1.3.0`

`npm publish` needs a 2FA OTP. Everything repo-side is done and verified
(`main` `b4499c3`, `prepublishOnly` green, `pack --dry-run` contents checked).
Steps: `npm publish --access public --otp=<code>` → `git tag v1.3.0` (on
`b4499c3`, never move `v1.1.0` / `v1.2.0`) → `gh release create v1.3.0` → in the
hub / Portfolio / guide, `npm install --save-exact @zcohen-nerd/brand@1.3.0`,
rebuild, PR. (This is the one open sub-task of item 2.)

### OP-2 — disable Cloudflare Web Analytics (optional cleanup)

Cloudflare dashboard → Analytics & Logs → Web Analytics → off for
`zcohen-nerd.com`; then trim `static.cloudflareinsights.com` from the CSP
Transform Rule, from `LIVE_ALLOWLIST` in `scripts/check-third-party-origins.mjs`,
and from the Cloudflare-beacon rows of `privacy.md` + `NOTICE.md`. Not a
correctness blocker — the current privacy statement is accurate.

### OP-3 — apply the Cloudflare zone changes for items 5 & 10

Per `CLOUDFLARE-OPERATOR-CHECKLIST.md`: §B cache rules (immutable `/assets/<hash>`,
revalidatable HTML / sitemap / robots / manifest), §C one-hop `http://www` → apex
redirect, §E the HSTS ramp. Each has a copy-paste rule expression and a `curl`
verification. No repo change needed; these live in the Cloudflare zone.

---

## Genuinely non-automatable evidence deferred to the next prompt

- **Search Console:** create / verify the Google + Bing properties, submit the
  three sitemaps, paste verification tokens into the `headTags` placeholders,
  and record the 28-day baseline (top queries / pages). Needs the owner logged
  in to each console. `SEARCH-CONSOLE-CHECKLIST.md` (hub) has the runbook.
- **Cloudflare dashboard screenshots / confirmation** that OP-2 and OP-3 were
  applied, plus the post-change `curl` header captures.
- **npm** confirmation that `@zcohen-nerd/brand@1.3.0` is published and the
  three consumers repin (OP-1).
- **Visual QA** of the two-track guide gallery and the hub Selected Work cards
  on real mobile hardware at 2× / 3× DPR (automated responsive + Lighthouse
  cover layout and transfer, not subjective sharpness).
- **Manual test procedures** in FusionToGitHub `tests/MANUAL_TESTS.md` and FSB
  `docs/FUSION_MANUAL_TEST_PLAN.md` — they need Autodesk Fusion and a GitHub
  account, and were reviewed for staleness (no `V7.7`) but not executed here.
