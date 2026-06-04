"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props { terminalId: string; terminalName: string; userEmail: string; }

export default function AdminTerminalActions({ terminalId, terminalName, userEmail }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"verify" | "reject" | null>(null);

  async function act(action: "verify" | "reject") {
    setLoading(action);
    await fetch(`/api/admin/terminals/${terminalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userEmail }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: ".5rem" }}>
      <button onClick={() => act("verify")} disabled={!!loading} style={{
        padding: ".5rem 1rem", background: "rgba(0,201,167,.1)", color: "#009e84",
        border: "1px solid rgba(0,201,167,.3)", borderRadius: "8px", cursor: "pointer",
        fontSize: ".82rem", fontWeight: 700, fontFamily: "inherit",
      }}>
        {loading === "verify" ? "..." : "✓ Verifieer"}
      </button>
      <button onClick={() => act("reject")} disabled={!!loading} style={{
        padding: ".5rem 1rem", background: "rgba(239,68,68,.08)", color: "#dc2626",
        border: "1px solid rgba(239,68,68,.2)", borderRadius: "8px", cursor: "pointer",
        fontSize: ".82rem", fontWeight: 600, fontFamily: "inherit",
      }}>
        {loading === "reject" ? "..." : "✕ Weiger"}
      </button>
    </div>
  );
}
