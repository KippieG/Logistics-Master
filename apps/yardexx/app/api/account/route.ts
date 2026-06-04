import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { terminal: true },
  });
  if (!user) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  return NextResponse.json({
    email: user.email,
    terminal: {
      id: user.terminal.id,
      name: user.terminal.name,
      region: user.terminal.region,
      vatNumber: user.terminal.vatNumber,
      contactName: user.terminal.contactName,
      contactPhone: user.terminal.contactPhone,
      website: user.terminal.website,
      verifiedAt: user.terminal.verifiedAt,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await req.json();
  const { terminalName, vatNumber, contactName, contactPhone, website, currentPassword, newPassword } = body;

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: "Huidig wachtwoord verplicht" }, { status: 400 });
    if (newPassword.length < 8) return NextResponse.json({ error: "Nieuw wachtwoord minimaal 8 tekens" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return NextResponse.json({ error: "Huidig wachtwoord incorrect" }, { status: 401 });
    }
    await prisma.user.update({
      where: { id: session.userId },
      data: { password: await bcrypt.hash(newPassword, 12) },
    });
  }

  await prisma.terminal.update({
    where: { id: session.terminalId },
    data: {
      ...(terminalName && { name: terminalName.trim() }),
      ...(vatNumber !== undefined && { vatNumber: vatNumber?.trim() || null }),
      ...(contactName !== undefined && { contactName: contactName?.trim() || null }),
      ...(contactPhone !== undefined && { contactPhone: contactPhone?.trim() || null }),
      ...(website !== undefined && { website: website?.trim() || null }),
    },
  });

  return NextResponse.json({ ok: true });
}
