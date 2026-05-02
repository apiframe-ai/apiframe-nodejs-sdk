/**
 * Error hierarchy for the Apiframe SDK.
 *
 * Every non-2xx response from the API is mapped to a typed subclass of
 * `ApiframeError`, so consumer code can branch with `instanceof` rather
 * than poking at `.status`:
 *
 *   try {
 *     await client.images.generate({ ... });
 *   } catch (err) {
 *     if (err instanceof InsufficientCreditsError) {
 *       redirectToBilling(err.creditsRequired - err.creditsAvailable);
 *     } else if (err instanceof RateLimitError) {
 *       await sleep(err.retryAfterSeconds * 1000);
 *     } else if (err instanceof ApiframeError) {
 *       reportToSentry(err);
 *     }
 *   }
 *
 * `ApiframeError` is exported and is a real Error subclass, so `throw`
 * /`catch` / `instanceof Error` all work as expected.
 */

/**
 * Base class for every error originating from the Apiframe API or SDK.
 *
 * Carries the HTTP status, the request id (for correlation against
 * server logs), and the raw response body for last-resort debugging.
 */
export class ApiframeError extends Error {
  /** HTTP status code, or `0` for network / abort errors before a response landed. */
  readonly status: number;
  /** Request id from the `x-request-id` response header, when present. */
  readonly requestId: string | undefined;
  /** Parsed JSON response body, when one was sent. */
  readonly body: unknown;

  constructor(
    message: string,
    options: {
      status: number;
      requestId?: string | undefined;
      body?: unknown;
      cause?: unknown;
    },
  ) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'ApiframeError';
    this.status = options.status;
    this.requestId = options.requestId;
    this.body = options.body;
  }
}

/** 401 — missing or invalid API key. */
export class AuthenticationError extends ApiframeError {
  constructor(message: string, init: { requestId?: string | undefined; body?: unknown }) {
    super(message, { status: 401, ...init });
    this.name = 'AuthenticationError';
  }
}

/** 403 — authenticated but the key is inactive / lacks permission. */
export class PermissionError extends ApiframeError {
  constructor(message: string, init: { requestId?: string | undefined; body?: unknown }) {
    super(message, { status: 403, ...init });
    this.name = 'PermissionError';
  }
}

/** 400 — request body failed Zod validation, or some other input error. */
export class ValidationError extends ApiframeError {
  /** Per-field issues, when the server emitted them (`{ fieldPath: ["msg1", ...] }`). */
  readonly details: Record<string, string[]> | undefined;

  constructor(
    message: string,
    init: {
      requestId?: string | undefined;
      body?: unknown;
      details?: Record<string, string[]> | undefined;
    },
  ) {
    super(message, { status: 400, requestId: init.requestId, body: init.body });
    this.name = 'ValidationError';
    this.details = init.details;
  }
}

/** 402 — team has insufficient credits to run this model. */
export class InsufficientCreditsError extends ApiframeError {
  /** Credits required for this job (in the API's smallest unit). */
  readonly creditsRequired: number;
  /** Credits available on the team at the time of submission. */
  readonly creditsAvailable: number;

  constructor(
    message: string,
    init: {
      requestId?: string | undefined;
      body?: unknown;
      creditsRequired: number;
      creditsAvailable: number;
    },
  ) {
    super(message, { status: 402, requestId: init.requestId, body: init.body });
    this.name = 'InsufficientCreditsError';
    this.creditsRequired = init.creditsRequired;
    this.creditsAvailable = init.creditsAvailable;
  }
}

/** 404 — resource (job / lora / asset) not found. */
export class NotFoundError extends ApiframeError {
  constructor(message: string, init: { requestId?: string | undefined; body?: unknown }) {
    super(message, { status: 404, ...init });
    this.name = 'NotFoundError';
  }
}

/** 409 — replayed an idempotency key with a different request body. */
export class ConflictError extends ApiframeError {
  constructor(message: string, init: { requestId?: string | undefined; body?: unknown }) {
    super(message, { status: 409, ...init });
    this.name = 'ConflictError';
  }
}

