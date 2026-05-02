# Moving from Apiframe v1 to Apiframe v2

> **Apiframe v1 and Apiframe v2 are two different APIs**, each with its
> own SDK. This is **not** a rewrite of the v1 SDK — `@apiframe-ai/sdk`
> v1 wraps the v1 API and `@apiframe-ai/sdk` v2 wraps the v2 API. Both
> remain available on npm under the same package name; you choose
> which one to install based on which Apiframe API you target:
>
> - **Apiframe v1** → `npm i @apiframe-ai/sdk@latest` (1.x). Source on
>   the [`legacy/v1`](https://github.com/apiframe-ai/apiframe-nodejs-sdk/tree/legacy/v1) branch.
> - **Apiframe v2** → `npm i @apiframe-ai/sdk@next` (2.x).
>
> They install side-by-side under different dist-tags, so you can run
> v1 and v2 in parallel during a transition (see
> [Side-by-side install](#side-by-side-install)).

This guide is for teams that built against Apiframe v1 and want to
switch their application over to Apiframe v2. It maps the v1 API
calls — as exposed by `@apiframe-ai/sdk@1` — to the equivalent v2
calls in `@apiframe-ai/sdk@2`. If you're starting fresh, you can skip
this document entirely and read the [main README](./README.md).

---

## Why Apiframe v2 looks different

Apiframe v1 exposes each model as its own endpoint
(`/midjourney/imagine`, `/flux/dev`, `/kling-1-text-to-video`, etc.) —
~40 of them, each with a bespoke request and response shape.

Apiframe v2 is a separate, ground-up API that consolidates everything
into nine modality-grouped endpoints:

```
POST /v2/images/generate
POST /v2/images/upscale
POST /v2/images/edit
POST /v2/images/bg-remove
POST /v2/videos/generate
POST /v2/videos/upscale
POST /v2/videos/edit
POST /v2/music/generate
POST /v2/loras                  (multipart)
POST /v2/uploads                (multipart)
POST /v2/assets
GET  /v2/jobs/:id
GET  /v2/jobs
GET  /v2/me
GET  /v2/models
```

The provider lives in a `model` field (`'midjourney' | 'flux-1.1-pro' |
'kling-2.5-turbo-pro' | …`) and provider-specific knobs sit inside a
`<model>Params` object. The v2 SDK exposes this as TypeScript
discriminated unions, so you get one method per modality, full
IntelliSense for whichever model you pick, and adding a new model
becomes a backend-only change.

---

## High-level differences

|  | Apiframe v1 (SDK v1) | Apiframe v2 (SDK v2) |
|---|---|---|
| Auth header | `Authorization: <key>` | `X-API-Key: <key>` |
| Base URL | `https://api.apiframe.pro` | `https://api.apiframe.ai` |
| Submission response | provider-specific JSON | uniform `{ jobId, status: 'QUEUED' }` |
| Result polling | `client.fetch(taskId)` | `client.jobs.waitFor(jobId)` |
| Webhooks | per-provider quirks | uniform body + `X-Webhook-Signature` (HMAC-SHA256 of API key) |
| Errors | mixed | typed subclasses of `ApiframeError` |
| Multipart | bespoke per endpoint | `client.uploads.create({ file })` + URLs reused everywhere |
| Node version | `>= 16` | `>= 18` (native `fetch`, `FormData`, web `crypto`) |

---

## Constructor

### Apiframe v1 (SDK v1)

```ts
import { ApiframeClient } from '@apiframe-ai/sdk';
const client = new ApiframeClient(process.env.APIFRAME_KEY!);
```

### Apiframe v2 (SDK v2)

```ts
import { Apiframe } from '@apiframe-ai/sdk';

const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY!,
  // baseUrl, timeout, maxRetries, fetch, userAgent are all optional
});
```

---

## Call mapping (Apiframe v1 → Apiframe v2)

Every row shows an Apiframe v1 call (left, as exposed by SDK v1) and
its closest Apiframe v2 equivalent (right, as exposed by SDK v2).
Anything in the right column without a v1 counterpart is new in
Apiframe v2; rows that say "not yet" are Apiframe v1 features that
don't have a v2 endpoint yet — see
[Apiframe v1 features not yet in v2](#apiframe-v1-features-not-yet-in-v2).

### Midjourney

| Apiframe v1 — SDK v1 | Apiframe v2 — SDK v2 |
|---|---|
| `client.imagine(prompt, opts)` | `client.images.generate({ model: 'midjourney', prompt, midjourneyParams: { aspect_ratio, … } })` |
| `client.fetch(taskId)` | `client.jobs.get(jobId)` |
| `client.upscale(taskId, idx)` | not yet — see [Apiframe v1 features not yet in v2](#apiframe-v1-features-not-yet-in-v2) |
| `client.variations(taskId, idx)` | not yet |
| `client.reroll(taskId)` | not yet |
| `client.pan(taskId, dir)` | not yet |
| `client.outpaint(taskId, …)` | not yet |
| `client.inpaint(taskId, …)` | not yet |
| `client.describe(image)` | not yet |
| `client.blend(images, …)` | not yet |
| `client.shorten(prompt)` | not yet |
| `client.seed(taskId)` | not yet |
| `client.faceSwap(targetImage, sourceImage)` | not yet |

### Flux

| Apiframe v1 — SDK v1 | Apiframe v2 — SDK v2 |
|---|---|
| `client.flux({ model: 'flux-pro-1.1', prompt, … })` | `client.images.generate({ model: 'flux-1.1-pro', prompt, fluxParams: { … } })` |
| `client.flux({ model: 'flux-pro-1.1-ultra', … })` | `client.images.generate({ model: 'flux-1.1-pro-ultra', … })` |
| `client.fluxDev(prompt, …)` | `client.images.generate({ model: 'flux-2-dev', … })` |
| `client.fluxLora({ model: 'flux-dev-lora', loras, … })` | `client.images.generate({ model: 'flux-lora', fluxLoraParams: { loras: [...] } })` |
| `client.fluxFill({ image, mask, prompt, mode })` | `client.images.edit({ model: 'flux-fill-pro', fluxFillParams: { image, mask, prompt, mode } })` |
| `client.fluxKontext({ image, prompt })` | `client.images.edit({ model: 'flux-kontext-pro', fluxKontextParams: { … } })` |

### Other image models

| Apiframe v1 — SDK v1 | Apiframe v2 — SDK v2 |
|---|---|
| `client.ideogram(...)` | `client.images.generate({ model: 'ideogram-v3', ideogramParams: { … } })` |
| `client.recraft(...)` | `client.images.generate({ model: 'recraft-v3', recraftParams: { … } })` |
| `client.bria(...)` (bg remove) | `client.images.removeBackground({ model: 'bria-bg-remove', briaBgRemoveParams: { image } })` |
| `client.topazUpscale(image, factor)` | `client.images.upscale({ model: 'topaz-image-upscale', topazUpscaleParams: { image, upscale_factor: factor } })` |
| `client.gpt4Image(...)` | `client.images.generate({ model: 'nano-banana', nanoBananaParams: { … } })` |
| `client.qwen(...)` | `client.images.generate({ model: 'qwen-image', qwenParams: { … } })` |

### Video

| Apiframe v1 — SDK v1 | Apiframe v2 — SDK v2 |
|---|---|
| `client.kling1TextToVideo(...)` / `client.kling2_5TurboProTextToVideo(...)` | `client.videos.generate({ model: 'kling-2.5-turbo-pro', prompt, klingParams: { … } })` |
| `client.veo3(...)` | `client.videos.generate({ model: 'veo-3', prompt, veoParams: { … } })` |
| `client.sora(...)` | `client.videos.generate({ model: 'sora-2', prompt, soraParams: { … } })` |
| `client.runwayGen3(...)` | `client.videos.generate({ model: 'gen-4', runwayParams: { … } })` |
| `client.luma(...)` | `client.videos.generate({ model: 'ray-flash-2', lumaParams: { … } })` |
| `client.wan(...)` | `client.videos.generate({ model: 'wan-2.7', prompt, wan27Params: { … } })` |
| `client.seedance(...)` | `client.videos.generate({ model: 'seedance-pro', seedanceParams: { … } })` |
| `client.minimax(...)` | `client.videos.generate({ model: 'hailuo-2', minimaxParams: { … } })` |
| `client.topazVideoUpscale(...)` | `client.videos.upscale({ model: 'topaz-video-upscale', topazVideoParams: { video, target_resolution, target_fps } })` |
| (no v1 equivalent) | `client.videos.edit({ model: 'wan-2.7-videoedit', wan27VideoeditParams: { … } })` |

### Music

| Apiframe v1 — SDK v1 | Apiframe v2 — SDK v2 |
|---|---|
| `client.suno(...)` | `client.music.generate({ model: 'suno', sunoParams: { … } })` |
| `client.udio(...)` | `client.music.generate({ model: 'udio', udioParams: { … } })` |
| `client.elevenlabs(...)` | `client.music.generate({ model: 'elevenlabs', elevenLabsParams: { … } })` |
| `client.lyria(...)` | `client.music.generate({ model: 'lyria-2', lyriaParams: { … } })` |

### Lifecycle / discovery

| Apiframe v1 — SDK v1 | Apiframe v2 — SDK v2 |
|---|---|
| `client.fetch(taskId)` | `client.jobs.get(jobId)` |
| (no v1 equivalent — list endpoint is new in Apiframe v2) | `client.jobs.list({ status, limit, cursor })` |
| custom polling loops in user code | `client.jobs.waitFor(jobId, { intervalMs, timeoutMs, onProgress, signal })` |
| `client.account()` | `client.me()` |
| (no v1 equivalent) | `client.models.list({ modality })` |

### Multipart

| Apiframe v1 — SDK v1 | Apiframe v2 — SDK v2 |
|---|---|
| `client.uploadImage(buffer)` | `client.uploads.create({ file })` (also accepts paths, Blobs, streams) |
| (LoRA training was a multi-step bespoke flow) | `client.loras.create({ name, subjectKind, gender, ethnicity, images })` |

### Webhooks

| Apiframe v1 — SDK v1 | Apiframe v2 — SDK v2 |
|---|---|
| varied per endpoint, manual `X-Apiframe-Signature` verification | uniform body, `X-Webhook-Signature` header, `verifyWebhook({ apiKey, body, signature })` from `@apiframe-ai/sdk/webhooks` |

---

## Side-by-side: a typical call

### Apiframe v1 (SDK v1)

```ts
import { ApiframeClient } from '@apiframe-ai/sdk';

const client = new ApiframeClient(process.env.APIFRAME_KEY!);

const submission = await client.imagine(
  'a cinematic photo of a fox in autumn forest',
  { aspect_ratio: '16:9' },
);

let task = await client.fetch(submission.task_id);
while (task.status !== 'completed' && task.status !== 'failed') {
  await new Promise((r) => setTimeout(r, 3_000));
  task = await client.fetch(submission.task_id);
}
```

### Apiframe v2 (SDK v2)

```ts
import { Apiframe } from '@apiframe-ai/sdk';

const client = new Apiframe({ apiKey: process.env.APIFRAME_API_KEY! });

const { jobId } = await client.images.generate({
  model: 'midjourney',
  prompt: 'a cinematic photo of a fox in autumn forest',
  midjourneyParams: { aspect_ratio: '16:9' },
});

const job = await client.jobs.waitFor(jobId);
```

---

## Errors

Apiframe v1 returns plain JSON with mixed `error` / `message` shapes.
Apiframe v2 always uses a uniform error envelope, and SDK v2 maps
every non-2xx status to a typed subclass of `ApiframeError`:

```ts
import {
  ApiframeError,
  ValidationError,
  InsufficientCreditsError,
  RateLimitError,
} from '@apiframe-ai/sdk';
```

If your existing v1 code wraps calls in a generic `try/catch`, that
keeps working — the only addition in v2 is that you can now
`instanceof`-narrow.

---

## Apiframe v1 features not yet in v2

Apiframe v2 does not (yet) cover every Apiframe v1 feature. The
Midjourney *child operations* — calls that take an existing Midjourney
job and produce a derivative — aren't available on Apiframe v2 today.
They are on the roadmap and will be added without breaking changes to
SDK v2:

- `upscale1x` / `upscaleAlt`
- `variations`
- `reroll`
- `pan`
- `outpaint`
- `inpaint`
- `describe`
- `blend`
- `shorten`
- `seed`
- `faceSwap`

If your application depends on any of these, you'll want to either
stay on Apiframe v1 / SDK v1 for now, or run both sides during the
transition (see below). Please open an issue if any of these are
blocking you.

---

## Side-by-side install

If you want to run Apiframe v1 and Apiframe v2 from the same process
during the transition, install both SDKs by aliasing one of them:

```bash
npm i @apiframe-ai/sdk@latest                          # v1 SDK → Apiframe v1
npm i @apiframe-ai/sdk-v2@npm:@apiframe-ai/sdk@next    # v2 SDK → Apiframe v2
```

Then:

```ts
import { ApiframeClient as V1 } from '@apiframe-ai/sdk';
import { Apiframe as V2 } from '@apiframe-ai/sdk-v2';
```
