import { HttpClient } from '../core/http-client';
import { TaskResponse, WaitForOptions, AccountInfo } from '../types';
import { TimeoutError } from '../utils/errors';

export class Tasks {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get the status of a task
   * @param taskId - The ID of the task to check
   * @returns Task response with current status
   */
  async get(taskId: string): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/fetch', { task_id: taskId });
  }

  /**
   * Get the status/results of multiple tasks
   * @param taskIds - Array of task IDs (min 2, max 20)
   * @returns Object containing array of task results/statuses
   */
  async getMany(taskIds: string[]): Promise<{ tasks: TaskResponse[] }> {
    return this.httpClient.post<{ tasks: TaskResponse[] }>('/fetch-many', { task_ids: taskIds });
  }

  /**
   * Wait for a task to complete with optional progress callback
   * @param taskId - The ID of the task to wait for
   * @param options - Options including onProgress callback, polling interval, and timeout
   * @returns The completed task result
   */
  async waitFor(taskId: string, options: WaitForOptions = {}): Promise<TaskResponse> {
    const { 
      onProgress, 
      interval = 3000, 
      timeout = 300000 // 5 minutes default
    } = options;

    const startTime = Date.now();

    while (true) {
      // Check for timeout
      if (Date.now() - startTime > timeout) {
        throw new TimeoutError(`Task ${taskId} timed out after ${timeout}ms`);
      }

      const task = await this.get(taskId);

      // Call progress callback if provided
      if (onProgress && task.progress !== undefined) {
        onProgress(task.progress);
      }

      // Check if task is completed
      if (task.status === 'completed') {
        return task;
      }

      // Check if task failed
      if (task.status === 'failed') {
        const errorMessage = (task as any).message || task.error || 'Task failed without error message';
        const error = new Error(`Task ${taskId} failed: ${errorMessage}`);
        (error as any).taskDetails = task;
        throw error;
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  /**
   * Get account information including credits, usage, plan, etc.
   * @returns Account information
   */
  async getAccountInfo(): Promise<AccountInfo> {
    return this.httpClient.get<AccountInfo>('/account');
  }
}

