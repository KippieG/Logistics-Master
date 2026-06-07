# 🧠 ECS Strategic Intelligence & Research Hub\n
# ECS European Containers — IT Landscape

> Publiek onderzoek op basis van **openbare bronnen**: ecs.be, LinkedIn-vacatures,
> flows.be en persberichten. Geen persoonsgegevens van individuele medewerkers.
> Laatste update: juni 2026.

---

## Wat staat hier?

Een gestructureerd overzicht van de IT-organisatie van **ECS European Containers NV**
(Zeebrugge) — voor iedereen die wil begrijpen hoe deze logistieke groep zijn IT heeft
ingericht: structuur, techstack, systemen, vacatures en strategische richting.

---

## Inhoud

| | Bestand | Wat je erin vindt |
|---|---------|-------------------|
| 🏢 | [Bedrijf](company/overview.md) | Wie is ECS, cijfers, activiteiten |
| 🗂️ | [Org-structuur](org/structure.md) | Teams, rollen, hiërarchie |
| 💻 | [Techstack](tech/stack.md) | Talen, frameworks, cloud, patronen |
| 🗄️ | [Systemen](tech/systems.md) | Business Central, TAS, WACS, TopDesk, portalen |
| 📋 | [Vacatures](vacatures/open.md) | Openstaande IT-posities + patroonanalyse |
| 🔭 | [Strategie](strategy/insights.md) | Digitale transformatie, observaties |

---

## Snapshot

```
ECS European Containers NV
├── Opgericht  : 1985 (familiebedrijf)
├── HQ         : Zeebrugge, België
├── Medewerkers: ~654 (totaal)
├── IT-team    : ~20 personen
├── Omzet      : ~€507M (2023)
└── Actief in  : 31+ Europese landen
```

### IT op één blik

| Domein | Rollen | Techstack |
|--------|--------|-----------|
| **Applicatie-levering** | Application Delivery Mgr · Analyst Developers · Functional Analysts · PO's · Testers | .NET · C# · Angular · Azure |
| **Infrastructuur** | Infrastructure Mgr · System Engineers · DBA's | SQL Server · Docker · Kubernetes |
| **Digital Solutions** | IT SD Manager · Digital Solutions Expert · Digital Project Analysts | Power Platform · RPA · TopDesk |
| **Data & AI** | Teamlead Data & AI · BI Analisten · Data Engineers | Power BI · T-SQL · Azure |

### Systemen op één blik

```
ERP      → Microsoft Dynamics 365 Business Central
TMS      → TAS (Transport Administration System)
WMS      → WACS (Warehouse Administration & Control System)
ITSM     → TopDesk
Cloud    → Microsoft Azure (in migratie)
BI       → Power BI
Auto     → Microsoft Power Platform · RPA
Dev      → .NET / C# · Angular · MS SQL Server
```

---

## Bronnen

