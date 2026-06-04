import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendTerminalVerifiedEmail } from "@/lib/email";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { action, userEmail } = await req.json();

  const terminal = await prisma.terminal.findUnique({ where: { id } });
  if (!terminal) return NextResponse.json({ error: "Terminal niet gevonden" }, { status: 404 });

  if (action === "verify") {
    await prisma.terminal.update({ where: { id }, data: { verifiedAt: new Date(), rejectedAt: null } });
    if (userEmail) await sendTerminalVerifiedEmail(userEmail, terminal.name);
  } else if (action === "reject") {
    await prisma.terminal.update({ where: { id }, data: { rejectedAt: new Date(), verifiedAt: null } });
  } else {
    return NextResponse.json({ error: "Ongeldige actie" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
