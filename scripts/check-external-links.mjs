#!/usr/bin/env node
/**
 * External (and internal) link check over the built site, using linkinator.
 *
 * Docusaurus already fails the build on broken *internal* links/anchors; this
 * additionally verifies every *outbound* URL still resolves, and catches links
 * in raw HTML / static files the MDX compiler never sees. Rate-limited /
 * login-gated / intentionally-dynamic hosts are excluded in
 * `linkinator.config.json` (mailto, tel, LinkedIn, X, Autodesk, …). linkinator
 * retries transient errors (see the config) before calling a link broken.
 *
 * It runs `docusaurus serve` (which honours the site's `baseUrl`, so subpath
 * sites like the guide work unchanged) and points linkinator at the URL that
 * command prints.
 *
 *   node scripts/check-external-links.mjs [--port 4331] [--warn-only]
 *
 * Writes reports/quality/linkinator.json. Exits 1 if any link is BROKEN unless
 * --warn-only is passed — the scheduled workflow uses --warn-only so a flaky
 * third-party host never blocks anything; local runs and PR authors get a hard
 * fail.
 */
import {mkdirSync, writeFileSync, readFileSync, existsSync} from 'node:fs';
import {dirname} from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {LinkChecker} from 'linkinator';

const args = process.argv.slice(2);
const optVal = (name, def) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--')
    ? args[i + 1]
    : def;
};
const port = Number(optVal('--port', '4331'));
const warnOnly = args.includes('--warn-only');
const reportPath = 'reports/quality/linkinator.json';

if (!existsSync('build/index.html')) {
  console.error('build/index.html not found — run `npm run build` first.');
  process.exit(1);
}

const cfg = existsSync('linkinator.config.json')
  ? JSON.parse(readFileSync('linkinator.config.json', 'utf8'))
  : {};

const server = spawn('npm', ['run', 'serve', '--', '--port', String(port)], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true, // Windows: npm is npm.cmd, which needs a shell to spawn.
});

let baseUrl = '';
const grabUrl = (buf) => {
  const m = String(buf).match(/https?:\/\/localhost:\d+\/\S*/);
  if (m && !baseUrl) baseUrl = m[0].replace(/\/+$/, '') + '/';
};
server.stdout.on('data', grabUrl);
server.stderr.on('data', grabUrl);

let cleaned = false;
const cleanup = () => {
  if (cleaned) return;
  cleaned = true;
  try {
    if (process.platform === 'win32' && server.pid) {
      spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
    } else {
      server.kill('SIGTERM');
    }
  } catch {
    /* already gone */
  }
};
process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(130);
});

// Wait for the server to announce its URL and start answering.
for (let i = 0; i < 60 && !baseUrl; i++) await sleep(500);
if (!baseUrl) baseUrl = `http://localhost:${port}/`;
for (let i = 0; i < 60; i++) {
  try {
    const r = await fetch(baseUrl);
    if (r.ok) break;
  } catch {
    /* not up yet */
  }
  await sleep(500);
}

console.log(`linkinator: crawling ${baseUrl}`);
const checker = new LinkChecker();
let scanned = 0;
checker.on('link', () => {
  if (++scanned % 100 === 0) process.stderr.write(`  …checked ${scanned}\n`);
});

const result = await checker.check({
  path: baseUrl,
  recurse: cfg.recurse ?? true,
  timeout: cfg.timeout ?? 30000,
  concurrency: cfg.concurrency ?? 24,
  retry: cfg.retry ?? true,
  retryErrors: cfg.retryErrors ?? true,
  retryErrorsCount: cfg.retryErrorsCount ?? 3,
  retryErrorsJitter: cfg.retryErrorsJitter ?? 400,
  linksToSkip: cfg.skip ?? [],
});

cleanup();

const isExternal = (u) => {
  try {
    return new URL(u).host !== new URL(baseUrl).host;
  } catch {
    return false;
  }
};
const broken = result.links.filter((l) => l.state === 'BROKEN');
const skipped = result.links.filter((l) => l.state === 'SKIPPED');
const brokenExternal = broken.filter((l) => isExternal(l.url));
const brokenInternal = broken.filter((l) => !isExternal(l.url));

mkdirSync(dirname(reportPath), {recursive: true});
writeFileSync(
  reportPath,
  JSON.stringify(
    {
      base: baseUrl,
      total: result.links.length,
      passed: result.links.length - broken.length - skipped.length,
      skipped: skipped.length,
      brokenInternal: brokenInternal.map((l) => ({
        url: l.url,
        status: l.status,
        parent: l.parent,
      })),
      brokenExternal: brokenExternal.map((l) => ({
        url: l.url,
        status: l.status,
        parent: l.parent,
      })),
    },
    null,
    2,
  ),
);

console.log(
  `\nlinkinator: ${result.links.length} links — ${
    result.links.length - broken.length - skipped.length
  } ok, ${skipped.length} skipped, ${broken.length} broken ` +
    `(${brokenInternal.length} internal, ${brokenExternal.length} external)`,
);
for (const l of broken) {
  console.log(
    `  BROKEN ${l.status} ${isExternal(l.url) ? 'ext ' : 'int '} ${l.url}\n         ↳ on ${l.parent}`,
  );
}
console.log(`report: ${reportPath}`);

if (broken.length && !warnOnly) process.exit(1);
