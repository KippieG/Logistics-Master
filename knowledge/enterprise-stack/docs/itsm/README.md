# ITSM — TopDesk

## Wat is ITSM en waarom TopDesk?

**ITSM (IT Service Management)** is de manier waarop een IT-afdeling haar diensten structureert, levert en verbetert. Het gaat over hoe je omgaat met problemen, vragen en veranderingen op een gecontroleerde, traceerbare manier.

**Zonder ITSM:**
- Meldingen per e-mail, telefoon, Teams — verspreid over overal
- Geen overzicht: wat staat er open, wie werkt eraan?
- Geen prioritering: alles is even urgent
- Geen SLA bewaking: je weet niet of je op tijd bent
- Geen kennisopbouw: elk probleem wordt elke keer opnieuw opgelost

**Met TopDesk:**
- Alle meldingen op één plek, gecategoriseerd en geprioriteerd
- Behandelaars weten wat ze moeten doen en wanneer
- SLA timers lopen automatisch
- Kennisbank voor snellere oplossingen
- Rapportages voor continue verbetering

**TopDesk** is marktleider in de Benelux en populair in de publieke sector, industrie en logistiek. Het ondersteunt ITIL best practices maar dwingt ze niet rigide op.

---

## Incidentbeheer — De dagelijkse kern

### Wat is een incident?

Een **incident** is elke verstoring van een normale IT-dienst, of een dreiging daartoe. Een printer die niet werkt, een applicatie die traag is, een gebruiker die niet kan inloggen — dat zijn allemaal incidenten.

### Het incidentbeheerproces stap voor stap

```
STAP 1: MELDING ONTVANGEN
  Via: selfservice portal · e-mail · telefoon · monitoring-alert

  Medewerker of systeem maakt het incident aan met:
  - Korte beschrijving (wat gaat er mis)
  - Melder gegevens
  - Tijdstip van melden
  - Betrokken CI (Configuration Item: de server, laptop, applicatie)

STAP 2: CLASSIFICEREN
  1e lijn behandelaar:
  ├── Categorie: Hardware / Software / Netwerk / Toegang / ...
  ├── Subcategorie: bijv. Software > ERP > Business Central
  ├── CI koppelen (welk specifiek systeem/apparaat)
  └── Prioriteit bepalen (zie prioriteitsmatrix hieronder)

STAP 3: DIAGNOSTICEREN EN OPLOSSEN
  1e lijn probeert zelf op te lossen:
  ├── Kennisbank raadplegen
  ├── Remote verbinding maken
  └── Standaard handelingen uitvoeren

  Niet opgelost → Escaleren naar 2e lijn / Leverancier
  ├── Alle bekende info meegeven
  ├── Status bijhouden in TopDesk
  └── Melder op hoogte houden

STAP 4: AFSLUITEN
  ├── Oplossing beschrijven (voor kennisbank)
  ├── CI bijwerken indien nodig
  ├── Melder bevestigt of auto-sluiting na X dagen
  └── Feedback/tevredenheidsscore
```

### Prioriteitsmatrix

De prioriteit bepaalt hoe snel je moet reageren. Prioriteit = Impact × Urgentie.

```
                    URGENTIE
                    Laag     Middel   Hoog     Kritisch
              ┌────────────────────────────────────────┐
  I  Individu │  P4      │  P4    │  P3    │  P2      │
  M  Afdeling │  P4      │  P3    │  P2    │  P1      │
  P  Bedrijf  │  P3      │  P2    │  P1    │  P1      │
  A  Extern   │  P2      │  P1    │  P1    │  P1      │
  C
  T
              └────────────────────────────────────────┘

P1 — Kritisch:  Reactietijd 15 min · Oplossingstijd 4 uur
P2 — Hoog:      Reactietijd 1 uur  · Oplossingstijd 8 werkuren
P3 — Middel:    Reactietijd 4 uur  · Oplossingstijd 3 werkdagen
P4 — Laag:      Reactietijd 1 dag  · Oplossingstijd 5 werkdagen
```

---

## TopDesk REST API

