// Accessibility smoke test — axe-core against the built, served site.
//
// axe is a *detector*: a violation here is a signal to investigate, not an
// instruction to blindly change markup. The acceptance-triage pass (see
// CONTRIBUTING.md "Deferred") manually confirms every finding and then either
// fixes it or records a narrowly-scoped entry in ./axe-exclusions.ts.
//
// Shared verbatim across the three sites; the only per-repo input is
// ./routes.ts.
import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {A11Y_ROUTES} from './routes';
import {axeExclusions} from './axe-exclusions';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

for (const route of A11Y_ROUTES) {
  test(`a11y @ ${route}`, async ({page}, testInfo) => {
    const resp = await page.goto(route, {waitUntil: 'load'});
    // /404.html legitimately returns HTTP 404 — only fail on 5xx / no response.
    expect(resp, `no response for ${route}`).toBeTruthy();
    expect(resp!.status(), `server error for ${route}`).toBeLessThan(500);
    await page.waitForLoadState('networkidle').catch(() => {});

    let builder = new AxeBuilder({page}).withTags(TAGS);
    for (const sel of axeExclusions[route] ?? [])
      builder = builder.exclude(sel);
    const {violations} = await builder.analyze();

    await testInfo.attach(
      `axe_${route.replace(/[^\w]+/g, '_') || 'root'}.json`,
      {
        body: JSON.stringify(violations, null, 2),
        contentType: 'application/json',
      },
    );

    const summary = violations
      .map(
        (v) =>
          `  [${v.impact ?? '?'}] ${v.id} — ${v.help}\n    ${v.nodes
            .slice(0, 5)
            .map((n) => n.target.join(' '))
            .join('\n    ')}`,
      )
      .join('\n');
    expect(violations, `axe violations on ${route}:\n${summary}`).toEqual([]);
  });
}
