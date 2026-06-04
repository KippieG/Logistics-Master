"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { REGION_LABELS, REGION_FLAG, type Region } from "@/types";
import Link from "next/link";

interface Account {
  email: string;
  terminal: {
    id: string; name: string; region: string;
    vatNumber: string | null; contactName: string | null;
    contactPhone: string | null; website: string | null;
    verifiedAt: string | null;
  };
}

export default function AccountPage() {
  const router = useRouter();
  const [data, setData] = useState<Account | null>(null);
  const [form, setForm] = useState({ terminalName: "", vatNumber: "", contactName: "", contactPhone: "", website: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    fetch("/api/account").then((r) => {
      if (r.status === 401) { router.push("/auth"); return null; }
      return r.json();
    }).then((d) => {
      if (!d) return;
      setData(d);
      setForm({
        terminalName: d.terminal.name,
        vatNumber: d.terminal.vatNumber ?? "",
        contactName: d.terminal.contactName ?? "",
        contactPhone: d.terminal.contactPhone ?? "",
        website: d.terminal.website ?? "",
      });
    });
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg("");
    const res = await fetch("/api/account", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMsg(res.ok ? "Opgeslagen ✓" : "Fout bij opslaan");
    setSaving(false);
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { setPwMsg("Wachtwoorden komen niet overeen"); return; }
    setPwSaving(true); setPwMsg("");
    const res = await fetch("/api/account", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
    });
    const d = await res.json();
    setPwMsg(res.ok ? "Wachtwoord gewijzigd ✓" : d.error ?? "Fout");
    if (res.ok) setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    setPwSaving(false);
  }

  const inp = { width: "100%", padding: ".875rem 1rem", borderRadius: "10px", border: "1px solid #e8edf4", fontSize: ".95rem", fontFamily: "inherit", color: "#1a2535", background: "#fff", outline: "none" };
  const lbl = { fontSize: ".8rem", fontWeight: 600, color: "#4a5568", display: "block", marginBottom: ".4rem" };
  const card = { background: "#fff", borderRadius: "16px", padding: "1.75rem", border: "1px solid #e8edf4", marginBottom: "1.5rem" };

  if (!data) return <div style={{ padding: "4rem", textAlign: "center", color: "#8a96a8", fontFamily: "system-ui" }}>Laden...</div>;

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f4f6f9", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#0a1628", padding: "2rem 5%" }}>
        <Link href="/dashboard" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none", fontSize: ".85rem" }}>← Dashboard</Link>
        <h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, margin: ".5rem 0 0", letterSpacing: "-.5px" }}>Mijn account</h1>
        <p style={{ color: "rgba(255,255,255,.45)", fontSize: ".82rem", margin: ".25rem 0 0" }}>
          {REGION_FLAG[data.terminal.region as Region]} {REGION_LABELS[data.terminal.region as Region]} · {data.email}
          {data.terminal.verifiedAt && <span style={{ marginLeft: ".75rem", color: "#00c9a7" }}>✓ Geverifieerd</span>}
        </p>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "2rem 5%" }}>
        {/* Terminal info */}
        <div style={card}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0a1628", margin: "0 0 1.5rem" }}>Terminal gegevens</h2>
          <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={lbl}>Terminalnaam <span style={{ color: "#8a96a8", fontWeight: 400 }}>(intern — nooit publiek)</span></label>
              <input value={form.terminalName} onChange={(e) => setForm((f) => ({ ...f, terminalName: e.target.value }))} style={inp} required />
            </div>
            <div>
              <label style={lbl}>BTW-nummer / KBO <span style={{ color: "#8a96a8", fontWeight: 400 }}>(optioneel — helpt bij verificatie)</span></label>
              <input value={form.vatNumber} onChange={(e) => setForm((f) => ({ ...f, vatNumber: e.target.value }))} placeholder="BE 0xxx.xxx.xxx" style={inp} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
              <div>
                <label style={lbl}>Contactpersoon</label>
                <input value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} placeholder="Naam" style={inp} />
              </div>
              <div>
                <label style={lbl}>Telefoon</label>
                <input value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} placeholder="+32 ..." style={inp} />
              </div>
            </div>
            <div>
              <label style={lbl}>Website <span style={{ color: "#8a96a8", fontWeight: 400 }}>(optioneel)</span></label>
              <input type="url" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://..." style={inp} />
            </div>
            {msg && <p style={{ color: msg.includes("✓") ? "#009e84" : "#dc2626", fontSize: ".85rem", margin: 0 }}>{msg}</p>}
            <button type="submit" disabled={saving} style={{ padding: ".85rem", background: saving ? "#ccc" : "#00c9a7", color: "#0a1628", border: "none", borderRadius: "10px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {saving ? "Opslaan..." : "Gegevens opslaan"}
            </button>
          </form>
        </div>

        {/* Password */}
        <div style={card}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0a1628", margin: "0 0 1.5rem" }}>Wachtwoord wijzigen</h2>
          <form onSubmit={savePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={lbl}>Huidig wachtwoord</label>
              <input required type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} placeholder="••••••••" style={inp} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
              <div>
                <label style={lbl}>Nieuw wachtwoord</label>
                <input required type="password" minLength={8} value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} placeholder="min. 8 tekens" style={inp} />
              </div>
              <div>
                <label style={lbl}>Bevestig</label>
                <input required type="password" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} placeholder="••••••••" style={inp} />
              </div>
            </div>
            {pwMsg && <p style={{ color: pwMsg.includes("✓") ? "#009e84" : "#dc2626", fontSize: ".85rem", margin: 0 }}>{pwMsg}</p>}
            <button type="submit" disabled={pwSaving} style={{ padding: ".85rem", background: pwSaving ? "#ccc" : "#0a1628", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: pwSaving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {pwSaving ? "Opslaan..." : "Wachtwoord wijzigen"}
            </button>
          </form>
        </div>

        {/* Legal links */}
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", padding: ".5rem 0" }}>
          <Link href="/privacy" style={{ color: "#8a96a8", textDecoration: "none", fontSize: ".82rem" }}>Privacybeleid</Link>
          <Link href="/terms" style={{ color: "#8a96a8", textDecoration: "none", fontSize: ".82rem" }}>Algemene voorwaarden</Link>
        </div>
      </div>
    </div>
  );
}
