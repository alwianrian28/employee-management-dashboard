import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST() {
  const token = (await cookies()).get("auth_token")?.value;
  if (token) {
    await fetch(`${API_URL}/api/admin/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("auth_token");
  return res;
}
