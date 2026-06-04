# ERP — Business Central

## Wat is een ERP en waarom Business Central?

Een **ERP (Enterprise Resource Planning)** systeem is de ruggengraat van een bedrijf. Het integreert alle kernprocessen in één systeem: financiën, verkoop, inkoop, voorraad, productie en HR.

**Zonder ERP:**
- Financiële data in Excel
- Klantgegevens in een apart CRM
- Voorraad in een spreadsheet
- Facturen handmatig opgesteld
- Niemand heeft een compleet beeld van het bedrijf

**Met Business Central:**
- Één databron voor alles
- Verkoopafdeling ziet de actuele voorraad
- Boekhouding krijgt facturen automatisch vanuit de operatie
- Management heeft real-time inzicht in KPI's

**Microsoft Dynamics 365 Business Central** is de cloud ERP voor kleine en middelgrote bedrijven. Het is uitbreidbaar via **AL (Application Language)** — de programmeertaal om BC aan te passen zonder de basisdcode te raken.

---

## Architectuur van Business Central

```
┌─────────────────────────────────────────────────────────────────┐
│                  BUSINESS CENTRAL                               │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  Financiën  │  │   Verkoop   │  │   Inkoop    │           │
│  │  G/L, BTW  │  │  Offertes   │  │  Bestellingen│           │
│  │  Rapporten  │  │  Orders     │  │  Leveranciers│           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  Voorraad   │  │  Productie  │  │  Projecten  │           │
│  │  Artikelen  │  │  BOM        │  │  Resources  │           │
│  │  Locaties   │  │  Capaciteit │  │  Tijdschrijven│         │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               BASE APPLICATION                          │   │
│  │           (Microsoft code — niet aanpassen)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              EXTENSIONS (jouw AL code)                  │   │
│  │  Extra velden · Extra pagina's · Business logic         │   │
│  │  Integraties · Rapporten · API's                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

Integraties:
  Power BI ──────────────────────── Rapportage
  Power Automate ────────────────── Workflows en automatisering
  WACS (WMS) ────────────────────── Voorraadsynchronisatie
  TAS (TMS) ─────────────────────── Factuurdata transport
  Azure ──────────────────────────── Key Vault, Service Bus
  Teams/Outlook ──────────────────── Notificaties
```

---

## AL — Application Language

**AL** is de programmeertaal van Business Central. Het lijkt op Pascal/Delphi en is sterk getypeerd. Elke aanpassing op BC schrijf je als een **Extension** — een los pakketje code dat bovenop de base application geïnstalleerd wordt.

### Voordelen van Extensions

- Jouw code raakt de base application niet → Microsoft-updates overschrijven niets
- Herbruikbaar: één extension kan op meerdere BC-instanties geïnstalleerd worden
- Versiebaar: code in Git, deploybaar via pipeline
- Testbaar: AL heeft een ingebouwd test-framework

### Objectnummering

```
Microsoft reserved:   1 - 49.999
Partner-licentie:     50.000 - 99.999    ← gebruik jij dit
Test/experimenteel:   100.000+

Elke tabel, pagina, codeunit, rapport krijgt een uniek nummer
```

---

## Table Extension — Extra velden toevoegen