/** 429 — rate limit hit. */
export class RateLimitError extends ApiframeError {
  /** Seconds to wait before retrying, parsed from the `Retry-After` header. */
  readonly retryAfterSeconds: number;

  constructor(
    message: string,
    init: { requestId?: string | undefined; body?: unknown; retryAfterSeconds: number },
  ) {
    super(message, { status: 429, requestId: init.requestId, body: init.body });
    this.name = 'RateLimitError';
    this.retryAfterSeconds = init.retryAfterSeconds;
  }
}

/** 5xx — the service had a problem. Often retryable for idempotent requests. */
export class ServerError extends ApiframeError {
  constructor(
    message: string,
    init: { status: number; requestId?: string | undefined; body?: unknown },
  ) {
    super(message, init);
    this.name = 'ServerError';
  }
}

/** Request did not complete within `timeout` (or before `signal` aborted). */
export class TimeoutError extends ApiframeError {
  constructor(message: string, init: { cause?: unknown } = {}) {
    super(message, { status: 0, cause: init.cause });
    this.name = 'TimeoutError';
  }
}

/** Network-level failure (DNS, TCP reset, TLS, etc.) — no response was received. */
export class NetworkError extends ApiframeError {
  constructor(message: string, init: { cause?: unknown } = {}) {
    super(message, { status: 0, cause: init.cause });
    this.name = 'NetworkError';
  }
}

// ---------------------------------------------------------------------------
// Internal: status-code → error-class mapping
// ---------------------------------------------------------------------------

interface ErrorContext {
  status: number;
  requestId: string | undefined;
  body: unknown;
  retryAfterSeconds: number | undefined;
}

/**
 * Build the right typed error for a non-2xx response. Internal — exported
 * so the http module and tests can reuse the same logic.
 */
export function fromResponse(ctx: ErrorContext): ApiframeError {
  const { status, requestId, body } = ctx;
  const message = extractMessage(body) ?? `Apiframe API error (HTTP ${status})`;

  switch (status) {
    case 400:
      return new ValidationError(message, {
        requestId,
        body,
        details: extractDetails(body),
      });
    case 401:
      return new AuthenticationError(message, { requestId, body });
    case 402: {
      const credits = extractCredits(body);
      return new InsufficientCreditsError(message, {
        requestId,
        body,
        creditsRequired: credits.required,
        creditsAvailable: credits.available,
      });
    }
    case 403:
      return new PermissionError(message, { requestId, body });
    case 404:
      return new NotFoundError(message, { requestId, body });
    case 409:
      return new ConflictError(message, { requestId, body });
    case 429:
      return new RateLimitError(message, {
        requestId,
        body,
        retryAfterSeconds: ctx.retryAfterSeconds ?? 1,
      });
    default:
      if (status >= 500) {
        return new ServerError(message, { status, requestId, body });
      }
      return new ApiframeError(message, { status, requestId, body });
  }
}

function extractMessage(body: unknown): string | undefined {
  if (body && typeof body === 'object' && 'error' in body) {
    const e = (body as { error: unknown }).error;
    if (typeof e === 'string') return e;
  }
  return undefined;
}

function extractDetails(body: unknown): Record<string, string[]> | undefined {
  if (body && typeof body === 'object' && 'details' in body) {
    const d = (body as { details: unknown }).details;
    if (d && typeof d === 'object') {
      return d as Record<string, string[]>;
    }
  }
  return undefined;
}

function extractCredits(body: unknown): { required: number; available: number } {
  if (body && typeof body === 'object') {
    const obj = body as { creditsRequired?: unknown; creditsAvailable?: unknown };
    return {
      required: typeof obj.creditsRequired === 'number' ? obj.creditsRequired : 0,
      available: typeof obj.creditsAvailable === 'number' ? obj.creditsAvailable : 0,
    };
  }
  return { required: 0, available: 0 };
}
