# BI — Power BI · T-SQL · Excel

## Wat is Business Intelligence?

**Business Intelligence (BI)** is het omzetten van ruwe data in bruikbare inzichten voor beslissingen. Het gaat over vragen beantwoorden als:
- Welke klanten groeien het snelst?
- Waar verliezen we geld?
- Is onze levering op tijd?
- Welke producten verkopen slecht in welke regio?

De **Microsoft BI stack** bestaat uit drie lagen:
1. **SQL Server / T-SQL** — de databron: ruwe data opslaan en voorbereiden
2. **Power Query** — data ophalen, transformeren en opschonen
3. **Power BI** — data visualiseren in dashboards en rapporten

---

## Architectuur — Van Data naar Dashboard

```
┌─────────────────────────────────────────────────────────┐
│                  DATABRONNEN                            │
│  SQL Server · Business Central · Excel · SharePoint     │
│  Web API's · Azure SQL · On-prem bestanden              │
└──────────────────────┬──────────────────────────────────┘
                       │ Laden
┌──────────────────────▼──────────────────────────────────┐
│              POWER QUERY (ETL)                          │
│  Extraheren → Transformeren → Laden                     │
│  Opschonen, filteren, samenvoegen, hernoemen            │
└──────────────────────┬──────────────────────────────────┘
                       │ Modeleren
┌──────────────────────▼──────────────────────────────────┐
│               DATA MODEL (Star Schema)                  │
│  Feitentabellen ↔ Dimensietabellen                     │
│  Relaties definiëren                                    │
└──────────────────────┬──────────────────────────────────┘
                       │ Berekenen
┌──────────────────────▼──────────────────────────────────┐
│                  DAX MEASURES                           │
│  KPI's · Groeicijfers · Tijdsintelligentie              │
└──────────────────────┬──────────────────────────────────┘
                       │ Visualiseren
┌──────────────────────▼──────────────────────────────────┐
│                 POWER BI RAPPORT                        │
│  Grafieken · Tabellen · Kaarten · Slicers               │
└──────────────────────┬──────────────────────────────────┘
                       │ Publiceren
┌──────────────────────▼──────────────────────────────────┐
│              POWER BI SERVICE (Cloud)                   │
│  Dashboards · Automatisch vernieuwen · Delen            │
│  Teams · SharePoint · Mobile app                        │
└─────────────────────────────────────────────────────────┘
```

---

## Het Star Schema — De basis van elk goed data model

Een **star schema** organiseert data in:
- **Feitentabel** (Fact): de meetbare feiten — verkoopbedragen, aantallen, tijdsduur
- **Dimensietabellen** (Dimension): de context — wie, wat, waar, wanneer

Waarom een star schema?
- Power BI is hier op geoptimaliseerd — sneller en eenvoudiger DAX
- Duidelijke scheiding: feiten zijn cijfers, dimensies zijn beschrijvingen
- Eenvoudig te begrijpen voor eindgebruikers

```
        DimDate
        ┌─────────────────┐
        │ DateKey (PK)    │
        │ Date            │
        │ Year            │
        │ Quarter         │
        │ Month           │
        │ MonthName       │
        │ WeekNumber      │
        │ DayName         │
        │ IsWeekend       │
        │ IsHoliday       │
        └────────┬────────┘
                 │
DimCustomer      │               DimProduct
┌─────────────┐  │  ┌────────────────────────┐
│ CustomerKey │  │  │ ProductKey (PK)         │
│ CustomerCode│  │  │ ProductCode             │
│ Name        │  │  │ ProductName             │
│ City        ├──┤  │ Category                │
│ Country     │  │  │ SubCategory             │
│ Segment     │  │  │ Brand                   │
│ IsActive    │  │  └───────────┬─────────────┘
└──────┬──────┘  │             │
       │         │             │
       └─────────▼─────────────┘
               FactSales
         ┌──────────────────────┐
         │ SalesKey (PK)        │
         │ DateKey (FK)         │
         │ CustomerKey (FK)     │
         │ ProductKey (FK)      │
         │ WarehouseKey (FK)    │
         │ Quantity             │ ← Meetbare feiten
         │ UnitPrice            │
         │ TotalAmount          │
         │ CostPrice            │
         │ GrossMargin          │
         └──────────────────────┘
```

