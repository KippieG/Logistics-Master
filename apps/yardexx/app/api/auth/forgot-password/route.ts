import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit } from "@/lib/ratelimit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`reset:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Te veel pogingen." }, { status: 429 });
  }

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "E-mail verplicht" }, { status: 400 });

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await sendPasswordResetEmail(user.email, `${appUrl}/auth/reset-password?token=${token}`);
  }

  return NextResponse.json({ message: "Als dit e-mailadres bij ons bekend is, ontvang je een resetlink." });
}