```al
// Voeg extra velden toe aan de bestaande Customer tabel
// Regel: gebruik NOOIT een Table Extension om de structuur te breken
// Voeg toe, pas niet aan
tableextension 50100 "Extended Customer" extends Customer
{
    fields
    {
        // Veld 50100: Klantsegment voor CRM en rapportage
        field(50100; "Customer Segment"; Enum "Customer Segment")
        {
            Caption = 'Customer Segment';
            DataClassification = CustomerContent;
            // Tooltip verschijnt als gebruiker hovert over het veld
            ToolTip = 'Geeft het strategische segment van de klant aan (A, B of C).';
        }

        // Veld 50101: Externe referentie voor integratie met WMS
        field(50101; "WMS Customer Code"; Code[20])
        {
            Caption = 'WMS Klantcode';
            DataClassification = CustomerContent;
            ToolTip = 'De klantcode zoals gebruikt in het Warehouse Management System (WACS).';
        }

        // Veld 50102: Bijhouden wanneer de klant voor het laatste gesynchroniseerd is
        field(50102; "Last WMS Sync"; DateTime)
        {
            Caption = 'Laatste WMS Synchronisatie';
            DataClassification = SystemMetadata;
            Editable = false;  // Alleen leesbaar — wordt ingesteld door de code
        }

        // Veld 50103: Vlag of de klant gesynchroniseerd moet worden
        field(50103; "Pending WMS Sync"; Boolean)
        {
            Caption = 'WMS Sync Vereist';
            DataClassification = SystemMetadata;
        }
    }

    // Triggers: reageer op gebeurtenissen in de tabel
    trigger OnAfterModify()
    var
        WMSSyncMgt: Codeunit "WMS Sync Management";
    begin
        // Markeer als te synchroniseren als naam of adres veranderd is
        if xRec.Name <> Rec.Name
           or xRec.Address <> Rec.Address
           or xRec.City <> Rec.City then
        begin
            Rec."Pending WMS Sync" := true;
            Rec.Modify();
        end;
    end;
}

// Enum voor klantsegmenten
enum 50100 "Customer Segment"
{
    Extensible = true;

    value(0; " ") { Caption = ' '; }
    value(1; "A") { Caption = 'A — Strategisch (Top klanten)'; }
    value(2; "B") { Caption = 'B — Standaard'; }
    value(3; "C") { Caption = 'C — Occasioneel'; }
}
```

---

## Page Extension — Extra UI bouwen

```al
pageextension 50100 "Extended Customer Card" extends "Customer Card"
{
    layout
    {
        // Voeg velden toe na het Name veld
        addafter(Name)
        {
            field("Customer Segment"; Rec."Customer Segment")
            {
                ApplicationArea = All;
                Importance = Promoted;  // Toont in de header (boven de tabs)
            }
        }

        // Voeg een nieuwe groep toe op het General tab
        addlast(General)
        {
            group("WMS Integration")
            {
                Caption = 'WMS Integratie';

                field("WMS Customer Code"; Rec."WMS Customer Code")
                {
                    ApplicationArea = All;
                }
                field("Last WMS Sync"; Rec."Last WMS Sync")
                {
                    ApplicationArea = All;
                }
                field("Pending WMS Sync"; Rec."Pending WMS Sync")
                {
                    ApplicationArea = All;
                    Style = Unfavorable;  // Rood als true
                    StyleExpr = Rec."Pending WMS Sync";
                }
            }
        }
    }

    actions
    {
        // Voeg actie toe aan de "Process" action group
        addlast(processing)
        {
            action("Sync to WMS Now")
            {
                ApplicationArea = All;
                Caption = 'Nu synchroniseren naar WMS';
                ToolTip = 'Stuurt de klantgegevens direct naar het Warehouse Management System.';
                Image = TransmitElectronic;
                Promoted = true;
                PromotedCategory = Process;
                PromotedIsBig = true;

                trigger OnAction()
                var
                    WMSSyncMgt: Codeunit "WMS Sync Management";
                begin
                    WMSSyncMgt.SyncCustomerToWMS(Rec);
                    Message('Klant "%1" succesvol gesynchroniseerd naar WMS.', Rec.Name);
                end;
            }

            action("View WMS Sync Log")
            {
                ApplicationArea = All;
                Caption = 'Synchronisatielogboek bekijken';
                Image = Log;

                trigger OnAction()
                var
                    SyncLog: Record "WMS Sync Log";
                begin
                    SyncLog.SetRange("Record Type", SyncLog."Record Type"::Customer);
                    SyncLog.SetRange("Record ID", Rec."No.");
                    Page.Run(Page::"WMS Sync Log", SyncLog);
                end;
            }
        }
    }
}
```

---

## Codeunit — Business Logica

