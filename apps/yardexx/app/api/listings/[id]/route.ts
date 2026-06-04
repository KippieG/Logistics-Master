import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true, side: true, capacityType: true, region: true,
      volumeM2: true, pricePerM2PerDay: true,
      availableFrom: true, availableTo: true,
      status: true, description: true, createdAt: true, terminalId: true,
    },
  });

  if (!listing) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json(listing);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  if (listing.terminalId !== session.terminalId && session.role !== "admin") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.listing.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.pricePerM2PerDay !== undefined && { pricePerM2PerDay: Number(body.pricePerM2PerDay) }),
      ...(body.availableFrom !== undefined && { availableFrom: new Date(body.availableFrom) }),
      ...(body.availableTo !== undefined && { availableTo: new Date(body.availableTo) }),
      ...(body.volumeM2 !== undefined && { volumeM2: Number(body.volumeM2) }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  if (listing.terminalId !== session.terminalId && session.role !== "admin") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  await prisma.listing.update({ where: { id }, data: { status: "closed" } });
  return NextResponse.json({ ok: true });
}
