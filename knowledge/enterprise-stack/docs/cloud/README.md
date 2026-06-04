# Cloud — Azure

## Wat is Cloud en waarom Azure?

**Cloud computing** betekent dat je servers, opslag, databases en netwerken huurt van een externe provider in plaats van ze zelf te bezitten. Je betaalt voor wat je gebruikt, schaalt op of af wanneer nodig, en de provider beheert de hardware.

**Microsoft Azure** is het cloud platform van Microsoft — de derde grootste ter wereld, na AWS en Google Cloud. Voor bedrijven die al in de Microsoft-stack werken is het de logische keuze:

- Naadloze integratie met Active Directory, Microsoft 365, Business Central
- .NET applicaties draaien native op Azure
- Azure DevOps voor CI/CD pipelines
- Azure SQL is gewoon SQL Server in de cloud
- Één leverancier, één contract, één ondersteuningskanaal

---

## Cloud modellen — Wat huur je precies?

```
ON-PREMISES (alles zelf)
┌─────────────────────────────────┐
│  Applicatie (jij beheert)       │
│  Runtime (jij beheert)          │
│  OS (jij beheert)               │
│  Virtualisatie (jij beheert)    │
│  Servers (jij koopt)            │
│  Netwerk (jij beheert)          │
│  Datacenter (jij beheert)       │
└─────────────────────────────────┘

IaaS — Infrastructure as a Service (Azure VM)
┌─────────────────────────────────┐
│  Applicatie (jij beheert)       │
│  Runtime (jij beheert)          │
│  OS (jij beheert)               │
│  Virtualisatie (Azure beheert)  │ ← Grens
│  Servers (Azure beheert)        │
│  Netwerk (Azure beheert)        │
│  Datacenter (Azure beheert)     │
└─────────────────────────────────┘

PaaS — Platform as a Service (App Service, Azure SQL)
┌─────────────────────────────────┐
│  Applicatie (jij beheert)       │
│  Runtime (Azure beheert)        │ ← Grens
│  OS (Azure beheert)             │
│  Virtualisatie (Azure beheert)  │
│  Servers (Azure beheert)        │
│  Netwerk (Azure beheert)        │
│  Datacenter (Azure beheert)     │
└─────────────────────────────────┘

SaaS — Software as a Service (Microsoft 365, Dynamics 365)
  Alles beheerd door provider — jij logt gewoon in
```

---

## Kernservices — Wat gebruik je wanneer?

| Service | Wat is het? | Gebruik het voor |
|---------|------------|-----------------|
| **App Service** | Managed hosting voor web apps | .NET API's, Angular apps deployen zonder servers te beheren |
| **Azure Kubernetes Service** | Managed Kubernetes cluster | Containerized workloads op schaal |
| **Azure SQL Database** | Managed SQL Server | Productiedatabase zonder serverbeheer |
| **Azure Key Vault** | Secrets manager | API keys, wachtwoorden, certificaten veilig opslaan |
| **Azure Blob Storage** | Objectopslag | Bestanden, documenten, backups, afbeeldingen |
| **Azure Service Bus** | Enterprise messaging | Async communicatie tussen services |
| **Azure Event Grid** | Event routing | React op events van Azure services |
| **Azure Cache for Redis** | In-memory cache | Versnelling van veelgeraadpleegde data |
| **Azure Container Registry** | Docker image registry | Private opslag voor jouw Docker images |
| **Azure DevOps** | CI/CD + project management | Pipelines, boards, repos, test plans |
| **Azure Monitor** | Observability | Logs, metrics, alerts, dashboards |
| **Application Insights** | APM | Performance monitoring van jouw applicatie |
| **Azure Entra ID** | Identity & Access | SSO, authenticatie, autorisatie |
| **Azure Functions** | Serverless compute | Kleine, event-driven code uitvoeren |
| **Azure API Management** | API Gateway | Centraal beheer van al jouw API's |

