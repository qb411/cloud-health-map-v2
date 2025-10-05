# GitHub Actions Control & Email Management

This document explains how to control the RSS processing workflow and prevent email spam from failed GitHub Actions.

## 🚨 Problem Solved

**Issue**: GitHub Actions generating too many failure emails when RSS processing fails
**Solution**: Smart enable/disable controls with better error handling

## 🎛️ Control System

### Repository Variable Control
The workflow now uses a repository variable `RSS_PROCESSING_ENABLED` to control execution:

- **`true`**: RSS processing runs automatically
- **`false`**: RSS processing is disabled (no emails)
- **Not set**: RSS processing is disabled by default

### Schedule Control
The cron schedule is **disabled by default** in the workflow file:
```yaml
# SCHEDULE DISABLED BY DEFAULT - Enable via repository variable
# schedule:
#   - cron: '*/15 * * * *'
```

## 🔧 How to Enable RSS Processing

### Step 1: Set Repository Variable
1. Go to GitHub repository **Settings**
2. **Secrets and variables** → **Actions** → **Variables**
3. Click **New repository variable**
4. **Name**: `RSS_PROCESSING_ENABLED`
5. **Value**: `true`
6. Click **Add variable**

### Step 2: Enable Schedule (Optional)
Edit `.github/workflows/update-status.yml` and uncomment:
```yaml
schedule:
  - cron: '*/15 * * * *'
```

### Step 3: Test First
Before enabling the schedule:
1. **Manual test**: Actions tab → Run workflow → Force run
2. **Verify success**: Check logs for errors
3. **Check data**: Verify Supabase has new data

## 🛑 How to Disable RSS Processing (Stop Emails)

### Method 1: Repository Variable (Recommended)
1. Go to **Settings** → **Secrets and variables** → **Actions** → **Variables**
2. Edit `RSS_PROCESSING_ENABLED`
3. Change value to `false`
4. Save

### Method 2: Disable Entire Workflow
1. Go to **Actions** tab
2. Click **Update Cloud Status Data**
3. Click **"..."** → **Disable workflow**

### Method 3: Comment Out Schedule
Edit `.github/workflows/update-status.yml`:
```yaml
# schedule:
#   - cron: '*/15 * * * *'
```

## 🧪 Testing Options

### Check Current Status
```bash
node scripts/check-rss-status.js
```

### Manual Testing
```bash
# Test RSS feeds only
npm run test

# Test Supabase connection
npm run test:supabase

# Run full RSS processing
npm start

# Test GitHub Actions environment
npm run test:github
```

### GitHub Actions Manual Run
1. **Actions** tab → **Update Cloud Status Data**
2. **Run workflow** → Check **Force run even if disabled**
3. **Run workflow**

## 🛡️ Improved Error Handling

### Pre-flight Checks
- Tests RSS feed connectivity before processing
- Validates Supabase connection
- Clear status messages

### Retry Logic
- 3 automatic retries with 30-second delays
- Reduces transient network failure emails
- Better success rate for processing

### Better Error Messages
- Detailed troubleshooting steps in logs
- Common causes and solutions
- Instructions for stopping emails

### Graceful Disabling
- Workflow skips entirely when disabled
- No failure emails when intentionally disabled
- Clear status messages in logs

## 📧 Email Notification Management

### Reduce GitHub Actions Emails
1. Go to **GitHub Profile Settings** (not repository)
2. **Notifications** → **Actions**
3. **Uncheck**: "Send notifications for failed workflows you didn't trigger"
4. **Keep checked**: "Send notifications for failed workflows you triggered"

### Result
- ✅ Get emails for workflows you manually start
- ❌ No emails for automated scheduled workflows
- 🎯 Only relevant notifications

## 🔄 Recommended Workflow

### Initial Setup
1. **Start DISABLED**: `RSS_PROCESSING_ENABLED = false`
2. **Test manually**: Use workflow_dispatch with force run
3. **Verify functionality**: Check logs and Supabase data
4. **Enable gradually**: Maybe hourly first, then 15-minute

### If Problems Occur
1. **Immediately disable**: Set `RSS_PROCESSING_ENABLED = false`
2. **Debug locally**: Use test scripts to identify issues
3. **Fix problems**: Update code, credentials, or configuration
4. **Test manually**: Verify fixes before re-enabling
5. **Re-enable carefully**: Monitor first few runs

### Monitoring
1. **Check Actions tab**: Look for failed runs
2. **Monitor Supabase**: Verify data is being updated
3. **Use status script**: `node scripts/check-rss-status.js`

## 🚨 Emergency Procedures

### Stop Email Spam Immediately
```
Settings → Secrets and variables → Actions → Variables
RSS_PROCESSING_ENABLED = false
```

### Disable All Workflows
```
Actions tab → Workflows → Disable workflow
```

### Check What's Running
```
Actions tab → View recent runs
```

## 📊 Status Indicators

### Workflow Logs
- **"RSS processing is disabled"**: Intentionally skipped
- **"✅ RSS processing completed"**: Successful run
- **"❌ RSS processing failed"**: Error occurred

### Repository Variables
- **`RSS_PROCESSING_ENABLED = true`**: Active
- **`RSS_PROCESSING_ENABLED = false`**: Disabled
- **Not set**: Disabled by default

### Workflow File
- **Schedule commented out**: Manual only
- **Schedule active**: Automated runs

## 💡 Best Practices

1. **Start conservative**: Disable by default, test manually
2. **Monitor closely**: Watch first few automated runs
3. **Have escape plan**: Know how to quickly disable
4. **Test locally first**: Use scripts before GitHub Actions
5. **Gradual rollout**: Hourly → 30min → 15min intervals
6. **Document issues**: Keep track of what causes failures

This control system gives you complete control over when RSS processing runs and prevents the email spam issue you experienced!