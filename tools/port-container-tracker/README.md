# 🚢 Port Container Tracker

A full-stack terminal operations dashboard for monitoring container movements, vessel calls, and yard performance at a container terminal.

Built around the operational reality of a modern container port: real-time KPI tracking, automated dwell time alerts, gate transaction processing, and BI-ready reporting — all connected to a star schema data warehouse.

---

## What it does

### Live KPI Dashboard
Browser-based dashboard showing TEU throughput, vessel turnaround time, yard block occupancy, and gate transaction volume. Updates live and flags anomalies automatically.

### Container Dwell Time Analysis
Python script that scans the yard for containers exceeding their target dwell time, ranks them by severity, and generates a daily CSV + chart report for the operations team.

### Gate Transaction Processor
Groovy transformer that validates and normalises incoming truck gate messages (ISO 6346 container IDs, EDI format) before they enter the terminal operating system.

### Data Warehouse & BI Queries
Oracle SQL star schema designed for operational reporting. Includes KPI queries for throughput, turnaround, and occupancy — ready to connect to Power BI or Tableau.

### Process Analysis
End-to-end AS-IS → TO-BE analysis of the container release workflow, with user stories, data model changes, and a phased implementation plan.

---

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript, Chart.js |
| Backend | Java 17, Spring Boot |
| Data transformation | Groovy |
| Data analysis & reporting | Python 3.11, pandas, matplotlib |
| Database | Oracle SQL (star schema) |
| CI | GitHub Actions |

---

## Project structure

```
port-container-tracker/
├── frontend/                   # KPI dashboard (HTML + JS + CSS)
├── backend/
│   ├── ContainerService.java   # Core business logic
│   └── GateTransactionTransformer.groovy
├── data-analysis/
│   └── dwell_time_analysis.py  # Automated dwell time reporting
├── sql/
│   └── schema_and_kpis.sql     # Star schema + analytical queries
└── docs/
    └── process-analysis.md     # AS-IS / TO-BE process analysis
```

---

## Getting started

**Frontend** — open directly in browser:
```bash
open frontend/index.html
```

**Python analysis:**
```bash
pip install pandas matplotlib
python data-analysis/dwell_time_analysis.py
```

**Backend:**
```bash
# Java 17 + Maven required
mvn spring-boot:run
```

---

## Contact

Philippe Godfroy — [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
