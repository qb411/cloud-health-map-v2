# RSS Feed Processor Scripts

This directory contains the Node.js scripts that process RSS feeds from cloud providers and store the data in Supabase.

## Files

- **`update-status.js`** - Main RSS processor script
- **`test-feeds.js`** - Test script to verify RSS feeds are accessible
- **`package.json`** - Node.js dependencies
- **`.env.example`** - Environment variable template

## Cloud Providers Supported

| Provider | Type | URL | Status |
|----------|------|-----|--------|
| AWS | RSS/XML | https://status.aws.amazon.com/rss/all.rss | ✅ |
| Azure | RSS/XML | https://status.azure.com/en-us/status/feed/ | ✅ |
| GCP | JSON | https://status.cloud.google.com/incidents.json | ✅ |
| OCI | JSON | https://ocistatus.oraclecloud.com/api/v2/incidents.json | ✅ |

## Local Testing

1. **Install dependencies:**
   ```bash
   cd scripts
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase service role key
   ```

3. **Test RSS feeds:**
   ```bash
   npm test
   ```

4. **Run processor:**
   ```bash
   npm start
   ```

## Environment Variables

- **`SUPABASE_URL`** - Your Supabase project URL
- **`SUPABASE_SERVICE_ROLE_KEY`** - Service role key (NOT anon key) for write access

## Data Processing

The script processes each provider's feed and:

1. **Fetches** RSS/JSON data from public endpoints
2. **Parses** XML (AWS/Azure) or JSON (GCP/OCI) formats
3. **Normalizes** data into consistent incident format
4. **Maps** services to regions using provider-specific logic
5. **Stores** incidents in `cloud_status` table
6. **Updates** region summaries in `region_status_current` table

## Error Handling

- Network timeouts (30 seconds)
- Malformed data (skips bad items)
- Database errors (logs and continues)
- Provider-specific parsing errors
- Comprehensive logging for debugging

## GitHub Actions Integration

This script is designed to run in GitHub Actions every 15 minutes:

- Uses repository secrets for Supabase credentials
- Exits with error code if any provider fails
- Provides detailed logging for monitoring
- Handles rate limiting and network issues

## Region Mapping

Each provider uses different region identifiers:

- **AWS**: `us-east-1`, `eu-west-1`, etc.
- **Azure**: `eastus`, `westeurope`, etc.  
- **GCP**: `us-central1`, `europe-west1`, etc.
- **OCI**: `us-ashburn-1`, `eu-frankfurt-1`, etc.

The script maps these to human-readable names for the dashboard.