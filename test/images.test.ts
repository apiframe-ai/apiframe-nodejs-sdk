import { describe, it, expect, afterEach } from 'vitest';
import { makeHarness, TEST_API_KEY } from './helpers.js';

describe('client.images.*', () => {
  let harness: ReturnType<typeof makeHarness>;
  afterEach(async () => {
    await harness?.mockAgent.close();
  });

  it('generate posts the body verbatim, returns JobAccepted', async () => {
    harness = makeHarness();

    let receivedBody: unknown;
    harness.pool
      .intercept({
        path: '/v2/images/generate',
        method: 'POST',
        headers: (h) => h['x-api-key'] === TEST_API_KEY && h['content-type'] === 'application/json',
      })
      .reply(202, (opts) => {
        receivedBody = JSON.parse(opts.body as string);
        return {
          jobId: '00000000-0000-0000-0000-000000000123',
          status: 'QUEUED',
        };
      }, { headers: { 'content-type': 'application/json' } });

    const result = await harness.client.images.generate({
      model: 'midjourney',
      prompt: 'a cat',
      midjourneyParams: { aspect_ratio: '16:9' },
    });

    expect(result.jobId).toBe('00000000-0000-0000-0000-000000000123');
    expect(result.status).toBe('QUEUED');
    expect(receivedBody).toEqual({
      model: 'midjourney',
      prompt: 'a cat',
      midjourneyParams: { aspect_ratio: '16:9' },
    });
  });

  it('forwards the idempotency key', async () => {
    harness = makeHarness();

    let receivedKey: string | undefined;
    harness.pool
      .intercept({
        path: '/v2/images/generate',
        method: 'POST',
        headers: (h) => {
          receivedKey = h['idempotency-key'] as string | undefined;
          return true;
        },
      })
      .reply(202, { jobId: '00000000-0000-0000-0000-000000000999', status: 'QUEUED' }, {
        headers: { 'content-type': 'application/json' },
      });

    await harness.client.images.generate(
      { model: 'midjourney', prompt: 'x' },
      { idempotencyKey: 'abc-123' },
    );
    expect(receivedKey).toBe('abc-123');
  });

  it('upscale, edit, removeBackground hit their respective routes', async () => {
    harness = makeHarness();
    for (const path of [
      '/v2/images/upscale',
      '/v2/images/edit',
      '/v2/images/background-remove',
    ]) {
      harness.pool
        .intercept({ path, method: 'POST' })
        .reply(202, { jobId: 'x', status: 'QUEUED' }, {
          headers: { 'content-type': 'application/json' },
        });
    }

    await harness.client.images.upscale({
      model: 'topaz-image-upscale',
      topazUpscaleParams: { image: 'https://x', upscale_factor: 2 },
    });
    await harness.client.images.edit({
      model: 'flux-fill-pro',
      fluxFillParams: { prompt: 'p', image: 'https://x', mode: 'inpaint', mask: 'https://m' },
    });
    await harness.client.images.removeBackground({
      model: 'bria-bg-remove',
      briaBgRemoveParams: { image: 'https://x' },
    });
  });
});
