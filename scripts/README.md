# Cloud Status Dashboard - Scripts

This directory contains scripts for processing cloud provider status feeds and managing the database.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Add your Supabase credentials to `.env`

## Essential Scripts

### 🚀 **Core Functionality**
- `update-status.js` - **Main RSS processor** with enhanced incident detection
- `region-mappings.js` - Region ID mappings for all cloud providers

### 🧪 **Testing & Validation**
- `test-supabase-integration.js` - **Comprehensive database integration test**
- `test-feeds.js` - Test RSS feed accessibility and parsing
- `validate-coordinates.js` - Validate region coordinate accuracy

### 🛠️ **Utilities**
- `cleanup.sql` - **Database cleanup SQL commands**
- `generate-region-mappings.js` - Generate region mappings from official sources
- `check-rss-status.js` - Check RSS feed health
- `test-github-actions.js` - Test GitHub Actions workflow

### 📋 **Documentation**
- `get-service-key.md` - Instructions for Supabase service key setup
- `toggle-rss-processing.md` - How to enable/disable RSS processing

## Quick Commands

```bash
# Test everything
node test-supabase-integration.js

# Process RSS feeds manually  
node update-status.js

# Test feed accessibility
node test-feeds.js

# Clean database (run SQL in Supabase dashboard)
# See cleanup.sql
```

## Features

✅ **Enhanced Incident Detection** - Distinguishes active vs resolved incidents  
✅ **Multi-Provider Support** - AWS, Azure, GCP, OCI  
✅ **Severity Classification** - High/Medium/Low impact levels  
✅ **Real-time Updates** - 15-minute GitHub Actions automation  
✅ **Duplicate Prevention** - Smart incident ID handling