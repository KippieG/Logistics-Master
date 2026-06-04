"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  async function act(action: "accept" | "reject") {
    setLoading(action);
    await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button onClick={() => act("accept")} disabled={!!loading} style={{
        padding: "0.45rem 0.9rem", background: "rgba(0,201,167,0.1)", color: "#009e84",
        border: "1px solid rgba(0,201,167,0.3)", borderRadius: "8px", cursor: "pointer",
        fontSize: "0.8rem", fontWeight: 700, fontFamily: "inherit",
        opacity: loading ? 0.6 : 1,
      }}>
        {loading === "accept" ? "..." : "✓ Accepteer"}
      </button>
      <button onClick={() => act("reject")} disabled={!!loading} style={{
        padding: "0.45rem 0.9rem", background: "rgba(239,68,68,0.08)", color: "#dc2626",
        border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", cursor: "pointer",
        fontSize: "0.8rem", fontWeight: 600, fontFamily: "inherit",
        opacity: loading ? 0.6 : 1,
      }}>
        {loading === "reject" ? "..." : "✕ Weiger"}
      </button>
    </div>
  );
}
