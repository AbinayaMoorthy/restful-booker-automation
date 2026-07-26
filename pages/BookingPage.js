// pages/BookingPage.js
// Handles the PUBLIC booking flow on https://automationintesting.online/
//
// ⚠️ SITE REDESIGN (2025): rooms no longer have a "Book this room" <button>
// with an inline calendar modal. Each room card now has a "Book now" LINK
// pointing to /reservation/{id}?checkin=YYYY-MM-DD&checkout=YYYY-MM-DD.
// The guest-details form lives on that reservation page and is revealed by
// clicking "Reserve Now"; a second "Reserve Now" click submits it.

class BookingPage {
  constructor(page) {
    this.page = page;

    // ── Home page: room cards ────────────────────────────────────────────
    // Target by href so we don't collide with the hero's "Book Now" → #booking anchor
    this.roomBookLinks = page.locator('a[href*="/reservation/"]');

    // ── Reservation page ─────────────────────────────────────────────────
    // First click reveals the form; second click submits it.
    this.reserveNowButton = page.getByRole('button', { name: /reserve now|book now/i });

    this.firstnameInput = page.getByPlaceholder(/firstname/i)
                              .or(page.locator('input[name="firstname"], #firstname'));
    this.lastnameInput  = page.getByPlaceholder(/lastname/i)
                              .or(page.locator('input[name="lastname"], #lastname'));
    this.emailInput     = page.getByPlaceholder(/email/i)
                              .or(page.locator('input[name="email"], #email'));
    this.phoneInput     = page.getByPlaceholder(/phone/i)
                              .or(page.locator('input[name="phone"], #phone'));

    // Success confirmation on the reservation page
    this.successMessage = page.getByText(/booking confirmed/i)
                              .or(page.getByRole('heading', { name: /booking confirmed/i }));

    // Validation errors (danger alert) — useful for debugging failed submits
    this.errorAlert = page.locator('.alert-danger, .alert.alert-danger');
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  /** Go to the public home page and wait for room cards to render */
  async goto() {
    await this.page.goto('/');
    await this.roomBookLinks.first().waitFor({ state: 'visible', timeout: 20000 });
  }

  /**
   * Open the reservation page for the first room, overriding the default
   * (today→tomorrow) dates in the link with our own future date range.
   * Setting dates via query params avoids calendar interaction entirely
   * and reduces clashes with other users' bookings on the shared sandbox.
   * @param {number} daysFromNow — check-in offset from today
   * @param {number} nights — length of stay
   */
  async openFirstReservation(daysFromNow = 14, nights = 3) {
    const href = await this.roomBookLinks.first().getAttribute('href');
    const url = new URL(href, this.page.url());

    const checkin = new Date();
    checkin.setDate(checkin.getDate() + daysFromNow);
    const checkout = new Date(checkin);
    checkout.setDate(checkout.getDate() + nights);

    const fmt = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD
    url.searchParams.set('checkin', fmt(checkin));
    url.searchParams.set('checkout', fmt(checkout));

    await this.page.goto(url.toString());
    await this.reserveNowButton.first().waitFor({ state: 'visible', timeout: 20000 });
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Click "Reserve Now" once to reveal the guest-details form */
  async openGuestForm() {
    await this.reserveNowButton.first().click();
    await this.firstnameInput.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  /** Fill in the guest details form */
  async fillGuestDetails({ firstname, lastname, email, phone }) {
    await this.firstnameInput.first().fill(firstname);
    await this.lastnameInput.first().fill(lastname);
    await this.emailInput.first().fill(email);
    await this.phoneInput.first().fill(phone);
  }

  /** Click "Reserve Now" again to submit the booking */
  async submitBooking() {
    await this.reserveNowButton.first().click();
  }

  /** Returns true if the "Booking Confirmed" message appears */
  async isBookingConfirmed() {
    try {
      await this.successMessage.first().waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  /** Returns visible validation error text, or null */
  async getErrorText() {
    if (await this.errorAlert.first().isVisible().catch(() => false)) {
      return this.errorAlert.first().innerText();
    }
    return null;
  }
}

module.exports = { BookingPage };