---

## T-SQL voor BI — Data voorbereiden

Goede BI begint bij goed voorbereide data in SQL Server.

### Rapportageviews aanmaken

```sql
-- Maak een view die alle data voor het verkooprapport bevat
-- Power BI verbindt direct met deze view — geen complexe queries nodig in PBI zelf
CREATE OR ALTER VIEW vw_SalesFact AS
SELECT
    -- Sleutels voor het datamodel
    CONVERT(INT, FORMAT(o.OrderDate, 'yyyyMMdd')) AS DateKey,
    o.CustomerId AS CustomerKey,
    ol.ProductId AS ProductKey,

    -- Meetbare feiten
    ol.Quantity,
    ol.UnitPrice,
    ol.Quantity * ol.UnitPrice AS TotalAmount,
    ol.Quantity * p.CostPrice AS TotalCost,
    (ol.Quantity * ol.UnitPrice) - (ol.Quantity * p.CostPrice) AS GrossMargin,

    -- Bereken marge percentage (vermijd deling door nul)
    CASE
        WHEN ol.Quantity * ol.UnitPrice = 0 THEN 0
        ELSE ROUND(
            ((ol.Quantity * ol.UnitPrice) - (ol.Quantity * p.CostPrice)) /
            (ol.Quantity * ol.UnitPrice) * 100, 2)
    END AS MarginPct,

    -- Extra context
    o.OrderNumber,
    o.Status AS OrderStatus,
    o.OrderDate,
    YEAR(o.OrderDate) AS OrderYear,
    MONTH(o.OrderDate) AS OrderMonth,
    DATEPART(QUARTER, o.OrderDate) AS OrderQuarter

FROM Orders o
INNER JOIN OrderLines ol ON ol.OrderId = o.Id
INNER JOIN Products p ON p.Id = ol.ProductId
WHERE o.IsDeleted = 0
  AND o.Status NOT IN ('Draft', 'Cancelled')
  AND ol.IsDeleted = 0;
GO

-- Datumdimensie — dit is één van de belangrijkste tabellen
-- Maak dit EENMALIG aan en vul het voor vele jaren
CREATE OR ALTER PROCEDURE usp_PopulateDimDate
    @StartDate DATE = '2020-01-01',
    @EndDate DATE = '2030-12-31'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Date DATE = @StartDate;

    WHILE @Date <= @EndDate
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM DimDate WHERE DateKey = CONVERT(INT, FORMAT(@Date, 'yyyyMMdd')))
        BEGIN
            INSERT INTO DimDate (
                DateKey, [Date], [Year], Quarter, [Month], MonthName,
                WeekNumber, DayOfWeek, DayName, IsWeekend
            )
            VALUES (
                CONVERT(INT, FORMAT(@Date, 'yyyyMMdd')),
                @Date,
                YEAR(@Date),
                DATEPART(QUARTER, @Date),
                MONTH(@Date),
                DATENAME(MONTH, @Date),
                DATEPART(WEEK, @Date),
                DATEPART(WEEKDAY, @Date),
                DATENAME(WEEKDAY, @Date),
                CASE WHEN DATEPART(WEEKDAY, @Date) IN (1, 7) THEN 1 ELSE 0 END
            );
        END

        SET @Date = DATEADD(DAY, 1, @Date);
    END;
END;
```

---

## Power Query (M) — Data Transformatie

Power Query is de ETL-laag in Power BI. Hier haal je data op, schoon je het op en bereid je het voor.

