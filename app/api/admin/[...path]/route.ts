import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function proxy(req: Request, params: { path: string[] }) {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const search = new URL(req.url).search;
  const url = `${API_URL}/api/admin/${params.path.join("/")}${search}`;
  const method = req.method;
  const ct = req.headers.get("content-type") || "";

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  let body: BodyInit | undefined;
  if (method === "GET" || method === "HEAD") {
    body = undefined;
  } else if (ct.includes("multipart/form-data")) {
    headers["Content-Type"] = ct;
    body = await req.arrayBuffer();
  } else {
    headers["Content-Type"] = "application/json";
    body = ["PATCH", "PUT", "POST", "DELETE"].includes(method)
      ? await req.text()
      : undefined;
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, { method, headers, body });
  } catch {
    return NextResponse.json(
      { detail: "Backend tidak tersedia. Coba beberapa saat lagi." },
      { status: 503 },
    );
  }

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("Content-Type") || "application/json",
    },
  });
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, await ctx.params);
}
export async function POST(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, await ctx.params);
}
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, await ctx.params);
}
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, await ctx.params);
}
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, await ctx.params);
}
