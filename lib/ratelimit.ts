type Hit = { count: number; ts: number };
const mem = new Map<string, Hit>();
const WINDOW_MS = 60_000; // 1 minute
const MAX = 20;

export function allow(ip: string) {
  const now = Date.now();
  const h = mem.get(ip);
  if (!h || now - h.ts > WINDOW_MS) {
    mem.set(ip, { count: 1, ts: now });
    return true;
  }
  if (h.count >= MAX) return false;
  h.count++;
  return true;
}
