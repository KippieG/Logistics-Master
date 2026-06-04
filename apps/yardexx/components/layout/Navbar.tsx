"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

interface Props { session?: { email: string; role: string } | null; }

export default function Navbar({ session }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const linkStyle = (href: string) => ({
    color: isActive(href) ? "#fff" : "rgba(255,255,255,.65)",
    textDecoration: "none" as const,
    fontSize: ".9rem",
    fontWeight: isActive(href) ? 700 : 500,
    transition: "color .2s",
  });

  return (
    <>
      <nav style={{
        background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 5%", height: "64px", borderBottom: "1px solid rgba(255,255,255,.07)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ fontSize: "1.3rem", fontWeight: 900, color: "#fff", textDecoration: "none" }}>
          Yard<span style={{ color: "#00c9a7" }}>Exx</span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/marketplace" style={linkStyle("/marketplace")}>Marketplace</Link>
          {session && <Link href="/dashboard" style={linkStyle("/dashboard")}>Dashboard</Link>}
          {session && <Link href="/account" style={linkStyle("/account")}>Account</Link>}
          {session?.role === "admin" && (
            <Link href="/admin/terminals" style={{ ...linkStyle("/admin"), color: "#f97316", fontSize: ".82rem" }}>Admin</Link>
          )}
          {session ? (
            <>
              <Link href="/listings/new" style={{
                background: "#00c9a7", color: "#0a1628", padding: ".5rem 1rem",
                borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: ".85rem",
              }}>
                + Publiceer
              </Link>
              <button onClick={logout} style={{
                background: "none", border: "1px solid rgba(255,255,255,.18)", color: "rgba(255,255,255,.6)",
                padding: ".4rem .9rem", borderRadius: "8px", cursor: "pointer", fontSize: ".82rem", fontFamily: "inherit",
              }}>
                Uitloggen
              </button>
            </>
          ) : (
            <Link href="/auth" style={{
              background: "#00c9a7", color: "#0a1628", padding: ".5rem 1.1rem",
              borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: ".9rem",
            }}>
              Inloggen
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile-btn"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          style={{
            display: "none", background: "none", border: "none", cursor: "pointer",
            color: "#fff", fontSize: "1.4rem", padding: ".25rem",
          }}
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" role="dialog" aria-label="Navigatiemenu" className="nav-mobile-menu" style={{
          position: "fixed", top: "64px", left: 0, right: 0, zIndex: 49,
          background: "#0d1e38", borderBottom: "1px solid rgba(255,255,255,.08)",
          padding: "1.25rem 5%", display: "flex", flexDirection: "column", gap: ".75rem",
        }}>
          <Link href="/marketplace" onClick={() => setOpen(false)} style={{ color: "rgba(255,255,255,.8)", textDecoration: "none", fontWeight: 600, fontSize: "1rem", padding: ".5rem 0" }}>
            Marketplace
          </Link>
          {session && (
            <Link href="/dashboard" onClick={() => setOpen(false)} style={{ color: "rgba(255,255,255,.8)", textDecoration: "none", fontWeight: 600, fontSize: "1rem", padding: ".5rem 0" }}>
              Dashboard
            </Link>
          )}
          {session?.role === "admin" && (
            <Link href="/admin/terminals" onClick={() => setOpen(false)} style={{ color: "#f97316", textDecoration: "none", fontWeight: 600, fontSize: "1rem", padding: ".5rem 0" }}>
              Admin
            </Link>
          )}
          {session ? (
            <>
              <Link href="/listings/new" onClick={() => setOpen(false)} style={{
                background: "#00c9a7", color: "#0a1628", padding: ".75rem 1rem", borderRadius: "10px",
                textDecoration: "none", fontWeight: 700, textAlign: "center",
              }}>
                + Publiceer capaciteit
              </Link>
              <button onClick={() => { logout(); setOpen(false); }} style={{
                background: "none", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.6)",
                padding: ".65rem 1rem", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
              }}>
                Uitloggen
              </button>
            </>
          ) : (
            <Link href="/auth" onClick={() => setOpen(false)} style={{
              background: "#00c9a7", color: "#0a1628", padding: ".75rem 1rem", borderRadius: "10px",
              textDecoration: "none", fontWeight: 700, textAlign: "center",
            }}>
              Inloggen
            </Link>
          )}
        </div>
      )}
    </>
  );
}
