import { CloudRegion, ServiceHealth, ServiceIncident, ServiceStatus } from './index';

// Map component interfaces
export interface MapContainerProps {
  regions: CloudRegion[];
  selectedRegion?: CloudRegion | undefined;
  onRegionClick: (region: CloudRegion) => void;
  onMapClick: () => void;
}

export interface RegionOverlayProps {
  region: CloudRegion;
  status: ServiceStatus;
  onClick: (region: CloudRegion) => void;
}

// Regional view interfaces
export interface RegionalViewProps {
  region: CloudRegion;
  services: ServiceHealth[];
  onServiceClick: (service: ServiceHealth) => void;
  onClose: () => void;
}

// Incident panel interfaces
export interface IncidentPanelProps {
  incident: ServiceIncident;
  isOpen: boolean;
  onClose: () => void;
}

// Service status interfaces
export interface StatusServiceInterface {
  fetchAllProviderStatus(): Promise<ProviderStatus[]>;
  fetchAWSStatus(): Promise<AWSStatus>;
  fetchAzureStatus(): Promise<AzureStatus>;
  fetchGCPStatus(): Promise<GCPStatus>;
  fetchOCIStatus(): Promise<OCIStatus>;
}

// Error handling interfaces
export interface ErrorRecoveryConfig {
  maxRetries: number;
  retryDelay: number;
  fallbackToCache: boolean;
  userNotification: boolean;
}

export interface ApiError {
  provider: string;
  message: string;
  timestamp: Date;
  retryCount: number;
}

// State management interfaces
export interface AppState {
  regions: CloudRegion[];
  selectedRegion?: CloudRegion;
  selectedIncident?: ServiceIncident;
  isLoading: boolean;
  lastUpdated?: Date;
  errors: ApiError[];
  mapCenter: [number, number];
  mapZoom: number;
}

export interface MapState {
  center: [number, number];
  zoom: number;
  selectedRegionId?: string | undefined;
}

// Import the API types we need
import { ProviderStatus, AWSStatus, AzureStatus, GCPStatus, OCIStatus } from './api';