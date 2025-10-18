-- Fix the active_incidents view - drop and recreate to avoid column ordering issues

-- Drop the existing view
DROP VIEW IF EXISTS active_incidents;

-- Recreate with all columns including is_active
CREATE VIEW active_incidents AS
SELECT
    id,
    provider,
    region_id,
    region_name,
    service_name,
    status,
    severity,
    incident_title,
    incident_description,
    incident_severity,
    status_impact,
    detection_confidence,
    is_active,
    start_time,
    end_time,
    last_updated,
    created_at
FROM cloud_status
WHERE COALESCE(is_active, true) = true
  AND (end_time IS NULL OR end_time > NOW())
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY start_time DESC;

-- Grant permissions
GRANT SELECT ON active_incidents TO anon, authenticated;

-- Verify the view structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'active_incidents'
ORDER BY ordinal_position;

SELECT 'active_incidents view recreated successfully with is_active column' AS status;
