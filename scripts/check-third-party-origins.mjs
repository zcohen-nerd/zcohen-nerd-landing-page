#!/usr/bin/env node
/**
 * Third-party origin inventory + allowlist gate.
 *
 * The Privacy page and NOTICE.md make an exact claim about which origins the hub
 * talks to. This script proves it, and fails when reality drifts.
 *
 *   node scripts/check-third-party-origins.mjs --mode built
 *     Scans build/**\/*.html for every cross-origin URL (src/href/imports).
 *     Every origin must be in BUILT_ALLOWLIST (only what this repo's own source
 *     references — currently just Plausible). Run after `npm run build`.
 *
 *   node scripts/check-third-party-origins.mjs --mode live --base https://zcohen-nerd.com
 *     Fetches the key routes with a browser UA and inventories cross-origin
 *     URLs in the *served* HTML — which includes anything Cloudflare injects at
 *     its edge. Every origin must be in LIVE_ALLOWLIST. Plausible must be
 *     present on `/`. Run after deploy.
 *
 * "Fails when the live/deployed origin set differs from the allowlist" = any
 * origin outside the allowlist is a hard failure. Origins inside the allowlist
 * that happen not to appear on a given request (Cloudflare injects its beacon
 * only on some responses) are reported, not failed — the allowlist is the
 * contract, edge behaviour is Cloudflare's.
 */
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';

const SELF = ['zcohen-nerd.com', 'www.zcohen-nerd.com'];

// Origins the repository's own built output is allowed to reference.
const BUILT_ALLOWLIST = ['https://plausible.io'];

// Origins allowed to appear in the live/served HTML. Superset of BUILT: adds
// what Cloudflare injects at its edge for the proxied zone (Web Analytics
// beacon). Keep in exact sync with src/pages/privacy.md and NOTICE.md.
const LIVE_ALLOWLIST = [
  'https://plausible.io',
  'https://static.cloudflareinsights.com',
];

const ROUTES = ['/', '/about/', '/privacy/', '/404'];
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
};

// Absolute http(s) URLs the page actually *loads* as a sub-resource — script,
// stylesheet/preload, image, media, iframe, font, and any URL a script fetches.
// Deliberately NOT <a href> (those are navigation, not requests).
function extractUrls(html) {
  const urls = new Set();
  const add = (u) => u && urls.add(u.replace(/&amp;/g, '&'));

  // <script src>, <img src>, <iframe src>, <source/audio/video/track/embed src>
  const srcTag =
    /<(?:script|img|iframe|source|audio|video|track|embed)\b[^>]*?\bsrc\s*=\s*["']?(https?:\/\/[^"'\s>]+)/gi;
  // <link href> (stylesheet / preload / modulepreload / prefetch / preconnect …)
  const linkTag = /<link\b[^>]*?\bhref\s*=\s*["']?(https?:\/\/[^"'\s>]+)/gi;
  // srcset candidates
  const srcset = /\bsrcset\s*=\s*["']([^"']+)["']/gi;
  // URLs a bundled/inline script fetches or module-imports at runtime
  const fetched =
    /(?:fetch|importScripts|import|new\s+Worker|new\s+URL)\s*\(\s*["'`](https?:\/\/[^"'`)]+)/gi;

  let m;
  while ((m = srcTag.exec(html))) add(m[1]);
  while ((m = linkTag.exec(html))) add(m[1]);
  while ((m = fetched.exec(html))) add(m[1]);
  while ((m = srcset.exec(html)))
    for (const c of m[1].split(','))
      add(
        (c.trim().split(/\s+/)[0] || '').match(/^https?:\/\//)
          ? c.trim().split(/\s+/)[0]
          : null,
      );
  return [...urls];
}

const originOf = (u) => {
  try {
    return new URL(u).origin;
  } catch {
    return null;
  }
};
const isSelf = (u) => {
  try {
    return SELF.includes(new URL(u).hostname);
  } catch {
    return false;
  }
};

function walkHtml(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walkHtml(p, out);
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
}

async function runBuilt() {
  const buildDir = join(process.cwd(), 'build');
  const files = walkHtml(buildDir);
  const found = new Map(); // origin -> Set(sample urls)
  for (const f of files) {
    for (const u of extractUrls(readFileSync(f, 'utf8'))) {
      if (isSelf(u)) continue;
      const o = originOf(u);
      if (!o) continue;
      if (!found.has(o)) found.set(o, new Set());
      if (found.get(o).size < 3) found.get(o).add(u);
    }
  }
  return report(
    'built output',
    found,
    BUILT_ALLOWLIST,
    files.length + ' HTML files',
  );
}

async function runLive() {
  const base = (arg('--base') || 'https://zcohen-nerd.com').replace(/\/$/, '');
  const found = new Map();
  let plausibleOnRoot = false;
  for (const route of ROUTES) {
    const res = await fetch(base + route, {
      headers: {'user-agent': UA, accept: 'text/html,application/xhtml+xml'},
      redirect: 'follow',
    });
    const html = await res.text();
    for (const u of extractUrls(html)) {
      if (isSelf(u)) continue;
      const o = originOf(u);
      if (!o) continue;
      if (!found.has(o)) found.set(o, new Set());
      if (found.get(o).size < 3) found.get(o).add(u);
      if (route === '/' && o === 'https://plausible.io') plausibleOnRoot = true;
    }
  }
  const ok = report('live ' + base, found, LIVE_ALLOWLIST, ROUTES.join(' '));
  if (!plausibleOnRoot) {
    console.error(
      'FAIL  Plausible script not found on / (expected from source)',
    );
    return false;
  }
  console.log('  ok  Plausible present on /');
  return ok;
}

function report(label, found, allowlist, scanned) {
  console.log(`\nThird-party origins in ${label}  (scanned: ${scanned})`);
  const origins = [...found.keys()].sort();
  if (origins.length === 0) console.log('  (none)');
  let bad = [];
  for (const o of origins) {
    const allowed = allowlist.includes(o);
    console.log(
      `  ${allowed ? 'ok  ' : 'FAIL'} ${o}${allowed ? '' : '  <-- not in allowlist'}`,
    );
    for (const u of found.get(o)) console.log(`         ${u}`);
    if (!allowed) bad.push(o);
  }
  const missing = allowlist.filter((a) => !origins.includes(a));
  if (missing.length)
    console.log(
      `  note  allowlisted but not seen this run: ${missing.join(', ')}`,
    );
  if (bad.length) {
    console.error(
      `\nFAILED — ${bad.length} origin(s) outside the allowlist: ${bad.join(', ')}`,
    );
    console.error(
      'If this is intentional, update the allowlist here AND src/pages/privacy.md AND NOTICE.md.',
    );
    return false;
  }
  console.log('PASS — every third-party origin is on the allowlist.');
  return true;
}

const mode = arg('--mode');
const ok = mode === 'live' ? await runLive() : await runBuilt();
process.exit(ok ? 0 : 1);
