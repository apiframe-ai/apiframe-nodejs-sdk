# `@apiframe-ai/sdk`

[![npm](https://img.shields.io/npm/v/@apiframe-ai/sdk/next.svg?label=npm%20%40next)](https://www.npmjs.com/package/@apiframe-ai/sdk)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

Official Node.js SDK for the [Apiframe v2 API](https://apiframe.ai/docs) — one
typed client for every image, video and music model on the platform
(Midjourney, Flux, Kling, Veo, Sora, Suno, Topaz, and more).

> **Apiframe v1 vs v2 — different products, separate SDKs.**
> Apiframe v1 and Apiframe v2 are two distinct APIs with different
> endpoints, auth, and feature sets. Each has its own SDK pinned under
> the same npm name:
>
> - **Apiframe v1** → `npm i @apiframe-ai/sdk@latest` (1.x; source on
>   the [`legacy/v1`](https://github.com/apiframe-ai/apiframe-nodejs-sdk/tree/legacy/v1) branch).
> - **Apiframe v2** → `npm i @apiframe-ai/sdk@next` (2.x; this repo's
>   `main` branch).
>
> If your application currently runs against Apiframe v1 and you'd
> like to move to Apiframe v2, [`MIGRATION.md`](./MIGRATION.md) maps
> v1 endpoints to their v2 equivalents.

---

## Table of contents

- [Install](#install)
- [Quickstart](#quickstart)
- [Authentication](#authentication)
- [Resources](#resources)
  - [`images`](#images)
  - [`videos`](#videos)
  - [`music`](#music)
  - [`jobs` (incl. `waitFor`)](#jobs)
  - [`uploads`](#uploads)
  - [`loras`](#loras)
  - [`models`](#models)
  - [`me`](#me)
  - [`assets`](#assets)
- [Webhooks](#webhooks)
- [Idempotency](#idempotency)
- [Errors](#errors)
- [Retries & timeouts](#retries--timeouts)
- [TypeScript](#typescript)
- [Bring-your-own `fetch`](#bring-your-own-fetch)
- [Examples](#examples)
- [Versioning & support](#versioning--support)

---

## Install

```bash
npm i @apiframe-ai/sdk@next
```

Requires Node.js **>= 18** (uses native `fetch`, `FormData`, `crypto`).
The SDK ships dual ESM + CJS builds and TypeScript declarations; no
runtime dependencies.

## Quickstart

```ts
import { Apiframe } from '@apiframe-ai/sdk';

const client = new Apiframe({ apiKey: process.env.APIFRAME_API_KEY! });

// Submit a job (returns `{ jobId, status: 'QUEUED' }` immediately)
const { jobId } = await client.images.generate({
  model: 'midjourney',
  prompt: 'a cinematic photo of a fox in autumn forest, golden hour',
  midjourneyParams: { aspect_ratio: '16:9' },
});

// Wait for the result (polls under the hood)
const job = await client.jobs.waitFor(jobId, {
  onProgress: (j) => console.log(j.status, j.progress),
});

console.log(job.result);
```

## Authentication

Every request is authenticated with your API key in the `X-API-Key`
header. Generate one at
[apiframe.ai/dashboard](https://apiframe.ai/dashboard) and pass it to
the constructor:

```ts
const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY!,
  // Optional overrides:
  baseUrl: 'https://api.apiframe.ai', // default
  timeout: 60_000,                    // ms, default 60s
  maxRetries: 2,                      // 429 + idempotent 5xx
});
```

Never embed an API key in client-side code; the SDK is **server-side
only**.

---

## Resources

All job-creating endpoints return a `JobAccepted` (`{ jobId, status:
'QUEUED' }`) immediately — work happens asynchronously. You either
**poll** with [`client.jobs.waitFor(...)`](#jobs) or receive a
[**webhook**](#webhooks) when the job finishes.

### images

```ts
// Generate
await client.images.generate({
  model: 'flux-1.1-pro',
  prompt: 'an oil painting of a cat astronaut',
  fluxParams: { aspect_ratio: '16:9', output_format: 'jpg' },
});

// Upscale
await client.images.upscale({
  model: 'topaz-image-upscale',
  topazUpscaleParams: { image: 'https://example.com/cat.jpg', upscale_factor: 2 },
});

// Edit (inpaint / outpaint / instruction edit, depending on the model)
await client.images.edit({
  model: 'flux-fill-pro',
  fluxFillParams: {
    image: 'https://example.com/photo.jpg',
    mask: 'https://example.com/mask.png',
    prompt: 'replace the sky with northern lights',
    mode: 'inpaint',
  },
});

// Background removal
await client.images.removeBackground({
  model: 'bria-bg-remove',
  briaBgRemoveParams: { image: 'https://example.com/portrait.jpg' },
});
```

The `model` literal narrows the rest of the body — TypeScript will only
let you pass the params block that matches your chosen model
(`midjourneyParams` for `midjourney`, `fluxParams` for `flux-*`, etc.).

### videos

```ts
await client.videos.generate({
  model: 'kling-2.5-turbo-pro',
  prompt: 'cinematic drone shot over snowy mountains',
  klingParams: { duration: 5, aspect_ratio: '169' },
});

await client.videos.upscale({
  model: 'topaz-video-upscale',
  topazVideoParams: {
    video: 'https://cdn.example.com/clip.mp4',
    target_resolution: '1080p',
    target_fps: 30,
  },
});

await client.videos.edit({
  model: 'wan-2.7-videoedit',
  prompt: 'change the colour grading to warm sunset',
  wan27VideoeditParams: { video: 'https://cdn.example.com/clip.mp4' },
});
```

### music

```ts
await client.music.generate({
  model: 'suno',
  prompt: 'lo-fi hip-hop, mellow, rainy afternoon',
  sunoParams: {
    custom_mode: false,
    instrumental: true,
    model_version: 'V5',
  },
});
```

### jobs

```ts
// Look up a single job
const job = await client.jobs.get(jobId);

// List jobs (paginated; cursor + hasMore returned)
const page = await client.jobs.list({ status: 'COMPLETED', limit: 50 });

// Wait until the job resolves (polling under the hood)
const finished = await client.jobs.waitFor(jobId, {
  intervalMs: 3_000,        // initial poll interval
  maxIntervalMs: 15_000,    // backoff cap
  timeoutMs: 10 * 60_000,   // overall budget
  onProgress: (j) => log(j.status, j.progress),
  signal: ctrl.signal,      // optional AbortSignal
});
```

`waitFor` resolves when the job reaches a terminal state. If the job
**fails**, it throws an `ApiframeError` with the upstream message; if
the polling budget elapses, it throws a `TimeoutError`.

### uploads

```ts
import { readFile } from 'node:fs/promises';

// From a path
const a = await client.uploads.create({ file: './cat.png' });

// From an in-memory Buffer
const buf = await readFile('./cat.png');
const b = await client.uploads.create({
  file: buf,
  filename: 'cat.png',
  contentType: 'image/png',
});

// Pass the returned URL straight into a generation request
await client.images.edit({
  model: 'flux-fill-pro',
  fluxFillParams: { image: a.url, mask: b.url, prompt: 'change colors', mode: 'inpaint' },
});
```

The `file` argument accepts a path string, `Buffer`, `Uint8Array`,
`Blob`/`File`, or a `{ stream, filename, contentType }` object. Files
live ~1-2 hours on the CDN before being reaped.

### loras

Train your own Flux LoRA from 15-30 reference images:

```ts
const created = await client.loras.create({
  name: 'my-style',
  subjectKind: 'person',
  gender: 'female',
  ethnicity: 'asian',
  images: [
    './photos/01.jpg',
    './photos/02.jpg',
    // ... 15-30 images total
  ],
});

// Wait until the training job completes
const job = await client.jobs.waitFor(created.jobId);

// Then list / fetch / delete your LoRAs
const page = await client.loras.list({ limit: 50 });
const lora = await client.loras.get(created.id);
await client.loras.delete(created.id);
```

### models

```ts
const all = await client.models.list();
const imageOnly = await client.models.list({ modality: 'image' });
```

### me

```ts
const { user, team, apiKey } = await client.me();
console.log(`hi ${user.email}`);
```

### assets

Some video providers (Kie/Seedance) require pre-registering uploaded
assets:

```ts
const { assetId } = await client.assets.create({
  url: 'https://cdn.example.com/foo.mp4',
  type: 'video',
});
const asset = await client.assets.get(assetId);
```

---

## Webhooks

Pass `webhookUrl` (and optionally `webhookEvents`) on any submission
to receive `progress`, `completed`, and `failed` events. Verify
incoming requests with the SDK's framework-agnostic helper:

```ts
import express from 'express';
import { verifyWebhook } from '@apiframe-ai/sdk/webhooks';

const app = express();

app.post(
  '/apiframe/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const ok = verifyWebhook({
      apiKey: process.env.APIFRAME_API_KEY!,
      body: req.body, // raw Buffer
      signature: req.header('x-webhook-signature'),
    });
    if (!ok) return res.status(401).end();

    const event = JSON.parse(req.body.toString('utf8'));
    // ... handle event
    res.status(204).end();
  },
);
```

`verifyWebhook` derives the signing secret as `sha256(apiKey)`, then
compares `'sha256=' + hmacSha256(secret, body)` against the
`X-Webhook-Signature` header in constant time.

## Idempotency

Pass `idempotencyKey` on any mutating call to dedupe retries:

```ts
await client.images.generate(
  { model: 'midjourney', prompt: '...' },
  { idempotencyKey: crypto.randomUUID() },
);
```

The SDK forwards the value as the `Idempotency-Key` header. The same
key may be reused across retries to guarantee a single submission.

## Errors

Every non-2xx response becomes a typed `Error` subclass:

| Class | HTTP | When |
|---|---|---|
| `ApiframeError` | base class | parent of every error below |
| `ValidationError` | 400 | request body failed Zod validation; `error.body` has the field-level details |
| `AuthenticationError` | 401 | missing/invalid `X-API-Key` |
| `PermissionError` | 403 | API key lacks scope, or modality disabled for the team |
| `InsufficientCreditsError` | 402 | not enough credits to start the job |
| `NotFoundError` | 404 | resource (job, lora, asset) doesn't exist |
| `RateLimitError` | 429 | exposes `retryAfterSeconds`; SDK retries automatically |
| `ServerError` | 5xx | upstream provider down |
| `TimeoutError` | — | request or `waitFor` budget elapsed |
| `NetworkError` | — | DNS/TCP/TLS failure before any HTTP response |

```ts
import { ValidationError, RateLimitError } from '@apiframe-ai/sdk';

try {
  await client.images.generate({ /* ... */ });
} catch (err) {
  if (err instanceof ValidationError) console.error('bad input:', err.body);
  else if (err instanceof RateLimitError) console.warn('throttled, retry in', err.retryAfterSeconds);
  else throw err;
}
```

## Retries & timeouts

By default the SDK retries:

- `429` responses (using `Retry-After` if present, otherwise exponential backoff with full jitter), and
- idempotent `5xx` responses (`GET`, or any method with `idempotencyKey`).

Both are bounded by `maxRetries` (default `2`) and a hard backoff cap of
8 seconds. Per-request timeout (`timeout`) is enforced via
`AbortController`. Both are configurable globally on the constructor or
overridable per call:

```ts
await client.jobs.get(id, { timeout: 5_000 });
```

## TypeScript

All input and output types are derived from
[`apiframe-v2`'s OpenAPI document](https://api.apiframe.ai/v2/openapi.json) — there is
exactly **one** source of truth for the wire shape, generated from the
backend's Zod schemas.

```ts
import type {
  ImagesGenerateInput,
  Job,
  JobAccepted,
  ImageGenerationModel,
} from '@apiframe-ai/sdk';
```

Discriminated unions narrow on the `model` literal, so the editor
shows you only the params that apply:

```ts
const req: ImagesGenerateInput = {
  model: 'midjourney',  // narrows to the Midjourney variant
  prompt: '...',
  midjourneyParams: { aspect_ratio: '16:9' },
  // fluxParams: {} // ⛔ TS error — not allowed when model is 'midjourney'
};
```

## Bring-your-own `fetch`

The SDK uses the global `fetch` by default. You can swap it for any
other implementation (e.g. for Cloudflare Workers, a custom proxy, or
test mocking):

```ts
import { fetch as undiciFetch } from 'undici';

new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY!,
  fetch: undiciFetch as unknown as typeof fetch,
});
```

## Examples

A runnable example per resource lives under
[`examples/`](https://github.com/apiframe-ai/apiframe-nodejs-sdk/tree/main/examples).

## Versioning & support

- Semantic versioning under `2.x`.
- Beta releases publish under the `next` dist-tag; once stable they
  move to `latest`.
- Bugs and feature requests:
  [github.com/apiframe-ai/apiframe-nodejs-sdk/issues](https://github.com/apiframe-ai/apiframe-nodejs-sdk/issues).
- Full reference: [apiframe.ai/docs](https://apiframe.ai/docs).
