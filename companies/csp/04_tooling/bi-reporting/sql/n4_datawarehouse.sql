-- ================================================================
-- CSP Zeebrugge — N4 Data Warehouse & BI Reporting Queries
-- ================================================================
-- These queries are designed to sit BETWEEN Navis N4's Oracle
-- database and a BI tool (Power BI / Tableau / Qlik).
--
-- N4 stores operational data in its own schema (SPARCSN4).
-- The DWH layer extracts, transforms, and loads into a
-- star schema optimised for reporting — reducing load on N4
-- and giving the BI tool a clean, stable data model.
-- ================================================================


-- ================================================================
-- STAR SCHEMA — Dimension & Fact Tables
-- ================================================================

-- Date dimension (pre-populated for 5 years)
CREATE TABLE dim_date (
    date_key        NUMBER(8)    PRIMARY KEY,  -- YYYYMMDD
    full_date       DATE         NOT NULL,
    year            NUMBER(4),
    quarter         NUMBER(1),
    month           NUMBER(2),
    week_of_year    NUMBER(2),
    day_name        VARCHAR2(10),
    is_weekend      CHAR(1) DEFAULT 'N',
    is_holiday      CHAR(1) DEFAULT 'N'
);

-- Vessel dimension (sourced from N4 VesselVisit entity)
CREATE TABLE dim_vessel (
    vessel_key      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    imo_number      VARCHAR2(10) UNIQUE,
    vessel_name     VARCHAR2(100),
    vessel_type     VARCHAR2(30),   -- ULCV, FEEDER, SHORTSEA
    teu_capacity    NUMBER,
    carrier_code    VARCHAR2(10),   -- MSCU, OOLU, CSNU, HLXU...
    service_code    VARCHAR2(20),   -- Vessel service loop (AEX, EC2...)
    flag_country    CHAR(3)
);

-- Container dimension (sourced from N4 Unit entity)
CREATE TABLE dim_container (
    container_key   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    container_id    VARCHAR2(11) UNIQUE,  -- ISO 6346 e.g. CSNU7402841
    iso_type        VARCHAR2(4),          -- 22G0, 45G0, 22R0...
    size_ft         NUMBER(2),            -- 20 or 40
    container_type  VARCHAR2(10),         -- GP, HC, RF, OT, TK
    teu_factor      NUMBER(3,1),          -- 1.0 or 2.0
    owner_prefix    CHAR(3)               -- First 3 letters
);

-- Fact: container dwell periods in yard
CREATE TABLE fact_dwell (
    dwell_key           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    container_key       NUMBER NOT NULL REFERENCES dim_container,
    vessel_key          NUMBER REFERENCES dim_vessel,
    arrive_date_key     NUMBER(8) REFERENCES dim_date,
    depart_date_key     NUMBER(8) REFERENCES dim_date,
    direction           VARCHAR2(10) CHECK (direction IN ('IMPORT','EXPORT','TRANSSHIP')),
    yard_block          VARCHAR2(5),
    dwell_days          NUMBER(6,2),
    sla_breach          CHAR(1) DEFAULT 'N',
    teu_count           NUMBER(3,1)
);

-- Fact: VBS gate transactions (sourced from Camco VBS + N4 gate)
CREATE TABLE fact_gate_transaction (
    gate_key            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    container_key       NUMBER REFERENCES dim_container,
    transaction_date_key NUMBER(8) REFERENCES dim_date,
    transaction_ts      TIMESTAMP,
    direction           VARCHAR2(10),  -- IN / OUT
    vbs_booking_id      VARCHAR2(30),
    truck_plate         VARCHAR2(15),
    gate_time_seconds   NUMBER(6),
    outcome             VARCHAR2(20),  -- APPROVED / BLOCKED / NO_SHOW
    block_reason        VARCHAR2(100)
);

-- Fact: vessel port calls
CREATE TABLE fact_vessel_call (
    call_key            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vessel_key          NUMBER NOT NULL REFERENCES dim_vessel,
    arrive_date_key     NUMBER(8) REFERENCES dim_date,
    depart_date_key     NUMBER(8) REFERENCES dim_date,
    arrive_ts           TIMESTAMP,
    depart_ts           TIMESTAMP,
    berth_number        VARCHAR2(10),
    turnaround_hours    NUMBER(8,2),
    teu_discharged      NUMBER,
    teu_loaded          NUMBER,
    crane_moves         NUMBER
);


-- ================================================================
-- KPI QUERIES — Power BI / Tableau data sources
-- ================================================================

