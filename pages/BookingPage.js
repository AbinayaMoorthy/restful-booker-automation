// pages/BookingPage.js
// Handles the PUBLIC booking widget on https://automationintesting.online/
// The booking calendar is rendered in a room card — this class wraps that flow.

class BookingPage {
  constructor(page) {
    this.page = page;

    // ── Public home page elements ─────────────────────────────────────────
    // Each room on the home page has a "Book this room" button
    this.bookButtons = page.locator('button', { hasText: /book this room/i });

    // ── Booking modal / inline form fields ───────────────────────────────
    // These appear after clicking "Book this room"
    this.firstnameInput = page.locator('.room-booking-form input[name="firstname"]')
                              .or(page.locator('input[placeholder*="Firstname"]'))
                              .or(page.locator('#firstname'));

    this.lastnameInput  = page.locator('.room-booking-form input[name="lastname"]')
                              .or(page.locator('input[placeholder*="Lastname"]'))
                              .or(page.locator('#lastname'));

    this.emailInput     = page.locator('.room-booking-form input[name="email"]')
                              .or(page.locator('input[placeholder*="Email"]'))
                              .or(page.locator('#email'));

    this.phoneInput     = page.locator('.room-booking-form input[name="phone"]')
                              .or(page.locator('input[placeholder*="Phone"]'))
                              .or(page.locator('#phone'));

    // The calendar is rendered as a react-date-range widget
    // We navigate months and click dates
    this.calendarNextBtn = page.locator('.rdrNextButton').first();
    this.calendarDays    = page.locator('.rdrDay:not(.rdrDayPassive)');

    // Book / confirm button inside the booking form
    this.bookNowButton  = page.locator('button', { hasText: /book now/i });

    // Success confirmation message
    this.successMessage = page.locator('.confirmation-modal, .booking-confirmation')
                              .or(page.getByText(/booking successful|congratulations|has been confirmed/i));
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  /** Go to the public home page and wait for rooms to render */
  async goto() {
    await this.page.goto('/');
    await this.bookButtons.first().waitFor({ state: 'visible', timeout: 20000 });
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Click the first available "Book this room" button */
  async openFirstBookingForm() {
    await this.bookButtons.first().waitFor({ state: 'visible' });
    await this.bookButtons.first().click();
    // Wait for the firstname field to appear
    await this.firstnameInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Fill in the guest details section of the booking form.
   * @param {{ firstname, lastname, email, phone }} data
   */
  async fillGuestDetails(data) {
    await this.firstnameInput.fill(data.firstname);
    await this.lastnameInput.fill(data.lastname);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
  }

  /**
   * Select a date range on the calendar widget.
   * Strategy: click the first available day, then click a day N days later.
   * @param {number} nights — how many nights (default 3)
   */
  async selectDateRange(nights = 3) {
    // Wait for calendar to appear
    await this.calendarDays.first().waitFor({ state: 'visible', timeout: 10000 });

    const days = await this.calendarDays.all();

    // Pick the 3rd non-passive day as check-in (avoids edge issues with day 1/2)
    const startIdx = 2;
    const endIdx   = startIdx + nights;

    if (days.length > endIdx) {
      await days[startIdx].click();
      await this.page.waitForTimeout(400); // tiny pause so calendar registers first click
      await days[endIdx].click();
    } else {
      // Fallback: click first and last available day
      await days[0].click();
      await this.page.waitForTimeout(400);
      await days[days.length - 1].click();
    }
  }

  /** Click Book Now and wait for a confirmation signal */
  async submitBooking() {
    await this.bookNowButton.waitFor({ state: 'visible' });
    await this.bookNowButton.click();
  }

  /** Returns true if a success/confirmation element is visible */
  async isBookingConfirmed() {
    try {
      await this.successMessage.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = { BookingPage };
