/**
 * Base class shared by all resources. Holds the HttpClient handle and
 * defines the standard "submit a job and return its `jobId`" helper.
 */
import type { HttpClient } from '../http.js';
import type { JobAccepted } from '../types/public.js';

export interface CallOptions {
  /**
   * Idempotency key for this call. Sent as the `Idempotency-Key` header;
   * replaying the same key within 24h returns the original job rather
   * than creating a duplicate. Strongly recommended for non-idempotent
   * networks (browsers, mobile, cron jobs).
   */
  idempotencyKey?: string | undefined;
  /** Per-call timeout override (ms). */
  timeout?: number | undefined;
  /** Cancel the request via this AbortSignal. */
  signal?: AbortSignal | undefined;
}

export class Resource {
  protected readonly http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Submit a job-creating request and return the `JobAccepted` envelope.
   * Used by every `images.*`, `videos.*`, `music.*` method since they
   * all share the same request/response shape.
   */
  protected async submit<TRequest>(
    path: string,
    body: TRequest,
    options: CallOptions = {},
  ): Promise<JobAccepted> {
    const headers: Record<string, string> = {};
    return this.http.request<JobAccepted>({
      method: 'POST',
      path,
      body: body as Record<string, unknown>,
      headers,
      idempotencyKey: options.idempotencyKey,
      timeout: options.timeout,
      signal: options.signal,
    });
  }
}
