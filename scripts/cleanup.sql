-- Database Cleanup SQL Script
-- Run these commands in your Supabase SQL editor

-- 1. Delete all stale incident data from main tables
DELETE FROM cloud_status;
DELETE FROM recent_incidents;
DELETE FROM active_incidents;

-- 2. Reset region status summaries to operational
UPDATE region_status_current 
SET 
  overall_status = 'operational',
  operational_services = 0,
  degraded_services = 0,
  outage_services = 0,
  maintenance_services = 0,
  total_services = 0,
  active_incidents = 0,
  last_incident_time = NULL,
  last_updated = NOW();

-- 3. Verify cleanup
SELECT COUNT(*) as remaining_cloud_status FROM cloud_status;
SELECT COUNT(*) as remaining_recent_incidents FROM recent_incidents;
SELECT COUNT(*) as remaining_active_incidents FROM active_incidents;
SELECT provider, region_id, overall_status, active_incidents FROM region_status_current ORDER BY provider, region_id;