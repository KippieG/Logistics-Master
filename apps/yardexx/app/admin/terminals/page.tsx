import { prisma } from "@/lib/prisma";
import { REGION_LABELS, REGION_FLAG, type Region } from "@/types";
import Link from "next/link";
import AdminTerminalActions from "./AdminTerminalActions";

export const dynamic = "force-dynamic";

export default async function AdminTerminalsPage() {
  const [pending, verified, all] = await Promise.all([
    prisma.terminal.count({ where: { verifiedAt: null, rejectedAt: null } }),
    prisma.terminal.count({ where: { verifiedAt: { not: null } } }),
    prisma.listing.count(),
  ]);

  const terminals = await prisma.terminal.findMany({
    orderBy: [{ verifiedAt: "asc" }, { createdAt: "desc" }],
    include: {
      users: { select: { email: true, role: true } },
      _count: { select: { listings: true } },
    },
  });

  const s = { fontSize: "system-ui, sans-serif" };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f4f6f9", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0a1628", padding: "2rem 5%" }}>
        <p style={{ color: "#00c9a7", fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 .25rem" }}>Admin</p>
        <h1 style={{ color: "#fff", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-.5px", margin: 0 }}>Terminal beheer</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
          {[
            { label: "Wacht op verificatie", value: pending, color: "#f97316" },
            { label: "Geverifieerd", value: verified, color: "#00c9a7" },
            { label: "Totaal terminals", value: terminals.length, color: "#8b5cf6" },
            { label: "Actieve listings", value: all, color: "#3b82f6" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,.05)", borderRadius: "12px", padding: "1rem" }}>
              <span style={{ fontSize: "1.75rem", fontWeight: 900, color, display: "block" }}>{value}</span>
              <span style={{ fontSize: ".75rem", color: "rgba(255,255,255,.45)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "2rem 5%" }}>
        {/* Pending first */}
        {terminals.filter((t) => !t.verifiedAt && !t.rejectedAt).length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0a1628", margin: "0 0 1rem" }}>
              ⏳ Wacht op verificatie ({terminals.filter((t) => !t.verifiedAt && !t.rejectedAt).length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
              {terminals.filter((t) => !t.verifiedAt && !t.rejectedAt).map((t) => (
                <div key={t.id} style={{
                  background: "#fff", borderRadius: "14px", padding: "1.25rem",
                  border: "1px solid #fde68a", display: "flex", alignItems: "center",
                  justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
                }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "#0a1628", margin: "0 0 .25rem" }}>{t.name}</p>
                    <p style={{ fontSize: ".82rem", color: "#8a96a8", margin: 0 }}>
                      {REGION_FLAG[t.region as Region]} {REGION_LABELS[t.region as Region]} · {t.users[0]?.email}
                      {t.contactName && ` · ${t.contactName}`}
                    </p>
                    <p style={{ fontSize: ".75rem", color: "#8a96a8", margin: ".25rem 0 0" }}>
                      Aangevraagd: {new Date(t.createdAt).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <AdminTerminalActions terminalId={t.id} terminalName={t.name} userEmail={t.users[0]?.email ?? ""} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All terminals */}
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0a1628", margin: "0 0 1rem" }}>
          Alle terminals ({terminals.length})
        </h2>
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e8edf4", overflow: "hidden" }}>
          {terminals.map((t, i) => (
            <div key={t.id} style={{
              padding: "1rem 1.5rem",
              borderBottom: i < terminals.length - 1 ? "1px solid #f4f6f9" : "none",
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".75rem",
            }}>
              <div>
                <span style={{ fontWeight: 700, color: "#0a1628", fontSize: ".9rem" }}>{t.name}</span>
                <span style={{ fontSize: ".78rem", color: "#8a96a8", marginLeft: ".75rem" }}>
                  {REGION_FLAG[t.region as Region]} {REGION_LABELS[t.region as Region]}
                </span>
                <span style={{ fontSize: ".75rem", color: "#8a96a8", display: "block" }}>{t.users[0]?.email} · {t._count.listings} listings</span>
              </div>
              <span style={{
                padding: ".25rem .6rem", borderRadius: "6px", fontSize: ".72rem", fontWeight: 700,
                background: t.verifiedAt ? "rgba(0,201,167,.1)" : t.rejectedAt ? "rgba(239,68,68,.08)" : "rgba(249,115,22,.1)",
                color: t.verifiedAt ? "#009e84" : t.rejectedAt ? "#dc2626" : "#c2410c",
              }}>
                {t.verifiedAt ? "Geverifieerd" : t.rejectedAt ? "Geweigerd" : "Wachtend"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
