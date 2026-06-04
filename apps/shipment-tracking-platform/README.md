# Shipment Tracking Platform

Een volledig uitgewerkt .NET 8 platform voor het digitaliseren en opvolgen van logistieke zendingen.  
Gebouwd met **Clean Architecture**, **CQRS via MediatR**, **Azure-integraties** en een **.NET MAUI** mobiele client.

---

## Architectuur

```
┌─────────────────────────────────────────────────────────┐
│                        Clients                          │
│  REST / Swagger      .NET MAUI App     Webhook consumer │
└──────────────┬───────────────┬──────────────────────────┘
               │               │
┌──────────────▼───────────────▼──────────────────────────┐
│               ASP.NET Core 8 WebAPI                     │
│         Controllers · JWT Auth · Serilog                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│  │    Domain    │ │ Application  │ │ Infrastructure   │ │
│  │  Entities    │ │  MediatR     │ │  EF Core / SQL   │ │
│  │  Enums       │ │  CQRS        │ │  Azure Services  │ │
│  │  Value Obj.  │ │  Validators  │ │  Repositories    │ │
│  └──────────────┘ └──────────────┘ └──────────────────┘ │
└──────────────────────────────────┬──────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────┐
│                     Azure                               │
│  Azure SQL DB    Service Bus    Blob Storage  Key Vault │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Laag | Technologie |
|------|-------------|
| API | ASP.NET Core 8, C# 12 |
| CQRS | MediatR 12 |
| Validatie | FluentValidation |
| ORM | Entity Framework Core 8 |
| Database | Azure SQL / SQL Server |
| Messaging | Azure Service Bus |
| Opslag | Azure Blob Storage |
| Auth | JWT Bearer tokens |
| Logging | Serilog → Azure Application Insights |
| Tests | xUnit, Moq, FluentAssertions, WebApplicationFactory |
| Mobile | .NET MAUI |
| CI/CD | GitHub Actions |

---

## Aan de slag

### Vereisten
- .NET 8 SDK
- Docker (voor lokale SQL Server)
- Azure subscription (optioneel — lokale emulators werken ook)

### Lokaal opstarten

```bash
# 1. Kloon de repo
git clone https://github.com/jouw-naam/shipment-tracking-platform.git
cd shipment-tracking-platform

# 2. Start SQL Server via Docker
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Dev@12345!" \
  -p 1433:1433 --name sql-dev -d mcr.microsoft.com/mssql/server:2022-latest

# 3. Pas de connection string aan in appsettings.Development.json

# 4. Run migraties
dotnet ef database update --project src/Infrastructure --startup-project src/WebAPI

# 5. Start de API
dotnet run --project src/WebAPI

# 6. Open Swagger
# https://localhost:5001/swagger
```

### Environment variables

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ShipmentDb;User Id=sa;Password=Dev@12345!;TrustServerCertificate=true"
  },
  "JwtSettings": {
    "Secret": "jouw-super-geheime-jwt-sleutel-minimaal-32-chars",
    "Issuer": "ShipmentTrackingPlatform",
    "Audience": "ShipmentTrackingClients",
    "ExpiryMinutes": 60
  },
  "Azure": {
    "ServiceBus": {
      "ConnectionString": "",
      "ShipmentEventsQueue": "shipment-events"
    },
    "BlobStorage": {
      "ConnectionString": "",
      "DocumentsContainer": "shipment-documents"
    }
  }
}
```

---

## API Endpoints

### Shipments
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| `POST` | `/api/shipments` | Nieuwe zending aanmaken |
| `GET` | `/api/shipments` | Lijst van zendingen (gefilterd) |
| `GET` | `/api/shipments/{id}` | Detail van één zending |
| `PUT` | `/api/shipments/{id}/status` | Status bijwerken |
| `DELETE` | `/api/shipments/{id}` | Zending annuleren |

### Documenten
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| `POST` | `/api/shipments/{id}/documents` | Document uploaden |
| `GET` | `/api/shipments/{id}/documents` | Documenten opvragen |
| `GET` | `/api/documents/{id}/download` | Document downloaden |

### Auth
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| `POST` | `/api/auth/login` | JWT token ophalen |
| `POST` | `/api/auth/register` | Gebruiker registreren |

---

## Project structuur

```
src/
├── Domain/                         # Businesslogica — geen externe dependencies
│   ├── Entities/
│   │   ├── Shipment.cs
│   │   ├── ShipmentStatusHistory.cs
│   │   └── Document.cs
│   ├── Enums/
│   │   └── ShipmentStatus.cs
│   ├── ValueObjects/
│   │   └── TrackingNumber.cs
│   └── Exceptions/
│       └── DomainException.cs
│
├── Application/                    # Use cases — afhankelijk van Domain
│   ├── Common/
│   │   ├── Interfaces/             # IShipmentRepository, IBlobStorageService...
│   │   ├── Behaviours/             # Logging, Validation pipeline behaviours
│   │   └── Mappings/               # AutoMapper profiles
│   └── Features/
│       ├── Shipments/
│       │   ├── Commands/           # CreateShipment, UpdateStatus, Delete
│       │   └── Queries/            # GetShipment, GetShipments (gefilterd)
│       └── Documents/
│           ├── Commands/           # UploadDocument
│           └── Queries/            # GetDocuments
│
├── Infrastructure/                 # Externe systemen
│   ├── Persistence/
│   │   ├── ApplicationDbContext.cs
│   │   ├── Configurations/         # EF Core Fluent API per entity
│   │   └── Migrations/
│   ├── Repositories/               # Concrete implementaties
│   └── Services/
│       ├── Azure/                  # BlobStorageService, ServiceBusPublisher
│       └── Auth/                   # JwtTokenService
│
└── WebAPI/                         # Entry point
    ├── Controllers/
    ├── Middleware/                  # GlobalExceptionHandler
    └── Extensions/                 # DI registratie per laag

mobile/
└── ShipmentApp.Maui/              # .NET MAUI cross-platform app

tests/
├── Unit/                          # xUnit + Moq — snel, geïsoleerd
└── Integration/                   # WebApplicationFactory — end-to-end
```

---

## Architectuurbeslissingen (ADR)

### ADR-001: Clean Architecture
**Beslissing:** Domain en Application kennen geen Infrastructure.  
**Reden:** Testbaarheid en vervangbaarheid van externe systemen (mock Azure services in tests).

### ADR-002: CQRS via MediatR
**Beslissing:** Elke use case is een aparte Command of Query class.  
**Reden:** Duidelijke verantwoordelijkheden, eenvoudig uitbreidbaar zonder bestaande code te breken.

### ADR-003: Repository pattern
**Beslissing:** Geen directe EF Core DbContext in Application-laag.  
**Reden:** Application definieert interfaces, Infrastructure implementeert ze — betere testbaarheid.

### ADR-004: Soft delete
**Beslissing:** Zendingen worden nooit fysiek verwijderd (`IsDeleted` flag + query filter).  
**Reden:** Audit trail voor logistieke compliance.

---

## CI/CD

GitHub Actions pipeline draait automatisch bij elke push:
1. Build de solution
2. Run alle unit- en integratietests
3. Publiceer test coverage badge

[![CI](https://github.com/jouw-naam/shipment-tracking-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/jouw-naam/shipment-tracking-platform/actions)

---

## Roadmap

- [ ] SignalR voor real-time statusupdates
- [ ] Background worker voor Service Bus events
- [ ] .NET MAUI offline-first met sync
- [ ] Azure Container Apps deployment
- [ ] Rate limiting & API versioning
