import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const req = await prisma.matchRequest.findUnique({
    where: { id },
    include: { listing: true },
  });

  if (!req) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  if (req.status !== "accepted") return NextResponse.json({ error: "Alleen na een geaccepteerde deal" }, { status: 400 });

  const isOwner = req.listing.terminalId === session.terminalId;
  const isRequester = req.requestingTerminalId === session.terminalId;

  if (!isOwner && !isRequester) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const updated = await prisma.matchRequest.update({
    where: { id },
    data: isOwner ? { ownerRevealed: true } : { requesterRevealed: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const req = await prisma.matchRequest.findUnique({
    where: { id },
    include: { listing: true },
  });

  if (!req) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const isOwner = req.listing.terminalId === session.terminalId;
  const isRequester = req.requestingTerminalId === session.terminalId;
  if (!isOwner && !isRequester) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const updated = await prisma.matchRequest.update({
    where: { id },
    data: isOwner ? { ownerRevealed: false } : { requesterRevealed: false },
  });

  return NextResponse.json(updated);
}
