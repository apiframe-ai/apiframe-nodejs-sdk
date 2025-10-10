import { HttpClient } from '../core/http-client';
import { UdioGenerateParams, TaskResponse } from '../types';

export class Udio {
  constructor(private httpClient: HttpClient) {}

  /**
   * Generate a music song using Udio AI
   * This endpoint generates TWO different songs with their own lyrics
   * @param params - Parameters for music generation
   * @returns Task response with task ID
   */
  async generate(params: UdioGenerateParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/udio-imagine', params);
  }
}

