import { ServiceStatus, CloudRegion, CloudProvider } from '../types';

interface ProviderStatus {
  provider: CloudProvider;
  status: ServiceStatus;
  incidents: Array<{
    title: string;
    description: string;
    affectedServices: string[];
    startTime: string;
    status: string;
  }>;
}

export class StatusService {
  private statusCache: Map<CloudProvider, ProviderStatus> = new Map();
  private lastUpdate: Date = new Date(0);
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  // Public RSS/API endpoints
  private readonly endpoints = {
    aws: 'https://status.aws.amazon.com/rss/all.rss',
    azure: 'https://status.azure.com/en-us/status/feed/',
    gcp: 'https://status.cloud.google.com/incidents.json',
    oci: 'https://ocistatus.oraclecloud.com/api/v2/incidents.json'
  };

  async getRegionStatus(region: CloudRegion): Promise<ServiceStatus> {
    await this.refreshStatusIfNeeded();
    
    const providerStatus = this.statusCache.get(region.provider);
    if (!providerStatus) {
      return 'operational';
    }

    // Check if region has specific incidents
    const hasIncidents = providerStatus.incidents.some(incident => 
      incident.affectedServices.some(service => 
        region.services.includes(service) || 
        incident.title.toLowerCase().includes(region.id.toLowerCase())
      )
    );

    return hasIncidents ? providerStatus.status : 'operational';
  }

  async getAllStatuses(regions: CloudRegion[]): Promise<Map<string, ServiceStatus>> {
    await this.refreshStatusIfNeeded();
    
    const statuses = new Map<string, ServiceStatus>();
    
    for (const region of regions) {
      const status = await this.getRegionStatus(region);
      statuses.set(region.id, status);
    }
    
    return statuses;
  }

  private async refreshStatusIfNeeded(): Promise<void> {
    const now = new Date();
    if (now.getTime() - this.lastUpdate.getTime() < this.CACHE_DURATION) {
      return;
    }

    try {
      await Promise.all([
        this.fetchAWSStatus(),
        this.fetchAzureStatus(),
        this.fetchGCPStatus(),
        this.fetchOCIStatus()
      ]);
      
      this.lastUpdate = now;
      console.log('Status data refreshed at', now.toISOString());
    } catch (error) {
      console.error('Failed to refresh status data:', error);
    }
  }

  private async fetchAWSStatus(): Promise<void> {
    try {
      // Use CORS proxy for RSS feed
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(this.endpoints.aws)}`);
      const data = await response.json();
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
      
      const incidents = Array.from(items).slice(0, 10).map(item => ({
        title: item.querySelector('title')?.textContent || '',
        description: item.querySelector('description')?.textContent || '',
        affectedServices: this.extractAWSServices(item.querySelector('title')?.textContent || ''),
        startTime: item.querySelector('pubDate')?.textContent || '',
        status: this.determineStatusFromTitle(item.querySelector('title')?.textContent || '')
      }));

      const overallStatus = this.determineOverallStatus(incidents);
      
      this.statusCache.set('aws', {
        provider: 'aws',
        status: overallStatus,
        incidents
      });
    } catch (error) {
      console.error('AWS status fetch failed:', error);
      this.setFallbackStatus('aws');
    }
  }

  private async fetchAzureStatus(): Promise<void> {
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(this.endpoints.azure)}`);
      const data = await response.json();
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
      
      const incidents = Array.from(items).slice(0, 10).map(item => ({
        title: item.querySelector('title')?.textContent || '',
        description: item.querySelector('description')?.textContent || '',
        affectedServices: this.extractAzureServices(item.querySelector('title')?.textContent || ''),
        startTime: item.querySelector('pubDate')?.textContent || '',
        status: this.determineStatusFromTitle(item.querySelector('title')?.textContent || '')
      }));

      const overallStatus = this.determineOverallStatus(incidents);
      
      this.statusCache.set('azure', {
        provider: 'azure',
        status: overallStatus,
        incidents
      });
    } catch (error) {
      console.error('Azure status fetch failed:', error);
      this.setFallbackStatus('azure');
    }
  }

  private async fetchGCPStatus(): Promise<void> {
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(this.endpoints.gcp)}`);
      const data = await response.json();
      const incidents = JSON.parse(data.contents);
      
      const recentIncidents = incidents.slice(0, 10).map((incident: any) => ({
        title: incident.external_desc || incident.most_recent_update?.text || '',
        description: incident.most_recent_update?.text || '',
        affectedServices: incident.service_name ? [incident.service_name] : [],
        startTime: incident.begin || '',
        status: this.mapGCPStatus(incident.most_recent_update?.status)
      }));

      const overallStatus = this.determineOverallStatus(recentIncidents);
      
      this.statusCache.set('gcp', {
        provider: 'gcp',
        status: overallStatus,
        incidents: recentIncidents
      });
    } catch (error) {
      console.error('GCP status fetch failed:', error);
      this.setFallbackStatus('gcp');
    }
  }

  private async fetchOCIStatus(): Promise<void> {
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(this.endpoints.oci)}`);
      const data = await response.json();
      const result = JSON.parse(data.contents);
      
      const incidents = result.incidents?.slice(0, 10).map((incident: any) => ({
        title: incident.name || '',
        description: incident.incident_updates?.[0]?.body || '',
        affectedServices: incident.components?.map((c: any) => c.name) || [],
        startTime: incident.created_at || '',
        status: this.mapOCIStatus(incident.status)
      })) || [];

      const overallStatus = this.determineOverallStatus(incidents);
      
      this.statusCache.set('oci', {
        provider: 'oci',
        status: overallStatus,
        incidents
      });
    } catch (error) {
      console.error('OCI status fetch failed:', error);
      this.setFallbackStatus('oci');
    }
  }

  private extractAWSServices(title: string): string[] {
    const services = ['EC2', 'S3', 'RDS', 'Lambda', 'CloudFront', 'ELB', 'VPC'];
    return services.filter(service => title.toLowerCase().includes(service.toLowerCase()));
  }

  private extractAzureServices(title: string): string[] {
    const services = ['Virtual Machines', 'Storage', 'SQL Database', 'Functions', 'App Service'];
    return services.filter(service => title.toLowerCase().includes(service.toLowerCase()));
  }

  private determineStatusFromTitle(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('outage') || lower.includes('down') || lower.includes('unavailable')) {
      return 'outage';
    }
    if (lower.includes('degraded') || lower.includes('issue') || lower.includes('problem')) {
      return 'degraded';
    }
    return 'operational';
  }

  private mapGCPStatus(status: string): string {
    switch (status?.toLowerCase()) {
      case 'service_disruption':
      case 'service_outage':
        return 'outage';
      case 'service_information':
        return 'degraded';
      default:
        return 'operational';
    }
  }

  private mapOCIStatus(status: string): string {
    switch (status?.toLowerCase()) {
      case 'investigating':
      case 'identified':
        return 'outage';
      case 'monitoring':
        return 'degraded';
      default:
        return 'operational';
    }
  }

  private determineOverallStatus(incidents: any[]): ServiceStatus {
    if (incidents.some(i => i.status === 'outage')) return 'outage';
    if (incidents.some(i => i.status === 'degraded')) return 'degraded';
    return 'operational';
  }

  private setFallbackStatus(provider: CloudProvider): void {
    this.statusCache.set(provider, {
      provider,
      status: 'operational',
      incidents: []
    });
  }
}

export const statusService = new StatusService();
