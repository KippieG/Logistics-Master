# WMS — WACS (Warehouse Management System)

## Wat is een WMS en waarom?

Een **Warehouse Management System (WMS)** is de software die alle activiteiten in een magazijn aanstuurt en registreert. Zonder WMS werkt een magazijn op papier, whiteboards en geheugen — met alle fouten en inefficiënties van dien.

**WACS** is het WMS dat in onze omgeving ingezet wordt voor logistieke operaties.

**Wat een WMS doet:**
- Weet precies wat er op welke locatie staat (voorraadlocaties)
- Stuurt mensen aan: wie pikt wat, in welke volgorde
- Zorgt voor correcte ontvangst (inbound) en verzending (outbound)
- Communiceert met TMS (transport) en ERP (voorraad, facturatie)
- Garandeert traceerbaarheid: waar is lot X nu, en waar is het geweest?

**Zonder WMS:**
- Mensen zoeken zelf naar producten → tijdverlies
- Pickfouten → klachten, retours
- Geen FIFO/FEFO → verlopen producten, verspilling
- Voorraadinaccuratesse → te veel of te weinig bestellen
- Geen traceerbaarheid → bij problemen geen antwoorden

---

## De Warehouseprocessen van A tot Z

```
┌─────────────────────────────────────────────────────────────────────┐
│                          INBOUND                                    │
│                                                                     │
│  Leverancier                                                        │
│      ↓                                                              │
│  ASN (Advance Ship Notice) → WACS weet wat er komt                 │
│      ↓                                                              │
│  Ontvangst op dock → medewerker scant leveringsbon                 │
│      ↓                                                              │
│  Controleren: aantallen, kwaliteit, uiterste datum                 │
│      ↓                                                              │
│  Inboeken: lot aanmaken, hoeveelheid registreren                   │
│      ↓                                                              │
│  Putaway: WACS wijst een locatie toe                               │
│      ↓                                                              │
│  Bevestigen: medewerker scant locatie + artikel                    │
│      ↓ (voorraad zichtbaar in WACS + ERP)                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          OPSLAG                                     │
│                                                                     │
│  Locaties zijn georganiseerd in zones, gangen, secties en vakken   │
│  Elk artikel staat op één of meerdere locaties                     │
│  WACS houdt bij: artikel, lot, hoeveelheid, status per locatie     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          OUTBOUND                                   │
│                                                                     │
│  Verkooporder (uit ERP) of Transportorder (uit TMS)                │
│      ↓                                                              │
│  WACS maakt pickorder aan                                          │
│      ↓                                                              │
│  WACS bepaalt welke locatie gepickt wordt (FEFO/FIFO)              │
│      ↓                                                              │
│  Medewerker krijgt pick-opdrachten op handterminal/app             │
│      ↓                                                              │
│  Picken: scan locatie → scan artikel → bevestig hoeveelheid        │
│      ↓                                                              │
│  Verpakken: inpakken, wegen, labelen                               │
│      ↓                                                              │
│  Laden: laden op vrachtwagen, afmelden in WACS                     │
│      ↓                                                              │
│  Bevestiging aan TMS (klaar voor transport) en ERP (voorraad --)  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Datamodel — Hoe WACS data opslaat

### Locatiestructuur

Elk opslagpunt in het magazijn heeft een unieke code die de positie beschrijft:

```
WH-A-01-02-03
│   │  │  │  └── Vak:     03 = derde vak (verticaal level)
│   │  │  └───── Sectie:  02 = tweede sectie (positie in de gang)
│   │  └──────── Gang:    01 = eerste gang
│   └─────────── Zone:    A  = normale opslag
└─────────────── Magazijn: WH = hoofdmagazijn

Andere zones:
  WH-COOL-xx-xx-xx  = Koelruimte
  WH-ADR-xx-xx-xx   = Gevaarlijke stoffen
  WH-BLK-xx-xx-xx   = Geblokkeerde voorraad (kwaliteitshold)
  WH-RTV-xx-xx-xx   = Return to Vendor (retour leverancier)
  WH-STAGE-xx       = Staging area (klaar voor verlading)
