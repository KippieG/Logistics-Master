import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  CAPACITY_TYPE_ICONS, CAPACITY_TYPE_LABELS, REGION_LABELS, REGION_FLAG,
  MATCH_STATUS_LABELS, MATCH_STATUS_COLORS, STATUS_LABELS, STATUS_COLORS,
  type CapacityType, type Region, type MatchStatus, type ListingStatus,
} from "@/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import RequestActions from "./RequestActions";
import RevealButton from "./RevealButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth");

  const [terminal, listings, incoming, outgoing] = await Promise.all([
    prisma.terminal.findUnique({ where: { id: session.terminalId } }),

    prisma.listing.findMany({
      where: { terminalId: session.terminalId },
      orderBy: { createdAt: "desc" },
    }),

    prisma.matchRequest.findMany({
      where: { listing: { terminalId: session.terminalId }, requestingTerminalId: { not: session.terminalId } },
      include: {
        listing: { select: { id: true, capacityType: true, region: true, volumeM2: true, side: true } },
        requestingTerminal: { include: { users: { select: { email: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.matchRequest.findMany({
      where: { requestingTerminalId: session.terminalId },
      include: {
        listing: {
          include: {
            terminal: { include: { users: { select: { email: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const stats = [
    { label: "Actieve listings", value: listings.filter((l) => l.status === "active").length, color: "#00c9a7" },
    { label: "Gematchte deals", value: listings.filter((l) => l.status === "matched").length, color: "#3b82f6" },
    { label: "Nieuwe aanvragen", value: incoming.filter((r) => r.status === "pending").length, color: "#f97316" },
    { label: "Deals afgerond", value: [...incoming, ...outgoing].filter((r) => r.status === "accepted").length, color: "#8b5cf6" },
  ];

  async function closeListing(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.listing.update({ where: { id }, data: { status: "closed" } });
    revalidatePath("/dashboard");
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f4f6f9", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0a1628", padding: "2rem 5%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <p style={{ color: terminal?.verifiedAt ? "#00c9a7" : "#f97316", fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 .25rem" }}>
              {terminal?.verifiedAt ? "✓ Geverifieerde terminal" : "⏳ Verificatie in behandeling"}
            </p>
            <h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-.5px", margin: 0 }}>
              {terminal?.name ?? "Dashboard"}
            </h1>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: ".82rem", margin: ".25rem 0 0" }}>
              {terminal && REGION_FLAG[terminal.region as Region]} {terminal && REGION_LABELS[terminal.region as Region]} · {session.email}
            </p>
          </div>
          <div style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap" }}>
            {session.role === "admin" && (
              <Link href="/admin/terminals" style={{ color: "#f97316", textDecoration: "none", fontSize: ".8rem", fontWeight: 700, background: "rgba(249,115,22,.1)", padding: ".4rem .85rem", borderRadius: "8px" }}>
                Admin →
              </Link>
            )}
            <Link href="/account" style={{ color: "rgba(255,255,255,.6)", textDecoration: "none", fontSize: ".8rem", background: "rgba(255,255,255,.06)", padding: ".4rem .85rem", borderRadius: "8px" }}>
              Account
            </Link>
            <Link href="/listings/new" style={{ background: "#00c9a7", color: "#0a1628", padding: ".65rem 1.25rem", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: ".88rem" }}>
              + Nieuwe listing
            </Link>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: ".75rem" }}>
          {stats.map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,.05)", borderRadius: "12px", padding: ".9rem 1.1rem" }}>
              <span style={{ fontSize: "1.75rem", fontWeight: 900, color, display: "block" }}>{value}</span>
              <span style={{ fontSize: ".72rem", color: "rgba(255,255,255,.4)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "2rem 5%", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* Incoming */}
        {incoming.length > 0 && (
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0a1628", margin: "0 0 1rem" }}>
              Binnenkomende aanvragen
              {incoming.filter((r) => r.status === "pending").length > 0 && (
                <span style={{ marginLeft: ".5rem", background: "#f97316", color: "#fff", borderRadius: "999px", padding: ".15rem .5rem", fontSize: ".72rem" }}>
                  {incoming.filter((r) => r.status === "pending").length}
                </span>
              )}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
              {incoming.map((req) => (
                <div key={req.id} style={{ background: "#fff", borderRadius: "14px", padding: "1.25rem", border: req.status === "pending" ? "1px solid #fde68a" : "1px solid #e8edf4" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: ".75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                      <span style={{ fontSize: "1.25rem" }}>{CAPACITY_TYPE_ICONS[req.listing.capacityType as CapacityType]}</span>
                      <div>
                        <p style={{ fontWeight: 700, color: "#0a1628", margin: 0, fontSize: ".9rem" }}>
                          {CAPACITY_TYPE_LABELS[req.listing.capacityType as CapacityType]} · {req.listing.volumeM2.toLocaleString("nl-BE")} m²
                        </p>
                        <p style={{ color: "#8a96a8", margin: 0, fontSize: ".78rem" }}>
                          {REGION_FLAG[req.listing.region as Region]} {REGION_LABELS[req.listing.region as Region]} · {new Date(req.createdAt).toLocaleDateString("nl-BE")}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: ".6rem", flexWrap: "wrap" }}>
                      <span style={{ padding: ".22rem .55rem", borderRadius: "6px", fontSize: ".72rem", fontWeight: 700, background: `${MATCH_STATUS_COLORS[req.status as MatchStatus]}18`, color: MATCH_STATUS_COLORS[req.status as MatchStatus] }}>
                        {MATCH_STATUS_LABELS[req.status as MatchStatus]}
                      </span>
                      {req.status === "pending" && <RequestActions requestId={req.id} />}
                    </div>
                  </div>

                  {req.message && (
                    <p style={{ fontSize: ".82rem", color: "#4a5568", margin: ".75rem 0 0", padding: ".6rem .75rem", background: "#f4f6f9", borderRadius: "7px" }}>
                      💬 {req.message}
                    </p>
                  )}

                  {req.status === "accepted" && (
                    <div style={{ marginTop: ".75rem", padding: ".9rem 1rem", background: "rgba(0,201,167,.05)", border: "1px solid rgba(0,201,167,.18)", borderRadius: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: ".75rem" }}>
                        <div>
                          {req.requesterRevealed ? (
                            <>
                              <p style={{ fontSize: ".72rem", color: "#009e84", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", margin: "0 0 .35rem" }}>✓ Aanvrager heeft identiteit gedeeld</p>
                              <p style={{ fontSize: ".9rem", fontWeight: 700, color: "#0a1628", margin: "0 0 .15rem" }}>{req.requestingTerminal.name}</p>
                              {req.requestingTerminal.contactName && <p style={{ fontSize: ".78rem", color: "#4a5568", margin: "0 0 .1rem" }}>Contact: {req.requestingTerminal.contactName}</p>}
                              {req.requestingTerminal.users[0]?.email && <p style={{ fontSize: ".78rem", color: "#4a5568", margin: 0 }}>E-mail: <a href={`mailto:${req.requestingTerminal.users[0].email}`} style={{ color: "#00c9a7" }}>{req.requestingTerminal.users[0].email}</a></p>}
                            </>
                          ) : (
                            <>
                              <p style={{ fontSize: ".72rem", color: "#8a96a8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", margin: "0 0 .35rem" }}>🔒 Aanvrager heeft identiteit nog niet gedeeld</p>
                              <p style={{ fontSize: ".82rem", color: "#8a96a8", margin: 0 }}>De andere partij beslist zelf wanneer zij hun identiteit delen.</p>
                            </>
                          )}
                        </div>
                        <RevealButton requestId={req.id} isRevealed={req.ownerRevealed} label="Mijn identiteit" />
                      </div>
                      {req.ownerRevealed && (
                        <p style={{ fontSize: ".75rem", color: "#009e84", margin: ".6rem 0 0" }}>✓ Jouw identiteit is zichtbaar voor de aanvrager.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outgoing */}
        {outgoing.length > 0 && (
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0a1628", margin: "0 0 1rem" }}>Mijn aanvragen</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
              {outgoing.map((req) => (
                <div key={req.id} style={{ background: "#fff", borderRadius: "14px", padding: "1.25rem", border: "1px solid #e8edf4" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: ".75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                      <span style={{ fontSize: "1.25rem" }}>{CAPACITY_TYPE_ICONS[req.listing.capacityType as CapacityType]}</span>
                      <div>
                        <p style={{ fontWeight: 700, color: "#0a1628", margin: 0, fontSize: ".9rem" }}>
                          {CAPACITY_TYPE_LABELS[req.listing.capacityType as CapacityType]} · {req.listing.volumeM2.toLocaleString("nl-BE")} m²
                        </p>
                        <p style={{ color: "#8a96a8", margin: 0, fontSize: ".78rem" }}>
                          {REGION_FLAG[req.listing.region as Region]} {REGION_LABELS[req.listing.region as Region]} · {new Date(req.createdAt).toLocaleDateString("nl-BE")}
                        </p>
                      </div>
                    </div>
                    <span style={{ padding: ".22rem .55rem", borderRadius: "6px", fontSize: ".72rem", fontWeight: 700, background: `${MATCH_STATUS_COLORS[req.status as MatchStatus]}18`, color: MATCH_STATUS_COLORS[req.status as MatchStatus] }}>
                      {MATCH_STATUS_LABELS[req.status as MatchStatus]}
                    </span>
                  </div>

                  {req.status === "accepted" && (
                    <div style={{ marginTop: ".75rem", padding: ".9rem 1rem", background: "rgba(0,201,167,.05)", border: "1px solid rgba(0,201,167,.18)", borderRadius: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: ".75rem" }}>
                        <div>
                          {req.ownerRevealed ? (
                            <>
                              <p style={{ fontSize: ".72rem", color: "#009e84", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", margin: "0 0 .35rem" }}>✓ Terminal heeft identiteit gedeeld</p>
                              <p style={{ fontSize: ".9rem", fontWeight: 700, color: "#0a1628", margin: "0 0 .15rem" }}>{req.listing.terminal.name}</p>
                              {req.listing.terminal.contactName && <p style={{ fontSize: ".78rem", color: "#4a5568", margin: "0 0 .1rem" }}>Contact: {req.listing.terminal.contactName}</p>}
                              {req.listing.terminal.users[0]?.email && <p style={{ fontSize: ".78rem", color: "#4a5568", margin: 0 }}>E-mail: <a href={`mailto:${req.listing.terminal.users[0].email}`} style={{ color: "#00c9a7" }}>{req.listing.terminal.users[0].email}</a></p>}
                            </>
                          ) : (
                            <>
                              <p style={{ fontSize: ".72rem", color: "#8a96a8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", margin: "0 0 .35rem" }}>🔒 Terminal heeft identiteit nog niet gedeeld</p>
                              <p style={{ fontSize: ".82rem", color: "#8a96a8", margin: 0 }}>De andere partij beslist zelf wanneer zij hun identiteit delen.</p>
                            </>
                          )}
                        </div>
                        <RevealButton requestId={req.id} isRevealed={req.requesterRevealed} label="Mijn identiteit" />
                      </div>
                      {req.requesterRevealed && (
                        <p style={{ fontSize: ".75rem", color: "#009e84", margin: ".6rem 0 0" }}>✓ Jouw identiteit is zichtbaar voor de terminal.</p>
                      )}
                    </div>
                  )}

                  <Link href={`/listings/${req.listingId}`} style={{ display: "inline-block", marginTop: ".75rem", fontSize: ".8rem", color: "#8a96a8", textDecoration: "none", fontWeight: 600 }}>
                    Bekijk listing →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My listings */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0a1628", margin: 0 }}>Mijn listings</h2>
            <Link href="/listings/new" style={{ color: "#00c9a7", textDecoration: "none", fontSize: ".85rem", fontWeight: 600 }}>+ Nieuw</Link>
          </div>

          {listings.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: "16px", padding: "3rem", textAlign: "center", border: "1px solid #e8edf4" }}>
              <p style={{ color: "#8a96a8", marginBottom: "1.25rem" }}>Nog geen listings geplaatst.</p>
              <Link href="/listings/new" style={{ background: "#00c9a7", color: "#0a1628", padding: ".75rem 1.5rem", borderRadius: "10px", textDecoration: "none", fontWeight: 700 }}>Eerste listing publiceren</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
              {listings.map((listing) => {
                const days = Math.max(1, Math.ceil((new Date(listing.availableTo).getTime() - new Date(listing.availableFrom).getTime()) / 86400000));
                return (
                  <div key={listing.id} style={{ background: "#fff", borderRadius: "14px", padding: "1.25rem", border: "1px solid #e8edf4" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                        <span style={{ fontSize: "1.2rem" }}>{CAPACITY_TYPE_ICONS[listing.capacityType as CapacityType]}</span>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: ".88rem", color: "#0a1628", margin: 0 }}>{CAPACITY_TYPE_LABELS[listing.capacityType as CapacityType]}</p>
                          <p style={{ fontSize: ".75rem", color: "#8a96a8", margin: 0 }}>{listing.volumeM2.toLocaleString("nl-BE")} m² · €{listing.pricePerM2PerDay}/m²/dag</p>
                        </div>
                      </div>
                      <span style={{ padding: ".2rem .55rem", borderRadius: "6px", fontSize: ".7rem", fontWeight: 700, background: `${STATUS_COLORS[listing.status as ListingStatus]}18`, color: STATUS_COLORS[listing.status as ListingStatus] }}>
                        {STATUS_LABELS[listing.status as ListingStatus]}
                      </span>
                    </div>
                    <p style={{ fontSize: ".78rem", color: "#4a5568", margin: "0 0 .75rem" }}>
                      📅 {new Date(listing.availableFrom).toLocaleDateString("nl-BE", { day: "numeric", month: "short" })} → {new Date(listing.availableTo).toLocaleDateString("nl-BE", { day: "numeric", month: "short" })} ({days}d)
                    </p>
                    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                      <Link href={`/listings/${listing.id}`} style={{ flex: "1 1 auto", textAlign: "center", padding: ".45rem", background: "#f4f6f9", borderRadius: "7px", textDecoration: "none", color: "#0a1628", fontSize: ".8rem", fontWeight: 600 }}>Bekijk</Link>
                      {listing.status === "active" && (
                        <Link href={`/listings/${listing.id}/edit`} style={{ padding: ".45rem .85rem", background: "rgba(59,130,246,.08)", color: "#3b82f6", border: "1px solid rgba(59,130,246,.2)", borderRadius: "7px", textDecoration: "none", fontSize: ".8rem", fontWeight: 600 }}>Bewerk</Link>
                      )}
                      {listing.status === "active" && (
                        <form action={closeListing}>
                          <input type="hidden" name="id" value={listing.id} />
                          <button type="submit" style={{ padding: ".45rem .75rem", background: "rgba(239,68,68,.07)", color: "#dc2626", border: "1px solid rgba(239,68,68,.18)", borderRadius: "7px", cursor: "pointer", fontSize: ".8rem", fontWeight: 600, fontFamily: "inherit" }}>Sluit</button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "1.5rem 5%", borderTop: "1px solid #e8edf4", display: "flex", gap: "1.5rem" }}>
        <Link href="/privacy" style={{ color: "#8a96a8", textDecoration: "none", fontSize: ".78rem" }}>Privacybeleid</Link>
        <Link href="/terms" style={{ color: "#8a96a8", textDecoration: "none", fontSize: ".78rem" }}>Algemene voorwaarden</Link>
        <Link href="/account" style={{ color: "#8a96a8", textDecoration: "none", fontSize: ".78rem" }}>Account</Link>
      </div>
    </div>
  );
}
