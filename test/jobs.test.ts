import { describe, it, expect, afterEach } from 'vitest';
import { makeHarness } from './helpers.js';
import { ApiframeError, TimeoutError } from '../src/index.js';

const JOB_ID = '00000000-0000-0000-0000-000000000abc';

describe('client.jobs.*', () => {
  let harness: ReturnType<typeof makeHarness>;
  afterEach(async () => {
    await harness?.mockAgent.close();
  });

  it('get fetches a job by id', async () => {
    harness = makeHarness();
    harness.pool
      .intercept({ path: `/v2/jobs/${JOB_ID}`, method: 'GET' })
      .reply(200, {
        id: JOB_ID,
        status: 'COMPLETED',
        model: 'midjourney',
        progress: 100,
        result: 'https://cdn/x.png',
        error: null,
        creditCost: 16,
        webhookStatus: null,
        createdAt: '2026-05-01T00:00:00.000Z',
        completedAt: '2026-05-01T00:01:00.000Z',
      }, { headers: { 'content-type': 'application/json' } });

    const job = await harness.client.jobs.get(JOB_ID);
    expect(job.status).toBe('COMPLETED');
    expect(job.result).toBe('https://cdn/x.png');
  });

  it('list passes query params through', async () => {
    harness = makeHarness();
    harness.pool
      .intercept({
        path: '/v2/jobs',
        method: 'GET',
        query: { status: 'COMPLETED', limit: '10' },
      })
      .reply(200, { jobs: [], nextCursor: null, hasMore: false }, {
        headers: { 'content-type': 'application/json' },
      });

    const page = await harness.client.jobs.list({ status: 'COMPLETED', limit: 10 });
    expect(page.hasMore).toBe(false);
  });

  it('waitFor resolves on COMPLETED, fires onProgress per poll', async () => {
    harness = makeHarness();
    harness.pool
      .intercept({ path: `/v2/jobs/${JOB_ID}`, method: 'GET' })
      .reply(200, {
        id: JOB_ID, status: 'PROCESSING', model: 'm', progress: 50, result: null,
        error: null, creditCost: null, webhookStatus: null,
        createdAt: '2026-05-01T00:00:00.000Z', completedAt: null,
      }, { headers: { 'content-type': 'application/json' } })
      .times(1);
    harness.pool
      .intercept({ path: `/v2/jobs/${JOB_ID}`, method: 'GET' })
      .reply(200, {
        id: JOB_ID, status: 'COMPLETED', model: 'm', progress: 100, result: 'https://x',
        error: null, creditCost: 16, webhookStatus: null,
        createdAt: '2026-05-01T00:00:00.000Z', completedAt: '2026-05-01T00:01:00.000Z',
      }, { headers: { 'content-type': 'application/json' } });

    const progressed: number[] = [];
    const job = await harness.client.jobs.waitFor(JOB_ID, {
      intervalMs: 5,
      maxIntervalMs: 5,
      onProgress: (j) => progressed.push(j.progress ?? 0),
    });

    expect(job.status).toBe('COMPLETED');
    expect(progressed).toEqual([50, 100]);
  });

  it('waitFor throws ApiframeError when status is FAILED', async () => {
    harness = makeHarness();
    harness.pool
      .intercept({ path: `/v2/jobs/${JOB_ID}`, method: 'GET' })
      .reply(200, {
        id: JOB_ID, status: 'FAILED', model: 'm', progress: null, result: null,
        error: 'Provider returned 500', creditCost: null, webhookStatus: null,
        createdAt: '2026-05-01T00:00:00.000Z', completedAt: null,
      }, { headers: { 'content-type': 'application/json' } });

    await expect(harness.client.jobs.waitFor(JOB_ID, { intervalMs: 1 })).rejects.toThrow(/Provider returned 500/);
  });

  it('waitFor throws TimeoutError when the budget elapses', async () => {
    harness = makeHarness();
    harness.pool
      .intercept({ path: `/v2/jobs/${JOB_ID}`, method: 'GET' })
      .reply(200, {
        id: JOB_ID, status: 'PROCESSING', model: 'm', progress: 10, result: null,
        error: null, creditCost: null, webhookStatus: null,
        createdAt: '2026-05-01T00:00:00.000Z', completedAt: null,
      }, { headers: { 'content-type': 'application/json' } })
      .persist();

    await expect(
      harness.client.jobs.waitFor(JOB_ID, {
        intervalMs: 5,
        maxIntervalMs: 5,
        timeoutMs: 30,
      }),
    ).rejects.toThrow(TimeoutError);
  });

  it('waitFor honours an external AbortSignal', async () => {
    harness = makeHarness();
    harness.pool
      .intercept({ path: `/v2/jobs/${JOB_ID}`, method: 'GET' })
      .reply(200, {
        id: JOB_ID, status: 'PROCESSING', model: 'm', progress: 0, result: null,
        error: null, creditCost: null, webhookStatus: null,
        createdAt: '2026-05-01T00:00:00.000Z', completedAt: null,
      }, { headers: { 'content-type': 'application/json' } })
      .persist();

    const ctrl = new AbortController();
    const promise = harness.client.jobs.waitFor(JOB_ID, {
      intervalMs: 50,
      maxIntervalMs: 50,
      signal: ctrl.signal,
    });
    setTimeout(() => ctrl.abort(), 10);
    await expect(promise).rejects.toBeInstanceOf(ApiframeError);
  });
});