TopDesk heeft een volledige REST API waarmee je incidenten, changes en assets kan aanmaken en beheren vanuit externe systemen. Dit is essentieel voor integraties met monitoring tools, BC, WACS en TAS.

### Authenticatie

```http
# Optie 1: Basic Auth (gebruikersnaam + app-wachtwoord)
Authorization: Basic base64(gebruikersnaam:app-wachtwoord)

# NIET je normale wachtwoord! Maak een "Application Password" aan
# in TopDesk: Mijn Account → Application Passwords → Toevoegen

# Optie 2: API Token (voor integraties)
Authorization: TOKEN <jouw-token>
```

### Incident aanmaken

```http
POST https://jouwbedrijf.topdesk.net/tas/api/incidents
Authorization: Basic <credentials>
Content-Type: application/json

{
  "status": "firstLine",
  "briefDescription": "Business Central geeft foutmelding bij factuur boeken",
  "request": "Gebruiker meldt dat BC een foutmelding geeft bij het boeken van verkoopfactuur voor klant BV0042. Foutmelding: 'Posting Date is not within your range of allowed posting dates'. Probleem begon om 09:15 na de maandafsluiting.",
  "category": {
    "name": "Software"
  },
  "subcategory": {
    "name": "Business Central"
  },
  "callType": {
    "name": "Incident"
  },
  "entryType": {
    "name": "Selfservice Portal"
  },
  "impact": {
    "name": "Department"
  },
  "urgency": {
    "name": "Normal"
  },
  "priority": {
    "name": "P2"
  },
  "caller": {
    "email": "jan.janssen@bedrijf.be",
    "dynamicName": "Jan Janssen"
  },
  "object": {
    "name": "Business Central PROD"
  },
  "externalNumber": "BC-ERR-2026-001"
}
```

### Response

```json
{
  "id": "a2f3b4c5-d6e7-8901-abcd-ef0123456789",
  "status": "firstLine",
  "number": "I 2026-00142",
  "briefDescription": "Business Central geeft foutmelding bij factuur boeken",
  "callDate": "2026-06-03T09:30:00Z",
  "category": { "name": "Software" },
  "priority": { "name": "P2" },
  "targetDate": "2026-06-03T17:30:00Z"
}
```

### Incident bijwerken — Progress bijhouden

```http
PATCH https://jouwbedrijf.topdesk.net/tas/api/incidents/id/{incident-id}
Authorization: Basic <credentials>
Content-Type: application/json

{
  "action": "Remote verbinding gemaakt. Probleem gevonden: de Allowed Posting Dates zijn niet bijgewerkt na de maandafsluiting. Oplossing: posting dates bijwerken in BC voor alle gebruikers.",
  "actionInvisibleForCaller": false,
  "operator": {
    "id": "operateur-uuid"
  },
  "status": "secondLine"
}
```

### Afsluiten

```http
PATCH https://jouwbedrijf.topdesk.net/tas/api/incidents/id/{incident-id}
Authorization: Basic <credentials>
Content-Type: application/json

{
  "action": "Posting dates zijn bijgewerkt voor alle gebruikers in BC. Gebruiker bevestigt dat facturen nu geboekt kunnen worden.",
  "status": "resolved",
  "closingReason": {
    "name": "Opgelost door IT"
  }
}
```

---

## Integratie met .NET — TopDesk Service

