# Changelog

All notable changes to the 2.x line of `@apiframe-ai/sdk` (the SDK
that targets the **Apiframe v2 API**) are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> Apiframe v1 has its own SDK (`@apiframe-ai/sdk@1`). Its changelog
> lives on the
> [`legacy/v1`](https://github.com/apiframe-ai/apiframe-nodejs-sdk/tree/legacy/v1)
> branch.

---

## [Unreleased]

## [2.0.0-beta.1] — 2026-05-02

### Fixed

- `openapi.json` now points at the canonical docs URL
  (`https://apiframe.ai/docs`) instead of the placeholder
  `docs.apiframe.ai`. README updated to match. No code/runtime changes —
  if you've already pinned `2.0.0-beta.0`, upgrading is optional.

## [2.0.0-beta.0] — 2026-05-01

First public preview of the SDK for the Apiframe v2 API. The Apiframe
v2 API is a separate product from Apiframe v1; this is its dedicated
SDK and shares an npm name (`@apiframe-ai/sdk`) with the v1 SDK only
out of convenience. If you're moving an application from Apiframe v1
to Apiframe v2, [`MIGRATION.md`](./MIGRATION.md) maps v1 calls to
their v2 equivalents.

### Added

- `Apiframe` client with constructor options for `apiKey`, `baseUrl`,
  `timeout`, `maxRetries`, `fetch`, and `userAgent`.
- Full coverage of every public API-key endpoint on the Apiframe v2 API:
  - `images.generate`, `images.upscale`, `images.edit`, `images.removeBackground`
  - `videos.generate`, `videos.upscale`, `videos.edit`
  - `music.generate`
  - `jobs.get`, `jobs.list`, `jobs.waitFor` (polling with exponential
    backoff, progress callback, abort signal, timeout budget)
  - `uploads.create` (single-file multipart; accepts path, `Buffer`,
    `Uint8Array`, `Blob`/`File`, or `{ stream, filename, contentType }`)
  - `loras.create`, `loras.list`, `loras.get`, `loras.delete`
    (multipart training with 15-30 reference images)
  - `me`, `models.list`
  - `assets.create`, `assets.get`
- `verifyWebhook` helper at `@apiframe-ai/sdk/webhooks` — pure
  function, framework-agnostic, constant-time HMAC comparison.
- Typed error hierarchy (`ApiframeError` and subclasses for 400, 401,
  402, 403, 404, 429, 5xx, plus `TimeoutError` and `NetworkError`).
- Automatic retry with full-jitter exponential backoff on `429` and
  idempotent `5xx`. `Idempotency-Key` is forwarded as a header so any
  call can opt in to retry safety.
- Discriminated-union request types so `model: 'midjourney'` only
  accepts `midjourneyParams`, etc. — every shape is generated from the
  Apiframe v2 backend's Zod schemas via OpenAPI.
- Dual ESM + CJS bundles with type declarations; no runtime
  dependencies. Requires Node.js >= 18.

### Known gaps

- The Midjourney "child operations" (`reroll`, `variations`, `pan`,
  `outpaint`, `inpaint`, `describe`, `blend`, `shorten`, `seed`,
  `upscale1x` / `upscaleAlt`, `faceSwap`) are exposed by Apiframe v1
  but are not part of Apiframe v2 yet. They are on the v2 roadmap and
  will land in a follow-up release of this SDK without breaking
  changes — see
  [`MIGRATION.md`](./MIGRATION.md#apiframe-v1-features-not-yet-in-v2).
- Browser bundles are not shipped in 2.0; the SDK is server-side
  only. (If you need browser support, please open an issue.)
