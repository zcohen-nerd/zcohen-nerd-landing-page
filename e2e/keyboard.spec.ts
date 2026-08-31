// Keyboard-operability smoke for the shared @zcohen-nerd/brand navbar, exercised
// end-to-end against the real compiled components on the built landing page:
//   1. the "Ecosystem" ecosystem-disclosure widget
//   2. the mobile drawer (modal dialog)
//
// Brand ships its jsdom/Vitest unit suite for the same components; this is the
// integration layer that proves it works in a real browser with real CSS
// (focus-visible rings, scroll lock, the `hidden` attribute).
//
// NOTE: tests tagged `@contract` assert behaviour that the in-flight brand navbar
// remediation delivers (focus-trap, focus-return, keyboard-open). They are
// marked `fixme` until that work is consolidated onto this branch — see
// CONTRIBUTING.md "Deferred". Tier-A tests below must always pass.
import {test, expect} from '@playwright/test';

const DISCLOSURE = '#zc-project-disclosure';
const DRAWER = '#zc-mobile-drawer';

test.describe('ecosystem disclosure', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/', {waitUntil: 'load'});
  });

  test('trigger wiring + click toggles open/closed [Tier A]', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', {name: /Ecosystem/});
    await expect(trigger).toHaveAttribute(
      'aria-controls',
      'zc-project-disclosure',
    );
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(DISCLOSURE)).toBeHidden();

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(DISCLOSURE)).toBeVisible();

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(DISCLOSURE)).toBeHidden();
  });

  test('every panel link has an accessible name [Tier A]', async ({page}) => {
    await page.getByRole('button', {name: /Ecosystem/}).click();
    const links = page.locator(`${DISCLOSURE} a`);
    const n = await links.count();
    expect(n).toBeGreaterThanOrEqual(8);
    for (let i = 0; i < n; i++) {
      expect((await links.nth(i).textContent())?.trim()).toBeTruthy();
    }
  });

  test('opens from the keyboard @contract', async ({page}) => {
    test.fixme(true, 'pending brand navbar remediation (keyboard-open)');
    const trigger = page.getByRole('button', {name: /Ecosystem/});
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(DISCLOSURE)).toBeVisible();
  });

  test('Escape closes and returns focus to the trigger @contract', async ({
    page,
  }) => {
    test.fixme(true, 'pending brand navbar remediation (focus return)');
    const trigger = page.getByRole('button', {name: /Ecosystem/});
    await trigger.click();
    await page.keyboard.press('Escape');
    await expect(page.locator(DISCLOSURE)).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe('mobile drawer', () => {
  test.use({viewport: {width: 390, height: 844}});

  test.beforeEach(async ({page}) => {
    await page.goto('/', {waitUntil: 'load'});
  });

  test('dialog semantics + opens on toggle [Tier A]', async ({page}) => {
    // Locate by aria-controls, not the label: the label flips Open menu ↔ Close
    // menu, and once open there is also a second "Close menu" button inside the
    // drawer, so /menu/i would be ambiguous.
    const toggle = page.locator('button[aria-controls="zc-mobile-drawer"]');
    await expect(toggle).toHaveAttribute('aria-controls', 'zc-mobile-drawer');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const drawer = page.locator(DRAWER);
    await expect(drawer).toHaveAttribute('role', 'dialog');
    await expect(drawer).toHaveAttribute('aria-modal', 'true');
    await expect(drawer).toHaveAttribute('aria-label', 'Menu');
    await expect(drawer).toBeHidden();

    await toggle.click();
    await expect(drawer).toBeVisible();
    // aria-expanded on the controlling button flips to reflect the open dialog.
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('closes with an accessible control @contract', async ({page}) => {
    test.fixme(
      true,
      'pending brand navbar remediation (in-drawer close button)',
    );
    await page.getByRole('button', {name: /Open menu/}).click();
    await page.getByRole('button', {name: /Close menu/}).click();
    await expect(page.locator(DRAWER)).toBeHidden();
  });

  test('focus enters the drawer on open @contract', async ({page}) => {
    test.fixme(true, 'pending brand navbar remediation (focus management)');
    await page.getByRole('button', {name: /Open menu/}).click();
    const active = page.locator(':focus');
    await expect(page.locator(DRAWER)).toContainText(
      (await active.textContent()) ?? '',
    );
  });

  test('Escape closes and returns focus to the toggle @contract', async ({
    page,
  }) => {
    test.fixme(
      true,
      'pending brand navbar remediation (focus return + Escape)',
    );
    const toggle = page.getByRole('button', {name: /Open menu/});
    await toggle.click();
    await page.keyboard.press('Escape');
    await expect(page.locator(DRAWER)).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('body scroll is locked while the drawer is open @contract', async ({
    page,
  }) => {
    test.fixme(true, 'pending brand navbar remediation (scroll lock)');
    await page.getByRole('button', {name: /Open menu/}).click();
    const overflow = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );
    expect(overflow).toBe('hidden');
  });
});