```csharp
// Services/TopDeskService.cs
public interface ITopDeskService
{
    Task<string> CreateIncidentAsync(CreateIncidentDto dto);
    Task<TopDeskIncidentDto?> GetIncidentAsync(string id);
    Task AddActionAsync(string id, string action, bool visibleForCaller = true);
    Task CloseIncidentAsync(string id, string resolution);
    Task<List<TopDeskIncidentDto>> GetOpenIncidentsAsync();
}

public class TopDeskService : ITopDeskService
{
    private readonly HttpClient _http;
    private readonly IOptions<TopDeskSettings> _settings;
    private readonly ILogger<TopDeskService> _logger;

    public TopDeskService(
        HttpClient http,
        IOptions<TopDeskSettings> settings,
        ILogger<TopDeskService> logger)
    {
        _http = http;
        _settings = settings;
        _logger = logger;

        // Basic auth header samenstellen
        var credentials = Convert.ToBase64String(
            Encoding.UTF8.GetBytes(
                $"{settings.Value.Username}:{settings.Value.AppPassword}"));

        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Basic", credentials);

        _http.BaseAddress = new Uri(settings.Value.BaseUrl);
    }

    public async Task<string> CreateIncidentAsync(CreateIncidentDto dto)
    {
        var payload = new
        {
            status = "firstLine",
            briefDescription = dto.Subject.Length > 80
                ? dto.Subject[..77] + "..."    // TopDesk max 80 tekens
                : dto.Subject,
            request = dto.Description,
            category = new { name = dto.Category },
            subcategory = new { name = dto.SubCategory },
            callType = new { name = dto.CallType ?? "Incident" },
            impact = new { name = dto.Impact ?? "Person" },
            urgency = new { name = dto.Urgency ?? "Normal" },
            priority = new { name = dto.Priority },
            caller = new
            {
                email = dto.CallerEmail,
                dynamicName = dto.CallerName
            },
            externalNumber = dto.ExternalReference
        };

        var response = await _http.PostAsJsonAsync("/tas/api/incidents", payload);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError(
                "TopDesk incident aanmaken gefaald ({StatusCode}): {Error}",
                response.StatusCode, error);
            throw new TopDeskException($"Incident aanmaken gefaald: {error}");
        }

        var result = await response.Content.ReadFromJsonAsync<JsonElement>();
        var incidentId = result.GetProperty("id").GetString()!;
        var incidentNumber = result.GetProperty("number").GetString()!;

        _logger.LogInformation(
            "TopDesk incident aangemaakt: {Number} (ID: {Id})",
            incidentNumber, incidentId);

        return incidentId;
    }

    public async Task<TopDeskIncidentDto?> GetIncidentAsync(string id)
    {
        var response = await _http.GetAsync($"/tas/api/incidents/id/{id}");

        if (response.StatusCode == HttpStatusCode.NotFound) return null;

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<TopDeskIncidentDto>();
    }

    public async Task AddActionAsync(string id, string action, bool visibleForCaller = true)
    {
        var payload = new
        {
            action,
            actionInvisibleForCaller = !visibleForCaller
        };

        var response = await _http.PatchAsJsonAsync(
            $"/tas/api/incidents/id/{id}", payload);

        response.EnsureSuccessStatusCode();
    }

    public async Task CloseIncidentAsync(string id, string resolution)
    {
        var payload = new
        {
            action = resolution,
            status = "resolved"
        };

        var response = await _http.PatchAsJsonAsync(
            $"/tas/api/incidents/id/{id}", payload);

        response.EnsureSuccessStatusCode();
    }

    public async Task<List<TopDeskIncidentDto>> GetOpenIncidentsAsync()
    {
        var response = await _http.GetAsync(
            "/tas/api/incidents?status=firstLine&status=secondLine&page_size=100");

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<List<TopDeskIncidentDto>>();
        return result ?? [];
    }
}
```

### Registreren in DI

```csharp
// Program.cs of Infrastructure/DependencyInjection.cs
builder.Services.Configure<TopDeskSettings>(
    builder.Configuration.GetSection("TopDesk"));

builder.Services.AddHttpClient<ITopDeskService, TopDeskService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
})
.AddPolicyHandler(GetRetryPolicy());  // Retry bij netwerkstoringen

static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
    => HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(3, retryAttempt =>
            TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

// appsettings.json
{
  "TopDesk": {
    "BaseUrl": "https://jouwbedrijf.topdesk.net",
    "Username": "integratie-gebruiker@bedrijf.be",
    "AppPassword": "vanuit-key-vault"
  }
}
```

---

## Monitoring Integratie — Automatisch Incidenten Aanmaken

Een krachtige toepassing: koppel Azure Monitor of Application Insights aan TopDesk zodat alerts automatisch incidenten aanmaken.

