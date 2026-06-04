-- =================================================
-- 1. GEMIDDELDE DWELL TIME PER MAAND
-- =================================================
SELECT
    DATE_TRUNC('month', arrival_date) AS month,
    ROUND(AVG(departure_date - arrival_date), 1) AS avg_dwell_days,
    COUNT(*) AS total_containers,
    SUM(CASE WHEN (departure_date - arrival_date) > 5 THEN 1 ELSE 0 END) AS containers_over_threshold
FROM container_movements
WHERE departure_date IS NOT NULL
GROUP BY 1
ORDER BY 1;

-- =================================================
-- 2. ROOT CAUSE: DOCUMENTATIEVERTRAGING
-- =================================================
SELECT
    delay_reason,
    COUNT(*) AS container_count,
    ROUND(AVG(doc_processing_hours), 1) AS avg_processing_hours,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS pct_of_total
FROM container_delays
WHERE dwell_days > 5
GROUP BY delay_reason
ORDER BY container_count DESC;

-- =================================================
-- 3. PIEKBELASTING: CONTAINERS PER WEEKDAG
-- =================================================
SELECT
    TO_CHAR(arrival_date, 'Day') AS weekday,
    EXTRACT(DOW FROM arrival_date) AS dow_num,
    COUNT(*) AS arrivals,
    ROUND(AVG(departure_date - arrival_date), 1) AS avg_dwell
FROM container_movements
GROUP BY 1, 2
ORDER BY dow_num;

-- =================================================
-- 4. TOP SHIPPING AGENTS MET LANGSTE VERWERKINGSTIJD
-- =================================================
SELECT
    sa.agent_name,
    COUNT(cm.container_id) AS volume,
    ROUND(AVG(cm.departure_date - cm.arrival_date), 1) AS avg_dwell,
    ROUND(AVG(cd.doc_processing_hours), 1) AS avg_doc_hours,
    ROUND(SUM(cm.demurrage_cost), 0) AS total_demurrage_eur
FROM container_movements cm
JOIN shipping_agents sa ON cm.agent_id = sa.id
LEFT JOIN container_delays cd ON cm.container_id = cd.container_id
GROUP BY sa.agent_name
ORDER BY avg_doc_hours DESC
LIMIT 10;
