# Database Cleanup Edge Function

This Supabase Edge Function performs automated database maintenance to keep storage usage under control.

## What it does:
- Removes operational status records (shouldn't be stored)
- Marks old GCP incidents as resolved (fixes stale data)
- Removes duplicate active incidents (keeps 50 most recent per provider)
- Archives resolved incidents older than 90 days
- Preserves resolved incidents for reporting purposes

## Deployment:

```bash
# Deploy the function
supabase functions deploy database-cleanup

# Test the function
supabase functions invoke database-cleanup --method POST
```

## Scheduling Options:

### Option 1: Manual Trigger
Call the function manually when needed:
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/database-cleanup' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

### Option 2: Application Trigger
Add a cleanup call to your application (e.g., daily on first load):
```javascript
// In your app
const response = await supabase.functions.invoke('database-cleanup')
```

### Option 3: pg_cron (Requires Pro Plan)
Set up automatic scheduling with PostgreSQL cron:
```sql
-- Run daily at 2 AM UTC
SELECT cron.schedule('database-cleanup', '0 2 * * *', 
  'SELECT net.http_post(url:=''https://your-project.supabase.co/functions/v1/database-cleanup'', headers:=''{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'')');
```

## Monitoring:
- Check function logs in Supabase Dashboard > Edge Functions
- Function returns JSON with cleanup statistics
- Monitor database size in Supabase Dashboard > Settings > Usage

## Response Format:
```json
{
  "success": true,
  "timestamp": "2024-01-15T02:00:00.000Z",
  "operationalRemoved": 84,
  "oldIncidentsResolved": 263,
  "duplicatesRemoved": [
    {"provider": "gcp", "deleted": 1015}
  ],
  "archivedOldIncidents": 0,
  "finalRecordCount": 313,
  "estimatedSizeMB": 1.43
}
```