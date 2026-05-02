import { describe, it, expect, afterEach } from 'vitest';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { makeHarness } from './helpers.js';

describe('client.uploads.create()', () => {
  let harness: ReturnType<typeof makeHarness>;
  afterEach(async () => {
    await harness?.mockAgent.close();
  });

  it('uploads a Buffer as multipart/form-data', async () => {
    harness = makeHarness();

    let receivedCt: string | undefined;
    harness.pool
      .intercept({
        path: '/v2/uploads',
        method: 'POST',
        headers: (h) => {
          receivedCt = h['content-type'] as string | undefined;
          return true;
        },
      })
      .reply(201, {
        id: '00000000-0000-0000-0000-000000000111',
        url: 'https://cdn/x.png',
        kind: 'image',
        contentType: 'image/png',
        byteSize: 4,
        expiresAt: '2026-05-01T12:00:00.000Z',
      }, { headers: { 'content-type': 'application/json' } });

    const up = await harness.client.uploads.create({
      file: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      filename: 'cat.png',
      contentType: 'image/png',
    });

    expect(up.kind).toBe('image');
    expect(up.url).toBe('https://cdn/x.png');
    expect(receivedCt).toMatch(/^multipart\/form-data; boundary=/);
  });

  it('uploads from a filesystem path', async () => {
    harness = makeHarness();
    const dir = await mkdtemp(join(tmpdir(), 'sdk-test-'));
    const file = join(dir, 'cat.png');
    await writeFile(file, Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    harness.pool
      .intercept({ path: '/v2/uploads', method: 'POST' })
      .reply(201, {
        id: '00000000-0000-0000-0000-000000000222',
        url: 'https://cdn/from-path.png',
        kind: 'image',
        contentType: 'image/png',
        byteSize: 4,
        expiresAt: '2026-05-01T12:00:00.000Z',
      }, { headers: { 'content-type': 'application/json' } });

    try {
      const up = await harness.client.uploads.create({ file });
      expect(up.url).toBe('https://cdn/from-path.png');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
