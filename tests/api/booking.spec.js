import { expect, test } from '@playwright/test';
import {
  RestfulBookerClient,
  RESTFUL_BOOKER_JSON_HEADERS,
} from '../../utils/apiClient.js';
import { buildBookingPayload, RESTFUL_BOOKER_ADMIN } from '../fixtures/restfulBooker';

/** @param {import('@playwright/test').APIRequestContext} request */
function api(request) {
  return new RestfulBookerClient(request);
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @returns {Promise<string>}
 */
async function getAuthToken(request) {
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
async function assertCreateDoesNotSucceed(response) {
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

test.describe('Restful Booker API', () => {
  test.describe('authentication', () => {
    test('returns a token for valid admin credentials', async ({ request }) => {
      const response = await api(request).auth(RESTFUL_BOOKER_ADMIN);

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toMatch(/application\/json/);

      const body = await response.json();
      expect(body).toEqual(
        expect.objectContaining({
          token: expect.any(String),
        })
      );
      expect(body.token.length).toBeGreaterThan(10);
    });

    test('rejects invalid credentials with error payload', async ({ request }) => {
      const response = await api(request).auth({
        username: 'admin',
        password: 'wrong',
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toEqual(
        expect.objectContaining({
          reason: expect.stringMatching(/bad credentials/i),
        })
      );
      expect(body).not.toHaveProperty('token');
    });
  });

  test.describe('booking CRUD', () => {
    test('creates a booking and returns booking id and echo payload', async ({ request }) => {
      const payload = buildBookingPayload({ firstname: 'API', lastname: 'Create' });
      const response = await api(request).createBooking(payload);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toEqual(
        expect.objectContaining({
          bookingid: expect.any(Number),
          booking: expect.objectContaining({
            firstname: payload.firstname,
            lastname: payload.lastname,
            totalprice: payload.totalprice,
            depositpaid: payload.depositpaid,
            bookingdates: payload.bookingdates,
            additionalneeds: payload.additionalneeds,
          }),
        })
      );
    });

    test('reads a booking by id', async ({ request }) => {
      const payload = buildBookingPayload({ firstname: 'API', lastname: 'Read' });
      const created = await api(request).createBooking(payload);
      const { bookingid } = await created.json();

      const response = await api(request).getBooking(bookingid);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toEqual(
        expect.objectContaining({
          firstname: payload.firstname,
          lastname: payload.lastname,
          totalprice: payload.totalprice,
          depositpaid: payload.depositpaid,
          bookingdates: expect.objectContaining({
            checkin: payload.bookingdates.checkin,
            checkout: payload.bookingdates.checkout,
          }),
          additionalneeds: payload.additionalneeds,
        })
      );
    });

    test('updates a booking with token (PUT)', async ({ request }) => {
      const token = await getAuthToken(request);
      const original = buildBookingPayload({ firstname: 'API', lastname: 'UpdateBefore' });
      const created = await api(request).createBooking(original);
      const { bookingid } = await created.json();

      const updated = {
        ...original,
        firstname: 'API',
        lastname: 'UpdateAfter',
        totalprice: 250,
        additionalneeds: 'Breakfast',
      };

      const putResponse = await api(request).updateBooking(bookingid, updated, token);

      expect(putResponse.status()).toBe(200);
      const putBody = await putResponse.json();
      expect(putBody).toEqual(
        expect.objectContaining({
          firstname: updated.firstname,
          lastname: updated.lastname,
          totalprice: updated.totalprice,
          additionalneeds: updated.additionalneeds,
        })
      );

      const getResponse = await api(request).getBooking(bookingid);
      const fetched = await getResponse.json();
      expect(fetched.lastname).toBe('UpdateAfter');
      expect(fetched.totalprice).toBe(250);
    });

    test('deletes a booking with token and GET returns 404', async ({ request }) => {
      const token = await getAuthToken(request);
      const payload = buildBookingPayload({ firstname: 'API', lastname: 'Delete' });
      const created = await api(request).createBooking(payload);
      const { bookingid } = await created.json();

      const deleteResponse = await api(request).deleteBooking(bookingid, token);

      expect(deleteResponse.status()).toBe(201);
      const deleteText = await deleteResponse.text();
      expect(deleteText.toLowerCase()).toContain('created');

      const getResponse = await api(request).getBooking(bookingid);
      expect(getResponse.status()).toBe(404);
    });
  });

  test.describe('booking create — invalid payloads & edge cases', () => {
    test('rejects malformed JSON body', async ({ request }) => {
      const response = await api(request).createBookingRaw('{"firstname":"broken",');
      expect([400, 500]).toContain(response.status());
    });

    test('rejects empty object (missing required booking shape)', async ({ request }) => {
      const response = await api(request).createBooking({});
      await assertCreateDoesNotSucceed(response);
    });

    test('rejects payload missing firstname', async ({ request }) => {
      const full = buildBookingPayload();
      const { firstname: _drop, ...withoutFirst } = full;
      const response = await api(request).createBooking(withoutFirst);
      await assertCreateDoesNotSucceed(response);
    });

    test('rejects payload missing lastname', async ({ request }) => {
      const full = buildBookingPayload();
      const { lastname: _drop, ...withoutLast } = full;
      const response = await api(request).createBooking(withoutLast);
      await assertCreateDoesNotSucceed(response);
    });

    test('rejects payload missing bookingdates', async ({ request }) => {
      const full = buildBookingPayload();
      const { bookingdates: _drop, ...withoutDates } = full;
      const response = await api(request).createBooking(withoutDates);
      await assertCreateDoesNotSucceed(response);
    });

    test('rejects payload with empty bookingdates object', async ({ request }) => {
      const response = await api(request).createBooking(
        buildBookingPayload({ bookingdates: {} })
      );
      await assertCreateDoesNotSucceed(response);
    });

    test('rejects payload missing checkin inside bookingdates', async ({ request }) => {
      const response = await api(request).createBooking({
        ...buildBookingPayload(),
        bookingdates: { checkout: '2030-03-05' },
      });
      await assertCreateDoesNotSucceed(response);
    });

    test('rejects payload missing checkout inside bookingdates', async ({ request }) => {
      const response = await api(request).createBooking({
        ...buildBookingPayload(),
        bookingdates: { checkin: '2030-03-01' },
      });
      await assertCreateDoesNotSucceed(response);
    });

    test('wrong type totalprice non-numeric string: API still 200 but stores null', async ({
      request,
    }) => {
      const response = await api(request).createBooking(
        buildBookingPayload({ totalprice: 'not-a-number' })
      );
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.bookingid).toEqual(expect.any(Number));
      expect(body.booking.totalprice).toBeNull();
    });

    test('wrong type totalprice boolean: API still 200 but stores null', async ({ request }) => {
      const response = await api(request).createBooking(
        buildBookingPayload({ totalprice: true })
      );
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.bookingid).toEqual(expect.any(Number));
      expect(body.booking.totalprice).toBeNull();
    });

    test('wrong type depositpaid string: API coerces to boolean true', async ({ request }) => {
      const response = await api(request).createBooking(
        buildBookingPayload({ depositpaid: 'true' })
      );
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.bookingid).toEqual(expect.any(Number));
      expect(body.booking.depositpaid).toBe(true);
    });

    test('handles wrong type: bookingdates is a string', async ({ request }) => {
      const response = await api(request).createBooking(
        buildBookingPayload({ bookingdates: '2030-03-01' })
      );
      await assertCreateDoesNotSucceed(response);
    });

    test('wrong type checkin as number: API coerces to a date string (lenient)', async ({
      request,
    }) => {
      const response = await api(request).createBooking({
        ...buildBookingPayload(),
        bookingdates: { checkin: 20_300_301, checkout: '2030-03-05' },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.bookingid).toEqual(expect.any(Number));
      expect(body.booking.bookingdates.checkin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(body.booking.bookingdates.checkout).toBe('2030-03-05');
    });

    test('rejects extra invalid root field types (null firstname)', async ({ request }) => {
      const response = await api(request).createBooking(
        buildBookingPayload({ firstname: null })
      );
      await assertCreateDoesNotSucceed(response);
    });

    test('rejects array instead of booking object', async ({ request }) => {
      const response = await api(request).createBooking([]);
      await assertCreateDoesNotSucceed(response);
    });
  });

  test('full flow: auth → create → read → update → delete with response checks', async ({
    request,
  }) => {
    const token = await getAuthToken(request);
    const c = api(request);

    const createPayload = buildBookingPayload({
      firstname: 'Claudia',
      lastname: 'Naidoo',
      totalprice: 120,
    });
    const createRes = await c.createBooking(createPayload);
    expect(createRes.status()).toBe(200);
    const created = await createRes.json();
    const id = created.bookingid;
    expect(typeof id).toBe('number');

    const readRes = await c.getBooking(id);
    expect(readRes.status()).toBe(200);
    expect(await readRes.json()).toMatchObject({
      firstname: createPayload.firstname,
      lastname: createPayload.lastname,
    });

    const updatePayload = {
      ...createPayload,
      lastname: 'FlowUpdated',
      totalprice: 130,
    };
    const putRes = await c.updateBooking(id, updatePayload, token);
    expect(putRes.status()).toBe(200);

    const delRes = await c.deleteBooking(id, token);
    expect(delRes.status()).toBe(201);

    const gone = await c.getBooking(id);
    expect(gone.status()).toBe(404);
  });
});
