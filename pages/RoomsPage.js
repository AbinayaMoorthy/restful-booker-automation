// pages/RoomsPage.js
// Admin rooms management page

const { expect } = require('@playwright/test');

class RoomsPage {
  constructor(page) {
    this.page = page;

    // Data rows only. The previous `table tr` also matched the <thead> row,
    // so every count was one higher than the number of rooms actually listed.
    this.roomRows = page.locator('tbody tr')
      .or(page.locator('[data-testid="roomlisting"]'));

    // Room creation controls — these prove the admin rooms page rendered,
    // which a URL match alone does not.
    this.roomNumberInput = page.getByRole('textbox', { name: /room name|room number/i })
      .or(page.locator('#roomName, [data-testid="roomName"]'));

    this.createRoomButton = page.getByRole('button', { name: /create/i })
      .or(page.locator('#createRoom'));
  }

  async waitForLoad() {
    await expect(this.page).toHaveURL(/rooms/);
    await this.roomNumberInput.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getRoomCount() {
    await expect(this.page).toHaveURL(/rooms/);
    return this.roomRows.count();
  }

  async assertOnRoomsPage() {
    await expect(this.page).toHaveURL(/rooms/);
  }
}

module.exports = { RoomsPage };