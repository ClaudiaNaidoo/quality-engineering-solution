import { randomUUID } from 'node:crypto';

/** Default credentials from public Restful Booker sandbox */
export const RESTFUL_BOOKER_ADMIN = {
  username: 'admin',
  password: 'password123',
};

/**
 * Collision-resistant suffix for parallel runs (worker + time + uuid fragment).
 * @param {number} [workerIndex] Playwright `testInfo.workerIndex` when available
 */
export function uniqueSuffix(workerIndex = 0) {
  return `${workerIndex}-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

/**
 * @param {Record<string, unknown>} [overrides] Applied after unique firstname/lastname
 * @param {number} [workerIndex]
 */
export function buildUniqueBookingPayload(overrides = {}, workerIndex = 0) {
  const id = uniqueSuffix(workerIndex);
  return buildBookingPayload({
    firstname: `API-${id}`,
    lastname: `Test-${id}`,
    ...overrides,
  });
}

/**
 * @param {Record<string, unknown>} [overrides]
 */
export function buildBookingPayload(overrides = {}) {
  return {
    firstname: 'Claudia',
    lastname: 'Naidoo',
    totalprice: 199,
    depositpaid: true,
    bookingdates: {
      checkin: '2030-03-01',
      checkout: '2030-03-05',
    },
    additionalneeds: 'Late checkout',
    ...overrides,
  };
}
