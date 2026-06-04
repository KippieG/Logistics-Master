# Automation — Power Platform · RPA · Chatbots

## Wat is automatisering en waarom?

**Automatisering** is het vervangen van handmatige, repetitieve taken door software die die taken automatisch uitvoert. In een bedrijfsomgeving gaat het over:

- Medewerkers die dagelijks data kopiëren tussen systemen
- Goedkeuringsprocessen die via e-mail verlopen
- Rapporten die handmatig samengesteld worden
- Klanten die wachten op een antwoord dat ze zelf konden opzoeken

**Het Microsoft Power Platform** is de low-code/no-code automatiseringstool van Microsoft:

| Tool | Doel |
|------|------|
| **Power Automate** | Processen en flows automatiseren (cloud + desktop) |
| **Power Apps** | Bedrijfsapplicaties bouwen zonder code |
| **Power BI** | Data visualiseren (zie BI sectie) |
| **Copilot Studio** | AI-gedreven chatbots bouwen |

**RPA (Robotic Process Automation)** is een subset van automatisering waarbij software (een "robot") een gebruikersinterface bedient — net zoals een mens dat zou doen. Ideaal voor legacy systemen zonder API.

---

## Power Automate — Cloud Flows

### Hoe werkt een Cloud Flow?

Een **Cloud Flow** bestaat uit drie onderdelen:
1. **Trigger**: de gebeurtenis die de flow start
2. **Acties**: wat er daarna gebeurt
3. **Voorwaarden/Lussen**: logica om beslissingen te nemen

```
Voorbeeldflow: Goedkeuring van een inkooporder

TRIGGER: Nieuw item in SharePoint lijst "Inkooporders"
    ↓
VOORWAARDE: Bedrag > €1.000?
    ↓ JA                          ↓ NEE
ACTIE: Goedkeuring sturen       ACTIE: Automatisch goedkeuren
    naar Manager                      → Status = "Goedgekeurd"
    ↓                                 → E-mail naar aanvrager
WACHT OP REACTIE
    ↓ Goedgekeurd                 ↓ Afgewezen
ACTIE: Status = "Goedgekeurd"   ACTIE: Status = "Afgewezen"
ACTIE: E-mail aanvrager         ACTIE: E-mail aanvrager + reden
ACTIE: Stuur naar boekhouding   ACTIE: Archiveer aanvraag
```

### Triggers begrijpen

```
INSTANT TRIGGERS (handmatig of via knop):
  - Handmatig triggeren (voor testen)
  - Power Apps knop
  - HTTP Request (vanuit externe systemen)

SCHEDULED TRIGGERS (tijdgestuurd):
  - Recurrence: elke dag om 06:00
  - Elke maandag om 08:00 voor weekrapport

AUTOMATED TRIGGERS (event-gestuurd):
  - SharePoint: item aangemaakt/gewijzigd/verwijderd
  - E-mail ontvangen (Outlook)
  - Teams bericht
  - Business Central: record aangemaakt
  - SQL Server: nieuw record (via connector)
  - Azure Service Bus: bericht in wachtrij
  - HTTP Webhook (vanuit eigen API)
```

### REST API aanroepen vanuit Power Automate

```json
// HTTP actie configuratie
{
  "method": "POST",
  "uri": "https://myapp.azurewebsites.net/api/v1/orders",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer @{outputs('Get_Access_Token')?['body/access_token']}"
  },
  "body": {
    "orderNumber": "@{triggerBody()?['OrderNumber']}",
    "customerId": "@{int(triggerBody()?['CustomerId'])}",
    "requestedDeliveryDate": "@{formatDateTime(triggerBody()?['DeliveryDate'], 'yyyy-MM-dd')}",
    "lines": "@{json(triggerBody()?['OrderLines'])}"
  },
  "retryPolicy": {
    "type": "exponential",
    "count": 3,
    "interval": "PT5S"
  }
}

// Response verwerken
// Als de API 201 Created teruggeeft met {"id": 42}:
// @{body('Create_Order')?['id']} → 42
```

