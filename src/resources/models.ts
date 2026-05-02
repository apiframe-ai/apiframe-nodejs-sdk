/**
 * `client.models.list({...})` — public model catalog (no auth).
 *
 * Returns curated metadata: id, label, description, cost range, and a
 * description of the control surface. The same data drives the
 * Apiframe Studio templates pages.
 */
import { Resource } from './base.js';
import type { ModelCatalog, ModelsListQuery } from '../types/public.js';

export class Models extends Resource {
  /**
   * List all models, optionally filtered by modality.
   *
   * @example
   * const { models } = await client.models.list({ modality: 'video' });
   */
  async list(query: ModelsListQuery = {}): Promise<ModelCatalog> {
    return this.http.request<ModelCatalog>({
      method: 'GET',
      path: '/v2/models',
      query: query as Record<string, string | number | boolean | undefined>,
    });
  }
}
