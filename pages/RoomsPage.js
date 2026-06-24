// pages/RoomsPage.js

const { expect } = require('@playwright/test');

class RoomsPage {
  constructor(page) {
    this.page = page;

    // Room table rows
    this.roomRows = page.locator('table tr');
  }

  async waitForLoad() {
    await expect(this.page).toHaveURL(/rooms/);
  }

  async getRoomCount() {
    await this.waitForLoad();
    return await this.roomRows.count();
  }

  async assertOnRoomsPage() {
    await expect(this.page).toHaveURL(/rooms/);
  }
}

module.exports = { RoomsPage };