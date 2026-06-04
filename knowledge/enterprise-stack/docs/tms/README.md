# TMS — TAS (Transport Management System)

## Wat is een TMS en waarom?

Een **Transport Management System (TMS)** beheert alles wat met het vervoer van goederen te maken heeft: van het ontvangen van een transportopdracht tot de bevestiging van aflevering bij de klant.

**Zonder TMS:**
- Ritten worden handmatig ingepland op whiteboard of in Excel
- Chauffeurs krijgen een papiertje mee
- Klanten bellen om te vragen waar hun lading is
- Er is geen zicht op kosten per rit, per klant of per route
- Overschrijdingen van rijtijden worden niet bewaakt

**Met TAS (TMS):**
- Transportorders komen automatisch binnen (via API of EDI)
- Planners zien beschikbaarheid van chauffeurs en voertuigen in één scherm
- Chauffeurs ontvangen opdrachten op hun handterminal of app
- Klanten volgen hun zending via track & trace
- Boekhouding krijgt automatisch de verrijkte data voor facturatie

**TAS** is het TMS systeem in onze logistieke omgeving. Het integreert met WACS (WMS) voor goederenvoorbereiding en met Business Central (ERP) voor facturatie.

---

## Hoe stroomt een transportorder door TAS?

```
STAP 1: ONTVANGST
  ├── Klant plaatst order via selfservice portal
  ├── WACS stuurt pickorder klaar-signaal
  ├── Business Central stuurt verkooporder
  └── EDI bericht van externe klant

STAP 2: VALIDATIE
  ├── Adressen valideren (postcode, land)
  ├── Gewicht en volume controleren
  ├── ADR documenten controleren (gevaarlijke stoffen)
  └── Klantakkoorden controleren (tariefafspraken)

STAP 3: PLANNING
  ├── Planner wijst order toe aan rit
  │   ├── Handmatig: planner sleept order naar rit
  │   └── Automatisch: optimizer stelt optimale rit voor
  ├── Chauffeur en voertuig koppelen
  └── Volgorde van stops bepalen

STAP 4: UITVOERING
  ├── Chauffeur vertrekt — status: "In transit"
  ├── GPS tracking: positie real-time zichtbaar
  ├── Aankomen bij pick-up — chauffeur scant goederen
  ├── Rijden naar bestemming
  ├── Aankomen bij aflevering — chauffeur scant + handtekening klant
  └── Bevestiging: "Afgeleverd" met timestamp en bewijs

STAP 5: AFHANDELING
  ├── Retourzendingen verwerken (indien van toepassing)
  ├── Data naar BC sturen voor facturatie
  ├── KPI's bijwerken (OTD, rijtijden, brandstof)
  └── Eventuele claims/schades registreren
```

---

## Datamodel — Hoe TAS data structureert

### Transportorder

