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

*Single file:* `npx playwright test tests/ui/auth.spec.js --project=ui`

### Mobile (iPhone 13 emulation, one critical journey)

```bash
npm run test:mobile
```

*or* `npx playwright test --project=mobile` (Chromium + device profile from `tests/ui/mobile.spec.js`).

### API tests only

```bash
npx playwright test --project=api
```

*or* `npm run test:api`

> **API validation:** Restful Booker **coerces** many invalid payloads instead of returning 4xx (e.g. non-numeric `totalprice` → `null`, `"true"` → boolean); API tests assert **actual behaviour** (characterisation), not strict rejection. Details: [Restful Booker API — payload validation](#restful-booker-api-payload-validation).

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

**Mobile** (`npm run test:mobile`, iPhone 13–style emulation) is **not** in CI by default; add a workflow job with `npx playwright test --project=mobile` if you want it on every push.

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

Latest local run (**Chromium UI + API**, same slice as CI UI/API jobs):

```text
Running 51 tests using 4 workers
…
  51 passed (29.6s)
```

Monocart summary from that run: **51 passed**, **0 failed** (see `monocart-report/index.html` after a run).

### How to refresh this section (or attach proof)

1. **Local — copy terminal output**  
   From the repo root:
   ```bash
   npx playwright test --project=ui --project=api
   ```
   Copy the lines **`Running N tests…`** and **`N passed (…)`** (and any failure summary if you’re documenting a fix).

2. **Local — screenshot Monocart**  
   After the run, open `monocart-report/index.html` in a browser (or run `npx monocart show-report monocart-report/index.html`) and capture the dashboard table.



---

<a id="restful-booker-api-payload-validation"></a>
## Restful Booker API — payload validation

**Approach:** The public API often accepts “invalid” bodies and **normalises or coerces** values rather than failing with 4xx. Early tests assumed strict validation; they were revised to **characterisation tests** that expect the **real responses** (commonly **200** with coerced fields). See especially `tests/api/booking-response-validation.spec.js`.

**Rationale:** There is no published requirement that this demo API must reject bad input; as a third-party sandbox it is **lenient by design**. Tests now **document the real contract** you get when calling the service.

**Quality note:** Passing tests reflect **current** behaviour but flag a **data-integrity risk**: bad input can be accepted and silently transformed. A production API would typically return **4xx** with clear errors instead.

**Summary:** Tests pass against real behaviour; quirks are explicit in specs; stricter validation is recorded as an improvement idea, not a failure of the suite.

---

## 📁 Project structure (brief)

```text
tests/ui/        # UI specs (*.spec.js) — Sauce Demo (+ mobile.spec.js → `mobile` project only)
tests/api/       # API specs (*.spec.js) — Restful Booker
pages/           # Page objects (UI)
tests/helpers/   # Shared flows and API helpers
tests/fixtures/  # Test data
utils/           # URLs, API client
```

UI specs live under **`tests/ui/`** (Playwright `ui` / `firefox` / `webkit` projects). API specs live under **`tests/api/`** (Playwright `api` project).

---

## 📄 License

ISC — see `package.json`.
