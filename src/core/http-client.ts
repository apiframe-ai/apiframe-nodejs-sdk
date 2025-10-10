import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ApiframeConfig } from '../types';
import { 
  ApiframeError, 
  AuthenticationError, 
  RateLimitError, 
  TimeoutError 
} from '../utils/errors';

export class HttpClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: ApiframeConfig) {
    this.apiKey = config.apiKey;
    
    if (!this.apiKey) {
      throw new ApiframeError('API key is required');
    }

    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.apiframe.ai',
      timeout: config.timeout || 300000, // 5 minutes default for long-running tasks
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to normalize request data
    this.client.interceptors.request.use((config) => {
      if (config.data && typeof config.data === 'object') {
        // Convert numeric index to string for Apiframe API
        if ('index' in config.data && typeof config.data.index === 'number') {
          config.data.index = String(config.data.index);
        }
      }
      return config;
    });

    // Add response interceptor for error handling and response normalization
    this.client.interceptors.response.use(
      (response) => {
        // Normalize API response to match SDK types
        if (response.data && typeof response.data === 'object') {
          this.normalizeTaskResponse(response.data);
          
          // Also normalize in nested task objects (for fetch-many responses)
          if ('tasks' in response.data && Array.isArray(response.data.tasks)) {
            response.data.tasks = response.data.tasks.map((task: any) => {
              this.normalizeTaskResponse(task);
              return task;
            });
          }
        }
        return response;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private normalizeTaskResponse(data: any): void {
    // Normalize task_id to id
    if ('task_id' in data && !('id' in data)) {
      data.id = data.task_id;
    }
    
    // Normalize percentage (string) to progress (number)
    if ('percentage' in data && !('progress' in data)) {
      const percentage = data.percentage;
      if (typeof percentage === 'string') {
        const num = parseInt(percentage, 10);
        data.progress = isNaN(num) ? 0 : num;
      } else if (typeof percentage === 'number') {
        data.progress = percentage;
      }
    }
    
    // Normalize status: API returns "finished" but SDK expects "completed"
    if (data.status === 'finished') {
      data.status = 'completed';
    }
  }

  private handleError(error: AxiosError): ApiframeError {
    if (error.response) {
      const { status, data } = error.response;
      const message = (data as any)?.message || error.message;

      switch (status) {
        case 401:
          return new AuthenticationError(message);
        case 429:
          return new RateLimitError(message);
        case 408:
          return new TimeoutError(message);
        default:
          return new ApiframeError(
            message,
            (data as any)?.code,
            status,
            data
          );
      }
    } else if (error.code === 'ECONNABORTED') {
      return new TimeoutError();
    } else {
      return new ApiframeError(error.message || 'An unknown error occurred');
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }
}

