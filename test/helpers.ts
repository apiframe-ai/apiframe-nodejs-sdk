/**
 * Test helpers — mostly an `undici` MockAgent factory that returns a
 * `fetch` wired to it. We intercept at the agent layer rather than
 * monkey-patching `globalThis.fetch` so tests don't leak global state.
 */
import { MockAgent, setGlobalDispatcher } from 'undici';

import { Apiframe } from '../src/index.js';

export const TEST_BASE_URL = 'https://api.test.apiframe.ai';
export const TEST_API_KEY = 'afk_0000000000000000000000000000000000000000';

export interface TestHarness {
  client: Apiframe;
  mockAgent: MockAgent;
  pool: ReturnType<MockAgent['get']>;
}

/**
 * Build an `Apiframe` client wired through a fresh undici MockAgent.
 * Call `harness.mockAgent.close()` in `afterEach` to enforce that every
 * intercept was hit (`disableNetConnect()` makes any unmocked request
 * throw, surfacing accidental real network calls).
 */
export function makeHarness(overrides: Partial<ConstructorParameters<typeof Apiframe>[0]> = {}): TestHarness {
  const mockAgent = new MockAgent();
  mockAgent.disableNetConnect();
  setGlobalDispatcher(mockAgent);

  const pool = mockAgent.get(TEST_BASE_URL);

  const client = new Apiframe({
    apiKey: TEST_API_KEY,
    baseUrl: TEST_BASE_URL,
    timeout: 5_000,
    maxRetries: 0, // tests opt-in to retries explicitly
    // Use the global `fetch` (undici-backed in Node 18+). Global +
    // global `FormData` come from the same undici instance, so
    // multipart bodies encode correctly. Importing `undici`'s `fetch`
    // directly would attach a *different* FormData prototype and
    // silently fall back to `text/plain`.
    ...overrides,
  });

  return { client, mockAgent, pool };
}