---

## Azure App Service — .NET API Deployen

App Service is de eenvoudigste manier om een .NET applicatie in Azure te draaien. Je geeft de code, Azure regelt de rest: servers, load balancing, SSL, scaling.

### Aanmaken via Azure CLI

```bash
# Inloggen
az login

# Resource group aanmaken (alles gegroepeerd per project)
az group create \
    --name "myapp-prod-rg" \
    --location "westeurope"

# App Service Plan aanmaken (de VM-grootte)
az appservice plan create \
    --name "myapp-prod-plan" \
    --resource-group "myapp-prod-rg" \
    --sku "P1v3" \           # P1v3 = Premium v3 tier
    --is-linux               # Linux containers

# Web App aanmaken
az webapp create \
    --name "myapp-api" \
    --resource-group "myapp-prod-rg" \
    --plan "myapp-prod-plan" \
    --runtime "DOTNET:8.0"

# Omgevingsvariabelen instellen
az webapp config appsettings set \
    --name "myapp-api" \
    --resource-group "myapp-prod-rg" \
    --settings \
        ASPNETCORE_ENVIRONMENT=Production \
        KeyVaultName=myapp-prod-kv \
        Logging__LogLevel__Default=Warning

# Connection string instellen (apart van app settings — versleuteld)
az webapp config connection-string set \
    --name "myapp-api" \
    --resource-group "myapp-prod-rg" \
    --connection-string-type SQLServer \
    --settings DefaultConnection="Server=myserver.database.windows.net;..."
```

### Deployment slots — Zero-downtime deploys

```bash
# Maak een staging slot (identiek aan productie maar apart)
az webapp deployment slot create \
    --name "myapp-api" \
    --resource-group "myapp-prod-rg" \
    --slot "staging"

# Deploy naar staging
az webapp deploy \
    --name "myapp-api" \
    --resource-group "myapp-prod-rg" \
    --slot "staging" \
    --src-path "./publish.zip"

# Test staging: https://myapp-api-staging.azurewebsites.net

# Swap staging naar productie (instantaan, geen downtime)
az webapp deployment slot swap \
    --name "myapp-api" \
    --resource-group "myapp-prod-rg" \
    --slot "staging" \
    --target-slot "production"

# Problemen? Rollback is één commando:
az webapp deployment slot swap \
    --name "myapp-api" \
    --resource-group "myapp-prod-rg" \
    --slot "production" \
    --target-slot "staging"
```

---

## Azure Key Vault — Secrets Veilig Beheren

**Nooit** wachtwoorden, API keys of connection strings in:
- Broncode
- appsettings.json
- Environment variables (leesbaar via `env` commando)
- Git repository

**Altijd** in Azure Key Vault.

### Key Vault aanmaken en configureren

```bash
# Key Vault aanmaken
az keyvault create \
    --name "myapp-prod-kv" \
    --resource-group "myapp-prod-rg" \
    --location "westeurope" \
    --enable-rbac-authorization true  # Gebruik RBAC i.p.v. access policies

# Secret toevoegen
az keyvault secret set \
    --vault-name "myapp-prod-kv" \
    --name "DatabaseConnectionString" \
    --value "Server=myserver.database.windows.net;Database=MyDb;..."

az keyvault secret set \
    --vault-name "myapp-prod-kv" \
    --name "WacsApiKey" \
    --value "super-geheime-sleutel"

# Geef de App Service toegang via Managed Identity (geen wachtwoord nodig!)
# Stap 1: Managed Identity inschakelen op de App Service
az webapp identity assign \
    --name "myapp-api" \
    --resource-group "myapp-prod-rg"

# Stap 2: geef die identity de "Key Vault Secrets User" rol
# (haal de principal ID op uit de vorige stap)
az role assignment create \
    --role "Key Vault Secrets User" \
    --assignee "<principal-id-van-stap-1>" \
    --scope "/subscriptions/.../resourceGroups/myapp-prod-rg/providers/Microsoft.KeyVault/vaults/myapp-prod-kv"
```

