"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Wachtwoorden komen niet overeen"); return; }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const d = await res.json();
    if (!res.ok) { setError(d.error); setLoading(false); return; }
    setSuccess(true);
    setTimeout(() => router.push("/auth"), 2500);
  }

  const inp = {
    width: "100%", padding: ".875rem 1rem", borderRadius: "10px",
    border: "1px solid #e8edf4", fontSize: ".95rem", fontFamily: "inherit",
    color: "#1a2535", background: "#fff", outline: "none",
  };

  if (!token) return (
    <p style={{ color: "#dc2626", textAlign: "center" }}>Ongeldige of ontbrekende resetlink.</p>
  );

  return success ? (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
      <h2 style={{ fontWeight: 800, color: "#0a1628" }}>Wachtwoord gewijzigd</h2>
      <p style={{ color: "#4a5568", marginTop: ".5rem" }}>Je wordt doorgestuurd naar de loginpagina...</p>
    </div>
  ) : (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0a1628", margin: 0 }}>Nieuw wachtwoord instellen</h1>
      <div>
        <label style={{ fontSize: ".8rem", fontWeight: 600, color: "#4a5568", display: "block", marginBottom: ".4rem" }}>Nieuw wachtwoord (min. 8 tekens)</label>
        <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inp} />
      </div>
      <div>
        <label style={{ fontSize: ".8rem", fontWeight: 600, color: "#4a5568", display: "block", marginBottom: ".4rem" }}>Bevestig wachtwoord</label>
        <input required type="password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" style={inp} />
      </div>
      {error && <p style={{ color: "#dc2626", fontSize: ".85rem", margin: 0 }}>{error}</p>}
      <button type="submit" disabled={loading} style={{
        padding: ".9rem", background: loading ? "#ccc" : "#00c9a7", color: "#0a1628",
        border: "none", borderRadius: "10px", fontSize: ".95rem", fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
      }}>
        {loading ? "Opslaan..." : "Wachtwoord opslaan →"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f4f6f9", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "2.5rem", width: "100%", maxWidth: "420px", border: "1px solid #e8edf4" }}>
        <Suspense fallback={<p style={{ color: "#8a96a8" }}>Laden...</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
