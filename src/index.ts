import { HttpClient } from './core/http-client';
import { ApiframeConfig } from './types';
import { Tasks } from './services/tasks';
import { Midjourney } from './services/midjourney';
import { MidjourneyAlt } from './services/midjourney-alt';
import { Flux } from './services/flux';
import { Ideogram } from './services/ideogram';
import { Luma } from './services/luma';
import { Suno } from './services/suno';
import { Udio } from './services/udio';
import { Runway } from './services/runway';
import { Kling } from './services/kling';
import { AIPhotos } from './services/ai-photos';
import { Media } from './services/media';

/**
 * Main Apiframe SDK client
 * 
 * @example
 * ```typescript
 * const client = new Apiframe({ apiKey: 'your_api_key' });
 * 
 * const task = await client.midjourney.imagine({
 *   prompt: 'a beautiful sunset',
 *   aspectRatio: '16:9',
 *   model: 'v7'
 * });
 * 
 * const result = await client.tasks.waitFor(task.id, {
 *   onProgress: (p) => console.log('Progress:', p)
 * });
 * ```
 */
export class Apiframe {
  private httpClient: HttpClient;

  public tasks: Tasks;
  public midjourney: Midjourney;
  public midjourneyAlt: MidjourneyAlt;
  public flux: Flux;
  public ideogram: Ideogram;
  public luma: Luma;
  public suno: Suno;
  public udio: Udio;
  public runway: Runway;
  public kling: Kling;
  public aiPhotos: AIPhotos;
  public media: Media;

  /**
   * Create a new Apiframe client
   * @param config - Configuration object with API key and optional settings
   */
  constructor(config: ApiframeConfig) {
    this.httpClient = new HttpClient(config);

    // Initialize all service modules
    this.tasks = new Tasks(this.httpClient);
    this.midjourney = new Midjourney(this.httpClient);
    this.midjourneyAlt = new MidjourneyAlt(this.httpClient);
    this.flux = new Flux(this.httpClient);
    this.ideogram = new Ideogram(this.httpClient);
    this.luma = new Luma(this.httpClient);
    this.suno = new Suno(this.httpClient);
    this.udio = new Udio(this.httpClient);
    this.runway = new Runway(this.httpClient);
    this.kling = new Kling(this.httpClient);
    this.aiPhotos = new AIPhotos(this.httpClient);
    this.media = new Media(this.httpClient);
  }
}

// Export types
export * from './types';

// Export error classes
export * from './utils/errors';

// Export individual service classes for advanced usage
export { Tasks } from './services/tasks';
export { Midjourney } from './services/midjourney';
export { MidjourneyAlt } from './services/midjourney-alt';
export { Flux } from './services/flux';
export { Ideogram } from './services/ideogram';
export { Luma } from './services/luma';
export { Suno } from './services/suno';
export { Udio } from './services/udio';
export { Runway } from './services/runway';
export { Kling } from './services/kling';
export { AIPhotos } from './services/ai-photos';
export { Media } from './services/media';

// Default export
export default Apiframe;

