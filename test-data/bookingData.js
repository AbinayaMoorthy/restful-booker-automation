// test-data/bookingData.js
// Central place for all test data — change names/dates here once, it updates everywhere

const bookingData = {
  // ── Valid booking used in TC002 ──────────────────────────────────────────
  validBooking: {
    firstname: 'Abinaya',
    lastname: 'Muthu',
    email: 'abinaya@test.com',
    phone: '07712345678',          // must be 11+ digits for the site to accept
    totalprice: '150',
    depositpaid: true,
  },

  // ── Credentials ──────────────────────────────────────────────────────────
  validAdmin: {
    username: 'admin',
    password: 'password',
  },

  invalidAdmin: {
    username: 'wronguser',
    password: 'wrongpass',
  },
};

module.exports = { bookingData };
