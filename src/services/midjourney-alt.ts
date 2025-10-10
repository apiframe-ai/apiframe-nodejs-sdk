import { HttpClient } from '../core/http-client';
import {
  MidjourneyAltImagineParams,
  MidjourneyAltUpscaleParams,
  MidjourneyAltVaryParams,
  MidjourneyAltVariationsParams,
  MidjourneyAltZoomParams,
  MidjourneyAltPanParams,
  TaskResponse,
} from '../types';

/**
 * MidjourneyAlt - Pro Midjourney API
 * Advanced version with Fast and Turbo modes
 * @see https://docs.apiframe.ai/pro-midjourney-api/api-endpoints
 */
export class MidjourneyAlt {
  constructor(private httpClient: HttpClient) {}

  /**
   * Create a new image generation task (Pro API)
   * Supports Fast and Turbo modes
   * @param params - Parameters for the imagine request
   * @returns Task response with task ID
   */
  async imagine(params: MidjourneyAltImagineParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/pro/imagine', params);
  }

  /**
   * Upscale a specific image from a generation (Pro API)
   * @param params - Parameters including taskId and index
   * @returns Task response with task ID
   */
  async upscale(params: MidjourneyAltUpscaleParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/pro/upscale', params);
  }

  /**
   * Create variations of a specific image with strong/subtle control (Pro API)
   * @param params - Parameters including parent_task_id, index, and type
   * @returns Task response with task ID
   */
  async vary(params: MidjourneyAltVaryParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/pro/vary', params);
  }

  /**
   * Generate 4 variations of a specific image (Pro API)
   * @param params - Parameters including parent_task_id and index
   * @returns Task response with task ID
   */
  async variations(params: MidjourneyAltVariationsParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/pro/variations', params);
  }

  /**
   * Zoom out from an image (Pro API)
   * @param params - Parameters including parent_task_id, index, and type (zoom ratio)
   * @returns Task response with task ID
   */
  async zoom(params: MidjourneyAltZoomParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/pro/zoom', params);
  }

  /**
   * Pan in a specific direction (Pro API)
   * @param params - Parameters including parent_task_id, index, and type (direction)
   * @returns Task response with task ID
   */
  async pan(params: MidjourneyAltPanParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/pro/pan', params);
  }

  /**
   * Get account information (Pro API)
   * @returns Account information including credits
   */
  async getAccountInfo(): Promise<{ credits: number; usage: number }> {
    return this.httpClient.get('/pro/account');
  }

  /**
   * Get generation info by ID (Pro API)
   * @param generationId - The generation ID
   * @returns Generation information
   */
  async getGeneration(generationId: string): Promise<TaskResponse> {
    return this.httpClient.get(`/pro/generation/${generationId}`);
  }
}

