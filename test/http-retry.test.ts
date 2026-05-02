import { describe, it, expect, afterEach } from 'vitest';
import { makeHarness } from './helpers.js';

describe('HttpClient retry policy', () => {
  let harness: ReturnType<typeof makeHarness>;
  afterEach(async () => {
    await harness?.mockAgent.close();
  });

  it('retries 429 (with Retry-After) automatically and eventually succeeds', async () => {
    harness = makeHarness({ maxRetries: 2 });

    // First two responses 429 with Retry-After: 0; third is 200.
    harness.pool
      .intercept({ path: '/v2/me', method: 'GET' })
      .reply(429, { error: 'slow down' }, {
        headers: { 'content-type': 'application/json', 'retry-after': '0' },
      })
      .times(2);
    harness.pool
      .intercept({ path: '/v2/me', method: 'GET' })
      .reply(200, {
        user: { id: '00000000-0000-0000-0000-000000000001', email: 'x', role: 'OWNER' },
        team: null,
        apiKey: null,
      }, { headers: { 'content-type': 'application/json' } });

    const me = await harness.client.me();
    expect(me.user.email).toBe('x');
  });

  it('does NOT retry POST without an idempotency key (5xx)', async () => {
    harness = makeHarness({ maxRetries: 3 });

    let attempts = 0;
    harness.pool
      .intercept({ path: '/v2/images/generate', method: 'POST' })
      .reply(503, () => {
        attempts++;
        return { error: 'svc down' };
      }, { headers: { 'content-type': 'application/json' } })
      .persist();

    await expect(
      harness.client.images.generate({ model: 'midjourney', prompt: 'p' }),
    ).rejects.toThrow();
    expect(attempts).toBe(1);
  });

  it('DOES retry POST with an idempotency key (5xx)', async () => {
    harness = makeHarness({ maxRetries: 1 });

    let attempts = 0;
    harness.pool
      .intercept({ path: '/v2/images/generate', method: 'POST' })
      .reply(503, () => {
        attempts++;
        return { error: 'svc down' };
      }, { headers: { 'content-type': 'application/json' } })
      .persist();

    await expect(
      harness.client.images.generate(
        { model: 'midjourney', prompt: 'p' },
        { idempotencyKey: 'abc' },
      ),
    ).rejects.toThrow();
    expect(attempts).toBe(2);
  });
});