- [ecs.be/careers/jobs](https://www.ecs.be/en/careers/jobs) — vacaturepagina
- [linkedin.com/company/ecs-intermodal-supply-chain](https://be.linkedin.com/company/ecs-intermodal-supply-chain) — LinkedIn bedrijfspagina
- [flows.be](https://en.flows.be) — logistieke sector nieuws
- [element61.be/en/company/ecs](https://www.element61.be/en/company/ecs) — BI-partner referentie
\n---\n
# Bedrijfsoverzicht — ECS European Containers

## Identiteit

| | |
|---|---|
| **Volledige naam** | ECS European Containers NV |
| **Opgericht** | 1985 |
| **Type** | Familiebedrijf (privaat) |
| **HQ** | Baron de Maerelaan 155, 8380 Zeebrugge |
| **Website** | [ecs.be](https://www.ecs.be/en) |
| **LinkedIn** | [ecs-intermodal-supply-chain](https://be.linkedin.com/company/ecs-intermodal-supply-chain) |

## Kerncijfers

| Jaar | Omzet |
|------|-------|
| 2015 | €263M |
| 2018 | €389M |
| 2020 | €400M |
| 2021 | €416M |
| 2022 | €524M |
| 2023 | €507M |

- **~654 medewerkers** (2025)
- **31+ Europese landen**
- **~20 IT-medewerkers** (interne schatting op basis van vacaturebeschrijvingen)

## Activiteiten

```
ECS European Containers NV
├── Intermodaal transport (kern)
│   └── UK / Ierland ↔ Europees vasteland
├── Supply chain logistiek
├── Temperatuurgecontroleerd transport
├── Brexit & douanediensten
└── Equipment (containers, trailers)
```

## Vestigingen

| Locatie | Type |
|---------|------|
| **Zeebrugge (HQ)** | Hoofdkantoor — alle IT gecentreerd hier |
| **Venlo** | Operationele site |
| **UK / Ierland** | Internationale aanwezigheid |
| **31+ landen** | Vertegenwoordigingen / partners |

## Leidinggevenden (publiek aangekondigde rollen)

| Naam | Rol | Actief sinds |
|------|-----|-------------|
| **Richard de Haas** | CEO | Oktober 2025 |
| **Christine De Dijcker** | Corporate Affairs · Board | Lang actief |

> Sven Pieters was CEO van ~2023 tot september 2025, opgevolgd door Richard de Haas
> (ex-DPD Belux). Bron: [flows.be, augustus 2025](https://en.flows.be/people/2025/08/sven-pieters-leaves-ecs-new-ceo-richard-de-haas-dpd-belux/)

## Klantportalen

ECS biedt twee aparte zelfbediende portalen voor klanten:

| Portaal | URL | Scope |
|---------|-----|-------|
| Intermodal Customer Portal | [customerportal-intermodal.ecs.be](http://customerportal-intermodal.ecs.be/) | Intermodaaltransport |
| Supply Chain Customer Portal | [sc-customerportal.ecs.be](https://sc-customerportal.ecs.be/) | Supply chain-diensten |

Beide portalen zijn eigen ontwikkeling (intern gebouwd door het IT-team).
\n---\n
# IT Organisatiestructuur — ECS European Containers

> Gereconstrueerd op basis van vacaturebeschrijvingen en LinkedIn-bedrijfspagina.
> Rollen en teams — geen persoonsgegevens.

---

## Hiërarchie

```
CEO
│
└── IT Afdeling (~20 personen)
    │
    ├── Application Delivery Manager
    │   │   Stuurt alle softwareontwikkeling aan.
    │   │   Scrum-ervaren. Meerdere teams onder zich.
    │   │
    │   ├── Scrum Team(s)
    │   │   ├── Analyst Developers (.NET / Angular)
    │   │   ├── Functional Analysts / Product Owners
    │   │   └── Testers / QA
    │   │
    │   └── Digital Solutions Team
    │       ├── Digital Solutions Expert        ← OPEN POSITIE
    │       └── Digital Project Analyst(en)
    │
    ├── Infrastructure Manager & Architect
    │   ├── System Engineers
    │   ├── Cloud / Netwerk Beheerders
    │   └── SQL Server DBA('s)
    │
    ├── IT Service Desk & Digital Solutions Manager  ← OPEN / RECENT INGEVULD
    │   └── Service Desk Team
    │       (TopDesk · 2e-lijns support · change management)
    │
    └── Teamlead Data & AI                      ← OPEN POSITIE
        ├── BI Data Analisten
        └── Data Engineers
```

---

## Rolomschrijvingen

### Application Delivery Manager

Verantwoordelijk voor de volledige softwarelevering bij ECS. Stuurt meerdere Scrum-teams
aan, bewaakt de applicatielevenscyclus en draagt de visie op digitale transformatie.
Scrum-ervaring is een vereiste voor deze rol. Rapporteert vermoedelijk rechtstreeks aan
de CEO.

**Bewijs van bestaan:** vacature eerder gepubliceerd en ingevuld
(LinkedIn job [#3767460177](https://be.linkedin.com/jobs/view/application-delivery-manager-at-ecs-3767460177))

---

### Infrastructure Manager & Architect

Beheert en ontwerpt de volledige technische infrastructuur: servers, netwerk,
cloud-architectuur (Azure-migratie), security-fundament en databases. Werkt samen
met de Application Delivery Manager voor system-integraties.

**Bewijs van bestaan:** LinkedIn-bedrijfspagina + profielsnipper

---

### IT Service Desk & Digital Solutions Manager

Leidt het service desk-team, bewaakt SLA's en coördineert digitale oplossingen.
Brug tussen eindgebruikers en IT-teams. Beheert TopDesk als ITSM-platform.

**Bewijs van bestaan:** vacature actief geweest
(LinkedIn job [#4222297009](https://be.linkedin.com/jobs/view/it-service-desk-digital-solutions-manager-at-ecs-4222297009))

---

### Teamlead Data & AI

Nieuwe managementlaag (recent gecreëerd). Bouwt en leidt het Data & AI-team.
Verantwoordelijk voor BI-rapportages, data governance en AI-initiatieven.

**Bewijs van bestaan:** actieve vacature
(LinkedIn job [#4347595552](https://be.linkedin.com/jobs/view/teamlead-data-ai-at-ecs-4347595552))

---

### Analyst Developer

Combineert functionele analyse met .NET-ontwikkeling. Werkt in Scrum-teams,
vertaalt businessvragen naar technische oplossingen, en beheert bestaande applicaties.

---

### Functional Analyst / Product Owner

Bewaakt de product backlog, vertaalt businessvereisten naar user stories, en coördineert
tussen stakeholders en het ontwikkelteam. Soms gecombineerd met Scrum Master-rol.

---

### Digital Solutions Expert

Brug tussen business en IT. Beheert het applicatieportfolio (Business Central, TAS,
WACS, TopDesk), bouwt Power Platform-oplossingen en RPA-flows, en treedt op als
2e-lijns support. Zie [vacatures/open.md](../vacatures/open.md) voor volledige omschrijving.

---

### SQL Server DBA

Beheert alle productiescenario's op SQL Server, voert datamigratieprojecten uit
(bijv. ERP-migraties) en lost productie-incidenten op.

---

### BI Data Analyst

Bouwt rapportages en dashboards in Power BI, analyseert bedrijfsdata via T-SQL en Excel.
ECS heeft "een enorme hoeveelheid data" (geciteerd uit vacaturebeschrijving).

---

## Teamgrootte

| Team | Geschatte grootte |
|------|------------------|
| Software ontwikkeling (totaal) | ~12–15 |
| Infrastructuur / DBA | ~3–5 |
| Service desk | ~2–3 |
| Data & BI | ~2–3 (in opbouw) |
| **Totaal IT** | **~20** |

> Bron: vacaturebeschrijving Software Developer vermeldt expliciet
> "Together with around **20 fellow analysts, developers and testers**"

---

## Externe partners

| Partner | Domein |
|---------|--------|
| **element61** | Business Intelligence, data analytics |
| **Microsoft** | Azure · Power Platform · Business Central (dominant ecosysteem) |
| **TOPdesk** | ITSM SaaS-platform |
\n---\n
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
\n---\n
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
\n---\n
# Strategische Inzichten — ECS IT

> Analyse op basis van vacaturepatronen, bedrijfscijfers en publieke informatie.

---

## 1. Bewuste IT-professionalisering

ECS bouwt zijn IT-afdeling systematisch op — niet reactief, maar proactief.
De vacaturehistorie toont een duidelijke volgorde:

```
2023–2024  →  Application Delivery Manager aangeworven
              (softwareontwikkeling krijgt een hoofd)

2024–2025  →  IT Service Desk & Digital Solutions Manager
              (service desk en digital solutions krijgen een hoofd)

2025       →  Teamlead Data & AI gecreëerd
              (data wordt een volwaardig 4e IT-domein)

2026       →  Digital Solutions Expert + Software Developer + BI Analyst
              (de teams vullen op onder de nieuwe managers)
```

Dit is een **top-down opbouw**: eerst structuur creëren, dan invullen.

---

## 2. Vier IT-domeinen in wording

```
┌─────────────────────────────────────┐
│  APPLICATIE-LEVERING                │  Scrum-teams, .NET, Angular
│  Application Delivery Manager       │  DevOps, Azure-migratie
├─────────────────────────────────────┤
│  INFRASTRUCTUUR                     │  Azure, netwerk, security
│  Infrastructure Manager             │  DBA's, system engineers
├─────────────────────────────────────┤
│  DIGITAL SOLUTIONS & SERVICE DESK   │  Power Platform, RPA, TopDesk
│  IT SD & Digital Solutions Manager  │  2e-lijns support, business-IT brug
├─────────────────────────────────────┤
│  DATA & AI                          │  Power BI, T-SQL, data platform
│  Teamlead Data & AI (nieuw!)        │  BI analisten, data engineers
└─────────────────────────────────────┘
```

Elke pijler heeft (of krijgt) een eigen leider. Dit is een **volwassen IT-structuur**
voor een bedrijf van 654 medewerkers.

---

## 3. Microsoft-ecosysteem als strategische keuze

ECS gaat volledig voor Microsoft:

| Laag | Keuze |
|------|-------|
| ERP | Dynamics 365 Business Central |
| Cloud | Azure |
| BI | Power BI |
| Automatisering | Power Platform + Power Automate |
| AI | Copilot Studio (logische volgende stap) |
| Productiviteit | Microsoft 365 |

**Implicatie:** Elk nieuw Microsoft-product dat uitkomt (Azure AI Services,
Microsoft Fabric, Copilot Studio) is een directe kans voor ECS. Kennis van
het Microsoft-ecosysteem is hier structureel waardevol.

---

## 4. Interne softwareontwikkeling als kerncompetentie

ECS bouwt zelf:
- Twee klantportalen (.NET / Angular)
- Een groot intern operationeel platform (volledige transportketen)
- Specifieke integraties tussen TAS, WACS, Business Central en externe partijen

Dit is zeldzaam voor een logistiek bedrijf van deze schaal. Het IT-team
bezit diep logistiek domeinkennis die nergens anders te vinden is.

**Implicatie:** De IT-afdeling is geen cost center maar een **strategische
differentiator** — de software die ze bouwen is een concurrentievoordeel.

---

## 5. Data als nieuwe groeias

De aanmaak van een **Teamlead Data & AI**-rol signaleert een bewuste verschuiving:

```
Van: data als bijproduct van operaties
Naar: data als strategische asset
```

ECS heeft enorme logistieke datasets (zendingen, routes, leveranciers, klanten
over 31 landen). Die data benutten voor voorspellende analyses, optimalisatie
en klantinzichten is de volgende stap.

---

## 6. CEO-wissel creëert momentum

Richard de Haas (aangetreden oktober 2025) komt van DPD Belux — een bedrijf
dat digitale transformatie centraal stelt. Nieuwe CEO's willen typisch:
- Zichtbare resultaten boeken
- Digitale initiatieven versnellen
- De organisatie moderniseren

De timing van de Digital Solutions Expert-vacature (kort na zijn aantreden)
is geen toeval.

---

## 7. Lean IT = grote impact per persoon

- **~654 medewerkers**, ~20 IT = ratio van ~3%
- Elke IT-medewerker bedient gemiddeld **30+ collega's**
- De Digital Solutions Expert heeft scope over Finance, HR, Transport én IT

Voor iemand die impact wil maken en ownership zoekt: dit is het type omgeving
waar je snel veel leert en je werk direct terugziet in de business.

---

## 8. Logistiek domein: specifiek maar leerbaar

ECS werkt in intermodaal transport — een niche met eigen terminologie
(containers, TEU, incoterms, intermodal lanes, customs clearance).

De vacature vermeldt affiniteit met transport & logistiek als **pluspunt,
niet als vereiste**. ECS weet dat ze dit zelf kunnen aanleren. Wat ze
moeilijker intern aanleren: Power Platform-expertise, Azure-kennis,
analytisch vermogen.

---

## Samenvatting

```
ECS IT in één zin:
Een groeiend familiebedrijf in logistiek dat bewust transformeert
naar een data-gedreven, Microsoft-first, Agile-werkende IT-organisatie —
met de schaal om impact te hebben en de cultuur om te groeien.
```
\n---\n
# IT Vacatures — ECS European Containers

> Gebaseerd op ecs.be/careers en LinkedIn-vacaturepostings.
> Laatste check: juni 2026.

---

## Actief open (bevestigd op ecs.be)

### Digital Solutions Expert ⭐

| | |
|---|---|
| **Locatie** | Zeebrugge |
| **Type** | Bediende |
| **Bron** | [ecs.be/careers/jobs/digital-solutions-expert-0](https://www.ecs.be/en/careers/jobs/digital-solutions-expert-0) |
| **Solliciteren** | [ecs.hr-technologies.com/vacancies/131](https://ecs.hr-technologies.com/front/en/vacancies/131/apply) |

**Wat je doet:**
- Beheer en configuratie van het applicatieportfolio (Business Central, TAS, WACS, TopDesk, ...)
- Brug tussen business en IT: issues en kansen identificeren, vertalen naar oplossingen
- Proof of concepts en demo's bouwen
- Hyperautomation, RPA, Power Platform-flows ontwikkelen
- 2e-lijns support + opleiding en documentatie
- Integraties coördineren (API's, in-house apps, systeemconfiguraties)
- Meewerken aan system security (security-by-design)

**Gevraagd profiel:**

| Vereiste | Detail |
|----------|--------|
| Diploma | Bachelor of gelijkwaardig (business/IT) |
| Technisch | Power Platform · RPA · hyperautomation · chatbots |
| Data | T-SQL · Excel · Power BI |
| Talen | Nederlands + Engels |
| Plus | Business Central-kennis |
| Plus | Affiniteit met transport & logistiek |

---

### Software Developer (.NET / Angular)

| | |
|---|---|
| **Locatie** | Zeebrugge |
| **Type** | Bediende |
| **Bron** | [ecs.be/careers/jobs/software-developer](https://www.ecs.be/en/careers/jobs/software-developer) |
| **Solliciteren** | [ecs.hr-technologies.com/vacancies/145](https://ecs.hr-technologies.com/front/en/vacancies/145/apply) |

**Wat je doet:**
- Nieuwe applicaties bouwen in .NET en Angular
- Bestaande applicaties en interfaces onderhouden
- Complexe businessvragen omzetten in schaalbare IT-oplossingen

**Gevraagd profiel:**

| Vereiste | Detail |
|----------|--------|
| Ervaring | Minimum 3 jaar .NET |
| Backend | C# · ASP.NET Core · MS SQL Server · T-SQL |
| Frontend | Angular (of equivalent) |
| Cloud | Azure (of bereid te leren) |
| Plus | Kubernetes · Docker |
| Plus | Event Driven Architecture · Domain Driven Design |

---

## Recente LinkedIn-vacatures (recent actief)

| Rol | LinkedIn Job | Opmerkingen |
|-----|-------------|-------------|
| **BI Data Analyst** | [#4347663386](https://be.linkedin.com/jobs/view/bi-data-analyst-at-ecs-4347663386) | Power BI · T-SQL · data analyse |
| **Teamlead Data & AI** | [#4347595552](https://be.linkedin.com/jobs/view/teamlead-data-ai-at-ecs-4347595552) | Nieuwe managementlaag |
| **System Engineer** | [#4382083476](https://be.linkedin.com/jobs/view/system-engineer-at-ecs-4382083476) | Infra · service desk support |
| IT SD & Digital Solutions Mgr | [#4222297009](https://be.linkedin.com/jobs/view/it-service-desk-digital-solutions-manager-at-ecs-4222297009) | Managementrol service desk |
| Digital Project Analyst | [#4233728710](https://be.linkedin.com/jobs/view/digital-project-analyst-functioneel-technisch-at-ecs-4233728710) | Functioneel & technisch |

---

## Patroon: bewuste IT-opschaling

ECS heeft de afgelopen 2 jaar systematisch IT-management opgebouwd van buiten naar
binnen — eerst de managers, dan de specialisten:

```
Stap 1  →  Application Delivery Manager         (ingevuld ~2024)
Stap 2  →  Infrastructure Manager               (ingevuld, al langer)
Stap 3  →  IT Service Desk & Digital Mgr        (open / recent ingevuld)
Stap 4  →  Teamlead Data & AI                   (in aanwerving)
Stap 5  →  Digital Solutions Expert             (open ← nu)
            + Software Developer                 (open ← nu)
            + BI Data Analyst                    (recent open)
            + System Engineer                    (recent open)
```

**Conclusie:** Dit is geen ad hoc aanwerving — dit is een **gepland digitaal
transformatieprogramma** dat stap voor stap uitgerold wordt.

---

## Arbeidsvoorwaarden (uit vacaturebeschrijvingen)

ECS belooft in alle IT-vacatures:

- Dynamische werkomgeving met familiewaarden
- Aantrekkelijke verloning + extralegale voordelen
- Carrière- en groeimogelijkheden
- Interne en externe opleidingen
- Welzijnsgerichte bedrijfscultuur
- Teamactiviteiten na het werk
- **Kinderopvang op het HQ in Zeebrugge**
