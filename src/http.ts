/**
 * Tiny HTTP transport for the SDK.
 *
 * Responsibilities:
 *   - Build the URL (prefix + path + query)
 *   - Set auth + idempotency + content headers
 *   - JSON-encode bodies (or pass FormData straight through)
 *   - Apply a timeout via `AbortController`
 *   - Retry on 429 + idempotent 5xx with full-jitter exponential backoff
 *   - Map non-2xx responses to typed errors via `fromResponse(...)`
 *
 * Zero runtime dependencies — relies on global `fetch` (Node 18+) and
 * the standard `AbortController`. The `fetch` used can be injected, so
 * tests substitute `undici`'s MockAgent without monkey-patching globals.
 */

import {
  ApiframeError,
  NetworkError,
  TimeoutError,
  fromResponse,
} from './errors.js';

/** Anything we can pass as a JSON-serialisable body. */
export type JsonBody =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

export interface HttpClientOptions {
  /** API key (`afk_...`) sent as the `X-API-Key` header. */
  apiKey: string;
  /** Base URL. Defaults to `https://api.apiframe.ai`. No trailing slash. */
  baseUrl?: string;
  /** Per-request timeout in ms. Defaults to 60_000. */
  timeout?: number;
  /** Max retries for transient failures. Defaults to 2. */
  maxRetries?: number;
  /**
   * Injectable `fetch`. Defaults to the global. Use this in tests to
   * route requests through `undici` MockAgent or similar.
   */
  fetch?: typeof fetch;
  /** User-Agent header value. SDK adds its own; consumers can override. */
  userAgent?: string;
}

export interface RequestOptions {
  /** HTTP method. */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Path under the base URL (e.g. `/v2/jobs/123`). */
  path: string;
  /** Query string params (will be URL-encoded). */
  query?: Record<string, string | number | boolean | undefined> | undefined;
  /** Request body. JSON-encoded unless it's already a `FormData` / string / Buffer. */
  body?: JsonBody | FormData | Uint8Array | undefined;
  /** Extra headers — merged with the SDK defaults. */
  headers?: Record<string, string> | undefined;
  /** Idempotency key — sent as the `Idempotency-Key` header. */
  idempotencyKey?: string | undefined;
  /** Per-call timeout override (ms). */
  timeout?: number | undefined;
  /** Per-call retry override. */
  maxRetries?: number | undefined;
  /** Cancel the request via this signal (composes with the timeout). */
  signal?: AbortSignal | undefined;
}

const DEFAULT_BASE_URL = 'https://api.apiframe.ai';
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_RETRIES = 2;
/** Cap retry backoff so a 429 wave can't stretch a single call indefinitely. */
const MAX_BACKOFF_MS = 8_000;

const SDK_VERSION = '2.0.0-beta.0';

export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly fetchFn: typeof fetch;
  private readonly userAgent: string;

  constructor(options: HttpClientOptions) {
    if (!options.apiKey) {
      throw new TypeError('Apiframe: apiKey is required');
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.fetchFn = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.userAgent = options.userAgent ?? `apiframe-sdk-node/${SDK_VERSION}`;
  }

  /** Make a single request, parsing the JSON response body to `T`. */
  async request<T = unknown>(options: RequestOptions): Promise<T> {
    const url = this.buildUrl(options.path, options.query);
    const headers = this.buildHeaders(options);
    const { body, contentType } = encodeBody(options.body);

    if (contentType && !headers['content-type']) {
      headers['content-type'] = contentType;
    }

    const maxRetries = options.maxRetries ?? this.maxRetries;
    const idempotent =
      options.method === 'GET' || options.idempotencyKey !== undefined;

    let attempt = 0;
    // Loop runs until a request resolves or a non-retryable error is thrown.
    for (;;) {
      try {
        return await this.singleRequest<T>(url, options.method, headers, body, options);
      } catch (err) {
        if (!(err instanceof ApiframeError)) throw err;
        const retryable = isRetryable(err, idempotent);
        if (!retryable || attempt >= maxRetries) throw err;
        const backoffMs = backoffWithJitter(attempt, err);
        attempt++;
        await sleep(backoffMs);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  private buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(path.startsWith('/') ? path : `/${path}`, `${this.baseUrl}/`);
    // (`new URL('/foo', 'https://x.com/')` yields 'https://x.com/foo'.)
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined) continue;
        url.searchParams.set(k, String(v));
      }
    }
    return url.toString();
  }

  private buildHeaders(options: RequestOptions): Record<string, string> {
    const h: Record<string, string> = {
      'x-api-key': this.apiKey,
      accept: 'application/json',
      'user-agent': this.userAgent,
    };
    if (options.idempotencyKey) {
      h['idempotency-key'] = options.idempotencyKey;
    }
    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        h[k.toLowerCase()] = v;
      }
    }
    return h;
  }

  private async singleRequest<T>(
    url: string,
    method: RequestOptions['method'],
    headers: Record<string, string>,
    body: BodyInit | undefined,
    options: RequestOptions,
  ): Promise<T> {
    const timeoutMs = options.timeout ?? this.timeout;
    const controller = new AbortController();
    const onAbort = () => controller.abort(options.signal?.reason);
    if (options.signal) {
      if (options.signal.aborted) controller.abort(options.signal.reason);
      else options.signal.addEventListener('abort', onAbort, { once: true });
    }
    const timer = setTimeout(() => controller.abort(new TimeoutError(`Request timed out after ${timeoutMs}ms`)), timeoutMs);

    // Build the fetch init lazily so we never pass `body: undefined`,
    // which trips `exactOptionalPropertyTypes`-strict TS callers and
    // some non-spec fetch polyfills.
    const init: RequestInit = { method, headers, signal: controller.signal };
    if (body !== undefined) init.body = body;

    let response: Response;
    try {
      response = await this.fetchFn(url, init);
    } catch (err) {
      // Distinguish abort/timeout from generic network failure.
      if (err instanceof TimeoutError) throw err;
      const aborted = (err as Error)?.name === 'AbortError';
      if (aborted) {
        const reason = controller.signal.reason;
        if (reason instanceof TimeoutError) throw reason;
        throw new TimeoutError('Request was aborted', { cause: err });
      }
      throw new NetworkError(
        `Network error: ${(err as Error)?.message ?? String(err)}`,
        { cause: err },
      );
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', onAbort);
    }

    return await parseResponse<T>(response);
  }
}