### Integratie in ASP.NET Core

```csharp
// Program.cs
// Met DefaultAzureCredential werkt dit automatisch:
// - Lokaal: gebruik jouw Azure CLI login (az login)
// - In Azure: gebruik Managed Identity (geen wachtwoorden!)
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://myapp-prod-kv.vault.azure.net/"),
    new DefaultAzureCredential()
);

// Daarna gewoon via IConfiguration ophalen:
// Key Vault secret "DatabaseConnectionString" wordt automatisch beschikbaar
var connectionString = builder.Configuration["DatabaseConnectionString"];
var apiKey = builder.Configuration["WacsApiKey"];

// Of via Options pattern (aanbevolen voor typed configuratie)
builder.Services.Configure<WacsSettings>(config =>
{
    config.ApiKey = builder.Configuration["WacsApiKey"]!;
    config.BaseUrl = builder.Configuration["WacsBaseUrl"]!;
});
```

---

## Azure SQL Database

Azure SQL is SQL Server als een volledig beheerde cloud service. Geen patches, geen backups instellen, automatische hoge beschikbaarheid.

```bash
# SQL Server aanmaken (logische container)
az sql server create \
    --name "myapp-sqlserver" \
    --resource-group "myapp-prod-rg" \
    --location "westeurope" \
    --admin-user "sqladmin" \
    --admin-password "$(az keyvault secret show --name SqlAdminPassword ...)"

# Database aanmaken
az sql db create \
    --server "myapp-sqlserver" \
    --resource-group "myapp-prod-rg" \
    --name "MyAppDb" \
    --service-objective "S2"  # S2 = 50 DTU, genoeg voor MKB

# Firewall: sta alleen Azure services toe (niet alles!)
az sql server firewall-rule create \
    --server "myapp-sqlserver" \
    --resource-group "myapp-prod-rg" \
    --name "AllowAzureServices" \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0

# BETER: Private Endpoint zodat de database helemaal niet publiek bereikbaar is
az network private-endpoint create \
    --name "sql-private-endpoint" \
    --resource-group "myapp-prod-rg" \
    --vnet-name "myapp-vnet" \
    --subnet "data-subnet" \
    --private-connection-resource-id "/subscriptions/.../sql/myapp-sqlserver" \
    --group-id "sqlServer" \
    --connection-name "sql-connection"
```

### Elastic pools — Kosten besparen bij meerdere databases

```bash
# Meerdere databases die elkaars piekmomenten opvangen
# Goedkoper dan elke database apart een hoge tier geven
az sql elastic-pool create \
    --server "myapp-sqlserver" \
    --resource-group "myapp-prod-rg" \
    --name "myapp-pool" \
    --edition "Standard" \
    --dtu 100

az sql db create \
    --server "myapp-sqlserver" \
    --resource-group "myapp-prod-rg" \
    --name "MyAppDb_Tenant1" \
    --elastic-pool "myapp-pool"
```

---

## Azure Service Bus — Async Messaging

Service Bus is een enterprise berichtenwachtrij. In plaats van dat systemen direct met elkaar praten (koppeling), sturen ze berichten via een wachtrij (ontkoppeling).

```
Zonder Service Bus:
  OrderService → roept WacsService direct aan
  → Als WACS down is: order mislukt ❌
  → Als WACS traag is: order wacht ❌

Met Service Bus:
  OrderService → stuurt bericht naar wachtrij
  → Als WACS down is: bericht blijft in wachtrij ✅
  → Als WACS traag is: wachtrij buffert ✅
  → Als order service crasht: bericht is al veilig in wachtrij ✅
```

