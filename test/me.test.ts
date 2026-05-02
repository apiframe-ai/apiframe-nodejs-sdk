import { describe, it, expect, afterEach } from 'vitest';
import { makeHarness, TEST_API_KEY } from './helpers.js';

describe('client.me()', () => {
  let harness: ReturnType<typeof makeHarness>;
  afterEach(async () => {
    await harness?.mockAgent.close();
  });

  it('GETs /v2/me with the API key in the X-API-Key header', async () => {
    harness = makeHarness();
    harness.pool
      .intercept({
        path: '/v2/me',
        method: 'GET',
        headers: (h) => h['x-api-key'] === TEST_API_KEY,
      })
      .reply(
        200,
        {
          user: { id: '00000000-0000-0000-0000-000000000001', email: 'me@x.com', role: 'OWNER' },
          team: { id: '00000000-0000-0000-0000-000000000002', name: 'Acme', credits: 1000, plan: 'pro', customerId: null },
          apiKey: { id: '00000000-0000-0000-0000-000000000003', name: 'Default', prefix: 'afk_0000' },
        },
        { headers: { 'content-type': 'application/json' } },
      );

    const me = await harness.client.me();
    expect(me.user.email).toBe('me@x.com');
    expect(me.team?.credits).toBe(1000);
    expect(me.apiKey?.prefix).toBe('afk_0000');
  });
});
