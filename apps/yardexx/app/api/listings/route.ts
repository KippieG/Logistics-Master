import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { CapacityType, ListingSide, Region } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const where: Record<string, unknown> = { status: "active" };
  if (searchParams.get("type")) where.capacityType = searchParams.get("type");
  if (searchParams.get("region")) where.region = searchParams.get("region");
  if (searchParams.get("side")) where.side = searchParams.get("side");
  if (searchParams.get("status")) where.status = searchParams.get("status");

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      side: true,
      capacityType: true,
      region: true,
      volumeM2: true,
      pricePerM2PerDay: true,
      availableFrom: true,
      availableTo: true,
      status: true,
      description: true,
      createdAt: true,
      // Never expose terminalId or terminal name in public listing list
    },
  });

  return NextResponse.json(listings);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { side, capacityType, region, volumeM2, pricePerM2PerDay, availableFrom, availableTo, description } =
    await req.json();

  if (!side || !capacityType || !region || !volumeM2 || !pricePerM2PerDay || !availableFrom || !availableTo) {
    return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
  }

  if (new Date(availableTo) <= new Date(availableFrom)) {
    return NextResponse.json({ error: "Einddatum moet na begindatum liggen" }, { status: 400 });
  }

  const listing = await prisma.listing.create({
    data: {
      terminalId: session.terminalId,
      side: side as ListingSide,
      capacityType: capacityType as CapacityType,
      region: region as Region,
      volumeM2: Number(volumeM2),
      pricePerM2PerDay: Number(pricePerM2PerDay),
      availableFrom: new Date(availableFrom),
      availableTo: new Date(availableTo),
      description: description?.trim() || null,
    },
  });

  return NextResponse.json(listing, { status: 201 });
}