```csharp
// Publisher — verstuur een bericht
public class OrderConfirmedPublisher
{
    private readonly ServiceBusSender _sender;

    public OrderConfirmedPublisher(ServiceBusClient client)
    {
        // Topic: voor meerdere subscribers (fan-out)
        _sender = client.CreateSender("order-events");
    }

    public async Task PublishOrderConfirmedAsync(Order order)
    {
        var eventData = new OrderConfirmedEvent
        {
            OrderId = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerId = order.CustomerId,
            TotalAmount = order.TotalAmount,
            ConfirmedAt = DateTime.UtcNow
        };

        var message = new ServiceBusMessage(
            BinaryData.FromObjectAsJson(eventData))
        {
            Subject = "OrderConfirmed",
            MessageId = Guid.NewGuid().ToString(),
            CorrelationId = order.OrderNumber,  // Voor tracing
            // Bericht vervalt na 7 dagen als niemand het verwerkt
            TimeToLive = TimeSpan.FromDays(7)
        };

        await _sender.SendMessageAsync(message);
    }
}

// Consumer — verwerk berichten (in WACS of andere service)
public class OrderConfirmedConsumer : BackgroundService
{
    private readonly ServiceBusProcessor _processor;
    private readonly IWacsPickOrderService _pickOrderService;
    private readonly ILogger<OrderConfirmedConsumer> _logger;

    public OrderConfirmedConsumer(
        ServiceBusClient client,
        IWacsPickOrderService pickOrderService,
        ILogger<OrderConfirmedConsumer> logger)
    {
        // Subscription: WACS ontvangt alleen "OrderConfirmed" events
        _processor = client.CreateProcessor(
            topicName: "order-events",
            subscriptionName: "wacs-subscription",
            new ServiceBusProcessorOptions
            {
                MaxConcurrentCalls = 5,     // Verwerk max 5 berichten tegelijk
                AutoCompleteMessages = false // We bevestigen zelf (veiliger)
            });

        _pickOrderService = pickOrderService;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        _processor.ProcessMessageAsync += HandleMessageAsync;
        _processor.ProcessErrorAsync += HandleErrorAsync;
        await _processor.StartProcessingAsync(ct);
        await Task.Delay(Timeout.Infinite, ct);
    }

    private async Task HandleMessageAsync(ProcessMessageEventArgs args)
    {
        var orderEvent = args.Message.Body.ToObjectFromJson<OrderConfirmedEvent>();

        _logger.LogInformation(
            "Order bevestigingsevent ontvangen: {OrderNumber}", orderEvent.OrderNumber);

        try
        {
            await _pickOrderService.CreatePickOrderAsync(orderEvent);

            // Bericht bevestigen: verwijderd uit wachtrij
            await args.CompleteMessageAsync(args.Message);

            _logger.LogInformation(
                "Pickorder aangemaakt voor {OrderNumber}", orderEvent.OrderNumber);
        }
        catch (BusinessException ex)
        {
            // Bekende fout: naar dead-letter queue (voor handmatige verwerking)
            _logger.LogWarning(ex, "Business fout bij verwerking {OrderNumber}", orderEvent.OrderNumber);
            await args.DeadLetterMessageAsync(args.Message, ex.GetType().Name, ex.Message);
        }
        catch (Exception ex)
        {
            // Onbekende fout: abandon → bericht komt terug in wachtrij voor retry
            _logger.LogError(ex, "Fout bij verwerking {OrderNumber}", orderEvent.OrderNumber);
            await args.AbandonMessageAsync(args.Message);
        }
    }

    private Task HandleErrorAsync(ProcessErrorEventArgs args)
    {
        _logger.LogError(args.Exception,
            "Service Bus fout: {ErrorSource}", args.ErrorSource);
        return Task.CompletedTask;
    }
}
```

---

## Azure Blob Storage — Bestanden Opslaan

