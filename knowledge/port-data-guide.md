# 📖 Technical EDI & API Guide: Port Data Orchestration

## Introductie
In de moderne haven logistiek is data de nieuwe brandstof. Dit document dient als de technische blauwdruk voor hoe informatie stroomt tussen terminals, rederijen en transporteurs binnen de apps in deze Hub.

## 📡 EDI Berichtenstandaarden (UN/EDIFACT)

Binnen de `tos-sim` en `ecoload` applicaties worden de volgende berichten gesimuleerd en verwerkt:

### 1. CODECO (Container Gate-in/Gate-out)
- **Doel:** Bevestiging dat een container de terminal heeft betreden of verlaten.
- **Kritieke Data:** Container-ID, ISO-type, zegelnummer, truck-kenteken, datum/tijd.
- **Implementatie:** Verwerkt door de `apps/ecoload` backend om de douane-status te triggeren.

### 2. COARRI (Container Loading/Discharge)
- **Doel:** Melding dat een container op of van een schip is geladen.
- **Kritieke Data:** Bay-positie op schip, crane-ID, schip-IMO.
- **Implementatie:** Gebruikt in de `apps/tos-sim` voor real-time kade-visualisatie.

### 3. IFTMCS (Instruction for Transport)
- **Doel:** Transportopdracht van verlader naar vervoerder.
- **Implementatie:** De input voor de `tools/eco-match-engine` om optimale ritten te berekenen.

## 🔌 API Architectuur

Onze platforms (`yardexx`, `shipment-tracking`) maken gebruik van een unified API-gateway model:

| Endpoint | Methode | Functie |
| :--- | :--- | :--- |
| `/api/v1/terminal/slots` | GET | Beschikbare yard-capaciteit opvragen. |
| `/api/v1/shipments/track` | POST | Real-time status ophalen via container-DNA. |
| `/api/v1/predict/delay` | POST | AI-predictie van aankomstvertraging (Delay-DNA). |

## 🏗️ Data Flow Model
1. **Source:** Terminal (N4/TOS) genereert CODECO.
2. **Transform:** Onze middleware vertaalt EDI naar JSON.
3. **Action:** `ecoload` valideert douane-status.
4. **Insight:** `portpulse` visualiseert de kade-efficiëntie.

---
*Technisch dossier opgesteld door Philippe Godfroy (Logistics Master Hub)*
