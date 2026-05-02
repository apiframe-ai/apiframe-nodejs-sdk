import { describe, it, expect, afterEach } from 'vitest';
import { makeHarness } from './helpers.js';

describe('client.loras.*', () => {
  let harness: ReturnType<typeof makeHarness>;
  afterEach(async () => {
    await harness?.mockAgent.close();
  });

  it('create posts multipart with metadata + images', async () => {
    harness = makeHarness();

    let receivedCt: string | undefined;
    harness.pool
      .intercept({
        path: '/v2/loras',
        method: 'POST',
        headers: (h) => {
          receivedCt = h['content-type'] as string | undefined;
          return true;
        },
      })
      .reply(202, {
        id: '00000000-0000-0000-0000-000000000aaa',
        status: 'PENDING',
        imageCount: 15,
      }, { headers: { 'content-type': 'application/json' } });

    const lora = await harness.client.loras.create({
      name: 'My cat',
      subjectKind: 'object',
      images: Array.from({ length: 15 }, () => Buffer.from([0xff, 0xd8, 0xff])),
    });

    expect(lora.id).toBe('00000000-0000-0000-0000-000000000aaa');
    expect(lora.status).toBe('PENDING');
    expect(receivedCt).toMatch(/^multipart\/form-data; boundary=/);
  });

  it('create rejects when no images are supplied', async () => {
    harness = makeHarness();
    await expect(
      harness.client.loras.create({ name: 'x', images: [] }),
    ).rejects.toThrow(/images.*required/);
  });

  it('list, get, delete hit the right routes', async () => {
    harness = makeHarness();
    const id = '00000000-0000-0000-0000-000000000bbb';

    harness.pool
      .intercept({ path: '/v2/loras', method: 'GET', query: { limit: '10' } })
      .reply(200, { items: [], nextCursor: null }, {
        headers: { 'content-type': 'application/json' },
      });
    harness.pool
      .intercept({ path: `/v2/loras/${id}`, method: 'GET' })
      .reply(200, {
        id,
        userId: '00000000-0000-0000-0000-000000000001',
        teamId: '00000000-0000-0000-0000-000000000002',
        name: 'My cat',
        subjectKind: 'object',
        gender: null, ethnicity: null, age: null,
        status: 'READY',
        imageCount: 15,
        steps: 1000, loraRank: 32,
        isReady: true,
        error: null,
        createdAt: '2026-05-01T00:00:00.000Z',
        startedAt: null, completedAt: null,
        hasWeights: true,
        triggerWord: 'CATX42',
      }, { headers: { 'content-type': 'application/json' } });
    harness.pool
      .intercept({ path: `/v2/loras/${id}`, method: 'DELETE' })
      .reply(204, '');

    const list = await harness.client.loras.list({ limit: 10 });
    expect(list.items).toEqual([]);
    const lora = await harness.client.loras.get(id);
    expect(lora.triggerWord).toBe('CATX42');
    await harness.client.loras.delete(id);
  });
});
