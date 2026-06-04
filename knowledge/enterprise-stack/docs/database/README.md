# Database — MS SQL Server / T-SQL

## Wat is een relationele database?

Een **relationele database** slaat data op in tabellen (zoals Excel-bladen) die via sleutels met elkaar verbonden zijn. SQL Server is de relationele database van Microsoft en de standaard in de Microsoft enterprise stack.

**T-SQL (Transact-SQL)** is de taal waarmee je data opvraagt, aanpast, verwijdert en beheert in SQL Server. Het is een uitbreiding van de standaard SQL taal met extra functies zoals opgeslagen procedures, triggers en foutafhandeling.

**Waarom SQL Server?**
- Naadloze integratie met .NET, Business Central, Power BI en Azure
- Zeer volwassen product met tientallen jaren enterprise-gebruik
- Krachtige query optimizer die queries automatisch optimaliseert
- Uitstekende tooling (SSMS, Azure Data Studio)
- Hoge beschikbaarheid via AlwaysOn Availability Groups

---

## SSMS — SQL Server Management Studio

**SSMS** is de gratis tool van Microsoft om met SQL Server te werken. Hiermee kan je:
- Queries schrijven en uitvoeren
- Tabelstructuren bekijken en aanpassen
- Uitvoeringsplannen analyseren
- Backups beheren
- Performance monitoren

