// tests/login.test.js
// Admin authentication module
//   TC001 — Full admin workflow: home → login → rooms → logout
//   TC003 — Empty credentials rejected  (negative)
//   TC004 — Invalid credentials rejected (negative)
//
// TC002 (public booking) lives in tests/booking.test.js.

const { test, expect } = require('@playwright/test');
const { AdminLoginPage } = require('../pages/AdminLoginPage');
const { RoomsPage } = require('../pages/RoomsPage');
const { bookingData } = require('../test-data/bookingData');

// ═════════════════════════════════════════════════════════════════════════════
// TC001 — Full admin workflow
// ═════════════════════════════════════════════════════════════════════════════
test.describe('TC001 — Full admin workflow', () => {
  test('Home page → admin login → rooms → logout @smoke', async ({ page }) => {
    const adminPage = new AdminLoginPage(page);
    const roomsPage = new RoomsPage(page);

    await test.step('Public home page loads', async () => {
      await page.goto('/');
      await expect(page).toHaveURL(/automationintesting\.online\/?$/);
      await expect(page.getByRole('heading').first()).toBeVisible();
    });

    await test.step('Navigate to the admin panel', async () => {
      const adminLink = page.locator('a[href*="admin"]').first();

      // The footer link is the real user path; direct navigation is the fallback
      // so a footer redesign degrades this step rather than failing the suite.
      if (await adminLink.isVisible().catch(() => false)) {
        await adminLink.click();
      } else {
        await page.goto('/admin');
      }

      await expect(adminPage.usernameInput).toBeVisible({ timeout: 15000 });
      await expect(page).toHaveURL(/admin/);
    });

    await test.step('Log in with valid credentials', async () => {
      await adminPage.login(
        bookingData.validAdmin.username,
        bookingData.validAdmin.password
      );

      // Asserting the login form is gone, NOT that a logout button appeared.
      // This app renders the admin nav — logout control included — even for an
      // unauthenticated visitor, so a visible logout button proves nothing.
      await expect(adminPage.loginButton).toBeHidden({ timeout: 15000 });
      expect(await adminPage.isLoggedIn()).toBe(true);
    });

    await test.step('Rooms page renders its management controls', async () => {
      await adminPage.goToRooms();
      await roomsPage.assertOnRoomsPage();

      // Asserting on the room-creation controls, not on a row count.
      // Row count is unreliable here: this is a shared public sandbox where
      // anyone can add or delete rooms, so any fixed expected count is flaky
      // and `count >= 0` is an assertion that can never fail. The presence of
      // the management form proves the page actually rendered.
      await expect(roomsPage.roomNumberInput).toBeVisible({ timeout: 15000 });

      const roomCount = await roomsPage.getRoomCount();
      test.info().annotations.push({ type: 'rooms listed', description: `${roomCount}` });
    });

    await test.step('Log out returns to the public site', async () => {
      await adminPage.logout();
      await expect(page).toHaveURL(/automationintesting\.online\/?$/);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC003 — Empty credentials (negative)
// ═════════════════════════════════════════════════════════════════════════════
test.describe('TC003 — Empty credentials', () => {
  test('Submitting an empty username and password must not log in', async ({ page }) => {
    const adminPage = new AdminLoginPage(page);

    await adminPage.goto();
    await adminPage.login('', '');

    // 1. The app actively rejected the attempt
    await expect(adminPage.errorAlert).toBeVisible({ timeout: 10000 });

    // 2. No session exists — the login form is still rendered
    expect(await adminPage.isLoggedIn()).toBe(false);

    // 3. The user remains on the login step and can retry
    await expect(adminPage.usernameInput).toBeVisible();
    await expect(adminPage.loginButton).toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TC004 — Invalid credentials (negative)
// ═════════════════════════════════════════════════════════════════════════════
test.describe('TC004 — Invalid credentials', () => {
  test('Submitting a wrong username and password must not log in', async ({ page }) => {
    const adminPage = new AdminLoginPage(page);

    await adminPage.goto();
    await adminPage.login(
      bookingData.invalidAdmin.username,
      bookingData.invalidAdmin.password
    );

    // 1. The app actively rejected the attempt
    await expect(adminPage.errorAlert).toBeVisible({ timeout: 10000 });

    // 2. No session exists — the login form is still rendered
    expect(await adminPage.isLoggedIn()).toBe(false);

    // 3. The user remains on the login step and can retry
    await expect(adminPage.usernameInput).toBeVisible();
    await expect(adminPage.loginButton).toBeVisible();
  });
});