# How to Get Your Supabase Service Role Key

The **service role key** is different from the **anon key** and is required for GitHub Actions to write to your database.

## Step-by-Step Instructions

### 1. Go to Supabase Dashboard
- Visit [app.supabase.com](https://app.supabase.com)
- Select your `cloud-status-dashboard-v2` project

### 2. Navigate to API Settings
- Click **Settings** in the left sidebar
- Click **API** in the settings menu

### 3. Find the Service Role Key
You'll see two keys in the API settings:

#### ❌ **anon / public** key:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5eGJuZ213YnlueHR6ZnVhYWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2OTkxODcsImV4cCI6MjA3NTI3NTE4N30.Y9fa2MAjGA1jfzJcHZvNn4St6t0Mk1PLln00fzUOAy4
```
- **Usage**: Frontend only (already in your .env file)
- **Permissions**: Read-only access

#### ✅ **service_role** key:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5eGJuZ213YnlueHR6ZnVhYWVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY5OTE4NywiZXhwIjoyMDc1Mjc1MTg3fQ.DIFFERENT_SIGNATURE_HERE
```
- **Usage**: GitHub Actions RSS processor
- **Permissions**: Read and write access
- **Security**: Keep this secret! Never expose in frontend code

### 4. Copy the Service Role Key
- Click the **copy** button next to the **service_role** key
- This is what you'll add as `SUPABASE_SERVICE_ROLE_KEY` in GitHub secrets

## Key Differences

| Key Type | Usage | Permissions | Where to Use |
|----------|-------|-------------|--------------|
| **anon** | Frontend | Read-only | `.env` file, GitHub Pages build |
| **service_role** | Backend | Read + Write | GitHub Actions, RSS processor |

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never expose service_role key in frontend code**
2. **Only use in server-side environments** (GitHub Actions)
3. **Store as GitHub repository secret** (not in code)
4. **Regenerate if accidentally exposed**

## Testing Your Service Role Key

You can test if your service role key works:

```bash
cd scripts
cp .env.example .env
# Edit .env and add:
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

node test-supabase.js
```

If successful, you'll see:
```
✅ Read access working
✅ Write access working
🧹 Test record cleaned up
🎉 Supabase connection test passed!
```

## Troubleshooting

### "Invalid JWT" Error
- You're using the anon key instead of service_role key
- Copy the correct key from the **service_role** section

### "Permission Denied" Error
- Database RLS policies may be blocking access
- Verify the database schema was installed correctly

### "Network Error"
- Check your Supabase project URL is correct
- Verify the project is not paused (free tier limitation)

## Next Steps

Once you have your service role key:
1. Add it as `SUPABASE_SERVICE_ROLE_KEY` in GitHub repository secrets
2. Test the GitHub Actions workflow
3. Monitor the Actions tab for successful RSS processing