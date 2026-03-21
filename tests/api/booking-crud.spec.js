import { expect, test } from '@playwright/test';
import { buildBookingPayload } from '../fixtures/restfulBooker.js';
import { api, getAuthToken } from '../helpers/restfulBookerApi.js';

test.describe('Restful Booker — Booking CRUD', () => {
  test('CREATE: POST /booking returns bookingid and echoed booking', async ({ request }) => {
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

  test('READ: GET /booking/:id returns stored booking', async ({ request }) => {
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

  test('UPDATE: PUT /booking/:id with token persists changes', async ({ request }) => {
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

  test('DELETE: removes booking and follow-up GET is 404', async ({ request }) => {
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

  test('end-to-end: create → read → update → delete (DELETE showcased last)', async ({
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
