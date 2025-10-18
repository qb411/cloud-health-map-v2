-- Migration: Add is_active and severity fields to cloud_status table
-- Run this in your Supabase SQL Editor to update existing schema

-- Add is_active column for tracking active vs resolved incidents
ALTER TABLE cloud_status
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add severity column (keeping incident_severity for backward compatibility)
ALTER TABLE cloud_status
ADD COLUMN IF NOT EXISTS severity VARCHAR(20);

-- Add status_impact column for GCP-specific status data
ALTER TABLE cloud_status
ADD COLUMN IF NOT EXISTS status_impact VARCHAR(50);

-- Add detection_confidence for tracking how confident we are about the status
ALTER TABLE cloud_status
ADD COLUMN IF NOT EXISTS detection_confidence VARCHAR(10);

-- Create index on is_active for faster filtering of active incidents
CREATE INDEX IF NOT EXISTS idx_cloud_status_is_active ON cloud_status (is_active);

-- Create index on is_active + provider + region for common queries
CREATE INDEX IF NOT EXISTS idx_cloud_status_active_provider_region
ON cloud_status (provider, region_id, is_active);

-- Update calculate_region_status function to use is_active
CREATE OR REPLACE FUNCTION calculate_region_status(
    p_provider cloud_provider,
    p_region_id VARCHAR(100)
) RETURNS service_status AS $$
DECLARE
    outage_count INTEGER;
    degraded_count INTEGER;
    maintenance_count INTEGER;
BEGIN
    -- Count different status types for the region, only considering active incidents
    SELECT
        COUNT(CASE WHEN status = 'outage' THEN 1 END),
        COUNT(CASE WHEN status = 'degraded' THEN 1 END),
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END)
    INTO outage_count, degraded_count, maintenance_count
    FROM cloud_status
    WHERE provider = p_provider
      AND region_id = p_region_id
      AND is_active = true  -- Only count active incidents
      AND (end_time IS NULL OR end_time > NOW())
      AND created_at = (
          SELECT MAX(created_at)
          FROM cloud_status cs2
          WHERE cs2.provider = cloud_status.provider
            AND cs2.region_id = cloud_status.region_id
            AND cs2.incident_id = cloud_status.incident_id
      );

    -- Determine overall status based on priority: outage > degraded > maintenance > operational
    IF outage_count > 0 THEN
        RETURN 'outage';
    ELSIF degraded_count > 0 THEN
        RETURN 'degraded';
    ELSIF maintenance_count > 0 THEN
        RETURN 'maintenance';
    ELSE
        RETURN 'operational';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Update region status summary function to use is_active
CREATE OR REPLACE FUNCTION update_region_status_summary(
    p_provider cloud_provider,
    p_region_id VARCHAR(100),
    p_region_name VARCHAR(200)
) RETURNS VOID AS $$
DECLARE
    v_overall_status service_status;
    v_operational INTEGER := 0;
    v_degraded INTEGER := 0;
    v_outage INTEGER := 0;
    v_maintenance INTEGER := 0;
    v_total INTEGER := 0;
    v_active_incidents INTEGER := 0;
    v_last_incident_time TIMESTAMPTZ;
BEGIN
    -- Calculate overall status
    v_overall_status := calculate_region_status(p_provider, p_region_id);

    -- Count services by status, only for active incidents
    SELECT
        COUNT(CASE WHEN status = 'operational' THEN 1 END),
        COUNT(CASE WHEN status = 'degraded' THEN 1 END),
        COUNT(CASE WHEN status = 'outage' THEN 1 END),
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END),
        COUNT(*),
        COUNT(CASE WHEN status != 'operational' THEN 1 END),
        MAX(start_time)
    INTO v_operational, v_degraded, v_outage, v_maintenance, v_total, v_active_incidents, v_last_incident_time
    FROM cloud_status
    WHERE provider = p_provider
      AND region_id = p_region_id
      AND is_active = true  -- Only count active incidents
      AND (end_time IS NULL OR end_time > NOW())
      AND created_at = (
          SELECT MAX(created_at)
          FROM cloud_status cs2
          WHERE cs2.provider = cloud_status.provider
            AND cs2.region_id = cloud_status.region_id
            AND cs2.incident_id = cloud_status.incident_id
      );

    -- Insert or update region status summary
    INSERT INTO region_status_current (
        provider, region_id, region_name, overall_status,
        operational_services, degraded_services, outage_services, maintenance_services,
        total_services, active_incidents, last_incident_time, last_updated
    ) VALUES (
        p_provider, p_region_id, p_region_name, v_overall_status,
        v_operational, v_degraded, v_outage, v_maintenance,
        v_total, v_active_incidents, v_last_incident_time, NOW()
    )
    ON CONFLICT (provider, region_id)
    DO UPDATE SET
        region_name = EXCLUDED.region_name,
        overall_status = EXCLUDED.overall_status,
        operational_services = EXCLUDED.operational_services,
        degraded_services = EXCLUDED.degraded_services,
        outage_services = EXCLUDED.outage_services,
        maintenance_services = EXCLUDED.maintenance_services,
        total_services = EXCLUDED.total_services,
        active_incidents = EXCLUDED.active_incidents,
        last_incident_time = EXCLUDED.last_incident_time,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create view for active incidents only
CREATE OR REPLACE VIEW active_incidents AS
SELECT
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
    start_time,
    end_time,
    last_updated,
    created_at
FROM cloud_status
WHERE is_active = true
  AND (end_time IS NULL OR end_time > NOW())
ORDER BY start_time DESC;

-- Grant permissions on new view
GRANT SELECT ON active_incidents TO anon, authenticated;

-- Update existing records to have is_active = true by default
UPDATE cloud_status
SET is_active = true
WHERE is_active IS NULL;

-- Set is_active = false for records with end_time in the past
UPDATE cloud_status
SET is_active = false
WHERE end_time IS NOT NULL AND end_time < NOW();

-- Migration complete
SELECT 'Migration completed successfully. New columns: is_active, severity, status_impact, detection_confidence' AS status;
