# Testing Checklist - Backend-Frontend Integration Fix

## ✅ Completed
- [x] Database migration v2 ran successfully
- [x] New columns added (is_active, severity, status_impact, detection_confidence)
- [x] Functions updated to use is_active
- [x] active_incidents view created

## 🧪 Next Steps to Test

### 1. Verify Migration in Supabase (Optional)
Run `database/verify-migration.sql` in Supabase SQL Editor to see migration stats.

### 2. Test RSS Processor (GitHub Actions)
**Option A: Manual Trigger (Recommended)**
1. Go to GitHub Actions tab
2. Find "Update Cloud Status Data" workflow
3. Click "Run workflow" → "Run workflow" button
4. Wait ~2-3 minutes for completion
5. Check the logs for:
   ```
   ✅ AWS: X incidents processed
   ✅ Azure: Y incidents processed
   ✅ GCP: Z incidents processed
   ✅ OCI: W incidents processed
   ```

**Option B: Wait for Automatic Run**
- Workflow runs every 15 minutes automatically
- Check GitHub Actions → Recent workflow runs

**Option C: Local Testing (Requires Secrets)**
If you want to test locally:
1. Create `scripts/.env` file
2. Add your secrets:
   ```
   SUPABASE_URL=your_url_here
   SUPABASE_SERVICE_ROLE_KEY=your_key_here
   ```
3. Run: `cd scripts && node update-status.js`

### 3. Verify Data in Supabase
After RSS processor runs, check in Supabase:

```sql
-- Check active incidents
SELECT provider, region_id, incident_title, is_active, severity
FROM active_incidents
ORDER BY start_time DESC
LIMIT 20;

-- Check region status summaries
SELECT provider, COUNT(*) as regions, SUM(active_incidents) as total_incidents
FROM region_status_current
GROUP BY provider;
```

### 4. Test Frontend
```bash
npm run dev
```

**Verify:**
- [ ] Map loads successfully
- [ ] Supabase connection indicator (bottom-left) shows green
- [ ] Console shows: "✅ Loaded real status data from Supabase: X regions"
- [ ] Region markers appear on map
- [ ] Status colors reflect real data (not all green if there are incidents)

### 5. Check Real-time Updates (Advanced)
1. Keep frontend running
2. Manually trigger GitHub Action workflow
3. Wait for workflow to complete
4. Frontend should auto-update within ~1 minute (Supabase real-time)

## 🔍 What to Look For

### Success Indicators
- ✅ GitHub Actions workflow completes without errors
- ✅ Supabase `active_incidents` view has data (if incidents exist)
- ✅ `region_status_current` table has entries for all providers
- ✅ Frontend queries Supabase (check browser console)
- ✅ No TypeScript/build errors

### Common Issues

**Issue: "No active incidents found"**
- ✅ This is NORMAL if no cloud providers have current incidents
- All regions will show as "operational" (green)

**Issue: GitHub Actions fails**
- Check that secrets are set correctly in repo settings
- Verify Supabase URL and service role key are valid

**Issue: Frontend shows all operational**
- Run verification SQL to check if `region_status_current` has data
- Check browser console for Supabase connection errors

## 📊 Expected Results

### If NO Active Incidents (Normal)
- RSS processor: "0 incidents processed" for all providers
- Supabase: `active_incidents` view is empty
- Frontend: All regions green (operational)

### If Active Incidents Exist
- RSS processor: "X incidents processed" where X > 0
- Supabase: `active_incidents` view has rows with:
  - `is_active = true`
  - `severity` values (low/medium/high)
  - `detection_confidence` values (high/medium/low)
- Frontend: Some regions show yellow/red based on status
- Region mappings: Incidents mapped to specific regions (not just "global")

## 🎯 Success Criteria

All of these should be true:
1. ✅ Migration completed without errors
2. ✅ GitHub Actions workflow runs successfully (manually or automatically)
3. ✅ Data appears in Supabase tables/views
4. ✅ Frontend loads and connects to Supabase
5. ✅ No console errors in browser
6. ✅ Region mappings work (176 regions recognized)

## 📝 Next Task After Success

Once everything above works:
- **Task 12**: Implement region click popup with incident details
- This will show the full incident information when clicking a region

---

**Current Status**: Migration complete ✅ | Waiting for RSS processor test