```al
codeunit 50100 "WMS Sync Management"
{
    // Synchroniseer één klant naar het WMS
    procedure SyncCustomerToWMS(var Customer: Record Customer)
    var
        WMSSetup: Record "WMS Integration Setup";
        HttpClient: HttpClient;
        HttpContent: HttpContent;
        HttpResponse: HttpResponseMessage;
        JsonBody: Text;
        ErrorText: Text;
    begin
        // Haal de integratie-instellingen op
        WMSSetup.Get();

        if WMSSetup."WMS Endpoint" = '' then
            Error('WMS endpoint is niet geconfigureerd. Ga naar WMS Integratie Setup.');

        // Bouw de JSON payload
        JsonBody := BuildCustomerJson(Customer);

        // Stel de HTTP request in
        HttpContent.WriteFrom(JsonBody);
        HttpContent.GetHeaders().Remove('Content-Type');
        HttpContent.GetHeaders().Add('Content-Type', 'application/json');

        HttpClient.DefaultRequestHeaders().Add(
            'Authorization',
            'Bearer ' + WMSSetup."API Token");

        HttpClient.DefaultRequestHeaders().Add(
            'X-Source-System', 'BusinessCentral');

        // Verstuur de request
        if not HttpClient.Post(
            WMSSetup."WMS Endpoint" + '/api/customers',
            HttpContent,
            HttpResponse)
        then
            Error('Verbinding met WMS mislukt. Controleer de WMS Endpoint configuratie.');

        // Verwerk het antwoord
        if not HttpResponse.IsSuccessStatusCode then begin
            HttpResponse.Content.ReadAs(ErrorText);
            Error('WMS synchronisatie gefaald (HTTP %1): %2',
                HttpResponse.HttpStatusCode, ErrorText);
        end;

        // Bijwerken in BC
        Customer."Last WMS Sync" := CurrentDateTime;
        Customer."Pending WMS Sync" := false;
        Customer.Modify();

        // Log de synchronisatie
        LogSyncSuccess(Customer."No.", 'Customer');
    end;

    // Synchroniseer alle klanten met openstaande sync
    procedure SyncAllPendingCustomers(): Integer
    var
        Customer: Record Customer;
        SyncCount: Integer;
        ErrorCount: Integer;
    begin
        Customer.SetRange("Pending WMS Sync", true);
        Customer.SetRange(Blocked, Customer.Blocked::" ");

        if not Customer.FindSet() then
            exit(0);

        repeat
            if not TrySyncCustomerToWMS(Customer) then
                ErrorCount += 1
            else
                SyncCount += 1;
        until Customer.Next() = 0;

        if ErrorCount > 0 then
            Message('%1 klanten gesynchroniseerd, %2 fouten. Zie het synchronisatielogboek.',
                SyncCount, ErrorCount)
        else
            Message('%1 klanten succesvol gesynchroniseerd.', SyncCount);

        exit(SyncCount);
    end;

    [TryFunction]
    local procedure TrySyncCustomerToWMS(var Customer: Record Customer)
    begin
        SyncCustomerToWMS(Customer);
    end;

    local procedure BuildCustomerJson(Customer: Record Customer): Text
    var
        Json: JsonObject;
        JsonText: Text;
    begin
        Json.Add('externalId', Customer."No.");
        Json.Add('name', Customer.Name);
        Json.Add('address', Customer.Address);
        Json.Add('address2', Customer."Address 2");
        Json.Add('postalCode', Customer."Post Code");
        Json.Add('city', Customer.City);
        Json.Add('countryCode', Customer."Country/Region Code");
        Json.Add('vatNumber', Customer."VAT Registration No.");
        Json.Add('segment', Format(Customer."Customer Segment"));
        Json.Add('isActive', Customer.Blocked = Customer.Blocked::" ");
        Json.WriteToText(JsonText);
        exit(JsonText);
    end;

    local procedure LogSyncSuccess(RecordId: Code[20]; RecordType: Text)
    var
        SyncLog: Record "WMS Sync Log";
    begin
        SyncLog.Init();
        SyncLog."Entry No." := 0;
        SyncLog."Record Type" := RecordType;
        SyncLog."Record ID" := RecordId;
        SyncLog.Status := SyncLog.Status::Success;
        SyncLog."Logged At" := CurrentDateTime;
        SyncLog.Insert();
    end;
}
```

---

## API Pages — BC als REST API

