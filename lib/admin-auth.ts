// lib/admin-auth.ts
import { cookies, headers } from "next/headers";

export async function assertAdmin() {
  const tokens = [process.env.RECONCILE_TOKEN, process.env.AUDIT_TOKEN]
    .filter(Boolean) as string[];

  // If no tokens configured, fail hard
  if (tokens.length === 0) {
    const err: any = new Error("Missing admin tokens on server");
    err.statusCode = 401;
    throw err;
  }

  const cookieStore = await cookies();
  const hdrs = await headers();

  const cookieToken = cookieStore.get("hv_admin")?.value || "";
  const headerToken = hdrs.get("x-admin-token") || "";
  const token = cookieToken || headerToken;

  const ok = token && tokens.includes(token);
  if (!ok) {
    const err: any = new Error("Missing or invalid token");
    err.statusCode = 401;
    throw err;
  }
}