```sql
CREATE TABLE TransportOrders (
    Id              INT IDENTITY(1,1)   NOT NULL,
    OrderNumber     NVARCHAR(50)        NOT NULL,  -- bijv. TAS-2026-00142

    -- Opdrachtgever
    CustomerCode    NVARCHAR(20)        NOT NULL,
    CustomerRef     NVARCHAR(50)            NULL,  -- Klant eigen referentie

    -- Tijden
    RequestedPickupDate     DATE            NULL,
    RequestedDeliveryDate   DATE            NULL,
    PickupTimeWindowFrom    TIME(0)         NULL,
    PickupTimeWindowTo      TIME(0)         NULL,
    DeliveryTimeWindowFrom  TIME(0)         NULL,
    DeliveryTimeWindowTo    TIME(0)         NULL,

    -- Afmetingen (totaal voor de order)
    TotalWeightKg   DECIMAL(10,2)           NULL,
    TotalVolumeM3   DECIMAL(10,4)           NULL,
    PalletCount     SMALLINT                NULL,
    ColiCount       SMALLINT                NULL,

    -- Bijzonderheden
    HasDangerousGoods   BIT             NOT NULL DEFAULT 0,
    ADRClass            NVARCHAR(10)        NULL,
    RequiresTailLift    BIT             NOT NULL DEFAULT 0,
    RequiresCooling     BIT             NOT NULL DEFAULT 0,
    SpecialInstructions NVARCHAR(500)       NULL,

    -- Status
    Status          NVARCHAR(30)        NOT NULL DEFAULT 'New',
    -- New / Planned / PickedUp / InTransit / Delivered / Failed / Invoiced

    -- Koppeling
    TripId          INT                     NULL,  -- FK naar Trips
    WacsPickOrderRef NVARCHAR(50)           NULL,  -- Referentie naar WACS
    BCOrderNumber    NVARCHAR(30)           NULL,  -- Verkooporder in BC

    -- Audit
    CreatedAt       DATETIME2(0)        NOT NULL DEFAULT SYSDATETIME(),
    CreatedById     INT                 NOT NULL,
    ModifiedAt      DATETIME2(0)            NULL,

    CONSTRAINT PK_TransportOrders PRIMARY KEY (Id),
    CONSTRAINT UQ_TOrders_Number UNIQUE (OrderNumber),
    CONSTRAINT CHK_TOrders_Status CHECK (Status IN (
        'New','Planned','PickedUp','InTransit',
        'Delivered','Failed','Cancelled','Invoiced'))
);

CREATE TABLE TransportOrderLines (
    Id              INT IDENTITY(1,1)   NOT NULL,
    TransportOrderId INT                NOT NULL,
    LineNumber      SMALLINT            NOT NULL,
    ArticleCode     NVARCHAR(30)        NOT NULL,
    Description     NVARCHAR(100)       NOT NULL,
    Quantity        DECIMAL(12,3)       NOT NULL,
    UOM             NVARCHAR(10)        NOT NULL,  -- ST, KG, PAL, COL
    WeightKg        DECIMAL(10,2)           NULL,
    VolumeM3        DECIMAL(10,4)           NULL,
    LotNumber       NVARCHAR(30)            NULL,
    ExpiryDate      DATE                    NULL,

    -- Resultaat
    QuantityDelivered DECIMAL(12,3)         NULL,
    DeliveryNote    NVARCHAR(200)           NULL,

    CONSTRAINT PK_TOLines PRIMARY KEY (Id),
    CONSTRAINT FK_TOLines_Order FOREIGN KEY (TransportOrderId)
        REFERENCES TransportOrders(Id) ON DELETE CASCADE
);
```

### Ritten en chauffeurs

```sql
CREATE TABLE Trips (
    Id              INT IDENTITY(1,1)   NOT NULL,
    TripNumber      NVARCHAR(30)        NOT NULL,
    TripDate        DATE                NOT NULL,

    -- Resources
    DriverId        INT                 NOT NULL,
    VehicleId       INT                 NOT NULL,
    TrailerId       INT                     NULL,

    -- Tijden
    PlannedDeparture    TIME(0)             NULL,
    ActualDeparture     DATETIME2(0)        NULL,
    PlannedReturn       TIME(0)             NULL,
    ActualReturn        DATETIME2(0)        NULL,

    -- Status
    Status          NVARCHAR(20)        NOT NULL DEFAULT 'Planned',
    TotalDistanceKm DECIMAL(8,1)            NULL,
    FuelUsedLiters  DECIMAL(8,2)            NULL,

    CONSTRAINT PK_Trips PRIMARY KEY (Id),
    CONSTRAINT UQ_Trips_Number UNIQUE (TripNumber),
    CONSTRAINT FK_Trips_Driver FOREIGN KEY (DriverId) REFERENCES Drivers(Id),
    CONSTRAINT FK_Trips_Vehicle FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id)
);

CREATE TABLE TripStops (
    Id              INT IDENTITY(1,1)   NOT NULL,
    TripId          INT                 NOT NULL,
    StopSequence    SMALLINT            NOT NULL,
    StopType        NVARCHAR(10)        NOT NULL,  -- Pickup / Delivery / Fuel / Rest

    -- Locatie
    CompanyName     NVARCHAR(100)       NOT NULL,
    Street          NVARCHAR(100)       NOT NULL,
    PostalCode      NVARCHAR(10)        NOT NULL,
    City            NVARCHAR(50)        NOT NULL,
    CountryCode     NVARCHAR(2)         NOT NULL DEFAULT 'BE',
    Latitude        DECIMAL(9,6)            NULL,
    Longitude       DECIMAL(9,6)            NULL,

    -- Tijden
    PlannedArrival  DATETIME2(0)            NULL,
    ActualArrival   DATETIME2(0)            NULL,
    PlannedDeparture DATETIME2(0)           NULL,
    ActualDeparture DATETIME2(0)            NULL,
    TimeWindowFrom  TIME(0)                 NULL,
    TimeWindowTo    TIME(0)                 NULL,

    -- Resultaat
    StatusCode      NVARCHAR(30)            NULL,
    -- Delivered / NotHome / Refused / PartialDelivery / Damaged
    SignatureName   NVARCHAR(100)           NULL,
    SignatureData   NVARCHAR(MAX)           NULL,  -- Base64 encoded afbeelding
    ProofOfDelivery NVARCHAR(500)           NULL,  -- URL naar foto in Blob Storage

    CONSTRAINT PK_TripStops PRIMARY KEY (Id),
    CONSTRAINT FK_TripStops_Trip FOREIGN KEY (TripId) REFERENCES Trips(Id)
);
```

