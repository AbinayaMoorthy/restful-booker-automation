# Restful Booker — Automation Suite

[![Automation Test Suite](https://github.com/AbinayaMoorthy/restful-booker-automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/AbinayaMoorthy/restful-booker-automation/actions/workflows/playwright.yml)

End-to-end **UI automation (Playwright)** and **REST API automation (Postman / Newman)** for the
Restful Booker demo platform, running in a single repository behind one GitHub Actions pipeline.

| | |
|---|---|
| **UI tests** | 4 test cases · 2 modules · Page Object Model |
| **API tests** | 9 requests · full CRUD + auth + negative path |
| **UI framework** | Playwright Test (JavaScript) |
| **API framework** | Postman collection v2.1 + Newman CLI |
| **UI target** | `https://automationintesting.online` |
| **API target** | `https://restful-booker.herokuapp.com` |

---

## Table of contents

- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the UI tests](#running-the-ui-tests)
- [Running the API tests](#running-the-api-tests)
- [Continuous integration](#continuous-integration)
- [Test coverage](#test-coverage)
- [Design decisions](#design-decisions)
- [Notes on the test server](#notes-on-the-test-server)

---

## Project structure

```text
restful-booker-automation/
│
├── tests/                     # Playwright specs
│   ├── login.test.js          #   TC001, TC003, TC004  Admin authentication
│   └── booking.test.js        #   TC002                Public booking flow
│
├── pages/                     # Page Object Model
│   ├── AdminLoginPage.js      #   Admin login form + post-login navigation
│   ├── RoomsPage.js           #   Admin rooms management
│   └── BookingPage.js         #   Public reservation flow
│
├── test-data/
│   └── bookingData.js         # Credentials and guest details, in one place
│
├── postman/
│   ├── restful-booker-collection.json
│   └── reports/               # Newman HTML output
│
├── .github/workflows/
│   └── playwright.yml         # UI job + API job
│
├── playwright.config.js
└── package.json
```

Generated at runtime and **not committed**: `node_modules/`, `test-results/`, `test-reports/`.

---

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 18 or newer | `node -v` |
| npm | 9 or newer | `npm -v` |

Newman is installed locally as a dev dependency — no global install required.

---

## Installation

```bash
git clone https://github.com/AbinayaMoorthy/restful-booker-automation.git
cd restful-booker-automation

npm install
npx playwright install --with-deps chromium
```

---

## Running the UI tests

```bash
npm test                # full suite
npm run test:headed     # visible browser
npm run test:smoke      # @smoke tagged cases only
npm run test:login      # authentication module only
npm run test:booking    # booking module only
npm run test:debug      # Playwright inspector

npm run report          # open the HTML report
```

---

## Running the API tests

```bash
npm run api:test        # run collection + write HTML report
npm run api:ci          # JUnit output for CI test panels
```

Open the generated report:

```bash
# Windows
start postman\reports\api-test-report.html

# macOS
open postman/reports/api-test-report.html

# Linux
xdg-open postman/reports/api-test-report.html
```

The `htmlextra` report gives per-request assertion breakdowns, response bodies and timings.

### Request order matters

The collection is **stateful and must run top to bottom**. `Get Token` stores the auth cookie and
`Create Booking` stores the booking ID, both of which later requests consume:

```text
Get Token        →  saves token       →  consumed by Update / Patch / Delete
Create Booking   →  saves bookingId   →  consumed by Get Single / Update / Patch / Delete
Delete Booking   →  Verify Deletion asserts the record is gone
```

Running a single request in isolation will fail on an empty variable.

---

## Continuous integration

`.github/workflows/playwright.yml` runs two independent jobs — Playwright UI and Newman API — on
every push to `main`, on pull requests, weekly on a schedule, and on demand from the Actions tab.

Both jobs upload their reports as build artefacts. The UI job additionally uploads traces,
screenshots and videos on failure, so a red CI run can be diagnosed without reproducing locally:

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

---

## Test coverage

### UI — Admin authentication (`login.test.js`)

| ID | Test | Type |
|---|---|---|
| TC001 | Home page → admin login → rooms → logout | `@smoke` |
| TC003 | Empty credentials must not create a session | *negative* |
| TC004 | Invalid credentials must not create a session | *negative* |

### UI — Public booking (`booking.test.js`)

| ID | Test | Type |
|---|---|---|
| TC002 | Complete a reservation end to end and assert confirmation | |

### API (`postman/restful-booker-collection.json`)

| # | Method | Endpoint | Purpose |
|---|---|---|---|
| 1 | GET | `/ping` | Health check |
| 2 | GET | `/booking` | List all booking IDs |
| 3 | GET | `/booking/{id}` | Retrieve a single booking |
| 4 | POST | `/auth` | Generate auth token |
| 5 | POST | `/booking` | Create booking — saves `bookingId` |
| 6 | PUT | `/booking/{id}` | Full update |
| 7 | PATCH | `/booking/{id}` | Partial update |
| 8 | DELETE | `/booking/{id}` | Delete booking |
| 9 | GET | `/booking/{id}` | Verify deletion returns 404 — *negative* |

Assertions cover status codes, response schema, field-level data integrity after update, and
negative-path handling.

---

## Design decisions

### 1. Assertions that can actually fail

An earlier revision asserted `expect(roomCount).toBeGreaterThanOrEqual(0)` on the admin rooms page.
A count is never negative, so that assertion could not fail under any circumstance — the test
looked green whether the page rendered or not.

It is now replaced with a check on the room-management controls. A raw row count is deliberately
*not* asserted: this is a shared public sandbox where anyone can add or delete rooms, so any fixed
expected count would be flaky. The count is recorded as a test annotation for information, and the
verdict rests on something that genuinely proves the page rendered.

### 2. Absence of the login form is the authentication signal

`isLoggedIn()` has been wrong twice, in opposite directions, and both are worth recording.

It originally returned `url.includes('/admin/rooms')`. TC003 and TC004 never navigate to that
route, so it returned `false` whether or not login succeeded — the negative tests were passing for
the wrong reason.

The obvious replacement — check that a logout button is visible — was also wrong. This application
renders the admin navigation bar, logout control included, for unauthenticated visitors too. TC003
and TC004 caught it immediately: both reported an active session directly after a rejected login.

The reliable signal is the login form itself, which the app replaces once a session exists. Its
*absence* distinguishes the two states; the presence of any navigation element does not. TC001 was
corrected the same way — it now asserts the login form disappeared rather than that a logout button
appeared.

### 3. Dates are set by query parameter, not by clicking a calendar

`BookingPage.openFirstReservation()` rewrites `checkin` / `checkout` on the reservation URL rather
than driving the date picker. This skips the most fragile widget on the site and pushes the stay
14 days out, which avoids clashing with other people's bookings on the shared sandbox.

### 4. No cosmetic hard waits

`page.waitForTimeout()` calls that existed only to make a run watchable have been removed. Every
wait now targets a specific element or URL, so a timeout means something real.

### 5. Locators tolerate the 2025 site redesign

The public booking flow changed from an inline calendar modal to a dedicated `/reservation/{id}`
page. Locators are anchored on `href` patterns and accessible roles with `.or()` fallbacks rather
than on CSS classes, so a class rename does not silently match nothing.

### 6. Headers are sent as headers, not as query parameters

An earlier revision of the Postman collection carried `Content-Type`, `Accept` and `Cookie` as URL
query parameters rather than as request headers. The suite still passed, because the target service
is permissive and Postman supplies a default `Content-Type` regardless — a good example of tests
going green while the request under test is malformed.

The `Cookie` case was the serious one: it placed the session token in the URL, where in any real
system it would be captured by server access logs, proxy logs and browser history. Auth material
belongs in a header, never in a query string. All four affected requests now set these as headers.

---

## Notes on the test server

Both targets are **public shared demo applications**. Credentials (`admin` / `password`) are
published in the platform's own documentation and are not secrets. No real data exists on either
service.

Two consequences worth stating plainly:

1. The data is mutable by anyone. Tests assert on behaviour and on their own created records, never
   on a fixed pre-existing dataset.
2. A failing run is not automatically a test defect — the sandbox is periodically reset. CI retries
   twice for this reason.

## Test metrics

Two scripts in the repository root instrument the suite for analysis:

- `collect-runs.ps1` — runs both suites repeatedly, writing timestamped JSON
  per run to `metrics/raw/` (gitignored; regenerable)
- `flatten-metrics.js` — flattens the nested Playwright and Newman output into
  CSV tables suitable for a BI tool

The resulting dashboard — covering pass-rate trend, flakiness detection and
P95 API latency across 15 consecutive runs — lives in a separate repository:
[qa-metrics-dashboard](https://github.com/AbinayaMoorthy/qa-metrics-dashboard).

---

## Author

**Abinaya Moorthy** — QA Engineer
Manual testing · API automation · UI automation · CI/CD

---

## License

MIT — see [LICENSE](LICENSE).