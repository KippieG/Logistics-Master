"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BENELUX_REGIONS, REGION_LABELS, REGION_FLAG, type Region } from "@/types";

type Mode = "login" | "register" | "forgot";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ email: "", password: "", terminalName: "", region: "", contactName: "", contactPhone: "" });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); setError(""); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");

    if (mode === "forgot") {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const d = await res.json();
      setSuccess(d.message);
      setLoading(false);
      return;
    }

    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login"
      ? { email: form.email, password: form.password }
      : form;

    const res = await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) { setError(data.error ?? "Er is iets misgegaan"); setLoading(false); return; }
    if (mode === "login") { router.push("/dashboard"); router.refresh(); }
    else { setSuccess(data.message); setLoading(false); }
  }

  const inp = {
    width: "100%", padding: ".875rem 1rem", borderRadius: "10px",
    border: "1px solid #e8edf4", fontSize: ".95rem", fontFamily: "inherit",
    color: "#1a2535", background: "#fff", outline: "none",
  };
  const lbl = { fontSize: ".8rem", fontWeight: 600, color: "#4a5568", display: "block", marginBottom: ".4rem" };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f4f6f9", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "2.5rem", width: "100%", maxWidth: "460px", border: "1px solid #e8edf4" }}>

        {/* Tabs — only for login/register */}
        {mode !== "forgot" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "#f4f6f9", borderRadius: "12px", padding: "4px", marginBottom: "2rem" }}>
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
                padding: ".6rem", borderRadius: "9px", border: "none", cursor: "pointer",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#0a1628" : "#8a96a8",
                fontWeight: mode === m ? 700 : 500, fontSize: ".9rem",
                boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,.08)" : "none", fontFamily: "inherit",
              }}>
                {m === "login" ? "Inloggen" : "Registreren"}
              </button>
            ))}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
            <h2 style={{ fontWeight: 800, color: "#0a1628", marginBottom: ".75rem" }}>
              {mode === "register" ? "Aanvraag ontvangen" : "Check je inbox"}
            </h2>
            <p style={{ color: "#4a5568", fontSize: ".9rem", lineHeight: 1.6 }}>{success}</p>
            <button onClick={() => { setMode("login"); setSuccess(""); }} style={{
              marginTop: "1.5rem", background: "#00c9a7", color: "#0a1628",
              border: "none", borderRadius: "10px", padding: ".8rem 1.5rem",
              fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>
              Terug naar inloggen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0a1628", margin: "0 0 .25rem" }}>
              {mode === "login" ? "Welkom terug" : mode === "register" ? "Terminal registreren" : "Wachtwoord vergeten"}
            </h1>
            <p style={{ color: "#8a96a8", fontSize: ".82rem", margin: "0 0 .25rem" }}>
              {mode === "login" ? "Log in met je terminalaccount." : mode === "register" ? "Verificatie binnen 24 uur na registratie." : "We sturen je een resetlink per e-mail."}
            </p>

            {mode === "register" && (
              <>
                <div>
                  <label style={lbl}>Terminalnaam <span style={{ color: "#8a96a8", fontWeight: 400 }}>(intern — nooit publiek)</span></label>
                  <input required value={form.terminalName} onChange={(e) => set("terminalName", e.target.value)} placeholder="bv. Terminal Noord Antwerpen" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Haven / regio</label>
                  <select required value={form.region} onChange={(e) => set("region", e.target.value)} style={inp}>
                    <option value="">Kies een haven...</option>
                    <optgroup label="🇧🇪 België">
                      {["antwerp", "zeebrugge", "ghent", "liege", "brussels"].map((r) => (
                        <option key={r} value={r}>{REGION_FLAG[r as Region]} {REGION_LABELS[r as Region]}</option>
                      ))}
                    </optgroup>
                    <optgroup label="🇳🇱 Nederland">
                      {["rotterdam", "amsterdam", "vlissingen", "terneuzen", "moerdijk"].map((r) => (
                        <option key={r} value={r}>{REGION_FLAG[r as Region]} {REGION_LABELS[r as Region]}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
                  <div>
                    <label style={lbl}>Contactpersoon <span style={{ color: "#8a96a8", fontWeight: 400 }}>(optioneel)</span></label>
                    <input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Naam" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Telefoon <span style={{ color: "#8a96a8", fontWeight: 400 }}>(optioneel)</span></label>
                    <input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="+32 ..." style={inp} />
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={lbl}>E-mailadres</label>
              <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jouw@terminal.be" style={inp} />
            </div>

            {mode !== "forgot" && (
              <div>
                <label style={lbl}>Wachtwoord {mode === "register" && <span style={{ color: "#8a96a8", fontWeight: 400 }}>(min. 8 tekens)</span>}</label>
                <input required type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" style={inp} minLength={mode === "register" ? 8 : 1} />
              </div>
            )}

            {error && (
              <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: "8px", padding: ".75rem 1rem", fontSize: ".85rem", color: "#dc2626" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: ".9rem", background: loading ? "#ccc" : "#00c9a7", color: "#0a1628",
              border: "none", borderRadius: "10px", fontSize: ".95rem", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: ".25rem",
            }}>
              {loading ? "Even geduld..." : mode === "login" ? "Inloggen →" : mode === "register" ? "Registreer terminal →" : "Stuur resetlink →"}
            </button>

            {mode === "login" && (
              <>
                <button type="button" onClick={() => { setMode("forgot"); setError(""); }} style={{
                  background: "none", border: "none", color: "#8a96a8", fontSize: ".82rem",
                  cursor: "pointer", fontFamily: "inherit", textAlign: "center", padding: 0,
                }}>
                  Wachtwoord vergeten?
                </button>
                <div style={{ background: "#f4f6f9", borderRadius: "10px", padding: ".75rem", textAlign: "center" }}>
                  <p style={{ fontSize: ".72rem", color: "#8a96a8", margin: 0 }}>
                    <strong>Demo:</strong> demo1@yardexx.com / demo1234
                  </p>
                </div>
              </>
            )}

            {mode === "forgot" && (
              <button type="button" onClick={() => { setMode("login"); setError(""); }} style={{
                background: "none", border: "none", color: "#8a96a8", fontSize: ".82rem",
                cursor: "pointer", fontFamily: "inherit", textAlign: "center", padding: 0,
              }}>
                ← Terug naar inloggen
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
