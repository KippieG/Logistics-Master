# Zeebrugge Logistics Analysis

Snapshot date: 2026-06-02

## Executive take

Zeebrugge is not just a local logistics cluster. It is a specialized gateway inside Port of Antwerp-Bruges with three strong lanes: automotive/RoRo, UK-Ireland shortsea/intermodal logistics, and LNG/energy logistics. The technology opportunity is concentrated around visibility, customs digitization, yard/terminal orchestration, and intermodal planning.

Public tech-stack visibility is weak at company level. The best verified signals are ecosystem-level: APICS, ZEDIS, NxtPort/RX-SeaPort, IRP, APICA digital twin, smart cameras and terminal APIs. Individual company stacks are mostly inferred from operations unless a vendor case exists, such as ECS with Microsoft Analytics / Reporting Services.

## Market map

Core clusters:

- Automotive/RoRo: ICO, Wallenius Wilhelmsen, MOSOLF, UECC, KESS, C.RO-related terminal activity.
- Container/deepsea: CSP Zeebrugge Terminal, PSA Zeebrugge.
- UK/Ireland and intermodal: ECS/2XL, NDQ, DFDS, CLdN and related road/rail/warehouse operators.
- Forwarding/customs/agency: Alltraco, Dens Ocean, RBZ, Herfurth/M-Star, Notman.
- Energy logistics: Fluxys LNG Terminal and port energy infrastructure.

## Technology signals

Observed ecosystem stack:

- APICS for operational vessel/port information.
- ZEDIS as the Zeebrugge Port Community System.
- NxtPort and RX/SeaPort integration for port-community data sharing.
- IRP for import release/customs digitization across Belgian ports.
- APICA digital twin, smart cameras and terminal API tooling from Port of Antwerp-Bruges.
- Lightweight website scan signals: Drupal/Next.js/React on Port of Antwerp-Bruges, WordPress/Vue on NxtPort, Drupal on ECS and PSA Zeebrugge, WordPress on CSP and MOSOLF, React on Fluxys and DFDS, and Next.js/React on CLdN. These are web-channel signals, not proof of operational systems.

Likely company-level needs:

- Terminal operators: TOS, YMS, gate OCR/camera integration, vehicle inventory, EDI/API with shipping lines and OEMs.
- Forwarders and customs brokers: customs declaration software, document automation, shipment tracking, customer portals.
- Warehouses/intermodal operators: WMS, TMS, rail planning, slot booking, ETA prediction, customer visibility.
- Shipping agents: port-call workflow tooling, APICS/ZEDIS integration, document and berth-event automation.

## Gaps and opportunities

1. Yard visibility is the clearest pain point.
   Automotive and trailer flows need accurate dwell time, location, release status and handover state. A lightweight yard-visibility layer that integrates with existing TOS/PCS rather than replacing it could sell faster.

2. Customs workflows are becoming platform-led.
   IRP and NxtPort/RX-SeaPort point to a future where customs status, release, actor permissions and document flows are increasingly standardized. Tools should integrate with that ecosystem instead of building isolated portals.

3. UK/Ireland flows remain attractive.
   Brexit support, unaccompanied transport, ferry schedules, rail-connected warehousing and customs documentation create recurring operational complexity. This is a strong niche for automation.

4. Forecasting demand has value if tied to operations.
   Generic market forecasts are less useful than forecasts for ETA variance, gate peaks, trailer dwell time, rail capacity, warehouse labor demand and customs hold probability.

## 2026 outlook

Near-term:

- More pressure on digital customs release and data sharing through IRP/NxtPort/RX-SeaPort.
- Continued need for extra capacity and infrastructure, including the New Zeebrugge Lock and wider port capacity projects.
- Automotive flows remain strategically important but exposed to EV import volatility, OEM inventory cycles and geopolitical tariff changes.
- LNG remains relevant but exposed to regulation, Russian LNG phase-out dynamics, price volatility and decarbonization pressure.

Medium-term:

- Terminal and warehouse operators will likely buy incremental tooling around visibility, exception management and AI-assisted planning before replacing core TOS/WMS/TMS.
- Companies with rail/intermodal capacity and customs competence should outperform pure road-only operators when shippers optimize for resilience, emissions and UK/Ireland reliability.
- Data interoperability becomes a commercial differentiator: companies that can expose clean APIs and reliable event data will be easier to plug into shipper systems.

## Useful product ideas

- Zeebrugge company intelligence dashboard: company, services, lanes, contact, public tech signals, hiring signals, and integration maturity.
- YardExx-style yard capacity marketplace: focus on trailer/vehicle/overflow storage around Zeebrugge, with verified availability and compliance.
- Customs document automation for UK/Ireland flows: pre-checks, missing-document detection, IRP/NxtPort integration roadmap.
- ETA and dwell-time forecaster: combine public vessel schedules, terminal status, weather and historical dwell observations.
- Sales lead scorer for logistics tech vendors: rank companies by digital maturity, pain likelihood and budget signal.

## Next research steps

Completed in this iteration:

- Added a conservative APZI visible-text extractor. The public members page exposes categories and search UI more reliably than a complete member export, so a direct APZI/Voka export remains the best route for full coverage.
- Added a lightweight webtech scanner. It produced successful public-domain scans for 19 of 20 seed companies/platforms.
- Added job-signal enrichment for ECS automated warehouses, CSP IT hiring, Lineas rail planning and broader role categories.
- Added VAT/registry leads where public source snippets expose them: ECS, ICO, CSP, Fluxys LNG and CLdN/C.RO-related signals.
- Added contact-role mapping for operations, IT, customs, terminal planning and commercial outreach.

Still worth doing:

- Run manual Wappalyzer/BuiltWith checks and compare them against `data/web_tech_scan.csv`.
- Verify VAT, enterprise numbers and financials through official KBO/NBB sources before using them commercially.
- Expand APZI coverage through direct data access or browser/API extraction if the directory exposes a client-side endpoint.
- Add a job-board scraper with cached search result metadata and dates.
- Add named outreach contacts only when they are role-relevant and clearly public.
