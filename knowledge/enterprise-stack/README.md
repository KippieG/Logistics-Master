# Enterprise Tech Stack — Volledige Kennisbank & Gids

> **De complete gids voor enterprise software development — van beginner tot expert.**
> Geschreven door Philippe Godfroy, enterprise developer met jarenlange ervaring in logistiek, warehousing en IT.

---

## Wat is deze repo?

Dit is mijn **persoonlijke kennisbank** — een levend document dat ik bijhoud terwijl ik werk met enterprise systemen in de echte wereld. Geen theoretische blogpost, maar praktische kennis opgedaan door systemen te bouwen, kapot te maken, te debuggen en te verbeteren.

Of je nu:
- **Een junior developer bent** die wil begrijpen hoe enterprise software in elkaar zit
- **Een medior/senior developer bent** die specifieke patronen of oplossingen zoekt
- **Een analist of consultant bent** die wil begrijpen welke systemen waarom gebruikt worden
- **Een manager bent** die wil snappen wat zijn/haar IT-team doet

...dan vind je hier uitleg op jouw niveau.

---

## Over mij

Ik ben **Philippe Godfroy** — enterprise developer en systeem-architect met diepgaande kennis van de volledige Microsoft enterprise stack. Ik bouw backend systemen, frontend applicaties, BI-dashboards, automatiseringsoplossingen en integraties tussen ERP, WMS en TMS systemen.

Mijn dagelijkse werk bestaat uit:
- Systemen integreren die normaal niet met elkaar praten
- Processen automatiseren die mensen uren per dag kosten
- Data omzetten in inzichten via BI-dashboards
- Complexe logistieke workflows vertalen naar software

---

## De Tech Stack — Wat gebruik ik en waarom?

Elk systeem in een bedrijf heeft een reden van bestaan. Hier is het overzicht:

| Domein | Technologie | Waarom deze keuze? |
|--------|-------------|---------------------|
| 🔵 **Backend** | .NET · C# · ASP.NET Core | Microsoft-stack standaard, type-safe, enorm ecosysteem, uitstekende tooling |
| 🔴 **Frontend** | Angular | Enterprise-grade framework, opinionated structuur, ideaal voor grote teams |
| ☁️ **Cloud** | Azure | Naadloze integratie met Microsoft 365, Active Directory en .NET |
| 🗄️ **Database** | MS SQL Server · T-SQL | De relationele database in de Microsoft-wereld, krachtige query-engine |
| 🐳 **DevOps** | Docker · Kubernetes | Reproduceerbare omgevingen, schaalbaarheid, platform-onafhankelijkheid |
| 📊 **BI** | Power BI · T-SQL · Excel | Microsoft BI-suite, eenvoudig te koppelen aan SQL Server en BC |
| ⚙️ **Automation** | Power Platform · RPA · Chatbots | Low-code automatisering voor processen die geen full-code rechtvaardigen |
| 🏢 **ERP** | Business Central | Microsoft ERP voor MKB, uitbreidbaar via AL-code |
| 🎫 **ITSM** | TopDesk | ITSM-tool populair in Benelux, sterk in incidenten en wijzigingsbeheer |
| 🚛 **TMS** | TAS (Transport) | Gespecialiseerde TMS voor transportplanning en track & trace |
| 📦 **WMS** | WACS (Warehouse) | Gespecialiseerde WMS voor warehouseprocessen |

---

## Hoe werken deze systemen samen?

Dit is het grote plaatje — hoe data door een logistiek bedrijf stroomt:

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS CENTRAL (ERP)                       │
│     Klanten · Artikelen · Voorraad · Facturatie · Financiën     │
└──────────────┬──────────────────────────────┬───────────────────┘
               │ Verkooporders                 │ Voorraadmutaties
               ▼                              ▼
┌──────────────────────┐          ┌───────────────────────┐
│     WACS (WMS)       │◄────────►│      TAS (TMS)        │
│  Warehousing         │          │  Transport             │
│  - Ontvangst         │          │  - Transportorders     │
│  - Opslag            │          │  - Planning            │
│  - Picking           │          │  - Track & Trace       │
│  - Verzending        │          │  - Chauffeurs          │
└──────────────────────┘          └───────────────────────┘
               │                              │
               └──────────────┬───────────────┘
                              │ Data voor rapportage
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    POWER BI (BI)                                 │
│          Dashboards · KPI's · Operationele rapporten            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              CUSTOM APPLICATIES (.NET + Angular)                 │
│        Integratie-API's · Portalen · Specifieke tools           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    TOPDESK (ITSM)                                │
│         Incidenten · Wijzigingen · Assets · Selfservice         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              POWER PLATFORM (AUTOMATION)                        │
│    Flows · Apps · RPA · Chatbots die alles verbinden            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      AZURE (CLOUD)                              │
│    Hosting · Security · Messaging · Storage · CI/CD            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Navigeer de documentatie

### Voor beginners — begin hier

Als je nieuw bent met (een van) deze technologieën, begin dan bij de basisconcepten in elk hoofdstuk. Elk document begint met "Wat is dit?" en bouwt rustig op.

**Aanbevolen volgorde voor beginners:**
1. [Database (SQL)](docs/database/README.md) — de basis van alles
2. [Backend (.NET)](docs/backend/README.md) — hoe server-side code werkt
3. [Frontend (Angular)](docs/frontend/README.md) — hoe de gebruikersinterface werkt
4. [DevOps](docs/devops/README.md) — hoe applicaties uitgerold worden
5. [Cloud (Azure)](docs/cloud/README.md) — waar alles op draait

---

