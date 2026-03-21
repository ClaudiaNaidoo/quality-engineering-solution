import { expect } from '@playwright/test';
import { RestfulBookerClient } from '../../utils/apiClient.js';
import { RESTFUL_BOOKER_ADMIN } from '../fixtures/restfulBooker.js';

/** @param {import('@playwright/test').APIRequestContext} request */
export function api(request) {
  return new RestfulBookerClient(request);
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @returns {Promise<string>}
 */
export async function getAuthToken(request) {
  const response = await api(request).auth(RESTFUL_BOOKER_ADMIN);

  expect(response.status(), await response.text()).toBe(200);
  const body = await response.json();
  expect(body).toMatchObject({
    token: expect.stringMatching(/\S+/),
  });
  return body.token;
}

/**
 * Best-effort DELETE; ignores failures (already deleted, network blips).
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {number | undefined | null} bookingId
 * @param {string | undefined | null} token
 */
export async function safeDeleteBooking(request, bookingId, token) {
  if (bookingId == null || token == null) return;
  try {
    await api(request).deleteBooking(bookingId, token);
  } catch {
    // ignore
  }
}

/**
 * Expect create-booking to fail: HTTP error OR non-success body shape.
 * If response includes a bookingid, deletes it in a finally block (no orphans).
 * @param {import('@playwright/test').APIResponse} response
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} token
 */
export async function assertCreateDoesNotSucceed(response, request, token) {
  const status = response.status();
  if (status >= 400) {
    expect(status).toBeGreaterThanOrEqual(400);
    return;
  }

  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return;
  }

  const looksLikeOkCreate =
    typeof body.bookingid === 'number' &&
    body.booking &&
    typeof body.booking === 'object' &&
    typeof body.booking.bookingdates === 'object' &&
    body.booking.bookingdates !== null &&
    typeof body.booking.bookingdates.checkin === 'string' &&
    typeof body.booking.bookingdates.checkout === 'string';

  try {
    expect(looksLikeOkCreate, JSON.stringify(body)).toBe(false);
  } finally {
    if (typeof body.bookingid === 'number') {
      await safeDeleteBooking(request, body.bookingid, token);
    }
  }
}
