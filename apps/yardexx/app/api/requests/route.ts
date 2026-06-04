import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendNewRequestEmail } from "@/lib/email";
import { CAPACITY_TYPE_LABELS, REGION_LABELS, type CapacityType, type Region } from "@/types";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const requests = await prisma.matchRequest.findMany({
    where: {
      OR: [
        { listing: { terminalId: session.terminalId } },
        { requestingTerminalId: session.terminalId },
      ],
    },
    include: {
      listing: {
        select: { id: true, capacityType: true, region: true, volumeM2: true, side: true, terminalId: true },
      },
      requestingTerminal: {
        select: { id: true, name: true, region: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { listingId, message } = await req.json();
  if (!listingId) return NextResponse.json({ error: "listingId verplicht" }, { status: 400 });

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      terminal: { include: { users: { select: { email: true } } } },
    },
  });

  if (!listing) return NextResponse.json({ error: "Listing niet gevonden" }, { status: 404 });
  if (listing.status !== "active") return NextResponse.json({ error: "Listing niet meer actief" }, { status: 409 });
  if (listing.terminalId === session.terminalId) {
    return NextResponse.json({ error: "Je kan niet reageren op je eigen listing" }, { status: 400 });
  }

  const existing = await prisma.matchRequest.findUnique({
    where: { listingId_requestingTerminalId: { listingId, requestingTerminalId: session.terminalId } },
  });
  if (existing && existing.status !== "cancelled") {
    return NextResponse.json({ error: "Je hebt al een aanvraag voor deze listing" }, { status: 409 });
  }

  const matchRequest = existing
    ? await prisma.matchRequest.update({
        where: { id: existing.id },
        data: { status: "pending", message: message?.trim() || null },
      })
    : await prisma.matchRequest.create({
        data: {
          listingId,
          requestingTerminalId: session.terminalId,
          message: message?.trim() || null,
        },
      });

  // Email the listing owner
  const ownerEmail = listing.terminal.users[0]?.email;
  if (ownerEmail) {
    await sendNewRequestEmail(ownerEmail, {
      capacityType: CAPACITY_TYPE_LABELS[listing.capacityType as CapacityType],
      region: REGION_LABELS[listing.region as Region],
      volumeM2: listing.volumeM2,
    });
  }

  return NextResponse.json(matchRequest, { status: 201 });
}
