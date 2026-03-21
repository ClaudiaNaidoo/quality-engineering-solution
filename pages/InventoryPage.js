export class InventoryPage {
  constructor(page) {
    this.page = page;
    this.title = page.getByText('Products');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
  }

  getInventoryItems() {
    return this.inventoryItems;
  }

  /**
   * @param {number} index - 0-based
   */
  getInventoryItemAt(index) {
    return this.inventoryItems.nth(index);
  }

  /**
   * Product card containing the given product name.
   * @param {string} itemName
   */
  getInventoryItemByName(itemName) {
    return this.inventoryItems.filter({ hasText: itemName });
  }

  /**
   * Price locator for the item at index (after sort, index reflects order).
   * @param {number} index
   */
  getItemPriceAt(index) {
    return this.getInventoryItemAt(index).locator('[data-test="inventory-item-price"]');
  }

  /**
   * Price locator inside a named product row.
   * @param {string} itemName
   */
  getItemPriceForProduct(itemName) {
    return this.getInventoryItemByName(itemName).locator('[data-test="inventory-item-price"]');
  }

  /**
   * Name locator for the item at index.
   * @param {number} index
   */
  getItemNameAt(index) {
    return this.getInventoryItemAt(index).locator('[data-test="inventory-item-name"]');
  }

  /**
   * All displayed price labels in visual order.
   * @returns {Promise<string[]>}
   */
  async getDisplayedPrices() {
    return this.inventoryItems.locator('[data-test="inventory-item-price"]').allTextContents();
  }

  /**
   * All displayed product names in visual order.
   * @returns {Promise<string[]>}
   */
  async getDisplayedItemNames() {
    return this.inventoryItems.locator('[data-test="inventory-item-name"]').allTextContents();
  }

  /**
   * Add-to-cart is labelled "Add to cart" only; scope to the product row by name.
   * @param {string} itemName
   */
  getAddToCartButton(itemName) {
    return this.getInventoryItemByName(itemName).getByRole('button', {
      name: /^add to cart$/i,
    });
  }

  addItemToCart(itemName) {
    return this.getAddToCartButton(itemName).click();
  }

  removeItemFromCart(itemName) {
    return this.getInventoryItemByName(itemName).getByRole('button', {
      name: /^remove$/i,
    }).click();
  }

  async openCart() {
    await this.cartLink.click();
  }

  async sortBy(optionValue) {
    await this.sortDropdown.selectOption(optionValue);
  }

  async logout() {
    await this.burgerMenuButton.click();
    await this.logoutLink.click();
  }
}