### Expressions — Power Automate formule-taal

```
TEKST:
  concat('Beste ', triggerBody()?['Name'])
  → "Beste Jan"

  toLower(triggerBody()?['Status'])
  → "open"

  formatDateTime(utcNow(), 'dd/MM/yyyy HH:mm')
  → "03/06/2026 14:30"

GETALLEN:
  add(triggerBody()?['Quantity'], 5)
  mul(triggerBody()?['UnitPrice'], triggerBody()?['Quantity'])
  div(body('Get_Total')?['amount'], 100)

LOGICA:
  if(equals(triggerBody()?['Status'], 'Open'), 'Ja', 'Nee')
  and(greater(triggerBody()?['Amount'], 1000), equals(triggerBody()?['Currency'], 'EUR'))
  empty(triggerBody()?['Notes'])

ARRAYS:
  length(body('Get_Orders')?['value'])
  → aantal items in een array

  first(body('Get_Orders')?['value'])?['Id']
  → Id van het eerste item

  join(variables('EmailList'), ';')
  → "jan@bedrijf.be;piet@bedrijf.be"
```

### Foutafhandeling in flows

```
Elke actie heeft een "Run after" configuratie:
  ✅ Is succeeded    (standaard: voer uit als vorige stap geslaagd)
  ❌ Has failed      (voer uit als vorige stap gefaald)
  ⏭️ Is skipped     (voer uit als vorige stap overgeslagen)
  ⏱️ Has timed out  (voer uit als vorige stap timeout)

Patroon: Try-Catch in Power Automate

Scope "Try":
  → Actie 1
  → Actie 2
  → Actie 3

Scope "Catch" (Run after: Try has failed):
  → Log fout naar SharePoint lijst
  → Stuur e-mail naar beheerder
  → Zet status op "Fout"

Scope "Finally" (Run after: Try succeeded of failed):
  → Sluit resources af
  → Update statusveld
```

---

## RPA — Desktop Flows (Power Automate Desktop)

### Wanneer RPA, wanneer API?

```
GEBRUIK API WANNEER:
  ✅ Het systeem heeft een REST/SOAP API
  ✅ De data is gestructureerd en voorspelbaar
  ✅ Performance en betrouwbaarheid zijn kritiek
  ✅ Grote volumes (duizenden transacties)

GEBRUIK RPA WANNEER:
  ✅ Legacy systeem zonder API (oud ERP, mainframe, terminal)
  ✅ Systeem heeft alleen een gebruikersinterface
  ✅ Aanpassing van het systeem is niet mogelijk of te duur
  ✅ Proces is stabiel (UI verandert niet vaak)
  ✅ Klein volume (tientallen tot honderden transacties)
```

### Opbouw van een goede Desktop Flow

```
1. INITIALISATIE
   → Stel variabelen in vanuit de aanroeper (via Cloud Flow)
   → Open logbestand of initialiseer foutlijst

2. APPLICATIE OPENEN
   → Launch application: "C:\Program Files\TAS\TAS.exe"
   → Wait for window: title "TAS Transport Management"
   → Inloggen (gebruikersnaam en wachtwoord uit Key Vault)

3. HOOFD LOOP
   → For each item in invoerlijst:
       a. Navigeer naar het juiste scherm
       b. Voer data in (gebruik Tab om tussen velden te wisselen)
       c. Bevestig (Enter of klik Opslaan)
       d. Vang resultaat op (lees orderID uit scherm)
       e. Sla resultaat op in uitvoerlijst
       f. Bij fout: log de fout, ga door met volgend item

4. AFSLUITING
   → Sluit applicatie
   → Rapporteer resultaten aan Cloud Flow

5. FOUTAFHANDELING (overal)
   → Als element niet gevonden: screenshot nemen, log fout
   → Als applicatie crasht: herstart en probeer opnieuw
   → Als maximale retries bereikt: escaleer naar mens
```

### Volledige Desktop Flow voorbeeld — Orders invoeren in TAS

