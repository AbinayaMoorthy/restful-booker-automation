// tests/booking.test.js
// TC002 — Navigate to /rooms and complete one successful booking on the public site

const { test, expect } = require('@playwright/test');
const { BookingPage }    = require('../pages/BookingPage');
const { bookingData }    = require('../test-data/bookingData');

// ═══════════════════════════════════════════════════════════════════════════════
// TC002 — Public Booking Flow
// Navigate to /#/rooms → pick a room → fill details → select dates → confirm
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('TC002 — Public Room Booking Flow', () => {

  test('Navigate to /rooms and complete a successful booking', async ({ page }) => {
    const bookingPage = new BookingPage(page);

    // ── Step 1: Navigate directly to the rooms section ─────────────────
    await page.goto('/#/rooms');

    // The home page renders rooms — wait for "Book this room" buttons
    await bookingPage.bookButtons.first().waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Step 1: /rooms page loaded with booking options');

    // Verify we have at least one bookable room
    const buttonCount = await bookingPage.bookButtons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // ── Step 2: Open the booking form for the first room ───────────────
    await bookingPage.openFirstBookingForm();
    console.log('✅ Step 2: Booking form opened');

    // ── Step 3: Fill in guest contact details ──────────────────────────
    await bookingPage.fillGuestDetails({
      firstname : bookingData.validBooking.firstname,
      lastname  : bookingData.validBooking.lastname,
      email     : bookingData.validBooking.email,
      phone     : bookingData.validBooking.phone,
    });
    console.log('✅ Step 3: Guest details filled');

    // ── Step 4: Select a date range on the calendar ────────────────────
    await bookingPage.selectDateRange(3); // 3 nights
    console.log('✅ Step 4: Date range selected');

    // ── Step 5: Submit the booking ─────────────────────────────────────
    await bookingPage.submitBooking();
    console.log('✅ Step 5: Book Now clicked');

    // ── Step 6: Assert confirmation ─────────────────────────────────────
    // The site shows a modal or inline message on success.
    // We also accept that an error might appear (e.g., dates clash) and
    // will print a clear message rather than silently passing.
    const confirmed = await bookingPage.isBookingConfirmed();

    if (confirmed) {
      console.log('✅ Step 6: Booking confirmed — success message visible');
    } else {
      // Capture whatever is visible for debugging
      const bodyText = await page.locator('body').innerText();
      console.warn('⚠️  Confirmation not detected. Page text snapshot:\n', bodyText.slice(0, 500));
    }

    expect(confirmed).toBeTruthy();
  });

});