```m
// Volledig Power Query voorbeeld: orders laden en transformeren
let
    // ─── STAP 1: VERBINDEN MET SQL SERVER ────────────────────────────
    Source = Sql.Database("myserver.database.windows.net", "MyAppDB",
        [Query="SELECT * FROM vw_SalesFact"]),

    // ─── STAP 2: TYPES INSTELLEN ─────────────────────────────────────
    TypedData = Table.TransformColumnTypes(Source, {
        {"DateKey", Int64.Type},
        {"OrderDate", type date},
        {"TotalAmount", Currency.Type},
        {"GrossMargin", Currency.Type},
        {"MarginPct", Percentage.Type},
        {"Quantity", Int64.Type}
    }),

    // ─── STAP 3: FILTEREN ────────────────────────────────────────────
    // Verwijder extreme uitschieters (bijv. testorders)
    FilteredData = Table.SelectRows(TypedData,
        each [TotalAmount] >= 0 and [TotalAmount] < 1000000),

    // ─── STAP 4: KOLOMMEN HERNOEMEN ──────────────────────────────────
    RenamedColumns = Table.RenameColumns(FilteredData, {
        {"TotalAmount", "Omzet"},
        {"GrossMargin", "Bruto Marge"},
        {"MarginPct", "Marge %"}
    }),

    // ─── STAP 5: BEREKENDE KOLOMMEN TOEVOEGEN ────────────────────────
    WithQuarterLabel = Table.AddColumn(RenamedColumns, "Kwartaal Label",
        each "K" & Text.From([OrderQuarter]) & " " & Text.From([OrderYear]),
        type text),

    // ─── STAP 6: ONNODIGE KOLOMMEN VERWIJDEREN ───────────────────────
    FinalData = Table.RemoveColumns(WithQuarterLabel, {"OrderNumber"})

in
    FinalData

// ─── EXCEL BESTAND LADEN ─────────────────────────────────────────────────
let
    Source = Excel.Workbook(
        File.Contents("\\server\share\budgets\Budget_2026.xlsx"),
        null, true
    ),
    BudgetSheet = Source{[Item="Budget", Kind="Sheet"]}[Data],

    // Verwijder lege rijen
    RemovedBlanks = Table.SelectRows(BudgetSheet,
        each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {null, ""}))),

    // Eerste rij als koptekst gebruiken
    Headers = Table.PromoteHeaders(RemovedBlanks, [PromoteAllScalars=true]),

    // Unpivot maanden (van kolommen naar rijen)
    UnpivotedMonths = Table.UnpivotOtherColumns(Headers,
        {"Afdeling", "Kostenplaats"},
        "Maand", "Budget")
in
    UnpivotedMonths
```

---

## DAX — Data Analysis Expressions

**DAX** is de formule-taal van Power BI. Je gebruikt het om maatregelen (measures) en berekende kolommen te maken.

### Basismaatregelen

```dax
// ─── BASISAGGREGATIES ─────────────────────────────────────────────────

Totale Omzet = SUM(FactSales[TotalAmount])

Totaal Aantal Orders = DISTINCTCOUNT(FactSales[OrderNumber])

Aantal Klanten = DISTINCTCOUNT(FactSales[CustomerKey])

Gem. Orderwaarde =
DIVIDE(
    [Totale Omzet],
    [Totaal Aantal Orders],
    0  // Returneer 0 bij deling door nul (niet leeg)
)

Bruto Marge % =
DIVIDE(
    SUM(FactSales[GrossMargin]),
    SUM(FactSales[TotalAmount]),
    0
)
```

### CALCULATE — Het machtigste DAX woord

`CALCULATE` evalueert een expressie in een **gewijzigde filtercontext**. Dit is het fundament van bijna alle geavanceerde DAX.

```dax
// Omzet alleen voor België (ongeacht wat de gebruiker gefilterd heeft)
Omzet België =
CALCULATE(
    [Totale Omzet],
    DimCustomer[Country] = "Belgium"
)

// Omzet excl. geannuleerde orders
Omzet Excl. Annulaties =
CALCULATE(
    [Totale Omzet],
    FactSales[OrderStatus] <> "Cancelled"
)

// Omzet als % van het totaal (ALL verwijdert alle filters op die tabel)
Omzet % van Totaal =
DIVIDE(
    [Totale Omzet],
    CALCULATE([Totale Omzet], ALL(DimCustomer))
)

// Omzet voor top 10 klanten
Top 10 Klanten Omzet =
CALCULATE(
    [Totale Omzet],
    TOPN(10, DimCustomer, [Totale Omzet], DESC)
)
```

