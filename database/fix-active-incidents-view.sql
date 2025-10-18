-- Fix the active_incidents view to include is_active column
-- The view exists but doesn't expose all the new columns

CREATE OR REPLACE VIEW active_incidents AS
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
    is_active,  -- Make sure this is included
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

SELECT 'active_incidents view updated with is_active column' AS status;
