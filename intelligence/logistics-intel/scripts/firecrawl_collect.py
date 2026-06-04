#!/usr/bin/env python3
"""
Run targeted Firecrawl collection from data/firecrawl_targets.csv.

This script intentionally shells out to the Firecrawl CLI so it can reuse stored
CLI credentials or FIRECRAWL_API_KEY. Outputs are written to data/firecrawl/.
"""

from __future__ import annotations

import argparse
import csv
import os
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGETS = ROOT / "data" / "firecrawl_targets.csv"
OUT_DIR = ROOT / "data" / "firecrawl"


def slug(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")[:80] or "target"


def firecrawl_is_available() -> bool:
    return subprocess.run(
        ["firecrawl", "--version"],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    ).returncode == 0


def build_command(row: dict[str, str]) -> list[str]:
    output = OUT_DIR / f"{row['id']}_{slug(row['label'])}.json"
    if row["mode"] == "crawl":
        return [
            "firecrawl",
            "crawl",
            row["url"],
            "--wait",
            "--timeout",
            "180",
            "--limit",
            row["limit"],
            "--max-depth",
            row["max_depth"],
            "--scrape-options",
            '{"formats":["markdown"],"onlyMainContent":true}',
            "--pretty",
            "-o",
            str(output),
        ]
    return [
        "firecrawl",
        "scrape",
        row["url"],
        "--format",
        "markdown",
        "--only-main-content",
        "--json",
        "--pretty",
        "-o",
        str(output),
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Print commands without running Firecrawl.")
    parser.add_argument("--limit", type=int, default=0, help="Run only the first N targets.")
    args = parser.parse_args()

    if not firecrawl_is_available():
        print("Firecrawl CLI is not installed. Install it or run `npx firecrawl ...`.", file=sys.stderr)
        return 1

    if not os.environ.get("FIRECRAWL_API_KEY"):
        print("FIRECRAWL_API_KEY is not set; the CLI may still use stored credentials.")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows = list(csv.DictReader(TARGETS.open(newline="", encoding="utf-8")))
    if args.limit:
        rows = rows[: args.limit]

    failures = 0
    for row in rows:
        command = build_command(row)
        print(" ".join(command))
        if args.dry_run:
            continue
        result = subprocess.run(command, check=False)
        if result.returncode != 0:
            failures += 1

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
