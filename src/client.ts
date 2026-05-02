/**
 * `Apiframe` — top-level SDK class. Wires the HTTP transport into a tree
 * of resource objects (`client.images`, `client.videos`, `client.jobs`, ...)
 * each of which exposes the typed methods documented in the README.
 *
 * Usage:
 *
 *   import { Apiframe } from '@apiframe-ai/sdk';
 *
 *   const client = new Apiframe({
 *     apiKey: process.env.APIFRAME_API_KEY!,
 *   });
 *
 *   const { jobId } = await client.images.generate({
 *     model: 'midjourney',
 *     prompt: 'a cat in a spaceship',
 *   });
 *   const finished = await client.jobs.waitFor(jobId);
 */

import { HttpClient, type HttpClientOptions } from './http.js';
import { Images } from './resources/images.js';
import { Videos } from './resources/videos.js';
import { Music } from './resources/music.js';
import { Jobs } from './resources/jobs.js';
import { Uploads } from './resources/uploads.js';
import { Loras } from './resources/loras.js';
import { Models } from './resources/models.js';
import { Assets } from './resources/assets.js';
import { Me } from './resources/me.js';

/**
 * Constructor options for the {@link Apiframe} client.
 *
 * Currently identical to {@link HttpClientOptions}; kept as a distinct
 * alias so we can grow it (e.g. resource-level toggles) without
 * touching the transport contract.
 */
export type ApiframeOptions = HttpClientOptions;

export class Apiframe {
  /** Underlying HTTP transport. Exposed for advanced use cases (raw calls). */
  readonly http: HttpClient;

  /** Image generation, editing, upscaling and background removal. */
  readonly images: Images;
  /** Video generation, editing and upscaling. */
  readonly videos: Videos;
  /** Music generation across Suno, Udio, Producer, Lyria, ElevenLabs. */
  readonly music: Music;
  /** Job lifecycle — get, list, waitFor. */
  readonly jobs: Jobs;
  /** Single-file CDN uploads. */
  readonly uploads: Uploads;
  /** Flux LoRA training. */
  readonly loras: Loras;
  /** Public model catalog (no auth). */
  readonly models: Models;
  /** Provider asset registration (Kie / Seedance flow). */
  readonly assets: Assets;
  /** Authenticated caller info. */
  private readonly meResource: Me;

  constructor(options: ApiframeOptions) {
    this.http = new HttpClient(options);
    this.images = new Images(this.http);
    this.videos = new Videos(this.http);
    this.music = new Music(this.http);
    this.jobs = new Jobs(this.http);
    this.uploads = new Uploads(this.http);
    this.loras = new Loras(this.http);
    this.models = new Models(this.http);
    this.assets = new Assets(this.http);
    this.meResource = new Me(this.http);
  }

  /** Returns the authenticated caller (user, team, key info). */
  me() {
    return this.meResource.get();
  }
}
