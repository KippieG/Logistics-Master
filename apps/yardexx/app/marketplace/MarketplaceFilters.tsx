"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function MarketplaceFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    router.push(`/marketplace?${p}`);
  }

  return (
    <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", alignItems: "center" }}>
      <select
        defaultValue={params.get("sort") ?? "newest"}
        onChange={(e) => update("sort", e.target.value)}
        style={{ padding: ".4rem .75rem", borderRadius: "7px", background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.8)", border: "1px solid rgba(255,255,255,.15)", fontSize: ".78rem", fontFamily: "inherit", cursor: "pointer", outline: "none" }}
      >
        <option value="newest">Nieuwste eerst</option>
        <option value="oldest">Oudste eerst</option>
        <option value="cheapest">Goedkoopste prijs</option>
        <option value="priciest">Duurste prijs</option>
        <option value="largest">Meeste m²</option>
        <option value="smallest">Minste m²</option>
      </select>

      <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem" }}>Volume:</span>
      <input
        type="number"
        placeholder="min m²"
        defaultValue={params.get("minVol") ?? ""}
        onBlur={(e) => update("minVol", e.target.value)}
        style={{ width: "80px", padding: ".38rem .6rem", borderRadius: "7px", background: "rgba(255,255,255,.08)", color: "#fff", border: "1px solid rgba(255,255,255,.15)", fontSize: ".75rem", fontFamily: "inherit", outline: "none" }}
      />
      <input
        type="number"
        placeholder="max m²"
        defaultValue={params.get("maxVol") ?? ""}
        onBlur={(e) => update("maxVol", e.target.value)}
        style={{ width: "80px", padding: ".38rem .6rem", borderRadius: "7px", background: "rgba(255,255,255,.08)", color: "#fff", border: "1px solid rgba(255,255,255,.15)", fontSize: ".75rem", fontFamily: "inherit", outline: "none" }}
      />

      <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem" }}>Max €/m²:</span>
      <input
        type="number"
        step=".1"
        placeholder="bv. 1.00"
        defaultValue={params.get("maxPrice") ?? ""}
        onBlur={(e) => update("maxPrice", e.target.value)}
        style={{ width: "80px", padding: ".38rem .6rem", borderRadius: "7px", background: "rgba(255,255,255,.08)", color: "#fff", border: "1px solid rgba(255,255,255,.15)", fontSize: ".75rem", fontFamily: "inherit", outline: "none" }}
      />

      <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,.1)", margin: "0 .25rem" }} />

      {/* Strategic Toggles */}
      <button
        onClick={() => update("sublet", params.get("sublet") === "true" ? "" : "true")}
        style={{ padding: ".35rem .75rem", borderRadius: "7px", fontSize: ".72rem", fontWeight: 700, cursor: "pointer", border: "1px solid rgba(255,255,255,.15)", background: params.get("sublet") === "true" ? "#0369a1" : "rgba(255,255,255,.05)", color: params.get("sublet") === "true" ? "#fff" : "rgba(255,255,255,.6)" }}
      >
        Sublet Market
      </button>
      <button
        onClick={() => update("green", params.get("green") === "true" ? "" : "true")}
        style={{ padding: ".35rem .75rem", borderRadius: "7px", fontSize: ".72rem", fontWeight: 700, cursor: "pointer", border: "1px solid rgba(255,255,255,.15)", background: params.get("green") === "true" ? "#15803d" : "rgba(255,255,255,.05)", color: params.get("green") === "true" ? "#fff" : "rgba(255,255,255,.6)" }}
      >
        🌿 Green Terminal
      </button>
    </div>
  );
}
