# Process Analysis: Container Release Workflow

## Context

This document demonstrates an **AS-IS → TO-BE process analysis** of the manual container release workflow at a container terminal — the kind of improvement analysis an IT Analyst–Developer performs when translating business needs into technical solutions.

---

## AS-IS: Current manual process

**Problem statement:** Operations staff manually cross-check container release authorisations between three systems (TOS, customs EDI, shipping line portal) before allowing trucks to collect containers. This takes 8–15 minutes per container and causes gate queues during peak hours.

```
Truck arrives at gate
        │
        ▼
Gate operator looks up container in TOS
        │
        ▼
Manually checks customs clearance in separate portal  ← 4 min avg
        │
        ▼
Phones shipping agent to verify release order  ← 5 min avg, error-prone
        │
        ▼
Manually enters truck plate + container in gate system  ← 2 min
        │
        ▼
Gate opens
```

**Pain points (gathered via stakeholder interviews):**
- Average gate transaction time: **11 minutes** (target: 3 minutes)
- Error rate on manual data entry: ~2.3% → causes container misdirections
- Phone calls to shipping agents: ~180/day → agent workload + delays
- No real-time visibility for operations management

---

## TO-BE: Automated release validation

**Proposed solution:** Integrate the three data sources into a single automated validation service that runs at gate entry. The Groovy transformer (`GateTransactionTransformer.groovy`) handles the data normalisation layer.

```
Truck arrives at gate → licence plate read by OCR camera
        │
        ▼
Automated lookup: truck plate → expected container (TOS API)
        │
        ├── Container found → check release status (parallel calls)
        │       ├── Customs clearance API  ← ~0.3s
        │       └── Shipping line EDI feed  ← ~0.5s
        │
        ▼
All checks pass?
  YES → Gate opens automatically  ← 25 seconds total
  NO  → Alert sent to supervisor dashboard with reason code
```

**Expected outcomes:**

| KPI | AS-IS | TO-BE | Improvement |
|-----|-------|-------|-------------|
| Avg gate transaction time | 11 min | 25 sec | **−96%** |
| Manual data entry errors | 2.3% | ~0% | **−100%** |
| Agent phone calls/day | 180 | < 10 | **−94%** |
| Gate queue length (peak) | 12 trucks | 2–3 trucks | **−75%** |

---

## Requirements (user stories)

**As a** gate operator,  
**I want** the system to automatically verify release status,  
**so that** I don't need to make phone calls or switch between systems.

**As an** operations manager,  
**I want** a real-time dashboard showing gate transaction throughput,  
**so that** I can identify bottlenecks before they cause queue build-up.

**As a** shipping agent,  
**I want** to submit release orders via an API or web form,  
**so that** my clients' containers are released without manual intervention.

---

## Data model impact

Three new fields added to `fact_container_dwell`:

```sql
release_auth_source   VARCHAR2(20),  -- 'CUSTOMS_EDI' | 'MANUAL' | 'SHIPPING_API'
release_timestamp     TIMESTAMP,
gate_transaction_sec  NUMBER(6)      -- actual transaction duration in seconds
```

These enable the BI dashboard to track automation adoption rate and flag containers still relying on the manual fallback path.

---

## Implementation notes

- **Phase 1** (4 weeks): Deploy Groovy validation service + connect customs EDI feed
- **Phase 2** (3 weeks): Shipping line API integration (top 5 carriers cover 80% of volume)
- **Phase 3** (2 weeks): Dashboard reporting + supervisor alert system
- **Fallback:** Manual override always available; all overrides logged with reason code for audit trail

---

*This analysis was produced as part of the Port Container Tracker portfolio project.*
