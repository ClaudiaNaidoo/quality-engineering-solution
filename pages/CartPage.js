export class CartPage {
  constructor(page) {
    this.page = page;
    this.title = page.getByText('Your Cart');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
    this.cartItems = page.locator('[data-test="inventory-item"]');
  }

  getCartItems() {
    return this.cartItems;
  }

  getCartItem(itemName) {
    return this.cartItems.filter({ hasText: itemName });
  }

  removeItem(itemName) {
    return this.getCartItem(itemName)
      .getByRole('button', { name: /^remove$/i })
      .click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}

