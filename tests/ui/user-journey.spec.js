import { expect, test } from '@playwright/test';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { SAUCE_DEMO_ITEMS } from '../fixtures/sauceDemoCatalog';
import { loginAsStandardUser } from '../helpers/checkoutFlow';
import { getInventoryUrlRegex } from '../../utils/urls';

const itemName = SAUCE_DEMO_ITEMS.backpack;

test.describe('e2e user journey', () => {
  test('standard user can complete login through checkout', async ({ page }) => {
    const { inventoryPage } = await loginAsStandardUser(page);
    await expect(page).toHaveURL(getInventoryUrlRegex());
    await expect(inventoryPage.title).toBeVisible();

    await inventoryPage.addItemToCart(itemName);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.openCart();
    const cartPage = new CartPage(page);
    await expect(cartPage.title).toBeVisible();
    await expect(cartPage.getCartItems()).toHaveCount(1);
    await expect(cartPage.getCartItem(itemName)).toBeVisible();

    await cartPage.checkout();
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.fillInformation('Claudia', 'Naidoo', '2000');
    await checkoutPage.continueCheckout();
    await checkoutPage.finishCheckout();

    await expect(checkoutPage.completeHeader).toContainText('Thank you for your order');
  });
});