// ---------------------------------------------------------------------------
// Body encoding
// ---------------------------------------------------------------------------

function encodeBody(body: RequestOptions['body']): {
  body: BodyInit | undefined;
  contentType: string | undefined;
} {
  if (body === undefined || body === null) return { body: undefined, contentType: undefined };
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    // Don't set content-type: fetch builds the multipart boundary itself.
    return { body, contentType: undefined };
  }
  if (body instanceof Uint8Array) {
    // Cast through `BodyInit` — recent TS lib defs split BlobPart by
    // ArrayBufferLike vs ArrayBuffer, and Node's global Uint8Array hits
    // the awkward intersection. The runtime accepts a Uint8Array fine.
    return { body: body as unknown as BodyInit, contentType: 'application/octet-stream' };
  }
  if (typeof body === 'string') {
    return { body, contentType: 'text/plain' };
  }
  // Treat as JSON-serialisable.
  return { body: JSON.stringify(body), contentType: 'application/json' };
}

// ---------------------------------------------------------------------------
// Response parsing + error mapping
// ---------------------------------------------------------------------------

async function parseResponse<T>(response: Response): Promise<T> {
  const requestId = response.headers.get('x-request-id') ?? undefined;
  const status = response.status;

  if (status === 204) return undefined as T;

  const ct = response.headers.get('content-type') ?? '';
  let parsed: unknown;
  if (ct.includes('application/json')) {
    try {
      parsed = await response.json();
    } catch {
      parsed = undefined;
    }
  } else {
    // We never expect non-JSON 2xx bodies from Apiframe today, but in case
    // a future endpoint sends one (e.g. binary download), preserve it.
    try {
      parsed = await response.text();
    } catch {
      parsed = undefined;
    }
  }

  if (response.ok) return parsed as T;

  const retryAfter = response.headers.get('retry-after');
  const retryAfterSeconds = retryAfter ? parseRetryAfter(retryAfter) : undefined;

  throw fromResponse({
    status,
    requestId,
    body: parsed,
    retryAfterSeconds,
  });
}

function parseRetryAfter(value: string): number {
  const asInt = Number.parseInt(value, 10);
  if (Number.isFinite(asInt) && asInt >= 0) return asInt;
  // RFC 7231 also allows HTTP-date.
  const t = Date.parse(value);
  if (!Number.isNaN(t)) {
    return Math.max(0, Math.ceil((t - Date.now()) / 1000));
  }
  return 1;
}

// ---------------------------------------------------------------------------
// Retry policy
// ---------------------------------------------------------------------------

function isRetryable(err: ApiframeError, idempotent: boolean): boolean {
  if (err instanceof TimeoutError) return idempotent;
  if (err instanceof NetworkError) return idempotent;
  if (err.status === 429) return true; // always safe to retry — server tells us to
  if (err.status >= 500 && err.status < 600 && err.status !== 501) {
    return idempotent;
  }
  return false;
}

function backoffWithJitter(attempt: number, err: ApiframeError): number {
  // 429 with Retry-After: respect the server hint exactly (full second).
  if (err.status === 429) {
    const retryAfter = (err as { retryAfterSeconds?: number }).retryAfterSeconds;
    if (typeof retryAfter === 'number') return Math.max(0, retryAfter * 1000);
  }
  // Otherwise: full-jitter exponential backoff, base 250ms, cap MAX_BACKOFF_MS.
  const exp = Math.min(MAX_BACKOFF_MS, 250 * 2 ** attempt);
  return Math.floor(Math.random() * exp);
}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
