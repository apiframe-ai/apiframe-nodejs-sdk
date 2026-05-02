/**
 * `client.music.*` — music generation across Suno, Udio, Producer,
 * Lyria 3 and ElevenLabs Music.
 *
 * Note: Suno and Udio always return TWO songs per call. Inspect
 * `result` on the completed job for the array.
 */
import { Resource, type CallOptions } from './base.js';
import type { MusicGenerateInput, JobAccepted } from '../types/public.js';

export class Music extends Resource {
  /** Submit a music generation job. */
  generate(input: MusicGenerateInput, options?: CallOptions): Promise<JobAccepted> {
    return this.submit('/v2/music/generate', input, options);
  }
}
