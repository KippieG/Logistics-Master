export default function ListingLoading() {
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#0a1628", padding: "3rem 5%" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Back link */}
        <div style={{ height: 14, width: 120, background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 28 }} />

        {/* Title block */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ height: 36, width: "55%", background: "rgba(255,255,255,0.07)", borderRadius: 10, marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ height: 24, width: 90, background: "rgba(0,201,167,0.1)", borderRadius: 20 }} />
            <div style={{ height: 24, width: 80, background: "rgba(255,255,255,0.05)", borderRadius: 20 }} />
          </div>
        </div>

        {/* Detail cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: 28 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "1.25rem",
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}>
              <div style={{ height: 12, width: 70, background: "rgba(255,255,255,0.05)", borderRadius: 3, marginBottom: 8 }} />
              <div style={{ height: 20, width: "60%", background: "rgba(255,255,255,0.07)", borderRadius: 5 }} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ height: 52, background: "rgba(0,201,167,0.1)", borderRadius: 14 }} />
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
