import { expect, test } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { LOGIN_USERS } from './fixtures/loginUsers';
import { SAUCE_DEMO_ITEMS } from './fixtures/sauceDemoCatalog';
import { getCartUrlRegex, getInventoryUrlRegex } from '../utils/urls';

const itemName = SAUCE_DEMO_ITEMS.backpack;
const secondItemName = SAUCE_DEMO_ITEMS.bikeLight;

async function expectCartBadgeHidden(inventoryPage) {
  await expect(inventoryPage.cartBadge).toBeHidden();
}

async function expectCartBadgeCount(inventoryPage, count) {
  await expect(inventoryPage.cartBadge).toHaveText(String(count));
}

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(LOGIN_USERS.standard.username, LOGIN_USERS.standard.password);
  await expect(page).toHaveURL(getInventoryUrlRegex());
});

test.describe('cart', () => {
  test('cart starts empty after login', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await expectCartBadgeHidden(inventoryPage);

    await inventoryPage.openCart();
    await expect(page).toHaveURL(getCartUrlRegex());

    const cartPage = new CartPage(page);
    await expect(cartPage.title).toBeVisible();
    await expect(cartPage.getCartItems()).toHaveCount(0);
  });

  test('badge and items persist across inventory and cart pages', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addItemToCart(itemName);
    await inventoryPage.addItemToCart(secondItemName);
    await expectCartBadgeCount(inventoryPage, 2);

    await inventoryPage.openCart();
    await expect(page).toHaveURL(getCartUrlRegex());

    const cartPage = new CartPage(page);
    await expect(cartPage.getCartItem(itemName)).toBeVisible();
    await expect(cartPage.getCartItem(secondItemName)).toBeVisible();
    await expect(cartPage.getCartItems()).toHaveCount(2);

    await cartPage.continueShopping();
    await expect(page).toHaveURL(getInventoryUrlRegex());
    await expect(inventoryPage.title).toBeVisible();
    await expectCartBadgeCount(inventoryPage, 2);
  });

  test('adding to cart shows line item', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addItemToCart(itemName);
    await expectCartBadgeCount(inventoryPage, 1);

    await inventoryPage.openCart();
    await expect(page).toHaveURL(getCartUrlRegex());

    const cartPage = new CartPage(page);
    await expect(cartPage.getCartItem(itemName)).toBeVisible();
    await expect(cartPage.getCartItems()).toHaveCount(1);
  });

  test('removing last item clears cart and hides badge', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addItemToCart(itemName);
    await expectCartBadgeCount(inventoryPage, 1);

    await inventoryPage.openCart();
    await expect(page).toHaveURL(getCartUrlRegex());

    const cartPage = new CartPage(page);
    await cartPage.removeItem(itemName);

    await expect(cartPage.getCartItem(itemName)).toHaveCount(0);
    await expect(cartPage.getCartItems()).toHaveCount(0);
    await expectCartBadgeHidden(inventoryPage);

    await cartPage.continueShopping();
    await expect(page).toHaveURL(getInventoryUrlRegex());
    await expect(inventoryPage.getAddToCartButton(itemName)).toBeVisible();
  });

  test('cart items persist after page refresh', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addItemToCart(itemName);
    await expectCartBadgeCount(inventoryPage, 1);

    await inventoryPage.openCart();
    await expect(page).toHaveURL(getCartUrlRegex());

    const cartPage = new CartPage(page);
    await page.reload();
    await expect(page).toHaveURL(getCartUrlRegex());

    await expect(cartPage.title).toBeVisible();
    await expectCartBadgeCount(inventoryPage, 1);
    await expect(cartPage.getCartItem(itemName)).toBeVisible();
    await expect(cartPage.getCartItems()).toHaveCount(1);
  });

  test('removing one item leaves the other item and updates badge', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addItemToCart(itemName);
    await inventoryPage.addItemToCart(secondItemName);
    await expectCartBadgeCount(inventoryPage, 2);

    await inventoryPage.openCart();
    await expect(page).toHaveURL(getCartUrlRegex());

    const cartPage = new CartPage(page);
    await cartPage.removeItem(itemName);

    await expect(cartPage.getCartItem(itemName)).toHaveCount(0);
    await expect(cartPage.getCartItem(secondItemName)).toBeVisible();
    await expect(cartPage.getCartItems()).toHaveCount(1);
    await expectCartBadgeCount(inventoryPage, 1);
  });
});