```
// Variabelen instellen
SET Username TO %Config_Username%
SET Password TO %Config_Password%
SET Orders TO %InputOrders%  // Lijst met orders van de Cloud Flow
SET Results TO []             // Lege lijst voor resultaten
SET ErrorCount TO 0

// Applicatie starten
LAUNCH APPLICATION 'C:\Program Files\TAS\TAS.exe'
WAIT FOR APPLICATION TO LAUNCH FOR 10 SECONDS

// Inloggen
WAIT FOR ELEMENT [TAS:LoginWindow]
CLICK [TAS:UsernameField]
TYPE %Username%
CLICK [TAS:PasswordField]
TYPE %Password%
CLICK [TAS:LoginButton]

// Wacht tot het hoofdscherm geladen is
WAIT FOR ELEMENT [TAS:MainDashboard] MAX 30 SECONDS
IF ELEMENT NOT FOUND THEN
    THROW ERROR 'Kan niet inloggen op TAS. Controleer credentials.'
END IF

// Loop door alle orders
FOR EACH Order IN Orders
    BEGIN TRY
        // Navigeer naar nieuwe order
        CLICK [TAS:Menu_Transport]
        CLICK [TAS:Menu_NewOrder]
        WAIT FOR ELEMENT [TAS:NewOrderForm]

        // Velden invullen
        CLICK [TAS:Field_Reference]
        CLEAR FIELD
        TYPE %Order.Reference%

        CLICK [TAS:Field_CustomerCode]
        CLEAR FIELD
        TYPE %Order.CustomerCode%
        PRESS TAB  // Trigger klantvalidatie
        WAIT 1 SECOND  // Wacht op autocompletion

        // Controleer of klant gevonden is
        IF ELEMENT [TAS:Error_CustomerNotFound] EXISTS THEN
            ADD TO LIST Results: {Reference: Order.Reference, Status: 'Fout', Message: 'Klant niet gevonden'}
            SET ErrorCount TO ErrorCount + 1
            CLICK [TAS:Button_Cancel]
            CONTINUE  // Ga naar volgende order
        END IF

        // Datum en prioriteit invullen
        CLICK [TAS:Field_DeliveryDate]
        TYPE %Order.DeliveryDate%  // Format: dd/MM/yyyy
        PRESS TAB

        SELECT FROM DROPDOWN [TAS:Dropdown_Priority] VALUE %Order.Priority%

        // Opslaan
        CLICK [TAS:Button_Save]
        WAIT FOR ELEMENT [TAS:Confirmation_Saved] MAX 10 SECONDS

        // Lees het nieuwe order ID
        GET TEXT FROM ELEMENT [TAS:Field_OrderId] INTO NewOrderId

        // Voeg toe aan resultaten
        ADD TO LIST Results: {Reference: Order.Reference, TasId: NewOrderId, Status: 'OK'}

    CATCH ERROR
        // Maak screenshot voor diagnose
        TAKE SCREENSHOT PATH 'C:\Logs\RPA\error_%DateTime_Now%.png'

        // Log de fout
        ADD TO LIST Results: {Reference: Order.Reference, Status: 'Fout', Message: %LastError.Message%}
        SET ErrorCount TO ErrorCount + 1

        // Sluit eventuele dialoogvensters
        IF ELEMENT [TAS:Dialog_Error] EXISTS THEN
            CLICK [TAS:Dialog_ButtonClose]
        END IF
    END TRY
END FOR

// Afsluiten
CLICK [TAS:Menu_File]
CLICK [TAS:Menu_Exit]

// Resultaten teruggeven aan de Cloud Flow
OUTPUT Results
OUTPUT ErrorCount
```

---

## Copilot Studio — Chatbots Bouwen

### Wat kan een chatbot?

Een **chatbot** beantwoordt vragen en voert taken uit via een conversatie-interface. In een bedrijfscontext:

- Veelgestelde vragen beantwoorden (zonder medewerker te storen)
- Status opvragen (order, incident, levering)
- Eenvoudige acties uitvoeren (verlof aanvragen, ticket aanmaken)
- Medewerkers doorverwijzen naar de juiste persoon/afdeling

