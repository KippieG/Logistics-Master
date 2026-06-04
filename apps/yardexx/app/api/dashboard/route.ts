import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const [terminal, listings, incoming, outgoing] = await Promise.all([
    prisma.terminal.findUnique({ where: { id: session.terminalId } }),

    prisma.listing.findMany({
      where: { terminalId: session.terminalId },
      orderBy: { createdAt: "desc" },
    }),

    prisma.matchRequest.findMany({
      where: {
        listing: { terminalId: session.terminalId },
        requestingTerminalId: { not: session.terminalId },
      },
      include: {
        listing: { select: { id: true, capacityType: true, region: true, volumeM2: true } },
        requestingTerminal: { select: { name: true, region: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.matchRequest.findMany({
      where: { requestingTerminalId: session.terminalId },
      include: {
        listing: { select: { id: true, capacityType: true, region: true, volumeM2: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    terminal,
    listings,
    incomingRequests: incoming,
    outgoingRequests: outgoing,
    stats: {
      activeListings: listings.filter((l) => l.status === "active").length,
      matchedListings: listings.filter((l) => l.status === "matched").length,
      pendingIncoming: incoming.filter((r) => r.status === "pending").length,
      acceptedDeals: [...incoming, ...outgoing].filter((r) => r.status === "accepted").length,
    },
  });
}