```

```sql
-- Locatietabel in de database
CREATE TABLE Locations (
    Id              INT IDENTITY(1,1)   NOT NULL,
    LocationCode    NVARCHAR(30)        NOT NULL,
    WarehouseCode   NVARCHAR(10)        NOT NULL,
    Zone            NVARCHAR(20)        NOT NULL,
    Aisle           NVARCHAR(5)         NOT NULL,
    Section         SMALLINT            NOT NULL,
    Level           SMALLINT            NOT NULL,

    -- Eigenschappen
    LocationType    NVARCHAR(20)        NOT NULL  -- 'Bulk', 'Picking', 'Staging', 'Block'
    MaxWeight       DECIMAL(10,2)           NULL, -- kg
    MaxVolume       DECIMAL(10,4)           NULL, -- m³
    IsActive        BIT                 NOT NULL  DEFAULT 1,
    IsEmpty         BIT                 NOT NULL  DEFAULT 1,

    -- Afstand tot expeditie (voor route optimalisatie)
    DistanceFromDock SMALLINT           NOT NULL  DEFAULT 0,

    CONSTRAINT PK_Locations PRIMARY KEY (Id),
    CONSTRAINT UQ_Locations_Code UNIQUE (LocationCode)
);
```

### Voorraad per locatie

```sql
CREATE TABLE StockLedger (
    Id              INT IDENTITY(1,1)   NOT NULL,
    LocationCode    NVARCHAR(30)        NOT NULL,
    ArticleCode     NVARCHAR(30)        NOT NULL,
    LotNumber       NVARCHAR(30)            NULL,
    ExpiryDate      DATE                    NULL,
    ReceiptDate     DATETIME2(0)        NOT NULL,

    -- Hoeveelheden
    QuantityOnHand  DECIMAL(12,3)       NOT NULL  DEFAULT 0,
    QuantityReserved DECIMAL(12,3)      NOT NULL  DEFAULT 0,
    QuantityAvailable AS (QuantityOnHand - QuantityReserved),  -- Berekende kolom

    -- Status
    Status          NVARCHAR(20)        NOT NULL  DEFAULT 'Free',
    -- Free / Reserved / Blocked / InPicking / InTransit

    -- Tracking
    LastMovementAt  DATETIME2(0)            NULL,
    LastCountDate   DATE                    NULL,

    CONSTRAINT PK_Stock PRIMARY KEY (Id),
    CONSTRAINT FK_Stock_Location FOREIGN KEY (LocationCode) REFERENCES Locations(LocationCode),
    CONSTRAINT CHK_Stock_Qty CHECK (QuantityOnHand >= 0),
    CONSTRAINT CHK_Stock_Reserved CHECK (QuantityReserved >= 0),
    CONSTRAINT CHK_Stock_Status CHECK (Status IN ('Free','Reserved','Blocked','InPicking','InTransit'))
);
```

---

## Slimme Putaway — Waar zet je inkomende goederen?

WACS moet automatisch de beste locatie kiezen bij ontvangst. Dit is de logica:

```csharp
public class PutawayEngine
{
    private readonly ILocationRepository _locationRepo;
    private readonly IStockRepository _stockRepo;
    private readonly IArticleRepository _articleRepo;

    public async Task<PutawayAdvice> SuggestLocationAsync(
        string articleCode, decimal quantity, string lotNumber)
    {
        var article = await _articleRepo.GetAsync(articleCode);

        // ─── STAP 1: Bepaal de juiste zone ──────────────────────────────
        var targetZone = DetermineZone(article);

        // ─── STAP 2: Consolidatie — zet bij bestaande stock van hetzelfde artikel ──
        var existingLocations = await _stockRepo.GetLocationsWithArticleAsync(
            articleCode, targetZone);

        var consolidationLocation = existingLocations
            .Where(loc =>
                loc.QuantityAvailable < loc.Capacity &&        // Locatie heeft ruimte
                (loc.ExpiryDate == null || loc.ExpiryDate == GetExpiryForLot(lotNumber)) // Zelfde datum
            )
            .OrderBy(loc => loc.DistanceFromDock)              // Dichtste locatie
            .FirstOrDefault();

        if (consolidationLocation != null)
        {
            return new PutawayAdvice
            {
                LocationCode = consolidationLocation.LocationCode,
                Reason = "Consolidatie bij bestaande stock"
            };
        }

        // ─── STAP 3: Vrije locatie in de juiste zone ─────────────────────
        var emptyLocation = await _locationRepo.GetEmptyLocationsAsync(targetZone)
            .Where(loc =>
                (loc.MaxWeight == null || loc.MaxWeight >= article.WeightPerUnit * quantity) &&
                (loc.MaxVolume == null || loc.MaxVolume >= article.VolumePerUnit * quantity)
            )
            .OrderBy(loc => IsHighTurnover(article)
                ? loc.DistanceFromDock      // Snellopers: dicht bij expeditie
                : -loc.DistanceFromDock)    // Langzame lopers: achteraan
            .FirstOrDefaultAsync();

        if (emptyLocation == null)
            throw new NoLocationAvailableException(targetZone, articleCode);

        return new PutawayAdvice
        {
            LocationCode = emptyLocation.LocationCode,
            Reason = $"Vrije locatie in zone {targetZone}"
        };
    }

