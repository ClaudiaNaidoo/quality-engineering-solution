/**
 * Restful Booker HTTP client wrapping Playwright {@link import('@playwright/test').APIRequestContext}.
 * @see https://restful-booker.herokuapp.com/apidoc/index.html
 */

const DEFAULT_API_BASE = 'https://restful-booker.herokuapp.com';

export function getApiBaseUrl() {
  const raw = (process.env.API_BASE_URL || DEFAULT_API_BASE).trim();
  return raw.replace(/\/+$/, '');
}

export const RESTFUL_BOOKER_JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

/**
 * @param {string} token
 * @returns {{ Cookie: string }}
 */
export function authCookieHeader(token) {
  return { Cookie: `token=${token}` };
}

export class RestfulBookerClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   * @param {string} [baseURL]
   */
  constructor(request, baseURL = getApiBaseUrl()) {
    this.request = request;
    this.baseURL = baseURL;
  }

  /** @param {{ username: string; password: string }} credentials */
  auth(credentials) {
    return this.request.post(`${this.baseURL}/auth`, {
      data: credentials,
      headers: RESTFUL_BOOKER_JSON_HEADERS,
    });
  }

  /**
   * POST /booking with JSON-serializable body.
   * @param {unknown} data
   * @param {Record<string, string>} [extraHeaders]
   */
  createBooking(data, extraHeaders = {}) {
    return this.request.post(`${this.baseURL}/booking`, {
      data,
      headers: { ...RESTFUL_BOOKER_JSON_HEADERS, ...extraHeaders },
    });
  }

  /**
   * POST /booking with a raw string body (e.g. malformed JSON tests).
   * @param {string} rawBody
   */
  createBookingRaw(rawBody) {
    return this.request.post(`${this.baseURL}/booking`, {
      data: rawBody,
      headers: RESTFUL_BOOKER_JSON_HEADERS,
    });
  }

  /** @param {string | number} bookingId */
  getBooking(bookingId) {
    return this.request.get(`${this.baseURL}/booking/${bookingId}`, {
      headers: { Accept: 'application/json' },
    });
  }

  /**
   * @param {string | number} bookingId
   * @param {unknown} data
   * @param {string} token
   */
  updateBooking(bookingId, data, token) {
    return this.request.put(`${this.baseURL}/booking/${bookingId}`, {
      data,
      headers: {
        ...RESTFUL_BOOKER_JSON_HEADERS,
        ...authCookieHeader(token),
      },
    });
  }

  /**
   * @param {string | number} bookingId
   * @param {string} token
   */
  deleteBooking(bookingId, token) {
    return this.request.delete(`${this.baseURL}/booking/${bookingId}`, {
      headers: {
        Accept: 'application/json',
        ...authCookieHeader(token),
      },
    });
  }
}
