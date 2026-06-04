import Link from "next/link";
import { CAPACITY_TYPE_ICONS, CAPACITY_TYPE_LABELS, REGION_LABELS, type CapacityType, type Region } from "@/types";

const capacityTypes: CapacityType[] = ["container", "roro", "dry_bulk", "tank", "cold_storage"];
const belgianRegions: Region[] = ["antwerp", "zeebrugge", "ghent"];

export default function HomePage() {
  return (
    <div style={{ background: "#0a1628" }}>
      {/* Hero */}
      <section style={{
        minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        padding: "80px 5%", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-200px", left: "50%", transform: "translateX(-50%)",
          width: "800px", height: "800px",
          background: "radial-gradient(circle, rgba(0,201,167,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          background: "rgba(0,201,167,0.08)", border: "1px solid rgba(0,201,167,0.25)",
          borderRadius: "999px", padding: "0.4rem 1rem", fontSize: "0.75rem",
          fontWeight: 700, color: "#00c9a7", textTransform: "uppercase", letterSpacing: "1px",
          marginBottom: "2rem",
        }}>
          🚢 Europese terminalcapaciteit marketplace — België-first
        </div>

        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 900, color: "#fff",
          lineHeight: 1.1, letterSpacing: "-2px", maxWidth: "860px", marginBottom: "1.5rem",
        }}>
          Overschot wordt <span style={{ color: "#00c9a7" }}>omzet.</span>
          <br />Anoniem. Digitaal. Direct.
        </h1>

        <p style={{
          fontSize: "1.2rem", color: "rgba(255,255,255,0.55)", maxWidth: "540px",
          marginBottom: "3rem", lineHeight: 1.6,
        }}>
          Terminals kopen en verkopen surplus yard-ruimte, truck slots en ligplaatsen
          — zonder dat concurrenten weten wie je bent.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/marketplace" style={{
            background: "#00c9a7", color: "#0a1628", padding: "1rem 2rem",
            borderRadius: "12px", textDecoration: "none", fontWeight: 700, fontSize: "1rem",
            boxShadow: "0 0 30px rgba(0,201,167,0.25)",
          }}>
            Bekijk alle aanbiedingen →
          </Link>
          <Link href="/auth" style={{
            border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)",
            padding: "1rem 2rem", borderRadius: "12px", textDecoration: "none",
            fontWeight: 600, fontSize: "1rem",
          }}>
            Terminal registreren
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", gap: "3rem", flexWrap: "wrap", justifyContent: "center",
          marginTop: "5rem", paddingTop: "2.5rem",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}>
          {[
            { n: "3", label: "Belgische havens actief" },
            { n: "5+", label: "Capaciteitstypes" },
            { n: "100%", label: "Anoniem tot deal" },
          ].map(({ n, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <span style={{ fontSize: "2rem", fontWeight: 800, color: "#00c9a7", display: "block" }}>{n}</span>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "100px 5%", background: "#0d1e38" }}>
        <p style={{ color: "#00c9a7", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "1rem" }}>
          Hoe het werkt
        </p>
        <h2 style={{ color: "#fff", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "3rem" }}>
          Zo simpel als een Airbnb boeking.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem" }}>
          {[
            { n: "1", title: "Publiceer je capaciteit", desc: "Geef aan hoeveel m² je hebt, het type, de periode en je prijs. In 2 minuten live." },
            { n: "2", title: "Anonieme matching", desc: "YardExx matcht vraag en aanbod. Beide partijen blijven volledig anoniem — concurrenten zien nooit wie je bent." },
            { n: "3", title: "Deal gedaan", desc: "Accepteer, onderhandel of weiger. Bij akkoord worden identiteiten gedeeld voor logistieke opvolging." },
          ].map(({ n, title, desc }) => (
            <div key={n}>
              <div style={{
                width: "48px", height: "48px", background: "#00c9a7", color: "#0a1628",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: "1.1rem", marginBottom: "1.25rem",
              }}>{n}</div>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>{title}</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Capacity types */}
      <section style={{ padding: "100px 5%", background: "#0a1628" }}>
        <p style={{ color: "#00c9a7", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "1rem" }}>
          Wat je kan verhandelen
        </p>
        <h2 style={{ color: "#fff", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "3rem" }}>
          Alle terminalcapaciteit op één platform
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
          {capacityTypes.map((type) => (
            <Link key={type} href={`/marketplace?type=${type}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#132040", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "16px", padding: "1.5rem", transition: "border-color 0.2s",
              }}>
                <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{CAPACITY_TYPE_ICONS[type]}</div>
                <h3 style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 700 }}>
                  {CAPACITY_TYPE_LABELS[type]}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Regions */}
      <section style={{ padding: "100px 5%", background: "#0d1e38" }}>
        <p style={{ color: "#00c9a7", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "1rem" }}>
          Nu actief in België
        </p>
        <h2 style={{ color: "#fff", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "2.5rem" }}>
          België eerst. Dan Europa.
        </h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {belgianRegions.map((region) => (
            <Link key={region} href={`/marketplace?region=${region}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(0,201,167,0.08)", border: "1px solid rgba(0,201,167,0.25)",
                borderRadius: "12px", padding: "1rem 1.5rem", color: "#00c9a7", fontWeight: 700, fontSize: "0.95rem",
              }}>
                🇧🇪 {REGION_LABELS[region]}
              </div>
            </Link>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", marginTop: "1.5rem" }}>
          Rotterdam · Hamburg · Le Havre — coming Q4 2026
        </p>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 5%", background: "#0a1628", textAlign: "center" }}>
        <h2 style={{ color: "#fff", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "1rem" }}>
          Klaar om je eerste listing te plaatsen?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2.5rem", fontSize: "1rem" }}>
          Registreer je terminal. Verificatie binnen 24 uur. Daarna kan je direct aan de slag.
        </p>
        <Link href="/auth" style={{
          background: "#00c9a7", color: "#0a1628", padding: "1rem 2.5rem",
          borderRadius: "12px", textDecoration: "none", fontWeight: 700, fontSize: "1rem",
          boxShadow: "0 0 30px rgba(0,201,167,0.25)",
        }}>
          Terminal registreren →
        </Link>
      </section>
    </div>
  );
}