### Tijdsintelligentie

```dax
// ─── VERGELIJKING MET VORIG JAAR ─────────────────────────────────────

Omzet Vorig Jaar =
CALCULATE(
    [Totale Omzet],
    SAMEPERIODLASTYEAR(DimDate[Date])
)

YoY Groei Bedrag = [Totale Omzet] - [Omzet Vorig Jaar]

YoY Groei % =
DIVIDE(
    [YoY Groei Bedrag],
    [Omzet Vorig Jaar],
    BLANK()  // Geen getal als er geen vergelijking mogelijk is
)

// ─── YEAR-TO-DATE ─────────────────────────────────────────────────────

Omzet YTD = TOTALYTD([Totale Omzet], DimDate[Date])

Omzet YTD Vorig Jaar =
CALCULATE(
    [Omzet YTD],
    SAMEPERIODLASTYEAR(DimDate[Date])
)

// ─── ROLLING 12 MAANDEN ───────────────────────────────────────────────

Omzet Rolling 12M =
CALCULATE(
    [Totale Omzet],
    DATESINPERIOD(
        DimDate[Date],
        LASTDATE(DimDate[Date]),  // Einddatum = geselecteerde periode
        -12,
        MONTH
    )
)

// ─── MAAND-OVER-MAAND ─────────────────────────────────────────────────

Omzet Vorige Maand =
CALCULATE(
    [Totale Omzet],
    PREVIOUSMONTH(DimDate[Date])
)

MoM Groei % =
DIVIDE(
    [Totale Omzet] - [Omzet Vorige Maand],
    [Omzet Vorige Maand],
    BLANK()
)
```

### Geavanceerde maatregelen

```dax
// ─── LOPEND TOTAAL ────────────────────────────────────────────────────

Omzet Cumulatief =
CALCULATE(
    [Totale Omzet],
    FILTER(
        ALL(DimDate[Date]),
        DimDate[Date] <= MAX(DimDate[Date])
    )
)

// ─── RANG ─────────────────────────────────────────────────────────────

Klant Rang op Omzet =
IF(
    HASONEVALUE(DimCustomer[CustomerCode]),
    RANKX(
        ALL(DimCustomer),
        [Totale Omzet],
        ,
        DESC,
        Dense
    ),
    BLANK()
)

// ─── DYNAMISCHE TARGETS ───────────────────────────────────────────────

// Verschil tussen werkelijk en budget
Verschil Omzet vs Budget =
[Totale Omzet] - SUM(BudgetData[Budget])

Bereikt Budget % =
DIVIDE([Totale Omzet], SUM(BudgetData[Budget]), 0)

// KPI status (voor KPI Visual)
Budget Status =
SWITCH(
    TRUE(),
    [Bereikt Budget %] >= 1.05, "Boven doel",
    [Bereikt Budget %] >= 0.95, "Op koers",
    [Bereikt Budget %] >= 0.80, "Risico",
    "Kritisch"
)
```

---

## Power BI Best Practices

### Wat je WEL doet

```
✅ Bouw een star schema — altijd, geen uitzonderingen
✅ Maak één DimDate tabel — gebruik die voor alle tijdsberekeningen
✅ Gebruik measures (maatregelen) i.p.v. berekende kolommen waar mogelijk
   → Measures worden berekend bij query time, kolommen bij refresh
✅ Geef measures en kolommen duidelijke namen in de eindgebruikerstaal
✅ Gebruik Row-Level Security (RLS) zodat gebruikers alleen hun data zien
✅ Zet automatisch vernieuwen in via Power BI Service
✅ Gebruik "Vernieuwen op achtergrond" voor grote datasets
```

