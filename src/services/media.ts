import { HttpClient } from '../core/http-client';
import { MediaUploadParams, MediaUploadResponse, MediaUploadAudioResponse } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';

export class Media {
  constructor(private httpClient: HttpClient) {}

  /**
   * Upload an image file (max 2MB)
   * @param params - File buffer or path to image file
   * @returns Upload response with imageURL
   */
  async upload(params: MediaUploadParams): Promise<MediaUploadResponse> {
    let fileData: Buffer;
    let filename: string;

    // Handle both 'filename' (file path) and 'file' (Buffer or path) parameters
    if (params.file) {
      if (typeof params.file === 'string') {
        // File path provided in 'file' parameter
        fileData = fs.readFileSync(params.file);
        filename = params.filename || path.basename(params.file);
      } else {
        // Buffer provided in 'file' parameter
        fileData = params.file;
        filename = params.filename || 'upload.png';
      }
    } else if (params.filename) {
      // File path provided in 'filename' parameter
      fileData = fs.readFileSync(params.filename);
      filename = path.basename(params.filename);
    } else {
      throw new Error('Either file or filename parameter is required');
    }

    // Create multipart/form-data
    const formData = new FormData();
    formData.append('image', fileData, filename);
    
    return this.httpClient.post<MediaUploadResponse>('/upload', formData, {
      headers: formData.getHeaders(),
    });
  }

  /**
   * Upload an audio file (max 2MB and 60 seconds)
   * @param params - File buffer or path to audio file
   * @returns Upload response with audioURL
   */
  async uploadAudio(params: MediaUploadParams): Promise<MediaUploadAudioResponse> {
    let fileData: Buffer;
    let filename: string;

    // Handle both 'filename' (file path) and 'file' (Buffer or path) parameters
    if (params.file) {
      if (typeof params.file === 'string') {
        // File path provided in 'file' parameter
        fileData = fs.readFileSync(params.file);
        filename = params.filename || path.basename(params.file);
      } else {
        // Buffer provided in 'file' parameter
        fileData = params.file;
        filename = params.filename || 'upload.mp3';
      }
    } else if (params.filename) {
      // File path provided in 'filename' parameter
      fileData = fs.readFileSync(params.filename);
      filename = path.basename(params.filename);
    } else {
      throw new Error('Either file or filename parameter is required');
    }

    // Create multipart/form-data
    const formData = new FormData();
    formData.append('audio', fileData, filename);
    
    return this.httpClient.post<MediaUploadAudioResponse>('/upload-audio', formData, {
      headers: formData.getHeaders(),
    });
  }
}

