# Restful Booker Automation Framework

![Tests](https://github.com/AbinayaMoorthy/restful-booker-automation/actions/workflows/playwright.yml/badge.svg)

End-to-end UI and API automation framework developed using **Playwright** and **Postman/Newman** for the Restful Booker application.

## Application Under Test

* UI Application: https://automationintesting.online/
* API Service: https://restful-booker.herokuapp.com/

---

# Technology Stack

| Tool         | Purpose                    |
| ------------ | -------------------------- |
| Playwright   | UI Automation              |
| JavaScript   | Programming Language       |
| Postman      | API Testing                |
| Newman       | Command Line API Execution |
| HTML Reports | Test Reporting             |
| Node.js      | Runtime Environment        |
| Git & GitHub | Version Control            |

---

# Project Structure

```text
booker-playwright-tests/
│
├── pages/                     # Page Object Model classes
│   ├── AdminLoginPage.js
│   ├── RoomsPage.js
│   └── BookingPage.js
│
├── tests/                     # Playwright test files
│   ├── login.test.js
│   └── booking.test.js
│
├── test-data/                 # Test data and credentials
│   └── bookingData.js
│
├── postman/
│   ├── restful-booker-collection.json
│   └── reports/
│
├── test-results/              # Playwright raw results
│
├── test-reports/              # Playwright HTML reports
│
├── playwright.config.js
├── package.json
└── README.md
```

---

# Framework Design

* Page Object Model (POM)
* Data-driven approach
* Separate test data management
* UI and API automation in one repository
* HTML reporting support
* Modular and maintainable structure
* GitHub Actions CI — runs on every push, PR, and weekly schedule

---

# UI Test Scenarios

| Test Case ID | Description                                 |
| ------------ | ------------------------------------------- |
| TC001        | Verify Admin Login and Logout functionality |
| TC002        | Verify Room Booking functionality           |
| TC003        | Verify Login with Empty Credentials         |
| TC004        | Verify Login with Invalid Credentials       |

---

# API Test Scenarios

The Postman collection covers:

* Health Check API
* Get Booking IDs
* Get Booking Details
* Create Booking
* Update Booking
* Partial Update Booking
* Delete Booking
* Authentication Token Generation

---

# Installation

Clone the repository:

```bash
git clone https://github.com/AbinayaMoorthy/restful-booker-automation.git

cd restful-booker-automation
```

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

---

# Running Playwright Tests

Run all tests:

```bash
npx playwright test
```

Run tests in headed mode:

```bash
npx playwright test --headed
```

Run specific test file:

```bash
npx playwright test tests/login.test.js
```

Debug tests:

```bash
npx playwright test --debug
```

---

# Playwright Reports

Generate report:

```bash
npx playwright show-report
```

Reports are available inside:

```text
test-reports/
```

---

# Running Postman Collection

Install Newman:

```bash
npm install -g newman
```

Execute collection:

```bash
newman run postman/restful-booker-collection.json
```

Generate HTML report:

```bash
newman run postman/restful-booker-collection.json \
-r cli,html \
--reporter-html-export postman/reports/report.html
```

---

# Test Data

Test data is maintained separately:

```text
test-data/bookingData.js
```

This includes:

* Admin credentials
* Booking details
* Customer information

---

# Sample Credentials

```text
Username: admin
Password: password
```

---

# Reporting

* Playwright HTML Reports
* Newman HTML Reports
* Console Execution Logs

---

# Future Enhancements

* Allure Reporting
* Cross-browser execution
* Environment configuration support
* Data-driven API testing
* Docker execution support

---

# Author

Abinash

QA Automation Engineer

---

# License

This project is intended for learning and portfolio purposes.
