// middleware.ts (project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  if (url.startsWith("/en/admin") || url.startsWith("/lg/admin") || url === "/admin") {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/en/admin/:path*", "/lg/admin/:path*"],
};
