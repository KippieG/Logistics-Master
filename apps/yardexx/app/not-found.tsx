import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pagina niet gevonden",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: "calc(100vh - 64px)", background: "#0a1628",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "2rem",
      fontFamily: "system-ui, sans-serif",
    }}>
      <p style={{ fontSize: "5rem", fontWeight: 900, color: "#132040", margin: "0 0 1rem", lineHeight: 1 }}>
        404
      </p>
      <h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, margin: "0 0 .75rem" }}>
        Pagina niet gevonden
      </h1>
      <p style={{ color: "rgba(255,255,255,.5)", marginBottom: "2rem" }}>
        Deze pagina bestaat niet of is verplaatst.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/marketplace" style={{
          background: "#00c9a7", color: "#0a1628",
          padding: ".75rem 1.5rem", borderRadius: "10px",
          textDecoration: "none", fontWeight: 700,
        }}>
          Naar marketplace
        </Link>
        <Link href="/" style={{
          border: "1px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.7)",
          padding: ".75rem 1.5rem", borderRadius: "10px",
          textDecoration: "none", fontWeight: 600,
        }}>
          Startpagina
        </Link>
      </div>
    </div>
  );
}
