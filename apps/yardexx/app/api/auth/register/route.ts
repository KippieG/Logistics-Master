import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendTerminalRegisteredEmail } from "@/lib/email";
import type { Region } from "@prisma/client";

export async function POST(req: NextRequest) {
  const { email, password, terminalName, region, contactName, contactPhone } = await req.json();

  if (!email || !password || !terminalName || !region) {
    return NextResponse.json({ error: "Alle verplichte velden invullen" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Wachtwoord moet minimaal 8 tekens zijn" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    return NextResponse.json({ error: "Dit e-mailadres is al geregistreerd" }, { status: 409 });
  }

  const terminal = await prisma.terminal.create({
    data: {
      name: terminalName.trim(),
      region: region as Region,
      contactName: contactName?.trim() || null,
      contactPhone: contactPhone?.trim() || null,
      verifiedAt: null,
    },
  });

  await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      password: await bcrypt.hash(password, 12),
      role: "operator",
      terminalId: terminal.id,
    },
  });

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@yardexx.com";
  await sendTerminalRegisteredEmail(adminEmail, {
    terminalName: terminal.name,
    region: terminal.region,
    userEmail: email,
  });

  return NextResponse.json(
    { message: `Registratie ontvangen voor ${terminalName}. We verifiëren je terminal binnen 24 uur en sturen een bevestigingsmail naar ${email}.` },
    { status: 201 }
  );
}
