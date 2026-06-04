#!/usr/bin/env python3
"""
Validate the seed dataset and source register.

The checks stay dependency-free so they can run in CI or on a clean machine.
"""

from __future__ import annotations

import csv
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
COMPANIES = ROOT / "data" / "companies.csv"
SOURCES = ROOT / "data" / "sources.csv"
SCRAPED = ROOT / "data" / "scraped"
STACK_TAXONOMY = ROOT / "data" / "stack_taxonomy.csv"
OPPORTUNITIES = ROOT / "data" / "opportunities.csv"
COMPANY_ENRICHMENT = ROOT / "data" / "company_enrichment.csv"
APZI_BOARD_SIGNALS = ROOT / "data" / "apzi_board_signals.csv"
RESEARCH_BACKLOG = ROOT / "data" / "research_backlog.csv"
APZI_MEMBER_CANDIDATES = ROOT / "data" / "apzi_member_candidates.csv"
APZI_MEMBERS_EXPORT = ROOT / "data" / "apzi_members_export.csv"
WEB_TECH_SCAN = ROOT / "data" / "web_tech_scan.csv"
COMPANY_STACK_SIGNALS = ROOT / "data" / "company_stack_signals.csv"
FIRECRAWL_TARGETS = ROOT / "data" / "firecrawl_targets.csv"
FIRECRAWL_EVIDENCE = ROOT / "data" / "firecrawl_evidence.csv"
FIRECRAWL_OUTPUTS = ROOT / "data" / "firecrawl_outputs.csv"
TECH_STACK_VENDOR_RESEARCH = ROOT / "data" / "tech_stack_vendor_research.csv"
VENDOR_EVIDENCE_BY_COMPANY = ROOT / "data" / "vendor_evidence_by_company.csv"
MANUAL_WEBTECH_CHECKS = ROOT / "data" / "manual_webtech_checks.csv"
JOB_POSTING_EVIDENCE = ROOT / "data" / "job_posting_evidence.csv"
REGISTRY_FINANCIAL_VERIFICATION = ROOT / "data" / "registry_financial_verification.csv"
ROLE_LEVEL_OUTREACH_MAP = ROOT / "data" / "role_level_outreach_map.csv"
TRANSFERABILITY_CLUSTERS = ROOT / "data" / "transferability_clusters.csv"

COMPANY_FIELDS = {
    "company",
    "category",
    "location_signal",
    "services",
    "tech_stack_public_signal",
    "tech_stack_assessment",
    "confidence",
    "sources",
}

