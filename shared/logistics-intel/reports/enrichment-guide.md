# Enrichment Guide

Snapshot date: 2026-06-02

This guide explains how to extend the Zeebrugge logistics-tech dataset without mixing observed facts, weak signals and commercial assumptions.

## 1. APZI Member Expansion

Current status:

- `scripts/extract_apzi_members.py` captures visible text from the APZI members pages.
- `data/apzi_member_candidates.csv` confirms that the public page exposes category/search text more reliably than a complete company export.
- `data/apzi_board_signals.csv` adds APZI board representation as a segment-level proxy.

Next action:

- Inspect the APZI page in a browser for hidden API calls.
- If no public endpoint exists, request a member export directly from APZI/Voka.
- Add confirmed member rows to a separate `apzi_members.csv` before merging into `companies.csv`.

## 2. Webtech Signals

Current status:

- `scripts/detect_web_tech.py` scans company domains for transparent web signals.
- `data/web_tech_scan.csv` records status, detected signals and errors.

Interpretation:

- Webtech is useful for digital maturity, not for proving operational stack.
- Drupal, WordPress, React or GTM signals describe public websites, not TOS/WMS/TMS systems.
- Use Wappalyzer or BuiltWith as a second pass, then keep the original scan for reproducibility.

## 3. Job Posting Intelligence

Target terms:

- ERP, SAP, Microsoft, Azure, BI, Power BI
- TMS, WMS, TOS, YMS, EDI, API
- customs, declarant, import release, Brexit
- automation, warehouse automation, planning, cybersecurity

Workflow:

- Search official career pages first.
- Use LinkedIn/Indeed/VDAB snippets only as leads unless the full posting is accessible.
- Record company, role title, date seen, tech terms, operational process and source URL.

## 4. Registry, VAT And Financials

Preferred sources:

- KBO/BCE for enterprise numbers, legal names and status.
- NBB Central Balance Sheet Office for filings and financials.
- Company websites for self-published VAT and address details.

Rule:

- Commercial directory snippets can be used as leads, but official registry confirmation should be required before commercial use.

## 5. Contact Role Mapping

Useful roles:

- operations manager
- terminal planner
- IT manager / analyst / developer
- customs manager / declarant
- commercial manager
- customer service / claims / breakbulk desk

Rule:

- Prefer role categories over personal contact data unless the person is already public in an official leadership, board or company-contact context.
