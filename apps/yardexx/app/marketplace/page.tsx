import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Suspense } from "react";
import MarketplaceFilters from "./MarketplaceFilters";
import {
  CAPACITY_TYPE_ICONS, CAPACITY_TYPE_LABELS, REGION_LABELS, REGION_FLAG,
  BELGIUM_REGIONS, NETHERLANDS_REGIONS,
  type CapacityType, type Region,
} from "@/types";
import type { Prisma } from "@prisma/client";
import Link from "next/link";

const PER_PAGE = 12;

interface SP {
  type?: string; region?: string; side?: string;
  sort?: string; minVol?: string; maxVol?: string; maxPrice?: string; page?: string;
}

export const dynamic = "force-dynamic";

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<SP> }) {
  const params = await searchParams;
  const session = await getSession();
  const page = Math.max(1, Number(params.page ?? 1));

  const where: Prisma.ListingWhereInput = { status: "active" };
  if (params.type) where.capacityType = params.type as never;
  if (params.region) where.region = params.region as never;
  if (params.side) where.side = params.side as never;
  if (params.minVol || params.maxVol) {
    where.volumeM2 = {
      ...(params.minVol ? { gte: Number(params.minVol) } : {}),
      ...(params.maxVol ? { lte: Number(params.maxVol) } : {}),
    };
  }
  if (params.maxPrice) where.pricePerM2PerDay = { lte: Number(params.maxPrice) };

  const sortMap: Record<string, Prisma.ListingOrderByWithRelationInput> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    cheapest: { pricePerM2PerDay: "asc" },
    priciest: { pricePerM2PerDay: "desc" },
    largest: { volumeM2: "desc" },
    smallest: { volumeM2: "asc" },
  };
  const orderBy = sortMap[params.sort ?? "newest"] ?? { createdAt: "desc" };

  const [total, listings] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where, orderBy,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true, side: true, capacityType: true, region: true,
        volumeM2: true, pricePerM2PerDay: true,
        availableFrom: true, availableTo: true, description: true, createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const hasFilter = !!(params.type || params.region || params.side || params.minVol || params.maxVol || params.maxPrice);

  function url(extra: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { ...params, ...extra };
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
    return `/marketplace?${p}`;
  }

  const types: CapacityType[] = ["container", "roro", "dry_bulk", "tank", "cold_storage"];

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f4f6f9", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0a1628", padding: "2rem 5% 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-1px", margin: 0 }}>Marketplace</h1>
            <p style={{ color: "rgba(255,255,255,.45)", fontSize: ".88rem", margin: ".25rem 0 0" }}>
              {total} listing{total !== 1 ? "s" : ""}{hasFilter ? " (gefilterd)" : ""} · identiteit verborgen tot deal
            </p>
          </div>
          {session && (
            <Link href="/listings/new" style={{ background: "#00c9a7", color: "#0a1628", padding: ".7rem 1.4rem", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: ".9rem" }}>
              + Publiceer capaciteit
            </Link>
          )}
        </div>

        {/* Filter row 1: side + type */}
        <div style={{ display: "flex", gap: ".45rem", flexWrap: "wrap", marginBottom: ".6rem" }}>
          {hasFilter && (
            <Link href="/marketplace" style={{ padding: ".4rem .85rem", borderRadius: "7px", textDecoration: "none", background: "rgba(239,68,68,.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,.3)", fontSize: ".78rem", fontWeight: 700 }}>
              ✕ Reset
            </Link>
          )}
          {(["offer", "demand"] as const).map((s) => (
            <Link key={s} href={url({ side: params.side === s ? undefined : s, page: "1" })} style={{ padding: ".4rem .85rem", borderRadius: "7px", textDecoration: "none", fontSize: ".78rem", fontWeight: 600, background: params.side === s ? "#00c9a7" : "rgba(255,255,255,.08)", color: params.side === s ? "#0a1628" : "rgba(255,255,255,.7)" }}>
              {s === "offer" ? "Aanbod" : "Vraag"}
            </Link>
          ))}
          <div style={{ width: "1px", background: "rgba(255,255,255,.1)" }} />
          {types.map((t) => (
            <Link key={t} href={url({ type: params.type === t ? undefined : t, page: "1" })} style={{ padding: ".4rem .85rem", borderRadius: "7px", textDecoration: "none", fontSize: ".78rem", fontWeight: 600, background: params.type === t ? "#00c9a7" : "rgba(255,255,255,.08)", color: params.type === t ? "#0a1628" : "rgba(255,255,255,.7)" }}>
              {CAPACITY_TYPE_ICONS[t]} {CAPACITY_TYPE_LABELS[t]}
            </Link>
          ))}
        </div>

        {/* Filter row 2: regions */}
        <div style={{ display: "flex", gap: ".45rem", flexWrap: "wrap", marginBottom: ".6rem" }}>
          <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem", alignSelf: "center" }}>🇧🇪</span>
          {BELGIUM_REGIONS.map((r) => (
            <Link key={r} href={url({ region: params.region === r ? undefined : r, page: "1" })} style={{ padding: ".35rem .75rem", borderRadius: "7px", textDecoration: "none", fontSize: ".75rem", fontWeight: 600, background: params.region === r ? "#00c9a7" : "rgba(255,255,255,.06)", color: params.region === r ? "#0a1628" : "rgba(255,255,255,.65)" }}>
              {REGION_LABELS[r]}
            </Link>
          ))}
          <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem", alignSelf: "center", marginLeft: ".25rem" }}>🇳🇱</span>
          {NETHERLANDS_REGIONS.map((r) => (
            <Link key={r} href={url({ region: params.region === r ? undefined : r, page: "1" })} style={{ padding: ".35rem .75rem", borderRadius: "7px", textDecoration: "none", fontSize: ".75rem", fontWeight: 600, background: params.region === r ? "#00c9a7" : "rgba(255,255,255,.06)", color: params.region === r ? "#0a1628" : "rgba(255,255,255,.65)" }}>
              {REGION_LABELS[r]}
            </Link>
          ))}
        </div>

        {/* Filter row 3: sort + volume + price — client component voor interactiviteit */}
        <Suspense fallback={null}>
          <MarketplaceFilters />
        </Suspense>
      </div>

      {/* Grid */}
      <div style={{ padding: "2rem 5%" }}>
        {listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
            <p style={{ fontSize: "1.1rem", color: "#8a96a8", marginBottom: "1.5rem" }}>Geen listings gevonden voor deze filter.</p>
            <Link href="/marketplace" style={{ background: "#0a1628", color: "#fff", padding: ".75rem 1.5rem", borderRadius: "10px", textDecoration: "none", fontWeight: 600 }}>Reset filter</Link>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "1.25rem" }}>
              {listings.map((listing) => {
                const days = Math.max(1, Math.ceil((new Date(listing.availableTo).getTime() - new Date(listing.availableFrom).getTime()) / 86400000));
                return (
                  <Link key={listing.id} href={`/listings/${listing.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", border: "1px solid #e8edf4", height: "100%", display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                          <span style={{ fontSize: "1.5rem" }}>{CAPACITY_TYPE_ICONS[listing.capacityType as CapacityType]}</span>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: ".9rem", color: "#0a1628", margin: 0 }}>{CAPACITY_TYPE_LABELS[listing.capacityType as CapacityType]}</p>
                            <p style={{ fontSize: ".78rem", color: "#8a96a8", margin: 0 }}>{REGION_FLAG[listing.region as Region]} {REGION_LABELS[listing.region as Region]}</p>
                          </div>
                        </div>
                        <span style={{ padding: ".22rem .55rem", borderRadius: "6px", fontSize: ".72rem", fontWeight: 700, background: listing.side === "offer" ? "rgba(0,201,167,.1)" : "rgba(59,130,246,.1)", color: listing.side === "offer" ? "#009e84" : "#3b82f6" }}>
                          {listing.side === "offer" ? "Aanbod" : "Vraag"}
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem", marginBottom: ".85rem" }}>
                        {[{ l: "Volume", v: `${listing.volumeM2.toLocaleString("nl-BE")} m²` }, { l: "Prijs", v: `€${listing.pricePerM2PerDay}/m²/dag` }].map(({ l, v }) => (
                          <div key={l} style={{ background: "#f4f6f9", borderRadius: "8px", padding: ".6rem .75rem" }}>
                            <p style={{ fontSize: ".67rem", color: "#8a96a8", textTransform: "uppercase", letterSpacing: ".5px", margin: "0 0 .12rem" }}>{l}</p>
                            <p style={{ fontSize: ".95rem", fontWeight: 800, color: "#0a1628", margin: 0 }}>{v}</p>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: ".78rem", color: "#4a5568", margin: "0 0 .75rem" }}>
                        📅 {new Date(listing.availableFrom).toLocaleDateString("nl-BE", { day: "numeric", month: "short" })} → {new Date(listing.availableTo).toLocaleDateString("nl-BE", { day: "numeric", month: "short" })} ({days}d)
                      </p>
                      {listing.description && (
                        <p style={{ fontSize: ".8rem", color: "#4a5568", lineHeight: 1.5, margin: "0 0 .75rem", flex: 1 }}>
                          {listing.description.length > 80 ? listing.description.slice(0, 80) + "..." : listing.description}
                        </p>
                      )}
                      <div style={{ marginTop: "auto", padding: ".45rem .75rem", background: "rgba(0,201,167,.06)", borderRadius: "7px", fontSize: ".72rem", color: "#009e84", fontWeight: 600 }}>
                        🔒 Anoniem tot deal bevestigd
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: ".5rem", marginTop: "2.5rem" }}>
                {page > 1 && (
                  <Link href={url({ page: String(page - 1) })} style={{ padding: ".55rem 1rem", background: "#fff", border: "1px solid #e8edf4", borderRadius: "8px", textDecoration: "none", color: "#0a1628", fontWeight: 600, fontSize: ".85rem" }}>
                    ← Vorige
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => Math.abs(p - page) <= 2).map((p) => (
                  <Link key={p} href={url({ page: String(p) })} style={{ padding: ".55rem .9rem", background: p === page ? "#0a1628" : "#fff", border: "1px solid #e8edf4", borderRadius: "8px", textDecoration: "none", color: p === page ? "#fff" : "#0a1628", fontWeight: p === page ? 700 : 500, fontSize: ".85rem" }}>
                    {p}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link href={url({ page: String(page + 1) })} style={{ padding: ".55rem 1rem", background: "#fff", border: "1px solid #e8edf4", borderRadius: "8px", textDecoration: "none", color: "#0a1628", fontWeight: 600, fontSize: ".85rem" }}>
                    Volgende →
                  </Link>
                )}
                <span style={{ color: "#8a96a8", fontSize: ".8rem", marginLeft: ".25rem" }}>pag. {page}/{totalPages}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer links */}
      <div style={{ padding: "1.5rem 5%", borderTop: "1px solid #e8edf4", display: "flex", gap: "1.5rem", justifyContent: "center" }}>
        <Link href="/privacy" style={{ color: "#8a96a8", textDecoration: "none", fontSize: ".78rem" }}>Privacybeleid</Link>
        <Link href="/terms" style={{ color: "#8a96a8", textDecoration: "none", fontSize: ".78rem" }}>Algemene voorwaarden</Link>
        <Link href="/auth" style={{ color: "#8a96a8", textDecoration: "none", fontSize: ".78rem" }}>Inloggen</Link>
      </div>
    </div>
  );
}
