/**
 * `client.loras.*` — train and manage Flux LoRAs on Apiframe v2.
 *
 * `create()` is a multipart POST with 15-30 training images plus
 * metadata fields. Pricing is 2 credits up-front, refunded if the
 * training fails. The returned `id` becomes the `loraId` you pass to
 * `flux-lora` inference via `client.images.generate`.
 */
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

import { Resource, type CallOptions } from './base.js';
import type { Lora, LoraCreated, LoraList, LorasListQuery } from '../types/public.js';

/**
 * One training image. Same shape as `UploadInput` but narrowed: each
 * image must declare its filename so the server can pick a sensible
 * extension (it sniffs magic bytes for safety, but the filename helps
 * surface useful error messages on rejection).
 */
export type LoraImageInput =
  | string
  | Uint8Array
  | Buffer
  | Blob
  | { stream: ReadableStream<Uint8Array>; filename: string; contentType?: string }
  | { path: string; filename?: string; contentType?: string };

export interface LoraCreateInput {
  /** Display name. 1-60 chars. */
  name: string;
  /** Subject taxonomy. Defaults to `'person'` server-side. */
  subjectKind?: 'person' | 'style' | 'object';
  /** Required when `subjectKind === 'person'`. */
  gender?: 'female' | 'male' | 'non-binary';
  /** Required when `subjectKind === 'person'`. Free text (e.g. "South Asian"). */
  ethnicity?: string;
  /** Optional age descriptor. Free text (e.g. "30s", "child"). */
  age?: string;
  /** Number of training steps (500-3000). Defaults to 1000 server-side. */
  steps?: number;
  /** LoRA rank (8-64). Defaults to 32 server-side. */
  loraRank?: number;
  /** Optional webhook URL for training status updates. */
  webhookUrl?: string;
  /** Webhook event filter — defaults to `['completed', 'failed']`. */
  webhookEvents?: ('completed' | 'failed')[];
  /** 15-30 training images. */
  images: LoraImageInput[];
}

export class Loras extends Resource {
  /**
   * Create and queue a LoRA training job.
   *
   * Deducts 2 credits up-front (refunded if subsequent steps fail).
   * Throws `RateLimitError(429)` if the per-team in-flight training
   * cap is reached, `InsufficientCreditsError(402)` on credit balance,
   * `ValidationError(400)` on bad metadata or unsupported image types.
   *
   * @example
   * const lora = await client.loras.create({
   *   name: 'My cat',
   *   subjectKind: 'object',
   *   images: ['./photos/cat-1.jpg', './photos/cat-2.jpg', ... ],
   * });
   * // Then poll status:
   * for (;;) {
   *   const fresh = await client.loras.get(lora.id);
   *   if (fresh.status === 'READY') break;
   *   if (fresh.status === 'FAILED') throw new Error(fresh.error ?? 'Training failed');
   *   await new Promise((r) => setTimeout(r, 30_000));
   * }
   */
  async create(input: LoraCreateInput, options: CallOptions = {}): Promise<LoraCreated> {
    if (!input.images?.length) {
      throw new TypeError('loras.create: `images` is required (15-30 images expected).');
    }

    const form = new FormData();
    form.append('name', input.name);
    if (input.subjectKind) form.append('subjectKind', input.subjectKind);
    if (input.gender) form.append('gender', input.gender);
    if (input.ethnicity) form.append('ethnicity', input.ethnicity);
    if (input.age) form.append('age', input.age);
    if (input.steps !== undefined) form.append('steps', String(input.steps));
    if (input.loraRank !== undefined) form.append('loraRank', String(input.loraRank));
    if (input.webhookUrl) form.append('webhookUrl', input.webhookUrl);
    if (input.webhookEvents?.length) {
      form.append('webhookEvents', input.webhookEvents.join(','));
    }

    for (const img of input.images) {
      const { blob, filename } = await coerceImage(img);
      form.append('images', blob, filename);
    }

    return this.http.request<LoraCreated>({
      method: 'POST',
      path: '/v2/loras',
      body: form,
      idempotencyKey: options.idempotencyKey,
      timeout: options.timeout,
      signal: options.signal,
    });
  }

  /** Paginated list of LoRAs scoped to the caller's team. */
  async list(query: LorasListQuery = {}): Promise<LoraList> {
    return this.http.request<LoraList>({
      method: 'GET',
      path: '/v2/loras',
      query: query as Record<string, string | number | boolean | undefined>,
    });
  }

  /** Fetch a single LoRA by id. */
  async get(id: string): Promise<Lora> {
    return this.http.request<Lora>({
      method: 'GET',
      path: `/v2/loras/${encodeURIComponent(id)}`,
    });
  }

  /**
   * Soft-delete a LoRA (status flipped to `ARCHIVED`). Idempotent —
   * deleting an already-archived LoRA also returns 204.
   */
  async delete(id: string): Promise<void> {
    await this.http.request<void>({
      method: 'DELETE',
      path: `/v2/loras/${encodeURIComponent(id)}`,
    });
  }
}

// ---------------------------------------------------------------------------
// Image coercion (essentially the same logic as uploads.ts, but always
// requires a filename — the API uses it for content sniffing fallback).
// ---------------------------------------------------------------------------

async function coerceImage(input: LoraImageInput): Promise<{ blob: Blob; filename: string }> {
  if (typeof input === 'string') {
    const data = await readFile(input);
    return { blob: new Blob([data as unknown as BlobPart]), filename: basename(input) };
  }
  if (typeof Blob !== 'undefined' && input instanceof Blob) {
    return { blob: input, filename: (input as File).name ?? 'image' };
  }
  if (input instanceof Uint8Array) {
    return { blob: new Blob([input as unknown as BlobPart]), filename: 'image' };
  }
  if (isPathInput(input)) {
    const data = await readFile(input.path);
    const ct = input.contentType;
    return {
      blob: new Blob([data as unknown as BlobPart], ct ? { type: ct } : {}),
      filename: input.filename ?? basename(input.path),
    };
  }
  if (isStreamInput(input)) {
    const data = await readStream(input.stream);
    const ct = input.contentType;
    return {
      blob: new Blob([data as unknown as BlobPart], ct ? { type: ct } : {}),
      filename: input.filename,
    };
  }
  throw new TypeError('loras.create: unsupported image input.');
}

function isPathInput(v: unknown): v is { path: string; filename?: string; contentType?: string } {
  return (
    typeof v === 'object' && v !== null && 'path' in v && typeof (v as { path: unknown }).path === 'string'
  );
}

function isStreamInput(v: unknown): v is {
  stream: ReadableStream<Uint8Array>;
  filename: string;
  contentType?: string;
} {
  return (
    typeof v === 'object' &&
    v !== null &&
    'stream' in v &&
    'filename' in v &&
    typeof (v as { filename: unknown }).filename === 'string'
  );
}

async function readStream(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}
