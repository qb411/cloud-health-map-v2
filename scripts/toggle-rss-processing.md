# RSS Processing Toggle Control

This guide shows how to enable/disable the automated RSS processing to prevent spam emails from failed GitHub Actions.

## 🔧 How to Control RSS Processing

### Enable RSS Processing

1. **Go to Repository Settings**:
   - Navigate to your GitHub repository
   - Click **Settings** tab
   - Go to **Secrets and variables** → **Actions**
   - Click **Variables** tab

2. **Add Repository Variable**:
   - Click **New repository variable**
   - **Name**: `RSS_PROCESSING_ENABLED`
   - **Value**: `true`
   - Click **Add variable**

3. **Enable Schedule (Optional)**:
   - Edit `.github/workflows/update-status.yml`
   - Uncomment the schedule section:
   ```yaml
   schedule:
     - cron: '*/15 * * * *'
   ```

### Disable RSS Processing

1. **Quick Disable**:
   - Go to repository **Settings** → **Secrets and variables** → **Actions** → **Variables**
   - Edit `RSS_PROCESSING_ENABLED`
   - Change value to `false`
   - Save

2. **Complete Disable**:
   - Comment out the schedule in `.github/workflows/update-status.yml`:
   ```yaml
   # schedule:
   #   - cron: '*/15 * * * *'
   ```

## 🚨 Emergency Stop (Stop Email Spam)

If you're getting too many failure emails:

### Method 1: Repository Variable (Fastest)
```
Settings → Secrets and variables → Actions → Variables
RSS_PROCESSING_ENABLED = false
```

### Method 2: Disable Workflow
```
Actions tab → Update Cloud Status Data → Disable workflow
```

### Method 3: Delete Schedule
```
Edit .github/workflows/update-status.yml
Comment out the schedule section
```

## 🧪 Manual Testing

You can always run the RSS processor manually:

### Via GitHub Actions
1. Go to **Actions** tab
2. Click **Update Cloud Status Data**
3. Click **Run workflow**
4. Check **Force run even if disabled**
5. Click **Run workflow**

### Via Local Testing
```bash
# Test RSS feeds
node scripts/test-feeds.js

# Test Supabase connection  
node scripts/test-supabase.js

# Run full processing
node scripts/update-status.js
```

## 📊 Current Status Check

To see if RSS processing is currently enabled:

1. **Check Repository Variables**:
   - Settings → Secrets and variables → Actions → Variables
   - Look for `RSS_PROCESSING_ENABLED`

2. **Check Workflow File**:
   - Look at `.github/workflows/update-status.yml`
   - See if schedule section is commented out

3. **Check Recent Runs**:
   - Actions tab → Recent workflow runs
   - Look for "RSS processing is disabled" messages

## 🔄 Recommended Workflow

### Initial Setup:
1. **Start with RSS processing DISABLED**
2. **Test manually** first using `workflow_dispatch`
3. **Verify everything works** before enabling schedule
4. **Enable gradually** (maybe hourly first, then 15-minute)

### If Issues Occur:
1. **Immediately disable** via repository variable
2. **Debug locally** using test scripts
3. **Fix issues** before re-enabling
4. **Test manually** before enabling schedule again

## 🛡️ Failure Prevention Features

The updated workflow includes:

### ✅ **Smart Enabling/Disabling**
- Repository variable control
- Manual override option
- Clear status messages

### ✅ **Pre-flight Checks**
- RSS feed connectivity test before processing
- Better error messages with troubleshooting tips
- Graceful handling of disabled state

### ✅ **Reduced Email Spam**
- Workflow skips entirely when disabled
- Better error context when failures occur
- Clear instructions for stopping emails

### ✅ **Easy Debugging**
- Detailed failure messages
- Troubleshooting steps in logs
- Local testing recommendations

## 📧 Email Notification Settings

To reduce GitHub Actions email notifications:

1. **Go to GitHub Settings** (your profile, not repository)
2. **Notifications** → **Actions**
3. **Uncheck** "Send notifications for failed workflows you didn't trigger"
4. **Keep checked** "Send notifications for failed workflows you triggered"

This way you only get emails for workflows you manually started, not the automated ones.