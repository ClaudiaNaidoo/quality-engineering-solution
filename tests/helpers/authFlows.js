import { expect } from '@playwright/test';
import { InventoryPage } from '../../pages/InventoryPage';
import { LoginPage } from '../../pages/LoginPage';
import { LOGIN_USERS } from '../fixtures/loginUsers';
import { getLoginUrlRegex } from '../../utils/urls';

/**
 * Open Sauce Demo login page.
 * @param {import('@playwright/test').Page} page
 */
async function openLogin(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  return loginPage;
}

/**
 * Submit credentials expecting to stay on login with a visible error.
 * @param {import('@playwright/test').Page} page
 * @param {{ username: string; password: string }} credentials
 * @param {string | RegExp} expectedError
 */
export async function loginAndExpectError(page, credentials, expectedError) {
  const loginPage = await openLogin(page);
  await loginPage.login(credentials.username, credentials.password);

  await expect(page).toHaveURL(getLoginUrlRegex());
  await expect(loginPage.errorMessage).toContainText(expectedError);
  await expect(loginPage.loginButton).toBeVisible();
  return loginPage;
}

/**
 * Successful login; lands on inventory with no error banner.
 * @param {import('@playwright/test').Page} page
 * @param {{ username: string; password: string }} [user]
 */
export async function assertSuccessfulLogin(page, user = LOGIN_USERS.standard) {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await loginPage.goto();
  await loginPage.login(user.username, user.password);

  await expect(page).toHaveURL(/inventory/);
  await expect(inventoryPage.title).toBeVisible();
  await expect(loginPage.errorMessage).toHaveCount(0);
  return { loginPage, inventoryPage };
}
