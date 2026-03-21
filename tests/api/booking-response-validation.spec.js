import { expect, test } from '@playwright/test';
import { buildBookingPayload } from '../fixtures/restfulBooker.js';
import { api, assertCreateDoesNotSucceed } from '../helpers/restfulBookerApi.js';

test.describe('Restful Booker — Response validation (create & errors)', () => {
  test('malformed JSON returns 400 or 500', async ({ request }) => {
    const response = await api(request).createBookingRaw('{"firstname":"broken",');
    expect([400, 500]).toContain(response.status());
  });

  test('empty object: response is not a successful booking shape', async ({ request }) => {
    const response = await api(request).createBooking({});
    await assertCreateDoesNotSucceed(response);
  });

  test('missing firstname: not successful create shape', async ({ request }) => {
    const full = buildBookingPayload();
    const { firstname: _drop, ...withoutFirst } = full;
    const response = await api(request).createBooking(withoutFirst);
    await assertCreateDoesNotSucceed(response);
  });

  test('missing lastname: not successful create shape', async ({ request }) => {
    const full = buildBookingPayload();
    const { lastname: _drop, ...withoutLast } = full;
    const response = await api(request).createBooking(withoutLast);
    await assertCreateDoesNotSucceed(response);
  });

  test('missing bookingdates: not successful create shape', async ({ request }) => {
    const full = buildBookingPayload();
    const { bookingdates: _drop, ...withoutDates } = full;
    const response = await api(request).createBooking(withoutDates);
    await assertCreateDoesNotSucceed(response);
  });

  test('empty bookingdates object: not successful create shape', async ({ request }) => {
    const response = await api(request).createBooking(
      buildBookingPayload({ bookingdates: {} })
    );
    await assertCreateDoesNotSucceed(response);
  });

  test('missing checkin in bookingdates: not successful create shape', async ({ request }) => {
    const response = await api(request).createBooking({
      ...buildBookingPayload(),
      bookingdates: { checkout: '2030-03-05' },
    });
    await assertCreateDoesNotSucceed(response);
  });

  test('missing checkout in bookingdates: not successful create shape', async ({ request }) => {
    const response = await api(request).createBooking({
      ...buildBookingPayload(),
      bookingdates: { checkin: '2030-03-01' },
    });
    await assertCreateDoesNotSucceed(response);
  });

  test('bookingdates as string: not successful create shape', async ({ request }) => {
    const response = await api(request).createBooking(
      buildBookingPayload({ bookingdates: '2030-03-01' })
    );
    await assertCreateDoesNotSucceed(response);
  });

  test('null firstname: not successful create shape', async ({ request }) => {
    const response = await api(request).createBooking(
      buildBookingPayload({ firstname: null })
    );
    await assertCreateDoesNotSucceed(response);
  });

  test('array body: not successful create shape', async ({ request }) => {
    const response = await api(request).createBooking([]);
    await assertCreateDoesNotSucceed(response);
  });

  test('response: invalid totalprice string yields 200 and null totalprice in body', async ({
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

  test('response: boolean totalprice yields 200 and null totalprice in body', async ({
    request,
  }) => {
    const response = await api(request).createBooking(
      buildBookingPayload({ totalprice: true })
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.bookingid).toEqual(expect.any(Number));
    expect(body.booking.totalprice).toBeNull();
  });

  test('response: string depositpaid coerces to boolean true in body', async ({ request }) => {
    const response = await api(request).createBooking(
      buildBookingPayload({ depositpaid: 'true' })
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.bookingid).toEqual(expect.any(Number));
    expect(body.booking.depositpaid).toBe(true);
  });

  test('response: numeric checkin coerced to ISO date string in body', async ({ request }) => {
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
});
