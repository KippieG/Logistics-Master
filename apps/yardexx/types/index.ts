export type CapacityType = "container" | "roro" | "dry_bulk" | "tank" | "cold_storage";
export type ListingSide = "offer" | "demand";
export type ListingStatus = "active" | "matched" | "closed" | "expired";
export type MatchStatus = "pending" | "accepted" | "rejected" | "cancelled";
export type Region =
  | "antwerp" | "zeebrugge" | "ghent" | "liege" | "brussels"
  | "rotterdam" | "amsterdam" | "vlissingen" | "terneuzen" | "moerdijk"
  | "hamburg" | "le_havre";

export const CAPACITY_TYPE_LABELS: Record<CapacityType, string> = {
  container: "Containerterminal",
  roro: "RoRo Terminal",
  dry_bulk: "Droge Bulk",
  tank: "Tank Terminal",
  cold_storage: "Koelopslagterminal",
};

export const CAPACITY_TYPE_ICONS: Record<CapacityType, string> = {
  container: "📦",
  roro: "🚗",
  dry_bulk: "⛵",
  tank: "🛢️",
  cold_storage: "❄️",
};

export const REGION_LABELS: Record<Region, string> = {
  antwerp: "Antwerpen",
  zeebrugge: "Zeebrugge",
  ghent: "Gent / North Sea Port",
  liege: "Luik (Port de Liège)",
  brussels: "Brussel (Port de Bruxelles)",
  rotterdam: "Rotterdam",
  amsterdam: "Amsterdam",
  vlissingen: "Vlissingen (Zeeland Seaports)",
  terneuzen: "Terneuzen (North Sea Port NL)",
  moerdijk: "Moerdijk",
  hamburg: "Hamburg",
  le_havre: "Le Havre",
};

export const REGION_FLAG: Record<Region, string> = {
  antwerp: "🇧🇪", zeebrugge: "🇧🇪", ghent: "🇧🇪", liege: "🇧🇪", brussels: "🇧🇪",
  rotterdam: "🇳🇱", amsterdam: "🇳🇱", vlissingen: "🇳🇱", terneuzen: "🇳🇱", moerdijk: "🇳🇱",
  hamburg: "🇩🇪", le_havre: "🇫🇷",
};

export const BELGIUM_REGIONS: Region[] = ["antwerp", "zeebrugge", "ghent", "liege", "brussels"];
export const NETHERLANDS_REGIONS: Region[] = ["rotterdam", "amsterdam", "vlissingen", "terneuzen", "moerdijk"];
export const BENELUX_REGIONS: Region[] = [...BELGIUM_REGIONS, ...NETHERLANDS_REGIONS];

export const STATUS_LABELS: Record<ListingStatus, string> = {
  active: "Actief", matched: "Gematcht", closed: "Gesloten", expired: "Verlopen",
};

export const STATUS_COLORS: Record<ListingStatus, string> = {
  active: "#00c9a7", matched: "#3b82f6", closed: "#8a96a8", expired: "#f97316",
};

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  pending: "Wacht op antwoord", accepted: "Geaccepteerd", rejected: "Geweigerd", cancelled: "Geannuleerd",
};

export const MATCH_STATUS_COLORS: Record<MatchStatus, string> = {
  pending: "#f97316", accepted: "#00c9a7", rejected: "#ef4444", cancelled: "#8a96a8",
};