SOURCE_FIELDS = {"id", "title", "url", "source_type", "notes"}
STACK_FIELDS = {"layer", "systems", "where_it_shows_up", "why_it_matters", "evidence_level"}
OPPORTUNITY_FIELDS = {
    "opportunity",
    "buyer_segments",
    "pain_signal",
    "product_angle",
    "go_to_market_notes",
    "priority",
}
ENRICHMENT_FIELDS = {
    "company",
    "domain",
    "web_tech_signal",
    "job_signal",
    "registry_or_vat_signal",
    "financial_signal",
    "contact_roles_signal",
    "enrichment_status",
    "sources",
}
APZI_BOARD_FIELDS = {"segment", "person", "organization", "role_signal", "tech_relevance", "sources"}
BACKLOG_FIELDS = {"workstream", "task", "why_it_matters", "method", "status"}
APZI_MEMBER_FIELDS = {"source_url", "candidate_text", "matched_terms", "status"}
APZI_MEMBERS_EXPORT_FIELDS = {
    "member_name",
    "profile_url",
    "activity_tags",
    "directory_page",
    "source_file",
    "extraction_status",
}
WEB_TECH_FIELDS = {"company", "domain", "status", "signals", "error"}
COMPANY_STACK_FIELDS = {
    "company",
    "segment",
    "observed_stack_tags",
    "inferred_stack_tags",
    "visible_web_tags",
    "job_or_hiring_signal",
    "confidence",
    "source_ids",
}
FIRECRAWL_TARGET_FIELDS = {
    "id",
    "label",
    "url",
    "mode",
    "scope",
    "limit",
    "max_depth",
    "why_it_matters",
    "source_ids",
}
FIRECRAWL_EVIDENCE_FIELDS = {
    "id",
    "firecrawl_action",
    "query_or_target",
    "result_url",
    "evidence_summary",
    "commercial_signal",
    "source_ids",
    "status",
}
FIRECRAWL_OUTPUT_FIELDS = {
    "output_file",
    "target_or_scope",
    "source_url",
    "format",
    "collection_status",
    "source_ids",
    "notes",
}
TECH_STACK_VENDOR_FIELDS = {
    "stack_family",
    "vendor_or_product",
    "companies_or_segments",
    "evidence_status",
    "why_it_matters",
    "source_ids",
}
VENDOR_EVIDENCE_BY_COMPANY_FIELDS = {
    "company",
    "target_area",
    "observed_products_or_platforms",
    "evidence_summary",
    "confidence",
    "source_ids",
    "next_research_action",
}
MANUAL_WEBTECH_CHECK_FIELDS = {
    "company",
    "domain",
    "local_scan_signals",
    "external_check_method",
    "external_check_result",
    "comparison",
    "confidence",
    "source_ids",
    "next_action",
}
JOB_POSTING_EVIDENCE_FIELDS = {
    "company",
    "role_or_signal",
    "source_url",
    "observed_terms",
    "stack_family",
    "evidence_summary",
    "confidence",
    "source_ids",
    "next_action",
}
REGISTRY_FINANCIAL_FIELDS = {
    "company",
    "identifier_or_lead",
    "official_source_checked",
    "official_result",
    "third_party_or_company_lead",
    "verification_status",
    "confidence",
    "source_ids",
    "next_action",
}
ROLE_LEVEL_OUTREACH_FIELDS = {
    "segment",
    "target_role",
    "companies",
    "why_this_role_matters",
    "relevant_signals",
    "source_ids",
    "outreach_angle",
}
TRANSFERABILITY_CLUSTER_FIELDS = {
    "cluster",
    "scope",
    "analogous_stack_layer",
    "source_backed_signals",
    "why_it_proves_transferability",
    "confidence",
    "source_ids",
    "next_research_action",
}
CONFIDENCE_VALUES = {"high", "medium", "low"}
PRIORITY_VALUES = {"high", "medium", "low"}
FIRECRAWL_MODES = {"scrape", "crawl"}
FIRECRAWL_STATUSES = {"successful", "attempted", "planned"}
VENDOR_EVIDENCE_STATUSES = {"observed_public", "mixed", "inferred_vendor_family", "category_reference", "research_target"}


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            raise ValueError(f"{path} has no header row")
        return list(reader)


def fail(message: str, failures: list[str]) -> None:
    failures.append(message)


