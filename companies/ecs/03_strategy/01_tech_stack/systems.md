# Bedrijfsapplicaties & Systemen — ECS European Containers

> Gebaseerd op vermeldingen in vacaturebeschrijvingen en bedrijfsinformatie.

---

## Application Portfolio

### Microsoft Dynamics 365 Business Central (ERP)

| | |
|---|---|
| **Domein** | Finance, HR, Boekhouding, Inkoop |
| **Platform** | Microsoft Dynamics 365 Business Central |
| **Status** | Actief productiegebruik |
| **Beheer** | Digital Solutions Expert (configuratie, beheer, 2e-lijns support) |
| **Integraties** | Power Automate · RPA · e-invoicing · externe leveranciers |

Business Central is het centrale ERP-hart van ECS. Recente activiteiten:
- Upgrade naar nieuwere versie
- Koppeling met e-invoicing
- RPA-automatisering vanuit BC-processen

> Kennis van Business Central is expliciet een **pluspunt** in de Digital Solutions Expert-vacature.

---

### TAS — Transport Administration System

| | |
|---|---|
| **Domein** | Transport management |
| **Type** | Transport Management System (TMS) |
| **Beheer** | Digital Solutions Expert (vermeld in vacature) |
| **Integraties** | Klantportaal intermodaal · externe carriers |

Kernvoor ECS's intermodaaltransportbusiness. Beheert zendingen, routes en
carriercontacten. Direct gekoppeld aan het klantportaal voor track-and-trace.

---

### WACS — Warehouse Administration & Control System

| | |
|---|---|
| **Domein** | Warehouse management |
| **Type** | Warehouse Management System (WMS) |
| **Beheer** | Digital Solutions Expert (vermeld in vacature) |
| **Integraties** | Klantportaal supply chain · BC (voorraadwaardering) |

Beheert ECS's warehousingoperaties, inclusief koelmagazijnen. Gelinkt aan het supply
chain klantportaal voor voorraadinzicht.

---

### TopDesk — ITSM Platform

| | |
|---|---|
| **Platform** | TOPdesk (SaaS) |
| **Domein** | Ticketing, service desk, incidentbeheer, change management |
| **Beheer** | IT Service Desk & Digital Solutions Manager |
| **Gebruik** | 2e-lijns support · SLA-tracking · kennisbank · change requests |

TOPdesk is het servicemanagement-platform voor alle IT-verzoeken. De Digital Solutions
Expert treedt op als 2e-lijns support — vertrouwdheid met TOPdesk-processen is
relevant.

---

### Klantportalen (eigen ontwikkeling)

| Portaal | URL | Scope |
|---------|-----|-------|
| **Intermodal Customer Portal** | [customerportal-intermodal.ecs.be](http://customerportal-intermodal.ecs.be/) | Zendingsbeheer, track & trace |
| **Supply Chain Customer Portal** | [sc-customerportal.ecs.be](https://sc-customerportal.ecs.be/) | Voorraadinzicht, supply chain |

Beide portalen zijn **eigen .NET/Angular-ontwikkeling** door het interne IT-team.
Klanten beheren zendingen, documenten en statussen via deze systemen.

---

### Intern ERP / Operationeel Platform (custom)

| | |
|---|---|
| **Type** | Volledig intern gebouwde .NET-applicatie |
| **Domein** | Logistieke kernoperaties (volledige transport chain) |
| **Status** | Productie |

ECS bouwde naast Business Central ook een eigen groot operationeel systeem intern —
een zeldzame investering die aantoont dat het IT-team complexe logistieke
domeinkennis bezit. Het systeem handelt de volledige interne transportketen af.

---

## Systeem-integraties (overzicht)

```
Business Central ──┬── Power Automate / RPA ──── Finance-processen
                   └── T-SQL rapportages ──────── Power BI dashboards

TAS ───────────────┬── Klantportaal intermodaal ─ Track & trace
                   └── Externe carriers ────────── EDI / API

WACS ──────────────┬── Klantportaal supply chain ─ Voorraaddata
                   └── Business Central ──────────── Voorraadwaardering

TopDesk ───────────── Alle IT-teams ─────────────── Ticketing / SLA

Intern platform ───── TAS + WACS + BC ──────────── Geïntegreerde operaties
```

De Digital Solutions Expert-vacature vermeldt expliciet:
> *"zorgen voor soepele integraties en implementaties (API's, in-house applicaties,
> systeemconfiguraties)"*

---

## Toekomstige systemen / in evaluatie

| Technologie | Status | Signaal |
|-------------|--------|---------|
| Azure-workloads | In migratie | Actief gevraagd in vacatures |
| Microsoft Copilot / Copilot Studio | Vermoedelijk in evaluatie | Power Platform-focus + chatbot vermeld |
| Power Apps (low-code tools) | In gebruik / uitbreiding | Meerdere vermeldingen |
| Data Warehouse / Data Platform | In opbouw | Nieuwe Teamlead Data & AI-rol |
| Azure AI Services | Toekomstig | Logische stap bij Azure-adoptie + AI-teamlead |
