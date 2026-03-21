import { expect, test } from '@playwright/test';
import { RESTFUL_BOOKER_ADMIN } from '../fixtures/restfulBooker.js';
import { api } from '../helpers/restfulBookerApi.js';

test.describe('Restful Booker — Authentication', () => {
  test('POST /auth returns token for valid admin credentials', async ({ request }) => {
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

  test('POST /auth returns error payload for invalid password', async ({ request }) => {
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
