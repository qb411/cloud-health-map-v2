-- Cloud Status Dashboard Database Schema
-- This schema supports historical tracking of cloud provider service status

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data integrity
CREATE TYPE cloud_provider AS ENUM ('aws', 'azure', 'gcp', 'oci');
CREATE TYPE service_status AS ENUM ('operational', 'degraded', 'outage', 'maintenance');
CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Main table for storing cloud service status data
CREATE TABLE cloud_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider cloud_provider NOT NULL,
    region_id VARCHAR(100) NOT NULL,
    region_name VARCHAR(200) NOT NULL,
    service_name VARCHAR(200),
    status service_status NOT NULL DEFAULT 'operational',
    incident_id VARCHAR(200),
    incident_title TEXT,
    incident_description TEXT,
    incident_severity incident_severity,
    affected_services TEXT[],
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Composite index for efficient querying
    CONSTRAINT unique_provider_region_incident UNIQUE (provider, region_id, incident_id, created_at)
);

-- Create indexes for efficient querying
CREATE INDEX idx_cloud_status_provider_region ON cloud_status (provider, region_id);
CREATE INDEX idx_cloud_status_status ON cloud_status (status);
CREATE INDEX idx_cloud_status_last_updated ON cloud_status (last_updated DESC);
CREATE INDEX idx_cloud_status_created_at ON cloud_status (created_at DESC);
CREATE INDEX idx_cloud_status_provider_status ON cloud_status (provider, status);
CREATE INDEX idx_cloud_status_region_status ON cloud_status (region_id, status);

-- Table for storing current aggregated status per region
CREATE TABLE region_status_current (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider cloud_provider NOT NULL,
    region_id VARCHAR(100) NOT NULL,
    region_name VARCHAR(200) NOT NULL,
    overall_status service_status NOT NULL DEFAULT 'operational',
    operational_services INTEGER DEFAULT 0,
    degraded_services INTEGER DEFAULT 0,
    outage_services INTEGER DEFAULT 0,
    maintenance_services INTEGER DEFAULT 0,
    total_services INTEGER DEFAULT 0,
    active_incidents INTEGER DEFAULT 0,
    last_incident_time TIMESTAMPTZ,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_provider_region_current UNIQUE (provider, region_id)
);

-- Create indexes for current status table
CREATE INDEX idx_region_status_provider ON region_status_current (provider);
CREATE INDEX idx_region_status_overall ON region_status_current (overall_status);
CREATE INDEX idx_region_status_last_updated ON region_status_current (last_updated DESC);

-- Function to calculate overall region status based on service statuses
CREATE OR REPLACE FUNCTION calculate_region_status(
    p_provider cloud_provider,
    p_region_id VARCHAR(100)
) RETURNS service_status AS $$
DECLARE
    outage_count INTEGER;
    degraded_count INTEGER;
    maintenance_count INTEGER;
BEGIN
    -- Count different status types for the region
    SELECT 
        COUNT(CASE WHEN status = 'outage' THEN 1 END),
        COUNT(CASE WHEN status = 'degraded' THEN 1 END),
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END)
    INTO outage_count, degraded_count, maintenance_count
    FROM cloud_status 
    WHERE provider = p_provider 
      AND region_id = p_region_id 
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

-- Function to update region status summary
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
    
    -- Count services by status
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

-- Trigger to automatically update region status when cloud_status changes
CREATE OR REPLACE FUNCTION trigger_update_region_status() RETURNS TRIGGER AS $$
BEGIN
    -- Update for the affected region
    PERFORM update_region_status_summary(
        COALESCE(NEW.provider, OLD.provider),
        COALESCE(NEW.region_id, OLD.region_id),
        COALESCE(NEW.region_name, OLD.region_name)
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_cloud_status_update
    AFTER INSERT OR UPDATE OR DELETE ON cloud_status
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_region_status();

-- Enable Row Level Security (RLS)
ALTER TABLE cloud_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_status_current ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is public status data)
CREATE POLICY "Allow public read access to cloud_status" ON cloud_status
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to region_status_current" ON region_status_current
    FOR SELECT USING (true);

-- Create policy for service role to insert/update data (for GitHub Actions)
CREATE POLICY "Allow service role to manage cloud_status" ON cloud_status
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to manage region_status_current" ON region_status_current
    FOR ALL USING (auth.role() = 'service_role');

-- Create some helpful views for common queries
CREATE VIEW current_region_status AS
SELECT 
    provider,
    region_id,
    region_name,
    overall_status,
    operational_services,
    degraded_services,
    outage_services,
    maintenance_services,
    total_services,
    active_incidents,
    last_incident_time,
    last_updated
FROM region_status_current
ORDER BY provider, region_name;

CREATE VIEW recent_incidents AS
SELECT 
    provider,
    region_id,
    region_name,
    service_name,
    status,
    incident_title,
    incident_description,
    incident_severity,
    start_time,
    end_time,
    last_updated
FROM cloud_status
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND status != 'operational'
ORDER BY start_time DESC;

-- Grant permissions on views
GRANT SELECT ON current_region_status TO anon, authenticated;
GRANT SELECT ON recent_incidents TO anon, authenticated;

-- Insert some sample data for testing (optional)
-- This will be replaced by real RSS feed data
INSERT INTO cloud_status (provider, region_id, region_name, service_name, status, incident_title, start_time) VALUES
('aws', 'us-east-1', 'US East (N. Virginia)', 'EC2', 'operational', NULL, NOW()),
('aws', 'us-west-2', 'US West (Oregon)', 'EC2', 'operational', NULL, NOW()),
('azure', 'eastus', 'East US', 'Virtual Machines', 'operational', NULL, NOW()),
('gcp', 'us-central1', 'Iowa', 'Compute Engine', 'operational', NULL, NOW()),
('oci', 'us-ashburn-1', 'US East (Ashburn)', 'Compute', 'operational', NULL, NOW());

-- Update region summaries for sample data
SELECT update_region_status_summary('aws', 'us-east-1', 'US East (N. Virginia)');
SELECT update_region_status_summary('aws', 'us-west-2', 'US West (Oregon)');
SELECT update_region_status_summary('azure', 'eastus', 'East US');
SELECT update_region_status_summary('gcp', 'us-central1', 'Iowa');
SELECT update_region_status_summary('oci', 'us-ashburn-1', 'US East (Ashburn)');