### Anatomie van een chatbot

```
CHATBOT
├── Topics (gespreksonderwerpen)
│   ├── Trigger phrases: woorden/zinnen die het topic starten
│   ├── Conversation flow: de dialoog stap voor stap
│   └── Actions: wat de bot doet (API call, Power Automate flow)
│
├── Entities (data herkenning)
│   ├── Ingebouwd: datum, getal, e-mailadres, telefoonnummer
│   └── Aangepast: ordernummer (patroon: ORD-JJJJ-NNN)
│
├── Variables (geheugen binnen gesprek)
│   ├── Opgeslagen antwoorden van gebruiker
│   └── Data opgehaald uit systemen
│
└── Escalatie (wanneer bot het niet weet)
    └── Doorverbinden naar livechat of e-mail
```

### Topic: Orderstatus opvragen

```
TOPIC: "Orderstatus"

TRIGGER PHRASES:
  - "status van mijn order"
  - "waar is mijn bestelling"
  - "order opvolgen"
  - "is mijn order al verzonden"

─── GESPREKSSTAP 1 ─────────────────────────────────────────────
Bot: "Ik help je graag met de status van je order.
      Wat is je ordernummer? (bijv. ORD-2026-001)"

Gebruiker voert ordernummer in
  → Valideer met entity "OrderNumber" (patroon: ORD-\d{4}-\d+)
  → Als ongeldig: "Dat lijkt geen geldig ordernummer.
                  Het formaat is ORD-JJJJ-NNN. Probeer opnieuw."
  → Sla op in variabele: var_OrderNumber

─── GESPREKSSTAP 2 ─────────────────────────────────────────────
ACTION: Roep Power Automate flow "GetOrderStatus" aan
  Input: var_OrderNumber
  Output:
    var_Status (bijv. "InTransit")
    var_ETA (bijv. "04/06/2026")
    var_TrackingCode (bijv. "BE123456789")
    var_Found (true/false)

─── GESPREKSSTAP 3 — Voorwaardelijk antwoord ───────────────────
IF var_Found = false THEN:
  Bot: "Ik vind geen order met nummer {var_OrderNumber}.
        Wil je een ander nummer proberen of wil je contact opnemen met onze klantenservice?"
  → Knoppen: [Ander nummer] [Klantenservice contacteren]

IF var_Status = "Draft" THEN:
  Bot: "Order {var_OrderNumber} staat nog in concept.
        Zodra de order bevestigd is, ontvang je een e-mail."

IF var_Status = "InTransit" THEN:
  Bot: "Je order {var_OrderNumber} is onderweg! 🚛
        Verwachte levering: {var_ETA}
        Track je zending via code: {var_TrackingCode}"

IF var_Status = "Delivered" THEN:
  Bot: "Je order {var_OrderNumber} is afgeleverd.
        Was er een probleem? Dan kan ik een retourinitiatief starten."
  → Knoppen: [Alles OK] [Retour starten] [Probleem melden]

─── GESPREKSSTAP 4 — Afsluiting ────────────────────────────────
Bot: "Kan ik je nog met iets anders helpen?"
  → Knoppen: [Ja, nieuwe vraag] [Nee, bedankt]
```

### Power Automate flow aanroepen vanuit bot

```json
// Flow "GetOrderStatus" — aangeroepen vanuit Copilot Studio
// Input: OrderNumber (tekst)
// Output: Status, ETA, TrackingCode, Found

{
  "trigger": "When Power Virtual Agents calls a flow",
  "inputs": {
    "orderNumber": "text"
  },
  "actions": {
    "GetOrderFromAPI": {
      "type": "Http",
      "method": "GET",
      "uri": "https://myapp.azurewebsites.net/api/v1/orders/byNumber/@{triggerBody()['orderNumber']}",
      "headers": {
        "Authorization": "Bearer @{outputs('GetToken')['access_token']}"
      }
    },
    "RespondToBot": {
      "type": "Response",
      "body": {
        "status": "@{if(equals(outputs('GetOrderFromAPI')['statusCode'], 200), body('GetOrderFromAPI')['status'], 'NotFound')}",
        "eta": "@{body('GetOrderFromAPI')?['estimatedDelivery']}",
        "trackingCode": "@{body('GetOrderFromAPI')?['trackingCode']}",
        "found": "@{equals(outputs('GetOrderFromAPI')['statusCode'], 200)}"
      }
    }
  }
}
```

