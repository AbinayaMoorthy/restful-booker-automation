// pages/AdminLoginPage.js
// Admin authentication and post-login navigation for automationintesting.online

class AdminLoginPage {
  constructor(page) {
    this.page = page;

    // Login form — rendered only while unauthenticated
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#doLogin');

    // Navigation chrome. Note: the admin nav renders regardless of auth state,
    // so none of these prove a session exists — see isLoggedIn() below.
    this.logoutButton = page.getByRole('button', { name: /logout/i });
    this.roomsNavLink = page.getByRole('link', { name: /rooms/i }).first();
    this.adminBanner = page.locator('.navbar-brand');

    // Validation / auth failure alert
    this.errorAlert = page.locator('.alert-danger');
  }

  async goto() {
    await this.page.goto('/admin');
    await this.usernameInput.waitFor({ state: 'visible', timeout: 30000 });
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async logout() {
    await this.logoutButton.click();
  }

  /**
   * True only when an authenticated session exists.
   *
   * Two earlier implementations of this check were wrong, in opposite ways:
   *
   *   1. `url.includes('/admin/rooms')` — the negative tests never navigate to
   *      that route, so it returned false whether or not login succeeded. The
   *      assertion could not fail.
   *
   *   2. `logoutButton.isVisible()` — this application renders the admin nav
   *      bar, logout control included, even for an unauthenticated visitor.
   *      TC003 and TC004 caught this: both reported "logged in" immediately
   *      after a rejected login.
   *
   * The reliable signal is the login form. The app replaces it once a session
   * exists, so its absence — not the presence of any nav element — is what
   * distinguishes the two states.
   */
  async isLoggedIn() {
    return !(await this.loginButton.isVisible());
  }

  async waitForRoomsNav() {
    await this.roomsNavLink.waitFor({ state: 'visible', timeout: 15000 });
  }

  async goToRooms() {
    await this.waitForRoomsNav();
    await this.roomsNavLink.click();
    await this.page.waitForURL(/rooms/, { timeout: 15000 });
  }
}

module.exports = { AdminLoginPage };