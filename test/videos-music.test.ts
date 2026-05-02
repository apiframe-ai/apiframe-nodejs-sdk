import { describe, it, expect, afterEach } from 'vitest';
import { makeHarness } from './helpers.js';

describe('client.videos.* and client.music.*', () => {
  let harness: ReturnType<typeof makeHarness>;
  afterEach(async () => {
    await harness?.mockAgent.close();
  });

  for (const path of ['/v2/videos/generate', '/v2/videos/upscale', '/v2/videos/edit', '/v2/music/generate']) {
    it(`POST ${path} returns JobAccepted`, async () => {
      harness = makeHarness();
      harness.pool
        .intercept({ path, method: 'POST' })
        .reply(202, { jobId: 'job-x', status: 'QUEUED' }, {
          headers: { 'content-type': 'application/json' },
        });

      let res;
      switch (path) {
        case '/v2/videos/generate':
          res = await harness.client.videos.generate({
            model: 'veo-3',
            prompt: 'a cat',
            veoParams: { duration: 8 },
          });
          break;
        case '/v2/videos/upscale':
          res = await harness.client.videos.upscale({
            model: 'topaz-video-upscale',
            topazVideoParams: { video: 'https://x', target_resolution: '1080p', target_fps: 30 },
          });
          break;
        case '/v2/videos/edit':
          res = await harness.client.videos.edit({
            model: 'wan-2.7-videoedit',
            prompt: 'change colour',
            wan27VideoeditParams: { video: 'https://x' },
          });
          break;
        case '/v2/music/generate':
          res = await harness.client.music.generate({
            model: 'suno',
            prompt: 'lo-fi beats',
            sunoParams: {
              custom_mode: false,
              instrumental: true,
              model_version: 'V5',
            },
          });
          break;
      }
      expect(res?.jobId).toBe('job-x');
    });
  }
});
