const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Resolve backend-relative upload path (e.g. uploads/profiles/…) to a browser URL. */
export function uploadPublicUrl(path: string | null | undefined): string | null {
  const p = path?.trim();
  if (!p) return null;
  if (p.startsWith("http")) return p;
  return `${API_URL.replace(/\/$/, "")}/${p.replace(/^\//, "")}`;
}
