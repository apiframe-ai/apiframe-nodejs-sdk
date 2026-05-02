/**
 * `client.images.*` — image generation, editing, upscaling and
 * background removal. Every method submits a job and returns
 * `{ jobId, status }`; consumers then poll via `client.jobs.waitFor()`
 * (or wait for a webhook).
 */
import { Resource, type CallOptions } from './base.js';
import type {
  ImagesGenerateInput,
  ImagesUpscaleInput,
  ImagesEditInput,
  ImagesRemoveBackgroundInput,
  JobAccepted,
} from '../types/public.js';

export class Images extends Resource {
  /**
   * Submit an image generation job. The discriminator `model` selects
   * which family to use (`midjourney`, `flux-1.1-pro`, `seedream-4.5`,
   * ideogram, imagen, dall-e, gpt-image, kling-image, qwen-image,
   * wan-image, grok-imagine-image, reve-create, nano-banana, flux-lora);
   * each unlocks its own `<model>Params` block with the family-specific
   * controls.
   *
   * @example
   * await client.images.generate({
   *   model: 'midjourney',
   *   prompt: 'a cat in a spaceship',
   *   midjourneyParams: { aspect_ratio: '16:9' },
   * });
   */
  generate(input: ImagesGenerateInput, options?: CallOptions): Promise<JobAccepted> {
    return this.submit('/v2/images/generate', input, options);
  }

  /**
   * Submit an image upscale job. Supports Topaz (per-megapixel pricing,
   * variable factor) and Clarity (flat).
   */
  upscale(input: ImagesUpscaleInput, options?: CallOptions): Promise<JobAccepted> {
    return this.submit('/v2/images/upscale', input, options);
  }

  /**
   * Submit an inpaint or outpaint job (Flux Fill Pro). For `mode:
   * 'inpaint'` provide a `mask`; for `mode: 'outpaint'` provide an
   * `outpaint` preset.
   */
  edit(input: ImagesEditInput, options?: CallOptions): Promise<JobAccepted> {
    return this.submit('/v2/images/edit', input, options);
  }

  /**
   * Submit a background-removal job. Two tiers: `bria-bg-remove`
   * (state-of-the-art alpha matting) and `851-bg-remove` (cheaper
   * fast path).
   */
  removeBackground(
    input: ImagesRemoveBackgroundInput,
    options?: CallOptions,
  ): Promise<JobAccepted> {
    return this.submit('/v2/images/background-remove', input, options);
  }
}
