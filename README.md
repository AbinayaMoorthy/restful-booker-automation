# Restful Booker — Playwright Test Suite
**Target:** https://automationintesting.online/

---

## Project Structure

```
booker-tests/
├── pages/
│   ├── AdminLoginPage.js   — Admin login, logout, nav helpers
│   ├── RoomsPage.js        — Admin rooms panel assertions
│   └── BookingPage.js      — Public booking form & calendar
├── test-data/
│   └── bookingData.js      — All credentials and booking details
├── tests/
│   ├── login.test.js       — TC001, TC003, TC004
│   └── booking.test.js     — TC002
├── playwright.config.js
└── package.json
```

---

## Test Cases

| ID    | File             | Description                                           |
|-------|-----------------|-------------------------------------------------------|
| TC001 | login.test.js   | Home → Admin nav → Login → Rooms page → Logout        |
| TC002 | booking.test.js | Navigate to /rooms → fill form → pick dates → confirm |
| TC003 | login.test.js   | Empty credentials → login rejected                   |
| TC004 | login.test.js   | Wrong credentials → login rejected                   |

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers (first time only)
npx playwright install chromium
```

---

## Running Tests

```bash
# Run all tests (headless by default — set headless: false in config to watch)
npm test

# Watch the browser run (headed mode)
npm run test:headed

# Run only login tests
npm run test:login

# Run only booking test
npm run test:booking

# Debug a specific test step-by-step
npm run test:debug

# Open the HTML report after a run
npm run report
```

---

## Why the Waits Are Here

| Problem in original scripts          | Fix applied                                        |
|--------------------------------------|----------------------------------------------------|
| No wait after page.goto()            | `waitFor({ state: 'visible' })` on key elements    |
| Login click not awaited              | `logoutButton.waitFor()` after clicking Login      |
| Rooms page load not confirmed        | `waitForURL(/rooms/)` + heading `waitFor()`        |
| Logout left on wrong page            | `usernameInput.waitFor()` confirms return to login |
| Calendar clicks not sequenced        | `waitForTimeout(400)` between first/second click   |
| Hard-coded locators broke on SPA     | Multiple `.or()` fallback selectors on form fields |

---

## Admin Credentials (default)
- **Username:** admin  
- **Password:** password  

Change in `test-data/bookingData.js` → `validAdmin`.
