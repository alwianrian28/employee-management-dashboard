import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { upstreamFetch } from "@/lib/server/upstreamFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ detail: "no session" }, { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await upstreamFetch(`${API_URL}/api/admin/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return NextResponse.json(
      { detail: "Tidak dapat terhubung ke API (timeout atau jaringan)" },
      { status: 503 },
    );
  }

  let data: unknown;
  try {
    data = await upstream.json();
  } catch {
    data = { detail: "Respons API tidak valid" };
  }
  return NextResponse.json(data, { status: upstream.status });
}