```csharp
// API/Controllers/MonitoringWebhookController.cs
[ApiController]
[Route("api/webhooks/monitoring")]
public class MonitoringWebhookController : ControllerBase
{
    private readonly ITopDeskService _topDesk;
    private readonly ILogger<MonitoringWebhookController> _logger;

    public MonitoringWebhookController(
        ITopDeskService topDesk,
        ILogger<MonitoringWebhookController> logger)
    {
        _topDesk = topDesk;
        _logger = logger;
    }

    // Azure Monitor stuurt een webhook als een alert afgaat
    [HttpPost("azure-monitor")]
    public async Task<IActionResult> AzureMonitorAlert(
        [FromBody] AzureMonitorAlertPayload payload)
    {
        if (payload.Data?.Essentials?.AlertState != "Fired")
            return Ok("Alert niet in Fired staat, overgeslagen.");

        var alert = payload.Data.Essentials;

        var dto = new CreateIncidentDto
        {
            Subject = $"[AUTO] {alert.AlertRuleName}",
            Description = $"""
                Automatisch incident aangemaakt door Azure Monitor.

                Alert: {alert.AlertRuleName}
                Ernst: {alert.Severity}
                Conditie: {alert.MonitorCondition}
                Getroffen resource: {alert.TargetResourceName}
                Tijdstip: {alert.FiredDateTime:dd/MM/yyyy HH:mm:ss}

                Omschrijving: {alert.Description}
                """,
            Category = "Software",
            SubCategory = "Azure Monitoring",
            Priority = MapSeverityToPriority(alert.Severity),
            CallerEmail = "monitoring@bedrijf.be",
            CallerName = "Azure Monitor (automatisch)",
            ExternalReference = alert.AlertId
        };

        try
        {
            var incidentId = await _topDesk.CreateIncidentAsync(dto);
            _logger.LogInformation(
                "TopDesk incident aangemaakt voor Azure Monitor alert {AlertId}: {IncidentId}",
                alert.AlertId, incidentId);

            return Ok(new { incidentId });
        }
        catch (TopDeskException ex)
        {
            _logger.LogError(ex, "Kon TopDesk incident niet aanmaken voor alert {AlertId}", alert.AlertId);
            return StatusCode(500, ex.Message);
        }
    }

    private static string MapSeverityToPriority(string severity) => severity switch
    {
        "Sev0" or "Sev1" => "P1",
        "Sev2" => "P2",
        "Sev3" => "P3",
        _ => "P4"
    };
}
```

---

## Wijzigingsbeheer — Gecontroleerde Wijzigingen

**Wijzigingsbeheer (Change Management)** zorgt dat aanpassingen aan systemen gecontroleerd, goedgekeurd en gedocumenteerd verlopen. Doel: voorkomen dat een slecht geplande wijziging nieuwe incidenten veroorzaakt.

### RFC (Request for Change) — Vereiste informatie

```
RFC: Upgraden Business Central naar versie 24

BESCHRIJVING:
  Wat: Upgrade van Business Central 23.x naar 24.0
  Wanneer: Zaterdag 14/06/2026, 22:00 - 02:00
  Wie voert uit: IT team + Microsoft partner

IMPACT ANALYSE:
  Getroffen systemen: Business Central, Power BI datasources,
                      WACS-BC integratie, TAS-BC integratie
  Betrokken gebruikers: Alle BC gebruikers (ca. 45 personen)
  Downtime: Geschat 2 uur (22:00 - 00:00)

RISICO BEOORDELING:
  Risico niveau: Middel
  Risico's:
  - Bestaande extensies mogelijk niet compatibel met v24
  - Power BI rapportages kunnen tijdelijk niet vernieuwen
  Mitigaties:
  - Extensies getest in sandbox op v24 (resultaat: OK)
  - Power BI geconfigureerd met 4u retry interval

UITVOERINGSPLAN:
  1. 22:00 — Gebruikers uitloggen, BC in maintenance mode
  2. 22:05 — Backup van productiedatabase nemen
  3. 22:15 — BC upgrade starten via Admin Center
  4. 00:00 — Upgrade gereed: functionele tests uitvoeren
  5. 00:30 — Groene licht: BC openzetten voor gebruikers
  6. 01:00 — Monitoring: controleer logs en performance

ROLL-BACK PLAN:
  Bij problemen vóór 00:00: Restore van de backup (30 min)
  Bij problemen na 00:00: RFC registreren voor nieuwe change

ACCEPTATIECRITERIA:
  - BC v24 volledig operationeel
  - Alle extensies werken correct
  - WACS en TAS integraties gesynchroniseerd
  - 0 kritieke fouten in logs na 30 minuten gebruik
```