```csharp
public class DocumentStorageService : IDocumentStorageService
{
    private readonly BlobServiceClient _blobService;

    public DocumentStorageService(BlobServiceClient blobService)
        => _blobService = blobService;

    public async Task<string> UploadAsync(
        Stream fileStream, string fileName, string containerName = "documents")
    {
        var container = _blobService.GetBlobContainerClient(containerName);

        // Container aanmaken als die niet bestaat
        await container.CreateIfNotExistsAsync(PublicAccessType.None);

        // Unieke naam om conflicten te vermijden
        var blobName = $"{DateTime.UtcNow:yyyy/MM/dd}/{Guid.NewGuid()}/{fileName}";
        var blob = container.GetBlobClient(blobName);

        await blob.UploadAsync(fileStream, new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders
            {
                ContentType = GetContentType(fileName),
                CacheControl = "max-age=3600"
            }
        });

        return blobName;
    }

    public async Task<Stream> DownloadAsync(string blobName, string containerName = "documents")
    {
        var blob = _blobService
            .GetBlobContainerClient(containerName)
            .GetBlobClient(blobName);

        if (!await blob.ExistsAsync())
            throw new FileNotFoundException($"Bestand niet gevonden: {blobName}");

        var response = await blob.DownloadStreamingAsync();
        return response.Value.Content;
    }

    // Genereer een tijdelijke, ondertekende URL voor directe download
    // (client download direct van Azure, niet via jouw server)
    public Uri GenerateSasUrl(string blobName, TimeSpan expiry,
        string containerName = "documents")
    {
        var blob = _blobService
            .GetBlobContainerClient(containerName)
            .GetBlobClient(blobName);

        return blob.GenerateSasUri(BlobSasPermissions.Read, DateTimeOffset.UtcNow.Add(expiry));
    }

    public async Task DeleteAsync(string blobName, string containerName = "documents")
    {
        var blob = _blobService
            .GetBlobContainerClient(containerName)
            .GetBlobClient(blobName);

        await blob.DeleteIfExistsAsync();
    }

    private static string GetContentType(string fileName) =>
        Path.GetExtension(fileName).ToLower() switch
        {
            ".pdf" => "application/pdf",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            _ => "application/octet-stream"
        };
}
```

---

## Azure Monitor + Application Insights

**Azure Monitor** verzamelt logs en metrics van alle Azure resources.
**Application Insights** is de APM (Application Performance Monitoring) voor jouw code — het ziet van binnen wat er gebeurt.

```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
    options.EnableAdaptiveSampling = true;    // Automatisch samplen bij hoge load
    options.EnableDependencyTrackingTelemetryModule = true;  // Track SQL, HTTP calls
});

// Custom telemetry in je code
public class OrderService
{
    private readonly TelemetryClient _telemetry;

    public async Task<int> CreateOrderAsync(CreateOrderCommand cmd)
    {
        // Track een business event
        _telemetry.TrackEvent("OrderCreated", new Dictionary<string, string>
        {
            ["CustomerSegment"] = cmd.CustomerSegment,
            ["OrderSource"] = cmd.Source
        },
        new Dictionary<string, double>
        {
            ["OrderValue"] = (double)cmd.EstimatedValue,
            ["LineCount"] = cmd.Lines.Count
        });

        // Track een dependency (bijv. externe API call)
        using var operation = _telemetry.StartOperation<DependencyTelemetry>("WACS CreatePickOrder");
        operation.Telemetry.Type = "HTTP";
        operation.Telemetry.Target = "wacs.internal";

        try
        {
            var id = await _repo.CreateAsync(cmd);
            operation.Telemetry.Success = true;
            return id;
        }
        catch (Exception ex)
        {
            operation.Telemetry.Success = false;
            _telemetry.TrackException(ex);
            throw;
        }
    }
}
```

### KQL Queries voor Azure Monitor

