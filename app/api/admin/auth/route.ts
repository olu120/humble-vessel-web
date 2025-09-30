// app/api/admin/auth/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = (url.searchParams.get("token") || "").trim();
    const redirectTo = url.searchParams.get("redirect") || "/";

    // Build absolute redirect URL (fixes edge cases in dev/preview)
    const redirectAbs = new URL(redirectTo, url.origin);

    const tokens = [process.env.RECONCILE_TOKEN, process.env.AUDIT_TOKEN]
      .filter(Boolean) as string[];

    if (tokens.length === 0) {
      // Misconfiguration: no tokens in env
      return NextResponse.json(
        { ok: false, error: "No admin tokens configured on server." },
        { status: 500 }
      );
    }

    if (!token) {
      // Missing token in query
      return NextResponse.json(
        { ok: false, error: "Missing ?token=" },
        { status: 400 }
      );
    }

    const valid = tokens.includes(token);
    // Always redirect back to the target page, even if invalid;
    // only set the cookie when valid.
    const res = NextResponse.redirect(redirectAbs);

    if (valid) {
      res.cookies.set("hv_admin", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });
    }

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Auth route failed" },
      { status: 500 }
    );
  }
}