---

## Assetbeheer — Configuratie Items

**Configuration Items (CI's)** zijn alle IT-assets die TopDesk bijhoudt: servers, laptops, software, netwerkapparatuur.

```
CI Types:
  Hardware:
    Servers (fysiek en virtueel)
    Laptops / Desktops
    Netwerkapparatuur (switches, routers)
    Printers

  Software:
    Applicaties (Business Central, TAS, WACS)
    Licenties
    SaaS diensten

  Diensten:
    Internetverbinding
    VPN
    E-maildienst

CI Relaties:
  "Business Central PROD" runt op "Azure App Service myapp-api"
  "Azure App Service myapp-api" is afhankelijk van "Azure SQL myapp-db"
  "WACS" integreert met "Business Central PROD" en "TAS"

→ Bij een incident op "Azure SQL myapp-db" zie je direct welke diensten getroffen zijn
```

---

## Kennisbank — Sneller Oplossen

Elke keer dat een probleem opgelost is, schrijf je een **kennisbankartikel**. Volgende keer dat het probleem optreedt, vindt de behandelaar de oplossing in seconden.

**Structuur van een goed kennisbankartikel:**

```markdown
TITEL: Business Central — "Posting Date is not within allowed range" fout

SYMPTOMEN:
Gebruiker krijgt foutmelding bij het boeken van een factuur of boeking:
"Posting Date DATUM is not within your range of allowed posting dates."

OORZAAK:
De toegestane boekingsperiode is niet bijgewerkt. Dit gebeurt typisch aan
het begin van een nieuwe maand of na een maandafsluiting.

OPLOSSING:
1. Ga naar BC: Zoeken → "Gebruikersinstellingen"
2. Zoek de gebruiker die de fout meldt
3. Controleer de velden "Boeken toegestaan van" en "Boeken toegestaan tot"
4. Pas de data aan naar de huidige boekingsperiode
   (bijv. 01/06/2026 tot 30/06/2026)
5. Sla op en vraag gebruiker opnieuw te proberen

PREVENTIE:
Stel een maandelijkse taak in bij de boekhouding om de boekingsperiodes
bij te werken aan het begin van elke maand.

GERELATEERDE CI's: Business Central PROD
CATEGORIE: Software > Business Central > Financiën
GELDIGHEID: Permanent
```

---

## KPI's — ITSM Prestaties Meten

```sql
-- Voorbeeld KPI rapport (als je BC of Power BI op TopDesk data koppelt)

-- SLA nalevingspercentage per prioriteit
SELECT
    Priority,
    COUNT(*) AS TotaalIncidenten,
    SUM(CASE WHEN ResolvedWithinSLA = 1 THEN 1 ELSE 0 END) AS OpTijdOpgelost,
    ROUND(
        SUM(CASE WHEN ResolvedWithinSLA = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1
    ) AS SLANalevingPct
FROM Incidents
WHERE CallDate >= DATEADD(MONTH, -1, GETDATE())
  AND Status = 'Closed'
GROUP BY Priority
ORDER BY Priority;

-- First Call Resolution rate
SELECT
    ROUND(
        SUM(CASE WHEN EscalatedTo2ndLine = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1
    ) AS FCR_Pct
FROM Incidents
WHERE CallDate >= DATEADD(MONTH, -1, GETDATE());

-- Gemiddelde doorlooptijd per categorie
SELECT
    Category,
    COUNT(*) AS AantalIncidenten,
    AVG(DATEDIFF(HOUR, CallDate, ClosedDate)) AS GemiddeldUrenTotSluiting
FROM Incidents
WHERE Status = 'Closed'
  AND CallDate >= DATEADD(MONTH, -3, GETDATE())
GROUP BY Category
ORDER BY GemiddeldUrenTotSluiting DESC;
```

---

*[← Terug naar overzicht](../../README.md)*
