-- Optional: Cleanup script to remove old incident data
-- Run this AFTER the migration and after RSS processor has run at least once
-- This removes incidents older than 30 days to reduce database size

-- Step 1: Check what will be deleted (DRY RUN)
SELECT
    'DRY RUN: Would delete the following:' AS action,
    COUNT(*) AS total_rows,
    COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '30 days') AS old_rows,
    COUNT(*) FILTER (WHERE is_active IS NULL) AS null_is_active_rows,
    pg_size_pretty(pg_total_relation_size('cloud_status')) AS current_table_size
FROM cloud_status;

-- Step 2: See breakdown by provider
SELECT
    provider,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '30 days') AS older_than_30_days,
    COUNT(*) FILTER (WHERE is_active IS NULL) AS null_is_active,
    MAX(created_at) AS most_recent_incident
FROM cloud_status
GROUP BY provider
ORDER BY provider;

-- Step 3: Delete old incidents (older than 30 days)
-- UNCOMMENT THE FOLLOWING LINE TO ACTUALLY DELETE:
-- DELETE FROM cloud_status WHERE created_at < NOW() - INTERVAL '30 days';

-- Step 4: Vacuum to reclaim space
-- UNCOMMENT THE FOLLOWING LINE TO RECLAIM SPACE:
-- VACUUM FULL cloud_status;

-- Instructions:
-- 1. Review the DRY RUN results above
-- 2. If satisfied, uncomment the DELETE line in Step 3
-- 3. Run the script again to perform the deletion
-- 4. Uncomment and run VACUUM to reclaim disk space

SELECT 'Cleanup script ready. Review results and uncomment DELETE to proceed.' AS status;
