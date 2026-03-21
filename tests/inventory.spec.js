import { expect, test } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { LOGIN_USERS } from './fixtures/loginUsers';
import { SAUCE_DEMO_ITEMS } from './fixtures/sauceDemoCatalog';
import { getCartUrlRegex, getInventoryUrlRegex } from '../utils/urls';

const itemName = SAUCE_DEMO_ITEMS.backpack;

function parsePriceLabel(text) {
  return Number.parseFloat(text.replace(/[^0-9.]/g, ''));
}

async function expectPricesSortedAscending(inventoryPage) {
  const labels = await inventoryPage.getDisplayedPrices();
  expect(labels).toHaveLength(6);
  const values = labels.map(parsePriceLabel);
  for (let i = 1; i < values.length; i += 1) {
    expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
  }
  expect(values[0]).toBe(7.99);
  expect(values[values.length - 1]).toBe(49.99);
}

async function expectPricesSortedDescending(inventoryPage) {
  const labels = await inventoryPage.getDisplayedPrices();
  expect(labels).toHaveLength(6);
  const values = labels.map(parsePriceLabel);
  for (let i = 1; i < values.length; i += 1) {
    expect(values[i]).toBeLessThanOrEqual(values[i - 1]);
  }
  expect(values[0]).toBe(49.99);
  expect(values[values.length - 1]).toBe(7.99);
}

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

test.describe('inventory', () => {
  test('shows six products after login', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await expect(inventoryPage.title).toBeVisible();
    await expect(inventoryPage.getInventoryItems()).toHaveCount(6);
  });

  test('sorts prices low to high', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('lohi');
    await expectPricesSortedAscending(inventoryPage);
    await expect(inventoryPage.getItemPriceAt(0)).toHaveText('$7.99');
    await expect(inventoryPage.getItemPriceAt(5)).toHaveText('$49.99');
  });

  test('sorts prices high to low', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('hilo');
    await expectPricesSortedDescending(inventoryPage);
    await expect(inventoryPage.getItemPriceAt(0)).toHaveText('$49.99');
    await expect(inventoryPage.getItemPriceAt(5)).toHaveText('$7.99');
  });

  test('sorts names A to Z', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('az');
    const names = await inventoryPage.getDisplayedItemNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  test('add and remove updates badge and button state', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await expectCartBadgeHidden(inventoryPage);

    await inventoryPage.addItemToCart(itemName);
    await expectCartBadgeCount(inventoryPage, 1);
    await expect(inventoryPage.getAddToCartButton(itemName)).toBeHidden();

    await inventoryPage.removeItemFromCart(itemName);
    await expectCartBadgeHidden(inventoryPage);
    await expect(inventoryPage.getAddToCartButton(itemName)).toBeVisible();
  });

  test('add from inventory appears in cart with correct URL', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addItemToCart(itemName);
    await expectCartBadgeCount(inventoryPage, 1);

    await inventoryPage.openCart();
    await expect(page).toHaveURL(getCartUrlRegex());

    const cartPage = new CartPage(page);
    await expect(cartPage.getCartItem(itemName)).toBeVisible();
    await expect(cartPage.getCartItems()).toHaveCount(1);
  });
});
