/**
 * `client.videos.*` — video generation, editing and upscaling.
 */
import { Resource, type CallOptions } from './base.js';
import type {
  VideosGenerateInput,
  VideosUpscaleInput,
  VideosEditInput,
  JobAccepted,
} from '../types/public.js';

export class Videos extends Resource {
  /**
   * Submit a video generation job. Supports Kling 2.1-3.0, Veo 2/3,
   * Sora 2, Seedance 1-2, Hailuo, Luma, Wan 2.5-2.7, Runway Gen4,
   * Midjourney Video and Grok Imagine Video.
   *
   * Many video models bill per-second; the API multiplies the variant
   * cost by the requested `duration` server-side.
   */
  generate(input: VideosGenerateInput, options?: CallOptions): Promise<JobAccepted> {
    return this.submit('/v2/videos/generate', input, options);
  }

  /** Submit a video upscale job (Topaz Video). */
  upscale(input: VideosUpscaleInput, options?: CallOptions): Promise<JobAccepted> {
    return this.submit('/v2/videos/upscale', input, options);
  }

  /** Submit an instruction-based video edit job (Wan 2.7 VideoEdit). */
  edit(input: VideosEditInput, options?: CallOptions): Promise<JobAccepted> {
    return this.submit('/v2/videos/edit', input, options);
  }
}
