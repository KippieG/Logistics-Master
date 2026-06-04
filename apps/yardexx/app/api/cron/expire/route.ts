import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called by Vercel Cron (configure in vercel.json) or any external scheduler
// Protect with a secret to prevent unauthorized calls
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const { count } = await prisma.listing.updateMany({
    where: { status: "active", availableTo: { lt: now } },
    data: { status: "expired" },
  });

  return NextResponse.json({ expired: count, at: now.toISOString() });
}
