// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SUPPORTED = new Set(["en", "lg"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect root → /en
  if (pathname === "/" || pathname === "") {
    const url = req.nextUrl.clone();
    url.pathname = "/en";
    return NextResponse.redirect(url);
  }

  // Handle non-locale routes → prefix with /en
  const seg = pathname.split("/")[1] || "";
  if (!SUPPORTED.has(seg)) {
    const url = req.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|images/.*|api/.*).*)"],
};