```kql
// Foutpercentage per endpoint (afgelopen 24u)
requests
| where timestamp > ago(24h)
| where cloud_RoleName == "myapp-api"
| summarize
    TotalRequests = count(),
    FailedRequests = countif(success == false),
    FailureRate = round(countif(success == false) * 100.0 / count(), 2)
  by name
| where TotalRequests > 10
| order by FailureRate desc

// Gemiddelde responstijd per uur
requests
| where timestamp > ago(7d)
| summarize AvgDuration = avg(duration), P95 = percentile(duration, 95)
  by bin(timestamp, 1h), name
| order by timestamp desc

// Top exceptions
exceptions
| where timestamp > ago(24h)
| summarize Count = count() by type, outerMessage
| order by Count desc
| take 20

// Trage SQL queries (dependency tracking)
dependencies
| where timestamp > ago(1h)
| where type == "SQL"
| where duration > 1000  // Trager dan 1 seconde
| project timestamp, name, duration, data
| order by duration desc
```

---

## Migratie: On-Premises → Azure

Een gefaseerde aanpak vermindert risico:

```
FASE 1 — Assessment (2-4 weken)
  ☐ Inventariseer alle applicaties en databases
  ☐ Bepaal dependencies (wat hangt van wat af?)
  ☐ Schat Azure kosten (Azure Pricing Calculator)
  ☐ Kies migratiestrategie per applicatie:
      Rehost:    VM naar Azure VM (snelst, minste winst)
      Replatform: IIS naar App Service (weinig aanpassingen, meer winst)
      Refactor:  Herarchitectuur voor cloud-native (meeste werk, meeste winst)

FASE 2 — Fundament (2-4 weken)
  ☐ Azure landing zone opzetten (VNet, subnets, NSG's)
  ☐ Azure DevOps of GitHub Actions configureren
  ☐ Azure Monitor en Log Analytics workspace aanmaken
  ☐ Azure Key Vault aanmaken en secrets migreren
  ☐ Azure Container Registry opzetten

FASE 3 — Database (2-6 weken)
  ☐ Azure SQL Database aanmaken
  ☐ Schema en data migreren (Database Migration Service)
  ☐ Connection strings bijwerken
  ☐ Performance valideren
  ☐ Backup en restore testen

FASE 4 — Applicaties (per applicatie 1-3 weken)
  ☐ Begin met minst kritieke applicaties
  ☐ Containeriseer (Dockerfile schrijven)
  ☐ CI/CD pipeline opzetten
  ☐ Deployen naar staging, valideren
  ☐ Deployen naar productie, monitoring aan

FASE 5 — Optimalisatie (doorlopend)
  ☐ Auto-scaling instellen
  ☐ Reserved Instances kopen voor stabiele workloads (60% besparing)
  ☐ Ongebruikte resources opsporen en verwijderen
  ☐ Azure Advisor aanbevelingen opvolgen
```

---

## Kostenoptimalisatie

```bash
# Bekijk huidig verbruik
az consumption usage list \
    --billing-period-name "202605" \
    --top 20 \
    --query "[].{Service:instanceName, Cost:pretaxCost}" \
    --output table

# Ongebruikte resources vinden
az resource list \
    --query "[?tags.Environment == null]" \
    --output table

# App Service stoppen buiten kantooruren (dev/test omgevingen)
# Bespaart ~65% van de kosten
az webapp stop --name "myapp-dev-api" --resource-group "myapp-dev-rg"
az webapp start --name "myapp-dev-api" --resource-group "myapp-dev-rg"
```

**Belangrijkste bespaartips:**
- **Reserved Instances**: 1 of 3 jaar committeren = 40-65% goedkoper dan pay-as-you-go
- **Dev/test omgevingen stoppen** buiten kantooruren (automatiseer dit)
- **Right-sizing**: begin klein (B1, S1) en schaal op als nodig — niet andersom
- **Tagging**: tag alle resources met team en omgeving zodat je per team kosten ziet
- **Azure Advisor**: gratis aanbevelingen voor kosten, veiligheid en performance

---

*[← Terug naar overzicht](../../README.md)*
