import { HttpClient } from '../core/http-client';
import { RunwayGenerateParams, TaskResponse } from '../types';

export class Runway {
  constructor(private httpClient: HttpClient) {}

  /**
   * Generate video based on a prompt and/or an image input or a video input
   * @param params - Parameters for video generation including generation_type
   * @returns Task response with task ID
   */
  async generate(params: RunwayGenerateParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/runway-imagine', params);
  }

  /**
   * Text to video generation
   * Convenience method that sets generation_type to 'text2video'
   * @param prompt - Text prompt for video generation
   * @param options - Optional parameters
   * @returns Task response with task ID
   */
  async textToVideo(prompt: string, options?: Omit<Partial<RunwayGenerateParams>, 'generation_type' | 'prompt'>): Promise<TaskResponse> {
    return this.generate({
      prompt,
      generation_type: 'text2video',
      ...options,
    });
  }

  /**
   * Image to video generation
   * Convenience method that sets generation_type to 'image2video'
   * @param imageUrl - URL of the image
   * @param prompt - Text prompt for video generation
   * @param options - Optional parameters
   * @returns Task response with task ID
   */
  async imageToVideo(imageUrl: string, prompt: string, options?: Omit<Partial<RunwayGenerateParams>, 'generation_type' | 'prompt' | 'image_url'>): Promise<TaskResponse> {
    return this.generate({
      prompt,
      generation_type: 'image2video',
      image_url: imageUrl,
      ...options,
    });
  }

  /**
   * Video to video generation
   * Convenience method that sets generation_type to 'video2video'
   * @param videoUrl - URL of the video
   * @param prompt - Text prompt for video transformation
   * @param options - Optional parameters
   * @returns Task response with task ID
   */
  async videoToVideo(videoUrl: string, prompt: string, options?: Omit<Partial<RunwayGenerateParams>, 'generation_type' | 'prompt' | 'video_url'>): Promise<TaskResponse> {
    return this.generate({
      prompt,
      generation_type: 'video2video',
      video_url: videoUrl,
      ...options,
    });
  }
}

