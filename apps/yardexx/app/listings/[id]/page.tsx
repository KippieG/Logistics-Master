import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CAPACITY_TYPE_ICONS, CAPACITY_TYPE_LABELS, REGION_LABELS, REGION_FLAG, type CapacityType, type Region } from "@/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import RequestButton from "./RequestButton";

export const dynamic = "force-dynamic";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true, side: true, capacityType: true, region: true,
      volumeM2: true, pricePerM2PerDay: true, availableFrom: true,
      availableTo: true, status: true, description: true, createdAt: true, terminalId: true,
    },
  });

  if (!listing) notFound();

  const [similar, existingRequest] = await Promise.all([
    prisma.listing.findMany({
      where: {
        id: { not: id },
        capacityType: listing.capacityType,
        status: "active",
        region: listing.region,
      },
      take: 3,
      orderBy: { createdAt: "desc" },
      select: { id: true, side: true, volumeM2: true, pricePerM2PerDay: true, region: true, capacityType: true, availableFrom: true, availableTo: true },
    }),
    session ? prisma.matchRequest.findUnique({
      where: { listingId_requestingTerminalId: { listingId: id, requestingTerminalId: session.terminalId } },
    }) : null,
  ]);

  const isOwner = session?.terminalId === listing.terminalId;
  const days = Math.max(1, Math.ceil((new Date(listing.availableTo).getTime() - new Date(listing.availableFrom).getTime()) / 86400000));
  const maxRevenue = (listing.volumeM2 * listing.pricePerM2PerDay * days).toLocaleString("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const statusColor = { active: "#00c9a7", matched: "#3b82f6", closed: "#8a96a8", expired: "#f97316" };
  const statusLabel = { active: "Actief", matched: "Gematcht", closed: "Gesloten", expired: "Verlopen" };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f4f6f9", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#0a1628", padding: "1rem 5%" }}>
        <Link href="/marketplace" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none", fontSize: ".85rem" }}>← Marketplace</Link>
      </div>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "2rem 5%" }}>
        {/* Hero */}
        <div style={{ background: "#0a1628", borderRadius: "20px", padding: "2rem", marginBottom: "1.5rem", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".5rem" }}>
                <span style={{ fontSize: "1.75rem" }}>{CAPACITY_TYPE_ICONS[listing.capacityType as CapacityType]}</span>
                <span style={{ color: "#00c9a7", fontSize: ".78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                  {CAPACITY_TYPE_LABELS[listing.capacityType as CapacityType]}
                </span>
              </div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 900, letterSpacing: "-1px", margin: "0 0 .25rem" }}>
                {listing.volumeM2.toLocaleString("nl-BE")} m²
              </h1>
              <p style={{ color: "rgba(255,255,255,.5)", margin: 0 }}>
                {REGION_FLAG[listing.region as Region]} {REGION_LABELS[listing.region as Region]}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", alignItems: "flex-end" }}>
              <span style={{ padding: ".4rem .9rem", borderRadius: "8px", fontSize: ".85rem", fontWeight: 700, background: listing.side === "offer" ? "rgba(0,201,167,.15)" : "rgba(59,130,246,.15)", color: listing.side === "offer" ? "#00c9a7" : "#60a5fa" }}>
                {listing.side === "offer" ? "Aanbod" : "Vraag"}
              </span>
              <span style={{ padding: ".3rem .7rem", borderRadius: "6px", fontSize: ".75rem", fontWeight: 600, background: "rgba(255,255,255,.06)", color: statusColor[listing.status as keyof typeof statusColor] }}>
                {statusLabel[listing.status as keyof typeof statusLabel]}
              </span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
            {[{ label: "Prijs", value: `€${listing.pricePerM2PerDay}/m²/dag` }, { label: "Duur", value: `${days} dagen` }, { label: "Max. waarde", value: maxRevenue }].map(({ label, value }) => (
              <div key={label} style={{ background: "rgba(255,255,255,.05)", borderRadius: "12px", padding: "1rem" }}>
                <p style={{ fontSize: ".7rem", color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".5px", margin: "0 0 .25rem" }}>{label}</p>
                <p style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "1.75rem", marginBottom: "1.5rem", border: "1px solid #e8edf4" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0a1628", margin: "0 0 1.25rem" }}>Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem" }}>
            {[
              { label: "Beschikbaar van", value: new Date(listing.availableFrom).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" }) },
              { label: "Beschikbaar tot", value: new Date(listing.availableTo).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" }) },
              { label: "Volume", value: `${listing.volumeM2.toLocaleString("nl-BE")} m²` },
              { label: "Prijs per m² per dag", value: `€${listing.pricePerM2PerDay}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: ".75rem", color: "#8a96a8", margin: "0 0 .25rem" }}>{label}</p>
                <p style={{ fontSize: ".95rem", fontWeight: 700, color: "#0a1628", margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
          {listing.description && (
            <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid #f4f6f9" }}>
              <p style={{ fontSize: ".75rem", color: "#8a96a8", margin: "0 0 .5rem" }}>Omschrijving</p>
              <p style={{ fontSize: ".9rem", color: "#4a5568", lineHeight: 1.6, margin: 0 }}>{listing.description}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        {isOwner ? (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", border: "1px solid #e8edf4", textAlign: "center", marginBottom: "1.5rem" }}>
            <p style={{ color: "#8a96a8", fontSize: ".9rem", margin: "0 0 1rem" }}>Dit is jouw eigen listing.</p>
            <Link href="/dashboard" style={{ background: "#0a1628", color: "#fff", padding: ".8rem 1.75rem", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: ".9rem" }}>
              Beheer in dashboard →
            </Link>
          </div>
        ) : (
          <div style={{ background: "#0a1628", borderRadius: "16px", padding: "2rem", color: "#fff", textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: ".75rem" }}>🔒</div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 .5rem" }}>Volledig anoniem tot de deal gesloten is</h3>
            <p style={{ fontSize: ".85rem", color: "rgba(255,255,255,.5)", margin: "0 0 1.75rem", lineHeight: 1.6 }}>
              Jouw identiteit wordt nooit automatisch gedeeld. Na een deal kan je <strong>zelf kiezen</strong> of je je gegevens wil onthullen.
            </p>
            {session ? (
              listing.status === "active" ? (
                <RequestButton listingId={listing.id} side={listing.side as "offer" | "demand"} existingStatus={existingRequest?.status} />
              ) : (
                <p style={{ color: "#00c9a7", fontWeight: 600 }}>Deze listing is niet meer beschikbaar.</p>
              )
            ) : (
              <Link href={`/auth?from=/listings/${listing.id}`} style={{ display: "block", background: "#00c9a7", color: "#0a1628", padding: "1rem 2rem", borderRadius: "12px", fontWeight: 700, textDecoration: "none" }}>
                Inloggen om te reageren →
              </Link>
            )}
          </div>
        )}

        {/* Similar listings */}
        {similar.length > 0 && (
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0a1628", margin: "0 0 1rem" }}>
              Gelijkaardige listings
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
              {similar.map((s) => (
                <Link key={s.id} href={`/listings/${s.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: "14px", padding: "1.25rem", border: "1px solid #e8edf4" }}>
                    <p style={{ fontWeight: 700, color: "#0a1628", fontSize: ".88rem", margin: "0 0 .35rem" }}>
                      {CAPACITY_TYPE_ICONS[s.capacityType as CapacityType]} {s.volumeM2.toLocaleString("nl-BE")} m²
                    </p>
                    <p style={{ fontSize: ".8rem", color: "#4a5568", margin: "0 0 .35rem" }}>€{s.pricePerM2PerDay}/m²/dag</p>
                    <span style={{ fontSize: ".72rem", fontWeight: 700, color: s.side === "offer" ? "#009e84" : "#3b82f6" }}>
                      {s.side === "offer" ? "Aanbod" : "Vraag"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