BC kan data blootstellen als een REST API. Andere systemen (WACS, TAS, Angular app) kunnen dan rechtstreeks met BC communiceren.

```al
page 50110 "Customer API"
{
    PageType = API;

    // De API URL wordt:
    // GET /api/mycompany/wms/v1.0/companies({companyId})/customers
    APIPublisher = 'mycompany';
    APIGroup = 'wms';
    APIVersion = 'v1.0';
    EntitySetName = 'customers';
    EntityName = 'customer';

    SourceTable = Customer;
    ODataKeyFields = SystemId;
    DelayedInsert = true;

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field(id; Rec.SystemId)
                { Caption = 'id'; }

                field(number; Rec."No.")
                { Caption = 'number'; }

                field(name; Rec.Name)
                { Caption = 'name'; }

                field(address; Rec.Address)
                { Caption = 'address'; }

                field(city; Rec.City)
                { Caption = 'city'; }

                field(countryCode; Rec."Country/Region Code")
                { Caption = 'countryCode'; }

                field(segment; Rec."Customer Segment")
                { Caption = 'segment'; }

                field(wmsCustomerCode; Rec."WMS Customer Code")
                { Caption = 'wmsCustomerCode'; }

                field(isBlocked; Rec.Blocked)
                { Caption = 'isBlocked'; }
            }
        }
    }

    // Aanroepen vanuit .NET:
    // GET /api/mycompany/wms/v1.0/companies(abc-123)/customers
    // GET /api/mycompany/wms/v1.0/companies(abc-123)/customers?$filter=segment eq 'A'
    // POST /api/mycompany/wms/v1.0/companies(abc-123)/customers
    // PATCH /api/mycompany/wms/v1.0/companies(abc-123)/customers(guid)
}
```

### BC API aanroepen vanuit .NET

```csharp
public class BusinessCentralClient : IBusinessCentralClient
{
    private readonly HttpClient _http;
    private readonly IOptions<BCSettings> _settings;

    public BusinessCentralClient(HttpClient http, IOptions<BCSettings> settings)
    {
        _http = http;
        _settings = settings;
    }

    public async Task<List<BCCustomerDto>> GetCustomersAsync(string? segmentFilter = null)
    {
        var url = $"{_settings.Value.BaseUrl}/api/mycompany/wms/v1.0" +
                  $"/companies({_settings.Value.CompanyId})/customers";

        if (segmentFilter is not null)
            url += $"?$filter=segment eq '{segmentFilter}'";

        var response = await _http.GetFromJsonAsync<BCODataResult<BCCustomerDto>>(url);
        return response?.Value ?? [];
    }

    public async Task<int> CreateSalesOrderAsync(BCSalesOrderCommand command)
    {
        var url = $"{_settings.Value.BaseUrl}/api/v2.0" +
                  $"/companies({_settings.Value.CompanyId})/salesOrders";

        var response = await _http.PostAsJsonAsync(url, command);
        response.EnsureSuccessStatusCode();

        var created = await response.Content.ReadFromJsonAsync<BCSalesOrderDto>();
        return created!.Number;
    }

    // Voorraadmutatie doorsturen naar BC (na picking in WACS)
    public async Task PostItemJournalAsync(BCItemJournalLine line)
    {
        var url = $"{_settings.Value.BaseUrl}/api/v2.0" +
                  $"/companies({_settings.Value.CompanyId})/itemJournalLines";

        var response = await _http.PostAsJsonAsync(url, line);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new BCIntegrationException(
                $"Voorraadmutatie gefaald (HTTP {response.StatusCode}): {error}");
        }
    }
}
```

---

## Events — Loose koppeling via Publisher/Subscriber

Het event-systeem van BC laat toe dat extensies op elkaar reageren zonder directe afhankelijkheden:

