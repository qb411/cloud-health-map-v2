# Cloud Status Dashboard

A real-time visualization dashboard that displays the health status of cloud provider services across global regions on an interactive world map. The system monitors public status feeds from major cloud providers (AWS, Azure, GCP, OCI) and displays service health through color-coded regions.

## Features

- **Real-time Status Monitoring**: Fetches live status data from public cloud provider RSS feeds and APIs
- **Interactive World Map**: Leaflet-based map with clickable regions showing service health
- **Multi-Cloud Support**: AWS, Microsoft Azure, Google Cloud Platform, Oracle Cloud Infrastructure
- **Comprehensive Coverage**: 110+ regions globally across all major cloud providers
- **Auto-refresh**: Updates every 15 minutes with caching to prevent excessive API calls
- **Dark/Light Theme**: Toggle between themes for different viewing environments
- **Provider Filtering**: Filter view by specific cloud providers or show all
- **Responsive Design**: Optimized for desktop, TV displays, and large screens
- **GitHub Pages Deployment**: Free static hosting with automatic deployments

## Architecture

The application uses a modern serverless architecture:

- **Frontend**: React 18 + TypeScript + Vite (deployed to GitHub Pages)
- **Backend**: GitHub Actions for RSS processing (runs every 15 minutes)
- **Database**: Supabase PostgreSQL for persistent status data storage
- **Mapping**: Leaflet + React-Leaflet for interactive world map
- **Styling**: Tailwind CSS for responsive design

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Mapping**: Leaflet + React-Leaflet
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Database**: Supabase (PostgreSQL)
- **Backend Processing**: Node.js (GitHub Actions)
- **Deployment**: GitHub Pages + GitHub Actions

## Prerequisites

### Required Accounts (All Free Tier)
1. **GitHub Account** - For repository hosting and GitHub Actions
2. **Supabase Account** - For database and real-time data storage
   - Sign up at [supabase.com](https://supabase.com)
   - Free tier: 500MB database, 50MB file storage

### Development Environment
- **Node.js 18+** - For local development and build process
- **npm or yarn** - Package manager
- **Git** - Version control

## Setup Instructions

### 1. Clone and Install Dependencies
```bash
git clone https://github.com/qb411/cloud-health-map-v2.git
cd cloud-health-map-v2
npm install
```

### 2. Supabase Database Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run this schema:

```sql
-- Create cloud_status table
CREATE TABLE cloud_status (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(10) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'operational',
  incidents JSONB DEFAULT '[]',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_cloud_status_provider ON cloud_status(provider);
CREATE INDEX idx_cloud_status_updated ON cloud_status(last_updated);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE cloud_status ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON cloud_status
  FOR SELECT USING (true);

-- Create policy to allow service role write access
CREATE POLICY "Allow service role write access" ON cloud_status
  FOR ALL USING (auth.role() = 'service_role');
```

3. Get your Supabase credentials:
   - Go to Settings → API
   - Copy the **Project URL** and **anon public key**

### 3. GitHub Repository Setup
1. Fork or clone this repository
2. Go to repository Settings → Secrets and variables → Actions
3. Add the following secrets:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon public key

### 4. Enable GitHub Pages
1. Go to repository Settings → Pages
2. Source: "GitHub Actions"
3. The site will be available at: `https://yourusername.github.io/cloud-health-map-v2`

### 5. Local Development Setup
1. Create a `.env.local` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Start the development server:
```bash
npm run dev
```

## Data Sources

### Region Data
- **AWS Regions**: [AWS Global Infrastructure Documentation](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html)
- **Azure Regions**: [Microsoft Azure Regions List](https://learn.microsoft.com/en-us/azure/reliability/regions-list)
- **GCP Regions**: Google Cloud Platform public documentation
- **OCI Regions**: Oracle Cloud Infrastructure public documentation

### Status Feeds (Processed by GitHub Actions)
- **AWS**: Service Health Dashboard RSS feed (`https://status.aws.amazon.com/rss/all.rss`)
- **Azure**: Azure Status RSS feed (`https://status.azure.com/en-us/status/feed/`)
- **GCP**: Google Cloud Status JSON API (`https://status.cloud.google.com/incidents.json`)
- **OCI**: Oracle Cloud Status JSON API (`https://ocistatus.oraclecloud.com/api/v2/incidents.json`)

## Development

### Local Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

### Manual Status Update (Testing)
```bash
cd scripts
npm install
SUPABASE_URL=your_url SUPABASE_ANON_KEY=your_key node update-status.js
```

## Deployment

The application automatically deploys to GitHub Pages when you push to the `master` branch. The deployment includes:

1. **Build Process**: Vite builds the React application
2. **Environment Variables**: Supabase credentials injected during build
3. **Static Hosting**: Deployed to GitHub Pages with global CDN
4. **Automatic Updates**: RSS processing runs every 15 minutes via GitHub Actions

## Usage

1. **Map Navigation**: Click and drag to pan, scroll to zoom
2. **Region Selection**: Click on region markers to view details
3. **Provider Filtering**: Use the provider filter panel to show specific cloud providers
4. **Theme Toggle**: Switch between dark and light themes
5. **Full Screen**: Use the full-screen button for TV/wall display mode
6. **Reset View**: Reset zoom level while maintaining current position

## Status Indicators

- 🟢 **Green**: All services operational
- 🟡 **Yellow**: Some services degraded or experiencing issues  
- 🔴 **Red**: Service outages or major incidents

## Monitoring and Updates

- **Automatic Updates**: GitHub Actions processes RSS feeds every 15 minutes
- **Real-time Display**: Frontend automatically reflects latest status data
- **Error Handling**: Graceful fallbacks when APIs are unavailable
- **Caching**: Efficient data storage and retrieval via Supabase

## Cost Structure

This project is designed to run completely free using:
- **GitHub**: Free repository hosting and Actions (2,000 minutes/month)
- **Supabase**: Free tier (500MB database, 50MB storage)
- **GitHub Pages**: Free static site hosting with global CDN

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run dev`
5. Submit a pull request

## License

This project is licensed under the MIT License.
