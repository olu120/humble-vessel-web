// app/api/files/[name]/route.ts
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { name: string } }) {
  const file = await fetch(`https://cms.../${params.name}`);
  const blob = await file.blob();

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
