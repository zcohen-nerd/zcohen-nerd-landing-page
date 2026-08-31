#!/usr/bin/env node
/**
 * Descriptive bundle / critical-asset report over the built site, plus a small
 * set of hard budgets from `perf-budgets.json`.
 *
 * `size-limit` (see .size-limit.json) is the primary JS/CSS gate; this script
 * adds the numbers size-limit does not surface — raw+gzip side by side, route
 * chunk count, the per-route LCP-candidate image, the count of render-blocking
 * assets in <head>, and inline page-media weight (generalises the Portfolio
 * repo's existing 1200 KB image budget to every configured route).
 *
 *   node scripts/bundle-report.mjs        # report + enforce perf-budgets.json
 *   node scripts/bundle-report.mjs --report-only
 *
 * Writes reports/quality/bundle-report.{json,md}. Exits 1 on a budget breach
 * unless --report-only.
 */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs';
import {join, extname} from 'node:path';
import {gzipSync} from 'node:zlib';

const reportOnly = process.argv.includes('--report-only');
const B = 'build';
if (!existsSync(join(B, 'index.html'))) {
  console.error('build/ not found — run `npm run build` first.');
  process.exit(1);
}
const budgets = existsSync('perf-budgets.json')
  ? JSON.parse(readFileSync('perf-budgets.json', 'utf8'))
  : {};
const routes = budgets.routes ?? ['/'];

const KB = (n) => Math.round((n / 1024) * 10) / 10;
const glob1 = (dir, re) => {
  const d = join(B, dir);
  return existsSync(d)
    ? readdirSync(d)
        .filter((f) => re.test(f))
        .map((f) => join(d, f))
    : [];
};
const sizeOf = (files) => files.reduce((s, f) => s + statSync(f).size, 0);
const gzipOf = (files) =>
  files.reduce((s, f) => s + gzipSync(readFileSync(f)).length, 0);

// --- initial + total bundle ------------------------------------------------
const initialJs = [
  ...glob1('assets/js', /^main\.[\w]+\.js$/),
  ...glob1('assets/js', /^runtime~main\.[\w]+\.js$/),
];
const initialCss = glob1('assets/css', /^styles\.[\w]+\.css$/);
const allJs = glob1('assets/js', /\.js$/);
const allCss = glob1('assets/css', /\.css$/);

const bundle = {
  initialJs: {raw: KB(sizeOf(initialJs)), gzip: KB(gzipOf(initialJs))},
  initialCss: {raw: KB(sizeOf(initialCss)), gzip: KB(gzipOf(initialCss))},
  routeChunks: {
    count: allJs.length,
    rawKB: KB(sizeOf(allJs)),
    gzipKB: KB(gzipOf(allJs)),
  },
  cssTotal: {count: allCss.length, rawKB: KB(sizeOf(allCss))},
};

