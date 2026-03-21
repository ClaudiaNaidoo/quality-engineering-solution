import { expect, test } from '@playwright/test';
import { InventoryPage } from '../../pages/InventoryPage';
import { LoginPage } from '../../pages/LoginPage';
import {
  INVALID_PASSWORD_CREDENTIALS,
  LOGIN_ERRORS,
  LOGIN_USERS,
} from '../fixtures/loginUsers';
import {
  getInventoryUrlRegex,
  getLoginUrlRegex,
  sauceDemoGotoOptions,
  uiPathUrl,
} from '../../utils/urls';

const LOGIN_URL = getLoginUrlRegex();
const INVENTORY_URL = getInventoryUrlRegex();

async function openLogin(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  return loginPage;
}

async function loginAndExpectError(page, { username, password }, expectedError) {
  const loginPage = await openLogin(page);
  await loginPage.login(username, password);

  await expect(page).toHaveURL(LOGIN_URL);
  await expect(loginPage.errorMessage).toContainText(expectedError);
  await expect(loginPage.loginButton).toBeVisible();
  return loginPage;
}

async function assertSuccessfulLogin(page, user = LOGIN_USERS.standard) {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await loginPage.goto();
  await loginPage.login(user.username, user.password);

  await expect(page).toHaveURL(/inventory/);
  await expect(inventoryPage.title).toBeVisible();
  await expect(loginPage.errorMessage).toHaveCount(0);
  return { loginPage, inventoryPage };
}

test.describe('auth happy path ui', () => {
  test('auth standard_user successful login lands on inventory page', async ({ page }) => {
    await assertSuccessfulLogin(page);
  });

  test('auth logout returns user to login page', async ({ page }) => {
    const { loginPage, inventoryPage } = await assertSuccessfulLogin(page);

    await inventoryPage.logout();

    await expect(page).toHaveURL(LOGIN_URL);
    await expect(loginPage.loginButton).toBeVisible();
  });
});

test.describe('auth session and route protection', () => {
  test('unauthenticated deep link to cart shows login', async ({ page }) => {
    await page.goto(uiPathUrl('cart.html'), sauceDemoGotoOptions);
    const loginPage = new LoginPage(page);
    await expect(page).toHaveURL(LOGIN_URL);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('authenticated session persists after reload', async ({ page }) => {
    const { inventoryPage } = await assertSuccessfulLogin(page);
    await page.reload();
    await expect(page).toHaveURL(INVENTORY_URL);
    await expect(inventoryPage.title).toBeVisible();
  });
});

test.describe('auth validation and error handling', () => {
  test('auth locked_out_user shows login error on login page', async ({ page }) => {
    await loginAndExpectError(page, LOGIN_USERS.lockedOut, LOGIN_ERRORS.lockedOut);
  });

  test('auth standard_user with invalid password shows credentials error', async ({ page }) => {
    await loginAndExpectError(
      page,
      INVALID_PASSWORD_CREDENTIALS,
      LOGIN_ERRORS.invalidCredentials
    );
  });

  test('auth blank username shows required username validation', async ({ page }) => {
    await loginAndExpectError(
      page,
      { username: '', password: LOGIN_USERS.standard.password },
      LOGIN_ERRORS.usernameRequired
    );
  });

  test('auth blank password shows required password validation', async ({ page }) => {
    await loginAndExpectError(
      page,
      { username: LOGIN_USERS.standard.username, password: '' },
      LOGIN_ERRORS.passwordRequired
    );
  });

  test('auth blank username and password shows required field validation', async ({ page }) => {
    await loginAndExpectError(
      page,
      { username: '', password: '' },
      LOGIN_ERRORS.usernameRequired
    );
  });

  test('auth error banner can be dismissed after invalid login', async ({ page }) => {
    const loginPage = await loginAndExpectError(
      page,
      INVALID_PASSWORD_CREDENTIALS,
      LOGIN_ERRORS.invalidCredentials
    );
    await loginPage.dismissError();
    await expect(loginPage.errorMessage).toHaveCount(0);
  });

  test('auth valid login succeeds after previous invalid attempt', async ({ page }) => {
    const loginPage = await loginAndExpectError(
      page,
      INVALID_PASSWORD_CREDENTIALS,
      LOGIN_ERRORS.invalidCredentials
    );
    await loginPage.login(LOGIN_USERS.standard.username, LOGIN_USERS.standard.password);

    await expect(page).toHaveURL(INVENTORY_URL);
    await expect(new InventoryPage(page).title).toBeVisible();
    await expect(loginPage.errorMessage).toHaveCount(0);
  });
});

