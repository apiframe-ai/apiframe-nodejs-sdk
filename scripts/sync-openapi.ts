/**
 * Sync the OpenAPI spec + regenerate TypeScript types.
 *
 * Reads the spec from one of (in priority order):
 *   1. `--from <path>` CLI arg
 *   2. `APIFRAME_OPENAPI_PATH` env var (a local file path)
 *   3. `APIFRAME_OPENAPI_URL` env var (a custom URL)
 *   4. `https://api.apiframe.ai/v2/openapi.json` (the live production spec)
 *
 * Writes the spec to `openapi.json` (committed to the repo so builds are
 * deterministic without network), then runs `openapi-typescript` to
 * regenerate `src/types/openapi.d.ts`.
 *
 * Examples:
 *   # Pull from prod (default)
 *   npm run sync
 *
 *   # Pull from a local apiframe-v2 checkout (sibling directory)
 *   APIFRAME_OPENAPI_PATH=../apiframe-v2/openapi.json npm run sync
 *
 *   # Pull from a staging deployment
 *   APIFRAME_OPENAPI_URL=https://staging.api.apiframe.ai/v2/openapi.json npm run sync
 *
 *   # One-shot from a path on the CLI
 *   npx tsx scripts/sync-openapi.ts --from ../apiframe-v2/openapi.json
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const OPENAPI_OUT = resolve(ROOT, 'openapi.json');
const TYPES_OUT = resolve(ROOT, 'src/types/openapi.d.ts');

const DEFAULT_PROD_URL = 'https://api.apiframe.ai/v2/openapi.json';

function parseFromArg(argv: string[]): string | undefined {
  const idx = argv.indexOf('--from');
  if (idx === -1 || idx + 1 >= argv.length) return undefined;
  return argv[idx + 1];
}

async function loadSpec(): Promise<{ source: string; spec: unknown }> {
  const fromArg = parseFromArg(process.argv);
  const envPath = process.env.APIFRAME_OPENAPI_PATH;
  const envUrl = process.env.APIFRAME_OPENAPI_URL;

  if (fromArg) {
    const abs = resolve(process.cwd(), fromArg);
    return { source: abs, spec: JSON.parse(readFileSync(abs, 'utf8')) };
  }
  if (envPath) {
    const abs = resolve(process.cwd(), envPath);
    return { source: abs, spec: JSON.parse(readFileSync(abs, 'utf8')) };
  }
  const url = envUrl ?? DEFAULT_PROD_URL;
  console.log(`[sync] fetching ${url}`);
  const res = await fetch(url, {
    headers: { accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return { source: url, spec: await res.json() };
}

function assertOpenApi31(spec: unknown): asserts spec is { openapi: string; info: { title: string; version: string } } {
  if (!spec || typeof spec !== 'object') {
    throw new Error('OpenAPI document is not an object');
  }
  const v = (spec as { openapi?: string }).openapi;
  if (typeof v !== 'string' || !v.startsWith('3.1')) {
    throw new Error(`Expected OpenAPI 3.1.x; got "${v}"`);
  }
}

/**
 * Stable serialization — keys sorted, two-space indent — so the spec
 * file diffs cleanly even when the source has a different key order.
 */
function stableSerialize(value: unknown): string {
  return JSON.stringify(value, (_key, val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(val).sort()) {
        sorted[k] = (val as Record<string, unknown>)[k];
      }
      return sorted;
    }
    return val;
  }, 2) + '\n';
}

async function main() {
  const { source, spec } = await loadSpec();
  assertOpenApi31(spec);

  const info = (spec as { info: { title: string; version: string } }).info;
  console.log(`[sync] loaded ${info.title} v${info.version} from ${source}`);

  const serialized = stableSerialize(spec);
  writeFileSync(OPENAPI_OUT, serialized);
  console.log(`[sync] wrote ${OPENAPI_OUT}`);

  // Regenerate types via the openapi-typescript CLI. We invoke it via
  // `npx --no-install` (it's a devDep) rather than importing programmatically
  // because the CLI gets the formatting / banner config right out of the
  // box.
  console.log('[sync] running openapi-typescript');
  execSync(`npx --no-install openapi-typescript "${OPENAPI_OUT}" -o "${TYPES_OUT}"`, {
    cwd: ROOT,
    stdio: 'inherit',
  });

  console.log(`[sync] wrote ${TYPES_OUT}`);
  console.log('[sync] done.');
}

main().catch((err) => {
  console.error('[sync] FAILED:', err instanceof Error ? err.message : err);
  process.exit(1);
});
