import { describe, it, expect, afterEach } from 'vitest';
import { makeHarness } from './helpers.js';

describe('client.assets.*', () => {
  let harness: ReturnType<typeof makeHarness>;
  afterEach(async () => {
    await harness?.mockAgent.close();
  });

  it('create posts JSON', async () => {
    harness = makeHarness();
    let body: unknown;
    harness.pool
      .intercept({ path: '/v2/assets/create', method: 'POST' })
      .reply(201, (opts) => {
        body = JSON.parse(opts.body as string);
        return { assetId: 'kie-asset-123' };
      }, { headers: { 'content-type': 'application/json' } });

    const r = await harness.client.assets.create({ url: 'https://x', type: 'image' });
    expect(r.assetId).toBe('kie-asset-123');
    expect(body).toEqual({ url: 'https://x', type: 'image' });
  });

  it('get fetches by id', async () => {
    harness = makeHarness();
    harness.pool
      .intercept({ path: '/v2/assets/abc', method: 'GET' })
      .reply(200, { foo: 'bar' }, { headers: { 'content-type': 'application/json' } });

    const r = (await harness.client.assets.get('abc')) as { foo: string };
    expect(r.foo).toBe('bar');
  });
});
