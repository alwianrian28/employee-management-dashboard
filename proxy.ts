import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hasAuth = req.cookies.has("auth_token");
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!hasAuth && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (hasAuth && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/karyawan";
    return NextResponse.redirect(url);
  }
  if (hasAuth && pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/karyawan";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