    private string DetermineZone(Article article)
    {
        if (article.RequiresCooling) return "COOL";
        if (article.IsDangerousGoods) return "ADR";
        if (article.IsBulkItem) return "BULK";
        if (IsHighTurnover(article)) return "A";  // Snelloperszone
        return "B";                                // Standaard
    }

    private bool IsHighTurnover(Article article)
        => article.AvgMonthlyMovements > 50;
}
```

---

## Picking — Goederen verzamelen

### Pickstrategieën uitgelegd

**1. Order Picking** — één picker, één order
```
Medewerker pikt alle regels van één order tegelijk.
✅ Eenvoudig, geen sortering nodig
❌ Veel looproutes als orders verspreid over het magazijn liggen
👍 Gebruik bij: kleine volumes, weinig orders, urgente orders
```

**2. Batch Picking** — één picker, meerdere orders tegelijk
```
Medewerker pikt meerdere orders in één ronde.
Na het picken worden de goederen gesorteerd per order.
✅ Minder looproutes, hogere efficiëntie
❌ Sortering na het picken nodig (sorteertafel of -conveyor)
👍 Gebruik bij: veel kleine orders, vergelijkbare producten
```

**3. Zone Picking** — pickers per zone
```
Elke picker werkt in zijn eigen zone.
Order wordt doorgegeven van zone naar zone.
✅ Specialisatie, pickers kennen hun zone perfect
❌ Coördinatie nodig, orders moeten samengevoegd worden
👍 Gebruik bij: grote magazijnen, gespecialiseerde zones (ADR, koel)
```

**4. Wave Picking** — geplande pickgolven
```
Orders worden gebundeld in "waves" (golven) gebaseerd op carrier, leverdatum.
Alle orders in een wave worden tegelijk vrijgegeven.
✅ Optimale benutting van mensen en equipment
❌ Planningscomplexiteit
👍 Gebruik bij: vaste vertrektijden vrachtwagens, hoge volumes
```

### FEFO picklogica (SQL)

```sql
-- FEFO = First Expired First Out: kortste houdbaarheidsdatum eerst
-- Dit is verplicht bij voeding, farma, cosmetica

CREATE OR ALTER PROCEDURE usp_GetPickSuggestion
    @ArticleCode    NVARCHAR(30),
    @QuantityNeeded DECIMAL(12,3),
    @MinShelfLife   INT = 30  -- Minimum resterende houdbaarheid in dagen
