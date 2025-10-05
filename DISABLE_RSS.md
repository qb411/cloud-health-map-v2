# How to Disable RSS Processing (Stop Emails)

If GitHub Actions is sending too many failure emails, here's how to stop it with a single step:

## 🛑 Quick Disable (Single Step)

**Edit the workflow file:**

1. Go to `.github/workflows/update-status.yml`
2. Comment out the schedule section:

```yaml
# DISABLED - Uncomment to re-enable
# schedule:
#   - cron: '*/15 * * * *'
```

3. Commit and push the change

**That's it!** No more automated runs = no more emails.

## 🔄 Re-enable Later

When you want to turn it back on:

1. Uncomment the schedule section:
```yaml
schedule:
  - cron: '*/15 * * * *'
```

2. Commit and push

## 🧪 Manual Testing

You can always test manually without the schedule:
- Go to **Actions** tab → **Update Cloud Status Data** → **Run workflow**

## 💡 Alternative: Disable Entire Workflow

If you want to completely stop the workflow:
- **Actions** tab → **Update Cloud Status Data** → **"..."** → **Disable workflow**