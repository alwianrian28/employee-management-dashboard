import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function extractSessionToken(setCookie: string | null): string | null {
  if (!setCookie) return null;
  const m = /(?:^|,\s*)session_id=([^;]+)/.exec(setCookie);
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const upstream = await fetch(`${API_URL}/api/qr-login/complete/${token}`, {
    redirect: "manual",
    cache: "no-store",
  });

  const sessionToken = extractSessionToken(upstream.headers.get("set-cookie"));
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login?error=qr", req.url));
  }

  const res = NextResponse.redirect(new URL("/overview", req.url));
  res.cookies.set({
    name: "auth_token",
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