AS
BEGIN
    SET NOCOUNT ON;

    WITH AvailableStock AS (
        SELECT
            s.LocationCode,
            s.LotNumber,
            s.ExpiryDate,
            s.QuantityAvailable,
            l.Aisle,
            l.Section,
            l.Level,
            l.DistanceFromDock,
            -- FEFO sortering: kortste houdbaarheidsdatum eerst
            ROW_NUMBER() OVER (
                ORDER BY
                    COALESCE(s.ExpiryDate, '9999-12-31') ASC,
                    s.ReceiptDate ASC,
                    l.DistanceFromDock ASC
            ) AS PickPriority
        FROM StockLedger s
        INNER JOIN Locations l ON l.LocationCode = s.LocationCode
        WHERE s.ArticleCode = @ArticleCode
          AND s.Status = 'Free'
          AND s.QuantityAvailable > 0
          AND (
              s.ExpiryDate IS NULL OR
              s.ExpiryDate >= DATEADD(DAY, @MinShelfLife, GETDATE())
          )
    ),
    -- Bereken hoeveel we van elke locatie nodig hebben
    PickAllocation AS (
        SELECT
            LocationCode,
            LotNumber,
            ExpiryDate,
            QuantityAvailable,
            Aisle,
            Section,
            Level,
            PickPriority,
            -- Hoeveel picken we van deze locatie?
            LEAST(
                QuantityAvailable,
                @QuantityNeeded - COALESCE(
                    SUM(QuantityAvailable) OVER (
                        ORDER BY PickPriority
                        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                    ), 0
                )
            ) AS QuantityToPick
        FROM AvailableStock
        WHERE SUM(QuantityAvailable) OVER (
            ORDER BY PickPriority
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) - QuantityAvailable < @QuantityNeeded
    )
    SELECT
        LocationCode,
        LotNumber,
        ExpiryDate,
        QuantityToPick,
        -- Looproute volgorde (zigzag door het magazijn)
        ROW_NUMBER() OVER (
            ORDER BY
                Aisle,
                CASE WHEN CAST(Aisle AS INT) % 2 = 0
                     THEN Section
                     ELSE 9999 - Section  -- Terugweg in oneven gangen
                END,
                Level
        ) AS RouteSequence
    FROM PickAllocation
    WHERE QuantityToPick > 0
    ORDER BY RouteSequence;
END;
```

---

## Cyclustellingen — Voorraadinaccuratesse bestrijden

Voorraadinaccuratesse is een van de grootste uitdagingen in elk magazijn. Cyclustellingen zijn de oplossing: in plaats van één grote jaarlijkse inventaris, tel je continu kleine stukjes.

### Hoe werkt een cyclustelling?

```
1. WACS selecteert dagelijks een set locaties om te tellen
   → Baseer dit op: niet lang geteld, hoge beweging, lage accuratessescore

2. Medewerker gaat naar de locatie (zonder te weten wat WACS verwacht)
   → Scan de locatiebarcode
   → Tel het artikel en voer in wat je ziet

3. WACS vergelijkt: systeemhoeveelheid vs. getelde hoeveelheid
   → Geen verschil: locatie afgesloten, score verbeterd
   → Verschil < drempelwaarde: automatisch corrigeren + log
   → Verschil > drempelwaarde: tweede teller inzetten

4. Correcties worden gelogd en doorgestuurd naar ERP
```

```sql
-- Automatisch telplan genereren
CREATE OR ALTER PROCEDURE usp_GenerateCyclePlan
    @TargetCount INT = 50  -- Hoeveel locaties per dag tellen
AS
BEGIN
    SET NOCOUNT ON;

    -- Verwijder oud plan van vandaag (indien hertelling nodig)
    DELETE FROM CyclePlan WHERE PlanDate = CAST(GETDATE() AS DATE);

    -- Selecteer te tellen locaties op basis van prioriteit
    INSERT INTO CyclePlan (PlanDate, LocationCode, ArticleCode, SystemQuantity, Priority)
    SELECT TOP (@TargetCount)
        CAST(GETDATE() AS DATE),
        s.LocationCode,
        s.ArticleCode,
        s.QuantityOnHand,
        -- Prioriteitsscore (hoger = urgenter om te tellen)
        CAST(
            -- Dagen sinds laatste telling (max 100 punten)
            LEAST(DATEDIFF(DAY, s.LastCountDate, GETDATE()), 100) * 0.3 +
            -- Aantal bewegingen afgelopen maand (max 100 punten)
            LEAST(COALESCE(mv.MovementsLast30Days, 0), 100) * 0.4 +
            -- Lage accuratessescore (0 of 50 punten)
            CASE WHEN s.AccuracyScore < 0.98 THEN 50 ELSE 0 END +
            -- Nooit geteld (30 punten)
            CASE WHEN s.LastCountDate IS NULL THEN 30 ELSE 0 END
        AS INT) AS Priority
    FROM StockLedger s
    LEFT JOIN (
        SELECT ArticleCode, COUNT(*) AS MovementsLast30Days
        FROM StockMutations
        WHERE MutationDate >= DATEADD(DAY, -30, GETDATE())
        GROUP BY ArticleCode
    ) mv ON mv.ArticleCode = s.ArticleCode
    WHERE s.QuantityOnHand > 0
      AND s.LocationCode NOT LIKE 'WH-STAGE%'  -- Staging niet tellen
      AND NOT EXISTS (
          -- Vandaag al gepland
          SELECT 1 FROM CyclePlan
          WHERE LocationCode = s.LocationCode
            AND PlanDate = CAST(GETDATE() AS DATE)
      )
    ORDER BY Priority DESC;

    SELECT COUNT(*) AS GeplanndeLocaties FROM CyclePlan
    WHERE PlanDate = CAST(GETDATE() AS DATE);