---

## Routeplanning & Optimalisatie

### Het Vehicle Routing Problem (VRP)

Het plannen van ritten is wiskundig complex — het is een variant van het beroemde "Travelling Salesman Problem". Een goede optimizer bespaart 15-30% op transportkosten.

**Constraints bij routeplanning:**

```
VOERTUIG CONSTRAINTS:
  ✓ Maximaal laadvermogen (kg)
  ✓ Maximaal laadvolume (m³)
  ✓ ADR vergunning vereist voor gevaarlijke stoffen
  ✓ Koelaanhangwagen voor temperatuurgevoelige goederen
  ✓ Straatnormen (EURO 5/6 voor milieuzones)

CHAUFFEUR CONSTRAINTS:
  ✓ Maximale rijtijd per dag (EU: 9u, uitzonderlijk 10u)
  ✓ Verplichte rustpauze (45 min na 4,5u rijden)
  ✓ Minimale rusttijd tussen diensten (11u)
  ✓ Wekelijkse rusttijd (45u per week)
  ✓ ADR certificaat voor gevaarlijke stoffen
  ✓ Rijbewijs categorie (BE voor combinaties)

TIJDVENSTER CONSTRAINTS:
  ✓ Klant wil levering tussen 08:00 en 12:00
  ✓ Ophaling pas mogelijk na 14:00 (goederen zijn dan klaar)
  ✓ Geen leveringen op zon- en feestdagen

GEOGRAFISCHE CONSTRAINTS:
  ✓ Milieuzones (LEZ): oud diesel verboden in stadscentra
  ✓ Gewichtsrestricties op bepaalde bruggen/wegen
  ✓ Hoogtebeperkingen (tunnels, viaducten)
  ✓ Voorkeurswegen (snelweg vs. secundaire wegen)
```

### ETA berekening

```sql
-- Berekende aankomsttijden (ETA) per stop
CREATE OR ALTER VIEW vw_TripStopsWithETA AS
SELECT
    t.TripNumber,
    t.TripDate,
    d.Name AS DriverName,
    v.LicensePlate,
    ts.StopSequence,
    ts.StopType,
    ts.CompanyName,
    ts.City,
    ts.PlannedArrival,
    ts.ActualArrival,
    ts.TimeWindowFrom,
    ts.TimeWindowTo,
    ts.StatusCode,

    -- Is de stop op tijd?
    CASE
        WHEN ts.ActualArrival IS NULL AND t.Status = 'InProgress'
            THEN 'In transit'
        WHEN ts.ActualArrival IS NULL
            THEN 'Gepland'
        WHEN ts.ActualArrival <= ts.PlannedArrival
            THEN 'Op tijd'
        WHEN DATEDIFF(MINUTE, ts.PlannedArrival, ts.ActualArrival) <= 15
            THEN 'Licht te laat (<15 min)'
        ELSE
            CONCAT('Te laat: +',
                DATEDIFF(MINUTE, ts.PlannedArrival, ts.ActualArrival),
                ' min')
    END AS Punctualiteit,

    -- OTD (On-Time Delivery) vlag
    CASE
        WHEN ts.StopType = 'Delivery'
             AND ts.ActualArrival IS NOT NULL
             AND ts.TimeWindowTo IS NOT NULL
        THEN
            CASE WHEN CAST(ts.ActualArrival AS TIME) <= ts.TimeWindowTo THEN 1 ELSE 0 END
        ELSE NULL
    END AS OTD,

    -- Rijtijd naar deze stop
    DATEDIFF(MINUTE,
        LAG(ts.ActualDeparture) OVER (PARTITION BY ts.TripId ORDER BY ts.StopSequence),
        ts.ActualArrival
    ) AS DriveTimeMinutes

FROM Trips t
INNER JOIN TripStops ts ON ts.TripId = t.Id
INNER JOIN Drivers d ON d.Id = t.DriverId
INNER JOIN Vehicles v ON v.Id = t.VehicleId;
```