def main() -> int:
    failures: list[str] = []

    companies = read_csv(COMPANIES)
    sources = read_csv(SOURCES)
    stack_layers = read_csv(STACK_TAXONOMY)
    opportunities = read_csv(OPPORTUNITIES)
    enrichment = read_csv(COMPANY_ENRICHMENT)
    apzi_board = read_csv(APZI_BOARD_SIGNALS)
    backlog = read_csv(RESEARCH_BACKLOG)
    apzi_member_candidates = read_csv(APZI_MEMBER_CANDIDATES)
    apzi_members_export = read_csv(APZI_MEMBERS_EXPORT)
    web_tech_scan = read_csv(WEB_TECH_SCAN)
    company_stack_signals = read_csv(COMPANY_STACK_SIGNALS)
    firecrawl_targets = read_csv(FIRECRAWL_TARGETS)
    firecrawl_evidence = read_csv(FIRECRAWL_EVIDENCE)
    firecrawl_outputs = read_csv(FIRECRAWL_OUTPUTS)
    tech_stack_vendor_research = read_csv(TECH_STACK_VENDOR_RESEARCH)
    vendor_evidence_by_company = read_csv(VENDOR_EVIDENCE_BY_COMPANY)
    manual_webtech_checks = read_csv(MANUAL_WEBTECH_CHECKS)
    job_posting_evidence = read_csv(JOB_POSTING_EVIDENCE)
    registry_financial_verification = read_csv(REGISTRY_FINANCIAL_VERIFICATION)
    role_level_outreach_map = read_csv(ROLE_LEVEL_OUTREACH_MAP)
    transferability_clusters = read_csv(TRANSFERABILITY_CLUSTERS)

    company_fields = set(companies[0].keys()) if companies else set()
    source_fields = set(sources[0].keys()) if sources else set()
    stack_fields = set(stack_layers[0].keys()) if stack_layers else set()
    opportunity_fields = set(opportunities[0].keys()) if opportunities else set()
    enrichment_fields = set(enrichment[0].keys()) if enrichment else set()
    apzi_board_fields = set(apzi_board[0].keys()) if apzi_board else set()
    backlog_fields = set(backlog[0].keys()) if backlog else set()
    apzi_member_fields = set(apzi_member_candidates[0].keys()) if apzi_member_candidates else set()
    apzi_members_export_fields = set(apzi_members_export[0].keys()) if apzi_members_export else set()
    web_tech_fields = set(web_tech_scan[0].keys()) if web_tech_scan else set()
    company_stack_fields = set(company_stack_signals[0].keys()) if company_stack_signals else set()
    firecrawl_target_fields = set(firecrawl_targets[0].keys()) if firecrawl_targets else set()
    firecrawl_evidence_fields = set(firecrawl_evidence[0].keys()) if firecrawl_evidence else set()
    firecrawl_output_fields = set(firecrawl_outputs[0].keys()) if firecrawl_outputs else set()
    tech_stack_vendor_fields = set(tech_stack_vendor_research[0].keys()) if tech_stack_vendor_research else set()
    vendor_evidence_by_company_fields = (
        set(vendor_evidence_by_company[0].keys()) if vendor_evidence_by_company else set()
    )
    manual_webtech_check_fields = set(manual_webtech_checks[0].keys()) if manual_webtech_checks else set()
    job_posting_evidence_fields = set(job_posting_evidence[0].keys()) if job_posting_evidence else set()
    registry_financial_fields = (
        set(registry_financial_verification[0].keys()) if registry_financial_verification else set()
    )
    role_level_outreach_fields = set(role_level_outreach_map[0].keys()) if role_level_outreach_map else set()
    transferability_cluster_fields = (
        set(transferability_clusters[0].keys()) if transferability_clusters else set()
    )

    if company_fields != COMPANY_FIELDS:
        fail(f"companies.csv fields mismatch: {sorted(company_fields)}", failures)
    if source_fields != SOURCE_FIELDS:
        fail(f"sources.csv fields mismatch: {sorted(source_fields)}", failures)
    if stack_fields != STACK_FIELDS:
        fail(f"stack_taxonomy.csv fields mismatch: {sorted(stack_fields)}", failures)
    if opportunity_fields != OPPORTUNITY_FIELDS:
        fail(f"opportunities.csv fields mismatch: {sorted(opportunity_fields)}", failures)
    if enrichment_fields != ENRICHMENT_FIELDS:
        fail(f"company_enrichment.csv fields mismatch: {sorted(enrichment_fields)}", failures)
    if apzi_board_fields != APZI_BOARD_FIELDS:
        fail(f"apzi_board_signals.csv fields mismatch: {sorted(apzi_board_fields)}", failures)
    if backlog_fields != BACKLOG_FIELDS:
        fail(f"research_backlog.csv fields mismatch: {sorted(backlog_fields)}", failures)
    if apzi_member_fields != APZI_MEMBER_FIELDS:
        fail(f"apzi_member_candidates.csv fields mismatch: {sorted(apzi_member_fields)}", failures)
    if apzi_members_export_fields != APZI_MEMBERS_EXPORT_FIELDS:
        fail(f"apzi_members_export.csv fields mismatch: {sorted(apzi_members_export_fields)}", failures)
    if web_tech_fields != WEB_TECH_FIELDS:
        fail(f"web_tech_scan.csv fields mismatch: {sorted(web_tech_fields)}", failures)
    if company_stack_fields != COMPANY_STACK_FIELDS:
        fail(f"company_stack_signals.csv fields mismatch: {sorted(company_stack_fields)}", failures)
    if firecrawl_target_fields != FIRECRAWL_TARGET_FIELDS:
        fail(f"firecrawl_targets.csv fields mismatch: {sorted(firecrawl_target_fields)}", failures)
    if firecrawl_evidence_fields != FIRECRAWL_EVIDENCE_FIELDS:
        fail(f"firecrawl_evidence.csv fields mismatch: {sorted(firecrawl_evidence_fields)}", failures)
    if firecrawl_output_fields != FIRECRAWL_OUTPUT_FIELDS:
        fail(f"firecrawl_outputs.csv fields mismatch: {sorted(firecrawl_output_fields)}", failures)
    if tech_stack_vendor_fields != TECH_STACK_VENDOR_FIELDS:
        fail(f"tech_stack_vendor_research.csv fields mismatch: {sorted(tech_stack_vendor_fields)}", failures)
    if vendor_evidence_by_company_fields != VENDOR_EVIDENCE_BY_COMPANY_FIELDS:
        fail(
            "vendor_evidence_by_company.csv fields mismatch: "
            f"{sorted(vendor_evidence_by_company_fields)}",
            failures,
        )
    if manual_webtech_check_fields != MANUAL_WEBTECH_CHECK_FIELDS:
        fail(f"manual_webtech_checks.csv fields mismatch: {sorted(manual_webtech_check_fields)}", failures)
    if job_posting_evidence_fields != JOB_POSTING_EVIDENCE_FIELDS:
        fail(f"job_posting_evidence.csv fields mismatch: {sorted(job_posting_evidence_fields)}", failures)
    if registry_financial_fields != REGISTRY_FINANCIAL_FIELDS:
        fail(
            "registry_financial_verification.csv fields mismatch: "
            f"{sorted(registry_financial_fields)}",
            failures,
        )
    if role_level_outreach_fields != ROLE_LEVEL_OUTREACH_FIELDS:
        fail(f"role_level_outreach_map.csv fields mismatch: {sorted(role_level_outreach_fields)}", failures)
    if transferability_cluster_fields != TRANSFERABILITY_CLUSTER_FIELDS:
        fail(
            "transferability_clusters.csv fields mismatch: "
            f"{sorted(transferability_cluster_fields)}",
            failures,
        )

    source_ids = {row["id"] for row in sources}
    if len(source_ids) != len(sources):
        fail("sources.csv contains duplicate source ids", failures)

    company_names = [row["company"] for row in companies]
    if len(set(company_names)) != len(company_names):
        fail("companies.csv contains duplicate company names", failures)

    stack_layer_names = [row["layer"] for row in stack_layers]
    if len(set(stack_layer_names)) != len(stack_layer_names):
        fail("stack_taxonomy.csv contains duplicate layer names", failures)

    opportunity_names = [row["opportunity"] for row in opportunities]
    if len(set(opportunity_names)) != len(opportunity_names):
        fail("opportunities.csv contains duplicate opportunity names", failures)

    for row in companies:
        name = row["company"]
        if row["confidence"] not in CONFIDENCE_VALUES:
            fail(f"{name}: invalid confidence '{row['confidence']}'", failures)

        refs = [ref.strip() for ref in row["sources"].split(";") if ref.strip()]
        if not refs:
            fail(f"{name}: no source references", failures)
        for ref in refs:
            if ref not in source_ids:
                fail(f"{name}: unknown source reference '{ref}'", failures)

    for row in opportunities:
        if row["priority"] not in PRIORITY_VALUES:
            fail(
                f"{row['opportunity']}: invalid priority '{row['priority']}'",
                failures,
            )

    company_set = set(company_names)
    for row in enrichment:
        if row["company"] not in company_set:
            fail(f"company_enrichment.csv contains unknown company '{row['company']}'", failures)
        refs = [ref.strip() for ref in row["sources"].split(";") if ref.strip()]
        for ref in refs:
            if ref not in source_ids:
                fail(f"{row['company']} enrichment: unknown source reference '{ref}'", failures)

    for row in apzi_board:
        refs = [ref.strip() for ref in row["sources"].split(";") if ref.strip()]
        for ref in refs:
            if ref not in source_ids:
                fail(f"{row['organization']} APZI signal: unknown source reference '{ref}'", failures)

    apzi_profile_urls = [row["profile_url"] for row in apzi_members_export]
    if len(set(apzi_profile_urls)) != len(apzi_profile_urls):
        fail("apzi_members_export.csv contains duplicate profile URLs", failures)
    if len(apzi_members_export) < 100:
        fail("apzi_members_export.csv has fewer than 100 member rows", failures)
    for row in apzi_members_export:
        if not row["profile_url"].startswith("https://www.apzi.be/en/leden/"):
            fail(f"{row['member_name']}: invalid APZI profile URL", failures)
        if not row["directory_page"].isdigit():
            fail(f"{row['member_name']}: directory_page is not numeric", failures)

    for row in web_tech_scan:
        if row["company"] not in company_set:
            fail(f"web_tech_scan.csv contains unknown company '{row['company']}'", failures)

    stack_signal_companies = [row["company"] for row in company_stack_signals]
    if len(set(stack_signal_companies)) != len(stack_signal_companies):
        fail("company_stack_signals.csv contains duplicate company names", failures)
    missing_stack_signal_companies = sorted(company_set - set(stack_signal_companies))
    if missing_stack_signal_companies:
        fail(
            "company_stack_signals.csv missing companies: "
            f"{', '.join(missing_stack_signal_companies)}",
            failures,
        )
    for row in company_stack_signals:
        if row["company"] not in company_set:
            fail(f"company_stack_signals.csv contains unknown company '{row['company']}'", failures)
        if row["confidence"] not in CONFIDENCE_VALUES:
            fail(
                f"{row['company']} stack signal: invalid confidence '{row['confidence']}'",
                failures,
            )
        refs = [ref.strip() for ref in row["source_ids"].split(";") if ref.strip()]
        if not refs:
            fail(f"{row['company']} stack signal: no source references", failures)
        for ref in refs:
            if ref not in source_ids:
                fail(f"{row['company']} stack signal: unknown source reference '{ref}'", failures)

    firecrawl_target_ids = [row["id"] for row in firecrawl_targets]
    if len(set(firecrawl_target_ids)) != len(firecrawl_target_ids):
        fail("firecrawl_targets.csv contains duplicate ids", failures)
    for row in firecrawl_targets:
        if row["mode"] not in FIRECRAWL_MODES:
            fail(f"{row['id']}: invalid Firecrawl mode '{row['mode']}'", failures)
        for field in ("limit", "max_depth"):
            if not row[field].isdigit():
                fail(f"{row['id']}: {field} is not numeric", failures)
        refs = [ref.strip() for ref in row["source_ids"].split(";") if ref.strip()]
        for ref in refs:
            if ref not in source_ids:
                fail(f"{row['id']} Firecrawl target: unknown source reference '{ref}'", failures)

    firecrawl_evidence_ids = [row["id"] for row in firecrawl_evidence]
    if len(set(firecrawl_evidence_ids)) != len(firecrawl_evidence_ids):
        fail("firecrawl_evidence.csv contains duplicate ids", failures)
    for row in firecrawl_evidence:
        if row["status"] not in FIRECRAWL_STATUSES:
            fail(f"{row['id']}: invalid Firecrawl evidence status '{row['status']}'", failures)
        refs = [ref.strip() for ref in row["source_ids"].split(";") if ref.strip()]
        for ref in refs:
            if ref not in source_ids:
                fail(f"{row['id']} Firecrawl evidence: unknown source reference '{ref}'", failures)

    firecrawl_output_files = [row["output_file"] for row in firecrawl_outputs]
    if len(set(firecrawl_output_files)) != len(firecrawl_output_files):
        fail("firecrawl_outputs.csv contains duplicate output files", failures)
    for row in firecrawl_outputs:
        output_path = ROOT / row["output_file"]
        if not output_path.exists():
            fail(f"{row['output_file']}: Firecrawl output file is missing", failures)
        refs = [ref.strip() for ref in row["source_ids"].split(";") if ref.strip()]
        for ref in refs:
            if ref not in source_ids:
                fail(f"{row['output_file']} Firecrawl output: unknown source reference '{ref}'", failures)

    vendor_keys = [
        (row["stack_family"], row["vendor_or_product"])
        for row in tech_stack_vendor_research
    ]
    if len(set(vendor_keys)) != len(vendor_keys):
        fail("tech_stack_vendor_research.csv contains duplicate stack/vendor rows", failures)
    for row in tech_stack_vendor_research:
        if row["evidence_status"] not in VENDOR_EVIDENCE_STATUSES:
            fail(
                f"{row['stack_family']} / {row['vendor_or_product']}: "
                f"invalid evidence status '{row['evidence_status']}'",
                failures,
            )
        refs = [ref.strip() for ref in row["source_ids"].split(";") if ref.strip()]
        if not refs:
            fail(f"{row['vendor_or_product']}: no vendor research source references", failures)
        for ref in refs:
            if ref not in source_ids:
                fail(f"{row['vendor_or_product']} vendor research: unknown source reference '{ref}'", failures)

    for row in vendor_evidence_by_company:
        if row["company"] not in company_set:
            fail(f"vendor_evidence_by_company.csv contains unknown company '{row['company']}'", failures)
        if row["confidence"] not in CONFIDENCE_VALUES:
            fail(f"{row['company']} vendor evidence: invalid confidence '{row['confidence']}'", failures)
        refs = [ref.strip() for ref in row["source_ids"].split(";") if ref.strip()]
        if not refs:
            fail(f"{row['company']} vendor evidence: no source references", failures)
        for ref in refs:
            if ref not in source_ids:
                fail(f"{row['company']} vendor evidence: unknown source reference '{ref}'", failures)

    externally_checked_companies = [
        row["company"] for row in manual_webtech_checks if row["company"] in company_set
    ]
    if len(set(externally_checked_companies)) != len(externally_checked_companies):
        fail("manual_webtech_checks.csv contains duplicate in-scope company rows", failures)
    for row in manual_webtech_checks:
        if row["company"] in company_set and row["confidence"] not in CONFIDENCE_VALUES:
            fail(f"{row['company']} manual webtech: invalid confidence '{row['confidence']}'", failures)
        refs = [ref.strip() for ref in row["source_ids"].split(";") if ref.strip()]
        for ref in refs:
            if ref not in source_ids:
                fail(f"{row['company']} manual webtech: unknown source reference '{ref}'", failures)

    for row in job_posting_evidence:
        if row["company"] not in company_set:
            fail(f"job_posting_evidence.csv contains unknown company '{row['company']}'", failures)
        if row["confidence"] not in CONFIDENCE_VALUES:
            fail(f"{row['company']} job evidence: invalid confidence '{row['confidence']}'", failures)
        refs = [ref.strip() for ref in row["source_ids"].split(";") if ref.strip()]
        if not refs:
            fail(f"{row['company']} job evidence: no source references", failures)
        for ref in refs:
            if ref not in source_ids:
                fail(f"{row['company']} job evidence: unknown source reference '{ref}'", failures)

    for row in registry_financial_verification:
        if row["company"] not in company_set and row["company"] != "NBB Central Balance Sheet Office":
            fail(f"registry_financial_verification.csv contains unknown company '{row['company']}'", failures)
        if row["confidence"] not in CONFIDENCE_VALUES:
            fail(f"{row['company']} registry verification: invalid confidence '{row['confidence']}'", failures)
        refs = [ref.strip() for ref in row["source_ids"].split(";") if ref.strip()]
        if not refs:
            fail(f"{row['company']} registry verification: no source references", failures)
        for ref in refs:
            if ref not in source_ids:
                fail(f"{row['company']} registry verification: unknown source reference '{ref}'", failures)

    for row in role_level_outreach_map:
        refs = [ref.strip() for ref in row["source_ids"].split(";") if ref.strip()]
        if not refs:
            fail(f"{row['target_role']} outreach row: no source references", failures)
        for ref in refs:
            if ref not in source_ids:
                fail(f"{row['target_role']} outreach row: unknown source reference '{ref}'", failures)

    for row in transferability_clusters:
        if row["confidence"] not in CONFIDENCE_VALUES:
            fail(f"{row['cluster']} transferability row: invalid confidence '{row['confidence']}'", failures)
        refs = [ref.strip() for ref in row["source_ids"].split(";") if ref.strip()]
        if not refs:
            fail(f"{row['cluster']} transferability row: no source references", failures)
        for ref in refs:
            if ref not in source_ids:
                fail(f"{row['cluster']} transferability row: unknown source reference '{ref}'", failures)

    scraped_files = list(SCRAPED.glob("S*.txt"))
    scraped_ids = {path.name.split("_", 1)[0] for path in scraped_files}
    missing_extracts = sorted(source_ids - scraped_ids)
    if missing_extracts:
        fail(f"missing scraped extracts for: {', '.join(missing_extracts)}", failures)

    if failures:
        print("Dataset validation failed:")
        for item in failures:
            print(f"- {item}")
        return 1

    print(
        "Dataset validation passed: "
        f"{len(companies)} companies, {len(sources)} sources, "
        f"{len(stack_layers)} stack layers, {len(opportunities)} opportunities, "
        f"{len(enrichment)} enrichment rows, {len(apzi_board)} APZI board signals, "
        f"{len(apzi_member_candidates)} APZI page candidates, "
        f"{len(apzi_members_export)} APZI member export rows, "
        f"{len(web_tech_scan)} web tech rows, "
        f"{len(company_stack_signals)} company stack rows, "
        f"{len(firecrawl_targets)} Firecrawl targets, {len(firecrawl_evidence)} Firecrawl evidence rows, "
        f"{len(firecrawl_outputs)} Firecrawl output files, "
        f"{len(tech_stack_vendor_research)} vendor stack rows, "
        f"{len(vendor_evidence_by_company)} company vendor-proof rows, "
        f"{len(manual_webtech_checks)} manual webtech checks, "
        f"{len(job_posting_evidence)} job evidence rows, "
        f"{len(registry_financial_verification)} registry/financial verification rows, "
        f"{len(role_level_outreach_map)} outreach role rows, "
        f"{len(transferability_clusters)} transferability rows, "
        f"{len(scraped_files)} scraped extracts."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