END;
```

---

## Integratie WACS ↔ TAS (Transport)

WACS en TAS moeten nauw samenwerken: TAS weet wanneer de vrachtwagen vertrekt, WACS weet wanneer de goederen gepickt zijn.

```csharp
// WACSClient in het TAS systeem
public class WacsIntegrationService
{
    private readonly HttpClient _http;
    private readonly ILogger<WacsIntegrationService> _logger;

    // TAS vraagt WACS om een pickorder aan te maken
    public async Task<string> CreatePickOrderAsync(TransportOrder transportOrder)
    {
        var request = new WacsPickOrderRequest
        {
            TasReference = transportOrder.OrderNumber,
            RequestedReadyBy = transportOrder.PlannedLoadingTime.AddHours(-1),
            Priority = MapPriority(transportOrder.Priority),
            DeliveryInfo = new WacsDeliveryInfo
            {
                CustomerCode = transportOrder.CustomerCode,
                Address = transportOrder.DeliveryAddress
            },
            Lines = transportOrder.Lines.Select(l => new WacsPickLine
            {
                LineNumber = l.LineNumber,
                ArticleCode = l.ProductCode,
                QuantityOrdered = l.Quantity,
                UnitOfMeasure = l.UOM
            }).ToList()
        };

        var response = await _http.PostAsJsonAsync("/api/pickorders", request);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError("WACS pickorder aanmaken gefaald voor {TasRef}: {Error}",
                transportOrder.OrderNumber, error);
            throw new IntegrationException($"WACS fout: {error}");
        }

        var result = await response.Content.ReadFromJsonAsync<WacsPickOrderResponse>();
        return result!.WacsReference;
    }

    // WACS stuurt een webhook als de pickorder klaar is
    // Dit endpoint staat in de TAS API
    public async Task HandlePickReadyWebhookAsync(WacsReadyNotification notification)
    {
        _logger.LogInformation(
            "WACS meldt pickorder klaar: {WacsRef} → TAS Ref: {TasRef}",
            notification.WacsReference, notification.TasReference);

        // Werk de transportorder bij in TAS
        await _transportOrderService.MarkPickingCompleteAsync(
            tasReference: notification.TasReference,
            actualWeight: notification.TotalWeightKg,
            actualVolume: notification.TotalVolumeM3,
            lines: notification.Lines.Select(l => new PickedLineDto
            {
                ArticleCode = l.ArticleCode,
                QuantityPicked = l.QuantityPicked,
                LotNumber = l.LotNumber,
                ExpiryDate = l.ExpiryDate
            }).ToList()
        );
    }
}
```

---

## Integratie WACS ↔ Business Central (ERP)

Elke voorraadmutatie in WACS moet gesynchroniseerd worden naar BC, zodat de boekhouding correct is.

```csharp
public class EarningsSyncService
{
    private readonly IBCClient _bcClient;
    private readonly IStockMutationRepository _mutations;

    // Synchroniseer alle niet-gesynchroniseerde mutaties naar BC
    public async Task SyncPendingMutationsAsync()
    {
        var pending = await _mutations.GetPendingAsync(maxCount: 100);

        foreach (var mutation in pending)
        {
            try
            {
                var bcEntry = new BCItemJournalLine
                {
                    JournalTemplateName = "WACS-SYNC",
                    JournalBatchName = DateTime.Today.ToString("yyyyMMdd"),
                    ItemNo = mutation.ArticleCode,
                    LocationCode = "WACS",
                    EntryType = MapEntryType(mutation.Type),
                    Quantity = Math.Abs(mutation.Quantity),
                    UnitOfMeasureCode = mutation.UOM,
                    LotNo = mutation.LotNumber,
                    ExpirationDate = mutation.ExpiryDate,
                    Description = $"WACS: {mutation.Reference}",
                    ExternalDocumentNo = mutation.Reference
                };

                await _bcClient.PostItemJournalLineAsync(bcEntry);

                await _mutations.MarkSyncedAsync(mutation.Id);
            }
            catch (Exception ex)
            {
                await _mutations.MarkFailedAsync(mutation.Id, ex.Message);
                _logger.LogError(ex,
                    "Sync naar BC gefaald voor mutatie {MutationId}", mutation.Id);
            }
        }
    }

