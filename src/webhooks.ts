/**
 * Webhook signature verification.
 *
 * Apiframe signs every webhook with HMAC-SHA256, using `sha256(apiKey)`
 * as the signing secret. The signature is sent in the
 * `x-webhook-signature` header as `sha256=<hex>`.
 *
 * This module is intentionally framework-agnostic: it doesn't know
 * about Express / Fastify / Next / Hono. You hand it the raw request
 * body (string or Buffer — NOT a parsed JSON object — body parsers
 * mutate whitespace and break HMAC) and the signature header, and it
 * returns a boolean.
 *
 * Exported as a separate entry point (`@apiframe-ai/sdk/webhooks`) so
 * a thin webhook handler can ship without bundling the full client.
 *
 * @example
 *   import { verifyWebhook } from '@apiframe-ai/sdk/webhooks';
 *
 *   export async function POST(req: Request) {
 *     const raw = await req.text();
 *     const sig = req.headers.get('x-webhook-signature') ?? '';
 *     const ok = verifyWebhook({
 *       apiKey: process.env.APIFRAME_API_KEY!,
 *       body: raw,
 *       signature: sig,
 *     });
 *     if (!ok) return new Response('forbidden', { status: 403 });
 *
 *     const event = JSON.parse(raw) as { jobId: string; type: string; ... };
 *     // ... handle event ...
 *   }
 */

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export interface VerifyWebhookOptions {
  /** The same API key that Apiframe is using to sign your webhooks. */
  apiKey: string;
  /**
   * The raw request body — exactly the bytes the server sent. Do NOT
   * pass a parsed JSON object: re-serialising it almost always changes
   * whitespace, which breaks the HMAC.
   */
  body: string | Buffer | Uint8Array;
  /**
   * The `x-webhook-signature` header value. May be `'sha256=<hex>'`
   * (preferred) or just `'<hex>'`.
   */
  signature: string | null | undefined;
}

/**
 * Returns `true` iff the signature is valid for the given body and key.
 * Constant-time comparison — safe against timing oracle attacks.
 */
export function verifyWebhook(options: VerifyWebhookOptions): boolean {
  const { apiKey, body, signature } = options;
  if (!apiKey || !signature) return false;

  const provided = parseSignature(signature);
  if (!provided) return false;

  const signingSecret = createHash('sha256').update(apiKey).digest();
  const bodyBytes = typeof body === 'string' ? Buffer.from(body, 'utf8') : Buffer.from(body);
  const expected = createHmac('sha256', signingSecret).update(bodyBytes).digest();

  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

function parseSignature(raw: string): Buffer | null {
  const trimmed = raw.trim();
  const hex = trimmed.startsWith('sha256=') ? trimmed.slice('sha256='.length) : trimmed;
  if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) return null;
  try {
    return Buffer.from(hex, 'hex');
  } catch {
    return null;
  }
}
