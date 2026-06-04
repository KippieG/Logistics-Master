# Technologiestack — ECS European Containers

> Samengesteld uit vacaturevereisten, bedrijfsbeschrijvingen en LinkedIn-bedrijfsposts.

---

## Volledig overzicht

```
┌─────────────────────────────────────────────────────────────────┐
│                      ECS IT Landscape                           │
├──────────────────┬──────────────────────────────────────────────┤
│  APPLICATIES     │  Business Central · TAS · WACS · TopDesk     │
│  CUSTOM DEV      │  .NET / C# / ASP.NET Core · Angular          │
│  DATABASE        │  MS SQL Server · T-SQL                        │
│  CLOUD           │  Microsoft Azure (in migratie)                │
│  DEVOPS          │  Docker · Kubernetes                          │
│  BI / DATA       │  Power BI · T-SQL · Excel                     │
│  AUTOMATISERING  │  Power Platform · Power Automate · RPA        │
│  ARCHITECTUUR    │  EDA · DDD · Microservices · Scrum/Agile      │
└──────────────────┴──────────────────────────────────────────────┘
```

---

## Backend & Ontwikkeling

| Technologie | Gebruik | Status |
|-------------|---------|--------|
| **.NET / C#** | Alle interne applicaties | Kern — primair platform |
| **ASP.NET Core** | Web APIs, backend services | Productie-stabiel |
| **Angular** | Frontend voor interne apps | Primair frontend framework |
| **MS SQL Server** | Relationele dataopslag | Centraal — alle systemen |
| **T-SQL** | Queries, stored procedures, rapportages | Dagelijks gebruik |

**Vereiste in vacature:** minimum 3 jaar .NET-ervaring, kennis C# + ASP.NET Core + TSQL.

---

## Cloud & DevOps

| Technologie | Status | Opmerkingen |
|-------------|--------|-------------|
| **Microsoft Azure** | ✅ In actieve migratie | Expliciet gevraagd: "ervaring of bereid te leren" |
| **Docker** | ✅ Aanwezig | Nice to have in vacatures |
| **Kubernetes** | ✅ Aanwezig | Containerorkestratie |
| **CI/CD** | Vermoedelijk aanwezig | Impliciet bij Scrum/Agile-werkwijze |

---

## Data & Business Intelligence

| Technologie | Gebruik | Status |
|-------------|---------|--------|
| **Power BI** | Rapportages, dashboards, management insights | Actief — meerdere vacatures |
| **T-SQL / Excel** | Basisanalyses, ad-hoc rapportages | Dagelijks gebruik |
| **SSRS** | Legacy rapportages | Historisch aanwezig |
| **Qlik** | Legacy BI-tool | Vermoedelijk in afbouw |

> ECS investeert bewust in dit domein: nieuwe **Teamlead Data & AI**-rol aangemaakt.
> Citaat uit vacature: *"ECS has a huge amount of data"*

---

## Automatisering & Low-Code

| Technologie | Gebruik |
|-------------|---------|
| **Microsoft Power Platform** | Power Automate, Power Apps, Copilot Studio |
| **Power Automate** | Werkstroomautomatisering |
| **RPA** | Procesautomatisering — actief in Finance (e-invoicing, BC-koppelingen) |
| **Hyperautomation** | Bredere automatiseringsstrategie |
| **Low-code / no-code** | Voor business users zonder programmeerkennis |
| **Chatbots** | In onderzoek / implementatie |

**Bewijs van actief gebruik:** RPA-project in Finance-afdeling bevestigd
(Business Central + e-invoicing + RPA gecombineerd).

---

## Architectuurpatronen

| Patroon | Status | Bron |
|---------|--------|------|
| **Event Driven Architecture (EDA)** | In adoptie | Vermeld als nice to have in vacatures |
| **Domain Driven Design (DDD)** | In adoptie | Vermeld als nice to have in vacatures |
| **Microservices** | Aanwezig | Impliciet bij EDA + Kubernetes |
| **Scrum / Agile** | Actief | Application Delivery Manager is Scrum-ervaren |
| **API-integraties** | Actief | "koppelingen met klanten en leveranciers" — vacature |

---

## Technologische volwassenheid

```
Laag ──────────────────────────────────────── Hoog

.NET / C#        ████████████████████  Kern, 10+ jaar, productie
SQL Server       ██████████████████░░  Volwassen, actief DBA-team
Angular          ██████████████░░░░░░  Actief, alle frontends
Power BI         ████████████░░░░░░░░  Groeiend, meer investering
Azure            ████████░░░░░░░░░░░░  In migratie
Power Platform   ████████░░░░░░░░░░░░  Actief, RPA in gebruik
Kubernetes       █████░░░░░░░░░░░░░░░  Aanwezig, niet in kern
EDA / DDD        ████░░░░░░░░░░░░░░░░  In adoptie
AI / ML          ███░░░░░░░░░░░░░░░░░  Teamlead gezocht → opbouw
```

---

## Microsoft-ecosysteem (dominant)

ECS heeft bewust gekozen voor het volledige Microsoft-stack:

```
Productiviteit → Microsoft 365
ERP            → Dynamics 365 Business Central
BI             → Power BI
Automatisering → Power Platform (Power Automate, Power Apps, Copilot Studio)
Cloud          → Microsoft Azure
```

Dit verlaagt de adoptiedrempel voor nieuwe Microsoft-tools (Azure AI Services,
Microsoft Copilot, Fabric) en maakt integraties tussen systemen eenvoudiger.

---

## Externe technologiepartners

| Partner | Samenwerking |
|---------|-------------|
| **element61** | BI-analytics consulting — bevestigd klantrelatie |
| **Microsoft** | Dominante ecosysteempartner |
| **TOPdesk** | ITSM SaaS-platform (service desk) |
