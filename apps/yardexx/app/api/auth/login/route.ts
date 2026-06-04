import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`login:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Te veel pogingen. Probeer over een minuut opnieuw." }, { status: 429 });
  }

  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email en wachtwoord verplicht" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { terminal: true },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Ongeldige inloggegevens" }, { status: 401 });
  }

  if (!user.terminal.verifiedAt) {
    return NextResponse.json(
      { error: "Je terminal wacht nog op verificatie. Je ontvangt een e-mail zodra dit klaar is." },
      { status: 403 }
    );
  }

  const token = await createSession({
    userId: user.id,
    terminalId: user.terminalId,
    email: user.email,
    role: user.role as "admin" | "operator",
  });

  await setSessionCookie(token);
  return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } });
}
