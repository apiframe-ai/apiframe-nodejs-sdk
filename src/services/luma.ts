import { HttpClient } from '../core/http-client';
import { LumaGenerateParams, LumaExtendParams, TaskResponse } from '../types';

export class Luma {
  constructor(private httpClient: HttpClient) {}

  /**
   * Generate a video based on a prompt and/or an image input
   * @param params - Parameters for video generation
   * @returns Task response with task ID
   */
  async generate(params: LumaGenerateParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/luma-imagine', params);
  }

  /**
   * Extend a previously generated video based on a prompt and/or an image input
   * @param params - Parameters including parent_task_id and prompt
   * @returns Task response with task ID
   */
  async extend(params: LumaExtendParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/luma-extend', params);
  }
}

