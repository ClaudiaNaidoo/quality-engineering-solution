import { expect, test } from '@playwright/test';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import {
  INVALID_PASSWORD_CREDENTIALS,
  LOGIN_ERRORS,
  LOGIN_USERS,
} from './fixtures/loginUsers';
import { getInventoryUrlRegex, getLoginUrlRegex, uiPathUrl } from '../utils/urls';

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
  test('valid user can login and navigate to inventory page', async ({ page }) => {
    await assertSuccessfulLogin(page);
  });

  test('logged in user can logout and navigate to login page', async ({ page }) => {
    const { loginPage, inventoryPage } = await assertSuccessfulLogin(page);

    await inventoryPage.logout();

    await expect(page).toHaveURL(LOGIN_URL);
    await expect(loginPage.loginButton).toBeVisible();
  });
});

test.describe('auth session and route protection', () => {
  test('unauthenticated user cannot access cart page', async ({ page }) => {
    await page.goto(uiPathUrl('cart.html'));
    const loginPage = new LoginPage(page);
    await expect(page).toHaveURL(LOGIN_URL);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('authenticated user session persists after reload', async ({ page }) => {
    const { inventoryPage } = await assertSuccessfulLogin(page);
    await page.reload();
    await expect(page).toHaveURL(INVENTORY_URL);
    await expect(inventoryPage.title).toBeVisible();
  });
});

test.describe('auth validation and error handling', () => {
  test('locked_out user cannot login and sees error', async ({ page }) => {
    await loginAndExpectError(page, LOGIN_USERS.lockedOut, LOGIN_ERRORS.lockedOut);
  });

  test('valid user with invalid password cannot login and sees error', async ({ page }) => {
    await loginAndExpectError(
      page,
      INVALID_PASSWORD_CREDENTIALS,
      LOGIN_ERRORS.invalidCredentials
    );
  });

  test('blank username cannot login and sees error', async ({ page }) => {
    await loginAndExpectError(
      page,
      { username: '', password: LOGIN_USERS.standard.password },
      LOGIN_ERRORS.usernameRequired
    );
  });

  test('blank password cannot login and sees error', async ({ page }) => {
    await loginAndExpectError(
      page,
      { username: LOGIN_USERS.standard.username, password: '' },
      LOGIN_ERRORS.passwordRequired
    );
  });

  test('blank username and password cannot login and sees error', async ({ page }) => {
    await loginAndExpectError(
      page,
      { username: '', password: '' },
      LOGIN_ERRORS.usernameRequired
    );
  });

  test('invalid login error banner can be dismissed', async ({ page }) => {
    const loginPage = await loginAndExpectError(
      page,
      INVALID_PASSWORD_CREDENTIALS,
      LOGIN_ERRORS.invalidCredentials
    );
    await loginPage.dismissError();
    await expect(loginPage.errorMessage).toHaveCount(0);
  });

  test('valid login succeeds after previous invalid attempt', async ({ page }) => {
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