---

## Track & Trace

### De statusmachine van een zending

```
New ──────────────────────► Planned ──────────────── Cancelled
                                │
                                │ Chauffeur vertrekt
                                ▼
                            In Transit
                                │
                         ┌──────┴──────┐
                         │             │
                         ▼             ▼
                 Bij ophaling     Onderweg naar
                 (Pickup stop)    volgende stop
                         │             │
                         ▼             │
                   Goederen           │
                   geladen ──────────►│
                                      │
                                      ▼
                                Bij aflevering
                                (Delivery stop)
                                      │
                    ┌─────────────────┼──────────────┐
                    │                 │              │
                    ▼                 ▼              ▼
               Delivered         Not Home        Refused
                    │                 │              │
                    │          Nieuwe levering    Retour
                    │          ingepland         in verwerking
                    ▼
               Invoiced (data naar BC)
```

### Klant notificaties automatiseren

```csharp
public class TrackTraceNotificationService : ITrackTraceNotificationService
{
    private readonly IEmailService _email;
    private readonly ISmsService _sms;
    private readonly ILogger<TrackTraceNotificationService> _logger;

    public async Task NotifyStatusChangeAsync(
        TransportOrder order, TripStop stop, string newStatus)
    {
        var notifications = DetermineNotifications(order, stop, newStatus);

        foreach (var notification in notifications)
        {
            if (!string.IsNullOrEmpty(order.CustomerEmail))
                await _email.SendAsync(
                    order.CustomerEmail,
                    notification.Subject,
                    notification.HtmlBody);

            if (!string.IsNullOrEmpty(order.CustomerMobile) && notification.SendSms)
                await _sms.SendAsync(order.CustomerMobile, notification.SmsText);
        }
    }

    private static IEnumerable<NotificationContent> DetermineNotifications(
        TransportOrder order, TripStop stop, string status)
    {
        return status switch
        {
            "InTransit" => [new NotificationContent(
                Subject: $"Uw zending {order.OrderNumber} is onderweg",
                HtmlBody: $"""
                    <h2>Uw zending is onderweg!</h2>
                    <p>Ordernummer: <strong>{order.OrderNumber}</strong></p>
                    <p>Verwachte levering: <strong>{stop.PlannedArrival:dd/MM/yyyy}</strong>
                       tussen <strong>{order.DeliveryTimeWindowFrom:HH:mm}</strong>
                       en <strong>{order.DeliveryTimeWindowTo:HH:mm}</strong></p>
                    <p><a href="https://track.bedrijf.be/{order.TrackingCode}">
                       Volg uw zending live</a></p>
                    """,
                SmsText: $"Uw zending {order.OrderNumber} is onderweg. " +
                          $"Verwachte levering: {stop.PlannedArrival:dd/MM} " +
                          $"{order.DeliveryTimeWindowFrom:HH:mm}-{order.DeliveryTimeWindowTo:HH:mm}",
                SendSms: true
            )],

            "Delivered" => [new NotificationContent(
                Subject: $"Uw zending {order.OrderNumber} is afgeleverd",
                HtmlBody: $"""
                    <h2>Afgeleverd!</h2>
                    <p>Uw zending <strong>{order.OrderNumber}</strong> is
                       afgeleverd op <strong>{stop.ActualArrival:dd/MM/yyyy HH:mm}</strong>.</p>
                    <p>Ontvangen door: {stop.SignatureName}</p>
                    <p>Niet tevreden? <a href="mailto:info@bedrijf.be">Neem contact op</a></p>
                    """,
                SmsText: $"Zending {order.OrderNumber} afgeleverd op {stop.ActualArrival:dd/MM HH:mm}.",
                SendSms: false  // Geen SMS bij aflevering — e-mail volstaat
            )],

            "NotHome" => [new NotificationContent(
                Subject: $"Aflevering {order.OrderNumber} mislukt — Niemand aanwezig",
                HtmlBody: $"""
                    <h2>We konden niet leveren</h2>
                    <p>We probeerden uw zending <strong>{order.OrderNumber}</strong> af te leveren
                       maar er was niemand aanwezig.</p>
                    <p>We nemen contact met u op om een nieuwe levering in te plannen.</p>
                    """,
                SmsText: $"Aflevering {order.OrderNumber} mislukt: niemand aanwezig. " +
                          "We nemen contact met u op.",
                SendSms: true
            )],

            _ => []
        };
    }
}
```