### 🔵 [Backend — .NET / C# / ASP.NET Core](docs/backend/README.md)

Het fundament van de server-kant. Hier bouw je de business logica, verwerk je data en stel je API's beschikbaar die de frontend en andere systemen aanroepen.

**Wat je leert:** Clean Architecture · REST API's · Dependency Injection · Entity Framework · CQRS · Middleware · Testing

---

### 🔴 [Frontend — Angular](docs/frontend/README.md)

Wat de gebruiker ziet en aanklikt. Angular is het framework waarmee je rijke, interactieve webapplicaties bouwt die communiceren met de backend.

**Wat je leert:** Components · Services · RxJS · Routing · Forms · State Management · Best Practices

---

### ☁️ [Cloud — Azure](docs/cloud/README.md)

De infrastructuur waarop alles draait. Azure biedt hosting, opslag, beveiliging, messaging en nog veel meer als beheerde diensten.

**Wat je leert:** Azure services · Deployment · Key Vault · Service Bus · Monitoring · Migratie van on-prem

---

### 🗄️ [Database — MS SQL Server / T-SQL](docs/database/README.md)

De motor achter alle data. Hier leer je hoe je data efficiënt opslaat, ophaalt en manipuleert met T-SQL.

**Wat je leert:** Queries · Joins · Stored Procedures · Indexen · Performantie · Schema design · Window functions

---

### 🐳 [DevOps — Docker / Kubernetes](docs/devops/README.md)

Hoe applicaties gebouwd, verpakt en uitgerold worden — reproduceerbaar en schaalbaar.

**Wat je leert:** Containers · Dockerfiles · Docker Compose · Kubernetes · CI/CD pipelines · Deployments

---

### 📊 [BI — Power BI · T-SQL · Excel](docs/bi/README.md)

Data omzetten in inzichten. Met Power BI bouw je dashboards die managers en operatoren helpen beslissingen te nemen.

**Wat je leert:** Data modellering · DAX · Power Query · T-SQL voor rapportage · Excel integratie

---

### ⚙️ [Automation — Power Platform · RPA · Chatbots](docs/automation/README.md)

Repetitief handwerk elimineren. Van eenvoudige flows tot complexe RPA-robots die legacy systemen bedienen.

**Wat je leert:** Power Automate · Desktop flows (RPA) · Copilot Studio · Power Apps · Governance

---

### 🏢 [ERP — Business Central](docs/erp/README.md)

Het kloppende hart van het bedrijf. Business Central beheert alles van klanten en leveranciers tot voorraad en facturatie.

**Wat je leert:** AL-code · Extensions · API's · Integraties · Event-driven patronen · Lifecycle

---

### 🎫 [ITSM — TopDesk](docs/itsm/README.md)

IT Service Management — hoe IT-teams incidenten, wijzigingen en assets beheren op een gestructureerde manier.

**Wat je leert:** Incidentbeheer · SLA · Wijzigingsbeheer · REST API · Integraties · Best practices

---

### 🚛 [TMS — TAS (Transport)](docs/tms/README.md)

Transport Management — hoe transportorders gepland, uitgevoerd en getrackt worden van depot tot klant.

**Wat je leert:** TMS datamodel · Planning · Route optimalisatie · Track & Trace · Integraties met WMS en ERP

---

### 📦 [WMS — WACS (Warehouse)](docs/wms/README.md)

Warehouse Management — hoe goederen ontvangen, opgeslagen, gepickt en verzonden worden in een magazijn.

**Wat je leert:** WMS processen · Locatiebeheer · FIFO/FEFO · Picking strategieën · Cyclustellingen · Integraties

---

## Begrippen die je overal tegenkomt

### API (Application Programming Interface)
Een API is een afspraak tussen twee systemen over hoe ze communiceren. Denk aan een ober in een restaurant: jij (de client) vraagt iets, de ober (de API) brengt het bericht naar de keuken (de server) en brengt het resultaat terug.

### Integratie
Twee systemen laten samenwerken. WACS (WMS) en TAS (TMS) moeten weten wanneer een order klaar is om te laden — dat is integratie. Meestal via API's of berichtenwachtrijen.

### Event-driven
In plaats van systeem A dat continu vraagt "is er al iets nieuws?", stuurt systeem B een bericht op het moment dat iets gebeurt. Efficiënter, schaalbaarder.

### Container / Docker
Een container is een pakketje met je applicatie én alles wat het nodig heeft om te draaien — libraries, configuratie, etc. Vergelijk het met een koelcontainer: de inhoud is altijd hetzelfde, ongeacht welk schip hem vervoert.

### CI/CD (Continuous Integration / Continuous Deployment)
Automatisch bouwen, testen en uitrollen van code zodra een ontwikkelaar iets pusht naar Git. Vermindert handmatige fouten en verkort de doorlooptijd van idee tot productie.

---

## Hoe gebruik je deze repo optimaal?

1. **Zoek gericht**: gebruik GitHub's zoekfunctie (druk op `/`) om door alle docs te zoeken
2. **Leer stap voor stap**: volg de aanbevolen volgorde als je nieuw bent
3. **Gebruik als referentie**: snel een query of code snippet opzoeken tijdens je werk
4. **Stel vragen**: open een GitHub Issue als je iets onduidelijk vindt of wilt aanvullen
5. **Draag bij**: pull requests zijn welkom — jij weet ook dingen die hier nog niet in staan

---

## Licentie

**MIT** — Vrij te gebruiken, kopiëren en aanpassen. Enige voorwaarde: vermelding van de originele auteur.

---

*Philippe Godfroy · [GitHub @KippieG](https://github.com/KippieG) · Laatste update: 2026*
