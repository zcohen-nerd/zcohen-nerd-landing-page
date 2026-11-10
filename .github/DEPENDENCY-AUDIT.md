# Dependency audit

The gate rejects every unapproved root npm advisory at every severity. npm also
reports affected parent packages; these cascades are traced to their root
advisories rather than treated as separate vulnerabilities. Registry failures,
invalid reports, inconsistent counts, and invalid exception files fail closed.

## Dependency fixes

Use compatible lockfile updates first. The October 2026 remediation refreshes
shared Docusaurus and development-tool transitive dependencies, including
shell-quote, follow-redirects, source-map-js, DOMPurify where installed, and
request-body/selector parsers. Existing Dependabot development updates are
included. No Docusaurus or React major migration is required.

KaTeX is overridden to its patched 0.18 series because the old 0.16 requirements
cannot select the fix. Validate math rendering and Markdown linting when updating
this override. Where present, the serializer and UUID overrides use the same
patched major versions already used by the other sites; builds and tests must
verify the consumers.

## Residual exceptions

Three root packages have scoped exceptions: http-cache-semantics 4.2.0 in the local CLI
update checker, tinypool 1.1.1 in trusted Docusaurus build workers, and deepmerge
4.3.1, declared but not imported by the installed SVGR optimizer. These are
risk acceptances, not patched dependencies or a clean raw npm audit. The exception
file records their exact advisories, dependency paths, exposure, upstream evidence,
and a review deadline of November 30, 2026.

An exception matches the package, every root advisory ID, every affected installed
version, and severity. Unknown advisories, changed versions, unreviewed nested
copies, and expired exceptions fail the gate. Expired stale entries also fail
until removed. Re-review the documented path if a consumer or usage changes; the
gate does not infer application reachability from package names or automatically
approve future vulnerabilities on an excepted package.

## November 10, 2026 PR review

The Playwright update moves the test runner and browser packages to 1.65.0.
Joi is refreshed within its supported 17.x range to 17.13.9. A Markdownlint-scoped
override replaces its pinned re2js 2.8.6 with patched 2.8.7. A Linkinator-scoped
glob 14 override also selects patched minimatch 11; its named asynchronous
`glob()` API is checked through relative/rooted file-pattern expansion and
no-match handling. Older minimatch 3 copies are outside this advisory's range.

Deepmerge GHSA-gcqx-w48m-w2h4 has no patched release. Its only installed consumer,
`@svgr/plugin-svgo@8.1.0`, declares the dependency but does not import it in its
distributed implementation. The exact-version 4.3.1 build-only exception expires
November 30 alongside the existing exceptions; it does not authorize untrusted
object merging or additional consumers. Source:
<https://github.com/advisories/GHSA-gcqx-w48m-w2h4>.

## Run locally

Use Node 22 and npm 10, as in CI:

```sh
npm ci --no-audit --no-fund
node --test scripts/test-audit-ci.mjs
node scripts/audit-ci.mjs
npm run build
```

Also run the repository's normal verification checks. The gate accepts npm exit
code 1 only when accompanied by a complete, valid vulnerability report; it then
applies the exception rules itself. Its tests use isolated fixtures and a fake
npm command, and never contact the registry.

CI runs for dependency/audit pull requests and relevant pushes to main, with a
weekly check at 13:23 UTC on Monday. That is after Dependabot's configured 06:00
America/New_York update window in both daylight and standard time. The schedule
does not assume that a proposed Dependabot update has been merged.
