// pages/AdminLoginPage.js

const { expect } = require('@playwright/test');

class AdminLoginPage {
  constructor(page) {
    this.page = page;

    // Login form
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#doLogin');

    // Post-login elements
    this.logoutButton = page.getByRole('button', { name: /logout/i });
    this.roomsNavLink = page.getByRole('link', { name: /rooms/i }).first();
    this.adminBanner = page.locator('.navbar-brand');

    // Error message
    this.errorAlert = page.locator('.alert-danger');
  }

  async goto() {
  await this.page.goto('/admin');

  await this.usernameInput.waitFor({
    state: 'visible',
    timeout: 30000
  });
}

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async logout() {
    await this.logoutButton.click();
  }

async isLoggedIn() {
  return await this.page.url().includes('/admin/rooms');
}

  async waitForRoomsNav() {
    await this.roomsNavLink.waitFor({
      state: 'visible',
      timeout: 15000
    });
  }

  async goToRooms() {
    await this.waitForRoomsNav();
    await this.roomsNavLink.click();

    await this.page.waitForURL(/rooms/, {
      timeout: 15000
    });
  }
}

module.exports = { AdminLoginPage };