import { HttpClient } from '../core/http-client';
import { 
  IdeogramGenerateParams, 
  IdeogramUpscaleParams,
  IdeogramRemixParams,
  IdeogramDescribeParams,
  TaskResponse 
} from '../types';

export class Ideogram {
  constructor(private httpClient: HttpClient) {}

  /**
   * Generate images using Ideogram
   * @param params - Parameters for image generation
   * @returns Task response with task ID
   */
  async generate(params: IdeogramGenerateParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/ideogram-imagine', params);
  }

  /**
   * Upscale an existing image to higher quality and resolution
   * @param params - Parameters including image_url, prompt, resemblance, and detail
   * @returns Task response with task ID
   */
  async upscale(params: IdeogramUpscaleParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/ideogram-upscale', params);
  }

  /**
   * Extensively describe a provided image
   * @param params - Parameters including image_url
   * @returns Task response with description
   */
  async describe(params: IdeogramDescribeParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/describe', params);
  }

  /**
   * Generate images with remix (image-to-image)
   * @param params - Parameters including image_url, prompt, and image_weight
   * @returns Task response with task ID
   */
  async remix(params: IdeogramRemixParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/ideogram-remix', params);
  }
}

