# Supabase Setup Guide for Cloud Status Dashboard

## Overview
This guide will help you set up the Supabase database for the Cloud Status Dashboard. You'll create a new project, run the database schema, and configure the environment variables.

## Step 1: Create a New Supabase Project

1. **Go to [Supabase Dashboard](https://app.supabase.com)**
2. **Click "New Project"**
3. **Fill in project details:**
   - **Name**: `cloud-status-dashboard-v2`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users (US East, EU West, etc.)
4. **Click "Create new project"**
5. **Wait for project creation** (takes 1-2 minutes)

## Step 2: Run the Database Schema

1. **In your Supabase project dashboard, go to the "SQL Editor"**
2. **Click "New Query"**
3. **Copy the entire contents of `database/schema.sql`** from this project
4. **Paste it into the SQL editor**
5. **Click "Run"** to execute the schema
6. **Verify success** - you should see "Success. No rows returned" message

### What the Schema Creates:
- ✅ `cloud_status` table for storing all incident data
- ✅ `region_status_current` table for current aggregated status
- ✅ Database functions for status calculations
- ✅ Indexes for efficient querying
- ✅ Row Level Security policies for public read access
- ✅ Sample data for testing

## Step 3: Get Your Project Credentials

1. **Go to Project Settings > API**
2. **Copy these values:**
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

## Step 4: Configure Environment Variables

1. **Copy `.env.example` to `.env`:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file with your credentials:**
   ```env
   VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

## Step 5: Test the Connection

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open browser console** and check for any Supabase connection errors

3. **Verify data access** - the map should eventually show status data from Supabase instead of mock data

## Step 6: Verify Database Tables

In Supabase dashboard, go to **Table Editor** and verify these tables exist:
- ✅ `cloud_status` - Should have sample data
- ✅ `region_status_current` - Should have aggregated status data

## Step 7: Set Up GitHub Secrets (For Later)

When you're ready to deploy GitHub Actions, you'll need to add these secrets to your GitHub repository:

1. **Go to your GitHub repo > Settings > Secrets and variables > Actions**
2. **Add these repository secrets:**
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Found in Project Settings > API (service_role key, NOT anon key)

## Security Notes

- ✅ **Anon key is safe to expose** - it only allows read access due to RLS policies
- ✅ **Service role key is for GitHub Actions only** - never expose this in frontend code
- ✅ **Row Level Security** is enabled to protect data integrity
- ✅ **Public read access** is intentional since this is public cloud status data

## Troubleshooting

### Connection Issues
- Verify your `.env` file has the correct URL and key
- Check that the URL doesn't have trailing slashes
- Ensure the anon key is the full JWT token (very long string)

### Schema Issues
- If schema creation fails, check the SQL Editor for error messages
- Ensure you copied the entire `database/schema.sql` file
- Try running sections of the schema separately if needed

### Data Issues
- Check the `cloud_status` table has sample data
- Verify the `region_status_current` table was populated by triggers
- Use the SQL Editor to run test queries

## Next Steps

Once Supabase is set up:
1. ✅ **Task 6 Complete** - Database is ready
2. 🔄 **Task 7** - Create RSS feed processor
3. 🔄 **Task 8** - Set up GitHub Actions workflow
4. 🔄 **Task 9** - Update frontend to use Supabase

## Test Queries

You can test your setup with these SQL queries in the Supabase SQL Editor:

```sql
-- Check sample data
SELECT * FROM cloud_status LIMIT 5;

-- Check aggregated status
SELECT * FROM region_status_current;

-- Test the status calculation function
SELECT calculate_region_status('aws', 'us-east-1');

-- Check recent incidents view
SELECT * FROM recent_incidents LIMIT 5;
```