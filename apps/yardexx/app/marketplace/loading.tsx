export default function MarketplaceLoading() {
  return (
    <div style={{ background: "#0a1628", minHeight: "calc(100vh - 64px)", padding: "2rem 5%" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header skeleton */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ height: 32, width: 220, background: "rgba(255,255,255,0.06)", borderRadius: 8, marginBottom: 8 }} />
          <div style={{ height: 18, width: 140, background: "rgba(255,255,255,0.04)", borderRadius: 6 }} />
        </div>

        {/* Cards skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "1.5rem",
                animation: "pulse 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div style={{ height: 20, width: "60%", background: "rgba(255,255,255,0.06)", borderRadius: 6, marginBottom: 12 }} />
              <div style={{ height: 14, width: "80%", background: "rgba(255,255,255,0.04)", borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 14, width: "50%", background: "rgba(255,255,255,0.04)", borderRadius: 4, marginBottom: 20 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ height: 28, width: 80, background: "rgba(0,201,167,0.08)", borderRadius: 8 }} />
                <div style={{ height: 28, width: 80, background: "rgba(255,255,255,0.04)", borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
