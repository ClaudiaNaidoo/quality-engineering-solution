/**
 * Expected Sauce Demo catalog data for tests.
 *
 * NOTE:
 * The application under test is a public third-party site (`https://www.saucedemo.com/`).
 * Product names, prices, and inventory size may change without notice, which introduces
 * potential brittleness when asserting against fixed values.
 *
 * Approach taken:
 * For the purposes of this exercise, I’ve chosen to centralise expected values here and
 * assert against them directly. This keeps tests simple, readable, and provides a strong
 * regression signal when the UI changes.
 *
 * Trade-offs:
 * - Pros:
 *   - Clear and explicit assertions
 *   - Easier to understand test intent
 *   - Strong validation of UI correctness
 * - Cons:
 *   - Higher maintenance if/when the external site data changes
 *   - Tests may fail due to data drift rather than functional issues
 *
 * Alternative approach (not implemented here to keep the solution lightweight):
 * - Introduce a flexible assertion strategy (e.g. validate "at least one product" instead of exact counts)
 * - Use data factories or runtime data capture instead of fixed values
 * - Toggle between modes via environment configuration for CI stability (STRICT or FLEXIBLE)
 *
 * Rationale:
 * Given the scope of this assessment, I prioritised clarity and simplicity over configurability,
 * while documenting how this could evolve into a more robust and scalable test data strategy.
 */
export const SAUCE_DEMO_ITEMS = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
};

export const SAUCE_DEMO_INVENTORY_COUNT = 6;
