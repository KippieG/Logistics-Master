export default function DashboardLoading() {
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#0a1628", padding: "3rem 5%" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Page title */}
        <div style={{ height: 30, width: 180, background: "rgba(255,255,255,0.07)", borderRadius: 8, marginBottom: 8 }} />
        <div style={{ height: 16, width: 240, background: "rgba(255,255,255,0.04)", borderRadius: 5, marginBottom: 36 }} />

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: 32 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "1.25rem",
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.12}s`,
            }}>
              <div style={{ height: 12, width: 80, background: "rgba(255,255,255,0.05)", borderRadius: 3, marginBottom: 10 }} />
              <div style={{ height: 28, width: 60, background: "rgba(255,255,255,0.08)", borderRadius: 6 }} />
            </div>
          ))}
        </div>

        {/* Listing rows */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 10,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            animation: "pulse 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }}>
            <div>
              <div style={{ height: 16, width: 160, background: "rgba(255,255,255,0.07)", borderRadius: 4, marginBottom: 6 }} />
              <div style={{ height: 12, width: 100, background: "rgba(255,255,255,0.04)", borderRadius: 3 }} />
            </div>
            <div style={{ height: 28, width: 72, background: "rgba(0,201,167,0.08)", borderRadius: 20 }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
