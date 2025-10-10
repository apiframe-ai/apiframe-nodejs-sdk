import { HttpClient } from '../core/http-client';
import { AIPhotosUploadParams, AIPhotosTrainParams, AIPhotosGenerateParams, TaskResponse } from '../types';

export class AIPhotos {
  constructor(private httpClient: HttpClient) {}

  /**
   * Upload 10 to 30 images of the subject and prepare them for AI training
   * @param params - Parameters including images array, ethnicity, gender, and age
   * @returns Task response with task ID
   */
  async upload(params: AIPhotosUploadParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/ai-photo-upload', params);
  }

  /**
   * Train AI on a human subject using previously uploaded and prepared images
   * @param params - Parameters including training_images_id and trigger_word
   * @returns Task response with task ID and trigger_word
   */
  async train(params: AIPhotosTrainParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/ai-photo-train', params);
  }

  /**
   * Generate realistic photos of the subject using the trained model
   * @param params - Parameters including training_id and prompt
   * @returns Task response with task ID
   */
  async generate(params: AIPhotosGenerateParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/ai-photo-generate', params);
  }
}

