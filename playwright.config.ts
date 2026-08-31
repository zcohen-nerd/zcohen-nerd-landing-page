// Shared Playwright config across the three zcohen-nerd Docusaurus sites
// (connector-engineering-field-guide, zcohen-nerd-landing-page, Portfolio).
// Last synced 2026-08-31.
//
// Drives the a11y (axe), keyboard, and responsive smoke suites in ./e2e against
// the *built* site (`npm run build` then `npm run serve`), so what is tested is
// exactly what deploys. Chromium only — these are smoke checks, not a
// cross-browser matrix.
import {defineConfig, devices} from '@playwright/test';

const PORT = Number(process.env.PW_PORT || 4321);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: {timeout: 10_000},
  reporter: [
    ['list'],
    ['html', {outputFolder: 'playwright-report', open: 'never'}],
    ['json', {outputFile: 'reports/quality/playwright-results.json'}],
  ],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
  webServer: {
    command: `npm run serve -- --port ${PORT} --no-open`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
