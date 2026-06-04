"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  requestId: string;
  isRevealed: boolean;
  label: string;
}

export default function RevealButton({ requestId, isRevealed, label }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/requests/${requestId}/reveal`, {
      method: isRevealed ? "DELETE" : "POST",
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={toggle} disabled={loading} style={{
      padding: ".45rem .9rem",
      background: isRevealed ? "rgba(239,68,68,.08)" : "rgba(0,201,167,.1)",
      color: isRevealed ? "#dc2626" : "#009e84",
      border: `1px solid ${isRevealed ? "rgba(239,68,68,.2)" : "rgba(0,201,167,.25)"}`,
      borderRadius: "8px", cursor: "pointer", fontSize: ".78rem",
      fontWeight: 700, fontFamily: "inherit",
    }}>
      {loading ? "..." : isRevealed ? `🔓 ${label} verbergen` : `🔑 ${label} onthullen`}
    </button>
  );
}
