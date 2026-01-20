# Cloud Status Dashboard v2

A development-ready real-time visualization dashboard that displays the health status of cloud provider services across global regions on an interactive world map. The system monitors public status feeds from major cloud providers and displays service health through color-coded regions with historical tracking and trend analysis.

## 🌐 Live Demo

**🚀 [View Live Dashboard](https://qb411.github.io/cloud-health-map-v2/)**

Experience the interactive cloud status map with real-time data from AWS, Azure, GCP, and OCI regions worldwide.

## 🚀 Current Features (Implemented)

### **Interactive Map Dashboard**
- ✅ **Leaflet-based World Map**: Interactive map with zoom, pan, and region selection
- ✅ **176 Global Regions**: Complete coverage across AWS (37), Azure (59), GCP (41), OCI (39)
- ✅ **Color-coded Status Indicators**: Green (operational), Orange (degraded), Red (outage)
- ✅ **Provider Icon Markers**: Distinctive markers showing provider abbreviations with status colors
- ✅ **Real-time Map Controls**: Zoom levels, reset view, fullscreen mode for TV displays

### **Multi-Cloud Provider Support**
- ✅ **AWS Integration**: RSS feed processing from Service Health Dashboard
- ✅ **Azure Integration**: RSS feed processing from Azure Status portal
- ✅ **GCP Integration**: JSON API processing from Google Cloud Status (59+ historical incidents)
- ✅ **OCI Integration**: JSON API processing from Oracle Cloud Infrastructure Status

### **User Interface & Experience**
- ✅ **Dark/Light Theme Toggle**: System preference detection with manual override
- ✅ **Provider Filtering**: Filter by AWS, Azure, GCP, OCI, or show all providers
- ✅ **Responsive Design**: Optimized for desktop, tablets, TV displays, and large screens
- ✅ **Collapsible Supabase Status Indicator**: Real-time database connection monitoring
- ✅ **Advertisement Banner Integration**: Monetization-ready ad space at bottom

### **Database & Backend Infrastructure**
- ✅ **Supabase PostgreSQL Database**: Development-ready schema with historical tracking
- ✅ **Real-time Data Subscriptions**: Live status updates without page refresh
- ✅ **Historical Incident Tracking**: Complete audit trail of all status changes
- ✅ **Automated Region Summaries**: Database functions for status aggregation
- ✅ **Row Level Security**: Public read access with secure write permissions

### **RSS Feed Processing System**
- ✅ **Node.js RSS Processor**: Complete script for all 4 cloud providers
- ✅ **XML Parsing**: AWS and Azure RSS feeds with incident extraction
- ✅ **JSON API Integration**: GCP and OCI status APIs with data normalization
- ✅ **Error Handling & Logging**: Comprehensive failure recovery and monitoring
- ✅ **Feed Testing Infrastructure**: 100% provider success rate verification

### **Development & Deployment Ready**
- ✅ **TypeScript Integration**: Full type safety across frontend and backend
- ✅ **Environment Configuration**: Local development and production setup
- ✅ **Connection Testing**: Automated Supabase and RSS feed validation
- ✅ **Documentation**: Comprehensive setup guides and troubleshooting

## 🔄 In Progress Features

### **GitHub Actions Automation** (Next: Task 8)
- ✅ **15-minute RSS Processing**: Automated feed processing every 15 minutes
- 🔄 **GitHub Pages Deployment**: Automatic deployment pipeline
- 🔄 **Error Notifications**: Failed processing alerts and monitoring

### **Enhanced Frontend Integration** (Next: Task 9)
- 🔄 **Live Supabase Data**: Replace mock service with real database queries
- 🔄 **Real-time Subscriptions**: Live status updates from database
- 🔄 **Historical Trend Views**: Status change visualization over time

## 📊 Current Status

| Component | Status | Details |
|-----------|--------|---------|
| **Frontend Map** | ✅ Complete | Interactive Leaflet map with 176 regions |
| **Database Schema** | ✅ Complete | Supabase with historical tracking |
| **RSS Processor** | ✅ Complete | All 4 providers tested and working |
| **UI/UX Design** | ✅ Complete | Dark/light themes, responsive design |
| **Provider Integration** | ✅ Complete | AWS, Azure, GCP, OCI feeds verified |
| **GitHub Actions** | 🔄 Next | Automation workflow setup |
| **Live Data Integration** | 🔄 Pending | Replace mock with Supabase queries |
| **Historical Analytics** | 🔄 Planned | Trend analysis and reporting |

## 🏗️ Architecture

### **Current Production Architecture**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub Pages  │    │  Supabase DB     │    │ RSS Feed APIs   │
│                 │    │                  │    │                 │
│ React Frontend  │◄──►│ PostgreSQL       │◄───│ AWS RSS Feed    │
│ Leaflet Maps    │    │ Real-time Subs   │    │ Azure RSS Feed  │
│ Status Display  │    │ Historical Data  │    │ GCP JSON API    │
│                 │    │ Region Summaries │    │ OCI JSON API    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                        ▲                       ▲
         │                        │                       │
         │              ┌──────────────────┐              │
         │              │ GitHub Actions   │              │
         └──────────────│                  │──────────────┘
                        │ RSS Processor    │
                        │ 15-min Schedule  │
                        │ Node.js Script   │
                        └──────────────────┘
```

### **Technology Stack**
- **Frontend**: React 19 + TypeScript + Vite + Leaflet + Tailwind CSS
- **Database**: Supabase PostgreSQL with real-time subscriptions
- **Backend**: Node.js RSS processor (GitHub Actions)
- **Deployment**: GitHub Pages with automated CI/CD
- **Monitoring**: Collapsible Supabase connection indicator

## Technology Stack

### Frontend Dependencies
- **React 19.1.1** + **TypeScript 5.8.3** + **Vite 7.1.7**
- **Leaflet 1.9.4** + **React-Leaflet 5.0.0** (Interactive mapping)
- **Tailwind CSS 4.1.13** (Responsive styling)
- **@supabase/supabase-js 2.58.0** (Database client)

### Backend Dependencies (RSS Processor)
- **Node.js 18+** (GitHub Actions runtime)
- **xml2js 0.6.2** (AWS/Azure RSS parsing)
- **node-fetch 3.3.2** (HTTP requests)
- **dotenv 17.2.3** (Environment variables)

### Infrastructure
- **Database**: Supabase PostgreSQL (Free tier: 500MB)
- **Deployment**: GitHub Pages (Free static hosting)
- **Automation**: GitHub Actions (Free: 2000 minutes/month public repos)
- **Monitoring**: Collapsible Supabase connection indicator

## Prerequisites

### Required Accounts (All Free Tier)
1. **GitHub Account** - Repository hosting and GitHub Actions automation
   - Free tier: Unlimited public repos, 2000 Actions minutes/month
2. **Supabase Account** - PostgreSQL database with real-time subscriptions
   - Sign up at [supabase.com](https://supabase.com)
   - Free tier: 500MB database, 50MB file storage, 50,000 monthly active users

### Development Environment
- **Node.js 18+** - Required for Vite build process and RSS processor
- **npm 9+** - Package manager (comes with Node.js)
- **Git** - Version control
- **Modern Browser** - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### System Requirements
- **RAM**: 4GB minimum (8GB recommended for development)
- **Storage**: 500MB for project files + dependencies
- **Network**: Stable internet for RSS feed processing

## Setup Instructions

### 1. Clone and Install Dependencies
```bash
git clone https://github.com/qb411/cloud-health-map-v2.git
cd cloud-health-map-v2
npm install
```

### 2. Supabase Database Setup
1. **Create Supabase Project**: 
   - Go to [supabase.com](https://supabase.com) and create project named `cloud-status-dashboard-v2`
   
2. **Install Database Schema**:
   - Go to SQL Editor in Supabase dashboard
   - Copy the entire contents of `database/schema.sql` from this repository
   - Paste and run the schema (creates tables, functions, indexes, RLS policies)

3. **Get Credentials**:
   - Go to Settings → API
   - Copy **Project URL**: `https://your-project-id.supabase.co`
   - Copy **anon public key** (long JWT token)
   - Copy **service_role key** (for GitHub Actions - keep secret!)

4. **Verify Setup**:
   - Check Tables: `cloud_status`, `region_status_current` should exist
   - Sample data should be visible in Table Editor
   - Connection test should show green status in app
   - Verify 176 regions are loaded across all providers

### 3. GitHub Repository Setup
1. **Fork or clone this repository**
2. **Make repository public** (required for free GitHub Actions)
3. **Add repository secrets**: Settings → Secrets and variables → Actions
   - `SUPABASE_URL`: `https://vyxbngmwbynxtzfuaaen.supabase.co`
   - `SUPABASE_ANON_KEY`: Your anon public key (for frontend)
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (for RSS processor)

**⚠️ Important**: Service role key ≠ anon key. Get service role key from Supabase Settings → API.

### 4. Enable GitHub Pages
1. **Repository Settings** → **Pages**
2. **Source**: Select "GitHub Actions"
3. **Save settings**
4. **Site URL**: `https://yourusername.github.io/cloud-health-map-v2`

**Live Example**: [https://qb411.github.io/cloud-health-map-v2/](https://qb411.github.io/cloud-health-map-v2/)

### 5. Configure RSS Processing (Optional)
**RSS processing runs every 15 minutes by default**. To disable:
1. Edit `.github/workflows/update-status.yml`
2. Comment out schedule section:
   ```yaml
   # schedule:
   #   - cron: '*/15 * * * *'
   ```

### 6. Local Development Setup
1. **Install Dependencies**:
```bash
npm install
```

2. **Create Environment File**:
```bash
cp .env.example .env
```

3. **Configure Environment Variables** (edit `.env`):
```env
VITE_SUPABASE_URL=https://vyxbngmwbynxtzfuaaen.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

4. **Start Development Server**:
```bash
npm run dev
```

5. **Verify Setup**:
   - ✅ Green Supabase logo in bottom-left corner
   - ✅ "Connected Successfully!" when expanded
   - ✅ Sample data from all 4 cloud providers visible
   - ✅ Map displays 176 regions with provider filtering

## Data Sources

### Region Data
- **AWS Regions**: [AWS Global Infrastructure Documentation](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html)
- **Azure Regions**: [Microsoft Azure Regions List](https://learn.microsoft.com/en-us/azure/reliability/regions-list)
- **GCP Regions**: Google Cloud Platform public documentation
- **OCI Regions**: Oracle Cloud Infrastructure public documentation

### Status Feeds (RSS Processor Verified ✅)
| Provider | Format | URL | Status | Incidents |
|----------|--------|-----|--------|-----------|
| **AWS** | RSS/XML | `https://status.aws.amazon.com/rss/all.rss` | ✅ Working | 0 current |
| **Azure** | RSS/XML | `https://status.azure.com/en-us/status/feed/` | ✅ Working | 0 current |
| **GCP** | JSON | `https://status.cloud.google.com/incidents.json` | ✅ Working | 59 historical |
| **OCI** | JSON | `https://ocistatus.oraclecloud.com/api/v2/status.json` | ✅ Working | Available |

**Feed Testing**: Run `node scripts/test-feeds.js` for live verification

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

### RSS Feed Processing (Manual Testing)
```bash
# Test RSS feeds connectivity
node scripts/test-feeds.js

# Test Supabase connection (requires service role key)
cd scripts
cp .env.example .env
# Edit .env with SUPABASE_SERVICE_ROLE_KEY
node scripts/test-supabase.js

# Run full RSS processing (writes to database)
node scripts/update-status.js
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