    private BCEntryType MapEntryType(MutationType type) => type switch
    {
        MutationType.Receipt => BCEntryType.PositiveAdjustment,
        MutationType.Shipment => BCEntryType.NegativeAdjustment,
        MutationType.PositiveCorrection => BCEntryType.PositiveAdjustment,
        MutationType.NegativeCorrection => BCEntryType.NegativeAdjustment,
        MutationType.Transfer => BCEntryType.Transfer,
        _ => throw new ArgumentException($"Onbekend type: {type}")
    };
}
```

---

## KPI's voor Warehouse

### Operationele KPI's

| KPI | Definitie | Hoe meten | Streefwaarde |
|-----|-----------|-----------|--------------|
| **Order Accuracy** | Juiste product, juiste hoeveelheid, juiste locatie | Fouten / totale picks | > 99.5% |
| **On-Time Dispatch** | Order klaar vóór deadline | Te laat / totaal | > 98% |
| **Stock Accuracy** | Systeem klopt met werkelijkheid | Juiste / totale locaties bij telling | > 99% |
| **Picks per uur** | Productiviteit per picker | Picks / uururen | Benchmark-afhankelijk |
| **FEFO Compliance** | FEFO correct gevolgd | Niet-FEFO picks / totaal | 100% |
| **Dock-to-Stock tijd** | Ontvangst tot opgeslagen | Gemiddelde tijd | < 4u |
| **Space Utilization** | Bezettingsgraad van het magazijn | Bezette locaties / totaal | 70-85% |

### Rapportage query

```sql
-- Dagelijks KPI rapport
SELECT
    CAST(GETDATE() AS DATE) AS ReportDate,

    -- Order Accuracy
    CAST(
        SUM(CASE WHEN po.HasErrors = 0 THEN 1 ELSE 0 END) * 100.0 /
        NULLIF(COUNT(*), 0) AS DECIMAL(5,2)
    ) AS OrderAccuracyPct,

    -- On-Time Dispatch
    CAST(
        SUM(CASE WHEN po.CompletedAt <= po.RequiredBy THEN 1 ELSE 0 END) * 100.0 /
        NULLIF(SUM(CASE WHEN po.CompletedAt IS NOT NULL THEN 1 ELSE 0 END), 0) AS DECIMAL(5,2)
    ) AS OnTimeDispatchPct,

    -- Productiviteit
    SUM(po.TotalPickLines) AS TotalPicks,
    CAST(SUM(po.TotalPickLines) * 1.0 /
        NULLIF(SUM(DATEDIFF(MINUTE, po.StartedAt, po.CompletedAt)) / 60.0, 0)
    AS DECIMAL(8,1)) AS PicksPerHour

FROM PickOrders po
WHERE CAST(po.CompletedAt AS DATE) = CAST(GETDATE() AS DATE)
  AND po.Status = 'Completed';
```

---

## Best Practices

### Scannen is heilig

Elke handeling in het magazijn moet bevestigd worden via een scan. Handmatige invoer = fouten.

```
Ontvangst: scan leveringsbon → scan artikel barcode → scan locatie
Putaway:   scan pickorder → scan artikel → scan doellocatie
Picken:    scan picklijst → scan locatie → scan artikel → bevestig hoeveelheid
Verladen:  scan vrachtwagen/dock → scan alle dozen/pallets
```

### De dubbele-scan regel

Bij kritische operaties (bijv. gevaarlijke stoffen, medicijnen): scanner bevestigt locatie EN artikel, en daarna nogmaals. Twee keer fout scannen is vrijwel onmogelijk.

### Exception management

- **Geblokkeerde voorraad** (kwaliteitsproblemen): aparte zone, aparte status
- **Short pick** (te weinig voorraad): automatisch melden aan planner
- **Locatiefout** (artikel staat niet waar het hoort): exception workflow starten
- **Beschadigde goederen**: foto + rapport, aparte locatie

---

*[← Terug naar overzicht](../../README.md)*