```al
// In jouw extensie: definieer een event dat anderen kunnen subscriben
codeunit 50200 "WMS Integration Events"
{
    // IntegrationEvent: andere extensies kunnen hierop subscriben
    [IntegrationEvent(false, false)]
    procedure OnBeforeCustomerSyncToWMS(
        var Customer: Record Customer;
        var ShouldSync: Boolean)
    begin
        // Lege body — implementatie gebeurt door subscribers
    end;

    [IntegrationEvent(false, false)]
    procedure OnAfterCustomerSyncToWMS(
        var Customer: Record Customer;
        Success: Boolean;
        ErrorMessage: Text)
    begin
    end;
}

// In een ANDERE extensie: subscribe op het event
// Geen directe koppeling — de publisher weet niet dat deze subscriber bestaat
codeunit 50301 "Custom Sync Validator"
{
    [EventSubscriber(
        ObjectType::Codeunit,
        Codeunit::"WMS Integration Events",
        'OnBeforeCustomerSyncToWMS',
        '',
        false,
        false)]
    local procedure ValidateBeforeSync(
        var Customer: Record Customer;
        var ShouldSync: Boolean)
    begin
        // Blokkeer sync als WMS Customer Code niet ingevuld is
        if Customer."WMS Customer Code" = '' then begin
            ShouldSync := false;
            Message('Klant "%1" heeft geen WMS Klantcode. Synchronisatie overgeslagen.', Customer.Name);
        end;

        // Blokkeer sync voor geblokkeerde klanten
        if Customer.Blocked <> Customer.Blocked::" " then
            ShouldSync := false;
    end;
}
```

---

## Extension Lifecycle — Van Code naar Productie

```bash
# ─── 1. ONTWIKKELOMGEVING ───────────────────────────────────────────────
# VS Code met AL Language extension
code .

# In VS Code:
# F1 → "AL: Download Symbols" → haalt BC objectdefinities op
# F5 → Publiceert de extension naar sandbox en opent BC

# ─── 2. TESTEN ─────────────────────────────────────────────────────────
# AL Test Codeunits
codeunit 50900 "Customer Sync Tests"
{
    Subtype = Test;

    [Test]
    procedure TestSyncCustomerWithValidData()
    var
        Customer: Record Customer;
        WMSSyncMgt: Codeunit "WMS Sync Management";
        HttpMock: Codeunit "Http Mock";
    begin
        // Arrange
        HttpMock.SetupSuccess('{"id": "CUST-001"}');
        CreateTestCustomer(Customer, 'CUST-001', 'Test Klant BV', 'WMS001');

        // Act
        WMSSyncMgt.SyncCustomerToWMS(Customer);

        // Assert
        Customer.Find('=');
        Assert.IsTrue(Customer."Last WMS Sync" > 0DT, 'Last WMS Sync moet ingesteld zijn');
        Assert.IsFalse(Customer."Pending WMS Sync", 'Pending WMS Sync moet false zijn');
    end;
}

# ─── 3. BUILDEN ─────────────────────────────────────────────────────────
# F1 → "AL: Package" → genereert MyExtension_1.0.0.0.app

# ─── 4. DEPLOYEN VIA AZURE DEVOPS ──────────────────────────────────────
# In azure-pipelines.yml:
- task: ALOpsAppPublish@1
  inputs:
    usedocker: false
    nav_serverinstance: 'BC Production'
    artifact_path: '$(Build.ArtifactStagingDirectory)/*.app'

# ─── 5. OF VIA BC ADMIN CENTER ──────────────────────────────────────────
# apps.businesscentral.dynamics.com → Extensions → Upload Extension
```

---

## Veelgemaakte fouten in AL

| Fout | Probleem | Oplossing |
|------|---------|-----------|
| `Rec.Modify()` zonder `Rec.Find()` | Databasefout: record niet gevonden | Altijd `Find()` voor `Modify()` |
| Loop met `FindFirst()` | Verwerkt alleen het eerste record | Gebruik `FindSet()` + `repeat/until` |
| `SetRange` na `FindSet()` | Filter wordt genegeerd | Altijd filter voor de FindSet |
| Globale variabelen misbruiken | Thread-safety issues | Gebruik parameters en lokale vars |
| HTTP call in een transactie | Kan tot problemen leiden | Gebruik `Commit()` voor externe calls |
| Hardgecodeerde endpoints | Werkt niet in andere omgevingen | Gebruik Setup tabellen |

---

*[← Terug naar overzicht](../../README.md)*
