# Zeebrugge Logistics Tech Opportunity Playbook

Snapshot date: 2026-06-02

This playbook turns the public-source research dataset into practical product and sales angles. It should be read as a hypothesis map, not as validated customer discovery.

## Best Entry Points

### 1. Yard Visibility

**Best-fit buyers:** automotive/RoRo terminals, trailer yards, intermodal warehouses, overflow storage providers.

**Problem shape:** vehicles, trailers, and containers can create expensive uncertainty when dwell time, location, release status, or handover state is not visible enough.

**Product angle:** do not replace TOS/YMS. Start as an overlay that imports or manually captures location/status events, highlights exceptions, and exports simple reports.

**MVP modules:**

- asset search by VIN, trailer, container, or booking
- dwell-time dashboard
- release-status queue
- gate-in/gate-out event log
- customer-facing status view

### 2. Customs Automation

**Best-fit buyers:** forwarders, customs brokers, UK/Ireland operators, shipping agents.

**Problem shape:** Brexit-driven and platform-led release flows create recurring document checks, actor-permission questions, and status chasing.

**Product angle:** build around IRP, NxtPort, RX-SeaPort, and customer document workflows. Avoid another isolated portal.

**MVP modules:**

- missing-document detection
- shipment release checklist
- exception queue by urgency
- customer upload/request flow
- audit trail for customs status changes

### 3. ETA And Dwell-Time Forecasting

**Best-fit buyers:** terminals, warehouses, transport planners, rail-connected operators.

**Problem shape:** operators do not need generic forecasts; they need predictions that affect gates, labor, warehouse capacity, rail slots, and customs holds.

**Product angle:** begin with narrow forecasts tied to operational actions, such as “which trailers will exceed dwell threshold” or “which gate window will overload”.

**MVP modules:**

- vessel and ferry schedule monitor
- gate peak forecast
- dwell-risk scoring
- labor-demand estimate
- delay reason tagging

## Sales Signals To Research Next

- job posts mentioning TOS, WMS, TMS, EDI, API, BI, customs, Azure, Microsoft, SAP, Navis, or terminal planning
- vendor case studies involving port, terminal, forwarding, customs, or intermodal tools
- customer portal availability and API documentation
- public procurement notices and integration tenders
- operations roles with repeated exception-management language

## Why Zeebrugge Is A Useful Beachhead

Zeebrugge has dense activity in RoRo, automotive, UK/Ireland shortsea, intermodal logistics, and LNG. That mix produces operational complexity without requiring a global research scope. The same research structure can be reused for Rotterdam, Antwerp, Hamburg, Dunkirk, or North Sea offshore logistics clusters.
