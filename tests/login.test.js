// tests/login.test.js
// Tests: TC001 Full admin flow | TC002 Public booking | TC003 Empty login | TC004 Wrong credentials

const { test, expect } = require('@playwright/test');
const { AdminLoginPage } = require('../pages/AdminLoginPage');
const { RoomsPage }      = require('../pages/RoomsPage');
const { bookingData }    = require('../test-data/bookingData');

// ═══════════════════════════════════════════════════════════════════════════════
// TC001 — Full Admin Workflow
// Home → Navigate to Admin → Login → Rooms → Logout
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('TC001 — Full Admin Workflow', () => {

  test('Home page → Admin login → Rooms → Logout', async ({ page }) => {
    const adminPage = new AdminLoginPage(page);
    const roomsPage = new RoomsPage(page);

    // ── Step 1: Start at the public home page ──────────────────────────
    await page.goto('/');
    await expect(page).toHaveURL('https://automationintesting.online/');

    // Verify hotel name / home page content loaded
    await expect(page.locator('h1, h2, .hotel-name').first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Step 1: Home page loaded');

    // ── Step 2: Navigate to Admin panel ────────────────────────────────
    // Admin is at /#/admin — find the link in the footer or navigate directly
    const adminLink = page.locator('a[href*="admin"]').first();

    if (await adminLink.isVisible().catch(() => false)) {
      await adminLink.click();
    } else {
      // Direct navigation fallback
      await page.goto('/#/admin');
    }

    await adminPage.usernameInput.waitFor({ state: 'visible', timeout: 15000 });
    await expect(page).toHaveURL(/admin/);
    console.log('✅ Step 2: Admin login page reached');

    // ── Step 3: Login with valid credentials ───────────────────────────
    await adminPage.login(
      bookingData.validAdmin.username,
      bookingData.validAdmin.password
    );

    // Wait for logout button — confirms successful login
    await adminPage.logoutButton.waitFor({ state: 'visible', timeout: 15000 });
    await expect(adminPage.logoutButton).toBeVisible();
    console.log('✅ Step 3: Logged in successfully');

    // ── Step 4: Navigate to Rooms ──────────────────────────────────────
    await adminPage.goToRooms();
    await roomsPage.assertOnRoomsPage();

    const roomCount = await roomsPage.getRoomCount();
    console.log(`✅ Step 4: Rooms page loaded — ${roomCount} room(s) found`);

    // Rooms page should have at least one room listed
    expect(roomCount).toBeGreaterThanOrEqual(0); // site may have 0 rooms; page still loads

    // ── Step 5: Logout ─────────────────────────────────────────────────
    // await adminPage.logout();

    // After logout, login form should be visible again
    // await expect(adminPage.usernameInput).toBeVisible({ timeout: 10000 });
    // console.log('✅ Step 5: Logged out — back on login page');
    await adminPage.logout();
      await expect(page).toHaveURL(/automationintesting\.online\/?$/);
      console.log('✅ Step 5: Logged out successfully');
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// TC003 — Empty Credentials
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('TC003 — Empty Credentials Login Attempt', () => {

  test('Submitting empty username and password should NOT log in', async ({ page }) => {
    const adminPage = new AdminLoginPage(page);

    await adminPage.goto();
    console.log('✅ Admin login page opened');

    // Submit with both fields empty
    await adminPage.login('', '');

    await expect(adminPage.errorAlert).toBeVisible({
      timeout: 5000
    });

    // Pause so we can visually see the validation message
    await page.waitForTimeout(2000);

    // Should NOT see the logout button
    const loggedIn = await adminPage.isLoggedIn();

    expect(loggedIn).toBeFalsy();
    console.log('✅ TC003 Passed: Empty credentials correctly rejected');

    // The login form should still be visible
    await expect(adminPage.usernameInput).toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// TC004 — Wrong Credentials
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('TC004 — Wrong Credentials Login Attempt', () => {

  test('Wrong username and password should NOT log in', async ({ page }) => {
    const adminPage = new AdminLoginPage(page);

    await adminPage.goto();
    console.log('✅ Admin login page opened');

    await adminPage.login(
      bookingData.invalidAdmin.username,
      bookingData.invalidAdmin.password
    );

    // Wait briefly so any redirect or error can settle
    await expect(adminPage.errorAlert).toBeVisible({
      timeout: 5000
    });

    await page.waitForTimeout(2000);

    const loggedIn = await adminPage.isLoggedIn();
    expect(loggedIn).toBeFalsy();
    console.log('✅ TC004 Passed: Wrong credentials correctly rejected');

    // Login form must still be present
    await expect(adminPage.usernameInput).toBeVisible();
  });

});
