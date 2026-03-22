/**
 * Lightweight mobile coverage for a critical Sauce Demo flow (viewport, touch, UA via device emulation).
 */
import { expect, test, devices } from '@playwright/test';
import { navigateToCheckoutStepOne } from '../helpers/flows';
import { SAUCE_DEMO_ITEMS } from '../fixtures/sauceDemoCatalog';


const { defaultBrowserType: _browser, ...iPhone13 } = devices['iPhone 13'];
test.use({ ...iPhone13 });

test.describe('mobile — critical checkout journey', () => {
  test('login → add to cart → checkout → order confirmation', async ({ page }) => {
    const { checkoutPage } = await navigateToCheckoutStepOne(page, SAUCE_DEMO_ITEMS.backpack);

    await checkoutPage.fillInformation('Claudia', 'Naidoo', '2000');
    await checkoutPage.continueCheckout();
    await checkoutPage.finishCheckout();

    await expect(checkoutPage.completeHeader).toBeVisible();
    await expect(checkoutPage.completeHeader).toContainText('Thank you for your order');
  });
});
