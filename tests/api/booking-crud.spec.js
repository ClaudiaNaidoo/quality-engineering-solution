import { expect, test } from '@playwright/test';
import { buildUniqueBookingPayload } from '../fixtures/restfulBooker.js';
import { api, getAuthToken, safeDeleteBooking } from '../helpers/restfulBookerApi.js';

test.describe('Restful Booker — Booking CRUD', () => {
  test('CREATE: POST /booking returns bookingid and booking payload', async ({
    request,
  }, testInfo) => {
    const token = await getAuthToken(request);
    const payload = buildUniqueBookingPayload({}, testInfo.workerIndex);
    const response = await api(request).createBooking(payload);
    let bookingId;

    try {
      expect(response.status()).toBe(200);
      const body = await response.json();
      bookingId = body.bookingid;
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
    } finally {
      await safeDeleteBooking(request, bookingId, token);
    }
  });

  test('READ: GET /booking/:id returns stored booking', async ({ request }, testInfo) => {
    const token = await getAuthToken(request);
    const payload = buildUniqueBookingPayload({}, testInfo.workerIndex);
    const created = await api(request).createBooking(payload);
    const { bookingid } = await created.json();

    try {
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
    } finally {
      await safeDeleteBooking(request, bookingid, token);
    }
  });

  test('UPDATE: PUT /booking/:id with token persists changes', async ({ request }, testInfo) => {
    const token = await getAuthToken(request);
    const original = buildUniqueBookingPayload({}, testInfo.workerIndex);
    const created = await api(request).createBooking(original);
    const { bookingid } = await created.json();

    const updated = {
      ...original,
      lastname: `After-${original.lastname}`,
      totalprice: 250,
      additionalneeds: 'Breakfast',
    };

    try {
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
      expect(fetched.lastname).toBe(updated.lastname);
      expect(fetched.totalprice).toBe(250);
    } finally {
      await safeDeleteBooking(request, bookingid, token);
    }
  });

  test('DELETE: removes booking and follow-up GET is 404', async ({ request }, testInfo) => {
    const token = await getAuthToken(request);
    const payload = buildUniqueBookingPayload({}, testInfo.workerIndex);
    const created = await api(request).createBooking(payload);
    const { bookingid } = await created.json();

    try {
      const deleteResponse = await api(request).deleteBooking(bookingid, token);

      expect(deleteResponse.status()).toBe(201);
      const deleteText = await deleteResponse.text();
      expect(deleteText.toLowerCase()).toContain('created');

      const getResponse = await api(request).getBooking(bookingid);
      expect(getResponse.status()).toBe(404);
    } finally {
      await safeDeleteBooking(request, bookingid, token);
    }
  });

  test('end-to-end: create → read → update → delete (DELETE showcased last)', async ({
    request,
  }, testInfo) => {
    const token = await getAuthToken(request);
    const c = api(request);
    const createPayload = buildUniqueBookingPayload({ totalprice: 120 }, testInfo.workerIndex);
    let id;

    try {
      const createRes = await c.createBooking(createPayload);
      expect(createRes.status()).toBe(200);
      const created = await createRes.json();
      id = created.bookingid;
      expect(typeof id).toBe('number');

      const readRes = await c.getBooking(id);
      expect(readRes.status()).toBe(200);
      expect(await readRes.json()).toMatchObject({
        firstname: createPayload.firstname,
        lastname: createPayload.lastname,
      });

      const updatePayload = {
        ...createPayload,
        lastname: `Flow-${createPayload.lastname}`,
        totalprice: 130,
      };
      const putRes = await c.updateBooking(id, updatePayload, token);
      expect(putRes.status()).toBe(200);

      const delRes = await c.deleteBooking(id, token);
      expect(delRes.status()).toBe(201);

      const gone = await c.getBooking(id);
      expect(gone.status()).toBe(404);
    } finally {
      await safeDeleteBooking(request, id, token);
    }
  });
});
