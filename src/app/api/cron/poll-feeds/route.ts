import { NextResponse, type NextRequest } from "next/server";

import { env } from "~/env";
import { pollAllSources } from "~/server/lib/rss";

export const maxDuration = 60;

/** Vercel Cron target (see vercel.json). Protected by CRON_SECRET. */
export async function GET(req: NextRequest) {
  if (
    env.CRON_SECRET &&
    req.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await pollAllSources();
  return NextResponse.json({
    ok: true,
    ...result,
    at: new Date().toISOString(),
  });
}
