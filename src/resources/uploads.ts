/**
 * `client.uploads.create(...)` — single-file CDN upload.
 *
 * Accepts almost any file source you'll have in Node:
 *   - `string` — interpreted as a filesystem path
 *   - `Buffer` / `Uint8Array` — bytes
 *   - `Blob` / `File` — Web standard (Node 20+)
 *   - `{ stream, filename, contentType }` — for streaming uploads
 *
 * Files spend ~1-2h on the CDN before reaping; the returned URL drops
 * straight into any image/video/audio input field on the generation
 * endpoints.
 */
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

import { Resource, type CallOptions } from './base.js';
import type { Upload } from '../types/public.js';

/**
 * Anything we accept as the `file` argument. The first three forms are
 * the typical Node use cases (path, in-memory bytes, web Blob); the
 * `{ stream }` form is escape-hatch for very large files that you'd
 * rather not buffer.
 */
export type UploadInput =
  | string
  | Uint8Array
  | Buffer
  | Blob
  | { stream: ReadableStream<Uint8Array>; filename: string; contentType?: string }
  | { path: string; filename?: string; contentType?: string };

export class Uploads extends Resource {
  /**
   * Upload a file to short-lived CDN storage and return its metadata.
   *
   * @example
   * // From a local file path
   * const { url } = await client.uploads.create({ file: './cat.png' });
   *
   * // From an in-memory Buffer
   * const buf = await readFile('./cat.png');
   * const { url } = await client.uploads.create({ file: buf, filename: 'cat.png' });
   */
  async create(
    args: { file: UploadInput; filename?: string; contentType?: string },
    options: CallOptions = {},
  ): Promise<Upload> {
    const { blob, filename } = await coerceToBlob(args.file, args.filename, args.contentType);

    const form = new FormData();
    form.append('file', blob, filename);

    return this.http.request<Upload>({
      method: 'POST',
      path: '/v2/uploads',
      body: form,
      idempotencyKey: options.idempotencyKey,
      timeout: options.timeout,
      signal: options.signal,
    });
  }
}

// ---------------------------------------------------------------------------
// File coercion
// ---------------------------------------------------------------------------

async function coerceToBlob(
  input: UploadInput,
  filename: string | undefined,
  contentType: string | undefined,
): Promise<{ blob: Blob; filename: string }> {
  // String → filesystem path
  if (typeof input === 'string') {
    const data = await readFile(input);
    return {
      blob: new Blob([data as unknown as BlobPart], contentType ? { type: contentType } : {}),
      filename: filename ?? basename(input),
    };
  }
  // Blob / File (must come before generic object check)
  if (typeof Blob !== 'undefined' && input instanceof Blob) {
    return {
      blob: contentType ? new Blob([input], { type: contentType }) : input,
      filename: filename ?? (input as File).name ?? 'upload',
    };
  }
  // Buffer / Uint8Array
  if (input instanceof Uint8Array) {
    return {
      blob: new Blob([input as unknown as BlobPart], contentType ? { type: contentType } : {}),
      filename: filename ?? 'upload',
    };
  }
  if (isPathInput(input)) {
    const data = await readFile(input.path);
    const ct = contentType ?? input.contentType;
    return {
      blob: new Blob([data as unknown as BlobPart], ct ? { type: ct } : {}),
      filename: filename ?? input.filename ?? basename(input.path),
    };
  }
  if (isStreamInput(input)) {
    const data = await readStream(input.stream);
    const ct = contentType ?? input.contentType;
    return {
      blob: new Blob([data as unknown as BlobPart], ct ? { type: ct } : {}),
      filename: filename ?? input.filename,
    };
  }

  throw new TypeError(
    'Unsupported `file` argument. Expected a path string, Buffer/Uint8Array, Blob/File, ' +
      'or { stream, filename } / { path } object.',
  );
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
