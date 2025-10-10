import { HttpClient } from '../core/http-client';
import {
  MidjourneyImagineParams,
  MidjourneyImagineVideoParams,
  MidjourneyExtendVideoParams,
  MidjourneyRerollParams,
  MidjourneyVariationsParams,
  MidjourneyUpscaleParams,
  MidjourneyUpscale1xParams,
  MidjourneyUpscaleAltParams,
  MidjourneyUpscaleHighresParams,
  MidjourneyVaryParams,
  MidjourneyZoomParams,
  MidjourneyInpaintParams,
  MidjourneyOutpaintParams,
  MidjourneyPanParams,
  MidjourneyBlendParams,
  MidjourneyDescribeParams,
  MidjourneySeedParams,
  MidjourneyFaceSwapParams,
  MidjourneyShortenParams,
  TaskResponse,
} from '../types';

/**
 * Midjourney - Original Midjourney API
 * @see https://docs.apiframe.ai/api-endpoints
 */
export class Midjourney {
  constructor(private httpClient: HttpClient) {}

  /**
   * Create a new image generation task
   * @param params - Parameters for the imagine request
   * @returns Task response with task ID
   */
  async imagine(params: MidjourneyImagineParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/imagine', params);
  }

  /**
   * Create a video generation task using a text prompt and image URL
   * @param params - Parameters including prompt and image_url
   * @returns Task response with task ID
   */
  async imagineVideo(params: MidjourneyImagineVideoParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/imagine-video', params);
  }

  /**
   * Extend previously generated videos
   * @param params - Parameters including parent_task_id, index, prompt, and optional image_url
   * @returns Task response with task ID
   */
  async extendVideo(params: MidjourneyExtendVideoParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/imagine-video-extend', params);
  }

  /**
   * Upscale a specific image from a generation (legacy method)
   * @param params - Parameters including taskId and index
   * @returns Task response with task ID
   * @deprecated Use upscale1x, upscaleAlt, or upscaleHighres instead
   */
  async upscale(params: MidjourneyUpscaleParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/midjourney/upscale', params);
  }

  /**
   * Upscale one of the 4 generated images to get a single image
   * @param params - Parameters including parent_task_id and index
   * @returns Task response with task ID
   */
  async upscale1x(params: MidjourneyUpscale1xParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/upscale-1x', params);
  }

  /**
   * Upscale with Subtle or Creative mode
   * Subtle doubles the size keeping details similar to original, Creative adds details
   * @param params - Parameters including parent_task_id and type
   * @returns Task response with task ID
   */
  async upscaleAlt(params: MidjourneyUpscaleAltParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/upscale-alt', params);
  }

  /**
   * Upscale any image to higher resolution (2x or 4x) - not from Midjourney
   * Image must not be larger than 2048x2048
   * @param params - Parameters including parent_task_id or image_url, and type
   * @returns Task response with task ID
   */
  async upscaleHighres(params: MidjourneyUpscaleHighresParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/upscale-highres', params);
  }

  /**
   * Create variations of a specific image
   * @param params - Parameters including taskId, index, and optional strength
   * @returns Task response with task ID
   */
  async vary(params: MidjourneyVaryParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/midjourney/vary', params);
  }

  /**
   * Inpaint (Vary Region) - Redraw a selected area of an image
   * @param params - Parameters including parent_task_id, mask, and prompt
   * @returns Task response with task ID
   */
  async inpaint(params: MidjourneyInpaintParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/inpaint', params);
  }

  /**
   * Outpaint (Zoom Out) - Enlarges an image's canvas beyond its original size
   * @param params - Parameters including parent_task_id and zoom_ratio
   * @returns Task response with task ID
   */
  async outpaint(params: MidjourneyOutpaintParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/outpaint', params);
  }

  /**
   * Pan - Broadens the image canvas in a specific direction
   * @param params - Parameters including parent_task_id and direction
   * @returns Task response with task ID
   */
  async pan(params: MidjourneyPanParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/pan', params);
  }

  /**
   * Describe an image with prompts - Writes four example prompts based on an image
   * @param params - Parameters including image_url
   * @returns Task response with task ID
   */
  async describe(params: MidjourneyDescribeParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/describe', params);
  }

  /**
   * Blend multiple images into one image
   * @param params - Parameters including array of image URLs (2-5 images)
   * @returns Task response with task ID
   */
  async blend(params: MidjourneyBlendParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/blend', params);
  }

  /**
   * Shorten a prompt - Analyzes and suggests optimizations for your prompt
   * @param params - Parameters including the prompt to shorten
   * @returns Task response with task ID
   */
  async shorten(params: MidjourneyShortenParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/shorten', params);
  }

  /**
   * Get the seed of a generated image
   * @param params - Parameters including task_id
   * @returns Task response with seed information
   */
  async seed(params: MidjourneySeedParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/seed', params);
  }

  /**
   * Zoom out from an image (legacy method)
   * @param params - Parameters including taskId and zoom level
   * @returns Task response with task ID
   * @deprecated Use outpaint instead
   */
  async zoom(params: MidjourneyZoomParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/midjourney/zoom', params);
  }

  /**
   * Reroll to create new images from a previous Imagine task
   * @param params - Parameters including parent_task_id
   * @returns Task response with task ID
   */
  async reroll(params: MidjourneyRerollParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/reroll', params);
  }

  /**
   * Create 4 new variations of one of the 4 generated images
   * @param params - Parameters including parent_task_id and index
   * @returns Task response with task ID
   */
  async variations(params: MidjourneyVariationsParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/variations', params);
  }

  /**
   * Face swap between two images
   * @param params - Parameters including target_image_url and swap_image_url
   * @returns Task response with task ID
   */
  async faceSwap(params: MidjourneyFaceSwapParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/faceswap', params);
  }

}

