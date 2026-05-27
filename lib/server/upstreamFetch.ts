const DEFAULT_MS = 12_000;

/** Fetch ke FastAPI dengan batas waktu agar route handler Next tidak menggantung tanpa batas. */
export async function upstreamFetch(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(t);
  }
}
