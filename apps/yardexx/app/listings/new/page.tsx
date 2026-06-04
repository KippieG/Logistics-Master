"use client";

import {
  CAPACITY_TYPE_LABELS, REGION_LABELS, REGION_FLAG,
  BELGIUM_REGIONS, NETHERLANDS_REGIONS,
  type CapacityType, type Region,
} from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const types: CapacityType[] = ["container", "roro", "dry_bulk", "tank", "cold_storage"];
const icons: Record<CapacityType, string> = { container: "📦", roro: "🚗", dry_bulk: "⛵", tank: "🛢️", cold_storage: "❄️" };

export default function NewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    side: "offer" as "offer" | "demand",
    capacityType: "" as CapacityType | "",
    region: "" as Region | "",
    volumeM2: "", pricePerM2PerDay: "",
    availableFrom: "", availableTo: "", description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: unknown) { setForm((f) => ({ ...f, [k]: v })); setError(""); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.capacityType || !form.region) { setError("Kies een capaciteitstype en regio"); return; }
    setLoading(true);
    const res = await fetch("/api/listings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Fout"); setLoading(false); return; }
    router.push(`/listings/${data.id}`);
  }

  const days = form.availableFrom && form.availableTo
    ? Math.ceil((new Date(form.availableTo).getTime() - new Date(form.availableFrom).getTime()) / 86400000)
    : 0;
  const totalValue = days > 0 && form.volumeM2 && form.pricePerM2PerDay
    ? (Number(form.volumeM2) * Number(form.pricePerM2PerDay) * days).toLocaleString("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
    : null;

  const inp = { width: "100%", padding: ".875rem 1rem", borderRadius: "10px", border: "1px solid #e8edf4", fontSize: ".95rem", fontFamily: "inherit", color: "#1a2535", background: "#fff", outline: "none" };
  const lbl = { fontSize: ".8rem", fontWeight: 600, color: "#4a5568", display: "block", marginBottom: ".5rem" };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f4f6f9", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#0a1628", padding: "1.5rem 5%", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <Link href="/dashboard" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none", fontSize: ".85rem" }}>← Dashboard</Link>
        <h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, margin: ".5rem 0 0", letterSpacing: "-.5px" }}>Nieuwe listing</h1>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem 5%" }}>
        <div style={{ background: "rgba(0,201,167,.08)", border: "1px solid rgba(0,201,167,.2)", borderRadius: "10px", padding: ".75rem 1rem", marginBottom: "2rem", fontSize: ".85rem", color: "#009e84" }}>
          🔒 Jouw identiteit blijft verborgen totdat een deal bevestigd is door beide partijen.
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Side */}
          <div>
            <label style={lbl}>Wat wil je doen?</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
              {(["offer", "demand"] as const).map((side) => (
                <button key={side} type="button" onClick={() => set("side", side)} style={{
                  padding: "1.1rem", borderRadius: "12px", border: "2px solid",
                  borderColor: form.side === side ? "#00c9a7" : "#e8edf4",
                  background: form.side === side ? "rgba(0,201,167,.05)" : "#fff",
                  cursor: "pointer", fontWeight: 700, fontSize: ".9rem",
                  color: form.side === side ? "#009e84" : "#4a5568", fontFamily: "inherit",
                }}>
                  {side === "offer" ? "🏭 Ik heb overschot" : "🔍 Ik zoek capaciteit"}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label style={lbl}>Type capaciteit</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(125px, 1fr))", gap: ".6rem" }}>
              {types.map((type) => (
                <button key={type} type="button" onClick={() => set("capacityType", type)} style={{
                  padding: ".75rem", borderRadius: "10px", border: "2px solid",
                  borderColor: form.capacityType === type ? "#00c9a7" : "#e8edf4",
                  background: form.capacityType === type ? "rgba(0,201,167,.05)" : "#fff",
                  cursor: "pointer", fontSize: ".8rem", fontWeight: 600,
                  color: form.capacityType === type ? "#009e84" : "#4a5568", fontFamily: "inherit", textAlign: "center",
                }}>
                  <span style={{ fontSize: "1.2rem", display: "block", marginBottom: ".3rem" }}>{icons[type]}</span>
                  {CAPACITY_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Region — Benelux split */}
          <div>
            <label style={lbl}>Haven / regio</label>
            <div style={{ marginBottom: ".5rem" }}>
              <p style={{ fontSize: ".72rem", fontWeight: 700, color: "#8a96a8", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 .4rem" }}>🇧🇪 België</p>
              <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                {BELGIUM_REGIONS.map((r) => (
                  <button key={r} type="button" onClick={() => set("region", r)} style={{
                    padding: ".5rem .9rem", borderRadius: "8px", border: "2px solid",
                    borderColor: form.region === r ? "#00c9a7" : "#e8edf4",
                    background: form.region === r ? "rgba(0,201,167,.05)" : "#fff",
                    cursor: "pointer", fontSize: ".82rem", fontWeight: 600,
                    color: form.region === r ? "#009e84" : "#4a5568", fontFamily: "inherit",
                  }}>
                    {REGION_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: ".72rem", fontWeight: 700, color: "#8a96a8", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 .4rem" }}>🇳🇱 Nederland</p>
              <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                {NETHERLANDS_REGIONS.map((r) => (
                  <button key={r} type="button" onClick={() => set("region", r)} style={{
                    padding: ".5rem .9rem", borderRadius: "8px", border: "2px solid",
                    borderColor: form.region === r ? "#00c9a7" : "#e8edf4",
                    background: form.region === r ? "rgba(0,201,167,.05)" : "#fff",
                    cursor: "pointer", fontSize: ".82rem", fontWeight: 600,
                    color: form.region === r ? "#009e84" : "#4a5568", fontFamily: "inherit",
                  }}>
                    {REGION_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Volume & Price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={lbl}>Volume (m²)</label>
              <input required type="number" min="100" step="100" placeholder="bv. 5000" value={form.volumeM2} onChange={(e) => set("volumeM2", e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Prijs (€/m²/dag)</label>
              <input required type="number" step=".01" min=".1" placeholder="bv. 0.85" value={form.pricePerM2PerDay} onChange={(e) => set("pricePerM2PerDay", e.target.value)} style={inp} />
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div><label style={lbl}>Beschikbaar van</label><input required type="date" value={form.availableFrom} onChange={(e) => set("availableFrom", e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Beschikbaar tot</label><input required type="date" value={form.availableTo} onChange={(e) => set("availableTo", e.target.value)} style={inp} /></div>
          </div>

          {/* Preview */}
          {totalValue && (
            <div style={{ background: "rgba(0,201,167,.06)", border: "1px solid rgba(0,201,167,.15)", borderRadius: "10px", padding: "1rem 1.25rem" }}>
              <p style={{ fontSize: ".72rem", color: "#009e84", fontWeight: 700, textTransform: "uppercase", margin: "0 0 .35rem" }}>Waarde preview</p>
              <p style={{ margin: 0, color: "#0a1628", fontSize: ".9rem" }}>
                {Number(form.volumeM2).toLocaleString("nl-BE")} m² × €{form.pricePerM2PerDay}/m²/dag × {days} dagen = <strong style={{ fontSize: "1.05rem" }}>{totalValue}</strong>
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label style={lbl}>Omschrijving <span style={{ color: "#8a96a8", fontWeight: 400 }}>(optioneel)</span></label>
            <textarea rows={3} placeholder="bv. kranen aanwezig, nabijheid kaai, toegangsrestricties..." value={form.description} onChange={(e) => set("description", e.target.value)} style={{ ...inp, resize: "vertical" }} />
          </div>

          {error && <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: "8px", padding: ".75rem 1rem", fontSize: ".85rem", color: "#dc2626" }}>{error}</div>}

          <button type="submit" disabled={loading || !form.capacityType || !form.region} style={{
            padding: "1.1rem", fontFamily: "inherit", fontWeight: 700, fontSize: "1rem", border: "none",
            borderRadius: "12px", cursor: loading || !form.capacityType || !form.region ? "not-allowed" : "pointer",
            background: loading || !form.capacityType || !form.region ? "#ccc" : "#00c9a7", color: "#0a1628",
          }}>
            {loading ? "Publiceren..." : "Publiceer anoniem →"}
          </button>
        </form>
      </div>
    </div>
  );
}