---

## Integratie TAS ↔ WACS

### Flow: Van verkooporder tot picking gereed

```
Business Central        TAS                    WACS
    │                    │                       │
    │ Verkooporder       │                       │
    │ bevestigd          │                       │
    ├──────────────────► │                       │
    │                    │ Transportorder        │
    │                    │ aanmaken              │
    │                    │                       │
    │                    │ Pickorder request     │
    │                    ├──────────────────────►│
    │                    │                       │ Picking uitvoeren
    │                    │                       │ (FEFO, locaties)
    │                    │ "Klaar voor verlading"│
    │                    │◄──────────────────────┤
    │                    │                       │
    │                    │ Rit aanmaken en        │
    │                    │ plannen               │
    │                    │                       │
    │ Vrachtbrief data   │                       │
    │◄───────────────────┤                       │
    │                    │                       │
```

```csharp
// In TAS: ontvang "klaar voor verlading" signaal van WACS
[ApiController]
[Route("api/wacs-callbacks")]
public class WacsCallbackController : ControllerBase
{
    private readonly ITripPlanningService _planning;
    private readonly ITransportOrderRepository _orderRepo;

    [HttpPost("picking-complete")]
    public async Task<IActionResult> PickingComplete(
        [FromBody] WacsPickingCompleteDto dto)
    {
        var order = await _orderRepo.GetByWacsReferenceAsync(dto.WacsReference);
        if (order is null)
            return NotFound($"Geen order gevonden voor WACS referentie {dto.WacsReference}");

        // Bijwerken met de werkelijke gegevens van WACS
        order.ActualWeightKg = dto.TotalWeightKg;
        order.ActualVolumeM3 = dto.TotalVolumeM3;
        order.Status = TransportOrderStatus.ReadyForLoading;

        // Update de orderlijnen met de gepickte aantallen en loten
        foreach (var line in dto.Lines)
        {
            var orderLine = order.Lines.FirstOrDefault(l => l.ArticleCode == line.ArticleCode);
            if (orderLine is not null)
            {
                orderLine.QuantityDelivered = line.QuantityPicked;
                orderLine.LotNumber = line.LotNumber;
                orderLine.ExpiryDate = line.ExpiryDate;
            }
        }

        await _orderRepo.UpdateAsync(order);

        // Trigger automatische ritplanning als de order urgent is
        if (order.Priority == TransportPriority.High)
        {
            await _planning.TryAssignToNextAvailableTripAsync(order);
        }

        return Ok();
    }
}
```

---

## Facturatie naar Business Central

Na aflevering moet TAS de factuurdata naar BC sturen:

```csharp
public class InvoiceSyncService
{
    private readonly IBCClient _bc;
    private readonly ITariffEngine _tariffs;

    public async Task SyncDeliveredOrderToBCAsync(TransportOrder order, Trip trip)
    {
        // Bereken transportkosten op basis van tariefafspraken
        var costLines = await _tariffs.CalculateAsync(order, trip);

        var salesOrder = new BCSalesOrderCommand
        {
            // Koppeling met BC
            SellToCustomerNo = order.CustomerCode,
            ExternalDocumentNo = order.OrderNumber,
            RequestedDeliveryDate = order.ActualDeliveryDate,
            ShipmentDate = order.ActualDeliveryDate,
            YourReference = order.CustomerRef,

            Lines = costLines.Select(c => new BCSalesLineCommand
            {
                Type = "Item",
                No = c.TariffCode,
                Description = c.Description,
                Quantity = c.Quantity,
                UnitOfMeasureCode = c.UOM,
                UnitPrice = c.UnitPrice,
                // Verwijs naar de TAS order voor traceerbaarheid
                Description2 = $"TAS: {order.OrderNumber}"
            }).ToList()
        };

        var bcOrderNumber = await _bc.CreateSalesOrderAsync(salesOrder);

        order.BCOrderNumber = bcOrderNumber;
        order.Status = TransportOrderStatus.Invoiced;
        await _orderRepo.UpdateAsync(order);
    }
}

public class TariffEngine : ITariffEngine
{
    public async Task<List<TariffLine>> CalculateAsync(TransportOrder order, Trip trip)
    {
        var tariff = await _tariffRepo.GetForCustomerAsync(order.CustomerCode);
        var lines = new List<TariffLine>();

        // Basistarief
        lines.Add(new TariffLine
        {
            TariffCode = tariff.BaseTariffCode,
            Description = "Basistarief transport",
            Quantity = 1,
            UOM = "ST",
            UnitPrice = tariff.BaseRate
        });

        // Gewichtsopslag
        if (order.ActualWeightKg > tariff.FreeWeightKg)
        {
            var excessKg = order.ActualWeightKg - tariff.FreeWeightKg;
            lines.Add(new TariffLine
            {
                TariffCode = tariff.WeightSurchargeTariffCode,
                Description = $"Gewichtsopslag ({excessKg:F0} kg boven vrijgesteld gewicht)",
                Quantity = excessKg,
                UOM = "KG",
                UnitPrice = tariff.WeightSurchargePerKg
            });
        }

        // Brandstoftoeslag (fuel surcharge)
        var fuelSurcharge = lines.Sum(l => l.Quantity * l.UnitPrice) * tariff.FuelSurchargePct;
        if (fuelSurcharge > 0)
        {
            lines.Add(new TariffLine
            {
                TariffCode = tariff.FuelSurchargeTariffCode,
                Description = $"Brandstoftoeslag ({tariff.FuelSurchargePct * 100:F1}%)",
                Quantity = 1,
                UOM = "ST",
                UnitPrice = fuelSurcharge
            });
        }

        // Nacht/weekend toeslag
        if (trip.ActualDeparture?.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday
            || trip.ActualDeparture?.Hour is < 6 or > 20)
        {
            lines.Add(new TariffLine
            {
                TariffCode = "BUITEN-UUR",
                Description = "Toeslag buiten normale werkuren",
                Quantity = 1,
                UOM = "ST",
                UnitPrice = tariff.OutOfHoursRate
            });
        }

        return lines;
    }
}
```

---

## KPI's voor Transport