// --- per-route: critical assets, LCP candidate, inline media -------------
const routeFile = (r) => {
  const clean = r.replace(/^\/+|\/+$/g, '');
  for (const cand of [
    join(B, clean, 'index.html'),
    join(B, `${clean}.html`),
    join(B, clean || 'index.html'),
  ])
    if (existsSync(cand) && statSync(cand).isFile()) return cand;
  return null;
};
const MEDIA_RE = /\.(png|jpe?g|webp|avif|gif|svg|mp4|webm)$/i;
const localAsset = (url) => {
  if (!url || /^(https?:)?\/\//.test(url) || url.startsWith('data:'))
    return null;
  const p = join(
    B,
    decodeURIComponent(url.split(/[?#]/)[0]).replace(/^\/+/, ''),
  );
  return existsSync(p) && statSync(p).isFile() ? p : null;
};

const perRoute = [];
for (const r of routes) {
  const f = routeFile(r);
  if (!f) {
    perRoute.push({route: r, error: 'no built HTML found'});
    continue;
  }
  const html = readFileSync(f, 'utf8');
  const head = html.split(/<\/head>/i)[0] ?? '';
  const headAssets = (
    head.match(
      /<link[^>]+rel=["']?stylesheet["']?[^>]*>|<script[^>]+src=[^>]*><\/script>|<script[^>]+src=[^>]*>/gi,
    ) || []
  ).length;

  const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
  let lcp = null;
  for (const m of imgs) {
    const p = localAsset(m[1]);
    if (!p) continue;
    const size = statSync(p).size;
    const eager = /loading=["']?eager["']?/.test(m[0]);
    if (!lcp || (eager && !lcp.eager) || size > lcp.bytes)
      lcp = {src: m[1], bytes: size, eager};
  }

  const mediaUrls = new Set();
  for (const m of html.matchAll(/(?:src|href|poster)=["']([^"']+)["']/gi))
    if (MEDIA_RE.test(m[1])) mediaUrls.add(m[1]);
  // A browser only downloads one source of a <video>. When the same basename is
  // referenced as both .webm and .mp4, count the smaller (matches the Portfolio
  // repo's long-standing inline-media budget rule).
  const stems = new Set(
    [...mediaUrls]
      .filter((u) => /\.webm$/i.test(u))
      .map((u) => u.replace(/\.webm$/i, '')),
  );
  let inlineMedia = 0;
  for (const u of mediaUrls) {
    if (/\.mp4$/i.test(u) && stems.has(u.replace(/\.mp4$/i, ''))) continue;
    const p = localAsset(u);
    if (p && extname(p).toLowerCase() !== '.svg')
      inlineMedia += statSync(p).size;
  }

  perRoute.push({
    route: r,
    htmlKB: KB(statSync(f).size),
    renderBlockingHeadAssets: headAssets,
    lcpCandidate: lcp
      ? {src: lcp.src, KB: KB(lcp.bytes), eager: lcp.eager}
      : null,
    inlineMediaKB: KB(inlineMedia),
  });
}

// --- budgets -------------------------------------------------------------
const breaches = [];
const lim = (name, actual, limit) => {
  if (typeof limit === 'number' && actual > limit)
    breaches.push(`${name}: ${actual} > ${limit}`);
};
lim('initial JS gzip KB', bundle.initialJs.gzip, budgets.initialJsGzipKB);
lim('initial CSS gzip KB', bundle.initialCss.gzip, budgets.initialCssGzipKB);
lim('all JS raw KB', bundle.routeChunks.rawKB, budgets.allJsRawKB);
for (const pr of perRoute) {
  if (pr.error) continue;
  const cap =
    budgets.perRouteInlineMediaKB?.[pr.route] ??
    budgets.perRouteInlineMediaKB?.default;
  lim(`inline media KB @ ${pr.route}`, pr.inlineMediaKB, cap);
  if (typeof budgets.criticalHeadAssets === 'number')
    lim(
      `render-blocking <head> assets @ ${pr.route}`,
      pr.renderBlockingHeadAssets,
      budgets.criticalHeadAssets,
    );
}

// --- write + print ----------------------------------------------------
const out = {bundle, perRoute, budgets, breaches};
mkdirSync('reports/quality', {recursive: true});
writeFileSync(
  'reports/quality/bundle-report.json',
  JSON.stringify(out, null, 2),
);

const md = [
  '# Bundle report',
  '',
  '## Initial payload',
  '',
  '| asset | raw KB | gzip KB |',
  '| --- | ---: | ---: |',
  `| initial JS (main + runtime) | ${bundle.initialJs.raw} | ${bundle.initialJs.gzip} |`,
  `| initial CSS | ${bundle.initialCss.raw} | ${bundle.initialCss.gzip} |`,
  `| all JS chunks (${bundle.routeChunks.count}) | ${bundle.routeChunks.rawKB} | ${bundle.routeChunks.gzipKB} |`,
  '',
  '## Per route',
  '',
  '| route | html KB | render-blocking head assets | LCP candidate | inline media KB |',
  '| --- | ---: | ---: | --- | ---: |',
  ...perRoute.map((p) =>
    p.error
      ? `| ${p.route} | — | — | ${p.error} | — |`
      : `| ${p.route} | ${p.htmlKB} | ${p.renderBlockingHeadAssets} | ${
          p.lcpCandidate
            ? `${p.lcpCandidate.src} (${p.lcpCandidate.KB} KB${p.lcpCandidate.eager ? ', eager' : ''})`
            : '—'
        } | ${p.inlineMediaKB} |`,
  ),
  '',
  breaches.length
    ? `## Budget breaches\n\n${breaches.map((b) => `- ${b}`).join('\n')}`
    : '## Budgets: all within limits',
  '',
].join('\n');
writeFileSync('reports/quality/bundle-report.md', md);
console.log(md);
console.log('\nreports/quality/bundle-report.{json,md}');

if (breaches.length && !reportOnly) process.exit(1);
