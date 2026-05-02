/**
 * Public entry point for `@apiframe-ai/sdk`.
 *
 * Everything exported here is part of the SemVer-stable public API.
 * Anything not re-exported is internal and may change between minor
 * versions without notice.
 */

export { Apiframe, type ApiframeOptions } from './client.js';
export { HttpClient, type HttpClientOptions, type RequestOptions, type JsonBody } from './http.js';

// Errors — every API failure surfaces as an instance of one of these.
export {
  ApiframeError,
  AuthenticationError,
  PermissionError,
  ValidationError,
  InsufficientCreditsError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  TimeoutError,
  NetworkError,
} from './errors.js';

// Resource classes — exposed so consumers can extend / mock individually.
export { Images } from './resources/images.js';
export { Videos } from './resources/videos.js';
export { Music } from './resources/music.js';
export { Jobs, type WaitForOptions } from './resources/jobs.js';
export { Uploads, type UploadInput } from './resources/uploads.js';
export { Loras, type LoraImageInput, type LoraCreateInput } from './resources/loras.js';
export { Models } from './resources/models.js';
export { Assets } from './resources/assets.js';
export { Me } from './resources/me.js';

// Type aliases — request / response shapes derived from the OpenAPI spec.
export * from './types/public.js';

// Webhooks helper is also re-exported here so a consumer that's already
// pulled in the full client can use it without a second import.
export { verifyWebhook, type VerifyWebhookOptions } from './webhooks.js';
