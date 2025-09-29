import { CloudProvider, ServiceStatus, IncidentSeverity, IncidentStatus } from './index';

// Generic provider status interface
export interface ProviderStatus {
  provider: CloudProvider;
  regions: RegionStatus[];
  lastUpdated: Date;
  isHealthy: boolean;
}

export interface RegionStatus {
  regionId: string;
  regionName: string;
  status: ServiceStatus;
  services: ServiceStatusItem[];
}

export interface ServiceStatusItem {
  serviceName: string;
  status: ServiceStatus;
  incidents: IncidentItem[];
}

export interface IncidentItem {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  startTime: Date;
  endTime?: Date;
  affectedServices: string[];
}

// AWS specific types
export interface AWSStatus {
  rss: {
    channel: {
      item: AWSStatusItem[];
    };
  };
}

export interface AWSStatusItem {
  title: string;
  description: string;
  pubDate: string;
  guid: string;
  link: string;
}

// Azure specific types
export interface AzureStatus {
  rss: {
    channel: {
      item: AzureStatusItem[];
    };
  };
}

export interface AzureStatusItem {
  title: string;
  description: string;
  pubDate: string;
  guid: string;
  link: string;
}

// GCP specific types
export interface GCPStatus {
  incidents: GCPIncident[];
}

export interface GCPIncident {
  id: string;
  number: string;
  title: string;
  status: string;
  severity: string;
  created: string;
  modified: string;
  resolved?: string;
  affected_products: GCPAffectedProduct[];
  updates: GCPIncidentUpdate[];
}

export interface GCPAffectedProduct {
  title: string;
  id: string;
}

export interface GCPIncidentUpdate {
  created: string;
  text: string;
  status: string;
}

// OCI specific types
export interface OCIStatus {
  incidents: OCIIncident[];
}

export interface OCIIncident {
  id: string;
  name: string;
  status: string;
  impact: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  incident_updates: OCIIncidentUpdate[];
  components: OCIComponent[];
}

export interface OCIIncidentUpdate {
  id: string;
  status: string;
  body: string;
  created_at: string;
}

export interface OCIComponent {
  id: string;
  name: string;
  status: string;
}