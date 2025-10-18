-- Verification script for migration-add-is-active-v2.sql
-- Run this to confirm the migration completed successfully

-- 1. Check that new columns exist
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'cloud_status'
    AND column_name IN ('is_active', 'severity', 'status_impact', 'detection_confidence')
ORDER BY column_name;

-- 2. Check indexes were created
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'cloud_status'
    AND indexname LIKE '%active%'
ORDER BY indexname;

-- 3. Check migration progress on existing data
SELECT
    'Migration Status' AS check_type,
    COUNT(*) AS total_rows,
    COUNT(*) FILTER (WHERE is_active IS NOT NULL) AS has_is_active,
    COUNT(*) FILTER (WHERE is_active = true) AS is_active_true,
    COUNT(*) FILTER (WHERE is_active = false) AS is_active_false,
    COUNT(*) FILTER (WHERE is_active IS NULL) AS is_active_null,
    ROUND(100.0 * COUNT(*) FILTER (WHERE is_active IS NOT NULL) / NULLIF(COUNT(*), 0), 2) AS percent_migrated
FROM cloud_status;

-- 4. Check active_incidents view exists and works
SELECT
    'active_incidents view' AS check_type,
    COUNT(*) AS total_active_incidents,
    COUNT(DISTINCT provider) AS providers_with_incidents,
    COUNT(DISTINCT region_id) AS regions_with_incidents
FROM active_incidents;

-- 5. Check region_status_current has data
SELECT
    provider,
    COUNT(*) AS regions,
    COUNT(*) FILTER (WHERE overall_status = 'operational') AS operational,
    COUNT(*) FILTER (WHERE overall_status = 'degraded') AS degraded,
    COUNT(*) FILTER (WHERE overall_status = 'outage') AS outage,
    SUM(active_incidents) AS total_active_incidents
FROM region_status_current
GROUP BY provider
ORDER BY provider;

-- 6. Sample of active incidents (if any)
SELECT
    provider,
    region_id,
    incident_title,
    status,
    severity,
    is_active,
    detection_confidence,
    start_time
FROM active_incidents
ORDER BY start_time DESC
LIMIT 10;

-- Success!
SELECT '✅ Migration verification complete!' AS status;
