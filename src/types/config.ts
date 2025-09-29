import { CloudProvider } from './index';

// Configuration interfaces
export interface DashboardConfig {
  refreshInterval: number; // in milliseconds (15 minutes = 900000)
  enableAutoRefresh: boolean;
  enableMockData: boolean;
  defaultMapCenter: [number, number];
  defaultMapZoom: number;
  enableFullScreen: boolean;
  enableKeyboardNavigation: boolean;
}

export interface ProviderConfig {
  provider: CloudProvider;
  enabled: boolean;
  apiUrl: string;
  refreshInterval?: number;
  timeout: number;
  retryConfig: RetryConfig;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// LocalStorage interfaces
export interface StoredMapState {
  center: [number, number];
  zoom: number;
  selectedRegionId?: string;
  timestamp: number;
}

export interface StoredProviderData {
  provider: CloudProvider;
  data: any;
  timestamp: number;
  expiresAt: number;
}

export interface LocalStorageKeys {
  MAP_STATE: 'cloud-dashboard-map-state';
  PROVIDER_DATA: 'cloud-dashboard-provider-data';
  USER_PREFERENCES: 'cloud-dashboard-preferences';
  LAST_UPDATE: 'cloud-dashboard-last-update';
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  enableNotifications: boolean;
  preferredProviders: CloudProvider[];
  displayDensity: 'compact' | 'comfortable' | 'spacious';
  enableAnimations: boolean;
}

// API endpoint configuration
export interface ApiEndpoints {
  aws: string;
  azure: string;
  gcp: string;
  oci: string;
}

// Default configuration values
export const DEFAULT_CONFIG: DashboardConfig = {
  refreshInterval: 15 * 60 * 1000, // 15 minutes
  enableAutoRefresh: true,
  enableMockData: false,
  defaultMapCenter: [30, 10], // Better centered on main continents (Europe/Africa/Asia)
  defaultMapZoom: 3, // Increased from 2 to 3 for better initial display on high-res screens
  enableFullScreen: true,
  enableKeyboardNavigation: true,
};

export const API_ENDPOINTS: ApiEndpoints = {
  aws: 'https://status.aws.amazon.com/rss/all.rss',
  azure: 'https://status.azure.com/en-us/status/feed/',
  gcp: 'https://status.cloud.google.com/incidents.json',
  oci: 'https://ocistatus.oraclecloud.com/api/v2/incidents.json',
};

export const LOCAL_STORAGE_KEYS: LocalStorageKeys = {
  MAP_STATE: 'cloud-dashboard-map-state',
  PROVIDER_DATA: 'cloud-dashboard-provider-data',
  USER_PREFERENCES: 'cloud-dashboard-preferences',
  LAST_UPDATE: 'cloud-dashboard-last-update',
};