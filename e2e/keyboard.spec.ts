// Keyboard-operability contract for the shared @zcohen-nerd/brand navbar,
// exercised end-to-end against the real compiled components on the built landing
// page:
//   1. the "Ecosystem" ecosystem-disclosure widget
//   2. the mobile drawer (modal dialog)
//
// Brand ships its jsdom/Vitest unit suite for the same components; this is the
// integration layer that proves it works in a real browser with real CSS
// (focus-visible rings, scroll lock, the `hidden` attribute). Every test here is
// a hard requirement — none are skipped.
import {test, expect} from '@playwright/test';

const DISCLOSURE = '#zc-project-disclosure';
const DRAWER = '#zc-mobile-drawer';
// The drawer toggle: its aria-label flips Open menu ↔ Close menu, so locate it
// by the stable aria-controls instead.
const TOGGLE = 'button[aria-controls="zc-mobile-drawer"]';
// The close control *inside* the drawer — scoped so it never collides with the
// toggle once that also reads "Close menu".
const DRAWER_CLOSE = '#zc-mobile-drawer button[aria-label="Close menu"]';

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
    const trigger = page.getByRole('button', {name: /Ecosystem/});
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(DISCLOSURE)).toBeVisible();
  });

  test('Escape closes and returns focus to the trigger @contract', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', {name: /Ecosystem/});
    await trigger.click();
    await expect(page.locator(DISCLOSURE)).toBeVisible();
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
    const toggle = page.locator(TOGGLE);
    await expect(toggle).toHaveAttribute('aria-controls', 'zc-mobile-drawer');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const drawer = page.locator(DRAWER);
    await expect(drawer).toHaveAttribute('role', 'dialog');
    await expect(drawer).toHaveAttribute('aria-modal', 'true');
    await expect(drawer).toHaveAttribute('aria-label', 'Menu');
    await expect(drawer).toBeHidden();

    await toggle.click();
    await expect(drawer).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('closes with an accessible in-drawer control @contract', async ({
    page,
  }) => {
    await page.locator(TOGGLE).click();
    await expect(page.locator(DRAWER)).toBeVisible();
    await page.locator(DRAWER_CLOSE).click();
    await expect(page.locator(DRAWER)).toBeHidden();
  });

  test('focus enters the drawer on open @contract', async ({page}) => {
    await page.locator(TOGGLE).click();
    await expect(page.locator(DRAWER)).toBeVisible();
    // The focused element is inside the drawer.
    const focusedInDrawer = await page.evaluate(
      (sel) => !!document.querySelector(sel)?.contains(document.activeElement),
      DRAWER,
    );
    expect(focusedInDrawer).toBe(true);
  });

  test('Escape closes and returns focus to the toggle @contract', async ({
    page,
  }) => {
    const toggle = page.locator(TOGGLE);
    await toggle.click();
    await expect(page.locator(DRAWER)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(DRAWER)).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('body scroll is locked while the drawer is open @contract', async ({
    page,
  }) => {
    await page.locator(TOGGLE).click();
    await expect(page.locator(DRAWER)).toBeVisible();
    const overflow = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );
    expect(overflow).toBe('hidden');
  });
});
