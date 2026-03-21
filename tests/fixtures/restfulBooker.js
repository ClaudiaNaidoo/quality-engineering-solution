/** Default credentials from public Restful Booker sandbox */
export const RESTFUL_BOOKER_ADMIN = {
  username: 'admin',
  password: 'password123',
};

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
