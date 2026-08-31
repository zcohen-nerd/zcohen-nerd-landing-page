// Responsive smoke — structural assertions + full-page screenshots at six
// widths, on the high-risk routes for each site (./routes.ts RESPONSIVE_ROUTES).
//
// This is deliberately NOT a pixel-diff / visual-regression suite (too brittle
// for prose-heavy content pages). The screenshots are artifacts for human
// review; the assertions catch the objective failures — horizontal overflow,
// landmarks escaping the viewport, and sub-minimum tap targets.
//
// Shared verbatim across the three sites.
import {test, expect} from '@playwright/test';
import {RESPONSIVE_ROUTES} from './routes';

const WIDTHS = [360, 390, 768, 1024, 1440, 1920];
const LANDMARKS = ['header', 'main', 'footer', 'h1'];

for (const route of RESPONSIVE_ROUTES) {
  for (const width of WIDTHS) {
    test(`responsive ${width}w @ ${route}`, async ({page}, testInfo) => {
      await page.setViewportSize({width, height: 900});
      const resp = await page.goto(route, {waitUntil: 'load'});
      expect(resp?.status() ?? 200).toBeLessThan(500);
      await page.waitForLoadState('networkidle').catch(() => {});

      // 1. The page itself must not scroll horizontally.
      const metrics = await page.evaluate(() => ({
        docScrollW: document.documentElement.scrollWidth,
        bodyScrollW: document.body.scrollWidth,
        innerW: window.innerWidth,
      }));
      await testInfo.attach(`metrics-${width}w.json`, {
        body: JSON.stringify(metrics, null, 2),
        contentType: 'application/json',
      });
      expect(
        metrics.docScrollW,
        `document scrollWidth ${metrics.docScrollW} exceeds viewport ${width}`,
      ).toBeLessThanOrEqual(width + 1);

      // 2. Primary landmarks stay inside the viewport (no clipped hero / nav).
      for (const sel of LANDMARKS) {
        const el = page.locator(sel).first();
        if (!(await el.count())) continue;
        const box = await el.boundingBox();
        if (!box) continue;
        expect(
          box.x,
          `<${sel}> left edge ${Math.round(box.x)} < 0 at ${width}w`,
        ).toBeGreaterThanOrEqual(-1);
        expect(
          box.x + box.width,
          `<${sel}> right edge ${Math.round(box.x + box.width)} > ${width} at ${width}w`,
        ).toBeLessThanOrEqual(width + 2);
      }

      // 3. The nav trigger is reachable and a usable tap target.
      const nav = page
        .getByRole('button', {name: /Ecosystem|Open menu|menu/i})
        .first();
      if (await nav.count()) {
        const box = await nav.boundingBox();
        if (box) {
          const min = Math.min(box.width, box.height);
          expect(
            min,
            `nav trigger tap target ${Math.round(min)}px < 24 at ${width}w`,
          ).toBeGreaterThanOrEqual(24);
          if (min < 44) {
            testInfo.annotations.push({
              type: 'warning',
              description: `nav trigger tap target ${Math.round(min)}px (< 44) at ${width}w`,
            });
          }
        }
      }

      // 4. Screenshot for human review.
      await testInfo.attach(`screenshot-${width}w.png`, {
        body: await page.screenshot({fullPage: true}),
        contentType: 'image/png',
      });
    });
  }
}