---

## Power Apps

Power Apps laat je bedrijfsapplicaties bouwen met minimal code. Ideaal voor:
- Inspectielijsten en checklists
- Eenvoudige dataregistratie (incidenten, observaties)
- Mobiele toegang tot bedrijfsdata
- Workflows die te eenvoudig zijn voor een full-stack applicatie

### Canvas App vs. Model-driven App

```
CANVAS APP:
  → Jij ontwerpt elk scherm zelf (als PowerPoint)
  → Verbind met elke databron (SharePoint, SQL, API)
  → Volledige controle over het uiterlijk
  → Ideaal voor specifieke workflows
  → Formule-taal vergelijkbaar met Excel

MODEL-DRIVEN APP:
  → Gebouwd op Microsoft Dataverse tabellen
  → Formulieren en views automatisch gegenereerd
  → Minder maatwerk UI, maar sneller gebouwd
  → Ingebouwde business rules, workflows
  → Ideaal voor CRM-achtige applicaties
```

### Canvas App voorbeeld formules

```
// Navigeren naar een ander scherm
Navigate(OrderDetailScreen, ScreenTransition.Fade, {OrderId: Gallery1.Selected.Id})

// Data ophalen van SharePoint
ClearCollect(
    colOrders,
    Filter(
        'Inkooporders',
        Status = "Open" And Verantwoordelijke.Email = User().Email
    )
)

// Item bijwerken in SharePoint
Patch(
    'Inkooporders',
    LookUp('Inkooporders', ID = lblOrderId.Text),
    {
        Status: "Goedgekeurd",
        GoedgekeurdDoor: User().FullName,
        GoedgekeurdOp: Now()
    }
)

// Validatie voor opslaan
If(
    IsBlank(txtOrderNumber.Text) Or IsBlank(ddlCustomer.Selected),
    Notify("Vul alle verplichte velden in", NotificationType.Error),
    Patch('Orders', Defaults('Orders'), {
        OrderNumber: txtOrderNumber.Text,
        Customer: ddlCustomer.Selected.Value,
        Status: "Draft"
    });
    Notify("Order aangemaakt!", NotificationType.Success)
)
```

---

## Governance — Power Platform op schaal

Als meer mensen flows en apps bouwen, heb je governance nodig:

### Omgevingsstrategie

```
Omgevingen:
  Default    → Geen productie-gebruik, alleen experimenteren
  Ontwikkeling  → Developers bouwen en testen hier
  Test/UAT   → Eindgebruikers testen hier
  Productie  → Alleen goedgekeurde oplossingen

Beheer:
  → DLP (Data Loss Prevention) policies: welke connectors mogen samen gebruikt worden?
  → Interne connectoren (eigen API's) mogen altijd
  → Externe connectoren (bijv. Twitter, Gmail) apart of verboden
```

### Naamgevingsconventie

```
Flows:     [team]_[proces]_[trigger]_v[versie]
           bijv: logistiek_orderbevestiging_nieuwitem_v2

Apps:      [team]_[doel]
           bijv: warehouse_inspectielijst

Omgeving:  [bedrijf]-[omgeving]
           bijv: mycompany-productie
```

### CoE Starter Kit

Microsoft biedt gratis een **Center of Excellence Starter Kit** aan — een set Power Apps en flows die je Power Platform omgeving monitoren:
- Overzicht van alle flows, apps, chatbots
- Inactieve resources opsporen
- Risico-inventarisatie (welke flows gebruiken gevoelige connectoren)
- Adoptiecijfers per afdeling

---

*[← Terug naar overzicht](../../README.md)*
