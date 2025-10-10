import { HttpClient } from '../core/http-client';
import { KlingGenerateParams, KlingTryonParams, TaskResponse } from '../types';

export class Kling {
  constructor(private httpClient: HttpClient) {}

  /**
   * Generate video based on a prompt and/or an image input
   * @param params - Parameters for video generation including generation_type
   * @returns Task response with task ID
   */
  async generate(params: KlingGenerateParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/kling-imagine', params);
  }

  /**
   * Generate video from text prompt
   * Convenience method that sets generation_type to 'text2video'
   * @param prompt - Text prompt for video generation
   * @param options - Optional parameters
   * @returns Task response with task ID
   */
  async textToVideo(prompt: string, options?: Omit<Partial<KlingGenerateParams>, 'generation_type' | 'prompt'>): Promise<TaskResponse> {
    return this.generate({
      prompt,
      generation_type: 'text2video',
      ...options,
    });
  }

  /**
   * Generate video from image
   * Convenience method that sets generation_type to 'image2video'
   * @param image_url - URL of the image
   * @param prompt - Prompt for video generation
   * @param options - Optional parameters
   * @returns Task response with task ID
   */
  async imageToVideo(image_url: string, prompt: string, options?: Omit<Partial<KlingGenerateParams>, 'generation_type' | 'prompt' | 'image_url'>): Promise<TaskResponse> {
    return this.generate({
      prompt,
      generation_type: 'image2video',
      image_url,
      ...options,
    });
  }

  /**
   * Virtual try on - Generate an image of a person with the provided clothe image
   * @param params - Parameters including human_image_url and cloth_image_url
   * @returns Task response with task ID
   */
  async tryon(params: KlingTryonParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/kling-tryon', params);
  }
}

