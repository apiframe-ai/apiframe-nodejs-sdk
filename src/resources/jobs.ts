/**
 * `client.jobs.*` — job lifecycle (`get`, `list`, `waitFor`).
 *
 * `waitFor` is the primary way SDK consumers pick up generation
 * results: it polls `GET /v2/jobs/{id}` with exponential backoff,
 * fires a progress callback as `progress` advances, and resolves with
 * the COMPLETED job (or rejects with the FAILED job's error). All of
 * this composes cleanly with `AbortSignal` — pass one in to cancel a
 * pending wait without leaking the polling timer.
 *
 * The implementation is deliberately simple (single timer, no SSE
 * yet); if Apiframe ever offers a streaming alternative we can flip
 * the body without changing the public API.
 */
import { Resource } from './base.js';
import { TimeoutError, ApiframeError } from '../errors.js';
import type { Job, JobList, JobsListQuery } from '../types/public.js';

export interface WaitForOptions {
  /** Initial polling interval (ms). Default: 2000. */
  intervalMs?: number;
  /** Cap on the polling interval (ms). Default: 5000. */
  maxIntervalMs?: number;
  /** Total time budget (ms). Default: 600_000 (10 minutes). */
  timeoutMs?: number;
  /** Called every poll with the current Job snapshot. */
  onProgress?: (job: Job) => void;
  /** Cancel the wait via this signal. */
  signal?: AbortSignal;
}

export class Jobs extends Resource {
  /** Fetch a single job by id. */
  async get(jobId: string): Promise<Job> {
    return this.http.request<Job>({
      method: 'GET',
      path: `/v2/jobs/${encodeURIComponent(jobId)}`,
    });
  }

  /**
   * Paginated job list. Defaults to your own jobs; admins can pass
   * `scope: 'team'` to see every job in the team.
   */
  async list(query: JobsListQuery = {}): Promise<JobList> {
    return this.http.request<JobList>({
      method: 'GET',
      path: '/v2/jobs',
      query: query as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Poll a job until it reaches a terminal state, then resolve / reject.
   *
   * Resolution: `status === 'COMPLETED'`. The full `Job` is returned,
   * so consumers can read `result`, `creditCost`, etc.
   *
   * Rejection:
   *   - `status === 'FAILED'` — `ApiframeError(message: job.error)`.
   *   - `status === 'CANCELLED'` — `ApiframeError('Job was cancelled')`.
   *   - Time budget exhausted — `TimeoutError`.
   *   - `signal.aborted` — `ApiframeError('Wait was aborted')`.
   *
   * @example
   * const finished = await client.jobs.waitFor(jobId, {
   *   onProgress: (j) => console.log(`${j.progress ?? 0}%`),
   *   timeoutMs: 600_000,
   * });
   * console.log(finished.result);
   */
  async waitFor(jobId: string, options: WaitForOptions = {}): Promise<Job> {
    const intervalMs = options.intervalMs ?? 2000;
    const maxIntervalMs = options.maxIntervalMs ?? 5000;
    const timeoutMs = options.timeoutMs ?? 600_000;
    const onProgress = options.onProgress;
    const signal = options.signal;

    const startedAt = Date.now();
    let currentInterval = intervalMs;

    while (true) {
      if (signal?.aborted) {
        throw new ApiframeError('Wait was aborted', { status: 0, cause: signal.reason });
      }
      const remaining = timeoutMs - (Date.now() - startedAt);
      if (remaining <= 0) {
        throw new TimeoutError(`waitFor timed out after ${timeoutMs}ms`);
      }

      const job = await this.get(jobId);
      onProgress?.(job);

      if (job.status === 'COMPLETED') return job;
      if (job.status === 'FAILED') {
        throw new ApiframeError(job.error ?? 'Job failed', {
          status: 0,
          body: job,
        });
      }
      if (job.status === 'CANCELLED') {
        throw new ApiframeError('Job was cancelled', { status: 0, body: job });
      }

      // Wait, then bump the interval until we hit the cap.
      const sleepMs = Math.min(currentInterval, remaining);
      await waitInterruptible(sleepMs, signal);
      currentInterval = Math.min(maxIntervalMs, Math.floor(currentInterval * 1.5));
    }
  }
}

/**
 * `setTimeout` wrapped in a Promise that rejects when `signal` aborts,
 * so a `waitFor` call can be cancelled mid-sleep without leaking the
 * timer.
 */
function waitInterruptible(ms: number, signal: AbortSignal | undefined): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
    const onAbort = () => {
      cleanup();
      reject(new ApiframeError('Wait was aborted', { status: 0, cause: signal?.reason }));
    };
    function cleanup() {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
    if (signal?.aborted) {
      cleanup();
      reject(new ApiframeError('Wait was aborted', { status: 0, cause: signal.reason }));
      return;
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
