# Contributing — zcohen-nerd-landing-page

## Prerequisites

- **Node 22** (`.nvmrc`; `nvm use` / `fnm use`). `engines` enforces `>=22`.
- `npm ci` to install.

## Local checks

Run `npm run <script>`:

| Script            | What it checks                                                                                                                                                                                                               | CI job (`.github/workflows/quality.yml`)       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `build`           | Production build. Fails on broken **internal** links **and anchors** (`onBrokenLinks` / `onBrokenAnchors` / `onBrokenMarkdownLinks: 'throw'`).                                                                               | `build`                                        |
| `format:check`    | Prettier, **only on files changed vs the PR base** (`scripts/changed-files.mjs`).                                                                                                                                            | `format-lint`                                  |
| `format`          | Prettier **write** over the whole repo — the one-time baseline, see below.                                                                                                                                                   | —                                              |
| `lint`            | ESLint (flat config, JS/JSX). `jsx-a11y` runs here as a fast static a11y check.                                                                                                                                              | `format-lint`                                  |
| `lint:md`         | markdownlint, **only on changed `.md`/`.mdx`**.                                                                                                                                                                              | `format-lint`                                  |
| `lint:md:all`     | markdownlint over every Markdown file (has a known pre-existing backlog — see below).                                                                                                                                        | —                                              |
| `validate`        | `scripts/validate-build.js` — canonical domain, sitemap, robots, duplicate IDs, status-vocabulary pills, registry links, curated proof-layer, a11y statics. **Needs `npm run build` first.**                                 | `validators`                                   |
| `test:a11y`       | Playwright + `@axe-core/playwright` — WCAG 2.1 A/AA smoke on `/`, `/about/`, `/404.html`. Serves the built site.                                                                                                             | `a11y`                                         |
| `test:keyboard`   | Playwright — the shared brand navbar's ecosystem disclosure + mobile drawer: wiring, ARIA, open/close. `@contract` tests (focus-trap, focus-return, Escape) are `fixme` pending the brand navbar remediation.                | `keyboard`                                     |
| `test:responsive` | Playwright — no horizontal overflow, landmarks inside the viewport, tap-target sizing, and full-page screenshots at 360/390/768/1024/1440/1920 px.                                                                           | `responsive`                                   |
| `test:e2e`        | All Playwright specs.                                                                                                                                                                                                        | —                                              |
| `size`            | `size-limit` — initial JS (gzip) ≤ 165 kB, initial CSS (gzip) ≤ 20 kB. **Needs `npm run build` first.**                                                                                                                      | `bundle-budget`                                |
| `bundle-report`   | `scripts/bundle-report.mjs` — raw+gzip payloads, route-chunk count, per-route LCP candidate, render-blocking `<head>` asset count, inline-media weight; enforces `perf-budgets.json`.                                        | `bundle-budget`                                |
| `links:external`  | `scripts/check-external-links.mjs` — linkinator over the served build; verifies outbound URLs, retries transient failures, skips login-gated / bot-walled hosts (`linkinator.config.json`). **Needs `npm run build` first.** | `links-external.yml` (scheduled, non-blocking) |
| `verify`          | `format:check && lint && lint:md && validate`.                                                                                                                                                                               | —                                              |

## The one-time Prettier baseline

`format:check` and the pre-commit hook only touch files a change already
modified, so introducing Prettier did **not** reformat the repo. When the working
tree is clean, land the full sweep as its own commit:

```bash
npm run format
git commit -am "chore: prettier baseline (no behaviour change)"
```

Then add that commit's SHA to `.git-blame-ignore-revs` and
`git config blame.ignoreRevsFile .git-blame-ignore-revs`.

## Pre-commit hook (opt-in)

```bash
git config core.hooksPath .githooks
```

Runs `lint-staged` (Prettier + ESLint + markdownlint on staged files).

## CI gates

`.github/workflows/quality.yml` runs on every PR: one `build` job publishes the
`site` artifact, then `format-lint`, `validators`, `a11y`, `keyboard`,
`responsive`, and `bundle-budget` fan out from it. Each check job uploads its
report (`playwright-report/`, `reports/quality/`) as a run artifact.

`a11y`, `keyboard`, and `responsive` are **`continue-on-error` for now** — they
run and publish reports but do not block merges. They flip to blocking once the
acceptance-triage pass (below) has fixed or documented every current finding.

`.github/workflows/links-external.yml` runs weekly (and on demand) with
`--warn-only`, publishing `reports/quality/linkinator.json`. It is never a PR
gate.

Deploy (`.github/workflows/deploy.yml`) is unchanged.

## Deferred / known backlog

Not addressed by the gate rollout; tracked for a follow-up:

- **Acceptance triage** — run `test:a11y` / `test:keyboard` / `test:responsive`
  against the consolidated remediated tree; fix each finding or add a
  narrowly-scoped, commented entry to `e2e/axe-exclusions.ts`. Current known
  finding: colour-contrast on the homepage "Current focus" links.
- **Markdown backlog** — `lint:md:all` reports pre-existing `MD022/MD032/MD025`
  issues in `CLAUDE.md` and `src/pages/about.md` (duplicate H1). The `lint:md`
  gate is changed-scoped, so these do not block; clear them opportunistically.
- **Perf budgets** are ~15 % above the 2026-08 baseline; ratchet down after any
  optimisation.
