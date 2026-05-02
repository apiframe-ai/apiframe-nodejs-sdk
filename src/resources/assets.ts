/**
 * `client.assets.*` — pre-register an asset with the upstream provider
 * (Kie / Seedance flow). Most consumers won't need this — the
 * higher-level `images.generate` / `videos.generate` methods accept
 * URLs directly. Use this if you need to reference the same input
 * across many jobs and want to avoid re-uploading.
 */
import { Resource, type CallOptions } from './base.js';
import type { AssetCreated, CreateAssetInput } from '../types/public.js';

export class Assets extends Resource {
  /**
   * Register an asset with the upstream provider and return its ID.
   * The same asset can then be reused across multiple jobs.
   */
  async create(input: CreateAssetInput, options: CallOptions = {}): Promise<AssetCreated> {
    return this.http.request<AssetCreated>({
      method: 'POST',
      path: '/v2/assets/create',
      body: input as unknown as Record<string, unknown>,
      idempotencyKey: options.idempotencyKey,
      timeout: options.timeout,
      signal: options.signal,
    });
  }

  /**
   * Fetch the upstream provider's asset object (opaque, provider-specific
   * shape). Only assets registered by your team are accessible.
   */
  async get(assetId: string): Promise<unknown> {
    return this.http.request<unknown>({
      method: 'GET',
      path: `/v2/assets/${encodeURIComponent(assetId)}`,
    });
  }
}
