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

*Single browser (faster):* `npx playwright test --project=ui`

### API tests only

```bash
npx playwright test --project=api
```

*or* `npm run test:api`

---

## 🧹 Linting

ESLint is used to maintain code quality and consistency across UI and API tests (flat config: `eslint.config.mjs`; Playwright rules apply to `tests/**`).

```bash
npm run lint
```

Auto-fix where possible:

```bash
npm run lint:fix
```

---

## 🚀 CI/CD

**QE Test Pipeline** ([`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)) runs on **push** and **pull request** with **concurrency** (same branch cancels older runs). Three parallel jobs on `ubuntu-latest`: **Lint** (`npm run lint`), **API tests** (`--project=api`), **UI tests** (`--project=ui`, Chromium).

**Artifacts** (14 days, per job): `monocart-report-api|ui`, `playwright-report-api|ui`, `test-results-api|ui`.


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
