// app/api/files/[name]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ name: string }> }
) {
  // 👇 Next 15 passes params as a Promise
  const { name } = await ctx.params;

  // Fetch from your CMS (encode to be safe)
  const upstream = await fetch(
    `https://cms.humblevesselfoundationandclinic.org/wp-content/uploads/${encodeURIComponent(
      name
    )}`,
    // We control caching via response headers; don't let Next cache the fetch result
    { cache: "no-store" }
  );

  if (!upstream.ok) {
    return NextResponse.json(
      { ok: false, error: `Upstream fetch failed: ${upstream.status}` },
      { status: upstream.status }
    );
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream";
  const buf = await upstream.arrayBuffer();

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // Long-lived CDN/browser cache for static files
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
