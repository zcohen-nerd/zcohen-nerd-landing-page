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
 * An outbound 401/403/429 is re-checked once here with a browser-like GET and,
 * if it still won't resolve, reported as BLOCKED (indeterminate) rather than
 * BROKEN — bot walls must not gate a content change. Hard 404/410/5xx stay
 * BROKEN.
 *
 * It runs `docusaurus serve` (which honours the site's `baseUrl`, so subpath
 * subpath sites work unchanged) and points linkinator at the URL that
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
// linkinator emits a `link` event per checked URL — keep every result so an
// overall-deadline abort can still report what completed.
const seen = [];
checker.on('link', (l) => {
  seen.push(l);
  if (++scanned % 100 === 0) process.stderr.write(`  …checked ${scanned}\n`);
});

// A single hung socket can wedge linkinator's queue so `check()` never
// resolves. Cap the whole crawl; on the cap, report what was collected.
const overallMs = Number(cfg.overallTimeoutMs ?? optVal('--max-ms', '480000'));
let timedOut = false;
const result = await Promise.race([
  checker.check({
    path: baseUrl,
    recurse: cfg.recurse ?? true,
    timeout: cfg.timeout ?? 30000,
    concurrency: cfg.concurrency ?? 24,
    retry: cfg.retry ?? true,
    retryErrors: cfg.retryErrors ?? true,
    retryErrorsCount: cfg.retryErrorsCount ?? 3,
    retryErrorsJitter: cfg.retryErrorsJitter ?? 400,
    linksToSkip: cfg.skip ?? [],
  }),
  sleep(overallMs).then(() => {
    timedOut = true;
    return {links: seen};
  }),
]);

cleanup();

if (timedOut) {
  console.warn(
    `\n⚠ crawl hit the ${Math.round(overallMs / 1000)}s overall cap — ` +
      `reporting ${seen.length} link(s) checked so far (a slow host wedged the queue).`,
  );
}

const isExternal = (u) => {
  try {
    return new URL(u).host !== new URL(baseUrl).host;
  } catch {
    return false;
  }
};

// 401 / 403 / 429 from an outbound host is "we were blocked", not "the page is
// gone" — bot walls, WAFs, and rate limiters return these to a headless
// crawler for URLs that are fine in a browser. Re-check each once with a
// browser-like GET; promote to OK if it resolves, otherwise record it as
// BLOCKED (indeterminate) rather than BROKEN so a content change is never
// gated on someone else's bot policy. A hard 404/410/5xx stays BROKEN.
const INDETERMINATE = new Set([401, 403, 429]);
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function recheck(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'user-agent': UA,
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(10000),
      });
      if (r.status < 400) return {ok: true, status: r.status};
      if (!INDETERMINATE.has(r.status))
        return {ok: false, status: r.status, hard: true};
    } catch {
      /* network/timeout — try once more, then treat as indeterminate */
    }
    if (attempt === 0) await sleep(1200 + Math.floor(Math.random() * 800));
  }
  return {ok: false, status: 0};
}

// Run the rechecks with bounded concurrency and an overall cap so a batch of
// slow bot-walled hosts can't stretch the tail for many minutes.
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from(
    {length: Math.min(limit, items.length)},
    async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    },
  );
  await Promise.all(workers);
  return out;
}

const rawBroken = result.links.filter((l) => l.state === 'BROKEN');
const toRecheck = rawBroken.filter(
  (l) => isExternal(l.url) && INDETERMINATE.has(Number(l.status)),
);
const passthrough = rawBroken.filter((l) => !toRecheck.includes(l));

const recheckResults = await Promise.race([
  mapLimit(toRecheck, 8, (l) => recheck(l.url)),
  sleep(120000).then(() => null), // recheck phase cap: 2 min
]);

const blocked = [];
const broken = [...passthrough];
toRecheck.forEach((l, idx) => {
  const res = recheckResults?.[idx];
  if (res?.ok) return; // recovered — not a problem
  if (res?.hard) broken.push({...l, status: res.status});
  else blocked.push(l); // still 401/403/429, timed out, or recheck phase capped
});

const skipped = result.links.filter((l) => l.state === 'SKIPPED');
const brokenExternal = broken.filter((l) => isExternal(l.url));
const brokenInternal = broken.filter((l) => !isExternal(l.url));

mkdirSync(dirname(reportPath), {recursive: true});
writeFileSync(
  reportPath,
  JSON.stringify(
    {
      base: baseUrl,
      timedOut,
      total: result.links.length,
      passed:
        result.links.length - broken.length - blocked.length - skipped.length,
      skipped: skipped.length,
      blockedIndeterminate: blocked.map((l) => ({
        url: l.url,
        status: l.status,
        parent: l.parent,
      })),
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
    result.links.length - broken.length - blocked.length - skipped.length
  } ok, ${skipped.length} skipped, ${blocked.length} blocked/indeterminate, ` +
    `${broken.length} broken (${brokenInternal.length} internal, ${brokenExternal.length} external)`,
);
for (const l of blocked) {
  console.log(
    `  BLOCKED ${l.status} ext  ${l.url}\n          ↳ on ${l.parent} (401/403/429 to the crawler — verify in a browser)`,
  );
}
for (const l of broken) {
  console.log(
    `  BROKEN ${l.status} ${isExternal(l.url) ? 'ext ' : 'int '} ${l.url}\n         ↳ on ${l.parent}`,
  );
}
console.log(`report: ${reportPath}`);

if (broken.length && !warnOnly) process.exit(1);
