export default function NewListingLoading() {
  return (
    <div style={{
      minHeight: "calc(100vh - 64px)", background: "#0a1628",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem",
    }}>
      <div style={{
        width: "100%", maxWidth: 640,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: "2.5rem",
      }}>
        <div style={{ height: 28, width: 200, background: "rgba(255,255,255,0.06)", borderRadius: 8, marginBottom: 24 }} />
        {[120, 80, 80, 60, 100].map((w, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ height: 14, width: w, background: "rgba(255,255,255,0.04)", borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 44, background: "rgba(255,255,255,0.04)", borderRadius: 10 }} />
          </div>
        ))}
        <div style={{ height: 48, background: "rgba(0,201,167,0.1)", borderRadius: 12, marginTop: 8 }} />
      </div>
    </div>
  );
}
