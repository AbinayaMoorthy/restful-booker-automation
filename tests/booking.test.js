// tests/booking.test.js
// TC002 — Complete one successful booking on the public site (redesigned flow)
//
// New flow: Home page → room card "Book now" link → /reservation/{id} page
// → "Reserve Now" reveals guest form → fill details → "Reserve Now" submits
// → "Booking Confirmed" message.

const { test, expect } = require('@playwright/test');
const { BookingPage }  = require('../pages/BookingPage');
const { bookingData }  = require('../test-data/bookingData');

test.describe('TC002 — Public Room Booking Flow', () => {

  test('Navigate to rooms and complete a successful booking', async ({ page }) => {
    const bookingPage = new BookingPage(page);

    // ── Step 1: Home page — room cards with "Book now" reservation links ──
    await bookingPage.goto();
    const roomCount = await bookingPage.roomBookLinks.count();
    expect(roomCount).toBeGreaterThan(0);
    console.log(`✅ Step 1: Home page loaded — ${roomCount} bookable room(s) found`);

    // ── Step 2: Open reservation page with our own future date range ──────
    // (14 days out, 3 nights — set via URL query params, no calendar needed)
    await bookingPage.openFirstReservation(14, 3);
    console.log(`✅ Step 2: Reservation page opened — ${page.url()}`);

    // ── Step 3: Reveal the guest form ─────────────────────────────────────
    await bookingPage.openGuestForm();
    console.log('✅ Step 3: Guest details form revealed');

    // ── Step 4: Fill in guest contact details ─────────────────────────────
    await bookingPage.fillGuestDetails({
      firstname : bookingData.validBooking.firstname,
      lastname  : bookingData.validBooking.lastname,
      email     : bookingData.validBooking.email,
      phone     : bookingData.validBooking.phone,
    });
    console.log('✅ Step 4: Guest details filled');

    // ── Step 5: Submit ────────────────────────────────────────────────────
    await bookingPage.submitBooking();
    console.log('✅ Step 5: Reserve Now clicked');

    // ── Step 6: Assert confirmation ───────────────────────────────────────
    const confirmed = await bookingPage.isBookingConfirmed();

    if (!confirmed) {
      // Surface validation errors (e.g. date clash on the shared sandbox)
      const err = await bookingPage.getErrorText();
      if (err) console.warn('⚠️  Validation error shown:\n', err);
      const bodyText = await page.locator('body').innerText();
      console.warn('⚠️  Confirmation not detected. Page text snapshot:\n', bodyText.slice(0, 500));
    } else {
      console.log('✅ Step 6: Booking confirmed — success message visible');
    }

    expect(confirmed).toBeTruthy();
  });

});