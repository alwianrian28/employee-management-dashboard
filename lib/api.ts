const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
  }
}

function toSafeUserMessage(status: number, rawDetail: string): string {
  if (status >= 500) return "Terjadi gangguan server. Silakan coba lagi beberapa saat.";
  if (status === 401) return "Sesi berakhir atau belum login. Silakan login kembali.";
  if (status === 403) return "Anda tidak memiliki izin untuk aksi ini.";
  if (status === 404) return "Data atau endpoint tidak ditemukan.";
  if (!rawDetail) return "Terjadi kesalahan saat memproses permintaan.";
  if (rawDetail.length > 220) return "Terjadi kesalahan pada permintaan. Silakan coba lagi.";
  return rawDetail;
}

type FetchOpts = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

export async function apiFetch<T = unknown>(
  path: string,
  opts: FetchOpts = {},
): Promise<T> {
  const { body, query, headers, ...rest } = opts;
  let url = `${API_URL}${path}`;
  if (query) {
    const usp = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) usp.set(k, String(v));
    });
    const qs = usp.toString();
    if (qs) url += `?${qs}`;
  }

  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(headers || {}),
  };

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      detail = j.detail || j.message || detail;
    } catch {}
    throw new ApiError(res.status, toSafeUserMessage(res.status, detail));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Same-origin admin client — Next.js proxy at /api/admin/[...path] forwards
// the httpOnly cookie token to FastAPI.
async function _proxyFetch<T>(
  path: string,
  init: { method?: string; body?: unknown; query?: FetchOpts["query"] } = {},
): Promise<T> {
  const { method = "GET", body, query } = init;
  let url = `/api/admin${path}`;
  if (query) {
    const usp = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) usp.set(k, String(v));
    });
    const qs = usp.toString();
    if (qs) url += `?${qs}`;
  }
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      detail = j.detail || j.message || detail;
    } catch {}
    throw new ApiError(res.status, toSafeUserMessage(res.status, detail));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const adminApi = {
  get: <T>(path: string, query?: FetchOpts["query"]) =>
    _proxyFetch<T>(path, { query }),
  post: <T>(path: string, body?: unknown) =>
    _proxyFetch<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    _proxyFetch<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => _proxyFetch<T>(path, { method: "DELETE" }),
};

/** Multipart upload via dashboard cookie proxy (profile photo or SIM scan). */
export async function adminUploadDocument(
  kind: "profile" | "sim",
  file: File,
): Promise<{ path: string }> {
  const fd = new FormData();
  fd.append("kind", kind);
  fd.append("file", file);
  const res = await fetch("/api/admin/uploads/document", {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = (await res.json()) as { detail?: string; message?: string };
      detail = j.detail || j.message || detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, toSafeUserMessage(res.status, detail));
  }
  return (await res.json()) as { path: string };
}
