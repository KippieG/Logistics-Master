export default function AuthLoading() {
  return (
    <div style={{
      minHeight: "calc(100vh - 64px)", background: "#0a1628",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem",
    }}>
      <div style={{
        width: "100%", maxWidth: 440,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: "2.5rem",
      }}>
        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {[100, 90].map((w, i) => (
            <div key={i} style={{ height: 36, width: w, background: "rgba(255,255,255,0.06)", borderRadius: 8 }} />
          ))}
        </div>
        {/* Fields */}
        {[1, 2].map((i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ height: 12, width: 60, background: "rgba(255,255,255,0.04)", borderRadius: 3, marginBottom: 8 }} />
            <div style={{ height: 44, background: "rgba(255,255,255,0.04)", borderRadius: 10 }} />
          </div>
        ))}
        <div style={{ height: 48, background: "rgba(0,201,167,0.1)", borderRadius: 12, marginTop: 8 }} />
      </div>
    </div>
  );
}
