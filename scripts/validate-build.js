/**
 * Post-build validation for the hub (run after `npm run build`).
 * Fails CI on canonical-URL, metadata, sitemap, robots, or accessibility
 * regressions. Keep checks cheap — static assertions on built output only.
 *
 * Usage: node scripts/validate-build.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const build = path.join(root, 'build');
let failures = [];

function check(name, ok, detail = '') {
  if (ok) {
    console.log(`  ok  ${name}`);
  } else {
    failures.push(name + (detail ? ` — ${detail}` : ''));
    console.error(`FAIL  ${name}${detail ? ' — ' + detail : ''}`);
  }
}

const config = fs.readFileSync(path.join(root, 'docusaurus.config.js'), 'utf8');
const cname = fs.readFileSync(path.join(root, 'static', 'CNAME'), 'utf8').trim();
const indexHtml = fs.readFileSync(path.join(build, 'index.html'), 'utf8');
const sitemap = fs.readFileSync(path.join(build, 'sitemap.xml'), 'utf8');
const robots = fs.readFileSync(path.join(build, 'robots.txt'), 'utf8');

// 1. Canonical URL
check('config url is apex', config.includes("url: 'https://zcohen-nerd.com'"));
check('CNAME is apex', cname === 'zcohen-nerd.com', `got "${cname}"`);

// 2. OG image
check('OG image exists', fs.existsSync(path.join(build, 'img', 'og-zcohen-nerd.png')));
check('og:image meta present', indexHtml.includes('og-zcohen-nerd.png'));

// 3. JSON-LD
const jsonLd = [...indexHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
check('two JSON-LD blocks', jsonLd.length === 2, `found ${jsonLd.length}`);
for (const [, body] of jsonLd) {
  try {
    const parsed = JSON.parse(body);
    check(`JSON-LD ${parsed['@type']} parses`, ['WebSite', 'Person'].includes(parsed['@type']));
  } catch (e) {
    check('JSON-LD parses', false, e.message);
  }
}

// 4. Sitemap domain + trailing slash
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
check('sitemap non-empty', locs.length > 0);
check('sitemap uses apex domain', locs.every((u) => u.startsWith('https://zcohen-nerd.com/')), locs.find((u) => !u.startsWith('https://zcohen-nerd.com/')));
check('sitemap URLs end with /', locs.every((u) => u.endsWith('/')), locs.find((u) => !u.endsWith('/')));

// 5. Robots
check('robots has Sitemap directive', robots.includes('Sitemap: https://zcohen-nerd.com/sitemap.xml'));
check('robots allows crawling', robots.includes('User-agent: *') && robots.includes('Allow: /'));

// 6. Legacy URLs must not appear in built HTML
const htmlFiles = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) htmlFiles.push(p);
  }
})(build);
const legacy = ['zcohen-nerd.github.io/Portfolio', 'literacy-for-kids.github.io', 'href="https://www.zcohen-nerd.com'];
for (const needle of legacy) {
  const hit = htmlFiles.find((f) => fs.readFileSync(f, 'utf8').includes(needle));
  check(`no legacy URL: ${needle}`, !hit, hit ? path.relative(build, hit) : '');
}

// 7. Plausible: exactly one script
const plausibleCount = (indexHtml.match(/plausible\.io\/js\//g) || []).length;
check('exactly one Plausible script', plausibleCount === 1, `found ${plausibleCount}`);
check('Plausible domain is apex', indexHtml.includes('data-domain="zcohen-nerd.com"'));

// 8. Accessibility statics
check('project disclosure in HTML', indexHtml.includes('id="zc-project-disclosure"'));
check('disclosure trigger has aria-controls', indexHtml.includes('aria-controls="zc-project-disclosure"'));
check('mobile drawer in HTML', indexHtml.includes('id="zc-mobile-drawer"'));
check('drawer trigger has aria-controls', indexHtml.includes('aria-controls="zc-mobile-drawer"'));
const discStart = indexHtml.indexOf('id="zc-project-disclosure"');
const discEnd = indexHtml.indexOf('id="zc-mobile-drawer"');
const discBody = discStart !== -1 && discEnd > discStart ? indexHtml.slice(discStart, discEnd) : '';
check('disclosure links server-rendered', (discBody.match(/href="/g) || []).length >= 3);
const ids = [...indexHtml.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
check('no duplicate ids', ids.length === new Set(ids).size);
const cssDir = path.join(build, 'assets', 'css');
const cssText = fs.readdirSync(cssDir).map((f) => fs.readFileSync(path.join(cssDir, f), 'utf8')).join('');
check('focus-visible styling present', cssText.includes('focus-visible'));

if (failures.length) {
  console.error(`\n${failures.length} validation failure(s).`);
  process.exit(1);
}
console.log('\nAll build validations passed.');
