# Test strategy

Notes on Testing Approach. Setup and commands: [README](../README.md).

---

## In scope

- **UI (Sauce Demo):** Auth (happy path, locked out, wrong password, blanks, session/deep link), inventory, cart, checkout, one **mobile** smoke journey.
- **API (Restful Booker):** Auth, booking CRUD (incl. DELETE), response checks that match **real** (sometimes lenient) API behaviour.

## Out of scope

- Load / perf / security testing.
- **Visual snapshot** regression by default (prefer locators; snapshots are optional and high-maintenance).

## Trade-off: inventory count & product UI (third-party site)

**[`tests/inventory.spec.js`](../tests/inventory.spec.js)** asserts a **fixed product count** (`toHaveCount(6)`) and **price labels** after sort that match **today’s** Sauce Demo catalog. That’s intentional: **strong regression signal** vs **maintenance** — if Sauce Demo adds/removes items or changes prices, those tests need updating. Product **names** used in cart/inventory flows come from **[`tests/fixtures/sauceDemoCatalog.js`](../tests/fixtures/sauceDemoCatalog.js)**. We **don’t** use **image snapshot** tests to prove “products visible”; prefer **locators / functional** checks over pixel baselines (**flake** and **upkeep**). See **Out of scope** above.

## Pyramid (where this repo sits)

Most effort is **API + UI in Playwright** (integration / E2E). **Unit** tests would be a future layer for pure helpers (e.g. payload builders, URL utils) if extracted. **Snapshots** stay at the top, sparingly, if ever.

## CI: API health before tests (optional idea)

Run one cheap **`GET`** (e.g. `/health` or sandbox **ping**) in **`globalSetup`** with **`APIRequestContext`** so a **dead API fails fast** instead of burning install + browsers + many failing tests. **UI-only** runs can skip that step via env (e.g. `SKIP_GLOBAL_SETUP`).

## Deliberate gaps

| Topic | Why |
|-------|-----|
| **UI:** not every Sauce Demo persona in `loginUsers.js` | Fixture lists users for reuse; tests cover **representative** outcomes, not every user × every invalid combo (same form, little extra signal). |
| **API:** no separate “invalid username” test | Same **200 + `reason` + no `token`** contract as wrong password on this sandbox. |
| **API:** not assuming strict 4xx on bad bodies | Restful Booker **coerces** input; tests **document actual behaviour**. |

*(Inventory count, prices, and snapshots — see **Trade-off: inventory count & product UI** above.)*

## Config (reminder)

- **UI:** `UI_BASE_URL` optional (see `utils/urls.js`).
- **API:** `API_BASE_URL` in Playwright `api` project.
- Demo credentials in fixtures are **public** sandbox values.
