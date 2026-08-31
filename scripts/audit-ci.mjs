#!/usr/bin/env node
/**
 * Dependency-audit gate.
 *
 * `npm audit` counts every package in a broken dependency chain, so a static
 * Docusaurus site routinely shows dozens of "high" advisories that are all
 * build-time tooling and never reach the deployed site or a browser. This gate
 * separates real deployed-runtime / direct-dependency exposure from build- and
 * dev-server-only noise, and only fails the build on the former.
 *
 * Policy:
 *   - any CRITICAL                                    -> fail
 *   - HIGH that is a DIRECT dependency                -> fail
 *   - HIGH/CRITICAL whose dependency path is entirely
 *     browser-runtime (no webpack/dev-server/build)   -> fail
 *   - everything else (build-only, dev-server-only)   -> report, pass
 *   - an allowlisted advisory (.github/audit-allowlist.json)
 *     past its `review_by` date                       -> fail (forces re-review)
 *
 * Run: npm audit --json | node scripts/audit-ci.mjs
 *   or: node scripts/audit-ci.mjs   (runs `npm audit --json` itself)
 */
import {readFileSync, existsSync} from 'node:fs';
import {execSync} from 'node:child_process';

const ALLOWLIST_PATH = '.github/audit-allowlist.json';

// Path substrings that mean "this can never run on the deployed site".
const DEV_SERVER = [
  'webpack-dev-server',
  'sockjs',
  'launch-editor',
  'bonjour-service',
  'selfsigned',
  'spdy',
];
const BUILD_ONLY = [
  '@docusaurus/bundler',
  'webpack/',
  'terser',
  'html-minifier',
  'serialize-javascript',
  'copy-webpack-plugin',
  'css-minimizer-webpack-plugin',
  'svgo',
  'postcss',
  'cssnano',
  'shell-quote',
  'brace-expansion',
  'fast-uri',
  'nanoid',
  '@docusaurus/mdx-loader',
  'image-size',
  'js-yaml',
  'gray-matter',
  'eslint',
  'babel',
];

function readAudit() {
  const piped = !process.stdin.isTTY;
  if (piped) {
    try {
      const raw = readFileSync(0, 'utf8').trim();
      if (raw) return JSON.parse(raw);
    } catch {
      /* fall through */
    }
  }
  return JSON.parse(
    execSync('npm audit --json', {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    }),
  );
}

// Advisory-package names that, in a Docusaurus project, are always reached
// only through webpack-dev-server (i.e. `npm start`, localhost).
const DEV_SERVER_PKGS = new Set([
  'webpack-dev-server',
  'sockjs',
  'uuid',
  'body-parser',
  'http-proxy-middleware',
  'launch-editor',
  'selfsigned',
  'ws',
]);

function classify(name, info) {
  const paths = [
    name,
    ...(info.nodes || []),
    ...(info.via || []).filter((v) => typeof v === 'string'),
    ...(info.effects || []),
  ].join(' ');
  if (DEV_SERVER_PKGS.has(name) || DEV_SERVER.some((m) => paths.includes(m)))
    return 'dev-server';
  if (BUILD_ONLY.some((m) => paths.includes(m))) return 'build/CI';
  // A vuln with no build/dev marker AND that is or feeds a direct dep is treated
  // as potentially runtime-exposed.
  return info.isDirect ? 'direct/unknown' : 'transitive/unknown';
}

const audit = readAudit();
const vulns = audit.vulnerabilities || {};
const meta = audit.metadata?.vulnerabilities || {};

let allow = [];
if (existsSync(ALLOWLIST_PATH)) {
  allow = JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8')).advisories || [];
}
const allowByPkg = new Map(allow.map((a) => [a.package, a]));
const today = new Date().toISOString().slice(0, 10);

const rows = [];
const failures = [];
const expired = [];

for (const [name, info] of Object.entries(vulns)) {
  const advisories = (info.via || []).filter((v) => typeof v === 'object');
  if (advisories.length === 0) continue; // cascade-only entry, not a root advisory
  const exposure = classify(name, info);
  const a = allowByPkg.get(name);
  const ids = advisories
    .map((x) => x.url?.split('/').pop() || x.source)
    .join(', ');
  rows.push({
    name,
    severity: info.severity,
    direct: !!info.isDirect,
    exposure,
    allow: !!a,
    ids,
  });

  if (a) {
    if (a.review_by && a.review_by < today)
      expired.push({name, review_by: a.review_by});
    continue; // documented exception
  }
  const runtimeExposed =
    exposure === 'direct/unknown' || exposure === 'transitive/unknown';
  if (info.severity === 'critical')
    failures.push({name, why: 'critical severity'});
  else if (info.severity === 'high' && info.isDirect)
    failures.push({name, why: 'high severity on a direct dependency'});
  else if (info.severity === 'high' && runtimeExposed)
    failures.push({
      name,
      why: 'high severity with no build/dev-server marker (possible runtime exposure)',
    });
}

const w = (s, n) => String(s).padEnd(n);
console.log(
  `\nnpm audit rollup: ${meta.critical || 0} critical, ${meta.high || 0} high, ${meta.moderate || 0} moderate, ${meta.low || 0} low (npm counts every package in each broken chain)\n`,
);
console.log(
  `${w('root advisory pkg', 26)} ${w('sev', 9)} ${w('direct', 7)} ${w('exposure', 18)} ${w('allowlisted', 12)} advisory`,
);
console.log('-'.repeat(100));
for (const r of rows.sort(
  (x, y) =>
    x.exposure.localeCompare(y.exposure) ||
    y.severity.localeCompare(x.severity),
)) {
  console.log(
    `${w(r.name, 26)} ${w(r.severity, 9)} ${w(r.direct ? 'yes' : 'no', 7)} ${w(r.exposure, 18)} ${w(r.allow ? 'yes' : '-', 12)} ${r.ids}`,
  );
}

if (expired.length) {
  console.log(
    '\nAllowlisted advisories PAST their review_by date (re-review required):',
  );
  for (const e of expired)
    console.log(`  - ${e.name} (review_by ${e.review_by})`);
}
if (failures.length) {
  console.log('\nFAIL — advisories requiring action:');
  for (const f of failures) console.log(`  - ${f.name}: ${f.why}`);
}
const bad = failures.length + expired.length;
console.log(
  `\n${bad ? `FAILED (${bad})` : 'PASS — residual advisories are build-only / dev-server-only / documented exceptions'}`,
);
process.exit(bad ? 1 : 0);
