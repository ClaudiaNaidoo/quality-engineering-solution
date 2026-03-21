const DEFAULT_UI_BASE = 'https://www.saucedemo.com';

/**
 * Escape string for use inside a RegExp.
 * @param {string} s
 * @returns {string}
 */
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalized UI base URL from env (UI_BASE_URL) or default.
 * Uses URL parsing so trailing slashes and shape are consistent.
 * @returns {string}
 */
export function getUiBaseUrl() {
  const raw = (process.env.UI_BASE_URL || DEFAULT_UI_BASE).trim();
  try {
    const u = new URL(raw);
    const path = u.pathname === '/' ? '' : u.pathname.replace(/\/+$/, '');
    return `${u.origin}${path}`;
  } catch {
    return DEFAULT_UI_BASE;
  }
}

/**
 * Regex matching the login page URL: base URL with optional trailing slash.
 * @returns {RegExp}
 */
export function getLoginUrlRegex() {
  return new RegExp(`^${escapeRegExp(getUiBaseUrl())}/?$`);
}

/**
 * Regex matching the inventory page URL (Sauce Demo).
 * @returns {RegExp}
 */
export function getInventoryUrlRegex() {
  return new RegExp(
    `${escapeRegExp(getUiBaseUrl())}/inventory\\.html(\\?.*)?$`
  );
}

/**
 * Regex matching the cart page URL (Sauce Demo).
 * @returns {RegExp}
 */
export function getCartUrlRegex() {
  return new RegExp(`${escapeRegExp(getUiBaseUrl())}/cart\\.html(\\?.*)?$`);
}

/**
 * Checkout step URLs (Sauce Demo).
 * @returns {RegExp}
 */
export function getCheckoutStepOneUrlRegex() {
  return new RegExp(
    `${escapeRegExp(getUiBaseUrl())}/checkout-step-one\\.html(\\?.*)?$`
  );
}

export function getCheckoutStepTwoUrlRegex() {
  return new RegExp(
    `${escapeRegExp(getUiBaseUrl())}/checkout-step-two\\.html(\\?.*)?$`
  );
}

export function getCheckoutCompleteUrlRegex() {
  return new RegExp(
    `${escapeRegExp(getUiBaseUrl())}/checkout-complete\\.html(\\?.*)?$`
  );
}

/**
 * Absolute URL for a Sauce Demo path (e.g. cart.html, inventory.html).
 * @param {string} path - leading slash optional, e.g. "cart.html" or "/cart.html"
 * @returns {string}
 */
export function uiPathUrl(path) {
  const base = getUiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
