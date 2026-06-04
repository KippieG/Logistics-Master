# EDI Message Monitor

Real-time validator and parser for port logistics EDI messages — built as part of the [TOS Simulation Platform](../README.md).

## What it does

Port terminals like CSP Zeebrugge exchange hundreds of EDI messages daily with shipping lines, freight forwarders, and trucking companies. A single malformed message can delay a vessel departure or misplace a container in the yard.

This tool parses and validates incoming EDI messages in real time, highlights structural errors and warnings, and gives operators a clear overview of what each message contains.

## Supported message types

| Type | Full name | Used for |
|------|-----------|----------|
| **BAPLIE** | Bayplan/Stowage Plan | Where each container sits on the vessel (slot position, weight, hazmat) |
| **COPARN** | Container Order Announcement | Shipping line instructs terminal to expect or release containers |
| **CODECO** | Container Gate-In/Gate-Out | Confirms a truck has delivered or picked up a container at the gate |

These are UN/EDIFACT standards used by virtually every container terminal worldwide, including Navis N4 and other major TOS platforms.

## Validation rules

**Structural (errors — message rejected)**
- Mandatory segments present: `UNB`, `UNH`, `BGM`, `UNZ`
- Message type in `UNH` matches expected type
- Container ID format: 4 uppercase letters + 7 digits (ISO 6346)
- Container weight does not exceed 30,480 kg (ISO max gross mass)

**Data quality (warnings — message accepted, flagged)**
- UNB syntax version is a known standard (`UNOA`, `UNOB`, `UNOC`)
- Vessel name present (`TDT` segment) for BAPLIE messages
- Weight declared for each container in bay plans (`MEA+WT`)
- Stow position declared for each container in bay plans (`LOC+147`)

## How to use

No installation needed — open `index.html` in any browser.

1. Click **Demo laden** to load realistic sample messages
2. Or paste a raw EDI message and click **Valideer & verwerk**
3. Select any message from the log to see the full analysis

## EDI segment reference

```
UNB  — Interchange header (sender, receiver, datetime)
UNH  — Message header (message type, reference)
BGM  — Beginning of message (message ID)
DTM  — Date/time (137=creation, 178=event)
TDT  — Transport details (vessel name, voyage, carrier)
LOC  — Location (5=port of loading, 61=port of discharge, 147=stow position)
EQD  — Equipment details (container ID, size/type, full/empty)
MEA  — Measurements (WT=gross weight in KGM)
DGS  — Dangerous goods (IMO class)
FTX  — Free text (hazmat description)
NAD  — Name and address (carrier, trucker)
TSR  — Transport service requirements
UNT  — Message trailer
UNZ  — Interchange trailer
```

## Tech stack

- Vanilla JavaScript (no dependencies, no build step)
- Runs fully in the browser — no server required
- Deployable as a static file or via GitHub Pages

## Relation to TOS simulation

This module connects to the broader TOS simulation:

- Bay plans (BAPLIE) feed into the **vessel scheduling** and **yard allocation** modules
- Container orders (COPARN) trigger entries in the **container tracking** system
- Gate confirmations (CODECO) update the **operational KPI dashboard**

See the [main project README](../README.md) for the full architecture.
