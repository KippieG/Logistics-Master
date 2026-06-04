"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState({
    volumeM2: "", pricePerM2PerDay: "", availableFrom: "", availableTo: "", description: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/listings/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setForm({
          volumeM2: String(d.volumeM2),
          pricePerM2PerDay: String(d.pricePerM2PerDay),
          availableFrom: new Date(d.availableFrom).toISOString().slice(0, 10),
          availableTo: new Date(d.availableTo).toISOString().slice(0, 10),
          description: d.description ?? "",
        });
        setFetching(false);
      });
  }, [params.id]);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); setError(""); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/listings/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Fout"); setLoading(false); return; }
    router.push("/dashboard");
  }

  const inp = {
    width: "100%", padding: ".875rem 1rem", borderRadius: "10px",
    border: "1px solid #e8edf4", fontSize: ".95rem", fontFamily: "inherit",
    color: "#1a2535", background: "#fff", outline: "none",
  };
  const lbl = { fontSize: ".8rem", fontWeight: 600, color: "#4a5568", display: "block", marginBottom: ".4rem" };

  if (fetching) return (
    <div style={{ padding: "4rem", textAlign: "center", color: "#8a96a8", fontFamily: "system-ui, sans-serif" }}>
      Laden...
    </div>
  );

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f4f6f9", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#0a1628", padding: "1.5rem 5%", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <Link href="/dashboard" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none", fontSize: ".85rem" }}>← Dashboard</Link>
        <h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, margin: ".5rem 0 0", letterSpacing: "-.5px" }}>Listing bewerken</h1>
      </div>

      <div style={{ maxWidth: "620px", margin: "0 auto", padding: "2rem 5%" }}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={lbl}>Volume (m²)</label>
              <input required type="number" min="100" value={form.volumeM2} onChange={(e) => set("volumeM2", e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Prijs (€/m²/dag)</label>
              <input required type="number" step=".01" min=".1" value={form.pricePerM2PerDay} onChange={(e) => set("pricePerM2PerDay", e.target.value)} style={inp} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={lbl}>Beschikbaar van</label>
              <input required type="date" value={form.availableFrom} onChange={(e) => set("availableFrom", e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Beschikbaar tot</label>
              <input required type="date" value={form.availableTo} onChange={(e) => set("availableTo", e.target.value)} style={inp} />
            </div>
          </div>

          <div>
            <label style={lbl}>Omschrijving</label>
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} style={{ ...inp, resize: "vertical" }} />
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: "8px", padding: ".75rem 1rem", fontSize: ".85rem", color: "#dc2626" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: ".75rem" }}>
            <Link href="/dashboard" style={{
              flex: 1, textAlign: "center", padding: ".9rem", background: "#f4f6f9", color: "#4a5568",
              borderRadius: "10px", textDecoration: "none", fontWeight: 600, fontSize: ".95rem",
            }}>Annuleer</Link>
            <button type="submit" disabled={loading} style={{
              flex: 2, padding: ".9rem", background: loading ? "#ccc" : "#00c9a7",
              color: "#0a1628", border: "none", borderRadius: "10px", fontSize: ".95rem",
              fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>
              {loading ? "Opslaan..." : "Wijzigingen opslaan →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
