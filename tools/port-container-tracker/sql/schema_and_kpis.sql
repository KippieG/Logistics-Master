-- ============================================================
-- PORT CONTAINER TRACKER — Data Warehouse Schema (Oracle SQL)
-- Star schema design for terminal operations BI reporting
-- ============================================================

-- ============================================================
-- DIMENSION TABLES
-- ============================================================

CREATE TABLE dim_date (
    date_key        NUMBER(8)    PRIMARY KEY,   -- YYYYMMDD
    full_date       DATE         NOT NULL,
    year            NUMBER(4),
    quarter         NUMBER(1),
    month           NUMBER(2),
    month_name      VARCHAR2(10),
    week_of_year    NUMBER(2),
    day_of_week     NUMBER(1),
    is_weekend      CHAR(1)      DEFAULT 'N'
);

CREATE TABLE dim_vessel (
    vessel_key      NUMBER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    imo_number      VARCHAR2(10) NOT NULL UNIQUE,
    vessel_name     VARCHAR2(100),
    vessel_type     VARCHAR2(50),   -- ULCV, FEEDER, etc.
    teu_capacity    NUMBER,
    carrier_code    VARCHAR2(10),   -- MSCU, OOLU, CSNU, etc.
    flag_country    VARCHAR2(3),
    created_date    DATE         DEFAULT SYSDATE
);

CREATE TABLE dim_container (
    container_key   NUMBER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    container_id    VARCHAR2(11) NOT NULL UNIQUE,  -- ISO 6346 format
    iso_type_code   VARCHAR2(4),
    size_ft         NUMBER(2),      -- 20 or 40
    container_type  VARCHAR2(10),   -- GP, HC, RF, OT
    teu_size        NUMBER(3,1),    -- 1.0 or 2.0
    owner_code      VARCHAR2(4)     -- First 3 letters of container ID
);

CREATE TABLE dim_location (
    location_key    NUMBER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    block           VARCHAR2(5),
    bay             NUMBER(3),
    row             NUMBER(3),
    tier            NUMBER(3),
    yard_zone       VARCHAR2(20),   -- IMPORT, EXPORT, REEFER, DANGEROUS
    full_location   VARCHAR2(20)    -- e.g. A-14-03-02
);

-- ============================================================
-- FACT TABLES
-- ============================================================

-- One row per container dwell period in yard
CREATE TABLE fact_container_dwell (
    dwell_key           NUMBER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    container_key       NUMBER       NOT NULL REFERENCES dim_container(container_key),
    vessel_key          NUMBER       REFERENCES dim_vessel(vessel_key),
    arrival_date_key    NUMBER(8)    REFERENCES dim_date(date_key),
    departure_date_key  NUMBER(8)    REFERENCES dim_date(date_key),
    arrival_location_key NUMBER      REFERENCES dim_location(location_key),
    direction           VARCHAR2(10) CHECK (direction IN ('IMPORT','EXPORT','TRANSSHIP')),
    dwell_days          NUMBER(6,2),
    sla_breach          CHAR(1)      DEFAULT 'N',  -- Y if > 5 days
    teu_count           NUMBER(3,1)
);

-- One row per vessel port call
CREATE TABLE fact_vessel_call (
    call_key            NUMBER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vessel_key          NUMBER       NOT NULL REFERENCES dim_vessel(vessel_key),
    arrival_date_key    NUMBER(8)    REFERENCES dim_date(date_key),
    departure_date_key  NUMBER(8)    REFERENCES dim_date(date_key),
    arrival_timestamp   TIMESTAMP,
    departure_timestamp TIMESTAMP,
    berth_number        VARCHAR2(10),
    turnaround_hours    NUMBER(8,2),
    teu_discharged      NUMBER,
    teu_loaded          NUMBER,
    crane_moves         NUMBER
);

-- ============================================================
-- KPI QUERIES — used in BI dashboard
-- ============================================================

-- 1. Weekly TEU throughput (import vs export) — feeds the bar chart
SELECT
    d.year,
    d.week_of_year,
    SUM(CASE WHEN cd.direction = 'IMPORT' THEN cd.teu_count ELSE 0 END) AS import_teu,
    SUM(CASE WHEN cd.direction = 'EXPORT' THEN cd.teu_count ELSE 0 END) AS export_teu,
    SUM(cd.teu_count) AS total_teu
FROM fact_container_dwell cd
JOIN dim_date d ON d.date_key = cd.arrival_date_key
WHERE d.year = EXTRACT(YEAR FROM SYSDATE)
GROUP BY d.year, d.week_of_year
ORDER BY d.week_of_year;


-- 2. Average vessel turnaround by carrier — feeds turnaround chart
SELECT
    v.carrier_code,
    COUNT(*) AS port_calls,
    ROUND(AVG(vc.turnaround_hours), 1) AS avg_turnaround_hrs,
    ROUND(MIN(vc.turnaround_hours), 1) AS min_hrs,
    ROUND(MAX(vc.turnaround_hours), 1) AS max_hrs,
    ROUND(AVG(vc.teu_discharged + vc.teu_loaded), 0) AS avg_moves_per_call
FROM fact_vessel_call vc
JOIN dim_vessel v ON v.vessel_key = vc.vessel_key
JOIN dim_date d ON d.date_key = vc.arrival_date_key
WHERE d.full_date >= TRUNC(SYSDATE, 'MM')  -- current month
GROUP BY v.carrier_code
ORDER BY avg_turnaround_hrs;


-- 3. Current dwell time alert list — feeds the operations dashboard table
SELECT
    c.container_id,
    c.iso_type_code,
    l.full_location      AS yard_location,
    d_arr.full_date      AS arrival_date,
    cd.dwell_days,
    CASE
        WHEN cd.dwell_days > 7 THEN 'CRITICAL'
        WHEN cd.dwell_days > 5 THEN 'WARNING'
        ELSE 'OK'
    END AS alert_status
FROM fact_container_dwell cd
JOIN dim_container  c     ON c.container_key     = cd.container_key
JOIN dim_location   l     ON l.location_key      = cd.arrival_location_key
JOIN dim_date       d_arr ON d_arr.date_key       = cd.arrival_date_key
WHERE cd.departure_date_key IS NULL   -- still in yard
  AND cd.dwell_days > 5
ORDER BY cd.dwell_days DESC;


-- 4. Yard block occupancy — feeds occupancy bar chart
SELECT
    l.block,
    COUNT(*) AS containers_in_block,
    ROUND(COUNT(*) / MAX(block_capacity.total) * 100, 1) AS occupancy_pct
FROM fact_container_dwell cd
JOIN dim_location l ON l.location_key = cd.arrival_location_key
-- block capacity reference (static config table not shown)
CROSS JOIN (SELECT 80 AS total FROM DUAL) block_capacity
WHERE cd.departure_date_key IS NULL
GROUP BY l.block
ORDER BY l.block;
