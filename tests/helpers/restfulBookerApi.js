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
 * Expect create-booking to fail: HTTP error OR non-success body shape.
 * @param {import('@playwright/test').APIResponse} response
 */
export async function assertCreateDoesNotSucceed(response) {
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

  expect(looksLikeOkCreate, JSON.stringify(body)).toBe(false);
}
