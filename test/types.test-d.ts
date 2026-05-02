/**
 * Type-only tests — confirm that the discriminated unions narrow
 * correctly so consumers get autocomplete + compile-time errors when
 * mixing `model` literals with the wrong `<model>Params` block.
 *
 * Run via `npm test` (vitest's typecheck integration picks up
 * the `*.test-d.ts` files).
 */
import { describe, it, expectTypeOf } from 'vitest';
import type {
  ImagesGenerateInput,
  VideosGenerateInput,
  MusicGenerateInput,
  Job,
  JobAccepted,
  ImageGenerationModel,
  VideoGenerationModel,
} from '../src/index.js';

type Extract<T, K> = T extends K ? T : never;

describe('discriminated union narrowing — images.generate', () => {
  it('extracts the midjourney variant when the model literal narrows', () => {
    type Mj = Extract<ImagesGenerateInput, { model: 'midjourney' }>;
    expectTypeOf<Mj['model']>().toEqualTypeOf<'midjourney'>();
    // The midjourney variant has midjourneyParams, not fluxParams.
    expectTypeOf<Mj>().toHaveProperty('midjourneyParams');
    expectTypeOf<Mj>().not.toHaveProperty('fluxParams');
  });

  it('extracts the flux variant when the model literal narrows', () => {
    type Flux = Extract<ImagesGenerateInput, { model: 'flux-1.1-pro' }>;
    expectTypeOf<Flux['model']>().toEqualTypeOf<'flux-1.1-pro'>();
    expectTypeOf<Flux>().toHaveProperty('fluxParams');
    expectTypeOf<Flux>().not.toHaveProperty('midjourneyParams');
  });
});

describe('discriminated union narrowing — videos.generate', () => {
  it('extracts the veo variant', () => {
    type Veo = Extract<VideosGenerateInput, { model: 'veo-3' }>;
    expectTypeOf<Veo['model']>().toEqualTypeOf<'veo-3'>();
    expectTypeOf<Veo>().toHaveProperty('veoParams');
  });

  it('extracts the kling variant', () => {
    type Kling = Extract<VideosGenerateInput, { model: 'kling-2.5-turbo-pro' }>;
    expectTypeOf<Kling['model']>().toEqualTypeOf<'kling-2.5-turbo-pro'>();
    expectTypeOf<Kling>().toHaveProperty('klingParams');
    expectTypeOf<Kling>().not.toHaveProperty('veoParams');
  });
});

describe('discriminated union narrowing — music.generate', () => {
  it('exposes sunoParams on the suno variant', () => {
    type Suno = Extract<MusicGenerateInput, { model: 'suno' }>;
    expectTypeOf<Suno>().toHaveProperty('sunoParams');
  });
});

describe('Generation model unions are non-empty string literals', () => {
  it('image models include core providers', () => {
    expectTypeOf<'midjourney'>().toMatchTypeOf<ImageGenerationModel>();
    expectTypeOf<'flux-1.1-pro'>().toMatchTypeOf<ImageGenerationModel>();
  });

  it('video models include core providers', () => {
    expectTypeOf<'veo-3'>().toMatchTypeOf<VideoGenerationModel>();
    expectTypeOf<'kling-2.5-turbo-pro'>().toMatchTypeOf<VideoGenerationModel>();
  });
});

describe('Submission responses', () => {
  it('JobAccepted carries jobId + status', () => {
    expectTypeOf<JobAccepted>().toHaveProperty('jobId');
    expectTypeOf<JobAccepted>().toHaveProperty('status');
  });

  it('Job carries the full lifecycle fields', () => {
    expectTypeOf<Job>().toHaveProperty('id');
    expectTypeOf<Job>().toHaveProperty('status');
  });
});
