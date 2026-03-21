import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { LoginPage } from '../../pages/LoginPage';
import { LOGIN_USERS } from '../fixtures/loginUsers';

/**
 * Log in as standard_user and return page objects for follow-on steps.
 * @param {import('@playwright/test').Page} page
 */
export async function loginAsStandardUser(page) {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  await loginPage.goto();
  await loginPage.login(LOGIN_USERS.standard.username, LOGIN_USERS.standard.password);
  return { loginPage, inventoryPage };
}

/**
 * Standard user at checkout step one (your information) with one item in cart.
 * @param {import('@playwright/test').Page} page
 * @param {string} itemName
 */
export async function navigateToCheckoutStepOne(page, itemName) {
  const { inventoryPage } = await loginAsStandardUser(page);
  const cartPage = new CartPage(page);
  await inventoryPage.addItemToCart(itemName);
  await inventoryPage.openCart();
  await cartPage.checkout();
  return { inventoryPage, cartPage, checkoutPage: new CheckoutPage(page) };
}
