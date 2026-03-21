# Playwright Test Automation Solution

UI and API test coverage for **Sauce Demo** (UI) and **Restful Booker** (API), with **Monocart** reporting.

---

## 🛠️ Setup

```bash
npm install
npx playwright install
```

---

## ▶️ Test execution

### All tests (UI browsers + API)

```bash
npx playwright test
```

*or* `npm test`

### UI tests only (Chromium, Firefox, WebKit)

```bash
npm run test:ui
```

*Single browser (faster):* `npx playwright test --project=chromium`

### API tests only

```bash
npx playwright test --project=api
```

*or* `npm run test:api`

---

## 📊 Custom reporting (Monocart)

After any run, Monocart writes an HTML report here:

**`monocart-report/index.html`**

```bash
npx playwright test
```

Then open that file in a browser, or run:

```bash
npx monocart show-report monocart-report/index.html
```

Playwright’s default HTML report is in **`playwright-report/`** (`npx playwright show-report playwright-report`).

---

## ✅ Test execution evidence

Example summary (your numbers will vary):

```text
✔ UI tests: Passed (per browser project)
✔ API tests: Passed
✔ Total: XX tests executed
```

The **Monocart** and **Playwright HTML** reports contain full run details, including failures, traces (on retry), and **screenshots** where configured.

---

## 📁 Project structure (brief)

```text
tests/           # UI specs (*.spec.js) + api/ for API-only specs
pages/           # Page objects (UI)
tests/helpers/   # Shared flows and API helpers
tests/fixtures/  # Test data
utils/           # URLs, API client
```

UI specs live under `tests/`; API specs under `tests/api/` (Playwright `api` project).

---

## 📄 License

ISC — see `package.json`.
