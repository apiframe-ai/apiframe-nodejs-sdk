import { HttpClient } from '../core/http-client';
import { FluxGenerateParams, TaskResponse } from '../types';

export class Flux {
  constructor(private httpClient: HttpClient) {}

  /**
   * Generate images using Flux AI
   * @param params - Parameters for image generation including model selection
   * @returns Task response with task ID
   */
  async generate(params: FluxGenerateParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/flux-imagine', params);
  }

  /**
   * Generate images using Flux Pro
   * Convenience method that sets model to 'flux-pro'
   * @param params - Parameters for image generation (model will be set to 'flux-pro')
   * @returns Task response with task ID
   */
  async generatePro(params: Omit<FluxGenerateParams, 'model'> & { model?: string }): Promise<TaskResponse> {
    return this.generate({ ...params, model: params.model || 'flux-pro' });
  }

  /**
   * Generate images using Flux Dev
   * Convenience method that sets model to 'flux-dev'
   * @param params - Parameters for image generation (model will be set to 'flux-dev')
   * @returns Task response with task ID
   */
  async generateDev(params: Omit<FluxGenerateParams, 'model'> & { model?: string }): Promise<TaskResponse> {
    return this.generate({ ...params, model: params.model || 'flux-dev' });
  }

  /**
   * Generate images using Flux Schnell (fast mode)
   * Convenience method that sets model to 'flux-schnell'
   * @param params - Parameters for image generation (model will be set to 'flux-schnell')
   * @returns Task response with task ID
   */
  async generateSchnell(params: Omit<FluxGenerateParams, 'model'> & { model?: string }): Promise<TaskResponse> {
    return this.generate({ ...params, model: params.model || 'flux-schnell' });
  }
}

