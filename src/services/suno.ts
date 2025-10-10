import { HttpClient } from '../core/http-client';
import { SunoGenerateParams, SunoUploadParams, SunoExtendParams, SunoLyricsParams, TaskResponse } from '../types';

export class Suno {
  constructor(private httpClient: HttpClient) {}

  /**
   * Generate a song with a lyrics video clip
   * This endpoint generates TWO songs with the same lyrics
   * @param params - Parameters for music generation
   * @returns Task response with task ID
   */
  async generate(params: SunoGenerateParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/suno-imagine', params);
  }

  /**
   * Upload an audio file and turn it into an extendable song
   * @param params - Parameters including audio_url
   * @returns Task response with task ID and song_id
   */
  async upload(params: SunoUploadParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/suno-upload', params);
  }

  /**
   * Extend a previously generated song or an uploaded audio
   * @param params - Parameters including parent_task_id or song_id and continue_at timestamp
   * @returns Task response with task ID
   */
  async extend(params: SunoExtendParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/suno-extend', params);
  }

  /**
   * Generate song lyrics based on a prompt
   * @param params - Parameters including prompt
   * @returns Task response with generated lyrics
   */
  async generateLyrics(params: SunoLyricsParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/suno-lyrics', params);
  }
}

