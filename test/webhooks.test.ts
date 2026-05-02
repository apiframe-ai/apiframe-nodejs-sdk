import { describe, it, expect } from 'vitest';
import { createHash, createHmac } from 'node:crypto';
import { verifyWebhook } from '../src/webhooks.js';

const KEY = 'afk_0000000000000000000000000000000000000000';
const BODY = JSON.stringify({ jobId: 'abc', status: 'COMPLETED' });

function sign(apiKey: string, body: string): string {
  const secret = createHash('sha256').update(apiKey).digest();
  return 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
}

describe('verifyWebhook', () => {
  it('accepts a valid signature with the sha256= prefix', () => {
    const sig = sign(KEY, BODY);
    expect(verifyWebhook({ apiKey: KEY, body: BODY, signature: sig })).toBe(true);
  });

  it('accepts a valid signature without the sha256= prefix', () => {
    const sig = sign(KEY, BODY).slice('sha256='.length);
    expect(verifyWebhook({ apiKey: KEY, body: BODY, signature: sig })).toBe(true);
  });

  it('accepts a Buffer body', () => {
    const sig = sign(KEY, BODY);
    expect(verifyWebhook({ apiKey: KEY, body: Buffer.from(BODY), signature: sig })).toBe(true);
  });

  it('rejects a tampered body', () => {
    const sig = sign(KEY, BODY);
    expect(verifyWebhook({ apiKey: KEY, body: BODY + ' ', signature: sig })).toBe(false);
  });

  it('rejects a wrong API key', () => {
    const sig = sign(KEY, BODY);
    expect(
      verifyWebhook({
        apiKey: 'afk_1111111111111111111111111111111111111111',
        body: BODY,
        signature: sig,
      }),
    ).toBe(false);
  });

  it('rejects malformed signatures', () => {
    expect(verifyWebhook({ apiKey: KEY, body: BODY, signature: 'not-hex' })).toBe(false);
    expect(verifyWebhook({ apiKey: KEY, body: BODY, signature: '' })).toBe(false);
    expect(verifyWebhook({ apiKey: KEY, body: BODY, signature: null })).toBe(false);
  });
});
