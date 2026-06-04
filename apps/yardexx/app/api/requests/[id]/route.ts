import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendRequestAcceptedEmail, sendDealConfirmedToOwnerEmail } from "@/lib/email";
import { CAPACITY_TYPE_LABELS, REGION_LABELS, type CapacityType, type Region } from "@/types";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { action } = await req.json();
  if (!["accept", "reject", "cancel"].includes(action)) {
    return NextResponse.json({ error: "Ongeldige actie" }, { status: 400 });
  }

  const matchReq = await prisma.matchRequest.findUnique({
    where: { id },
    include: {
      listing: {
        include: {
          terminal: { include: { users: { select: { email: true } } } },
        },
      },
      requestingTerminal: {
        include: { users: { select: { email: true } } },
      },
    },
  });

  if (!matchReq) return NextResponse.json({ error: "Aanvraag niet gevonden" }, { status: 404 });

  const isListingOwner = matchReq.listing.terminalId === session.terminalId;
  const isRequester = matchReq.requestingTerminalId === session.terminalId;

  if (action === "cancel" && !isRequester) {
    return NextResponse.json({ error: "Alleen de aanvrager kan annuleren" }, { status: 403 });
  }
  if ((action === "accept" || action === "reject") && !isListingOwner) {
    return NextResponse.json({ error: "Alleen de eigenaar van de listing kan reageren" }, { status: 403 });
  }

  const statusMap = { accept: "accepted", reject: "rejected", cancel: "cancelled" } as const;
  const newStatus = statusMap[action as keyof typeof statusMap];

  const updated = await prisma.matchRequest.update({
    where: { id },
    data: {
      status: newStatus,
      identitiesRevealedAt: newStatus === "accepted" ? new Date() : undefined,
    },
  });

  if (newStatus === "accepted") {
    // Mark listing as matched
    await prisma.listing.update({ where: { id: matchReq.listingId }, data: { status: "matched" } });

    const listingInfo = {
      capacityType: CAPACITY_TYPE_LABELS[matchReq.listing.capacityType as CapacityType],
      region: REGION_LABELS[matchReq.listing.region as Region],
      volumeM2: matchReq.listing.volumeM2,
    };

    const ownerEmail = matchReq.listing.terminal.users[0]?.email;
    const requesterEmail = matchReq.requestingTerminal.users[0]?.email;

    // Email requester: deal accepted + owner info
    if (requesterEmail && ownerEmail) {
      await sendRequestAcceptedEmail(requesterEmail, {
        listing: listingInfo,
        partnerTerminalName: matchReq.listing.terminal.name,
        partnerEmail: ownerEmail,
      });
    }

    // Email owner: deal confirmed + requester info
    if (ownerEmail && requesterEmail) {
      await sendDealConfirmedToOwnerEmail(ownerEmail, {
        listing: listingInfo,
        partnerTerminalName: matchReq.requestingTerminal.name,
        partnerEmail: requesterEmail,
      });
    }
  }

  return NextResponse.json(updated);
}
