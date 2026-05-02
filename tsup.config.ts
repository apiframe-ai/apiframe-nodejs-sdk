import { defineConfig } from 'tsup';

/**
 * Build config for `@apiframe-ai/sdk`.
 *
 * Two public entry points so consumers can pull the verifyWebhook helper
 * standalone (e.g. inside a serverless function that doesn't otherwise
 * need the full client) without bundling the resource modules:
 *
 *   import { Apiframe } from '@apiframe-ai/sdk';
 *   import { verifyWebhook } from '@apiframe-ai/sdk/webhooks';
 *
 * Dual ESM + CJS output is the established pattern for SDKs in 2026 — ESM
 * lets modern bundlers tree-shake, CJS preserves compatibility with the
 * (still-large) ts-node / Jest cohort.
 */
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    webhooks: 'src/webhooks.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  target: 'node18',
  outDir: 'dist',
  // Keep `node:` builtins external so we don't accidentally polyfill
  // crypto / fs / etc.
  external: [/^node:/],
});
