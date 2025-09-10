import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
const LOCALES = ['en','lg'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static files and Next internals
  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/images')
  ) {
    return;
  }

  // If the URL already has a locale, continue
  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return;

  // Otherwise, redirect to default locale (/en + original path)
  const url = req.nextUrl.clone();
  url.pathname = `/en${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}
