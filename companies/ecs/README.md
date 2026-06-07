# ECS (Electronic Commerce Solutions) Suite

Welkom bij de centrale repository voor de ECS applicatie suite. Deze monorepo bevat alle componenten, van research en strategie tot de daadwerkelijke implementatie.

## Structuur

- **`apps/`**: Bevat de functionele applicaties.
  - **`ecoload/`**: De kern applicatie (Backend, Frontend, Simulator).
  - **`digital-twin/`**: Visualisatie en prototyping omgeving.
- **`docs/`**: Project documentatie en onderzoek.
  - **`research/`**: Marktonderzoek, strategie, organisatie en vacatures.
  - **`audit/`**: Digitale audits en rapportages.

## Aan de slag

### Prerequisites
- Docker & Docker Compose
- .NET 8 SDK (voor backend)
- Node.js & Angular CLI (voor frontend)

### Alles opstarten
Ga naar de ecoload map om de volledige stack te draaien:
```bash
cd apps/ecoload
docker-compose up --build
```

---
