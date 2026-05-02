/**
 * Opt-in live smoke test.
 *
 * Disabled by default. Enable with:
 *   APIFRAME_E2E=1 APIFRAME_API_KEY=afk_... npm test
 *
 * Hits the real API (or whatever `APIFRAME_BASE_URL` points to), submits
 * the cheapest possible image generation, then polls until the job
 * resolves. Designed to be the smallest possible round-trip — anything
 * more belongs in CI integration tests.
 */
import { describe, it, expect } from 'vitest';
import { Apiframe } from '../src/index.js';

const RUN_LIVE = process.env.APIFRAME_E2E === '1';
const describeLive = RUN_LIVE ? describe : describe.skip;

describeLive('live smoke (opt-in via APIFRAME_E2E=1)', () => {
  it('submits an image generation and waits for the result', async () => {
    const apiKey = process.env.APIFRAME_API_KEY;
    if (!apiKey) throw new Error('APIFRAME_API_KEY is required when APIFRAME_E2E=1');

    const client = new Apiframe({
      apiKey,
      ...(process.env.APIFRAME_BASE_URL ? { baseUrl: process.env.APIFRAME_BASE_URL } : {}),
      timeout: 30_000,
      maxRetries: 1,
    });

    const me = await client.me();
    expect(me.user?.email).toBeTruthy();

    const submission = await client.images.generate({
      model: 'flux-1.1-pro',
      prompt: 'a single small green circle on a white background, vector',
      fluxParams: { width: 512, height: 512, output_format: 'jpg' },
    });
    expect(submission.jobId).toMatch(/^[0-9a-f-]{36}$/i);

    const job = await client.jobs.waitFor(submission.jobId, {
      intervalMs: 3_000,
      maxIntervalMs: 6_000,
      timeoutMs: 5 * 60_000,
    });
    expect(job.status).toBe('COMPLETED');
    expect(job.result).toBeDefined();
  }, 6 * 60_000);
});
