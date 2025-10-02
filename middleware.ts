// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SUPPORTED = new Set(["en", "lg"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // If user hits "/" -> send them to "/en"
  if (pathname === "/" || pathname === "") {
    const url = req.nextUrl.clone();
    url.pathname = "/en";
    return NextResponse.redirect(url);
  }

  // If first segment isn’t a supported locale, rewrite to /en + original path
  const seg = pathname.split("/")[1] || "";
  if (!SUPPORTED.has(seg)) {
    const url = req.nextUrl.clone();
    url.pathname = `/en${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// Don’t run middleware for static assets or API routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|images/.*|api/.*).*)",
  ],
};
