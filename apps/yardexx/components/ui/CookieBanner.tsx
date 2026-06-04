"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("yardexx_cookie_consent")) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("yardexx_cookie_consent", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
      background: "#0d1e38", borderTop: "1px solid rgba(255,255,255,.1)",
      padding: "1rem 5%", display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
    }}>
      <p style={{ color: "rgba(255,255,255,.7)", fontSize: ".85rem", margin: 0, maxWidth: "700px", lineHeight: 1.5 }}>
        🍪 YardExx gebruikt uitsluitend een functionele sessie-cookie voor authenticatie. Geen tracking, geen advertenties.{" "}
        <a href="/privacy" style={{ color: "#00c9a7", textDecoration: "none" }}>Privacybeleid</a>
      </p>
      <button onClick={accept} style={{
        background: "#00c9a7", color: "#0a1628", border: "none", borderRadius: "8px",
        padding: ".6rem 1.25rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: ".85rem", whiteSpace: "nowrap",
      }}>
        Begrepen
      </button>
    </div>
  );
}