### Wat je NIET doet

```
❌ Geen relationele structuur (alles in één brede tabel) → traag en incorrect
❌ VLOOKUP logica in Power Query → doet hetzelfde als relaties, maar slechter
❌ Complexe berekeningen in Power Query die ook in DAX kunnen
❌ DirectQuery gebruiken als Import ook kan → DirectQuery is altijd trager
❌ Kolommen laden die je niet nodig hebt → groter model, tragere queries
❌ Datum behandelen als tekst (bijv. "2026-01-01") → geen tijdsintelligentie mogelijk
```

### Row-Level Security (RLS)

RLS zorgt dat gebruikers alleen de data zien die ze mogen zien:

```dax
// Rol: "RegioManager"
// Filter op DimCustomer zodat medewerker alleen zijn regio ziet
[ResponsibleManagerEmail] = USERPRINCIPALNAME()
// USERPRINCIPALNAME() geeft het emailadres van de ingelogde gebruiker
```

---

## Excel voor BI

Excel is niet weg te denken uit het BI landschap — ook al gebruiken we Power BI. Het is ideaal voor ad-hoc analyses, financiële modellen en rapporten die flexibel moeten zijn.

### Power Query in Excel

Excel heeft dezelfde Power Query engine als Power BI:
1. **Data → Gegevens ophalen → Van database → Van SQL Server**
2. Verbind met dezelfde views die Power BI ook gebruikt
3. Resultaat: consistent, automatisch vernieuwen, geen copy-paste

### Moderne Excel formules voor BI

```excel
=== XLOOKUP — Moderne VLOOKUP ===
// Zoek klantnaam op basis van klant-ID
=XLOOKUP(A2, KlantenTabel[KlantId], KlantenTabel[KlantNaam], "Niet gevonden", 0)
//        ↑           ↑                     ↑                       ↑          ↑
//      Zoekwaarde  Zoekbereik         Resultaatbereik         Als niet gevonden  Exacte match

=== FILTER — Dynamische filtering ===
// Toon alle open orders van klant in A1
=FILTER(
    OrderenTabel,
    (OrderenTabel[Status]="Open") * (OrderenTabel[KlantNaam]=A1),
    "Geen orders gevonden"
)

=== UNIQUE — Unieke waarden ===
=UNIQUE(KlantenTabel[Regio])  // Lijst van alle unieke regio's

=== SORT + FILTER combineren ===
// Top 5 klanten op omzet in geselecteerde regio
=TAKE(
    SORT(
        FILTER(KlantenTabel, KlantenTabel[Regio]=DropdownRegio),
        MATCH("Omzet", KlantenTabel[#Headers], 0),
        -1  // Aflopend sorteren
    ),
    5  // Eerste 5 rijen
)

=== SUMIFS en COUNTIFS ===
// Omzet voor regio Noord in jaar 2026
=SUMIFS(
    OrderenTabel[Omzet],
    OrderenTabel[Regio], "Noord",
    OrderenTabel[Jaar], 2026
)

// Aantal open orders ouder dan 7 dagen
=COUNTIFS(
    OrderenTabel[Status], "Open",
    OrderenTabel[Datum], "<" & TODAY()-7
)
```

---

## KPI's en Rapportage Structuur

Een goede BI-rapportagestructuur heeft drie niveaus:

```
Niveau 1: STRATEGISCH (C-level)
  → Maandelijks, kwartaallijks
  → Omzet, marge, klanttevredenheid, marktaandeel
  → Vergelijking met budget en vorig jaar

Niveau 2: TACTISCH (Management)
  → Wekelijks
  → Omzet per regio/product/team
  → OTD, voorraadniveaus, orderbacklog

Niveau 3: OPERATIONEEL (Supervisors, teamleiders)
  → Dagelijks, real-time
  → Openstaande orders, picks vandaag, dock-bezetting
  → Alerts bij afwijkingen
```

---

*[← Terug naar overzicht](../../README.md)*
