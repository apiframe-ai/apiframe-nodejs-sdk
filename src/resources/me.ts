/**
 * `client.me.get()` — return the authenticated caller info.
 */
import { Resource } from './base.js';
import type { MeResponse } from '../types/public.js';

export class Me extends Resource {
  /** Returns user, team, and (when API-key auth is used) the key info. */
  async get(): Promise<MeResponse> {
    return this.http.request<MeResponse>({
      method: 'GET',
      path: '/v2/me',
    });
  }
}
