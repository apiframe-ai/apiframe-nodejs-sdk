import { describe, it, expect, afterEach } from 'vitest';
import { makeHarness } from './helpers.js';

describe('client.models.list()', () => {
  let harness: ReturnType<typeof makeHarness>;
  afterEach(async () => {
    await harness?.mockAgent.close();
  });

  it('returns the catalog without filtering', async () => {
    harness = makeHarness();
    harness.pool
      .intercept({ path: '/v2/models', method: 'GET' })
      .reply(200, { models: [{ id: 'midjourney', label: 'Midjourney', modality: 'image' }] }, {
        headers: { 'content-type': 'application/json' },
      });

    const { models } = await harness.client.models.list();
    expect(models).toHaveLength(1);
    expect(models[0]?.id).toBe('midjourney');
  });

  it('applies the modality filter via query string', async () => {
    harness = makeHarness();
    harness.pool
      .intercept({ path: '/v2/models', method: 'GET', query: { modality: 'video' } })
      .reply(200, { models: [{ id: 'kling-2.5-turbo-pro', label: 'Kling 2.5 Turbo Pro', modality: 'video' }] }, {
        headers: { 'content-type': 'application/json' },
      });

    const { models } = await harness.client.models.list({ modality: 'video' });
    expect(models[0]?.modality).toBe('video');
  });
});
