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

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Mapping**: Leaflet + React-Leaflet
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **CORS Proxy**: AllOrigins for RSS feed access

## Data Sources

### Region Data
- **AWS Regions**: [AWS Global Infrastructure Documentation](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html)
- **Azure Regions**: [Microsoft Azure Regions List](https://learn.microsoft.com/en-us/azure/reliability/regions-list)
- **GCP Regions**: Google Cloud Platform public documentation
- **OCI Regions**: Oracle Cloud Infrastructure public documentation

### Status Feeds
- **AWS**: Service Health Dashboard RSS feed (`https://status.aws.amazon.com/rss/all.rss`)
- **Azure**: Azure Status RSS feed (`https://status.azure.com/en-us/status/feed/`)
- **GCP**: Google Cloud Status JSON API (`https://status.cloud.google.com/incidents.json`)
- **OCI**: Oracle Cloud Status JSON API (`https://ocistatus.oraclecloud.com/api/v2/incidents.json`)

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

## Usage

1. **Map Navigation**: Click and drag to pan, scroll to zoom
2. **Region Selection**: Click on region markers to view details
3. **Provider Filtering**: Use the provider filter panel to show specific cloud providers
4. **Theme Toggle**: Switch between dark and light themes
5. **Full Screen**: Use the full-screen button for TV/wall display mode

## Status Indicators

- 🟢 **Green**: All services operational
- 🟡 **Yellow**: Some services degraded or experiencing issues  
- 🔴 **Red**: Service outages or major incidents

## Architecture

The application uses a client-side architecture with:
- React components for UI and map interaction
- StatusService for fetching real-time data from cloud provider APIs
- Local caching with 15-minute refresh intervals
- CORS proxy integration for browser compatibility with RSS feeds

## License

This project is licensed under the MIT License.
