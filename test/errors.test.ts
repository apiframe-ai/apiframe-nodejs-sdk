import { describe, it, expect, afterEach } from 'vitest';
import { makeHarness } from './helpers.js';
import {
  ValidationError,
  AuthenticationError,
  PermissionError,
  InsufficientCreditsError,
  NotFoundError,
  RateLimitError,
  ServerError,
  type ApiframeError,
} from '../src/index.js';

describe('error mapping', () => {
  let harness: ReturnType<typeof makeHarness>;
  afterEach(async () => {
    await harness?.mockAgent.close();
  });

  it('400 → ValidationError with details', async () => {
    harness = makeHarness();
    harness.pool
      .intercept({ path: '/v2/me', method: 'GET' })
      .reply(400, { error: 'Bad', details: { 'foo.bar': ['nope'] } }, {
        headers: { 'content-type': 'application/json' },
      });

    const err = await harness.client.me().catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect((err as ValidationError).details).toEqual({ 'foo.bar': ['nope'] });
  });

  it('401 → AuthenticationError', async () => {
    harness = makeHarness();
    harness.pool.intercept({ path: '/v2/me', method: 'GET' }).reply(401, { error: 'Bad key' }, {
      headers: { 'content-type': 'application/json' },
    });
    const err = await harness.client.me().catch((e) => e);
    expect(err).toBeInstanceOf(AuthenticationError);
    expect((err as AuthenticationError).message).toBe('Bad key');
  });

  it('402 → InsufficientCreditsError', async () => {
    harness = makeHarness();
    harness.pool.intercept({ path: '/v2/me', method: 'GET' }).reply(402, {
      error: 'Insufficient credits',
      creditsRequired: 50,
      creditsAvailable: 10,
    }, { headers: { 'content-type': 'application/json' } });

    const err = await harness.client.me().catch((e) => e);
    expect(err).toBeInstanceOf(InsufficientCreditsError);
    expect((err as InsufficientCreditsError).creditsRequired).toBe(50);
    expect((err as InsufficientCreditsError).creditsAvailable).toBe(10);
  });

  it('403 → PermissionError', async () => {
    harness = makeHarness();
    harness.pool.intercept({ path: '/v2/me', method: 'GET' }).reply(403, { error: 'No' }, {
      headers: { 'content-type': 'application/json' },
    });
    await expect(harness.client.me()).rejects.toBeInstanceOf(PermissionError);
  });

  it('404 → NotFoundError', async () => {
    harness = makeHarness();
    harness.pool
      .intercept({ path: '/v2/jobs/00000000-0000-0000-0000-000000000fff', method: 'GET' })
      .reply(404, { error: 'No such' }, { headers: { 'content-type': 'application/json' } });

    await expect(harness.client.jobs.get('00000000-0000-0000-0000-000000000fff')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('429 → RateLimitError with retryAfterSeconds parsed from header', async () => {
    harness = makeHarness();
    harness.pool.intercept({ path: '/v2/me', method: 'GET' }).reply(429, { error: 'slow down' }, {
      headers: { 'content-type': 'application/json', 'retry-after': '7' },
    });
    const err = await harness.client.me().catch((e) => e);
    expect(err).toBeInstanceOf(RateLimitError);
    expect((err as RateLimitError).retryAfterSeconds).toBe(7);
  });

  it('500 → ServerError; .body preserved for debugging', async () => {
    harness = makeHarness();
    harness.pool.intercept({ path: '/v2/me', method: 'GET' }).reply(500, { error: 'boom' }, {
      headers: { 'content-type': 'application/json' },
    });
    const err = await harness.client.me().catch((e) => e);
    expect(err).toBeInstanceOf(ServerError);
    expect((err as ApiframeError).body).toEqual({ error: 'boom' });
  });
});