-- 1. Weekly TEU throughput (import vs export) — main KPI chart
SELECT
    d.year,
    d.week_of_year,
    TO_CHAR(MIN(d.full_date), 'DD-Mon') AS week_start,
    SUM(CASE WHEN f.direction = 'IMPORT'    THEN f.teu_count ELSE 0 END) AS import_teu,
    SUM(CASE WHEN f.direction = 'EXPORT'    THEN f.teu_count ELSE 0 END) AS export_teu,
    SUM(CASE WHEN f.direction = 'TRANSSHIP' THEN f.teu_count ELSE 0 END) AS transship_teu,
    SUM(f.teu_count) AS total_teu
FROM fact_dwell f
JOIN dim_date d ON d.date_key = f.arrive_date_key
WHERE d.year = EXTRACT(YEAR FROM SYSDATE)
GROUP BY d.year, d.week_of_year
ORDER BY d.week_of_year;


-- 2. Dwell time SLA performance by direction & week
SELECT
    d.week_of_year,
    f.direction,
    COUNT(*) AS total_containers,
    ROUND(AVG(f.dwell_days), 1) AS avg_dwell,
    ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY f.dwell_days), 1) AS p90_dwell,
    SUM(CASE WHEN f.sla_breach = 'Y' THEN 1 ELSE 0 END) AS sla_breaches,
    ROUND(SUM(CASE WHEN f.sla_breach = 'Y' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) AS breach_pct
FROM fact_dwell f
JOIN dim_date d ON d.date_key = f.arrive_date_key
WHERE d.year = EXTRACT(YEAR FROM SYSDATE)
GROUP BY d.week_of_year, f.direction
ORDER BY d.week_of_year, f.direction;


-- 3. Vessel turnaround KPI by carrier — SLA = 20 hours
SELECT
    v.carrier_code,
    v.service_code,
    COUNT(*) AS port_calls,
    ROUND(AVG(c.turnaround_hours), 1) AS avg_turnaround_hrs,
    ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY c.turnaround_hours), 1) AS p90_hrs,
    SUM(CASE WHEN c.turnaround_hours > 20 THEN 1 ELSE 0 END) AS sla_misses,
    ROUND(AVG(c.teu_discharged + c.teu_loaded), 0) AS avg_moves
FROM fact_vessel_call c
JOIN dim_vessel v ON v.vessel_key = c.vessel_key
JOIN dim_date d ON d.date_key = c.arrive_date_key
WHERE d.full_date >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -3)
GROUP BY v.carrier_code, v.service_code
ORDER BY avg_turnaround_hrs;


-- 4. Gate automation rate & peak hours (VBS KPI)
SELECT
    TO_CHAR(g.transaction_ts, 'HH24') AS hour_of_day,
    COUNT(*) AS total_transactions,
    SUM(CASE WHEN g.outcome = 'APPROVED' THEN 1 ELSE 0 END) AS approved,
    SUM(CASE WHEN g.outcome = 'BLOCKED'  THEN 1 ELSE 0 END) AS blocked,
    SUM(CASE WHEN g.outcome = 'NO_SHOW'  THEN 1 ELSE 0 END) AS no_shows,
    ROUND(AVG(g.gate_time_seconds), 0) AS avg_gate_seconds,
    ROUND(SUM(CASE WHEN g.outcome = 'APPROVED' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) AS approval_rate_pct
FROM fact_gate_transaction g
JOIN dim_date d ON d.date_key = g.transaction_date_key
WHERE d.full_date >= TRUNC(SYSDATE) - 30  -- last 30 days
GROUP BY TO_CHAR(g.transaction_ts, 'HH24')
ORDER BY hour_of_day;


-- 5. Current dwell alerts — live operations table (refreshes every 15 min in BI)
SELECT
    c.container_id,
    c.iso_type,
    f.yard_block,
    d.full_date AS arrival_date,
    f.dwell_days,
    CASE
        WHEN f.dwell_days > 7 THEN 'CRITICAL'
        WHEN f.dwell_days > 5 THEN 'WARNING'
        ELSE 'MONITOR'
    END AS alert_level,
    f.direction
FROM fact_dwell f
JOIN dim_container c ON c.container_key = f.container_key
JOIN dim_date d ON d.date_key = f.arrive_date_key
WHERE f.depart_date_key IS NULL   -- still in yard
  AND f.dwell_days > 4
ORDER BY f.dwell_days DESC;
