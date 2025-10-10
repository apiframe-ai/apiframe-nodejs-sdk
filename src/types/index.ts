export interface ApiframeConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
}

export interface TaskResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: any;
  error?: string;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
  image_urls?: string[];
  original_image_url?: string;
  downloadUrl?: string;
  videoUrl?: string;
  actions?: string[];
  task_type?: string;
}

export interface WaitForOptions {
  onProgress?: (progress: number) => void;
  interval?: number;
  timeout?: number;
}

export interface AccountInfo {
  email: string;
  credits: number;
  total_images: number;
  plan: string;
}

// Midjourney Original API Types
export interface MidjourneyImagineParams {
  prompt: string;
  aspect_ratio?: string;
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyImagineVideoParams {
  prompt: string;
  image_url: string;
  motion?: 'low' | 'high';
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyExtendVideoParams {
  parent_task_id: string;
  index: string | number;
  prompt: string;
  image_url?: string;
  motion?: 'low' | 'high';
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyRerollParams {
  parent_task_id: string;
  prompt?: string;
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyVariationsParams {
  parent_task_id: string;
  index: string | number; // Can be '1', '2', '3', '4', 1, 2, 3, 4, or 'strong', 'subtle'
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyFaceSwapParams {
  target_image_url: string;
  swap_image_url: string;
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyUpscaleParams {
  taskId: string;
  index: string | number;
}

export interface MidjourneyUpscale1xParams {
  parent_task_id: string;
  index: string | number; // Can be '1', '2', '3', '4', 1, 2, 3, or 4
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyUpscaleAltParams {
  parent_task_id: string;
  type: 'subtle' | 'creative';
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyUpscaleHighresParams {
  parent_task_id?: string; // Required if image_url not provided
  image_url?: string; // Required if parent_task_id not provided
  type: '2x' | '4x';
  index?: string; // Can be '1', '2', '3', or '4'. Only needed if it's a 4 generated images task
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyVaryParams {
  taskId: string;
  index: string | number;
  strength?: number;
}

export interface MidjourneyInpaintParams {
  parent_task_id: string;
  mask: string; // Base64 encoding of the image corresponding to the selected area
  prompt: string;
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyOutpaintParams {
  parent_task_id: string;
  zoom_ratio: number; // Can be 1.5, 2, or 1 for custom zoom
  aspect_ratio?: string;
  prompt?: string; // Drawing prompt for new areas
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyPanParams {
  parent_task_id: string;
  direction: 'up' | 'down' | 'left' | 'right';
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyShortenParams {
  prompt: string;
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyDescribeParams {
  image_url: string;
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyBlendParams {
  image_urls: string[]; // Min 2, max 5 URLs
  dimension?: 'square' | 'portrait' | 'landscape'; // Default: square
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneySeedParams {
  task_id: string;
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyZoomParams {
  taskId: string;
  zoom?: number;
}

// Midjourney Pro API Types (MidjourneyAlt)
export interface MidjourneyAltImagineParams {
  prompt: string;
  mode?: 'fast' | 'turbo';
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyAltUpscaleParams {
  parent_task_id: string;
  index: string | number;
  type: 'subtle' | 'creative';
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyAltVaryParams {
  parent_task_id: string;
  index: string | number;
  type: 'strong' | 'subtle';
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyAltVariationsParams {
  parent_task_id: string;
  index: string | number;
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyAltZoomParams {
  parent_task_id: string;
  index: string | number;
  type: string; // '1.5' | '2' | '{1, 2}' | '1' - zoom ratio
  webhook_url?: string;
  webhook_secret?: string;
}

export interface MidjourneyAltPanParams {
  parent_task_id: string;
  index: string | number;
  type: 'up' | 'down' | 'left' | 'right';
  webhook_url?: string;
  webhook_secret?: string;
}

// Flux Types
export interface FluxGenerateParams {
  model: string; // 'flux-schnell', 'flux-pro', 'flux-dev', 'flux-pro-1.1', 'flux-pro-1.1-ultra'
  prompt: string;
  image_prompt?: string; // base64 encoded image for image-to-image
  image_prompt_strength?: number; // 0-1, only for flux-pro-1.1-ultra
  prompt_upsampling?: boolean;
  width?: number; // min 256, max 1440, default 1024
  height?: number; // min 256, max 1440, default 768
  aspect_ratio?: string; // 21:9 to 9:21, default 16:9, only for flux-pro-1.1-ultra
  steps?: number; // only for flux-pro and flux-dev
  guidance?: number; // only for flux-pro and flux-dev
  interval?: number; // default 2, min 1, max 4, only for flux-pro
  seed?: number;
  safety_tolerance?: number; // 0-6, 0 most strict, 6 least strict
  raw?: boolean; // only for flux-pro-1.1-ultra
  webhook_url?: string;
  webhook_secret?: string;
}

// Ideogram Types
export interface IdeogramGenerateParams {
  prompt: string;
  style_type?: string;
  negative_prompt?: string;
  seed?: number;
  magic_prompt_option?: string;
  aspect_ratio?: string;
  resolution?: string;
}

export interface IdeogramUpscaleParams {
  image_url: string;
  prompt: string;
  resemblance: number; // 1 to 100
  detail?: number; // 1 to 100
  seed?: number;
  magic_prompt_option?: string;
}

export interface IdeogramRemixParams {
  image_url: string;
  prompt: string;
  image_weight: number; // 1 to 100
  style_type?: string;
  negative_prompt?: string;
  seed?: number;
  magic_prompt_option?: string;
  aspect_ratio?: string;
  resolution?: string;
}

export interface IdeogramDescribeParams {
  image_url: string;
}

// Luma Types
export interface LumaGenerateParams {
  prompt: string;
  image_url?: string;
  end_image_url?: string;
  enhance_prompt?: boolean;
  aspect_ratio?: string; // Default: 1:1
  loop?: boolean;
  webhook_url?: string;
  webhook_secret?: string;
}

export interface LumaExtendParams {
  parent_task_id: string;
  prompt: string;
  image_url?: string;
  end_image_url?: string;
  enhance_prompt?: boolean;
  aspect_ratio?: string; // Default: 1:1
  webhook_url?: string;
  webhook_secret?: string;
}

// Suno Types
export interface SunoGenerateParams {
  prompt: string;
  lyrics?: string;
  model?: string; // 'chirp-v3-0' or 'chirp-v3-5', 'chirp-v4' by default
  make_instrumental?: boolean;
  title?: string;
  tags?: string;
  webhook_url?: string;
  webhook_secret?: string;
}

export interface SunoUploadParams {
  audio_url: string;
}

export interface SunoExtendParams {
  parent_task_id?: string;
  song_id?: string;
  continue_at: number; // timestamp in seconds
  from_upload?: boolean;
  prompt?: string;
  lyrics?: string;
  title?: string;
  tags?: string;
  webhook_url?: string;
  webhook_secret?: string;
}

export interface SunoLyricsParams {
  prompt: string;
}

// Udio Types
export interface UdioGenerateParams {
  prompt: string;
  lyrics?: string;
  model?: string; // 'udio32-v1.5' or 'udio130-v1.5' by default
  bypass_prompt_optimization?: boolean;
  prompt_strength?: number; // 0-1
  clarity_strength?: number; // 0-1
  lyrics_strength?: number; // 0-1
  generation_quality?: number; // 0-1
  negative_prompt?: string;
  lyrics_placement_start?: number; // timestamp in seconds
  lyrics_placement_end?: number; // timestamp in seconds
  tags?: string; // style tags, ex: 'rap, pop'
  webhook_url?: string;
  webhook_secret?: string;
}

// Runway Types
export interface RunwayGenerateParams {
  prompt: string;
  generation_type: 'text2video' | 'image2video' | 'video2video';
  image_url?: string; // for 'image2video'
  end_image_url?: string; // for 'image2video'
  video_url?: string; // for 'video2video'
  aspect_ratio?: string; // 16:9, 9:16, 1:1, 4:3, 3:4, or 21:9, only for 'text2video'
  model?: string; // 'gen3' or 'gen3a_turbo'
  duration?: number; // 5 or 10
  flip?: boolean;
  webhook_url?: string;
  webhook_secret?: string;
}

// Kling Types
export interface KlingGenerateParams {
  prompt: string;
  generation_type: 'text2video' | 'image2video';
  negative_prompt?: string;
  image_url?: string; // for 'image2video'
  end_image_url?: string; // for 'image2video'
  mode?: string; // 'std' or 'pro', only 'kling-v1-5' works with 'pro'
  aspect_ratio?: string; // 16:9, 9:16, 1:1, 4:3, 3:4, or 21:9, only for 'text2video'
  model?: string; // 'kling-v1', 'kling-v1-5', or 'kling-v1-6'
  duration?: number; // 5 or 10
  cfg_scale?: number; // between 0 and 1
  webhook_url?: string;
  webhook_secret?: string;
}

export interface KlingTryonParams {
  human_image_url: string;
  cloth_image_url: string;
  model?: string; // 'kolors-virtual-try-on-v1' or 'kolors-virtual-try-on-v1-5'
  webhook_url?: string;
  webhook_secret?: string;
}

// AI Photos Types
export interface AIPhotosUploadParams {
  images: string[]; // Base64 array of 10 to 30 images
  ethnicity: string; // 'asian', 'black', 'latino', 'middle eastern', 'native american', 'pacific islander', or 'white'
  gender: string; // 'female' or 'male'
  age: number;
  webhook_url?: string;
  webhook_secret?: string;
}

export interface AIPhotosTrainParams {
  training_images_id: string; // task_id from upload task
  trigger_word: string; // Default: 'TOKMSN'
  webhook_url?: string;
  webhook_secret?: string;
}

export interface AIPhotosGenerateParams {
  training_id: string; // task_id from training task
  prompt: string;
  aspect_ratio?: string; // Default: 1:1
  width?: string;
  height?: string;
  number_of_images?: string; // 1 to 4
  seed?: number;
}

// Media Upload Types
export interface MediaUploadParams {
  file?: Buffer | string;
  filename?: string;
}

export interface MediaUploadResponse {
  imageURL: string;
}

export interface MediaUploadAudioResponse {
  audioURL: string;
}

// Note: ApiframeError is exported from utils/errors as a class

