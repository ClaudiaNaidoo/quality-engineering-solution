import { expect, test } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { loginAsStandardUser, navigateToCheckoutStepOne } from './helpers/flows';
import { CHECKOUT_STEP_ONE_ERRORS } from './fixtures/checkoutErrors';
import {
  getCartUrlRegex,
  getCheckoutCompleteUrlRegex,
  getCheckoutStepOneUrlRegex,
  getCheckoutStepTwoUrlRegex,
} from '../utils/urls';

const itemName = 'Sauce Labs Backpack';

test.describe('checkout step one validation', () => {
  test('requires first name', async ({ page }) => {
    const { checkoutPage } = await navigateToCheckoutStepOne(page, itemName);
    await expect(page).toHaveURL(getCheckoutStepOneUrlRegex());

    await checkoutPage.lastNameInput.fill('Naidoo');
    await checkoutPage.postalCodeInput.fill('2000');
    await checkoutPage.continueCheckout();

    await expect(page).toHaveURL(getCheckoutStepOneUrlRegex());
    await expect(checkoutPage.errorMessage).toContainText(
      CHECKOUT_STEP_ONE_ERRORS.firstNameRequired
    );
  });

  test('requires last name', async ({ page }) => {
    const { checkoutPage } = await navigateToCheckoutStepOne(page, itemName);
    await expect(page).toHaveURL(getCheckoutStepOneUrlRegex());

    await checkoutPage.firstNameInput.fill('Claudia');
    await checkoutPage.postalCodeInput.fill('2000');
    await checkoutPage.continueCheckout();

    await expect(page).toHaveURL(getCheckoutStepOneUrlRegex());
    await expect(checkoutPage.errorMessage).toContainText(
      CHECKOUT_STEP_ONE_ERRORS.lastNameRequired
    );
  });

  test('requires postal code', async ({ page }) => {
    const { checkoutPage } = await navigateToCheckoutStepOne(page, itemName);
    await expect(page).toHaveURL(getCheckoutStepOneUrlRegex());

    await checkoutPage.firstNameInput.fill('Claudia');
    await checkoutPage.lastNameInput.fill('Naidoo');
    await checkoutPage.continueCheckout();

    await expect(page).toHaveURL(getCheckoutStepOneUrlRegex());
    await expect(checkoutPage.errorMessage).toContainText(
      CHECKOUT_STEP_ONE_ERRORS.postalCodeRequired
    );
  });
});

test.describe('checkout navigation and end-to-end', () => {
  test('moves from cart URL to checkout step one', async ({ page }) => {
    const { inventoryPage } = await loginAsStandardUser(page);
    const cartPage = new CartPage(page);
    await inventoryPage.addItemToCart(itemName);
    await inventoryPage.openCart();

    await expect(page).toHaveURL(getCartUrlRegex());
    await expect(cartPage.getCartItem(itemName)).toBeVisible();

    await cartPage.checkout();
    await expect(page).toHaveURL(getCheckoutStepOneUrlRegex());
  });

  test('advances through steps with line item on overview and completes order', async ({
    page,
  }) => {
    const { checkoutPage } = await navigateToCheckoutStepOne(page, itemName);

    await expect(page).toHaveURL(getCheckoutStepOneUrlRegex());

    await checkoutPage.fillInformation('Claudia', 'Naidoo', '2000');
    await checkoutPage.continueCheckout();

    await expect(page).toHaveURL(getCheckoutStepTwoUrlRegex());
    await expect(checkoutPage.getSummaryLineItem(itemName)).toBeVisible();
    await expect(checkoutPage.summaryItems).toHaveCount(1);

    await checkoutPage.finishCheckout();

    await expect(page).toHaveURL(getCheckoutCompleteUrlRegex());
    await expect(checkoutPage.completeHeader).toContainText('Thank you for your order');
    await expect(checkoutPage.completeText).toBeVisible();
  });
});
