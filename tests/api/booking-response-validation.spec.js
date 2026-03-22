import { expect, test } from '@playwright/test';
import { buildUniqueBookingPayload } from '../fixtures/restfulBooker.js';
import {
  api,
  assertCreateDoesNotSucceed,
  getAuthToken,
  safeDeleteBooking,
} from '../helpers/restfulBookerApi.js';

test.describe('Restful Booker — Response validation (create & errors)', () => {
  test('invalid JSON body: POST /booking returns 400 or 500', async ({ request }) => {
    const response = await api(request).createBookingRaw('{"firstname":"broken",');
    expect([400, 500]).toContain(response.status());
  });

  test('POST /booking with {} — response is not a successful create shape', async ({ request }) => {
    const token = await getAuthToken(request);
    const response = await api(request).createBooking({});
    await assertCreateDoesNotSucceed(response, request, token);
  });

  test('missing firstname: not successful create shape', async ({ request }, testInfo) => {
    const token = await getAuthToken(request);
    const full = buildUniqueBookingPayload({}, testInfo.workerIndex);
    const { firstname: _drop, ...withoutFirst } = full;
    const response = await api(request).createBooking(withoutFirst);
    await assertCreateDoesNotSucceed(response, request, token);
  });

  test('missing lastname: not successful create shape', async ({ request }, testInfo) => {
    const token = await getAuthToken(request);
    const full = buildUniqueBookingPayload({}, testInfo.workerIndex);
    const { lastname: _drop, ...withoutLast } = full;
    const response = await api(request).createBooking(withoutLast);
    await assertCreateDoesNotSucceed(response, request, token);
  });

  test('missing bookingdates: not successful create shape', async ({ request }, testInfo) => {
    const token = await getAuthToken(request);
    const full = buildUniqueBookingPayload({}, testInfo.workerIndex);
    const { bookingdates: _drop, ...withoutDates } = full;
    const response = await api(request).createBooking(withoutDates);
    await assertCreateDoesNotSucceed(response, request, token);
  });

  test('empty bookingdates object: not successful create shape', async ({
    request,
  }, testInfo) => {
    const token = await getAuthToken(request);
    const response = await api(request).createBooking(
      buildUniqueBookingPayload({ bookingdates: {} }, testInfo.workerIndex)
    );
    await assertCreateDoesNotSucceed(response, request, token);
  });

  test('missing checkin in bookingdates: not successful create shape', async ({
    request,
  }, testInfo) => {
    const token = await getAuthToken(request);
    const response = await api(request).createBooking({
      ...buildUniqueBookingPayload({}, testInfo.workerIndex),
      bookingdates: { checkout: '2030-03-05' },
    });
    await assertCreateDoesNotSucceed(response, request, token);
  });

  test('missing checkout in bookingdates: not successful create shape', async ({
    request,
  }, testInfo) => {
    const token = await getAuthToken(request);
    const response = await api(request).createBooking({
      ...buildUniqueBookingPayload({}, testInfo.workerIndex),
      bookingdates: { checkin: '2030-03-01' },
    });
    await assertCreateDoesNotSucceed(response, request, token);
  });

  test('bookingdates as string: not successful create shape', async ({
    request,
  }, testInfo) => {
    const token = await getAuthToken(request);
    const response = await api(request).createBooking(
      buildUniqueBookingPayload({ bookingdates: '2030-03-01' }, testInfo.workerIndex)
    );
    await assertCreateDoesNotSucceed(response, request, token);
  });

  test('null firstname: not successful create shape', async ({ request }, testInfo) => {
    const token = await getAuthToken(request);
    const response = await api(request).createBooking(
      buildUniqueBookingPayload({ firstname: null }, testInfo.workerIndex)
    );
    await assertCreateDoesNotSucceed(response, request, token);
  });

  test('array body: not successful create shape', async ({ request }) => {
    const token = await getAuthToken(request);
    const response = await api(request).createBooking([]);
    await assertCreateDoesNotSucceed(response, request, token);
  });

  test('response: invalid totalprice string yields 200 and null totalprice in body', async ({
    request,
  }, testInfo) => {
    const token = await getAuthToken(request);
    const response = await api(request).createBooking(
      buildUniqueBookingPayload({ totalprice: 'not-a-number' }, testInfo.workerIndex)
    );
    let bookingId;
    try {
      expect(response.status()).toBe(200);
      const body = await response.json();
      bookingId = body.bookingid;
      expect(body.bookingid).toEqual(expect.any(Number));
      expect(body.booking.totalprice).toBeNull();
    } finally {
      await safeDeleteBooking(request, bookingId, token);
    }
  });

  test('response: boolean totalprice yields 200 and null totalprice in body', async ({
    request,
  }, testInfo) => {
    const token = await getAuthToken(request);
    const response = await api(request).createBooking(
      buildUniqueBookingPayload({ totalprice: true }, testInfo.workerIndex)
    );
    let bookingId;
    try {
      expect(response.status()).toBe(200);
      const body = await response.json();
      bookingId = body.bookingid;
      expect(body.bookingid).toEqual(expect.any(Number));
      expect(body.booking.totalprice).toBeNull();
    } finally {
      await safeDeleteBooking(request, bookingId, token);
    }
  });

  test('string depositpaid becomes boolean true', async ({
    request,
  }, testInfo) => {
    const token = await getAuthToken(request);
    const response = await api(request).createBooking(
      buildUniqueBookingPayload({ depositpaid: 'true' }, testInfo.workerIndex)
    );
    let bookingId;
    try {
      expect(response.status()).toBe(200);
      const body = await response.json();
      bookingId = body.bookingid;
      expect(body.bookingid).toEqual(expect.any(Number));
      expect(body.booking.depositpaid).toBe(true);
    } finally {
      await safeDeleteBooking(request, bookingId, token);
    }
  });

  test('numeric checkin becomes ISO date', async ({
    request,
  }, testInfo) => {
    const token = await getAuthToken(request);
    const response = await api(request).createBooking({
      ...buildUniqueBookingPayload({}, testInfo.workerIndex),
      bookingdates: { checkin: 20_300_301, checkout: '2030-03-05' },
    });
    let bookingId;
    try {
      expect(response.status()).toBe(200);
      const body = await response.json();
      bookingId = body.bookingid;
      expect(body.bookingid).toEqual(expect.any(Number));
      expect(body.booking.bookingdates.checkin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(body.booking.bookingdates.checkout).toBe('2030-03-05');
    } finally {
      await safeDeleteBooking(request, bookingId, token);
    }
  });
});
