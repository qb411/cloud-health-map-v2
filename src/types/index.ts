// Core enums and types
export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'oci';

export type ServiceStatus = 'operational' | 'degraded' | 'outage';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

// Geographic and region types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AvailabilityZone {
  id: string;
  name: string;
  coordinates: Coordinates;
  status: ServiceStatus;
}

// Core data models
export interface CloudRegion {
  id: string;
  name: string;
  provider: CloudProvider;
  coordinates: Coordinates;
  boundaries: GeoJSON.Polygon;
  availabilityZones?: AvailabilityZone[];
  services: string[];
}

export interface IncidentUpdate {
  id: string;
  timestamp: Date;
  message: string;
  status: IncidentStatus;
}

export interface ServiceIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  affectedServices: string[];
  startTime: Date;
  endTime?: Date;
  status: IncidentStatus;
  updates: IncidentUpdate[];
}

export interface ServiceHealth {
  serviceName: string;
  provider: CloudProvider;
  region: string;
  status: ServiceStatus;
  incidents: ServiceIncident[];
  lastUpdated: Date;
}

// Re-export all types from other modules
export * from './api';
export * from './components';
export * from './config';
export * from './mock';
export * from './constants';