> Download: [SSMS downloaden](https://aka.ms/ssmsfullsetup) (gratis)

**Handige SSMS sneltoetsen:**
| Sneltoets | Actie |
|-----------|-------|
| `F5` | Voer query uit |
| `Ctrl+M` | Toon uitvoeringsplan |
| `Ctrl+L` | Toon geschat uitvoeringsplan (zonder uitvoering) |
| `Ctrl+K, Ctrl+C` | Commentaar toevoegen |
| `Ctrl+K, Ctrl+U` | Commentaar verwijderen |
| `Alt+F1` | Objectinformatie (sp_help) |

---

## Data Types — Welk type voor wat?

Het kiezen van het juiste data type is essentieel voor performantie en datakwaliteit.

```sql
-- TEKST
NVARCHAR(100)       -- Unicode tekst (gebruik altijd N voor internationale tekens)
NVARCHAR(MAX)       -- Grote teksten (max 2GB) — gebruik spaarzaam, trager
VARCHAR(100)        -- ASCII tekst (gebruik alleen als je zeker bent: enkel Engels/cijfers)

-- GETALLEN
INT                 -- Geheel getal: -2.147.483.648 tot 2.147.483.647
BIGINT              -- Groot geheel getal (voor grote ID's, aantallen)
SMALLINT            -- Klein geheel getal: -32.768 tot 32.767
TINYINT             -- Heel klein: 0 tot 255 (status codes, etc.)
DECIMAL(18,4)       -- Exacte decimalen — gebruik dit voor GELD, nooit FLOAT
FLOAT               -- Benaderend decimaal — nooit voor geld (afrondingsfouten!)
MONEY               -- Geld type (4 decimalen) — minder flexibel dan DECIMAL

-- DATUM EN TIJD
DATETIME2(0)        -- Datum + tijd, nauwkeurig tot de seconde (gebruik dit)
DATETIME2(7)        -- Datum + tijd, nauwkeurig tot 100 nanoseconden
DATE                -- Alleen datum, geen tijd (bijv. geboortedatum)
TIME(0)             -- Alleen tijd (bijv. openingstijden)
DATETIMEOFFSET      -- Met tijdzone — gebruik voor internationale systemen

-- OVERIG
BIT                 -- Boolean: 0 (false) of 1 (true)
UNIQUEIDENTIFIER    -- GUID: {3F2504E0-4F89-11D3-9A0C-0305E82C3301}
VARBINARY(MAX)      -- Binaire data (bestanden) — overweeg Blob Storage
```

> **Regel:** gebruik `NVARCHAR` i.p.v. `VARCHAR` tenzij je 100% zeker bent dat er nooit unicode nodig is. Gebruik `DECIMAL(18,4)` voor alle geldbedragen, nooit `FLOAT`.

---

## Basisquery's begrijpen

### SELECT — Data ophalen

```sql
-- Eenvoudige select
SELECT Id, OrderNumber, OrderDate, TotalAmount
FROM Orders
WHERE Status = 'Open';

-- Alle kolommen ophalen (gebruik spaarzaam — trager en minder duidelijk)
SELECT * FROM Orders;

-- Kolom hernoemen met alias
SELECT
    o.Id,
    o.OrderNumber                      AS 'Ordernummer',
    UPPER(o.Status)                    AS 'Status (hoofdletters)',
    o.TotalAmount * 1.21               AS 'Bedrag incl. BTW',
    FORMAT(o.OrderDate, 'dd/MM/yyyy')  AS 'Datum'
FROM Orders o
WHERE o.IsDeleted = 0;
```

### WHERE — Filteren

```sql
-- Meerdere condities
WHERE Status = 'Open' AND TotalAmount > 1000

-- OF conditie
WHERE Status = 'Cancelled' OR Status = 'Rejected'

-- Tussen twee waarden (inclusief grenzen)
WHERE OrderDate BETWEEN '2026-01-01' AND '2026-12-31'

-- In een lijst van waarden
WHERE Status IN ('Open', 'Confirmed', 'InProgress')

-- Niet in een lijst
WHERE Status NOT IN ('Cancelled', 'Draft')

-- Tekst zoeken (LIKE)
WHERE CustomerName LIKE 'Jan%'      -- Begint met "Jan"
WHERE CustomerName LIKE '%BV'       -- Eindigt op "BV"
WHERE CustomerName LIKE '%logist%'  -- Bevat "logist"

-- NULL controleren (nooit = NULL gebruiken!)
WHERE DeliveryDate IS NULL          -- Nog niet afgeleverd
WHERE DeliveryDate IS NOT NULL      -- Wel afgeleverd
```

### JOIN — Tabellen combineren

```sql
-- INNER JOIN: alleen records die in BEIDE tabellen voorkomen
SELECT
    o.OrderNumber,
    o.OrderDate,
    c.Name AS KlantNaam,
    c.City AS Stad
FROM Orders o
INNER JOIN Customers c ON c.Id = o.CustomerId;

-- LEFT JOIN: alle records uit linker tabel, ook als er geen match is
-- (klanten ZONDER orders verschijnen ook)
SELECT
    c.Name AS KlantNaam,
    COUNT(o.Id) AS AantalOrders
FROM Customers c
LEFT JOIN Orders o ON o.CustomerId = c.Id
GROUP BY c.Name;

-- Meerdere joins combineren
SELECT
    o.OrderNumber,
    c.Name AS KlantNaam,
    ol.ProductCode,
    p.ProductName,
    ol.Quantity,
    ol.UnitPrice,
    ol.Quantity * ol.UnitPrice AS Totaal
FROM Orders o
INNER JOIN Customers c ON c.Id = o.CustomerId
INNER JOIN OrderLines ol ON ol.OrderId = o.Id
INNER JOIN Products p ON p.Id = ol.ProductId
WHERE o.Status = 'Confirmed'
ORDER BY o.OrderDate DESC, ol.ProductCode;
```

### GROUP BY + Aggregaties

```sql
-- Omzet per klant
SELECT
    c.Name AS KlantNaam,
    COUNT(DISTINCT o.Id) AS AantalOrders,
    SUM(ol.Quantity * ol.UnitPrice) AS TotaleOmzet,
    AVG(ol.Quantity * ol.UnitPrice) AS GemiddeldeOrderwaarde,
    MAX(o.OrderDate) AS LaatsteOrder
FROM Customers c
INNER JOIN Orders o ON o.CustomerId = c.Id
INNER JOIN OrderLines ol ON ol.OrderId = o.Id
WHERE o.Status != 'Cancelled'
GROUP BY c.Id, c.Name
HAVING SUM(ol.Quantity * ol.UnitPrice) > 10000  -- Alleen klanten met >€10.000 omzet
ORDER BY TotaleOmzet DESC;
```

---

## Geavanceerde queries

### CTE — Common Table Expressions

Een **CTE** is een tijdelijke, benoemde resultatenset die je bovenaan een query definieert. Het maakt complexe queries leesbaar door ze op te splitsen in stappen.

```sql
-- Zonder CTE: moeilijk leesbaar
SELECT * FROM (
    SELECT CustomerId, COUNT(*) AS Cnt FROM Orders
    WHERE OrderDate > DATEADD(MONTH, -3, GETDATE())
    GROUP BY CustomerId
) AS Sub WHERE Cnt > 5;

-- Met CTE: duidelijk en stap-voor-stap
WITH RecentActiveCustomers AS (
    -- Stap 1: klanten met recente orders
    SELECT
        CustomerId,
        COUNT(*) AS OrderCount,
        SUM(TotalAmount) AS RecentSpend
    FROM Orders
    WHERE OrderDate >= DATEADD(MONTH, -3, GETDATE())
      AND Status != 'Cancelled'
    GROUP BY CustomerId
    HAVING COUNT(*) >= 5
),
CustomerDetails AS (
    -- Stap 2: voeg klantgegevens toe
    SELECT
        c.Id,
        c.Name,
        c.Segment,
        rac.OrderCount,
        rac.RecentSpend
    FROM Customers c
    INNER JOIN RecentActiveCustomers rac ON rac.CustomerId = c.Id
    WHERE c.IsActive = 1
)
-- Stap 3: eindselectie
SELECT
    Name,
    Segment,
    OrderCount,
    RecentSpend,
    RANK() OVER (PARTITION BY Segment ORDER BY RecentSpend DESC) AS RangBinnenSegment
FROM CustomerDetails
ORDER BY RecentSpend DESC;
```

### Window Functions — Berekeningen over rijen

Window functions berekenen waarden over een groep rijen zonder die rijen samen te voegen (zoals GROUP BY doet). Enorm krachtig voor rapportage.

```sql
SELECT
    o.Id,
    o.OrderDate,
    c.Name AS KlantNaam,
    o.TotalAmount,

    -- Lopend totaal per klant (cumulatief)
    SUM(o.TotalAmount) OVER (
        PARTITION BY o.CustomerId
        ORDER BY o.OrderDate
        ROWS UNBOUNDED PRECEDING
    ) AS CumulatiefPerKlant,

    -- Rank binnen klant (1 = grootste order)
    RANK() OVER (
        PARTITION BY o.CustomerId
        ORDER BY o.TotalAmount DESC
    ) AS RangBijKlant,

    -- Percentage van totale klantomzet
    o.TotalAmount / SUM(o.TotalAmount) OVER (PARTITION BY o.CustomerId) * 100
        AS PercentageVanKlantOmzet,

    -- Vorige order van dezelfde klant
    LAG(o.TotalAmount, 1) OVER (
        PARTITION BY o.CustomerId
        ORDER BY o.OrderDate
    ) AS VorigeOrderBedrag,

    -- Volgende order van dezelfde klant
    LEAD(o.OrderDate, 1) OVER (
        PARTITION BY o.CustomerId
        ORDER BY o.OrderDate
    ) AS VolgendeOrderDatum,

    -- Doorlopend gemiddelde (huidige + vorige 2)
    AVG(o.TotalAmount) OVER (
        PARTITION BY o.CustomerId
        ORDER BY o.OrderDate
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS GlijdendGemiddelde
FROM Orders o
INNER JOIN Customers c ON c.Id = o.CustomerId
WHERE o.Status != 'Cancelled';
```

---

## Stored Procedures

Een **stored procedure** is een herbruikbaar stuk T-SQL code dat op de server staat opgeslagen. Voordelen:
- Veiligheid: parameters worden automatisch gesanitized (geen SQL injection)
- Performantie: uitvoeringsplan wordt gecached
- Herbruikbaarheid: aanroepbaar vanuit .NET, SSIS, rapportages, etc.
- Encapsulatie: complexe logica op één plek

```sql
CREATE OR ALTER PROCEDURE usp_CreateOrder
    @OrderNumber    NVARCHAR(50),
    @CustomerId     INT,
    @DeliveryDate   DATE,
    @CreatedById    INT,
    -- OUTPUT parameter: het nieuwe ID wordt teruggegeven
    @NewOrderId     INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;  -- Voorkomt "x rows affected" berichten

    -- ==================
    -- VALIDATIES
    -- ==================
    IF @OrderNumber IS NULL OR LTRIM(RTRIM(@OrderNumber)) = ''
    BEGIN
        RAISERROR('Ordernummer is verplicht.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (
        SELECT 1 FROM Customers
        WHERE Id = @CustomerId AND IsActive = 1 AND IsDeleted = 0
    )
    BEGIN
        RAISERROR('Klant %d bestaat niet of is inactief.', 16, 1, @CustomerId);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM Orders WHERE OrderNumber = @OrderNumber AND IsDeleted = 0)
    BEGIN
        RAISERROR('Ordernummer "%s" bestaat al.', 16, 1, @OrderNumber);
        RETURN;
    END

    IF @DeliveryDate < CAST(GETDATE() AS DATE)
    BEGIN
        RAISERROR('Leveringsdatum mag niet in het verleden liggen.', 16, 1);
        RETURN;
    END

    -- ==================
    -- ACTIE
    -- ==================
    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO Orders (
            OrderNumber, CustomerId, DeliveryDate,
            Status, IsDeleted, CreatedById, CreatedAt
        )
        VALUES (
            @OrderNumber, @CustomerId, @DeliveryDate,
            'Draft', 0, @CreatedById, SYSDATETIME()
        );

        SET @NewOrderId = SCOPE_IDENTITY();

        -- Log de aanmaak
        INSERT INTO AuditLog (TableName, RecordId, Action, UserId, LoggedAt)
        VALUES ('Orders', @NewOrderId, 'INSERT', @CreatedById, SYSDATETIME());

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;

        -- Gooi de fout verder (caller kan hem afhandelen)
        THROW;
    END CATCH
END;
GO

-- Aanroepen:
DECLARE @NewId INT;
EXEC usp_CreateOrder
    @OrderNumber = 'ORD-2026-001',
    @CustomerId = 42,
    @DeliveryDate = '2026-06-10',
    @CreatedById = 1,
    @NewOrderId = @NewId OUTPUT;

SELECT @NewId AS NieuwOrderId;
```

---

## Indexen — De sleutel tot performantie

Een **index** is een aparte datastructuur die SQL Server helpt snel records te vinden — zoals de index achteraan een boek.

**Zonder index:** SQL Server leest de hele tabel (Table Scan) — traag bij grote tabellen.
**Met index:** SQL Server springt direct naar de juiste rij (Index Seek) — enorm snel.

### Types

```sql
-- CLUSTERED INDEX: bepaalt de fysieke volgorde van de tabel
-- Elke tabel heeft er maximaal 1 — meestal de Primary Key
CREATE CLUSTERED INDEX CIX_Orders_Id ON Orders(Id);

-- NON-CLUSTERED INDEX: aparte structuur, verwijst naar de clustered index
-- Gebruik dit voor kolommen waarop je veel filtert/sorteert
CREATE NONCLUSTERED INDEX NIX_Orders_Status
    ON Orders(Status)
    WHERE IsDeleted = 0;  -- Filtered index: alleen voor actieve orders

-- COVERING INDEX: bevat extra kolommen zodat SQL Server niet naar de hoofdtabel hoeft
-- "INCLUDE" kolommen worden niet gesorteerd maar meegezonden — vermijdt Key Lookup
CREATE NONCLUSTERED INDEX NIX_Orders_Customer_Date
    ON Orders(CustomerId, OrderDate DESC)
    INCLUDE (OrderNumber, Status, TotalAmount);
```

### Wanneer een index toevoegen?

```sql
-- Stap 1: laat SQL Server vertellen welke indexen ontbreken
SELECT
    mig.equality_columns,
    mig.inequality_columns,
    mig.included_columns,
    mid.statement AS Tabel,
    migs.avg_user_impact AS GeschatteWinst
FROM sys.dm_db_missing_index_groups mig
INNER JOIN sys.dm_db_missing_index_group_stats migs
    ON migs.group_handle = mig.index_group_handle
INNER JOIN sys.dm_db_missing_index_details mid
    ON mid.index_handle = mig.index_handle
WHERE mid.database_id = DB_ID()
ORDER BY migs.avg_user_impact DESC;

-- Stap 2: controleer welke indexen nauwelijks gebruikt worden
SELECT
    OBJECT_NAME(i.object_id) AS Tabel,
    i.name AS Index,
    ius.user_seeks + ius.user_scans + ius.user_lookups AS Reads,
    ius.user_updates AS Writes
FROM sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats ius
    ON ius.object_id = i.object_id AND ius.index_id = i.index_id
WHERE i.object_id > 100
ORDER BY Reads ASC;
```

---

## Transacties — Alles of niets

Een **transactie** garandeert dat meerdere SQL statements als één atomaire eenheid worden uitgevoerd. Als één stap mislukt, worden alle stappen teruggedraaid.

**Voorbeeld:** een order bevestigen en de voorraad verminderen moet samen lukken of samen mislukken.

```sql
BEGIN TRY
    BEGIN TRANSACTION;

    -- Stap 1: bevestig de order
    UPDATE Orders
    SET Status = 'Confirmed', ConfirmedAt = SYSDATETIME()
    WHERE Id = @OrderId AND Status = 'Draft';

    IF @@ROWCOUNT = 0
        RAISERROR('Order niet gevonden of heeft niet de status Draft.', 16, 1);

    -- Stap 2: reserveer de voorraad per orderregel
    UPDATE i
    SET i.ReservedQuantity = i.ReservedQuantity + ol.Quantity,
        i.AvailableQuantity = i.AvailableQuantity - ol.Quantity
    FROM Inventory i
    INNER JOIN OrderLines ol ON ol.ProductId = i.ProductId
    WHERE ol.OrderId = @OrderId;

    -- Stap 3: controleer of er geen negatieve voorraad is
    IF EXISTS (
        SELECT 1 FROM Inventory WHERE AvailableQuantity < 0
    )
    BEGIN
        RAISERROR('Onvoldoende voorraad voor één of meerdere producten.', 16, 1);
    END

    COMMIT TRANSACTION;
    PRINT 'Order succesvol bevestigd.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    -- Log de fout
    INSERT INTO ErrorLog (Message, ErrorNumber, ErrorLine, StoredProc, OccurredAt)
    VALUES (ERROR_MESSAGE(), ERROR_NUMBER(), ERROR_LINE(), ERROR_PROCEDURE(), SYSDATETIME());

    -- Gooi door naar de caller
    THROW;
END CATCH;
```

---

## Query Optimalisatie

### Het uitvoeringsplan lezen

Het **uitvoeringsplan** toont hoe SQL Server een query uitvoert. Druk `Ctrl+M` in SSMS voor het grafische plan.

**Wat je zoekt:**
- ✅ **Index Seek** — SQL Server springt direct naar de juiste rijen: snel
- ⚠️ **Index Scan** — SQL Server leest alle rijen in een index: soms OK, soms te traag
- ❌ **Table Scan** — SQL Server leest de hele tabel: altijd slecht bij grote tabellen
- ⚠️ **Key Lookup** — SQL Server moet van de index naar de tabel: voeg INCLUDE kolommen toe
- ⚠️ **Sort** — sorteren is duur bij grote datasets: overweeg een index met de gewenste volgorde

```sql
-- Analyseer I/O en CPU gebruik van een query
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

SELECT o.OrderNumber, c.Name
FROM Orders o
INNER JOIN Customers c ON c.Id = o.CustomerId
WHERE o.Status = 'Open';

SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;

-- Output voorbeeld:
-- Table 'Orders'. Scan count 1, logical reads 245 → hoog: index toevoegen
-- Table 'Customers'. Scan count 0, logical reads 2 → goed: index seek
-- SQL Server Execution Times: CPU time = 15 ms, elapsed time = 32 ms
```

### Veelgemaakte performantieproblemen

```sql
-- ❌ SLECHT: functie op geïndexeerde kolom — index wordt niet gebruikt
WHERE YEAR(OrderDate) = 2026

-- ✅ GOED: range filter — index KAN gebruikt worden
WHERE OrderDate >= '2026-01-01' AND OrderDate < '2027-01-01'

-- ❌ SLECHT: impliciete conversie — SQL Server converteert alle waarden
WHERE CustomerId = '42'  -- CustomerId is INT maar je geeft een string

-- ✅ GOED: matching types
WHERE CustomerId = 42

-- ❌ SLECHT: LIKE met wildcard vooraan — hele tabel moet gescand worden
WHERE CustomerName LIKE '%BV'

-- ✅ BETER: Full-Text Search voor dit soort zoekopdrachten, of LIKE 'BV%'
WHERE CustomerName LIKE 'BV%'

-- ❌ SLECHT: correlated subquery — wordt voor ELKE rij opnieuw uitgevoerd
SELECT o.Id,
    (SELECT COUNT(*) FROM OrderLines WHERE OrderId = o.Id) AS LineCount
FROM Orders o

-- ✅ GOED: join met aggregatie — één keer berekend
SELECT o.Id, COUNT(ol.Id) AS LineCount
FROM Orders o
LEFT JOIN OrderLines ol ON ol.OrderId = o.Id
GROUP BY o.Id
```

---

## Schema Design — Best Practices

```sql
-- Template voor een goede tabel
CREATE TABLE Orders (
    -- Primary Key: altijd INT IDENTITY voor OLTP, UNIQUEIDENTIFIER voor gedistribueerde systemen
    Id              INT IDENTITY(1,1)   NOT NULL,

    -- Business kolommen
    OrderNumber     NVARCHAR(50)        NOT NULL,
    CustomerId      INT                 NOT NULL,
    Status          NVARCHAR(20)        NOT NULL    CONSTRAINT DF_Orders_Status DEFAULT 'Draft',
    TotalAmount     DECIMAL(18,2)       NOT NULL    CONSTRAINT DF_Orders_Amount DEFAULT 0,
    DeliveryDate    DATE                    NULL,
    Notes           NVARCHAR(MAX)           NULL,

    -- Soft delete: records worden nooit echt verwijderd
    IsDeleted       BIT                 NOT NULL    CONSTRAINT DF_Orders_Deleted DEFAULT 0,
    DeletedAt       DATETIME2(0)            NULL,
    DeletedById     INT                     NULL,

    -- Audit trail: wie heeft wat wanneer aangemaakt/gewijzigd?
    CreatedAt       DATETIME2(0)        NOT NULL    CONSTRAINT DF_Orders_Created DEFAULT SYSDATETIME(),
    CreatedById     INT                 NOT NULL,
    ModifiedAt      DATETIME2(0)            NULL,
    ModifiedById    INT                     NULL,

    -- Constraints
    CONSTRAINT PK_Orders                PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_Orders_OrderNumber    UNIQUE (OrderNumber),
    CONSTRAINT FK_Orders_CustomerId     FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    CONSTRAINT FK_Orders_CreatedById    FOREIGN KEY (CreatedById) REFERENCES Users(Id),
    CONSTRAINT CHK_Orders_Status        CHECK (Status IN ('Draft','Confirmed','InProgress','Shipped','Delivered','Cancelled')),
    CONSTRAINT CHK_Orders_Amount        CHECK (TotalAmount >= 0)
);
GO

-- Index voor de meest gebruikte queries
CREATE NONCLUSTERED INDEX NIX_Orders_Customer_Status
    ON Orders(CustomerId, Status)
    INCLUDE (OrderNumber, TotalAmount, OrderDate)
    WHERE IsDeleted = 0;
GO

-- Index voor datum-gebaseerde rapportage
CREATE NONCLUSTERED INDEX NIX_Orders_Date
    ON Orders(CreatedAt DESC)
    INCLUDE (CustomerId, Status, TotalAmount)
    WHERE IsDeleted = 0;
GO
```

---

## Nuttige System Views & Diagnostiek

```sql
-- Welke queries verbruiken de meeste CPU?
SELECT TOP 10
    qs.total_worker_time / qs.execution_count / 1000 AS AvgCPU_ms,
    qs.execution_count,
    qs.total_elapsed_time / qs.execution_count / 1000 AS AvgDuration_ms,
    SUBSTRING(st.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset WHEN -1 THEN DATALENGTH(st.text)
          ELSE qs.statement_end_offset END - qs.statement_start_offset)/2)+1
    ) AS QueryText
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
ORDER BY AvgCPU_ms DESC;

-- Actieve verbindingen en wat ze doen
SELECT
    s.session_id,
    s.login_name,
    s.host_name,
    s.program_name,
    r.status,
    r.wait_type,
    r.wait_time / 1000 AS WaitTime_sec,
    t.text AS CurrentQuery
FROM sys.dm_exec_sessions s
LEFT JOIN sys.dm_exec_requests r ON r.session_id = s.session_id
OUTER APPLY sys.dm_exec_sql_text(r.sql_handle) t
WHERE s.is_user_process = 1
ORDER BY r.cpu_time DESC;

-- Databasegrootte per tabel
SELECT
    t.name AS Tabel,
    SUM(a.total_pages) * 8 / 1024 AS TotalMB,
    SUM(a.used_pages) * 8 / 1024 AS GebruiktMB,
    SUM(p.rows) AS AantalRijen
FROM sys.tables t
INNER JOIN sys.indexes i ON i.object_id = t.object_id
INNER JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id = i.index_id
INNER JOIN sys.allocation_units a ON a.container_id = p.partition_id
GROUP BY t.name
ORDER BY TotalMB DESC;
```

---

*[← Terug naar overzicht](../../README.md)*
