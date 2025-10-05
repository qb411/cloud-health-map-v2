# GitHub Actions Setup Guide

This guide will help you configure GitHub Actions for automated RSS processing and deployment.

## Prerequisites

✅ **Completed Tasks 6 & 7:**
- Supabase database set up and working
- RSS feed processor tested and functional
- All dependencies installed

## Step 1: Repository Configuration

### 1.1 Repository Secrets
You need to add these secrets to your GitHub repository for the workflows to function:

### 1.1 Navigate to Repository Secrets
1. Go to your GitHub repository
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### 1.2 Add Required Secrets

Add these **3 secrets** (case-sensitive):

| Secret Name | Value | Usage |
|-------------|-------|-------|
| `SUPABASE_URL` | `https://vyxbngmwbynxtzfuaaen.supabase.co` | Both workflows |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Frontend build |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | RSS processor |

### 1.3 Get Service Role Key
⚠️ **Important**: The `SUPABASE_SERVICE_ROLE_KEY` is different from the anon key:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
4. This key has write permissions to the database

### 1.4 Enable RSS Processing (Optional)
**RSS processing is DISABLED by default** to prevent email spam:

1. Go to **Settings** → **Secrets and variables** → **Actions** → **Variables**
2. Click **New repository variable**
3. **Name**: `RSS_PROCESSING_ENABLED`
4. **Value**: `true` (to enable) or `false` (to disable)
5. Click **Add variable**

**Recommendation**: Start with `false`, test manually first, then enable.

## Step 2: Enable GitHub Pages

### 2.1 Configure Pages Settings
1. Go to repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save the settings

### 2.2 Verify Pages Configuration
- Your site will be available at: `https://yourusername.github.io/cloud-health-map-v2`
- The first deployment will happen automatically when you push to main branch

## Step 3: Make Repository Public (For Free Actions)

### 3.1 Change Repository Visibility
1. Go to repository **Settings** → **General**
2. Scroll down to **Danger Zone**
3. Click **Change repository visibility**
4. Select **Make public**
5. Type the repository name to confirm

### 3.2 Why Public is Needed
- **GitHub Actions**: 2,000 minutes/month for private repos, unlimited for public
- **RSS Processing**: Runs every 15 minutes = ~3,000 minutes/month
- **Cost**: Free for public repos, ~$10-20/month for private repos

## Step 4: Test the Workflows

### 4.1 Test RSS Processing Workflow (Safe Testing)
1. **First, ensure RSS processing is DISABLED** (prevents email spam)
2. Go to **Actions** tab in your repository
3. Click **Update Cloud Status Data** workflow
4. Click **Run workflow**
5. **Check "Force run even if disabled"**
6. Click **Run workflow**
7. Monitor the execution and check for errors

### 4.2 Test Deployment Workflow
1. Make a small change to README.md
2. Commit and push to main branch
3. Go to **Actions** tab and watch **Deploy to GitHub Pages**
4. Once complete, visit your GitHub Pages URL

## Step 5: Enable Automated Processing (When Ready)

### 5.1 Enable RSS Processing Schedule
**Only after successful manual testing:**

1. **Set repository variable**: `RSS_PROCESSING_ENABLED = true`
2. **Uncomment schedule** in `.github/workflows/update-status.yml`:
   ```yaml
   schedule:
     - cron: '*/15 * * * *'
   ```
3. **Monitor closely**: Check first few automated runs

### 5.2 RSS Processing Schedule
- **Frequency**: Every 15 minutes (96 times per day) when enabled
- **Control**: Repository variable `RSS_PROCESSING_ENABLED`
- **Monitoring**: Check Actions tab for failed runs

### 5.2 Expected Workflow Behavior
- **Success**: Green checkmark, no errors in logs
- **Failure**: Red X, error details in logs
- **Data Flow**: RSS feeds → Supabase → Frontend display

## Troubleshooting

### Common Issues

#### 1. "Secrets not found" Error
- **Cause**: Repository secrets not configured correctly
- **Fix**: Double-check secret names are exact (case-sensitive)
- **Verify**: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

#### 2. "Permission denied" Database Error
- **Cause**: Using anon key instead of service role key
- **Fix**: Ensure SUPABASE_SERVICE_ROLE_KEY is the service_role key from Supabase
- **Test**: Run `node scripts/test-supabase.js` locally with service key

#### 3. "Build failed" Deployment Error
- **Cause**: Missing environment variables during build
- **Fix**: Verify SUPABASE_URL and SUPABASE_ANON_KEY secrets are set
- **Check**: Build logs in Actions tab for specific error

#### 4. RSS Processing Timeout
- **Cause**: Network issues or provider API changes
- **Fix**: Check `scripts/test-feeds.js` for provider connectivity
- **Monitor**: Individual provider success/failure in logs

### Debugging Steps

1. **Check Workflow Logs**:
   - Go to Actions tab → Click failed workflow → View logs

2. **Test Components Locally**:
   ```bash
   # Test RSS feeds
   node scripts/test-feeds.js
   
   # Test Supabase connection
   node scripts/test-supabase.js
   
   # Test full processing
   node scripts/update-status.js
   ```

3. **Verify Secrets**:
   - Repository Settings → Secrets → Verify all 3 secrets exist
   - Check for typos in secret names

4. **Check Supabase Logs**:
   - Supabase Dashboard → Logs → Check for database errors

## Expected Results

### ✅ Successful Setup Indicators:
- **RSS Workflow**: Runs every 15 minutes without errors
- **Deployment**: Site accessible at GitHub Pages URL
- **Database**: New incidents appear in Supabase tables
- **Frontend**: Live data updates from RSS feeds
- **Monitoring**: Green status in Actions tab

### 📊 Performance Metrics:
- **RSS Processing**: ~30-60 seconds per run
- **Deployment**: ~2-3 minutes per build
- **Data Latency**: 15-minute maximum delay for new incidents
- **Uptime**: 99%+ with GitHub Actions reliability

## Next Steps

Once GitHub Actions is working:
1. ✅ **Task 8 Complete** - Automated RSS processing every 15 minutes
2. 🔄 **Task 9** - Update frontend to use live Supabase data
3. 🔄 **Task 10** - Add historical status tracking and analytics

## 🎛️ RSS Processing Control

**Important**: RSS processing is disabled by default to prevent email spam.

- **Control Guide**: See `GITHUB_ACTIONS_CONTROL.md` for complete control instructions
- **Status Check**: Run `node scripts/check-rss-status.js`
- **Emergency Stop**: Set `RSS_PROCESSING_ENABLED = false` in repository variables

## Support

If you encounter issues:
1. **Stop email spam**: Set `RSS_PROCESSING_ENABLED = false`
2. Check `GITHUB_ACTIONS_CONTROL.md` for control instructions
3. Review workflow logs in Actions tab
4. Test components locally using provided scripts
5. Verify all secrets are configured correctly