```sql
-- Volledig KPI-rapport voor transport
CREATE OR ALTER VIEW vw_TransportKPI AS
WITH DeliveryStats AS (
    SELECT
        YEAR(ts.ActualArrival) AS [Year],
        MONTH(ts.ActualArrival) AS [Month],
        DATENAME(MONTH, ts.ActualArrival) AS MonthName,
        to2.CustomerCode,

        COUNT(*) AS TotalDeliveries,

        -- OTD: afgeleverd binnen tijdvenster?
        SUM(CASE
            WHEN ts.TimeWindowTo IS NOT NULL
             AND CAST(ts.ActualArrival AS TIME) <= ts.TimeWindowTo
            THEN 1 ELSE 0
        END) AS OnTimeDeliveries,

        -- First Attempt Success Rate
        SUM(CASE
            WHEN ts.StatusCode = 'Delivered' THEN 1 ELSE 0
        END) AS SuccessfulFirstAttempt,

        -- Gemiddelde vertraging bij te late leveringen
        AVG(CASE
            WHEN ts.TimeWindowTo IS NOT NULL
             AND CAST(ts.ActualArrival AS TIME) > ts.TimeWindowTo
            THEN DATEDIFF(MINUTE,
                CAST(ts.TimeWindowTo AS DATETIME2),
                CAST(CAST(ts.ActualArrival AS TIME) AS DATETIME2))
            ELSE NULL
        END) AS AvgDelayMinutes

    FROM TripStops ts
    INNER JOIN TransportOrders to2 ON to2.TripId = ts.TripId
    WHERE ts.StopType = 'Delivery'
      AND ts.ActualArrival IS NOT NULL
    GROUP BY
        YEAR(ts.ActualArrival),
        MONTH(ts.ActualArrival),
        DATENAME(MONTH, ts.ActualArrival),
        to2.CustomerCode
)
SELECT
    [Year],
    [Month],
    MonthName,
    CustomerCode,
    TotalDeliveries,
    OnTimeDeliveries,
    ROUND(OnTimeDeliveries * 100.0 / NULLIF(TotalDeliveries, 0), 1) AS OTD_Pct,
    SuccessfulFirstAttempt,
    ROUND(SuccessfulFirstAttempt * 100.0 / NULLIF(TotalDeliveries, 0), 1) AS FADR_Pct,
    AvgDelayMinutes
FROM DeliveryStats;

-- Brandstofverbruik en CO₂
SELECT
    t.TripDate,
    v.VehicleType,
    v.EuroNorm,
    t.TotalDistanceKm,
    t.FuelUsedLiters,
    ROUND(t.FuelUsedLiters / NULLIF(t.TotalDistanceKm, 0) * 100, 2) AS LitersPer100km,
    -- CO₂ berekening: diesel = 2.64 kg CO₂ per liter
    ROUND(t.FuelUsedLiters * 2.64, 1) AS CO2_kg,
    COUNT(ts.Id) AS NumberOfStops,
    SUM(o.ActualWeightKg) AS TotalWeightKg,
    -- CO₂ per ton·km (duurzaamheidsindicator)
    ROUND(
        (t.FuelUsedLiters * 2.64) /
        NULLIF((SUM(o.ActualWeightKg) / 1000.0) * t.TotalDistanceKm, 0),
        3
    ) AS CO2_per_TonKm
FROM Trips t
INNER JOIN Vehicles v ON v.Id = t.VehicleId
INNER JOIN TripStops ts ON ts.TripId = t.Id AND ts.StopType = 'Delivery'
INNER JOIN TransportOrders o ON o.TripId = t.Id
WHERE t.TripDate >= DATEADD(MONTH, -3, GETDATE())
  AND t.FuelUsedLiters IS NOT NULL
GROUP BY
    t.TripDate, t.TripId, v.VehicleType, v.EuroNorm,
    t.TotalDistanceKm, t.FuelUsedLiters
ORDER BY t.TripDate DESC;
```

---

## Best Practices voor TMS Integraties

### Architectuurprincipes

```
1. EVENT-DRIVEN: gebruik een berichtenwachtrij (Azure Service Bus)
   → TAS publiceert events: "OrderConfirmed", "OrderDelivered"
   → BC en WACS consumeren die events
   → Geen directe afhankelijkheden, betere veerkracht

2. IDEMPOTENTIE: zelfde bericht twee keer = zelfde resultaat
   → Verwerk een "OrderDelivered" event twee keer = geen dubbele factuur
   → Gebruik OrderNumber als unieke sleutel bij insert

3. CORRELATION IDs: traceer een order door alle systemen
   → Elke order heeft een unieke ID die overal meekomt
   → Bij problemen: zoek op dit ID in logs van TAS, WACS en BC

4. MASTER DATA: één systeem is eigenaar van elk type data
   → Klantdata: Business Central is de master
   → Voertuigdata: TAS is de master
   → Voorraadlocaties: WACS is de master
   → Andere systemen synchroniseren, niet dupliceren

5. INTERFACE CATALOGUS: documenteer alle integratiepunten
   → Welk systeem stuurt wat naar welk systeem
   → Formaat, frequentie, foutafhandeling
   → Contactpersoon per systeem
```

---

*[← Terug naar overzicht](../../README.md)*
