# V3 Research Upgrade: Evidence Expansion

Snapshot date: 2026-06-03

## What Changed

This upgrade adds seven deeper research layers without changing the README:

- APZI browser/API inspection evidence via raw HTML and links capture.
- Wappalyzer CLI checks compared with the local `data/web_tech_scan.csv` scanner.
- Job-posting and career evidence for EDI, cloud, BI/data, terminal planning and customs role families.
- More Firecrawl outputs converted into source-backed company stack rows.
- Registry and financial verification matrix separating official methods, company-published identifiers and third-party leads.
- Role-level outreach mapping for operations, IT/integration, customs, terminal planning, commercial and management personas.
- Rotterdam transferability rows using Portbase, Port of Rotterdam PCS and Nextlogic evidence.

## Harder Evidence Added

| Area | New evidence | Commercial value |
| --- | --- | --- |
| APZI export | Raw HTML/links inspection confirms Odoo directory, activity filters and profile URLs | Makes the 130-row export more auditable |
| Wappalyzer | CLI checks on ECS, Port of Antwerp-Bruges, CSP, ICO, CLdN and UECC | Separates public website tech from operational stack proof |
| CLdN | Official EDI Engineer and logistics role evidence | Moves CLdN from broad RoRo inference to observed EDI/planning signal |
| ICO | NYK source for automated multilevel finished-vehicle parking | Adds strong automotive yard-automation evidence |
| Registry | NBB method source plus company/third-party leads | Prevents fake verification claims and keeps KBO/NBB work honest |
| Outreach | Role-level mapping by segment and evidence signal | Makes the dataset more useful for sales and research workflows |
| Transferability | Rotterdam PCS/Portbase/Nextlogic comparison | Shows the same method can transfer beyond Zeebrugge |

## Key Caveats

- APZI still does not expose a complete public 160-company export through the captured pages. The repo now contains 130 visible member-directory rows plus raw HTML/links inspection.
- Wappalyzer CLI is conservative: it often detects fewer technologies than the local scanner. The comparison table records this instead of treating Wappalyzer as the only truth.
- KBO/BCE and NBB are represented as verification workflow and partial leads. Direct company filing metadata still needs manual official portal lookup.
- CLdN and ICO have stronger operational evidence now, but named TMS/YMS/VMS vendors are still not verified.

## Best Next Manual Work

1. Use APZI/Voka direct access or a logged-in/member export if available.
2. Run browser-extension Wappalyzer/BuiltWith on the same URLs and compare against `data/manual_webtech_checks.csv`.
3. Use official KBO/BCE and NBB portals manually for the enterprise numbers in `data/registry_financial_verification.csv`.
4. Add Rotterdam companies and sources into the same schema to turn the transferability proof into a second full cluster.
