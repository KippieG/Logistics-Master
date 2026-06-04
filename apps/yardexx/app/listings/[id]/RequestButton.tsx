"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  listingId: string;
  side: "offer" | "demand";
  existingStatus?: string;
}

export default function RequestButton({ listingId, side, existingStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (existingStatus === "pending") {
    return (
      <div style={{ background: "rgba(249,115,22,.1)", border: "1px solid rgba(249,115,22,.25)", borderRadius: "12px", padding: "1.25rem", textAlign: "center" }}>
        <p style={{ color: "#f97316", fontWeight: 700, margin: 0 }}>⏳ Aanvraag verzonden — wacht op antwoord</p>
        <p style={{ color: "rgba(255,255,255,.4)", fontSize: ".8rem", margin: ".5rem 0 0" }}>Bekijk de status in je dashboard.</p>
      </div>
    );
  }

  if (existingStatus === "accepted") {
    return (
      <div style={{ background: "rgba(0,201,167,.1)", border: "1px solid rgba(0,201,167,.25)", borderRadius: "12px", padding: "1.25rem", textAlign: "center" }}>
        <p style={{ color: "#00c9a7", fontWeight: 700, margin: "0 0 .5rem" }}>✅ Deal geaccepteerd</p>
        <a href="/dashboard" style={{ color: "#00c9a7", fontSize: ".85rem" }}>Bekijk in dashboard →</a>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ background: "rgba(0,201,167,.1)", borderRadius: "12px", padding: "1.25rem" }}>
        <p style={{ color: "#00c9a7", fontWeight: 700, margin: 0 }}>✅ Aanvraag verstuurd — je wordt doorgestuurd...</p>
      </div>
    );
  }

  async function submit() {
    setLoading(true); setError("");
    const res = await fetch("/api/requests", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, message }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Fout bij aanvraag"); setLoading(false); return; }
    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1800);
  }

  return (
    <div>
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ width: "100%", padding: "1rem 2rem", background: "#00c9a7", color: "#0a1628", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          {side === "offer" ? "Vraag deze capaciteit aan →" : "Reageer op deze vraag →"}
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
          <textarea rows={3} placeholder="Optioneel anoniem bericht aan de andere partij..." value={message} onChange={(e) => setMessage(e.target.value)}
            style={{ padding: ".875rem 1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: ".9rem", fontFamily: "inherit", resize: "vertical", outline: "none" }} />
          {error && <p style={{ color: "#fca5a5", fontSize: ".85rem", margin: 0 }}>{error}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: ".75rem" }}>
            <button onClick={() => setShowForm(false)} style={{ padding: ".9rem", background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.7)", border: "none", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
              Annuleer
            </button>
            <button onClick={submit} disabled={loading} style={{ padding: ".9rem", background: loading ? "#555" : "#00c9a7", color: "#0a1628", border: "none", borderRadius: "10px", cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontFamily: "inherit" }}>
              {loading ? "Bezig..." : "Stuur anoniem →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
